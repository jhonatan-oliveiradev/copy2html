import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { listPresetPacks } from '@/core/presets/registry'
import type { FormattingPreset } from '@/core/presets/schemas'
import { PresetPanel } from './preset-panel'

const noopImport = async () => undefined

describe('PresetPanel', () => {
  it('shows Smiles as the active default pack with categorized presets', () => {
    render(
      <PresetPanel
        packs={listPresetPacks()}
        activePackId="smiles"
        packEnabled
        customPresets={[]}
        actions={null}
        onPackChange={() => undefined}
        onPackEnabledChange={() => undefined}
        onCreateCustomPreset={() => undefined}
        onImportPresets={noopImport}
        onExportPresets={() => undefined}
        onNotice={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Smiles' })).toBeInTheDocument()
    expect(screen.getByText('Formatação')).toBeInTheDocument()
    expect(screen.getByText('Links e macros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Clube Smiles$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Macro Clube Smiles$/ })).toBeInTheDocument()
  })

  it('filters presets by search query', () => {
    render(
      <PresetPanel
        packs={listPresetPacks()}
        activePackId="smiles"
        packEnabled
        customPresets={[]}
        actions={null}
        onPackChange={() => undefined}
        onPackEnabledChange={() => undefined}
        onCreateCustomPreset={() => undefined}
        onImportPresets={noopImport}
        onExportPresets={() => undefined}
        onNotice={() => undefined}
      />,
    )

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'opt-in' } })
    expect(screen.getByRole('button', { name: /Macro Opt-in/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Clube Smiles$/ })).not.toBeInTheDocument()
  })

  it('shows imported personal presets in their own section', () => {
    const personalPreset: FormattingPreset = {
      id: 'custom-destaque',
      label: 'Destaque compartilhado',
      type: 'formatting',
      reviewBeforeUse: false,
      template: '<strong>{{selection}}</strong>',
    }

    render(
      <PresetPanel
        packs={listPresetPacks()}
        activePackId="smiles"
        packEnabled
        customPresets={[personalPreset]}
        actions={null}
        onPackChange={() => undefined}
        onPackEnabledChange={() => undefined}
        onCreateCustomPreset={() => undefined}
        onImportPresets={noopImport}
        onExportPresets={() => undefined}
        onNotice={() => undefined}
      />,
    )

    expect(screen.getByText('Presets pessoais (1)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Destaque compartilhado/ })).toBeInTheDocument()
  })

  it('requires shadcn confirmation before inserting historical snippets', () => {
    const insertSnippet = vi.fn().mockReturnValue(true)

    render(
      <PresetPanel
        packs={listPresetPacks()}
        activePackId="smiles"
        packEnabled
        customPresets={[]}
        actions={{
          applyFormattingPreset: vi.fn(),
          applyLinkPreset: vi.fn(),
          insertPreset: vi.fn(),
          insertSnippet,
        }}
        onPackChange={() => undefined}
        onPackEnabledChange={() => undefined}
        onCreateCustomPreset={() => undefined}
        onImportPresets={noopImport}
        onExportPresets={() => undefined}
        onNotice={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Tarja de vigência/ }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Revisar preset antes de inserir')).toBeInTheDocument()
    expect(insertSnippet).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Inserir preset' }))
    expect(insertSnippet).toHaveBeenCalledTimes(1)
  })
})
