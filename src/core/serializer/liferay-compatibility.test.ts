import { applyLiferayCompatibility } from './liferay-compatibility'
import { serializeEditorHtml } from './serialize-editor-html'

describe('Liferay compatibility profiles', () => {
  it('keeps semantic paragraphs for Liferay 7', () => {
    const source = serializeEditorHtml('<p>Primeiro parágrafo</p><p>Segundo parágrafo</p>')
    const result = applyLiferayCompatibility(source, 'liferay-7')

    expect(result.html).toBe('<p>Primeiro parágrafo</p><p>Segundo parágrafo</p>')
  })

  it('flattens paragraphs into br-based spacing for Liferay 6', () => {
    const source = serializeEditorHtml('<p>Primeiro parágrafo</p><p><strong>Segundo</strong> parágrafo</p>')
    const result = applyLiferayCompatibility(source, 'liferay-6')

    expect(result.html).toBe('Primeiro parágrafo<br /><br /><strong>Segundo</strong> parágrafo')
    expect(result.html).not.toContain('<p>')
  })

  it('converts emoji and pictograms to numeric HTML entities for Liferay 6', () => {
    const source = serializeEditorHtml('<p>Oferta imperdível 🚀 ❤️</p>')
    const result = applyLiferayCompatibility(source, 'liferay-6')

    expect(result.html).toContain('&#x1F680;')
    expect(result.html).toContain('&#x2764;')
    expect(result.html).toContain('&#xFE0F;')
    expect(result.html).not.toContain('🚀')
  })
})
