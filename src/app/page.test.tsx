import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home', () => {
  it('presents the Copy2HTML Word to Liferay workflow', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'Copy2HTML' })).toBeInTheDocument()
    expect(screen.getByText(/Word → Liferay/i)).toBeInTheDocument()
  })
})
