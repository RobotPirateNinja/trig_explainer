import './shared/explainer.css';
import './style.css';
import './terms.js';
import { linkify, linkifyPage, renderGlossary } from './shared/glossary.js';
import { initTooltips } from './shared/tooltip.js';
import { createState, fmt, rad } from './util.js';
import { mountTriangle } from './diagrams/triangle.js';
import { mountCircle } from './diagrams/circle.js';
import { mountRelations } from './relations.js';

const $ = (id) => document.getElementById(id);
let ready = false; // missions are checked once every section is mounted

linkifyPage();
initTooltips();

// ---------- 1. Triangle + ratio cards ----------
const tri = createState({ angle: 35, size: 7 });
mountTriangle($('tri-svg'), tri);

$('tri-angle').addEventListener('input', (e) => tri.set({ angle: +e.target.value }));
$('tri-size').addEventListener('input', (e) => tri.set({ size: +e.target.value }));

let lastAngle = null;
let lastSize = null;
let flashTimer = 0;
tri.subscribe(({ angle, size }) => {
  $('tri-angle').value = angle;
  $('tri-size').value = size;
  $('tri-angle-out').textContent = `${angle}°`;
  $('tri-size-out').textContent = fmt(size, 1);

  const a = rad(angle);
  const opp = size * Math.sin(a);
  const adj = size * Math.cos(a);
  const sum = (top, topCls, bottom, bottomCls) =>
    `<span class="${topCls}">${top}</span> ÷ <span class="${bottomCls}">${bottom}</span>`;

  $('v-sin').textContent = fmt(Math.sin(a));
  $('v-cos').textContent = fmt(Math.cos(a));
  $('v-tan').textContent = fmt(Math.tan(a));
  $('s-sin').innerHTML = `${sum('opposite', 'c-sin', 'hypotenuse', 'c-hyp')} = ${fmt(opp, 1)} ÷ ${fmt(size, 1)}`;
  $('s-cos').innerHTML = `${sum('adjacent', 'c-cos', 'hypotenuse', 'c-hyp')} = ${fmt(adj, 1)} ÷ ${fmt(size, 1)}`;
  $('s-tan').innerHTML = `${sum('opposite', 'c-sin', 'adjacent', 'c-cos')} = ${fmt(opp, 1)} ÷ ${fmt(adj, 1)}`;
  $('m-sin').style.width = `${Math.sin(a) * 100}%`;
  $('m-cos').style.width = `${Math.cos(a) * 100}%`;

  // The big secret: same angle, new size, same ratios.
  if (lastAngle === angle && lastSize !== null && lastSize !== size) {
    $('same-flash').textContent = 'The sides changed size… but the ratios didn’t budge!';
    document.querySelectorAll('.ratio-value').forEach((v) => v.classList.add('pop'));
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      $('same-flash').textContent = '';
      document.querySelectorAll('.ratio-value').forEach((v) => v.classList.remove('pop'));
    }, 1800);
    missionState.sizeOnly = true;
  }
  lastAngle = angle;
  lastSize = size;
  checkMissions();
});

// ---------- 2. Circle ----------
const circ = createState({ angle: 40, playing: false, showCos: false, showTan: false });
mountCircle($('circle-svg'), circ);

$('circle-angle').addEventListener('input', (e) => circ.set({ angle: +e.target.value, playing: false }));
$('circle-play').addEventListener('click', () => circ.set({ playing: !circ.get().playing }));
$('show-cos').addEventListener('change', (e) => circ.set({ showCos: e.target.checked }));
$('show-tan').addEventListener('change', (e) => circ.set({ showTan: e.target.checked }));

circ.subscribe(({ angle, playing }) => {
  const deg = Math.round(angle) % 360;
  const a = rad(deg);
  $('circle-angle').value = deg;
  $('circle-angle-out').textContent = `${deg}°`;
  $('circle-play').textContent = playing ? '❚❚ Stop' : '▶ Ride';
  $('c-sin').textContent = fmt(Math.sin(a));
  $('c-cos').textContent = fmt(Math.cos(a));
  $('c-tan').textContent = deg % 180 === 90 ? 'undefined' : fmt(Math.tan(a));
  checkMissions();
});

// ---------- 3. Relations ----------
const rel = createState({ angle: 30 });
mountRelations($('relations-root'), rel);
rel.subscribe(() => checkMissions());

// ---------- 4. Missions ----------
const missionState = { sizeOnly: false };
const missions = [
  { text: 'Make the triangle’s {{sine}} exactly 0.50.', done: () => fmt(Math.sin(rad(tri.get().angle))) === '0.50' },
  { text: 'Make {{sine}} and {{cosine}} exactly equal. Which angle does it?', done: () => tri.get().angle === 45 },
  { text: 'Make the {{tangent}} bigger than 3. What does the triangle look like?', done: () => Math.tan(rad(tri.get().angle)) > 3 },
  { text: 'Change only the size of the triangle and watch the {{ratio|ratios}}.', done: () => missionState.sizeOnly },
  { text: 'Ride the circle to the very bottom, where sine is −1.', done: () => Math.round(circ.get().angle) % 360 === 270 },
  { text: 'Find a spot on the circle where sine is positive but cosine is {{negative}}.', done: () => { const d = Math.round(circ.get().angle) % 360; return d > 90 && d < 180; } },
  { text: 'In "How they’re connected", find the angle where tangent is {{undefined}}.', done: () => rel.get().angle === 90 },
];
const doneEver = new Set();
ready = true;

function checkMissions() {
  if (!ready) return;
  const list = $('mission-list');
  if (!list.children.length) {
    list.innerHTML = missions.map((m) => `<li><span class="check" aria-hidden="true"></span><span>${linkify(m.text)}</span></li>`).join('');
  }
  missions.forEach((m, i) => {
    if (m.done()) doneEver.add(i);
    list.children[i].classList.toggle('done', doneEver.has(i));
  });
  const n = doneEver.size;
  $('mission-score').textContent =
    n === missions.length ? `All ${n} missions complete. You’re a trigonometry detective!` : `${n} of ${missions.length} missions complete`;
}
checkMissions();

// ---------- 5. Word bank ----------
renderGlossary($('word-bank'));
