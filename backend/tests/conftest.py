import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db


def _mock_get_db():
    """Yield a mock session so tests never open a real DB connection."""
    yield MagicMock()


@pytest.fixture(autouse=True)
def override_get_db():
    """Override get_db for all tests so they run without Postgres."""
    app.dependency_overrides[get_db] = _mock_get_db
    yield
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture(autouse=True)
def no_migrations():
    """Skip migrations during tests so no real DB connection is made at lifespan."""
    with patch("app.main.run_migrations"):
        yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
