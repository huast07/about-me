/* One recording and one audio graph for the whole visit. Navigation never replaces it. */
(() => {
  const button = document.getElementById('musicBtn');
  const label = button.querySelector('.t');
  const status = document.getElementById('musicStatus');
  const trackURL = new URL('../assets/audio/winter-largo.mp3', document.currentScript.src);
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
    button.setAttribute('aria-label', wanted ? 'Pause music: Vivaldi, Winter — Largo' : 'Play music: Vivaldi, Winter — Largo');
    label.textContent = wanted && !source ? 'Loading…' : playing ? 'Pause music' : 'Play music';
    status.textContent = message;
  }

  async function toggle() {
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
        loading = fetch(trackURL).then(response => {
          if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
          return response.arrayBuffer();
        }).then(data => context.decodeAudioData(data)).then(seamlessLoop).catch(error => {
          loading = null;
          throw error;
        });
      }
      const buffer = await loading;
      if (!wanted) return;
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
      wanted = false;
      update('Music could not start. Select Play music to try again.');
      console.warn('Music playback failed', error);
    }
  }
  button.addEventListener('click', toggle);
  update();
})();
