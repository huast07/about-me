/* Autoscroll: glides down the page on its own, easing off while a highlight card is on the
   reading line so there is time to read it. Any wheel, touch, key or drag hands control back. */
(() => {
  const SCREEN_SECONDS = 7;      // seconds to travel one screen height at full speed
  const SLOWEST = 0.22;          // speed factor while a card sits on the reading line
  const FOCUS = 0.55, EASE_ZONE = 0.32; // reading line and the band around it (fractions of the viewport)
  const DRIFT_PX = 6;            // if the page moved further than this on its own, the visitor scrolled
  const btn = document.getElementById("autoBtn");
  if (!btn) { console.error("autoscroll: missing #autoBtn"); return; }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { btn.hidden = true; return; }

  let on = false, pos = 0, last = 0;
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  function speedFactor() {
    let near = Infinity;
    document.querySelectorAll(".mark").forEach(el => {
      const r = el.getBoundingClientRect();
      near = Math.min(near, Math.abs(r.top + r.height / 2 - innerHeight * FOCUS));
    });
    return SLOWEST + (1 - SLOWEST) * Math.min(1, near / (innerHeight * EASE_ZONE));
  }
  function step(now) {
    if (!on) return;
    if (Math.abs(scrollY - pos) > DRIFT_PX) return stop(); // the visitor took over
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    pos = Math.min(maxScroll(), pos + innerHeight / SCREEN_SECONDS * speedFactor() * dt);
    scrollTo(0, pos);
    if (pos >= maxScroll() - 1) return stop();
    requestAnimationFrame(step);
  }
  function start() {
    if (scrollY >= maxScroll() - 1) scrollTo(0, 0); // at the end: start over from the seed
    on = true; pos = scrollY; last = performance.now();
    btn.setAttribute("aria-pressed", "true");
    requestAnimationFrame(step);
  }
  function stop() { on = false; btn.setAttribute("aria-pressed", "false"); }

  btn.addEventListener("click", () => (on ? stop() : start()));
  /* touches on the button itself are left to its click handler, or a tap to stop would restart it */
  ["wheel", "touchstart"].forEach(ev => addEventListener(ev, e => { if (on && !btn.contains(e.target)) stop(); }, { passive: true }));
  addEventListener("keydown", e => { if (on && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) stop(); });
})();
