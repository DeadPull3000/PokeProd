import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calcTrainerLevel } from '../../constants/gameData'

const mockUpsert = vi.fn(() => Promise.resolve({ error: null }))
const mockSingle = vi.fn(() => Promise.resolve({ data: { xp: 245, username: 'ash' }, error: null }))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: mockSingle })),
      })),
      upsert: mockUpsert,
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

import { useStore } from '../index'

describe('xpStore slice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({
      session: { user: { id: 'user-1', email: 'ash@pallet.com' } },
      totalXP: 0,
      trainerLevel: 1,
      toasts: [],
    })
  })

  it('derives trainer level accurately at 100-XP boundaries', () => {
    expect(calcTrainerLevel(0)).toBe(1)
    expect(calcTrainerLevel(99)).toBe(1)
    expect(calcTrainerLevel(100)).toBe(2)
    expect(calcTrainerLevel(350)).toBe(4)
  })

  it('updates local XP, recalculates level, and persists via Supabase on addXp', async () => {
    await useStore.getState().addXp(150)
    const state = useStore.getState()
    expect(state.totalXP).toBe(150)
    expect(state.trainerLevel).toBe(2)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', xp: 150 })
    )
    expect(state.toasts.some((t) => t.message.includes('LEVEL UP'))).toBe(true)
  })

  it('fetches profile XP and uppercases username', async () => {
    await useStore.getState().fetchProfile()
    const state = useStore.getState()
    expect(state.totalXP).toBe(245)
    expect(state.trainerLevel).toBe(3)
    expect(state.trainerName).toBe('ASH')
  })

  it('gainXP increments both element balance and total XP', () => {
    const beforeFire = useStore.getState().xp.fire
    useStore.getState().gainXP('fire', 30)
    expect(useStore.getState().xp.fire).toBe(beforeFire + 30)
    expect(useStore.getState().totalXP).toBe(30)
  })
})
