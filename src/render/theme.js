
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
}

export function resolveFontPair(fontPairId) {
  return FONT_PAIRS[fontPairId] ?? FONT_PAIRS['poppins-inter']
}

export function renderGoogleFontsLink(siteSettings) {
  const pair = resolveFontPair(siteSettings.fontPairId)
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${pair.googleFontsHref}">`
}

export function renderThemeStyleTag(siteSettings) {
  const palette = siteSettings.colorPalette
  const pair = resolveFontPair(siteSettings.fontPairId)
  return `<style>
:root {
  --color-primary: ${palette.primary};
  --color-secondary: ${palette.secondary};
  --color-bg: ${palette.background};
  --color-text: ${palette.text};
  --font-heading: ${pair.headingFamily};
  --font-body: ${pair.bodyFamily};
}
${BASE_CSS}
</style>`
}

// The one polished, responsive theme for v1. Mobile-first: the media grid and
// contact layout collapse to a single column via auto-fill/media queries
// rather than a second theme.
const BASE_CSS = `
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}
h1, h2, h3 { font-family: var(--font-heading); line-height: 1.25; }
a { color: var(--color-primary); }
img { max-width: 100%; display: block; }

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
.site-logo { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; }
.site-nav { display: flex; gap: 1.25rem; }
.site-nav a { text-decoration: none; color: var(--color-text); font-weight: 500; }
.site-nav a[aria-current="page"] { color: var(--color-primary); }

main { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

.category { margin-bottom: 3rem; }
.category h2 {
  font-size: 1.5rem;
  border-bottom: 2px solid var(--color-secondary);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}
.project { margin-bottom: 2.5rem; }
.project h3 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.project-description { margin: 0 0 1rem; opacity: 0.8; }

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.media-item { margin: 0; }
.media-image-button {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
.media-image-button img { aspect-ratio: 4 / 3; object-fit: cover; width: 100%; }
figcaption { font-size: 0.85rem; margin-top: 0.4rem; opacity: 0.7; }

.youtube-facade {
  position: relative;
  aspect-ratio: 16 / 9;
  cursor: pointer;
  border-radius: 8px;
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
.media-item iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; }

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
.social-links { list-style: none; padding: 0; display: flex; gap: 1rem; flex-wrap: wrap; }
.contact-form { display: flex; flex-direction: column; gap: 0.75rem; }
.contact-form label { font-weight: 500; font-size: 0.9rem; }
.contact-form input, .contact-form textarea {
  padding: 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font: inherit;
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
.lightbox-image { max-width: 100%; max-height: 80vh; border-radius: 4px; }
.lightbox-caption { color: white; margin-top: 1rem; text-align: center; }
.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-size: 2rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  line-height: 1;
}

.empty-state { text-align: center; padding: 4rem 0; opacity: 0.6; }

@media (max-width: 640px) {
  .site-nav { gap: 0.75rem; font-size: 0.9rem; }
  main { padding: 1.5rem 1rem 3rem; }
  .contact { grid-template-columns: 1fr; }
  .about-photo { width: 160px; height: 160px; }
}
`
