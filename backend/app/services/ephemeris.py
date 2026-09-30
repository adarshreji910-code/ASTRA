"""
ASTRONOMICAL EPHEMERIS ENGINE FOR SPACEVERSE
Based on NASA JPL Keplerian Elements and planetary perturbation equations.
Coordinate Reference Frame: Heliocentric Ecliptic J2000
Epoch: Standard Julian Day 2451545.0 (2000 January 1.5)
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# Astronomical constants
AU_TO_KM = 149597870.7
SPEED_OF_LIGHT_KM_S = 299792.458

# Planetary orbital elements (Standish, JPL / NASA Solar System Dynamics)
# [a0, a_dot, e0, e_dot, I0, I_dot, L0, L_dot, w0, w_dot, node0, node_dot]
# a in AU, e dimensionless, angles in degrees, rates per Julian Century (cy)
PLANET_ELEMENTS = {
    "mercury": {
        "name": "Mercury",
        "color": "#A0A0A0",
        "radius_km": 2439.7,
        "visual_scale": 1.2,
        "a": (0.38709927, 0.00000037),
        "e": (0.20563593, 0.00001906),
        "I": (7.00497902, -0.00594749),
        "L": (252.25032350, 149472.67411175),
        "w": (77.45779628, 0.16047689),
        "node": (48.33076593, -0.12534081),
        "mag_base": -0.42,
        "description": "The smallest planet in the Solar System and closest to the Sun. A cratered world with extreme temperature swings from 430°C by day to -180°C by night.",
        "orbit_period_days": 87.97,
        "moons_count": 0,
        "atmosphere": "Trace exosphere (Oxygen, Sodium, Hydrogen)"
    },
    "venus": {
        "name": "Venus",
        "color": "#E3BB76",
        "radius_km": 6051.8,
        "visual_scale": 2.2,
        "a": (0.72333566, 0.00000390),
        "e": (0.00677672, -0.00004107),
        "I": (3.39467605, -0.00078890),
        "L": (181.97909950, 58517.81538729),
        "w": (131.60246718, 0.00268329),
        "node": (76.67984255, -0.27769418),
        "mag_base": -4.40,
        "description": "Earth's twin in size, but enveloped in a runaway greenhouse atmosphere of dense carbon dioxide with clouds of sulfuric acid.",
        "orbit_period_days": 224.7,
        "moons_count": 0,
        "atmosphere": "Dense 96.5% CO2, 3.5% N2, 92 bar surface pressure"
    },
    "earth": {
        "name": "Earth",
        "color": "#4B90E2",
        "radius_km": 6371.0,
        "visual_scale": 2.4,
        "a": (1.00000261, 0.00000562),
        "e": (0.01671123, -0.00004392),
        "I": (0.00001531, -0.01294668),
        "L": (100.46457166, 35999.37244981),
        "w": (102.93768193, 0.32327364),
        "node": (0.0, 0.0),
        "mag_base": -3.86,
        "description": "Our home planet and the only known world in the universe to harbor life, oceans of liquid water, and an oxygen-rich protective atmosphere.",
        "orbit_period_days": 365.256,
        "moons_count": 1,
        "atmosphere": "78% Nitrogen, 21% Oxygen, 1% Argon & trace gases"
    },
    "mars": {
        "name": "Mars",
        "color": "#E27B58",
        "radius_km": 3389.5,
        "visual_scale": 1.6,
        "a": (1.52371034, 0.00001847),
        "e": (0.09339410, 0.00007882),
        "I": (1.84969142, -0.00813131),
        "L": (-4.55343205, 19140.30268499),
        "w": (-23.94362959, 0.44441088),
        "node": (49.55953891, -0.29257343),
        "mag_base": -1.52,
        "description": "The Red Planet, home to Olympus Mons (the tallest volcano in the Solar System) and ancient dry river valleys that once held flowing water.",
        "orbit_period_days": 686.98,
        "moons_count": 2,
        "atmosphere": "Thin 95% CO2, 2.6% N2, 1.9% Argon"
    },
    "jupiter": {
        "name": "Jupiter",
        "color": "#D4A373",
        "radius_km": 69911.0,
        "visual_scale": 5.5,
        "a": (5.20288700, -0.00011607),
        "e": (0.04838624, -0.00013257),
        "I": (1.30439695, -0.00183714),
        "L": (34.39644051, 3034.74612775),
        "w": (14.72847983, 0.21252668),
        "node": (100.47390909, 0.20469106),
        "mag_base": -2.70,
        "description": "The king of planets, a colossal gas giant with twice the mass of all other planets combined and a Great Red Spot storm raging for centuries.",
        "orbit_period_days": 4332.59,
        "moons_count": 95,
        "atmosphere": "89% Hydrogen, 10% Helium, trace Methane & Ammonia"
    },
    "saturn": {
        "name": "Saturn",
        "color": "#EAD6A6",
        "radius_km": 58232.0,
        "visual_scale": 4.6,
        "has_rings": True,
        "a": (9.53667594, -0.00125060),
        "e": (0.05386179, -0.00050991),
        "I": (2.48599187, 0.00193609),
        "L": (49.95424423, 1222.49362201),
        "w": (92.59887831, -0.41897216),
        "node": (113.66242448, -0.28867794),
        "mag_base": 0.67,
        "description": "Adorned with a dazzling system of icy rings stretching 282,000 km across, yet less dense than liquid water.",
        "orbit_period_days": 10759.22,
        "moons_count": 146,
        "atmosphere": "96% Hydrogen, 3% Helium"
    },
    "uranus": {
        "name": "Uranus",
        "color": "#70C1B3",
        "radius_km": 25362.0,
        "visual_scale": 3.4,
        "a": (19.18916464, -0.00196153),
        "e": (0.04725744, -0.00004397),
        "I": (0.77263783, -0.00242939),
        "L": (313.23810451, 428.48202785),
        "w": (170.95427630, 0.40805280),
        "node": (74.01692503, 0.04240589),
        "mag_base": 5.52,
        "description": "An ice giant rotating on its side at an extreme 98° axial tilt, surrounded by 28 known moons and faint dark rings.",
        "orbit_period_days": 30685.4,
        "moons_count": 28,
        "atmosphere": "82.5% Hydrogen, 15.2% Helium, 2.3% Methane"
    },
    "neptune": {
        "name": "Neptune",
        "color": "#3F51B5",
        "radius_km": 24622.0,
        "visual_scale": 3.3,
        "a": (30.06992276, 0.00026291),
        "e": (0.00860639, 0.00005105),
        "I": (1.77004347, 0.00035372),
        "L": (-55.12002969, 218.45945325),
        "w": (44.96476224, -0.32241464),
        "node": (131.78422574, -0.00508664),
        "mag_base": 7.78,
        "description": "The most distant major planet, an intensely blue world with the fastest supersonic winds in the Solar System reaching over 2,100 km/h.",
        "orbit_period_days": 60189.0,
        "moons_count": 16,
        "atmosphere": "80% Hydrogen, 19% Helium, 1.5% Methane"
    },
    "pluto": {
        "name": "Pluto",
        "color": "#C4A482",
        "radius_km": 1188.3,
        "visual_scale": 0.9,
        "a": (39.48211675, -0.00031596),
        "e": (0.24882730, 0.00005170),
        "I": (17.14001206, 0.00004818),
        "L": (238.92903833, 145.20780515),
        "w": (224.06879900, -0.04062942),
        "node": (110.30393680, -0.01183482),
        "mag_base": 15.1,
        "description": "Dwarf planet in the Kuiper Belt featuring nitrogen ice plains, towering water-ice mountains, and the famous Tombaugh Regio heart.",
        "orbit_period_days": 90560.0,
        "moons_count": 5,
        "atmosphere": "Thin nitrogen, methane, carbon monoxide"
    }
}

# Major Galilean Moons of Jupiter
JUPITER_MOONS = [
    {"name": "Io", "orbit_radius_au": 0.00282, "period_days": 1.769, "color": "#E5D275", "desc": "Most volcanically active body in the Solar System."},
    {"name": "Europa", "orbit_radius_au": 0.00449, "period_days": 3.551, "color": "#C7D4E1", "desc": "Global subsurface liquid water ocean beneath cracked ice shell."},
    {"name": "Ganymede", "orbit_radius_au": 0.00716, "period_days": 7.155, "color": "#8C837B", "desc": "Largest moon in the Solar System, bigger than Mercury with its own magnetic field."},
    {"name": "Callisto", "orbit_radius_au": 0.01259, "period_days": 16.689, "color": "#5C5652", "desc": "Ancient heavily cratered ice-rock world."}
]

def date_to_jd(dt: datetime) -> float:
    """Convert UTC datetime to Julian Day Number."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
        
    year = dt.year
    month = dt.month
    day = dt.day + (dt.hour + dt.minute / 60.0 + dt.second / 3600.0) / 24.0
    
    if month <= 2:
        year -= 1
        month += 12
        
    a = math.floor(year / 100)
    b = 2 - a + math.floor(a / 4)
    
    jd = math.floor(365.25 * (year + 4716)) + math.floor(30.6001 * (month + 1)) + day + b - 1524.5
    return jd

def solve_kepler(M_rad: float, e: float, max_iter: int = 50, tol: float = 1e-8) -> float:
    """Solve Kepler's equation E - e*sin(E) = M for Eccentric Anomaly E."""
    E = M_rad
    for _ in range(max_iter):
        dE = (E - e * math.sin(E) - M_rad) / (1.0 - e * math.cos(E))
        E -= dE
        if abs(dE) < tol:
            break
    return E

def compute_planet_heliocentric(name: str, jd: float) -> Dict[str, Any]:
    """Compute Heliocentric Ecliptic coordinates for a planet at Julian Day jd."""
    data = PLANET_ELEMENTS[name]
    T = (jd - 2451545.0) / 36525.0  # Julian centuries since J2000.0
    
    a = data["a"][0] + data["a"][1] * T
    e = data["e"][0] + data["e"][1] * T
    I_deg = data["I"][0] + data["I"][1] * T
    L_deg = data["L"][0] + data["L"][1] * T
    w_deg = data["w"][0] + data["w"][1] * T
    node_deg = data["node"][0] + data["node"][1] * T
    
    # Perihelion argument and mean anomaly
    omega_deg = w_deg - node_deg
    M_deg = (L_deg - w_deg) % 360.0
    if M_deg < 0:
        M_deg += 360.0
        
    M_rad = math.radians(M_deg)
    I_rad = math.radians(I_deg)
    omega_rad = math.radians(omega_deg)
    node_rad = math.radians(node_deg)
    
    # Solve for eccentric anomaly E
    E_rad = solve_kepler(M_rad, e)
    
    # Orbital coordinates in the plane of the orbit
    x_prime = a * (math.cos(E_rad) - e)
    y_prime = a * math.sqrt(max(0.0, 1.0 - e**2)) * math.sin(E_rad)
    r_au = math.sqrt(x_prime**2 + y_prime**2)
    
    # Rotate into Heliocentric Ecliptic coordinates (J2000)
    # x = (cos(omega)*cos(node) - sin(omega)*sin(node)*cos(I)) * x_prime + (-sin(omega)*cos(node) - cos(omega)*sin(node)*cos(I)) * y_prime
    # y = (cos(omega)*sin(node) + sin(omega)*cos(node)*cos(I)) * x_prime + (-sin(omega)*sin(node) + cos(omega)*cos(node)*cos(I)) * y_prime
    # z = (sin(omega)*sin(I)) * x_prime + (cos(omega)*sin(I)) * y_prime
    
    P_x = math.cos(omega_rad) * math.cos(node_rad) - math.sin(omega_rad) * math.sin(node_rad) * math.cos(I_rad)
    Q_x = -math.sin(omega_rad) * math.cos(node_rad) - math.cos(omega_rad) * math.sin(node_rad) * math.cos(I_rad)
    
    P_y = math.cos(omega_rad) * math.sin(node_rad) + math.sin(omega_rad) * math.cos(node_rad) * math.cos(I_rad)
    Q_y = -math.sin(omega_rad) * math.sin(node_rad) + math.cos(omega_rad) * math.cos(node_rad) * math.cos(I_rad)
    
    P_z = math.sin(omega_rad) * math.sin(I_rad)
    Q_z = math.cos(omega_rad) * math.sin(I_rad)
    
    xh = P_x * x_prime + Q_x * y_prime
    yh = P_y * x_prime + Q_y * y_prime
    zh = P_z * x_prime + Q_z * y_prime
    
    # In Three.js:
    # X_3d = xh
    # Y_3d = zh (ecliptic latitude / inclination up)
    # Z_3d = -yh (Three.js right-handed system)
    three_x = xh
    three_y = zh
    three_z = -yh
    
    # Calculate true orbital velocity approx (vis-viva equation)
    # v = sqrt(GM_sun * (2/r - 1/a)) in km/s (GM_sun = 1.327e11 km^3/s^2, 1 AU = 1.496e8 km)
    speed_km_s = 29.78 * math.sqrt(max(0.1, 2.0 / max(0.01, r_au) - 1.0 / max(0.01, a)))
    
    return {
        "xh": xh,
        "yh": yh,
        "zh": zh,
        "r_au": r_au,
        "three_x": three_x,
        "three_y": three_y,
        "three_z": three_z,
        "speed_km_s": speed_km_s,
        "true_anomaly_deg": math.degrees(math.atan2(y_prime, x_prime)) % 360.0,
        "mean_anomaly_deg": M_deg,
        "semi_major_axis_au": a,
        "eccentricity": e,
        "inclination_deg": I_deg
    }

def compute_moon_geocentric(jd: float) -> Dict[str, Any]:
    """Compute Moon geocentric position (Meeus simplified lunar ephemeris)."""
    T = (jd - 2451545.0) / 36525.0
    
    # Moon's mean longitude
    L_prime = (218.3164477 + 481267.88123421 * T) % 360.0
    # Mean elongation of the Moon
    D = (297.8501921 + 445267.1114034 * T) % 360.0
    # Sun's mean anomaly
    M_sun = (357.5291092 + 35999.0502909 * T) % 360.0
    # Moon's mean anomaly
    M_moon = (134.9633964 + 477198.8675055 * T) % 360.0
    # Moon's argument of latitude
    F = (93.2720950 + 483202.0175233 * T) % 360.0
    
    # Ecliptic longitude perturbations (degrees)
    l_rad = math.radians(L_prime + 
        6.288774 * math.sin(math.radians(M_moon)) +
        1.274027 * math.sin(math.radians(2*D - M_moon)) +
        0.658314 * math.sin(math.radians(2*D)) +
        0.213618 * math.sin(math.radians(2*M_moon)) -
        0.185116 * math.sin(math.radians(M_sun)) -
        0.114332 * math.sin(math.radians(2*F))
    )
    
    # Ecliptic latitude perturbations (degrees)
    b_rad = math.radians(
        5.128122 * math.sin(math.radians(F)) +
        0.280602 * math.sin(math.radians(M_moon + F)) +
        0.277693 * math.sin(math.radians(M_moon - F)) +
        0.173238 * math.sin(math.radians(2*D - F))
    )
    
    # Distance in km
    dist_km = 385000.56 - 20905.355 * math.cos(math.radians(M_moon)) - 3699.111 * math.cos(math.radians(2*D - M_moon)) - 2955.968 * math.cos(math.radians(2*D))
    dist_au = dist_km / AU_TO_KM
    
    # Coordinates in AU relative to Earth
    x_moon = dist_au * math.cos(b_rad) * math.cos(l_rad)
    y_moon = dist_au * math.cos(b_rad) * math.sin(l_rad)
    z_moon = dist_au * math.sin(b_rad)
    
    # Moon phase angle and illumination fraction
    phase_angle = 180.0 - (D % 360.0)
    illumination = (1.0 + math.cos(math.radians(phase_angle))) / 2.0
    
    # Name phase
    d_norm = D % 360.0
    if d_norm < 22.5 or d_norm >= 337.5:
        phase_name = "New Moon"
    elif d_norm < 67.5:
        phase_name = "Waxing Crescent"
    elif d_norm < 112.5:
        phase_name = "First Quarter"
    elif d_norm < 157.5:
        phase_name = "Waxing Gibbous"
    elif d_norm < 202.5:
        phase_name = "Full Moon"
    elif d_norm < 247.5:
        phase_name = "Waning Gibbous"
    elif d_norm < 292.5:
        phase_name = "Last Quarter"
    else:
        phase_name = "Waning Crescent"
        
    return {
        "geocentric_x_au": x_moon,
        "geocentric_y_au": y_moon,
        "geocentric_z_au": z_moon,
        "three_rel_x": x_moon,
        "three_rel_y": z_moon,
        "three_rel_z": -y_moon,
        "distance_km": dist_km,
        "distance_au": dist_au,
        "illumination": round(illumination, 3),
        "phase_name": phase_name,
        "elongation_deg": round(d_norm, 1)
    }

def get_solar_system_state(dt: Optional[datetime] = None) -> Dict[str, Any]:
    """Compute the full real Solar System state for a specific datetime."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
        
    jd = date_to_jd(dt)
    
    # First compute Earth heliocentric position to compute geocentric relative values
    earth_helio = compute_planet_heliocentric("earth", jd)
    earth_xh = earth_helio["xh"]
    earth_yh = earth_helio["yh"]
    earth_zh = earth_helio["zh"]
    
    planets = {}
    
    for name, meta in PLANET_ELEMENTS.items():
        helio = compute_planet_heliocentric(name, jd)
        
        # Geocentric distance from Earth
        dx = helio["xh"] - earth_xh
        dy = helio["yh"] - earth_yh
        dz = helio["zh"] - earth_zh
        dist_earth_au = math.sqrt(dx**2 + dy**2 + dz**2)
        dist_earth_km = dist_earth_au * AU_TO_KM
        dist_sun_km = helio["r_au"] * AU_TO_KM
        
        # Apparent visual magnitude V
        # V = H + 5*log10(r * Delta) + phase_function
        r_au = helio["r_au"]
        if dist_earth_au > 0.0001 and r_au > 0.0001:
            # Phase angle (Sun - Target - Earth angle)
            cos_alpha = (r_au**2 + dist_earth_au**2 - earth_helio["r_au"]**2) / (2.0 * r_au * dist_earth_au)
            cos_alpha = max(-1.0, min(1.0, cos_alpha))
            alpha_deg = math.degrees(math.acos(cos_alpha))
            v_mag = meta["mag_base"] + 5.0 * math.log10(max(0.001, r_au * dist_earth_au)) + 0.015 * alpha_deg
        else:
            v_mag = meta["mag_base"]
            
        light_travel_minutes = (dist_earth_km / SPEED_OF_LIGHT_KM_S) / 60.0
        
        # Build orbital trail for visualization (24 samples around orbit)
        orbit_trail = []
        for i in range(36):
            trail_M = math.radians((i * 10.0))
            trail_E = solve_kepler(trail_M, helio["eccentricity"])
            tx_prime = helio["semi_major_axis_au"] * (math.cos(trail_E) - helio["eccentricity"])
            ty_prime = helio["semi_major_axis_au"] * math.sqrt(max(0.0, 1.0 - helio["eccentricity"]**2)) * math.sin(trail_E)
            
            # Use rotation matrix
            omega_rad = math.radians(PLANET_ELEMENTS[name]["w"][0] - PLANET_ELEMENTS[name]["node"][0])
            node_rad = math.radians(PLANET_ELEMENTS[name]["node"][0])
            I_rad = math.radians(helio["inclination_deg"])
            
            P_x = math.cos(omega_rad) * math.cos(node_rad) - math.sin(omega_rad) * math.sin(node_rad) * math.cos(I_rad)
            Q_x = -math.sin(omega_rad) * math.cos(node_rad) - math.cos(omega_rad) * math.sin(node_rad) * math.cos(I_rad)
            P_y = math.cos(omega_rad) * math.sin(node_rad) + math.sin(omega_rad) * math.cos(node_rad) * math.cos(I_rad)
            Q_y = -math.sin(omega_rad) * math.sin(node_rad) + math.cos(omega_rad) * math.cos(node_rad) * math.cos(I_rad)
            P_z = math.sin(omega_rad) * math.sin(I_rad)
            Q_z = math.cos(omega_rad) * math.sin(I_rad)
            
            trail_xh = P_x * tx_prime + Q_x * ty_prime
            trail_yh = P_y * tx_prime + Q_y * ty_prime
            trail_zh = P_z * tx_prime + Q_z * ty_prime
            
            orbit_trail.append({
                "x": round(trail_xh, 4),
                "y": round(trail_zh, 4),
                "z": round(-trail_yh, 4)
            })
            
        planet_record = {
            "id": name,
            "name": meta["name"],
            "color": meta["color"],
            "radius_km": meta["radius_km"],
            "visual_scale": meta["visual_scale"],
            "has_rings": meta.get("has_rings", False),
            "description": meta["description"],
            "atmosphere": meta["atmosphere"],
            "orbit_period_days": meta["orbit_period_days"],
            "moons_count": meta["moons_count"],
            "coordinates": {
                "heliocentric_au": {
                    "x": round(helio["xh"], 6),
                    "y": round(helio["yh"], 6),
                    "z": round(helio["zh"], 6)
                },
                "three_js": {
                    "x": round(helio["three_x"], 5),
                    "y": round(helio["three_y"], 5),
                    "z": round(helio["three_z"], 5)
                }
            },
            "distance_from_sun_au": round(helio["r_au"], 4),
            "distance_from_sun_million_km": round(dist_sun_km / 1e6, 2),
            "distance_from_earth_au": round(dist_earth_au, 4),
            "distance_from_earth_million_km": round(dist_earth_km / 1e6, 2),
            "apparent_magnitude": round(v_mag, 2),
            "speed_km_s": round(helio["speed_km_s"], 2),
            "light_travel_minutes": round(light_travel_minutes, 2),
            "orbital_trail": orbit_trail
        }
        
        # Attach Galilean Moons if Jupiter
        if name == "jupiter":
            j_moons = []
            for moon in JUPITER_MOONS:
                # Compute moon relative position around Jupiter
                angle = (2.0 * math.pi * ((jd % moon["period_days"]) / moon["period_days"]))
                mx = moon["orbit_radius_au"] * math.cos(angle)
                mz = moon["orbit_radius_au"] * math.sin(angle)
                j_moons.append({
                    "name": moon["name"],
                    "desc": moon["desc"],
                    "color": moon["color"],
                    "period_days": moon["period_days"],
                    "rel_x": round(mx, 6),
                    "rel_y": 0.0,
                    "rel_z": round(mz, 6)
                })
            planet_record["major_moons"] = j_moons
            
        planets[name] = planet_record
        
    # Compute Moon geocentric position
    moon_data = compute_moon_geocentric(jd)
    
    # Sun metadata
    sun_data = {
        "id": "sun",
        "name": "Sun",
        "color": "#FDB813",
        "radius_km": 696340.0,
        "visual_scale": 10.0,
        "description": "The yellow dwarf star at the center of our Solar System, comprising 99.86% of the system's total mass.",
        "coordinates": {
            "heliocentric_au": {"x": 0.0, "y": 0.0, "z": 0.0},
            "three_js": {"x": 0.0, "y": 0.0, "z": 0.0}
        },
        "distance_from_earth_million_km": round(earth_helio["r_au"] * AU_TO_KM / 1e6, 2),
        "surface_temp_k": 5778
    }
    
    return {
        "timestamp_utc": dt.isoformat(),
        "julian_day": round(jd, 4),
        "epoch": "J2000.0 (VSOP87 / Standish Analytical Model)",
        "sun": sun_data,
        "earth": planets["earth"],
        "moon": moon_data,
        "planets": planets,
        "disclosure": "Planet sizes are visually exaggerated for interactive visibility. Celestial coordinates and orbital distances are scientifically computed from astronomical ephemeris models."
    }
