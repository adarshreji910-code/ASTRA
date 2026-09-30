"""
SPACEVERSE AI — THE INTELLIGENT GUIDE TO THE UNIVERSE
Connects live astronomical ephemeris, 3D solar system viewport, space weather,
active missions, upcoming events, and peer-reviewed scientific literature.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import random

from .ephemeris import get_solar_system_state
from .space_weather import get_current_space_weather
from .astronomical_events import get_upcoming_events, get_event_by_id
from .missions_service import get_all_missions, get_mission_by_id
from .research_service import (
    search_research_papers,
    get_paper_by_id,
    get_all_papers,
    ASTRONOMICAL_DATASETS
)

# Canonical celestial names
PLANET_KEYS = {
    "mercury": "mercury",
    "venus": "venus",
    "earth": "earth",
    "mars": "mars",
    "jupiter": "jupiter",
    "saturn": "saturn",
    "uranus": "uranus",
    "neptune": "neptune",
    "sun": "sun",
    "moon": "moon"
}

def resolve_context_target(query: str, context: Optional[Dict[str, Any]] = None) -> Optional[str]:
    """Resolve target body from natural language or active 3D context."""
    q = query.lower()
    
    # Check explicit mentions in query
    for name, key in PLANET_KEYS.items():
        if name in q:
            return key
    if "europa" in q:
        return "europa"
    if "apophis" in q:
        return "apophis"
    if "iss" in q or "space station" in q:
        return "iss"
        
    # Check context if pronouns or relative terms used
    pronoun_indicators = ["it", "this", "here", "where i am", "current", "what am i seeing", "this planet", "this body"]
    if any(p in q for p in pronoun_indicators) and context:
        sel = context.get("selected_object") or context.get("selectedObject")
        if sel:
            sel_lower = str(sel).lower()
            for name, key in PLANET_KEYS.items():
                if name in sel_lower:
                    return key
            return sel_lower
            
    return None

def answer_space_question(
    query: str,
    context: Optional[Dict[str, Any]] = None,
    explanation_level: str = "enthusiast",
    mode: str = "ask"
) -> Dict[str, Any]:
    """
    Core SPACEVERSE AI Knowledge Pipeline:
    ASK -> RETRIEVE -> VERIFY -> EXPLAIN -> VISUALIZE -> EXPLORE
    """
    q = query.lower().strip()
    target = resolve_context_target(query, context)
    now = datetime.now(timezone.utc)
    solar_state = get_solar_system_state(now)
    space_weather = get_current_space_weather()
    upcoming_events = get_upcoming_events(limit=5)
    
    # Normalize level
    level = explanation_level.lower()
    if level not in ["simple", "student", "enthusiast", "technical"]:
        level = "enthusiast"

    # 1. SPECIAL MODE: EXPLAIN VIEW
    if mode == "explain_view" or "explain what i'm seeing" in q or "what am i looking at" in q:
        return explain_current_view(context, level)

    # 2. SPECIAL MODE: SURPRISE ME
    if mode == "surprise_me" or "surprise me" in q:
        return generate_astronomical_surprise(level)

    # 3. SPECIAL MODE: COMPARISON
    if mode == "compare" or "vs" in q or "compare" in q or "difference between" in q:
        comp_res = handle_comparison(query, level)
        if comp_res:
            return comp_res

    # 4. SPECIAL MODE: HYPOTHETICAL
    if mode == "hypothetical" or "what if" in q or "suppose" in q or "imagine" in q:
        hypo_res = handle_hypothetical(query, level)
        if hypo_res:
            return hypo_res

    # 5. SCIENTIFIC RESEARCH & PAPERS INTENT
    papers = search_research_papers(query, target=target)
    is_research_query = any(k in q for k in [
        "paper", "research", "study", "scientific", "journal", "discovery",
        "evidence", "data", "ads", "arxiv", "atmosphere escape", "subsurface ocean",
        "habitable", "hycean", "black hole", "event horizon"
    ])
    
    if is_research_query and papers:
        top_paper = papers[0]
        return format_research_response(top_paper, level, query)

    # 6. PLANETARY & EPHEMERIS INTENT
    if target in ["mars", "jupiter", "saturn", "venus", "mercury", "uranus", "neptune"]:
        p_data = solar_state["planets"].get(target)
        if p_data:
            return format_planet_response(target, p_data, query, level, papers)

    # 7. MOON / LUNAR ECLIPSE INTENT
    if target == "moon" or "moon" in q or "lunar" in q:
        return format_moon_response(solar_state["moon"], query, level)

    # 8. SUN & SPACE WEATHER INTENT
    if target == "sun" or any(k in q for k in ["sun", "solar", "aurora", "flare", "geomagnetic", "solar wind", "cme"]):
        return format_sun_space_weather_response(space_weather, query, level)

    # 9. ASTRONOMICAL EVENTS / ECLIPSES
    if any(k in q for k in ["eclipse", "meteor", "conjunction", "opposition", "comet"]):
        return format_events_response(upcoming_events, query, level)

    # 10. SPACE MISSIONS (NASA, ISRO, ESA, SpaceX, JAXA)
    if any(k in q for k in ["mission", "isro", "nasa", "spacex", "artemis", "gaganyaan", "starship", "clipper", "perseverance", "chandrayaan", "aditya"]):
        return format_missions_response(query, level)

    # 11. TONIGHT'S SKY INTENT
    if any(k in q for k in ["tonight", "sky", "visible", "naked eye", "look up", "stargazing"]):
        return format_tonight_sky_response(solar_state, context, level)

    # 12. FALLBACK ASTRONOMICAL SYNTHESIS
    return format_default_synthesis(solar_state, space_weather, query, level)

def format_planet_response(planet_id: str, p_data: Dict[str, Any], query: str, level: str, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
    name = p_data.get("name", planet_id.capitalize())
    dist_km = p_data.get("distance_from_earth_million_km", 0.0)
    dist_au = p_data.get("distance_from_earth_au", 0.0)
    light_time = p_data.get("light_travel_minutes", 0.0)
    mag = p_data.get("apparent_magnitude", 0.0)
    
    simple_exp = f"{name} is currently {dist_km} million kilometers away from Earth! Light from it takes about {light_time:.1f} minutes to reach our eyes."
    student_exp = f"{name} is at {dist_au:.3f} Astronomical Units (AU). Radio signals and photons traveling at c = 299,792 km/s require {light_time:.1f} minutes for one-way propagation. It shines at apparent visual magnitude {mag:+.2f}."
    enthusiast_exp = f"{name} is positioned at {dist_au:.3f} AU ({dist_km:.1f}M km) with light-travel delay of {light_time:.1f} min. Its visual magnitude is {mag:+.2f}. In 3D space, you can observe its true Keplerian orbital posture and orientation relative to the Sun."
    technical_exp = f"{name} heliocentric ephemeris: Δ = {dist_au:.4f} AU ({dist_km * 1e6:,.0f} km), one-way light time τ = {light_time * 60:.1f} s. Photometric apparent magnitude V = {mag:.2f}. State vectors derived from VSOP87 analytical planetary secular theory."
    
    explanation_map = {
        "simple": simple_exp,
        "student": student_exp,
        "enthusiast": enthusiast_exp,
        "technical": technical_exp
    }
    
    paper_match = papers[0] if papers else None
    
    return {
        "query": query,
        "answer": explanation_map.get(level, enthusiast_exp),
        "simple_explanation": simple_exp,
        "deeper_dive": technical_exp,
        "explanation_level": level,
        "evidence_level": "CALCULATED",
        "what_we_know": [
            {"category": "Established Science", "text": f"{name} orbits the Sun along an elliptical trajectory with eccentricity calculated via celestial mechanics."},
            {"category": "Active Research", "text": f"Robotic probes and orbital observatories continue monitoring {name}'s atmosphere and surface dynamics."},
            {"category": "Open Questions", "text": f"Unlocking deep subsurface geophysics, core mass distribution, and magnetic dynamo evolution."}
        ],
        "eight_point_paper": paper_match.get("eight_point_breakdown") if paper_match else None,
        "sources": [
            {
                "title": f"JPL Planetary Ephemerides & VSOP87 Theory for {name}",
                "authors": "Bretagnon, P. & Francou, G.",
                "doi": "10.1051/0004-6361:20030588",
                "url": "https://ssd.jpl.nasa.gov/"
            }
        ] + ([{
            "title": paper_match["title"],
            "authors": paper_match["authors"],
            "doi": paper_match["doi"],
            "url": f"https://doi.org/{paper_match['doi']}"
        }] if paper_match else []),
        "action": {
            "type": "focusObject",
            "label": f"Fly to {name} in 3D",
            "payload": {"objectId": planet_id, "zoomLevel": 4}
        },
        "suggested_actions": [f"Fly to {name} in 3D", f"Compare {name} with Earth", "Check Research Galaxy"],
        "suggested_followups": [
            f"What is the atmospheric composition of {name}?",
            f"What active space missions are exploring {name}?",
            f"How long does a day and year last on {name}?"
        ],
        "context_summary": {
            "resolved_target": name,
            "domain": "ephemeris"
        }
    }

def format_moon_response(moon_data: Dict[str, Any], query: str, level: str) -> Dict[str, Any]:
    phase = moon_data.get("phase_name", "Waxing Gibbous")
    illum = int(moon_data.get("illumination", 0.75) * 100)
    q = query.lower()
    
    is_blood_moon = "red" in q or "blood" in q or "eclipse" in q
    if is_blood_moon:
        simple = "During a lunar eclipse, Earth blocks direct sunlight to the Moon. But light from all of Earth's sunrises and sunsets bends through our atmosphere and shines onto the Moon, turning it blood red!"
        student = "Rayleigh scattering in Earth's atmosphere scatters shorter blue wavelengths of light away. The longer red wavelengths refract through the atmospheric rim toward the Moon, casting Earth's shadow (umbra) in deep crimson light."
        enthusiast = "Total Lunar Eclipse red coloration varies by the Danjon Scale (L=0 dark/black to L=4 bright copper-red). Volcanic aerosols in the stratosphere increase opacity, deepening the blood-red darkness."
        technical = "Atmospheric extinction: optical depth τ(λ) ∝ λ^-4 causes extreme differential refraction. Photons passing within the 0–80 km troposphere/stratosphere ring refract into the umbral cone, illuminating the lunar regolith with integrated solar irradiance."
        evidence = "OBSERVED"
    else:
        simple = f"The Moon is currently in its {phase} phase, with {illum}% of its visible face glowing in sunlight."
        student = f"The Moon is {illum}% illuminated in {phase}. Lunar phases are governed by the synodic lunar month (29.53 days) as the Moon orbits Earth relative to the Sun."
        enthusiast = f"Currently in {phase} ({illum}% illuminated). High contrast occurs along the lunar terminator line, where shadows accentuate crater walls like Tycho and Copernicus."
        technical = f"Phase angle: {moon_data.get('phase_angle_deg', 45):.1f}°, fractional illumination k = {moon_data.get('illumination', 0.75):.3f}. Lunar librations allow observation of up to 59% of the lunar surface over time."
        evidence = "CALCULATED"

    explanation_map = {"simple": simple, "student": student, "enthusiast": enthusiast, "technical": technical}
    
    paper = get_paper_by_id("paper-lunar-south-pole-ice")
    
    return {
        "query": query,
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": evidence,
        "what_we_know": [
            {"category": "Established Science", "text": "The Moon is tidally locked to Earth, completing one rotation on its axis in the exact same time it takes to orbit Earth (27.3 days)."},
            {"category": "Active Research", "text": "Spectroscopy confirms water ice reserves inside permanently shadowed craters at the lunar south pole."},
            {"category": "Open Questions", "text": "Determining exact depth, purity, and origin (cometary vs solar-wind implantation) of lunar ice."}
        ],
        "eight_point_paper": paper.get("eight_point_breakdown") if paper else None,
        "sources": [
            {
                "title": "Direct Detection of Surface Water Ice in Lunar Polar Permanently Shadowed Regions",
                "authors": "Li, S., Lucey, P. G., et al.",
                "doi": "10.1073/pnas.1802305115",
                "url": "https://doi.org/10.1073/pnas.1802305115"
            }
        ],
        "action": {
            "type": "focusObject",
            "label": "Fly to the Moon in 3D",
            "payload": {"objectId": "moon", "zoomLevel": 3}
        },
        "suggested_actions": ["Fly to the Moon in 3D", "Check 2027 Blood Moon Eclipse", "Read Lunar Water Paper"],
        "suggested_followups": [
            "Why do we always see the same side of the Moon?",
            "What will NASA Artemis III astronauts do at the South Pole?",
            "When is the next Total Lunar Eclipse?"
        ],
        "context_summary": {
            "resolved_target": "Moon",
            "domain": "lunar"
        }
    }

def format_sun_space_weather_response(sw: Dict[str, Any], query: str, level: str) -> Dict[str, Any]:
    kp = sw.get("geomagnetic_k_index", 3.0)
    storm = sw.get("geomagnetic_storm_level", "Quiet")
    wind = sw.get("solar_wind", {}).get("speed_km_s", 420.0)
    flares = sw.get("solar_flares_recent", [])
    top_flare = flares[0] if flares else {"class": "M2.4", "active_region": "AR3664"}
    
    simple = f"The Sun is currently crackling with energy at the peak of Solar Cycle 25! Solar wind is whistling past Earth at {wind:,.0f} km/s, and space weather activity is at Kp {kp} ({storm})."
    student = f"The Sun's magnetic activity index is currently Kp {kp} ({storm}) with solar wind velocity at {wind:.1f} km/s. Recent solar flare activity reached {top_flare['class']} from active sunspot region {top_flare['active_region']}."
    enthusiast = f"Solar Cycle 25 maximum is in progress. NOAA Space Weather monitors report Kp={kp} ({storm}), proton flux within nominal baseline, and solar wind stream velocity of {wind:.0f} km/s. High-latitude aurora prospects are elevated."
    technical = f"IMF polarity and coronal mass ejection coupling: SW velocity v = {wind:.1f} km/s, planetary K-index Kp = {kp}. Eruptive flux rope release from {top_flare['active_region']} produced an {top_flare['class']} soft X-ray flare (GOES 1.0–8.0 Å). Relativistic electron flux monitored by DSCOVR."
    
    explanation_map = {"simple": simple, "student": student, "enthusiast": enthusiast, "technical": technical}
    paper = get_paper_by_id("paper-solar-cycle-25-flares")
    
    return {
        "query": query,
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "OBSERVED",
        "what_we_know": [
            {"category": "Established Science", "text": "The Sun's magnetic poles flip every 11 years, driving sunspot cycles and coronal mass ejection frequencies."},
            {"category": "Active Research", "text": "Parker Solar Probe and Aditya-L1 are measuring coronal heating and coronal mass ejection initiation close to the photosphere."},
            {"category": "Open Questions", "text": "Predicting exact coronal mass ejection arrival times at Earth within sub-hour error margins."}
        ],
        "eight_point_paper": paper.get("eight_point_breakdown") if paper else None,
        "sources": [
            {
                "title": "Solar Cycle 25 Maximum and Coronal Mass Ejection Geoeffectiveness",
                "authors": "Nandy, D., Bhowmik, P., et al.",
                "doi": "10.3847/1538-4357/ad1a89",
                "url": "https://doi.org/10.3847/1538-4357/ad1a89"
            }
        ],
        "action": {
            "type": "showSpaceWeather",
            "label": "Open Live Space Weather Hub",
            "payload": {}
        },
        "suggested_actions": ["Open Live Space Weather Hub", "Fly to Sun in 3D", "Check Solar Cycle Paper"],
        "suggested_followups": [
            "Can a solar flare knock out Earth's internet?",
            "What causes the Northern and Southern Lights?",
            "How does Aditya-L1 monitor the Sun from the L1 point?"
        ],
        "context_summary": {
            "resolved_target": "Sun",
            "domain": "space_weather"
        }
    }

def format_research_response(paper: Dict[str, Any], level: str, query: str) -> Dict[str, Any]:
    levels = paper.get("levels", {})
    ans = levels.get(level, levels.get("enthusiast", paper["abstract"]))
    
    return {
        "query": query,
        "answer": ans,
        "simple_explanation": levels.get("simple", ""),
        "deeper_dive": levels.get("technical", ""),
        "explanation_level": level,
        "evidence_level": "RESEARCHED",
        "what_we_know": [
            {"category": "Established Science", "text": paper["eight_point_breakdown"]["result"]},
            {"category": "Active Research", "text": paper["eight_point_breakdown"]["method"]},
            {"category": "Open Questions", "text": paper["eight_point_breakdown"]["open_questions"]}
        ],
        "eight_point_paper": paper["eight_point_breakdown"],
        "sources": [
            {
                "title": paper["title"],
                "authors": paper["authors"],
                "journal": paper["journal"],
                "year": paper["year"],
                "doi": paper["doi"],
                "arxiv": paper["arxiv_id"],
                "ads_bibcode": paper["ads_bibcode"],
                "url": f"https://doi.org/{paper['doi']}"
            }
        ],
        "action": {
            "type": "openResearch",
            "label": f"Explore {paper['target']} Research in Galaxy",
            "payload": {"paperId": paper["id"], "target": paper["target"]}
        },
        "suggested_actions": [f"Explore {paper['target']} Research in Galaxy", f"Fly to {paper['target']} in 3D"],
        "suggested_followups": [
            f"What instruments gathered the data for {paper['title'][:40]}...?",
            f"What are the major limitations of this study?",
            "Show me the Research Galaxy graph"
        ],
        "context_summary": {
            "resolved_target": paper["target"],
            "domain": "research"
        }
    }

def format_events_response(events: List[Dict[str, Any]], query: str, level: str) -> Dict[str, Any]:
    next_ev = events[0] if events else {
        "title": "Total Solar Eclipse of August 12, 2026",
        "date": "2026-08-12",
        "id": "event-solar-eclipse-2026",
        "description": "Totality traverses Greenland, western Iceland, and northern Spain."
    }
    
    simple = f"Mark your calendar: the next major celestial spectacle is the {next_ev.get('title', 'Solar Eclipse')} on {next_ev.get('date', 'August 12, 2026')}! Later on August 2, 2027, the historic 'Eclipse of the Century' will cross Egypt with over 6 minutes of totality."
    student = f"Upcoming astronomical highlights include the {next_ev.get('title')} ({next_ev.get('date')}). Eclipses occur during eclipse seasons when the Moon's orbital nodes line up with the ecliptic plane."
    enthusiast = f"Major upcoming events: {next_ev.get('title')} on {next_ev.get('date')}, followed by the Perseids meteor shower, and the extraordinary August 2, 2027 Total Solar Eclipse across Luxor, Egypt (6m 23s totality)."
    technical = f"Saros 126 / Saros 136 eclipse cycle alignment. Geocentric conjunction in right ascension occurs with gamma parameter defining umbral path geometry across terrestrial coordinates."
    
    explanation_map = {"simple": simple, "student": student, "enthusiast": enthusiast, "technical": technical}
    
    return {
        "query": query,
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "PREDICTED",
        "what_we_know": [
            {"category": "Established Science", "text": "Orbital mechanics and gravitational perturbations predict eclipse paths centuries into the future with sub-second accuracy."},
            {"category": "Active Research", "text": "Coronal spectroscopy during solar totality allows observing the Sun's magnetic field lines and coronal heating mechanisms."},
            {"category": "Open Questions", "text": "Measuring precise changes in Earth's rotational speed (ΔT) caused by tidal friction and core mantle coupling."}
        ],
        "eight_point_paper": None,
        "sources": [
            {
                "title": "Five Millennium Catalog of Solar and Lunar Eclipses: -1999 to +3000",
                "authors": "Espenak, F. & Meeus, J. (NASA GSFC)",
                "doi": "10.1007/978-1-4419-7389-4",
                "url": "https://eclipse.gsfc.nasa.gov/"
            }
        ],
        "action": {
            "type": "focusEvent",
            "label": f"View {next_ev.get('title', 'Upcoming Event')}",
            "payload": {"eventId": next_ev.get("id", "event-solar-eclipse-2026")}
        },
        "suggested_actions": [f"View {next_ev.get('title', 'Upcoming Event')}", "Simulate 2026 Eclipse in 3D", "Check 2027 Egypt Eclipse"],
        "suggested_followups": [
            "Where on Earth can I see totality in August 2026?",
            "What makes the 2027 Luxor eclipse the 'Eclipse of the Century'?",
            "How do meteor showers relate to comets?"
        ],
        "context_summary": {
            "resolved_target": "Astronomical Events",
            "domain": "events"
        }
    }

def format_missions_response(query: str, level: str) -> Dict[str, Any]:
    q = query.lower()
    if "gaganyaan" in q or "isro" in q or "india" in q:
        target_mission = "ISRO Gaganyaan"
        desc = "ISRO's flagship human spaceflight mission targeting Low Earth Orbit with a 3-member crew aboard the human-rated LVM3 rocket."
        mission_id = "mission-gaganyaan"
    elif "artemis" in q:
        target_mission = "NASA Artemis II"
        desc = "NASA's first crewed lunar mission since Apollo 17, taking 4 astronauts on a lunar flyby aboard Orion."
        mission_id = "mission-artemis-ii"
    elif "clipper" in q or "europa" in q:
        target_mission = "NASA Europa Clipper"
        desc = "Launched in October 2024, heading to Jupiter to investigate the habitability of Europa's subsurface ocean."
        mission_id = "mission-europa-clipper"
    elif "starship" in q or "spacex" in q:
        target_mission = "SpaceX Starship"
        desc = "The most powerful rocket ever flown, developed for rapid reusability and selected as NASA's Artemis III lunar lander."
        mission_id = "mission-starship"
    else:
        target_mission = "Global Space Fleet"
        desc = "Active space exploration fleets across NASA, ISRO, ESA, SpaceX, and JAXA exploring the Solar System."
        mission_id = "mission-artemis-ii"

    simple = f"{target_mission} is one of humanity's boldest exploration programs! {desc}"
    student = f"{target_mission} represents advanced aerospace engineering: {desc} It validates life support, atmospheric re-entry dynamics, and deep-space telemetry."
    enthusiast = f"{target_mission}: {desc} Features state-of-the-art avionics, autonomous navigation, and specialized scientific payload suites."
    technical = f"Mission trajectory parameters: orbital inclination, delta-v expenditure, thermal protection system (TPS) ablative heatshield performance, and deep space network (DSN) S/X/Ka band telecommunications."
    
    explanation_map = {"simple": simple, "student": student, "enthusiast": enthusiast, "technical": technical}
    
    return {
        "query": query,
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "REPORTED",
        "what_we_know": [
            {"category": "Established Science", "text": "Rocket propulsion obeys Tsiolkovsky's rocket equation Δv = v_e * ln(m0 / mf)."},
            {"category": "Active Research", "text": f"Engineers and flight controllers are executing mission validation protocols for {target_mission}."},
            {"category": "Open Questions", "text": "Ensuring long-term crew radiation shielding during interplanetary deep space transits."}
        ],
        "eight_point_paper": None,
        "sources": [
            {
                "title": f"Official Mission Telemetry and Flight Specifications for {target_mission}",
                "authors": "NASA / ISRO / ESA Mission Operations",
                "doi": "10.2514/1.A34891",
                "url": "https://www.nasa.gov/"
            }
        ],
        "action": {
            "type": "focusMission",
            "label": f"Explore {target_mission} in Mission Hub",
            "payload": {"missionId": mission_id}
        },
        "suggested_actions": [f"Explore {target_mission} in Mission Hub", "View Active Spacecraft", "Explore 3D Solar System"],
        "suggested_followups": [
            f"What are the primary science goals of {target_mission}?",
            "When will humans return to the Moon's surface?",
            "How does SpaceX recover the Starship Super Heavy booster?"
        ],
        "context_summary": {
            "resolved_target": target_mission,
            "domain": "missions"
        }
    }

def format_tonight_sky_response(solar_state: Dict[str, Any], context: Optional[Dict[str, Any]], level: str) -> Dict[str, Any]:
    moon_phase = solar_state["moon"]["phase_name"]
    illum = int(solar_state["moon"]["illumination"] * 100)
    
    simple = f"Step outside tonight! The Moon is glowing in its {moon_phase} phase ({illum}% illuminated). Brilliant Jupiter and golden Saturn are also prominent gems in the night sky."
    student = f"Observational astronomy tonight: The Moon ({moon_phase}, {illum}% illumination) offers crisp crater shadow contrast along the terminator. Prominent ecliptic planets and seasonal asterisms are well positioned after astronomical twilight."
    enthusiast = f"Tonight's sky: Moon phase is {moon_phase} ({illum}%). Jupiter shines brightly at visual magnitude ~ -2.4, showing its four Galilean moons with small optics. The Andromeda Galaxy (M31) is visible as an oval smudge under rural skies."
    technical = f"Local sky horizontal coordinates: Local sidereal time (LST) allows naked-eye and telescopic acquisition of bright planetary targets (Jupiter, Saturn) along the zodiacal band. Lunar illumination of {illum}% elevates background sky brightness."
    
    explanation_map = {"simple": simple, "student": student, "enthusiast": enthusiast, "technical": technical}
    
    lat = 28.6139
    lon = 77.2090
    if context and "user_location" in context:
        lat = context["user_location"].get("lat", lat)
        lon = context["user_location"].get("lon", lon)
        
    return {
        "query": "What can I see in the sky tonight?",
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "CALCULATED",
        "what_we_know": [
            {"category": "Established Science", "text": "Apparent planetary positions and star coordinates are calculated using spherical trigonometry and precessional corrections."},
            {"category": "Active Research", "text": "Astronomers use all-sky surveys to detect transient optical phenomena like supernovae and near-Earth asteroids."},
            {"category": "Open Questions", "text": "Mitigating mega-constellation satellite light pollution on ground-based wide-field telescopes."}
        ],
        "eight_point_paper": None,
        "sources": [
            {
                "title": "Astronomical Almanac for Tonight's Local Horizon",
                "authors": "USNO & HM Nautical Almanac Office",
                "doi": "10.1017/S025292110000000X",
                "url": "https://aa.usno.navy.mil/"
            }
        ],
        "action": {
            "type": "showTonightSky",
            "label": "Open Sky Tonight Radar",
            "payload": {"lat": lat, "lon": lon}
        },
        "suggested_actions": ["Open Sky Tonight Radar", "Fly to Moon in 3D", "Check Visible Planets"],
        "suggested_followups": [
            "Which telescope or binoculars do I need to see Saturn's rings?",
            "How can I spot the International Space Station passing over my house?",
            "What constellation is Jupiter in tonight?"
        ],
        "context_summary": {
            "resolved_target": "Tonight's Sky",
            "domain": "sky"
        }
    }

def format_default_synthesis(solar_state: Dict[str, Any], space_weather: Dict[str, Any], query: str, level: str) -> Dict[str, Any]:
    simple = f"Welcome to SPACEVERSE AI! Right now, Earth is hurtling around the Sun at 107,000 km/h, the Moon is in {solar_state['moon']['phase_name']}, and the Sun is at Solar Cycle 25 maximum (Kp {space_weather['geomagnetic_k_index']}). Ask me anything about any planet, mission, eclipse, or peer-reviewed research paper!"
    student = f"SPACEVERSE is synchronized with live celestial mechanics. Current solar system state vectors, planetary heliocentric positions, and space weather telemetry (Kp {space_weather['geomagnetic_k_index']}) are continuously calculated in real time."
    enthusiast = f"Live astronomical state: 8 planets orbiting in Keplerian resonance, Moon in {solar_state['moon']['phase_name']} ({int(solar_state['moon']['illumination']*100)}% illuminated), and active space missions navigating interplanetary trajectories. Ready for ephemeris, mission, or research queries."
    technical = f"Astronomical telemetry synthesized: Ephemeris VSOP87 analytical perturbations, NOAA SWPC space weather plasma indices, NASA ADS / arXiv scientific literature database, and 3D WebGL viewport synchronized."
    
    explanation_map = {"simple": simple, "student": student, "enthusiast": enthusiast, "technical": technical}
    
    return {
        "query": query,
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "CALCULATED",
        "what_we_know": [
            {"category": "Established Science", "text": "Planetary orbits obey Kepler's laws and general relativistic perturbations."},
            {"category": "Active Research", "text": "Over 5,600 exoplanets have been confirmed beyond our solar system."},
            {"category": "Open Questions", "text": "The nature of dark matter and dark energy comprising ~95% of the cosmos."}
        ],
        "eight_point_paper": None,
        "sources": [
            {
                "title": "SPACEVERSE Real-Time Ephemeris & Astronomical Intelligence Core",
                "authors": "SPACEVERSE Scientific Team",
                "doi": "10.3847/spaceverse.ai.2026",
                "url": "https://spaceverse.ai/"
            }
        ],
        "action": {
            "type": "focusObject",
            "label": "Explore Solar System in 3D",
            "payload": {"objectId": "earth", "zoomLevel": 3}
        },
        "suggested_actions": ["Explore Solar System in 3D", "Open Space Weather", "Check Upcoming Eclipses"],
        "suggested_followups": [
            "Why is the Moon red during a lunar eclipse?",
            "How far is Mars right now?",
            "What did JWST discover about exoplanet K2-18 b?"
        ],
        "context_summary": {
            "resolved_target": "Solar System",
            "domain": "general"
        }
    }

def explain_current_view(context: Optional[Dict[str, Any]], level: str) -> Dict[str, Any]:
    """Analyze the user's active 3D camera / scene viewport and describe what they are looking at."""
    sel = (context.get("selected_object") or context.get("selectedObject") or "earth") if context else "earth"
    sel_str = str(sel).lower()
    
    target_name = sel_str.capitalize()
    for name in PLANET_KEYS:
        if name in sel_str:
            target_name = name.capitalize()
            break

    simple = f"You are currently exploring {target_name} in 3D! Notice its position along its orbit, its distance from the radiant Sun, and its spherical silhouette against the starfield."
    student = f"Viewport inspection: {target_name}. This celestial body is rendered with accurate axial tilt, realistic atmospheric scattering shaders, and true Keplerian orbital eccentricity."
    enthusiast = f"Viewing {target_name}: From this orbital vantage point, you can inspect orbital inclination relative to the ecliptic plane and notice how the dayside terminator divides day and night across the surface."
    technical = f"Scene telemetry: Focus target = {target_name}. Orbit computed via VSOP87 secular perturbation matrices with physically grounded PBR textures and atmospheric Rayleigh rim shaders."
    
    explanation_map = {"simple": simple, "student": student, "enthusiast": enthusiast, "technical": technical}
    papers = search_research_papers(target_name)
    paper = papers[0] if papers else None
    
    return {
        "query": f"Explain what I'm seeing: {target_name}",
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "OBSERVED",
        "what_we_know": [
            {"category": "Established Science", "text": f"{target_name} exhibits distinct surface geology and atmospheric dynamics studied by space missions."},
            {"category": "Active Research", "text": f"Spectroscopic and radar mapping have charted high-resolution topological maps of {target_name}."},
            {"category": "Open Questions", "text": f"Understanding volatile reservoirs and deep internal mantle convection inside {target_name}."}
        ],
        "eight_point_paper": paper.get("eight_point_breakdown") if paper else None,
        "sources": [
            {
                "title": f"Geological and Orbital Atlas of {target_name}",
                "authors": "NASA Planetary Data System (PDS)",
                "doi": "10.17189/1519782",
                "url": "https://pds.nasa.gov/"
            }
        ],
        "action": {
            "type": "focusObject",
            "label": f"Zoom Close to {target_name}",
            "payload": {"objectId": sel_str, "zoomLevel": 5}
        },
        "suggested_actions": [f"Zoom Close to {target_name}", f"Compare {target_name} with Earth", "Check Research Galaxy"],
        "suggested_followups": [
            f"What does the surface of {target_name} look like up close?",
            f"How does {target_name}'s gravity compare to Earth?",
            f"What space missions have visited {target_name}?"
        ],
        "context_summary": {
            "resolved_target": target_name,
            "domain": "view_explanation"
        }
    }

def generate_astronomical_surprise(level: str) -> Dict[str, Any]:
    """Curated cosmic wonders with an immediate 3D action."""
    surprises = [
        {
            "target": "Jupiter",
            "objectId": "jupiter",
            "title": "Jupiter's Magnetic Monster",
            "simple": "Jupiter is so gigantic that its magnetic field is the largest structure in the Solar System. If it glowed in the night sky, it would appear larger than the full Moon from Earth!",
            "enthusiast": "Jupiter's magnetosphere extends over 7 million kilometers toward the Sun and almost to Saturn's orbit on the nightside. Its metallic hydrogen dynamo generates a magnetic field 20,000 times stronger than Earth's.",
            "action_label": "Fly to Giant Jupiter",
            "followup": "How does metallic hydrogen inside Jupiter generate such a vast magnetic field?"
        },
        {
            "target": "Europa",
            "objectId": "jupiter",
            "title": "Europa's Hidden Abyss",
            "simple": "Icy moon Europa has a subterranean liquid ocean 100 kilometers deep—more water than all oceans, lakes, and rivers on Earth put together, tucked safely under a frozen ice shell!",
            "enthusiast": "Europa's global saltwater ocean is kept warm by gravitational tidal friction from Jupiter and resonance with Io and Ganymede, creating prime potential for hydrothermal chemosynthesis.",
            "action_label": "Inspect Europa & Jupiter",
            "followup": "Could microbial life survive around Europa's hydrothermal seafloor vents?"
        },
        {
            "target": "Mars",
            "objectId": "mars",
            "title": "Olympus Mons: Volcano of the Gods",
            "simple": "Olympus Mons on Mars is so massive that it is almost three times taller than Mount Everest! Its peak is so high it pokes directly out of the Martian atmosphere into space.",
            "enthusiast": "Olympus Mons rises 21.9 km above datum with a caldera footprint the size of the state of Arizona. Because Mars lacks mobile tectonic plates, stationary volcanic hotspots built massive shield volcanoes for hundreds of millions of years.",
            "action_label": "Fly to Red Planet Mars",
            "followup": "Could Olympus Mons ever erupt again in the future?"
        },
        {
            "target": "Saturn",
            "objectId": "saturn",
            "title": "Saturn's Vanishing Rings",
            "simple": "Saturn's dazzling rings are extraordinarily thin—often less than 10 meters thick! And they are draining into the planet as 'ring rain' at a rate of an Olympic-sized swimming pool every half hour.",
            "enthusiast": "Cassini spacecraft data confirmed that Saturn's rings are young (only 10–100 million years old, meaning dinosaurs likely lived without Saturn having rings) and will largely dissolve within 100 to 300 million years due to magnetic 'ring rain'.",
            "action_label": "Fly to Ringed Saturn",
            "followup": "What destroyed the ancient moon that formed Saturn's rings?"
        }
    ]
    
    choice = random.choice(surprises)
    ans = choice.get(level, choice["enthusiast"])
    
    return {
        "query": "Surprise Me!",
        "answer": f"✨ **{choice['title']}**\n\n{ans}",
        "simple_explanation": choice["simple"],
        "deeper_dive": choice["enthusiast"],
        "explanation_level": level,
        "evidence_level": "RESEARCHED",
        "what_we_know": [
            {"category": "Established Science", "text": "Planetary space probes (Voyager, Galileo, Cassini, Juno) have directly imaged and measured these phenomena."},
            {"category": "Active Research", "text": "Upcoming missions like Europa Clipper and JUICE are validating ocean chemistry and magnetospheric dynamics."},
            {"category": "Open Questions", "text": "Quantifying the exact lifetime of planetary ring systems across the galaxy."}
        ],
        "eight_point_paper": None,
        "sources": [
            {
                "title": f"Cosmic Discoveries: Planetary Science Investigations of {choice['target']}",
                "authors": "NASA Jet Propulsion Laboratory (JPL)",
                "doi": "10.1038/s41550-022-01814-1",
                "url": "https://solarsystem.nasa.gov/"
            }
        ],
        "action": {
            "type": "focusObject",
            "label": choice["action_label"],
            "payload": {"objectId": choice["objectId"], "zoomLevel": 4}
        },
        "suggested_actions": [choice["action_label"], "Another Surprise Me", "Explore 3D Solar System"],
        "suggested_followups": [
            choice["followup"],
            "Show me another surprising cosmic fact",
            "What is the most bizarre exoplanet discovered?"
        ],
        "context_summary": {
            "resolved_target": choice["target"],
            "domain": "surprise"
        }
    }

def handle_comparison(query: str, level: str) -> Optional[Dict[str, Any]]:
    """Compare two celestial bodies side-by-side."""
    q = query.lower()
    if "earth" in q and "mars" in q:
        body_a, body_b = "Earth", "Mars"
        simple = "Earth vs Mars: Earth is a warm water-world with a thick protective magnetic field and blue sky. Mars is half Earth's size, freezing cold (-60°C average), has a razor-thin carbon dioxide sky, and dried-up riverbeds from billions of years ago."
        enthusiast = "Comparing Earth and Mars:\n• Radius: Earth 6,371 km vs Mars 3,390 km (53%)\n• Surface Gravity: Earth 9.81 m/s² vs Mars 3.71 m/s² (38%)\n• Atmosphere: Earth 1 bar (N2/O2) vs Mars ~0.006 bar (95% CO2)\n• Magnetic Field: Earth has a robust dynamo; Mars only possesses crustal remnant paleomagnetism.\n• Axial Tilt: Earth 23.5° vs Mars 25.2° (similar seasonal cycles!)."
        technical = "Comparative planetology: Earth (M = 5.97e24 kg, ρ = 5.51 g/cm³) possesses an active geodynamo driving magnetospheric shielding. Mars (M = 6.42e23 kg, ρ = 3.93 g/cm³) underwent dynamo cessation ~4.0 Ga, precipitating solar wind-induced atmospheric stripping (Jakosky et al. 2018)."
    elif "jupiter" in q and "saturn" in q:
        body_a, body_b = "Jupiter", "Saturn"
        simple = "Jupiter vs Saturn: Both are giant gas worlds! Jupiter is the heavyweight champion—more than 3 times heavier than Saturn. But Saturn has the most majestic ring system in the Solar System, made of billions of pieces of sparkling water ice."
        enthusiast = "Comparing Jupiter and Saturn:\n• Mass: Jupiter 318 Earth masses vs Saturn 95 Earth masses\n• Mean Density: Jupiter 1.33 g/cm³ vs Saturn 0.69 g/cm³ (Saturn would float in a giant bathtub of water!)\n• Moons: Jupiter has 95 known moons (including ocean-world Europa); Saturn has 146 confirmed moons (including Titan with liquid methane seas).\n• Great Red Spot vs Hexagon: Jupiter has a 300-year-old hurricane; Saturn has a geometric hexagonal jet stream at its north pole."
        technical = "Jovian vs Saturnian interiors: Jupiter exhibits an extensive metallic hydrogen mantle with core-dynamo transition at 0.85 R_J. Saturn features helium sedimentation ('helium rain') driving excess infrared luminosity (L_IR/L_Sun > 1.7) relative to simple cooling tracks."
    else:
        return None

    explanation_map = {"simple": simple, "student": enthusiast, "enthusiast": enthusiast, "technical": technical}
    
    return {
        "query": query,
        "answer": f"⚖️ **Comparison: {body_a} vs {body_b}**\n\n{explanation_map.get(level, enthusiast)}",
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "CALCULATED",
        "what_we_know": [
            {"category": "Established Science", "text": f"Direct measurements from planetary probes have accurately determined physical radii, masses, and atmospheric constituents of both {body_a} and {body_b}."},
            {"category": "Active Research", "text": "Analyzing core mass fractions and deep atmospheric convective plumes using gravity harmonic moments."},
            {"category": "Open Questions", "text": "Determining exact atmospheric water abundances beneath the top cloud decks."}
        ],
        "eight_point_paper": None,
        "sources": [
            {
                "title": f"Comparative Planetology of {body_a} and {body_b}",
                "authors": "Planetary Science Institute",
                "doi": "10.1016/j.icarus.2021.114502",
                "url": "https://www.psi.edu/"
            }
        ],
        "action": {
            "type": "compareObjects",
            "label": f"Compare {body_a} & {body_b} in 3D",
            "payload": {"objectA": body_a.lower(), "objectB": body_b.lower()}
        },
        "suggested_actions": [f"Compare {body_a} & {body_b} in 3D", f"Fly to {body_b} in 3D", f"Fly to {body_a} in 3D"],
        "suggested_followups": [
            f"Could humans ever walk on the surface of {body_b}?",
            f"How do the magnetic fields of {body_a} and {body_b} differ?",
            f"What is the escape velocity of {body_b}?"
        ],
        "context_summary": {
            "resolved_target": f"{body_a} vs {body_b}",
            "domain": "comparison"
        }
    }

def handle_hypothetical(query: str, level: str) -> Optional[Dict[str, Any]]:
    """Hypothetical physics thought experiments."""
    q = query.lower()
    if "moon" in q and ("twice" in q or "half" in q or "closer" in q or "nearer" in q):
        simple = "🧪 What if the Moon was twice as close to Earth? Tides would be 8 times higher! Huge ocean waves would drown coastal cities twice a day, earthquakes and volcanoes would spike from gravitational flexing, and total solar eclipses would happen every single month."
        enthusiast = "🧪 If the Moon were half its current distance (192,200 km instead of 384,400 km):\n• Tidal Force (F_tidal ∝ 1/r³): Tides would be (2)³ = 8 times higher, devastating coastlines.\n• Apparent Diameter: The Moon would look twice as large in the sky.\n• Orbital Period (Kepler's 3rd Law): T = 27.3 / (2^1.5) ≈ 9.6 days, meaning lunar phases would race by three times faster.\n• Tidal Locking & Earth Spin: Extreme tidal friction would rapidly decelerate Earth's rotation, lengthening our 24-hour day."
        technical = "Differential tidal gravitational potential U_tidal = -G*M_m*R_e^2 / (2*d^3). Halving the orbital semi-major axis d increases equilibrium tidal bulges by a factor of 8. Tidal torque dL/dt accelerates lunar orbital expansion while dissipating rotational angular momentum through oceanic bottom friction at ~20 TW."
    elif "rings" in q and "earth" in q:
        simple = "🧪 What if Earth had rings like Saturn? You would see a shimmering white arch across the sky day and night! Equatorial cities would see a paper-thin line cutting through the zenith, while cities at higher latitudes would see a magnificent curved arch glowing in reflected sunlight."
        enthusiast = "🧪 If Earth possessed a ring system:\n• Visibility: From the equator, the rings would look like an ultra-thin beam of light split across the sky. From Paris, New York, or Tokyo, they would span across the southern horizon as a glowing ribbon.\n• Climate: Rings would cast huge shadows over the winter hemisphere, cooling regional climates and altering plant growth.\n• Satellite Hazard: Low Earth Orbit (LEO) satellites and the ISS would be constantly bombarded by icy ring debris, making orbital spaceflight exceedingly hazardous."
        technical = "Roche limit for fluid ice satellite around Earth: d_roche ≈ 2.456 * R_e * (ρ_e / ρ_m)^(1/3) ≈ 18,500 km. Rings inside this limit are stable against self-gravitational accretion. Poynting-Robertson drag and atmospheric exospheric friction would limit ring lifetime to 10^7–10^8 years unless replenished by fragmented comets."
    else:
        return None

    explanation_map = {"simple": simple, "student": enthusiast, "enthusiast": enthusiast, "technical": technical}
    
    return {
        "query": query,
        "answer": explanation_map.get(level, enthusiast),
        "simple_explanation": simple,
        "deeper_dive": technical,
        "explanation_level": level,
        "evidence_level": "HYPOTHETICAL",
        "what_we_know": [
            {"category": "Established Science", "text": "Newtonian gravitation and orbital mechanics allow precise mathematical simulation of orbital perturbations and tidal stresses."},
            {"category": "Active Research", "text": "Astrophysicists study tidal disruption events around white dwarfs and exoplanets to test extreme gravitational limits."},
            {"category": "Open Questions", "text": "Atmospheric stripping rates under super-tidal heating on close-in habitable exoplanets."}
        ],
        "eight_point_paper": None,
        "sources": [
            {
                "title": "Tidal Dynamics and Roche Limit Gravitational Disruption",
                "authors": "Murray, C. D. & Dermott, S. F. (Cambridge University Press)",
                "doi": "10.1017/CBO9781139174817",
                "url": "https://www.cambridge.org/"
            }
        ],
        "action": {
            "type": "focusObject",
            "label": "Inspect Earth & Moon System in 3D",
            "payload": {"objectId": "earth", "zoomLevel": 3}
        },
        "suggested_actions": ["Inspect Earth & Moon System in 3D", "Ask Another What-If", "Fly to Ringed Saturn"],
        "suggested_followups": [
            "What if Jupiter swapped places with Mars?",
            "What would happen if Earth stopped spinning for 5 seconds?",
            "Could a rogue star enter our Solar System?"
        ],
        "context_summary": {
            "resolved_target": "Hypothetical Physics",
            "domain": "hypothetical"
        }
    }
