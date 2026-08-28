import {
  structuredVisualCopySchema,
  structuredVisualCopyToEditorHtml,
  summarizeStructuredVisualCopy,
} from './structured-copy'

describe('structured visual copy', () => {
  it('renders approved multi-word Smiles colors with official strong inline-block markup', () => {
    const html = structuredVisualCopyToEditorHtml({
      blocks: [
        {
          segments: [
            { text: 'Ganhe até ', bold: false, italic: false, color: null },
            { text: 'Clube Smiles', bold: true, italic: false, color: '#663399' },
          ],
        },
        {
          segments: [{ text: 'Cadastre-se agora', bold: false, italic: true, color: null }],
        },
      ],
    })

    expect(html).toBe('<p>Ganhe até <strong style="color: #663399; display: inline-block;">Clube Smiles</strong></p><p><em>Cadastre-se agora</em></p>')
  })

  it('omits inline-block for a single colored word', () => {
    const html = structuredVisualCopyToEditorHtml({
      blocks: [
        {
          segments: [{ text: 'Diamante', bold: false, italic: false, color: '#231f20' }],
        },
      ],
    })

    expect(html).toBe('<p><strong style="color: #231f20;">Diamante</strong></p>')
  })

  it('keeps italic nested inside the official colored strong markup', () => {
    const html = structuredVisualCopyToEditorHtml({
      blocks: [
        {
          segments: [{ text: 'Clube Smiles', bold: false, italic: true, color: '#663399' }],
        },
      ],
    })

    expect(html).toBe('<p><strong style="color: #663399; display: inline-block;"><em>Clube Smiles</em></strong></p>')
  })

  it('escapes model text instead of trusting it as HTML', () => {
    const html = structuredVisualCopyToEditorHtml({
      blocks: [
        {
          segments: [{ text: '<script>alert("x")</script>', bold: true, italic: false, color: null }],
        },
      ],
    })

    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('rejects colors outside the Smiles allowlist', () => {
    const parsed = structuredVisualCopySchema.safeParse({
      blocks: [{ segments: [{ text: 'Teste', bold: false, italic: false, color: '#123456' }] }],
    })
    expect(parsed.success).toBe(false)
  })

  it('summarizes extracted formatting for review feedback', () => {
    const summary = summarizeStructuredVisualCopy({
      blocks: [
        { segments: [{ text: 'Clube Smiles', bold: true, italic: false, color: '#663399' }] },
        { segments: [{ text: 'Consulte as regras', bold: false, italic: true, color: null }] },
      ],
    })
    expect(summary).toEqual({ blocks: 2, boldSegments: 1, italicSegments: 1, coloredSegments: 1 })
  })

  it('rejects empty extraction payloads', () => {
    expect(structuredVisualCopySchema.safeParse({ blocks: [] }).success).toBe(false)
  })
})
