from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.integrations.supabase.client import get_supabase_client


class BaseRepository:
    """
    Base repository providing data access utilities for Supabase PostgreSQL tables.
    Can be instantiated with a specific client (e.g. authenticated with user JWT to preserve RLS)
    or defaults to the standard client.
    """
    def __init__(self, table_name: str, client: Optional[Client] = None):
        self.table_name = table_name
        self._client = client

    @property
    def client(self) -> Client:
        if self._client is not None:
            return self._client
        return get_supabase_client()

    def get_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        res = self.client.from_(self.table_name).select("*").eq("id", record_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def list_records(self, limit: int = 100) -> List[Dict[str, Any]]:
        res = self.client.from_(self.table_name).select("*").limit(limit).execute()
        return res.data or []
