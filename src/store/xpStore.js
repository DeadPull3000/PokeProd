/* Trainer XP, Level, Element Radar & Route Progress Slice */
import { supabase } from '../lib/supabase'
import { calcTrainerLevel } from '../constants/gameData'

const todayStr = () => new Date().toISOString().slice(0, 10)
const TODAY_KEY = () => 'completedToday_' + todayStr()

export const loadCompletedToday = () => {
  try {
    return parseInt(localStorage.getItem(TODAY_KEY()) || '0', 10) || 0
  } catch {
    return 0
  }
}

export const saveCompletedToday = (n) => {
  try {
    localStorage.setItem(TODAY_KEY(), String(n))
  } catch {
    /* ignore storage quota errors */
  }
}

/* Clean up stale daily route-map keys */
try {
  const today = todayStr()
  Object.keys(localStorage)
    .filter((k) => k.startsWith('completedToday_') && !k.endsWith(today))
    .forEach((k) => localStorage.removeItem(k))
} catch {
  /* ignore in non-browser contexts */
}

const DEFAULT_ELEMENT_XP = {
  fire: 240,
  water: 180,
  grass: 310,
  psychic: 150,
  electric: 420,
  fairy: 95,
}

export const createXpSlice = (set, get) => ({
  xp: { ...DEFAULT_ELEMENT_XP },
  totalXP: 0,
  trainerLevel: 1,
  completedToday: loadCompletedToday(),

  fetchProfile: async () => {
    const state = get()
    if (!state.session) return
    const userId = state.session.user.id

    const result = await supabase
      .from('profiles')
      .select('xp, username, starter_id, starter_name')
      .eq('id', userId)
      .single()

    if (!result.error && result.data) {
      const xpVal = result.data.xp || 0
      const levelVal = calcTrainerLevel(xpVal)
      const updates = {
        totalXP: xpVal,
        trainerLevel: levelVal,
      }
      if (result.data.username) {
        updates.trainerName = result.data.username.toUpperCase()
      }
      if (result.data.starter_id && result.data.starter_name) {
        updates.starterPokemon = {
          id: result.data.starter_id,
          name: result.data.starter_name,
        }
      }
      set(updates)
      const starterId = updates.starterPokemon?.id || state.starterPokemon?.id
      if (starterId) {
        get().registerPokemon?.(starterId, false, 'starter')
      }
    } else if (result.error && result.error.code === 'PGRST116') {
      /* Profile row doesn't exist yet for legacy user — initialize cleanly */
      const defaultName = (state.session.user.email?.split('@')[0] || 'TRAINER RED').toUpperCase()
      await supabase.from('profiles').upsert({
        id: userId,
        username: defaultName,
        xp: 0,
      })
      set({ totalXP: 0, trainerLevel: 1, trainerName: defaultName })
      if (state.starterPokemon?.id) {
        get().registerPokemon?.(state.starterPokemon.id, false, 'starter')
      }
    }
  },

  addXp: async (amount) => {
    const state = get()
    const prevLevel = state.trainerLevel
    const newXp = Math.max(0, state.totalXP + amount)
    const newLevel = calcTrainerLevel(newXp)
    set({ totalXP: newXp, trainerLevel: newLevel })

    if (newLevel > prevLevel) {
      state.pushToast?.(`LEVEL UP! You reached Lv.${newLevel}! (+1 Card Pack)`, 'success', 4500)
      state.grantCardPack?.(1)
    }
    state.recordDailyActivity?.({ tasksDelta: 0, habitsDelta: 0 })

    if (state.session) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: state.session.user.id,
          xp: newXp,
          username: state.trainerName,
        })
      if (error) {
        /* Fallback to plain update if profiles has fewer columns */
        await supabase
          .from('profiles')
          .update({ xp: newXp })
          .eq('id', state.session.user.id)
      }
    }
  },

  gainXP: (element, amount) => {
    set((state) => ({
      xp: {
        ...state.xp,
        [element]: (state.xp[element] || 0) + amount,
      },
    }))
    get().addXp(amount)
  },

  incrementCompletedToday: () => {
    const next = get().completedToday + 1
    saveCompletedToday(next)
    set({ completedToday: next })
    return next
  },
})
