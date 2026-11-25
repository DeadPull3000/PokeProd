/* Authentication & Session Lifecycle Slice */
import { supabase } from '../lib/supabase'

export const createAuthSlice = (set, get) => ({
  session: null,
  user: null,
  authLoading: true,

  bootstrapUserData: () => {
    const state = get()
    state.fetchProfile()
    state.fetchTasks()
    state.fetchProjects()
    state.fetchNuzlocke()
    state.fetchSecretBase()
    state.fetchHabits()
    state.loadCaughtShinies()
  },

  checkSession: async () => {
    try {
      const result = await supabase.auth.getSession()
      const session = result.data?.session || null
      set({
        session,
        user: session ? session.user : null,
        authLoading: false,
      })
      if (session) {
        get().bootstrapUserData()
      }
    } catch {
      set({ session: null, user: null, authLoading: false })
    }
  },

  setSession: (session) => {
    const prevUserId = get().user?.id
    const nextUserId = session?.user?.id
    set({
      session,
      user: session ? session.user : null,
      authLoading: false,
    })
    if (session && prevUserId !== nextUserId) {
      get().bootstrapUserData()
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({
      session: null,
      user: null,
      totalXP: 0,
      trainerLevel: 1,
      tasks: [],
      projects: [],
      party: [],
      daycare: [],
      inventory: [],
      placedItems: [],
      habits: [],
      caughtShinies: [],
      nuzlockeLoading: false,
      secretBaseLoading: false,
      habitsLoading: false,
      projectsLoading: false,
    })
  },
})
