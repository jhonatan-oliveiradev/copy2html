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
import type { PresetLibrary } from '@/core/presets/libraries'
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
  activeLibraryId: string
  packEnabled: boolean
  customPresets: Preset[]
  importedLibraries: PresetLibrary[]
  actions: PresetActions | null
  onLibraryChange: (id: string) => void
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
  activeLibraryId,
  packEnabled,
  customPresets,
  importedLibraries,
  actions,
  onLibraryChange,
  onPackEnabledChange,
  onCreateCustomPreset,
  onImportPresets,
  onExportPresets,
  onNotice,
}: PresetPanelProps) {
  const [query, setQuery] = useState('')
  const [pendingReviewPreset, setPendingReviewPreset] = useState<Preset | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const normalizedQuery = query.trim().toLowerCase()
  const basePack = packs.find((pack) => pack.id === 'base')

  const activeOfficialPackId = activeLibraryId.startsWith('official:') ? activeLibraryId.slice('official:'.length) : null
  const activeOfficialPack = activeOfficialPackId ? packs.find((pack) => pack.id === activeOfficialPackId) : null
  const activeImportedLibrary = activeLibraryId.startsWith('imported:')
    ? importedLibraries.find((library) => `imported:${library.id}` === activeLibraryId)
    : null
  const isPersonalLibrary = activeLibraryId === 'personal'

  const activeLibraryName = activeOfficialPack?.name
    ?? (isPersonalLibrary ? 'Meus presets' : activeImportedLibrary?.name)
    ?? 'Smiles'

  const libraryPresets = useMemo(() => {
    const basePresets = basePack?.presets ?? []
    const selectedPresets = activeOfficialPack
      ? (packEnabled ? activeOfficialPack.presets : [])
      : isPersonalLibrary
        ? customPresets
        : activeImportedLibrary?.presets ?? []

    return [...basePresets, ...selectedPresets].filter((preset) => matchesQuery(preset, normalizedQuery))
  }, [activeImportedLibrary, activeOfficialPack, basePack, customPresets, isPersonalLibrary, normalizedQuery, packEnabled])

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
            <span className="eyebrow">Biblioteca</span>
            <h2>{activeLibraryName}</h2>
          </div>
          {activeOfficialPack?.id === 'smiles' ? <span className="pack-badge">Oficial</span> : null}
          {activeImportedLibrary ? <span className="pack-badge">Importada</span> : null}
        </div>

        <div className="field-label">
          <span>Biblioteca ativa</span>
          <Select value={activeLibraryId} onValueChange={onLibraryChange}>
            <SelectTrigger aria-label="Biblioteca ativa">
              <SelectValue placeholder="Selecione uma biblioteca" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {packs.filter((pack) => pack.id !== 'base').map((pack) => (
                  <SelectItem key={pack.id} value={`official:${pack.id}`}>{pack.name}</SelectItem>
                ))}
                {customPresets.length > 0 ? <SelectItem value="personal">Meus presets</SelectItem> : null}
                {importedLibraries.map((library) => (
                  <SelectItem key={library.id} value={`imported:${library.id}`}>{library.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {activeOfficialPack ? (
          <label className="toggle-row">
            <input type="checkbox" checked={packEnabled} onChange={(event) => onPackEnabledChange(event.target.checked)} />
            Usar presets da biblioteca {activeOfficialPack.name}
          </label>
        ) : null}

        {activeImportedLibrary?.author ? (
          <p className="preset-empty-copy">Compartilhada por {activeImportedLibrary.author}</p>
        ) : null}

        <label className="field-label">
          Buscar preset
          <input type="search" placeholder="Ex.: Clube, quebra, macro..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>

        <section className="preset-group" aria-labelledby="preset-share-title">
          <h3 id="preset-share-title">Bibliotecas pessoais</h3>
          <div className="inline-actions">
            <button type="button" className="secondary-button" onClick={() => importInputRef.current?.click()}>
              Importar pack
            </button>
            <button type="button" className="ghost-button" disabled={customPresets.length === 0} onClick={onExportPresets}>
              Exportar meus presets {customPresets.length > 0 ? `(${customPresets.length})` : ''}
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

        {(['formatting', 'link', 'insertion', 'snippet'] as const).map((type) => {
          const items = libraryPresets.filter((preset) => preset.type === type)
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

        {libraryPresets.length === 0 ? <p className="preset-empty-copy">Nenhum preset corresponde à busca nesta biblioteca.</p> : null}

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
