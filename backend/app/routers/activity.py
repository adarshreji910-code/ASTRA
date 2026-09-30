from fastapi import APIRouter, Query
from datetime import datetime, timezone
import math
from typing import Optional
from ..services.space_weather import get_current_space_weather
from ..services.news_service import get_latest_news
from ..services.missions_service import get_missions
from ..services.near_earth import get_near_earth_objects

router = APIRouter(tags=["Space Activity"])

@router.get("/space-weather")
def get_space_weather():
    """Retrieve live solar activity, flares, geomagnetic Kp index, and aurora forecast."""
    return get_current_space_weather()

@router.get("/news/latest")
def get_news(
    category: Optional[str] = Query(None, description="Category filter (Missions, Launches, Discoveries, Space Weather, Mars, Human Spaceflight)"),
    organization: Optional[str] = Query(None, description="Agency filter (NASA, ISRO, SpaceX, ESA, JAXA)"),
    limit: int = 20
):
    """Retrieve verified space news articles with links and source attribution."""
    return get_latest_news(category=category, organization=organization, limit=limit)

@router.get("/missions")
def get_space_missions(agency: Optional[str] = Query(None, description="Filter by agency (NASA, ISRO, SpaceX, ESA, JAXA)")):
    """Retrieve active and upcoming major space exploration missions."""
    return get_missions(agency=agency)

@router.get("/asteroids/near-earth")
def get_asteroids():
    """Retrieve monitored close-approach near-Earth asteroids and hazard indices."""
    return get_near_earth_objects()

@router.get("/iss/current")
def get_iss_telemetry():
    """Calculate current simulated ISS orbit position, speed, and active expedition crew."""
    now = datetime.now(timezone.utc)
    t = now.timestamp()
    
    # ISS orbital period is ~92.6 minutes (5556 seconds), inclination 51.6 degrees
    orbit_fraction = (t % 5556) / 5556.0
    orbit_angle = orbit_fraction * 2.0 * math.pi
    
    lat = 51.6 * math.sin(orbit_angle)
    # Longitude precesses westward by ~23 degrees per orbit due to Earth rotation
    earth_rot_lon = ((t / 86400.0) * 360.0) % 360.0
    lon = ((math.degrees(orbit_angle) - earth_rot_lon) % 360.0) - 180.0
    
    return {
        "timestamp_utc": now.isoformat(),
        "latitude": round(lat, 4),
        "longitude": round(lon, 4),
        "altitude_km": 418.5,
        "velocity_km_h": 27580,
        "orbital_period_minutes": 92.68,
        "expedition": "Expedition 73/74",
        "current_crew": [
            {"name": "Sunita Williams", "role": "Commander (NASA)"},
            {"name": "Barry Wilmore", "role": "Flight Engineer (NASA)"},
            {"name": "Don Pettit", "role": "Flight Engineer (NASA)"},
            {"name": "Aleksey Ovchinin", "role": "Flight Engineer (Roscosmos)"},
            {"name": "Ivan Vagner", "role": "Flight Engineer (Roscosmos)"},
            {"name": "Aleksandr Gorbunov", "role": "Flight Engineer (Roscosmos)"},
            {"name": "Nick Hague", "role": "Flight Engineer (NASA)"}
        ],
        "status": "Nominal Orbital Operations"
    }
