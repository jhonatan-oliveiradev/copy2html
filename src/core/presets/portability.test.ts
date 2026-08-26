import { describe, expect, it } from 'vitest'
import type { FormattingPreset } from './schemas'
import {
  createPortablePresetPack,
  mergeImportedPresets,
  parsePortablePresetPack,
} from './portability'

const customPreset: FormattingPreset = {
  id: 'custom-destaque',
  label: 'Destaque',
  type: 'formatting',
  reviewBeforeUse: false,
  template: '<strong style="color: #663399; display: inline-block">{{selection}}</strong>',
}

describe('portable preset packs', () => {
  it('exports a versioned Copy2HTML preset pack', () => {
    const exported = createPortablePresetPack([customPreset], {
      name: 'CRM Smiles',
      author: 'Jhonatan',
      exportedAt: '2026-08-26T23:30:00.000Z',
    })

    expect(exported).toEqual({
      format: 'copy2html-preset-pack',
      version: 1,
      name: 'CRM Smiles',
      author: 'Jhonatan',
      exportedAt: '2026-08-26T23:30:00.000Z',
      presets: [customPreset],
    })
  })

  it('rejects unsafe imported presets through the existing preset schema', () => {
    const result = parsePortablePresetPack(JSON.stringify({
      format: 'copy2html-preset-pack',
      version: 1,
      name: 'Unsafe pack',
      exportedAt: '2026-08-26T23:30:00.000Z',
      presets: [{
        id: 'unsafe',
        label: 'Unsafe',
        type: 'formatting',
        template: '<strong onclick="alert(1)">{{selection}}</strong>',
      }],
    }))

    expect(result.success).toBe(false)
  })

  it('keeps existing custom presets by default and imports non-conflicting entries', () => {
    const existing = [customPreset]
    const incoming: FormattingPreset[] = [
      { ...customPreset, label: 'Destaque compartilhado' },
      {
        id: 'custom-alerta',
        label: 'Alerta',
        type: 'formatting',
        reviewBeforeUse: false,
        template: '<strong style="color: #ff7020">{{selection}}</strong>',
      },
    ]

    const result = mergeImportedPresets(existing, incoming, 'keep-existing')

    expect(result.presets).toHaveLength(2)
    expect(result.presets.find((preset) => preset.id === 'custom-destaque')?.label).toBe('Destaque')
    expect(result.imported).toBe(1)
    expect(result.conflicts).toBe(1)
  })

  it('can replace conflicting custom presets explicitly', () => {
    const incoming: FormattingPreset = { ...customPreset, label: 'Destaque compartilhado' }
    const result = mergeImportedPresets([customPreset], [incoming], 'replace-existing')

    expect(result.presets).toEqual([incoming])
    expect(result.imported).toBe(1)
    expect(result.conflicts).toBe(1)
  })

  it('never imports ids reserved by official presets', () => {
    const incoming: FormattingPreset[] = [
      { ...customPreset, id: 'smiles-clube', label: 'Tentativa de sobrescrever oficial' },
      { ...customPreset, id: 'custom-safe', label: 'Seguro' },
    ]

    const result = mergeImportedPresets([], incoming, 'replace-existing', new Set(['smiles-clube']))

    expect(result.presets.map((preset) => preset.id)).toEqual(['custom-safe'])
    expect(result.blockedOfficial).toBe(1)
  })
})
