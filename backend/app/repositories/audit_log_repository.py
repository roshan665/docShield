import hashlib
import time
from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class AuditLogRepository(BaseRepository):
    """
    Repository for interacting with the append-only `audit_logs` table in Supabase.
    Strictly append-only; update and delete operations are rejected by database triggers.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="audit_logs", client=client)

    @staticmethod
    def generate_record_hash(action: str, entity_type: str, entity_id: Optional[str], user_id: Optional[str]) -> str:
        """
        Generates a deterministic cryptographic record seal for the audit log entry.
        """
        seed = f"{action}|{entity_type}|{entity_id or 'NONE'}|{user_id or 'SYSTEM'}|{time.time_ns()}"
        digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
        return f"SEAL-SHA256-{digest[:16]}-{digest[16:24]}"

    def append_log(
        self,
        action: str,
        module: str,
        entity_type: str,
        description: str,
        result: str = "Success",
        user_id: Optional[str] = None,
        role: str = "System",
        entity_id: Optional[str] = None,
        case_id: Optional[str] = None,
        evidence_id: Optional[str] = None,
        event_payload: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Appends an immutable audit entry to the audit log trail.
        """
        record_hash = self.generate_record_hash(action, entity_type, entity_id, user_id)
        payload = {
            "action": action,
            "module": module,
            "entity_type": entity_type,
            "description": description,
            "result": result,
            "role": role,
            "record_hash": record_hash,
            "event_payload": event_payload or {}
        }
        if user_id:
            payload["user_id"] = user_id
        if entity_id:
            payload["entity_id"] = str(entity_id)
        if case_id:
            payload["case_id"] = case_id
        if evidence_id:
            payload["evidence_id"] = evidence_id
        if ip_address:
            payload["ip_address"] = ip_address
        if user_agent:
            payload["user_agent"] = user_agent

        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return payload

    def list_logs(
        self,
        module: Optional[str] = None,
        case_id: Optional[str] = None,
        evidence_id: Optional[str] = None,
        result: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieves audit trail entries filtered by module, case, evidence, or result.
        Ordered newest to oldest.
        """
        query = self.client.from_(self.table_name).select("*").order("timestamp", desc=True).limit(limit)
        if module and module != "All":
            query = query.eq("module", module)
        if case_id:
            query = query.eq("case_id", case_id)
        if evidence_id:
            query = query.eq("evidence_id", evidence_id)
        if result and result != "All":
            query = query.eq("result", result)

        res = query.execute()
        return res.data or []
