import { structuredVisualCopySchema, structuredVisualCopyToEditorHtml } from './structured-copy'

describe('structured visual copy', () => {
  it('renders bold and italic segments as safe editor HTML', () => {
    const html = structuredVisualCopyToEditorHtml({
      blocks: [
        {
          segments: [
            { text: 'Ganhe até ', bold: false, italic: false },
            { text: '10.000 milhas', bold: true, italic: false },
          ],
        },
        {
          segments: [{ text: 'Cadastre-se agora', bold: false, italic: true }],
        },
      ],
    })

    expect(html).toBe('<p>Ganhe até <strong>10.000 milhas</strong></p><p><em>Cadastre-se agora</em></p>')
  })

  it('escapes model text instead of trusting it as HTML', () => {
    const html = structuredVisualCopyToEditorHtml({
      blocks: [
        {
          segments: [{ text: '<script>alert("x")</script>', bold: true, italic: false }],
        },
      ],
    })

    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('rejects empty extraction payloads', () => {
    expect(structuredVisualCopySchema.safeParse({ blocks: [] }).success).toBe(false)
  })
})
