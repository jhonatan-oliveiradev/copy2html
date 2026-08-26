import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCustomPresets, saveCustomPresets } from './storage'
import type { FormattingPreset } from './schemas'

const customPreset: FormattingPreset = {
  id: 'custom-destaque',
  label: 'Destaque',
  type: 'formatting',
  reviewBeforeUse: false,
  template: '<strong style="color: #663399; display: inline-block">{{selection}}</strong>',
}

describe('custom preset storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns an empty persistent collection when nothing is stored', () => {
    expect(loadCustomPresets()).toEqual({ presets: [], persistent: true })
  })

  it('saves and reloads validated presets', () => {
    expect(saveCustomPresets([customPreset]).persistent).toBe(true)
    expect(loadCustomPresets().presets).toEqual([customPreset])
  })

  it('ignores corrupt JSON safely', () => {
    window.localStorage.setItem('copy2html:custom-presets:v1', '{broken')

    const result = loadCustomPresets()
    expect(result.presets).toEqual([])
    expect(result.notice).toMatch(/corrompido/i)
  })

  it('rejects schema-invalid or unsafe stored presets', () => {
    window.localStorage.setItem(
      'copy2html:custom-presets:v1',
      JSON.stringify([{ id: 'unsafe', label: 'Unsafe', type: 'formatting', template: '<strong onclick="alert(1)">{{selection}}</strong>' }]),
    )

    const result = loadCustomPresets()
    expect(result.presets).toEqual([])
    expect(result.notice).toMatch(/inválidos/i)
  })
})
