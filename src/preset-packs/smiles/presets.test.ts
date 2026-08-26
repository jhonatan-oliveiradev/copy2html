import { getDefaultPresetPack, getPresetPack, listPresetPacks } from '@/core/presets/registry'

describe('official preset packs', () => {
  it('registers base and smiles with Smiles as default', () => {
    expect(listPresetPacks().map((pack) => pack.id)).toEqual(['base', 'smiles'])
    expect(getDefaultPresetPack().id).toBe('smiles')
  })

  it('contains the expected Smiles reusable presets', () => {
    const smiles = getPresetPack('smiles')
    expect(smiles).toBeDefined()

    const ids = smiles!.presets.map((preset) => preset.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        'clube-smiles',
        'cliente-smiles',
        'diamante',
        'clientes-ouro',
        'cliente-prata',
        'macro-clube-smiles',
        'macro-optin',
      ]),
    )
  })

  it('marks historical structural snippets for review', () => {
    const smiles = getPresetPack('smiles')!
    const snippets = smiles.presets.filter((preset) => preset.type === 'snippet')

    expect(snippets.length).toBeGreaterThan(0)
    expect(snippets.every((preset) => preset.reviewBeforeUse)).toBe(true)
  })

  it('does not carry credential-like historical data', () => {
    const serialized = JSON.stringify(getPresetPack('smiles')).toLowerCase()

    expect(serialized).not.toContain('senha')
    expect(serialized).not.toContain('password')
    expect(serialized).not.toContain('vpn:')
    expect(serialized).not.toContain('msteams@')
  })
})
