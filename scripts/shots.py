"""Take the four Leonida Ledger screenshots with Playwright.

Serves app/ on a local port, seeds 12 earned trophies (ids 2, 3, 4, 8, 10,
16, 21, 35, 44, 46, 51, 55) with the spoiler setting on, then captures each
tab at 1280x800 as JPEG quality 82 — the same views shots.json lists.

Usage: python3 scripts/shots.py [--port 8123]
"""
import json
import os
import subprocess
import sys
import time
import urllib.request

PORT = int(sys.argv[sys.argv.index("--port") + 1]) if "--port" in sys.argv else 8123
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = json.load(open(os.path.join(ROOT, "shots.json")))
SEED = [2, 3, 4, 8, 10, 16, 21, 35, 44, 46, 51, 55]

server = subprocess.Popen(
    ["node", "serve.ts", "--port", str(PORT)],
    cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/index.html", timeout=1)
            break
        except Exception:
            time.sleep(0.2)
    else:
        raise SystemExit("serve.ts did not come up")

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.add_init_script(
            "localStorage.setItem('leonida-ledger-v1', JSON.stringify("
            "{earned: %s, spoilers: true}));" % json.dumps(SEED))
        for shot in SHOTS:
            page.goto(f"http://127.0.0.1:{PORT}{shot['path']}", wait_until="networkidle")
            page.wait_for_timeout(400)
            out = os.path.join(ROOT, "screenshots", shot["file"])
            page.screenshot(path=out, type="jpeg", quality=82)
            size = os.path.getsize(out)
            print(f"{shot['file']}: {size} bytes")
            assert size <= 262144, f"{shot['file']} is over the 256 KiB cap"
        browser.close()
finally:
    server.terminate()
print("all screenshots taken")
