import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

/* ============================================================
   CONSTANTS & HELPERS
   ============================================================ */

/* Shiny animated sprite URL — /shiny/ path is mandatory per spec */
const shinySprite = (id) =>
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/' + id + '.gif'

/* Fallback static shiny */
const shinyStatic = (id) =>
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/' + id + '.png'

/* Open-Meteo weather code → app condition mapping (per spec) */
function mapWeatherCode(code) {
  if (code === 0 || code === 1)
    return { condition: 'Sunny',  typeBoost: 'Fire & Grass', icon: '☀️',  color: '#ef4444' }
  if (code === 2 || code === 3)
    return { condition: 'Cloudy', typeBoost: 'Normal & Fairy', icon: '☁️', color: '#6b7280' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return { condition: 'Rain',   typeBoost: 'Water & Electric', icon: '🌧️', color: '#3b82f6' }
  if ((code >= 71 && code <= 77) || (code === 85 || code === 86))
    return { condition: 'Snow',   typeBoost: 'Ice & Steel', icon: '❄️',   color: '#06b6d4' }
  /* Default fallback for other codes (thunderstorm, fog, etc.) */
  return { condition: 'Cloudy', typeBoost: 'Normal & Fairy', icon: '🌫️', color: '#6b7280' }
}

/* Shiny odds label and threshold for a given streak */
function shinyOdds(streak) {
  if (streak <= 2)  return { label: '1/4096', threshold: 1 / 4096, tier: 0 }
  if (streak <= 6)  return { label: '1/1000', threshold: 1 / 1000, tier: 1 }
  if (streak <= 14) return { label: '1/100',  threshold: 1 / 100,  tier: 2 }
  return              { label: '1/20',   threshold: 1 / 20,   tier: 3 }
}

/* Colour for the odds label (tiers: base, uncommon, rare, ultra-rare) */
const ODDS_COLORS = ['#706858', '#ca8a04', '#dc2626', '#9333ea']

/* Returns today's ISO date string YYYY-MM-DD */
const todayStr = () => new Date().toISOString().slice(0, 10)

/* ============================================================
   GEN 3 STYLE TOKENS
   ============================================================ */
const G3 = {
  cream:        '#F8F8ED',
  borderTeal:   '#68A0B0',
  borderOrange: '#E09078',
  headerBg:     '#68B0B0',
  text:         '#383028',
  textMuted:    '#706858',
  px:           "'Press Start 2P', monospace",
  vt:           "'VT323', monospace",
}

/* Reusable Gen 3 teal header bar */
function G3Header({ children, icon, rightSlot }) {
  return (
    <div style={{
      background: G3.headerBg,
      padding: '5px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', flexShrink: 0 }} />
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', flexShrink: 0 }} />
      <span style={{
        fontFamily: G3.px, fontSize: '0.46rem', color: '#fff',
        letterSpacing: '-0.3px', lineHeight: 1.8,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)', flex: 1,
      }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {children}
      </span>
      {rightSlot && <div style={{ flexShrink: 0 }}>{rightSlot}</div>}
    </div>
  )
}

/* ============================================================
   SECTION A — WEATHER MODULE
   ============================================================ */

function WeatherModule() {
  const { weather, setWeather } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(function() {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=28.99&longitude=77.01&current_weather=true'
    setLoading(true)
    setError(null)
    fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error('Network error')
        return res.json()
      })
      .then(function(data) {
        var code = data.current_weather && data.current_weather.weathercode
        var mapped = mapWeatherCode(code != null ? code : 0)
        setWeather(mapped.condition, mapped.typeBoost, mapped.icon, mapped.color)
        setLoading(false)
      })
      .catch(function(err) {
        setError('Could not reach Weather Server')
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: G3.cream,
      border: '4px solid ' + G3.borderTeal,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '2px 2px 0 rgba(80,140,160,0.35), 0 4px 16px rgba(0,0,0,0.18)',
      flexShrink: 0,
    }}>
      <G3Header icon="📡" rightSlot={
        loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
          />
        ) : null
      }>
        POKéMON WIRELESS CLUB - WEATHER REPORT
      </G3Header>

      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        {/* Left — big weather icon + condition */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Animated weather icon */}
          <motion.div
            animate={loading ? {} : { scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 62, height: 62,
              background: loading ? '#EDE8D0' : weather.color + '18',
              border: '3px solid ' + (loading ? '#D8D0B8' : weather.color),
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: loading ? 'none' : '0 0 14px 4px ' + weather.color + '30',
              flexShrink: 0,
              transition: 'border-color 0.6s, box-shadow 0.6s',
            }}
          >
            {loading ? '🌐' : weather.icon}
          </motion.div>

          <div>
            {/* Condition name */}
            <div style={{
              fontFamily: G3.px, fontSize: '0.55rem',
              color: loading ? G3.textMuted : weather.color,
              letterSpacing: '-0.3px', lineHeight: 1.8,
              textShadow: loading ? 'none' : '0 1px 3px ' + weather.color + '40',
              transition: 'color 0.6s',
            }}>
              {loading ? 'FETCHING...' : weather.condition.toUpperCase()}
            </div>

            {/* Location badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: '0.7rem' }}>📍</span>
              <span style={{ fontFamily: G3.vt, fontSize: '0.95rem', color: G3.textMuted }}>
                Sonipat, Haryana
              </span>
            </div>
          </div>
        </div>

        {/* Right — dialogue box */}
        <div style={{
          flex: 1, minWidth: 220,
          background: 'white',
          border: '3px solid ' + G3.borderTeal,
          borderRadius: 6,
          padding: '10px 14px',
          position: 'relative',
          boxShadow: '2px 2px 0 rgba(80,140,160,0.25)',
        }}>
          {/* Dialogue arrow */}
          <div style={{
            position: 'absolute', left: -12, top: '50%',
            transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '10px solid ' + G3.borderTeal,
          }} />
          <div style={{
            position: 'absolute', left: -8, top: '50%',
            transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '8px solid white',
          }} />

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
              It is currently{' '}
              <strong style={{ color: weather.color }}>{weather.condition}</strong>{' '}
              outside!{' '}
              <strong style={{ color: weather.color }}>{weather.typeBoost}</strong>-type
              tasks grant{' '}
              <span style={{
                background: weather.color + '18',
                border: '1px solid ' + weather.color,
                borderRadius: 3,
                padding: '0 4px',
                color: weather.color,
                fontWeight: 'bold',
              }}>
                double XP
              </span>{' '}
              today!
            </p>
          )}

          {/* Scrolling cursor */}
          {!loading && !error && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                display: 'inline-block',
                marginLeft: 4,
                fontFamily: G3.px,
                fontSize: '0.4rem',
                color: G3.textMuted,
              }}
            >
              ▼
            </motion.span>
          )}
        </div>

        {/* Type boost badges */}
        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <div style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.textMuted, marginBottom: 2 }}>
              ACTIVE BOOST:
            </div>
            {weather.typeBoost.split(' & ').map(function(type, i) {
              return (
                <div key={i} style={{
                  background: weather.color + '18',
                  border: '2px solid ' + weather.color,
                  borderRadius: 4,
                  padding: '3px 8px',
                  textAlign: 'center',
                }}>
                  <span style={{
                    fontFamily: G3.px, fontSize: '0.36rem',
                    color: weather.color, letterSpacing: '-0.2px',
                  }}>
                    {type.toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   SHINY ENCOUNTER MODAL
   ============================================================ */

function ShinyModal({ shiny, onClose }) {
  if (!shiny) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={function(e) { e.stopPropagation() }}
        style={{
          background: G3.cream,
          border: '4px solid ' + G3.borderTeal,
          borderRadius: 10,
          overflow: 'hidden',
          maxWidth: 360, width: '100%',
          boxShadow: '0 0 40px 8px rgba(255,215,0,0.5), 4px 4px 0 rgba(80,140,160,0.4)',
        }}
      >
        <G3Header icon="✨">A SHINY POKéMON APPEARED!</G3Header>

        <div style={{ padding: '20px 24px', textAlign: 'center' }}>
          {/* Glowing shiny sprite */}
          <motion.div
            animate={{ boxShadow: ['0 0 20px 6px rgba(255,215,0,0.4)', '0 0 40px 12px rgba(255,215,0,0.8)', '0 0 20px 6px rgba(255,215,0,0.4)'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(255,215,0,0.2), transparent 70%)',
              borderRadius: '50%',
              marginBottom: 12,
            }}
          >
            <motion.img
              src={shinySprite(shiny.pokemonId)}
              alt={'Shiny Pokemon #' + shiny.pokemonId}
              onError={function(e) { e.target.src = shinyStatic(shiny.pokemonId) }}
              style={{ width: 96, height: 96, imageRendering: 'pixelated' }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Stars burst */}
          <div style={{ fontSize: '1.4rem', marginBottom: 10, letterSpacing: 6 }}>✨⭐✨</div>

          <p style={{ fontFamily: G3.vt, fontSize: '1.2rem', color: G3.text, lineHeight: 1.5, marginBottom: 6 }}>
            Pokémon <strong style={{ color: '#9333ea' }}>#{shiny.pokemonId}</strong> is a{' '}
            <strong style={{ color: '#ca8a04' }}>SHINY</strong>!
          </p>
          <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, lineHeight: 1.4, marginBottom: 16 }}>
            Your streak paid off! It has been added to your Shiny Box.
          </p>

          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: G3.headerBg, border: '2px solid #408090',
              borderRadius: 6, boxShadow: '2px 2px 0 #408090',
              fontFamily: G3.px, fontSize: '0.42rem',
              color: 'white', cursor: 'pointer', padding: '7px 18px',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            GOTCHA! ▶
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ============================================================
   SECTION B — HABIT ROW
   ============================================================ */

/* Streak fire bar — visualises streak intensity */
function StreakBar({ streak }) {
  var max = 20
  var pct = Math.min(streak / max, 1)
  var barColor = streak <= 2 ? '#22c55e' : streak <= 6 ? '#eab308' : streak <= 14 ? '#f97316' : '#9333ea'
  return (
    <div style={{ width: '100%', marginTop: 3 }}>
      <div style={{
        height: 5,
        background: '#E8E0D0',
        border: '1px solid #D0C8B0',
        borderRadius: 0,
        overflow: 'hidden',
      }}>
        <motion.div
          style={{ height: '100%', background: barColor, borderRadius: 0 }}
          initial={{ width: 0 }}
          animate={{ width: (pct * 100) + '%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function HabitRow({ habit, onComplete, onDelete }) {
  var doneToday = habit.lastCompleted && habit.lastCompleted.slice(0, 10) === todayStr()
  var odds      = shinyOdds(habit.streak)

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
      {/* Custom checkbox */}
      <motion.button
        onClick={function() { if (!doneToday) onComplete(habit.id) }}
        whileHover={doneToday ? {} : { scale: 1.15 }}
        whileTap={doneToday ? {} : { scale: 0.9 }}
        style={{
          width: 22, height: 22, flexShrink: 0,
          border: '2px solid ' + (doneToday ? G3.borderTeal : G3.borderOrange),
          borderRadius: 3,
          background: doneToday ? G3.borderTeal : 'white',
          cursor: doneToday ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s, border-color 0.2s',
          boxShadow: doneToday ? '0 0 6px 2px rgba(104,160,176,0.3)' : 'none',
        }}
      >
        {doneToday && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ color: 'white', fontSize: '0.6rem', lineHeight: 1, fontWeight: 'bold' }}
          >
            ✓
          </motion.span>
        )}
      </motion.button>

      {/* Habit info block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          {/* Name */}
          <span style={{
            fontFamily: G3.vt,
            fontSize: '1.1rem',
            color: doneToday ? G3.textMuted : G3.text,
            textDecoration: doneToday ? 'none' : 'none',
            lineHeight: 1.2,
            flex: 1, minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {habit.name}
          </span>

          {/* Streak badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: habit.streak >= 15 ? 'rgba(147,51,234,0.12)' :
                        habit.streak >= 7  ? 'rgba(249,115,22,0.1)' :
                        habit.streak >= 3  ? 'rgba(234,179,8,0.1)' : '#F0EDD8',
            border: '1px solid ' + (
              habit.streak >= 15 ? '#9333ea' :
              habit.streak >= 7  ? '#f97316' :
              habit.streak >= 3  ? '#eab308' : '#D8D0B8'
            ),
            borderRadius: 3,
            padding: '1px 5px',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '0.65rem' }}>
              {habit.streak >= 15 ? '💜' : habit.streak >= 7 ? '🔥' : habit.streak >= 3 ? '⭐' : '·'}
            </span>
            <span style={{
              fontFamily: G3.px, fontSize: '0.33rem',
              color: habit.streak >= 15 ? '#9333ea' : habit.streak >= 7 ? '#f97316' : habit.streak >= 3 ? '#ca8a04' : G3.textMuted,
              letterSpacing: '-0.1px',
            }}>
              {habit.streak}d
            </span>
          </div>
        </div>

        {/* Streak progress bar */}
        <StreakBar streak={habit.streak} />

        {/* Footer row: streak label + shiny odds */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted }}>
            {habit.streak} Day Streak
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.65rem' }}>✨</span>
            <span style={{
              fontFamily: G3.px, fontSize: '0.3rem',
              color: ODDS_COLORS[odds.tier],
              letterSpacing: '-0.1px',
            }}>
              Odds: {odds.label}
            </span>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={function() { onDelete(habit.id) }}
        style={{
          width: 20, height: 20, flexShrink: 0,
          background: '#FFF0F0', border: '1px solid #E09078',
          borderRadius: 3, cursor: 'pointer',
          color: '#C07060',
          fontFamily: G3.px, fontSize: '0.35rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </motion.div>
  )
}

/* Add-habit inline form */
function AddHabitForm() {
  const { addHabitToDb } = useStore()
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    addHabitToDb(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6 }}>
      <span style={{
        fontFamily: G3.px, fontSize: '0.4rem',
        color: G3.borderOrange, flexShrink: 0,
        lineHeight: 1, alignSelf: 'center',
      }}>▶</span>
      <input
        type="text"
        value={text}
        onChange={function(e) { setText(e.target.value) }}
        placeholder="Add a daily habit..."
        style={{
          flex: 1,
          background: 'white', border: '2px solid #C0B8A8',
          borderRadius: 4,
          fontFamily: G3.vt, fontSize: '1.1rem',
          color: G3.text, padding: '4px 8px', outline: 'none',
        }}
        onFocus={function(e) { e.target.style.borderColor = G3.borderOrange }}
        onBlur={function(e)  { e.target.style.borderColor = '#C0B8A8' }}
      />
      <motion.button
        type="submit"
        disabled={!text.trim()}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: G3.borderOrange, border: '2px solid #C07060',
          borderRadius: 4, boxShadow: '2px 2px 0 #C07060',
          fontFamily: G3.px, fontSize: '0.38rem',
          color: 'white', cursor: 'pointer',
          padding: '5px 10px', flexShrink: 0,
          opacity: text.trim() ? 1 : 0.4,
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
        }}
      >
        SET
      </motion.button>
    </form>
  )
}

function HabitSection({ onShinyEncounter }) {
  const {
    habits, updateHabitStreak, deleteHabitFromDb,
    fetchHabits, habitsLoading, caughtShinies, _shinyEncounter,
  } = useStore()

  /* Fetch from DB on mount */
  useEffect(function() {
    fetchHabits()
  }, [fetchHabits])

  /* Watch for shiny encounters signalled by the store action */
  const prevShinyRef = useRef(null)
  useEffect(function() {
    if (_shinyEncounter && _shinyEncounter !== prevShinyRef.current) {
      prevShinyRef.current = _shinyEncounter
      onShinyEncounter(_shinyEncounter)
    }
  }, [_shinyEncounter, onShinyEncounter])

  /* Complete a habit: calculate streak locally, persist to DB, then shiny roll */
  function handleCompleteHabit(habitId) {
    var today = new Date().toISOString().slice(0, 10)
    var habit = habits.find(function(h) { return h.id === habitId })
    if (!habit) return
    if (habit.lastCompleted && habit.lastCompleted.slice(0, 10) === today) return

    var newStreak = habit.streak + 1
    var lastCompletedDate = new Date().toISOString()

    /* Optimistic local update for instant UI feedback */
    useStore.setState(function(s) {
      return {
        habits: s.habits.map(function(h) {
          return h.id === habitId
            ? { ...h, streak: newStreak, lastCompleted: lastCompletedDate }
            : h
        }),
      }
    })

    /* Persist to Supabase */
    updateHabitStreak(habitId, newStreak, lastCompletedDate)

    /* Shiny roll */
    var threshold
    if (newStreak <= 2)       threshold = 1 / 4096
    else if (newStreak <= 6)  threshold = 1 / 1000
    else if (newStreak <= 14) threshold = 1 / 100
    else                      threshold = 1 / 20

    var roll = Math.random()
    var isShiny = roll < threshold
    if (isShiny) {
      var pokemonId = Math.floor(Math.random() * 151) + 1
      var shinyEntry = {
        id: Math.random().toString(36).substring(2, 10),
        pokemonId: pokemonId,
        dateCaught: new Date().toISOString(),
      }
      useStore.setState(function(s) {
        return {
          caughtShinies: [...s.caughtShinies, shinyEntry],
          _shinyEncounter: shinyEntry,
        }
      })
    }
  }

  var doneCount  = habits.filter(function(h) { return h.lastCompleted && h.lastCompleted.slice(0, 10) === todayStr() }).length
  var totalCount = habits.length

  return (
    <div style={{
      background: G3.cream,
      border: '4px solid ' + G3.borderOrange,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '2px 2px 0 rgba(200,120,96,0.35), 0 4px 16px rgba(0,0,0,0.18)',
      flexShrink: 0,
    }}>
      <G3Header icon="📋" rightSlot={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: G3.px, fontSize: '0.32rem',
            color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.1px',
          }}>
            {doneCount}/{totalCount} TODAY
          </span>
          {/* Mini HP-style daily progress bar */}
          <div style={{
            width: 60, height: 7,
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: 0, overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%',
                background: doneCount === totalCount && totalCount > 0 ? '#22c55e' : '#F8C800',
              }}
              animate={{ width: totalCount > 0 ? (doneCount / totalCount * 100) + '%' : '0%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      }>
        DAILY HABIT RADAR
      </G3Header>

      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Add form */}
        <AddHabitForm />

        {/* Divider */}
        <div style={{ height: 1, background: '#D8D0B8', margin: '2px 0' }} />

        {/* Habit list */}
        <AnimatePresence mode="popLayout">
          {habits.length === 0 ? (
            <motion.div
              key="empty-habits"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                textAlign: 'center', padding: '16px 0',
                border: '1px dashed #D8D0B8', borderRadius: 5,
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>📅</div>
              <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted }}>
                No habits set yet! Add one above.
              </p>
            </motion.div>
          ) : (
            habits.map(function(habit) {
              return (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  onComplete={handleCompleteHabit}
                  onDelete={deleteHabitFromDb}
                />
              )
            })
          )}
        </AnimatePresence>

        {/* Shiny odds legend */}
        {habits.length > 0 && (
          <div style={{
            marginTop: 4,
            background: 'rgba(248,248,237,0.7)',
            border: '1px dashed #D8D0B8',
            borderRadius: 4,
            padding: '5px 8px',
          }}>
            <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: G3.textMuted, marginBottom: 4 }}>
              ✨ SHINY CHAIN ODDS:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { range: '0-2 days',  label: '1/4096', color: ODDS_COLORS[0] },
                { range: '3-6 days',  label: '1/1000', color: ODDS_COLORS[1] },
                { range: '7-14 days', label: '1/100',  color: ODDS_COLORS[2] },
                { range: '15+ days',  label: '1/20',   color: ODDS_COLORS[3] },
              ].map(function(entry) {
                return (
                  <div key={entry.range} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: 8, height: 8, background: entry.color, borderRadius: 1, flexShrink: 0 }} />
                    <span style={{ fontFamily: G3.vt, fontSize: '0.82rem', color: entry.color }}>
                      {entry.range} → {entry.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   SECTION C — SHINY BOX
   ============================================================ */

function ShinyBox() {
  const { caughtShinies } = useStore()

  return (
    <div style={{
      background: G3.cream,
      border: '4px solid ' + G3.borderTeal,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '2px 2px 0 rgba(80,140,160,0.35), 0 4px 16px rgba(0,0,0,0.18)',
    }}>
      <G3Header icon="✨" rightSlot={
        <span style={{
          fontFamily: G3.px, fontSize: '0.32rem',
          color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.1px',
        }}>
          {caughtShinies.length} CAUGHT
        </span>
      }>
        SHINY BOX
      </G3Header>

      <div style={{ padding: '12px 14px' }}>
        {caughtShinies.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '20px 0',
            border: '1px dashed #D8D0B8', borderRadius: 6,
          }}>
            {/* Animated sparkle placeholder */}
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '2rem', marginBottom: 6 }}
            >
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
              {caughtShinies.map(function(shiny) {
                return (
                  <motion.div
                    key={shiny.id}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 20 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    title={'Shiny #' + shiny.pokemonId + ' — ' + new Date(shiny.dateCaught).toLocaleDateString()}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4,
                    }}
                  >
                    {/* Glowing animated shiny sprite */}
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
                        width: 72, height: 72,
                        background: 'radial-gradient(circle, rgba(255,215,0,0.15), transparent 70%)',
                        border: '2px solid rgba(255,215,0,0.5)',
                        borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <img
                        src={shinySprite(shiny.pokemonId)}
                        alt={'Shiny Pokemon #' + shiny.pokemonId}
                        onError={function(e) { e.target.src = shinyStatic(shiny.pokemonId) }}
                        style={{
                          width: 56, height: 56,
                          imageRendering: 'pixelated',
                          /* CSS drop-shadow glow per spec */
                          filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))',
                        }}
                      />
                    </motion.div>

                    {/* Pokémon number + star label */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: G3.px, fontSize: '0.3rem',
                        color: '#9333ea', letterSpacing: '-0.1px',
                      }}>
                        ★ #{String(shiny.pokemonId).padStart(3, '0')}
                      </div>
                      <div style={{
                        fontFamily: G3.vt, fontSize: '0.8rem',
                        color: G3.textMuted, marginTop: 1,
                      }}>
                        {new Date(shiny.dateCaught).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   MAIN TAB COMPONENT
   ============================================================ */

export default function DailyHabits() {
  const [shinyModal, setShinyModal] = useState(null)
  const { habitsLoading } = useStore()

  function handleShinyEncounter(shiny) {
    setShinyModal(shiny)
  }

  if (habitsLoading) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          height: 80, background: '#EDE8D0', border: '2px solid #C0B8A8',
          borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0,
        }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            height: 60, background: '#EDE8D0', border: '2px solid #C0B8A8',
            borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0,
          }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Section A — Weather */}
      <WeatherModule />

      {/* Section B — Daily Habit Radar */}
      <HabitSection onShinyEncounter={handleShinyEncounter} />

      {/* Section C — Shiny Box */}
      <ShinyBox />

      {/* Shiny Encounter Modal */}
      <AnimatePresence>
        {shinyModal && (
          <ShinyModal
            shiny={shinyModal}
            onClose={function() { setShinyModal(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
