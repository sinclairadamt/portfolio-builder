
export const FONT_PAIRS = {
  'poppins-inter': {
    label: 'Poppins / Inter',
    headingFamily: "'Poppins', sans-serif",
    bodyFamily: "'Inter', sans-serif",
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500&display=swap',
  },
  'playfair-source-sans': {
    label: 'Playfair Display / Source Sans 3',
    headingFamily: "'Playfair Display', serif",
    bodyFamily: "'Source Sans 3', sans-serif",
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+3:wght@400;600&display=swap',
  },
  'space-grotesk-work-sans': {
    label: 'Space Grotesk / Work Sans',
    headingFamily: "'Space Grotesk', sans-serif",
    bodyFamily: "'Work Sans', sans-serif",
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Work+Sans:wght@400;500&display=swap',
  },
  'oswald-open-sans': {
    label: 'Oswald / Open Sans',
    headingFamily: "'Oswald', sans-serif",
    bodyFamily: "'Open Sans', sans-serif",
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Open+Sans:wght@400;500&display=swap',
  },
  'libre-baskerville-work-sans': {
    label: 'Libre Baskerville / Work Sans',
    headingFamily: "'Libre Baskerville', serif",
    bodyFamily: "'Work Sans', sans-serif",
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Work+Sans:wght@400;500&display=swap',
  },
  'raleway-roboto': {
    label: 'Raleway / Roboto',
    headingFamily: "'Raleway', sans-serif",
    bodyFamily: "'Roboto', sans-serif",
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Raleway:wght@600;700&family=Roboto:wght@400;500&display=swap',
  },
}

export function resolveFontPair(fontPairId) {
  return FONT_PAIRS[fontPairId] ?? FONT_PAIRS['poppins-inter']
}

// Shared with SettingsSidebar so the picker's options and the CSS this
// produces can't drift apart.
export const GALLERY_ASPECT_RATIO_PRESETS = {
  '16:9': { label: '16:9 (widescreen)', width: 16, height: 9 },
  '4:3': { label: '4:3 (standard)', width: 4, height: 3 },
  '3:2': { label: '3:2 (photo)', width: 3, height: 2 },
  '1:1': { label: '1:1 (square)', width: 1, height: 1 },
  custom: { label: 'Custom' },
}

export function resolveGalleryAspectRatioCss(siteSettings) {
  if (siteSettings.galleryAspectRatio === 'custom') {
    const { width, height } = siteSettings.galleryAspectRatioCustom || {}
    if (width > 0 && height > 0) return `${width} / ${height}`
    return '4 / 3'
  }
  const preset = GALLERY_ASPECT_RATIO_PRESETS[siteSettings.galleryAspectRatio]
  return preset ? `${preset.width} / ${preset.height}` : '4 / 3'
}

export function renderGoogleFontsLink(siteSettings) {
  const pair = resolveFontPair(siteSettings.fontPairId)
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${pair.googleFontsHref}">`
}

function resolveAlign(value, fallback) {
  return value === 'center' ? 'center' : value === 'left' ? 'left' : fallback === 'center' ? 'center' : 'left'
}

// Used for the gallery caption gradient, which needs raw r,g,b components so
// it can vary the alpha channel (rgba(var(--x), 0.75)) -- a plain hex custom
// property can't do that.
function hexToRgbTriplet(hex) {
  const clean = (hex || '#000000').replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num = parseInt(full, 16) || 0
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`
}

export function renderThemeStyleTag(siteSettings) {
  const palette = siteSettings.colorPalette
  const pair = resolveFontPair(siteSettings.fontPairId)
  // Fall back to the old single contentAlign field (pre-dating the
  // title/description/caption split) so a project that already set it
  // doesn't silently revert to left-aligned everywhere.
  const titleAlign = resolveAlign(siteSettings.titleAlign, siteSettings.contentAlign)
  const descriptionAlign = resolveAlign(siteSettings.descriptionAlign, siteSettings.contentAlign)
  const captionAlign = resolveAlign(siteSettings.captionAlign, siteSettings.contentAlign)
  return `<style>
:root {
  --color-primary: ${palette.primary};
  --color-primary-hover: ${palette.linkHover};
  --color-secondary: ${palette.secondary};
  --color-bg: ${palette.background};
  --color-text: ${palette.text};
  --menu-gradient-top: ${palette.menuGradientTop || palette.secondary};
  --menu-gradient-bottom: ${palette.menuGradientBottom || palette.primary};
  --form-bg: ${palette.formBackground || palette.background};
  --form-text: ${palette.formText || palette.text};
  --font-heading: ${pair.headingFamily};
  --font-body: ${pair.bodyFamily};
  --gallery-columns: ${siteSettings.galleryColumns || 3};
  --gallery-aspect-ratio: ${resolveGalleryAspectRatioCss(siteSettings)};
  --title-align: ${titleAlign};
  --description-align: ${descriptionAlign};
  --caption-align: ${captionAlign};
  --image-radius: ${siteSettings.imageCornerRadius ?? 8}px;
  --caption-gradient-rgb: ${hexToRgbTriplet(palette.captionGradient)};
  --nav-drawer-width: min(320px, 82vw);
}
${BASE_CSS}
${renderAccentLineCss(siteSettings)}
${renderNavToggleCss(siteSettings)}
${renderFullscreenCaptionCss(siteSettings)}
</style>`
}

// Preserves today's always-on lightbox caption for existing projects; this
// setting is just a way to turn off what already happens by default.
function renderFullscreenCaptionCss(siteSettings) {
  if (siteSettings.fullscreenCaption === false) {
    return '.lightbox-caption { display: none; }'
  }
  return ''
}

// Projects saved before this field existed have it as `undefined`, not
// `false` -- treat anything except an explicit `false` as "show", so
// existing projects keep their current look by default.
function renderAccentLineCss(siteSettings) {
  if (siteSettings.showAccentLine === false) {
    return '.project-detail h2 { border-bottom: none; padding-bottom: 0; }'
  }
  return ''
}

// 'always' applies the hamburger/drawer styles unconditionally; anything
// else (including old projects predating this setting) stays the safer
// 'mobile-only' default, wrapped in a media query so desktop keeps the
// plain inline nav links.
//
// The drawer pushes the page content left as it slides in (like the
// michaelkoerbel.com reference), rather than overlaying on top of it, so
// .page-shell (everything but the drawer) and .site-nav both move in
// lockstep off a shared --nav-drawer-width. The toggle button itself is the
// close control too (its glyph morphs between the two via navToggleScript),
// so there's only ever one button, at one location, instead of a second
// close button appearing somewhere else on the drawer.
function renderNavToggleCss(siteSettings) {
  // The toggle button lives outside .page-shell (a body-level sibling) so it
  // never moves when .page-shell is pushed left -- it needs position:fixed
  // here (not just relative) because as a sibling it would otherwise sit in
  // normal flow above .page-shell rather than pinned to the viewport corner.
  // The inline nav hides in favor of the drawer nav in this mode.
  const rules = `
.site-nav-inline { display: none; }
.nav-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 1.25rem;
  right: 1.5rem;
  z-index: 2001;
}
.page-shell { transition: transform 0.3s ease; }
.site-nav-drawer {
  position: fixed;
  top: 0;
  right: calc(-1 * var(--nav-drawer-width));
  height: 100vh;
  width: var(--nav-drawer-width);
  background: linear-gradient(180deg, var(--menu-gradient-top), var(--menu-gradient-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  transition: right 0.3s ease;
  z-index: 2000;
  padding: 2rem;
  box-sizing: border-box;
}
body.menu-open .page-shell { transform: translateX(calc(-1 * var(--nav-drawer-width))); }
body.menu-open .site-nav-drawer { right: 0; }
.site-nav-drawer a { color: white; font-size: 1.25rem; }
.site-nav-drawer a:hover { color: rgba(255, 255, 255, 0.75); }
.site-nav-drawer a[aria-current="page"] { color: white; text-decoration: underline; }
`
  if (siteSettings.navStyle === 'always') return rules
  return `@media (max-width: 768px) {\n${rules}\n}`
}

// The one polished, responsive theme for v1. Mobile-first: the media grid and
// contact layout collapse to a single column via auto-fill/media queries
// rather than a second theme.
const BASE_CSS = `
* { box-sizing: border-box; }
html, body { overflow-x: hidden; }
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}
h1, h2, h3 { font-family: var(--font-heading); line-height: 1.25; }
a { color: var(--color-primary); }
a:hover { color: var(--color-primary-hover); }
img { max-width: 100%; display: block; }
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.site-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
  color: var(--color-text);
}
/* height-constrained + width:auto keeps the logo's own aspect ratio intact
   (no forced-square crop) -- a max-width here would fight that by capping
   width independently of height, which would squish wide logos instead. */
.site-logo { height: 32px; width: auto; object-fit: contain; }
.site-nav-inline { display: flex; gap: 1.25rem; }
.site-nav-inline a, .site-nav-drawer a { text-decoration: none; color: var(--color-text); font-weight: 500; }
.site-nav-inline a:hover { color: var(--color-primary-hover); }
.site-nav-inline a[aria-current="page"] { color: var(--color-primary); }
.site-nav-drawer { display: none; }
.nav-toggle { display: none; background: none; border: none; font-size: 1.75rem; line-height: 1; cursor: pointer; color: var(--color-text); padding: 0.25rem; }

main { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

.gallery {
  display: grid;
  grid-template-columns: repeat(var(--gallery-columns), 1fr);
  gap: 1.75rem;
}
.gallery-item { position: relative; display: block; text-decoration: none; color: inherit; }
.gallery-thumb {
  aspect-ratio: var(--gallery-aspect-ratio);
  border-radius: var(--image-radius);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
}
.gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
.gallery-thumb-placeholder { width: 100%; height: 100%; }
.gallery-caption { margin: 0.6rem 0 0; font-weight: 500; text-align: var(--title-align); }

/* Overlay caption styles: the caption is taken out of flow and pinned to
   the bottom of .gallery-item (which sizes itself to .gallery-thumb, since
   the caption no longer contributes flow height), with a bottom-up
   gradient behind it for contrast. */
.gallery.caption-overlay .gallery-caption,
.gallery.caption-overlay-hover .gallery-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 1.5rem 0.85rem 0.75rem;
  color: #fff;
  border-radius: 0 0 var(--image-radius) var(--image-radius);
  background: linear-gradient(to top, rgba(var(--caption-gradient-rgb), 0.75), rgba(var(--caption-gradient-rgb), 0));
}
.gallery.caption-overlay-hover .gallery-caption {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.gallery.caption-overlay-hover .gallery-item:hover .gallery-caption,
.gallery.caption-overlay-hover .gallery-item:focus-visible .gallery-caption {
  opacity: 1;
}

.project-detail { max-width: 800px; margin: 0 auto; }
.project-detail h2 {
  font-size: 1.75rem;
  border-bottom: 2px solid var(--color-secondary);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: var(--title-align);
}
.project-description { margin: 0 0 1.5rem; opacity: 0.8; text-align: var(--description-align); }
.project-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-weight: 500;
}

/* Project pages: each image/video fills the full content width, stacked
   vertically when a project has more than one. */
.media-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.media-item { position: relative; margin: 0; width: 100%; }
.media-image-button {
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
  width: 100%;
  display: block;
  border-radius: var(--image-radius);
  overflow: hidden;
}
.media-image-button img { width: 100%; height: auto; display: block; }
figcaption { font-size: 0.85rem; margin-top: 0.4rem; opacity: 0.7; text-align: var(--caption-align); }

/* Overlay caption styles, matching the gallery's treatment -- the caption
   is taken out of flow and pinned to the bottom of .media-item, which
   works for both image buttons and the youtube facade since both leave
   .media-item sized to their own content. */
.media-grid.caption-overlay figcaption,
.media-grid.caption-overlay-hover figcaption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 1.5rem 0.85rem 0.75rem;
  color: #fff;
  opacity: 1;
  background: linear-gradient(to top, rgba(var(--caption-gradient-rgb), 0.75), rgba(var(--caption-gradient-rgb), 0));
  border-radius: 0 0 var(--image-radius) var(--image-radius);
}
.media-grid.caption-overlay-hover figcaption {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.media-grid.caption-overlay-hover .media-item:hover figcaption,
.media-grid.caption-overlay-hover .media-item:focus-within figcaption {
  opacity: 1;
}

.youtube-facade {
  position: relative;
  aspect-ratio: 16 / 9;
  cursor: pointer;
  border-radius: var(--image-radius);
  overflow: hidden;
  background: #000;
}
.youtube-facade img { width: 100%; height: 100%; object-fit: cover; }
.youtube-play-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
.media-item iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: var(--image-radius); }

.about { display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start; }
.about-photo { width: 220px; height: 220px; object-fit: cover; border-radius: 12px; flex-shrink: 0; }
.about-bio { flex: 1; min-width: 240px; }

.button {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  font-weight: 600;
}
.resume-button { margin-top: 1rem; }

.contact { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.social-links { list-style: none; padding: 0; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
.social-links a { display: inline-flex; align-items: center; }
.social-links svg { width: 24px; height: 24px; fill: currentColor; }
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--form-text);
}
.contact-form label { font-weight: 500; font-size: 0.9rem; }
.contact-form input, .contact-form textarea {
  padding: 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font: inherit;
  background: var(--form-bg);
  color: inherit;
}
.contact-form textarea {
  resize: none;
  overflow-y: auto;
}
.contact-form input::placeholder, .contact-form textarea::placeholder {
  color: inherit;
  opacity: 0.6;
}
.contact-form button {
  align-self: flex-start;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.site-footer { text-align: center; padding: 1.5rem; font-size: 0.85rem; opacity: 0.6; }

.back-to-top {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 500;
}
.back-to-top:hover { background: var(--color-primary-hover); }

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 1000;
}
.lightbox[hidden] { display: none; }
.lightbox-media {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  max-height: calc(100vh - 4rem);
}
/* calc() accounts for the lightbox's own 2rem top+bottom padding, so the
   image actually reaches the full available height instead of overflowing
   past the viewport edge behind it. */
.lightbox-image { max-width: 100%; max-height: calc(100vh - 4rem); display: block; }
.lightbox-caption { color: white; margin-top: 1rem; text-align: center; }

/* Overlay caption styles, matching the gallery/media-grid treatment. */
.lightbox.caption-overlay .lightbox-caption,
.lightbox.caption-overlay-hover .lightbox-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 2rem 1rem 1rem;
  background: linear-gradient(to top, rgba(var(--caption-gradient-rgb), 0.75), rgba(var(--caption-gradient-rgb), 0));
}
.lightbox.caption-overlay-hover .lightbox-caption {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.lightbox.caption-overlay-hover .lightbox-media:hover .lightbox-caption,
.lightbox.caption-overlay-hover .lightbox-media:focus-within .lightbox-caption {
  opacity: 1;
}
.lightbox-close {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
}
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  line-height: 1;
  padding: 0.5rem;
}
.lightbox-nav[hidden] { display: none; }
.lightbox-prev { left: 1rem; }
.lightbox-next { right: 1rem; }

.empty-state { text-align: center; padding: 4rem 0; opacity: 0.6; }

@media (max-width: 640px) {
  .site-nav-inline { gap: 0.75rem; font-size: 0.9rem; }
  main { padding: 1.5rem 1rem 3rem; }
  .contact { grid-template-columns: 1fr; }
  .about-photo { width: 160px; height: 160px; }
  /* Ignore the chosen column count on phones -- 4-5 columns from a desktop
     setting would cram the gallery unreadably small. */
  .gallery { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
}
`
