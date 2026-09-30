from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.astronomical_events import get_upcoming_events, get_event_by_id

router = APIRouter(prefix="/events", tags=["Astronomical Events"])

@router.get("/upcoming")
def get_events(category: Optional[str] = Query(None, description="Filter by category (eclipse, meteors, planets, asteroids, solar, all)"), limit: int = 20):
    """Retrieve catalog of upcoming astronomical events and orbital markers."""
    return get_upcoming_events(category=category, limit=limit)

@router.get("/{event_id}")
def get_single_event(event_id: str):
    """Retrieve full details, visibility geometry, and simulation instructions for an event."""
    event = get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Astronomical event not found")
    return event
