import { escapeHtml } from '../escapeHtml.js'
import { hrefToProject } from '../paths.js'

// Portfolio is the home page -- a flat gallery grid of projects (no
// categories), each tile linking to that project's own detail page.
export function renderHomePage(project, resolveAsset, { isPreview = false } = {}) {
  const projects = project.portfolio.projects
  if (projects.length === 0) {
    return '<section class="empty-state"><p>No portfolio items yet.</p></section>'
  }

  const tiles = projects.map((proj) => renderGalleryTile(proj, resolveAsset, isPreview)).join('\n')
  const captionStyle = project.siteSettings.captionStyle || 'underneath'
  return `<div class="gallery caption-${escapeHtml(captionStyle)}">${tiles}</div>`
}

// Image thumbnail if the project has one; otherwise the YouTube thumbnail
// for a video-only project (same image already used for the video facade
// elsewhere) -- consistent, no extra effort required from the student.
function galleryThumbnailSrc(proj, resolveAsset) {
  const image = proj.media.find((media) => media.type === 'image')
  if (image) return resolveAsset(image.assetId)
  const video = proj.media.find((media) => media.type === 'youtube')
  if (video) return `https://i.ytimg.com/vi/${encodeURIComponent(video.youtubeId)}/hqdefault.jpg`
  return ''
}

function renderGalleryTile(proj, resolveAsset, isPreview) {
  const thumbSrc = galleryThumbnailSrc(proj, resolveAsset)
  const thumbHtml = thumbSrc
    ? `<img src="${escapeHtml(thumbSrc)}" alt="" loading="lazy">`
    : '<div class="gallery-thumb-placeholder"></div>'

  // In preview, the click is intercepted (no real file tree behind a single
  // iframe) -- see components/previewNav.js. In export, it's a real link to
  // the project's own page.
  const href = isPreview ? '#' : hrefToProject('home', proj.id)
  const dataPage = isPreview ? ` data-page="project" data-project-id="${proj.id}"` : ''

  return `<a class="gallery-item" href="${href}"${dataPage}>
  <div class="gallery-thumb">${thumbHtml}</div>
  <p class="gallery-caption">${escapeHtml(proj.title)}</p>
</a>`
}
