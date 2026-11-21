# LEONIDA LEDGER — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Chapo1245/gta6-trophy-guide-01-chapo124574-v4/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Chapo1245/gta6-trophy-guide-01-chapo124574-v4/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)

A free, open-source, **offline** trophy guide and tracker for Grand Theft Auto VI on PlayStation 5 — an entry for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) on make.fun.

## What it is

- **All 55 official trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — each with its official name, description and grade, plus a guide written in our own words that names its sources.
- **Tracker** — tick trophies off as you earn them; progress saves in the browser (localStorage), with **export and import** as JSON, search, and filters by kind (story, stranger, collectibles, activities, crime, money) and grade.
- **Spoiler-safe** — a spoiler toggle hides the names and descriptions of story trophies until you earn them.
- **Roadmap to Platinum** — six numbered phases, from the story (Chapters 1–5) through stranger strands, the missable sweep, collectibles, activities, and money & 100% completion.
- **Missables flagged** — 15 trophies flagged MISSABLE, with a dedicated tab explaining when each can be missed, including the Chapter 1 meditation warning for Positive Mental Attitude.
- **Collectibles at a glance** — five cards with the target numbers: 3 card sets, 100 WAiNK spots, 100 vehicles, 250 stunts, and exploring all of Leonida.
- **Fully offline** — static files under `app/`; no network requests at run time, no Rockstar logo or official artwork. The look is our own: light editorial paper, Georgia serif, teal and orange.

## The numbers (from the cited guides)

PowerPyx rates the platinum **4/10 difficulty, about 200 hours, one playthrough**, with no mission replay and free-roam after the story. The 100% Completion checklist appears under Progress → Stats after the story; it is closer to 60% true completion — only 70 of the 80 Challenges are needed, 200 of 277 vehicle models, and 100 of 255 animals. Cheats disable trophies and saving, so keep them off your platinum save.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `buildDossier` from `vendor/makefun-frontend.ts` (copied from the kit unchanged).

## Sources

Every trophy's guide cites its sources by name, with a link where the source is a page: PowerPyx, PSNProfiles, Exophase, TrueTrophies, PlayStationTrophies.org, plus Push Square, KeenGamer and GTABase. The official trophy names and descriptions are shown as PlayStation publishes them; all guide text is our own words — a source is cited, never copied.

## License

MIT — see [LICENSE](LICENSE).
