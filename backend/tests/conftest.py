import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.main import app
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser, UserProfile


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_inspector_user():
    return AuthenticatedUser(
        id="usr_insp_123",
        email="rajesh.kumar@mp.police.gov.in",
        role=Role.INSPECTOR,
        profile=UserProfile(
            id="usr_insp_123",
            email="rajesh.kumar@mp.police.gov.in",
            full_name="Insp. Rajesh Kumar",
            badge_id="INSP-BH-104",
            role=Role.INSPECTOR,
            police_station="Bhopal Central Police Station"
        )
    )


@pytest.fixture
def mock_admin_user():
    return AuthenticatedUser(
        id="usr_admin_999",
        email="admin.security@mp.police.gov.in",
        role=Role.ADMIN,
        profile=UserProfile(
            id="usr_admin_999",
            email="admin.security@mp.police.gov.in",
            full_name="Admin Vikram Singh",
            badge_id="ADM-HQ-001",
            role=Role.ADMIN,
            police_station="Police Headquarters Bhopal"
        )
    )


@pytest.fixture
def mock_legal_user():
    return AuthenticatedUser(
        id="usr_legal_456",
        email="priya.sharma@mp.prosecution.gov.in",
        role=Role.LEGAL_OFFICER,
        profile=UserProfile(
            id="usr_legal_456",
            email="priya.sharma@mp.prosecution.gov.in",
            full_name="Adv. Priya Sharma",
            badge_id="LEG-MP-202",
            role=Role.LEGAL_OFFICER,
            police_station="District Court Prosecution Wing"
        )
    )


@pytest.fixture
def mock_forensic_user():
    return AuthenticatedUser(
        id="usr_forensic_789",
        email="arun.verma@mp.fsl.gov.in",
        role=Role.FORENSIC_OFFICER,
        profile=UserProfile(
            id="usr_forensic_789",
            email="arun.verma@mp.fsl.gov.in",
            full_name="Dr. Arun Verma",
            badge_id="FSL-MP-303",
            role=Role.FORENSIC_OFFICER,
            police_station="State Forensic Science Laboratory, Bhopal"
        )
    )
