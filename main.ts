// VICE NIGHTS — gta6-trophy-guide-01 entry program (Node 22, standard library only).
// The guide itself is app/: static files a desktop browser opens at app/index.html,
// fully offline, with the 55 official trophies and a cited guide for each in
// app/data/trophies.json. This program hands it in: it copies app/ and screenshots/
// from beside this file into the output directory and writes /output/dossier.json
// with the vendored make.fun library — the dossier the judge reads. vendor/
// makefun-frontend.ts is the kit's file, unchanged: the scorer requires the dossier
// to be byte for byte what its own copy of that library writes.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader runs it as `node main.ts` with /output mounted.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(out, { recursive: true });
  cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  const shots = join(here, 'screenshots');
  if (existsSync(shots)) cpSync(shots, join(out, 'screenshots'), { recursive: true });
  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
  // bytes; the rest refuse an entry the scorer would refuse — more than 4
  // screenshots or one over 256 KiB, more than 993 app files or 48 MiB of app
  // files (app/ counts beside /output's own 1000-entry cap, its screenshots/
  // and dossier.json).
  writeFileSync(
    join(out, 'dossier.json'),
    buildDossier(out, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 50331648,
    }),
  );
}

handIn();
console.log(`LEONIDA LEDGER handed in to ${out}`);
