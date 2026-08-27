import { validateHtml } from '@/core/validator/validate-html'
import type { SerializationResult } from './serialize-editor-html'

export type LiferayTarget = 'liferay-6' | 'liferay-7'

function canonicalizeBreaks(html: string): string {
  return html
    .replaceAll('<br>', '<br />')
    .replace(/(?:<br \/>){3,}/g, '<br /><br />')
    .replace(/^(?:<br \/>)+|(?:<br \/>)+$/g, '')
    .trim()
}

function flattenBlockMarkup(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html

  const blocks = [...template.content.querySelectorAll('p, div')]
  for (const block of blocks) {
    const separatorCount = block.tagName === 'P' ? 2 : 1
    const fragment = document.createDocumentFragment()

    while (block.firstChild) fragment.appendChild(block.firstChild)
    for (let index = 0; index < separatorCount; index += 1) {
      fragment.appendChild(document.createElement('br'))
    }

    block.replaceWith(fragment)
  }

  return canonicalizeBreaks(template.innerHTML)
}

function encodeLegacyPictograms(html: string): string {
  return html.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{20E3}]/gu, (character) => {
    const codePoint = character.codePointAt(0)
    return codePoint ? `&#x${codePoint.toString(16).toUpperCase()};` : character
  })
}

function toLiferay6Html(html: string): string {
  return encodeLegacyPictograms(flattenBlockMarkup(html))
}

export function applyLiferayCompatibility(
  result: SerializationResult,
  target: LiferayTarget,
): SerializationResult {
  if (target === 'liferay-7') return result

  const html = toLiferay6Html(result.sanitization.html)

  return {
    html,
    sanitization: {
      ...result.sanitization,
      html,
      changed: result.sanitization.changed || html !== result.sanitization.html,
      notices:
        html !== result.sanitization.html
          ? [...result.sanitization.notices, 'Compatibilidade Liferay 6 aplicada: blocos convertidos em quebras e pictogramas codificados.']
          : result.sanitization.notices,
    },
    validation: validateHtml(html),
  }
}
