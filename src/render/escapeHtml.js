export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Bio/description fields are plain text with line breaks -- escape first,
// then turn newlines into <br> so paragraph breaks survive without allowing
// students' free-text input to inject arbitrary markup.
export function escapeHtmlMultiline(value) {
  return escapeHtml(value).replace(/\n/g, '<br>')
}
