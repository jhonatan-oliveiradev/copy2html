import { sanitizeHtml } from '@/core/sanitizer/sanitize-html'
import { normalizeWordHtml } from './normalize-word-html'

export type ClipboardInput = {
  html?: string
  text?: string
}

export type ParsedClipboardContent = {
  html: string
  source: 'html' | 'text'
  notices: string[]
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function plainTextToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('')
}

export function parseClipboard(input: ClipboardInput): ParsedClipboardContent {
  if (input.html?.trim()) {
    const normalized = normalizeWordHtml(input.html)
    const sanitized = sanitizeHtml(normalized.html)
    return {
      html: sanitized.html,
      source: 'html',
      notices: [...new Set([...normalized.notices, ...sanitized.notices])],
    }
  }

  const sanitized = sanitizeHtml(plainTextToHtml(input.text ?? ''))
  return {
    html: sanitized.html,
    source: 'text',
    notices: sanitized.notices,
  }
}
