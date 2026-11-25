import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXp, useSettings, usePokedex, useBattle } from '../store'
import { ITEMS_URL } from './safariHelpers'
import { DialogueBox, SpriteImage } from './ui'

const SAFARI_BALL_URL = `${ITEMS_URL}/safari-ball.png`

const SESSIONS = [
  {
    minutes: 10,
    pokemon: { id: 63, name: 'ABRA', level: 10 },
    introLines: ['Wild ABRA appeared!', 'It looks distracted...'],
  },
  {
    minutes: 25,
    pokemon: { id: 64, name: 'KADABRA', level: 25 },
    introLines: ['Wild KADABRA appeared!', 'Its spoon shimmers with psychic energy...'],
  },
  {
    minutes: 45,
    pokemon: { id: 65, name: 'ALAKAZAM', level: 45 },
    introLines: ['Wild ALAKAZAM appeared!', 'It emanates incredible focus...'],
  },
  {
    minutes: 60,
    pokemon: { id: 518, name: 'MUSHARNA', level: 60 },
    introLines: ['Wild MUSHARNA appeared!', 'A Dream Mist drifts peacefully by...'],
  },
]

function hpColor(pct) {
  if (pct > 0.5) return 'hp-green'
  if (pct > 0.25) return 'hp-yellow'
  return 'hp-red'
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

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
      <div className="flex justify-between items-center mb-1.5">
        <span className="pk-title" style={{ fontSize: '0.55rem' }}>{session.pokemon.name}</span>
        <span className="pk-label" style={{ fontSize: '0.42rem' }}>Lv.{session.pokemon.level}</span>
      </div>
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

function Platform({ style, variant = 'grass', player = false }) {
  const grassPlatform = {
    background: player
      ? 'linear-gradient(180deg, #7CC060 0%, #58A038 60%, #3D7820 100%)'
      : 'linear-gradient(180deg, #90D068 0%, #6CB848 55%, #4A9030 100%)',
    border: player ? '3px solid #2D5C18' : '2px solid #3A7018',
    boxShadow: player
      ? 'inset 0 -4px 8px rgba(0,0,0,0.3), 0 4px 0 #1E4010'
      : 'inset 0 -3px 6px rgba(0,0,0,0.25), 0 3px 0 #2A5810',
  }
  const cavePlatform = {
    background: 'linear-gradient(180deg, #8A7860 0%, #6A5840 55%, #4A3820 100%)',
    border: '2px solid #302010',
    boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.35), 0 3px 0 #201008',
  }
  const base = variant === 'cave' ? cavePlatform : grassPlatform
  return (
    <div
      style={{
        ...style,
        ...base,
        borderRadius: '50%',
        position: 'absolute',
      }}
    />
  )
}

function SetupScreen({ onStart }) {
  const [selected, setSelected] = useState(1)

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4 sm:p-6 overflow-y-auto">
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
              {selected === i ? (
                <span className="pk-label pk-blue" style={{ fontSize: '0.45rem' }}>▶</span>
              ) : (
                <span style={{ width: 10 }} />
              )}
              <SpriteImage pokemonId={s.pokemon.id} alt={s.pokemon.name} size={40} enableCry />
              <div>
                <div className="pk-title" style={{ fontSize: '0.55rem' }}>{s.pokemon.name}</div>
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

export default function SafariZone() {
  const { gainXP } = useXp()
  const { starterPokemon } = useSettings()
  const { registerPokemon } = usePokedex()
  const { strikeDailyBoss } = useBattle()

  const [phase, setPhase] = useState('setup')
  const [session, setSession] = useState(null)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [dialogue, setDialogue] = useState('')
  const [showBall, setShowBall] = useState(false)
  const [spriteVisible, setSpriteVisible] = useState(true)
  const [catchAnimating, setCatchAnimating] = useState(false)
  const [introIndex, setIntroIndex] = useState(0)
  const intervalRef = useRef(null)

  /* Timer tick handles transition to catchable state inside interval callback */
  useEffect(() => {
    if (phase !== 'running') {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setPhase('catchable')
          if (session) {
            setDialogue(`${session.pokemon.name}'s HP hit zero!\nThe task is weak!\nThrow a Safari Ball!`)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [phase, session])

  /* Page Visibility API — anti-cheat */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === 'running') {
        clearInterval(intervalRef.current)
        setPhase('fled')
        setRemaining(totalSeconds)
        setSpriteVisible(true)
        setDialogue(`The wild ${session?.pokemon.name} was spooked by your distraction!\n\nIt FLED!`)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [phase, session, totalSeconds])

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

  const handleIntroAdvance = () => {
    const nextIdx = introIndex + 1
    if (nextIdx < session.introLines.length) {
      setIntroIndex(nextIdx)
      setDialogue(session.introLines[nextIdx])
    } else {
      setPhase('paused')
      setDialogue('What will you do?')
    }
  }

  const handleFocus = () => {
    if (phase === 'paused' || phase === 'intro') {
      setPhase('running')
      setDialogue("Stay focused! Don't look away!")
    } else if (phase === 'running') {
      setPhase('paused')
      setDialogue('Timer paused. Stay in the zone!')
    }
  }

  const handleBait = () => {
    if (phase !== 'running' && phase !== 'paused') return
    const add = 5 * 60
    setTotalSeconds((t) => t + add)
    setRemaining((r) => r + add)
    setDialogue('You throw some BAIT.\n+5 minutes added to the timer!')
  }

  const handleRun = () => {
    clearInterval(intervalRef.current)
    setPhase('ran')
    setDialogue('You ran away safely!\nNo XP earned this time...')
  }

  const handleCatch = () => {
    if (phase !== 'catchable') return
    setPhase('catching')
    setShowBall(true)
    setCatchAnimating(true)
    setDialogue('You threw a SAFARI BALL!')
    setTimeout(() => setSpriteVisible(false), 400)
  }

  const handleBallLand = () => {
    setShowBall(false)
    setCatchAnimating(false)
    setPhase('caught')
    const xpGain = session.minutes * 8
    gainXP('psychic', xpGain)
    registerPokemon(session.pokemon.id, false, 'safari')
    strikeDailyBoss('psychic', 1.5)
    setDialogue(`Gotcha! ${session.pokemon.name} was caught!\n\n+${xpGain} PSYCHIC XP earned!`)
  }

  const handleRestart = () => {
    clearInterval(intervalRef.current)
    setPhase('setup')
    setSession(null)
    setDialogue('')
    setSpriteVisible(true)
    setCatchAnimating(false)
    setShowBall(false)
  }

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStart} />
  }

  const playerBackId = starterPokemon?.id || 157

  return (
    <div className="flex flex-col h-full">
      <div className="battle-bg relative flex-1 overflow-hidden" style={{ minHeight: 200 }}>
        <div
          style={{
            position: 'absolute',
            top: '37%',
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(to right, #50902c, #60a83c, #50902c)',
            zIndex: 1,
          }}
        />

        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 5 }}>
          <EnemyHPBox session={session} remainingSeconds={remaining} totalSeconds={totalSeconds} />
        </div>

        <Platform style={{ bottom: '38%', right: '12%', width: 170, height: 30, zIndex: 2 }} variant="grass" />
        <AnimatePresence>
          {spriteVisible && (
            <motion.div
              key="enemy"
              className="absolute"
              style={{ right: '14%', bottom: '42%', zIndex: 3 }}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0, filter: 'brightness(3)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div animate={!catchAnimating && phase === 'catchable' ? { y: [0, -6, 0] } : {}} transition={{ duration: 0.7, repeat: Infinity }}>
                <SpriteImage
                  pokemonId={session.pokemon.id}
                  alt={session.pokemon.name}
                  size={120}
                  enableCry
                  className={catchAnimating ? 'anim-catch-shrink' : ''}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Platform style={{ bottom: '8%', left: '8%', width: 160, height: 36, zIndex: 2 }} player variant="grass" />
        <motion.div
          className="absolute"
          style={{ left: '8%', bottom: '14%', zIndex: 3 }}
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
        >
          <SpriteImage pokemonId={playerBackId} back alt={starterPokemon?.name || 'Partner'} size={96} />
        </motion.div>

        <AnimatePresence>
          {showBall && (
            <motion.img
              src={SAFARI_BALL_URL}
              alt="Safari Ball"
              className="pixel-sprite anim-ball-lunge"
              style={{ position: 'absolute', bottom: '22%', left: '22%', width: 28, zIndex: 30, imageRendering: 'pixelated' }}
              onAnimationEnd={handleBallLand}
            />
          )}
        </AnimatePresence>

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

      <div className="safari-action-pane flex-shrink-0" style={{ borderTop: '3px solid var(--g3-border-teal)' }}>
        <div
          className="flex-1 relative"
          style={{
            background: 'var(--g3-cream)',
            borderRight: '2px solid var(--g3-border-orange)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px 18px 12px',
          }}
        >
          <div>
            <p className="pk-dialogue-text" style={{ fontSize: '1.25rem', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
              <DialogueBox text={dialogue} speed={28} />
            </p>
          </div>

          {phase === 'intro' && (
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

          {(phase === 'caught' || phase === 'fled' || phase === 'ran') && (
            <motion.button
              className="self-end g3-btn g3-btn-sm"
              style={{ fontSize: '0.45rem', padding: '4px 8px' }}
              onClick={handleRestart}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              BACK ◀
            </motion.button>
          )}
        </div>

        <div className="hidden md:block" style={{ width: 3, background: 'var(--g3-border-orange)', flexShrink: 0 }} />

        <div
          className="safari-menu-col"
          style={{
            background: 'var(--g3-cream)',
            display: 'flex',
            flexDirection: 'column',
            padding: 8,
            gap: 6,
          }}
        >
          <div className="pk-label" style={{ textAlign: 'center', paddingBottom: 4, borderBottom: '2px solid var(--g3-border-orange)', fontSize: '0.5rem' }}>
            WHAT WILL YOU DO?
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
            <motion.button
              className="battle-btn battle-btn-focus"
              disabled={!['paused', 'running', 'intro'].includes(phase)}
              onClick={handleFocus}
              whileTap={{ scale: 0.94 }}
              style={{ minHeight: 42 }}
            >
              <span style={{ fontSize: '0.6rem', display: 'block', marginBottom: 2 }}>{phase === 'running' ? '⏸' : '▶'}</span>
              {phase === 'running' ? 'PAUSE' : 'FOCUS'}
            </motion.button>

            <motion.button
              className="battle-btn battle-btn-bait"
              disabled={!['running', 'paused'].includes(phase)}
              onClick={handleBait}
              whileTap={{ scale: 0.94 }}
              style={{ minHeight: 42 }}
            >
              <img
                src={`${ITEMS_URL}/bait.png`}
                alt=""
                className="pixel-sprite mx-auto block mb-1"
                style={{ width: 16, height: 16 }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              BAIT +5
            </motion.button>

            <motion.button
              className="battle-btn battle-btn-run"
              disabled={!['running', 'paused', 'intro'].includes(phase)}
              onClick={handleRun}
              whileTap={{ scale: 0.94 }}
              style={{ minHeight: 42 }}
            >
              <span style={{ fontSize: '0.6rem', display: 'block', marginBottom: 2 }}>🏃</span>
              RUN
            </motion.button>

            <motion.button
              className="battle-btn battle-btn-catch"
              disabled={phase !== 'catchable'}
              onClick={handleCatch}
              whileTap={{ scale: 0.94 }}
              animate={phase === 'catchable' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ minHeight: 42 }}
            >
              <img src={SAFARI_BALL_URL} alt="Safari Ball" className="pixel-sprite mx-auto block mb-1" style={{ width: 18, height: 18 }} />
              CATCH
            </motion.button>
          </div>

          <div className="pk-label text-center" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', borderTop: '1px solid rgba(104,160,176,0.3)', paddingTop: 4 }}>
            {phase === 'running' && '⚡ FOCUS MODE'}
            {phase === 'paused' && '⏸ PAUSED'}
            {phase === 'catchable' && '🎯 THROW THE BALL!'}
            {phase === 'intro' && '📖 ENCOUNTER!'}
            {phase === 'caught' && '✅ TASK CAUGHT!'}
            {phase === 'fled' && '💨 POKEMON FLED'}
            {phase === 'ran' && '🏃 YOU RAN'}
          </div>
        </div>
      </div>
    </div>
  )
}
