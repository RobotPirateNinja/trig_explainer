// "How they're connected": four live cards driven by one angle slider (0°–90°).
import { el, fmt, rad } from './util.js';
import { term } from './shared/glossary.js';

export function mountRelations(root, state) {
  root.innerHTML = `
    <div class="control-row">
      <label for="rel-angle">${term('theta', 'Angle θ')}</label>
      <input id="rel-angle" type="range" min="0" max="90" step="1" />
      <output class="big-out" id="rel-angle-out"></output>
    </div>
    <div class="rel-grid">
      <article class="rel-card">
        <h3>1. Tangent is sine ÷ cosine</h3>
        <p>${term('tangent', 'Tangent')} is ${term('opposite')} ÷ ${term('adjacent')}. If you shrink both sides by dividing by the ${term('hypotenuse')}, you get sine and cosine, and the ${term('ratio')} between them doesn’t change.</p>
        <p class="equation" id="rel-tan"></p>
        <p class="rel-note" id="rel-tan-note"></p>
      </article>
      <article class="rel-card">
        <h3>2. Sine and cosine are buddies</h3>
        <p>The two pointy corners of a ${term('right-triangle')} are ${term('complementary')}. Look from the other corner and ${term('opposite')} and ${term('adjacent')} swap places, so this angle’s sine is the other angle’s cosine. That’s where the "co" in cosine comes from!</p>
        <p class="equation" id="rel-buddy"></p>
      </article>
      <article class="rel-card">
        <h3>3. Their squares always make 1</h3>
        <p>By ${term('pythagoras', 'Pythagoras’ theorem')}, if you ${term('squared', 'square')} the sine and the cosine and add them, you always get exactly 1, whatever the angle.</p>
        <p class="equation" id="rel-sq"></p>
        <div class="sq-bar" aria-hidden="true"><span class="sq-sin"></span><span class="sq-cos"></span></div>
      </article>
      <article class="rel-card">
        <h3>4. A seesaw</h3>
        <p>As the angle grows, ${term('sine')} climbs from 0 to 1 while ${term('cosine')} slides from 1 down to 0. They meet in the middle at 45°.</p>
        <svg class="seesaw" id="rel-chart" role="img" aria-label="Sine rising and cosine falling between 0 and 90 degrees"></svg>
      </article>
    </div>`;

  const $ = (id) => root.querySelector(`#${id}`);
  const slider = $('rel-angle');
  slider.addEventListener('input', () => state.set({ angle: +slider.value }));

  // Seesaw chart: 0°–90° across, 0–1 up.
  const chart = $('rel-chart');
  const W = 300, H = 160, L = 34, T = 14, PW = 250, PH = 120;
  chart.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const X = (d) => L + (d / 90) * PW;
  const Y = (v) => T + (1 - v) * PH;
  el('line', { x1: L, y1: Y(0), x2: L + PW, y2: Y(0), class: 'axis' }, chart);
  el('line', { x1: L, y1: Y(0), x2: L, y2: Y(1), class: 'axis' }, chart);
  for (const [v, t] of [[0, '0'], [1, '1']]) Object.assign(el('text', { x: L - 6, y: Y(v) + 5, class: 'tick', 'text-anchor': 'end' }, chart), { textContent: t });
  for (const d of [0, 45, 90]) Object.assign(el('text', { x: X(d), y: Y(0) + 20, class: 'tick', 'text-anchor': 'middle' }, chart), { textContent: `${d}°` });
  const path = (fn) => Array.from({ length: 46 }, (_, i) => `${i ? 'L' : 'M'}${X(i * 2)},${Y(fn(rad(i * 2)))}`).join(' ');
  el('path', { d: path(Math.sin), class: 'wave-trace wave-sin', 'data-term': 'sine' }, chart);
  el('path', { d: path(Math.cos), class: 'wave-trace wave-cos', 'data-term': 'cosine' }, chart);
  const marker = el('line', { y1: Y(0), y2: Y(1) - 4, class: 'marker' }, chart);
  const sDot = el('circle', { r: 6, class: 'wave-dot wave-dot-sin' }, chart);
  const cDot = el('circle', { r: 6, class: 'wave-dot wave-dot-cos' }, chart);

  state.subscribe(({ angle }) => {
    slider.value = angle;
    $('rel-angle-out').textContent = `${angle}°`;
    const a = rad(angle);
    const s = Math.sin(a);
    const c = Math.cos(a);
    const sinTxt = `<span class="c-sin">sin ${angle}°</span>`;
    const cosTxt = (d) => `<span class="c-cos">cos ${d}°</span>`;

    if (angle === 90) {
      $('rel-tan').innerHTML = `<span class="c-tan">tan 90°</span> = ${fmt(s)} ÷ ${fmt(c)} = ${term('undefined', 'undefined!')}`;
      $('rel-tan-note').innerHTML = `The ${term('adjacent')} has shrunk to nothing, and you can’t divide by 0. Tangent shoots off to infinity!`;
    } else {
      $('rel-tan').innerHTML = `<span class="c-tan">tan ${angle}°</span> = ${fmt(s)} ÷ ${fmt(c)} = <b>${fmt(s / c)}</b>`;
      $('rel-tan-note').innerHTML =
        angle >= 80 ? 'Getting close to 90°: cosine is tiny, so tangent is getting HUGE.' : angle === 45 ? 'At 45° sine and cosine are equal, so tangent is exactly 1.' : '';
    }
    $('rel-buddy').innerHTML = `${sinTxt} = ${fmt(s)} &nbsp;and&nbsp; ${cosTxt(90 - angle)} = ${fmt(Math.cos(rad(90 - angle)))}<br><small>${angle}° + ${90 - angle}° = 90°</small>`;
    $('rel-sq').innerHTML = `<span class="c-sin">${fmt(s)}²</span> + <span class="c-cos">${fmt(c)}²</span> = ${fmt(s * s)} + ${fmt(c * c)} = <b>1.00</b>`;
    root.querySelector('.sq-sin').style.width = `${s * s * 100}%`;
    root.querySelector('.sq-cos').style.width = `${c * c * 100}%`;

    marker.setAttribute('x1', X(angle));
    marker.setAttribute('x2', X(angle));
    sDot.setAttribute('cx', X(angle));
    sDot.setAttribute('cy', Y(s));
    cDot.setAttribute('cx', X(angle));
    cDot.setAttribute('cy', Y(c));
  });
}
