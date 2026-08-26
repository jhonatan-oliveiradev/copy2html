import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeToggle } from './theme-toggle'

vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme: vi.fn() }),
}))

describe('ThemeToggle', () => {
  it('renders the accessible shadcn theme menu trigger', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button', { name: 'Alterar tema' })).toBeInTheDocument()
  })
})
