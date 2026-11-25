import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        })),
      })),
    })),
  },
}))

import LeagueTab from '../LeagueTab'
import { useStore } from '../../store'

describe('LeagueTab component', () => {
  beforeEach(() => {
    useStore.setState({
      session: null,
      trainerName: 'RED',
      totalXP: 400,
      trainerLevel: 5,
      starterPokemon: { id: 155, name: 'CYNDAQUIL' },
      cardPacks: 1,
      collectedCards: [],
      duels: [],
      friends: [],
      leaderboard: [],
      toasts: [],
    })
  })

  it('navigates League sub-tabs and opens a Booster Pack in Card Binder', async () => {
    render(<LeagueTab />)
    expect(screen.getByText('POKéMON LEAGUE STANDINGS')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /CARDS/i }))
    const openBtn = screen.getByRole('button', { name: /OPEN BOOSTER PACK/i })
    fireEvent.click(openBtn)

    await waitFor(() => {
      expect(screen.getByText('BOOSTER PACK OPENED!')).toBeInTheDocument()
    })
    expect(useStore.getState().collectedCards).toHaveLength(3)
  })
})
