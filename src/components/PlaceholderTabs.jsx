import { motion } from 'framer-motion'
import { G3Header } from './ui'

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
      <div
        style={{
          background: '#F8E040',
          border: '2px solid #C8A820',
          borderRadius: 4,
          padding: '2px 8px',
          boxShadow: '2px 2px 0 #C8A820',
        }}
      >
        <span className="pk-label" style={{ fontSize: '0.38rem', color: '#604010' }}>COMING SOON</span>
      </div>
    </motion.div>
  )
}

export function BattleTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <div className="g3-panel-teal overflow-hidden">
        <G3Header icon="⚔️" pillCount={3}>BATTLE ARENA</G3Header>
        <div style={{ padding: '10px 12px' }}>
          <p className="pk-dialogue-text" style={{ fontSize: '1.05rem', color: 'var(--g3-text-muted)' }}>
            Challenge your daily boss Pokémon to earn special rewards!
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <ComingSoonCard emoji="🐉" title="DAILY BOSS" description="Face off against a Legendary Pokémon by completing all your daily challenges." />
        <ComingSoonCard emoji="🏆" title="TRAINER DUEL" description="Battle other trainers by racing to complete tasks first in real time." />
        <ComingSoonCard emoji="🌀" title="TYPE GYM" description="Focus on one element type per day to earn coveted Gym Badges." />
        <ComingSoonCard emoji="🎴" title="CARD BATTLES" description="Unlock collectible Pokémon cards through task completion streaks." />
      </div>
    </div>
  )
}

export function StatsTab() {
  const stats = [
    { label: 'DAY STREAK', value: '7', suffix: '🔥', color: 'var(--g3-accent-red)' },
    { label: 'QUESTS DONE', value: '142', suffix: '', color: 'var(--g3-accent-green)' },
    { label: 'BADGES', value: '3', suffix: '🏅', color: 'var(--g3-accent-gold)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <div className="g3-panel-teal overflow-hidden">
        <G3Header icon="📊" pillCount={3}>TRAINER STATS</G3Header>
        <div style={{ padding: '10px 12px' }}>
          <p className="pk-dialogue-text" style={{ fontSize: '1.05rem', color: 'var(--g3-text-muted)' }}>
            Your adventure analytics and milestones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <ComingSoonCard emoji="📈" title="PROGRESS CHARTS" description="Visualize your productivity trends over weeks and months of play." />
        <ComingSoonCard emoji="🏅" title="ACHIEVEMENTS" description="Unlock special badges for consistent streaks and milestones reached." />
      </div>
    </div>
  )
}
