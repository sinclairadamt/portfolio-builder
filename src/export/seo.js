// sitemap.xml needs real absolute URLs, which we only have if the student
// filled in Publish URL on Site Settings -- omit it entirely rather than
// guess at a base.
export function renderSitemapXml(project) {
  const publishUrl = project.siteSettings.publishUrl?.trim()
  if (!publishUrl) return null

  const base = publishUrl.replace(/\/?$/, '/')
  const paths = ['', 'about/', 'contact/']
  const urlEntries = paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
}

export function renderRobotsTxt(project) {
  const publishUrl = project.siteSettings.publishUrl?.trim()
  const sitemapLine = publishUrl ? `Sitemap: ${publishUrl.replace(/\/?$/, '/')}sitemap.xml\n` : ''
  return `User-agent: *\nAllow: /\n${sitemapLine}`
}
