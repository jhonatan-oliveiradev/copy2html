import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { CopyToLiferayButton } from './copy-to-liferay-button'
import type { SerializationResult } from '@/core/serializer/serialize-editor-html'

const validResult: SerializationResult = {
  html: '<p><strong>Texto</strong></p>',
  sanitization: { html: '<p><strong>Texto</strong></p>', changed: false, notices: [] },
  validation: { severity: 'valid', issues: [] },
}

describe('CopyToLiferayButton', () => {
  it('copies only the sanitized serialized HTML', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const onNotice = vi.fn()

    render(<CopyToLiferayButton result={validResult} onNotice={onNotice} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar para Liferay' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('<p><strong>Texto</strong></p>'))
    expect(onNotice).toHaveBeenCalledWith(expect.stringMatching(/módulo Liferay/i))
  })

  it('disables copying when validation is blocked', () => {
    const blocked: SerializationResult = {
      ...validResult,
      validation: { severity: 'blocked', issues: [{ code: 'invalid-link', message: 'Link inválido', severity: 'blocked' }] },
    }

    render(<CopyToLiferayButton result={blocked} onNotice={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Copiar para Liferay' })).toBeDisabled()
  })
})
