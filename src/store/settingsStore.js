/* Trainer Preferences, Notifications, Theme & Audio/Visual Settings Slice */
import { supabase } from '../lib/supabase'

const SETTINGS_KEY = 'pokeprod_settings_v1'

const DEFAULT_SETTINGS = {
  trainerName: 'TRAINER RED',
  starterPokemon: { id: 155, name: 'CYNDAQUIL' },
  soundEffects: true,
  music: false,
  backgroundCycle: 'Auto',
  theme: 'gen3',
  notificationsEnabled: false,
}

export function applyDocumentTheme(theme = 'gen3') {
  if (typeof document === 'undefined') return
  if (!theme || theme === 'gen3') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
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
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        trainerName: state.trainerName,
        starterPokemon: state.starterPokemon,
        soundEffects: state.soundEffects,
        music: state.music,
        backgroundCycle: state.backgroundCycle,
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
      })
    )
  } catch {
    /* ignore storage errors */
  }
}

export const createSettingsSlice = (set, get) => {
  const initial = loadLocalSettings()
  applyDocumentTheme(initial.theme)

  return {
    trainerName: initial.trainerName,
    starterPokemon: initial.starterPokemon,
    soundEffects: initial.soundEffects,
    music: initial.music,
    backgroundCycle: initial.backgroundCycle,
    theme: initial.theme,
    notificationsEnabled: initial.notificationsEnabled,

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
      if (patch.theme !== undefined) {
        applyDocumentTheme(patch.theme)
      }
      saveLocalSettings(state)

      if ((patch.starterPokemon || patch.theme !== undefined) && state.session) {
        const dbPatch = {}
        if (patch.starterPokemon) {
          dbPatch.starter_id = patch.starterPokemon.id
          dbPatch.starter_name = patch.starterPokemon.name
        }
        if (patch.theme !== undefined) {
          dbPatch.theme = patch.theme
        }
        await supabase
          .from('profiles')
          .update(dbPatch)
          .eq('id', state.session.user.id)
      }
    },
  }
}
