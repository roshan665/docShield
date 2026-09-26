from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class CourtFilingRepository(BaseRepository):
    """
    Repository for interacting with `court_filings` and `court_filing_documents` tables.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="court_filings", client=client)

    def get_by_filing_number(self, filing_number: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a filing by its formal filing number (e.g. 'CF-2024-441').
        """
        res = self.client.from_(self.table_name).select("*").eq("filing_number", filing_number.strip()).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def get_filing(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves filing by UUID or filing_number safely.
        """
        if not identifier:
            return None
        clean_id = str(identifier).strip()
        import re
        if re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", clean_id, re.I):
            cf = self.get_by_id(clean_id)
            if cf:
                return cf
        return self.get_by_filing_number(clean_id)

    def list_filings(
        self,
        case_id: Optional[str] = None,
        filing_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Lists court filings filtered by case, type, or status.
        """
        query = self.client.from_(self.table_name).select("*").order("filing_date", desc=True).limit(limit)
        if case_id:
            query = query.eq("case_id", case_id)
        if filing_type and filing_type != "All":
            query = query.eq("filing_type", filing_type)
        if status and status != "All":
            query = query.eq("status", status)

        res = query.execute()
        return res.data or []

    def create_filing(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new formal judicial filing.
        """
        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        raise RuntimeError("Failed to create court filing in database.")

    def update_filing_status(
        self,
        filing_id: str,
        new_status: str,
        notes: Optional[str] = None,
        next_hearing_date: Optional[str] = None,
        next_hearing_time: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Updates filing status, judicial hearing schedule, and court notes.
        """
        updates = {"status": new_status, "updated_at": "now()"}
        if notes:
            updates["notes"] = notes
        if next_hearing_date:
            updates["next_hearing_date"] = next_hearing_date
        if next_hearing_time:
            updates["next_hearing_time"] = next_hearing_time

        res = self.client.from_(self.table_name).update(updates).eq("id", filing_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def link_document(self, filing_id: str, document_id: str, annexure_label: str = "Annexure") -> Dict[str, Any]:
        """
        Attaches a document to a court filing via court_filing_documents junction table.
        """
        payload = {
            "filing_id": filing_id,
            "document_id": document_id,
            "annexure_label": annexure_label
        }
        res = self.client.from_("court_filing_documents").insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return payload

    def list_linked_documents(self, filing_id: str) -> List[Dict[str, Any]]:
        """
        Lists all documents attached as annexures to this judicial filing.
        """
        res = (
            self.client.from_("court_filing_documents")
            .select("*, document:document_id(*)")
            .eq("filing_id", filing_id)
            .execute()
        )
        return res.data or []
