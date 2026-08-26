import DOMPurify from 'dompurify'
import { ALLOWED_ATTR, ALLOWED_TAGS, isSafeHref, sanitizeStyle } from './sanitizer-policy'

export type SanitizationResult = {
  html: string
  changed: boolean
  notices: string[]
}

function inspectUnsupportedInput(input: string): string[] {
  const notices: string[] = []
  const template = document.createElement('template')
  template.innerHTML = input

  template.content.querySelectorAll<HTMLElement>('*').forEach((element) => {
    const tag = element.tagName.toLowerCase()
    if (!ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number])) {
      notices.push('Tags não suportadas foram removidas.')
    }

    for (const attribute of [...element.attributes]) {
      if (/^on/i.test(attribute.name) || attribute.name.startsWith('data-')) {
        notices.push('Atributo executável ou não suportado foi removido.')
      } else if (!ALLOWED_ATTR.includes(attribute.name as (typeof ALLOWED_ATTR)[number])) {
        notices.push('Atributos não suportados foram removidos.')
      }
    }

    const className = element.getAttribute('class')
    if (className && /\bMso/i.test(className)) notices.push('Classes específicas do Word foram removidas.')

    const style = element.getAttribute('style')
    if (style && sanitizeStyle(style).changed) notices.push('Estilos não suportados foram removidos.')

    if (tag === 'a' && !isSafeHref(element.getAttribute('href') ?? '')) {
      notices.push('Um link com destino inseguro ou inválido foi neutralizado.')
    }
  })

  return [...new Set(notices)]
}

export function sanitizeHtml(input: string): SanitizationResult {
  const notices = inspectUnsupportedInput(input)

  const purified = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  })

  const template = document.createElement('template')
  template.innerHTML = purified

  template.content.querySelectorAll<HTMLElement>('*').forEach((element) => {
    const className = element.getAttribute('class')
    if (className && /\bMso/i.test(className)) element.removeAttribute('class')

    const style = element.getAttribute('style')
    if (style) {
      const cleaned = sanitizeStyle(style)
      if (cleaned.value) element.setAttribute('style', cleaned.value)
      else element.removeAttribute('style')
    }

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') ?? ''
      if (!isSafeHref(href)) element.removeAttribute('href')
    }
  })

  return {
    html: template.innerHTML,
    changed: notices.length > 0,
    notices,
  }
}
