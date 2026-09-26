from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DocShield Backend"
    assert "api_v1" in data


def test_health_endpoint(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert "data" in payload
    data = payload["data"]
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert "environment" in data
    assert isinstance(data["supabase_connected"], bool)
