import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 400, height: 200 }}>{children}</div>
    ),
  }
})

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}))

import StatsTab from '../StatsTab'
import { useStore } from '../../store'

describe('StatsTab component', () => {
  beforeEach(() => {
    useStore.setState({
      session: null,
      tasks: [{ id: 't1', task_name: 'Done quest', is_completed: true }],
      habits: [{ id: 'h1', name: 'Read', streak: 8 }],
      gymBadges: [{ badgeType: 'fire', earnedAt: new Date().toISOString() }],
      pokedexEntries: [{ id: '1', pokemonId: 25, isShiny: true }],
      caughtShinies: [{ id: 's1', pokemonId: 25 }],
      xp: { fire: 120, water: 80, grass: 60, psychic: 90, electric: 40, fairy: 20 },
      totalXP: 410,
      trainerLevel: 5,
      completedToday: 1,
      projects: [{ id: 'p1', completed: true, currentStage: 2, subTasks: [] }],
      placedItems: [{ id: '1' }, { id: '2' }, { id: '3' }],
      dailySnapshots: [{ date: new Date().toISOString().slice(0, 10), tasksCompleted: 2, totalXp: 410, habitsCompleted: 1 }],
      statsCloudSynced: true,
    })
  })

  it('renders KPIs, 30-day heatmap, and unlocked Achievements', () => {
    render(<StatsTab />)
    expect(screen.getByText('Lv.5')).toBeInTheDocument()
    expect(screen.getByText('8d 🔥')).toBeInTheDocument()
    expect(screen.getByText('1/8 🏅')).toBeInTheDocument()
    expect(screen.getByText('TRAINER ACHIEVEMENTS (7/8)')).toBeInTheDocument()
  })
})
