import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

/* Mock ResizeObserver for Recharts / Framer Motion inside JSDOM */
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

/* Mock Audio so Pokémon cries / BGM never fail in JSDOM */
if (typeof window !== 'undefined') {
  window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
  window.HTMLMediaElement.prototype.pause = vi.fn()
  window.HTMLMediaElement.prototype.load = vi.fn()
}
