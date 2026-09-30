import urllib.request
import json
import sys

# Set standard output encoding
sys.stdout.reconfigure(encoding='utf-8')

def post(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

def get(url):
    return json.loads(urllib.request.urlopen(url).read().decode('utf-8'))

def run_tests():
    print("1. Testing Ask AI with Mars query...")
    res = post("http://127.0.0.1:8000/api/assistant/ask", {"query": "How far is Mars right now?"})
    assert "action" in res and res["action"]["type"] == "focusObject"
    assert res["evidence_level"] == "CALCULATED"
    print("   [OK] Mars response verified. Action:", res["action"]["label"])

    print("2. Testing Context-Aware pronoun resolution ('Why is it red?' with selected_object: 'mars')...")
    res2 = post("http://127.0.0.1:8000/api/assistant/ask", {
        "query": "Why is it red?",
        "context": {"selected_object": "mars"}
    })
    assert res2["context_summary"]["resolved_target"] == "Mars"
    print("   [OK] Context resolved target:", res2["context_summary"]["resolved_target"])

    print("3. Testing Scientific Research paper retrieval (MAVEN Mars atmosphere)...")
    res3 = post("http://127.0.0.1:8000/api/assistant/ask", {
        "query": "What is the research on Mars atmosphere escape?"
    })
    assert res3["evidence_level"] == "RESEARCHED"
    assert res3["eight_point_paper"] is not None
    print("   [OK] 8-Point research breakdown retrieved for:", res3["sources"][0]["title"][:45])

    print("4. Testing Explain What I'm Seeing...")
    res4 = post("http://127.0.0.1:8000/api/assistant/explain-view", {
        "context": {"selected_object": "Jupiter"}
    })
    assert res4["context_summary"]["resolved_target"] == "Jupiter"
    print("   [OK] Explain View verified for:", res4["context_summary"]["resolved_target"])

    print("5. Testing Surprise Me cosmic wonder...")
    res5 = get("http://127.0.0.1:8000/api/assistant/surprise-me")
    assert "action" in res5
    print("   [OK] Surprise Me verified:", res5["answer"][:60], "...")

    print("6. Testing Research Galaxy Graph...")
    res6 = get("http://127.0.0.1:8000/api/assistant/research/galaxy")
    assert res6["stats"]["total_papers"] >= 5
    print("   [OK] Research Galaxy verified:", res6["stats"])

    print("\nALL SPACEVERSE AI & RESEARCH TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
