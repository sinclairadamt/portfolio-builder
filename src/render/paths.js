// Pages live at index.html (home), about/index.html, contact/index.html on
// export. pathPrefix is how far up from the *current* page you need to go to
// reach the site root -- '' for home, '../' for the one-level-deep pages.
export const PAGES = {
  home: { slug: '', title: 'Portfolio' },
  about: { slug: 'about', title: 'About' },
  contact: { slug: 'contact', title: 'Contact' },
}

// 'project' pages live at projects/<id>/index.html -- TWO directory segments
// ("projects" and "<id>"), not one, so they need '../../' to reach the site
// root, not '../' like about/contact.
export function pathPrefixFor(pageKey) {
  if (pageKey === 'home') return ''
  if (pageKey === 'project') return '../../'
  return '../'
}

export function hrefTo(fromPageKey, toPageKey) {
  const prefix = pathPrefixFor(fromPageKey)
  const target = PAGES[toPageKey]
  return target.slug ? `${prefix}${target.slug}/` : prefix || './'
}

export function projectSlug(projectId) {
  return `projects/${projectId}`
}

export function hrefToProject(fromPageKey, projectId) {
  return `${pathPrefixFor(fromPageKey)}${projectSlug(projectId)}/`
}

// Export-mode resolver: relative-path-only, so the site survives being
// hosted at a GitHub Pages project subpath (username.github.io/repo-name/).
export function makeExportAssetResolver(project, pathPrefix) {
  return (assetId) => {
    const entry = project.assets[assetId]
    return entry ? `${pathPrefix}assets/${entry.storedFilename}` : ''
  }
}
