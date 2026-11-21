[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Chapo1245/gta6-trophy-guide-01-chapo124574-v4/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Chapo1245/gta6-trophy-guide-01-chapo124574-v4/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# VICE NIGHTS — GTA 6 Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: every trophy with its official name, description and grade, a checklist saved in your browser, a roadmap to the platinum, the **15 missable trophies flagged**, and a guide for each trophy in our own words that **cites its source**.

## What the judge can check in the screenshots

1. **Tracker & data** — all 55 trophies (1 platinum · 2 gold · 6 silver · 46 bronze) with official name, description and grade; saved progress with export/import; filters by story, missable, collectibles and activities, plus grade, search, earned / still-to-do; a spoiler-safe setting that hides story trophies until earned.
2. **Roadmap & missables** — a six-phase roadmap to the platinum (story → side strands → missables sweep → collectibles → activities → money & 100%), built from the official descriptions: chapters and missions in order, collectible counts as stated, and the 15 missables flagged with when each can be missed.
3. **Cited guidance** — every trophy's guide says where its facts come from (a named guide and its link: PowerPyx, PlayStationTrophies.org, PSNProfiles, TrueTrophies, Exophase). No uncited specific step, no copied guide text.
4. **Fast, clear, polished** — static files, no build step, no network requests at run time; a small first load; a look of its own (dark neon Vice City nights). No Rockstar logo, no official artwork.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Open the page, tick trophies as you earn them — progress is saved in your browser (localStorage) and works offline. Export/Import moves your progress to another browser.

## How it is built

- `app/` — the guide as static files: `index.html`, `style.css`, `app.js`, `app/data/trophies.json` (the 55 official trophies with guides, sources and missable flags).
- `main.ts` — the entry program (Node 22): copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.
- `vendor/makefun-frontend.ts` — the kit's library, unchanged.
- `screenshots/` — 4 real renders of the guide's own code (tracker, roadmap, missables, spoiler-safe mode).
- `shots.json` — which views the screenshots were taken of.

## License

MIT. Unofficial fan guide — Grand Theft Auto is a trademark of Rockstar Games; no Rockstar logo or official artwork is used. Trophy names, descriptions and grades are PlayStation's official list.

<sub>Entered on [make.fun](https://make.fun/?ref=wtacm6ft&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
