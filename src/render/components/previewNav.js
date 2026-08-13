// Preview mode renders one page at a time into a single iframe srcdoc -- there
// is no real file tree behind it, so the export's folder-style relative links
// (about/, ../contact/) would 404 if actually navigated. This intercepts nav
// clicks and asks the host app to swap which page is rendered into the same
// iframe instead of performing a real navigation. Not used in the exported
// site, where those links point at real files and should navigate normally.
export const previewNavScript = `(function () {
  document.querySelectorAll('[data-page]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.parent.postMessage({ source: 'portfolio-builder-preview', pageKey: el.getAttribute('data-page') }, '*');
    });
  });
})();`
