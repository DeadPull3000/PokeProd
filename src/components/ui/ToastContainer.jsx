import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../../store'
import { G3 } from './tokens'

const TYPE_STYLES = {
  success: { border: '#22c55e', badge: '#16a34a', icon: '✨' },
  error:   { border: '#D04030', badge: '#D04030', icon: '⚠️' },
  warning: { border: '#eab308', badge: '#ca8a04', icon: '⚡' },
  info:    { border: G3.borderTeal, badge: G3.headerBg, icon: '💬' },
}

/**
 * Gen 3 pixel-styled floating toast stack for optimistic updates & errors.
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useUI()

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        pointerEvents: 'none',
        maxWidth: '90vw',
        width: 360,
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              onClick={() => dismissToast(toast.id)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: G3.cream,
                border: `3px solid ${style.border}`,
                borderRadius: 6,
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
              }}
            >
              <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{style.icon}</span>
              <span
                style={{
                  fontFamily: G3.vt,
                  fontSize: '1.05rem',
                  color: G3.text,
                  flex: 1,
                  lineHeight: 1.25,
                }}
              >
                {toast.message}
              </span>
              <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.textMuted }}>✕</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
