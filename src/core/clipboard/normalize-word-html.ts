function replaceTag(element: Element, tagName: 'strong' | 'em'): void {
  const replacement = document.createElement(tagName)
  for (const child of [...element.childNodes]) replacement.appendChild(child)
  element.replaceWith(replacement)
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
        .filter((part) => !/^(font-family|font-size|mso-|margin(?:-left|-right)?|line-height)\s*:/i.test(part))
      if (kept.length) element.setAttribute('style', kept.join('; '))
      else element.removeAttribute('style')
    }
  })

  template.content.querySelectorAll('span').forEach((span) => {
    if (span.attributes.length === 0) span.replaceWith(...span.childNodes)
  })

  return { html: template.innerHTML.trim(), notices: [...new Set(notices)] }
}
