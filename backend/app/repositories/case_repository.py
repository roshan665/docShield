from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.core.permissions import Role
from backend.app.repositories.base import BaseRepository


class CaseRepository(BaseRepository):
    """
    Repository for interacting with the `cases` table in Supabase.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="cases", client=client)

    def get_by_case_number(self, case_number: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a case by its formal case number (e.g. '#2024-1768' or '2024-1768').
        """
        clean_num = case_number.strip()
        res = self.client.from_(self.table_name).select("*").eq("case_number", clean_num).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        # Try without/with '#' prefix if not found
        alt_num = clean_num[1:] if clean_num.startswith("#") else f"#{clean_num}"
        res_alt = self.client.from_(self.table_name).select("*").eq("case_number", alt_num).execute()
        if res_alt.data and len(res_alt.data) > 0:
            return res_alt.data[0]
        return None

    def get_case(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a case record by UUID or by case_number ('#2024-1768').
        Avoids invalid PostgreSQL UUID cast errors when input is a statutory case number.
        """
        if not identifier:
            return None
        clean_id = str(identifier).strip()
        import re
        if re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", clean_id, re.I):
            case = self.get_by_id(clean_id)
            if case:
                return case
        return self.get_by_case_number(clean_id)

    def user_has_case_access(self, case_id: str, user_id: str, user_role: Role) -> bool:
        """
        Verifies if an authenticated officer has authorized access to a specific case.
        Admins, Legal Officers, and Forensic Officers have departmental access.
        Inspectors have access if assigned or general supervisory oversight.
        """
        if user_role in (Role.ADMIN, Role.LEGAL_OFFICER, Role.FORENSIC_OFFICER):
            return True

        case = self.get_by_id(case_id)
        if not case:
            return False

        # If user is inspector, check if assigned or if general case
        investigating_officer = str(case.get("investigating_officer_id") or "")
        if investigating_officer and investigating_officer == str(user_id):
            return True

        # In DocShield, active inspectors also have jurisdiction over active police docket cases
        return user_role == Role.INSPECTOR

    def list_cases(self, status: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lists cases with child relations for high-performance dashboard view.
        """
        try:
            query = self.client.from_(self.table_name).select(
                "*, investigating_officer:investigating_officer_id(id, full_name, badge_id), "
                "documents:documents(id, document_name, document_type, sha256_hash, verification_status, file_size_bytes, storage_path, created_at), "
                "evidence:evidence(id, evidence_tag, evidence_type, description, current_location, status, seal_number, sha256_hash, collection_date), "
                "charge_sheets:charge_sheets(*), "
                "court_filings:court_filings(*)"
            ).order("created_at", desc=True).limit(limit)

            if status:
                query = query.eq("status", status)

            res = query.execute()
            return res.data or []
        except Exception as e:
            # Fallback to basic case query if relations fail
            fallback_query = self.client.from_(self.table_name).select("*").order("created_at", desc=True).limit(limit)
            if status:
                fallback_query = fallback_query.eq("status", status)
            res = fallback_query.execute()
            return res.data or []

    def create_case(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Inserts a new investigation case.
        """
        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        raise RuntimeError("Failed to create case in database.")

    def update_case(self, case_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Updates an existing case.
        """
        res = self.client.from_(self.table_name).update(payload).eq("id", case_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

