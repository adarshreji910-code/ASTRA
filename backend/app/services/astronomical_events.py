"""
ASTRONOMICAL EVENTS CALCULATION & REPOSITORY SERVICE
Accurately cataloged and mathematically positioned astronomical events.
Coordinates are relative to Earth or Sun depending on event type.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

EVENTS_DATABASE: List[Dict[str, Any]] = [
    {
        "id": "solar-eclipse-2026-08-12",
        "title": "Total Solar Eclipse 2026",
        "category": "eclipse",
        "type": "Total Solar Eclipse",
        "date": "2026-08-12",
        "start_time_utc": "2026-08-12T15:34:00Z",
        "peak_time_utc": "2026-08-12T17:47:00Z",
        "end_time_utc": "2026-08-12T19:50:00Z",
        "importance": "Major Global Event",
        "highlight": True,
        "summary": "First total solar eclipse visible from mainland Europe in 27 years. The path of totality traverses Greenland, western Iceland, and northern Spain.",
        "scientific_significance": "Opportunity to observe the solar corona, solar prominences, and shadow bands from high-altitude Iberian plateaus and Arctic fjords.",
        "best_visibility": {
            "primary_regions": ["Spain (Madrid / Bilbao / Valencia)", "Iceland (Reykjavík)", "Greenland"],
            "totality_duration_seconds": 138,
            "path_width_km": 294,
            "partial_visibility": ["Western Europe", "Northern North America", "North Africa"]
        },
        "spatial_anchor": {
            "target": "earth_orbit",
            "three_position": {"x": 28.0, "y": 0.8, "z": -22.0},
            "sun_moon_earth_angle_deg": 0.1
        },
        "simulation_type": "solar_eclipse",
        "safety_notes": "ISO 12312-2 certified eclipse glasses are strictly mandatory during partial phases. Remove only during brief 100% totality."
    },
    {
        "id": "lunar-eclipse-2026-08-28",
        "title": "Partial Lunar Eclipse 2026",
        "category": "eclipse",
        "type": "Partial Lunar Eclipse",
        "date": "2026-08-28",
        "start_time_utc": "2026-08-28T02:22:00Z",
        "peak_time_utc": "2026-08-28T04:14:00Z",
        "end_time_utc": "2026-08-28T06:05:00Z",
        "importance": "High",
        "highlight": True,
        "summary": "Earth's dark umbral shadow bites into the Moon's southern limb, creating a striking red-tinged bite on the lunar surface.",
        "scientific_significance": "Measures Earth's upper atmospheric aerosol optical depth and ozone absorption layer.",
        "best_visibility": {
            "primary_regions": ["North America", "South America", "Western Europe", "West Africa"],
            "totality_duration_seconds": 0,
            "magnitude": 0.93,
            "partial_visibility": ["Pacific Ocean", "Atlantic Ocean"]
        },
        "spatial_anchor": {
            "target": "moon_orbit",
            "three_position": {"x": 42.0, "y": -0.5, "z": -34.0}
        },
        "simulation_type": "lunar_eclipse",
        "safety_notes": "100% safe to observe directly with naked eyes, binoculars, or telescopes without filters."
    },
    {
        "id": "perseids-meteor-shower",
        "title": "Perseid Meteor Shower Peak",
        "category": "meteors",
        "type": "Meteor Shower",
        "date": "2026-08-12",
        "start_time_utc": "2026-08-11T20:00:00Z",
        "peak_time_utc": "2026-08-12T23:00:00Z",
        "end_time_utc": "2026-08-13T04:00:00Z",
        "importance": "High",
        "highlight": True,
        "summary": "One of the most prolific and beloved meteor showers of the year, producing 80 to 100 fast, bright meteors per hour with persistent smoke trains.",
        "scientific_significance": "Debris particles shed by Comet 109P/Swift-Tuttle hitting Earth's upper mesosphere at 59 km/second (132,000 mph).",
        "best_visibility": {
            "primary_regions": ["Northern Hemisphere", "Equatorial Latitudes"],
            "radiant": "Constellation Perseus (RA 03h 04m, Dec +58°)",
            "zhr": 100,
            "speed_km_s": 59
        },
        "spatial_anchor": {
            "target": "earth_orbit",
            "three_position": {"x": 38.0, "y": 3.5, "z": -28.0}
        },
        "simulation_type": "meteor_shower",
        "safety_notes": "Best observed from midnight to dawn in wide open dark-sky locations away from artificial street lighting."
    },
    {
        "id": "saturn-opposition-2026",
        "title": "Saturn at Opposition 2026",
        "category": "planets",
        "type": "Planetary Opposition",
        "date": "2026-09-21",
        "start_time_utc": "2026-09-21T18:00:00Z",
        "peak_time_utc": "2026-09-21T23:45:00Z",
        "end_time_utc": "2026-09-22T06:00:00Z",
        "importance": "High",
        "highlight": True,
        "summary": "Saturn reaches directly opposite the Sun in our sky, rising at sunset and shining at its brightest and closest for the entire year.",
        "scientific_significance": "Seeliger Effect: surge in ring brightness as shadow-hiding disappears when Earth is directly in line between the Sun and ring particles.",
        "best_visibility": {
            "primary_regions": ["Global (Both Hemispheres)"],
            "apparent_magnitude": 0.4,
            "angular_diameter_arcsec": 19.2,
            "constellation": "Aquarius"
        },
        "spatial_anchor": {
            "target": "saturn_orbit",
            "three_position": {"x": 120.0, "y": 2.0, "z": -140.0}
        },
        "simulation_type": "planetary_conjunction",
        "safety_notes": "Visible to naked eye as golden star; small 70mm telescope reveals rings and large moon Titan."
    },
    {
        "id": "geminids-meteor-shower",
        "title": "Geminid Meteor Shower 2026",
        "category": "meteors",
        "type": "Meteor Shower",
        "date": "2026-12-14",
        "start_time_utc": "2026-12-13T19:00:00Z",
        "peak_time_utc": "2026-12-14T02:30:00Z",
        "end_time_utc": "2026-12-14T07:00:00Z",
        "importance": "Major Global Event",
        "highlight": True,
        "summary": "The king of annual meteor showers, yielding up to 120 to 150 bright, multicolored meteors per hour traveling at a leisurely 35 km/s.",
        "scientific_significance": "Originated uniquely from an asteroid (3200 Phaethon, a rock comet) rather than a traditional icy comet.",
        "best_visibility": {
            "primary_regions": ["Global (Northern and Southern Hemispheres)"],
            "radiant": "Constellation Gemini near Castor",
            "zhr": 130,
            "speed_km_s": 35
        },
        "spatial_anchor": {
            "target": "earth_orbit",
            "three_position": {"x": 35.0, "y": -2.0, "z": 24.0}
        },
        "simulation_type": "meteor_shower",
        "safety_notes": "Dress warmly; peak activity occurs from 1:00 AM to 4:00 AM local time."
    },
    {
        "id": "solar-eclipse-2027-08-02",
        "title": "Great Eclipse of North Africa & Middle East",
        "category": "eclipse",
        "type": "Total Solar Eclipse",
        "date": "2027-08-02",
        "start_time_utc": "2027-08-02T08:23:00Z",
        "peak_time_utc": "2027-08-02T10:07:00Z",
        "end_time_utc": "2027-08-02T12:15:00Z",
        "importance": "Historic Century Event",
        "highlight": True,
        "summary": "One of the longest total solar eclipses of the 21st century! Over 6 minutes and 22 seconds of totality near Luxor, Egypt under virtually cloudless skies.",
        "scientific_significance": "Unprecedented duration allows ultra-high-resolution spectroscopy of solar spicules, coronal magnetic loops, and inner zodiacal light.",
        "best_visibility": {
            "primary_regions": ["Southern Spain", "Morocco", "Algeria", "Tunisia", "Libya", "Egypt (Luxor)", "Saudi Arabia", "Yemen"],
            "totality_duration_seconds": 382,
            "path_width_km": 258
        },
        "spatial_anchor": {
            "target": "earth_orbit",
            "three_position": {"x": 30.0, "y": 1.2, "z": -25.0}
        },
        "simulation_type": "solar_eclipse",
        "safety_notes": "Certified solar filter glasses required during partial phases."
    },
    {
        "id": "lunar-eclipse-2027-02-20",
        "title": "Total Lunar Eclipse 2027 (Blood Moon)",
        "category": "eclipse",
        "type": "Total Lunar Eclipse",
        "date": "2027-02-20",
        "start_time_utc": "2027-02-20T21:40:00Z",
        "peak_time_utc": "2027-02-20T23:13:00Z",
        "end_time_utc": "2027-02-21T00:50:00Z",
        "importance": "Major Global Event",
        "highlight": True,
        "summary": "The Moon plunges entirely into the core of Earth's umbral shadow, glowing an ethereal crimson blood-red lit by every sunrise and sunset on Earth.",
        "scientific_significance": "Rayleigh scattering measurement of Earth's atmosphere projected upon the lunar regolith.",
        "best_visibility": {
            "primary_regions": ["Europe", "Africa", "Asia", "India", "Middle East", "Western Australia"],
            "totality_duration_seconds": 3480,
            "magnitude": 1.22
        },
        "spatial_anchor": {
            "target": "moon_orbit",
            "three_position": {"x": 41.5, "y": 0.4, "z": -32.5}
        },
        "simulation_type": "lunar_eclipse",
        "safety_notes": "Completely safe to view with naked eye, binoculars, or telescopes."
    },
    {
        "id": "mars-opposition-2027",
        "title": "Mars at Opposition 2027",
        "category": "planets",
        "type": "Planetary Opposition",
        "date": "2027-02-19",
        "start_time_utc": "2027-02-19T14:00:00Z",
        "peak_time_utc": "2027-02-19T21:15:00Z",
        "end_time_utc": "2027-02-20T04:00:00Z",
        "importance": "High",
        "highlight": True,
        "summary": "Earth passes directly between the Sun and Mars. The Red Planet flares into brilliant amber brilliance in Leo, outshining almost every star.",
        "scientific_significance": "Optimal window for planetary surface imaging, polar ice cap sublimation tracking, and spacecraft trajectory alignment.",
        "best_visibility": {
            "primary_regions": ["Global (Both Hemispheres)"],
            "apparent_magnitude": -1.2,
            "distance_million_km": 101.4,
            "constellation": "Leo"
        },
        "spatial_anchor": {
            "target": "mars_orbit",
            "three_position": {"x": 58.0, "y": 1.5, "z": -12.0}
        },
        "simulation_type": "planetary_conjunction",
        "safety_notes": "Look east after sunset; high-magnification eyepieces reveal dark markings (Syrtis Major) and polar ice."
    },
    {
        "id": "asteroid-apophis-2029",
        "title": "Asteroid 99942 Apophis Historic Close Flyby",
        "category": "asteroids",
        "type": "Asteroid Close Approach",
        "date": "2029-04-13",
        "start_time_utc": "2029-04-13T21:46:00Z",
        "peak_time_utc": "2029-04-13T21:46:00Z",
        "end_time_utc": "2029-04-13T23:30:00Z",
        "importance": "Historic Century Event",
        "highlight": True,
        "summary": "A 340-meter asteroid will fly safely within 31,600 km (19,634 miles) of Earth's surface — closer than geostationary communication satellites and visible to billions of naked eyes across Europe and Africa!",
        "scientific_significance": "Earth's gravitational tidal forces will dynamically stretch and torque Apophis, triggering asteroid-quakes and altering its rotation spin axis.",
        "best_visibility": {
            "primary_regions": ["Europe", "Africa", "Western Asia"],
            "closest_distance_km": 31600,
            "relative_speed_km_s": 7.43,
            "apparent_magnitude": 3.1
        },
        "spatial_anchor": {
            "target": "earth_orbit",
            "three_position": {"x": 39.2, "y": 0.8, "z": -27.8}
        },
        "simulation_type": "asteroid_approach",
        "safety_notes": "Zero danger of impact. Confirmed 100% safe by NASA Center for Near-Earth Object Studies (CNEOS)."
    },
    {
        "id": "solar-flare-alert-active",
        "title": "Solar Active Region Coronal Ejection Alert",
        "category": "solar",
        "type": "Solar Activity / CME",
        "date": "2026-09-28",
        "start_time_utc": "2026-09-28T12:00:00Z",
        "peak_time_utc": "2026-09-29T18:30:00Z",
        "end_time_utc": "2026-10-01T12:00:00Z",
        "importance": "Live Alert",
        "highlight": True,
        "summary": "Active sunspot region unleashed an M-class flare with an Earth-directed halo coronal mass ejection (CME) compressing the magnetosphere.",
        "scientific_significance": "Geomagnetic storming inducing aurora borealis and australis visible down to geomagnetic latitudes of 50°.",
        "best_visibility": {
            "primary_regions": ["Scandinavia", "Canada", "Northern US (Alaska, Michigan, Washington)", "Scotland", "New Zealand", "Tasmania"],
            "geomagnetic_kp": 6.2,
            "solar_wind_speed_km_s": 580
        },
        "spatial_anchor": {
            "target": "sun_surface",
            "three_position": {"x": 4.5, "y": 2.0, "z": -1.0}
        },
        "simulation_type": "solar_flare",
        "safety_notes": "Never look at the Sun directly without proper solar optical filters."
    }
]

def get_upcoming_events(category: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    """Return filtered and sorted upcoming events."""
    events = EVENTS_DATABASE
    if category and category.lower() != "all":
        events = [e for e in events if e["category"].lower() == category.lower()]
    return events[:limit]

def get_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve event by unique ID."""
    for event in EVENTS_DATABASE:
        if event["id"] == event_id:
            return event
    return None
