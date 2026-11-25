import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({ data: null, error: { code: '42P01', message: 'does not exist' } })
          ),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}))

import { useStore } from '../index'

describe('pokedexStore slice', () => {
  beforeEach(() => {
    useStore.setState({
      session: { user: { id: 'dex-user' } },
      pokedexEntries: [],
      pokedexCloudSynced: true,
      toasts: [],
    })
  })

  it('registers new Pokemon species and deduplicates normal vs shiny variants', async () => {
    await useStore.getState().registerPokemon(25, false, 'safari')
    await useStore.getState().registerPokemon(25, false, 'nuzlocke')
    await useStore.getState().registerPokemon(25, true, 'habit_shiny')

    const entries = useStore.getState().pokedexEntries
    expect(entries).toHaveLength(2)
    expect(entries.filter((e) => e.isShiny)).toHaveLength(1)
    expect(useStore.getState().toasts.length).toBe(2)
  })
})
