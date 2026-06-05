import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SCENES, getTimeOfDay } from '../scenes'

/* ── Stars (night only) ── */
function StarField() {
  const stars = useRef(
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 65,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 3,
      duration: 1.5 + Math.random() * 2,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px` }}
          animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Shooting stars */}
      <motion.div
        className="absolute top-[8%] left-0 h-px rounded-full"
        style={{ width: 80, background: 'linear-gradient(to right, transparent, white)' }}
        animate={{ x: ['-5%', '110%'], y: [0, 180], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, delay: 5, repeat: Infinity, repeatDelay: 14 }}
      />
      <motion.div
        className="absolute top-[4%] right-[30%] h-px rounded-full"
        style={{ width: 60, background: 'linear-gradient(to right, transparent, white)' }}
        animate={{ x: [0, 400], y: [0, 140], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, delay: 11, repeat: Infinity, repeatDelay: 20 }}
      />
    </div>
  )
}

/* ── Cloud drifts ── */
function Clouds({ scene }) {
  const isDay = scene === 'morning' || scene === 'afternoon'
  return (
    <>
      {[
        { top: '10%', left: '4%', delay: 0, scale: 1.1 },
        { top: '6%',  left: '32%', delay: 3, scale: 0.8 },
        { top: '16%', right: '8%', delay: 5, scale: 1.0 },
        { top: '4%',  right: '38%', delay: 1.5, scale: 0.65 },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none"
          style={c}
          animate={{ x: [0, 14, -4, 0] }}
          transition={{ duration: 22 + i * 4, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span style={{
            fontSize: `${2.2 * c.scale}rem`,
            filter: isDay ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))' : 'none',
            opacity: isDay ? 0.92 : 0.3,
          }}>☁️</span>
        </motion.div>
      ))}
    </>
  )
}

/* ── Ground layer with tree silhouettes or flowers ── */
function Ground({ scene }) {
  const data = SCENES[scene]
  const isNight = scene === 'night'
  const isEvening = scene === 'evening'

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[20%] pointer-events-none">
      <div
        className="absolute bottom-0 left-0 right-0 h-full rounded-t-[55%]"
        style={{ background: data.groundColor, opacity: isNight ? 0.45 : isEvening ? 0.4 : 0.8 }}
      />
      {(isNight || isEvening) && (
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 opacity-50">
          {['🌲','🌳','🌲','🌳','🌲','🌳','🌲','🌳','🌲'].map((t, i) => (
            <span key={i} style={{ fontSize: `${1.4 + (i % 3) * 0.4}rem`, marginBottom: '-2px' }}>{t}</span>
          ))}
        </div>
      )}
      {data.groundFlowers && (
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-6 opacity-60">
          {['🌸','🌺','🌻','🌸','🌼','🌺','🌻','🌸','🌼','🌺'].map((f, i) => (
            <span key={i} style={{ fontSize: '1.1rem', marginBottom: '-2px' }}>{f}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Real Pokémon Sprite (pixel-scaled, hoverable) ── */
function FloatingPokemon({ pokemon }) {
  const [tooltip, setTooltip] = useState(false)

  return (
    <motion.div
      className={`absolute pointer-events-auto select-none cursor-pointer ${pokemon.animClass}`}
      style={pokemon.style}
      whileHover={{ scale: 1.15 }}
      onHoverStart={() => setTooltip(true)}
      onHoverEnd={() => setTooltip(false)}
    >
      <img
        src={pokemon.src}
        alt={pokemon.name}
        className="pixel-sprite block"
        style={{
          width: 'auto',
          height: `${pokemon.scale * 24}px`,
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
        }}
        onError={e => { e.target.style.display = 'none' }}
      />
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.85 }}
            transition={{ duration: 0.12 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="g3-panel px-2 py-1 whitespace-nowrap">
              <span className="pk-label" style={{ fontSize: '0.42rem' }}>
                {pokemon.name} <span style={{ color: 'var(--g3-text-muted)' }}>{pokemon.gen}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Sun / Moon / Evening Sun ── */
function CelestialBody({ data, scene }) {
  if (!data) return null
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: data.top, right: data.right }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div style={{
        width: `${data.size}px`,
        height: `${data.size}px`,
        borderRadius: '50%',
        background: data.color,
        boxShadow: `0 0 ${data.size * 0.7}px ${data.size * 0.3}px ${data.glow}`,
      }} />
    </motion.div>
  )
}

/* ── Main Background ── */
export default function Background({ children, forcedScene }) {
  const [clockScene, setClockScene] = useState(() => getTimeOfDay())

  /* Map the backgroundCycle setting values to scene keys */
  const cycleToScene = { Morning: 'morning', Day: 'afternoon', Evening: 'evening', Night: 'night' }
  const scene = forcedScene && cycleToScene[forcedScene] ? cycleToScene[forcedScene] : clockScene

  const sceneData = SCENES[scene]

  useEffect(() => {
    const check = () => {
      const next = getTimeOfDay()
      if (next !== clockScene) setClockScene(next)
    }
    const t = setInterval(check, 60_000)
    return () => clearInterval(t)
  }, [clockScene])

  const isNight = scene === 'night'

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Sky gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          className="absolute inset-0"
          style={{ background: sceneData.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: sceneData.overlayGradient }} />

      {/* Stars */}
      <AnimatePresence>
        {isNight && (
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}>
            <StarField />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clouds */}
      {sceneData.clouds && <Clouds scene={scene} />}

      {/* Sun / Moon */}
      <CelestialBody data={sceneData.sunMoon} scene={scene} />

      {/* Evening horizon sun */}
      {sceneData.eveningSun && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: '19%', left: '50%', transform: 'translateX(-50%)' }}
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: 'radial-gradient(circle, #fef3c7, #fb923c)',
            boxShadow: '0 0 70px 35px rgba(249,115,22,0.5)',
          }} />
        </motion.div>
      )}

      {/* Ground */}
      <Ground scene={scene} />

      {/* Floating Pokémon Sprites */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene + '-pokemon'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          {sceneData.pokemon.map((p, i) => (
            <FloatingPokemon key={i} pokemon={p} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Scene badge */}
      <div className="absolute top-3 right-3 z-20">
        <motion.div
          key={scene}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="g3-panel px-2 py-1"
          style={{ boxShadow: '2px 2px 0 rgba(200,120,96,0.4)' }}
        >
          <span className="pk-label">{sceneData.timeLabel}</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}
