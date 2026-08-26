import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { listPresetPacks } from '@/core/presets/registry'
import { PresetPanel } from './preset-panel'

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
        onNotice={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Smiles' })).toBeInTheDocument()
    expect(screen.getByText('Formatação')).toBeInTheDocument()
    expect(screen.getByText('Links e macros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Clube Smiles/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Macro Clube Smiles/ })).toBeInTheDocument()
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
        onNotice={() => undefined}
      />,
    )

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'opt-in' } })
    expect(screen.getByRole('button', { name: /Macro Opt-in/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Clube Smiles$/ })).not.toBeInTheDocument()
  })

  it('requires confirmation before inserting historical snippets', () => {
    const insertSnippet = vi.fn().mockReturnValue(true)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

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
        onNotice={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Tarja de vigência/ }))
    expect(window.confirm).toHaveBeenCalled()
    expect(insertSnippet).not.toHaveBeenCalled()
  })
})
