from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class EvidenceRepository(BaseRepository):
    """
    Repository for interacting with the `evidence` table in Supabase.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="evidence", client=client)

    def get_by_tag(self, evidence_tag: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves evidence exhibit by its unique tag (e.g., 'EV-2024-001').
        """
        res = self.client.from_(self.table_name).select("*").eq("evidence_tag", evidence_tag).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def list_by_case(self, case_id: str) -> List[Dict[str, Any]]:
        """
        Lists all evidence exhibits for a given case UUID.
        """
        res = self.client.from_(self.table_name).select("*").eq("case_id", case_id).order("created_at", desc=True).execute()
        return res.data or []

    def update_current_version_metadata(
        self,
        evidence_id: str,
        current_version: int,
        storage_path: str,
        sha256_hash: str,
        file_size_bytes: int,
        mime_type: str = "application/octet-stream"
    ) -> Optional[Dict[str, Any]]:
        """
        Updates current version reference, active storage path, and active hash on the parent evidence row.
        """
        payload = {
            "current_version": current_version,
            "storage_path": storage_path,
            "sha256_hash": sha256_hash.lower(),
            "file_size_bytes": file_size_bytes,
            "mime_type": mime_type,
            "updated_at": "now()"
        }
        res = self.client.from_(self.table_name).update(payload).eq("id", evidence_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def create_evidence(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new evidence exhibit record in the `evidence` table.
        """
        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        raise RuntimeError("Failed to create evidence record in database.")

    def update_verification_status(
        self,
        evidence_id: str,
        verification_status: str
    ) -> Optional[Dict[str, Any]]:
        """
        Updates the cryptographic verification status ('Verified', 'Tampered', 'Exception', 'Pending').
        """
        res = (
            self.client.from_(self.table_name)
            .update({"verification_status": verification_status, "updated_at": "now()"})
            .eq("id", evidence_id)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def delete_evidence(self, evidence_id: str) -> bool:
        """
        Deletes evidence record. Strictly used as transactional rollback
        when subsequent version or custody creation fails during exhibit deposition.
        """
        try:
            self.client.from_(self.table_name).delete().eq("id", evidence_id).execute()
            return True
        except Exception:
            return False

    def list_evidence(self, case_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lists evidence exhibits with parent case, collector, and custody transfers.
        """
        try:
            query = (
                self.client.from_(self.table_name)
                .select("*, cases:case_id(id, case_number, title), collector:collected_by(id, full_name, badge_id), custodian:current_custodian_id(id, full_name, badge_id), transfers:chain_of_custody_transfers(*)")
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

    def update_evidence(self, evidence_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Updates evidence attributes.
        """
        res = self.client.from_(self.table_name).update(payload).eq("id", evidence_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

