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

export function applyLiferayCompatibility(html: string, target: LiferayTarget): string {
  if (target === 'liferay-7') return html
  return encodeLegacyPictograms(flattenBlockMarkup(html))
}
