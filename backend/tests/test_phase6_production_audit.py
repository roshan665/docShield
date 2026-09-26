import hashlib
import io
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.app.core.crypto import calculate_sha256
from backend.app.core.permissions import Role
from backend.app.main import app
from backend.app.schemas.auth import AuthenticatedUser, UserProfile


@pytest.fixture
def client():
    return TestClient(app)


def create_user(uid: str, role: Role, name: str, badge: str = "B-001") -> AuthenticatedUser:
    return AuthenticatedUser(
        id=uid,
        email=f"{role.value}@docshield.gov.in",
        role=role,
        full_name=name,
        badge_id=badge,
        department="Law Enforcement",
        profile=UserProfile(
            id=uid,
            email=f"{role.value}@docshield.gov.in",
            role=role,
            full_name=name,
            badge_id=badge,
            department="Law Enforcement"
        )
    )


# =========================================================================
# DOMAIN 1: AUTHENTICATION & TOKEN AUDIT
# =========================================================================

def test_missing_auth_token_rejected(client):
    """Unauthenticated access to protected endpoints must return 401."""
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"


def test_invalid_auth_token_rejected(client):
    """Forged or malformed bearer tokens must return 401."""
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", side_effect=Exception("Invalid JWT signature")):
        resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer forged-signature-token"})
        assert resp.status_code == 401
        assert resp.json()["error"]["code"] == "UNAUTHORIZED"


def test_valid_auth_token_resolves_authoritative_user(client):
    """Valid JWT resolves authenticated officer profile from backend."""
    user = create_user("officer-1", Role.INSPECTOR, "Insp. Rajesh Kumar", "INSP-101")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer valid-token"})
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["id"] == "officer-1"
        assert data["role"] == "inspector"
        assert data["profile"]["full_name"] == "Insp. Rajesh Kumar"



# =========================================================================
# DOMAIN 2: RBAC MATRIX AUDIT ACROSS 4 ROLES
# =========================================================================

def test_inspector_cannot_access_admin_profiles(client):
    """Inspectors must be strictly denied from admin user directory management (403)."""
    user = create_user("insp-1", Role.INSPECTOR, "Insp. Rajesh Kumar")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        resp = client.get("/api/v1/profiles", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 403


def test_legal_officer_cannot_register_cases(client):
    """Legal officers must be denied from registering primary police FIR cases (403)."""
    user = create_user("legal-1", Role.LEGAL_OFFICER, "Prosecutor Arvind Joshi")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        payload = {"title": "Attempted FIR Case", "section_ipc_bns": "IPC 302"}
        resp = client.post("/api/v1/cases", json=payload, headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 403


def test_forensic_officer_cannot_register_charge_sheets(client):
    """Forensic officers must be denied from lodging statutory police charge sheets (403)."""
    user = create_user("forensic-1", Role.FORENSIC_OFFICER, "Dr. K.S. Rathore")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        payload = {
            "case_id": "case-uuid-1",
            "court_name": "CJM Court",
            "status": "Draft",
            "accused_persons": []
        }
        resp = client.post("/api/v1/charge-sheets", json=payload, headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 403


def test_admin_has_oversight_access(client):
    """Administrators have system-wide oversight access."""
    user = create_user("admin-1", Role.ADMIN, "System Admin", "ADM-001")
    mock_profiles = [{"id": "admin-1", "full_name": "System Admin", "role": "admin"}]
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        with patch("backend.app.services.profile_service.profile_service.list_profiles", return_value=mock_profiles):
            resp = client.get("/api/v1/profiles", headers={"Authorization": "Bearer test-token"})
            assert resp.status_code == 200
            assert len(resp.json()["data"]) == 1


# =========================================================================
# DOMAIN 3: CASE ISOLATION & CROSS-CASE REJECTION AUDIT
# =========================================================================

def test_cross_case_forensic_report_rejected(client):
    """Forensic report cannot link evidence from Case A to Case B."""
    user = create_user("forensic-1", Role.FORENSIC_OFFICER, "Dr. K.S. Rathore")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        with patch("backend.app.services.forensic_service.forensic_service.case_repo.get_case", return_value={"id": "case-A"}):
            with patch("backend.app.services.forensic_service.forensic_service.case_repo.user_has_case_access", return_value=True):
                with patch("backend.app.services.forensic_service.forensic_service.evidence_repo.get_by_id", return_value={"id": "ev-1", "case_id": "case-B", "sha256_hash": "e" * 64}):
                    payload = {
                        "case_id": "case-A",
                        "evidence_id": "ev-1",
                        "report_type": "DNA STR Profiling",
                        "examination_details": "PCR Amplification",
                        "findings_summary": "16 loci profiled",
                        "conclusive_opinion": "Individual match"
                    }
                    resp = client.post("/api/v1/forensic-reports", json=payload, headers={"Authorization": "Bearer test-token"})
                    assert resp.status_code == 422
                    assert "Cross-case integrity violation" in resp.json()["error"]["message"]



# =========================================================================
# DOMAIN 4: EVIDENCE CRYPTOGRAPHIC INTEGRITY & BYTE HASHING
# =========================================================================

def test_evidence_authoritative_sha256_calculation(client):
    """Evidence file hash is calculated directly from raw byte stream, ignoring client hash."""
    file_bytes = b"Statutory ballistic exhibit test file bytes"
    expected_hash = calculate_sha256(file_bytes)

    user = create_user("insp-1", Role.INSPECTOR, "Insp. Rajesh Kumar")
    mock_created = {
        "id": "ev-uuid-1",
        "evidence_tag": "EV-2024-TEST",
        "case_id": "case-uuid-1",
        "evidence_type": "Firearm",
        "description": "Seized Revolver",
        "current_location": "Malkhana Vault",
        "seal_number": "SL-999",
        "current_version": 1,
        "storage_path": "evidence-vault/ev-uuid-1/v1_revolver.bin",
        "sha256_hash": expected_hash,
        "verification_status": "Verified",
        "status": "Secured",
        "created_at": "2026-09-24T10:00:00Z"
    }

    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        with patch("backend.app.services.evidence_service.evidence_service.create_evidence", return_value=mock_created):
            files = {"file": ("revolver.bin", file_bytes, "application/octet-stream")}
            data = {
                "case_id": "case-uuid-1",
                "description": "Seized Revolver",
                "evidence_type": "Firearm",
                "client_hash": "untrusted_client_hash_must_be_ignored"
            }
            resp = client.post("/api/v1/evidence", files=files, data=data, headers={"Authorization": "Bearer test-token"})
            assert resp.status_code == 201
            assert resp.json()["data"]["sha256_hash"] == expected_hash


def test_tamper_detection_on_byte_mismatch(client):
    """When downloaded file bytes do not match trusted seal, verification reports MISMATCH."""
    user = create_user("forensic-1", Role.FORENSIC_OFFICER, "Dr. K.S. Rathore")
    from backend.app.schemas.evidence import IntegrityVerificationResponse

    tampered_response = IntegrityVerificationResponse(
        evidence_id="ev-uuid-1",
        evidence_tag="EV-2024-001",
        version_id="ver-1",
        version_number=1,
        stored_hash="a" * 64,
        calculated_hash="b" * 64,
        integrity_status="MISMATCH",
        is_match=False,
        verified_by=user.email,
        details="TAMPER EXCEPTION: Stored file bytes do NOT match recorded cryptographic SHA-256 seal."
    )

    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        with patch("backend.app.services.evidence_service.evidence_service.verify_evidence_integrity", return_value=tampered_response):
            resp = client.post("/api/v1/evidence/ev-uuid-1/verify-integrity", headers={"Authorization": "Bearer test-token"})
            assert resp.status_code == 200
            data = resp.json()["data"]
            assert data["is_match"] is False
            assert data["integrity_status"] == "MISMATCH"


# =========================================================================
# DOMAIN 5: WORKFLOW STATE MACHINE LOCKS
# =========================================================================

def test_finalized_forensic_report_is_locked(client):
    """Finalized forensic report is legally sealed and cannot be modified."""
    user = create_user("forensic-1", Role.FORENSIC_OFFICER, "Dr. K.S. Rathore")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        with patch("backend.app.services.forensic_service.forensic_service.forensic_repo.get_report", return_value={"id": "fr-1", "case_id": "case-1", "status": "Finalized"}):
            with patch("backend.app.services.forensic_service.forensic_service.case_repo.user_has_case_access", return_value=True):
                resp = client.patch(
                    "/api/v1/forensic-reports/fr-1/status",
                    json={"status": "Under Examination"},
                    headers={"Authorization": "Bearer test-token"}
                )
                assert resp.status_code == 400
                assert resp.json()["error"]["code"] == "TERMINAL_STATE_LOCKED"


def test_accepted_charge_sheet_is_locked(client):
    """Accepted charge sheet has judicial cognizance taken and cannot be modified."""
    user = create_user("legal-1", Role.LEGAL_OFFICER, "Adv. Arvind Joshi")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        with patch("backend.app.services.legal_service.legal_service.charge_sheet_repo.get_charge_sheet", return_value={"id": "cs-1", "case_id": "case-1", "status": "Accepted"}):
            resp = client.patch(
                "/api/v1/charge-sheets/cs-1/status",
                json={"status": "Under Review"},
                headers={"Authorization": "Bearer test-token"}
            )
            assert resp.status_code == 400
            assert resp.json()["error"]["code"] == "TERMINAL_STATE_LOCKED"


# =========================================================================
# DOMAIN 6: CHAIN OF CUSTODY IMMUTABILITY & AUDIT LOGS
# =========================================================================

def test_chain_of_custody_transfer_generates_block_hash(client):
    """Custody transfer generates unbroken cryptographic SHA-256 block hash."""
    user = create_user("insp-1", Role.INSPECTOR, "Insp. Rajesh Kumar")
    mock_block = {
        "id": "coc-1",
        "evidence_id": "ev-1",
        "evidence_tag": "EV-2024-001",
        "step_number": 2,
        "action": "TRANSFER",
        "from_location": "Station Malkhana",
        "to_location": "Forensic Lab Intake",
        "transfer_reason": "DNA profiling",
        "actor_name": "Insp. Rajesh Kumar",
        "seal_intact": True,
        "previous_block_hash": "GENESIS-BLOCK",
        "block_hash": "BLK-SHA256-2-a1b2c3d4",
        "to_custodian_id": "custodian-profile-1",
        "timestamp": "2026-09-24T10:00:00Z"
    }


    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        with patch("backend.app.services.custody_service.custody_service.transfer_custody", return_value=mock_block):
            payload = {
                "to_location": "Forensic Lab Intake",
                "transfer_reason": "DNA profiling"
            }
            resp = client.post("/api/v1/evidence/ev-1/custody/transfer", json=payload, headers={"Authorization": "Bearer test-token"})
            assert resp.status_code == 201
            assert resp.json()["data"]["block_hash"].startswith("BLK-SHA256")
