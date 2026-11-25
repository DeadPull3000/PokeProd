import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ui/ErrorBoundary'

function Bomb({ shouldThrow }) {
  if (shouldThrow) throw new Error('Corrupted save sector')
  return <div>All systems nominal</div>
}

describe('ErrorBoundary component', () => {
  it('catches runtime crashes cleanly and renders Gen 3 recovery UI', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let throwFlag = true
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={throwFlag} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/WILD MISSINGNO\. APPEARED!/i)).toBeInTheDocument()
    expect(screen.getByText(/Corrupted save sector/i)).toBeInTheDocument()

    throwFlag = false
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={throwFlag} />
      </ErrorBoundary>
    )
    fireEvent.click(screen.getByRole('button', { name: /USE FULL RESTORE/i }))
    expect(screen.getByText('All systems nominal')).toBeInTheDocument()
    spy.mockRestore()
  })
})
