"""
NEAR-EARTH ASTEROIDS & COMETS (CNEOS / NEOWS COMPLIANT)
Tracks close approaches of asteroids, miss distances, sizes, and orbital velocities.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any

ASTEROIDS_CLOSE_APPROACHES: List[Dict[str, Any]] = [
    {
        "id": "99942-apophis",
        "name": "99942 Apophis (2004 MN4)",
        "estimated_diameter_meters": {"min": 340, "max": 370},
        "close_approach_date": "2029-04-13",
        "miss_distance_km": 31600,
        "miss_distance_lunar_distances": 0.082,
        "relative_velocity_km_s": 7.43,
        "is_potentially_hazardous": True,
        "impact_risk": "Zero (Calculated safe flyby within GEO belt)",
        "scientific_notes": "First asteroid in recorded human history of this magnitude to pass inside Earth's geostationary satellite ring."
    },
    {
        "id": "2024-yr4",
        "name": "2024 YR4",
        "estimated_diameter_meters": {"min": 45, "max": 80},
        "close_approach_date": "2032-12-22",
        "miss_distance_km": 118000,
        "miss_distance_lunar_distances": 0.31,
        "relative_velocity_km_s": 14.1,
        "is_potentially_hazardous": False,
        "impact_risk": "Negligible (<0.001%)",
        "scientific_notes": "Discovered by ATLAS survey; intensive radar tracking refined orbital eccentricity."
    },
    {
        "id": "101955-bennu",
        "name": "101955 Bennu",
        "estimated_diameter_meters": {"min": 490, "max": 510},
        "close_approach_date": "2060-09-23",
        "miss_distance_km": 750000,
        "miss_distance_lunar_distances": 1.95,
        "relative_velocity_km_s": 6.2,
        "is_potentially_hazardous": True,
        "impact_risk": "1 in 1,750 cumulative probability by year 2300",
        "scientific_notes": "Sampled by NASA OSIRIS-REx; primitive carbonaceous rubble pile rich in hydrated minerals and organic molecules."
    },
    {
        "id": "4179-toutatis",
        "name": "4179 Toutatis",
        "estimated_diameter_meters": {"min": 4500, "max": 5400},
        "close_approach_date": "2028-11-09",
        "miss_distance_km": 7520000,
        "miss_distance_lunar_distances": 19.5,
        "relative_velocity_km_s": 11.8,
        "is_potentially_hazardous": True,
        "impact_risk": "Zero risk for current century",
        "scientific_notes": "Elongated contact binary tumbling chaotically in a non-principal axis rotation state."
    }
]

def get_near_earth_objects() -> List[Dict[str, Any]]:
    """Return catalog of monitored near-Earth asteroids."""
    return ASTEROIDS_CLOSE_APPROACHES
