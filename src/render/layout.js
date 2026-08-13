import { escapeHtml } from './escapeHtml.js'
import { renderGoogleFontsLink, renderThemeStyleTag } from './theme.js'
import { renderLightboxMarkup, lightboxScript } from './components/lightbox.js'
import { PAGES, hrefTo } from './paths.js'

function firstPortfolioImageAssetId(project) {
  for (const category of project.portfolio.categories) {
    for (const proj of category.projects) {
      const image = proj.media.find((media) => media.type === 'image')
      if (image) return image.assetId
    }
  }
  return null
}

export function renderPage({ pageKey, project, resolveAsset, bodyHtml, description }) {
  const { siteSettings } = project
  const siteTitle = siteSettings.siteTitle || 'My Portfolio'
  const pageTitle = pageKey === 'home' ? siteTitle : `${PAGES[pageKey].title} — ${siteTitle}`
  const metaDescription = escapeHtml(description || siteSettings.tagline || '')

  const logoSrc = siteSettings.logoAssetId ? resolveAsset(siteSettings.logoAssetId) : ''
  const ogImageAssetId = siteSettings.logoAssetId || firstPortfolioImageAssetId(project)
  const ogImageSrc = ogImageAssetId ? resolveAsset(ogImageAssetId) : ''

  const nav = Object.keys(PAGES)
    .map((key) => {
      const current = key === pageKey ? ' aria-current="page"' : ''
      return `<a href="${hrefTo(pageKey, key)}"${current}>${PAGES[key].title}</a>`
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
  <a class="site-title" href="${hrefTo(pageKey, 'home')}">${logoSrc ? `<img class="site-logo" src="${escapeHtml(logoSrc)}" alt="">` : ''}${escapeHtml(siteTitle)}</a>
  <nav class="site-nav">${nav}</nav>
</header>
<main>${bodyHtml}</main>
<footer class="site-footer"><p>&copy; ${escapeHtml(siteTitle)}</p></footer>
${renderLightboxMarkup()}
<script>${lightboxScript}</script>
</body>
</html>`
}
