/* Generative soundtrack (Web Audio): soft piano plucks over a string pad.
   Harmony, tempo and brightness change with the season. Nothing plays until toggled.
   To use a real track instead, add <audio id="track" src="audio/main.mp3" loop> to index.html. */
const Music = (() => {
  const PROGRESSIONS = {
    spring: { chords: [[48,60,64,67,71],[45,57,60,64,67],[41,57,60,65,69],[43,55,59,62,67]], rate: 1.1, cut: 1500 },
    summer: { chords: [[50,62,66,69,73],[47,59,62,66,69],[43,59,62,67,71],[45,57,61,64,69]], rate: 1.5, cut: 2100 },
    autumn: { chords: [[45,57,60,64,67],[41,57,60,65,69],[43,55,62,67,71],[40,55,59,64,67]], rate: 0.9, cut: 1200 },
    winter: { chords: [[45,57,60,64,71],[41,57,60,65,67],[48,55,60,64,67],[43,55,59,62,64]], rate: 0.6, cut: 900 },
    bloom:  { chords: [[53,65,69,72,76],[50,62,65,69,72],[46,62,65,70,74],[48,60,64,67,72]], rate: 1.2, cut: 1900 }
  };
  const CHORD_SECONDS = 8, TICK_MS = 120, MASTER_LEVEL = 0.9, FADE_SECONDS = 1.5;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let ac = null, master, verb, on = false, season = "spring", ci = 0, timer = null, nextChord = 0, nextNote = 0, pads = [];

  function init() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    verb = ac.createGain(); verb.gain.value = 0.5;
    [0.13, 0.29, 0.47].forEach((t, i) => {
      const d = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter();
      d.delayTime.value = t; fb.gain.value = 0.38 - i * 0.06; lp.frequency.value = 2400;
      verb.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(master);
    });
  }
  function pad(chord, t, cut) {
    pads.forEach(p => { p.g.gain.cancelScheduledValues(t); p.g.gain.setValueAtTime(p.g.gain.value, t);
      p.g.gain.linearRampToValueAtTime(0, t + 4); p.o.forEach(o => o.stop(t + 4.2)); });
    pads = chord.slice(0, 4).map((m, i) => {
      const g = ac.createGain(), f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = cut * 0.6; f.Q.value = 0.4;
      const o = [-6, 6].map(dt => { const x = ac.createOscillator(); x.type = "sawtooth"; x.frequency.value = hz(m);
        x.detune.value = dt; x.connect(f); x.start(t); return x; });
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(i === 0 ? 0.05 : 0.028, t + 3.5);
      f.connect(g); g.connect(master); g.connect(verb); return { g, o };
    });
  }
  function pluck(m, t, vel, type = "triangle", dec = 2.6) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
    o.type = type; o2.type = "sine"; o.frequency.value = hz(m); o2.frequency.value = hz(m) * 2; g2.gain.value = 0.25;
    o2.connect(g2); g2.connect(g); o.connect(g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + dec);
    g.connect(master); g.connect(verb); o.start(t); o2.start(t); o.stop(t + dec + 0.1); o2.stop(t + dec + 0.1);
  }
  function tick() {
    const P = PROGRESSIONS[season], now = ac.currentTime;
    while (nextChord < now + 0.3) { ci = (ci + 1) % P.chords.length; const t = Math.max(now, nextChord); pad(P.chords[ci], t, P.cut); nextChord = t + CHORD_SECONDS; }
    while (nextNote < now + 0.3) {
      const ch = P.chords[ci], t = Math.max(now, nextNote);
      pluck(ch[1 + Math.floor(Math.random() * (ch.length - 1))] + (Math.random() < 0.4 ? 12 : 0), t, 0.07 + Math.random() * 0.06);
      nextNote = t + (0.45 + Math.random() * 1.1) / P.rate;
    }
  }
  /* iOS mutes Web Audio while the ring/silent switch is on unless the page plays as media.
     Declaring a playback audio session (Safari 16.4+) and looping a silent clip (older iOS) both lift that. */
  let silentClip = null;
  function silentWavUrl() {
    const n = 4410, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); str(8, "WAVE"); str(12, "fmt "); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 44100, true); v.setUint32(28, 88200, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, n * 2, true);
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }
  function mediaPlayback(play) {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { console.warn("audioSession unavailable", e); }
    if (!silentClip) { silentClip = new Audio(silentWavUrl()); silentClip.loop = true; silentClip.setAttribute("playsinline", ""); }
    if (play) silentClip.play().catch(e => console.warn("silent clip blocked", e)); else silentClip.pause();
  }
  return {
    toggle() {
      try { if (!ac) init(); } catch (e) { console.error("Web Audio unavailable", e); return false; }
      on = !on; mediaPlayback(on); ac.resume().catch(e => console.error("AudioContext resume failed", e));
      const t = ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(on ? MASTER_LEVEL : 0, t + FADE_SECONDS);
      if (on) { nextChord = t; nextNote = t + 0.5; timer = setInterval(tick, TICK_MS); } else { clearInterval(timer); }
      return on;
    },
    setSeason(s) { if (s !== season && PROGRESSIONS[s]) { season = s; if (ac && on) nextChord = ac.currentTime; } }
  };
})();
