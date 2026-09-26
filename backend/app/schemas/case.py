from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CaseCreate(BaseModel):
    case_number: Optional[str] = Field(None, description="Statutory case number, e.g. #2024-1801")
    title: str = Field(default="Investigation Case", description="Title or crime description")
    section_ipc_bns: str = Field(default="IPC 302 - Homicide", description="Statutory penal code provisions")
    status: str = Field(default="Active", description="Active, Under Review, Closed, Charge Sheet Filed")
    priority: str = Field(default="Normal", description="Low, Normal, High, Urgent, Critical")
    complainant_name: Optional[str] = Field("Direct Police Cognizance", description="Complainant or informant name")
    police_station: Optional[str] = Field("Bhopal Central Police Station", description="Jurisdictional police station")
    summary: Optional[str] = Field("Preliminary investigation initialized under IO purview.", description="Case summary")
    investigating_officer_id: Optional[str] = Field(None, description="Assigned IO profile UUID")


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    section_ipc_bns: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    complainant_name: Optional[str] = None
    police_station: Optional[str] = None
    summary: Optional[str] = None
    investigating_officer_id: Optional[str] = None
    assigned_legal_officer_id: Optional[str] = None
    assigned_forensic_officer_id: Optional[str] = None


class CaseResponse(BaseModel):
    id: str
    case_number: str
    title: str
    section_ipc_bns: Optional[str] = None
    status: str
    priority: str
    complainant_name: Optional[str] = None
    police_station: Optional[str] = None
    summary: Optional[str] = None
    investigating_officer_id: Optional[str] = None
    assigned_legal_officer_id: Optional[str] = None
    assigned_forensic_officer_id: Optional[str] = None
    investigating_officer: Optional[Dict[str, Any]] = None
    registration_date: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    documents: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    charge_sheets: List[Dict[str, Any]] = Field(default_factory=list)
    court_filings: List[Dict[str, Any]] = Field(default_factory=list)
