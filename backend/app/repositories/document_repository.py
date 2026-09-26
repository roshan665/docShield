from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository):
    """
    Repository for interacting with the `documents` table in Supabase.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="documents", client=client)

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single document with related case and uploader info.
        """
        try:
            res = (
                self.client.from_(self.table_name)
                .select("*, cases:case_id(id, case_number, title, police_station), uploader:uploaded_by(id, full_name, badge_id)")
                .eq("id", doc_id)
                .execute()
            )
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception:
            return self.get_by_id(doc_id)
        return None

    def list_documents(self, case_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lists documents with parent case and uploader information.
        """
        try:
            query = (
                self.client.from_(self.table_name)
                .select("*, cases:case_id(id, case_number, title, police_station), uploader:uploaded_by(id, full_name, badge_id)")
                .order("created_at", desc=True)
                .limit(limit)
            )
            if case_id:
                query = query.eq("case_id", case_id)
            res = query.execute()
            return res.data or []
        except Exception:
            query = self.client.from_(self.table_name).select("*").order("created_at", desc=True).limit(limit)
            if case_id:
                query = query.eq("case_id", case_id)
            res = query.execute()
            return res.data or []

    def create_document(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new document record.
        """
        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        raise RuntimeError("Failed to create document record in database.")

    def update_document(self, doc_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Updates document attributes.
        """
        res = self.client.from_(self.table_name).update(payload).eq("id", doc_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
