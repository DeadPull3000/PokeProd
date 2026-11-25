/* Daily Habits, Weather Boost & Shiny Box Slice */
import { supabase } from '../lib/supabase'
import { generateLocalId } from '../constants/gameData'

const SHINIES_KEY = (userId) => `pokeprod_shinies_v1_${userId || 'local'}`

function loadShiniesFromStorage(userId) {
  try {
    const raw = localStorage.getItem(SHINIES_KEY(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveShiniesToStorage(userId, shinies) {
  try {
    localStorage.setItem(SHINIES_KEY(userId), JSON.stringify(shinies))
  } catch {
    /* ignore storage errors */
  }
}

export function getShinyThreshold(streak) {
  if (streak <= 2) return 1 / 4096
  if (streak <= 6) return 1 / 1000
  if (streak <= 14) return 1 / 100
  return 1 / 20
}

export const createHabitsSlice = (set, get) => ({
  habits: [],
  habitsLoading: false,
  weather: { condition: 'Clear', typeBoost: 'Fire', icon: '☀️', color: '#ef4444' },
  caughtShinies: [],
  _shinyEncounter: null,

  loadCaughtShinies: () => {
    const userId = get().session?.user?.id
    set({ caughtShinies: loadShiniesFromStorage(userId) })
  },

  setWeather: (condition, typeBoost, icon, color) => {
    set({ weather: { condition, typeBoost, icon, color } })
  },

  clearShinyEncounter: () => set({ _shinyEncounter: null }),

  fetchHabits: async () => {
    const state = get()
    if (!state.session) return
    set({ habitsLoading: true })

    const result = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', state.session.user.id)
      .order('created_at', { ascending: true })

    if (!result.error) {
      const habits = (result.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        streak: r.streak || 0,
        lastCompleted: r.last_completed_date,
      }))
      set({ habits, habitsLoading: false })
    } else {
      set({ habitsLoading: false })
      state.pushToast?.(`Failed to load daily habits: ${result.error.message}`, 'error')
    }
  },

  updateHabitStreak: async (id, newStreak, lastCompletedDate) => {
    const state = get()
    const { error } = await supabase
      .from('daily_habits')
      .update({
        streak: newStreak,
        last_completed_date: lastCompletedDate,
      })
      .eq('id', id)

    if (error) {
      state.pushToast?.(`Failed to save habit streak: ${error.message}`, 'error')
      return
    }
    await get().fetchHabits()
  },

  addHabitToDb: async (name) => {
    const state = get()
    if (!state.session) return
    const { error } = await supabase.from('daily_habits').insert([{
      user_id: state.session.user.id,
      name,
      streak: 0,
      last_completed_date: null,
    }])

    if (error) {
      state.pushToast?.(`Failed to add habit: ${error.message}`, 'error')
      return
    }
    await get().fetchHabits()
  },

  deleteHabitFromDb: async (id) => {
    const state = get()
    const { error } = await supabase.from('daily_habits').delete().eq('id', id)
    if (error) {
      state.pushToast?.(`Failed to remove habit: ${error.message}`, 'error')
      return
    }
    await get().fetchHabits()
  },

  completeHabit: (habitId) => {
    const state = get()
    const today = new Date().toISOString().slice(0, 10)
    const habit = state.habits.find((h) => h.id === habitId)
    if (!habit) return null
    if (habit.lastCompleted && habit.lastCompleted.slice(0, 10) === today) return null

    const newStreak = (habit.streak || 0) + 1
    const lastCompletedDate = new Date().toISOString()

    /* Optimistic update */
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === habitId ? { ...h, streak: newStreak, lastCompleted: lastCompletedDate } : h
      ),
    }))

    /* Reward XP for habit check-in */
    state.addXp(20)

    if (state.session) {
      state.updateHabitStreak(habitId, newStreak, lastCompletedDate)
    }

    const threshold = getShinyThreshold(newStreak)
    const isShiny = Math.random() < threshold
    if (isShiny) {
      const shinyEntry = {
        id: generateLocalId(),
        pokemonId: Math.floor(Math.random() * 151) + 1,
        dateCaught: new Date().toISOString(),
      }
      const nextShinies = [...get().caughtShinies, shinyEntry]
      set({
        caughtShinies: nextShinies,
        _shinyEncounter: shinyEntry,
      })
      saveShiniesToStorage(state.session?.user?.id, nextShinies)
      return shinyEntry
    }

    return null
  },

  /* Local helpers retained for tests/offline compatibility */
  addHabit: (name) => {
    if (get().session) return get().addHabitToDb(name)
    set((s) => ({
      habits: [...s.habits, { id: generateLocalId(), name, streak: 0, lastCompleted: null }],
    }))
  },
  deleteHabit: (habitId) => {
    if (get().session) return get().deleteHabitFromDb(habitId)
    set((s) => ({ habits: s.habits.filter((h) => h.id !== habitId) }))
  },
})
