import { sanitizeHtml } from './sanitize-html'

describe('sanitizeHtml', () => {
  it('removes executable content and unsafe URLs', () => {
    const result = sanitizeHtml(
      '<p onclick="alert(1)">Oi<script>alert(1)</script><a href="javascript:alert(1)">link</a></p>',
    )

    expect(result.html).not.toMatch(/script|onclick|javascript:/i)
    expect(result.changed).toBe(true)
  })

  it('retains supported Liferay markup and styles without a sanitization warning', () => {
    const input = '<p><strong style="color: #663399; display: inline-block">Clube Smiles</strong><br /><a href="/clube-smiles" style="text-decoration: underline; font-weight: bold">Entre</a></p>'
    const result = sanitizeHtml(input)

    expect(result.html).toContain('<strong style="color: #663399; display: inline-block">Clube Smiles</strong>')
    expect(result.html).toContain('href="/clube-smiles"')
    expect(result.html).toContain('text-decoration: underline')
    expect(result.changed).toBe(false)
    expect(result.notices).toEqual([])
  })

  it('removes Word classes and arbitrary style properties', () => {
    const result = sanitizeHtml(
      '<p class="MsoNormal" style="font-family: Calibri; margin-bottom: 20px; color: #663399">Texto</p>',
    )

    expect(result.html).not.toContain('MsoNormal')
    expect(result.html).not.toContain('font-family')
    expect(result.html).toContain('margin-bottom: 20px')
    expect(result.html).toContain('color: #663399')
    expect(result.changed).toBe(true)
  })
})
