import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getShinyThreshold } from '../habitsStore'
import { mapWeatherCode } from '../../constants/gameData'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}))

import { useStore } from '../index'

describe('habitsStore slice', () => {
  beforeEach(() => {
    useStore.setState({
      session: null,
      habits: [{ id: 'h1', name: 'Read 20m', streak: 6, lastCompleted: null }],
      caughtShinies: [],
      _shinyEncounter: null,
      totalXP: 0,
      trainerLevel: 1,
      toasts: [],
    })
  })

  it('scales shiny threshold properly by streak tier', () => {
    expect(getShinyThreshold(1)).toBeCloseTo(1 / 4096)
    expect(getShinyThreshold(5)).toBeCloseTo(1 / 1000)
    expect(getShinyThreshold(10)).toBeCloseTo(1 / 100)
    expect(getShinyThreshold(15)).toBeCloseTo(1 / 20)
  })

  it('prevents double-completion on the same calendar day', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    useStore.getState().completeHabit('h1')
    expect(useStore.getState().habits[0].streak).toBe(7)
    expect(useStore.getState().totalXP).toBe(20)

    useStore.getState().completeHabit('h1')
    expect(useStore.getState().habits[0].streak).toBe(7)
    expect(useStore.getState().totalXP).toBe(20)
    vi.restoreAllMocks()
  })

  it('maps Open-Meteo WMO codes into element weather boosts', () => {
    expect(mapWeatherCode(0).condition).toBe('Sunny')
    expect(mapWeatherCode(61).condition).toBe('Rain')
    expect(mapWeatherCode(73).condition).toBe('Snow')
  })
})
