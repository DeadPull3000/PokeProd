import React from 'react'
import { motion } from 'framer-motion'
import { useStore, ELEMENTS } from '../store'

const NAV_ITEMS = [
  { id: 'journey',     emoji: '🗺️', label: 'JOURNEY'      },
  { id: 'safari',      emoji: '🌿', label: 'SAFARI ZONE'  },
  { id: 'nuzlocke',   emoji: '☠️', label: 'NUZLOCKE'     },
  { id: 'secretbase', emoji: '🏠', label: 'SECRET BASE'  },
  { id: 'dailyhabits',emoji: '🌦️', label: 'DAILY HABITS' },
  { id: 'raidhub',    emoji: '🗡️', label: 'RAID HUB'     },
  { id: 'battle',     emoji: '⚔️', label: 'BATTLE'       },
  { id: 'stats',      emoji: '📊', label: 'STATS'        },
  { id: 'settings',   emoji: '⚙️', label: 'SETTINGS'     },
]

/* ── SVG radar chart ── */
function RadarChart({ xpData, elements }) {
  const size = 118
  const cx = size / 2, cy = size / 2
  const r  = 42
  const keys = Object.keys(elements)
  const n = keys.length
  const maxXP = Math.max(...Object.values(xpData), 1)

  const pt = (i, radius) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  const dataPath = keys.map((k, i) => {
    const pct = Math.min((xpData[k] || 0) / maxXP, 1)
    const p = pt(i, r * pct)
    return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }).join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="pixel-sprite">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((lvl, li) => {
        const pts = keys.map((_, i) => pt(i, r * lvl))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={li} d={path} fill="none" stroke="rgba(56,48,40,0.12)" strokeWidth="1" />
      })}
      {/* Axes */}
      {keys.map((_, i) => {
        const outer = pt(i, r)
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(56,48,40,0.12)" strokeWidth="1" />
      })}
      {/* Data shape */}
      <path d={dataPath} fill="rgba(56,160,176,0.18)" stroke="var(--g3-border-teal)" strokeWidth="2" strokeLinejoin="round" />
      {/* Dots */}
      {keys.map((k, i) => {
        const pct = Math.min((xpData[k] || 0) / maxXP, 1)
        if (pct < 0.05) return null
        const p = pt(i, r * pct)
        return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill={elements[k].color} stroke="white" strokeWidth="1.5" />
      })}
      {/* Item sprite icons at axis tips */}
      {keys.map((k, i) => {
        const el = elements[k]
        const lp = pt(i, r + 13)
        return (
          <image key={i}
            href={el.itemSprite}
            x={(lp.x - 8).toFixed(0)} y={(lp.y - 8).toFixed(0)}
            width="16" height="16"
            style={{ imageRendering: 'pixelated' }}
          />
        )
      })}
    </svg>
  )
}

export default function Sidebar({ xpData, elements, onSignOut }) {
  const { activeTab, setActiveTab, trainerName, trainerLevel, totalXP, starterPokemon, user } = useStore()
  const maxXP = Math.max(...Object.values(xpData), 1)
  const levelProgress = (totalXP % 500) / 500

  const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'
  const starterGif = starterPokemon
    ? `${SPRITE_BASE}/pokemon/versions/generation-v/black-white/animated/${starterPokemon.id}.gif`
    : null
  const starterFallback = starterPokemon
    ? `${SPRITE_BASE}/pokemon/${starterPokemon.id}.png`
    : null

  return (
    <aside style={{ width: 244, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>

      {/* ── Trainer Card ── */}
      <div className="g3-panel-teal overflow-hidden">
        {/* Header bar */}
        <div className="g3-header">
          <span className="pk-label pk-white" style={{ fontSize: '0.46rem' }}>🏅 TRAINER CARD</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            <div className="g3-pill" /><div className="g3-pill" /><div className="g3-pill" />
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* Avatar with level badge */}
          <motion.div
            style={{ position: 'relative' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Avatar box — cap icon + starter sprite side by side */}
            <div style={{
              width: 64, height: 64, borderRadius: 5,
              background: 'linear-gradient(135deg, #E8E4D0 0%, #D0C8B0 100%)',
              border: '2px solid var(--g3-border-teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 rgba(104,160,176,0.4)',
              overflow: 'hidden',
              gap: 2,
              position: 'relative',
            }}>
              <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🧢</span>
              {starterGif && (
                <img
                  src={starterGif}
                  alt={starterPokemon.name}
                  onError={function(e) { e.target.src = starterFallback }}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 32, height: 32, imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                  }}
                />
              )}
            </div>
            {/* Level badge */}
            <div style={{
              position: 'absolute', bottom: -5, left: -5,
              width: 24, height: 24, borderRadius: 4,
              background: '#F8E040',
              border: '2px solid #C8A820',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 #C8A820',
            }}>
              <span className="pk-label" style={{ fontSize: '0.38rem', color: '#604010' }}>
                L{trainerLevel}
              </span>
            </div>
          </motion.div>

          {/* Name + XP */}
          <div style={{ textAlign: 'center' }}>
            <div className="pk-label" style={{ fontSize: '0.52rem' }}>{trainerName}</div>
            <div className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', marginTop: 2 }}>
              {totalXP.toLocaleString()} XP TOTAL
            </div>
          </div>

          {/* EXP bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span className="hp-label" style={{ fontSize: '0.4rem' }}>EXP.</span>
              <span className="hp-label" style={{ fontSize: '0.4rem' }}>
                {Math.round(levelProgress * 500)}/500
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
        <div className="g3-header">
          <span className="pk-label pk-white" style={{ fontSize: '0.46rem' }}>📋 NAVIGATION</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            <div className="g3-pill" /><div className="g3-pill" />
          </div>
        </div>
        <nav style={{ padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id
            return (
              <motion.button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 8px', borderRadius: 4,
                  background: isActive ? `rgba(104,176,176,0.18)` : 'transparent',
                  border: isActive ? `1px solid var(--g3-border-teal)` : '1px solid transparent',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
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
                <span className="pk-label" style={{
                  fontSize: '0.46rem',
                  color: isActive ? 'var(--g3-header-dark)' : 'var(--g3-text)',
                }}>
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* ── Trainer Balance ── */}
      <div className="g3-panel-teal overflow-hidden flex-1">
        <div className="g3-header">
          <span className="pk-label pk-white" style={{ fontSize: '0.46rem' }}>📊 TYPE BALANCE</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            <div className="g3-pill" /><div className="g3-pill" />
          </div>
        </div>
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* XP bars */}
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
          {/* Radar chart */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <RadarChart xpData={xpData} elements={elements} />
          </div>
        </div>
      </div>

      {/* ── Sign Out ── */}
      {onSignOut && (
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          {user && (
            <div style={{
              textAlign: 'center', marginBottom: 5,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 4, padding: '3px 6px',
            }}>
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
