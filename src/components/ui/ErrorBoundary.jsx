import { Component } from 'react'
import { G3 } from './tokens'
import { G3Header } from './G3Header'
import { G3Panel } from './G3Panel'

/**
 * Gen 3 styled React ErrorBoundary so component crashes never produce a blank white screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, showDetails: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, showDetails: false })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div
        role="alert"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <G3Panel variant="orange" style={{ maxWidth: 460, width: '100%' }}>
          <G3Header icon="⚠️">WILD MISSINGNO. APPEARED!</G3Header>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontFamily: G3.vt, fontSize: '1.25rem', color: G3.text, lineHeight: 1.35 }}>
              Something unexpected glitched in this sector. Your saved cloud progress is safe!
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: '#FFF0F0',
                  border: `2px solid ${G3.accentRed}`,
                  borderRadius: 4,
                  padding: '6px 10px',
                }}
              >
                <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.accentRed }}>
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {this.state.error?.stack && (
                <button
                  type="button"
                  onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                  className="g3-btn g3-btn-sm g3-btn-cream"
                >
                  {this.state.showDetails ? 'HIDE LOG' : 'DETAILS'}
                </button>
              )}
              <button
                type="button"
                onClick={this.handleRetry}
                className="g3-btn g3-btn-sm"
              >
                USE FULL RESTORE ▶
              </button>
            </div>

            {this.state.showDetails && this.state.error?.stack && (
              <pre
                style={{
                  background: '#EDE8D0',
                  padding: 8,
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  maxHeight: 140,
                  overflow: 'auto',
                  color: G3.textMuted,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </G3Panel>
      </div>
    )
  }
}
