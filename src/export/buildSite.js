import JSZip from 'jszip'
import { renderSitePages } from '../render/renderSite.js'
import { renderPage } from '../render/layout.js'
import { renderNotFoundPage } from '../render/pages/notFound.js'
import { projectSlug } from '../render/paths.js'
import { renderSitemapXml, renderRobotsTxt } from './seo.js'

// Assembles the full deployable static site as a Map<relativePath, string|Blob>.
// Paths are relative throughout (enforced by the render layer) so the result
// survives being hosted at a GitHub Pages project subpath
// (username.github.io/repo-name/), and matches exactly what GitHub Pages
// expects: index.html at the top of the publishing source, sub-pages as
// folder/index.html.
export async function buildSiteFiles(project, store) {
  const pages = renderSitePages(project)
  const files = new Map()

  files.set('index.html', pages.home)
  files.set('about/index.html', pages.about)
  files.set('contact/index.html', pages.contact)
  for (const [projectId, html] of Object.entries(pages.projects)) {
    files.set(`${projectSlug(projectId)}/index.html`, html)
  }
  files.set(
    '404.html',
    renderPage({ pageKey: 'home', project, resolveAsset: () => '', bodyHtml: renderNotFoundPage(project) })
  )
  files.set('robots.txt', renderRobotsTxt(project))
  // Disables Jekyll processing on GitHub Pages -- cheap insurance even though
  // this Vite-built output rarely needs it.
  files.set('.nojekyll', '')

  const sitemap = renderSitemapXml(project)
  if (sitemap) files.set('sitemap.xml', sitemap)

  for (const assetId of Object.keys(project.assets)) {
    const entry = project.assets[assetId]
    const blob = await store.readAssetBlob(entry.storedFilename)
    files.set(`assets/${entry.storedFilename}`, blob)
  }

  return files
}

export async function buildSiteZip(project, store) {
  const files = await buildSiteFiles(project, store)
  const zip = new JSZip()
  for (const [path, content] of files) {
    zip.file(path, content)
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

// FSA folder-mode delivery: write the site directly into a folder the
// student picks (e.g. a docs/ folder inside a repo they already cloned).
export async function writeSiteToDirectory(files, dirHandle) {
  for (const [path, content] of files) {
    const parts = path.split('/')
    const filename = parts.pop()
    let dir = dirHandle
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true })
    }
    const fileHandle = await dir.getFileHandle(filename, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }
}
