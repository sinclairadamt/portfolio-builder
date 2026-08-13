import { escapeHtml } from '../escapeHtml.js'

// GitHub Pages serves this for any missing path, but the browser's address
// bar still shows the original (possibly deeply nested) URL -- a plain
// relative link can't reliably get back to the real site root from there.
// Publish URL, when the student has filled it in, gives us a real absolute
// link; otherwise we fall back to a same-directory relative link, which
// works when 404.html is being viewed directly at the site root.
export function renderNotFoundPage(project) {
  const home = project.siteSettings.publishUrl?.trim() || './'
  return `<section class="empty-state">
  <h2>Page Not Found</h2>
  <p>Sorry, that page doesn't exist. <a href="${escapeHtml(home)}">Go back home</a>.</p>
</section>`
}
