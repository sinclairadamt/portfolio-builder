import { escapeHtml } from './escapeHtml.js'
import { renderGoogleFontsLink, renderThemeStyleTag } from './theme.js'
import { renderLightboxMarkup, lightboxScript } from './components/lightbox.js'
import { previewNavScript } from './components/previewNav.js'
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
    pageKey === 'home' ? siteTitle : `${pageTitleOverride ?? PAGES[pageKey].title} — ${siteTitle}`
  const metaDescription = escapeHtml(description || '')

  const logoSrc = siteSettings.logoAssetId ? resolveAsset(siteSettings.logoAssetId) : ''
  const ogImageAssetId = siteSettings.logoAssetId || firstPortfolioImageAssetId(project)
  const ogImageSrc = ogImageAssetId ? resolveAsset(ogImageAssetId) : ''

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
${logoSrc ? `<link rel="icon" href="${escapeHtml(logoSrc)}">` : ''}
${renderGoogleFontsLink(siteSettings)}
${renderThemeStyleTag(siteSettings)}
</head>
<body>
<header class="site-header">
  <a class="site-title" href="${homeHref}"${homeDataPage}>${logoSrc ? `<img class="site-logo" src="${escapeHtml(logoSrc)}" alt="">` : ''}${escapeHtml(siteTitle)}</a>
  <nav class="site-nav">${nav}</nav>
</header>
<main>${bodyHtml}</main>
<footer class="site-footer"><p>&copy; ${escapeHtml(siteTitle)}</p></footer>
${renderLightboxMarkup()}
<script>${lightboxScript}</script>
${isPreview ? `<script>${previewNavScript}</script>` : ''}
</body>
</html>`
}
