import { useEffect, useState } from 'react'
import { G3 } from './tokens'

/**
 * Gen 3 typewriter dialogue display without cascading synchronous setState lint issues.
 */
export function DialogueBox({ text = '', speed = 28, style, className = '' }) {
  const [step, setStep] = useState({ target: text, count: 0 })

  useEffect(() => {
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i += 1
      setStep({ target: text, count: i })
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  const count = step.target === text ? step.count : 0
  const displayed = text ? text.slice(0, count) : ''
  const isComplete = count >= text.length

  return (
    <span className={className} style={{ fontFamily: G3.vt, color: G3.text, ...style }}>
      {displayed}
      {!isComplete && (
        <span className="blink-cursor" style={{ fontFamily: G3.px, fontSize: '0.6em' }}>
          ▮
        </span>
      )}
    </span>
  )
}
