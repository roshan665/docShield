import pytest
from unittest.mock import MagicMock
from fastapi import status
from fastapi.testclient import TestClient

from backend.app.core.permissions import Role
from backend.app.main import app
from backend.app.schemas.auth import AuthenticatedUser, UserProfile
from backend.app.schemas.custody import CustodyTransferRequest
from backend.app.schemas.forensic import ForensicReportCreate, ForensicReportStatusUpdate
from backend.app.schemas.legal import ChargeSheetCreate, ChargeSheetStatusUpdate, CourtFilingCreate, CourtFilingStatusUpdate
from backend.app.services.custody_service import CustodyService
from backend.app.services.audit_service import AuditService
from backend.app.services.forensic_service import ForensicService
from backend.app.services.legal_service import LegalService
from backend.app.utils.errors import ForbiddenException, ValidationException, AppException, NotFoundException


# =============================================================================
# ISOLATED TEST HARNESS WITH IN-MEMORY REPOSITORIES
# =============================================================================

@pytest.fixture
def workflow_harness():
    cases_db = {
        "case-101": {
            "id": "case-101",
            "case_number": "#2024-1768",
            "title": "State v. Vikram Patel",
            "investigating_officer_id": "usr_insp_123"
        },
        "case-restricted": {
            "id": "case-restricted",
            "case_number": "#2024-9999",
            "title": "Restricted High Priority Case",
            "investigating_officer_id": "usr_other_io"
        }
    }

    evidence_db = {
        "ev-1": {
            "id": "ev-1",
            "evidence_tag": "EV-2024-001",
            "case_id": "case-101",
            "current_location": "Station Malkhana Vault Room #2",
            "current_custodian_id": "usr_insp_123",
            "sha256_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
            "current_version": 1,
            "storage_path": "cases/case-101/evidence/ev-1/v1/knife.jpg"
        },
        "ev-restricted": {
            "id": "ev-restricted",
            "evidence_tag": "EV-2024-999",
            "case_id": "case-restricted",
            "current_location": "Central Forensic Vault",
            "current_custodian_id": "usr_other_io",
            "sha256_hash": "b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
            "current_version": 1,
            "storage_path": "cases/case-restricted/evidence/ev-restricted/v1/file.dat"
        }
    }

    custody_db = [
        {
            "id": "coc-1",
            "evidence_id": "ev-1",
            "step_number": 1,
            "from_location": "Crime Scene",
            "to_location": "Station Malkhana Vault Room #2",
            "transfer_reason": "Initial Seizure",
            "seal_intact": True,
            "previous_block_hash": "GENESIS-BLOCK",
            "block_hash": "BLK-SHA256-GENESIS-001",
            "from_custodian_id": None,
            "to_custodian_id": "usr_insp_123",
            "created_by": "usr_insp_123",
            "transfer_timestamp": "2026-09-24T06:00:00Z",
            "created_at": "2026-09-24T06:00:00Z"
        }
    ]

    audit_db = []
    forensic_db = {}
    charge_sheets_db = {}
    accused_db = []
    court_filings_db = {}

    # Case Repo Mock
    case_repo = MagicMock()
    case_repo.get_case.side_effect = lambda cid: cases_db.get(cid) or next((c for c in cases_db.values() if c["case_number"] == cid or c["case_number"] == f"#{cid}"), None)
    case_repo.get_by_id.side_effect = lambda cid: cases_db.get(cid)
    def has_access(cid, uid, role):
        if role in (Role.ADMIN, Role.LEGAL_OFFICER, Role.FORENSIC_OFFICER):
            return True
        c = cases_db.get(cid)
        return role == Role.INSPECTOR and (c and c.get("investigating_officer_id") == uid or cid != "case-restricted")
    case_repo.user_has_case_access.side_effect = has_access

    # Evidence Repo Mock
    ev_repo = MagicMock()
    ev_repo.get_by_id.side_effect = lambda eid: evidence_db.get(eid)
    ev_repo.get_by_tag.side_effect = lambda tag: next((e for e in evidence_db.values() if e["evidence_tag"] == tag), None)
    def update_ver_meta(evidence_id, current_version, storage_path, sha256_hash, file_size_bytes=0, mime_type="application/octet-stream"):
        if evidence_id in evidence_db:
            evidence_db[evidence_id]["current_version"] = current_version
            evidence_db[evidence_id]["storage_path"] = storage_path
            evidence_db[evidence_id]["sha256_hash"] = sha256_hash
            return evidence_db[evidence_id]
        return None
    ev_repo.update_current_version_metadata.side_effect = update_ver_meta

    # Custody Repo Mock
    custody_repo = MagicMock()
    def append_transfer(**kwargs):
        step = len([c for c in custody_db if c["evidence_id"] == kwargs["evidence_id"]]) + 1
        prev_hash = custody_db[-1]["block_hash"] if custody_db else "GENESIS-BLOCK"
        block_hash = f"BLK-SHA256-{step}-{prev_hash[:8]}"
        record = {
            "id": f"coc-{len(custody_db) + 1}",
            "step_number": step,
            "previous_block_hash": prev_hash,
            "block_hash": block_hash,
            **kwargs
        }
        custody_db.append(record)
        return record
    custody_repo.append_transfer.side_effect = append_transfer
    custody_repo.list_transfers.side_effect = lambda eid: [c for c in custody_db if c["evidence_id"] == eid]

    # Audit Repo Mock
    audit_repo = MagicMock()
    def append_log(**kwargs):
        log_entry = {
            "id": f"log-{len(audit_db) + 1}",
            "timestamp": "2026-09-24T10:00:00Z",
            "record_hash": f"SEAL-SHA256-{len(audit_db) + 1}",
            **kwargs
        }
        audit_db.append(log_entry)
        return log_entry
    audit_repo.append_log.side_effect = append_log
    audit_repo.list_logs.side_effect = lambda **kwargs: list(reversed(audit_db))

    # Forensic Repo Mock
    forensic_repo = MagicMock()
    def create_fr(payload):
        fid = f"fr-{len(forensic_db) + 1}"
        record = {"id": fid, "created_at": "2026-09-24T10:00:00Z", **payload}
        forensic_db[fid] = record
        return record
    def update_fr_status(report_id, new_status, finalized_at=None, **kwargs):
        if report_id in forensic_db:
            forensic_db[report_id]["status"] = new_status
            if finalized_at:
                forensic_db[report_id]["finalized_at"] = finalized_at
            return forensic_db[report_id]
        return None
    forensic_repo.create_report.side_effect = create_fr
    forensic_repo.get_report.side_effect = lambda report_id, **kw: forensic_db.get(report_id)
    forensic_repo.update_report_status.side_effect = update_fr_status
    forensic_repo.list_reports.side_effect = lambda **kw: list(forensic_db.values())

    # Charge Sheet Repo Mock
    cs_repo = MagicMock()
    def create_cs(payload):
        cs_id = f"cs-{len(charge_sheets_db) + 1}"
        record = {"id": cs_id, "created_at": "2026-09-24T10:00:00Z", **payload}
        charge_sheets_db[cs_id] = record
        return record
    def update_cs_status(cs_id, new_status, scrutiny_notes=None, filed_date=None, **kwargs):
        if cs_id in charge_sheets_db:
            charge_sheets_db[cs_id]["status"] = new_status
            if scrutiny_notes:
                charge_sheets_db[cs_id]["scrutiny_notes"] = scrutiny_notes
            if filed_date:
                charge_sheets_db[cs_id]["filed_date"] = filed_date
            return charge_sheets_db[cs_id]
        return None
    cs_repo.create_charge_sheet.side_effect = create_cs
    cs_repo.get_charge_sheet.side_effect = lambda cid, **kw: charge_sheets_db.get(cid)
    cs_repo.update_charge_sheet_status.side_effect = update_cs_status
    cs_repo.list_charge_sheets.side_effect = lambda **kw: list(charge_sheets_db.values())
    cs_repo.add_accused.side_effect = lambda cs_id, acc: [accused_db.append(a) or a for a in acc]
    cs_repo.list_accused.side_effect = lambda cs_id: [a for a in accused_db if a.get("charge_sheet_id") == cs_id]

    # Court Filing Repo Mock
    cf_repo = MagicMock()
    def create_cf(payload):
        cf_id = f"cf-{len(court_filings_db) + 1}"
        record = {"id": cf_id, "created_at": "2026-09-24T10:00:00Z", **payload}
        court_filings_db[cf_id] = record
        return record
    def update_cf_status(filing_id, new_status, notes=None, next_hearing_date=None, next_hearing_time=None, **kwargs):
        if filing_id in court_filings_db:
            court_filings_db[filing_id]["status"] = new_status
            if notes:
                court_filings_db[filing_id]["notes"] = notes
            return court_filings_db[filing_id]
        return None
    cf_repo.create_filing.side_effect = create_cf
    cf_repo.get_filing.side_effect = lambda fid, **kw: court_filings_db.get(fid)
    cf_repo.update_filing_status.side_effect = update_cf_status
    cf_repo.list_filings.side_effect = lambda **kw: list(court_filings_db.values())

    # Build services
    custody_svc = CustodyService(custody_repo=custody_repo, evidence_repo=ev_repo, case_repo=case_repo, audit_repo=audit_repo)
    audit_svc = AuditService(audit_repo=audit_repo, case_repo=case_repo)
    forensic_svc = ForensicService(forensic_repo=forensic_repo, case_repo=case_repo, evidence_repo=ev_repo, audit_repo=audit_repo)
    legal_svc = LegalService(charge_sheet_repo=cs_repo, court_filing_repo=cf_repo, case_repo=case_repo, audit_repo=audit_repo)

    return {
        "custody": custody_svc,
        "audit": audit_svc,
        "forensic": forensic_svc,
        "legal": legal_svc,
        "db": {
            "cases": cases_db,
            "evidence": evidence_db,
            "custody": custody_db,
            "audit": audit_db,
            "forensic": forensic_db,
            "charge_sheets": charge_sheets_db,
            "court_filings": court_filings_db
        }
    }


# =============================================================================
# A. CHAIN OF CUSTODY TESTS
# =============================================================================

def test_custody_transfer_authorized_inspector(workflow_harness, mock_inspector_user):
    svc = workflow_harness["custody"]
    req = CustodyTransferRequest(
        to_location="State Forensic Science Laboratory, Bhopal",
        transfer_reason="Transfer for ballistics and latent fingerprint analysis",
        seal_intact=True
    )
    res = svc.transfer_custody(evidence_id="ev-1", payload=req, current_user=mock_inspector_user)

    # 1. Step number incremented to 2
    assert res.step_number == 2
    assert res.to_location == "State Forensic Science Laboratory, Bhopal"

    # 2. Actor strictly bound to authenticated officer
    assert res.to_custodian_id == mock_inspector_user.id

    # 3. Block hash chained to previous step
    assert res.previous_block_hash == "BLK-SHA256-GENESIS-001"
    assert "BLK-SHA256-2-" in res.block_hash

    # 4. Audit log emitted
    audit_db = workflow_harness["db"]["audit"]
    assert any(a["action"] == "CUSTODY_TRANSFER_LOGGED" for a in audit_db)


def test_custody_unauthorized_role(workflow_harness, mock_legal_user):
    svc = workflow_harness["custody"]
    req = CustodyTransferRequest(
        to_location="Court Room #3",
        transfer_reason="Unauthorized custody transfer attempt",
        seal_intact=True
    )
    # Legal officer cannot physically transfer police exhibit custody
    with pytest.raises(ForbiddenException):
        svc.transfer_custody(evidence_id="ev-1", payload=req, current_user=mock_legal_user)


def test_custody_cross_case_denied(workflow_harness, mock_inspector_user):
    svc = workflow_harness["custody"]
    req = CustodyTransferRequest(
        to_location="Vault Room",
        transfer_reason="Accessing restricted case exhibit",
        seal_intact=True
    )
    # Inspector has no jurisdiction over case-restricted
    with pytest.raises(ForbiddenException):
        svc.transfer_custody(evidence_id="ev-restricted", payload=req, current_user=mock_inspector_user)


# =============================================================================
# B. AUDIT LOG TESTS
# =============================================================================

def test_audit_log_actor_bound_to_authenticated_user(workflow_harness, mock_inspector_user):
    svc = workflow_harness["audit"]
    log = svc.log_event(
        current_user=mock_inspector_user,
        action="CASE_ACCESSED",
        module="Cases",
        entity_type="Case",
        entity_id="case-101",
        description="Inspector inspected case docket"
    )
    # Actor must come from authenticated context, not client-spoofed
    assert log["user_id"] == mock_inspector_user.id
    assert log["role"] == "inspector"
    assert "SEAL-SHA256-" in log["record_hash"]


# =============================================================================
# C. FORENSIC WORKFLOW TESTS
# =============================================================================

def test_forensic_report_creation_valid(workflow_harness, mock_forensic_user):
    svc = workflow_harness["forensic"]
    payload = ForensicReportCreate(
        case_id="case-101",
        evidence_id="ev-1",
        report_type="Ballistics & Toolmark",
        examination_details="Microscopic groove striation comparison",
        findings_summary="Striation marks match test firing specimen",
        conclusive_opinion="The seized cartridge was fired from the seized weapon."
    )
    res = svc.create_report(payload=payload, current_user=mock_forensic_user)

    assert res.report_type == "Ballistics & Toolmark"
    assert res.status == "Draft"
    # Trusted hash bound from evidence record, NOT client
    expected_hash = workflow_harness["db"]["evidence"]["ev-1"]["sha256_hash"]
    assert res.hash_signature == expected_hash


def test_forensic_report_cross_case_relationship_rejected(workflow_harness, mock_forensic_user):
    svc = workflow_harness["forensic"]
    # Trying to link case-101 with ev-restricted (which belongs to case-restricted)
    payload = ForensicReportCreate(
        case_id="case-101",
        evidence_id="ev-restricted",
        report_type="Digital Cyber Carving",
        examination_details="Cross case test",
        findings_summary="Invalid relationship",
        conclusive_opinion="Should fail"
    )
    with pytest.raises(ValidationException) as excinfo:
        svc.create_report(payload=payload, current_user=mock_forensic_user)
    assert "Cross-case integrity violation" in str(excinfo.value)


def test_forensic_report_state_machine_locked_on_finalized(workflow_harness, mock_forensic_user):
    svc = workflow_harness["forensic"]
    payload = ForensicReportCreate(
        case_id="case-101",
        evidence_id="ev-1",
        report_type="DNA STR Profiling",
        examination_details="DNA locus test",
        findings_summary="Profile matched",
        conclusive_opinion="Statutory match"
    )
    res = svc.create_report(payload=payload, current_user=mock_forensic_user)

    # 1. Draft -> Under Examination (allowed)
    step1 = svc.update_status(res.id, ForensicReportStatusUpdate(status="Under Examination"), mock_forensic_user)
    assert step1.status == "Under Examination"

    # 2. Under Examination -> Pending Review (allowed)
    step2 = svc.update_status(res.id, ForensicReportStatusUpdate(status="Pending Review"), mock_forensic_user)
    assert step2.status == "Pending Review"

    # 3. Pending Review -> Finalized (allowed, legally sealed)
    final = svc.update_status(res.id, ForensicReportStatusUpdate(status="Finalized"), mock_forensic_user)
    assert final.status == "Finalized"

    # 4. Attempt mutation on Finalized report MUST BE REJECTED!
    with pytest.raises(AppException) as excinfo:
        svc.update_status(res.id, ForensicReportStatusUpdate(status="Draft"), mock_forensic_user)
    assert excinfo.value.code == "TERMINAL_STATE_LOCKED"


# =============================================================================
# D. CHARGE SHEET WORKFLOW TESTS
# =============================================================================

def test_charge_sheet_creation_and_state_machine(workflow_harness, mock_inspector_user, mock_legal_user):
    svc = workflow_harness["legal"]
    payload = ChargeSheetCreate(
        case_id="case-101",
        investigation_summary="Evidence establishes guilt of accused under Section 302 IPC.",
        applicable_charges=["Section 302 IPC", "Section 201 IPC"]
    )
    cs = svc.create_charge_sheet(payload=payload, current_user=mock_inspector_user)
    assert cs.status == "Draft"
    assert cs.investigating_officer_id == mock_inspector_user.id

    # Legal officer reviews charge sheet: Draft -> Under Review
    s1 = svc.update_charge_sheet_status(cs.id, ChargeSheetStatusUpdate(status="Under Review"), mock_legal_user)
    assert s1.status == "Under Review"

    # Legal officer submits: Under Review -> Submitted
    s2 = svc.update_charge_sheet_status(cs.id, ChargeSheetStatusUpdate(status="Submitted"), mock_legal_user)
    assert s2.status == "Submitted"

    # Judicial acceptance: Submitted -> Accepted (terminal state)
    accepted = svc.update_charge_sheet_status(cs.id, ChargeSheetStatusUpdate(status="Accepted"), mock_legal_user)
    assert accepted.status == "Accepted"

    # Attempt mutation on Accepted charge sheet MUST BE REJECTED!
    with pytest.raises(AppException) as excinfo:
        svc.update_charge_sheet_status(cs.id, ChargeSheetStatusUpdate(status="Returned"), mock_legal_user)
    assert excinfo.value.code == "TERMINAL_STATE_LOCKED"


def test_charge_sheet_unauthorized_role(workflow_harness, mock_forensic_user):
    svc = workflow_harness["legal"]
    payload = ChargeSheetCreate(
        case_id="case-101",
        investigation_summary="Forensic officer attempting to file charge sheet",
        applicable_charges=["Section 302 IPC"]
    )
    with pytest.raises(ForbiddenException):
        svc.create_charge_sheet(payload=payload, current_user=mock_forensic_user)


# =============================================================================
# E. COURT FILING WORKFLOW TESTS
# =============================================================================

def test_court_filing_creation_and_disposition(workflow_harness, mock_legal_user):
    svc = workflow_harness["legal"]
    payload = CourtFilingCreate(
        case_id="case-101",
        title="Bail Objection Petition on Behalf of Prosecution",
        filing_type="Bail Application",
        court_name="Court of Sessions Judge, Bhopal"
    )
    filing = svc.create_court_filing(payload=payload, current_user=mock_legal_user)
    assert filing.status == "Filed"

    # Court disposes the application: Filed -> Disposed (terminal)
    disp = svc.update_court_filing_status(filing.id, CourtFilingStatusUpdate(status="Disposed", notes="Bail application rejected by Sessions Judge."), mock_legal_user)
    assert disp.status == "Disposed"

    # Attempt mutation on Disposed filing MUST BE REJECTED!
    with pytest.raises(AppException) as excinfo:
        svc.update_court_filing_status(filing.id, CourtFilingStatusUpdate(status="Draft"), mock_legal_user)
    assert excinfo.value.code == "TERMINAL_STATE_LOCKED"


# =============================================================================
# F. FASTAPI HTTP ROUTE ENDPOINT INTEGRATION TESTS
# =============================================================================

def test_http_api_routes_custody_audit_forensic_legal(client, mock_inspector_user, mock_forensic_user, mock_legal_user, workflow_harness, monkeypatch):
    from backend.app.api.dependencies import get_current_user
    monkeypatch.setattr("backend.app.api.routes.custody.custody_service", workflow_harness["custody"])
    monkeypatch.setattr("backend.app.api.routes.audit.audit_service", workflow_harness["audit"])
    monkeypatch.setattr("backend.app.api.routes.forensic.forensic_service", workflow_harness["forensic"])
    monkeypatch.setattr("backend.app.api.routes.legal.legal_service", workflow_harness["legal"])

    # 1. Test GET /api/v1/evidence/{evidence_id}/custody
    app.dependency_overrides[get_current_user] = lambda: mock_inspector_user
    res_coc = client.get("/api/v1/evidence/ev-1/custody")
    assert res_coc.status_code == status.HTTP_200_OK
    assert res_coc.json()["data"]["total_steps"] >= 1

    # 2. Test POST /api/v1/evidence/{evidence_id}/custody/transfer
    res_xfer = client.post(
        "/api/v1/evidence/ev-1/custody/transfer",
        json={
            "to_location": "RFSL Ballistics Lab",
            "transfer_reason": "Statutory FSL examination transfer",
            "seal_intact": True
        }
    )
    assert res_xfer.status_code == status.HTTP_201_CREATED
    assert res_xfer.json()["data"]["to_location"] == "RFSL Ballistics Lab"

    # 3. Test GET /api/v1/audit-logs
    res_audit = client.get("/api/v1/audit-logs")
    assert res_audit.status_code == status.HTTP_200_OK
    assert res_audit.json()["data"]["total"] >= 1

    # 4. Test POST /api/v1/forensic-reports (Forensic Officer)
    app.dependency_overrides[get_current_user] = lambda: mock_forensic_user
    res_fr = client.post(
        "/api/v1/forensic-reports",
        json={
            "case_id": "case-101",
            "evidence_id": "ev-1",
            "report_type": "Ballistics & Toolmark",
            "examination_details": "Chamber marks comparison",
            "findings_summary": "Match confirmed",
            "conclusive_opinion": "Statutory opinion Formulation"
        }
    )
    assert res_fr.status_code == status.HTTP_201_CREATED
    fr_id = res_fr.json()["data"]["id"]

    # 5. Test PATCH /api/v1/forensic-reports/{id}/status
    res_fr_status = client.patch(
        f"/api/v1/forensic-reports/{fr_id}/status",
        json={"status": "Under Examination"}
    )
    assert res_fr_status.status_code == status.HTTP_200_OK

    # 6. Test POST /api/v1/charge-sheets (Inspector)
    app.dependency_overrides[get_current_user] = lambda: mock_inspector_user
    res_cs = client.post(
        "/api/v1/charge-sheets",
        json={
            "case_id": "case-101",
            "investigation_summary": "Final investigation report per Section 173 CrPC",
            "applicable_charges": ["Section 302 IPC"]
        }
    )
    assert res_cs.status_code == status.HTTP_201_CREATED
    cs_id = res_cs.json()["data"]["id"]

    # 7. Test PATCH /api/v1/charge-sheets/{id}/status (Legal Officer)
    app.dependency_overrides[get_current_user] = lambda: mock_legal_user
    res_cs_status = client.patch(
        f"/api/v1/charge-sheets/{cs_id}/status",
        json={"status": "Under Review", "scrutiny_notes": "Scrutiny in progress"}
    )
    assert res_cs_status.status_code == status.HTTP_200_OK

    # 8. Test POST /api/v1/court-filings (Legal Officer)
    res_cf = client.post(
        "/api/v1/court-filings",
        json={
            "case_id": "case-101",
            "title": "Case Diary Production Petition",
            "filing_type": "Case Diary Production",
            "court_name": "Court of CJM, Bhopal"
        }
    )
    assert res_cf.status_code == status.HTTP_201_CREATED
    cf_id = res_cf.json()["data"]["id"]

    # 9. Test PATCH /api/v1/court-filings/{id}/status (Legal Officer)
    res_cf_status = client.patch(
        f"/api/v1/court-filings/{cf_id}/status",
        json={"status": "Disposed", "notes": "Judicial production completed"}
    )
    assert res_cf_status.status_code == status.HTTP_200_OK

    app.dependency_overrides.clear()
