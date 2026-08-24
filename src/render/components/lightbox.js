export function renderLightboxMarkup() {
  return `<div id="lightbox" class="lightbox" hidden>
  <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
  <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous image" hidden>&#8249;</button>
  <img class="lightbox-image" src="" alt="">
  <button type="button" class="lightbox-nav lightbox-next" aria-label="Next image" hidden>&#8250;</button>
  <p class="lightbox-caption"></p>
</div>`
}

// Same script runs in both the editor's live preview and the final export --
// that's what keeps them from drifting apart. Click-to-play facade for
// YouTube avoids loading multiple embedded players before the visitor asks
// for one.
export const lightboxScript = `(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var img = lightbox.querySelector('.lightbox-image');
  var caption = lightbox.querySelector('.lightbox-caption');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');
  // Every lightbox-triggering image on the page belongs to the one project
  // (or About photo) rendered there, so this is already scoped correctly --
  // no separate "which project" bookkeeping needed.
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-src]'));
  var currentIndex = -1;

  function openIndex(index) {
    var el = items[index];
    if (!el) return;
    currentIndex = index;
    img.src = el.getAttribute('data-lightbox-src');
    img.alt = el.getAttribute('data-lightbox-alt') || '';
    caption.textContent = el.getAttribute('data-lightbox-caption') || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
  }
  function step(delta) {
    openIndex((currentIndex + delta + items.length) % items.length);
  }

  items.forEach(function (el, index) {
    el.addEventListener('click', function () { openIndex(index); });
  });
  if (items.length > 1) {
    prevBtn.hidden = false;
    nextBtn.hidden = false;
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
  }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' && items.length > 1) step(-1);
    if (e.key === 'ArrowRight' && items.length > 1) step(1);
  });

  document.querySelectorAll('[data-youtube-facade]').forEach(function (el) {
    el.addEventListener('click', function () {
      var videoId = el.getAttribute('data-youtube-facade');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1';
      iframe.title = 'YouTube video player';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      el.replaceWith(iframe);
    });
  });
})();`
