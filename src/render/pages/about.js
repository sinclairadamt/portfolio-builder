import { escapeHtmlMultiline } from '../escapeHtml.js'

export function renderAboutPage(project, resolveAsset) {
  const photoSrc = project.about.photoAssetId ? resolveAsset(project.about.photoAssetId) : ''
  const resumeSrc = project.resume.assetId ? resolveAsset(project.resume.assetId) : ''

  const photoHtml = photoSrc ? `<img class="about-photo" src="${photoSrc}" alt="Portrait photo">` : ''
  const resumeHtml = resumeSrc
    ? `<a class="button resume-button" href="${resumeSrc}" download>Download Resume (PDF)</a>`
    : ''

  return `<section class="about">
  ${photoHtml}
  <div class="about-bio">
    <p>${escapeHtmlMultiline(project.about.bio)}</p>
    ${resumeHtml}
  </div>
</section>`
}
