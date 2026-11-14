/* Procedural ink-wash hanging scroll in the spirit of Song-dynasty monumental landscapes.
   Original artwork, generated once as an SVG string. viewBox is VW x VH; y = VH is the bottom
   of the scroll (shown when the page starts) and y = 0 the top (shown at the finale).

   One continuous view up a valley, nearer at the bottom and farther (smaller, paler) toward the top:
   a scholar on the near bank watches a river that narrows under a stone bridge and ends at a waterfall
   pool between two cliffs. A trail climbs from the bridge past a village, up the cliff to a pavilion
   beside the falls, then across to a temple on the shoulder of the main peak. Far summits and the moon
   sit above. */
const Landscape = (() => {
  const VW = 1000, VH = 4000, INK = "#26231f", WATER = "#3d4650";
  const rand = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const f = n => n.toFixed(1);
  const line = pts => pts.map((p, i) => `${i ? "L" : "M"}${f(p[0])} ${f(p[1])}`).join(" ");

  /* ---------- river geometry: [y, centre x, width], bottom to top ---------- */
  const RIVER = [[4000, 640, 820], [3780, 610, 520], [3560, 560, 300], [3330, 520, 190], [3100, 490, 130], [2880, 474, 96], [2720, 470, 80]];
  const RIVER_TOP = 2720, FALLS_TOP = 2235, FALLS_X = 470;
  function riverAt(y) {
    for (let i = 0; i < RIVER.length - 1; i++) {
      const [y0, c0, w0] = RIVER[i], [y1, c1, w1] = RIVER[i + 1];
      if (y <= y0 && y >= y1) { const t = (y0 - y) / (y0 - y1); return { c: c0 + (c1 - c0) * t, w: w0 + (w1 - w0) * t }; }
    }
    const [, c, w] = RIVER[RIVER.length - 1]; return { c, w };
  }

  /* ---------- mountains ---------- */
  function mountain({ x0, x1, base, peak, peakX, jag = 0.12, seed, tone = 1, cun = 40, dots = 30 }) {
    const r = rand(seed), half = (x1 - x0) / 2, ph = [r() * 6, r() * 6, r() * 6], pts = [];
    for (let i = 0; i <= 70; i++) {
      const x = x0 + (x1 - x0) * i / 70, t = (x - peakX) / half, env = Math.pow(Math.max(0, 1 - t * t), 0.75);
      const n = Math.sin(x * 0.031 + ph[0]) * 0.5 + Math.sin(x * 0.077 + ph[1]) * 0.3 + Math.sin(x * 0.19 + ph[2]) * 0.2;
      pts.push([x, base - peak * env * (1 + n * jag)]);
    }
    const ridgeY = x => pts[Math.min(70, Math.max(0, Math.round((x - x0) / (x1 - x0) * 70)))][1];
    const body = `<path filter="url(#brush)" fill="url(#mtn)" d="M${x0} ${base} ${pts.map(p => `L${f(p[0])} ${f(p[1])}`).join(" ")} L${x1} ${base}Z"/>`;
    const outline = `<path d="${line(pts)}" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".45" filter="url(#brush)"/>`;
    let strokes = "", moss = "";
    for (let k = 0; k < cun; k++) {
      const x = x0 + (x1 - x0) * (0.08 + r() * 0.84), y0 = ridgeY(x) + 8 + r() * peak * 0.35, len = 25 + r() * 60, bend = (r() - 0.5) * 18;
      strokes += `<path d="M${f(x)} ${f(y0)} q${f(bend)} ${f(len / 2)} ${f(bend * 0.4)} ${f(len)}" stroke-width="${f(0.8 + r() * 1.6)}" opacity="${f(0.25 + r() * 0.35)}"/>`;
    }
    for (let k = 0; k < dots; k++) {
      const p = pts[Math.floor(r() * pts.length)];
      moss += `<ellipse cx="${f(p[0] + (r() - 0.5) * 6)}" cy="${f(p[1] + 2 + r() * 8)}" rx="${f(1.5 + r() * 2.5)}" ry="${f(1 + r() * 1.5)}"/>`;
    }
    return { svg: `<g opacity="${tone}">${body}${outline}<g stroke="${INK}" fill="none" stroke-linecap="round" filter="url(#soft)">${strokes}</g><g fill="${INK}" opacity=".7">${moss}</g></g>`, ridgeY };
  }

  /* ---------- water ---------- */
  function river() {
    const L = [], R = [];
    for (let y = VH; y >= RIVER_TOP; y -= 20) { const { c, w } = riverAt(y); L.push([c - w / 2, y]); R.push([c + w / 2, y]); }
    const bank = pts => `<path d="${line(pts)}" stroke="${INK}" stroke-width="10" opacity=".08" fill="none"/><path d="${line(pts)}" stroke="${INK}" stroke-width="1.8" opacity=".55" fill="none" filter="url(#brush)"/>`;
    const r = rand(77); let ripples = "";
    for (let k = 0; k < 70; k++) {
      const y = RIVER_TOP + 20 + r() * (VH - RIVER_TOP - 40), { c, w } = riverAt(y), len = w * (0.15 + r() * 0.25);
      ripples += `<path d="M${f(c - w / 2 + 10 + r() * (w - len - 20))} ${f(y)} h${f(len)}" stroke-width="${f(0.8 + (y / VH) * 0.8)}"/>`;
    }
    const pool = [0, 1, 2].map(k => `<ellipse cx="${FALLS_X}" cy="${RIVER_TOP + 6 + k * 10}" rx="${30 + k * 16}" ry="${4 + k * 2}"/>`).join("");
    return `${bank(L)}${bank(R)}<g stroke="${WATER}" stroke-opacity=".38" stroke-linecap="round" fill="none">${ripples}${pool}</g>`;
  }
  function waterfall() {
    const r = rand(33), w = 26; let g = `<g stroke="${WATER}" fill="none" stroke-linecap="round" opacity=".6">`;
    for (let k = 0; k < 8; k++) { const x = FALLS_X - w / 2 + (k + 0.5) * w / 8 + (r() - 0.5) * 3;
      g += `<path d="M${f(x)} ${FALLS_TOP} Q${f(x + (r() - 0.5) * 5)} ${f((FALLS_TOP + RIVER_TOP) / 2)} ${f(x)} ${RIVER_TOP}" stroke-width="${f(0.7 + r())}"/>`; }
    for (let k = 0; k < 10; k++) g += `<circle cx="${f(FALLS_X + (r() - 0.5) * 70)}" cy="${f(RIVER_TOP - 6 + r() * 14)}" r="${f(1 + r() * 2)}" fill="${WATER}" stroke="none"/>`;
    return g + "</g>";
  }

  /* ---------- trail: bridge -> village -> up the cliff -> pavilion -> across the falls -> temple ---------- */
  const TRAIL = [[625, 3334], [690, 3300], [740, 3220], [680, 3130], [720, 3040], [650, 2960], [680, 2850], [620, 2740],
    [660, 2620], [600, 2500], [640, 2380], [590, 2260], [585, 2212], [540, 2160], [470, 2128], [420, 2040], [380, 1930], [345, 1830], [335, 1775]];
  const trail = () => `<path d="${line(TRAIL)}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 6" stroke-linecap="round" fill="none" opacity=".6"/>`;

  /* ---------- small motifs (scale s shrinks with distance) ---------- */
  /* pine: crooked trunk with needle tufts (fans of short strokes over a pale wash) */
  function pine(x, y, s, seed) {
    const r = rand(seed), lean = (r() - 0.5) * 30 * s;
    let g = `<path d="M${x} ${y} C${f(x + lean)} ${f(y - 60 * s)} ${f(x - lean)} ${f(y - 110 * s)} ${f(x + lean * 0.5)} ${f(y - 160 * s)}" stroke="${INK}" stroke-width="${f(6 * s)}" fill="none" stroke-linecap="round" filter="url(#brush)"/>`;
    for (let k = 0; k < 5; k++) {
      const cy = y - (50 + k * 26) * s, side = k % 2 ? -1 : 1, cx = x + side * (20 + r() * 30) * s, w = (24 + r() * 16) * s;
      g += `<path d="M${f(x)} ${f(cy + 6 * s)} L${f(cx)} ${f(cy)}" stroke="${INK}" stroke-width="${f(2.2 * s)}"/>`;
      g += `<ellipse cx="${f(cx)}" cy="${f(cy - 2 * s)}" rx="${f(w)}" ry="${f(7 * s)}" fill="${INK}" opacity=".25"/>`;
      let fan = "";
      for (let n = 0; n < 11; n++) {
        const a = Math.PI * (0.08 + 0.84 * n / 10), len = (10 + r() * 6) * s, bx = cx + (n / 10 - 0.5) * w * 1.4;
        fan += `M${f(bx)} ${f(cy + 3 * s)} l${f(Math.cos(a) * len * -0.9)} ${f(-Math.sin(a) * len)} `;
      }
      g += `<path d="${fan}" stroke="#1f2a22" stroke-width="${f(1.3 * s)}" stroke-linecap="round" fill="none" opacity=".9"/>`;
    }
    return g;
  }
  function grove(x, y, n, s, seed) {
    const r = rand(seed); let g = "";
    for (let k = 0; k < n; k++) {
      const cx = x + (r() - 0.5) * 90 * s, cy = y - r() * 30 * s, h = (24 + r() * 26) * s;
      g += `<path d="M${f(cx)} ${f(cy)} v${f(-h)}" stroke="${INK}" stroke-width="${f(1.4 * s)}"/>`;
      for (let d = 0; d < 7; d++) g += `<circle cx="${f(cx + (r() - 0.5) * 18 * s)}" cy="${f(cy - h + (r() - 0.3) * 16 * s)}" r="${f((2 + r() * 2.5) * s)}" fill="${INK}" opacity=".75"/>`;
    }
    return g;
  }
  /* scholar seated on the bank, facing right toward the river; white robe outlined in heavy ink */
  const scholar = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-30 0 C-34 -14 -26 -30 -14 -38 C-6 -42 4 -40 8 -32 C14 -22 16 -12 30 -10 C40 -8 44 -4 42 0Z" fill="#f4eee4" stroke-width="2.6"/>
    <path d="M-10 -30 C-4 -20 4 -14 16 -14" fill="none" stroke-width="1.8"/><path d="M-20 -6 C-12 -10 0 -10 8 -6" fill="none" stroke-width="1.4" opacity=".7"/>
    <circle cx="0" cy="-49" r="7.5" fill="#f4eee4" stroke-width="2.2"/><path d="M-5 -56 C-4 -62 4 -62 5 -56Z" fill="${INK}" stroke-width="1.5"/>
    <path d="M-34 2 H48" stroke-width="3" opacity=".6"/></g>`;
  const traveler = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${INK}" stroke="${INK}" stroke-linecap="round">
    <path d="M-18 -10 C-10 -16 10 -16 18 -10 L16 -4 L-16 -4Z"/><path d="M18 -10 l8 -8 l3 3" fill="none" stroke-width="2"/>
    <path d="M-12 -4 v12 M-6 -4 v12 M8 -4 v12 M14 -4 v12" stroke-width="1.6"/>
    <path d="M-4 -16 C-6 -26 2 -30 6 -26 L4 -16Z" fill="#efe8da" stroke-width="1.2"/><circle cx="2" cy="-31" r="3.5"/>
    <path d="M-26 -2 L-22 -26" fill="none" stroke-width="1.4"/></g>`;
  const boat = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${INK}" opacity=".8">
    <path d="M-34 0 C-20 9 20 9 36 -2 C14 3 -14 3 -34 0Z"/><path d="M6 -2 L4 -16 L12 -16 L10 -2Z"/><circle cx="8" cy="-19" r="3"/>
    <path d="M10 -14 L46 -40" stroke="${INK}" stroke-width="1.2"/></g>`;
  const roof = (x, y, w, h) => `<path d="M${f(x - w / 2 - 8)} ${f(y - 4)} Q${f(x - w / 2)} ${f(y)} ${f(x - w / 2 + 6)} ${f(y - 2)} L${f(x)} ${f(y - h)} L${f(x + w / 2 - 6)} ${f(y - 2)} Q${f(x + w / 2)} ${f(y)} ${f(x + w / 2 + 8)} ${f(y - 4)} L${f(x + w / 2)} ${f(y + 2)} L${f(x - w / 2)} ${f(y + 2)}Z" fill="${INK}"/>`;
  const cottage = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-18" y="-16" width="36" height="16" fill="#efe8da" stroke="${INK}" stroke-width="1.4"/>${roof(0, -16, 44, 14)}</g>`;
  const pavilion = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${roof(0, -34, 60, 22)}
    <path d="M-24 -32 V0 M24 -32 V0 M-8 -32 V0 M8 -32 V0" stroke="${INK}" stroke-width="2"/><path d="M-30 0 H30" stroke="${INK}" stroke-width="3"/></g>`;
  function pagoda(x, y, s) {
    let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
    for (let k = 0; k < 5; k++) { const w = 46 - k * 6, by = -k * 22; g += `<rect x="${-w / 2 + 6}" y="${by - 16}" width="${w - 12}" height="14" fill="#efe8da" stroke="${INK}" stroke-width="1.2"/>` + roof(0, by - 16, w, 10); }
    return g + `<path d="M0 -126 v-16" stroke="${INK}" stroke-width="2"/></g>`;
  }
  const bridge = (x, y, w) => `<g stroke="${INK}" fill="none" stroke-linecap="round">
    <path d="M${x - w / 2} ${y} Q${x} ${y - w * 0.4} ${x + w / 2} ${y}" stroke-width="5"/><path d="M${x - w / 2 + 14} ${y} Q${x} ${y - w * 0.28} ${x + w / 2 - 14} ${y}" stroke-width="2"/>
    <path d="M${x - w / 2 - 30} ${y + 4} H${x - w / 2} M${x + w / 2} ${y + 4} H${x + w / 2 + 30}" stroke-width="3"/></g>`;
  const geese = (x, y, s) => [0, 1, 2, 3].map(k => `<path transform="translate(${x + k * 30 * s} ${y + Math.abs(k - 1.5) * 12 * s}) scale(${s})" d="M-12 0 Q-5 -8 0 0 Q5 -8 12 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`).join("");

  /* ---------- composition, far (top) to near (bottom) so nearer things paint over ---------- */
  function svg() {
    const farL = mountain({ x0: -80, x1: 460, base: 1250, peak: 560, peakX: 170, seed: 51, tone: 0.28, cun: 18, dots: 10 });
    const farR = mountain({ x0: 640, x1: 1100, base: 1150, peak: 480, peakX: 900, seed: 52, tone: 0.25, cun: 14, dots: 8 });
    const main = mountain({ x0: 180, x1: 1000, base: 1850, peak: 1150, peakX: 640, jag: 0.15, seed: 41, tone: 0.55, cun: 110, dots: 70 });
    const shoulder = mountain({ x0: 40, x1: 640, base: 2280, peak: 580, peakX: 320, seed: 42, tone: 0.62, cun: 50, dots: 35 });
    const cliffL = mountain({ x0: -40, x1: 458, base: 2880, peak: 700, peakX: 400, jag: 0.18, seed: 31, tone: 0.75, cun: 60, dots: 40 });
    const cliffR = mountain({ x0: 482, x1: 1040, base: 2950, peak: 760, peakX: 560, jag: 0.18, seed: 32, tone: 0.75, cun: 60, dots: 40 });
    const hillL = mountain({ x0: -60, x1: 400, base: 3640, peak: 320, peakX: 120, seed: 21, tone: 0.8, cun: 30, dots: 25 });
    const hillR = mountain({ x0: 720, x1: 1060, base: 3580, peak: 330, peakX: 920, seed: 22, tone: 0.8, cun: 30, dots: 25 });
    const near = `<path filter="url(#brush)" fill="url(#bank)" d="M0 3880 C110 3845 250 3832 400 3858 C500 3875 560 3905 600 3950 C615 3970 622 3988 625 4000 L0 4000Z"/>`;
    const parts = [
      `<circle cx="800" cy="300" r="55" fill="none" stroke="${INK}" stroke-width="1.4" opacity=".45"/>`, geese(230, 470, 0.8),
      farL.svg, farR.svg, main.svg,
      shoulder.svg, grove(330, 1790, 5, 0.7, 44), pagoda(335, 1775, 0.55),
      cliffL.svg, cliffR.svg, pine(400, cliffL.ridgeY(400) + 6, 0.45, 34), pine(690, cliffR.ridgeY(690) + 6, 0.5, 35),
      waterfall(), pavilion(585, 2212, 0.6),
      hillL.svg, hillR.svg, grove(880, 3540, 6, 0.85, 23), cottage(790, 3490, 0.85), cottage(850, 3505, 0.8), cottage(905, 3495, 0.75),
      river(), trail(),
      bridge(520, 3334, 210), traveler(500, 3300, 0.75), grove(660, 3380, 3, 0.8, 25), boat(800, 3815, 0.95),
      near, pine(190, 3880, 1, 13), scholar(330, 3872, 1)
    ];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <filter id="brush" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10"/></filter>
        <filter id="soft"><feGaussianBlur stdDeviation="0.8"/></filter>
        <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".85"/><stop offset=".45" stop-color="${INK}" stop-opacity=".4"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
        <linearGradient id="bank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".85"/><stop offset="1" stop-color="${INK}" stop-opacity=".3"/></linearGradient>
      </defs>${parts.join("")}</svg>`;
  }
  return { svg, aspect: VH / VW };
})();
