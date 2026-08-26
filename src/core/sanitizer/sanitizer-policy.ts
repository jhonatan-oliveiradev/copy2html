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
    const value = declaration.slice(separator + 1).trim()

    if (!ALLOWED_STYLE_PROPERTIES.has(property) || /url\s*\(|expression\s*\(|javascript\s*:/i.test(value)) {
      changed = true
      continue
    }

    safe.push(`${property}: ${value}`)
  }

  return { value: safe.join('; '), changed }
}
