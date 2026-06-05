import React from 'react'
import { motion } from 'framer-motion'
import { TILE_SIZE, GRID_DEF, ROUTE_PATH, FLOWERS } from '../routeData'

/* ── Pixel-art player sprite (SVG — Red trainer) ── */
function PlayerSprite({ tileSize }) {
  const s = tileSize * 0.9
  return (
    <svg
      width={s} height={s * 1.4}
      viewBox="0 0 10 14"
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {/* Hat brim */}
      <rect x="1" y="2" width="8" height="1" fill="#C82020" />
      {/* Hat top */}
      <rect x="2" y="0" width="6" height="2" fill="#C82020" />
      {/* Hat button */}
      <rect x="4" y="0" width="2" height="1" fill="#F8F8F8" />
      {/* Hair (dark, sides) */}
      <rect x="1" y="3" width="2" height="1" fill="#302010" />
      <rect x="7" y="3" width="2" height="1" fill="#302010" />
      {/* Face */}
      <rect x="2" y="3" width="6" height="2" fill="#F0C880" />
      {/* Eyes */}
      <rect x="3" y="4" width="1" height="1" fill="#282818" />
      <rect x="6" y="4" width="1" height="1" fill="#282818" />
      {/* Jacket */}
      <rect x="1" y="5" width="8" height="3" fill="#4858C8" />
      {/* Bag */}
      <rect x="7" y="6" width="3" height="2" fill="#C84040" />
      {/* Pants */}
      <rect x="2" y="8" width="6" height="3" fill="#2848A8" />
      {/* Shoes */}
      <rect x="2" y="11" width="2" height="2" fill="#282018" />
      <rect x="6" y="11" width="2" height="2" fill="#282018" />
    </svg>
  )
}

/* ── Tile renderer ── */
function MapTile({ type, col, row }) {
  const isFlower = FLOWERS.has(`${row}-${col}`)

  if (type === 'T') {
    return (
      <div style={{
        width: TILE_SIZE, height: TILE_SIZE,
        background: '#285820',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: '10%', right: '10%', height: '65%',
          background: '#48A830',
          borderRadius: '2px 2px 0 0',
        }} />
      </div>
    )
  }

  const bgColor = {
    G: '#78C858',
    W: '#50A038',
    P: '#C8A858',
    F: '#78C858',
    S: '#C8A858',
  }[type] ?? '#78C858'

  const stripes = type === 'W'
    ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 4px)'
    : undefined

  const pathShading = type === 'P'
    ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 2px, transparent 2px, transparent 5px)'
    : undefined

  return (
    <div style={{
      width: TILE_SIZE,
      height: TILE_SIZE,
      background: bgColor,
      backgroundImage: stripes || pathShading,
      position: 'relative',
    }}>
      {isFlower && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${TILE_SIZE * 0.55}px`,
          lineHeight: 1,
          pointerEvents: 'none',
        }}>
          🌸
        </div>
      )}
    </div>
  )
}

/* ── Main RouteMap component ── */
export default function RouteMap({ completedCount }) {
  const GRID_COLS = 12
  const GRID_ROWS = 9

  const clampedIdx = Math.min(completedCount, ROUTE_PATH.length - 1)
  const [playerCol, playerRow] = ROUTE_PATH[clampedIdx]
  const playerX = playerCol * TILE_SIZE
  const playerY = playerRow * TILE_SIZE - Math.floor(TILE_SIZE * 0.3)

  const atGoal = completedCount >= ROUTE_PATH.length - 1

  return (
    <div style={{ position: 'relative', display: 'inline-block', userSelect: 'none' }}>
      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, ${TILE_SIZE}px)`,
        gap: 0,
        outline: '2px solid #285820',
      }}>
        {GRID_DEF.map((row, r) =>
          row.split('').map((tile, c) => (
            <MapTile key={`${r}-${c}`} type={tile} col={c} row={r} />
          ))
        )}
      </div>

      {/* Goal flag */}
      <div style={{
        position: 'absolute',
        left: 11 * TILE_SIZE,
        top: 6 * TILE_SIZE - TILE_SIZE,
        zIndex: 5,
        pointerEvents: 'none',
        lineHeight: 1,
        fontSize: TILE_SIZE * 0.9,
      }}>
        {atGoal ? '🏆' : '🚩'}
      </div>

      {/* START label */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 6 * TILE_SIZE + TILE_SIZE + 2,
        width: TILE_SIZE * 3,
        textAlign: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.32rem',
        color: '#285820',
        letterSpacing: '-0.2px',
      }}>
        START
      </div>

      {/* GOAL label */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 6 * TILE_SIZE + TILE_SIZE + 2,
        width: TILE_SIZE * 3,
        textAlign: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.32rem',
        color: '#285820',
        letterSpacing: '-0.2px',
      }}>
        GOAL
      </div>

      {/* Animated Player Sprite — smooth position + idle bob */}
      <motion.div
        style={{ position: 'absolute', left: playerX, top: playerY, zIndex: 10 }}
        animate={{ left: playerX, top: playerY }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      >
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PlayerSprite tileSize={TILE_SIZE} />
        </motion.div>
      </motion.div>

      {/* Completion message */}
      {atGoal && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            bottom: -26,
            left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.38rem',
            color: '#285820',
            letterSpacing: '-0.2px',
          }}
        >
          ⭐ PALLET TOWN REACHED! ⭐
        </motion.div>
      )}
    </div>
  )
}
