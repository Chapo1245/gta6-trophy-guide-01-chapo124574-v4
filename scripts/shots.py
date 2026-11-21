"""Take the 4 screenshots for the current variant (variant A: Vice Nights).
Serves app/ on localhost, seeds 12 earned trophies so the progress ring shows
real progress, then captures tracker / roadmap / missables / spoiler views.
Run from the repo root:  python3 scripts/shots.py
"""
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = json.load(open(os.path.join(ROOT, 'shots.json')))
# 12 earned: story ch1-2, a few activities and one missable-safe side trophy,
# so the tracker shows a believable mid-playthrough state.
EARNED = [2, 3, 4, 8, 10, 16, 21, 35, 44, 46, 51, 55]

def main():
    srv = subprocess.Popen(['node', 'serve.ts', '--port', '8123'], cwd=ROOT,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page(viewport={'width': 1280, 'height': 800})
            for shot in SHOTS:
                pg.goto('http://localhost:8123' + shot['path'])
                earned = shot.get('earned', EARNED)
                pg.evaluate(f"localStorage.setItem('vice-nights-gta6-progress-v1', JSON.stringify({earned}))")
                pg.reload()
                if shot.get('click'):
                    pg.click(shot['click'])
                    pg.wait_for_timeout(300)
                if shot.get('spoiler'):
                    pg.check('#spoiler')
                    pg.wait_for_timeout(400)
                if shot.get('scroll_to'):
                    pg.eval_on_selector(shot['scroll_to'], 'el => el.scrollIntoView({block: "start"})')
                    pg.wait_for_timeout(300)
                    pg.evaluate('window.scrollBy(0, -20)')
                    pg.wait_for_timeout(200)
                wait_for = shot.get('wait_for', '.trophy')
                pg.wait_for_selector(wait_for, timeout=10000)
                pg.wait_for_timeout(400)
                out = os.path.join(ROOT, 'screenshots', shot['file'])
                pg.screenshot(path=out, type='jpeg', quality=82)
                print(shot['file'], os.path.getsize(out), 'bytes')
            b.close()
    finally:
        srv.terminate()

if __name__ == '__main__':
    main()
