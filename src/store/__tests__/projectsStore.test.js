import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computeStageFromSubTasks } from '../projectsStore'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'projects') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({ data: null, error: { code: '42P01', message: 'relation "projects" does not exist' } })
              ),
            })),
          })),
        }
      }
      return {
        upsert: vi.fn(() => Promise.resolve({ error: null })),
      }
    }),
  },
}))

import { useStore } from '../index'

describe('projectsStore slice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({
      session: { user: { id: 'user-proj-1' } },
      projects: [],
      projectsCloudSynced: true,
      totalXP: 0,
      trainerLevel: 1,
      xp: { fire: 0, water: 0, grass: 0, psychic: 0, electric: 0, fairy: 0 },
      toasts: [],
    })
  })

  it('calculates evolution stage correctly from subtask completion ratio', () => {
    expect(computeStageFromSubTasks([{ completed: false }, { completed: false }, { completed: false }])).toEqual({
      stage: 0,
      completed: false,
    })
    expect(computeStageFromSubTasks([{ completed: true }, { completed: true }, { completed: false }])).toEqual({
      stage: 1,
      completed: false,
    })
    expect(computeStageFromSubTasks([{ completed: true }, { completed: true }, { completed: true }])).toEqual({
      stage: 2,
      completed: true,
    })
  })

  it('degrades gracefully to localStorage when projects table does not exist yet', async () => {
    await useStore.getState().fetchProjects()
    const state = useStore.getState()
    expect(state.projectsCloudSynced).toBe(false)
    expect(state.projects.length).toBeGreaterThan(0)
  })

  it('evolves project and awards bonus XP when final subtask completes', async () => {
    await useStore.getState().fetchProjects()
    await useStore.getState().addProject('Ship V2', 1, ['Step 1', 'Step 2'])

    const created = useStore.getState().projects[0]
    expect(created.name).toBe('Ship V2')
    expect(created.currentStage).toBe(0)

    await useStore.getState().completeSubTask(created.id, created.subTasks[0].id)
    expect(useStore.getState().projects[0].currentStage).toBe(1)

    await useStore.getState().completeSubTask(created.id, created.subTasks[1].id)
    expect(useStore.getState().projects[0].currentStage).toBe(2)
    expect(useStore.getState().projects[0].completed).toBe(true)
    expect(useStore.getState().totalXP).toBe(100)
  })
})
