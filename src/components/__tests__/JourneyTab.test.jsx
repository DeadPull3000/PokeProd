import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockFetchOrder = vi.fn(() =>
  Promise.resolve({
    data: [{ id: 't1', task_name: 'Stretch for 10 mins', element_type: 'fire', is_completed: false }],
    error: null,
  })
)

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === 'projects') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        }
      }
      return {
        select: vi.fn(() => ({ eq: vi.fn(() => ({ order: mockFetchOrder })) })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
        delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
        upsert: vi.fn(() => Promise.resolve({ error: null })),
      }
    }),
  },
}))

import JourneyTab from '../JourneyTab'
import { useStore } from '../../store'

describe('JourneyTab component', () => {
  beforeEach(() => {
    useStore.setState({
      session: { user: { id: 'user-1', email: 'red@kanto.jp' } },
      tasks: [],
      tasksLoading: false,
      tasksError: null,
      projects: [],
      projectsLoading: false,
      projectsCloudSynced: true,
      completedToday: 0,
      totalXP: 0,
      trainerLevel: 1,
      xp: { fire: 0, water: 0, grass: 0, psychic: 0, electric: 0, fairy: 0 },
      toasts: [],
    })
  })

  it('loads cloud quests and completes a cloud task without crashing XPOrb', async () => {
    render(<JourneyTab />)

    await waitFor(() => {
      expect(screen.getByText('Stretch for 10 mins')).toBeInTheDocument()
    })

    const completeBtn = screen.getByRole('button', { name: /Complete quest Stretch for 10 mins/i })
    fireEvent.click(completeBtn)

    await waitFor(() => {
      expect(screen.getByText('+XP!')).toBeInTheDocument()
    })
    expect(useStore.getState().totalXP).toBe(30)
  })
})
