/* Background layer: the faded ink landscape and the vertical verses from SITE.verses.
   Loads only the CJK glyphs the verses use (Google Fonts text= subsetting) and drifts gently with scroll. */
(() => {
  const PARALLAX_VH = 6; // how far the landscape rises over the whole page, in vh
  const FONT_URL = "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500&family=Noto+Serif+TC:wght@500&display=swap&text=";
  const host = document.getElementById("verses"), art = document.getElementById("ink");
  if (!host || !art) { console.error("backdrop: #verses or #ink missing"); return; }

  const verses = SITE.verses || [];
  const glyphs = [...new Set(verses.flatMap(v => [v.title || "", v.author || "", ...v.lines]).join(""))].join("");
  if (glyphs) {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = FONT_URL + encodeURIComponent(glyphs);
    document.head.appendChild(link);
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  host.innerHTML = verses.map(v => `<div class="verse verse-${esc(v.id)}" lang="${esc(v.lang)}">
      ${v.title ? `<div class="v-title">${esc(v.title)}</div>` : ""}
      ${v.lines.map(l => `<div class="v-line">${esc(l)}</div>`).join("")}
      ${v.author ? `<div class="v-author">${esc(v.author)}</div>` : ""}
    </div>`).join("");

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let queued = false;
  const drift = () => {
    queued = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    art.style.transform = `translateY(${(-PARALLAX_VH * scrollY / max).toFixed(2)}vh)`;
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(drift); } }, { passive: true });
  drift();
})();
