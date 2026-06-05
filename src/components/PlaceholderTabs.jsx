import React from 'react'
import { motion } from 'framer-motion'

/* ── Gen 3 panel section header ── */
function SectionHeader({ icon, title }) {
  return (
    <div className="g3-header">
      <span className="pk-label pk-white" style={{ fontSize: '0.46rem' }}>{icon} {title}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
        <div className="g3-pill" /><div className="g3-pill" /><div className="g3-pill" />
      </div>
    </div>
  )
}

/* ── Coming Soon card ── */
function ComingSoonCard({ emoji, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="g3-panel"
      style={{ padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}
    >
      <div style={{ fontSize: '2rem' }}>{emoji}</div>
      <div className="pk-label" style={{ fontSize: '0.5rem' }}>{title}</div>
      <p className="pk-dialogue-text" style={{ fontSize: '1rem', color: 'var(--g3-text-muted)', lineHeight: 1.35 }}>
        {description}
      </p>
      <div style={{
        background: '#F8E040', border: '2px solid #C8A820',
        borderRadius: 4, padding: '2px 8px', boxShadow: '2px 2px 0 #C8A820',
      }}>
        <span className="pk-label" style={{ fontSize: '0.38rem', color: '#604010' }}>COMING SOON</span>
      </div>
    </motion.div>
  )
}

/* ── Battle tab ── */
export function BattleTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <div className="g3-panel-teal overflow-hidden">
        <SectionHeader icon="⚔️" title="BATTLE ARENA" />
        <div style={{ padding: '10px 12px' }}>
          <p className="pk-dialogue-text" style={{ fontSize: '1.05rem', color: 'var(--g3-text-muted)' }}>
            Challenge your daily boss Pokémon to earn special rewards!
          </p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ComingSoonCard emoji="🐉" title="DAILY BOSS"    description="Face off against a Legendary Pokémon by completing all your daily challenges." />
        <ComingSoonCard emoji="🏆" title="TRAINER DUEL"  description="Battle other trainers by racing to complete tasks first in real time." />
        <ComingSoonCard emoji="🌀" title="TYPE GYM"      description="Focus on one element type per day to earn coveted Gym Badges." />
        <ComingSoonCard emoji="🎴" title="CARD BATTLES"  description="Unlock collectible Pokémon cards through task completion streaks." />
      </div>
    </div>
  )
}

/* ── Stats tab ── */
export function StatsTab() {
  const stats = [
    { label: 'DAY STREAK', value: '7', suffix: '🔥', color: 'var(--g3-accent-red)' },
    { label: 'QUESTS DONE', value: '142', suffix: '', color: 'var(--g3-accent-green)' },
    { label: 'BADGES', value: '3', suffix: '🏅', color: 'var(--g3-accent-gold)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <div className="g3-panel-teal overflow-hidden">
        <SectionHeader icon="📊" title="TRAINER STATS" />
        <div style={{ padding: '10px 12px' }}>
          <p className="pk-dialogue-text" style={{ fontSize: '1.05rem', color: 'var(--g3-text-muted)' }}>
            Your adventure analytics and milestones.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="g3-panel"
            style={{ padding: '14px', textAlign: 'center' }}
          >
            <div className="pk-dialogue-text" style={{ fontSize: '2.2rem', color: s.color }}>
              {s.value}{s.suffix}
            </div>
            <div className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', marginTop: 4 }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ComingSoonCard emoji="📈" title="PROGRESS CHARTS" description="Visualize your productivity trends over weeks and months of play." />
        <ComingSoonCard emoji="🏅" title="ACHIEVEMENTS"    description="Unlock special badges for consistent streaks and milestones reached." />
      </div>
    </div>
  )
}

/* ── Settings tab ── */
export function SettingsTab() {
  const rows = [
    { label: 'TRAINER NAME',     value: 'TRAINER RED',  emoji: '🧢' },
    { label: 'STARTER POKEMON',  value: 'CYNDAQUIL 🔥',  emoji: '🎮' },
    { label: 'NOTIFICATIONS',    value: 'ENABLED',       emoji: '🔔' },
    { label: 'SOUND EFFECTS',    value: 'ON',            emoji: '🎵' },
    { label: 'BACKGROUND CYCLE', value: 'AUTO (TIME)',   emoji: '🌅' },
    { label: 'TIMER ANTI-CHEAT', value: 'ON',            emoji: '🛡️' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <div className="g3-panel-teal overflow-hidden">
        <SectionHeader icon="⚙️" title="OPTIONS" />
        <div style={{ padding: '10px 12px' }}>
          <p className="pk-dialogue-text" style={{ fontSize: '1.05rem', color: 'var(--g3-text-muted)' }}>
            Customize your adventure settings.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="g3-panel"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>{r.emoji}</span>
              <span className="pk-label" style={{ fontSize: '0.46rem' }}>{r.label}</span>
            </div>
            <span className="pk-dialogue-text" style={{ fontSize: '1rem', color: 'var(--g3-text-muted)' }}>
              {r.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
