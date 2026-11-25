/* Co-op Raid Hub Energy & Local Fallback Slice */

export const createRaidSlice = (set) => ({
  raidBoss: {
    id: 'boss-1',
    name: 'Giant Slaking of Sloth',
    maxHp: 10000,
    currentHp: 10000,
    spriteId: 289,
  },
  raidEnergy: 500,
  raidLog: ['The raid has begun!', 'Co-op trainers are joining...'],

  raidAttack: () => {
    set((state) => {
      if (state.raidEnergy < 100) return state
      if (state.raidBoss.currentHp <= 0) return state
      const newHp = Math.max(0, state.raidBoss.currentHp - 500)
      const msg = 'YOU unleashed a massive attack for 500 damage!'
      const newLog = [msg, ...state.raidLog].slice(0, 6)
      return {
        raidBoss: { ...state.raidBoss, currentHp: newHp },
        raidEnergy: state.raidEnergy - 100,
        raidLog: newLog,
      }
    })
  },

  raidTick: (trainerName, damage) => {
    set((state) => {
      if (state.raidBoss.currentHp <= 0) return state
      const newHp = Math.max(0, state.raidBoss.currentHp - damage)
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const msg = `[${time}] ${trainerName} dealt ${damage} damage!`
      return {
        raidBoss: { ...state.raidBoss, currentHp: newHp },
        raidLog: [msg, ...state.raidLog].slice(0, 6),
      }
    })
  },

  raidReset: () => {
    set((state) => ({
      raidBoss: { ...state.raidBoss, currentHp: state.raidBoss.maxHp },
      raidEnergy: 500,
      raidLog: ['A new raid has started!', 'Trainers are assembling...'],
    }))
  },
})
