import io
import pytest
from unittest.mock import MagicMock
from fastapi import status
from fastapi.testclient import TestClient

from backend.app.core.crypto import calculate_sha256, verify_sha256
from backend.app.core.permissions import Role
from backend.app.main import app
from backend.app.services.evidence_service import EvidenceService
from backend.app.schemas.auth import AuthenticatedUser, UserProfile


@pytest.fixture
def mock_storage():
    """
    In-memory mock for Supabase Storage
    """
    storage_dict = {}

    mock = MagicMock()

    def upload_file_bytes(bucket, path, file_bytes, content_type="application/octet-stream"):
        storage_dict[f"{bucket}/{path}"] = file_bytes
        return {"bucket": bucket, "path": path}

    def download_file_bytes(bucket, path):
        key = f"{bucket}/{path}"
        if key not in storage_dict:
            raise RuntimeError(f"Object {path} not found in {bucket}")
        return storage_dict[key]

    def delete_file(bucket, path):
        key = f"{bucket}/{path}"
        if key in storage_dict:
            del storage_dict[key]
        return True

    mock.upload_file_bytes.side_effect = upload_file_bytes
    mock.download_file_bytes.side_effect = download_file_bytes
    mock.delete_file.side_effect = delete_file
    mock._storage_dict = storage_dict
    return mock


@pytest.fixture
def isolated_service(mock_storage):
    """
    Provides an isolated EvidenceService instance with memory repositories
    """
    evidence_db = {}
    version_db = {}
    custody_db = []
    audit_db = []
    cases_db = {
        "case-uuid-1": {
            "id": "case-uuid-1",
            "case_number": "#2024-1768",
            "title": "State v. Vikram Patel",
            "investigating_officer_id": "usr_insp_123"
        },
        "case-uuid-restricted": {
            "id": "case-uuid-restricted",
            "case_number": "#2024-9999",
            "title": "Restricted High Priority Case",
            "investigating_officer_id": "usr_other_officer"
        }
    }

    # Evidence Repo Mock
    ev_repo = MagicMock()
    def get_ev_by_id(eid):
        return evidence_db.get(eid)
    def get_ev_by_tag(tag):
        for e in evidence_db.values():
            if e.get("evidence_tag") == tag:
                return e
        return None
    def create_ev(payload):
        evidence_db[payload["id"]] = payload.copy()
        return payload
    def update_ver_meta(evidence_id, current_version, storage_path, sha256_hash, file_size_bytes, mime_type="application/octet-stream"):
        if evidence_id in evidence_db:
            evidence_db[evidence_id]["current_version"] = current_version
            evidence_db[evidence_id]["storage_path"] = storage_path
            evidence_db[evidence_id]["sha256_hash"] = sha256_hash
            evidence_db[evidence_id]["file_size_bytes"] = file_size_bytes
            evidence_db[evidence_id]["mime_type"] = mime_type
            return evidence_db[evidence_id]
        return None
    def update_verification_status(evidence_id, status_val):
        if evidence_id in evidence_db:
            evidence_db[evidence_id]["verification_status"] = status_val
            return evidence_db[evidence_id]
        return None
    def delete_ev(evidence_id):
        if evidence_id in evidence_db:
            del evidence_db[evidence_id]
            return True
        return False

    ev_repo.get_by_id.side_effect = get_ev_by_id
    ev_repo.get_by_tag.side_effect = get_ev_by_tag
    ev_repo.create_evidence.side_effect = create_ev
    ev_repo.update_current_version_metadata.side_effect = update_ver_meta
    ev_repo.update_verification_status.side_effect = update_verification_status
    ev_repo.delete_evidence.side_effect = delete_ev

    # Version Repo Mock
    ver_repo = MagicMock()
    def create_ver(payload):
        vid = f"ver-uuid-{len(version_db) + 1}"
        record = payload.copy()
        record["id"] = vid
        record["created_at"] = "2026-09-24T10:00:00Z"
        version_db[vid] = record
        return record
    def list_vers(evidence_id):
        vers = [v for v in version_db.values() if v.get("evidence_id") == evidence_id]
        return sorted(vers, key=lambda x: x["version_number"], reverse=True)
    def get_ver_num(evidence_id, num):
        for v in version_db.values():
            if v.get("evidence_id") == evidence_id and v.get("version_number") == num:
                return v
        return None
    def get_ver_by_id(vid):
        return version_db.get(vid)
    def get_latest_ver(evidence_id):
        vers = list_vers(evidence_id)
        return vers[0] if vers else None

    ver_repo.create_version.side_effect = create_ver
    ver_repo.list_versions_for_evidence.side_effect = list_vers
    ver_repo.get_version_by_number.side_effect = get_ver_num
    ver_repo.get_by_id.side_effect = get_ver_by_id
    ver_repo.get_latest_version.side_effect = get_latest_ver

    # Case Repo Mock
    case_repo = MagicMock()
    def mock_get_case(cid):
        if cid in cases_db:
            return cases_db[cid]
        for c in cases_db.values():
            if c.get("case_number") == cid or c.get("case_number") == f"#{cid}":
                return c
        return None
    case_repo.get_case.side_effect = mock_get_case
    case_repo.get_by_id.side_effect = lambda cid: cases_db.get(cid)
    case_repo.get_by_case_number.side_effect = lambda cnum: next((c for c in cases_db.values() if c["case_number"] == cnum), None)
    def has_access(cid, uid, role):
        if role in (Role.ADMIN, Role.LEGAL_OFFICER, Role.FORENSIC_OFFICER):
            return True
        c = cases_db.get(cid)
        if not c:
            return False
        return role == Role.INSPECTOR and (c.get("investigating_officer_id") == uid or cid != "case-uuid-restricted")
    case_repo.user_has_case_access.side_effect = has_access

    # Custody Repo Mock
    custody_repo = MagicMock()
    def append_transfer(**kwargs):
        custody_db.append(kwargs)
        return kwargs
    custody_repo.append_transfer.side_effect = append_transfer
    custody_repo.get_latest_transfer.side_effect = lambda eid: next((c for c in reversed(custody_db) if c.get("evidence_id") == eid), None)

    # Audit Repo Mock
    audit_repo = MagicMock()
    def append_log(**kwargs):
        audit_db.append(kwargs)
        return kwargs
    audit_repo.append_log.side_effect = append_log

    service = EvidenceService(
        evidence_repo=ev_repo,
        version_repo=ver_repo,
        case_repo=case_repo,
        custody_repo=custody_repo,
        audit_repo=audit_repo,
        storage=mock_storage
    )
    service._evidence_db = evidence_db
    service._version_db = version_db
    service._custody_db = custody_db
    service._audit_db = audit_db
    return service


# =============================================================================
# A. HASHING TESTS
# =============================================================================

def test_hashing_known_vectors():
    empty_bytes = b""
    expected_empty = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert calculate_sha256(empty_bytes) == expected_empty

    text_bytes = b"DocShield Evidence Seizure Integrity Test Payload 2026"
    digest = calculate_sha256(text_bytes)
    assert len(digest) == 64
    assert digest == calculate_sha256(text_bytes)

    # Different bytes produce different digests
    digest2 = calculate_sha256(b"Different evidence bytes")
    assert digest != digest2


# =============================================================================
# B. EVIDENCE CREATION TESTS
# =============================================================================

def test_evidence_creation_authorized_inspector(isolated_service, mock_inspector_user):
    file_bytes = b"FORENSIC BALLISTIC EXAM: 9mm Spent Cartridge Exhibit"
    fake_client_hash = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

    result = isolated_service.create_evidence(
        case_id="case-uuid-1",
        description="Spent 9mm cartridge casing recovered from crime scene",
        file_bytes=file_bytes,
        original_filename="cartridge_scene_01.jpg",
        current_user=mock_inspector_user,
        evidence_type="Ammunition",
        client_provided_hash=fake_client_hash  # Must be ignored!
    )

    # 1. Authoritative hash matches actual bytes, NOT fake client hash
    actual_hash = calculate_sha256(file_bytes)
    assert result.sha256_hash == actual_hash
    assert result.sha256_hash != fake_client_hash
    assert result.current_version == 1
    assert result.verification_status == "Verified"

    # 2. Server-generated storage path
    assert "cases/case-uuid-1/evidence/" in result.storage_path
    assert "/v1/cartridge_scene_01.jpg" in result.storage_path

    # 3. File was deposited in storage
    stored_bytes = isolated_service.storage.download_file_bytes("evidence-vault", result.storage_path)
    assert stored_bytes == file_bytes

    # 4. Version 1 recorded in ledger
    versions = isolated_service.version_repo.list_versions_for_evidence(result.id)
    assert len(versions) == 1
    assert versions[0]["version_number"] == 1
    assert versions[0]["sha256_hash"] == actual_hash

    # 5. Genesis Custody recorded
    assert len(isolated_service._custody_db) == 1
    assert isolated_service._custody_db[0]["evidence_id"] == result.id

    # 6. Audit log recorded
    assert len(isolated_service._audit_db) == 1
    assert isolated_service._audit_db[0]["action"] == "EVIDENCE_CREATED"
    assert isolated_service._audit_db[0]["user_id"] == mock_inspector_user.id


def test_evidence_creation_unauthorized_role(isolated_service, mock_legal_user):
    # Legal officer cannot register initial evidence exhibits
    with pytest.raises(Exception) as excinfo:
        isolated_service.create_evidence(
            case_id="case-uuid-1",
            description="Unauthorized legal evidence creation attempt",
            file_bytes=b"Some test bytes",
            original_filename="doc.pdf",
            current_user=mock_legal_user
        )
    assert "Forbidden" in str(type(excinfo.value).__name__) or "403" in str(excinfo.value)


def test_evidence_creation_empty_file_rejected(isolated_service, mock_inspector_user):
    with pytest.raises(Exception) as excinfo:
        isolated_service.create_evidence(
            case_id="case-uuid-1",
            description="Empty file",
            file_bytes=b"",
            original_filename="empty.dat",
            current_user=mock_inspector_user
        )
    assert "ValidationException" in str(type(excinfo.value).__name__)


# =============================================================================
# C. VERSIONING TESTS
# =============================================================================

def test_evidence_versioning_lifecycle(isolated_service, mock_inspector_user, mock_forensic_user):
    # 1. Create Initial Version 1
    v1_bytes = b"Initial exhibit photo v1"
    ev = isolated_service.create_evidence(
        case_id="case-uuid-1",
        description="Fibers seized from vehicle",
        file_bytes=v1_bytes,
        original_filename="fiber_scan.png",
        current_user=mock_inspector_user
    )
    v1_hash = calculate_sha256(v1_bytes)
    assert ev.current_version == 1

    # 2. Forensic Officer uploads Version 2 (high resolution microscopic scan)
    v2_bytes = b"High-res stereomicroscopy analysis v2 with polarized light filters"
    v2_record = isolated_service.create_evidence_version(
        evidence_id=ev.id,
        file_bytes=v2_bytes,
        original_filename="fiber_polar_scan_v2.png",
        change_reason="Re-scanned under polarizing microscope at 400x magnification",
        current_user=mock_forensic_user
    )
    v2_hash = calculate_sha256(v2_bytes)

    assert v2_record.version_number == 2
    assert v2_record.sha256_hash == v2_hash
    assert "/v2/fiber_polar_scan_v2.png" in v2_record.storage_path

    # Active evidence pointer now points to version 2
    ev_updated = isolated_service.evidence_repo.get_by_id(ev.id)
    assert ev_updated["current_version"] == 2
    assert ev_updated["sha256_hash"] == v2_hash

    # 3. Forensic Officer uploads Version 3 (Spectrophotometry assay)
    v3_bytes = b"Micro-spectrophotometry spectral absorbance curves v3"
    v3_record = isolated_service.create_evidence_version(
        evidence_id=ev.id,
        file_bytes=v3_bytes,
        original_filename="fiber_spectra_v3.dat",
        change_reason="Spectral absorbance curve comparison completed",
        current_user=mock_forensic_user
    )
    v3_hash = calculate_sha256(v3_bytes)
    assert v3_record.version_number == 3
    assert v3_record.sha256_hash == v3_hash

    # Check complete version ledger: should contain all 3 snapshots permanently
    history = isolated_service.get_version_history(ev.id)
    assert len(history) == 3
    assert [h.version_number for h in history] == [3, 2, 1]

    # Verify historical hashes and storage paths remain untouched
    v1_hist = next(h for h in history if h.version_number == 1)
    v2_hist = next(h for h in history if h.version_number == 2)
    v3_hist = next(h for h in history if h.version_number == 3)
    assert v1_hist.sha256_hash == v1_hash
    assert v2_hist.sha256_hash == v2_hash
    assert v3_hist.sha256_hash == v3_hash

    # 4. Duplicate upload rejection test: uploading identical bytes rejected as 409
    with pytest.raises(Exception) as excinfo:
        isolated_service.create_evidence_version(
            evidence_id=ev.id,
            file_bytes=v3_bytes,  # Same as v3
            original_filename="duplicate.dat",
            change_reason="Duplicate upload attempt",
            current_user=mock_forensic_user
        )
    assert getattr(excinfo.value, "code", "") == "IDENTICAL_VERSION_REJECTED" or getattr(excinfo.value, "status_code", 0) == 409


# =============================================================================
# D. INTEGRITY & TAMPER DETECTION TESTS
# =============================================================================

def test_integrity_verification_match(isolated_service, mock_inspector_user):
    file_bytes = b"Authentic untampered weapon ballistic measurement dataset"
    ev = isolated_service.create_evidence(
        case_id="case-uuid-1",
        description="Pistol .32 Bore",
        file_bytes=file_bytes,
        original_filename="ballistics.dat",
        current_user=mock_inspector_user
    )

    # Run byte-level verification
    res = isolated_service.verify_evidence_integrity(ev.id, current_user=mock_inspector_user)
    assert res.integrity_status == "VERIFIED"
    assert res.is_match is True
    assert res.stored_hash == calculate_sha256(file_bytes)
    assert res.calculated_hash == calculate_sha256(file_bytes)

    # Audit log reflects success
    verified_logs = [l for l in isolated_service._audit_db if l["action"] == "EVIDENCE_INTEGRITY_VERIFIED"]
    assert len(verified_logs) >= 1


def test_tamper_detection_mismatch(isolated_service, mock_inspector_user):
    original_bytes = b"Original legitimate digital surveillance footage recording"
    ev = isolated_service.create_evidence(
        case_id="case-uuid-1",
        description="CCTV footage drive",
        file_bytes=original_bytes,
        original_filename="cctv_ch1.mp4",
        current_user=mock_inspector_user
    )
    original_hash = ev.sha256_hash

    # Simulate unauthorized tampering in storage vault behind the scenes
    tampered_bytes = b"TAMPERED CORRUPTED DATA: malicious attacker modified the footage!"
    isolated_service.storage._storage_dict[f"evidence-vault/{ev.storage_path}"] = tampered_bytes

    # Run byte-level verification
    res = isolated_service.verify_evidence_integrity(ev.id, current_user=mock_inspector_user)

    # 1. Must flag as MISMATCH
    assert res.integrity_status == "MISMATCH"
    assert res.is_match is False
    assert res.stored_hash == original_hash  # Original trusted hash PRESERVED!
    assert res.calculated_hash == calculate_sha256(tampered_bytes)

    # 2. Database verification status marked as 'Tampered'
    ev_db = isolated_service.evidence_repo.get_by_id(ev.id)
    assert ev_db["verification_status"] == "Tampered"

    # 3. High-priority security audit event generated
    tamper_logs = [l for l in isolated_service._audit_db if l["action"] == "EVIDENCE_INTEGRITY_MISMATCH"]
    assert len(tamper_logs) == 1
    assert tamper_logs[0]["result"] == "Failure"
    assert tamper_logs[0]["module"] == "Security"


# =============================================================================
# E. SECURITY & CROSS-CASE ACCESS TESTS
# =============================================================================

def test_cross_case_unauthorized_access(isolated_service, mock_inspector_user):
    # Inspector trying to deposit evidence in a restricted case where they have no jurisdiction
    with pytest.raises(Exception) as excinfo:
        isolated_service.create_evidence(
            case_id="case-uuid-restricted",
            description="Attempted cross-case insertion",
            file_bytes=b"Unauthorized payload",
            original_filename="memo.pdf",
            current_user=mock_inspector_user
        )
    assert "Forbidden" in str(type(excinfo.value).__name__) or "403" in str(excinfo.value)


# =============================================================================
# F. FASTAPI HTTP ROUTE INTEGRATION TESTS
# =============================================================================

def test_api_evidence_upload_and_verification_routes(client, mock_inspector_user, isolated_service, monkeypatch):
    from backend.app.api.dependencies import get_current_user
    monkeypatch.setattr("backend.app.api.routes.evidence.evidence_service", isolated_service)
    app.dependency_overrides[get_current_user] = lambda: mock_inspector_user

    try:
        # 1. Test POST /api/v1/evidence
        file_content = b"Binary exhibit file content for HTTP route testing"
        response = client.post(
            "/api/v1/evidence",
            data={
                "case_id": "#2024-1768",
                "description": "Seized knife with blood residue",
                "evidence_type": "Physical",
                "seal_number": "SEAL-TEST-888"
            },
            files={"file": ("knife_photo.jpg", io.BytesIO(file_content), "image/jpeg")}
        )
        assert response.status_code == status.HTTP_201_CREATED
        body = response.json()
        assert body["success"] is True
        evidence_data = body["data"]
        ev_id = evidence_data["id"]
        assert evidence_data["sha256_hash"] == calculate_sha256(file_content)

        # 2. Test GET /api/v1/evidence/{evidence_id}
        get_res = client.get(f"/api/v1/evidence/{ev_id}")
        assert get_res.status_code == status.HTTP_200_OK
        assert get_res.json()["data"]["id"] == ev_id

        # 3. Test GET /api/v1/evidence/{evidence_id}/versions
        vers_res = client.get(f"/api/v1/evidence/{ev_id}/versions")
        assert vers_res.status_code == status.HTTP_200_OK
        assert vers_res.json()["total_versions"] >= 1

        # 4. Test POST /api/v1/evidence/{evidence_id}/verify-integrity
        verify_res = client.post(f"/api/v1/evidence/{ev_id}/verify-integrity")
        assert verify_res.status_code == status.HTTP_200_OK
        v_data = verify_res.json()["data"]
        assert v_data["integrity_status"] == "VERIFIED"
        assert v_data["is_match"] is True

    finally:
        app.dependency_overrides.clear()
