import { sanitizeHtml, type SanitizationResult } from '@/core/sanitizer/sanitize-html'
import { validateHtml } from '@/core/validator/validate-html'
import type { ValidationResult } from '@/core/validator/validation-types'

export type SerializationResult = {
  html: string
  sanitization: SanitizationResult
  validation: ValidationResult
}

function canonicalize(html: string): string {
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
    .replaceAll('<br>', '<br />')
    .replace(/>\s+</g, '><')
    .trim()
}

export function serializeEditorHtml(editorHtml: string): SerializationResult {
  const firstPass = sanitizeHtml(editorHtml)
  const html = canonicalize(firstPass.html)
  const sanitization: SanitizationResult = {
    ...firstPass,
    html,
    changed: firstPass.changed || html !== editorHtml,
  }

  return {
    html,
    sanitization,
    validation: validateHtml(html),
  }
}
