import { escapeHtml, escapeHtmlMultiline } from '../escapeHtml.js'
import { renderMediaItem } from '../components/mediaGrid.js'

// Portfolio is the home page -- categories of projects, each project a grid
// of image/YouTube media items.
export function renderHomePage(project, resolveAsset) {
  const categories = project.portfolio.categories
  if (categories.length === 0) {
    return '<section class="empty-state"><p>No portfolio items yet.</p></section>'
  }

  return categories.map((category) => renderCategory(category, resolveAsset)).join('\n')
}

function renderCategory(category, resolveAsset) {
  return `<section class="category">
  <h2>${escapeHtml(category.name)}</h2>
  ${category.projects.map((proj) => renderProject(proj, resolveAsset)).join('\n')}
</section>`
}

function renderProject(proj, resolveAsset) {
  const descriptionHtml = proj.description
    ? `<p class="project-description">${escapeHtmlMultiline(proj.description)}</p>`
    : ''

  return `<article class="project">
  <h3>${escapeHtml(proj.title)}</h3>
  ${descriptionHtml}
  <div class="media-grid">
    ${proj.media.map((media) => renderMediaItem(media, resolveAsset)).join('\n')}
  </div>
</article>`
}
