/* Sakura tree engine.
   Scrolling grows a procedural cherry tree from a seed. Each highlight in SITE.highlights
   sprouts a branch, and the seasons cycle as the tree grows. At the crown it reaches full
   bloom, then the motto and the three paths (projects, travels, passions) appear.
   World units: wy = pixels above the ground line. Screen y = H - GROUND - wy + scrollY. */
(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOBILE_BP = 760;
  const GROUND = 96, SEED_H = 760, STEP = 700, CROWN_GAP = 320;
  /* The tree matures as it grows: branches and trunk start at these fractions of full size. */
  const YOUNG_BRANCH = 0.5, YOUNG_TWIG = 0.3, YOUNG_TRUNK = 0.3;
  const SEASON_FADE_MS = 1400, CANOPY_COUNT = 760, GROWTH_RATE = 3.2;
  /* At the end of the page the crown sits at CROWN_SCREEN of the viewport height and the motto at FINALE_SCREEN. */
  const CROWN_SCREEN = 0.8, FINALE_SCREEN = 0.42;
  /* Screen line (fraction from top) that decides the current season and rail stop: just below centre, where cards are read. */
  const FOCUS_SCREEN = 0.62;
  const CARD_MAX_W = 340, CARD_GAP = 70; // highlight card width and distance from the trunk (desktop)
  const TOPBAR_CLEARANCE = 64; // px kept free above the finale for the fixed top bar

  const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ---------- world layout ---------- */
  const marks = SITE.highlights.map((h, i) => ({
    ...h, i, wy: SEED_H + i * STEP, side: i % 2 ? -1 : 1,
    season: SEASON_CYCLE[Math.floor(i * SEASON_CYCLE.length / SITE.highlights.length)] // one cycle, long seasons
  }));
  const maturity = i => marks.length > 1 ? i / (marks.length - 1) : 1;
  const TOP = marks[marks.length - 1].wy + CROWN_GAP;
  let WORLD_H = TOP + 1000; // recomputed from the viewport height in resize()
  const seasonAt = wy => wy >= TOP - 80 ? "bloom"
    : marks[clamp(Math.floor((wy - SEED_H + STEP * 0.5) / STEP), 0, marks.length - 1)].season;

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
  const branches = marks.map((m, i) => ({ ...buildBranch(-m.side, 1000 + i * 97), wy: m.wy,
    scale: YOUNG_BRANCH + (1 - YOUNG_BRANCH) * maturity(i) }));
  const twigs = [];
  { const r = mulberry32(42);
    for (let wy = 260; wy < TOP - 120; wy += 120 + r() * 130) {
      const b = buildBranch(r() < 0.5 ? -1 : 1, Math.floor(r() * 1e6));
      twigs.push({ wy, scale: YOUNG_TWIG + (0.55 - YOUNG_TWIG) * Math.min(1, wy / TOP),
        segs: b.segs.filter(s => s.depth <= 2).map(s => ({ ...s, w: s.w * 0.6 })),
        buds: b.buds.filter((_, j) => j % 2 === 0) });
    } }
  const canopy = [];
  { const r = mulberry32(2024);
    for (let i = 0; i < CANOPY_COUNT; i++) { const a = r() * 6.283, d = Math.sqrt(r());
      canopy.push({ x: Math.cos(a) * d * 1.3, y: 0.08 + Math.sin(a) * d * 0.62, a: r() * 6.28, s: 1 + r(), c: Math.floor(r() * 3), k: d }); } }

  /* ---------- DOM ---------- */
  const world = document.getElementById("world"), spacer = document.getElementById("spacer");
  const place = (html, wy) => { const t = document.createElement("template"); t.innerHTML = html.trim();
    const el = t.content.firstChild; el.dataset.wy = wy; world.appendChild(el); return el; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad2 = n => String(n).padStart(2, "0");
  const highlightText = ({ text, emphasis = [] }) => {
    let html = esc(text);
    for (const phrase of emphasis) {
      const safe = esc(phrase);
      html = html.replace(safe, () => `<strong>${safe}</strong>`);
    }
    return html;
  };

  place(`<section class="hero" aria-label="Introduction">
      <div class="mono">${esc(SITE.education)}</div>
      <h1>${esc(SITE.name.split(" ")[0])}<br><em>${esc(SITE.name.split(" ").slice(1).join(" "))}</em></h1>
      <p>Every branch on this tree is a moment that shaped me. Scroll, and watch it grow through the seasons.</p>
      <span class="hand"><span class="arrow" aria-hidden="true">&darr;</span> scroll to grow</span>
    </section>`, 380);

  marks.forEach(m => {
    const heading = m.heading ? esc(m.heading) : `At age <b>${esc(m.age)}</b>,`;
    m.el = place(`<article class="mark" id="m-${m.i}" aria-labelledby="mt-${m.i}">
        <div class="mono kicker"><span>${pad2(m.i + 1)} / ${pad2(marks.length)}</span><span>${esc(m.tag)} - ${SEASONS[m.season].label}</span></div>
        <h2 class="age" id="mt-${m.i}">${heading}</h2>
        <p>${highlightText(m)}</p>
      </article>`, m.wy + 60);
  });

  const finale = place(`<section class="finale" aria-labelledby="motto">
      <div class="mono">${esc(SEASONS.bloom.label)}</div>
      <h2 id="motto" lang="la">${esc(SITE.motto.latin)}</h2>
      <p class="translation">${esc(SITE.motto.translation)}</p>
      <p class="hand"><span lang="la">“${esc(SITE.motto.note)}”</span><br>
        <span class="motto-citation">${esc(SITE.motto.citation)}</span></p>
      <div class="contact mono">
        <a href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">LinkedIn &nearr;</a>
        ${SITE.contact.github ? `<a href="${esc(SITE.contact.github)}" target="_blank" rel="noopener">GitHub &nearr;</a>` : ""}
        ${SITE.contact.email ? `<a href="mailto:${esc(SITE.contact.email)}">${esc(SITE.contact.email)}</a>` : ""}
      </div>
      <nav class="paths" aria-label="Explore more">
        ${SITE.paths.map((p, i) => `<a class="path" href="${esc(p.href)}" style="--i:${i}">
          <span class="mono">Branch ${pad2(i + 1)}</span><strong>${esc(p.title)}</strong><span class="blurb">${esc(p.blurb)}</span><span class="go" aria-hidden="true">&rarr;</span></a>`).join("")}
      </nav>
    </section>`, TOP + 600);

  /* ---------- canvas + camera ---------- */
  const cv = document.getElementById("tree");
  let ctx = cv.getContext("2d"); // temporarily swapped to a sprite canvas while sprites are built
  const fxCv = document.getElementById("fx"), fctx = fxCv.getContext("2d");
  let W = 0, H = 0, S = 200, trunkCX = 0, TW = 1, mobile = false, DPR = 1;
  const camY = () => scrollY;
  const sy = wy => H - GROUND - wy + camY();
  /* The growing tip starts at the ground (a bud) and catches up with the reading line as you scroll. */
  const BUD_START = 22; // px of shoot visible before any scrolling
  const tipY = () => reduceMotion ? Infinity : Math.max(BUD_START, camY() + H * 0.56 - Math.max(0, H * 0.56 - camY()));
  const growth = (wy, scale) => Math.max(0, (tipY() - wy) * GROWTH_RATE / (S * scale));
  const trunkX = wy => trunkCX + Math.sin(wy * 0.0021) * 14 + Math.sin(wy * 0.0057 + 1.3) * 7;
  function trunkW(wy) {
    let w = 50 - 32 * Math.min(1, wy / TOP);
    marks.forEach(m => { const d = (wy - m.wy) / 40; w += 6 * Math.exp(-d * d); });
    const age = YOUNG_TRUNK + (1 - YOUNG_TRUNK) * Math.min(1, Math.max(0, tipY()) / TOP); // trunk thickens as the tree grows
    w *= TW * age; return Math.max(3, wy < 40 ? w * (0.5 + wy / 80) : w);
  }

  function resize() {
    if (!world.isConnected) return;
    const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; mobile = W < MOBILE_BP;
    if (dpr !== DPR) sprites.clear(); DPR = dpr;
    [cv, fxCv].forEach(c => { c.width = W * dpr; c.height = H * dpr; });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = mobile ? W * 0.4 : Math.min(W * 0.28, 300); trunkCX = W * 0.5; TW = mobile ? 0.62 : 1;
    WORLD_H = TOP + GROUND + H * CROWN_SCREEN;
    spacer.style.height = WORLD_H + "px"; world.style.height = WORLD_H + "px";
    const finaleCentre = Math.max(H * FINALE_SCREEN, finale.offsetHeight / 2 + TOPBAR_CLEARANCE);
    finale.dataset.wy = WORLD_H - GROUND - finaleCentre;
    layoutDom(); render();
  }
  function layoutDom() {
    const cardW = Math.min(CARD_MAX_W, W * 0.5 - 110); // narrow enough to leave the edge verses clear
    world.querySelectorAll("[data-wy]").forEach(el => { el.style.top = (WORLD_H - +el.dataset.wy) + "px"; });
    marks.forEach(m => {
      if (mobile) { m.el.style.left = "16px"; m.el.style.width = (W - 32) + "px"; return; }
      m.el.style.width = cardW + "px";
      m.el.style.left = (m.side > 0 ? trunkX(m.wy) + CARD_GAP : trunkX(m.wy) - CARD_GAP - cardW) + "px";
    });
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

  function drawTrunk() {
    const tip = Math.min(tipY(), TOP + 120), lo = Math.max(0, camY() - GROUND - 60), hi = Math.min(tip, camY() + H + 60);
    if (sy(0) < H + 40) {
      ctx.fillStyle = "rgba(74,52,44,.12)"; ctx.beginPath(); ctx.ellipse(trunkX(0), sy(0) + 4, Math.min(W * 0.45, 420), 26, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "rgba(74,52,44,.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, sy(0) + 2);
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, sy(0) + 2 + Math.sin(x * 0.07) * 1.5); ctx.stroke();
      ctx.fillStyle = "#5c3d33"; ctx.beginPath(); ctx.ellipse(trunkX(0), sy(0) + 8, 9, 6, -0.3, 0, 6.283); ctx.fill();
    }
    if (hi <= lo) { if (sy(tip) < H + 20) drawTipBud(tip); return; }
    const halfW = wy => trunkW(wy) * Math.min(1, (tip - wy) / 200 + 0.2) / 2;
    const L = [], R = [];
    for (let wy = lo; wy <= hi; wy += 5) { const x = trunkX(wy), w = halfW(wy); L.push([x - w, sy(wy)]); R.push([x + w, sy(wy)]); }
    const g = ctx.createLinearGradient(trunkCX - 30, 0, trunkCX + 30, 0);
    g.addColorStop(0, "#2e1f1c"); g.addColorStop(0.45, "#5a3e36"); g.addColorStop(1, "#2c1d1a");
    ctx.fillStyle = g; ctx.beginPath(); L.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(...R[i]); ctx.closePath(); ctx.fill();
    // cherry bark: horizontal lenticels
    ctx.strokeStyle = "rgba(220,190,180,.28)"; ctx.lineWidth = 1.2;
    for (let wy = Math.ceil(lo / 23) * 23; wy <= hi; wy += 23) {
      const w = halfW(wy), x = trunkX(wy), off = Math.sin(wy * 1.7) * w * 0.4, len = w * (0.3 + 0.25 * Math.abs(Math.sin(wy)));
      ctx.beginPath(); ctx.moveTo(x + off - len / 2, sy(wy)); ctx.lineTo(x + off + len / 2, sy(wy)); ctx.stroke();
    }
    if (tip < TOP + 100 && sy(tip) > -20 && sy(tip) < H + 20) drawTipBud(tip);
  }
  /* The leading bud. While the tree is still a seedling it also carries two first leaves. */
  function drawTipBud(tip) {
    const x = trunkX(tip), y = sy(tip), seedling = Math.max(0, 1 - tip / 160);
    if (seedling > 0) {
      drawLeaf(x - 1, y + 10, -1.1, 0.9 * seedling + 0.2, SEASONS.spring.colors[2]);
      drawLeaf(x + 1, y + 12, 1.1, 0.8 * seedling + 0.2, SEASONS.spring.colors[2]);
    }
    drawFlowerBud(x, y - 2, 0, 1.8, SEASONS[seasonAt(tip)].foliage === "leaf" ? SEASONS.spring.colors[2] : SEASONS.spring.colors[0]);
  }
  function drawWood(b) {
    const g = growth(b.wy, b.scale); b.g = g; if (g <= 0) return;
    const bx = trunkX(b.wy), base = sy(b.wy), u = S * b.scale, reach = u * 2;
    if (base < -reach || base > H + reach) { b.g = -1; return; }
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
    const tip = tipY(); if (tip <= TOP) return;
    const g = Math.min(1, (tip - TOP) / 260), cx = trunkX(TOP);
    canopy.forEach(l => { if (l.k > g) return; drawBud(cx + l.x * S, sy(TOP + l.y * S), l.a, l.s * Math.min(1, (g - l.k) * 5), l.c, seasonKey); });
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
    ctx.clearRect(0, 0, W, H);
    drawTrunk();
    [...twigs, ...branches].forEach(drawWood);
    foliagePass();
    world.style.transform = `translateY(${H - GROUND - WORLD_H + camY()}px)`;
    const tip = tipY();
    const finaleOn = tip > +finale.dataset.wy - 160;
    finale.classList.toggle("on", finaleOn);
    marks.forEach(m => m.el.classList.toggle("on", tip > m.wy - 40 && !finaleOn)); // cards step aside for the finale
    const mid = camY() + H * (1 - FOCUS_SCREEN) - GROUND;
    setSeason(seasonAt(mid));
    const cur = mid >= TOP - 80 ? marks.length : clamp(Math.round((mid - SEED_H) / STEP), 0, marks.length - 1);
    railBtns.forEach((b, i) => { const on = i === cur && mid > SEED_H - STEP / 2;
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
    if (!world.isConnected) { requestAnimationFrame(loop); return; }
    if (dirty || seasonFade() < 1) { dirty = false; render(); }
    stepFx(); requestAnimationFrame(loop);
  }

  /* ---------- navigation ---------- */
  const goTo = wy => scrollTo({ top: Math.max(0, wy - H * 0.5 + GROUND), behavior: reduceMotion ? "auto" : "smooth" });
  const rail = document.getElementById("rail");
  [...marks.map(m => ({ label: m.tag, wy: () => m.wy + 60 })), { label: SITE.motto.latin, wy: () => +finale.dataset.wy }].forEach(stop => {
    const li = document.createElement("li"), b = document.createElement("button");
    b.innerHTML = `<span>${esc(stop.label)}</span>`; b.setAttribute("aria-label", `Jump to ${stop.label}`);
    b.addEventListener("click", () => goTo(stop.wy()));
    li.appendChild(b); rail.appendChild(li); railBtns.push(b);
  });
  world.addEventListener("focusin", e => { const el = e.target.closest("[data-wy]"); if (el) scrollTo({ top: Math.max(0, +el.dataset.wy - H * 0.5 + GROUND) }); });


  addEventListener("resize", resize);
  seasonLabel.textContent = SEASONS[season].label;
  resize();
  document.fonts?.ready.then(resize); // web fonts change the finale's height
  requestAnimationFrame(loop);
})();
