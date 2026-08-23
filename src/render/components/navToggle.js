// Hamburger menu behavior -- real UI on the published site (unlike
// previewNavScript, this isn't preview-only), so it's always included. CSS
// decides whether the toggle/drawer are actually visible (see
// theme.js renderNavToggleCss) -- this script just wires the interaction
// whenever those elements exist.
export const navToggleScript = `(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  var closeBtn = document.querySelector('[data-nav-close]');
  if (!toggle || !nav) return;

  function openMenu() {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    if (nav.classList.contains('open')) closeMenu();
    else openMenu();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
})();`
