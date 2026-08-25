import { escapeHtml, escapeHtmlMultiline } from '../escapeHtml.js'
import { renderMediaItem } from '../components/mediaGrid.js'
import { hrefToProject } from '../paths.js'

// One project's own page: title, description, its media (same lightbox/
// YouTube-facade behavior as everywhere else, via mediaGrid.js), and a
// Prev/Next control that wraps around the flat gallery order.
export function renderProjectPage(project, currentProjectId, resolveAsset, { isPreview = false } = {}) {
  const projects = project.portfolio.projects
  const index = projects.findIndex((proj) => proj.id === currentProjectId)
  const proj = projects[index]
  if (!proj) return '<section class="empty-state"><p>Portfolio item not found.</p></section>'

  const descriptionHtml = proj.description
    ? `<p class="project-description">${escapeHtmlMultiline(proj.description)}</p>`
    : ''
  const mediaHtml = proj.media.map((media) => renderMediaItem(media, resolveAsset)).join('\n')
  const navHtml = projects.length > 1 ? renderProjectNav(projects, index, isPreview) : ''
  // Matches the gallery's caption treatment (underneath/overlay/overlay-hover).
  const captionStyle = project.siteSettings.captionStyle || 'underneath'

  return `<article class="project-detail">
  <h2>${escapeHtml(proj.title)}</h2>
  ${descriptionHtml}
  <div class="media-grid caption-${escapeHtml(captionStyle)}">
    ${mediaHtml}
  </div>
  ${navHtml}
</article>`
}

function renderProjectNav(projects, index, isPreview) {
  const prevProject = projects[(index - 1 + projects.length) % projects.length]
  const nextProject = projects[(index + 1) % projects.length]

  return `<nav class="project-nav">
  ${renderProjectNavLink(prevProject, isPreview, 'prev', `&larr; ${escapeHtml(prevProject.title)}`)}
  ${renderProjectNavLink(nextProject, isPreview, 'next', `${escapeHtml(nextProject.title)} &rarr;`)}
</nav>`
}

function renderProjectNavLink(targetProject, isPreview, direction, label) {
  const href = isPreview ? '#' : hrefToProject('project', targetProject.id)
  const dataPage = isPreview ? ` data-page="project" data-project-id="${targetProject.id}"` : ''
  return `<a class="project-nav-${direction}" href="${href}"${dataPage}>${label}</a>`
}
