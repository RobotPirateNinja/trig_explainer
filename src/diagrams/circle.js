// The unit circle ("Ferris wheel") and the sine wave it draws.
import { el, rad, svgPoint } from '../util.js';

const C = { x: 150, y: 150 };
const R = 110;
const G = { x: 310, w: 330 }; // wave graph: left edge and width for 0°–360°
const gx = (deg) => G.x + (deg / 360) * G.w;

export function mountCircle(svg, state) {
  svg.setAttribute('viewBox', '0 0 660 300');
  const defs = el('defs', {}, svg);
  const clip = el('clipPath', { id: 'circle-clip' }, defs);
  el('rect', { x: 0, y: 4, width: 292, height: 292 }, clip);

  // Circle side
  el('line', { x1: 18, y1: C.y, x2: 282, y2: C.y, class: 'axis' }, svg);
  el('line', { x1: C.x, y1: 18, x2: C.x, y2: 282, class: 'axis' }, svg);
  el('circle', { cx: C.x, cy: C.y, r: R, class: 'unit-circle', 'data-term': 'unit-circle' }, svg);

  const tanGroup = el('g', { 'clip-path': 'url(#circle-clip)' }, svg);
  el('line', { x1: C.x + R, y1: -10, x2: C.x + R, y2: 310, class: 'tangent-line', 'data-term': 'tangent-line' }, tanGroup);
  const tanRay = el('line', { class: 'tan-ray' }, tanGroup);
  const tanSeg = el('line', { class: 'side side-tan', 'data-term': 'tangent' }, tanGroup);
  const tanLbl = el('text', { class: 'lbl lbl-tan', 'data-term': 'tangent' }, svg);

  const radius = el('line', { class: 'side side-hyp thin', 'data-term': 'radius' }, svg);
  const radiusLbl = el('text', { class: 'lbl lbl-hyp', 'data-term': 'radius' }, svg);
  radiusLbl.textContent = '1';
  const cosLine = el('line', { class: 'side side-cos', 'data-term': 'cosine' }, svg);
  const sinLine = el('line', { class: 'side side-sin', 'data-term': 'sine' }, svg);
  const cosLbl = el('text', { class: 'lbl lbl-cos', 'data-term': 'cosine' }, svg);
  const sinLbl = el('text', { class: 'lbl lbl-sin', 'data-term': 'sine' }, svg);
  const arc = el('path', { class: 'angle-arc', 'data-term': 'angle' }, svg);
  const thetaLbl = el('text', { class: 'lbl lbl-angle small', 'data-term': 'theta' }, svg);
  const link = el('line', { class: 'link-line' }, svg);
  const dot = el('circle', { r: 9, class: 'rider', tabindex: '0', role: 'slider', 'aria-label': 'Dot on the circle. Drag it around.' }, svg);

  // Wave side
  el('line', { x1: G.x, y1: C.y, x2: G.x + G.w + 6, y2: C.y, class: 'axis' }, svg);
  el('line', { x1: G.x, y1: C.y - R - 8, x2: G.x, y2: C.y + R + 8, class: 'axis' }, svg);
  for (const d of [90, 180, 270, 360]) {
    el('line', { x1: gx(d), y1: C.y - 4, x2: gx(d), y2: C.y + 4, class: 'axis' }, svg);
    const t = el('text', { x: gx(d), y: C.y + 20, class: 'tick', 'text-anchor': 'middle', 'data-term': 'degree' }, svg);
    t.textContent = `${d}°`;
  }
  for (const [v, txt] of [[1, '+1'], [-1, '−1']]) {
    el('line', { x1: G.x, y1: C.y - v * R, x2: G.x + G.w, y2: C.y - v * R, class: 'axis faint' }, svg);
    const t = el('text', { x: G.x - 6, y: C.y - v * R + 5, class: 'tick', 'text-anchor': 'end' }, svg);
    t.textContent = txt;
  }
  const curve = (fn) => {
    let d = '';
    for (let deg = 0; deg <= 360; deg += 3) d += `${deg ? 'L' : 'M'}${gx(deg)},${C.y - R * fn(rad(deg))} `;
    return d;
  };
  el('path', { d: curve(Math.sin), class: 'wave-ghost wave-sin', 'data-term': 'wave' }, svg);
  const cosGhost = el('path', { d: curve(Math.cos), class: 'wave-ghost wave-cos', 'data-term': 'cosine' }, svg);
  const sinTrace = el('path', { class: 'wave-trace wave-sin', 'data-term': 'wave' }, svg);
  const cosTrace = el('path', { class: 'wave-trace wave-cos', 'data-term': 'cosine' }, svg);
  const sinDot = el('circle', { r: 6, class: 'wave-dot wave-dot-sin' }, svg);
  const cosDot = el('circle', { r: 6, class: 'wave-dot wave-dot-cos' }, svg);
  const waveLbl = el('text', { x: G.x + G.w, y: 22, class: 'lbl lbl-sin small', 'text-anchor': 'end', 'data-term': 'wave' }, svg);
  waveLbl.textContent = 'the sine wave';

  const trace = (fn, upTo) => {
    let d = `M${gx(0)},${C.y - R * fn(0)}`;
    for (let deg = 2; deg < upTo; deg += 2) d += ` L${gx(deg)},${C.y - R * fn(rad(deg))}`;
    return `${d} L${gx(upTo)},${C.y - R * fn(rad(upTo))}`;
  };

  // Drag the rider around the wheel.
  let dragging = false;
  dot.addEventListener('pointerdown', (e) => {
    dragging = true;
    dot.setPointerCapture(e.pointerId);
    state.set({ playing: false });
  });
  dot.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = svgPoint(svg, e);
    let deg = Math.round((Math.atan2(C.y - p.y, p.x - C.x) * 180) / Math.PI);
    if (deg < 0) deg += 360;
    state.set({ angle: deg });
  });
  dot.addEventListener('pointerup', () => (dragging = false));
  dot.addEventListener('keydown', (e) => {
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    state.set({ angle: (state.get().angle + step + 360) % 360, playing: false });
  });

  // Play: ride around the wheel.
  let last = 0;
  const tick = (now) => {
    const s = state.get();
    if (!s.playing) return (last = 0);
    if (last) state.set({ angle: (s.angle + ((now - last) / 1000) * 40) % 360 });
    last = now;
    requestAnimationFrame(tick);
  };

  let wasPlaying = false;
  state.subscribe((s) => {
    if (s.playing && !wasPlaying) requestAnimationFrame(tick);
    wasPlaying = s.playing;

    const deg = s.angle;
    const a = rad(deg);
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    const P = { x: C.x + R * cos, y: C.y - R * sin };

    setLine(radius, C, P);
    setLine(cosLine, C, { x: P.x, y: C.y });
    setLine(sinLine, { x: P.x, y: C.y }, P);
    setPos(radiusLbl, (C.x + P.x) / 2 - 12 * sin, (C.y + P.y) / 2 - 12 * cos + 5);
    setPos(cosLbl, (C.x + P.x) / 2, C.y + (sin >= 0 ? 22 : -12));
    cosLbl.textContent = 'cos';
    setPos(sinLbl, P.x + (cos >= 0 ? 10 : -10), (C.y + P.y) / 2 + 5);
    sinLbl.setAttribute('text-anchor', cos >= 0 ? 'start' : 'end');
    sinLbl.textContent = 'sin';
    cosLbl.style.display = Math.abs(cos) < 0.12 ? 'none' : '';
    sinLbl.style.display = Math.abs(sin) < 0.12 ? 'none' : '';

    const r = 24;
    const large = deg > 180 ? 1 : 0;
    arc.setAttribute(
      'd',
      deg < 0.5 ? '' : `M${C.x + r},${C.y} A${r},${r} 0 ${large} 0 ${C.x + r * Math.cos(a)},${C.y - r * Math.sin(a)}`,
    );
    const half = a / 2;
    setPos(thetaLbl, C.x + 42 * Math.cos(half) - 10, C.y - 42 * Math.sin(half) + 5);
    thetaLbl.textContent = `${Math.round(deg)}°`;

    dot.setAttribute('cx', P.x);
    dot.setAttribute('cy', P.y);
    dot.setAttribute('aria-valuenow', Math.round(deg));

    sinTrace.setAttribute('d', trace(Math.sin, deg));
    sinDot.setAttribute('cx', gx(deg));
    sinDot.setAttribute('cy', P.y);
    setLine(link, P, { x: gx(deg), y: P.y });

    cosGhost.style.display = cosTrace.style.display = cosDot.style.display = s.showCos ? '' : 'none';
    cosTrace.setAttribute('d', trace(Math.cos, deg));
    cosDot.setAttribute('cx', gx(deg));
    cosDot.setAttribute('cy', C.y - R * cos);

    const showTan = s.showTan && Math.abs(cos) > 1e-6;
    for (const n of [tanRay, tanSeg, tanLbl]) n.style.display = showTan ? '' : 'none';
    tanGroup.querySelector('.tangent-line').style.display = s.showTan ? '' : 'none';
    if (showTan) {
      const ty = C.y - R * Math.max(-20, Math.min(20, sin / cos));
      setLine(tanRay, C, { x: C.x + R, y: ty });
      setLine(tanSeg, { x: C.x + R, y: C.y }, { x: C.x + R, y: ty });
      setPos(tanLbl, C.x + R + 8, Math.max(26, Math.min(290, (C.y + ty) / 2 + 5)));
      tanLbl.textContent = 'tan';
    }
  });
}

function setLine(node, p, q) {
  node.setAttribute('x1', p.x);
  node.setAttribute('y1', p.y);
  node.setAttribute('x2', q.x);
  node.setAttribute('y2', q.y);
}

function setPos(node, x, y) {
  node.setAttribute('x', x);
  node.setAttribute('y', y);
}

