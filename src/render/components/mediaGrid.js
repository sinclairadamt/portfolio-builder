import { escapeHtml } from '../escapeHtml.js'

export function renderMediaItem(media, resolveAsset) {
  if (media.type === 'image') return renderImageItem(media, resolveAsset)
  if (media.type === 'youtube') return renderYoutubeItem(media)
  return ''
}

function renderImageItem(media, resolveAsset) {
  const src = resolveAsset(media.assetId)
  const alt = escapeHtml(media.altText)
  const captionHtml = media.caption ? `<figcaption>${escapeHtml(media.caption)}</figcaption>` : ''

  return `<figure class="media-item">
  <button type="button" class="media-image-button" data-lightbox-src="${escapeHtml(src)}" data-lightbox-alt="${alt}" data-lightbox-caption="${escapeHtml(media.caption)}">
    <img src="${escapeHtml(src)}" alt="${alt}" loading="lazy">
  </button>
  ${captionHtml}
</figure>`
}

function renderYoutubeItem(media) {
  const videoId = escapeHtml(media.youtubeId)
  const thumbnailSrc = `https://i.ytimg.com/vi/${encodeURIComponent(media.youtubeId)}/hqdefault.jpg`
  const captionHtml = media.caption ? `<figcaption>${escapeHtml(media.caption)}</figcaption>` : ''

  return `<figure class="media-item">
  <div class="youtube-facade" data-youtube-facade="${videoId}" role="button" tabindex="0" aria-label="Play video">
    <img src="${thumbnailSrc}" alt="" loading="lazy">
    <span class="youtube-play-icon" aria-hidden="true">&#9658;</span>
  </div>
  ${captionHtml}
</figure>`
}
