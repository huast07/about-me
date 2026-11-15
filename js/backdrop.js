/* Background layer.
   - The ink hanging scroll (assets/art/valley.webp, composed from public-domain paintings by
     tools/compose-valley.py) is taller than the screen and pans from its bottom
     scene (start of the page) to its top scene (the finale) as you scroll.
   - SITE.verses are written out character by character as you scroll, each over its own stretch of the page.
   Loads only the CJK glyphs the verses use (Google Fonts text= subsetting). */
(() => {
  const FONT_URL = "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500&family=Noto+Serif+TC:wght@500&display=swap&text=";
  const MOBILE_BP = 760, MOBILE_SCREENS = 3; // on phones the scroll is this many screens tall (sides are cropped)
  const ART_SRC = "assets/art/valley.webp", ART_ASPECT = 4; // height / width of the scroll
  const REVEAL = { haiku: [0.01, 0.4], poem: [0.42, 0.9] }; // fraction of page scroll over which each verse is written
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const host = document.getElementById("verses"), art = document.getElementById("ink");
  if (!host || !art) { console.error("backdrop: missing #verses or #ink"); return; }

  /* ---------- verses ---------- */
  const verses = SITE.verses || [];
  const glyphs = [...new Set(verses.flatMap(v => [v.title || "", v.author || "", ...v.lines]).join(""))].join("");
  if (glyphs) {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = FONT_URL + encodeURIComponent(glyphs);
    document.head.appendChild(link);
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const chars = s => [...s].map(c => `<span class="ch">${esc(c)}</span>`).join("");
  host.innerHTML = verses.map(v => `<div class="verse verse-${esc(v.id)}" lang="${esc(v.lang)}">
      ${v.title ? `<div class="v-title">${chars(v.title)}</div>` : ""}
      ${v.lines.map(l => `<div class="v-line">${chars(l)}</div>`).join("")}
      ${v.author ? `<div class="v-author">${chars(v.author)}</div>` : ""}
    </div>`).join("");
  const written = verses.map(v => ({ range: REVEAL[v.id] || [0, 1], spans: [...host.querySelectorAll(`.verse-${CSS.escape(v.id)} .ch`)], shown: -1 }));

  /* ---------- landscape ----------
     Only the slice on screen is drawn, onto a viewport-sized canvas, whenever the page scrolls.
     Moving the whole 4-screens-tall image as one layer made the compositor redraw it every frame. */
  const ART_POS_X = 0.28; // on phones the sides are cropped: keep this point of the scroll's width in view
  const MAX_DPR = 2;
  const img = new Image();
  img.decoding = "async"; img.src = ART_SRC;
  img.addEventListener("load", () => update());
  img.addEventListener("error", () => console.error("backdrop: could not load", ART_SRC));
  const cv = document.createElement("canvas"), ctx = cv.getContext("2d");
  art.appendChild(cv);
  let W = 0, H = 0, dpr = 1;
  function size() {
    W = innerWidth; H = innerHeight; dpr = Math.min(MAX_DPR, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    update();
  }
  function draw(p) {
    if (!img.naturalWidth) return;
    const artH = Math.max(W * ART_ASPECT, W < MOBILE_BP ? H * MOBILE_SCREENS : 0), artW = artH / ART_ASPECT;
    const left = (W - artW) * ART_POS_X, top = -(artH - H) * (1 - p); // the scroll's position on screen, in css px
    const kx = img.naturalWidth / artW, ky = img.naturalHeight / artH;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, -left * kx, -top * ky, W * kx, H * ky, 0, 0, cv.width, cv.height);
  }

  /* ---------- scroll ---------- */
  const progress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    return reduceMotion ? 1 : Math.min(1, Math.max(0, scrollY / max));
  };
  function update() {
    if (!host.isConnected) return;
    const p = progress();
    draw(reduceMotion ? 0 : p);
    written.forEach(w => {
      const [a, b] = w.range, n = Math.round(w.spans.length * Math.min(1, Math.max(0, (p - a) / (b - a))));
      if (n === w.shown) return;
      w.spans.forEach((s, i) => s.classList.toggle("on", i < n)); w.shown = n;
    });
  }
  let queued = false;
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } }, { passive: true });
  addEventListener("resize", size);
  size();
})();
