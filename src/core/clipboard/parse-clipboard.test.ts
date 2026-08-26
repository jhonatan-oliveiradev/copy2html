import { representativeWordHtml } from '@/test/fixtures/smiles-support-copy'
import { parseClipboard } from './parse-clipboard'

describe('parseClipboard', () => {
  it('prefers HTML and removes Word-specific markup', () => {
    const result = parseClipboard({ html: representativeWordHtml, text: 'fallback' })

    expect(result.source).toBe('html')
    expect(result.html).toContain('<strong>Aproveite este superbônus</strong>')
    expect(result.html).toContain('href="https://www.smiles.com.br/clube-smiles"')
    expect(result.html).not.toMatch(/MsoNormal|font-family|Calibri/i)
  })

  it('falls back to escaped plain text with predictable paragraphs', () => {
    const result = parseClipboard({ text: 'Linha <um>\ncontinua\n\nSegundo parágrafo' })

    expect(result.source).toBe('text')
    expect(result.html).toBe('<p>Linha &lt;um&gt;<br>continua</p><p>Segundo parágrafo</p>')
  })
})
