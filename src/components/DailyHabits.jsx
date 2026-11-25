import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabits } from '../store'
import { shinySprite, shinyStatic, mapWeatherCode } from '../constants/gameData'
import { G3, G3Header, G3Panel } from './ui'

function shinyOdds(streak) {
  if (streak <= 2) return { label: '1/4096', tier: 0 }
  if (streak <= 6) return { label: '1/1000', tier: 1 }
  if (streak <= 14) return { label: '1/100', tier: 2 }
  return { label: '1/20', tier: 3 }
}

const ODDS_COLORS = ['#706858', '#ca8a04', '#dc2626', '#9333ea']
const todayStr = () => new Date().toISOString().slice(0, 10)

function WeatherModule() {
  const { weather, setWeather } = useHabits()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=28.99&longitude=77.01&current_weather=true'
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Network error')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const code = data.current_weather?.weathercode
        const mapped = mapWeatherCode(code != null ? code : 0)
        setWeather(mapped.condition, mapped.typeBoost, mapped.icon, mapped.color)
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not reach Weather Server')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [setWeather])

  return (
    <G3Panel variant="teal" style={{ flexShrink: 0 }}>
      <G3Header
        icon="📡"
        rightSlot={
          loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
            />
          ) : null
        }
      >
        POKéMON WIRELESS CLUB - WEATHER REPORT
      </G3Header>

      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.div
            animate={loading ? {} : { scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 62,
              height: 62,
              background: loading ? G3.creamDark : weather.color + '18',
              border: '3px solid ' + (loading ? '#D8D0B8' : weather.color),
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: loading ? 'none' : '0 0 14px 4px ' + weather.color + '30',
              flexShrink: 0,
              transition: 'border-color 0.6s, box-shadow 0.6s',
            }}
          >
            {loading ? '🌐' : weather.icon}
          </motion.div>

          <div>
            <div
              style={{
                fontFamily: G3.px,
                fontSize: '0.55rem',
                color: loading ? G3.textMuted : weather.color,
                letterSpacing: '-0.3px',
                lineHeight: 1.8,
                textShadow: loading ? 'none' : '0 1px 3px ' + weather.color + '40',
                transition: 'color 0.6s',
              }}
            >
              {loading ? 'FETCHING...' : weather.condition.toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: '0.7rem' }}>📍</span>
              <span style={{ fontFamily: G3.vt, fontSize: '0.95rem', color: G3.textMuted }}>Sonipat, Haryana</span>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 200,
            background: 'white',
            border: '3px solid ' + G3.borderTeal,
            borderRadius: 6,
            padding: '10px 14px',
            position: 'relative',
            boxShadow: '2px 2px 0 rgba(80,140,160,0.25)',
          }}
        >
          {error ? (
            <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: '#dc2626', lineHeight: 1.4 }}>
              ⚠️ {error}. Defaulting to Clear skies!
            </p>
          ) : loading ? (
            <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.textMuted, lineHeight: 1.4 }}>
              Connecting to Pokémon Wireless Club...
            </p>
          ) : (
            <p style={{ fontFamily: G3.vt, fontSize: '1.12rem', color: G3.text, lineHeight: 1.5 }}>
              It is currently <strong style={{ color: weather.color }}>{weather.condition}</strong> outside!{' '}
              <strong style={{ color: weather.color }}>{weather.typeBoost}</strong>-type tasks grant{' '}
              <span
                style={{
                  background: weather.color + '18',
                  border: '1px solid ' + weather.color,
                  borderRadius: 3,
                  padding: '0 4px',
                  color: weather.color,
                  fontWeight: 'bold',
                }}
              >
                double XP
              </span>{' '}
              today!
            </p>
          )}
        </div>

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <div style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.textMuted, marginBottom: 2 }}>ACTIVE BOOST:</div>
            {weather.typeBoost.split(' & ').map((type, i) => (
              <div
                key={i}
                style={{
                  background: weather.color + '18',
                  border: '2px solid ' + weather.color,
                  borderRadius: 4,
                  padding: '3px 8px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontFamily: G3.px, fontSize: '0.36rem', color: weather.color, letterSpacing: '-0.2px' }}>
                  {type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </G3Panel>
  )
}

function ShinyModal({ shiny, onClose }) {
  if (!shiny) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 360, width: '100%' }}
      >
        <G3Panel variant="teal">
          <G3Header icon="✨">A SHINY POKéMON APPEARED!</G3Header>
          <div style={{ padding: '20px 24px', textAlign: 'center' }}>
            <motion.div
              animate={{ boxShadow: ['0 0 20px 6px rgba(255,215,0,0.4)', '0 0 40px 12px rgba(255,215,0,0.8)', '0 0 20px 6px rgba(255,215,0,0.4)'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
                background: 'radial-gradient(circle, rgba(255,215,0,0.2), transparent 70%)',
                borderRadius: '50%',
                marginBottom: 12,
              }}
            >
              <motion.img
                src={shinySprite(shiny.pokemonId)}
                alt={'Shiny Pokemon #' + shiny.pokemonId}
                onError={(e) => { e.currentTarget.src = shinyStatic(shiny.pokemonId) }}
                style={{ width: 96, height: 96, imageRendering: 'pixelated' }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            <div style={{ fontSize: '1.4rem', marginBottom: 10, letterSpacing: 6 }}>✨⭐✨</div>
            <p style={{ fontFamily: G3.vt, fontSize: '1.2rem', color: G3.text, lineHeight: 1.5, marginBottom: 6 }}>
              Pokémon <strong style={{ color: '#9333ea' }}>#{shiny.pokemonId}</strong> is a{' '}
              <strong style={{ color: '#ca8a04' }}>SHINY</strong>!
            </p>
            <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, lineHeight: 1.4, marginBottom: 16 }}>
              Your streak paid off! It has been added to your Shiny Box.
            </p>

            <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="g3-btn g3-btn-sm">
              GOTCHA! ▶
            </motion.button>
          </div>
        </G3Panel>
      </motion.div>
    </motion.div>
  )
}

function StreakBar({ streak }) {
  const pct = Math.min(streak / 20, 1)
  const barColor = streak <= 2 ? '#22c55e' : streak <= 6 ? '#eab308' : streak <= 14 ? '#f97316' : '#9333ea'
  return (
    <div style={{ width: '100%', marginTop: 3 }}>
      <div style={{ height: 5, background: '#E8E0D0', border: '1px solid #D0C8B0', borderRadius: 0, overflow: 'hidden' }}>
        <motion.div style={{ height: '100%', background: barColor, borderRadius: 0 }} initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

function HabitRow({ habit, onComplete, onDelete }) {
  const doneToday = Boolean(habit.lastCompleted && habit.lastCompleted.slice(0, 10) === todayStr())
  const odds = shinyOdds(habit.streak)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: doneToday ? 'rgba(104,176,176,0.07)' : 'white',
        border: '1px solid',
        borderColor: doneToday ? '#A8C8D0' : '#D8D0B8',
        borderLeft: '4px solid ' + (doneToday ? G3.borderTeal : G3.borderOrange),
        borderRadius: 4,
        padding: '8px 10px',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <motion.button
        onClick={() => !doneToday && onComplete(habit.id)}
        whileHover={doneToday ? {} : { scale: 1.15 }}
        whileTap={doneToday ? {} : { scale: 0.9 }}
        aria-label={`Complete habit ${habit.name}`}
        style={{
          width: 22,
          height: 22,
          flexShrink: 0,
          border: '2px solid ' + (doneToday ? G3.borderTeal : G3.borderOrange),
          borderRadius: 3,
          background: doneToday ? G3.borderTeal : 'white',
          cursor: doneToday ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, border-color 0.2s',
          boxShadow: doneToday ? '0 0 6px 2px rgba(104,160,176,0.3)' : 'none',
        }}
      >
        {doneToday && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'white', fontSize: '0.6rem', lineHeight: 1, fontWeight: 'bold' }}>
            ✓
          </motion.span>
        )}
      </motion.button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: G3.vt,
              fontSize: '1.1rem',
              color: doneToday ? G3.textMuted : G3.text,
              lineHeight: 1.2,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {habit.name}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              background:
                habit.streak >= 15
                  ? 'rgba(147,51,234,0.12)'
                  : habit.streak >= 7
                  ? 'rgba(249,115,22,0.1)'
                  : habit.streak >= 3
                  ? 'rgba(234,179,8,0.1)'
                  : '#F0EDD8',
              border:
                '1px solid ' +
                (habit.streak >= 15 ? '#9333ea' : habit.streak >= 7 ? '#f97316' : habit.streak >= 3 ? '#eab308' : '#D8D0B8'),
              borderRadius: 3,
              padding: '1px 5px',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '0.65rem' }}>
              {habit.streak >= 15 ? '💜' : habit.streak >= 7 ? '🔥' : habit.streak >= 3 ? '⭐' : '·'}
            </span>
            <span
              style={{
                fontFamily: G3.px,
                fontSize: '0.33rem',
                color: habit.streak >= 15 ? '#9333ea' : habit.streak >= 7 ? '#f97316' : habit.streak >= 3 ? '#ca8a04' : G3.textMuted,
                letterSpacing: '-0.1px',
              }}
            >
              {habit.streak}d
            </span>
          </div>
        </div>

        <StreakBar streak={habit.streak} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted }}>{habit.streak} Day Streak</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.65rem' }}>✨</span>
            <span style={{ fontFamily: G3.px, fontSize: '0.3rem', color: ODDS_COLORS[odds.tier], letterSpacing: '-0.1px' }}>
              Odds: {odds.label}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(habit.id)}
        aria-label={`Delete habit ${habit.name}`}
        style={{
          width: 20,
          height: 20,
          flexShrink: 0,
          background: '#FFF0F0',
          border: `1px solid ${G3.borderOrange}`,
          borderRadius: 3,
          cursor: 'pointer',
          color: '#C07060',
          fontFamily: G3.px,
          fontSize: '0.35rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </motion.div>
  )
}

function AddHabitForm() {
  const { addHabitToDb } = useHabits()
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    addHabitToDb(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6 }}>
      <span style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.borderOrange, flexShrink: 0, lineHeight: 1, alignSelf: 'center' }}>
        ▶
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a daily habit..."
        className="g3-input"
        style={{ flex: 1, fontSize: '1.1rem', padding: '4px 8px' }}
      />
      <motion.button
        type="submit"
        disabled={!text.trim()}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="g3-btn g3-btn-sm g3-btn-orange"
      >
        SET
      </motion.button>
    </form>
  )
}

function HabitSection({ onShinyEncounter }) {
  const { habits, deleteHabitFromDb, completeHabit, _shinyEncounter, clearShinyEncounter } = useHabits()

  const prevShinyRef = useRef(null)
  useEffect(() => {
    if (_shinyEncounter && _shinyEncounter !== prevShinyRef.current) {
      prevShinyRef.current = _shinyEncounter
      onShinyEncounter(_shinyEncounter)
      clearShinyEncounter()
    }
  }, [_shinyEncounter, onShinyEncounter, clearShinyEncounter])

  const doneCount = habits.filter((h) => h.lastCompleted && h.lastCompleted.slice(0, 10) === todayStr()).length
  const totalCount = habits.length

  return (
    <G3Panel variant="orange" style={{ flexShrink: 0 }}>
      <G3Header
        icon="📋"
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.1px' }}>
              {doneCount}/{totalCount} TODAY
            </span>
            <div style={{ width: 60, height: 7, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: doneCount === totalCount && totalCount > 0 ? '#22c55e' : '#F8C800' }}
                animate={{ width: totalCount > 0 ? (doneCount / totalCount) * 100 + '%' : '0%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        }
      >
        DAILY HABIT RADAR
      </G3Header>

      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <AddHabitForm />
        <div style={{ height: 1, background: '#D8D0B8', margin: '2px 0' }} />

        <AnimatePresence mode="popLayout">
          {habits.length === 0 ? (
            <motion.div
              key="empty-habits"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '16px 0', border: '1px dashed #D8D0B8', borderRadius: 5 }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>📅</div>
              <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted }}>
                No habits set yet! Add one above.
              </p>
            </motion.div>
          ) : (
            habits.map((habit) => (
              <HabitRow key={habit.id} habit={habit} onComplete={completeHabit} onDelete={deleteHabitFromDb} />
            ))
          )}
        </AnimatePresence>

        {habits.length > 0 && (
          <div style={{ marginTop: 4, background: 'rgba(248,248,237,0.7)', border: '1px dashed #D8D0B8', borderRadius: 4, padding: '5px 8px' }}>
            <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: G3.textMuted, marginBottom: 4 }}>
              ✨ SHINY CHAIN ODDS:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { range: '0-2 days', label: '1/4096', color: ODDS_COLORS[0] },
                { range: '3-6 days', label: '1/1000', color: ODDS_COLORS[1] },
                { range: '7-14 days', label: '1/100', color: ODDS_COLORS[2] },
                { range: '15+ days', label: '1/20', color: ODDS_COLORS[3] },
              ].map((entry) => (
                <div key={entry.range} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 8, height: 8, background: entry.color, borderRadius: 1, flexShrink: 0 }} />
                  <span style={{ fontFamily: G3.vt, fontSize: '0.82rem', color: entry.color }}>
                    {entry.range} → {entry.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </G3Panel>
  )
}

function ShinyBox() {
  const { caughtShinies } = useHabits()

  return (
    <G3Panel variant="teal">
      <G3Header
        icon="✨"
        rightSlot={
          <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.1px' }}>
            {caughtShinies.length} CAUGHT
          </span>
        }
      >
        SHINY BOX
      </G3Header>

      <div style={{ padding: '12px 14px' }}>
        {caughtShinies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', border: '1px dashed #D8D0B8', borderRadius: 6 }}>
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '2rem', marginBottom: 6 }}>
              ✨
            </motion.div>
            <p style={{ fontFamily: G3.px, fontSize: '0.38rem', color: G3.textMuted, letterSpacing: '-0.2px', lineHeight: 1.8 }}>
              NO SHINIES YET
            </p>
            <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, marginTop: 4 }}>
              Keep your streaks up to increase your odds!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <AnimatePresence>
              {caughtShinies.map((shiny) => (
                <motion.div
                  key={shiny.id}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 20 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  title={'Shiny #' + shiny.pokemonId + ' — ' + new Date(shiny.dateCaught).toLocaleDateString()}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 4px rgba(255,215,0,0.6))',
                        'drop-shadow(0 0 14px rgba(255,215,0,1))',
                        'drop-shadow(0 0 4px rgba(255,215,0,0.6))',
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: 72,
                      height: 72,
                      background: 'radial-gradient(circle, rgba(255,215,0,0.15), transparent 70%)',
                      border: '2px solid rgba(255,215,0,0.5)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={shinySprite(shiny.pokemonId)}
                      alt={'Shiny Pokemon #' + shiny.pokemonId}
                      onError={(e) => { e.currentTarget.src = shinyStatic(shiny.pokemonId) }}
                      style={{ width: 56, height: 56, imageRendering: 'pixelated', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))' }}
                    />
                  </motion.div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: '#9333ea', letterSpacing: '-0.1px' }}>
                      ★ #{String(shiny.pokemonId).padStart(3, '0')}
                    </div>
                    <div style={{ fontFamily: G3.vt, fontSize: '0.8rem', color: G3.textMuted, marginTop: 1 }}>
                      {new Date(shiny.dateCaught).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </G3Panel>
  )
}

export default function DailyHabits() {
  const [shinyModal, setShinyModal] = useState(null)
  const { habitsLoading, fetchHabits } = useHabits()

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  if (habitsLoading) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ height: 80, background: G3.creamDark, border: '2px solid #C0B8A8', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: 60, background: G3.creamDark, border: '2px solid #C0B8A8', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <WeatherModule />
      <HabitSection onShinyEncounter={setShinyModal} />
      <ShinyBox />

      <AnimatePresence>
        {shinyModal && <ShinyModal shiny={shinyModal} onClose={() => setShinyModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
