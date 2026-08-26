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
})
