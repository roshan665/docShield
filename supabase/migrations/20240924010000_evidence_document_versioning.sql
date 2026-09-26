-- =============================================================================
-- DocShield Database Migration: Evidence & Document Historical Versioning
-- Migration ID: 20240924010000_evidence_document_versioning.sql
-- Purpose: Establishes immutable append-only version ledgers for evidence & documents,
--          adds strict 64-char hexadecimal SHA-256 constraints, and protects history.
-- =============================================================================

-- 1. ENHANCE CURRENT EVIDENCE TABLE
ALTER TABLE public.evidence
  ADD COLUMN IF NOT EXISTS current_version INTEGER NOT NULL DEFAULT 1 CHECK (current_version > 0),
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'application/octet-stream',
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;

-- 2. ENHANCE CURRENT DOCUMENTS TABLE
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS current_version INTEGER NOT NULL DEFAULT 1 CHECK (current_version > 0);

-- 3. ENFORCE CRYPTOGRAPHIC SHA-256 FORMAT (64 Hex Characters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_evidence_sha256_hex'
  ) THEN
    ALTER TABLE public.evidence 
      ADD CONSTRAINT chk_evidence_sha256_hex 
      CHECK (sha256_hash IS NULL OR sha256_hash ~* '^[a-f0-9]{64}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_documents_sha256_hex'
  ) THEN
    ALTER TABLE public.documents 
      ADD CONSTRAINT chk_documents_sha256_hex 
      CHECK (sha256_hash ~* '^[a-f0-9]{64}$');
  END IF;
END $$;

-- =============================================================================
-- 4. EVIDENCE VERSIONS TABLE (Immutable Ledger)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.evidence_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
  sha256_hash TEXT NOT NULL CHECK (sha256_hash ~* '^[a-f0-9]{64}$'),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_reason TEXT NOT NULL DEFAULT 'Initial Exhibit Seizure Deposition',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_evidence_version UNIQUE (evidence_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_evidence_versions_evidence_id 
  ON public.evidence_versions(evidence_id, version_number DESC);

-- =============================================================================
-- 5. DOCUMENT VERSIONS TABLE (Immutable Ledger)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
  sha256_hash TEXT NOT NULL CHECK (sha256_hash ~* '^[a-f0-9]{64}$'),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_reason TEXT NOT NULL DEFAULT 'Initial Document Filing',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_document_version UNIQUE (document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id 
  ON public.document_versions(document_id, version_number DESC);

-- =============================================================================
-- 6. IMMUTABILITY TRIGGERS (Block UPDATE and DELETE on Versions)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.prevent_version_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Version history is immutable. Historical version snapshots cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_evidence_versions ON public.evidence_versions;
CREATE TRIGGER trg_protect_evidence_versions
  BEFORE UPDATE OR DELETE ON public.evidence_versions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_tampering();

DROP TRIGGER IF EXISTS trg_protect_document_versions ON public.document_versions;
CREATE TRIGGER trg_protect_document_versions
  BEFORE UPDATE OR DELETE ON public.document_versions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_version_tampering();

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) FOR VERSION TABLES
-- =============================================================================

ALTER TABLE public.evidence_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Evidence versions readable by authenticated users
DROP POLICY IF EXISTS "Evidence versions readable by authenticated users" ON public.evidence_versions;
CREATE POLICY "Evidence versions readable by authenticated users"
  ON public.evidence_versions FOR SELECT
  TO authenticated
  USING (true);

-- Only authorized roles can insert evidence versions
DROP POLICY IF EXISTS "Authorized roles can insert evidence versions" ON public.evidence_versions;
CREATE POLICY "Authorized roles can insert evidence versions"
  ON public.evidence_versions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() IN ('inspector', 'forensic_officer', 'admin'));

-- Document versions readable by authenticated users
DROP POLICY IF EXISTS "Document versions readable by authenticated users" ON public.document_versions;
CREATE POLICY "Document versions readable by authenticated users"
  ON public.document_versions FOR SELECT
  TO authenticated
  USING (true);

-- Authorized roles can insert document versions
DROP POLICY IF EXISTS "Authorized roles can insert document versions" ON public.document_versions;
CREATE POLICY "Authorized roles can insert document versions"
  ON public.document_versions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() IN ('inspector', 'forensic_officer', 'admin', 'legal_officer'));
