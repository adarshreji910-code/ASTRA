from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from typing import Optional
from ..services.ephemeris import get_solar_system_state

router = APIRouter(prefix="/solar-system", tags=["Solar System"])

@router.get("/current")
def get_current_solar_system():
    """Retrieve current planetary positions, coordinates, and orbital elements."""
    return get_solar_system_state()

@router.get("/{timestamp}")
def get_solar_system_at_time(timestamp: str):
    """Retrieve planetary positions at a specific historical or future ISO timestamp."""
    try:
        # Handle formats like '2027-08-12T12:00:00Z' or '2027-08-12'
        if timestamp.endswith("Z"):
            timestamp = timestamp[:-1] + "+00:00"
        dt = datetime.fromisoformat(timestamp)
        return get_solar_system_state(dt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid timestamp format: {str(e)}. Use ISO format e.g. 2027-08-12T12:00:00Z")
