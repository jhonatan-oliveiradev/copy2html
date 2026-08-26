import DOMPurify from 'dompurify'
import { ALLOWED_ATTR, ALLOWED_TAGS, isSafeHref, sanitizeStyle } from './sanitizer-policy'

export type SanitizationResult = {
  html: string
  changed: boolean
  notices: string[]
}

export function sanitizeHtml(input: string): SanitizationResult {
  const notices: string[] = []

  const purified = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  })

  const template = document.createElement('template')
  template.innerHTML = purified

  let changed = purified !== input

  template.content.querySelectorAll<HTMLElement>('*').forEach((element) => {
    for (const attribute of [...element.attributes]) {
      if (/^on/i.test(attribute.name) || attribute.name.startsWith('data-')) {
        element.removeAttribute(attribute.name)
        changed = true
        notices.push('Atributo executável ou não suportado foi removido.')
      }
    }

    const className = element.getAttribute('class')
    if (className && /\bMso/i.test(className)) {
      element.removeAttribute('class')
      changed = true
      notices.push('Classes específicas do Word foram removidas.')
    }

    const style = element.getAttribute('style')
    if (style) {
      const cleaned = sanitizeStyle(style)
      if (cleaned.value) element.setAttribute('style', cleaned.value)
      else element.removeAttribute('style')
      if (cleaned.changed) {
        changed = true
        notices.push('Estilos não suportados foram removidos.')
      }
    }

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') ?? ''
      if (!isSafeHref(href)) {
        element.removeAttribute('href')
        changed = true
        notices.push('Um link com destino inseguro ou inválido foi neutralizado.')
      }
    }
  })

  return {
    html: template.innerHTML,
    changed,
    notices: [...new Set(notices)],
  }
}
