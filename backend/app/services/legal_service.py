import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.app.core.permissions import Role
from backend.app.repositories.audit_log_repository import AuditLogRepository
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.charge_sheet_repository import ChargeSheetRepository
from backend.app.repositories.court_filing_repository import CourtFilingRepository
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.legal import (
    ChargeSheetCreate,
    ChargeSheetResponse,
    ChargeSheetStatusUpdate,
    CourtFilingCreate,
    CourtFilingResponse,
    CourtFilingStatusUpdate
)
from backend.app.services.base import BaseService
from backend.app.utils.errors import (
    AppException,
    ForbiddenException,
    NotFoundException,
    ValidationException
)


class LegalService(BaseService):
    """
    Core Domain Service for Legal & Judicial Prosecution Workflows:
    - Charge Sheet drafting, prosecutor scrutiny, submission & judicial acceptance
    - Formal Court Filings & judicial docket scheduling
    - Cross-case isolation & role-based validation
    - Finite state machine transition enforcement
    - Automated audit trail recording
    """
    CHARGE_SHEET_STATUSES = {"Draft", "Under Review", "Submitted", "Accepted", "Returned"}
    CHARGE_SHEET_TRANSITIONS = {
        "Draft": {"Under Review", "Submitted"},
        "Under Review": {"Submitted", "Returned", "Draft"},
        "Submitted": {"Accepted", "Returned"},
        "Returned": {"Draft", "Under Review"},
        "Accepted": set()  # Terminal judicial state
    }

    COURT_FILING_STATUSES = {"Draft", "Under Review", "Filed", "Disposed"}
    COURT_FILING_TRANSITIONS = {
        "Draft": {"Under Review", "Filed"},
        "Under Review": {"Filed", "Draft"},
        "Filed": {"Disposed", "Under Review"},
        "Disposed": set()  # Terminal state
    }

    def __init__(
        self,
        charge_sheet_repo: Optional[ChargeSheetRepository] = None,
        court_filing_repo: Optional[CourtFilingRepository] = None,
        case_repo: Optional[CaseRepository] = None,
        audit_repo: Optional[AuditLogRepository] = None
    ):
        self.charge_sheet_repo = charge_sheet_repo or ChargeSheetRepository()
        self.court_filing_repo = court_filing_repo or CourtFilingRepository()
        self.case_repo = case_repo or CaseRepository()
        self.audit_repo = audit_repo or AuditLogRepository()

    # =========================================================================
    # CHARGE SHEET WORKFLOW
    # =========================================================================

    def create_charge_sheet(
        self,
        payload: ChargeSheetCreate,
        current_user: AuthenticatedUser
    ) -> ChargeSheetResponse:
        """
        Drafts a new statutory charge sheet under Section 173 CrPC / Sec 193 BNSS:
        1. Role check: only Police Inspector and Admin may author initial charge sheets.
        2. Validates parent Case existence and user jurisdiction.
        3. Inserts charge sheet and associated accused persons.
        4. Logs audit trail event.
        """
        if current_user.role not in (Role.INSPECTOR, Role.ADMIN):
            raise ForbiddenException("Only Police Inspectors and Administrators may draft statutory charge sheets.")

        case = self.case_repo.get_case(payload.case_id)
        if not case:
            raise NotFoundException(f"Investigation Case '{payload.case_id}' does not exist.")
        case_uuid = str(case["id"])

        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this case docket.")

        year_str = datetime.now(timezone.utc).strftime("%Y")
        cs_number = payload.charge_sheet_number or f"CS-{year_str}-{random.randint(100, 999)}"

        insert_payload = {
            "charge_sheet_number": cs_number,
            "case_id": case_uuid,
            "investigating_officer_id": current_user.id,
            "status": "Draft",
            "investigation_summary": payload.investigation_summary,
            "applicable_charges": payload.applicable_charges,
            "court_name": payload.court_name or "Court of Chief Judicial Magistrate, Bhopal",
            "court_docket_no": payload.court_docket_no
        }

        created = self.charge_sheet_repo.create_charge_sheet(insert_payload)
        cs_id = str(created["id"])

        # Insert accused persons if provided
        accused_data = []
        if payload.accused:
            accused_dicts = [a.model_dump() for a in payload.accused]
            accused_data = self.charge_sheet_repo.add_accused(cs_id, accused_dicts)

        try:
            self.audit_repo.append_log(
                action="CHARGE_SHEET_CREATED",
                module="ChargeSheets",
                entity_type="ChargeSheet",
                entity_id=cs_id,
                case_id=case_uuid,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Statutory Charge Sheet {cs_number} prepared under Section 173 CrPC for Case {case.get('case_number')}.",
                event_payload={
                    "charge_sheet_number": cs_number,
                    "applicable_charges": payload.applicable_charges,
                    "accused_count": len(payload.accused)
                }
            )
        except Exception as audit_err:
            print(f"Charge sheet creation audit notice: {audit_err}")

        return self._to_charge_sheet_response(created, accused_data)

    def update_charge_sheet_status(
        self,
        cs_identifier: str,
        update_data: ChargeSheetStatusUpdate,
        current_user: AuthenticatedUser
    ) -> ChargeSheetResponse:
        """
        Updates charge sheet status (e.g. Scrutiny, Submission, Acceptance, Return):
        - Legal Officers and Admins scrutinize and return/accept charge sheets.
        - Enforces state transition validation.
        - Records audit trail.
        """
        # Role check: Legal Officers, Inspectors, and Admins participate in scrutiny
        if current_user.role not in (Role.LEGAL_OFFICER, Role.INSPECTOR, Role.ADMIN):
            raise ForbiddenException("Access denied. Only Legal Officers, Inspectors, and Admins can update charge sheets.")

        cs = self.charge_sheet_repo.get_charge_sheet(cs_identifier)
        if not cs:
            raise NotFoundException(f"Charge Sheet '{cs_identifier}' was not found.")

        current_status = cs.get("status", "Draft")
        target_status = update_data.status.strip()

        if target_status not in self.CHARGE_SHEET_STATUSES:
            raise ValidationException(f"Invalid status '{target_status}'. Must be one of {sorted(self.CHARGE_SHEET_STATUSES)}.")

        # Check terminal state
        if current_status == "Accepted":
            raise AppException(
                status_code=400,
                code="TERMINAL_STATE_LOCKED",
                message="Charge Sheet has been accepted by the Court. Accepted judicial records are locked against further modification."
            )

        # Check state transition
        allowed = self.CHARGE_SHEET_TRANSITIONS.get(current_status, set())
        if target_status not in allowed and target_status != current_status:
            raise ValidationException(
                f"Illegal state transition from '{current_status}' to '{target_status}'. Permitted transitions: {sorted(allowed)}."
            )

        filed_date = datetime.now(timezone.utc).isoformat() if target_status == "Submitted" else None
        updated = self.charge_sheet_repo.update_charge_sheet_status(
            cs_id=str(cs["id"]),
            new_status=target_status,
            scrutiny_notes=update_data.scrutiny_notes,
            filed_date=filed_date
        )

        accused_data = self.charge_sheet_repo.list_accused(str(cs["id"]))

        try:
            self.audit_repo.append_log(
                action="CHARGE_SHEET_STATUS_UPDATED",
                module="ChargeSheets",
                entity_type="ChargeSheet",
                entity_id=str(cs["id"]),
                case_id=str(cs["case_id"]),
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Charge Sheet {cs.get('charge_sheet_number')} transition: {current_status} -> {target_status}.",
                event_payload={
                    "previous_status": current_status,
                    "new_status": target_status,
                    "scrutiny_notes": update_data.scrutiny_notes
                }
            )
        except Exception as audit_err:
            print(f"Charge sheet update audit notice: {audit_err}")

        return self._to_charge_sheet_response(updated or cs, accused_data)

    def get_charge_sheet(self, cs_identifier: str, current_user: AuthenticatedUser) -> ChargeSheetResponse:
        cs = self.charge_sheet_repo.get_charge_sheet(cs_identifier)
        if not cs:
            raise NotFoundException(f"Charge Sheet '{cs_identifier}' was not found.")

        case_uuid = str(cs["case_id"])
        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this charge sheet's case.")

        accused_data = self.charge_sheet_repo.list_accused(str(cs["id"]))
        return self._to_charge_sheet_response(cs, accused_data)

    def list_charge_sheets(
        self,
        current_user: AuthenticatedUser,
        case_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[ChargeSheetResponse]:
        if case_id:
            case = self.case_repo.get_case(case_id)
            if case and not self.case_repo.user_has_case_access(str(case["id"]), current_user.id, current_user.role):
                raise ForbiddenException("Access denied to this case's charge sheets.")
            case_id = str(case["id"]) if case else case_id

        raw_list = self.charge_sheet_repo.list_charge_sheets(case_id=case_id, status=status, limit=limit)
        return [self._to_charge_sheet_response(cs, self.charge_sheet_repo.list_accused(str(cs["id"]))) for cs in raw_list]

    # =========================================================================
    # COURT FILINGS WORKFLOW
    # =========================================================================

    def create_court_filing(
        self,
        payload: CourtFilingCreate,
        current_user: AuthenticatedUser
    ) -> CourtFilingResponse:
        """
        Creates and registers a formal judicial court filing:
        1. Role check: Legal Officers, Inspectors, and Admins can submit filings.
        2. Validates parent Case existence and user jurisdiction.
        3. Inserts filing and logs audit event.
        """
        if current_user.role not in (Role.LEGAL_OFFICER, Role.INSPECTOR, Role.ADMIN):
            raise ForbiddenException("Only Legal Officers, Inspectors, and Administrators may register court filings.")

        case = self.case_repo.get_case(payload.case_id)
        if not case:
            raise NotFoundException(f"Investigation Case '{payload.case_id}' does not exist.")
        case_uuid = str(case["id"])

        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this case docket.")

        year_str = datetime.now(timezone.utc).strftime("%Y")
        filing_number = payload.filing_number or f"CF-{year_str}-{random.randint(100, 999)}"

        insert_payload = {
            "filing_number": filing_number,
            "case_id": case_uuid,
            "filing_type": payload.filing_type,
            "title": payload.title,
            "court_name": payload.court_name,
            "judge_name": payload.judge_name,
            "docket_number": payload.docket_number,
            "status": "Filed",
            "notes": payload.notes,
            "next_hearing_date": payload.next_hearing_date,
            "next_hearing_time": payload.next_hearing_time,
            "created_by": current_user.id
        }

        created = self.court_filing_repo.create_filing(insert_payload)

        try:
            self.audit_repo.append_log(
                action="COURT_FILING_CREATED",
                module="CourtFilings",
                entity_type="CourtFiling",
                entity_id=str(created.get("id")),
                case_id=case_uuid,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Judicial Filing {filing_number} ('{payload.title}') submitted to {payload.court_name}.",
                event_payload={
                    "filing_number": filing_number,
                    "filing_type": payload.filing_type,
                    "court_name": payload.court_name
                }
            )
        except Exception as audit_err:
            print(f"Court filing creation audit notice: {audit_err}")

        return self._to_court_filing_response(created)

    def update_court_filing_status(
        self,
        filing_identifier: str,
        update_data: CourtFilingStatusUpdate,
        current_user: AuthenticatedUser
    ) -> CourtFilingResponse:
        """
        Updates court filing status and hearing schedule:
        - Legal Officers and Admins enforce judicial order updates.
        - Enforces state transition validation.
        - Records audit trail.
        """
        if current_user.role not in (Role.LEGAL_OFFICER, Role.ADMIN):
            raise ForbiddenException("Only Legal Officers and Administrators may update court filing hearing outcomes.")

        cf = self.court_filing_repo.get_filing(filing_identifier)
        if not cf:
            raise NotFoundException(f"Court Filing '{filing_identifier}' was not found.")

        current_status = cf.get("status", "Filed")
        target_status = update_data.status.strip()

        if target_status not in self.COURT_FILING_STATUSES:
            raise ValidationException(f"Invalid status '{target_status}'. Must be one of {sorted(self.COURT_FILING_STATUSES)}.")

        # Check terminal state
        if current_status == "Disposed":
            raise AppException(
                status_code=400,
                code="TERMINAL_STATE_LOCKED",
                message="Court Filing is in 'Disposed' state. Disposed judicial proceedings cannot be modified."
            )

        allowed = self.COURT_FILING_TRANSITIONS.get(current_status, set())
        if target_status not in allowed and target_status != current_status:
            raise ValidationException(
                f"Illegal state transition from '{current_status}' to '{target_status}'. Permitted transitions: {sorted(allowed)}."
            )

        updated = self.court_filing_repo.update_filing_status(
            filing_id=str(cf["id"]),
            new_status=target_status,
            notes=update_data.notes,
            next_hearing_date=update_data.next_hearing_date,
            next_hearing_time=update_data.next_hearing_time
        )

        try:
            self.audit_repo.append_log(
                action="COURT_FILING_STATUS_UPDATED",
                module="CourtFilings",
                entity_type="CourtFiling",
                entity_id=str(cf["id"]),
                case_id=str(cf["case_id"]),
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Court Filing {cf.get('filing_number')} transition: {current_status} -> {target_status}.",
                event_payload={
                    "previous_status": current_status,
                    "new_status": target_status,
                    "next_hearing_date": update_data.next_hearing_date
                }
            )
        except Exception as audit_err:
            print(f"Court filing update audit notice: {audit_err}")

        return self._to_court_filing_response(updated or cf)

    def get_court_filing(self, filing_identifier: str, current_user: AuthenticatedUser) -> CourtFilingResponse:
        cf = self.court_filing_repo.get_filing(filing_identifier)
        if not cf:
            raise NotFoundException(f"Court Filing '{filing_identifier}' was not found.")

        case_uuid = str(cf["case_id"])
        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this court filing's case.")

        return self._to_court_filing_response(cf)

    def list_court_filings(
        self,
        current_user: AuthenticatedUser,
        case_id: Optional[str] = None,
        filing_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[CourtFilingResponse]:
        if case_id:
            case = self.case_repo.get_case(case_id)
            if case and not self.case_repo.user_has_case_access(str(case["id"]), current_user.id, current_user.role):
                raise ForbiddenException("Access denied to this case's court filings.")
            case_id = str(case["id"]) if case else case_id

        raw_list = self.court_filing_repo.list_filings(case_id=case_id, filing_type=filing_type, status=status, limit=limit)
        return [self._to_court_filing_response(cf) for cf in raw_list]

    # =========================================================================
    # RESPONSE CONVERTERS
    # =========================================================================

    def _to_charge_sheet_response(self, record: Dict[str, Any], accused: List[Dict[str, Any]]) -> ChargeSheetResponse:
        return ChargeSheetResponse(
            id=str(record["id"]),
            charge_sheet_number=record["charge_sheet_number"],
            case_id=str(record["case_id"]),
            investigating_officer_id=str(record["investigating_officer_id"]),
            assigned_prosecutor_id=str(record["assigned_prosecutor_id"]) if record.get("assigned_prosecutor_id") else None,
            status=record.get("status", "Draft"),
            investigation_summary=record.get("investigation_summary"),
            applicable_charges=record.get("applicable_charges", []),
            court_name=record.get("court_name", "Court of CJM, Bhopal"),
            court_docket_no=record.get("court_docket_no"),
            scrutiny_notes=record.get("scrutiny_notes"),
            filed_date=record.get("filed_date"),
            accused=accused,
            created_at=record.get("created_at") or datetime.now(timezone.utc)
        )

    def _to_court_filing_response(self, record: Dict[str, Any]) -> CourtFilingResponse:
        return CourtFilingResponse(
            id=str(record["id"]),
            filing_number=record["filing_number"],
            case_id=str(record["case_id"]),
            filing_type=record.get("filing_type", "Charge Sheet"),
            title=record["title"],
            court_name=record["court_name"],
            judge_name=record.get("judge_name"),
            docket_number=record.get("docket_number"),
            status=record.get("status", "Filed"),
            filing_date=record.get("filing_date") or datetime.now(timezone.utc),
            next_hearing_date=record.get("next_hearing_date"),
            next_hearing_time=record.get("next_hearing_time"),
            notes=record.get("notes"),
            created_by=str(record["created_by"]) if record.get("created_by") else None,
            created_at=record.get("created_at") or datetime.now(timezone.utc)
        )


legal_service = LegalService()
