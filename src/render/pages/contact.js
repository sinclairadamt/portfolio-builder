import { escapeHtml } from '../escapeHtml.js'
import { renderSocialIcon } from '../socialIcons.js'

const SOCIAL_LABELS = { linkedin: 'LinkedIn', instagram: 'Instagram' }

// GitHub Pages can't run a server-side form handler, so the form posts to
// FormSubmit.co (free, no signup -- just a one-time email-activation click
// the student takes after publishing). A plain mailto: link is always shown
// alongside it, so contact still works even if that third party ever changes.
export function renderContactPage(project) {
  const { email, phone, location, socialLinks, useIcons } = project.contact
  const emailSafe = escapeHtml(email)

  const infoLines = [
    email ? `<p><a href="mailto:${emailSafe}">${emailSafe}</a></p>` : '',
    phone ? `<p><a href="tel:${toTelHref(phone)}">${escapeHtml(phone)}</a></p>` : '',
    renderLocation(location),
    renderSocialLinks(socialLinks, useIcons),
  ]
    .filter(Boolean)
    .join('\n')

  return `<section class="contact">
  <div class="contact-info">
    ${infoLines}
  </div>
  ${renderForm(email, emailSafe)}
</section>`
}

// tel: links need digits (and a leading + for international numbers) only --
// formatting characters like ()-. would make some phone apps refuse the
// link. The visible text stays exactly as the student typed it.
function toTelHref(phone) {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')
  return trimmed.startsWith('+') ? `+${digits}` : digits
}

function renderLocation(location) {
  const text = [location.city, location.state].filter(Boolean).join(', ')
  return text ? `<p class="location">${escapeHtml(text)}</p>` : ''
}

function renderSocialLinks(socialLinks, useIcons) {
  if (!socialLinks.length) return ''
  const items = socialLinks
    .map((link) => {
      const label = escapeHtml(SOCIAL_LABELS[link.platform] ?? link.platform)
      // Icons still carry the platform name for screen readers/link text
      // extraction -- only the visual presentation changes.
      const content = useIcons
        ? `${renderSocialIcon(link.platform)}<span class="visually-hidden">${label}</span>`
        : label
      return `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${content}</a></li>`
    })
    .join('')
  return `<ul class="social-links">${items}</ul>`
}

function renderForm(email, emailSafe) {
  if (!email) return ''
  // Placeholder text inside the fields (no visible labels above them), like
  // the reference site -- a visually-hidden <label> keeps each field
  // properly associated for screen readers even without a visible label.
  return `<form class="contact-form" action="https://formsubmit.co/${emailSafe}" method="POST">
  <input type="text" name="_honeypot" style="display:none" tabindex="-1" autocomplete="off">
  <label for="name" class="visually-hidden">Name</label>
  <input id="name" name="name" type="text" placeholder="Name" required>
  <label for="reply-email" class="visually-hidden">Email</label>
  <input id="reply-email" name="email" type="email" placeholder="Email" required>
  <label for="message" class="visually-hidden">Message</label>
  <textarea id="message" name="message" rows="5" placeholder="Message" required></textarea>
  <button type="submit">Send Message</button>
</form>`
}
