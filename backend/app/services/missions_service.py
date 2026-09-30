"""
MISSIONS & SPACE AGENCIES REPOSITORY
Active exploration missions, robotic probes, rovers, and human spaceflight programs.
"""

from typing import List, Dict, Any, Optional

MISSIONS_DATA: List[Dict[str, Any]] = [
    # NASA
    {
        "id": "mission-artemis-ii",
        "name": "Artemis II",
        "agency": "NASA",
        "type": "Crewed Lunar Flyby",
        "target": "Moon (Trans-Lunar Injection)",
        "launch_vehicle": "Space Launch System (SLS) Block 1",
        "status": "Final Preparation / Integration",
        "launch_window": "Late 2026",
        "crew": ["Reid Wiseman (Commander)", "Victor Glover (Pilot)", "Christina Koch (Mission Specialist)", "Jeremy Hansen (Mission Specialist - CSA)"],
        "description": "The first crewed mission of NASA's Artemis campaign. Four astronauts will fly Orion around the Moon on a free-return trajectory, paving the way for lunar surface landings.",
        "official_url": "https://www.nasa.gov/mission/artemis-ii/"
    },
    {
        "id": "mission-jwst",
        "name": "James Webb Space Telescope (JWST)",
        "agency": "NASA / ESA / CSA",
        "type": "Infrared Space Observatory",
        "target": "Sun-Earth L2 Lagrange Point (1.5M km)",
        "launch_vehicle": "Ariane 5 ECA",
        "status": "Active Science Operations (Cycle 4)",
        "launch_window": "Launched Dec 25, 2021",
        "description": "NASA's premier infrared observatory, studying cosmic dawn, early galaxy formation, stellar nurseries, and atmospheric composition of transiting exoplanets.",
        "official_url": "https://webbtelescope.org"
    },
    {
        "id": "mission-europa-clipper",
        "name": "Europa Clipper",
        "agency": "NASA JPL",
        "type": "Outer Planet Astrobiology Orbiter",
        "target": "Jupiter / Moon Europa",
        "launch_vehicle": "SpaceX Falcon Heavy",
        "status": "In Cruise Phase (Arrival 2030)",
        "launch_window": "Launched Oct 14, 2024",
        "description": "Investigates whether Jupiter's icy moon Europa has conditions suitable for life, performing 49 low-altitude flybys through its radiation belt.",
        "official_url": "https://europa.nasa.gov"
    },
    {
        "id": "mission-mars-perseverance",
        "name": "Mars 2020 Perseverance Rover",
        "agency": "NASA JPL",
        "type": "Mars Astrobiology Rover",
        "target": "Mars (Jezero Crater)",
        "launch_vehicle": "Atlas V 541",
        "status": "Active Surface Science / Sample Caching",
        "launch_window": "Landed Feb 18, 2021",
        "description": "Searching for signs of ancient microbial life and collecting sealed core samples in Jezero Crater's delta for the planned Mars Sample Return campaign.",
        "official_url": "https://mars.nasa.gov/mars2020/"
    },

    # ISRO
    {
        "id": "mission-gaganyaan",
        "name": "Gaganyaan Programme",
        "agency": "ISRO",
        "type": "Human Spaceflight",
        "target": "Low Earth Orbit (400 km)",
        "launch_vehicle": "Human Rated Launch Vehicle Mark 3 (HLVM3)",
        "status": "Uncrewed Test Flights (G1 & G2) underway",
        "launch_window": "2026 - 2027",
        "description": "India's landmark human spaceflight mission to demonstrate indigenous capability to launch a 3-member crew into a 400 km orbit for 3 days and return safely to Indian waters.",
        "official_url": "https://www.isro.gov.in/Gaganyaan.html"
    },
    {
        "id": "mission-chandrayaan-4",
        "name": "Chandrayaan-4 (Lunar Sample Return)",
        "agency": "ISRO",
        "type": "Lunar Sample Return",
        "target": "Moon (South Pole / Shiv Shakti vicinity)",
        "launch_vehicle": "Dual LVM3 Launches with In-Orbit Docking",
        "status": "Approved by Union Cabinet / In Development",
        "launch_window": "2028",
        "description": "India's fifth lunar mission comprising 5 modules across 2 launches: Ascender, Descender, Transfer, Re-entry, and Propulsion modules to collect and return lunar regolith to Earth.",
        "official_url": "https://www.isro.gov.in"
    },
    {
        "id": "mission-aditya-l1",
        "name": "Aditya-L1 Solar Observatory",
        "agency": "ISRO",
        "type": "Heliophysics Spacecraft",
        "target": "Sun-Earth Lagrange Point L1",
        "launch_vehicle": "PSLV-C57",
        "status": "Active Science Operations in Halo Orbit",
        "launch_window": "Launched Sep 2, 2023",
        "description": "India's first dedicated solar observatory, carrying 7 instruments to observe the photosphere, chromosphere, and solar corona, tracking CMEs and space weather.",
        "official_url": "https://www.isro.gov.in/Aditya_L1.html"
    },
    {
        "id": "mission-nisar",
        "name": "NISAR (NASA-ISRO SAR)",
        "agency": "ISRO / NASA",
        "type": "Earth Observation Radar",
        "target": "Sun-Synchronous Low Earth Orbit (747 km)",
        "launch_vehicle": "GSLV Mk II",
        "status": "Final Payload Integration at URSC Bengaluru",
        "launch_window": "Late 2026",
        "description": "Groundbreaking dual-frequency (L-band and S-band) Synthetic Aperture Radar satellite scanning Earth's land and ice surfaces every 12 days to monitor tectonic deformation, glaciers, and ecosystems.",
        "official_url": "https://nisar.jpl.nasa.gov"
    },

    # SPACEX
    {
        "id": "mission-starship-hls",
        "name": "Starship Human Landing System (HLS)",
        "agency": "SpaceX / NASA",
        "type": "Lunar Lander",
        "target": "Lunar South Pole",
        "launch_vehicle": "Starship & Super Heavy Booster",
        "status": "Integrated Flight Testing & Propellant Transfer Trials",
        "launch_window": "Artemis III / IV Target",
        "description": "Modified Starship configured to transport astronauts from lunar orbit (Orion / Gateway) to the lunar south pole surface and back, powered by Raptor vacuum engines.",
        "official_url": "https://www.spacex.com/vehicles/starship/"
    },
    {
        "id": "mission-crew-dragon-iss",
        "name": "Commercial Crew Space Station Rotations",
        "agency": "SpaceX",
        "type": "Crew Transportation",
        "target": "International Space Station (ISS)",
        "launch_vehicle": "Falcon 9 Block 5",
        "status": "Active Operational Rotation Flights",
        "launch_window": "Continuous 6-month cycles",
        "description": "Routine commercial astronaut transport to and from the ISS under NASA's Commercial Crew Program, carrying international crews and scientific cargo.",
        "official_url": "https://www.spacex.com/vehicles/dragon/"
    },

    # ESA & JAXA
    {
        "id": "mission-juice",
        "name": "JUICE (Jupiter Icy Moons Explorer)",
        "agency": "ESA",
        "type": "Gas Giant Explorer",
        "target": "Jupiter & Ganymede",
        "launch_vehicle": "Ariane 5",
        "status": "En Route to Jupiter (Arrival 2031)",
        "launch_window": "Launched April 14, 2023",
        "description": "European flagship mission to characterize Ganymede, Callisto, and Europa as planetary habitats and investigate the complex Jovian magnetosphere.",
        "official_url": "https://www.esa.int/Science_Exploration/Space_Science/Juice"
    },
    {
        "id": "mission-mmx",
        "name": "Martian Moons eXploration (MMX)",
        "agency": "JAXA",
        "type": "Phobos Sample Return",
        "target": "Mars Moons (Phobos & Deimos)",
        "launch_vehicle": "H3 Launch Vehicle",
        "status": "Assembly and Spacecraft Testing",
        "launch_window": "2026",
        "description": "JAXA mission to land on Phobos, collect pristine surface samples, observe Deimos, and return the samples to Earth to solve the origin of Mars' moons.",
        "official_url": "https://www.mmx.jaxa.jp/en/"
    }
]

def get_missions(agency: Optional[str] = None) -> List[Dict[str, Any]]:
    """Return missions filtered by space agency."""
    if agency and agency.lower() != "all":
        return [m for m in MISSIONS_DATA if agency.lower() in m["agency"].lower()]
    return MISSIONS_DATA

get_all_missions = get_missions

def get_mission_by_id(mission_id: str) -> Optional[Dict[str, Any]]:
    for m in MISSIONS_DATA:
        if m["id"] == mission_id:
            return m
    return None
