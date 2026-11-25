import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { getDailyGymLeader } from '../../constants/pokedex151'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}))

import BattleTab from '../BattleTab'
import { useStore } from '../../store'

describe('BattleTab component', () => {
  const today = new Date().toISOString().slice(0, 10)
  const leader = getDailyGymLeader(today)

  beforeEach(() => {
    useStore.setState({
      session: null,
      dailyBoss: {
        date: today,
        bossType: leader.element,
        leaderId: leader.id,
        bossHp: 4,
        currentHp: 4,
        isDefeated: false,
      },
      gymBadges: [],
      battleLoading: false,
      battleCloudSynced: true,
      toasts: [],
    })
  })

  it('renders todays Gym Leader challenger and allows sparring damage', async () => {
    render(<BattleTab />)
    expect(screen.getAllByText(new RegExp(leader.leaderName, 'i')).length).toBeGreaterThan(0)
    expect(screen.getByText('4 / 4 HP')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /SPAR/i }))
    expect(useStore.getState().dailyBoss.currentHp).toBe(3.5)
  })
})
