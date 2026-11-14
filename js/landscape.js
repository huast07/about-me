/* Procedural ink-wash hanging scroll in the spirit of Song-dynasty monumental landscapes
   (tall peaks, hemp-fibre texture strokes, moss dots, mist between zones, tiny figures).
   Original artwork, generated once as an SVG string. viewBox is VW x VH; y = VH is the bottom
   of the scroll (shown when the page starts) and y = 0 the top (shown at the finale).
   Scenes, bottom to top: riverbank scholar, stone bridge, waterfall cliffs, temple peak, moonlit summits. */
const Landscape = (() => {
  const VW = 1000, VH = 4000, INK = "#26231f";
  const rand = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const f = n => n.toFixed(1);

  /* ---------- mountains ---------- */
  function mountain({ x0, x1, base, peak, peakX, jag = 0.12, seed, tone = 1, cun = 40, dots = 30 }) {
    const r = rand(seed), half = (x1 - x0) / 2, ph = [r() * 6, r() * 6, r() * 6], pts = [];
    for (let i = 0; i <= 70; i++) {
      const x = x0 + (x1 - x0) * i / 70, t = (x - peakX) / half, env = Math.pow(Math.max(0, 1 - t * t), 0.75);
      const n = Math.sin(x * 0.031 + ph[0]) * 0.5 + Math.sin(x * 0.077 + ph[1]) * 0.3 + Math.sin(x * 0.19 + ph[2]) * 0.2;
      pts.push([x, base - peak * env * (1 + n * jag)]);
    }
    const ridgeY = x => { const i = Math.min(69, Math.max(0, Math.floor((x - x0) / (x1 - x0) * 70))); return pts[i][1]; };
    const body = `<path filter="url(#brush)" fill="url(#mtn)" d="M${x0} ${base} ${pts.map(p => `L${f(p[0])} ${f(p[1])}`).join(" ")} L${x1} ${base}Z"/>`;
    let strokes = "", moss = "";
    for (let k = 0; k < cun; k++) {
      const x = x0 + half * 0.2 + r() * (x1 - x0 - half * 0.4), y0 = ridgeY(x) + 8 + r() * peak * 0.35, len = 25 + r() * 60, bend = (r() - 0.5) * 18;
      strokes += `<path d="M${f(x)} ${f(y0)} q${f(bend)} ${f(len / 2)} ${f(bend * 0.4)} ${f(len)}" stroke-width="${f(0.8 + r() * 1.6)}" opacity="${f(0.25 + r() * 0.35)}"/>`;
    }
    for (let k = 0; k < dots; k++) {
      const p = pts[Math.floor(r() * pts.length)];
      moss += `<ellipse cx="${f(p[0] + (r() - 0.5) * 6)}" cy="${f(p[1] + 2 + r() * 8)}" rx="${f(1.5 + r() * 2.5)}" ry="${f(1 + r() * 1.5)}"/>`;
    }
    return `<g opacity="${tone}">${body}<g stroke="${INK}" fill="none" stroke-linecap="round" filter="url(#soft)">${strokes}</g><g fill="${INK}" opacity=".7">${moss}</g></g>`;
  }

  /* ---------- small motifs ---------- */
  function pine(x, y, s, seed) {
    const r = rand(seed), lean = (r() - 0.5) * 30 * s;
    let g = `<path d="M${x} ${y} C${f(x + lean)} ${f(y - 60 * s)} ${f(x - lean)} ${f(y - 110 * s)} ${f(x + lean * 0.5)} ${f(y - 160 * s)}" stroke="${INK}" stroke-width="${f(6 * s)}" fill="none" stroke-linecap="round" filter="url(#brush)"/>`;
    for (let k = 0; k < 5; k++) {
      const cy = y - (50 + k * 26) * s, side = k % 2 ? -1 : 1, cx = x + side * (20 + r() * 30) * s;
      g += `<path d="M${f(x)} ${f(cy + 6 * s)} L${f(cx)} ${f(cy)}" stroke="${INK}" stroke-width="${f(2.2 * s)}"/>`;
      g += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f((26 + r() * 18) * s)}" ry="${f(8 * s)}" fill="#1f2a22" opacity=".85" filter="url(#brush)"/>`;
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
  const scholar = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-2 -46 L14 -46 L12 -40 L0 -40Z" fill="${INK}"/><circle cx="6" cy="-35" r="6" fill="#efe8da" stroke="${INK}" stroke-width="1.4"/>
    <path d="M-6 -27 C-12 -10 -16 6 -20 18 L30 18 C26 4 22 -12 18 -27 C12 -31 0 -31 -6 -27Z" fill="#efe8da" stroke="${INK}" stroke-width="1.6"/>
    <path d="M16 -22 C30 -16 36 -8 40 2 C32 0 24 -6 18 -12" fill="#efe8da" stroke="${INK}" stroke-width="1.4"/>
    <path d="M-16 -20 L-24 22" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/></g>`;
  const traveler = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${INK}" stroke="${INK}" stroke-linecap="round">
    <path d="M-18 -10 C-10 -16 10 -16 18 -10 L16 -4 L-16 -4Z"/><path d="M18 -10 l8 -8 l3 3" fill="none" stroke-width="2"/>
    <path d="M-12 -4 v12 M-6 -4 v12 M8 -4 v12 M14 -4 v12" stroke-width="1.6"/>
    <path d="M-4 -16 C-6 -26 2 -30 6 -26 L4 -16Z" fill="#efe8da" stroke-width="1.2"/><circle cx="2" cy="-31" r="3.5"/>
    <path d="M-26 -2 L-22 -26" fill="none" stroke-width="1.4"/></g>`;
  const boat = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${INK}" opacity=".8">
    <path d="M-34 0 C-20 9 20 9 36 -2 C14 3 -14 3 -34 0Z"/><path d="M6 -2 L4 -16 L12 -16 L10 -2Z"/><circle cx="8" cy="-19" r="3"/>
    <path d="M10 -14 L46 -40" stroke="${INK}" stroke-width="1.2"/></g>`;
  const roof = (x, y, w, h) => `<path d="M${f(x - w / 2 - 8)} ${f(y - 4)} Q${f(x - w / 2)} ${f(y)} ${f(x - w / 2 + 6)} ${f(y - 2)} L${f(x)} ${f(y - h)} L${f(x + w / 2 - 6)} ${f(y - 2)} Q${f(x + w / 2)} ${f(y)} ${f(x + w / 2 + 8)} ${f(y - 4)} L${f(x + w / 2)} ${f(y + 2)} L${f(x - w / 2)} ${f(y + 2)}Z" fill="${INK}"/>`;
  const pavilion = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${roof(0, -34, 60, 22)}
    <path d="M-24 -32 V0 M24 -32 V0 M-8 -32 V0 M8 -32 V0" stroke="${INK}" stroke-width="2"/><path d="M-30 0 H30" stroke="${INK}" stroke-width="3"/></g>`;
  function pagoda(x, y, s) {
    let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
    for (let k = 0; k < 5; k++) { const w = 46 - k * 6, by = -k * 22; g += `<rect x="${-w / 2 + 6}" y="${by - 16}" width="${w - 12}" height="14" fill="#efe8da" stroke="${INK}" stroke-width="1.2"/>` + roof(0, by - 16, w, 10); }
    return g + `<path d="M0 -126 v-16" stroke="${INK}" stroke-width="2"/></g>`;
  }
  const bridge = (x, y, w) => `<g stroke="${INK}" fill="none" stroke-linecap="round">
    <path d="M${x - w / 2} ${y} Q${x} ${y - w * 0.45} ${x + w / 2} ${y}" stroke-width="5"/><path d="M${x - w / 2 + 14} ${y} Q${x} ${y - w * 0.32} ${x + w / 2 - 14} ${y}" stroke-width="2"/>
    <path d="M${x - w / 2 - 30} ${y + 4} H${x - w / 2} M${x + w / 2} ${y + 4} H${x + w / 2 + 30}" stroke-width="3"/></g>`;
  function waterfall(x, top, bottom, w, seed) {
    const r = rand(seed); let g = `<g stroke="#4a5560" fill="none" stroke-linecap="round" opacity=".55">`;
    for (let k = 0; k < 9; k++) { const xx = x - w / 2 + (k + 0.5) * w / 9 + (r() - 0.5) * 4; g += `<path d="M${f(xx)} ${top} Q${f(xx + (r() - 0.5) * 6)} ${f((top + bottom) / 2)} ${f(xx)} ${bottom}" stroke-width="${f(0.8 + r())}"/>`; }
    for (let k = 0; k < 14; k++) g += `<path d="M${f(x - w + r() * w * 2)} ${f(bottom + r() * 16)} h${f(10 + r() * 22)}" stroke-width="1"/>`;
    return g + "</g>";
  }
  function ripples(y0, y1, seed) {
    const r = rand(seed); let g = `<g stroke="#3d4650" stroke-opacity=".35" stroke-width="1.3" stroke-linecap="round">`;
    for (let k = 0; k < 28; k++) g += `<path d="M${f(r() * VW)} ${f(y0 + r() * (y1 - y0))} h${f(30 + r() * 90)}"/>`;
    return g + "</g>";
  }
  const cranes = (x, y, s) => [0, 1, 2].map(k => `<path transform="translate(${x + k * 34 * s} ${y + (k % 2) * 14 * s}) scale(${s})" d="M-16 0 Q-6 -10 0 0 Q6 -10 16 0 M0 0 l10 4" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join("");

  /* ---------- composition ---------- */
  function svg() {
    const parts = [
      // 5. summits and moon (top)
      `<circle cx="760" cy="260" r="62" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".5"/>`,
      mountain({ x0: 80, x1: 980, base: 1150, peak: 760, peakX: 560, seed: 51, tone: 0.45, cun: 30, dots: 20 }),
      mountain({ x0: -60, x1: 420, base: 1200, peak: 520, peakX: 180, seed: 52, tone: 0.35, cun: 18, dots: 14 }),
      cranes(240, 520, 1.3),
      // 4. monumental temple peak
      mountain({ x0: 120, x1: 900, base: 1950, peak: 900, peakX: 520, jag: 0.16, seed: 41, tone: 0.9, cun: 90, dots: 60 }),
      mountain({ x0: -80, x1: 380, base: 2000, peak: 420, peakX: 140, seed: 42, tone: 0.6, cun: 25, dots: 20 }),
      mountain({ x0: 640, x1: 1080, base: 2000, peak: 480, peakX: 880, seed: 43, tone: 0.6, cun: 25, dots: 20 }),
      grove(300, 1720, 6, 1.1, 44), pagoda(300, 1700, 0.9), grove(700, 1780, 5, 1, 45),
      // 3. waterfall cliffs
      mountain({ x0: -40, x1: 480, base: 2700, peak: 680, peakX: 260, jag: 0.2, seed: 31, tone: 0.85, cun: 60, dots: 40 }),
      mountain({ x0: 520, x1: 1040, base: 2700, peak: 620, peakX: 780, jag: 0.2, seed: 32, tone: 0.85, cun: 60, dots: 40 }),
      waterfall(500, 2120, 2640, 34, 33), pavilion(760, 2240, 1.1), pine(640, 2260, 0.8, 34), pine(220, 2160, 0.7, 35),
      // 2. stone bridge and village
      mountain({ x0: -60, x1: 420, base: 3480, peak: 360, peakX: 140, seed: 21, tone: 0.75, cun: 35, dots: 25 }),
      mountain({ x0: 580, x1: 1060, base: 3480, peak: 400, peakX: 880, seed: 22, tone: 0.75, cun: 35, dots: 25 }),
      grove(200, 3330, 5, 1, 23), roof(230, 3300, 50, 16), roof(290, 3315, 40, 13),
      ripples(3330, 3420, 24), bridge(500, 3330, 150), traveler(470, 3305, 0.9), grove(820, 3360, 4, 0.9, 25),
      // 1. riverbank scholar (bottom)
      mountain({ x0: -40, x1: 1040, base: 3760, peak: 220, peakX: 520, jag: 0.25, seed: 11, tone: 0.4, cun: 20, dots: 12 }),
      ripples(3760, 3900, 12), boat(720, 3830, 1),
      `<path filter="url(#brush)" fill="url(#bank)" d="M0 3880 C110 3845 250 3832 400 3858 C500 3875 590 3900 680 3940 C720 3960 740 3985 750 4000 L0 4000Z"/>`,
      pine(190, 3880, 1, 13), scholar(330, 3872, 1)
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
