import { escapeHtml } from './escapeHtml.js'
import { renderGoogleFontsLink, renderThemeStyleTag } from './theme.js'
import { renderLightboxMarkup, lightboxScript } from './components/lightbox.js'
import { previewNavScript } from './components/previewNav.js'
import { navToggleScript } from './components/navToggle.js'
import { PAGES, hrefTo } from './paths.js'

function firstPortfolioImageAssetId(project) {
  for (const proj of project.portfolio.projects) {
    const image = proj.media.find((media) => media.type === 'image')
    if (image) return image.assetId
  }
  return null
}

// `pageTitleOverride` is needed for pageKey 'project', which isn't a fixed
// PAGES entry -- its page title is the project's own title, not a nav label.
export function renderPage({
  pageKey,
  project,
  resolveAsset,
  bodyHtml,
  description,
  pageTitleOverride,
  isPreview = false,
}) {
  const { siteSettings } = project
  const siteTitle = siteSettings.siteTitle || 'My Portfolio'
  const pageTitle =
    pageKey === 'home' ? siteTitle : `${siteTitle} - ${pageTitleOverride ?? PAGES[pageKey].title}`
  const metaDescription = escapeHtml(description || '')

  const logoSrc = siteSettings.logoAssetId ? resolveAsset(siteSettings.logoAssetId) : ''
  // The logo stays usable as an OG preview image even when it's hidden from
  // the header -- "remove the logo but still have a favicon" is the whole
  // point of showLogoInHeader.
  const headerLogoSrc = siteSettings.showLogoInHeader !== false ? logoSrc : ''
  const ogImageAssetId = siteSettings.logoAssetId || firstPortfolioImageAssetId(project)
  const ogImageSrc = ogImageAssetId ? resolveAsset(ogImageAssetId) : ''
  // Falls back to the logo when no separate favicon was uploaded.
  const faviconAssetId = siteSettings.faviconAssetId || siteSettings.logoAssetId
  const faviconSrc = faviconAssetId ? resolveAsset(faviconAssetId) : ''

  // In preview mode, nav links get a harmless '#' href (real navigation is
  // intercepted by previewNavScript below) instead of the export's
  // folder-style relative paths, which have no real file tree behind them
  // inside a single iframe srcdoc.
  const homeHref = isPreview ? '#' : hrefTo(pageKey, 'home')
  const homeDataPage = isPreview ? ' data-page="home"' : ''
  const nav = Object.keys(PAGES)
    .map((key) => {
      // A project's own page is conceptually part of the portfolio section,
      // so the "Portfolio" nav link shows as current there too.
      const isCurrent = key === pageKey || (pageKey === 'project' && key === 'home')
      const current = isCurrent ? ' aria-current="page"' : ''
      const href = isPreview ? '#' : hrefTo(pageKey, key)
      const dataPage = isPreview ? ` data-page="${key}"` : ''
      return `<a href="${href}"${dataPage}${current}>${PAGES[key].title}</a>`
    })
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${metaDescription}">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${metaDescription}">
${ogImageSrc ? `<meta property="og:image" content="${escapeHtml(ogImageSrc)}">` : ''}
${faviconSrc ? `<link rel="icon" href="${escapeHtml(faviconSrc)}">` : ''}
${renderGoogleFontsLink(siteSettings)}
${renderThemeStyleTag(siteSettings)}
</head>
<body>
<button type="button" class="nav-toggle" data-nav-toggle aria-label="Open menu" aria-expanded="false">&#9776;</button>
<div class="page-shell" data-page-shell>
<header class="site-header">
  <a class="site-title" href="${homeHref}"${homeDataPage}>${headerLogoSrc ? `<img class="site-logo" src="${escapeHtml(headerLogoSrc)}" alt="">` : ''}${escapeHtml(siteTitle)}</a>
  <nav class="site-nav-inline">${nav}</nav>
</header>
<main>${bodyHtml}</main>
<footer class="site-footer"><p>&copy; ${escapeHtml(siteTitle)}</p></footer>
</div>
<nav class="site-nav-drawer" data-site-nav>${nav}</nav>
${renderLightboxMarkup()}
<script>${lightboxScript}</script>
<script>${navToggleScript}</script>
${isPreview ? `<script>${previewNavScript}</script>` : ''}
</body>
</html>`
}
