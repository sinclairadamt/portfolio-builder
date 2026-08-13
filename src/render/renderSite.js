import { renderPage } from './layout.js'
import { renderHomePage } from './pages/home.js'
import { renderAboutPage } from './pages/about.js'
import { renderContactPage } from './pages/contact.js'
import { makeExportAssetResolver, pathPrefixFor } from './paths.js'

// The single seam that keeps live preview and static export from drifting
// apart: both call this with the same project data, differing only in how
// asset URLs resolve. `makeResolver(pathPrefix) => (assetId) => url` defaults
// to relative export paths; preview mode passes one that ignores pathPrefix
// entirely and looks up pre-warmed blob: URLs instead (see ProjectSession).
export function renderSitePages(project, { makeResolver, isPreview = false } = {}) {
  const resolverFactory = makeResolver ?? ((pathPrefix) => makeExportAssetResolver(project, pathPrefix))

  const homeResolve = resolverFactory(pathPrefixFor('home'))
  const aboutResolve = resolverFactory(pathPrefixFor('about'))
  const contactResolve = resolverFactory(pathPrefixFor('contact'))

  return {
    home: renderPage({
      pageKey: 'home',
      project,
      resolveAsset: homeResolve,
      bodyHtml: renderHomePage(project, homeResolve),
      description: project.siteSettings.tagline,
      isPreview,
    }),
    about: renderPage({
      pageKey: 'about',
      project,
      resolveAsset: aboutResolve,
      bodyHtml: renderAboutPage(project, aboutResolve),
      isPreview,
    }),
    contact: renderPage({
      pageKey: 'contact',
      project,
      resolveAsset: contactResolve,
      bodyHtml: renderContactPage(project),
      isPreview,
    }),
  }
}
