-- =============================================================================
-- DocShield: Complete Database Schema Migration
-- SIH 26190 — Secure Digital Case, Document and Evidence Management Platform
-- Conforms strictly to the approved Pre-Supabase Database Blueprint
-- =============================================================================

-- Enable required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

CREATE TYPE app_role AS ENUM (
  'admin',
  'inspector',
  'legal_officer',
  'forensic_officer'
);

CREATE TYPE user_status AS ENUM (
  'Active',
  'Inactive',
  'Pending Approval'
);

CREATE TYPE case_status AS ENUM (
  'Active',
  'Under Review',
  'Closed'
);

CREATE TYPE case_priority AS ENUM (
  'Normal',
  'High',
  'Urgent'
);

CREATE TYPE doc_classification AS ENUM (
  'FIR',
  'Panchnama',
  'Statement',
  'Medical',
  'Forensic',
  'ChargeSheet',
  'Other'
);

CREATE TYPE verification_status AS ENUM (
  'Verified',
  'Pending',
  'Tampered',
  'Exception'
);

CREATE TYPE legal_review_status AS ENUM (
  'Pending Review',
  'Scrutiny Cleared',
  'Correction Requested'
);

CREATE TYPE evidence_category AS ENUM (
  'Physical',
  'Digital',
  'Firearm',
  'Ammunition',
  'Biological',
  'Narcotics',
  'Chemical'
);

CREATE TYPE exam_status AS ENUM (
  'Pending Examination',
  'Under Examination',
  'Completed'
);

CREATE TYPE forensic_discipline AS ENUM (
  'Ballistics & Toolmark',
  'Digital Cyber Carving',
  'DNA STR Profiling',
  'Toxicology & Chemical Assay',
  'Questioned Documents'
);

CREATE TYPE forensic_report_status AS ENUM (
  'Draft',
  'Under Examination',
  'Pending Review',
  'Finalized'
);

CREATE TYPE charge_sheet_status AS ENUM (
  'Draft',
  'Under Review',
  'Submitted',
  'Accepted',
  'Returned'
);

CREATE TYPE accused_custody_status AS ENUM (
  'In Custody',
  'On Bail',
  'Absconding',
  'Not Arrested'
);

CREATE TYPE court_filing_type AS ENUM (
  'Charge Sheet',
  'Bail Application',
  'Remand Extension',
  'Case Diary Production',
  'Judicial Orders'
);

CREATE TYPE court_filing_status AS ENUM (
  'Draft',
  'Under Review',
  'Filed',
  'Disposed'
);

CREATE TYPE audit_module AS ENUM (
  'Cases',
  'Documents',
  'Evidence',
  'Forensic',
  'ChargeSheets',
  'CourtFilings',
  'Custody',
  'Users',
  'Security'
);

CREATE TYPE audit_result AS ENUM (
  'Success',
  'Warning',
  'Failure'
);

-- =============================================================================
-- 2. PROFILES TABLE (Extends auth.users)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  badge_id TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'inspector',
  department TEXT NOT NULL DEFAULT 'Investigation Division',
  designation TEXT NOT NULL DEFAULT 'Police Officer',
  station_or_lab TEXT NOT NULL DEFAULT 'Bhopal Central Police Station',
  phone TEXT,
  avatar_url TEXT,
  status user_status NOT NULL DEFAULT 'Active',
  permissions TEXT[] DEFAULT '{}',
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, badge_id, role, station_or_lab)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'DocShield Officer'),
    COALESCE(NEW.raw_user_meta_data->>'badge_id', 'INSP-' || SUBSTRING(NEW.id::text, 1, 6)),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'inspector'::app_role),
    COALESCE(NEW.raw_user_meta_data->>'station_or_lab', 'Bhopal Central Police Station')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. CASES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  section_ipc_bns TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'Active',
  priority case_priority NOT NULL DEFAULT 'Normal',
  complainant_name TEXT,
  police_station TEXT NOT NULL DEFAULT 'Bhopal Central Police Station',
  investigating_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_legal_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_forensic_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  summary TEXT,
  incident_date TIMESTAMPTZ,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_date TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 4. DOCUMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type doc_classification NOT NULL DEFAULT 'Other',
  storage_bucket TEXT NOT NULL DEFAULT 'case-documents',
  storage_path TEXT NOT NULL UNIQUE,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  file_format TEXT NOT NULL DEFAULT 'pdf',
  sha256_hash TEXT NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'Verified',
  legal_review_status legal_review_status NOT NULL DEFAULT 'Pending Review',
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  issuing_authority TEXT DEFAULT 'Bhopal Police',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 5. EVIDENCE TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_tag TEXT UNIQUE NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  evidence_type evidence_category NOT NULL DEFAULT 'Physical',
  description TEXT NOT NULL,
  seizure_memo_ref TEXT,
  seal_number TEXT NOT NULL,
  condition_notes TEXT,
  collected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  collection_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_custodian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_location TEXT NOT NULL DEFAULT 'Station Malkhana Vault Room #2',
  verification_status verification_status NOT NULL DEFAULT 'Verified',
  examination_status exam_status NOT NULL DEFAULT 'Pending Examination',
  sha256_hash TEXT,
  status TEXT NOT NULL DEFAULT 'Secured',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 6. CHAIN OF CUSTODY TRANSFERS TABLE (Append-Only)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chain_of_custody_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE RESTRICT,
  step_number INTEGER NOT NULL,
  from_custodian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_custodian_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  transfer_reason TEXT NOT NULL,
  authority_memo_ref TEXT,
  seal_intact BOOLEAN NOT NULL DEFAULT true,
  transfer_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  previous_block_hash TEXT,
  block_hash TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to prevent any UPDATE or DELETE on chain_of_custody_transfers
CREATE OR REPLACE FUNCTION public.prevent_custody_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Chain of Custody is immutable. Historical transfers cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_protect_custody_integrity
  BEFORE UPDATE OR DELETE ON public.chain_of_custody_transfers
  FOR EACH ROW EXECUTE FUNCTION public.prevent_custody_tampering();

-- =============================================================================
-- 7. FORENSIC REPORTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.forensic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT UNIQUE NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE RESTRICT,
  examiner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  report_type forensic_discipline NOT NULL,
  status forensic_report_status NOT NULL DEFAULT 'Draft',
  laboratory_division TEXT NOT NULL DEFAULT 'Regional Forensic Science Laboratory, Bhopal',
  examination_details TEXT,
  findings_summary TEXT,
  conclusive_opinion TEXT NOT NULL,
  statutory_certificate TEXT DEFAULT 'Form IV Section 45 IEA / Sec 39 BSA',
  hash_signature TEXT,
  signed_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 8. CHARGE SHEETS & ACCUSED TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.charge_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_sheet_number TEXT UNIQUE NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  investigating_officer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_prosecutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status charge_sheet_status NOT NULL DEFAULT 'Draft',
  investigation_summary TEXT,
  applicable_charges TEXT[] NOT NULL DEFAULT '{}',
  court_name TEXT NOT NULL DEFAULT 'Court of Chief Judicial Magistrate, Bhopal',
  court_docket_no TEXT,
  scrutiny_notes TEXT,
  filed_date TIMESTAMPTZ,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.charge_sheet_accused (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_sheet_id UUID NOT NULL REFERENCES public.charge_sheets(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  alias TEXT,
  custody_status accused_custody_status NOT NULL DEFAULT 'In Custody',
  arrest_date DATE,
  charges_attributed TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 9. COURT FILINGS & JUNCTION TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.court_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_number TEXT UNIQUE NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  filing_type court_filing_type NOT NULL DEFAULT 'Charge Sheet',
  title TEXT NOT NULL,
  court_name TEXT NOT NULL,
  judge_name TEXT,
  docket_number TEXT,
  status court_filing_status NOT NULL DEFAULT 'Filed',
  filing_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_hearing_date DATE,
  next_hearing_time TIME,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_withdrawn BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.court_filing_documents (
  filing_id UUID NOT NULL REFERENCES public.court_filings(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  annexure_label TEXT NOT NULL DEFAULT 'Annexure',
  PRIMARY KEY (filing_id, document_id)
);

-- =============================================================================
-- 10. AUDIT LOGS TABLE (Append-Only)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'System',
  action TEXT NOT NULL,
  module audit_module NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  evidence_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  result audit_result NOT NULL DEFAULT 'Success',
  description TEXT NOT NULL,
  event_payload JSONB DEFAULT '{}',
  record_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to prevent any UPDATE or DELETE on audit_logs
CREATE OR REPLACE FUNCTION public.prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. Audit entries cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_protect_audit_integrity
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_tampering();

-- =============================================================================
-- 11. INDEXES FOR HIGH-FREQUENCY QUERIES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_cases_case_number ON public.cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_status_io ON public.cases(status, investigating_officer_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_sha256 ON public.documents(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_tag ON public.evidence(evidence_tag);
CREATE INDEX IF NOT EXISTS idx_custody_evidence_id ON public.chain_of_custody_transfers(evidence_id);
CREATE INDEX IF NOT EXISTS idx_forensic_case_id ON public.forensic_reports(case_id);
CREATE INDEX IF NOT EXISTS idx_forensic_evidence_id ON public.forensic_reports(evidence_id);
CREATE INDEX IF NOT EXISTS idx_charge_sheets_case_id ON public.charge_sheets(case_id);
CREATE INDEX IF NOT EXISTS idx_court_filings_case_id ON public.court_filings(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.audit_logs(module);

-- =============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chain_of_custody_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charge_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charge_sheet_accused ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_filing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.get_auth_role() = 'admin');

CREATE POLICY "Admins have full profile management"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- CASES POLICIES
CREATE POLICY "Cases readable by authenticated roles"
  ON public.cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Inspectors and Admins can create cases"
  ON public.cases FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() IN ('inspector', 'admin'));

CREATE POLICY "Assigned officers and Admins can update cases"
  ON public.cases FOR UPDATE
  TO authenticated
  USING (
    investigating_officer_id = auth.uid() OR
    assigned_legal_officer_id = auth.uid() OR
    public.get_auth_role() = 'admin'
  );

-- DOCUMENTS POLICIES
CREATE POLICY "Documents viewable by authenticated users"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Inspectors, Forensic Officers, and Admins can upload docs"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() IN ('inspector', 'forensic_officer', 'admin'));

-- EVIDENCE POLICIES
CREATE POLICY "Evidence viewable by authenticated users"
  ON public.evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Inspectors and Admins can log evidence"
  ON public.evidence FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() IN ('inspector', 'admin'));

CREATE POLICY "Custodians, Forensic Officers and Admins can update evidence"
  ON public.evidence FOR UPDATE
  TO authenticated
  USING (
    current_custodian_id = auth.uid() OR
    public.get_auth_role() IN ('forensic_officer', 'admin')
  );

-- CHAIN OF CUSTODY POLICIES (Append-only)
CREATE POLICY "Custody records readable by authenticated users"
  ON public.chain_of_custody_transfers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Officers can append custody transfers"
  ON public.chain_of_custody_transfers FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() IN ('inspector', 'forensic_officer', 'admin'));

-- FORENSIC REPORTS POLICIES
CREATE POLICY "Forensic reports readable by authenticated users"
  ON public.forensic_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Forensic officers can draft and manage reports"
  ON public.forensic_reports FOR ALL
  TO authenticated
  USING (public.get_auth_role() IN ('forensic_officer', 'admin'));

-- CHARGE SHEETS POLICIES
CREATE POLICY "Charge sheets readable by authenticated users"
  ON public.charge_sheets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Inspectors and Admins can create charge sheets"
  ON public.charge_sheets FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() IN ('inspector', 'admin'));

CREATE POLICY "Inspectors, Prosecutors and Admins can update charge sheets"
  ON public.charge_sheets FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() IN ('inspector', 'legal_officer', 'admin'));

-- COURT FILINGS POLICIES
CREATE POLICY "Court filings readable by authenticated users"
  ON public.court_filings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Legal officers, Inspectors and Admins can manage filings"
  ON public.court_filings FOR ALL
  TO authenticated
  USING (public.get_auth_role() IN ('legal_officer', 'inspector', 'admin'));

-- AUDIT LOGS POLICIES (Append-only)
CREATE POLICY "Audit logs readable by authenticated users"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System and officers can append audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================================================
-- 13. SUPABASE STORAGE BUCKETS CONFIGURATION
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('case-documents', 'case-documents', false),
  ('evidence-vault', 'evidence-vault', false),
  ('forensic-reports', 'forensic-reports', false),
  ('court-filings', 'court-filings', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
CREATE POLICY "Authenticated users can read case documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'case-documents');

CREATE POLICY "Officers can upload case documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'case-documents');

CREATE POLICY "Authenticated users can read evidence vault"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'evidence-vault');

CREATE POLICY "Officers can upload evidence files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'evidence-vault');
