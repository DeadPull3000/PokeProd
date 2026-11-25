import { usePokemonCry } from '../../hooks/usePokemonCry'
import { animSprite, staticSprite, animBack, staticBack } from '../../constants/gameData'

/**
 * Pixelated Pokemon sprite with automatic static PNG fallback and optional hover cry.
 */
export function SpriteImage({
  pokemonId,
  alt,
  back = false,
  enableCry = false,
  size = 48,
  style,
  className = '',
  srcOverride,
  fallbackOverride,
  ...rest
}) {
  const playCry = usePokemonCry(enableCry ? pokemonId : null)
  const primarySrc =
    srcOverride || (back ? animBack(pokemonId) : animSprite(pokemonId))
  const fallbackSrc =
    fallbackOverride || (back ? staticBack(pokemonId) : staticSprite(pokemonId))

  return (
    <img
      src={primarySrc}
      alt={alt || `Pokémon #${pokemonId}`}
      className={`pixel-sprite ${className}`.trim()}
      onMouseEnter={enableCry ? playCry : undefined}
      onError={(e) => {
        if (e.currentTarget.dataset.fallbackApplied) return
        e.currentTarget.dataset.fallbackApplied = '1'
        e.currentTarget.src = fallbackSrc
      }}
      style={{
        height: size,
        width: 'auto',
        imageRendering: 'pixelated',
        cursor: enableCry ? 'pointer' : undefined,
        ...style,
      }}
      {...rest}
    />
  )
}
