"""
Currency rates from Frankfurter (free, no API key). Proxied and cached to reduce traffic.
"""
import logging
import time
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/currency", tags=["currency"])

FRANKFURTER_URL = "https://api.frankfurter.app/latest"
CACHE_TTL_SEC = 300  # 5 minutes
_cache: dict[str, tuple[float, dict[str, Any]]] = {}


@router.get("/rates")
async def get_rates(base: str = Query("USD", min_length=3, max_length=3)) -> dict[str, Any]:
    """Fetch latest rates for base currency from Frankfurter. Cached for 5 minutes."""
    base = base.upper()
    now = time.monotonic()
    if base in _cache:
        cached_at, data = _cache[base]
        if now - cached_at < CACHE_TTL_SEC:
            return data
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(FRANKFURTER_URL, params={"from": base})
            r.raise_for_status()
            data = r.json()
    except httpx.HTTPError as e:
        logger.warning("Currency API request failed: %s", e)
        raise HTTPException(status_code=502, detail="Could not fetch exchange rates") from e
    except Exception as e:
        logger.exception("Currency API error: %s", e)
        raise HTTPException(status_code=502, detail="Could not fetch exchange rates") from e
    # Normalize: ensure base is in rates as 1.0 for consistent frontend use
    rates = dict(data.get("rates", {}))
    rates[base] = 1.0
    out = {"base": data.get("base", base), "date": data.get("date"), "rates": rates}
    _cache[base] = (now, out)
    return out
