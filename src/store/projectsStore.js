/* Cloud-Synced Evolution Projects Slice (Phase 2.4 / Sprint 1) */
import { supabase } from '../lib/supabase'
import { EVOLUTION_LINES, generateLocalId } from '../constants/gameData'

const FALLBACK_KEY = (userId) => `pokeprod_projects_v1_${userId || 'local'}`

const DEFAULT_SAMPLE_PROJECT = {
  id: 'sample-react-proj',
  name: 'Learn React',
  evoLineId: 0,
  currentStage: 0,
  completed: false,
  createdAt: Date.now(),
  subTasks: [
    { id: 'st-1', text: 'Complete hooks tutorial', completed: false },
    { id: 'st-2', text: 'Build first component', completed: false },
    { id: 'st-3', text: 'Deploy to production', completed: false },
  ],
}

function loadLocalProjects(userId) {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY(userId))
    if (!raw) return [DEFAULT_SAMPLE_PROJECT]
    return JSON.parse(raw)
  } catch {
    return [DEFAULT_SAMPLE_PROJECT]
  }
}

function saveLocalProjects(userId, projects) {
  try {
    localStorage.setItem(FALLBACK_KEY(userId), JSON.stringify(projects))
  } catch {
    /* ignore storage quota errors */
  }
}

function isMissingTableError(err) {
  if (!err) return false
  const msg = (err.message || '').toLowerCase()
  return (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  )
}

function mapCloudProject(row) {
  const subs = (row.project_subtasks || [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((st) => ({
      id: st.id,
      text: st.text,
      completed: Boolean(st.is_completed),
    }))
  return {
    id: row.id,
    name: row.name,
    evoLineId: row.evo_line_id ?? 0,
    currentStage: row.current_stage ?? 0,
    completed: Boolean(row.is_completed),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    subTasks: subs,
  }
}

export function computeStageFromSubTasks(subTasks) {
  const done = subTasks.filter((st) => st.completed).length
  const total = subTasks.length
  const pct = total > 0 ? done / total : 0
  const stage = pct >= 1 ? 2 : pct > 0.33 ? 1 : 0
  return { stage, completed: pct >= 1 }
}

export const createProjectsSlice = (set, get) => ({
  projects: [],
  projectsLoading: false,
  projectsError: null,
  projectsCloudSynced: true,

  fetchProjects: async () => {
    const state = get()
    if (!state.session) return
    const userId = state.session.user.id
    set({ projectsLoading: true, projectsError: null })

    const result = await supabase
      .from('projects')
      .select('*, project_subtasks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (result.error) {
      if (isMissingTableError(result.error)) {
        /* Graceful fallback until 001_v2_foundation_and_rls.sql is applied */
        set({
          projects: loadLocalProjects(userId),
          projectsLoading: false,
          projectsCloudSynced: false,
        })
      } else {
        set({
          projectsLoading: false,
          projectsError: result.error.message,
        })
      }
      return
    }

    set({
      projects: (result.data || []).map(mapCloudProject),
      projectsLoading: false,
      projectsCloudSynced: true,
    })
  },

  addProject: async (name, evoLineId, subTaskTexts) => {
    const state = get()
    const cleanSubTasks = subTaskTexts.filter((t) => t.trim()).map((t) => t.trim())
    if (!cleanSubTasks.length) return

    const userId = state.session?.user?.id

    if (!state.session || !state.projectsCloudSynced) {
      const localProject = {
        id: generateLocalId(),
        name,
        evoLineId,
        currentStage: 0,
        completed: false,
        createdAt: Date.now(),
        subTasks: cleanSubTasks.map((text) => ({
          id: generateLocalId(),
          text,
          completed: false,
        })),
      }
      const next = [localProject, ...state.projects]
      set({ projects: next })
      saveLocalProjects(userId, next)
      state.pushToast?.('Project created!', 'success', 2000)
      return
    }

    const projRes = await supabase
      .from('projects')
      .insert([{
        user_id: userId,
        name,
        evo_line_id: evoLineId,
        current_stage: 0,
        is_completed: false,
      }])
      .select('*')
      .single()

    if (projRes.error || !projRes.data) {
      state.pushToast?.(`Failed to save project: ${projRes.error?.message || 'Unknown error'}`, 'error')
      return
    }

    const subtaskRows = cleanSubTasks.map((text, idx) => ({
      project_id: projRes.data.id,
      user_id: userId,
      text,
      is_completed: false,
      sort_order: idx,
    }))

    const subRes = await supabase.from('project_subtasks').insert(subtaskRows)
    if (subRes.error) {
      state.pushToast?.(`Project created, but sub-tasks failed: ${subRes.error.message}`, 'error')
    } else {
      state.pushToast?.('Evolution project started!', 'success', 2200)
    }
    await get().fetchProjects()
  },

  completeSubTask: async (projectId, subTaskId) => {
    const state = get()
    const proj = state.projects.find((p) => p.id === projectId)
    if (!proj) return
    const targetSub = proj.subTasks.find((st) => st.id === subTaskId)
    if (!targetSub || targetSub.completed) return

    const newSubTasks = proj.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, completed: true } : st
    )
    const { stage, completed } = computeStageFromSubTasks(newSubTasks)
    const evolved = stage > proj.currentStage

    /* Optimistic UI update */
    const nextProjects = state.projects.map((p) =>
      p.id === projectId
        ? { ...p, subTasks: newSubTasks, currentStage: stage, completed }
        : p
    )
    set({ projects: nextProjects })

    /* Award XP (+25 per subtask, +50 bonus on final evolution) */
    state.gainXP('grass', completed ? 75 : 25)
    state.recordDailyActivity?.({ tasksDelta: 1 })
    if (evolved) {
      state.pushToast?.(`What?! ${proj.name} is evolving!`, 'success', 3500)
      const evoMon = EVOLUTION_LINES[proj.evoLineId]?.stages[stage]
      if (evoMon?.id) {
        state.registerPokemon?.(evoMon.id, false, 'project')
      }
    }

    const userId = state.session?.user?.id
    if (!state.session || !state.projectsCloudSynced) {
      saveLocalProjects(userId, nextProjects)
      return
    }

    const subUpdate = await supabase
      .from('project_subtasks')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', subTaskId)

    const projUpdate = await supabase
      .from('projects')
      .update({ current_stage: stage, is_completed: completed })
      .eq('id', projectId)

    if (subUpdate.error || projUpdate.error) {
      state.pushToast?.('Could not sync project progress to cloud', 'error')
    }
  },

  deleteProject: async (id) => {
    const state = get()
    const prev = state.projects
    const next = prev.filter((p) => p.id !== id)
    set({ projects: next })

    const userId = state.session?.user?.id
    if (!state.session || !state.projectsCloudSynced) {
      saveLocalProjects(userId, next)
      return
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      set({ projects: prev })
      state.pushToast?.(`Failed to delete project: ${error.message}`, 'error')
    }
  },
})
