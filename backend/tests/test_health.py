def test_health_returns_ok(client):
    """GET /health returns 200 and status ok."""
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_api_health_returns_checks(client):
    """GET /api/health returns 200 or 503 and has status and checks."""
    r = client.get("/api/health")
    assert r.status_code in (200, 503)
    data = r.json()
    assert "status" in data
    if r.status_code == 200:
        assert data["status"] == "ok"
        assert "checks" in data
        assert "database" in data["checks"]
        assert "redis" in data["checks"]
    else:
        assert data["status"] == "degraded"
        assert "checks" in data
