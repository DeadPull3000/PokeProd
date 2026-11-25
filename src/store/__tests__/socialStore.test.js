import { describe, it, expect, beforeEach, vi } from 'vitest'
import { deriveFriendCode } from '../socialStore'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: null, error: { code: '42P01' } })) })),
        })),
        or: vi.fn(() => Promise.resolve({ data: null, error: { code: '42P01' } })),
      })),
    })),
  },
}))

import { useStore } from '../index'

describe('socialStore slice', () => {
  beforeEach(() => {
    useStore.setState({
      session: null,
      trainerName: 'HERO',
      totalXP: 500,
      trainerLevel: 6,
      starterPokemon: { id: 155, name: 'CYNDAQUIL' },
      duels: [],
      friends: [],
      leaderboard: [],
      cardPacks: 0,
      socialCloudSynced: true,
      toasts: [],
    })
  })

  it('derives deterministic 8-char friend codes', () => {
    const code1 = deriveFriendCode('user-abc-123')
    const code2 = deriveFriendCode('user-abc-123')
    const code3 = deriveFriendCode('user-xyz-999')
    expect(code1).toMatch(/^PK[A-Z0-9]{6}$/)
    expect(code1).toBe(code2)
    expect(code1).not.toBe(code3)
  })

  it('builds sorted League leaderboard ranking user against Champions', async () => {
    await useStore.getState().fetchSocialData()
    const board = useStore.getState().leaderboard
    const you = board.find((e) => e.isYou)
    expect(you).toBeTruthy()
    expect(you.xp).toBe(500)
    expect(board[0].xp).toBeGreaterThanOrEqual(board[1].xp)
  })

  it('starts a Rival Duel, advances on quest completion, and awards victory rewards', async () => {
    await useStore.getState().startDuel({
      opponentId: 'rival-blue',
      opponentName: 'RIVAL BLUE',
      goalTasks: 2,
    })
    expect(useStore.getState().duels).toHaveLength(1)

    await useStore.getState().advanceActiveDuels(1)
    expect(useStore.getState().duels[0].status).toBe('active')

    await useStore.getState().advanceActiveDuels(1)
    expect(useStore.getState().duels[0].status).toBe('completed')
    expect(useStore.getState().totalXP).toBe(650)
    /* +1 pack for Duel win +1 pack for leveling Lv.6 -> Lv.7 */
    expect(useStore.getState().cardPacks).toBe(2)
  })
})
