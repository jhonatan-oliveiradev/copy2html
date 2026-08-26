import { validateHtml } from './validate-html'

describe('validateHtml', () => {
  it('returns valid for clean supported HTML', () => {
    expect(validateHtml('<p>Olá <strong>mundo</strong></p>')).toEqual({ severity: 'valid', issues: [] })
  })

  it('blocks links without a usable href', () => {
    const result = validateHtml('<a>Assine agora</a>')

    expect(result.severity).toBe('blocked')
    expect(result.issues.some((issue) => issue.code === 'invalid-link')).toBe(true)
  })

  it('warns about empty formatting nodes', () => {
    const result = validateHtml('<p>Texto<strong></strong></p>')

    expect(result.severity).toBe('warning')
    expect(result.issues.some((issue) => issue.code === 'empty-formatting')).toBe(true)
  })

  it('blocks residual Word artifacts', () => {
    const result = validateHtml('<p class="MsoNormal">Texto</p>')

    expect(result.severity).toBe('blocked')
    expect(result.issues.some((issue) => issue.code === 'word-artifact')).toBe(true)
  })
})
