import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home', () => {
  it('presents the complete Word to Liferay workspace', async () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'Copy2HTML' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Editor' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'HTML gerado' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Smiles' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Copiar para Liferay' }).length).toBeGreaterThan(0)
    expect(await screen.findByText(/Cole sua copy do Word/i)).toBeInTheDocument()
  })
})
