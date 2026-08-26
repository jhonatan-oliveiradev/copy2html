import { render, screen } from '@testing-library/react'
import { HtmlPreview } from './html-preview'
import type { SerializationResult } from '@/core/serializer/serialize-editor-html'

const result: SerializationResult = {
  html: '<p>original</p>',
  sanitization: { html: '<p><strong>sanitizado</strong></p>', changed: true, notices: ['Conteúdo ajustado.'] },
  validation: { severity: 'valid', issues: [] },
}

describe('HtmlPreview', () => {
  it('renders only sanitized HTML inside a sandboxed iframe', () => {
    render(<HtmlPreview result={result} />)

    const frame = screen.getByTitle('Preview do HTML sanitizado')
    expect(frame).toHaveAttribute('sandbox', '')
    expect(frame.getAttribute('srcdoc')).toContain('<strong>sanitizado</strong>')
    expect(frame.getAttribute('srcdoc')).not.toContain('<p>original</p>')
  })

  it('applies an optional pack preview font without modifying content HTML', () => {
    render(
      <HtmlPreview
        result={result}
        previewTheme={{
          fontFamily: 'Nunito, Arial, sans-serif',
          fontStylesheetUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
        }}
      />,
    )

    const srcDoc = screen.getByTitle('Preview do HTML sanitizado').getAttribute('srcdoc') ?? ''
    expect(srcDoc).toContain('fonts.googleapis.com')
    expect(srcDoc).toContain('font-family:Nunito, Arial, sans-serif')
    expect(result.sanitization.html).toBe('<p><strong>sanitizado</strong></p>')
  })
})
