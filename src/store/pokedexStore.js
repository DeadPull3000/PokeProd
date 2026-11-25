/* Pokédex & Collection Slice (Phase 2.1) */
import { supabase } from '../lib/supabase'
import { generateLocalId } from '../constants/gameData'
import { getPokemonName } from '../constants/pokedex151'

const STORAGE_KEY = (userId) => `pokeprod_pokedex_v1_${userId || 'local'}`

function loadLocalPokedex(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalPokedex(userId, entries) {
  try {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(entries))
  } catch {
    /* ignore quota errors */
  }
}

function isMissingTable(err) {
  if (!err) return false
  const msg = (err.message || '').toLowerCase()
  return err.code === '42P01' || err.code === 'PGRST205' || msg.includes('does not exist') || msg.includes('schema cache')
}

export const createPokedexSlice = (set, get) => ({
  pokedexEntries: [],
  pokedexLoading: false,
  pokedexCloudSynced: true,

  fetchPokedex: async () => {
    const state = get()
    const userId = state.session?.user?.id
    if (!userId) {
      const local = loadLocalPokedex('local')
      set({
        pokedexEntries: local.length > 0 ? local : state.pokedexEntries,
        pokedexLoading: false,
      })
      return
    }

    set({ pokedexLoading: true })
    const res = await supabase
      .from('pokedex_entries')
      .select('*')
      .eq('user_id', userId)
      .order('pokemon_id', { ascending: true })

    if (res.error) {
      if (isMissingTable(res.error)) {
        set({
          pokedexEntries: loadLocalPokedex(userId),
          pokedexLoading: false,
          pokedexCloudSynced: false,
        })
      } else {
        set({ pokedexLoading: false })
      }
      return
    }

    const mapped = (res.data || []).map((r) => ({
      id: r.id,
      pokemonId: r.pokemon_id,
      isShiny: Boolean(r.is_shiny),
      source: r.source,
      firstSeenAt: r.first_seen_at,
    }))
    saveLocalPokedex(userId, mapped)
    set({ pokedexEntries: mapped, pokedexLoading: false, pokedexCloudSynced: true })
  },

  registerPokemon: async (pokemonId, isShiny = false, source = 'safari') => {
    if (!pokemonId || pokemonId < 1) return
    const state = get()
    const exists = state.pokedexEntries.some(
      (e) => e.pokemonId === pokemonId && Boolean(e.isShiny) === Boolean(isShiny)
    )
    if (exists) return

    const newEntry = {
      id: generateLocalId(),
      pokemonId,
      isShiny: Boolean(isShiny),
      source,
      firstSeenAt: new Date().toISOString(),
    }

    const next = [...state.pokedexEntries, newEntry]
    const userId = state.session?.user?.id
    set({ pokedexEntries: next })
    saveLocalPokedex(userId, next)

    const monName = getPokemonName(pokemonId)
    state.pushToast?.(
      `${isShiny ? '✨ SHINY ' : '📖 '}Pokédex registered: #${String(pokemonId).padStart(3, '0')} ${monName}!`,
      'success',
      3500
    )

    if (userId && state.pokedexCloudSynced) {
      await supabase
        .from('pokedex_entries')
        .upsert(
          {
            user_id: userId,
            pokemon_id: pokemonId,
            is_shiny: Boolean(isShiny),
            source,
          },
          { onConflict: 'user_id,pokemon_id,is_shiny' }
        )
    }
  },
})
