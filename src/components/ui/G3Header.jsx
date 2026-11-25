import { G3 } from './tokens'

/**
 * Shared Gen 3 GBA section header bar with decorative white pills.
 */
export function G3Header({ children, icon, rightSlot, pillCount = 2, className = '', style }) {
  return (
    <div
      className={className}
      style={{
        background: G3.headerBg,
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: '4px 4px 0 0',
        ...style,
      }}
    >
      {Array.from({ length: pillCount }, (_, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        />
      ))}
      <span
        style={{
          fontFamily: G3.px,
          fontSize: '0.46rem',
          color: '#fff',
          letterSpacing: '-0.3px',
          lineHeight: 1.8,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {children}
      </span>
      {rightSlot && <div style={{ flexShrink: 0 }}>{rightSlot}</div>}
    </div>
  )
}
