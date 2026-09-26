from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class ForensicRepository(BaseRepository):
    """
    Repository for interacting with the `forensic_reports` table in Supabase.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="forensic_reports", client=client)

    def get_by_report_number(self, report_number: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a report by statutory identifier (e.g. 'FR-2024-926').
        """
        res = self.client.from_(self.table_name).select("*").eq("report_number", report_number.strip()).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def get_report(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves report by UUID or report_number safely without PostgreSQL type cast errors.
        """
        if not identifier:
            return None
        clean_id = str(identifier).strip()
        import re
        if re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", clean_id, re.I):
            report = self.get_by_id(clean_id)
            if report:
                return report
        return self.get_by_report_number(clean_id)

    def list_reports(
        self,
        case_id: Optional[str] = None,
        evidence_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Lists reports optionally filtered by case, evidence, or status.
        """
        query = self.client.from_(self.table_name).select("*").order("created_at", desc=True).limit(limit)
        if case_id:
            query = query.eq("case_id", case_id)
        if evidence_id:
            query = query.eq("evidence_id", evidence_id)
        if status and status != "All":
            query = query.eq("status", status)

        res = query.execute()
        return res.data or []

    def create_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new forensic examination report.
        """
        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        raise RuntimeError("Failed to create forensic report in database.")

    def update_report_status(
        self,
        report_id: str,
        new_status: str,
        finalized_at: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Updates forensic report status and optional finalization timestamp.
        """
        updates = {"status": new_status, "updated_at": "now()"}
        if finalized_at:
            updates["finalized_at"] = finalized_at

        res = self.client.from_(self.table_name).update(updates).eq("id", report_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
