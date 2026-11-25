import { useCallback } from 'react'
import { useStore } from '../store'
import { CRY_BASE } from '../constants/gameData'

const cryCache = {}

/**
 * Play a cached Pokemon cry directly from an event handler.
 */
export function playPokemonCry(pokemonId) {
  if (!pokemonId) return
  if (!useStore.getState().soundEffects) return

  try {
    if (!cryCache[pokemonId]) {
      const audio = new Audio(`${CRY_BASE}${pokemonId}.ogg`)
      audio.volume = 0.3
      audio.preload = 'none'
      cryCache[pokemonId] = audio
    }

    const cry = cryCache[pokemonId]
    cry.pause()
    cry.currentTime = 0
    cry.play().catch(() => {
      /* Autoplay policy or network error — silently ignore */
    })
  } catch {
    /* Silently ignore Audio constructor errors */
  }
}

/**
 * usePokemonCry(pokemonId)
 * Returns a stable `playCry` handler respecting `soundEffects`.
 */
export function usePokemonCry(pokemonId) {
  const soundEffects = useStore((s) => s.soundEffects)

  return useCallback(() => {
    if (!soundEffects || !pokemonId) return
    playPokemonCry(pokemonId)
  }, [soundEffects, pokemonId])
}
