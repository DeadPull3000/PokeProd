/* Trainer Preferences & Audio/Visual Settings Slice */
import { supabase } from '../lib/supabase'

const SETTINGS_KEY = 'pokeprod_settings_v1'

const DEFAULT_SETTINGS = {
  trainerName: 'TRAINER RED',
  starterPokemon: { id: 155, name: 'CYNDAQUIL' },
  soundEffects: true,
  music: false,
  backgroundCycle: 'Auto',
}

function loadLocalSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveLocalSettings(state) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      trainerName: state.trainerName,
      starterPokemon: state.starterPokemon,
      soundEffects: state.soundEffects,
      music: state.music,
      backgroundCycle: state.backgroundCycle,
    }))
  } catch {
    /* ignore storage errors */
  }
}

export const createSettingsSlice = (set, get) => {
  const initial = loadLocalSettings()

  return {
    trainerName: initial.trainerName,
    starterPokemon: initial.starterPokemon,
    soundEffects: initial.soundEffects,
    music: initial.music,
    backgroundCycle: initial.backgroundCycle,

    setTrainerName: (name) => {
      const normalized = (name || '').toUpperCase()
      set({ trainerName: normalized })
      saveLocalSettings(get())
    },

    persistTrainerProfile: async () => {
      const state = get()
      if (!state.session) return
      await supabase
        .from('profiles')
        .update({ username: state.trainerName || 'TRAINER RED' })
        .eq('id', state.session.user.id)
    },

    updateSettings: async (patch) => {
      set(patch)
      const state = get()
      saveLocalSettings(state)

      if (patch.starterPokemon && state.session) {
        await supabase
          .from('profiles')
          .update({
            starter_id: patch.starterPokemon.id,
            starter_name: patch.starterPokemon.name,
          })
          .eq('id', state.session.user.id)
      }
    },
  }
}
