export function renderLightboxMarkup() {
  return `<div id="lightbox" class="lightbox" hidden>
  <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
  <img class="lightbox-image" src="" alt="">
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

  function open(src, alt, captionText) {
    img.src = src;
    img.alt = alt || '';
    caption.textContent = captionText || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
    el.addEventListener('click', function () {
      open(el.getAttribute('data-lightbox-src'), el.getAttribute('data-lightbox-alt'), el.getAttribute('data-lightbox-caption'));
    });
  });
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

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
