import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { usePokemonCry } from '../hooks/usePokemonCry'
import { supabase } from '../lib/supabase'

/* ============================================================
   CONSTANTS & HELPERS
   ============================================================ */

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'

/** Gen 5 animated front sprite */
const animSprite = (id) =>
  `${SPRITE_BASE}/pokemon/versions/generation-v/black-white/animated/${id}.gif`

/** Fallback to static if animated fails */
const staticSprite = (id) => `${SPRITE_BASE}/pokemon/${id}.png`

/** Pokémon Egg item icon (exact URL from requirements) */
const EGG_URL = `${SPRITE_BASE}/items/pokemon-egg.png`

/** A task is assumed to have been created 7 days before its deadline */
const TASK_DURATION_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Calculate percentage of time remaining (0–1).
 * 1.0 = just created, 0.0 = deadline reached.
 */
function calcHpPct(deadline) {
  const deadlineMs = new Date(deadline).getTime()
  const now = Date.now()
  const createdMs = deadlineMs - TASK_DURATION_MS
  const elapsed = now - createdMs
  const pct = 1 - elapsed / TASK_DURATION_MS
  return Math.max(0, Math.min(1, pct))
}

/**
 * Human-readable countdown  e.g. "3d 14h left" / "4h 22m left" / "OVERDUE"
 */
function formatCountdown(deadline) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'OVERDUE!'
  const totalMins = Math.floor(diff / 60_000)
  const days = Math.floor(totalMins / 1440)
  const hours = Math.floor((totalMins % 1440) / 60)
  const mins = totalMins % 60
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

/** HP bar colour class based on percentage */
function hpBarStyle(pct, status) {
  if (status === 'completed') return { background: '#22c55e', width: '100%' } // locked green
  if (pct > 0.5)   return { background: '#22c55e', width: `${pct * 100}%` }
  if (pct > 0.2)   return { background: '#eab308', width: `${pct * 100}%` }
  return { background: '#ef4444', width: `${pct * 100}%` }
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

/* ── Gen 3 Section Header (teal bar with pills) ── */
function G3Header({ children, icon, rightSlot }) {
  return (
    <div style={{
      background: '#68B0B0',
      padding: '5px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderRadius: '6px 6px 0 0',
    }}>
      {/* Decorative pills */}
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', flexShrink: 0 }} />
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', flexShrink: 0 }} />
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '0.46rem',
        color: '#fff',
        letterSpacing: '-0.3px',
        lineHeight: 1.8,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        flex: 1,
      }}>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}
        {children}
      </span>
      {rightSlot && <div style={{ flexShrink: 0 }}>{rightSlot}</div>}
    </div>
  )
}

/* ── HP Bar track + fill ── */
function HPBar({ pct, status }) {
  const style = hpBarStyle(pct, status)
  const isLow = pct < 0.2 && status === 'active'
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 2,
      }}>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '0.38rem',
          color: '#706858',
          letterSpacing: '-0.2px',
        }}>
          HP
        </span>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '0.36rem',
          color: isLow ? '#ef4444' : '#706858',
          letterSpacing: '-0.2px',
        }}>
          {status === 'completed' ? 'DONE!' : `${Math.round(pct * 100)}%`}
        </span>
      </div>
      {/* Track */}
      <div style={{
        background: '#383838',
        border: '2px solid #181818',
        height: 10,
        borderRadius: 0,
        overflow: 'hidden',
      }}>
        <motion.div
          style={{ height: '100%', borderRadius: 0, ...style }}
          animate={{ width: style.width }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          // Red pulse when critically low
          className={isLow ? 'hp-red-pulse' : ''}
        />
      </div>
    </div>
  )
}

/* ── Gold Ribbon badge (completed) ── */
function RibbonBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      title="Task Completed!"
      style={{
        width: 22, height: 22,
        background: 'radial-gradient(circle at 35% 35%, #FFE060, #C89820)',
        borderRadius: '50%',
        border: '2px solid #A07810',
        boxShadow: '0 0 8px 2px rgba(200,150,30,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: '0.65rem',
        lineHeight: 1,
      }}
    >
      🎀
    </motion.div>
  )
}

/* ── FAINTED overlay banner ── */
function FaintedBanner() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 20,
      borderRadius: 6,
      pointerEvents: 'none',
    }}>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '0.55rem',
        color: '#ef4444',
        letterSpacing: '-0.3px',
        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        lineHeight: 1.8,
      }}>
        ☠ FAINTED
      </span>
      <span style={{
        fontFamily: "'VT323', monospace",
        fontSize: '0.95rem',
        color: '#fca5a5',
        marginTop: 2,
      }}>
        Deadline passed!
      </span>
    </div>
  )
}

/* ── Single Party Slot Card ── */
function PartyCard({ member, onComplete, onRemove }) {
  const [pct, setPct] = useState(() => calcHpPct(member.deadline))
  const [countdown, setCountdown] = useState(() => formatCountdown(member.deadline))

  // Refresh HP and countdown every 60 seconds
  useEffect(() => {
    if (member.status !== 'active') return
    const id = setInterval(() => {
      setPct(calcHpPct(member.deadline))
      setCountdown(formatCountdown(member.deadline))
    }, 60_000)
    return () => clearInterval(id)
  }, [member.deadline, member.status])

  const isFainted   = member.status === 'fainted'
  const isCompleted = member.status === 'completed'
  const isDisabled  = isFainted || isCompleted

  /* Play Pokémon cry on sprite hover */
  const playCry = usePokemonCry(member.pokemonId)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      transition={{ duration: 0.25 }}
      /* Container — exact spec from requirements */
      style={{
        background: '#F8F8ED',
        border: `4px solid ${isFainted ? '#6B7280' : '#68A0B0'}`,
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(80,140,160,0.4), 0 4px 16px rgba(0,0,0,0.28)',
        opacity: isFainted ? 0.85 : 1,
        transition: 'border-color 0.3s, opacity 0.3s',
      }}
    >
      {/* ── Fainted overlay ── */}
      {isFainted && <FaintedBanner />}

      {/* ── Left: Sprite Area (w-24 h-24 equivalent ~96px) ── */}
      <div style={{
        width: 96, height: 96,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        marginRight: 10,
      }}>
        {/* Soft circular glow behind sprite */}
        {!isFainted && (
          <div style={{
            position: 'absolute',
            width: 72, height: 72,
            borderRadius: '50%',
            background: isCompleted
              ? 'radial-gradient(circle, rgba(200,150,30,0.2), transparent 70%)'
              : 'radial-gradient(circle, rgba(104,160,176,0.15), transparent 70%)',
          }} />
        )}
        <motion.img
          key={member.pokemonId}
          src={animSprite(member.pokemonId)}
          alt={`Pokémon #${member.pokemonId}`}
          onError={e => { e.target.src = staticSprite(member.pokemonId) }}
          onMouseEnter={playCry}
          style={{
            width: 'auto',
            height: 80,
            imageRendering: 'pixelated',
            cursor: 'pointer',
            filter: isFainted
              ? 'grayscale(100%) brightness(0.5)'
              : isCompleted
              ? 'drop-shadow(0 0 6px rgba(200,150,30,0.8))'
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            transition: 'filter 0.4s',
          }}
          animate={!isFainted && !isCompleted ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Right: Task Data (flex column) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>

        {/* TOP: Task name + ribbon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isCompleted && <RibbonBadge />}
          <p style={{
            fontFamily: "'VT323', monospace",
            fontSize: '1.15rem',
            color: isFainted ? '#DC2626' : isCompleted ? '#065F46' : '#383028',
            textDecoration: isFainted ? 'line-through' : 'none',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
            lineHeight: 1.2,
          }}>
            {member.taskName}
          </p>
        </div>

        {/* MIDDLE: Countdown timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>
            {isCompleted ? '🏅' : isFainted ? '💀' : pct < 0.2 ? '🚨' : pct < 0.5 ? '⚠️' : '⏱️'}
          </span>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.38rem',
            color: isFainted ? '#DC2626' : pct < 0.2 ? '#ef4444' : pct < 0.5 ? '#ca8a04' : '#16a34a',
            letterSpacing: '-0.2px',
            lineHeight: 1.8,
          }}>
            {isCompleted
              ? 'COMPLETED!'
              : isFainted
              ? new Date(member.deadline).toLocaleDateString()
              : countdown}
          </span>
        </div>

        {/* BOTTOM: HP Bar */}
        <HPBar pct={pct} status={member.status} />

        {/* Action buttons row */}
        {!isDisabled && (
          <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
            <button
              onClick={() => !isDisabled && onComplete(member.id)}
              style={{
                flex: 1,
                background: '#68B0B0',
                border: '2px solid #408090',
                borderRadius: 4,
                boxShadow: '2px 2px 0 #408090',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.38rem',
                color: '#fff',
                cursor: 'pointer',
                padding: '4px 0',
                letterSpacing: '-0.2px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                transition: 'transform 0.07s, box-shadow 0.07s',
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 #408090' }}
            >
              ✓ COMPLETE
            </button>
          </div>
        )}

        {/* Remove button (always available for cleanup) */}
        {isDisabled && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <button
              onClick={() => onRemove(member.id)}
              style={{
                background: '#FFF0F0',
                border: '2px solid #E09078',
                borderRadius: 4,
                boxShadow: '2px 2px 0 #C07060',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.35rem',
                color: '#C07060',
                cursor: 'pointer',
                padding: '3px 8px',
                letterSpacing: '-0.2px',
              }}
            >
              {isCompleted ? 'DISMISS ▶' : 'RELEASE ×'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Empty Party Slot (dashed placeholder) ── */
function EmptySlot() {
  return (
    <div style={{
      background: 'rgba(248,248,237,0.5)',
      border: '3px dashed #A8C8C8',
      borderRadius: 8,
      height: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 4,
      opacity: 0.65,
    }}>
      <span style={{ fontSize: '1.6rem', opacity: 0.5 }}>➕</span>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '0.35rem',
        color: '#88A8A8',
        letterSpacing: '-0.2px',
      }}>
        EMPTY SLOT
      </span>
    </div>
  )
}

/* ── Add to Party” form (inline in party section) ── */
function AddPartyForm({ onClose }) {
  const { addNuzlockeTask, party } = useStore()
  const [taskName, setTaskName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [pokemonId, setPokemonId] = useState(Math.floor(Math.random() * 151) + 1)

  const handleReroll = () => setPokemonId(Math.floor(Math.random() * 151) + 1)

  const handleSubmit = () => {
    if (!taskName.trim() || !deadline) return
    addNuzlockeTask(taskName.trim(), pokemonId, new Date(deadline).toISOString(), 'party')
    onClose()
  }

  const slotsFull = party.length >= 6

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: '#F8F8ED',
        border: '4px solid #68A0B0',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(80,140,160,0.4), 0 4px 16px rgba(0,0,0,0.28)',
      }}
    >
      <G3Header icon="➕" rightSlot={
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: 3, color: 'white', width: 18, height: 18,
            cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: '0.4rem',
          }}
        >✕</button>
      }>
        ADD TO PARTY
      </G3Header>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {slotsFull ? (
          <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.1rem', color: '#D04030', textAlign: 'center' }}>
            ⚠️ Party is full! Complete or release a member first.
          </p>
        ) : (
          <>
            {/* Pokémon Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 72, height: 72, background: '#EDE8D0', border: '2px solid #C0B8A8',
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img
                  src={animSprite(pokemonId)}
                  alt={`Pokémon #${pokemonId}`}
                  onError={e => { e.target.src = staticSprite(pokemonId) }}
                  style={{ height: 60, width: 'auto', imageRendering: 'pixelated' }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.4rem', color: '#706858' }}>
                  #{String(pokemonId).padStart(3, '0')}
                </span>
                <button
                  onClick={handleReroll}
                  style={{
                    background: '#F0EDD8', border: '2px solid #E09078',
                    borderRadius: 4, boxShadow: '2px 2px 0 rgba(200,120,96,0.4)',
                    fontFamily: "'Press Start 2P', monospace", fontSize: '0.38rem',
                    color: '#706858', cursor: 'pointer', padding: '4px 8px',
                  }}
                >
                  🎲 RE-ROLL
                </button>
              </div>
            </div>

            {/* Task name input */}
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.4rem', color: '#706858', marginBottom: 4 }}>
                TASK NAME:
              </div>
              <input
                type="text"
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
                placeholder="What's at stake this week?"
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'white', border: '2px solid #C0B8A8', borderRadius: 4,
                  fontFamily: "'VT323', monospace", fontSize: '1.15rem',
                  color: '#383028', padding: '5px 10px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#68A0B0'}
                onBlur={e => e.target.style.borderColor = '#C0B8A8'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Deadline picker */}
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.4rem', color: '#706858', marginBottom: 4 }}>
                DEADLINE:
              </div>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'white', border: '2px solid #C0B8A8', borderRadius: 4,
                  fontFamily: "'VT323', monospace", fontSize: '1.05rem',
                  color: '#383028', padding: '5px 10px', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#68A0B0'}
                onBlur={e => e.target.style.borderColor = '#C0B8A8'}
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{
                background: '#F0EDD8', border: '2px solid #E09078', borderRadius: 5,
                boxShadow: '2px 2px 0 rgba(200,120,96,0.4)',
                fontFamily: "'Press Start 2P', monospace", fontSize: '0.42rem',
                color: '#706858', cursor: 'pointer', padding: '5px 10px',
              }}>
                CANCEL
              </button>
              <button
                onClick={handleSubmit}
                disabled={!taskName.trim() || !deadline}
                style={{
                  background: '#68B0B0', border: '2px solid #408090', borderRadius: 5,
                  boxShadow: '2px 2px 0 #408090',
                  fontFamily: "'Press Start 2P', monospace", fontSize: '0.42rem',
                  color: 'white', cursor: 'pointer', padding: '5px 10px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)', opacity: (!taskName.trim() || !deadline) ? 0.4 : 1,
                }}
              >
                SEND OUT ▶
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ── Deadline Modal for "Move to Party" from Daycare ── */
function DeadlineModal({ daycareItem, onClose }) {
  const { addNuzlockeTask } = useStore()
  const [deadline, setDeadline] = useState('')

  const handleConfirm = async () => {
    if (!deadline) return
    const pokemonId = Math.floor(Math.random() * 151) + 1
    /* Delete old daycare row then insert new party row */
    await supabase.from('nuzlocke_party').delete().eq('id', daycareItem.id)
    await addNuzlockeTask(daycareItem.taskName, pokemonId, new Date(deadline).toISOString(), 'party')
    onClose()
  }

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      {/* Dialog box — stops click propagation */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#F8F8ED',
          border: '4px solid #E09078',
          borderRadius: 10,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 380,
          boxShadow: '4px 4px 0 rgba(200,120,96,0.5), 0 12px 40px rgba(0,0,0,0.45)',
        }}
      >
        <G3Header icon="🥚">HATCH FROM DAYCARE</G3Header>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Show egg + task name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={EGG_URL}
              alt="Pokémon Egg"
              style={{ width: 40, height: 40, imageRendering: 'pixelated', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.38rem', color: '#706858', marginBottom: 3 }}>
                SENDING TO PARTY:
              </div>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.1rem', color: '#383028', lineHeight: 1.2 }}>
                {daycareItem.taskName}
              </p>
            </div>
          </div>

          <p style={{ fontFamily: "'VT323', monospace", fontSize: '1rem', color: '#706858', lineHeight: 1.35 }}>
            A random Pokémon (1–151) will be assigned. Set a deadline to make this high-stakes!
          </p>

          {/* Deadline picker */}
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.4rem', color: '#706858', marginBottom: 4 }}>
              DEADLINE:
            </div>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'white', border: '2px solid #C0B8A8', borderRadius: 4,
                fontFamily: "'VT323', monospace", fontSize: '1.05rem',
                color: '#383028', padding: '5px 10px', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#68A0B0'}
              onBlur={e => e.target.style.borderColor = '#C0B8A8'}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{
              background: '#F0EDD8', border: '2px solid #E09078', borderRadius: 5,
              boxShadow: '2px 2px 0 rgba(200,120,96,0.4)',
              fontFamily: "'Press Start 2P', monospace", fontSize: '0.42rem',
              color: '#706858', cursor: 'pointer', padding: '5px 10px',
            }}>
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              disabled={!deadline}
              style={{
                background: '#68B0B0', border: '2px solid #408090', borderRadius: 5,
                boxShadow: '2px 2px 0 #408090',
                fontFamily: "'Press Start 2P', monospace", fontSize: '0.42rem',
                color: 'white', cursor: 'pointer', padding: '5px 10px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)', opacity: deadline ? 1 : 0.4,
              }}
            >
              HATCH! ▶
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Daycare Row ── */
function DaycareRow({ item, partyFull, onMoveToParty, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'white',
        border: '1px solid #D8D0B8',
        borderLeft: '3px solid #E09078',
        borderRadius: 4,
        padding: '7px 10px',
      }}
    >
      {/* Egg icon (exact URL from spec) */}
      <img
        src={EGG_URL}
        alt="Egg"
        style={{ width: 28, height: 28, imageRendering: 'pixelated', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none' }}
      />

      {/* Task name */}
      <span style={{
        fontFamily: "'VT323', monospace",
        fontSize: '1.15rem',
        color: '#383028',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}>
        {item.taskName}
      </span>

      {/* "Move to Party" button */}
      <button
        onClick={() => !partyFull && onMoveToParty(item)}
        disabled={partyFull}
        title={partyFull ? 'Party is full (max 6)' : 'Send to party with a deadline'}
        style={{
          background: partyFull ? '#EDE8D0' : '#68B0B0',
          border: `2px solid ${partyFull ? '#C0B8A8' : '#408090'}`,
          borderRadius: 4,
          boxShadow: partyFull ? 'none' : '2px 2px 0 #408090',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '0.35rem',
          color: partyFull ? '#A0988A' : 'white',
          cursor: partyFull ? 'not-allowed' : 'pointer',
          padding: '4px 7px',
          flexShrink: 0,
          letterSpacing: '-0.2px',
          opacity: partyFull ? 0.6 : 1,
          transition: 'all 0.1s',
          textShadow: partyFull ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        → PARTY
      </button>

      {/* Delete button */}
      <button
        onClick={() => onDelete(item.id)}
        title="Remove from daycare"
        style={{
          background: '#FFF0F0',
          border: '2px solid #E09078',
          borderRadius: 4,
          boxShadow: '2px 2px 0 rgba(200,120,96,0.4)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '0.35rem',
          color: '#D04030',
          cursor: 'pointer',
          padding: '4px 7px',
          flexShrink: 0,
          letterSpacing: '-0.2px',
        }}
      >
        ✕
      </button>
    </motion.div>
  )
}

/* ── Add to Daycare inline form ── */
function AddDaycareForm() {
  const { addNuzlockeTask } = useStore()
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addNuzlockeTask(text.trim(), null, null, 'daycare')
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6 }}>
      <span style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: '0.4rem',
        color: '#68A0B0', flexShrink: 0, lineHeight: 1, alignSelf: 'center',
      }}>▶</span>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a backlog task..."
        style={{
          flex: 1,
          background: 'white', border: '2px solid #C0B8A8', borderRadius: 4,
          fontFamily: "'VT323', monospace", fontSize: '1.1rem',
          color: '#383028', padding: '4px 8px', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#E09078'}
        onBlur={e => e.target.style.borderColor = '#C0B8A8'}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        style={{
          background: '#E09878', border: '2px solid #B87060', borderRadius: 5,
          boxShadow: '2px 2px 0 #B87060',
          fontFamily: "'Press Start 2P', monospace", fontSize: '0.38rem',
          color: 'white', cursor: 'pointer', padding: '5px 10px',
          flexShrink: 0, opacity: text.trim() ? 1 : 0.4,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        STORE
      </button>
    </form>
  )
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function NuzlockeParty() {
  const {
    party, daycare,
    fetchNuzlocke, addNuzlockeTask, updateNuzlockeStatus, nuzlockeLoading,
    checkFaintedTasks,
  } = useStore()

  const [showAddParty, setShowAddParty]       = useState(false)
  const [deadlineTarget, setDeadlineTarget]   = useState(null)

  /* Fetch from DB on mount + start faint-check interval */
  useEffect(() => {
    fetchNuzlocke()
    checkFaintedTasks()
    const id = setInterval(checkFaintedTasks, 60_000)
    return () => clearInterval(id)
  }, [fetchNuzlocke, checkFaintedTasks])

  /* Delete a daycare item from DB */
  const handleDeleteDaycare = useCallback(async (id) => {
    await supabase.from('nuzlocke_party').delete().eq('id', id)
    fetchNuzlocke()
  }, [fetchNuzlocke])

  /* Delete a party member from DB */
  const handleRemoveParty = useCallback(async (id) => {
    await supabase.from('nuzlocke_party').delete().eq('id', id)
    fetchNuzlocke()
  }, [fetchNuzlocke])

  const partyFull    = party.length >= 6
  const activeCount  = party.filter(p => p.status === 'active').length
  const faintedCount = party.filter(p => p.status === 'fainted').length
  const doneCount    = party.filter(p => p.status === 'completed').length

  /* Fill grid to always show 6 slots */
  const slotsToRender = [
    ...party,
    ...Array.from({ length: Math.max(0, 6 - party.length) }, (_, i) => ({ _empty: true, _key: i })),
  ]

  /* Loading skeleton — prevents flash of empty party */
  if (nuzlockeLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
        <div style={{
          background: '#F8F8ED', border: '4px solid #68A0B0', borderRadius: 8,
          overflow: 'hidden', boxShadow: '2px 2px 0 rgba(80,140,160,0.4), 0 4px 16px rgba(0,0,0,0.2)',
          padding: '12px 14px',
        }}>
          <div style={{
            background: '#68B0B0', height: 28, borderRadius: '6px 6px 0 0',
            marginBottom: 12, margin: '-12px -14px 12px',
          }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              height: 110, background: '#EDE8D0', border: '2px solid #C0B8A8',
              borderRadius: 6, marginBottom: 8,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>

      {/* ══════════════════════════════════════════
          SECTION A — THE NUZLOCKE PARTY
      ══════════════════════════════════════════ */}
      <div style={{
        background: '#F8F8ED',
        border: '4px solid #68A0B0',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(80,140,160,0.4), 0 4px 16px rgba(0,0,0,0.2)',
        flexShrink: 0,
      }}>
        {/* Header */}
        <G3Header icon="⚔️" rightSlot={
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {/* Stat chips */}
            {[
              { label: `${activeCount} ACTIVE`,  color: '#16a34a' },
              { label: `${faintedCount} FAINTED`, color: '#DC2626' },
              { label: `${doneCount} DONE`,       color: '#C89820' },
            ].map((chip, i) => (
              <span key={i} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: '0.33rem',
                color: chip.color, background: 'rgba(255,255,255,0.88)',
                border: `1px solid ${chip.color}`, borderRadius: 3,
                padding: '1px 4px', letterSpacing: '-0.2px',
              }}>
                {chip.label}
              </span>
            ))}
            {/* New party task button */}
            <motion.button
              onClick={() => setShowAddParty(v => !v)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: showAddParty ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: 4, color: 'white', cursor: 'pointer',
                fontFamily: "'Press Start 2P', monospace", fontSize: '0.35rem',
                padding: '2px 6px', letterSpacing: '-0.2px',
              }}
            >
              {showAddParty ? '✕' : '+ ADD'}
            </motion.button>
          </div>
        }>
          NUZLOCKE PARTY  ({party.length}/6)
        </G3Header>

        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Add Party Form */}
          <AnimatePresence>
            {showAddParty && (
              <AddPartyForm onClose={() => setShowAddParty(false)} />
            )}
          </AnimatePresence>

          {/* 6-slot grid (always visible, fills with empty slots) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}>
            <AnimatePresence mode="popLayout">
              {slotsToRender.map((item, i) =>
                item._empty ? (
                  <EmptySlot key={`empty-${item._key}`} />
                ) : (
                  <PartyCard
                    key={item.id}
                    member={item}
                    onComplete={(id) => updateNuzlockeStatus(id, 'completed')}
                    onRemove={handleRemoveParty}
                  />
                )
              )}
            </AnimatePresence>
          </div>

          {/* Nuzlocke lore tip */}
          <div style={{
            background: 'rgba(104,160,176,0.08)',
            border: '1px dashed #A8C8D0',
            borderRadius: 5,
            padding: '6px 10px',
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: "'VT323', monospace", fontSize: '0.95rem', color: '#706858', lineHeight: 1.35 }}>
              ☠ In Nuzlocke, if your Pokémon <strong>faints</strong>, it's gone forever. Don't let your deadlines lapse!
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION B — THE DAYCARE
      ══════════════════════════════════════════ */}
      <div style={{
        background: '#F8F8ED',
        border: '4px solid #E09078',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(200,120,96,0.4), 0 4px 16px rgba(0,0,0,0.2)',
        marginTop: 4,
      }}>
        <G3Header icon="🥚" rightSlot={
          <span style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: '0.33rem',
            color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.2px',
          }}>
            {daycare.length} EGGS
          </span>
        }>
          DAYCARE — BACKLOG
        </G3Header>

        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Add to Daycare form */}
          <AddDaycareForm />

          {/* Divider */}
          <div style={{ height: 1, background: '#D8D0B8', margin: '2px 0' }} />

          {/* Daycare list */}
          {daycare.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '18px 0',
              background: 'rgba(248,248,237,0.7)',
              border: '1px dashed #D8D0B8', borderRadius: 6,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🥚</div>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.05rem', color: '#A0988A' }}>
                No eggs in the Daycare! Add some backlog tasks.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <AnimatePresence mode="popLayout">
                {daycare.map(item => (
                  <DaycareRow
                    key={item.id}
                    item={item}
                    partyFull={partyFull}
                    onMoveToParty={(item) => setDeadlineTarget(item)}
                    onDelete={handleDeleteDaycare}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Party full warning */}
          {partyFull && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FFF0E8', border: '2px solid #E09078',
                borderRadius: 5, padding: '6px 10px', textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.38rem', color: '#C07060', letterSpacing: '-0.2px' }}>
                ⚠ PARTY FULL — Complete or release a member to hatch an egg!
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Deadline Modal (portal-style, rendered at end of tree) ── */}
      <AnimatePresence>
        {deadlineTarget && (
          <DeadlineModal
            daycareItem={deadlineTarget}
            onClose={() => setDeadlineTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
