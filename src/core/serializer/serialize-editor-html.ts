import { sanitizeHtml, type SanitizationResult } from '@/core/sanitizer/sanitize-html'
import { validateHtml } from '@/core/validator/validate-html'
import type { ValidationResult } from '@/core/validator/validation-types'
import { applyLiferayCompatibility, type LiferayTarget } from './liferay-compatibility'

export type SerializationResult = {
  html: string
  sanitization: SanitizationResult
  validation: ValidationResult
}

function normalizeSemanticTags(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('b').forEach((node) => {
    const strong = document.createElement('strong')
    strong.innerHTML = node.innerHTML
    for (const attribute of [...node.attributes]) strong.setAttribute(attribute.name, attribute.value)
    node.replaceWith(strong)
  })

  template.content.querySelectorAll('i').forEach((node) => {
    const em = document.createElement('em')
    em.innerHTML = node.innerHTML
    for (const attribute of [...node.attributes]) em.setAttribute(attribute.name, attribute.value)
    node.replaceWith(em)
  })

  return template.innerHTML
}

function canonicalize(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html

  const hasVisibleText = Boolean(template.content.textContent?.replace(/\u00a0/g, ' ').trim())
  const hasIntentionalBreak = Boolean(template.content.querySelector('br'))
  if (!hasVisibleText && !hasIntentionalBreak) return ''

  return template.innerHTML
    .replaceAll('<br>', '<br />')
    .replace(/>\s+</g, '><')
    .trim()
}

export function serializeEditorHtml(
  editorHtml: string,
  target: LiferayTarget = 'liferay-6',
): SerializationResult {
  const normalizedInput = normalizeSemanticTags(editorHtml)
  const firstPass = sanitizeHtml(normalizedInput)
  const canonicalHtml = canonicalize(firstPass.html)
  const html = applyLiferayCompatibility(canonicalHtml, target)
  const compatibilityChanged = html !== canonicalHtml
  const sanitization: SanitizationResult = {
    ...firstPass,
    html,
    changed: firstPass.changed || compatibilityChanged,
    notices:
      target === 'liferay-6' && compatibilityChanged
        ? [...firstPass.notices, 'Compatibilidade Liferay 6 aplicada: parágrafos convertidos em <br /> e pictogramas codificados como entidades HTML.']
        : firstPass.notices,
  }

  return {
    html,
    sanitization,
    validation: validateHtml(html),
  }
}
