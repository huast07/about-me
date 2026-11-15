/* One recording and one audio graph for the whole visit. Navigation never replaces it. */
(() => {
  const button = document.getElementById('musicBtn');
  const label = button.querySelector('.t');
  const status = document.getElementById('musicStatus');
  const assetBase = new URL('../', document.currentScript.src);
  const tracks = {
    home: { file: 'assets/audio/winter-largo.mp3', title: 'Vivaldi, Winter — Largo', credit: `<strong>Winter — Largo</strong><br>Vivaldi · The Four Seasons<br>John Harrison, violin · Robert Turizziani, conductor · Wichita State University Chamber Players.<br><a href="https://commons.wikimedia.org/wiki/File:11_-_Vivaldi_Winter_mvt_2_Largo_-_John_Harrison_violin.ogg" target="_blank" rel="noopener">Recording &amp; source</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a><br>Playback includes a crossfade for continuous looping; adapted audio under the same license.` },
    travel: { file: 'assets/audio/water-music.mp3', title: 'Handel, Water Music — Sarabande', credit: `<strong>Water Music — Sarabande</strong><br>George Frideric Handel<br>Marine Chamber Orchestra of the United States Marine Band, conducted by Michelle Rakers.<br><a href="https://commons.wikimedia.org/wiki/File:Handel%27s_Water_Music_-_16._Sarabande_-_Chamber_Orchestra_-_United_States_Marine_Band.opus" target="_blank" rel="noopener">Recording &amp; source</a> · Public domain` }
  };
  let track = document.querySelector('#travel-app') ? 'travel' : 'home', generation = 0;
  const credit = document.querySelector('.music-credit > div');
  function updateCredit() { if (credit) credit.innerHTML = tracks[track].credit; }
  updateCredit();
  const LEVEL = 0.38, FADE = 1.2;
  let context, gain, source, loading, wanted = false, pauseTimer;

  // Overlap the ending with the opening in PCM, so repeating needs no JS timer
  // (including when the tab is in the background). The recording stays local.
  function seamlessLoop(recording) {
    const overlap = Math.min(Math.floor(recording.sampleRate * 2), Math.floor(recording.length / 4));
    const length = recording.length - overlap;
    const loop = context.createBuffer(recording.numberOfChannels, length, recording.sampleRate);
    for (let channel = 0; channel < recording.numberOfChannels; channel++) {
      const input = recording.getChannelData(channel), output = loop.getChannelData(channel);
      output.set(input.subarray(overlap));
      for (let i = 0; i < overlap; i++) {
        const mix = i / (overlap - 1);
        output[length - overlap + i] = input[length + i] * (1 - mix) + input[i] * mix;
      }
    }
    return loop;
  }

  function update(message = '') {
    const playing = wanted && !!source && context?.state === 'running';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', (wanted ? 'Pause music: ' : 'Play music: ') + tracks[track].title);
    label.textContent = wanted && !source ? 'Loading…' : playing ? 'Pause music' : 'Play music';
    status.textContent = message;
  }

  async function toggle() {
    const request = ++generation;
    wanted = !wanted;
    clearTimeout(pauseTimer);
    update();
    try {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
        context.addEventListener('statechange', () => update());
      }
      if (!wanted) {
        gain.gain.cancelAndHoldAtTime(context.currentTime);
        gain.gain.linearRampToValueAtTime(0, context.currentTime + FADE);
        pauseTimer = setTimeout(() => { if (!wanted) context.suspend().catch(console.warn); }, FADE * 1000 + 50);
        update();
        return;
      }
      // Resume synchronously from the click: browsers require a user gesture.
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) { /* optional Safari API */ }
      await context.resume();
      if (!loading) {
        loading = fetch(new URL(tracks[track].file, assetBase)).then(response => {
          if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
          return response.arrayBuffer();
        }).then(data => context.decodeAudioData(data)).then(seamlessLoop).catch(error => {
          loading = null;
          throw error;
        });
      }
      const buffer = await loading;
      if (!wanted || request !== generation) return;
      if (!source) {
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start();
      }
      gain.gain.cancelAndHoldAtTime(context.currentTime);
      gain.gain.linearRampToValueAtTime(LEVEL, context.currentTime + FADE);
      update();
    } catch (error) {
      if (request !== generation) return;
      wanted = false;
      update('Music could not start. Select Play music to try again.');
      console.warn('Music playback failed', error);
    }
  }
  addEventListener('portfolio:pagechange', event => {
    const next = event.detail.travel ? 'travel' : 'home';
    if (next === track) return;
    track = next; ++generation; loading = null; updateCredit();
    if (source) {
      const old = source; source = null;
      const t = context.currentTime;
      gain.gain.cancelAndHoldAtTime(t);
      gain.gain.linearRampToValueAtTime(0, t + FADE);
      old.stop(t + FADE + .05);
    }
    if (wanted) { wanted = false; toggle(); } else update();
  });
  button.addEventListener('click', toggle);
  update();
})();
