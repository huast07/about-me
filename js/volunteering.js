/* Each volunteering album is an inline carousel. Delegated controls keep working
   when progressive navigation restores this page. */
(() => {
  if (window.volunteerGalleryReady) return;
  window.volunteerGalleryReady = true;

  function makeCarousel(gallery) {
    const photos = [...gallery.querySelectorAll('[data-gallery-photo]')];
    if (!photos.length) return;
    let index = 0, startX = null;
    const carousel = document.createElement('section');
    carousel.className = 'volunteer-carousel';
    carousel.setAttribute('aria-label', `${gallery.dataset.galleryTitle} photo carousel`);
    carousel.innerHTML = `<div class="volunteer-carousel-frame">
        <img class="volunteer-carousel-image" alt="" decoding="async">
        <button class="volunteer-carousel-arrow volunteer-carousel-previous" type="button" aria-label="Previous photo">←</button>
        <button class="volunteer-carousel-arrow volunteer-carousel-next" type="button" aria-label="Next photo">→</button>
      </div>
      <div class="volunteer-carousel-meta"><p class="volunteer-carousel-caption"></p>
        <span class="volunteer-carousel-count mono" aria-live="polite"></span></div>`;
    gallery.replaceChildren(carousel);
    const image = carousel.querySelector('img');
    const caption = carousel.querySelector('.volunteer-carousel-caption');
    const count = carousel.querySelector('.volunteer-carousel-count');
    function show(next) {
      index = (next + photos.length) % photos.length;
      const photo = photos[index];
      image.alt = photo.dataset.caption;
      caption.textContent = photo.dataset.caption;
      count.textContent = `${index + 1} / ${photos.length}`;
      const nextImage = new Image();
      nextImage.src = photo.href;
      const replaceImage = () => { image.src = nextImage.src; };
      if (nextImage.complete && nextImage.naturalWidth) replaceImage();
      else nextImage.addEventListener('load', replaceImage, { once: true });

      const adjacent = [index - 1, index + 1];
      adjacent.forEach(position => {
        const preload = new Image();
        preload.src = photos[(position + photos.length) % photos.length].href;
      });
    }
    carousel.querySelector('.volunteer-carousel-previous').addEventListener('click', () => show(index - 1));
    carousel.querySelector('.volunteer-carousel-next').addEventListener('click', () => show(index + 1));
    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    });
    carousel.tabIndex = 0;
    carousel.addEventListener('pointerdown', event => { startX = event.clientX; });
    carousel.addEventListener('pointerup', event => {
      if (startX === null) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 35) show(index + (distance < 0 ? 1 : -1));
      startX = null;
    });
    carousel.addEventListener('pointercancel', () => { startX = null; });
    show(0);
  }

  document.querySelectorAll('.volunteer-gallery').forEach(makeCarousel);
})();
