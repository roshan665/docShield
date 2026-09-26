from typing import Any, Dict, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class ProfileRepository(BaseRepository):
    """
    Data repository for the `profiles` table.
    Enforces that user roles and identity metadata are loaded directly from the database,
    never trusted from client payloads.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="profiles", client=client)

    def get_profile_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves user profile by Supabase Auth UID.
        """
        return self.get_by_id(user_id)

    def get_profile_by_badge_id(self, badge_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves user profile by official statutory badge ID.
        """
        res = self.client.from_(self.table_name).select("*").eq("badge_id", badge_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def list_profiles(self, limit: int = 100) -> list[Dict[str, Any]]:
        """
        Lists all system user profiles for Administrator management.
        """
        res = self.client.from_(self.table_name).select("*").order("created_at", desc=True).limit(limit).execute()
        return res.data or []

    def update_profile(self, user_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Updates profile information.
        """
        res = self.client.from_(self.table_name).update(payload).eq("id", user_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

