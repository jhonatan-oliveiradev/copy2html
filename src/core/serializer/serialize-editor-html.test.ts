import { serializeEditorHtml } from './serialize-editor-html'

describe('serializeEditorHtml', () => {
  it('canonicalizes bold and line breaks for the default Liferay 6 output', () => {
    const result = serializeEditorHtml('<p><b>Oi</b><br><br></p>')

    expect(result.html).toBe('<strong>Oi</strong><br /><br />')
  })

  it('canonicalizes browser RGB colors to hexadecimal output', () => {
    const result = serializeEditorHtml(
      '<p><strong style="color: rgb(102, 51, 153); display: inline-block">Clube Smiles</strong></p>',
    )

    expect(result.html).toContain('color: #663399')
    expect(result.html).not.toContain('rgb(')
    expect(result.html).not.toContain('<p>')
  })

  it('retains approved Smiles-style markup without Smiles-specific serializer rules', () => {
    const result = serializeEditorHtml(
      '<p>Ainda não é <strong style="color: #663399; display: inline-block">Clube Smiles</strong>? <a href="#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_" style="color: #663399; text-decoration: underline; font-weight: bold">Assine agora</a></p>',
    )

    expect(result.validation.severity).toBe('valid')
    expect(result.html).toContain('color: #663399')
    expect(result.html).toContain('#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_')
    expect(result.html).not.toContain('<p>')
  })

  it('can preserve semantic paragraphs when explicitly targeting Liferay 7', () => {
    const result = serializeEditorHtml('<p>Texto semântico</p>', 'liferay-7')

    expect(result.html).toBe('<p>Texto semântico</p>')
  })

  it('is idempotent for the default Liferay 6 output', () => {
    const first = serializeEditorHtml('<p><strong>Texto</strong><br></p>')
    const second = serializeEditorHtml(first.html)

    expect(second.html).toBe(first.html)
  })
})
