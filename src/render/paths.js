// Pages live at index.html (home), about/index.html, contact/index.html on
// export. pathPrefix is how far up from the *current* page you need to go to
// reach the site root -- '' for home, '../' for the one-level-deep pages.
export const PAGES = {
  home: { slug: '', title: 'Home' },
  about: { slug: 'about', title: 'About' },
  contact: { slug: 'contact', title: 'Contact' },
}

export function pathPrefixFor(pageKey) {
  return pageKey === 'home' ? '' : '../'
}

export function hrefTo(fromPageKey, toPageKey) {
  const prefix = pathPrefixFor(fromPageKey)
  const target = PAGES[toPageKey]
  return target.slug ? `${prefix}${target.slug}/` : prefix || './'
}

// Export-mode resolver: relative-path-only, so the site survives being
// hosted at a GitHub Pages project subpath (username.github.io/repo-name/).
export function makeExportAssetResolver(project, pathPrefix) {
  return (assetId) => {
    const entry = project.assets[assetId]
    return entry ? `${pathPrefix}assets/${entry.storedFilename}` : ''
  }
}
