function replaceTag(element: Element, tagName: 'strong' | 'em'): HTMLElement {
  const replacement = document.createElement(tagName)
  for (const child of [...element.childNodes]) replacement.appendChild(child)
  element.replaceWith(replacement)
  return replacement
}

function normalizeSpanEmphasis(span: HTMLElement): void {
  const style = span.getAttribute('style') ?? ''
  const isBold = /(?:^|;)\s*font-weight\s*:\s*(?:bold|[6-9]00)\b/i.test(style)
  const isItalic = /(?:^|;)\s*font-style\s*:\s*italic\b/i.test(style)

  if (!isBold && !isItalic) return

  if (isBold && isItalic) {
    const strong = replaceTag(span, 'strong')
    replaceTag(strong, 'em')
    return
  }

  replaceTag(span, isBold ? 'strong' : 'em')
}

export function normalizeWordHtml(input: string): { html: string; notices: string[] } {
  const template = document.createElement('template')
  template.innerHTML = input
  const notices: string[] = []

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_COMMENT)
  const comments: Comment[] = []
  while (walker.nextNode()) comments.push(walker.currentNode as Comment)
  comments.forEach((comment) => comment.remove())
  if (comments.length) notices.push('Comentários e marcadores internos do Word foram removidos.')

  template.content.querySelectorAll('b').forEach((node) => replaceTag(node, 'strong'))
  template.content.querySelectorAll('i').forEach((node) => replaceTag(node, 'em'))
  template.content.querySelectorAll<HTMLElement>('span').forEach(normalizeSpanEmphasis)

  template.content.querySelectorAll<HTMLElement>('*').forEach((element) => {
    for (const attribute of [...element.attributes]) {
      if (/^xmlns(?::|$)/i.test(attribute.name) || /^mso-/i.test(attribute.name)) {
        element.removeAttribute(attribute.name)
        notices.push('Metadados específicos do Word foram removidos.')
      }
    }

    const className = element.getAttribute('class')
    if (className && /\bMso/i.test(className)) {
      element.removeAttribute('class')
      notices.push('Classes de formatação do Word foram removidas.')
    }

    const style = element.getAttribute('style')
    if (style) {
      const kept = style
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => !/^(font-family|font-size|font-style|mso-|margin(?:-[a-z-]+)?|line-height)\s*:/i.test(part))
        .filter((part) => !/^font-weight\s*:/i.test(part))
      if (kept.length) element.setAttribute('style', kept.join('; '))
      else element.removeAttribute('style')
    }
  })

  template.content.querySelectorAll('span').forEach((span) => {
    if (span.attributes.length === 0) span.replaceWith(...span.childNodes)
  })

  return { html: template.innerHTML.trim(), notices: [...new Set(notices)] }
}
