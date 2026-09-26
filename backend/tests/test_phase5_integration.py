import io
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.app.core.permissions import Role
from backend.app.main import app
from backend.app.schemas.auth import AuthenticatedUser, UserProfile


@pytest.fixture
def test_client():
    return TestClient(app)


def make_auth_user(uid: str, role: Role, name: str, badge: str = "B-101") -> AuthenticatedUser:
    return AuthenticatedUser(
        id=uid,
        email=f"{role.value}@docshield.gov.in",
        role=role,
        full_name=name,
        badge_id=badge,
        department="Police Department",
        profile=UserProfile(
            id=uid,
            email=f"{role.value}@docshield.gov.in",
            role=role,
            full_name=name,
            badge_id=badge,
            department="Police Department"
        )
    )


@pytest.fixture
def mock_auth_admin():
    user = make_auth_user("admin-1", Role.ADMIN, "Admin Officer")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        yield user


@pytest.fixture
def mock_auth_inspector():
    user = make_auth_user("insp-1", Role.INSPECTOR, "Inspector Rajesh Kumar")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        yield user


@pytest.fixture
def mock_auth_legal():
    user = make_auth_user("legal-1", Role.LEGAL_OFFICER, "Prosecutor Arvind Joshi")
    with patch("backend.app.api.dependencies.auth_service.authenticate_token", return_value=user):
        yield user


# =========================================================================
# 1. CASE API TESTS
# =========================================================================

def test_list_cases(test_client, mock_auth_inspector):
    mock_cases = [
        {"id": "case-uuid-1", "case_number": "#2024-1768", "title": "Homicide Case", "status": "Active", "investigating_officer_id": "insp-1"}
    ]
    with patch("backend.app.services.case_service.case_service.list_cases", return_value=mock_cases):
        resp = test_client.get("/api/v1/cases", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["case_number"] == "#2024-1768"


def test_get_case_details(test_client, mock_auth_inspector):
    mock_case = {"id": "case-uuid-1", "case_number": "#2024-1768", "title": "Homicide Case", "status": "Active"}
    with patch("backend.app.services.case_service.case_service.get_case", return_value=mock_case):
        resp = test_client.get("/api/v1/cases/%232024-1768", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        assert resp.json()["data"]["title"] == "Homicide Case"



def test_create_case_inspector_authorized(test_client, mock_auth_inspector):
    created_case = {
        "id": "case-uuid-new",
        "case_number": "#2024-9999",
        "title": "Robbery Investigation",
        "section_ipc_bns": "IPC 392 - Robbery",
        "status": "Active",
        "priority": "High"
    }
    with patch("backend.app.services.case_service.case_service.create_case", return_value=created_case):
        payload = {
            "title": "Robbery Investigation",
            "section_ipc_bns": "IPC 392 - Robbery",
            "status": "Active",
            "priority": "High"
        }
        resp = test_client.post("/api/v1/cases", json=payload, headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 201
        assert resp.json()["data"]["case_number"] == "#2024-9999"


def test_create_case_unauthorized_role_rejected(test_client, mock_auth_legal):
    # Legal officer cannot register FIR/cases
    payload = {"title": "Illegal Attempt", "section_ipc_bns": "IPC 420"}
    resp = test_client.post("/api/v1/cases", json=payload, headers={"Authorization": "Bearer test-token"})
    assert resp.status_code == 403


# =========================================================================
# 2. DOCUMENT API TESTS
# =========================================================================

def test_list_documents(test_client, mock_auth_inspector):
    mock_docs = [
        {"id": "doc-uuid-1", "document_name": "FIR_2024.pdf", "document_type": "FIR", "sha256_hash": "a" * 64, "verification_status": "Verified"}
    ]
    with patch("backend.app.services.document_service.document_service.list_documents", return_value=mock_docs):
        resp = test_client.get("/api/v1/documents", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 1


def test_upload_document(test_client, mock_auth_inspector):
    mock_doc = {
        "id": "doc-uuid-new",
        "case_id": "case-uuid-1",
        "document_name": "seizure_memo.pdf",
        "document_type": "Panchnama",
        "sha256_hash": "b" * 64,
        "verification_status": "Verified"
    }
    with patch("backend.app.services.document_service.document_service.create_document", return_value=mock_doc):
        files = {"file": ("seizure_memo.pdf", b"Simulated PDF content", "application/pdf")}
        data = {"case_id": "case-uuid-1", "document_type": "Panchnama"}
        resp = test_client.post("/api/v1/documents", files=files, data=data, headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 201
        assert resp.json()["data"]["document_name"] == "seizure_memo.pdf"


def test_document_download_signed_url(test_client, mock_auth_inspector):
    with patch("backend.app.services.document_service.document_service.get_document_download_url", return_value="https://storage.supabase.co/signed-url"):
        resp = test_client.get("/api/v1/documents/doc-1/download", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        assert "signed_url" in resp.json()["data"]


def test_update_document_review_status_legal_officer(test_client, mock_auth_legal):
    mock_updated = {"id": "doc-1", "legal_review_status": "Scrutiny Cleared"}
    with patch("backend.app.services.document_service.document_service.update_document_review_status", return_value=mock_updated):
        resp = test_client.patch(
            "/api/v1/documents/doc-1/review-status",
            json={"legal_review_status": "Scrutiny Cleared", "scrutiny_notes": "All signatures verified."},
            headers={"Authorization": "Bearer test-token"}
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["legal_review_status"] == "Scrutiny Cleared"


def test_verify_document_integrity(test_client, mock_auth_inspector):
    from backend.app.schemas.document import DocumentVerifyResponse
    verify_resp = DocumentVerifyResponse(
        document_id="doc-1",
        document_name="FIR.pdf",
        is_match=True,
        stored_hash="c" * 64,
        calculated_hash="c" * 64,
        integrity_status="Intact",
        verified_at="2026-09-24T10:00:00Z"
    )
    with patch("backend.app.services.document_service.document_service.verify_document_integrity", return_value=verify_resp):
        resp = test_client.post("/api/v1/documents/doc-1/verify", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        assert resp.json()["data"]["is_match"] is True


# =========================================================================
# 3. PROFILES / ADMIN API TESTS
# =========================================================================

def test_admin_list_profiles_authorized(test_client, mock_auth_admin):
    mock_profiles = [
        {"id": "usr-1", "full_name": "Admin", "role": "admin", "badge_id": "ADM-01"}
    ]
    with patch("backend.app.services.profile_service.profile_service.list_profiles", return_value=mock_profiles):
        resp = test_client.get("/api/v1/profiles", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 1


def test_inspector_forbidden_from_profiles(test_client, mock_auth_inspector):
    resp = test_client.get("/api/v1/profiles", headers={"Authorization": "Bearer test-token"})
    assert resp.status_code == 403


# =========================================================================
# 4. EVIDENCE EXTENSIONS
# =========================================================================

def test_list_evidence(test_client, mock_auth_inspector):
    mock_ev = [
        {"id": "ev-1", "evidence_tag": "EV-2024-001", "evidence_type": "Physical", "status": "Secured"}
    ]
    with patch("backend.app.services.evidence_service.evidence_service.list_evidence", return_value=mock_ev):
        resp = test_client.get("/api/v1/evidence", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 1


def test_evidence_download_url(test_client, mock_auth_inspector):
    with patch("backend.app.services.evidence_service.evidence_service.get_evidence_download_url", return_value="https://storage.supabase.co/signed-ev"):
        resp = test_client.get("/api/v1/evidence/ev-1/download", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        assert "signed_url" in resp.json()["data"]


def test_evidence_patch_status(test_client, mock_auth_inspector):
    mock_updated = {"id": "ev-1", "evidence_tag": "EV-2024-001", "status": "In Transit"}
    with patch("backend.app.services.evidence_service.evidence_service.update_evidence", return_value=mock_updated):
        resp = test_client.patch(
            "/api/v1/evidence/ev-1",
            json={"status": "In Transit", "current_location": "RFSL Lab Intake"},
            headers={"Authorization": "Bearer test-token"}
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["status"] == "In Transit"
