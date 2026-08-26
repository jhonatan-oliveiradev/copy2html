import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { CopyEditor } from './copy-editor'

describe('CopyEditor', () => {
  it('renders the base formatting controls and emits an initial serialization', async () => {
    const onSerializedChange = vi.fn()

    render(<CopyEditor onSerializedChange={onSerializedChange} onNotice={() => undefined} />)

    expect(screen.getByRole('button', { name: 'Negrito' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Itálico' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quebra simples' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quebra dupla' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desfazer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refazer' })).toBeInTheDocument()

    await waitFor(() => expect(onSerializedChange).toHaveBeenCalled())
    expect(onSerializedChange.mock.calls.at(-1)?.[0].html).toBe('')
  })
})
