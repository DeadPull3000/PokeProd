import { describe, it, expect } from 'vitest'
import { buildSaveSnapshot } from '../exportSave'
import { ACHIEVEMENTS } from '../../constants/gameData'

describe('exportSave & achievements', () => {
  it('builds a valid V2 save snapshot with trainer data', () => {
    const snap = buildSaveSnapshot({
      trainerName: 'RED',
      trainerLevel: 3,
      totalXP: 240,
      starterPokemon: { id: 4, name: 'CHARMANDER' },
      xp: { fire: 100 },
      tasks: [{ id: '1', task_name: 'Train' }],
      projects: [],
      habits: [],
      party: [],
      daycare: [],
      inventory: [],
      placedItems: [],
      pokedexEntries: [],
      gymBadges: [],
      dailySnapshots: [],
      caughtShinies: [],
    })

    expect(snap.version).toBe('2.0.0')
    expect(snap.profile.trainerName).toBe('RED')
    expect(snap.tasks).toHaveLength(1)
    expect(snap.exportedAt).toBeTruthy()
  })

  it('accurately evaluates meta-achievement predicates', () => {
    const state = {
      tasks: [{ is_completed: true }],
      habits: [{ streak: 7 }],
      caughtShinies: [{ id: 's1', pokemonId: 25 }],
      pokedexEntries: [{ pokemonId: 25, isShiny: true }],
      placedItems: [{ id: '1' }, { id: '2' }, { id: '3' }],
      gymBadges: [{ badgeType: 'fire' }],
      trainerLevel: 5,
      projects: [{ completed: true, currentStage: 2 }],
    }

    const unlocked = ACHIEVEMENTS.filter((a) => a.check(state)).map((a) => a.key)
    expect(unlocked).toContain('first_quest')
    expect(unlocked).toContain('on_fire')
    expect(unlocked).toContain('shiny_luck')
    expect(unlocked).toContain('homeowner')
    expect(unlocked).toContain('gym_badge')
    expect(unlocked).toContain('ace_trainer')
    expect(unlocked).toContain('evolution_master')
  })
})
