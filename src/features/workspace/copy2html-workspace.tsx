'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  createPortablePresetPack,
  mergeImportedPresets,
  parsePortablePresetPack,
  portablePresetFilename,
  serializePortablePresetPack,
  type ImportConflictStrategy,
  type PortablePresetPack,
} from '@/core/presets/portability'
import type { FormattingPreset, InsertionPreset, LinkPreset, Preset, SnippetPreset } from '@/core/presets/schemas'
import { getDefaultPresetPack, listPresetPacks } from '@/core/presets/registry'
import { loadCustomPresets, saveCustomPresets } from '@/core/presets/storage'
import type { SerializationResult } from '@/core/serializer/serialize-editor-html'
import { CopyEditor } from '@/features/editor/copy-editor'
import { CopyToLiferayButton } from '@/features/html-output/copy-to-liferay-button'
import { HtmlOutputPanel } from '@/features/html-output/html-output-panel'
import { PresetPanel } from '@/features/presets/preset-panel'
import { HtmlPreview } from '@/features/preview/html-preview'
import styles from './copy2html-workspace.module.css'

const emptyResult: SerializationResult = {
  html: '',
  sanitization: { html: '', changed: false, notices: [] },
  validation: { severity: 'valid', issues: [] },
}

type PresetActions = {
  applyFormattingPreset: (preset: FormattingPreset) => boolean
  applyLinkPreset: (preset: LinkPreset) => boolean
  insertPreset: (preset: InsertionPreset) => boolean
  insertSnippet: (preset: SnippetPreset) => boolean
}

type PendingImport = {
  pack: PortablePresetPack
  conflictCount: number
}

function GithubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.6 0-1.2.4-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.1 0 0 1-.3 3.2 1.2A11 11 0 0 1 12 5.6a11 11 0 0 1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.5.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.3-2.8 5.3-5.4 5.6.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.3 11.3 0 0 0 12 .7Z" />
    </svg>
  )
}

export function Copy2HtmlWorkspace() {
  const packs = useMemo(() => listPresetPacks(), [])
  const officialPresetIds = useMemo(
    () => new Set(packs.flatMap((pack) => pack.presets.map((preset) => preset.id))),
    [packs],
  )
  const [activePackId, setActivePackId] = useState(() => getDefaultPresetPack().id)
  const [packEnabled, setPackEnabled] = useState(true)
  const [customPresets, setCustomPresets] = useState<Preset[]>([])
  const [presetActions, setPresetActions] = useState<PresetActions | null>(null)
  const [result, setResult] = useState<SerializationResult>(emptyResult)
  const [notice, setNotice] = useState('Cole sua copy do Word no editor para começar.')
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportName, setExportName] = useState('')
  const [exportAuthor, setExportAuthor] = useState('')

  const activePack = useMemo(() => packs.find((pack) => pack.id === activePackId), [activePackId, packs])
  const previewTheme = packEnabled ? activePack?.previewTheme : undefined

  const showNotice = useCallback((message: string) => setNotice(message), [])
  const updateResult = useCallback((next: SerializationResult) => setResult(next), [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const loaded = loadCustomPresets()
      setCustomPresets(loaded.presets)
      if (loaded.notice) showNotice(loaded.notice)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [showNotice])

  const createCustomPreset = useCallback(
    (preset: FormattingPreset) => {
      const next = [...customPresets.filter((item) => item.id !== preset.id), preset]
      try {
        const saved = saveCustomPresets(next)
        setCustomPresets(saved.presets)
        showNotice(saved.persistent ? 'Preset pessoal salvo neste navegador.' : saved.notice ?? 'Preset salvo para esta sessão.')
      } catch {
        showNotice('O preset não passou pela validação de segurança e não foi salvo.')
      }
    },
    [customPresets, showNotice],
  )

  const openExportDialog = useCallback(() => {
    if (!customPresets.length) {
      showNotice('Crie ao menos um preset pessoal antes de exportar.')
      return
    }
    setExportName(activePack?.name ? `${activePack.name} — presets pessoais` : 'Presets pessoais do Copy2HTML')
    setExportAuthor('')
    setExportDialogOpen(true)
  }, [activePack, customPresets.length, showNotice])

  const exportCustomPresets = useCallback(() => {
    const name = exportName.trim()
    if (!name) {
      showNotice('Informe um nome para o pack antes de exportar.')
      return
    }

    try {
      const pack = createPortablePresetPack(customPresets, {
        name,
        author: exportAuthor.trim() || undefined,
        description: activePack?.name ? `Presets pessoais criados no contexto do pack ${activePack.name}.` : undefined,
      })
      const blob = new Blob([serializePortablePresetPack(pack)], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = portablePresetFilename(name)
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setExportDialogOpen(false)
      showNotice(`${customPresets.length} preset${customPresets.length === 1 ? '' : 's'} exportado${customPresets.length === 1 ? '' : 's'} com segurança.`)
    } catch {
      showNotice('Não foi possível exportar os presets pessoais.')
    }
  }, [activePack, customPresets, exportAuthor, exportName, showNotice])

  const applyImportedPack = useCallback(
    (pack: PortablePresetPack, strategy: ImportConflictStrategy) => {
      try {
        const merged = mergeImportedPresets(customPresets, pack.presets, strategy, officialPresetIds)
        const saved = saveCustomPresets(merged.presets)
        setCustomPresets(saved.presets)

        const details = [
          `${merged.imported} importado${merged.imported === 1 ? '' : 's'}`,
          merged.conflicts ? `${merged.conflicts} conflito${merged.conflicts === 1 ? '' : 's'}` : null,
          merged.blockedOfficial ? `${merged.blockedOfficial} ID oficial ignorado${merged.blockedOfficial === 1 ? '' : 's'}` : null,
        ].filter(Boolean).join(' · ')

        showNotice(`${pack.name}: ${details}.${saved.persistent ? '' : ` ${saved.notice ?? ''}`}`)
      } catch {
        showNotice('Não foi possível salvar os presets importados.')
      }
    },
    [customPresets, officialPresetIds, showNotice],
  )

  const importCustomPresets = useCallback(
    async (file: File) => {
      if (file.size > 1_000_000) {
        showNotice('O arquivo de presets é grande demais para ser importado.')
        return
      }

      const parsed = parsePortablePresetPack(await file.text())
      if (!parsed.success) {
        showNotice(parsed.error)
        return
      }

      if (!parsed.data.presets.length) {
        showNotice('O pack importado não contém presets.')
        return
      }

      const conflictCount = parsed.data.presets.filter((preset) => customPresets.some((current) => current.id === preset.id)).length
      if (conflictCount > 0) {
        setPendingImport({ pack: parsed.data, conflictCount })
        return
      }

      applyImportedPack(parsed.data, 'keep-existing')
    },
    [applyImportedPack, customPresets, showNotice],
  )

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand-row">
            <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
            <h1>Copy2HTML</h1>
            <span className="version-badge">v0.1</span>
          </div>
          <p>Do Word ao Liferay, com HTML limpo e previsível.</p>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <CopyToLiferayButton result={result} onNotice={showNotice} />
        </div>
      </header>

      <div className="flow-hint" role="status" aria-live="polite">
        <span>Word</span><b>→</b><span>Copy2HTML</span><b>→</b><span>Liferay</span>
        <p>{notice}</p>
      </div>

      <main className="workspace">
        <div className={styles.primaryGrid}>
          <section className="editor-section" aria-labelledby="editor-title">
            <div className="section-heading">
              <div>
                <span className="eyebrow">1. Conteúdo</span>
                <h2 id="editor-title">Editor</h2>
              </div>
              <p>Copie do Word e cole aqui. Negritos e links compatíveis são preservados; resíduos do Word são removidos.</p>
            </div>
            <CopyEditor onSerializedChange={updateResult} onNotice={showNotice} registerPresetActions={setPresetActions} />
          </section>

          <aside className={styles.presetRail} aria-label="Presets de formatação">
            <PresetPanel
              packs={packs}
              activePackId={activePackId}
              packEnabled={packEnabled}
              customPresets={customPresets}
              actions={presetActions}
              onPackChange={setActivePackId}
              onPackEnabledChange={setPackEnabled}
              onCreateCustomPreset={createCustomPreset}
              onImportPresets={importCustomPresets}
              onExportPresets={openExportDialog}
              onNotice={showNotice}
            />
          </aside>
        </div>

        <div className="result-grid">
          <HtmlOutputPanel result={result} />
          <HtmlPreview result={result} previewTheme={previewTheme} />
        </div>
      </main>

      <footer className={styles.credit}>
        <span>Feito por</span>
        <a
          href="https://github.com/jhonatan-oliveiradev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub de Jhonatan Oliveira"
        >
          <GithubMark />
          Jhonatan Oliveira
        </a>
      </footer>

      <div className="mobile-copy-action">
        <CopyToLiferayButton result={result} onNotice={showNotice} />
      </div>

      <AlertDialog open={pendingImport !== null} onOpenChange={(open) => !open && setPendingImport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Presets pessoais já existentes</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport?.conflictCount === 1
                ? '1 preset pessoal já existe neste navegador.'
                : `${pendingImport?.conflictCount ?? 0} presets pessoais já existem neste navegador.`}
              {' '}Você pode manter os atuais e importar apenas os novos, ou substituir os conflitos pelos presets recebidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (pendingImport) applyImportedPack(pendingImport.pack, 'keep-existing')
                setPendingImport(null)
              }}
            >
              Manter atuais
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingImport) applyImportedPack(pendingImport.pack, 'replace-existing')
                setPendingImport(null)
              }}
            >
              Substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar presets pessoais</DialogTitle>
            <DialogDescription>
              Gere um arquivo portátil para compartilhar seus presets com colegas ou usar em outro dispositivo.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Nome do pack
              <input
                className="min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[var(--text)] outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
                value={exportName}
                onChange={(event) => setExportName(event.target.value)}
                autoFocus
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Autor <span className="font-normal text-[var(--muted)]">(opcional)</span>
              <input
                className="min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[var(--text)] outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
                value={exportAuthor}
                onChange={(event) => setExportAuthor(event.target.value)}
              />
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={exportCustomPresets} disabled={!exportName.trim()}>Exportar arquivo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
