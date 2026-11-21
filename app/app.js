// LEONIDA LEDGER — tracker logic for app/index.html.
//
// One module, no dependencies: it fetches app/data/trophies.json, keeps the
// earned set and the spoiler setting in localStorage, and renders the four
// tabs (Tracker, Roadmap, Missables, Collectibles) from that one data file.
// Nothing here talks to the network beyond loading the app's own files.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-ledger-v1';
const SEED_EARNED = [];

const PHASES = [
  { n: 1, title: 'Story — Chapters 1 to 5', meta: '12 trophies · 60–80 hours', text: 'Play the story straight through. Every chapter and mission trophy pops on its own, and progress you make now — vehicle scans, animal studies — already counts toward the 100% checklist even before it appears.' },
  { n: 2, title: 'Side strands — strangers of Leonida', meta: '8 trophies · do them as they appear', text: 'Finish the stranger mission strands: the five named contacts, Bret, and the rest. Strands can close off as the story moves on, so never leave one unfinished while you push the plot forward.' },
  { n: 3, title: 'Missables sweep — partner & crime', meta: '13 trophies · before the story ends', text: 'The partner trophies and the one-shot crime trophies. Do them while partner missions are flowing and the map is still full of opportunities — several cannot be set up cleanly after the credits.' },
  { n: 4, title: 'Collectibles', meta: '4 trophies · sweep region by region', text: 'Card sets, WAiNK scans, vehicle discoveries and the whole map. Scan everything unfamiliar with the WAiNK app; a scan is often all a discovery needs.' },
  { n: 5, title: 'Activities', meta: '12 trophies · races, ranges, pastimes', text: 'Stunts, shooting ranges, drone races, fishing, bowling and the rest. Gold medals at all 42 range challenges and a win at each of the 14 drone locations are also required for 100%.' },
  { n: 6, title: 'Money & 100%', meta: '6 trophies · around 100 hours', text: 'Launder Marked Bills, spend, buy the eight garages, register ten vehicles — and work the 100% Completion checklist under Progress > Stats until A Long Road pops. Then the platinum follows.' },
];

const COLLECTIBLES = [
  { num: '3', unit: 'card sets', title: 'Collectible Cards', text: 'Complete 3 full sets of the 18 in the game. 15 sets count toward the 100% checklist.', feeds: 'Don’t Touch My Deck · A Long Road' },
  { num: '100', unit: 'WAiNK spots', title: 'WAiNK It', text: 'Scan 100 locations with the WAiNK app — landmarks, curiosities, sculptures.', feeds: 'You WAiNKer! · Whip It Good' },
  { num: '100', unit: 'vehicles', title: 'Vehicle Discovery', text: 'Discover 100 vehicles; a WAiNK scan counts. The checklist wants 200 of 277 base models.', feeds: 'Whip It Good · A Long Road' },
  { num: '250', unit: 'stunts', title: 'Stunts', text: 'Complete 250 of the 397 stunts: jumps, under-bridge flights, Knife Flights, base jumps.', feeds: 'Cunning Stunts · One Last Thing' },
  { num: 'All', unit: 'of Leonida', title: 'Explore Leonida', text: 'Cover every region of the map — city, keys, swamps and towns — until nothing is blank.', feeds: 'The Goodtime State' },
];

const KIND_LABELS = { story: 'Story', stranger: 'Stranger', collectible: 'Collectibles', activity: 'Activities', crime: 'Crime', money: 'Money', completion: '100% Completion', misc: 'Misc', platinum: 'Platinum' };

let trophies = [];
let state = loadState();
let selectedId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.earned)) {
        return { earned: parsed.earned.filter((id) => Number.isInteger(id)), spoilers: parsed.spoilers !== false };
      }
    }
  } catch { /* a corrupt save starts fresh rather than breaking the page */ }
  return { earned: [...SEED_EARNED], spoilers: true };
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

const $ = (id) => document.getElementById(id);
const isEarned = (id) => state.earned.includes(id);
const isHiddenBySpoiler = (t) => state.spoilers && t.kind === 'story' && !isEarned(t.id);

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function targetLabel(t) {
  if (t.target == null) return '';
  if (t.id === 52 || t.id === 53) return '$' + Number(t.target).toLocaleString('en-US');
  if (t.id === 14) return '100%';
  return String(t.target);
}

function badgeHtml(t) {
  let html = '<span class="badge badge-' + t.grade + '">' + t.grade + '</span>';
  if (t.missable) html += '<span class="badge badge-missable">Missable</span>';
  if (t.target != null) html += '<span class="badge badge-target">Target ' + escapeHtml(targetLabel(t)) + '</span>';
  return html;
}

function rowHtml(t) {
  const hidden = isHiddenBySpoiler(t);
  const name = hidden ? 'Hidden story trophy' : escapeHtml(t.name);
  const desc = hidden ? 'Hidden until earned — turn off “Hide story spoilers” to peek.' : escapeHtml(t.description);
  const when = hidden ? '' : '<span class="trophy-when">' + escapeHtml(t.when) + '</span>';
  return '<li class="trophy-row' + (isEarned(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + '" data-id="' + t.id + '">'
    + '<input type="checkbox" data-earn="' + t.id + '"' + (isEarned(t.id) ? ' checked' : '') + ' aria-label="Earned: ' + escapeHtml(t.name) + '">'
    + '<span class="trophy-name' + (hidden ? ' spoiler-hidden' : '') + '">' + name + '</span>'
    + '<span class="badges">' + badgeHtml(t) + '</span>'
    + '<span class="trophy-desc">' + desc + '</span>' + when + '</li>';
}

function currentFilters() {
  return {
    q: $('search').value.trim().toLowerCase(),
    kind: $('filter-kind').value,
    grade: $('filter-grade').value,
    missableOnly: $('filter-missable').checked,
    unearnedOnly: $('filter-unearned').checked,
  };
}

function applyFilters(list) {
  const f = currentFilters();
  return list.filter((t) => {
    if (f.kind !== 'all' && t.kind !== f.kind) return false;
    if (f.grade !== 'all' && t.grade !== f.grade) return false;
    if (f.missableOnly && !t.missable) return false;
    if (f.unearnedOnly && isEarned(t.id)) return false;
    if (f.q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(f.q)) return false;
    return true;
  });
}

function renderList() {
  const shown = applyFilters(trophies);
  $('trophy-list').innerHTML = shown.map(rowHtml).join('') || '<li class="trophy-row">No trophies match these filters.</li>';
  $('list-meta').textContent = 'Showing ' + shown.length + ' of 55 trophies · ' + state.earned.length + ' earned · ' + trophies.filter((t) => t.missable).length + ' flagged missable';
}

function renderDetail() {
  const box = $('detail');
  const t = trophies.find((x) => x.id === selectedId) || trophies.find((x) => !isEarned(x.id) && x.grade !== 'platinum') || trophies[0];
  if (!t) { box.innerHTML = ''; return; }
  selectedId = t.id;
  const hidden = isHiddenBySpoiler(t);
  const sources = t.sources.map((s) => s.url
    ? '<li><a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a></li>'
    : '<li>' + escapeHtml(s.name) + ' (trophy list)</li>').join('');
  box.innerHTML = '<h3>' + (hidden ? 'Hidden story trophy' : escapeHtml(t.name)) + '</h3>'
    + '<p class="official">' + escapeHtml(t.description) + ' — ' + t.grade + ' · ' + escapeHtml(KIND_LABELS[t.kind] || t.kind) + (t.missable ? ' · MISSABLE' : '') + '</p>'
    + '<p class="earned-line">' + (isEarned(t.id) ? '✓ Earned — ticked off in your ledger.' : 'Not earned yet.') + '</p>'
    + '<h4>Guide</h4><p>' + (hidden ? 'The guide is hidden with the spoiler setting. Earn this trophy, or turn the spoiler setting off, to read it.' : escapeHtml(t.guide)) + '</p>'
    + '<h4>When</h4><p>' + escapeHtml(t.when) + '</p>'
    + '<h4>Sources</h4><ul class="source-list">' + sources + '</ul>';
}

function renderProgress() {
  const earned = state.earned.length;
  const pct = Math.round((earned / 55) * 100);
  $('earned-count').textContent = earned;
  $('progress-fill').style.width = pct + '%';
  $('progress-bar').setAttribute('aria-valuenow', String(earned));
  $('progress-pct').textContent = pct + '% to the platinum';
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && isEarned(t.id)).length;
    $('count-' + grade).textContent = got + '/' + total;
  }
  // The platinum is earned last by definition, so "next up" is the first
  // unearned trophy that is not the platinum itself.
  const next = trophies.find((t) => !isEarned(t.id) && t.grade !== 'platinum');
  $('next-up').textContent = next ? (isHiddenBySpoiler(next) ? 'a hidden story trophy' : next.name) + ' — ' + next.when : 'All 55 earned — Vice Got a Price! is yours.';
}

function renderRoadmap() {
  $('timeline').innerHTML = PHASES.map((p) => {
    const members = trophies.filter((t) => t.phase === p.n);
    const done = members.filter((t) => isEarned(t.id)).length;
    const chips = members.map((t) => '<span class="chip' + (isEarned(t.id) ? ' done' : '') + '">' + escapeHtml(isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name) + (t.missable ? ' <span class="chip-miss">MISSABLE</span>' : '') + '</span>').join('');
    return '<li class="phase"><span class="phase-num">' + p.n + '</span><div>'
      + '<h3 class="phase-title">' + escapeHtml(p.title) + '</h3>'
      + '<p class="phase-meta">' + escapeHtml(p.meta) + ' · ' + done + '/' + members.length + ' earned</p>'
      + '<p>' + escapeHtml(p.text) + '</p>'
      + '<div class="phase-chips">' + chips + '</div></div></li>';
  }).join('');
}

function renderMissables() {
  $('missable-list').innerHTML = trophies.filter((t) => t.missable).map(rowHtml).join('');
}

function renderCollectibles() {
  $('collect-grid').innerHTML = COLLECTIBLES.map((c) => '<article class="collect-card">'
    + '<p class="collect-num">' + escapeHtml(c.num) + ' <small>' + escapeHtml(c.unit) + '</small></p>'
    + '<h3>' + escapeHtml(c.title) + '</h3><p>' + escapeHtml(c.text) + '</p>'
    + '<p class="feeds">Feeds: ' + escapeHtml(c.feeds) + '</p></article>').join('');
}

function renderAll() {
  renderList();
  renderDetail();
  renderProgress();
  renderRoadmap();
  renderMissables();
  renderCollectibles();
}

function showTab(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.tab === name);
  }
  for (const panel of document.querySelectorAll('.panel')) {
    panel.hidden = panel.id !== 'tab-' + name;
  }
}

function toggleEarned(id, earned) {
  state.earned = earned ? [...new Set([...state.earned, id])] : state.earned.filter((x) => x !== id);
  saveState();
  renderAll();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: 'leonida-ledger', exportedAt: new Date().toISOString(), earned: state.earned, spoilers: state.spoilers }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((id) => Number.isInteger(id) && trophies.some((t) => t.id === id)) : null;
      if (earned === null) throw new Error('no earned list');
      state.earned = earned;
      if (typeof parsed.spoilers === 'boolean') state.spoilers = parsed.spoilers;
      $('spoiler-toggle').checked = state.spoilers;
      saveState();
      renderAll();
    } catch {
      alert('That file is not a Leonida Ledger export (it needs an "earned" list of trophy numbers).');
    }
  };
  reader.readAsText(file);
}

async function boot() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  trophies = data.trophies;
  $('spoiler-toggle').checked = state.spoilers;

  document.querySelector('.trophy-list').addEventListener('click', (event) => {
    const earnBox = event.target.closest('[data-earn]');
    if (earnBox) { toggleEarned(Number(earnBox.dataset.earn), earnBox.checked); return; }
    const row = event.target.closest('.trophy-row[data-id]');
    if (row) { selectedId = Number(row.dataset.id); renderList(); renderDetail(); }
  });
  $('missable-list').addEventListener('click', (event) => {
    const earnBox = event.target.closest('[data-earn]');
    if (earnBox) { toggleEarned(Number(earnBox.dataset.earn), earnBox.checked); return; }
    const row = event.target.closest('.trophy-row[data-id]');
    if (row) { selectedId = Number(row.dataset.id); showTab('tracker'); renderAll(); }
  });
  for (const id of ['search', 'filter-kind', 'filter-grade', 'filter-missable', 'filter-unearned']) {
    $(id).addEventListener('input', renderList);
  }
  $('spoiler-toggle').addEventListener('change', (event) => {
    state.spoilers = event.target.checked;
    saveState();
    renderAll();
  });
  $('export-btn').addEventListener('click', exportProgress);
  $('import-btn').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', (event) => {
    if (event.target.files[0]) importProgress(event.target.files[0]);
    event.target.value = '';
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
  });
  window.addEventListener('hashchange', () => {
    const name = location.hash.replace('#', '') || 'tracker';
    if (['tracker', 'roadmap', 'missables', 'collectibles'].includes(name)) showTab(name);
  });
  showTab((location.hash || '#tracker').replace('#', ''));
  renderAll();
}

boot();
