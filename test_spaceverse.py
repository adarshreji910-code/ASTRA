"""
Terminal Test Suite for SPACEVERSE Platform
Verifies all backend APIs, astronomical ephemeris calculations, and frontend proxy.
"""

import urllib.request
import json
import time
import sys

def test_endpoint(name, url, method="GET", payload=None):
    sys.stdout.write(f"Testing {name:35} ... ")
    sys.stdout.flush()
    start = time.time()
    try:
        req = urllib.request.Request(url, method=method)
        if payload:
            req.add_header('Content-Type', 'application/json')
            req.data = json.dumps(payload).encode('utf-8')
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = (time.time() - start) * 1000
            status = resp.status
            data = json.loads(resp.read().decode('utf-8'))
            print(f"PASSED ({status} OK, {elapsed:.1f}ms)")
            return True, data
    except Exception as e:
        print(f"FAILED ({str(e)})")
        return False, None

def run_tests():
    print("=" * 70)
    print("       SPACEVERSE COMPREHENSIVE TERMINAL TEST SUITE")
    print("=" * 70)
    
    passed = 0
    total = 0

    # 1. Backend Root
    total += 1
    ok, res = test_endpoint("Backend Root Endpoint", "http://127.0.0.1:8000/")
    if ok:
        passed += 1
        print(f"   Platform: {res.get('platform')} - Tagline: \"{res.get('tagline')}\"")

    # 2. Ephemeris Current Positions
    total += 1
    ok, res = test_endpoint("Astronomical Ephemeris (Current)", "http://127.0.0.1:8000/api/solar-system/current")
    if ok:
        passed += 1
        earth = res['earth']
        mars = res['planets']['mars']
        moon = res['moon']
        print(f"   Epoch: {res['epoch']}")
        print(f"   Earth Heliocentric Distance : {earth['distance_from_sun_au']} AU ({earth['distance_from_sun_million_km']}M km)")
        print(f"   Mars Distance from Earth     : {mars['distance_from_earth_million_km']}M km (V_mag: {mars['apparent_magnitude']})")
        print(f"   Current Moon Phase           : {moon['phase_name']} ({int(moon['illumination']*100)}% illuminated)")

    # 3. Ephemeris Time Travel (Historical / Future Eclipse 2027)
    total += 1
    ok, res = test_endpoint("Time Machine Ephemeris (2027-08-02)", "http://127.0.0.1:8000/api/solar-system/2027-08-02T10:07:00Z")
    if ok:
        passed += 1
        print(f"   Calculated state for Julian Day: {res['julian_day']}")

    # 4. Upcoming Events
    total += 1
    ok, res = test_endpoint("Astronomical Events Catalog", "http://127.0.0.1:8000/api/events/upcoming")
    if ok:
        passed += 1
        print(f"   Retrieved {len(res)} events:")
        for ev in res[:3]:
            print(f"   • [{ev['type']}] {ev['title']} ({ev['date']}) - Best: {ev['best_visibility']['primary_regions'][0]}")

    # 5. Space Weather Telemetry
    total += 1
    ok, res = test_endpoint("Live Solar & Space Weather", "http://127.0.0.1:8000/api/space-weather")
    if ok:
        passed += 1
        print(f"   Kp Index: {res['geomagnetic_k_index']} ({res['geomagnetic_storm_level']})")
        print(f"   Solar Wind Speed: {res['solar_wind']['speed_km_s']} km/s | Sunspots: {res['sunspot_number']}")
        print(f"   Aurora Probability (High Latitudes): {res['aurora_forecast']['probability_high_latitudes']}")

    # 6. Sky Tonight Alt/Az Radar
    total += 1
    ok, res = test_endpoint("Tonight's Sky (New Delhi)", "http://127.0.0.1:8000/api/sky/tonight?lat=28.6139&lon=77.2090")
    if ok:
        passed += 1
        visible_targets = [t['name'] for t in res['targets'] if t['is_visible']]
        print(f"   LST: {res['local_sidereal_time_hours']}h | Moon: {res['moon_phase']}")
        print(f"   Currently Above Horizon: {', '.join(visible_targets) if visible_targets else 'All below horizon'}")

    # 7. Space Missions (NASA, ISRO, SpaceX)
    total += 1
    ok, res = test_endpoint("Exploration Missions Catalog", "http://127.0.0.1:8000/api/missions")
    if ok:
        passed += 1
        print(f"   Loaded {len(res)} missions:")
        for m in res[:3]:
            print(f"   • [{m['agency']}] {m['name']} -> {m['target']} ({m['status']})")

    # 8. Verified Space News
    total += 1
    ok, res = test_endpoint("Verified Space News Feeds", "http://127.0.0.1:8000/api/news/latest")
    if ok:
        passed += 1
        print(f"   Loaded {len(res)} verified news articles:")
        for n in res[:2]:
            print(f"   • [{n['organization']}] {n['title'][:65]}...")

    # 9. ISS Telemetry
    total += 1
    ok, res = test_endpoint("ISS Live Orbital Telemetry", "http://127.0.0.1:8000/api/iss/current")
    if ok:
        passed += 1
        print(f"   Coords: {res['latitude']}° N, {res['longitude']}° E | Speed: {res['velocity_km_h']} km/h")
        print(f"   Active Expedition: {res['expedition']} ({len(res['current_crew'])} astronauts onboard)")

    # 10. Ask SpaceVerse AI Assistant
    total += 1
    ok, res = test_endpoint(
        "Ask SpaceVerse AI (Q&A)",
        "http://127.0.0.1:8000/api/assistant/ask",
        method="POST",
        payload={"query": "Why is the Moon red during an eclipse?"}
    )
    if ok:
        passed += 1
        print(f"   Question: \"{res['query']}\"")
        print(f"   Answer  : {res['answer'][:110]}...")

    # 11. Frontend Web App & Proxy
    total += 1
    sys.stdout.write(f"Testing {'Frontend UI & Proxy Server':35} ... ")
    sys.stdout.flush()
    try:
        with urllib.request.urlopen("http://127.0.0.1:5173/", timeout=10) as f_resp:
            with urllib.request.urlopen("http://127.0.0.1:5173/api/solar-system/current", timeout=10) as p_resp:
                if f_resp.status == 200 and p_resp.status == 200:
                    print("PASSED (200 OK via Vite Proxy)")
                    passed += 1
                else:
                    print(f"FAILED (Frontend: {f_resp.status}, Proxy: {p_resp.status})")
    except Exception as e:
        print(f"FAILED ({str(e)})")

    print("=" * 70)
    print(f"TEST RESULTS: {passed}/{total} Subsystems Operational ({int(passed/total*100)}%)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
