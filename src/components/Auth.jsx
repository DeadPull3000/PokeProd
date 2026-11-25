import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { animSprite } from '../constants/gameData'
import { DialogueBox, G3Header } from './ui'

const OAK_SPRITE = animSprite(133)
const INTRO_TEXT =
  'Hello there! Welcome to the world of productivity! Are you a new trainer, or are you returning?'

function PixelLoader() {
  return (
    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', height: 24 }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          style={{ width: 10, height: 10, background: 'var(--g3-border-teal)', borderRadius: 1 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}

export default function Auth({ onSession }) {
  const [mode, setMode] = useState('choice')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function clearForm() {
    setEmail('')
    setPassword('')
    setError(null)
    setSuccess(null)
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)
    const result = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (result.error) {
      setError(result.error.message)
    } else if (onSession) {
      onSession(result.data.session)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)
    const result = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(false)
    if (result.error) {
      setError(result.error.message)
    } else if (result.data.session) {
      if (onSession) onSession(result.data.session)
    } else {
      setSuccess('Registration successful! Check your email to confirm your account, then log in.')
      setMode('login')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 30, 40, 0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="bg-[#F8F8ED] border-4 border-[#68A0B0]"
          style={{
            borderRadius: 6,
            boxShadow: '0 0 0 2px #F8F8ED, 0 0 0 4px #68A0B0, 0 8px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <G3Header pillCount={3} style={{ padding: '6px 14px' }}>
            PALLET TOWN TRAINER HUB
          </G3Header>

          <div className="flex flex-col sm:flex-row" style={{ minHeight: 160 }}>
            <div
              className="w-full sm:w-[130px] border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-[#68A0B0]"
              style={{
                flexShrink: 0,
                background: 'linear-gradient(180deg, #A8E8D8 0%, #78C8B8 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '10px 0 0',
              }}
            >
              <div style={{ position: 'relative', width: 96, height: 96 }}>
                <motion.div
                  style={{ position: 'absolute', top: 4, right: 4, fontSize: '0.7rem', lineHeight: 1 }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  ✦
                </motion.div>
                <motion.div
                  style={{ position: 'absolute', top: 14, left: 2, fontSize: '0.5rem', lineHeight: 1, opacity: 0.7 }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  ★
                </motion.div>
                <motion.img
                  src={OAK_SPRITE}
                  alt="Eevee"
                  style={{ width: 80, height: 80, imageRendering: 'pixelated', display: 'block', margin: '0 auto' }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div style={{ width: '100%', background: 'rgba(0,0,0,0.12)', padding: '4px 0', textAlign: 'center', marginTop: 4 }}>
                <span className="pk-label pk-white" style={{ fontSize: '0.38rem' }}>PROF. EEVEE</span>
              </div>
            </div>

            <div style={{ flex: 1, padding: '16px 14px 12px' }}>
              <p className="pk-dialogue-text" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#383028' }}>
                {mode === 'choice' ? (
                  <DialogueBox text={INTRO_TEXT} speed={22} />
                ) : mode === 'login' ? (
                  'Welcome back, Trainer! Enter your credentials to resume your journey.'
                ) : (
                  'So you are a new Trainer! Register your Pokedex account to begin!'
                )}
              </p>

              {mode === 'choice' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{ display: 'flex', gap: 8, marginTop: 14 }}
                >
                  <button
                    id="auth-login-btn"
                    className="g3-btn g3-btn-sm"
                    onClick={() => { clearForm(); setMode('login') }}
                    style={{ flex: 1, fontSize: '0.45rem' }}
                  >
                    RETURNING TRAINER
                  </button>
                  <button
                    id="auth-register-btn"
                    className="g3-btn g3-btn-sm g3-btn-orange"
                    onClick={() => { clearForm(); setMode('register') }}
                    style={{ flex: 1, fontSize: '0.45rem' }}
                  >
                    NEW TRAINER
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(mode === 'login' || mode === 'register') && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <form
                  onSubmit={mode === 'login' ? handleLogin : handleRegister}
                  style={{
                    borderTop: '3px solid #68A0B0',
                    padding: '14px 16px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="pk-label" style={{ fontSize: '0.45rem', color: '#68B0B0' }}>
                      {mode === 'login' ? 'TRAINER LOGIN' : 'NEW TRAINER REGISTRATION'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { clearForm(); setMode('choice') }}
                      className="pk-label"
                      style={{
                        fontSize: '0.38rem',
                        color: 'var(--g3-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontFamily: 'var(--font-pixel)',
                      }}
                    >
                      BACK
                    </button>
                  </div>

                  <div>
                    <label className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', display: 'block', marginBottom: 4 }}>
                      TRAINER EMAIL:
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trainer@pallettown.com"
                      className="g3-input"
                      style={{ fontSize: '1.05rem', padding: '5px 10px' }}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', display: 'block', marginBottom: 4 }}>
                      SECRET PASSWORD:
                    </label>
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="g3-input"
                      style={{ fontSize: '1.05rem', padding: '5px 10px' }}
                      required
                      minLength={6}
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          background: '#FFF0F0',
                          border: '2px solid var(--g3-accent-red)',
                          borderRadius: 4,
                          padding: '6px 10px',
                        }}
                      >
                        <p className="pk-dialogue-text" style={{ fontSize: '0.95rem', color: 'var(--g3-accent-red)' }}>
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          background: '#F0FFF4',
                          border: '2px solid #22c55e',
                          borderRadius: 4,
                          padding: '6px 10px',
                        }}
                      >
                        <p className="pk-dialogue-text" style={{ fontSize: '0.95rem', color: '#16a34a' }}>
                          {success}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {loading ? (
                      <div style={{ flex: 1 }}>
                        <PixelLoader />
                      </div>
                    ) : mode === 'login' ? (
                      <>
                        <button
                          id="auth-submit-login"
                          type="submit"
                          className="g3-btn"
                          style={{ flex: 1 }}
                          disabled={!email.trim() || !password}
                        >
                          LOGIN ▶
                        </button>
                        <button
                          id="auth-goto-register"
                          type="button"
                          className="g3-btn g3-btn-orange"
                          style={{ flex: 1, fontSize: '0.42rem' }}
                          onClick={() => { clearForm(); setMode('register') }}
                        >
                          REGISTER
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          id="auth-submit-register"
                          type="submit"
                          className="g3-btn g3-btn-orange"
                          style={{ flex: 1 }}
                          disabled={!email.trim() || !password}
                        >
                          REGISTER ▶
                        </button>
                        <button
                          id="auth-goto-login"
                          type="button"
                          className="g3-btn"
                          style={{ flex: 1, fontSize: '0.42rem' }}
                          onClick={() => { clearForm(); setMode('login') }}
                        >
                          LOGIN
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span className="pk-label" style={{ fontSize: '0.38rem', color: 'rgba(255,255,255,0.5)' }}>
            POKEDEX PRODUCTIVITY SYSTEM v2.0
          </span>
        </div>
      </motion.div>
    </div>
  )
}
