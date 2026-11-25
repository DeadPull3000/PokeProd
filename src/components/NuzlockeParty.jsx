import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNuzlocke } from '../store'
import { SPRITE_BASE } from '../constants/gameData'
import { G3, G3Header, G3Panel, HPBar, SpriteImage } from './ui'

const EGG_URL = `${SPRITE_BASE}/items/pokemon-egg.png`
const TASK_DURATION_MS = 7 * 24 * 60 * 60 * 1000

function calcHpPct(deadline) {
  const deadlineMs = new Date(deadline).getTime()
  const now = Date.now()
  const createdMs = deadlineMs - TASK_DURATION_MS
  const elapsed = now - createdMs
  const pct = 1 - elapsed / TASK_DURATION_MS
  return Math.max(0, Math.min(1, pct))
}

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

function RibbonBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      title="Task Completed!"
      style={{
        width: 22,
        height: 22,
        background: 'radial-gradient(circle at 35% 35%, #FFE060, #C89820)',
        borderRadius: '50%',
        border: '2px solid #A07810',
        boxShadow: '0 0 8px 2px rgba(200,150,30,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '0.65rem',
        lineHeight: 1,
      }}
    >
      🎀
    </motion.div>
  )
}

function FaintedBanner() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        borderRadius: 6,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: G3.px,
          fontSize: '0.55rem',
          color: '#ef4444',
          letterSpacing: '-0.3px',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          lineHeight: 1.8,
        }}
      >
        ☠ FAINTED
      </span>
      <span style={{ fontFamily: G3.vt, fontSize: '0.95rem', color: '#fca5a5', marginTop: 2 }}>
        Deadline passed!
      </span>
    </div>
  )
}

function PartyCard({ member, onComplete, onRemove }) {
  const [pct, setPct] = useState(() => calcHpPct(member.deadline))
  const [countdown, setCountdown] = useState(() => formatCountdown(member.deadline))

  useEffect(() => {
    if (member.status !== 'active') return
    const id = setInterval(() => {
      setPct(calcHpPct(member.deadline))
      setCountdown(formatCountdown(member.deadline))
    }, 60_000)
    return () => clearInterval(id)
  }, [member.deadline, member.status])

  const isFainted = member.status === 'fainted'
  const isCompleted = member.status === 'completed'
  const isDisabled = isFainted || isCompleted

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      transition={{ duration: 0.25 }}
      style={{
        background: G3.cream,
        border: `4px solid ${isFainted ? '#6B7280' : G3.borderTeal}`,
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
      {isFainted && <FaintedBanner />}

      <div
        style={{
          width: 90,
          height: 90,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginRight: 10,
        }}
      >
        {!isFainted && (
          <div
            style={{
              position: 'absolute',
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: isCompleted
                ? 'radial-gradient(circle, rgba(200,150,30,0.2), transparent 70%)'
                : 'radial-gradient(circle, rgba(104,160,176,0.15), transparent 70%)',
            }}
          />
        )}
        <motion.div
          animate={!isFainted && !isCompleted ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <SpriteImage
            pokemonId={member.pokemonId}
            size={80}
            enableCry
            style={{
              filter: isFainted
                ? 'grayscale(100%) brightness(0.5)'
                : isCompleted
                ? 'drop-shadow(0 0 6px rgba(200,150,30,0.8))'
                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              transition: 'filter 0.4s',
            }}
          />
        </motion.div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isCompleted && <RibbonBadge />}
          <p
            style={{
              fontFamily: G3.vt,
              fontSize: '1.15rem',
              color: isFainted ? '#DC2626' : isCompleted ? '#065F46' : G3.text,
              textDecoration: isFainted ? 'line-through' : 'none',
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
              lineHeight: 1.2,
            }}
          >
            {member.taskName}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>
            {isCompleted ? '🏅' : isFainted ? '💀' : pct < 0.2 ? '🚨' : pct < 0.5 ? '⚠️' : '⏱️'}
          </span>
          <span
            style={{
              fontFamily: G3.px,
              fontSize: '0.38rem',
              color: isFainted ? '#DC2626' : pct < 0.2 ? '#ef4444' : pct < 0.5 ? '#ca8a04' : '#16a34a',
              letterSpacing: '-0.2px',
              lineHeight: 1.8,
            }}
          >
            {isCompleted
              ? 'COMPLETED!'
              : isFainted
              ? new Date(member.deadline).toLocaleDateString()
              : countdown}
          </span>
        </div>

        <HPBar
          pct={isCompleted ? 1 : pct}
          color={isCompleted ? '#22c55e' : undefined}
          showHeader
          rightLabel={isCompleted ? 'DONE!' : `${Math.round(pct * 100)}%`}
          isLowOverride={pct < 0.2 && member.status === 'active'}
        />

        {!isDisabled && (
          <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
            <button
              onClick={() => onComplete(member.id)}
              className="g3-btn g3-btn-sm"
              style={{ flex: 1, fontSize: '0.38rem', padding: '4px 0' }}
            >
              ✓ COMPLETE
            </button>
          </div>
        )}

        {isDisabled && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <button
              onClick={() => onRemove(member.id)}
              style={{
                background: '#FFF0F0',
                border: `2px solid ${G3.borderOrange}`,
                borderRadius: 4,
                boxShadow: '2px 2px 0 #C07060',
                fontFamily: G3.px,
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

function EmptySlot() {
  return (
    <div
      style={{
        background: 'rgba(248,248,237,0.5)',
        border: '3px dashed #A8C8C8',
        borderRadius: 8,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
        opacity: 0.65,
      }}
    >
      <span style={{ fontSize: '1.6rem', opacity: 0.5 }}>➕</span>
      <span style={{ fontFamily: G3.px, fontSize: '0.35rem', color: '#88A8A8', letterSpacing: '-0.2px' }}>
        EMPTY SLOT
      </span>
    </div>
  )
}

function AddPartyForm({ onClose }) {
  const { addNuzlockeTask, party } = useNuzlocke()
  const [taskName, setTaskName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [pokemonId, setPokemonId] = useState(() => Math.floor(Math.random() * 151) + 1)

  const handleReroll = () => setPokemonId(Math.floor(Math.random() * 151) + 1)

  const handleSubmit = () => {
    if (!taskName.trim() || !deadline) return
    addNuzlockeTask(taskName.trim(), pokemonId, new Date(deadline).toISOString(), 'party')
    onClose()
  }

  const slotsFull = party.length >= 6

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <G3Panel variant="teal">
        <G3Header
          icon="➕"
          rightSlot={
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 3,
                color: 'white',
                width: 18,
                height: 18,
                cursor: 'pointer',
                fontFamily: G3.px,
                fontSize: '0.4rem',
              }}
            >
              ✕
            </button>
          }
        >
          ADD TO PARTY
        </G3Header>
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {slotsFull ? (
            <p style={{ fontFamily: G3.vt, fontSize: '1.1rem', color: G3.accentRed, textAlign: 'center' }}>
              ⚠️ Party is full! Complete or release a member first.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    background: G3.creamDark,
                    border: '2px solid #C0B8A8',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <SpriteImage pokemonId={pokemonId} size={60} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.textMuted }}>
                    #{String(pokemonId).padStart(3, '0')}
                  </span>
                  <button
                    onClick={handleReroll}
                    className="g3-btn g3-btn-sm g3-btn-cream"
                    style={{ fontSize: '0.38rem' }}
                  >
                    🎲 RE-ROLL
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.textMuted, marginBottom: 4 }}>
                  TASK NAME:
                </div>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="What's at stake this week?"
                  autoFocus
                  className="g3-input"
                  style={{ fontSize: '1.15rem', padding: '5px 10px' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <div>
                <div style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.textMuted, marginBottom: 4 }}>
                  DEADLINE:
                </div>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="g3-input"
                  style={{ fontSize: '1.05rem', padding: '5px 10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={onClose} className="g3-btn g3-btn-sm g3-btn-cream">CANCEL</button>
                <button
                  onClick={handleSubmit}
                  disabled={!taskName.trim() || !deadline}
                  className="g3-btn g3-btn-sm"
                >
                  SEND OUT ▶
                </button>
              </div>
            </>
          )}
        </div>
      </G3Panel>
    </motion.div>
  )
}

function DeadlineModal({ daycareItem, onClose }) {
  const { addNuzlockeTask, deleteNuzlockeItem } = useNuzlocke()
  const [deadline, setDeadline] = useState('')

  const handleConfirm = async () => {
    if (!deadline) return
    const pokemonId = Math.floor(Math.random() * 151) + 1
    await deleteNuzlockeItem(daycareItem.id)
    await addNuzlockeTask(daycareItem.taskName, pokemonId, new Date(deadline).toISOString(), 'party')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 380 }}
      >
        <G3Panel variant="orange">
          <G3Header icon="🥚">HATCH FROM DAYCARE</G3Header>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={EGG_URL} alt="Pokémon Egg" style={{ width: 40, height: 40, imageRendering: 'pixelated', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: G3.px, fontSize: '0.38rem', color: G3.textMuted, marginBottom: 3 }}>
                  SENDING TO PARTY:
                </div>
                <p style={{ fontFamily: G3.vt, fontSize: '1.1rem', color: G3.text, lineHeight: 1.2 }}>
                  {daycareItem.taskName}
                </p>
              </div>
            </div>

            <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, lineHeight: 1.35 }}>
              A random Pokémon (1–151) will be assigned. Set a deadline to make this high-stakes!
            </p>

            <div>
              <div style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.textMuted, marginBottom: 4 }}>
                DEADLINE:
              </div>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                autoFocus
                className="g3-input"
                style={{ fontSize: '1.05rem', padding: '5px 10px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="g3-btn g3-btn-sm g3-btn-cream">CANCEL</button>
              <button onClick={handleConfirm} disabled={!deadline} className="g3-btn g3-btn-sm">
                HATCH! ▶
              </button>
            </div>
          </div>
        </G3Panel>
      </motion.div>
    </motion.div>
  )
}

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
        borderLeft: `3px solid ${G3.borderOrange}`,
        borderRadius: 4,
        padding: '7px 10px',
      }}
    >
      <img
        src={EGG_URL}
        alt="Egg"
        style={{ width: 28, height: 28, imageRendering: 'pixelated', flexShrink: 0 }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />

      <span
        style={{
          fontFamily: G3.vt,
          fontSize: '1.15rem',
          color: G3.text,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
        }}
      >
        {item.taskName}
      </span>

      <button
        onClick={() => !partyFull && onMoveToParty(item)}
        disabled={partyFull}
        title={partyFull ? 'Party is full (max 6)' : 'Send to party with a deadline'}
        className="g3-btn g3-btn-sm"
        style={{ fontSize: '0.35rem', padding: '4px 7px' }}
      >
        → PARTY
      </button>

      <button
        onClick={() => onDelete(item.id)}
        title="Remove from daycare"
        style={{
          background: '#FFF0F0',
          border: `2px solid ${G3.borderOrange}`,
          borderRadius: 4,
          boxShadow: '2px 2px 0 rgba(200,120,96,0.4)',
          fontFamily: G3.px,
          fontSize: '0.35rem',
          color: G3.accentRed,
          cursor: 'pointer',
          padding: '4px 7px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </motion.div>
  )
}

function AddDaycareForm() {
  const { addNuzlockeTask } = useNuzlocke()
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addNuzlockeTask(text.trim(), null, null, 'daycare')
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6 }}>
      <span style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.borderTeal, flexShrink: 0, lineHeight: 1, alignSelf: 'center' }}>
        ▶
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a backlog task..."
        className="g3-input"
        style={{ flex: 1, fontSize: '1.1rem', padding: '4px 8px' }}
      />
      <button type="submit" disabled={!text.trim()} className="g3-btn g3-btn-sm g3-btn-orange">
        STORE
      </button>
    </form>
  )
}

export default function NuzlockeParty() {
  const {
    party,
    daycare,
    fetchNuzlocke,
    updateNuzlockeStatus,
    deleteNuzlockeItem,
    nuzlockeLoading,
    checkFaintedTasks,
  } = useNuzlocke()

  const [showAddParty, setShowAddParty] = useState(false)
  const [deadlineTarget, setDeadlineTarget] = useState(null)

  useEffect(() => {
    fetchNuzlocke()
    checkFaintedTasks()
    const id = setInterval(checkFaintedTasks, 60_000)
    return () => clearInterval(id)
  }, [fetchNuzlocke, checkFaintedTasks])

  const handleDeleteDaycare = useCallback((id) => deleteNuzlockeItem(id), [deleteNuzlockeItem])
  const handleRemoveParty = useCallback((id) => deleteNuzlockeItem(id), [deleteNuzlockeItem])

  const partyFull = party.length >= 6
  const activeCount = party.filter((p) => p.status === 'active').length
  const faintedCount = party.filter((p) => p.status === 'fainted').length
  const doneCount = party.filter((p) => p.status === 'completed').length

  const slotsToRender = [
    ...party,
    ...Array.from({ length: Math.max(0, 6 - party.length) }, (_, i) => ({ _empty: true, _key: i })),
  ]

  if (nuzlockeLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
        <G3Panel variant="teal" style={{ padding: '12px 14px' }}>
          <div style={{ background: G3.headerBg, height: 28, borderRadius: '6px 6px 0 0', margin: '-12px -14px 12px' }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 110,
                background: G3.creamDark,
                border: '2px solid #C0B8A8',
                borderRadius: 6,
                marginBottom: 8,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </G3Panel>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header
          icon="⚔️"
          rightSlot={
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { label: `${activeCount} ACTIVE`, color: '#16a34a' },
                { label: `${faintedCount} FAINTED`, color: '#DC2626' },
                { label: `${doneCount} DONE`, color: '#C89820' },
              ].map((chip, i) => (
                <span
                  key={i}
                  className="hidden sm:inline-block"
                  style={{
                    fontFamily: G3.px,
                    fontSize: '0.33rem',
                    color: chip.color,
                    background: 'rgba(255,255,255,0.88)',
                    border: `1px solid ${chip.color}`,
                    borderRadius: 3,
                    padding: '1px 4px',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {chip.label}
                </span>
              ))}
              <motion.button
                onClick={() => setShowAddParty((v) => !v)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: showAddParty ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: 4,
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: G3.px,
                  fontSize: '0.35rem',
                  padding: '2px 6px',
                  letterSpacing: '-0.2px',
                }}
              >
                {showAddParty ? '✕' : '+ ADD'}
              </motion.button>
            </div>
          }
        >
          NUZLOCKE PARTY ({party.length}/6)
        </G3Header>

        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>{showAddParty && <AddPartyForm onClose={() => setShowAddParty(false)} />}</AnimatePresence>

          <div className="nuzlocke-grid">
            <AnimatePresence mode="popLayout">
              {slotsToRender.map((item) =>
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

          <div
            style={{
              background: 'rgba(104,160,176,0.08)',
              border: '1px dashed #A8C8D0',
              borderRadius: 5,
              padding: '6px 10px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontFamily: G3.vt, fontSize: '0.95rem', color: G3.textMuted, lineHeight: 1.35 }}>
              ☠ In Nuzlocke, if your Pokémon <strong>faints</strong>, it&apos;s gone forever. Don&apos;t let your deadlines lapse!
            </p>
          </div>
        </div>
      </G3Panel>

      <G3Panel variant="orange" style={{ marginTop: 4, flexShrink: 0 }}>
        <G3Header
          icon="🥚"
          rightSlot={
            <span style={{ fontFamily: G3.px, fontSize: '0.33rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.2px' }}>
              {daycare.length} EGGS
            </span>
          }
        >
          DAYCARE — BACKLOG
        </G3Header>

        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AddDaycareForm />
          <div style={{ height: 1, background: '#D8D0B8', margin: '2px 0' }} />

          {daycare.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '18px 0',
                background: 'rgba(248,248,237,0.7)',
                border: '1px dashed #D8D0B8',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🥚</div>
              <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: '#A0988A' }}>
                No eggs in the Daycare! Add some backlog tasks.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <AnimatePresence mode="popLayout">
                {daycare.map((item) => (
                  <DaycareRow
                    key={item.id}
                    item={item}
                    partyFull={partyFull}
                    onMoveToParty={(target) => setDeadlineTarget(target)}
                    onDelete={handleDeleteDaycare}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {partyFull && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FFF0E8',
                border: `2px solid ${G3.borderOrange}`,
                borderRadius: 5,
                padding: '6px 10px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: G3.px, fontSize: '0.38rem', color: '#C07060', letterSpacing: '-0.2px' }}>
                ⚠ PARTY FULL — Complete or release a member to hatch an egg!
              </p>
            </motion.div>
          )}
        </div>
      </G3Panel>

      <AnimatePresence>
        {deadlineTarget && <DeadlineModal daycareItem={deadlineTarget} onClose={() => setDeadlineTarget(null)} />}
      </AnimatePresence>
    </div>
  )
}
