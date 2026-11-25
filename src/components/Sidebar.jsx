import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, useSettings, useUI, useXp, useBattle } from '../store'
import { XP_PER_LEVEL, NAV_ITEMS } from '../constants/gameData'
import { GYM_LEADERS } from '../constants/pokedex151'
import { G3Header, SpriteImage } from './ui'

/* ── SVG radar chart ── */
function RadarChart({ xpData, elements }) {
  const size = 118
  const cx = size / 2
  const cy = size / 2
  const r = 42
  const keys = Object.keys(elements)
  const n = keys.length
  const maxXP = Math.max(...Object.values(xpData), 1)

  const pt = (i, radius) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  const dataPath =
    keys
      .map((k, i) => {
        const pct = Math.min((xpData[k] || 0) / maxXP, 1)
        const p = pt(i, r * pct)
        return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
      })
      .join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="pixel-sprite">
      {[0.25, 0.5, 0.75, 1].map((lvl, li) => {
        const pts = keys.map((_, i) => pt(i, r * lvl))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={li} d={path} fill="none" stroke="rgba(56,48,40,0.12)" strokeWidth="1" />
      })}
      {keys.map((_, i) => {
        const outer = pt(i, r)
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(56,48,40,0.12)" strokeWidth="1" />
      })}
      <path d={dataPath} fill="rgba(56,160,176,0.18)" stroke="var(--g3-border-teal)" strokeWidth="2" strokeLinejoin="round" />
      {keys.map((k, i) => {
        const pct = Math.min((xpData[k] || 0) / maxXP, 1)
        if (pct < 0.05) return null
        const p = pt(i, r * pct)
        return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill={elements[k].color} stroke="white" strokeWidth="1.5" />
      })}
      {keys.map((k, i) => {
        const el = elements[k]
        const lp = pt(i, r + 13)
        return (
          <image
            key={i}
            href={el.itemSprite}
            x={(lp.x - 8).toFixed(0)}
            y={(lp.y - 8).toFixed(0)}
            width="16"
            height="16"
            style={{ imageRendering: 'pixelated' }}
          />
        )
      })}
    </svg>
  )
}

/* ── Compact Mobile Top Header (visible < 768px) ── */
export function MobileTrainerHeader({ xpData, elements, onSignOut }) {
  const { trainerLevel, totalXP } = useXp()
  const { trainerName, starterPokemon } = useSettings()
  const { isOffline } = useUI()
  const [showRadar, setShowRadar] = useState(false)
  const xpIntoLevel = totalXP % XP_PER_LEVEL

  return (
    <div className="mobile-only-nav flex-col gap-1.5 w-full flex-shrink-0">
      <div className="g3-panel-teal" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            position: 'relative',
            width: 38,
            height: 38,
            borderRadius: 5,
            background: 'linear-gradient(135deg, #E8E4D0 0%, #D0C8B0 100%)',
            border: '2px solid var(--g3-border-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {starterPokemon ? (
            <SpriteImage pokemonId={starterPokemon.id} alt={starterPokemon.name} size={32} />
          ) : (
            <span style={{ fontSize: '1.1rem' }}>🧢</span>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -6,
              background: '#F8E040',
              border: '1px solid #C8A820',
              borderRadius: 3,
              padding: '0 3px',
            }}
          >
            <span className="pk-label" style={{ fontSize: '0.3rem', color: '#604010', lineHeight: 1.4 }}>
              L{trainerLevel}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <span className="pk-label truncate" style={{ fontSize: '0.42rem', lineHeight: 1.4 }}>
              {trainerName}
            </span>
            <span className="hp-label" style={{ fontSize: '0.32rem', flexShrink: 0 }}>
              {xpIntoLevel}/{XP_PER_LEVEL} XP
            </span>
          </div>
          <div className="hp-bar-track" style={{ height: 5, marginTop: 3 }}>
            <div
              style={{
                background: 'var(--g3-accent-blue)',
                height: '100%',
                width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {isOffline && (
          <span className="pk-label pk-red" style={{ fontSize: '0.3rem' }}>OFFLINE</span>
        )}

        <button
          type="button"
          onClick={() => setShowRadar((v) => !v)}
          className="g3-btn g3-btn-sm g3-btn-cream"
          style={{ fontSize: '0.34rem', padding: '4px 6px' }}
          aria-label="Toggle type balance"
        >
          📊
        </button>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="g3-btn g3-btn-sm g3-btn-orange"
            style={{ fontSize: '0.34rem', padding: '4px 6px' }}
          >
            EXIT
          </button>
        )}
      </div>

      <AnimatePresence>
        {showRadar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="g3-panel-teal overflow-hidden"
          >
            <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 8 }}>
              <RadarChart xpData={xpData} elements={elements} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
                {Object.entries(elements).map(([key, el]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <img src={el.itemSprite} alt={el.itemName} className="pixel-sprite" style={{ width: 12, height: 12 }} />
                    <span className="hp-label" style={{ fontSize: '0.34rem', color: el.color }}>
                      {xpData[key] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Bottom Mobile Nav Bar (visible < 768px) ── */
export function MobileBottomNav() {
  const { activeTab, setActiveTab } = useUI()

  return (
    <nav
      aria-label="Mobile Navigation"
      className="mobile-only-nav g3-panel w-full flex-shrink-0"
      style={{
        padding: '4px 6px',
        gap: 4,
        overflowX: 'auto',
        borderRadius: 8,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              minWidth: 58,
              padding: '4px 6px',
              borderRadius: 5,
              flexShrink: 0,
              background: isActive ? 'rgba(104,176,176,0.22)' : 'transparent',
              border: isActive ? '2px solid var(--g3-border-teal)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.emoji}</span>
            <span
              className="pk-label"
              style={{
                fontSize: '0.28rem',
                lineHeight: 1.3,
                color: isActive ? 'var(--g3-header-dark)' : 'var(--g3-text)',
              }}
            >
              {item.shortLabel}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

/* ── Desktop Sidebar (>= 768px — preserves original Gen 3 layout) ── */
export default function Sidebar({ xpData, elements, onSignOut }) {
  const { activeTab, setActiveTab } = useUI()
  const { trainerLevel, totalXP } = useXp()
  const { trainerName, starterPokemon } = useSettings()
  const { user } = useAuth()
  const { gymBadges } = useBattle()

  const maxXP = Math.max(...Object.values(xpData), 1)
  const xpIntoLevel = totalXP % XP_PER_LEVEL
  const levelProgress = xpIntoLevel / XP_PER_LEVEL

  return (
    <aside
      className="desktop-only-sidebar"
      style={{ width: 244, flexShrink: 0, height: '100%', flexDirection: 'column', gap: 10, overflowY: 'auto' }}
    >
      {/* ── Trainer Card ── */}
      <div className="g3-panel-teal overflow-hidden">
        <G3Header icon="🏅" pillCount={3}>TRAINER CARD</G3Header>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <motion.div
            style={{ position: 'relative' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 5,
                background: 'linear-gradient(135deg, #E8E4D0 0%, #D0C8B0 100%)',
                border: '2px solid var(--g3-border-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 0 rgba(104,160,176,0.4)',
                overflow: 'hidden',
                gap: 2,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🧢</span>
              {starterPokemon && (
                <SpriteImage
                  pokemonId={starterPokemon.id}
                  alt={starterPokemon.name}
                  size={32}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                  }}
                />
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -5,
                left: -5,
                width: 24,
                height: 24,
                borderRadius: 4,
                background: '#F8E040',
                border: '2px solid #C8A820',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 0 #C8A820',
              }}
            >
              <span className="pk-label" style={{ fontSize: '0.38rem', color: '#604010' }}>
                L{trainerLevel}
              </span>
            </div>
          </motion.div>

          <div style={{ textAlign: 'center' }}>
            <div className="pk-label" style={{ fontSize: '0.52rem' }}>{trainerName}</div>
            <div className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', marginTop: 2 }}>
              {totalXP.toLocaleString()} XP TOTAL
            </div>
            {gymBadges.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                {gymBadges.map((b) => {
                  const g = GYM_LEADERS.find((l) => l.badgeType === b.badgeType)
                  return (
                    <span key={b.badgeType} title={g?.badgeName || b.badgeType} style={{ fontSize: '0.7rem', lineHeight: 1 }}>
                      {g?.badgeEmoji || '🏅'}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span className="hp-label" style={{ fontSize: '0.4rem' }}>EXP.</span>
              <span className="hp-label" style={{ fontSize: '0.4rem' }}>
                {xpIntoLevel}/{XP_PER_LEVEL} LVL UP
              </span>
            </div>
            <div className="hp-bar-track" style={{ height: 7 }}>
              <motion.div
                style={{ background: 'var(--g3-accent-blue)', height: '100%' }}
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress * 100}%` }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="g3-panel overflow-hidden">
        <G3Header icon="📋" pillCount={2}>NAVIGATION</G3Header>
        <nav style={{ padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            return (
              <motion.button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 8px',
                  borderRadius: 4,
                  background: isActive ? 'rgba(104,176,176,0.18)' : 'transparent',
                  border: isActive ? '1px solid var(--g3-border-teal)' : '1px solid transparent',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                whileHover={{ backgroundColor: 'rgba(104,176,176,0.1)' }}
                whileTap={{ scale: 0.97 }}
              >
                {isActive ? (
                  <span className="pk-label" style={{ fontSize: '0.4rem', color: 'var(--g3-header-dark)', width: 10, flexShrink: 0 }}>▶</span>
                ) : (
                  <span style={{ width: 10, flexShrink: 0 }} />
                )}
                <span style={{ fontSize: '1rem' }}>{item.emoji}</span>
                <span className="pk-label" style={{ fontSize: '0.46rem', color: isActive ? 'var(--g3-header-dark)' : 'var(--g3-text)' }}>
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* ── Type Balance ── */}
      <div className="g3-panel-teal overflow-hidden flex-1">
        <G3Header icon="📊" pillCount={2}>TYPE BALANCE</G3Header>
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {Object.entries(elements).map(([key, el]) => {
            const xp = xpData[key] || 0
            const pct = Math.min((xp / maxXP) * 100, 100)
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <img src={el.itemSprite} alt={el.itemName} className="pixel-sprite" style={{ width: 14, height: 14 }} />
                    <span className="hp-label" style={{ fontSize: '0.38rem', color: el.color }}>{el.label}</span>
                  </div>
                  <span className="hp-label" style={{ fontSize: '0.35rem', color: 'var(--g3-text-muted)' }}>{xp}</span>
                </div>
                <div className="hp-bar-track" style={{ height: 6 }}>
                  <motion.div
                    className="hp-bar-fill"
                    style={{ background: el.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )
          })}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <RadarChart xpData={xpData} elements={elements} />
          </div>
        </div>
      </div>

      {/* ── Sign Out ── */}
      {onSignOut && (
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          {user && (
            <div style={{ textAlign: 'center', marginBottom: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 6px' }}>
              <span className="pk-label" style={{ fontSize: '0.32rem', color: 'rgba(255,255,255,0.55)', wordBreak: 'break-all' }}>
                {user.email}
              </span>
            </div>
          )}
          <motion.button
            id="sidebar-sign-out"
            onClick={onSignOut}
            className="g3-btn g3-btn-orange"
            style={{ width: '100%', fontSize: '0.42rem' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            SIGN OUT
          </motion.button>
        </div>
      )}
    </aside>
  )
}
