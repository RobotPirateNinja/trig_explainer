// The draggable right triangle, with live side lengths and the three ratios.
import { el, fmt, rad, svgPoint } from '../util.js';

const A = { x: 50, y: 300 }; // corner where θ lives
const PX = 26; // pixels per length unit
export const LIMITS = { angle: [5, 85], size: [3, 10] };

export function mountTriangle(svg, state) {
  svg.setAttribute('viewBox', '0 0 440 330');

  el('rect', { x: 0, y: 0, width: 440, height: 330, fill: 'transparent' }, svg);
  const fill = el('polygon', { class: 'tri-fill' }, svg);
  const adj = el('line', { class: 'side side-cos', 'data-term': 'adjacent' }, svg);
  const opp = el('line', { class: 'side side-sin', 'data-term': 'opposite' }, svg);
  const hyp = el('line', { class: 'side side-hyp', 'data-term': 'hypotenuse' }, svg);
  const box = el('path', { class: 'right-box', 'data-term': 'right-angle' }, svg);
  const arc = el('path', { class: 'angle-arc', 'data-term': 'angle' }, svg);
  const thetaLabel = el('text', { class: 'lbl lbl-angle', 'data-term': 'theta' }, svg);

  const label = (cls, termId) => {
    const t = el('text', { class: `lbl ${cls}`, 'data-term': termId }, svg);
    const name = el('tspan', { class: 'lbl-name' }, t);
    const num = el('tspan', { class: 'lbl-num' }, t);
    return { t, name, num };
  };
  const adjL = label('lbl-cos', 'adjacent');
  const oppL = label('lbl-sin', 'opposite');
  const hypL = label('lbl-hyp', 'hypotenuse');
  adjL.name.textContent = 'adjacent ';
  oppL.name.textContent = 'opposite ';
  hypL.name.textContent = 'hypotenuse ';

  const handle = el('g', { class: 'handle', tabindex: '0', role: 'slider', 'aria-label': 'Corner of the triangle. Drag to change the angle and size.' }, svg);
  el('circle', { r: 22, class: 'handle-glow' }, handle);
  el('circle', { r: 11, class: 'handle-dot' }, handle);
  const hint = el('text', { class: 'drag-hint' }, svg);
  hint.textContent = 'drag me!';

  // Drag the top corner: its direction sets the angle, its distance the size.
  let dragging = false;
  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
    svg.classList.add('dragged');
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = svgPoint(svg, e);
    const dx = p.x - A.x;
    const dy = A.y - p.y;
    const angle = Math.round(clamp((Math.atan2(dy, dx) * 180) / Math.PI, ...LIMITS.angle));
    const size = Math.round(clamp(Math.hypot(dx, dy) / PX, ...LIMITS.size) * 10) / 10;
    state.set({ angle, size });
  });
  const stop = () => (dragging = false);
  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);
  handle.addEventListener('keydown', (e) => {
    const { angle, size } = state.get();
    const moves = {
      ArrowUp: { angle: angle + 1 },
      ArrowDown: { angle: angle - 1 },
      ArrowRight: { size: size + 0.2 },
      ArrowLeft: { size: size - 0.2 },
    };
    if (!moves[e.key]) return;
    e.preventDefault();
    const next = { ...state.get(), ...moves[e.key] };
    state.set({
      angle: clamp(next.angle, ...LIMITS.angle),
      size: Math.round(clamp(next.size, ...LIMITS.size) * 10) / 10,
    });
  });

  state.subscribe(({ angle, size }) => {
    const h = size * PX;
    const a = rad(angle);
    const B = { x: A.x + h * Math.cos(a), y: A.y - h * Math.sin(a) };
    const C = { x: B.x, y: A.y };
    const pts = (...ps) => ps.map((p) => `${p.x},${p.y}`).join(' ');

    fill.setAttribute('points', pts(A, B, C));
    line(adj, A, C);
    line(opp, C, B);
    line(hyp, A, B);

    const bs = Math.min(14, (C.x - A.x) * 0.5, (C.y - B.y) * 0.5);
    box.setAttribute('d', `M${C.x - bs},${C.y} L${C.x - bs},${C.y - bs} L${C.x},${C.y - bs}`);

    const r = 34;
    arc.setAttribute('d', `M${A.x + r},${A.y} A${r},${r} 0 0 0 ${A.x + r * Math.cos(a)},${A.y - r * Math.sin(a)}`);
    const mid = a / 2;
    thetaLabel.setAttribute('x', A.x + 50 * Math.cos(mid));
    thetaLabel.setAttribute('y', A.y - 50 * Math.sin(mid) + 6);
    thetaLabel.textContent = `θ = ${angle}°`;

    const adjLen = size * Math.cos(a);
    const oppLen = size * Math.sin(a);
    place(adjL, (A.x + C.x) / 2, A.y + 24, 'middle', fmt(adjLen, 1));
    place(oppL, C.x + 12, (C.y + B.y) / 2 + 6, 'start', fmt(oppLen, 1));
    // Hypotenuse label sits just above-left of the slanted side, tilted along it.
    const hx = (A.x + B.x) / 2 - 14 * Math.sin(a);
    const hy = (A.y + B.y) / 2 - 14 * Math.cos(a);
    place(hypL, hx, hy, 'middle', fmt(size, 1));
    hypL.t.setAttribute('transform', `rotate(${-angle} ${hx} ${hy})`);

    handle.setAttribute('transform', `translate(${B.x},${B.y})`);
    handle.setAttribute('aria-valuenow', angle);
    handle.setAttribute('aria-valuetext', `angle ${angle} degrees, hypotenuse ${fmt(size, 1)}`);
    hint.setAttribute('x', B.x + 18);
    hint.setAttribute('y', B.y - 14);
  });
}

function line(node, p, q) {
  node.setAttribute('x1', p.x);
  node.setAttribute('y1', p.y);
  node.setAttribute('x2', q.x);
  node.setAttribute('y2', q.y);
}

function place({ t, num }, x, y, anchor, value) {
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('text-anchor', anchor);
  num.textContent = value;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
