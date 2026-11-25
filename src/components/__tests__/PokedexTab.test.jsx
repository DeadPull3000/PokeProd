import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: '1',
                  pokemon_id: 25,
                  is_shiny: false,
                  source: 'safari',
                  first_seen_at: new Date().toISOString(),
                },
                {
                  id: '2',
                  pokemon_id: 133,
                  is_shiny: true,
                  source: 'habit_shiny',
                  first_seen_at: new Date().toISOString(),
                },
              ],
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}))

import PokedexTab from '../PokedexTab'
import { useStore } from '../../store'

describe('PokedexTab component', () => {
  beforeEach(() => {
    useStore.setState({
      session: { user: { id: 'dex-user' } },
      pokedexEntries: [],
      pokedexLoading: false,
      pokedexCloudSynced: true,
    })
  })

  it('filters caught species and opens Pokedex entry modal', async () => {
    render(<PokedexTab />)

    await waitFor(() => {
      expect(screen.getByText('PIKACHU')).toBeInTheDocument()
      expect(screen.getByText('EEVEE')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /SHINY/i }))
    expect(screen.getByText('EEVEE')).toBeInTheDocument()
    expect(screen.queryByText('PIKACHU')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('EEVEE'))
    expect(screen.getByText(/Habit Streak Shiny Roll/i)).toBeInTheDocument()
  })
})
