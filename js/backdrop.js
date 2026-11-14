/* Background layer.
   - The ink hanging scroll (js/landscape.js) is taller than the screen and pans from its bottom
     scene (start of the page) to its top scene (the finale) as you scroll.
   - SITE.verses are written out character by character as you scroll, each over its own stretch of the page.
   Loads only the CJK glyphs the verses use (Google Fonts text= subsetting). */
(() => {
  const FONT_URL = "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500&family=Noto+Serif+TC:wght@500&display=swap&text=";
  const MOBILE_BP = 760, MOBILE_SCREENS = 3; // on phones the scroll is this many screens tall (sides are cropped)
  const REVEAL = { haiku: [0.01, 0.4], poem: [0.42, 0.9] }; // fraction of page scroll over which each verse is written
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const host = document.getElementById("verses"), art = document.getElementById("ink");
  if (!host || !art || typeof Landscape === "undefined") { console.error("backdrop: missing #verses, #ink or Landscape"); return; }

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

  /* ---------- landscape ---------- */
  art.innerHTML = Landscape.svg();
  let artH = 0;
  function size() {
    const W = innerWidth, H = innerHeight;
    artH = Math.max(W * Landscape.aspect, W < MOBILE_BP ? H * MOBILE_SCREENS : 0);
    art.style.height = artH + "px";
    update();
  }

  /* ---------- scroll ---------- */
  function update() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = reduceMotion ? 1 : Math.min(1, Math.max(0, scrollY / max));
    art.style.transform = `translateY(${(-(artH - innerHeight) * (1 - (reduceMotion ? 0 : p))).toFixed(1)}px)`;
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
