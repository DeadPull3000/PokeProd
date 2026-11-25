import { motion } from 'framer-motion'
import { G3, getHpBarColor } from './tokens'

/**
 * Reusable Gen 3 HP / Progress bar with threshold coloring and low-HP pulse.
 */
export function HPBar({
  pct = 1,
  color,
  height = 10,
  showHeader = false,
  label = 'HP',
  rightLabel,
  pulseOnLow = true,
  isLowOverride,
}) {
  const clamped = Math.max(0, Math.min(1, pct))
  const barColor = color || getHpBarColor(clamped)
  const isLow = isLowOverride !== undefined ? isLowOverride : clamped < 0.2

  return (
    <div style={{ width: '100%' }}>
      {showHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span
            style={{
              fontFamily: G3.px,
              fontSize: '0.38rem',
              color: G3.textMuted,
              letterSpacing: '-0.2px',
            }}
          >
            {label}
          </span>
          {rightLabel !== undefined && (
            <span
              style={{
                fontFamily: G3.px,
                fontSize: '0.36rem',
                color: isLow ? '#ef4444' : G3.textMuted,
                letterSpacing: '-0.2px',
              }}
            >
              {rightLabel}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          background: '#383838',
          border: '2px solid #181818',
          height,
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        <motion.div
          className={pulseOnLow && isLow ? 'hp-red-pulse' : ''}
          style={{ height: '100%', background: barColor, borderRadius: 0 }}
          animate={{ width: `${clamped * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
