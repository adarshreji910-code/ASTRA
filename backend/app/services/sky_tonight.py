"""
SKY TONIGHT OBSERVATIONAL CALCULATOR
Computes real-time topocentric Alt/Az coordinates, moon phases,
and visible celestial objects for any user latitude, longitude, and datetime.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List
from .ephemeris import date_to_jd, compute_planet_heliocentric, compute_moon_geocentric, PLANET_ELEMENTS

# Popular preset observation cities
POPULAR_LOCATIONS = [
    {"name": "New Delhi, India", "lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata"},
    {"name": "Bengaluru, India (ISRO HQ)", "lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata"},
    {"name": "Cape Canaveral, USA (NASA KSC)", "lat": 28.3922, "lon": -80.6077, "tz": "America/New_York"},
    {"name": "Houston, USA (NASA JSC)", "lat": 29.7604, "lon": -95.3698, "tz": "America/Chicago"},
    {"name": "London, UK (Greenwich)", "lat": 51.4769, "lon": -0.0005, "tz": "Europe/London"},
    {"name": "Tokyo, Japan (JAXA)", "lat": 35.6762, "lon": 139.6503, "tz": "Asia/Tokyo"},
    {"name": "Sydney, Australia", "lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney"},
    {"name": "Kourou, French Guiana (ESA Spaceport)", "lat": 5.1610, "lon": -52.6496, "tz": "America/Cayenne"},
    {"name": "Cairo, Egypt", "lat": 30.0444, "lon": 31.2357, "tz": "Africa/Cairo"},
    {"name": "Madrid, Spain", "lat": 40.4168, "lon": -3.7038, "tz": "Europe/Madrid"}
]

def calculate_local_sidereal_time(jd: float, longitude_deg: float) -> float:
    """Calculate Local Apparent Sidereal Time in degrees."""
    T = (jd - 2451545.0) / 36525.0
    # Greenwich Mean Sidereal Time in degrees
    gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T**2 - (T**3 / 38710000.0)
    lmst = (gmst + longitude_deg) % 360.0
    if lmst < 0:
        lmst += 360.0
    return lmst

def ecliptic_to_equatorial(lon_deg: float, lat_deg: float, jd: float) -> tuple[float, float]:
    """Convert Ecliptic coordinates to Equatorial RA and Dec (degrees)."""
    T = (jd - 2451545.0) / 36525.0
    eps_deg = 23.439291 - 0.0130042 * T  # Obliquity of ecliptic
    eps_rad = math.radians(eps_deg)
    lon_rad = math.radians(lon_deg)
    lat_rad = math.radians(lat_deg)
    
    sin_dec = math.sin(lat_rad) * math.cos(eps_rad) + math.cos(lat_rad) * math.sin(eps_rad) * math.sin(lon_rad)
    dec_rad = math.asin(max(-1.0, min(1.0, sin_dec)))
    
    cos_ra = math.cos(lat_rad) * math.cos(lon_rad)
    sin_ra = math.cos(lat_rad) * math.sin(lon_rad) * math.cos(eps_rad) - math.sin(lat_rad) * math.sin(eps_rad)
    ra_rad = math.atan2(sin_ra, cos_ra)
    
    ra_deg = (math.degrees(ra_rad)) % 360.0
    dec_deg = math.degrees(dec_rad)
    return ra_deg, dec_deg

def equatorial_to_horizontal(ra_deg: float, dec_deg: float, lat_deg: float, lst_deg: float) -> tuple[float, float]:
    """Convert RA and Dec to Altitude and Azimuth (degrees)."""
    ha_deg = (lst_deg - ra_deg) % 360.0
    ha_rad = math.radians(ha_deg)
    dec_rad = math.radians(dec_deg)
    lat_rad = math.radians(lat_deg)
    
    sin_alt = math.sin(dec_rad) * math.sin(lat_rad) + math.cos(dec_rad) * math.cos(lat_rad) * math.cos(ha_rad)
    alt_rad = math.asin(max(-1.0, min(1.0, sin_alt)))
    alt_deg = math.degrees(alt_rad)
    
    cos_az = (math.sin(dec_rad) - math.sin(alt_rad) * math.sin(lat_rad)) / (math.cos(alt_rad) * math.cos(lat_rad) + 1e-9)
    cos_az = max(-1.0, min(1.0, cos_az))
    az_deg = math.degrees(math.acos(cos_az))
    
    if math.sin(ha_rad) > 0:
        az_deg = 360.0 - az_deg
        
    return round(alt_deg, 1), round(az_deg, 1)

def azimuth_to_cardinal(az_deg: float) -> str:
    """Convert azimuth angle to 8-point compass direction."""
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = int((az_deg + 22.5) / 45.0) % 8
    return directions[idx]

def get_sky_tonight(lat: float, lon: float, dt: Optional[datetime] = None) -> Dict[str, Any]:
    """Calculate Tonight's Sky observational report for observer location."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
        
    jd = date_to_jd(dt)
    lst_deg = calculate_local_sidereal_time(jd, lon)
    
    # Earth position
    earth_helio = compute_planet_heliocentric("earth", jd)
    
    visible_objects = []
    
    # Check Moon
    moon_info = compute_moon_geocentric(jd)
    # Approximate Moon RA & Dec from geocentric coords
    moon_lon = math.degrees(math.atan2(moon_info["geocentric_y_au"], moon_info["geocentric_x_au"])) % 360.0
    moon_lat = math.degrees(math.asin(moon_info["geocentric_z_au"] / max(1e-6, moon_info["distance_au"])))
    m_ra, m_dec = ecliptic_to_equatorial(moon_lon, moon_lat, jd)
    m_alt, m_az = equatorial_to_horizontal(m_ra, m_dec, lat, lst_deg)
    
    visible_objects.append({
        "id": "moon",
        "name": "The Moon",
        "type": "Natural Satellite",
        "altitude_deg": m_alt,
        "azimuth_deg": m_az,
        "cardinal_direction": azimuth_to_cardinal(m_az),
        "is_visible": m_alt > 0,
        "illumination_percent": int(moon_info["illumination"] * 100),
        "phase_name": moon_info["phase_name"],
        "apparent_magnitude": -12.7 if moon_info["phase_name"] == "Full Moon" else -10.0,
        "observation_advice": "Excellent target for binoculars. Observe along the terminator line where craters cast long dramatic shadows."
    })
    
    # Check major naked-eye planets
    naked_eye_planets = ["venus", "mars", "jupiter", "saturn", "mercury"]
    
    for p_name in naked_eye_planets:
        helio = compute_planet_heliocentric(p_name, jd)
        # Geocentric vector
        dx = helio["xh"] - earth_helio["xh"]
        dy = helio["yh"] - earth_helio["yh"]
        dz = helio["zh"] - earth_helio["zh"]
        geo_r = math.sqrt(dx**2 + dy**2 + dz**2)
        
        p_lon = math.degrees(math.atan2(dy, dx)) % 360.0
        p_lat = math.degrees(math.asin(dz / max(1e-6, geo_r)))
        p_ra, p_dec = ecliptic_to_equatorial(p_lon, p_lat, jd)
        p_alt, p_az = equatorial_to_horizontal(p_ra, p_dec, lat, lst_deg)
        
        mag = PLANET_ELEMENTS[p_name]["mag_base"]
        
        if p_alt > 0:
            status = "Visible Now"
            quality = "Excellent" if p_alt > 30 else ("Good" if p_alt > 15 else "Low on Horizon")
        else:
            status = "Below Horizon"
            quality = "Not Observable Now"
            
        advice = f"Look towards the {azimuth_to_cardinal(p_az)} at an elevation of {max(0, p_alt)}°."
        if p_name == "jupiter":
            advice += " Binoculars will reveal 4 pinpricks of light: the Galilean moons."
        elif p_name == "saturn":
            advice += " A small backyard telescope reveals its magnificent ring system."
        elif p_name == "venus":
            advice += " The brightest celestial beacon in the twilight sky."
            
        visible_objects.append({
            "id": p_name,
            "name": PLANET_ELEMENTS[p_name]["name"],
            "type": "Planet",
            "altitude_deg": p_alt,
            "azimuth_deg": p_az,
            "cardinal_direction": azimuth_to_cardinal(p_az),
            "is_visible": p_alt > 0,
            "apparent_magnitude": mag,
            "status": status,
            "quality": quality,
            "observation_advice": advice
        })
        
    # Sort with currently visible objects first, ordered by highest altitude
    visible_objects.sort(key=lambda x: (x["is_visible"], x["altitude_deg"]), reverse=True)
    
    # Active meteor radiant reminder
    meteor_info = {
        "active_shower": "Perseid Debris Stream / Sporadic Meteors",
        "expected_rate": "8 - 15 meteors/hour in rural skies",
        "best_viewing_window": "01:00 AM to 04:30 AM local time"
    }
    
    return {
        "observer_location": {
            "latitude": lat,
            "longitude": lon
        },
        "calculated_at_utc": dt.isoformat(),
        "local_sidereal_time_hours": round(lst_deg / 15.0, 2),
        "moon_phase": moon_info["phase_name"],
        "moon_illumination": int(moon_info["illumination"] * 100),
        "targets": visible_objects,
        "meteor_outlook": meteor_info,
        "popular_locations": POPULAR_LOCATIONS
    }
