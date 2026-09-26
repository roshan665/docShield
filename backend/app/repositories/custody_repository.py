import hashlib
import time
from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class CustodyRepository(BaseRepository):
    """
    Repository for interacting with the append-only `chain_of_custody_transfers` table.
    Strictly append-only; update and delete operations are rejected by database triggers.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="chain_of_custody_transfers", client=client)

    @staticmethod
    def compute_block_hash(
        step_number: int,
        evidence_id: str,
        from_location: str,
        to_location: str,
        previous_block_hash: Optional[str]
    ) -> str:
        """
        Computes cryptographic SHA-256 block hash chaining to the previous block.
        """
        payload = f"{step_number}|{evidence_id}|{from_location}|{to_location}|{previous_block_hash or 'GENESIS'}|{time.time_ns()}"
        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        return f"BLK-SHA256-{digest[:16]}-{digest[16:22]}"

    def get_latest_transfer(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves the most recent custody transfer step for an evidence item.
        """
        res = (
            self.client.from_(self.table_name)
            .select("*")
            .eq("evidence_id", evidence_id)
            .order("step_number", desc=True)
            .limit(1)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def list_transfers(self, evidence_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves the complete chronological chain of custody for an exhibit.
        """
        res = (
            self.client.from_(self.table_name)
            .select("*")
            .eq("evidence_id", evidence_id)
            .order("step_number", asc=True)
            .execute()
        )
        return res.data or []

    def append_transfer(
        self,
        evidence_id: str,
        to_custodian_id: str,
        to_location: str,
        transfer_reason: str,
        from_location: str = "Crime Scene / Seizure Site",
        from_custodian_id: Optional[str] = None,
        authority_memo_ref: Optional[str] = None,
        seal_intact: bool = True,
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Appends a new custody block to the unbroken chain.
        """
        latest = self.get_latest_transfer(evidence_id)
        next_step = (latest["step_number"] + 1) if latest else 1
        prev_hash = latest["block_hash"] if latest else "GENESIS-BLOCK"
        block_hash = self.compute_block_hash(next_step, evidence_id, from_location, to_location, prev_hash)

        payload = {
            "evidence_id": evidence_id,
            "step_number": next_step,
            "from_location": from_location,
            "to_location": to_location,
            "transfer_reason": transfer_reason,
            "seal_intact": seal_intact,
            "previous_block_hash": prev_hash,
            "block_hash": block_hash,
            "to_custodian_id": to_custodian_id
        }
        if from_custodian_id:
            payload["from_custodian_id"] = from_custodian_id
        if authority_memo_ref:
            payload["authority_memo_ref"] = authority_memo_ref
        if created_by:
            payload["created_by"] = created_by

        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return payload
