"""Admin API: stats and internal endpoints. Protected by ADMIN_API_KEY."""
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.services import job_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin_key(
    x_admin_key: str | None = Header(None, alias="X-Admin-Key"),
    key: str | None = Query(None),
) -> None:
    """Verify admin API key from header or query. 404 if key not configured; 401 if wrong."""
    if not settings.admin_api_key:
        raise HTTPException(status_code=404, detail="Not found")
    provided = x_admin_key or key
    if not provided or provided != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/stats")
def admin_stats(
    _: None = Depends(require_admin_key),
    db: Session = Depends(get_db),
):
    """Return aggregate job counts by status. Requires X-Admin-Key header or ?key=."""
    return job_service.get_admin_stats(db)
