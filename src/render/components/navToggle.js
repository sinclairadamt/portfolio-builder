// Hamburger menu behavior -- real UI on the published site (unlike
// previewNavScript, this isn't preview-only), so it's always included. CSS
// decides whether the toggle/drawer are actually visible (see
// theme.js renderNavToggleCss) -- this script just wires the interaction
// whenever those elements exist.
//
// One button doubles as both open and close control (its glyph morphs
// between the two), so the "X" always sits exactly where the hamburger icon
// was rather than a second close button appearing elsewhere. Opening toggles
// a class on <body> rather than the nav itself, since CSS uses that same
// class to push .page-shell left in sync with the drawer sliding in.
export const navToggleScript = `(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  if (!toggle) return;
  var openGlyph = toggle.innerHTML;
  var closeGlyph = '&times;';

  function isOpen() {
    return document.body.classList.contains('menu-open');
  }
  function setOpen(open) {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? closeGlyph : openGlyph;
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen());
  });
  document.querySelectorAll('[data-site-nav] a').forEach(function (a) {
    a.addEventListener('click', function () {
      setOpen(false);
    });
  });
})();`
