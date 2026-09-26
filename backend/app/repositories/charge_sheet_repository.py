from typing import Any, Dict, List, Optional
from supabase import Client
from backend.app.repositories.base import BaseRepository


class ChargeSheetRepository(BaseRepository):
    """
    Repository for interacting with the `charge_sheets` and `charge_sheet_accused` tables.
    """
    def __init__(self, client: Optional[Client] = None):
        super().__init__(table_name="charge_sheets", client=client)

    def get_by_charge_sheet_number(self, cs_number: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a charge sheet by statutory number (e.g. 'CS-2024-709').
        """
        res = self.client.from_(self.table_name).select("*").eq("charge_sheet_number", cs_number.strip()).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def get_charge_sheet(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves charge sheet by UUID or charge_sheet_number safely.
        """
        if not identifier:
            return None
        clean_id = str(identifier).strip()
        import re
        if re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", clean_id, re.I):
            cs = self.get_by_id(clean_id)
            if cs:
                return cs
        return self.get_by_charge_sheet_number(clean_id)

    def list_charge_sheets(
        self,
        case_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Lists charge sheets filtered by case or status.
        """
        query = self.client.from_(self.table_name).select("*").order("created_at", desc=True).limit(limit)
        if case_id:
            query = query.eq("case_id", case_id)
        if status and status != "All":
            query = query.eq("status", status)

        res = query.execute()
        return res.data or []

    def create_charge_sheet(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new statutory charge sheet record.
        """
        res = self.client.from_(self.table_name).insert(payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        raise RuntimeError("Failed to create charge sheet record in database.")

    def update_charge_sheet_status(
        self,
        cs_id: str,
        new_status: str,
        scrutiny_notes: Optional[str] = None,
        filed_date: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Updates charge sheet status, scrutiny review notes, and filing timestamp.
        """
        updates = {"status": new_status, "updated_at": "now()"}
        if scrutiny_notes:
            updates["scrutiny_notes"] = scrutiny_notes
        if filed_date:
            updates["filed_date"] = filed_date

        res = self.client.from_(self.table_name).update(updates).eq("id", cs_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None

    def add_accused(self, charge_sheet_id: str, accused_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Appends accused persons to a charge sheet.
        """
        if not accused_list:
            return []
        rows = [
            {
                "charge_sheet_id": charge_sheet_id,
                "full_name": a.get("full_name"),
                "alias": a.get("alias"),
                "custody_status": a.get("custody_status", "In Custody"),
                "arrest_date": a.get("arrest_date"),
                "charges_attributed": a.get("charges_attributed", [])
            }
            for a in accused_list
        ]
        res = self.client.from_("charge_sheet_accused").insert(rows).execute()
        return res.data or []

    def list_accused(self, charge_sheet_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all accused persons associated with a charge sheet.
        """
        res = self.client.from_("charge_sheet_accused").select("*").eq("charge_sheet_id", charge_sheet_id).execute()
        return res.data or []
