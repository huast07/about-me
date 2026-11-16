/* Rotate the original slides after each animation for a continuous loop. */
(() => {
  if (window.militaryCarouselReady) return;
  window.militaryCarouselReady = true;
  function initialize() {
    document.querySelectorAll('.military-album:not([data-carousel-ready])').forEach(album => {
      album.dataset.carouselReady = 'true';
      const track = album.querySelector('.military-photos');
      const slides = [...track.children];
      const viewport = document.createElement('div');
      viewport.className = 'military-window';
      track.before(viewport); viewport.append(track);
      slides.forEach(slide => { const image = slide.querySelector('img'); image.draggable = false; image.loading = 'eager'; });
      if (slides.length < 2) return;
      album.setAttribute('aria-roledescription', 'carousel');
      const controls = document.createElement('div');
      controls.className = 'military-controls';
      controls.innerHTML = '<button type="button" aria-label="Previous photos">←</button><button type="button" aria-label="Next photos">→</button>';
      album.append(controls);
      const status = document.createElement('span');
      status.className = 'sr'; status.setAttribute('aria-live', 'polite'); album.append(status);
      let busy = false, start = null, suppressClick = false;
      async function move(direction) {
        if (busy || !track.isConnected) return;
        busy = true;
        const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
        let clone;
        if (direction > 0) {
          clone = track.firstElementChild.cloneNode(true);
          clone.inert = true; clone.setAttribute('aria-hidden', 'true'); track.append(clone);
        }
        if (direction < 0) track.prepend(track.lastElementChild);
        const from = direction < 0 ? -step : 0, to = direction < 0 ? 0 : -step;
        const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
        await track.animate([{ transform:`translateX(${from}px)` }, { transform:`translateX(${to}px)` }], {duration, easing:'cubic-bezier(.22,.61,.36,1)'}).finished;
        if (direction > 0) { clone.remove(); track.append(track.firstElementChild); }
        status.textContent = `Photo ${slides.indexOf(track.firstElementChild) + 1} of ${slides.length}`;
        busy = false;
      }
      controls.children[0].addEventListener('click', () => move(-1));
      controls.children[1].addEventListener('click', () => move(1));
      album.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
        event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
      });
      viewport.addEventListener('pointerdown', event => { start = {x:event.clientX,y:event.clientY}; suppressClick = false; });
      viewport.addEventListener('pointerup', event => {
        if (!start) return;
        const dx = event.clientX-start.x, dy = event.clientY-start.y;
        if (Math.abs(dx)>35 && Math.abs(dx)>Math.abs(dy)) { suppressClick = true; move(dx<0 ? 1 : -1); }
        start = null;
      });
      viewport.addEventListener('pointercancel', () => { start = null; });
      viewport.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); suppressClick = false; } });
      viewport.addEventListener('dragstart', event => event.preventDefault());
    });
  }
  initialize();
  addEventListener('portfolio:pagechange', initialize);
})();
