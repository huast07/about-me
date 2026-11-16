/* Delegated events also work when progressive navigation restores this page. */
(() => {
  if (window.volunteerGalleryReady) return;
  window.volunteerGalleryReady = true;
  let photos = [], index = 0;
  const dialog = () => document.querySelector('.volunteer-lightbox');
  function show(next) {
    index = (next + photos.length) % photos.length;
    const modal = dialog(), photo = photos[index], image = modal.querySelector('figure img');
    image.src = photo.href;
    image.alt = photo.dataset.caption;
    modal.querySelector('figcaption').textContent = photo.dataset.caption;
    modal.querySelector('[role="status"]').textContent = `${index + 1} / ${photos.length}`;
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-gallery-photo], .volunteer-gallery-open, [data-gallery-close], [data-gallery-prev], [data-gallery-next]');
    if (!target) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const gallery = target.closest('.volunteer-gallery'), modal = dialog();
    if (!modal) return;
    if (gallery) {
      event.preventDefault();
      photos = [...gallery.querySelectorAll('[data-gallery-photo]')];
      modal.querySelector('h2').textContent = gallery.dataset.galleryTitle;
      show(Math.max(0, photos.indexOf(target)));
      modal.showModal();
    } else if (target.hasAttribute('data-gallery-close')) modal.close();
    else if (target.hasAttribute('data-gallery-prev')) show(index - 1);
    else if (target.hasAttribute('data-gallery-next')) show(index + 1);
  });
  document.addEventListener('keydown', event => {
    if (!dialog()?.open) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
})();
