/* Journey Quick Quests (Tasks) Slice — Supabase Backed */
import { supabase } from '../lib/supabase'
import { generateLocalId } from '../constants/gameData'

export const createTasksSlice = (set, get) => ({
  tasks: [],
  tasksLoading: false,
  tasksError: null,

  fetchTasks: async () => {
    const state = get()
    if (!state.session) return
    set({ tasksLoading: true, tasksError: null })
    const result = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', state.session.user.id)
      .order('created_at', { ascending: false })

    if (result.error) {
      set({ tasksLoading: false, tasksError: result.error.message })
    } else {
      set({ tasks: result.data || [], tasksLoading: false })
    }
  },

  addTask: async (text, element) => {
    const state = get()
    if (!state.session) {
      const localTask = {
        id: generateLocalId(),
        task_name: text,
        element_type: element,
        is_completed: false,
        created_at: new Date().toISOString(),
      }
      set((s) => ({ tasks: [localTask, ...s.tasks] }))
      return
    }

    const userId = state.session.user.id
    const { error } = await supabase.from('tasks').insert([{
      user_id: userId,
      task_name: text,
      element_type: element,
      is_completed: false,
    }])

    if (error) {
      state.pushToast?.(`Failed to save quest: ${error.message}`, 'error')
      return
    }
    state.pushToast?.('Quest added to Journey!', 'success', 2000)
    await get().fetchTasks()
  },

  toggleTaskCompletion: async (id) => {
    const state = get()
    const task = state.tasks.find((t) => t.id === id)
    if (!task || task.is_completed || task.completed) return

    const element = task.element_type || task.element || 'fire'
    const xpGain = element === 'electric' ? 15 : element === 'psychic' ? 50 : 30

    /* Optimistic local update for responsive feedback */
    state.incrementCompletedToday()
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, is_completed: true, completed: true } : t)),
    }))
    state.gainXP(element, xpGain)
    state.recordDailyActivity?.({ tasksDelta: 1 })
    state.strikeDailyBoss?.(element)

    if (state.session) {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: true })
        .eq('id', id)
      if (error) {
        state.pushToast?.(`Could not sync quest completion: ${error.message}`, 'error')
      }
      await get().fetchTasks()
    }
  },

  /* Legacy alias kept for compatibility */
  completeTask: function (id) {
    return get().toggleTaskCompletion(id)
  },

  deleteTask: async (id) => {
    const state = get()
    const prevTasks = state.tasks
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))

    if (state.session) {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) {
        set({ tasks: prevTasks })
        state.pushToast?.(`Failed to delete quest: ${error.message}`, 'error')
      }
    }
  },
})
