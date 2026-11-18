import { escapeHtmlMultiline } from '../escapeHtml.js'

export function renderAboutPage(project, resolveAsset) {
  const photoSrc = project.about.photoAssetId ? resolveAsset(project.about.photoAssetId) : ''
  const resumeSrc = project.resume.assetId ? resolveAsset(project.resume.assetId) : ''

  const photoHtml = photoSrc ? `<img class="about-photo" src="${photoSrc}" alt="Portrait photo">` : ''
  const resumeHtml = resumeSrc
    ? `<a class="button resume-button" href="${resumeSrc}" download>Download Resume (PDF)</a>`
    : ''

  // The resume button sits under the photo. Without a photo, an aside holding
  // only a button would look stranded beside the bio, so it stays under the text.
  const asideHtml = photoHtml
    ? `<div class="about-aside">
    ${photoHtml}
    ${resumeHtml}
  </div>`
    : ''

  return `<section class="about">
  ${asideHtml}
  <div class="about-bio">
    <p>${escapeHtmlMultiline(project.about.bio)}</p>
    ${photoHtml ? '' : resumeHtml}
  </div>
</section>`
}
