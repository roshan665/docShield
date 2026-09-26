from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.api.dependencies import get_current_user
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.evidence import EvidenceVersionBase, EvidenceVersionResponse
from backend.app.services.evidence_service import EvidenceService


def test_evidence_version_schema_valid():
    """Valid version schema instantiation."""
    valid_hash = "a" * 64
    item = EvidenceVersionBase(
        version_number=1,
        storage_path="cases/c1/evidence/e1/v1/knife.jpg",
        original_filename="knife.jpg",
        mime_type="image/jpeg",
        file_size_bytes=1048576,
        sha256_hash=valid_hash,
        change_reason="Initial Crime Scene Seizure"
    )
    assert item.version_number == 1
    assert item.sha256_hash == valid_hash


def test_evidence_version_schema_invalid_hash():
    """Invalid hash formats must be rejected by Pydantic validation."""
    with pytest.raises(ValidationError):
        EvidenceVersionBase(
            version_number=1,
            storage_path="path/to/file",
            original_filename="doc.pdf",
            file_size_bytes=100,
            sha256_hash="invalid-hash-not-64-hex"
        )


def test_evidence_version_schema_invalid_version_number():
    """Version numbers must be >= 1."""
    with pytest.raises(ValidationError):
        EvidenceVersionBase(
            version_number=0,
            storage_path="path/to/file",
            original_filename="doc.pdf",
            file_size_bytes=100,
            sha256_hash="a" * 64
        )


class MockEvidenceRepo:
    def __init__(self):
        self.evidence = {
            "ev-101": {
                "id": "ev-101",
                "evidence_tag": "EV-2024-001",
                "case_id": "case-999",
                "evidence_type": "Physical",
                "description": "Seized Revolver",
                "seal_number": "SEAL-101",
                "current_location": "Vault #2",
                "current_version": 1,
                "storage_path": None,
                "sha256_hash": None,
                "verification_status": "Verified",
                "status": "Secured"
            }
        }

    def get_by_id(self, evidence_id):
        return self.evidence.get(evidence_id)

    def update_current_version_metadata(self, evidence_id, current_version, storage_path, sha256_hash, file_size_bytes, mime_type):
        if evidence_id in self.evidence:
            self.evidence[evidence_id]["current_version"] = current_version
            self.evidence[evidence_id]["storage_path"] = storage_path
            self.evidence[evidence_id]["sha256_hash"] = sha256_hash
            return self.evidence[evidence_id]
        return None


class MockVersionRepo:
    def __init__(self):
        self.versions = []

    def create_version(self, payload):
        rec = {
            **payload,
            "id": f"ver-{len(self.versions) + 1}",
            "created_at": datetime.now(timezone.utc)
        }
        self.versions.append(rec)
        return rec

    def list_versions_for_evidence(self, evidence_id):
        matches = [v for v in self.versions if v["evidence_id"] == evidence_id]
        return sorted(matches, key=lambda x: x["version_number"], reverse=True)

    def get_latest_version(self, evidence_id):
        matches = self.list_versions_for_evidence(evidence_id)
        return matches[0] if matches else None


def test_evidence_service_version_lifecycle():
    """
    Test versioning lifecycle:
    1. Version 1 recorded from file bytes A -> Hash A
    2. Version 2 recorded from file bytes B -> Hash B
    3. Assert Version 1 hash is preserved in history and not overwritten
    """
    ev_repo = MockEvidenceRepo()
    ver_repo = MockVersionRepo()
    service = EvidenceService(evidence_repo=ev_repo, version_repo=ver_repo)

    file_bytes_v1 = b"Original Crime Scene Photograph Exhibit 1"
    v1_response = service.record_version_snapshot(
        evidence_id="ev-101",
        case_id="case-999",
        filename="scene_photo.jpg",
        file_bytes=file_bytes_v1,
        change_reason="Initial Crime Scene Deposition",
        officer_id="officer-42"
    )

    assert v1_response.version_number == 1
    v1_hash = v1_response.sha256_hash
    assert len(v1_hash) == 64

    # Now simulate exhibit replacement / enhancement
    file_bytes_v2 = b"Enhanced High-Resolution Crime Scene Photograph Exhibit 1"
    v2_response = service.record_version_snapshot(
        evidence_id="ev-101",
        case_id="case-999",
        filename="scene_photo_enhanced.jpg",
        file_bytes=file_bytes_v2,
        change_reason="FSL Forensic Photographic Contrast Enhancement",
        officer_id="officer-42"
    )

    assert v2_response.version_number == 2
    v2_hash = v2_response.sha256_hash
    assert v1_hash != v2_hash  # Hashes must differ

    # Verify history preservation: previous hash must NOT disappear
    history = service.get_version_history("ev-101")
    assert len(history) == 2
    # Newest first
    assert history[0].version_number == 2
    assert history[0].sha256_hash == v2_hash
    assert history[1].version_number == 1
    assert history[1].sha256_hash == v1_hash  # Preserved!

    # Active parent record reflects version 2
    summary = service.get_evidence_with_versions("ev-101")
    assert summary.current_version == 2
    assert summary.sha256_hash == v2_hash
    assert len(summary.versions) == 2


def test_api_evidence_versions_endpoint(client: TestClient, mock_inspector_user: AuthenticatedUser, monkeypatch):
    """Authenticated users can query evidence version history."""
    app.dependency_overrides[get_current_user] = lambda: mock_inspector_user
    
    mock_history = [
        EvidenceVersionResponse(
            id="ver-1",
            evidence_id="dummy-id",
            version_number=1,
            storage_path="cases/c1/evidence/e1/v1/doc.pdf",
            original_filename="doc.pdf",
            mime_type="application/pdf",
            file_size_bytes=1024,
            sha256_hash="a" * 64,
            change_reason="Initial Deposit",
            created_at=datetime.now(timezone.utc)
        )
    ]
    from backend.app.api.routes import evidence
    monkeypatch.setattr(evidence.evidence_service, "get_version_history", lambda ev_id: mock_history)

    try:
        response = client.get("/api/v1/evidence/dummy-id/versions")
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert payload["total_versions"] == 1
        assert len(payload["data"]) == 1
        assert payload["data"][0]["version_number"] == 1
    finally:
        app.dependency_overrides.clear()
