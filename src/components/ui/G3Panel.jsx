import { G3 } from './tokens'

/**
 * Shared Gen 3 cream panel container with teal or orange border.
 */
export function G3Panel({ variant = 'teal', children, style, className = '' }) {
  const isTeal = variant === 'teal'
  const borderColor = isTeal ? G3.borderTeal : G3.borderOrange
  const shadowColor = isTeal ? 'rgba(80,140,160,0.35)' : 'rgba(200,120,96,0.35)'

  return (
    <div
      className={className}
      style={{
        background: G3.cream,
        border: `4px solid ${borderColor}`,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: `2px 2px 0 ${shadowColor}, 0 4px 16px rgba(0,0,0,0.18)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
