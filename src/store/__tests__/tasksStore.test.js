import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockOrder = vi.fn(() =>
  Promise.resolve({
    data: [{ id: 't1', task_name: 'Morning Run', element_type: 'fire', is_completed: false }],
    error: null,
  })
)
const mockInsert = vi.fn(() => Promise.resolve({ error: null }))
const mockUpdateEq = vi.fn(() => Promise.resolve({ error: null }))
const mockDeleteEq = vi.fn(() => Promise.resolve({ error: null }))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: mockOrder })) })),
      insert: mockInsert,
      update: vi.fn(() => ({ eq: mockUpdateEq })),
      delete: vi.fn(() => ({ eq: mockDeleteEq })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}))

import { useStore } from '../index'

describe('tasksStore slice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useStore.setState({
      session: { user: { id: 'user-1', email: 'ash@pallet.com' } },
      tasks: [],
      tasksLoading: false,
      tasksError: null,
      totalXP: 0,
      trainerLevel: 1,
      completedToday: 0,
      xp: { fire: 0, water: 0, grass: 0, psychic: 0, electric: 0, fairy: 0 },
      toasts: [],
    })
  })

  it('fetches tasks ordered from Supabase', async () => {
    await useStore.getState().fetchTasks()
    expect(useStore.getState().tasks).toHaveLength(1)
    expect(useStore.getState().tasks[0].task_name).toBe('Morning Run')
  })

  it('inserts a task with user_id and refreshes tasks', async () => {
    await useStore.getState().addTask('Practice Scales', 'psychic')
    expect(mockInsert).toHaveBeenCalledWith([
      {
        user_id: 'user-1',
        task_name: 'Practice Scales',
        element_type: 'psychic',
        is_completed: false,
      },
    ])
    expect(mockOrder).toHaveBeenCalled()
  })

  it('completes a task, awards element + total XP, updates route progress, and syncs DB', async () => {
    useStore.setState({
      tasks: [{ id: 't1', task_name: 'Morning Run', element_type: 'psychic', is_completed: false }],
    })
    await useStore.getState().toggleTaskCompletion('t1')

    expect(useStore.getState().xp.psychic).toBe(50)
    expect(useStore.getState().totalXP).toBe(50)
    expect(useStore.getState().completedToday).toBe(1)
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 't1')
  })

  it('deletes a task locally and in Supabase', async () => {
    useStore.setState({
      tasks: [{ id: 't1', task_name: 'Morning Run', element_type: 'fire', is_completed: false }],
    })
    await useStore.getState().deleteTask('t1')
    expect(useStore.getState().tasks).toHaveLength(0)
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 't1')
  })
})
