from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class EvidenceVersionRepository(BaseRepository):
    """
    Repository for interacting with the immutable `evidence_versions` ledger in Supabase.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="evidence_versions", client=client)

    def create_version(self, version_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Appends an immutable version record to the ledger.
        """
        res = self.client.from_(self.table_name).insert(version_payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        raise RuntimeError("Failed to record evidence version snapshot in ledger.")

    def list_versions_for_evidence(self, evidence_id: str) -> List[Dict[str, Any]]:
        """
        Returns the complete historical version ledger for an evidence exhibit,
        ordered from newest to oldest.
        """
        res = self.client.from_(self.table_name).select("*").eq("evidence_id", evidence_id).order("version_number", desc=True).execute()
        return res.data or []

    def get_version_by_number(self, evidence_id: str, version_number: int) -> Optional[Dict[str, Any]]:
        """
        Retrieves a specific historical snapshot by version number.
        """
        res = self.client.from_(self.table_name).select("*").eq("evidence_id", evidence_id).eq("version_number", version_number).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def get_latest_version(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves the most recent version record for an exhibit.
        """
        res = self.client.from_(self.table_name).select("*").eq("evidence_id", evidence_id).order("version_number", desc=True).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
