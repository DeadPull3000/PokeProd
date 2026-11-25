import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getDailyGymLeader } from '../../constants/pokedex151'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })),
  },
}))

import { useStore } from '../index'

describe('battleStore slice', () => {
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
        currentHp: 2,
        isDefeated: false,
      },
      gymBadges: [],
      pokedexEntries: [],
      totalXP: 0,
      trainerLevel: 1,
      toasts: [],
    })
  })

  it('deals 1.0 super-effective damage on matching element and 0.5 off-type', async () => {
    const offType = leader.element === 'fire' ? 'water' : 'fire'
    const res1 = await useStore.getState().strikeDailyBoss(offType)
    expect(res1.damage).toBe(0.5)
    expect(useStore.getState().dailyBoss.currentHp).toBe(1.5)

    const res2 = await useStore.getState().strikeDailyBoss(leader.element)
    expect(res2.damage).toBe(1)
    expect(useStore.getState().dailyBoss.currentHp).toBe(0.5)
  })

  it('awards Gym Badge, +100 XP, and Pokedex entry when boss HP hits zero', async () => {
    await useStore.getState().strikeDailyBoss(leader.element, 2)
    const state = useStore.getState()
    expect(state.dailyBoss.isDefeated).toBe(true)
    expect(state.gymBadges.some((b) => b.badgeType === leader.badgeType)).toBe(true)
    expect(state.totalXP).toBe(100)
    expect(state.pokedexEntries.some((e) => e.pokemonId === leader.aceId)).toBe(true)
  })
})
