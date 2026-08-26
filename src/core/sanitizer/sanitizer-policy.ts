export const ALLOWED_TAGS = ['p', 'div', 'strong', 'em', 'a', 'br', 'small', 'span'] as const
export const ALLOWED_ATTR = ['href', 'target', 'rel', 'style', 'class'] as const

export const ALLOWED_STYLE_PROPERTIES = new Set([
  'color',
  'display',
  'text-decoration',
  'font-weight',
  'margin-top',
  'margin-bottom',
])

export const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export function isSafeHref(href: string): boolean {
  const value = href.trim()
  if (!value) return false
  if (value.startsWith('#') || value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
    return true
  }

  try {
    const url = new URL(value)
    return ALLOWED_PROTOCOLS.has(url.protocol)
  } catch {
    return false
  }
}

function canonicalizeColor(value: string): string {
  const match = value.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (!match) return value

  const channels = match.slice(1).map(Number)
  if (channels.some((channel) => channel < 0 || channel > 255)) return value

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

export function sanitizeStyle(style: string): { value: string; changed: boolean } {
  const declarations = style
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)

  const safe: string[] = []
  let changed = false

  for (const declaration of declarations) {
    const separator = declaration.indexOf(':')
    if (separator === -1) {
      changed = true
      continue
    }

    const property = declaration.slice(0, separator).trim().toLowerCase()
    const rawValue = declaration.slice(separator + 1).trim()

    if (!ALLOWED_STYLE_PROPERTIES.has(property) || /url\s*\(|expression\s*\(|javascript\s*:/i.test(rawValue)) {
      changed = true
      continue
    }

    const value = property === 'color' ? canonicalizeColor(rawValue) : rawValue
    safe.push(`${property}: ${value}`)
  }

  return { value: safe.join('; '), changed }
}
