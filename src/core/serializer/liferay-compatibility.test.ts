import { applyLiferayCompatibility } from './liferay-compatibility'

describe('Liferay compatibility profiles', () => {
  it('keeps semantic paragraphs for Liferay 7', () => {
    const html = applyLiferayCompatibility('<p>Primeiro parágrafo</p><p>Segundo parágrafo</p>', 'liferay-7')

    expect(html).toBe('<p>Primeiro parágrafo</p><p>Segundo parágrafo</p>')
  })

  it('flattens paragraphs into br-based spacing for Liferay 6', () => {
    const html = applyLiferayCompatibility(
      '<p>Primeiro parágrafo</p><p><strong>Segundo</strong> parágrafo</p>',
      'liferay-6',
    )

    expect(html).toBe('Primeiro parágrafo<br /><br /><strong>Segundo</strong> parágrafo')
    expect(html).not.toContain('<p>')
  })

  it('converts emoji and pictograms to numeric HTML entities for Liferay 6', () => {
    const html = applyLiferayCompatibility('<p>Oferta imperdível 🚀 ❤️</p>', 'liferay-6')

    expect(html).toContain('&#x1F680;')
    expect(html).toContain('&#x2764;')
    expect(html).toContain('&#xFE0F;')
    expect(html).not.toContain('🚀')
  })
})
