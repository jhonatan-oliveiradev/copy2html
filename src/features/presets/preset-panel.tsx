'use client'

import { useMemo, useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  onImportPresets: (file: File) => void | Promise<void>
  onExportPresets: () => void
  onNotice: (message: string) => void
}

const sectionLabels: Record<Preset['type'], string> = {
  formatting: 'Formatação',
  link: 'Links e macros',
  insertion: 'Inserções',
  snippet: 'Snippets',
}

function matchesQuery(preset: Preset, query: string) {
  return !query || `${preset.label} ${preset.description ?? ''}`.toLowerCase().includes(query)
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
  onImportPresets,
  onExportPresets,
  onNotice,
}: PresetPanelProps) {
  const [query, setQuery] = useState('')
  const [pendingReviewPreset, setPendingReviewPreset] = useState<Preset | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const basePack = packs.find((pack) => pack.id === 'base')
  const activePack = packs.find((pack) => pack.id === activePackId)
  const normalizedQuery = query.trim().toLowerCase()

  const officialPresets = useMemo(() => {
    const all = [
      ...(basePack?.presets ?? []),
      ...(packEnabled && activePack && activePack.id !== 'base' ? activePack.presets : []),
    ]
    return all.filter((preset) => matchesQuery(preset, normalizedQuery))
  }, [activePack, basePack, normalizedQuery, packEnabled])

  const visibleCustomPresets = useMemo(
    () => customPresets.filter((preset) => matchesQuery(preset, normalizedQuery)),
    [customPresets, normalizedQuery],
  )

  function executePreset(preset: Preset) {
    if (!actions) {
      onNotice('O editor ainda está inicializando.')
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

  function runPreset(preset: Preset) {
    if (preset.reviewBeforeUse) {
      setPendingReviewPreset(preset)
      return
    }
    executePreset(preset)
  }

  async function handleImportFile(file: File | undefined) {
    if (!file) return
    await onImportPresets(file)
    if (importInputRef.current) importInputRef.current.value = ''
  }

  return (
    <>
      <aside className="preset-panel" aria-label="Presets">
        <div className="panel-heading-row">
          <div>
            <span className="eyebrow">Preset pack</span>
            <h2>{activePack?.name ?? 'Base'}</h2>
          </div>
          {activePack?.id === 'smiles' ? <span className="pack-badge">Ativo por padrão</span> : null}
        </div>

        <div className="field-label">
          <span>Pack ativo</span>
          <Select value={activePackId} onValueChange={onPackChange}>
            <SelectTrigger aria-label="Pack ativo">
              <SelectValue placeholder="Selecione um pack" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {packs.filter((pack) => pack.id !== 'base').map((pack) => (
                  <SelectItem key={pack.id} value={pack.id}>{pack.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <label className="toggle-row">
          <input type="checkbox" checked={packEnabled} onChange={(event) => onPackEnabledChange(event.target.checked)} />
          Usar presets do pack {activePack?.name}
        </label>

        <label className="field-label">
          Buscar preset
          <input type="search" placeholder="Ex.: Clube, quebra, macro..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>

        <section className="preset-group" aria-labelledby="preset-share-title">
          <h3 id="preset-share-title">Compartilhar presets pessoais</h3>
          <div className="inline-actions">
            <button type="button" className="secondary-button" onClick={() => importInputRef.current?.click()}>
              Importar
            </button>
            <button type="button" className="ghost-button" disabled={customPresets.length === 0} onClick={onExportPresets}>
              Exportar {customPresets.length > 0 ? `(${customPresets.length})` : ''}
            </button>
            <input
              ref={importInputRef}
              type="file"
              hidden
              accept=".json,.copy2html.json,application/json"
              onChange={(event) => void handleImportFile(event.target.files?.[0])}
            />
          </div>
        </section>

        {customPresets.length > 0 ? (
          <section className="preset-group personal-preset-group" aria-labelledby="personal-presets-title">
            <h3 id="personal-presets-title">Presets pessoais ({customPresets.length})</h3>
            <div className="preset-list">
              {visibleCustomPresets.length > 0 ? visibleCustomPresets.map((preset) => (
                <button type="button" className="preset-button" key={preset.id} onClick={() => runPreset(preset)}>
                  <span>{preset.label}</span>
                  <small>{sectionLabels[preset.type]}</small>
                </button>
              )) : <p className="preset-empty-copy">Nenhum preset pessoal corresponde à busca.</p>}
            </div>
          </section>
        ) : null}

        {(['formatting', 'link', 'insertion', 'snippet'] as const).map((type) => {
          const items = officialPresets.filter((preset) => preset.type === type)
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

      <AlertDialog open={pendingReviewPreset !== null} onOpenChange={(open) => !open && setPendingReviewPreset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revisar preset antes de inserir</AlertDialogTitle>
            <AlertDialogDescription>
              Este snippet é histórico e precisa ser revisado antes de publicar. Deseja inserir “{pendingReviewPreset?.label}” mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingReviewPreset(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingReviewPreset) executePreset(pendingReviewPreset)
                setPendingReviewPreset(null)
              }}
            >
              Inserir preset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
