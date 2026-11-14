/* Soundtrack: traditional guqin pieces (SITE.music), played in turn and looped.
   Nothing loads until the visitor presses Music (preload="none").
   An <audio> element plays as media, so iOS does not mute it with the ring/silent switch. */
const Music = (() => {
  const FADE_MS = 1200, VOLUME = 0.85;
  const tracks = SITE.music || [];
  let audio = null, on = false, index = 0, fadeTimer = null;

  function load(i) {
    index = i % tracks.length;
    audio.src = tracks[index].src;
  }
  function init() {
    audio = new Audio();
    audio.preload = "none";
    audio.setAttribute("playsinline", "");
    audio.addEventListener("ended", () => { load(index + 1); if (on) play(); });
    audio.addEventListener("error", () => console.error("Music: could not load", tracks[index]?.src, audio.error));
    load(0);
  }
  /* iOS ignores element volume, so the fade is a nicety where supported; play/pause still work. */
  function fadeTo(target, done) {
    clearInterval(fadeTimer);
    const start = audio.volume, t0 = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / FADE_MS);
      audio.volume = start + (target - start) * k;
      if (k === 1) { clearInterval(fadeTimer); done?.(); }
    }, 40);
  }
  function play() {
    audio.play().then(() => fadeTo(VOLUME)).catch(e => { console.error("Music: playback blocked", e); on = false; onChange(false); });
  }
  let onChange = () => {};

  return {
    get available() { return tracks.length > 0; },
    get current() { return tracks[index]; },
    onChange(fn) { onChange = fn; },
    toggle() {
      if (!tracks.length) return false;
      if (!audio) init();
      on = !on;
      if (on) { audio.volume = 0; play(); } else fadeTo(0, () => audio.pause());
      return on;
    }
  };
})();
