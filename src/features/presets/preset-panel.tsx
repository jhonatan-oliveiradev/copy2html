'use client'

import { useMemo, useState } from 'react'
import type {
  FormattingPreset,
  InsertionPreset,
  LinkPreset,
  Preset,
  PresetPack,
  SnippetPreset,
} from '@/core/presets/schemas'
import { CustomPresetForm } from './custom-preset-form'

type PresetActions = {
  applyFormattingPreset: (preset: FormattingPreset) => boolean
  applyLinkPreset: (preset: LinkPreset) => boolean
  insertPreset: (preset: InsertionPreset) => boolean
  insertSnippet: (preset: SnippetPreset) => boolean
}

type PresetPanelProps = {
  packs: PresetPack[]
  activePackId: string
  packEnabled: boolean
  customPresets: Preset[]
  actions: PresetActions | null
  onPackChange: (id: string) => void
  onPackEnabledChange: (enabled: boolean) => void
  onCreateCustomPreset: (preset: FormattingPreset) => void
  onNotice: (message: string) => void
}

const sectionLabels: Record<Preset['type'], string> = {
  formatting: 'Formatação',
  link: 'Links e macros',
  insertion: 'Inserções',
  snippet: 'Snippets',
}

export function PresetPanel({
  packs,
  activePackId,
  packEnabled,
  customPresets,
  actions,
  onPackChange,
  onPackEnabledChange,
  onCreateCustomPreset,
  onNotice,
}: PresetPanelProps) {
  const [query, setQuery] = useState('')
  const basePack = packs.find((pack) => pack.id === 'base')
  const activePack = packs.find((pack) => pack.id === activePackId)

  const presets = useMemo(() => {
    const all = [
      ...(basePack?.presets ?? []),
      ...(packEnabled && activePack && activePack.id !== 'base' ? activePack.presets : []),
      ...customPresets,
    ]
    const normalizedQuery = query.trim().toLowerCase()
    return normalizedQuery ? all.filter((preset) => `${preset.label} ${preset.description ?? ''}`.toLowerCase().includes(normalizedQuery)) : all
  }, [activePack, basePack, customPresets, packEnabled, query])

  function runPreset(preset: Preset) {
    if (!actions) {
      onNotice('O editor ainda está inicializando.')
      return
    }

    if (preset.reviewBeforeUse && !window.confirm('Este snippet é histórico e precisa ser revisado antes de publicar. Inserir mesmo assim?')) {
      return
    }

    const applied =
      preset.type === 'formatting'
        ? actions.applyFormattingPreset(preset)
        : preset.type === 'link'
          ? actions.applyLinkPreset(preset)
          : preset.type === 'insertion'
            ? actions.insertPreset(preset)
            : actions.insertSnippet(preset)

    if (!applied) onNotice('Selecione um trecho compatível no editor ou posicione o cursor antes de aplicar este preset.')
  }

  return (
    <aside className="preset-panel" aria-label="Presets">
      <div className="panel-heading-row">
        <div>
          <span className="eyebrow">Preset pack</span>
          <h2>{activePack?.name ?? 'Base'}</h2>
        </div>
        {activePack?.id === 'smiles' ? <span className="pack-badge">Ativo por padrão</span> : null}
      </div>

      <label className="field-label">
        Pack ativo
        <select value={activePackId} onChange={(event) => onPackChange(event.target.value)}>
          {packs.filter((pack) => pack.id !== 'base').map((pack) => (
            <option key={pack.id} value={pack.id}>{pack.name}</option>
          ))}
        </select>
      </label>

      <label className="toggle-row">
        <input type="checkbox" checked={packEnabled} onChange={(event) => onPackEnabledChange(event.target.checked)} />
        Usar presets do pack {activePack?.name}
      </label>

      <label className="field-label">
        Buscar preset
        <input type="search" placeholder="Ex.: Clube, quebra, macro..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>

      {(['formatting', 'link', 'insertion', 'snippet'] as const).map((type) => {
        const items = presets.filter((preset) => preset.type === type)
        if (!items.length) return null
        return (
          <section className="preset-group" key={type}>
            <h3>{sectionLabels[type]}</h3>
            <div className="preset-list">
              {items.map((preset) => (
                <button type="button" className="preset-button" key={preset.id} onClick={() => runPreset(preset)}>
                  <span>{preset.label}</span>
                  {preset.reviewBeforeUse ? <small>Revisar</small> : null}
                </button>
              ))}
            </div>
          </section>
        )
      })}

      <CustomPresetForm onCreate={onCreateCustomPreset} onError={onNotice} />
    </aside>
  )
}
