import {
  structuredVisualCopySchema,
  structuredVisualCopyToEditorHtml,
  summarizeStructuredVisualCopy,
} from './structured-copy'

describe('structured visual copy', () => {
  it('renders bold, italic and approved colors as safe editor HTML', () => {
    const html = structuredVisualCopyToEditorHtml({
      blocks: [
        {
          segments: [
            { text: 'Ganhe até ', bold: false, italic: false, color: null },
            { text: '10.000 milhas', bold: true, italic: false, color: '#663399' },
          ],
        },
        {
          segments: [{ text: 'Cadastre-se agora', bold: false, italic: true, color: null }],
        },
      ],
    })

    expect(html).toBe('<p>Ganhe até <span style="color: #663399"><strong>10.000 milhas</strong></span></p><p><em>Cadastre-se agora</em></p>')
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
