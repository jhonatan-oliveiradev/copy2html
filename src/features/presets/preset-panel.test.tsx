import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { listPresetPacks } from '@/core/presets/registry'
import type { PresetLibrary } from '@/core/presets/libraries'
import type { FormattingPreset } from '@/core/presets/schemas'
import { PresetPanel } from './preset-panel'

const noopImport = async () => undefined
const baseProps = {
  packs: listPresetPacks(),
  packEnabled: true,
  actions: null,
  onLibraryChange: () => undefined,
  onPackEnabledChange: () => undefined,
  onCreateCustomPreset: () => undefined,
  onImportPresets: noopImport,
  onExportPresets: () => undefined,
  onNotice: () => undefined,
}

describe('PresetPanel', () => {
  it('shows Smiles as the active default library with categorized presets', () => {
    render(
      <PresetPanel
        {...baseProps}
        activeLibraryId="official:smiles"
        customPresets={[]}
        importedLibraries={[]}
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
        {...baseProps}
        activeLibraryId="official:smiles"
        customPresets={[]}
        importedLibraries={[]}
      />,
    )

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'opt-in' } })
    expect(screen.getByRole('button', { name: /Macro Opt-in/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Clube Smiles$/ })).not.toBeInTheDocument()
  })

  it('exposes personal and imported libraries in the shadcn select', () => {
    const personalPreset: FormattingPreset = {
      id: 'custom-destaque',
      label: 'Destaque compartilhado',
      type: 'formatting',
      reviewBeforeUse: false,
      template: '<strong>{{selection}}</strong>',
    }
    const importedLibrary: PresetLibrary = {
      id: 'imported-crm-20260828120000',
      name: 'CRM — Lifecycle',
      author: 'Time CRM',
      importedAt: '2026-08-28T12:00:00.000Z',
      presets: [personalPreset],
    }

    render(
      <PresetPanel
        {...baseProps}
        activeLibraryId="official:smiles"
        customPresets={[personalPreset]}
        importedLibraries={[importedLibrary]}
      />,
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Biblioteca ativa' }))
    expect(screen.getByRole('option', { name: 'Meus presets' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'CRM — Lifecycle' })).toBeInTheDocument()
  })

  it('renders an imported library as the active preset source', () => {
    const preset: FormattingPreset = {
      id: 'crm-destaque',
      label: 'Destaque CRM',
      type: 'formatting',
      reviewBeforeUse: false,
      template: '<strong>{{selection}}</strong>',
    }
    const library: PresetLibrary = {
      id: 'imported-crm-20260828120000',
      name: 'CRM — Lifecycle',
      author: 'Time CRM',
      importedAt: '2026-08-28T12:00:00.000Z',
      presets: [preset],
    }

    render(
      <PresetPanel
        {...baseProps}
        activeLibraryId={`imported:${library.id}`}
        customPresets={[]}
        importedLibraries={[library]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'CRM — Lifecycle' })).toBeInTheDocument()
    expect(screen.getByText('Compartilhada por Time CRM')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Destaque CRM' })).toBeInTheDocument()
  })

  it('requires shadcn confirmation before inserting historical snippets', () => {
    const insertSnippet = vi.fn().mockReturnValue(true)

    render(
      <PresetPanel
        {...baseProps}
        activeLibraryId="official:smiles"
        customPresets={[]}
        importedLibraries={[]}
        actions={{
          applyFormattingPreset: vi.fn(),
          applyLinkPreset: vi.fn(),
          insertPreset: vi.fn(),
          insertSnippet,
        }}
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
