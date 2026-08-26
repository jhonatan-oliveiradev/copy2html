import { ALLOWED_ATTR, ALLOWED_STYLE_PROPERTIES, ALLOWED_TAGS, isSafeHref } from '@/core/sanitizer/sanitizer-policy'
import type { ValidationIssue, ValidationResult } from './validation-types'

function severityFor(issues: ValidationIssue[]): ValidationResult['severity'] {
  if (issues.some((issue) => issue.severity === 'blocked')) return 'blocked'
  if (issues.some((issue) => issue.severity === 'warning')) return 'warning'
  return 'valid'
}

export function validateHtml(html: string): ValidationResult {
  const issues: ValidationIssue[] = []
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll<HTMLElement>('*').forEach((element) => {
    const tag = element.tagName.toLowerCase()
    if (!ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number])) {
      issues.push({ code: 'unsupported-tag', message: `Tag <${tag}> não suportada.`, severity: 'blocked' })
    }

    if (/\bMso/i.test(element.className)) {
      issues.push({ code: 'word-artifact', message: 'Markup específico do Word ainda está presente.', severity: 'blocked' })
    }

    for (const attribute of [...element.attributes]) {
      if (!ALLOWED_ATTR.includes(attribute.name as (typeof ALLOWED_ATTR)[number])) {
        issues.push({ code: 'unsupported-attribute', message: `Atributo ${attribute.name} não suportado.`, severity: 'blocked' })
      }
    }

    const style = element.getAttribute('style')
    if (style) {
      for (const declaration of style.split(';').map((part) => part.trim()).filter(Boolean)) {
        const property = declaration.split(':', 1)[0]?.trim().toLowerCase()
        if (!property || !ALLOWED_STYLE_PROPERTIES.has(property)) {
          issues.push({ code: 'unsupported-style', message: `Estilo ${property || 'inválido'} não suportado.`, severity: 'blocked' })
        }
      }
    }

    if (tag === 'a') {
      const href = element.getAttribute('href') ?? ''
      if (!isSafeHref(href)) {
        issues.push({ code: 'invalid-link', message: 'Link sem destino válido.', severity: 'blocked' })
      }
    }

    if ((tag === 'strong' || tag === 'em' || tag === 'small') && !element.textContent?.trim()) {
      issues.push({ code: 'empty-formatting', message: 'Elemento de formatação vazio pode ser removido.', severity: 'warning' })
    }

    if (element.getAttribute('data-review-before-use') === 'true') {
      issues.push({ code: 'review-before-use', message: 'Este snippet histórico precisa de revisão antes da publicação.', severity: 'warning' })
    }
  })

  return { severity: severityFor(issues), issues }
}
