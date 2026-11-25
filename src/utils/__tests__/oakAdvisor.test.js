import { describe, it, expect } from 'vitest'
import { getOakAdvice } from '../oakAdvisor'

describe('oakAdvisor', () => {
  it('prioritizes urgent Nuzlocke tasks under 12 hours', () => {
    const soon = new Date(Date.now() + 2 * 3_600_000).toISOString()
    const tip = getOakAdvice({
      party: [{ id: '1', status: 'active', taskName: 'Tax Filing', deadline: soon }],
      tasks: [],
      xp: { fire: 100 },
    })
    expect(tip.badge).toBe('URGENT NUZLOCKE')
    expect(tip.actionTab).toBe('nuzlocke')
  })

  it('highlights unopened booster packs when no urgent deadline or gym hint applies', () => {
    const tip = getOakAdvice({
      party: [],
      tasks: [],
      xp: { fire: 100, water: 100, grass: 100, psychic: 100, electric: 100, fairy: 100 },
      cardPacks: 2,
      dailyBoss: { isDefeated: true },
    })
    expect(tip.badge).toBe('BOOSTER READY')
    expect(tip.actionTab).toBe('league')
  })

  it('recommends training lowest element balance otherwise', () => {
    const tip = getOakAdvice({
      party: [],
      tasks: [],
      xp: { fire: 200, water: 180, grass: 300, psychic: 120, electric: 400, fairy: 10 },
      cardPacks: 0,
      dailyBoss: { isDefeated: true },
    })
    expect(tip.badge).toBe('TRAINING TIP')
    expect(tip.element).toBe('fairy')
  })
})
