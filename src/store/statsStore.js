/* Daily Activity Snapshots & Analytics Slice (Phase 2.3) */
import { supabase } from '../lib/supabase'

const STORAGE_KEY = (userId) => `pokeprod_snapshots_v1_${userId || 'local'}`
const todayStr = () => new Date().toISOString().slice(0, 10)

function loadLocalSnapshots(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalSnapshots(userId, snaps) {
  try {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(snaps))
  } catch {
    /* ignore storage errors */
  }
}

function isMissingTable(err) {
  if (!err) return false
  const msg = (err.message || '').toLowerCase()
  return err.code === '42P01' || err.code === 'PGRST205' || msg.includes('does not exist') || msg.includes('schema cache')
}

export const createStatsSlice = (set, get) => ({
  dailySnapshots: [],
  statsLoading: false,
  statsCloudSynced: true,

  fetchSnapshots: async () => {
    const state = get()
    const userId = state.session?.user?.id
    if (!userId) {
      set({ dailySnapshots: loadLocalSnapshots('local'), statsLoading: false })
      return
    }

    set({ statsLoading: true })
    const res = await supabase
      .from('daily_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .limit(90)

    if (res.error) {
      if (isMissingTable(res.error)) {
        set({
          dailySnapshots: loadLocalSnapshots(userId),
          statsLoading: false,
          statsCloudSynced: false,
        })
      } else {
        set({ statsLoading: false })
      }
      return
    }

    const mapped = (res.data || []).map((r) => ({
      date: r.date,
      tasksCompleted: r.tasks_completed || 0,
      totalXp: r.total_xp || 0,
      habitsCompleted: r.habits_completed || 0,
    }))
    saveLocalSnapshots(userId, mapped)
    set({ dailySnapshots: mapped, statsLoading: false, statsCloudSynced: true })
  },

  recordDailyActivity: async ({ tasksDelta = 0, habitsDelta = 0 } = {}) => {
    const state = get()
    const userId = state.session?.user?.id
    const today = todayStr()

    const existing = state.dailySnapshots.find((s) => s.date === today)
    const updatedRow = {
      date: today,
      tasksCompleted: (existing?.tasksCompleted || 0) + tasksDelta,
      habitsCompleted: (existing?.habitsCompleted || 0) + habitsDelta,
      totalXp: state.totalXP || 0,
    }

    const next = existing
      ? state.dailySnapshots.map((s) => (s.date === today ? updatedRow : s))
      : [...state.dailySnapshots, updatedRow].slice(-90)

    set({ dailySnapshots: next })
    saveLocalSnapshots(userId, next)

    if (userId && state.statsCloudSynced) {
      await supabase
        .from('daily_snapshots')
        .upsert(
          {
            user_id: userId,
            date: today,
            tasks_completed: updatedRow.tasksCompleted,
            habits_completed: updatedRow.habitsCompleted,
            total_xp: updatedRow.totalXp,
          },
          { onConflict: 'user_id,date' }
        )
    }
  },
})
