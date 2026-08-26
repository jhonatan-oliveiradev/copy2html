import { serializeEditorHtml } from './serialize-editor-html'

describe('serializeEditorHtml', () => {
  it('canonicalizes bold and line breaks', () => {
    const result = serializeEditorHtml('<p><b>Oi</b><br><br></p>')

    expect(result.html).toBe('<p><strong>Oi</strong><br /><br /></p>')
  })

  it('retains approved Smiles-style markup without Smiles-specific serializer rules', () => {
    const result = serializeEditorHtml(
      '<p>Ainda não é <strong style="color: #663399; display: inline-block">Clube Smiles</strong>? <a href="#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_" style="color: #663399; text-decoration: underline; font-weight: bold">Assine agora</a></p>',
    )

    expect(result.validation.severity).toBe('valid')
    expect(result.html).toContain('color: #663399')
    expect(result.html).toContain('#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_')
  })

  it('is idempotent', () => {
    const first = serializeEditorHtml('<p><strong>Texto</strong><br></p>')
    const second = serializeEditorHtml(first.html)

    expect(second.html).toBe(first.html)
  })
})
