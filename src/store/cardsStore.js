/* Collectible TCG Cards & Booster Packs Slice (Phase 5.1) */
import { supabase } from '../lib/supabase'
import { generateLocalId } from '../constants/gameData'
import { getPokemonName } from '../constants/pokedex151'

const CARDS_KEY = (userId) => `pokeprod_cards_v1_${userId || 'local'}`
const PACKS_KEY = (userId) => `pokeprod_packs_v1_${userId || 'local'}`

function loadCards(userId) {
  try {
    const raw = localStorage.getItem(CARDS_KEY(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCards(userId, cards) {
  try {
    localStorage.setItem(CARDS_KEY(userId), JSON.stringify(cards))
  } catch {
    /* ignore */
  }
}

function loadPacks(userId) {
  try {
    const raw = localStorage.getItem(PACKS_KEY(userId))
    return raw !== null ? parseInt(raw, 10) : 1 /* 1 free welcome pack */
  } catch {
    return 1
  }
}

function savePacks(userId, count) {
  try {
    localStorage.setItem(PACKS_KEY(userId), String(count))
  } catch {
    /* ignore */
  }
}

function isMissingTable(err) {
  if (!err) return false
  const msg = (err.message || '').toLowerCase()
  return err.code === '42P01' || err.code === 'PGRST205' || msg.includes('does not exist') || msg.includes('schema cache')
}

function rollCardRarity(slotIdx) {
  /* Third card in every 3-card booster guarantees at least Rare! */
  const r = Math.random()
  if (slotIdx === 2) {
    return r < 0.25 ? 'holo' : 'rare'
  }
  if (r < 0.12) return 'holo'
  if (r < 0.35) return 'rare'
  return 'common'
}

export const createCardsSlice = (set, get) => ({
  collectedCards: [],
  cardPacks: 1,
  cardsLoading: false,
  cardsCloudSynced: true,

  fetchCards: async () => {
    const state = get()
    const userId = state.session?.user?.id
    const packs = loadPacks(userId)

    if (!userId) {
      set({ collectedCards: loadCards('local'), cardPacks: packs, cardsLoading: false })
      return
    }

    set({ cardsLoading: true, cardPacks: packs })
    const res = await supabase
      .from('collected_cards')
      .select('*')
      .eq('user_id', userId)
      .order('obtained_at', { ascending: false })

    if (res.error) {
      if (isMissingTable(res.error)) {
        set({
          collectedCards: loadCards(userId),
          cardsLoading: false,
          cardsCloudSynced: false,
        })
      } else {
        set({ cardsLoading: false })
      }
      return
    }

    const mapped = (res.data || []).map((c) => ({
      id: c.id,
      pokemonId: c.pokemon_id,
      rarity: c.rarity,
      cardTitle: c.card_title,
      atk: c.atk,
      obtainedAt: c.obtained_at,
    }))
    saveCards(userId, mapped)
    set({ collectedCards: mapped, cardsLoading: false, cardsCloudSynced: true })
  },

  grantCardPack: (count = 1) => {
    const userId = get().session?.user?.id
    const next = Math.max(0, (get().cardPacks || 0) + count)
    set({ cardPacks: next })
    savePacks(userId, next)
  },

  openCardPack: async () => {
    const state = get()
    if ((state.cardPacks || 0) <= 0) return []

    const userId = state.session?.user?.id
    const nextPacks = state.cardPacks - 1
    const baseAtk = Math.max(40, (state.trainerLevel || 1) * 15 + (state.completedToday || 0) * 10)

    const pulled = [0, 1, 2].map((slotIdx) => {
      const pokemonId = Math.floor(Math.random() * 151) + 1
      const rarity = rollCardRarity(slotIdx)
      const rarityBonus = rarity === 'holo' ? 45 : rarity === 'rare' ? 20 : 0
      return {
        id: generateLocalId(),
        pokemonId,
        rarity,
        cardTitle: `${getPokemonName(pokemonId)}${rarity === 'holo' ? ' ★' : ''}`,
        atk: baseAtk + rarityBonus,
        obtainedAt: new Date().toISOString(),
      }
    })

    const nextCards = [...pulled, ...state.collectedCards]
    set({ cardPacks: nextPacks, collectedCards: nextCards })
    savePacks(userId, nextPacks)
    saveCards(userId, nextCards)

    if (pulled.some((c) => c.rarity === 'holo')) {
      state.pushToast?.('✨ HOLO PULL! Check out your shiny new card!', 'success', 3500)
    }

    if (userId && state.cardsCloudSynced) {
      await supabase.from('collected_cards').insert(
        pulled.map((c) => ({
          user_id: userId,
          pokemon_id: c.pokemonId,
          rarity: c.rarity,
          card_title: c.cardTitle,
          atk: c.atk,
        }))
      )
    }

    return pulled
  },
})
