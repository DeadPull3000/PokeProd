/* Save Data Export Helper (Phase 4.5) */

export function buildSaveSnapshot(state) {
  return {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    profile: {
      trainerName: state.trainerName,
      trainerLevel: state.trainerLevel,
      totalXP: state.totalXP,
      starterPokemon: state.starterPokemon,
    },
    xpByElement: state.xp,
    tasks: state.tasks,
    projects: state.projects,
    habits: state.habits,
    nuzlocke: {
      party: state.party,
      daycare: state.daycare,
    },
    secretBase: {
      inventory: state.inventory,
      placedItems: state.placedItems,
    },
    pokedexEntries: state.pokedexEntries,
    gymBadges: state.gymBadges,
    dailySnapshots: state.dailySnapshots,
    caughtShinies: state.caughtShinies,
  }
}

export function downloadSaveJson(state) {
  const snapshot = buildSaveSnapshot(state)
  const json = JSON.stringify(snapshot, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `pokeprod-save-${dateStr}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return snapshot
}
