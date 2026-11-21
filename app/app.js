// LEONIDA LEDGER — offline GTA 6 trophy tracker. Reads app/data/trophies.json
// (the 55 official trophies, each with a cited guide), keeps ticks in
// localStorage, and renders the tracker, the six-phase roadmap timeline, the
// missable list and the collectible counts. It makes no network requests: every
// word it shows comes from its own files.
const KEY = 'leonida-ledger-gta6-progress-v1';
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

const ROADMAP = [
  { title: 'Story first — Chapters 1 to 4 and the finale', body: 'Play the story straight through: Gone Fishing, then Chapters 1, 2, 3 and 4, and the final mission. Every chapter and named-mission trophy here is unmissable — except the side strands, which open between chapters and can lock out later, so clear them as they appear.', trophies: 'Just Like Paradise, Paradise Lost, T**s Ass Drug Money, Vice City, Baby!, Top Of The World, Ma, Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked, Snow Storm, You Gotta Know When to Get Off', warn: '' },
  { title: 'Side strands and strangers — before the finale', body: 'Finish the five contact finales (Andy, Kenton, Billy, Randy, Tyrone), the 8 stranger mission strands and Bret’s unique-animal hunt while the chapters are still open. A strand left for the endgame may simply stop being offered.', trophies: 'Road to Rehabilitation, This Was No Boat Accident, The Lone Rider, Supply & Demand, Spin On This!, Strangers & Freaks, Fair Game', warn: 'MISSABLE — do this phase before the final mission.' },
  { title: 'Missables sweep — partners, choices and one-time moments', body: 'With a partner beside you, lose a 4-star wanted level together and rob 3 shops back-to-back without losing the heat. Then the choice trophies, the Rhino tank moment, the showroom smash, one illegal operation per gang, and the strange encounter — each only triggers at its moment.', trophies: 'Hot Together, Retail Therapy, Actions Speak Louder, Bad Luck, I Guess, Challenging Tank, Capital Offense, Pest Control, The Truth Is Out There', warn: 'MISSABLE — 8 trophies that only trigger at their moment.' },
  { title: 'Collectibles and exploration', body: 'Sweep Leonida with the cited guides’ maps: 3 complete card sets, WAiNK at 100 locations, every meditation spot, 100 vehicles discovered, and every region of the state visited. Pair WAiNK and vehicle discovery with the exploration sweep so no trip is wasted.', trophies: 'Don’t Touch My Deck, You WAiNKer!, Positive Mental Attitude, Whip It Good, The Goodtime State', warn: '' },
  { title: 'Activities and grind', body: 'The counting trophies: 250 stunts, 20 different race wins, a Top Fun drone win at every location, gold at every shooting range challenge, 50 challenges, plus one arcade game, the fishing challenge against Cal and the bowling alley visits. All repeatable, all cumulative.', trophies: 'Cunning Stunts, Earn Cash, Not Kudos, Top Fun, The Shootist, One Last Thing, Master of None, Stick Fiddler, Baited My Tackle, Let’s Go Bowling, Ten Pin', warn: '' },
  { title: 'Money, properties and 100%', body: 'Rob 5 bank vaults and an armored truck, launder $250,000 of Marked Bills, spend $100,000 across the shops, buy every garage property and register 10 vehicles in the Scooter Bros app. That clears the last percent: 100% completion, then the platinum.', trophies: 'Maximum Withdrawal, A Classic Blitz Play, Dime on the Dollar, Treat Yo Self, Little Boxes, On the Spot, A Long Road, Vice Got a Price!', warn: '' },
];

const COLLECTIBLES = [
  { name: 'Collectible Card sets', target: '3 full sets', trophy: "Don't Touch My Deck", note: 'Cards hide in shops, interiors and out-of-the-way corners. Work one set at a time with the cited guide’s map.' },
  { name: 'WAiNK locations', target: '100 locations', trophy: 'You WAiNKer!', note: 'Open WAiNK at every new place you visit — landmarks, beaches, neighbourhoods — and the counter climbs with exploration.' },
  { name: 'Meditation spots', target: 'Every spot', trophy: 'Positive Mental Attitude', note: 'Spots sit at scenic overlooks, beaches and quiet corners of Leonida. Tick them off as you go so the last one is easy to find.' },
  { name: 'Vehicles discovered', target: '100 vehicles', trophy: 'Whip It Good', note: 'Drive or ride each new vehicle and it counts. Variety is the game: scooters to trucks, borrowed or stolen.' },
  { name: 'Regions of Leonida', target: 'All regions', trophy: 'The Goodtime State', note: 'Vice City, the beaches, the swamps, the Keys and the backcountry. Sweep the state systematically.' },
];

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let kindFilter = 'all';
let spoilerOn = false;

const $ = (id) => document.getElementById(id);
const save = () => localStorage.setItem(KEY, JSON.stringify([...earned]));
const byId = Object.fromEntries(trophies.map((t) => [t.id, t]));
const gradeLabel = (t) => t.grade.charAt(0).toUpperCase() + t.grade.slice(1);

function row(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (t.missable ? ' missable' : '');
  const spoiled = spoilerOn && t.kind === 'story' && !earned.has(t.id);
  if (spoiled) li.classList.add('spoiled');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Earned: ' + t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save(); renderAll();
  });
  const top = document.createElement('div');
  top.className = 'top';
  top.append(box);
  const body = document.createElement('div');
  const h = document.createElement('h3');
  if (spoiled) {
    h.textContent = 'Hidden story trophy — earn it to reveal';
    const s = document.createElement('span');
    s.className = 'secret'; s.textContent = ' (spoiler-safe mode is on)';
    h.append(s);
  } else {
    h.textContent = t.name;
    const g = document.createElement('span');
    g.className = 'grade grade-' + t.grade; g.textContent = gradeLabel(t);
    h.append(g);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'badge-miss'; m.textContent = 'Missable';
      h.append(m);
    }
  }
  body.append(h);
  const kind = document.createElement('p');
  kind.className = 'kind';
  kind.textContent = spoiled ? 'Story · hidden until earned' : `${t.kind} · #${t.id} of 55`;
  body.append(kind);
  if (spoiled) {
    const p = document.createElement('p');
    p.className = 'secret';
    p.textContent = 'Its name, description and guide stay hidden until you tick it earned — turn spoiler-safe mode off to see it now.';
    body.append(p);
  } else {
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = 'Official: “' + t.description + '”';
    body.append(desc);
    const guide = document.createElement('p');
    guide.className = 'guide';
    const b = document.createElement('b');
    b.textContent = 'Guide: ';
    guide.append(b, document.createTextNode(t.guide));
    body.append(guide);
    const when = document.createElement('p');
    when.className = 'when' + (t.missable ? ' miss' : '');
    when.textContent = (t.missable ? '⚠ ' : '✓ ') + t.when;
    body.append(when);
    const src = document.createElement('p');
    src.className = 'source';
    src.append(document.createTextNode('Source: ' + t.source + ' — '));
    const a = document.createElement('a');
    a.href = t.source_url; a.textContent = t.source_url; a.rel = 'noopener';
    src.append(a);
    body.append(src);
  }
  top.append(body);
  li.append(top);
  return li;
}

function filtered() {
  const q = $('search').value.trim().toLowerCase();
  const g = $('grade').value;
  return trophies.filter((t) => {
    if (g !== 'all' && t.grade !== g) return false;
    if (kindFilter === 'story' && t.kind !== 'story') return false;
    if (kindFilter === 'missable' && !t.missable) return false;
    if (kindFilter === 'collectible' && t.kind !== 'collectible') return false;
    if (kindFilter === 'activity' && t.kind !== 'activity') return false;
    if (kindFilter === 'earned' && !earned.has(t.id)) return false;
    if (kindFilter === 'todo' && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderTracker() {
  const list = filtered();
  $('rows').replaceChildren(...list.map(row));
  $('showing').textContent = `Showing ${list.length} of 55 trophies · ${earned.size} earned · ${trophies.filter((t) => t.missable && !earned.has(t.id)).length} missable still to protect`;
}

function renderProgress() {
  const n = earned.size;
  const pct = Math.round((n / trophies.length) * 100);
  $('progressLine').textContent = `${n} of ${trophies.length} earned · ${pct}%`;
  $('barFill').style.width = pct + '%';
  $('gradeCounts').textContent = 'Official list: 1 platinum · 2 gold · 6 silver · 46 bronze — ' +
    ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
      const tot = trophies.filter((t) => t.grade === g).length;
      const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
      return `${got}/${tot} ${g}`;
    }).join(' · ');
  const nextMiss = trophies.find((t) => t.missable && !earned.has(t.id));
  $('nextUp').textContent = nextMiss
    ? `Next missable to protect: ${nextMiss.name} — ${nextMiss.when}`
    : 'All 15 missable trophies are safe. On to the platinum!';
  $('missCount').textContent = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
}

function renderRoadmap() {
  $('phases').replaceChildren(...ROADMAP.map((p) => {
    const li = document.createElement('li');
    li.className = 'phase';
    const h = document.createElement('h3');
    h.textContent = p.title;
    const b = document.createElement('p');
    b.textContent = p.body;
    const t = document.createElement('p');
    t.className = 'trophies-in';
    t.textContent = 'Trophies: ' + p.trophies + '.';
    li.append(h, b, t);
    if (p.warn) {
      const w = document.createElement('p');
      w.className = 'warn';
      w.textContent = p.warn;
      li.append(w);
    }
    return li;
  }));
}

function renderMissables() {
  $('missRows').replaceChildren(...trophies.filter((t) => t.missable).map(row));
}

function renderCollectibles() {
  $('collectGrid').replaceChildren(...COLLECTIBLES.map((c) => {
    const t = trophies.find((x) => x.name === c.trophy);
    const div = document.createElement('div');
    div.className = 'collect';
    const h = document.createElement('h3');
    h.textContent = c.name;
    const target = document.createElement('p');
    target.className = 'target';
    target.textContent = c.target;
    const note = document.createElement('p');
    note.textContent = c.note;
    const trophyLine = document.createElement('p');
    trophyLine.textContent = `Trophy: ${c.trophy} (${t.grade}) — ${earned.has(t.id) ? '✓ earned' : 'not yet earned'}.`;
    const src = document.createElement('p');
    src.className = 'source';
    src.append(document.createTextNode('Source: ' + t.source + ' — '));
    const a = document.createElement('a');
    a.href = t.source_url; a.textContent = t.source_url; a.rel = 'noopener';
    src.append(a);
    div.append(h, target, note, trophyLine, src);
    return div;
  }));
}

function renderAll() {
  renderProgress();
  renderTracker();
  renderRoadmap();
  renderMissables();
  renderCollectibles();
}

function show(view) {
  for (const v of ['tracker', 'roadmap', 'missables', 'collectibles']) {
    $('view-' + v).classList.toggle('hidden', v !== view);
  }
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
}

document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => show(b.dataset.view)));
document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
  kindFilter = c.dataset.kind;
  document.querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x === c));
  renderTracker();
}));
$('search').addEventListener('input', renderTracker);
$('grade').addEventListener('change', renderTracker);
$('spoiler').addEventListener('change', (e) => { spoilerOn = e.target.checked; renderTracker(); });
$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'GTA 6', earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    earned = new Set(ids.filter((id) => byId[id]));
    save(); renderAll();
  } catch { alert('That file is not a valid progress export.'); }
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) { earned = new Set(); save(); renderAll(); }
});

const startView = ['tracker', 'roadmap', 'missables', 'collectibles'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'tracker';
show(startView);
renderAll();
