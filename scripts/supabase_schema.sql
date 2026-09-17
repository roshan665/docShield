-- =============================================================================
-- DocShield: Digital Evidence Management Platform
-- Target: Supabase PostgreSQL (Project: iwinomhcofhouapfirjo)
-- Idempotent: Safe to execute repeatedly in Supabase SQL Editor
-- =============================================================================

-- Enable pgvector for semantic document and evidence retrieval
CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

-- -----------------------------------------------------------------------------
-- 1. Roles & RBAC System
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_resource_action UNIQUE (resource, action)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- -----------------------------------------------------------------------------
-- 2. Users Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'NCRB Cyber Division',
    designation VARCHAR(100) DEFAULT 'Investigating Officer',
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. Cases & Case Membership
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(100) UNIQUE NOT NULL,
    fir_number VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'pending_legal', 'pending_review', 'submitted_to_court', 'closed', 'archived')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(100),
    police_station VARCHAR(150),
    district VARCHAR(100),
    state VARCHAR(100),
    investigating_officer_id UUID REFERENCES public.users(id),
    created_by UUID REFERENCES public.users(id),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_in_case VARCHAR(50) NOT NULL,
    added_by UUID REFERENCES public.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_case_user UNIQUE (case_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 4. Documents & Document Versions (Sec. 65B Electronic Records)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    current_version_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL,
    classification VARCHAR(50) DEFAULT 'internal',
    status VARCHAR(50) DEFAULT 'processed',
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_classification VARCHAR(100),
    ai_confidence FLOAT,
    ocr_text TEXT,
    summary TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    storage_bucket VARCHAR(100) NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    sanitized_filename VARCHAR(255) NOT NULL,
    change_reason TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id),
    is_original BOOLEAN DEFAULT FALSE,
    integrity_status VARCHAR(50) DEFAULT 'verified',
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_document_version UNIQUE (document_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.extracted_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_value TEXT NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    source VARCHAR(50) DEFAULT 'ai_extracted',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    confidence FLOAT DEFAULT 1.0,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. Evidence & Cryptographic Chain-of-Custody (BSA 2023)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id),
    evidence_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('digital_document', 'image', 'video', 'audio', 'device', 'forensic_artifact', 'physical_evidence', 'other')),
    status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'in_custody', 'in_analysis', 'analyzed', 'submitted_to_court', 'archived')),
    sensitivity_level VARCHAR(50) DEFAULT 'standard' CHECK (sensitivity_level IN ('standard', 'sensitive', 'highly_sensitive', 'confidential', 'secret', 'classified')),
    original_file_hash VARCHAR(64) NOT NULL,
    current_file_hash VARCHAR(64) NOT NULL,
    integrity_status VARCHAR(50) DEFAULT 'verified' CHECK (integrity_status IN ('verified', 'compromised', 'pending')),
    current_custodian_id UUID NOT NULL REFERENCES public.users(id),
    pending_custodian_id UUID REFERENCES public.users(id),
    transfer_pending BOOLEAN DEFAULT FALSE,
    transfer_reason TEXT,
    storage_key VARCHAR(500),
    storage_bucket VARCHAR(100),
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    collection_date TIMESTAMPTZ,
    collection_location VARCHAR(255),
    source VARCHAR(255),
    registered_by_id UUID NOT NULL REFERENCES public.users(id),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence_custody_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.cases(id),
    event_type VARCHAR(50) NOT NULL,
    from_user_id UUID REFERENCES public.users(id),
    to_user_id UUID NOT NULL REFERENCES public.users(id),
    reason TEXT NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    file_hash_at_event VARCHAR(64) NOT NULL,
    previous_event_hash VARCHAR(64) NOT NULL,
    event_hash VARCHAR(64) NOT NULL,
    acknowledgement_status VARCHAR(50) DEFAULT 'acknowledged',
    acknowledged_at TIMESTAMPTZ,
    event_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. Case Exports (Trial Dossier Packages)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    requested_by_id UUID NOT NULL REFERENCES public.users(id),
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    manifest_hash_sha256 VARCHAR(64) NOT NULL,
    integrity_status VARCHAR(50) DEFAULT 'verified',
    export_status VARCHAR(50) DEFAULT 'completed',
    verification_summary TEXT,
    manifest_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. Audit Ledger (Append-Only SHA-256 Chained)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    case_id UUID REFERENCES public.cases(id),
    details JSONB DEFAULT '{}',
    result VARCHAR(50) DEFAULT 'SUCCESS',
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    session_id VARCHAR(100),
    previous_event_hash VARCHAR(64) NOT NULL,
    event_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. Security Events & Tamper Incidents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES public.users(id),
    case_id UUID REFERENCES public.cases(id),
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    details JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) optionally
-- ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
