// LEONIDA LEDGER — gta6-trophy-guide-01 entry program (Node 22, stdlib only).
//
// The guide itself is plain static files in app/: app/index.html, its script
// and stylesheet, and app/data/trophies.json with the 55 official trophies and
// a cited guide for each. Nothing is built and nothing is fetched at run time,
// so this program only has to hand those files in: copy app/ and screenshots/
// next to this file into the output directory and write dossier.json with the
// kit's vendored buildDossier (vendor/makefun-frontend.ts, unchanged from the
// kit — the scorer rebuilds the dossier with its own copy and compares bytes).
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader /output is the real destination and the program runs
// twice; both runs must write identical bytes, so there is no timestamp or
// random value anywhere in what it writes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps, so a build that would fail the gate fails here
// instead: at most 4 screenshots of at most 256 KiB, at most 993 files and
// directories in app/ totalling at most 48 MiB, dossier text at most 160 KiB.
// The one-line summary below is the only output: the program is deterministic,
// so both grader runs print the same line and write the same bytes.
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log('leonida-ledger: wrote ' + dossierPath);
