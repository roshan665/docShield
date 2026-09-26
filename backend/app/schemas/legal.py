from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AccusedCreate(BaseModel):
    full_name: str = Field(..., description="Full statutory name of accused person")
    alias: Optional[str] = Field(None, description="Alias / moniker")
    custody_status: str = Field("In Custody", description="In Custody, On Bail, Absconding, Not Arrested")
    arrest_date: Optional[str] = Field(None, description="Date of statutory arrest (YYYY-MM-DD)")
    charges_attributed: List[str] = Field(default_factory=list, description="Sections attributed to this individual")


class ChargeSheetCreate(BaseModel):
    case_id: str = Field(..., description="Parent case UUID or case number")
    investigation_summary: str = Field(..., description="Comprehensive statutory final form investigation summary")
    applicable_charges: List[str] = Field(..., description="List of statutory sections (e.g. ['Section 302 IPC'])")
    court_name: Optional[str] = Field("Court of Chief Judicial Magistrate, Bhopal", description="Competent judicial court")
    court_docket_no: Optional[str] = Field(None, description="Court clerk docket number")
    charge_sheet_number: Optional[str] = Field(None, description="Statutory charge sheet number")
    accused: List[AccusedCreate] = Field(default_factory=list, description="List of chargesheeted accused persons")


class ChargeSheetStatusUpdate(BaseModel):
    status: str = Field(..., description="Draft, Under Review, Submitted, Accepted, Returned")
    scrutiny_notes: Optional[str] = Field(None, description="Public Prosecutor or Magistrate scrutiny remarks")


class ChargeSheetResponse(BaseModel):
    id: str
    charge_sheet_number: str
    case_id: str
    investigating_officer_id: str
    assigned_prosecutor_id: Optional[str] = None
    status: str
    investigation_summary: Optional[str] = None
    applicable_charges: List[str]
    court_name: str
    court_docket_no: Optional[str] = None
    scrutiny_notes: Optional[str] = None
    filed_date: Optional[datetime] = None
    accused: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime


class CourtFilingCreate(BaseModel):
    case_id: str = Field(..., description="Parent case UUID or case number")
    title: str = Field(..., description="Judicial petition or production title")
    filing_type: str = Field("Charge Sheet", description="Charge Sheet, Bail Application, Remand Extension, etc.")
    court_name: str = Field(..., description="Designated court of submission")
    judge_name: Optional[str] = Field(None, description="Presiding judge")
    docket_number: Optional[str] = Field(None, description="Court docket identifier")
    notes: Optional[str] = Field(None, description="Statutory judicial filing remarks")
    next_hearing_date: Optional[str] = Field(None, description="Next court date (YYYY-MM-DD)")
    next_hearing_time: Optional[str] = Field(None, description="Hearing time (HH:MM)")
    filing_number: Optional[str] = Field(None, description="Statutory filing number")


class CourtFilingStatusUpdate(BaseModel):
    status: str = Field(..., description="Draft, Under Review, Filed, Disposed")
    notes: Optional[str] = Field(None, description="Updated judicial hearing remarks")
    next_hearing_date: Optional[str] = Field(None, description="Rescheduled hearing date")
    next_hearing_time: Optional[str] = Field(None, description="Rescheduled hearing time")


class CourtFilingResponse(BaseModel):
    id: str
    filing_number: str
    case_id: str
    filing_type: str
    title: str
    court_name: str
    judge_name: Optional[str] = None
    docket_number: Optional[str] = None
    status: str
    filing_date: datetime
    next_hearing_date: Optional[str] = None
    next_hearing_time: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
