import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { animSprite, animBack } from '../scenes'

/* ── Sprite URLs ── */
const SPRITE = animSprite
const BACK   = animBack
const ITEMS  = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'
const SAFARI_BALL_URL  = `${ITEMS}/safari-ball.png`
const POKE_BALL_URL    = `${ITEMS}/poke-ball.png`

/* ── Wild Pokémon session configs ── */
const SESSIONS = [
  {
    minutes: 10,
    pokemon: { id: 63,  name: 'ABRA',     level: 10 },
    introLines: ['Wild ABRA appeared!', 'It looks distracted...'],
  },
  {
    minutes: 25,
    pokemon: { id: 64,  name: 'KADABRA',  level: 25 },
    introLines: ['Wild KADABRA appeared!', 'Its spoon shimmers with psychic energy...'],
  },
  {
    minutes: 45,
    pokemon: { id: 65,  name: 'ALAKAZAM', level: 45 },
    introLines: ['Wild ALAKAZAM appeared!', 'It emanates incredible focus...'],
  },
  {
    minutes: 60,
    pokemon: { id: 518, name: 'MUSHARNA',  level: 60 },
    introLines: ['Wild MUSHARNA appeared!', 'A Dream Mist drifts peacefully by...'],
  },
]

/* ── Typewriter hook ── */
function useTypewriter(text, speed = 32) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    if (!text) return
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])
  return displayed
}

/* ── HP bar color based on % ── */
function hpColor(pct) {
  if (pct > 0.5) return 'hp-green'
  if (pct > 0.25) return 'hp-yellow'
  return 'hp-red'
}

/* ── Format mm:ss ── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ── Enemy HP Box (top-left of battle field) ── */
function EnemyHPBox({ session, remainingSeconds, totalSeconds }) {
  const pct = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0
  const barClass = hpColor(pct)
  const isLow = pct <= 0.25

  return (
    <motion.div
      className="enemy-hp-box"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Name + Level */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="pk-title" style={{ fontSize: '0.55rem' }}>{session.pokemon.name}</span>
        <span className="pk-label" style={{ fontSize: '0.42rem' }}>Lv.{session.pokemon.level}</span>
      </div>
      {/* HP label + bar */}
      <div className="flex items-center gap-2">
        <span className="hp-label" style={{ fontSize: '0.42rem', flexShrink: 0 }}>HP</span>
        <div className="hp-bar-track flex-1" style={{ height: 8, position: 'relative' }}>
          <motion.div
            className={`hp-bar-fill ${barClass} ${isLow ? 'hp-red-pulse' : ''}`}
            style={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.6, ease: 'linear' }}
          />
        </div>
      </div>
      {/* Timer */}
      <div className="flex justify-end mt-1.5">
        <span
          className="pk-label"
          style={{
            fontSize: '0.55rem',
            color: isLow ? 'var(--g3-accent-red)' : 'var(--g3-text)',
            fontFamily: 'var(--font-pixel)',
          }}
        >
          {formatTime(remainingSeconds)}
        </span>
      </div>
    </motion.div>
  )
}

/* ── Pokéball arc animation ── */
function PokeballArc({ onComplete }) {
  return (
    <motion.img
      src={SAFARI_BALL_URL}
      alt="Safari Ball"
      className="pixel-sprite"
      style={{
        position: 'absolute',
        bottom: '22%',
        left: '18%',
        width: 32,
        zIndex: 30,
        imageRendering: 'pixelated',
      }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
      animate={{
        x: [0, 80, 170, 260],
        y: [0, -130, -80, 20],
        rotate: [0, 180, 480, 720],
        scale: [1.5, 1.2, 0.9, 0.7],
        opacity: [1, 1, 1, 0.6],
      }}
      transition={{ duration: 1.3, ease: 'easeInOut' }}
      onAnimationComplete={onComplete}
    />
  )
}

/* ── Battle platform (shadow oval under sprite) ── */
function Platform({ style }) {
  return (
    <div style={{
      ...style,
      background: 'radial-gradient(ellipse, rgba(0,0,0,0.25), transparent 70%)',
      borderRadius: '50%',
      position: 'absolute',
    }} />
  )
}

/* ── Setup screen — choose duration ── */
function SetupScreen({ onStart }) {
  const [selected, setSelected] = useState(1) // default 25 min

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="g3-panel-teal p-5 w-full max-w-md">
        <div className="pk-title text-center mb-4" style={{ fontSize: '0.65rem' }}>
          🌿 SAFARI ZONE
        </div>
        <div className="pk-dialogue-text mb-5 text-center" style={{ fontSize: '1.2rem', color: 'var(--g3-text-muted)' }}>
          Choose your focus session:
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {SESSIONS.map((s, i) => (
            <motion.button
              key={i}
              onClick={() => setSelected(i)}
              className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
              style={{
                border: `2px solid ${selected === i ? 'var(--g3-border-teal)' : 'var(--g3-border-orange)'}`,
                borderRadius: 5,
                background: selected === i ? 'rgba(104,176,176,0.12)' : 'var(--g3-cream)',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {selected === i && (
                <span className="pk-label pk-blue" style={{ fontSize: '0.45rem' }}>▶</span>
              )}
              {selected !== i && <span style={{ width: 10 }} />}
              <img
                src={SPRITE(s.pokemon.id)}
                alt={s.pokemon.name}
                className="pixel-sprite"
                style={{ width: 40, height: 40, imageRendering: 'pixelated', cursor: 'pointer' }}
                onMouseEnter={function() {
                  /* Inline cry: read soundEffects from store snapshot */
                  var sfx = useStore.getState().soundEffects
                  if (!sfx) return
                  try {
                    var a = new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + s.pokemon.id + '.ogg')
                    a.volume = 0.3
                    a.play().catch(function() {})
                  } catch(e) {}
                }}
              />
              <div>
                <div className="pk-title" style={{ fontSize: '0.55rem' }}>
                  {s.pokemon.name}
                </div>
                <div className="pk-label" style={{ fontSize: '0.42rem', color: 'var(--g3-text-muted)' }}>
                  {s.minutes} min — Lv. {s.pokemon.level}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          className="g3-btn w-full"
          style={{ fontSize: '0.6rem', padding: '10px 0', borderRadius: 6 }}
          onClick={() => onStart(SESSIONS[selected])}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ENTER SAFARI ZONE
        </motion.button>
      </div>
    </div>
  )
}

/* ── Main Safari Zone component ── */
export default function SafariZone() {
  const { gainXP } = useStore()

  // State machine phases:
  // 'setup' | 'intro' | 'running' | 'paused' | 'catchable' | 'catching' | 'caught' | 'fled' | 'ran'
  const [phase, setPhase]               = useState('setup')
  const [session, setSession]           = useState(null)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [remaining, setRemaining]       = useState(0)
  const [dialogue, setDialogue]         = useState('')
  const [showBall, setShowBall]         = useState(false)
  const [spriteVisible, setSpriteVisible] = useState(true)
  const [introIndex, setIntroIndex]     = useState(0)
  const intervalRef = useRef(null)

  const displayedDialogue = useTypewriter(dialogue, 28)

  /* ── Timer tick ── */
  useEffect(() => {
    if (phase !== 'running') {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [phase])

  /* ── When remaining hits 0 while running → become catchable ── */
  useEffect(() => {
    if (remaining === 0 && phase === 'running') {
      setPhase('catchable')
      setDialogue(`${session.pokemon.name}'s HP hit zero!\nThe task is weak!\nThrow a Safari Ball!`)
    }
  }, [remaining, phase, session])

  /* ── Page Visibility API — anti-cheat ── */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === 'running') {
        clearInterval(intervalRef.current)
        setPhase('fled')
        setRemaining(totalSeconds) // reset timer
        setSpriteVisible(true)
        setDialogue(
          `The wild ${session?.pokemon.name} was spooked by your distraction!\n\nIt FLED!`
        )
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [phase, session, totalSeconds])

  /* ── Start session ── */
  const handleStart = useCallback((s) => {
    setSession(s)
    const secs = s.minutes * 60
    setTotalSeconds(secs)
    setRemaining(secs)
    setSpriteVisible(true)
    setShowBall(false)
    setIntroIndex(0)
    setDialogue(s.introLines[0])
    setPhase('intro')
  }, [])

  /* ── Advance intro dialogue ── */
  const handleIntroAdvance = () => {
    const nextIdx = introIndex + 1
    if (nextIdx < session.introLines.length) {
      setIntroIndex(nextIdx)
      setDialogue(session.introLines[nextIdx])
    } else {
      setPhase('paused')
      setDialogue(`What will you do?`)
    }
  }

  /* ── FOCUS button: start / pause ── */
  const handleFocus = () => {
    if (phase === 'paused' || phase === 'intro') {
      setPhase('running')
      setDialogue(`Stay focused! Don't look away!`)
    } else if (phase === 'running') {
      setPhase('paused')
      setDialogue(`Timer paused. Stay in the zone!`)
    }
  }

  /* ── BAIT button: +5 minutes ── */
  const handleBait = () => {
    if (phase !== 'running' && phase !== 'paused') return
    const add = 5 * 60
    const newTotal = totalSeconds + add
    const newRemaining = remaining + add
    setTotalSeconds(newTotal)
    setRemaining(newRemaining)
    setDialogue(`You throw some BAIT.\n+5 minutes added to the timer!`)
  }

  /* ── RUN button: cancel ── */
  const handleRun = () => {
    clearInterval(intervalRef.current)
    setPhase('ran')
    setDialogue(`You ran away safely!\nNo XP earned this time...`)
  }

  /* ── CATCH button: only when catchable ── */
  const handleCatch = () => {
    if (phase !== 'catchable') return
    setPhase('catching')
    setShowBall(true)
    setDialogue(`You threw a SAFARI BALL!`)
    setSpriteVisible(false)
  }

  /* ── After Pokéball animation ── */
  const handleBallLand = () => {
    setShowBall(false)
    setPhase('caught')
    const xpGain = session.minutes * 8
    gainXP('psychic', xpGain)
    setDialogue(
      `Gotcha! ${session.pokemon.name} was caught!\n\n+${xpGain} PSYCHIC XP earned!`
    )
  }

  /* ── Restart ── */
  const handleRestart = () => {
    clearInterval(intervalRef.current)
    setPhase('setup')
    setSession(null)
    setDialogue('')
    setSpriteVisible(true)
    setShowBall(false)
  }

  /* ── Setup screen ── */
  if (phase === 'setup') {
    return <SetupScreen onStart={handleStart} />
  }

  const pct = totalSeconds > 0 ? remaining / totalSeconds : 0

  /* ── Battle screen ── */
  return (
    <div className="flex flex-col h-full">

      {/* ════════════════════════════════════════
          BATTLE FIELD (top ~58%)
      ════════════════════════════════════════ */}
      <div className="battle-bg relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* Sky pixel line decoration */}
        <div style={{
          position: 'absolute', top: '37%', left: 0, right: 0,
          height: 3,
          background: 'linear-gradient(to right, #50902c, #60a83c, #50902c)',
          zIndex: 1,
        }} />

        {/* ── Enemy HP Box (top-left) ── */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 5 }}>
          <EnemyHPBox
            session={session}
            remainingSeconds={remaining}
            totalSeconds={totalSeconds}
          />
        </div>

        {/* ── Enemy Platform + Sprite (top-right) ── */}
        <Platform style={{ bottom: '38%', right: '12%', width: 160, height: 22 }} />
        <AnimatePresence>
          {spriteVisible && (
            <motion.div
              key="enemy"
              className="absolute"
              style={{ right: '14%', bottom: '39%', zIndex: 3 }}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0, filter: 'brightness(3)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.img
                src={SPRITE(session.pokemon.id)}
                alt={session.pokemon.name}
                className="pixel-sprite"
                style={{ width: 'auto', height: 120, imageRendering: 'pixelated', cursor: 'pointer' }}
                animate={phase === 'catchable' ? { y: [0, -6, 0] } : {}}
                transition={{ duration: 0.7, repeat: Infinity }}
                onMouseEnter={function() {
                  if (!useStore.getState().soundEffects) return
                  try {
                    var a = new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + session.pokemon.id + '.ogg')
                    a.volume = 0.3
                    a.play().catch(function() {})
                  } catch(e) {}
                }}
                onError={e => { e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${session.pokemon.id}.png` }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Player Platform + Back Sprite (bottom-left) ── */}
        <Platform style={{ bottom: '10%', left: '10%', width: 130, height: 18 }} />
        <motion.div
          className="absolute"
          style={{ left: '8%', bottom: '11%', zIndex: 3 }}
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
        >
          <img
            src={BACK(157)}  /* Typhlosion back — HeartGold mascot */
            alt="Typhlosion"
            className="pixel-sprite"
            style={{ width: 'auto', height: 96, imageRendering: 'pixelated' }}
            onError={e => {
              e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/157.png'
            }}
          />
        </motion.div>

        {/* ── Pokéball arc ── */}
        <AnimatePresence>
          {showBall && <PokeballArc onComplete={handleBallLand} />}
        </AnimatePresence>

        {/* ── Phase flash overlay (caught) ── */}
        <AnimatePresence>
          {phase === 'caught' && (
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1, 0] }}
              transition={{ duration: 0.8, times: [0, 0.2, 0.4, 0.6, 1] }}
              style={{ background: 'white' }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM ACTION PANE
      ════════════════════════════════════════ */}
      <div
        className="flex-shrink-0"
        style={{
          height: '42%',
          display: 'flex',
          gap: 0,
          borderTop: '3px solid var(--g3-border-teal)',
        }}
      >
        {/* ── Dialogue Box (left 60%) ── */}
        <div
          className="flex-1 relative"
          style={{
            borderRadius: 0,
            background: 'var(--g3-cream)',
            borderRight: '2px solid var(--g3-border-orange)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 20px 12px',
          }}
        >
          {/* Dialogue text */}
          <div>
            <p
              className="pk-dialogue-text"
              style={{ fontSize: '1.3rem', whiteSpace: 'pre-line', lineHeight: 1.4 }}
            >
              {displayedDialogue}
              {displayedDialogue.length < dialogue.length && (
                <span className="blink-cursor" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.6rem' }}>▮</span>
              )}
            </p>
          </div>

          {/* Advance prompt for intro */}
          {phase === 'intro' && displayedDialogue === dialogue && (
            <motion.button
              className="self-end g3-btn g3-btn-sm g3-btn-orange"
              style={{ fontSize: '0.45rem', padding: '4px 8px' }}
              onClick={handleIntroAdvance}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              NEXT ▼
            </motion.button>
          )}

          {/* Restart button for terminal states */}
          {(phase === 'caught' || phase === 'fled' || phase === 'ran') && (
            <motion.button
              className="self-end g3-btn g3-btn-sm"
              style={{ fontSize: '0.45rem', padding: '4px 8px' }}
              onClick={handleRestart}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              BACK ◀
            </motion.button>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 3, background: 'var(--g3-border-orange)', flexShrink: 0 }} />

        {/* ── Battle Menu (right 40%) ── */}
        <div
          style={{
            width: '38%',
            flexShrink: 0,
            background: 'var(--g3-cream)',
            borderRight: '2px solid var(--g3-border-orange)',
            display: 'flex',
            flexDirection: 'column',
            padding: 8,
            gap: 6,
          }}
        >
          <div className="pk-label" style={{ textAlign: 'center', paddingBottom: 4, borderBottom: '2px solid var(--g3-border-orange)', fontSize: '0.5rem' }}>
            WHAT WILL YOU DO?
          </div>

          {/* 2×2 button grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
            {/* FOCUS */}
            <motion.button
              className={`battle-btn battle-btn-focus`}
              disabled={!['paused', 'running', 'intro'].includes(phase)}
              onClick={handleFocus}
              whileTap={{ scale: 0.94 }}
            >
              <span style={{ fontSize: '0.6rem', display: 'block', marginBottom: 2 }}>
                {phase === 'running' ? '⏸' : '▶'}
              </span>
              {phase === 'running' ? 'PAUSE' : 'FOCUS'}
            </motion.button>

            {/* BAIT */}
            <motion.button
              className="battle-btn battle-btn-bait"
              disabled={!['running', 'paused'].includes(phase)}
              onClick={handleBait}
              whileTap={{ scale: 0.94 }}
            >
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/bait.png"
                alt=""
                className="pixel-sprite mx-auto block mb-1"
                style={{ width: 16, height: 16 }}
                onError={e => e.target.style.display='none'}
              />
              BAIT +5
            </motion.button>

            {/* RUN */}
            <motion.button
              className="battle-btn battle-btn-run"
              disabled={!['running', 'paused', 'intro'].includes(phase)}
              onClick={handleRun}
              whileTap={{ scale: 0.94 }}
            >
              <span style={{ fontSize: '0.6rem', display: 'block', marginBottom: 2 }}>🏃</span>
              RUN
            </motion.button>

            {/* CATCH */}
            <motion.button
              className="battle-btn battle-btn-catch"
              disabled={phase !== 'catchable'}
              onClick={handleCatch}
              whileTap={{ scale: 0.94 }}
              animate={phase === 'catchable' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <img
                src={SAFARI_BALL_URL}
                alt="Safari Ball"
                className="pixel-sprite mx-auto block mb-1"
                style={{ width: 18, height: 18 }}
              />
              CATCH
            </motion.button>
          </div>

          {/* Status hint */}
          <div
            className="pk-label text-center"
            style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', borderTop: '1px solid rgba(104,160,176,0.3)', paddingTop: 4 }}
          >
            {phase === 'running' && `⚡ FOCUS MODE`}
            {phase === 'paused'  && `⏸ PAUSED`}
            {phase === 'catchable' && `🎯 THROW THE BALL!`}
            {phase === 'intro'   && `📖 ENCOUNTER!`}
            {phase === 'caught'  && `✅ TASK CAUGHT!`}
            {phase === 'fled'    && `💨 POKEMON FLED`}
            {phase === 'ran'     && `🏃 YOU RAN`}
          </div>
        </div>
      </div>
    </div>
  )
}
