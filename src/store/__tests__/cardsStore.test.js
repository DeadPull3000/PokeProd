import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })),
    })),
  },
}))

import { useStore } from '../index'

describe('cardsStore slice', () => {
  beforeEach(() => {
    useStore.setState({
      session: null,
      cardPacks: 2,
      collectedCards: [],
      trainerLevel: 3,
      completedToday: 2,
      toasts: [],
    })
  })

  it('grants packs and opens 3 TCG cards with guaranteed rare+ slot', async () => {
    useStore.getState().grantCardPack(1)
    expect(useStore.getState().cardPacks).toBe(3)

    const pulled = await useStore.getState().openCardPack()
    expect(pulled).toHaveLength(3)
    expect(useStore.getState().cardPacks).toBe(2)
    expect(useStore.getState().collectedCards).toHaveLength(3)
    expect(['rare', 'holo']).toContain(pulled[2].rarity)
  })
})
