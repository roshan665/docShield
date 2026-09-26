from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ForensicReportCreate(BaseModel):
    case_id: str = Field(..., description="Parent case UUID or case number")
    evidence_id: str = Field(..., description="Seized evidence UUID or exhibit tag")
    report_type: str = Field(..., description="Forensic discipline: Ballistics & Toolmark, DNA STR Profiling, etc.")
    examination_details: str = Field(..., description="Detailed assay procedure & specimen observations")
    findings_summary: str = Field(..., description="Analytical laboratory findings summary")
    conclusive_opinion: str = Field(..., description="Expert opinion under Section 45 IEA / Sec 39 BSA")
    laboratory_division: Optional[str] = Field("Regional Forensic Science Laboratory, Bhopal", description="FSL branch")
    statutory_certificate: Optional[str] = Field("Form IV Section 45 IEA / Sec 39 BSA", description="Legal certificate reference")
    report_number: Optional[str] = Field(None, description="Optional statutory report identifier")


class ForensicReportStatusUpdate(BaseModel):
    status: str = Field(..., description="Target status: Draft, Under Examination, Pending Review, Finalized")


class ForensicReportResponse(BaseModel):
    id: str
    report_number: str
    case_id: str
    evidence_id: str
    examiner_id: str
    report_type: str
    status: str
    laboratory_division: str
    examination_details: Optional[str] = None
    findings_summary: Optional[str] = None
    conclusive_opinion: str
    statutory_certificate: Optional[str] = None
    hash_signature: Optional[str] = None
    finalized_at: Optional[datetime] = None
    created_at: datetime
