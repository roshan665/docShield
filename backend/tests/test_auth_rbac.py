from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.api.dependencies import get_current_user
from backend.app.schemas.auth import AuthenticatedUser


def test_missing_authentication(client: TestClient):
    """Endpoints requiring authentication must reject requests without Bearer token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "UNAUTHORIZED"


def test_invalid_token(client: TestClient):
    """Requests with malformed Bearer tokens must be rejected."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.mock.jwt.token"}
    )
    assert response.status_code == 401
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "UNAUTHORIZED"


def test_authenticated_me_endpoint(client: TestClient, mock_inspector_user: AuthenticatedUser):
    """Authenticated user must receive their verified server-side identity."""
    app.dependency_overrides[get_current_user] = lambda: mock_inspector_user
    try:
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert payload["data"]["id"] == "usr_insp_123"
        assert payload["data"]["role"] == "inspector"
        assert payload["data"]["profile"]["badge_id"] == "INSP-BH-104"
    finally:
        app.dependency_overrides.clear()


def test_role_enforcement_inspector_success(client: TestClient, mock_inspector_user: AuthenticatedUser):
    """Inspector role must be authorized to access inspector-scoped endpoints."""
    app.dependency_overrides[get_current_user] = lambda: mock_inspector_user
    try:
        response = client.get("/api/v1/auth/probe/inspector")
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert "Inspector authorization verified" in payload["data"]
    finally:
        app.dependency_overrides.clear()


def test_role_enforcement_admin_supervisory_access(client: TestClient, mock_admin_user: AuthenticatedUser):
    """Admin role has supervisory access to inspector-scoped endpoints."""
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    try:
        response = client.get("/api/v1/auth/probe/inspector")
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
    finally:
        app.dependency_overrides.clear()


def test_role_enforcement_forbidden_for_other_roles(client: TestClient, mock_legal_user: AuthenticatedUser):
    """Legal Officer must be rejected with 403 Forbidden on inspector-scoped endpoints."""
    app.dependency_overrides[get_current_user] = lambda: mock_legal_user
    try:
        response = client.get("/api/v1/auth/probe/inspector")
        assert response.status_code == 403
        payload = response.json()
        assert payload["success"] is False
        assert payload["error"]["code"] == "FORBIDDEN"
        assert "requires the 'inspector' role" in payload["error"]["message"]
    finally:
        app.dependency_overrides.clear()


def test_admin_probe_forbidden_for_inspector(client: TestClient, mock_inspector_user: AuthenticatedUser):
    """Inspectors cannot access admin-only endpoints."""
    app.dependency_overrides[get_current_user] = lambda: mock_inspector_user
    try:
        response = client.get("/api/v1/auth/probe/admin")
        assert response.status_code == 403
        payload = response.json()
        assert payload["success"] is False
        assert payload["error"]["code"] == "FORBIDDEN"
    finally:
        app.dependency_overrides.clear()


def test_admin_probe_success_for_admin(client: TestClient, mock_admin_user: AuthenticatedUser):
    """Admins can access admin-only endpoints."""
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    try:
        response = client.get("/api/v1/auth/probe/admin")
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
    finally:
        app.dependency_overrides.clear()
