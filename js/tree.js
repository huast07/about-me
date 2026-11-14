/* Sakura tree engine.
   The tree stands still in the viewport and grows as you scroll down, while the page content
   (intro, one card per highlight, finale) scrolls up past it like any normal page. Each highlight
   sprouts a branch when its card reaches the reading line, and the seasons cycle as the tree grows.
   At the end it reaches full bloom and the finale (motto, branch pages, contact) arrives.
   Tree units: wy = pixels above the ground line. Screen y = H - GROUND - wy. */
(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOBILE_BP = 760;
  const GROUND = 64;                 // ground line, px above the bottom of the viewport
  const CROWN_SCREEN = 0.3;          // fully grown trunk top, as a fraction of the viewport from the top
  const FIRST_BRANCH = 0.16, LAST_BRANCH = 0.93; // where the highlight branches sit along the trunk (fraction of its height)
  /* The tree matures as it grows: branches and trunk start at these fractions of full size. */
  const YOUNG_BRANCH = 0.5, YOUNG_TWIG = 0.3, YOUNG_TRUNK = 0.3;
  const BRANCH_GROWTH = 0.85;        // a branch is (tip - base) / (BRANCH_GROWTH * STEP) branch-lengths long
  const SEASON_FADE_MS = 1400, CANOPY_COUNT = 760;
  const FOCUS = 0.55;                // the reading line (fraction from the top) where a card's branch sprouts
  const SPROUT = 0.6;                // how far (in branch steps) the tip has passed a branch when its card is on the reading line
  const CARD_MAX_W = 340, CARD_SIDE_GAP = 24;
  const BUD_START = 18;              // px of shoot visible before any scrolling

  const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- tree shape (fixed per seed; heights are set from the viewport in resize) ---------- */
  const marks = SITE.highlights.map((h, i) => ({
    ...h, i, side: i % 2 ? -1 : 1, // side the card sits on; its branch grows the other way
    season: SEASON_CYCLE[Math.floor(i * SEASON_CYCLE.length / SITE.highlights.length)] // one cycle, long seasons
  }));
  const N = marks.length;
  const maturity = i => N > 1 ? i / (N - 1) : 1;

  /* Recursive branch, deterministic per seed. Units: 1 = branch scale S. */
  function buildBranch(dir, seed) {
    const r = mulberry32(seed), segs = [];
    function grow(x, y, ang, len, depth, d, main) {
      const x2 = x + Math.sin(ang) * len, y2 = y + Math.cos(ang) * len;
      segs.push({ x1: x, y1: y, x2, y2, d0: d, d1: d + len, w: Math.max(1, (main ? 7 : 4) - depth * 1.6), depth, main });
      if (depth >= 4) return;
      if (main && depth < 3) grow(x2, y2, ang - dir * (0.12 + r() * 0.18), len * (0.82 + r() * 0.1), depth + 1, d + len, true);
      const forks = (r() < 0.85 ? 1 : 0) + (depth < 2 ? 1 : 0);
      for (let k = 0; k < forks; k++) {
        const s = (k % 2 ? -1 : 1) * dir;
        grow(x2, y2, ang + s * (0.5 + r() * 0.5), len * (0.42 + r() * 0.18), depth + 1 + (main ? 0 : 1), d + len, false);
      }
    }
    grow(0, 0, dir * (0.95 + r() * 0.35), 0.36, 0, 0, true);
    const buds = segs.filter(s => !s.main || s.depth > 0)
      .flatMap(s => [0, 1].map(() => ({ x: s.x2 + (r() - 0.5) * 0.06, y: s.y2 + (r() - 0.5) * 0.06, a: r() * 6.28, s: 0.7 + r() * 0.6, c: Math.floor(r() * 3), d: s.d1 })));
    return { segs, buds };
  }
  const branches = marks.map((m, i) => ({ ...buildBranch(-m.side, 1000 + i * 97), wy: 0,
    scale: YOUNG_BRANCH + (1 - YOUNG_BRANCH) * maturity(i) }));
  const twigs = [];
  { const r = mulberry32(42);
    for (let f = 0.06; f < 0.97; f += 0.035 + r() * 0.04) {
      const b = buildBranch(r() < 0.5 ? -1 : 1, Math.floor(r() * 1e6));
      twigs.push({ f, wy: 0, scale: YOUNG_TWIG + (0.55 - YOUNG_TWIG) * f,
        segs: b.segs.filter(s => s.depth <= 2).map(s => ({ ...s, w: s.w * 0.6 })),
        buds: b.buds.filter((_, j) => j % 2 === 0) });
    } }
  const canopy = [];
  { const r = mulberry32(2024);
    for (let i = 0; i < CANOPY_COUNT; i++) { const a = r() * 6.283, d = Math.sqrt(r());
      canopy.push({ x: Math.cos(a) * d * 1.3, y: 0.08 + Math.sin(a) * d * 0.62, a: r() * 6.28, s: 1 + r(), c: Math.floor(r() * 3), k: d }); } }

  /* ---------- DOM: an ordinary scrolling page ---------- */
  const story = document.getElementById("world");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad2 = n => String(n).padStart(2, "0");
  const contact = SITE.contact || {}, mc = SITE.musicCredit, art = SITE.painting;
  story.innerHTML = `
    <section class="hero" aria-label="Introduction">
      <div class="mono">A life, grown one ring at a time</div>
      <h1>${esc(SITE.name.split(" ")[0])}<br><em>${esc(SITE.name.split(" ").slice(1).join(" "))}</em></h1>
      <p>Every branch on this tree is a moment that shaped me. Scroll, or press Autoscroll, and watch it grow through the seasons.</p>
      <span class="hand"><span class="arrow" aria-hidden="true">&darr;</span> scroll to grow</span>
    </section>
    ${marks.map(m => `<section class="beat"><article class="mark" id="m-${m.i}" aria-labelledby="mt-${m.i}">
        <div class="mono kicker"><span>${pad2(m.i + 1)} / ${pad2(N)}</span><span>${esc(m.tag)} - ${SEASONS[m.season].label}</span></div>
        <h2 class="age" id="mt-${m.i}">At age ${m.age == null ? `<b>??</b>,<span class="tbd mono">age TBD</span>` : `<b>${esc(m.age)}</b>,`}</h2>
        <p>${esc(m.text)}</p>
      </article></section>`).join("")}
    <section class="finale" aria-labelledby="motto">
      <div class="mono">${esc(SEASONS.bloom.label)}</div>
      <h2 id="motto" lang="la">${esc(SITE.motto.latin)}</h2>
      <p class="translation">${esc(SITE.motto.translation)}</p>
      <p class="hand">${esc(SITE.motto.note)}</p>
      <nav class="paths" aria-label="Explore more">
        ${SITE.paths.map((p, i) => `<a class="path" href="${esc(p.href)}" style="--i:${i}">
          <span class="mono">Branch ${pad2(i + 1)}</span><strong>${esc(p.title)}</strong><span class="blurb">${esc(p.blurb)}</span><span class="go" aria-hidden="true">&rarr;</span></a>`).join("")}
      </nav>
      <div class="contact mono">
        <a href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">LinkedIn &nearr;</a>
        ${contact.github ? `<a href="${esc(contact.github)}" target="_blank" rel="noopener">GitHub &nearr;</a>` : ""}
        ${contact.email ? `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` : ""}
      </div>
      <p class="credits">
        ${art ? `Painting: <a href="${esc(art.url)}" target="_blank" rel="noopener">${esc(art.credit)}</a>` : ""}
        ${mc && SITE.music?.length ? `<br>Music: ${SITE.music.map(t => `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.title)}</a>`).join(", ")},
          ${esc(mc.instrument)} by ${esc(mc.performer)}, <a href="${esc(mc.licenseUrl)}" target="_blank" rel="noopener">${esc(mc.license)}</a>, via Wikimedia Commons.` : ""}
      </p>
    </section>`;
  marks.forEach(m => { m.el = document.getElementById(`m-${m.i}`); });
  const finale = story.querySelector(".finale");

  /* ---------- canvas + layout ---------- */
  const cv = document.getElementById("tree");
  let ctx = cv.getContext("2d"); // temporarily swapped to a sprite canvas while sprites are built
  const fxCv = document.getElementById("fx"), fctx = fxCv.getContext("2d");
  let W = 0, H = 0, S = 200, trunkCX = 0, TW = 1, mobile = false, DPR = 1;
  let TOP = 500, STEP = 40, CANOPY_GROW = 120, maxScroll = 1;
  const sy = wy => H - GROUND - wy;
  const trunkX = wy => trunkCX + Math.sin(wy / TOP * 6.5) * 9 + Math.sin(wy / TOP * 17 + 1.3) * 4;
  /* Scroll -> story position t: 0 at the top, i + 1 when card i is on the reading line, N + 1 at the end. */
  let anchors = [];
  function storyT() {
    const y = scrollY;
    if (y <= anchors[0]) return 0;
    for (let k = 1; k < anchors.length; k++) if (y <= anchors[k]) return k - 1 + (y - anchors[k - 1]) / Math.max(1, anchors[k] - anchors[k - 1]);
    return anchors.length - 1;
  }
  /* Height of the growing tip for a story position. */
  function tipFor(t) {
    if (reduceMotion) return Infinity;
    const at = i => i < 0 ? BUD_START : i >= N ? TOP + CANOPY_GROW : branches[i].wy + SPROUT * STEP;
    const k = Math.floor(t);
    return lerp(at(k - 1), at(k), t - k);
  }
  let tip = BUD_START;
  const growth = wy => Math.max(0, (tip - wy) / (BRANCH_GROWTH * STEP));
  function trunkW(wy) {
    let w = 50 - 30 * Math.min(1, wy / TOP);
    branches.forEach(b => { const d = (wy - b.wy) / 12; w += 5 * Math.exp(-d * d); });
    const age = YOUNG_TRUNK + (1 - YOUNG_TRUNK) * Math.min(1, Math.max(0, tip) / TOP); // trunk thickens as the tree grows
    w *= TW * age; return Math.max(3, wy < 30 ? w * (0.55 + wy / 70) : w);
  }

  function resize() {
    const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; mobile = W < MOBILE_BP;
    if (dpr !== DPR) sprites.clear(); DPR = dpr;
    [cv, fxCv].forEach(c => { c.width = W * dpr; c.height = H * dpr; });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    TOP = H - GROUND - H * CROWN_SCREEN;
    S = mobile ? W * 0.36 : Math.min(W * 0.18, H * 0.27, 260);
    trunkCX = W * 0.5; TW = mobile ? 0.62 : 1;
    STEP = (LAST_BRANCH - FIRST_BRANCH) * TOP / Math.max(1, N - 1);
    CANOPY_GROW = TOP * 0.3;
    branches.forEach((b, i) => { b.wy = TOP * FIRST_BRANCH + i * STEP; });
    twigs.forEach(t => { t.wy = t.f * TOP; });
    layoutCards();
    maxScroll = Math.max(1, document.documentElement.scrollHeight - H);
    anchors = [0, ...marks.map(m => clamp(m.mid - H * FOCUS, 1, maxScroll - 1)), maxScroll];
    for (let k = 1; k < anchors.length; k++) anchors[k] = Math.max(anchors[k], anchors[k - 1] + 1);
    dirty = true; render();
  }
  function layoutCards() {
    const gap = S * 0.62, cardW = Math.min(CARD_MAX_W, W * 0.5 - gap - CARD_SIDE_GAP);
    marks.forEach(m => {
      const s = m.el.style;
      if (mobile) { s.left = "16px"; s.width = (W - 32) + "px"; }
      else { s.width = cardW + "px"; s.left = (m.side > 0 ? trunkCX + gap : trunkCX - gap - cardW) + "px"; }
    });
    marks.forEach(m => { const beat = m.el.parentElement; m.mid = beat.offsetTop + beat.offsetHeight / 2; m.x0 = m.el.offsetLeft; m.x1 = m.x0 + m.el.offsetWidth; });
  }

  /* ---------- drawing ---------- */
  function drawBlossomCluster(x, y, a, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
    [[0, 0, 1], [6, -3, 0.75], [-5, -4, 0.65]].forEach(([ox, oy, k]) => {
      ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k); ctx.fillStyle = col;
      for (let p = 0; p < 5; p++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.ellipse(0, -4.2, 2.8, 4.3, 0, 0, 6.283); ctx.fill(); }
      ctx.fillStyle = "#c2567a"; ctx.beginPath(); ctx.arc(0, 0, 1.3, 0, 6.283); ctx.fill(); ctx.restore();
    });
    ctx.restore();
  }
  function drawLeaf(x, y, a, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(0, 0); ctx.quadraticCurveTo(7, -5, 0, -15); ctx.quadraticCurveTo(-7, -5, 0, 0); ctx.fill(); ctx.restore();
  }
  function drawSnowTuft(x, y, s, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y - 1, 4.5 * s, 2.2 * s, 0, 0, 6.283); ctx.fill(); }
  /* A sakura bud: green calyx with a pink tip. */
  function drawFlowerBud(x, y, a, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
    ctx.fillStyle = SEASONS.spring.colors[2]; ctx.beginPath(); ctx.ellipse(0, 1, 2.6, 3.2, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -3, 2.4, 3.8, 0, 0, 6.283); ctx.fill(); ctx.restore();
  }
  /* Foliage is stamped from small pre-rendered sprites (one per shape and colour): drawing
     thousands of petal paths every frame was the main cost of the crown. */
  const SPRITE = 40, SPRITE_RES = 2; // css px box, and extra resolution so sprites stay sharp when scaled up
  const sprites = new Map();
  function sprite(kind, col) {
    const key = kind + col; if (sprites.has(key)) return sprites.get(key);
    const c = document.createElement("canvas"), px = Math.ceil(SPRITE * DPR * SPRITE_RES); c.width = c.height = px;
    const g = c.getContext("2d"), real = ctx; g.setTransform(px / SPRITE, 0, 0, px / SPRITE, px / 2, px / 2);
    ctx = g; // reuse the path drawers on the sprite canvas
    if (kind === "blossom") drawBlossomCluster(0, 0, 0, 1, col);
    else if (kind === "bud") drawFlowerBud(0, 0, 0, 1, col);
    else if (kind === "leaf") drawLeaf(0, 0, 0, 1, col);
    else drawSnowTuft(0, 0, 1, col);
    ctx = real; sprites.set(key, c); return c;
  }
  function stamp(img, x, y, a, s) {
    const c = Math.cos(a) * s * DPR, n = Math.sin(a) * s * DPR;
    ctx.setTransform(c, n, -n, c, x * DPR, y * DPR);
    ctx.drawImage(img, -SPRITE / 2, -SPRITE / 2, SPRITE, SPRITE);
  }
  function drawBud(x, y, a, s, c, seasonKey) {
    const se = SEASONS[seasonKey], col = se.colors[c], k = mobile ? 0.8 : 1;
    if (se.foliage === "bud") return c === 0 ? stamp(sprite("blossom", col), x, y, a, s * k * 0.55) : stamp(sprite("bud", col), x, y, a, s * k);
    if (se.foliage === "blossom") stamp(sprite("blossom", col), x, y, a, s * k);
    else if (se.foliage === "leaf") stamp(sprite("leaf", col), x, y, a, s * k);
    else stamp(sprite("snow", col), x, y, 0, s * k);
  }

  function drawGround() {
    ctx.fillStyle = "rgba(74,52,44,.12)"; ctx.beginPath(); ctx.ellipse(trunkX(0), sy(0) + 4, Math.min(W * 0.45, 420), 22, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(74,52,44,.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, sy(0) + 2);
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, sy(0) + 2 + Math.sin(x * 0.07) * 1.5); ctx.stroke();
    ctx.fillStyle = "#5c3d33"; ctx.beginPath(); ctx.ellipse(trunkX(0), sy(0) + 8, 9, 6, -0.3, 0, 6.283); ctx.fill();
  }
  function drawTrunk() {
    drawGround();
    const top = Math.min(tip, TOP + S * 0.25);
    if (top < 12) { drawTipBud(tip); return; }
    const halfW = wy => trunkW(wy) * Math.min(1, (top - wy) / (TOP * 0.25) + 0.2) / 2;
    const L = [], R = [];
    for (let wy = 0; wy <= top; wy += 3) { const x = trunkX(wy), w = halfW(wy); L.push([x - w, sy(wy)]); R.push([x + w, sy(wy)]); }
    const g = ctx.createLinearGradient(trunkCX - 30, 0, trunkCX + 30, 0);
    g.addColorStop(0, "#2e1f1c"); g.addColorStop(0.45, "#5a3e36"); g.addColorStop(1, "#2c1d1a");
    ctx.fillStyle = g; ctx.beginPath(); L.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(...R[i]); ctx.closePath(); ctx.fill();
    // cherry bark: horizontal lenticels
    ctx.strokeStyle = "rgba(220,190,180,.28)"; ctx.lineWidth = 1.1;
    for (let wy = 14; wy <= top - 10; wy += 14) {
      const w = halfW(wy), x = trunkX(wy), off = Math.sin(wy * 1.7) * w * 0.4, len = w * (0.3 + 0.25 * Math.abs(Math.sin(wy)));
      ctx.beginPath(); ctx.moveTo(x + off - len / 2, sy(wy)); ctx.lineTo(x + off + len / 2, sy(wy)); ctx.stroke();
    }
    if (tip < TOP + S * 0.2) drawTipBud(tip);
  }
  /* The leading bud. While the tree is still a seedling it also carries two first leaves. */
  function drawTipBud(t) {
    const x = trunkX(t), y = sy(t), seedling = Math.max(0, 1 - t / 120);
    if (seedling > 0) {
      drawLeaf(x - 1, y + 10, -1.1, 0.9 * seedling + 0.2, SEASONS.spring.colors[2]);
      drawLeaf(x + 1, y + 12, 1.1, 0.8 * seedling + 0.2, SEASONS.spring.colors[2]);
    }
    drawFlowerBud(x, y - 2, 0, 1.8, SEASONS[season].foliage === "leaf" ? SEASONS.spring.colors[2] : SEASONS.spring.colors[0]);
  }
  function drawWood(b) {
    const g = growth(b.wy); b.g = g; if (g <= 0) return;
    const bx = trunkX(b.wy), base = sy(b.wy), u = S * b.scale;
    ctx.strokeStyle = "#3d2a25"; ctx.lineCap = "round";
    b.segs.forEach(s => { if (s.d0 >= g) return; const f = Math.min(1, (g - s.d0) / (s.d1 - s.d0));
      ctx.lineWidth = s.w * (mobile ? 0.8 : 1) * (0.5 + 0.5 * b.scale); ctx.beginPath(); ctx.moveTo(bx + s.x1 * u, base - s.y1 * u);
      ctx.lineTo(bx + (s.x1 + (s.x2 - s.x1) * f) * u, base - (s.y1 + (s.y2 - s.y1) * f) * u); ctx.stroke(); });
  }
  function drawFoliage(b, seasonKey) {
    if (!(b.g > 0)) return; const bx = trunkX(b.wy), base = sy(b.wy), u = S * b.scale;
    b.buds.forEach(l => { if (l.d > b.g) return; const k = Math.min(1, (b.g - l.d) * 6);
      drawBud(bx + l.x * u, base - l.y * u, l.a, l.s * k, l.c, seasonKey); });
  }
  function drawCanopy(seasonKey) {
    if (tip <= TOP) return;
    const g = Math.min(1, (tip - TOP) / CANOPY_GROW), cx = trunkX(TOP);
    canopy.forEach(l => { if (l.k > g) return; drawBud(cx + l.x * S, sy(TOP + l.y * S), l.a, l.s * Math.min(1, (g - l.k) * 5), l.c, seasonKey); });
  }
  /* A faint ink thread from the card being read to the branch it grew (desktop only). */
  function drawThread(m) {
    if (mobile || !m) return;
    const cy = m.mid - scrollY, k = 1 - Math.abs(cy - H * FOCUS) / (H * 0.35);
    if (k <= 0) return;
    const b = branches[m.i], bx = trunkX(b.wy), by = sy(b.wy), x = m.side > 0 ? m.x0 : m.x1;
    ctx.save(); ctx.globalAlpha = k * 0.55; ctx.strokeStyle = "#2a2324"; ctx.lineWidth = 1; ctx.setLineDash([2, 5]);
    ctx.beginPath(); ctx.moveTo(x, cy); ctx.bezierCurveTo(lerp(x, bx, 0.5), cy, lerp(x, bx, 0.6), by, bx + m.side * trunkW(b.wy) * 0.5, by); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = "#b9476c"; ctx.beginPath(); ctx.arc(bx + m.side * trunkW(b.wy) * 0.5, by, 3, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  /* ---------- seasons ---------- */
  let season = "spring", prevSeason = "spring", seasonChangedAt = -Infinity;
  const seasonLabel = document.getElementById("season");
  function setSeason(next) {
    if (next === season) return;
    prevSeason = season; season = next; seasonChangedAt = performance.now();
    const root = document.documentElement.style, se = SEASONS[next];
    root.setProperty("--sky-top", se.sky[0]); root.setProperty("--sky-bot", se.sky[1]);
    seasonLabel.textContent = se.label;
  }
  const seasonFade = () => reduceMotion ? 1 : Math.min(1, (performance.now() - seasonChangedAt) / SEASON_FADE_MS);
  function foliagePass() {
    const all = s => { [...twigs, ...branches].forEach(b => drawFoliage(b, s)); drawCanopy(s); };
    const m = seasonFade();
    if (m < 1) { ctx.globalAlpha = 1 - m; all(prevSeason); }
    ctx.globalAlpha = m; all(season); ctx.globalAlpha = 1;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // stamps leave a per-sprite transform behind
  }

  /* ---------- frame ---------- */
  const railBtns = [];
  function render() {
    const t = storyT(); tip = tipFor(t);
    const cur = t < 0.5 ? -1 : t > N + 0.5 ? N : Math.round(t) - 1; // -1 intro, 0..N-1 a highlight, N the finale
    setSeason(tip >= TOP ? "bloom" : cur < 0 ? "spring" : marks[Math.min(cur, N - 1)].season);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    drawTrunk();
    [...twigs, ...branches].forEach(drawWood);
    foliagePass();
    if (cur >= 0 && cur < N) drawThread(marks[cur]);
    marks.forEach(m => m.el.classList.toggle("on", m.mid - scrollY < H * 0.9));
    finale.classList.toggle("on", finale.offsetTop - scrollY < H * 0.6);
    railBtns.forEach((b, i) => { const on = i === cur;
      b.classList.toggle("cur", on); b.setAttribute("aria-current", on ? "step" : "false"); });
  }

  /* ---------- particles ---------- */
  const parts = [], FX_MAX = { petals: 46, motes: 26, leaves: 28, snow: 90 };
  function drawParticle(p) {
    if (p.k === "snow") { p.y += 0.6 + p.v; p.a += 0.01; p.x += Math.sin(p.a) * 0.5;
      fctx.fillStyle = "rgba(255,255,255,.95)"; fctx.beginPath(); fctx.arc(p.x, p.y, 1 + p.v * 2.2, 0, 6.283); fctx.fill(); return; }
    if (p.k === "petals") { p.y += 0.7 + p.v * 0.6; p.a += 0.02; p.x += Math.sin(p.a) * 1.1 + 0.3;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.a); fctx.fillStyle = "rgba(243,169,189,.85)";
      fctx.beginPath(); fctx.ellipse(0, 0, 4.2, 2.6, 0, 0, 6.283); fctx.fill(); fctx.restore(); return; }
    if (p.k === "leaves") { p.y += 1 + p.v * 0.8; p.a += 0.03; p.x += Math.sin(p.a) * 1.4;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.a * 2); fctx.fillStyle = SEASONS.autumn.colors[Math.floor(p.v * 3)];
      fctx.beginPath(); fctx.moveTo(0, 0); fctx.quadraticCurveTo(5, -4, 0, -11); fctx.quadraticCurveTo(-5, -4, 0, 0); fctx.fill(); fctx.restore(); return; }
    p.y -= 0.2 + p.v * 0.3; p.a += 0.02; p.x += Math.sin(p.a) * 0.4;
    fctx.fillStyle = `rgba(240,200,94,${0.3 + 0.4 * Math.abs(Math.sin(p.a * 2))})`; fctx.beginPath(); fctx.arc(p.x, p.y, 1.6, 0, 6.283); fctx.fill();
    if (p.y < -10) p.y = H + 10;
  }
  function stepFx() {
    fctx.clearRect(0, 0, W, H); if (reduceMotion) return;
    const kind = SEASONS[season].fx;
    let have = parts.reduce((n, p) => n + (p.k === kind), 0);
    for (; have < FX_MAX[kind]; have++) parts.push({ x: Math.random() * W, y: Math.random() * H - H, v: Math.random(), a: Math.random() * 6.28, k: kind });
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.k !== kind && Math.random() < 0.03) { parts.splice(i, 1); continue; }
      drawParticle(p);
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W * 1.1; }
    }
  }
  /* The tree only changes when the page scrolls or a season is fading, so it is redrawn only then.
     Falling particles live on their own canvas and animate every frame. */
  let dirty = true;
  addEventListener("scroll", () => { dirty = true; }, { passive: true });
  function loop() {
    if (dirty || seasonFade() < 1) { dirty = false; render(); }
    stepFx(); requestAnimationFrame(loop);
  }

  /* ---------- navigation ---------- */
  const goTo = y => scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  const rail = document.getElementById("rail");
  [...marks.map((m, i) => ({ label: m.tag, y: () => anchors[i + 1] })), { label: SITE.motto.latin, y: () => maxScroll }].forEach(stop => {
    const li = document.createElement("li"), b = document.createElement("button");
    b.innerHTML = `<span>${esc(stop.label)}</span>`; b.setAttribute("aria-label", `Jump to ${stop.label}`);
    b.addEventListener("click", () => goTo(stop.y()));
    li.appendChild(b); rail.appendChild(li); railBtns.push(b);
  });
  document.getElementById("toSeed").addEventListener("click", e => { e.preventDefault(); goTo(0); });

  const musicBtn = document.getElementById("musicBtn");
  if (Music.available) {
    musicBtn.addEventListener("click", () => musicBtn.setAttribute("aria-pressed", String(Music.toggle())));
    Music.onChange(on => musicBtn.setAttribute("aria-pressed", String(on)));
  } else musicBtn.hidden = true;

  addEventListener("resize", resize);
  seasonLabel.textContent = SEASONS[season].label;
  resize();
  document.fonts?.ready.then(resize); // web fonts change card and finale heights
  requestAnimationFrame(loop);
})();
