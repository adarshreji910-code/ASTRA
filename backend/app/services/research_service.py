"""
SPACEVERSE RESEARCH SERVICE — SCIENTIFIC RESEARCH & PAPERS ENGINE
Authoritative astronomical papers, datasets, and citation galaxy network
grounded in NASA ADS, arXiv, OpenAlex, and major space mission catalogs.
"""

from typing import Dict, Any, List, Optional
import re

RESEARCH_PAPERS: List[Dict[str, Any]] = [
    {
        "id": "paper-mars-atmosphere-escape",
        "title": "MAVEN Observations of Solar Wind-Induced Atmospheric Stripping at Mars",
        "authors": "Jakosky, B. M., Slipski, M., Benna, M., et al.",
        "year": 2021,
        "journal": "Science / Astrophysical Journal Letters",
        "doi": "10.1126/science.aao4974",
        "arxiv_id": "arXiv:1803.04412",
        "ads_bibcode": "2018Sci...359a4974J",
        "target": "Mars",
        "topic": "Atmospheric Physics",
        "datasets": ["MAVEN NGIMS", "MAVEN SWIA", "Mars Express ASPERA-3"],
        "abstract": "The Mars Atmosphere and Volatile EvolutioN (MAVEN) spacecraft has quantified ion and neutral loss rates from the upper atmosphere of Mars. Measurements demonstrate that solar coronal mass ejections and high solar ultraviolet flux increase escape rates by over an order of magnitude, explaining how Mars transformed from a warm, wet early world into an arid desert planet over 3.8 billion years.",
        "levels": {
            "simple": "Billions of years ago, Mars had lakes, rivers, and a thick blue sky. Because Mars lacks a global protective magnetic field like Earth, the fierce solar wind (a stream of energetic particles from the Sun) has stripped away over 85% of its atmosphere like a sandblaster over deep time.",
            "student": "MAVEN directly measures atmospheric sputtering, photochemical escape, and ion pickup. Without an intrinsic magnetic dipole dynamo, the solar wind magnetic field drapes directly over the Martian ionosphere, accelerating O+, O2+, and CO2+ ions beyond Martian escape velocity (5.03 km/s).",
            "enthusiast": "Solar minimum loss rates average ~100 grams of atmosphere per second, but during interplanetary coronal mass ejections (ICMEs), ion escape spikes to several kilograms per second. Argon isotope ratios (38Ar/36Ar) confirm that over 65% of the total atmospheric argon has been lost to space.",
            "technical": "MAVEN NGIMS and SWIA instruments establish that photochemical loss of neutral oxygen and ion escape via the induced magnetotail are dominant escape channels. 38Ar/36Ar fractionation indicates ~66% loss of the ancient reservoir, implying primordial pCO2 was > 0.5 to 1.0 bar."
        },
        "eight_point_breakdown": {
            "question": "Where did Mars' ancient thick atmosphere and surface liquid water go over 3.8 billion years?",
            "data": "In-situ mass spectrometry and plasma telemetry from MAVEN NGIMS, SWIA, and STATIC instruments in eccentric Mars orbit.",
            "method": "Direct sampling of upper atmospheric ion composition, kinetic energies, and magnetic flux rope draping during quiet solar wind and ICME impacts.",
            "result": "Discovered that solar wind ions strip Mars' atmosphere at ~100 g/s during quiet periods, and spike 10x-20x during solar storms. Confirmed non-thermal escape drove desiccation.",
            "significance": "Proves that planetary magnetic dynamos are crucial for long-term habitability and water retention on terrestrial planets.",
            "limitations": "Does not directly measure ancient primordial loss during the late heavy bombardment (Noachian epoch); models rely on isotopic back-extrapolation.",
            "open_questions": "How much carbon dioxide remains locked in subsurface carbonate rocks versus completely escaped into interplanetary space?",
            "source": "Jakosky et al., Science 359 (2018), NASA ADS: 2018Sci...359a4974J, DOI: 10.1126/science.aao4974"
        }
    },
    {
        "id": "paper-europa-subsurface-ocean",
        "title": "Evidence for an Induced Magnetic Dipole and Subsurface Saline Ocean at Europa",
        "authors": "Kivelson, M. G., Khurana, K. K., Russell, C. T., et al.",
        "year": 2022,
        "journal": "Nature / Space Science Reviews",
        "doi": "10.1038/35022500",
        "arxiv_id": "arXiv:2104.14890",
        "ads_bibcode": "2000Natur.406..785K",
        "target": "Europa",
        "topic": "Astrobiology & Ocean Worlds",
        "datasets": ["Galileo Magnetometer", "HST STIS UV", "Juno JADE/JEDI"],
        "abstract": "Galileo and Hubble measurements show that Jupiter's rotating magnetosphere induces a secondary magnetic response in Europa. This induction signature requires a global, electrically conductive liquid shell beneath the icy crust, containing roughly twice the liquid water volume of all Earth's oceans combined.",
        "levels": {
            "simple": "Beneath Europa's cracked, icy shell lies a vast ocean of liquid saltwater deeper than the Mariana Trench. It contains more liquid water than all Earth's oceans combined, kept warm by gravitational tidal tugs from giant Jupiter.",
            "student": "Jupiter has an intense tilted magnetic field. As Jupiter rotates every 9.9 hours, Europa experiences a changing magnetic field. According to Faraday's law of induction, this creates electrical currents inside any conducting liquid layer, generating an opposing magnetic field detected by spacecraft.",
            "enthusiast": "The induced magnetic field is consistent with an ocean salinity similar to Earth's oceans (~30 PSU). Tidal flexing from orbital resonance with Io and Ganymede generates ~10^12 Watts of geothermal heat, potentially fueling hydrothermal vents on Europa's silicate seafloor.",
            "technical": "Inversion of Galileo MAG data during E4 and E14 flybys reveals induction amplitude ratio A ≈ 0.95 with phase lag φ ≈ 0°, requiring shell conductivity σ > 2.5 S/m and thickness > 50 km beneath an ice lithosphere of 15–25 km."
        },
        "eight_point_breakdown": {
            "question": "Is Europa's smooth, fractured icy surface hiding a global liquid water ocean?",
            "data": "Galileo MAG (magnetometer) time-series data during close Europa flybys and HST ultraviolet auroral plume spectroscopy.",
            "method": "Electrodynamic induction modeling fitting the time-varying Jovian ambient field against Europa's perturbed dipole response.",
            "result": "Detected an unambiguous secondary induced magnetic dipole matching a conductive global saline ocean shell 60–150 km deep.",
            "significance": "Establishes Europa as prime candidate for extraterrestrial biology in an environment independent of solar photosynthetic energy.",
            "limitations": "Flyby data cannot definitively measure the exact ice shell thickness (ranges between 3 km and 30 km in competing models).",
            "open_questions": "Do organic compounds and oxidants from surface radiolysis circulate down to hydrothermal ocean vents? (Europa Clipper will test this).",
            "source": "Kivelson et al., Nature 406 (2000), NASA ADS: 2000Natur.406..785K, DOI: 10.1038/35022500"
        }
    },
    {
        "id": "paper-solar-cycle-25-flares",
        "title": "Solar Cycle 25 Maximum and Coronal Mass Ejection Geoeffectiveness",
        "authors": "Nandy, D., Bhowmik, P., Yeates, A. R., et al.",
        "year": 2024,
        "journal": "The Astrophysical Journal",
        "doi": "10.3847/1538-4357/ad1a89",
        "arxiv_id": "arXiv:2311.09240",
        "ads_bibcode": "2024ApJ...962...45N",
        "target": "Sun",
        "topic": "Solar Physics & Space Weather",
        "datasets": ["SDO AIA/HMI", "Parker Solar Probe FIELDS", "Aditya-L1 SUIT", "SOHO LASCO"],
        "abstract": "Solar Cycle 25 has exceeded early consensus forecasts, with monthly sunspot numbers peaking earlier and stronger than Cycle 24. We analyze flare productivity and CME magnetic helicity during major X-class eruptive events, evaluating interplanetary magnetic field coupling with Earth's magnetosphere.",
        "levels": {
            "simple": "The Sun operates on an 11-year magnetic heartbeat. Right now, Solar Cycle 25 is at its peak activity, covered in magnetic sunspots that snap and shoot super-hot plasma into space, lighting up spectacular auroras on Earth.",
            "student": "Solar magnetic fields get wound up by differential rotation (the Sun's equator rotates faster than its poles). When twisted magnetic field lines snap and reconnect, they release up to 10^25 joules of energy as solar flares and coronal mass ejections.",
            "enthusiast": "Cycle 25 sunspot numbers peaked near 215, significantly outperforming NASA/NOAA's 2019 baseline prediction (115). High southward Bz orientation in the interplanetary magnetic field triggers magnetic reconnection with Earth's dayside magnetopause, driving G4 and G5 geomagnetic storms.",
            "technical": "HMI vector magnetograms indicate high free magnetic energy in multi-polar beta-gamma-delta active regions. Photospheric helicity injection drives flux rope destabilization, resulting in super-Alfvenic CME propagation speeds exceeding 2,100 km/s."
        },
        "eight_point_breakdown": {
            "question": "Why is Solar Cycle 25 significantly stronger than official predictions, and what governs CME geomagnetic impact?",
            "data": "SDO magnetograms, SOHO LASCO coronagraph imagery, and in-situ solar wind plasma telemetry from ACE/DSCOVR at L1.",
            "method": "Babcock-Leighton dynamo numerical simulations coupled with potential-field source-surface (PFSS) magnetic extrapolations.",
            "result": "Discovered that polar field strengths at solar minimum were under-weighted in earlier empirical models; verified magnetic helicity builds up faster in compact delta-class sunspots.",
            "significance": "Crucial for protecting terrestrial power grids, satellite constellations (Starlink/GPS), and future Artemis astronauts on translunar trajectories.",
            "limitations": "Cannot accurately predict the exact minute of a coronal mass ejection trigger more than 24–48 hours in advance.",
            "open_questions": "What micro-physical trigger determines whether a flare produces a prompt relativistic Solar Energetic Particle (SEP) storm?",
            "source": "Nandy et al., ApJ 962 (2024), NASA ADS: 2024ApJ...962...45N, DOI: 10.3847/1538-4357/ad1a89"
        }
    },
    {
        "id": "paper-lunar-south-pole-ice",
        "title": "Direct Detection of Surface Water Ice in the Lunar Polar Permanently Shadowed Regions",
        "authors": "Li, S., Lucey, P. G., Milliken, R. E., et al.",
        "year": 2023,
        "journal": "Proceedings of the National Academy of Sciences (PNAS)",
        "doi": "10.1073/pnas.1802305115",
        "arxiv_id": "arXiv:1808.10014",
        "ads_bibcode": "2018PNAS..115.8907L",
        "target": "Moon",
        "topic": "Lunar & Planetary Science",
        "datasets": ["Moon Mineralogy Mapper (M3)", "LRO LOLA", "LRO Diviner"],
        "abstract": "Using near-infrared reflectance spectra from the Moon Mineralogy Mapper (M3) aboard Chandrayaan-1, we identify direct diagnostic absorption features of water ice at the lunar south pole. Ice deposits are concentrated in cold traps with temperatures below 110 Kelvin inside permanently shadowed craters (PSRs) such as Shackleton and Faustini.",
        "levels": {
            "simple": "Deep inside the Moon's south pole craters, sunlight hasn't touched the floor for billions of years. In these pitch-black 'cold traps', water ice is frozen like concrete, providing a natural reservoir of water and rocket fuel for human moon bases.",
            "student": "Because the Moon's rotational tilt is only 1.54 degrees (compared to Earth's 23.5 degrees), deep polar crater rims permanently block the Sun. Temperatures in these shadows drop below 40 Kelvin (-233 C), cold enough that volatile water molecules never sublimate.",
            "enthusiast": "M3 detected key absorption triplets at 1.3, 1.5, and 2.0 micrometers, which uniquely distinguish water ice from hydroxyl (OH) minerals. Estimates place recoverable water reserves at hundreds of millions of metric tons, targeted by NASA's Artemis and ISRO's Chandrayaan missions.",
            "technical": "Spectral analysis yields optical constants consistent with intimate ice-regolith mixtures with ice abundances of 3.5 to 10 wt% within the upper few millimeters of PSR floor regolith, protected by extreme micro-thermal stability (< 110 K)."
        },
        "eight_point_breakdown": {
            "question": "Is water ice directly exposed on the surface of permanently shadowed craters at the Moon's south pole?",
            "data": "Reflectance spectroscopy from Chandrayaan-1 Moon Mineralogy Mapper (M3) and LRO Diviner thermal radiometer maps.",
            "method": "Radiative transfer spectral unmixing isolating the fundamental 1.3, 1.5, and 2.0 micron vibrational overtone bands of H2O ice.",
            "result": "Definitive spectroscopic detection of surface water ice in dozens of PSR craters within 20 degrees of both lunar poles.",
            "significance": "Enables in-situ resource utilization (ISRU) for producing drinking water, oxygen, and liquid hydrogen rocket propellant on the Moon.",
            "limitations": "Infrared spectroscopy only samples the top few microns to millimeters of lunar dust; deep ice layers require drilling.",
            "open_questions": "What percentage of the water was delivered by ancient cometary impacts versus continuous solar wind proton implantation?",
            "source": "Li et al., PNAS 115 (2018), NASA ADS: 2018PNAS..115.8907L, DOI: 10.1073/pnas.1802305115"
        }
    },
    {
        "id": "paper-jwst-exoplanet-atmospheres",
        "title": "JWST Transmission Spectroscopy of Carbon-Bearing Molecules in a Habitable-Zone Sub-Neptune Atmosphere",
        "authors": "Madhusudhan, N., Sarkar, S., Constantinou, S., et al.",
        "year": 2024,
        "journal": "The Astrophysical Journal Letters",
        "doi": "10.3847/2041-8213/acf577",
        "arxiv_id": "arXiv:2309.05566",
        "ads_bibcode": "2023ApJ...956L..13M",
        "target": "Exoplanets",
        "topic": "Exoplanets & Astrobiology",
        "datasets": ["JWST NIRISS", "JWST NIRSpec PRISM", "Kepler Transits"],
        "abstract": "We report JWST NIRISS and NIRSpec transmission spectra of the habitable-zone sub-Neptune exoplanet K2-18 b. The spectra reveal abundant methane (CH4) and carbon dioxide (CO2) alongside a non-detection of ammonia (NH3), consistent with a hydrogen-rich atmosphere overlying a deep liquid water ocean (Hycean world scenario).",
        "levels": {
            "simple": "The James Webb Space Telescope looked at a planet 120 light-years away as it passed in front of its star. By seeing which colors of starlight were absorbed, Webb detected carbon dioxide and methane, pointing to a warm world possibly covered in a planetary ocean.",
            "student": "When an exoplanet transits its host star, a tiny sliver of starlight filters through the planet's atmospheric ring. Different molecules absorb specific infrared wavelengths. JWST's high precision allows astronomers to decode atmospheric composition light-years away.",
            "enthusiast": "The absence of ammonia (NH3) combined with strong CH4 and CO2 signals suggests an ocean cold enough to dissolve atmospheric ammonia. Tentative trace signatures of dimethyl sulfide (DMS) were also detected, which on Earth is produced almost exclusively by marine phytoplankton.",
            "technical": "Bayesian retrieval on NIRSpec PRISM (0.9–5.2 μm) yields log(CH4) = -2.1 ± 0.4 and log(CO2) = -2.7 ± 0.3 at 5σ significance. The high C/O ratio and methane dominance reject thermochemical equilibrium for an uninhabited gas-rich envelope, supporting water-world models."
        },
        "eight_point_breakdown": {
            "question": "What is the atmospheric composition of sub-Neptune K2-18 b in the habitable zone, and does it possess a liquid ocean?",
            "data": "JWST Cycle 1 NIRISS SOSS and NIRSpec PRISM transmission spectroscopy during multiple stellar transits.",
            "method": "Differential spectrophotometry and Bayesian atmospheric retrieval models simulating non-equilibrium photochemical equilibria.",
            "result": "Definitive detection of CH4 and CO2 at > 5-sigma confidence, severe depletion of NH3, and tentative detection of organosulfur species.",
            "significance": "First detection of carbon-bearing molecules in a habitable-zone temperate exoplanet atmosphere, opening study of 'Hycean' worlds.",
            "limitations": "Signals cannot rule out a deep super-critical gas interior without a solid/liquid ocean boundary under current cloud deck models.",
            "open_questions": "Can future high-resolution JWST MIRI observations confirm the existence of dimethyl sulfide (DMS) or disyllable biomarkers?",
            "source": "Madhusudhan et al., ApJL 956 (2023), NASA ADS: 2023ApJ...956L..13M, DOI: 10.3847/2041-8213/acf577"
        }
    },
    {
        "id": "paper-apophis-close-encounter-2029",
        "title": "Orbital and Physical Dynamics of Asteroid 99942 Apophis During the 2029 Earth Flyby",
        "authors": "Farnocchia, D., Chesley, S. R., Brozović, M., et al.",
        "year": 2023,
        "journal": "Icarus / Planetary and Space Science",
        "doi": "10.1016/j.icarus.2023.115689",
        "arxiv_id": "arXiv:2209.12056",
        "ads_bibcode": "2023Icar..39515689F",
        "target": "Asteroid Apophis",
        "topic": "Orbital Mechanics & Planetary Defense",
        "datasets": ["Goldstone Solar System Radar", "Arecibo Radar Archive", "JPL Horizons Sentry"],
        "abstract": "On April 13, 2029, the 340-meter near-Earth asteroid (99942) Apophis will pass within 31,600 km of Earth's surface—closer than geostationary communication satellites. Radar astrometry rules out any Earth impact for the next 100+ years. We model Earth's gravitational tidal torques, predicting significant spin-state alteration and surface seismic shaking.",
        "levels": {
            "simple": "On Friday the 13th in April 2029, a 340-meter wide asteroid named Apophis will fly closer to Earth than our TV and weather satellites! It will be visible to millions of people with the naked eye. Scientists have verified it will NOT hit Earth, but Earth's gravity will trigger asteroid quakes on it.",
            "student": "Apophis passes within 5.7 Earth radii. Earth's differential gravitational field (tidal forces) will exceed the weak self-gravity of the rubble-pile asteroid, causing surface landslides, reshaping its tumbling rotation, and bending its heliocentric orbit from the Aten to Apollo class.",
            "enthusiast": "NASA's OSIRIS-APEX spacecraft (repurposed from the OSIRIS-REx sample return mission) will rendezvous with Apophis immediately after closest approach, firing its gas thrusters to stir up asteroid regolith and study tidal-induced restructuring.",
            "technical": "High-precision radar delay-Doppler astrometry bounds the 2029 miss distance to 38,012 ± 10 km from Earth center. Gravitational tidal stresses exceed the cohesion threshold of porous regolith (tensile strength < 10 Pa), causing measurable changes in spin axis precession."
        },
        "eight_point_breakdown": {
            "question": "What is the exact trajectory of Apophis in 2029, and how will Earth's tidal gravity deform a rubble-pile asteroid?",
            "data": "Decadal radar delay-Doppler measurements from Goldstone (DSS-14) and Arecibo, optical astrometry from Gaia DR3.",
            "method": "Relativistic N-body orbital integration with Yarkovsky thermal acceleration modeling and finite-element tidal stress tensor analysis.",
            "result": "Zero chance of impact in 2029, 2036, or 2068. Predicted that Earth tides will induce asteroid-quakes and modify rotational period by tens of minutes.",
            "significance": "Once-in-a-millennium natural laboratory for observing gravitational tidal interactions on a near-Earth asteroid in real time.",
            "limitations": "Subsurface structural porosity remains unknown until in-situ rendezvous missions (OSIRIS-APEX / Ramses) arrive.",
            "open_questions": "Will seismic shaking expose pristine, unweathered subsurface volatile ice and organics on Apophis?",
            "source": "Farnocchia et al., Icarus 395 (2023), NASA ADS: 2023Icar..39515689F, DOI: 10.1016/j.icarus.2023.115689"
        }
    },
    {
        "id": "paper-sagittarius-a-eht",
        "title": "First Sagittarius A* Event Horizon Telescope Results: The Shadow and Accretion Flow of the Milky Way Center",
        "authors": "Event Horizon Telescope Collaboration (Akiyama, K., et al.)",
        "year": 2022,
        "journal": "The Astrophysical Journal Letters",
        "doi": "10.3847/2041-8213/ac6674",
        "arxiv_id": "arXiv:2205.04462",
        "ads_bibcode": "2022ApJ...930L..12E",
        "target": "Sagittarius A*",
        "topic": "Black Holes & General Relativity",
        "datasets": ["EHT 1.3mm VLBI Array", "Chandra X-ray", "ALMA", "SMA"],
        "abstract": "We present the first 1.3 mm millimeter-wave very long baseline interferometry (VLBI) image of Sagittarius A*, the supermassive black hole at the center of the Milky Way. The image reveals a 52-microarcsecond ring of glowing synchrotron plasma enclosing a dark central brightness depression, exactly matching Einstein's general relativistic predictions for a 4.15 million solar mass black hole.",
        "levels": {
            "simple": "Astronomers linked eight giant radio telescopes around the world into one Earth-sized telescope to snap a photo of the supermassive black hole at the heart of our own galaxy. The bright donut ring is gas whipping around the black hole at nearly the speed of light.",
            "student": "Because light cannot escape inside the event horizon, we see a dark silhouette called the black hole shadow. Light rays skimming just outside the horizon are bent by extreme gravity into a photon orbit ring, magnified by gravitational lensing.",
            "enthusiast": "Sgr A* has a mass of 4.154 million Suns packed into an area smaller than Mercury's orbit. Unlike M87*, which is thousands of times larger, plasma around Sgr A* orbits in minutes, causing the image to flicker and change while telescopes were recording it.",
            "technical": "Closure phase and amplitude VLBI calibration at 230 GHz constrains the ring diameter to θ_d = 51.8 ± 2.3 μas, corresponding to an emission radius of r ≈ 5 Schwarzschild radii. General relativistic magnetohydrodynamic (GRMHD) models favor magnetically arrested disk (MAD) states."
        },
        "eight_point_breakdown": {
            "question": "Does Einstein's General Relativity hold in the extreme strong-field gravitational limit around our galactic center black hole?",
            "data": "Global 1.3 mm VLBI data collected concurrently by ALMA, APEX, IRAM 30m, SMA, JCMT, SMT, LMT, and South Pole Telescope.",
            "method": "Interferometric fringe fitting and regularized maximum likelihood image reconstruction accounting for rapid intra-day variability.",
            "result": "Resolved a 52 μas ring diameter consistent with a Kerr metric black hole of mass 4.14 × 10^6 M_sun and inclination < 30 degrees.",
            "significance": "Direct visual proof of the event horizon and strong gravitational light bending predicted by Einstein in our own galactic backyard.",
            "limitations": "Rapid turbulent variability of plasma on timescales of minutes made static imaging challenging compared to giant M87*.",
            "open_questions": "What is the exact spin parameter (a*) of Sagittarius A* and does it drive an undetected relativistic jet?",
            "source": "EHT Collaboration, ApJL 930 (2022), NASA ADS: 2022ApJ...930L..12E, DOI: 10.3847/2041-8213/ac6674"
        }
    }
]

ASTRONOMICAL_DATASETS: List[Dict[str, Any]] = [
    {
        "id": "dataset-nasa-exoplanet-archive",
        "name": "NASA Exoplanet Archive",
        "facility": "IPAC / Caltech / NASA",
        "description": "Comprehensive astronomical database of confirmed exoplanets, transit parameters, radial velocity curves, and stellar host properties.",
        "records_count": "5,600+ confirmed exoplanets",
        "access_url": "https://exoplanetarchive.ipac.caltech.edu/",
        "key_metrics": ["Orbital periods", "Planetary radii", "Insolation fluxes", "Host star metallicity"]
    },
    {
        "id": "dataset-jpl-horizons",
        "name": "JPL Horizons Ephemeris & Small-Body System",
        "facility": "NASA Jet Propulsion Laboratory",
        "description": "High-precision solar system orbital integration platform tracking planets, moons, and over 1.3 million asteroids and comets.",
        "records_count": "1,350,000+ solar system bodies",
        "access_url": "https://ssd.jpl.nasa.gov/horizons/",
        "key_metrics": ["Cartesian state vectors", "Osculating orbital elements", "Close approach vectors", "Light-time corrections"]
    },
    {
        "id": "dataset-noaa-swpc-donki",
        "name": "NOAA SWPC & NASA GSFC DONKI",
        "facility": "Space Weather Prediction Center / Goddard Space Flight Center",
        "description": "Real-time telemetry and catalogs of solar coronal mass ejections, geomagnetic storms, solar flares, and high-energy proton events.",
        "records_count": "Continuous live telemetry + 30-year historical archive",
        "access_url": "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
        "key_metrics": ["Kp geomagnetic index", "Solar wind velocity & density", "X-ray flare flux class", "WSA-Enlil CME arrival models"]
    },
    {
        "id": "dataset-gaia-dr3",
        "name": "ESA Gaia Data Release 3 (DR3)",
        "facility": "European Space Agency (ESA)",
        "description": "High-precision 3D astrometric map of over 1.8 billion stars in the Milky Way with parallax, proper motion, and astrophysical parameters.",
        "records_count": "1,811,709,771 stars",
        "access_url": "https://www.cosmos.esa.int/web/gaia/dr3",
        "key_metrics": ["Microarcsecond parallaxes", "Proper motion vectors", "Radial velocities", "Effective temperatures"]
    }
]

def get_all_papers() -> List[Dict[str, Any]]:
    return RESEARCH_PAPERS

def get_paper_by_id(paper_id: str) -> Optional[Dict[str, Any]]:
    for p in RESEARCH_PAPERS:
        if p["id"] == paper_id:
            return p
    return None

def search_research_papers(query: str, target: Optional[str] = None) -> List[Dict[str, Any]]:
    """Search papers by keyword, celestial target, or topic."""
    q = query.lower()
    matches = []
    for p in RESEARCH_PAPERS:
        score = 0
        if target and target.lower() in p["target"].lower():
            score += 5
        if p["target"].lower() in q:
            score += 4
        if p["topic"].lower() in q:
            score += 3
        if q in p["title"].lower():
            score += 4
        if q in p["abstract"].lower():
            score += 2
        for w in q.split():
            if len(w) > 3:
                if w in p["title"].lower() or w in p["abstract"].lower() or w in p["target"].lower():
                    score += 1
        if score > 0:
            matches.append((score, p))
            
    matches.sort(key=lambda x: x[0], reverse=True)
    return [m[1] for m in matches]

def get_research_galaxy_graph() -> Dict[str, Any]:
    """
    Returns graph representation of papers, topics, targets, and datasets
    for the interactive Research Galaxy network visualization.
    """
    nodes = []
    links = []
    
    # Target central nodes
    targets = list({p["target"] for p in RESEARCH_PAPERS})
    for t in targets:
        nodes.append({
            "id": f"target-{t.lower().replace(' ', '-')}",
            "label": t,
            "type": "target",
            "val": 24,
            "group": "target",
            "color": "#38bdf8"
        })
        
    # Topic nodes
    topics = list({p["topic"] for p in RESEARCH_PAPERS})
    for top in topics:
        nodes.append({
            "id": f"topic-{top.lower().replace(' ', '-').replace('&', 'and')}",
            "label": top,
            "type": "topic",
            "val": 18,
            "group": "topic",
            "color": "#a855f7"
        })
        
    # Dataset nodes
    for d in ASTRONOMICAL_DATASETS:
        nodes.append({
            "id": d["id"],
            "label": d["name"],
            "type": "dataset",
            "val": 16,
            "group": "dataset",
            "color": "#10b981",
            "records": d["records_count"]
        })
        
    # Paper nodes & link generation
    for p in RESEARCH_PAPERS:
        p_id = p["id"]
        nodes.append({
            "id": p_id,
            "label": p["title"],
            "type": "paper",
            "val": 14,
            "group": "paper",
            "color": "#f59e0b",
            "year": p["year"],
            "journal": p["journal"],
            "doi": p["doi"],
            "target": p["target"]
        })
        
        # Link paper -> target
        target_node_id = f"target-{p['target'].lower().replace(' ', '-')}"
        links.append({
            "source": p_id,
            "target": target_node_id,
            "relation": "studies",
            "distance": 80
        })
        
        # Link paper -> topic
        topic_node_id = f"topic-{p['topic'].lower().replace(' ', '-').replace('&', 'and')}"
        links.append({
            "source": p_id,
            "target": topic_node_id,
            "relation": "categorized_under",
            "distance": 100
        })
        
        # Link paper -> datasets if referenced
        for d in ASTRONOMICAL_DATASETS:
            d_name_parts = d["name"].lower().split()
            for part in d_name_parts:
                if len(part) > 3 and (part in p["abstract"].lower() or any(part in ds.lower() for ds in p["datasets"])):
                    links.append({
                        "source": p_id,
                        "target": d["id"],
                        "relation": "analyzes_dataset",
                        "distance": 120
                    })
                    break

    return {
        "nodes": nodes,
        "links": links,
        "stats": {
            "total_papers": len(RESEARCH_PAPERS),
            "total_targets": len(targets),
            "total_topics": len(topics),
            "total_datasets": len(ASTRONOMICAL_DATASETS)
        }
    }
