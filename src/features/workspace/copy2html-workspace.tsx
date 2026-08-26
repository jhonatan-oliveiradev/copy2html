'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
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

export function Copy2HtmlWorkspace() {
  const packs = useMemo(() => listPresetPacks(), [])
  const [activePackId, setActivePackId] = useState(() => getDefaultPresetPack().id)
  const [packEnabled, setPackEnabled] = useState(true)
  const [customPresets, setCustomPresets] = useState<Preset[]>([])
  const [presetActions, setPresetActions] = useState<PresetActions | null>(null)
  const [result, setResult] = useState<SerializationResult>(emptyResult)
  const [notice, setNotice] = useState('Cole sua copy do Word no editor para começar.')

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
              onNotice={showNotice}
            />
          </aside>
        </div>

        <div className="result-grid">
          <HtmlOutputPanel result={result} />
          <HtmlPreview result={result} previewTheme={previewTheme} />
        </div>
      </main>

      <div className="mobile-copy-action">
        <CopyToLiferayButton result={result} onNotice={showNotice} />
      </div>
    </div>
  )
}
