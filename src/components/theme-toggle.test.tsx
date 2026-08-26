import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeToggle } from './theme-toggle'

const setTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'system', setTheme }),
}))

describe('ThemeToggle', () => {
  it('offers system, light and dark themes and updates the selected mode', async () => {
    render(<ThemeToggle />)

    const select = await screen.findByRole('combobox', { name: 'Tema da interface' })

    expect(screen.getByRole('option', { name: 'Sistema' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Claro' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Escuro' })).toBeInTheDocument()

    fireEvent.change(select, { target: { value: 'dark' } })
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
