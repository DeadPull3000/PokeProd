/* Nuzlocke Party & Daycare Slice — Supabase Backed */
import { supabase } from '../lib/supabase'
import { generateLocalId } from '../constants/gameData'

export const createNuzlockeSlice = (set, get) => ({
  party: [],
  daycare: [],
  nuzlockeLoading: false,

  fetchNuzlocke: async () => {
    const state = get()
    if (!state.session) return
    set({ nuzlockeLoading: true })

    const result = await supabase
      .from('nuzlocke_party')
      .select('*')
      .eq('user_id', state.session.user.id)
      .order('created_at', { ascending: true })

    if (!result.error) {
      const rows = result.data || []
      const party = rows
        .filter((r) => r.location === 'party')
        .map((r) => ({
          id: r.id,
          taskName: r.task_name,
          pokemonId: r.pokemon_id,
          deadline: r.deadline,
          status: r.status,
        }))
      const daycare = rows
        .filter((r) => r.location === 'daycare')
        .map((r) => ({
          id: r.id,
          taskName: r.task_name,
        }))
      set({ party, daycare, nuzlockeLoading: false })
    } else {
      set({ nuzlockeLoading: false })
      state.pushToast?.(`Failed to load Nuzlocke party: ${result.error.message}`, 'error')
    }
  },

  addNuzlockeTask: async (taskName, pokemonId, deadline, location) => {
    const state = get()
    if (!state.session) return
    const { error } = await supabase.from('nuzlocke_party').insert([{
      user_id: state.session.user.id,
      task_name: taskName,
      pokemon_id: pokemonId || null,
      deadline: deadline || null,
      status: location === 'party' ? 'active' : null,
      location: location || 'daycare',
    }])

    if (error) {
      state.pushToast?.(`Failed to save Nuzlocke task: ${error.message}`, 'error')
      return
    }
    await get().fetchNuzlocke()
  },

  updateNuzlockeStatus: async (id, status) => {
    const state = get()
    const { error } = await supabase
      .from('nuzlocke_party')
      .update({ status })
      .eq('id', id)

    if (error) {
      state.pushToast?.(`Failed to update Nuzlocke status: ${error.message}`, 'error')
      return
    }

    if (status === 'completed') {
      state.addXp(100)
    }
    await get().fetchNuzlocke()
  },

  deleteNuzlockeItem: async (id) => {
    const state = get()
    const { error } = await supabase.from('nuzlocke_party').delete().eq('id', id)
    if (error) {
      state.pushToast?.(`Failed to delete item: ${error.message}`, 'error')
      return
    }
    await get().fetchNuzlocke()
  },

  checkFaintedTasks: async () => {
    const state = get()
    const now = Date.now()
    const newlyFainted = state.party.filter(
      (p) => p.status === 'active' && p.deadline && new Date(p.deadline).getTime() < now
    )
    if (newlyFainted.length === 0) return

    set((s) => ({
      party: s.party.map((p) =>
        p.status === 'active' && p.deadline && new Date(p.deadline).getTime() < now
          ? { ...p, status: 'fainted' }
          : p
      ),
    }))

    if (state.session) {
      await Promise.all(
        newlyFainted.map((p) =>
          supabase.from('nuzlocke_party').update({ status: 'fainted' }).eq('id', p.id)
        )
      )
    }
  },

  /* Legacy local helpers retained for compatibility */
  addToParty: (taskName, pokemonId, deadline) => {
    set((state) => {
      if (state.party.length >= 6) return state
      return {
        party: [...state.party, { id: generateLocalId(), taskName, pokemonId, deadline, status: 'active' }],
      }
    })
  },
  completePartyTask: (id) => get().updateNuzlockeStatus(id, 'completed'),
  removeFromParty: (id) => get().deleteNuzlockeItem(id),
  addToDaycare: (taskName) => get().addNuzlockeTask(taskName, null, null, 'daycare'),
  deleteDaycare: (id) => get().deleteNuzlockeItem(id),
})
