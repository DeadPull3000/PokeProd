import { useCallback } from 'react'
import { useStore } from '../store'

const CRY_BASE = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/'

/* Cache Audio objects to avoid re-creating on every hover */
const cryCache = {}

/**
 * usePokemonCry(pokemonId)
 * Returns a stable `playCry` function.
 * Call it in an onMouseEnter handler.
 * Respects the `soundEffects` setting from the global store.
 */
export function usePokemonCry(pokemonId) {
  const soundEffects = useStore(function(s) { return s.soundEffects })

  const playCry = useCallback(function() {
    if (!soundEffects) return
    if (!pokemonId)    return

    try {
      /* Reuse a cached Audio node when possible to skip network re-fetch */
      if (!cryCache[pokemonId]) {
        var audio = new Audio(CRY_BASE + pokemonId + '.ogg')
        audio.volume = 0.3
        audio.preload = 'none'
        cryCache[pokemonId] = audio
      }

      var cry = cryCache[pokemonId]
      /* If already playing, restart from the beginning */
      cry.pause()
      cry.currentTime = 0
      cry.play().catch(function() {
        /* Autoplay policy or network error — silently ignore */
      })
    } catch (err) {
      /* Silently ignore any Audio constructor errors (e.g. unsupported format) */
    }
  }, [soundEffects, pokemonId])

  return playCry
}
