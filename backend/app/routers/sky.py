from fastapi import APIRouter, Query
from datetime import datetime, timezone
from typing import Optional
from ..services.sky_tonight import get_sky_tonight, POPULAR_LOCATIONS

router = APIRouter(prefix="/sky", tags=["Sky Tonight"])

@router.get("/tonight")
def get_tonight_sky(
    lat: float = Query(28.6139, description="Observer latitude in degrees (-90 to +90)"),
    lon: float = Query(77.2090, description="Observer longitude in degrees (-180 to +180)"),
    timestamp: Optional[str] = Query(None, description="ISO timestamp for observation")
):
    """Calculate visible planets, moon phase, and observation advice for user coordinates."""
    dt = None
    if timestamp:
        if timestamp.endswith("Z"):
            timestamp = timestamp[:-1] + "+00:00"
        try:
            dt = datetime.fromisoformat(timestamp)
        except Exception:
            dt = None
    return get_sky_tonight(lat=lat, lon=lon, dt=dt)

@router.get("/locations")
def get_preset_locations():
    """Retrieve curated list of astronomical observing sites and space launch centers."""
    return POPULAR_LOCATIONS
