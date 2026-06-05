import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

/* ============================================================
   STARTER OPTIONS
   ============================================================ */
const STARTERS = [
  { id: 1,   name: 'BULBASAUR',  gen: 'Kanto',  type: 'Grass/Poison' },
  { id: 4,   name: 'CHARMANDER', gen: 'Kanto',  type: 'Fire'         },
  { id: 7,   name: 'SQUIRTLE',   gen: 'Kanto',  type: 'Water'        },
  { id: 152, name: 'CHIKORITA',  gen: 'Johto',  type: 'Grass'        },
  { id: 155, name: 'CYNDAQUIL',  gen: 'Johto',  type: 'Fire'         },
  { id: 158, name: 'TOTODILE',   gen: 'Johto',  type: 'Water'        },
  { id: 252, name: 'TREECKO',    gen: 'Hoenn',  type: 'Grass'        },
  { id: 255, name: 'TORCHIC',    gen: 'Hoenn',  type: 'Fire'         },
  { id: 258, name: 'MUDKIP',     gen: 'Hoenn',  type: 'Water'        },
]

const BG_CYCLES = ['Auto', 'Morning', 'Day', 'Evening', 'Night']

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'
const animSprite  = (id) => `${SPRITE_BASE}/pokemon/versions/generation-v/black-white/animated/${id}.gif`
const staticSprite = (id) => `${SPRITE_BASE}/pokemon/${id}.png`

/* ============================================================
   GEN 3 STYLE TOKENS
   ============================================================ */
const G3 = {
  cream:        '#F8F8ED',
  creamDark:    '#EDE8D0',
  borderTeal:   '#68A0B0',
  borderOrange: '#E09078',
  headerBg:     '#68B0B0',
  text:         '#383028',
  textMuted:    '#706858',
  px:           "'Press Start 2P', monospace",
  vt:           "'VT323', monospace",
}

/* Gen 3 teal section header */
function G3Header({ children, icon }) {
  return (
    <div style={{
      background: G3.headerBg, padding: '5px 10px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
      <span style={{
        fontFamily: G3.px, fontSize: '0.46rem', color: '#fff',
        letterSpacing: '-0.3px', lineHeight: 1.8,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)', flex: 1,
      }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {children}
      </span>
    </div>
  )
}

/* Shared input style */
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'white', border: '2px solid #C0B8A8', borderRadius: 4,
  fontFamily: G3.vt, fontSize: '1.15rem',
  color: G3.text, padding: '5px 10px', outline: 'none',
  transition: 'border-color 0.1s',
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23706858'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 28,
}

/* Row wrapper for a single setting */
function SettingRow({ label, emoji, children, hint }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'white',
      border: '1px solid #D8D0B8',
      borderLeft: '3px solid ' + G3.borderTeal,
      borderRadius: 4,
      padding: '8px 12px',
    }}>
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: G3.px, fontSize: '0.38rem', color: G3.textMuted, letterSpacing: '-0.2px', marginBottom: 5 }}>
          {label}
        </div>
        {children}
        {hint && (
          <div style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted, marginTop: 3 }}>{hint}</div>
        )}
      </div>
    </div>
  )
}

/* Toggle button: ON / OFF */
function ToggleButton({ value, onChange, onLabel = 'ON', offLabel = 'OFF' }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[true, false].map(function(v) {
        var active = value === v
        return (
          <motion.button
            key={String(v)}
            onClick={function() { onChange(v) }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: active ? G3.headerBg : G3.creamDark,
              border: '2px solid ' + (active ? '#408090' : '#C0B8A8'),
              borderRadius: 4,
              boxShadow: active ? '2px 2px 0 #408090' : 'none',
              fontFamily: G3.px, fontSize: '0.38rem',
              color: active ? 'white' : G3.textMuted,
              cursor: 'pointer', padding: '4px 12px',
              letterSpacing: '-0.2px',
              textShadow: active ? '0 1px 2px rgba(0,0,0,0.25)' : 'none',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            {v ? onLabel : offLabel}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ============================================================
   STARTER PICKER  —  visual grid of sprites
   ============================================================ */
function StarterPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
      {STARTERS.map(function(starter) {
        var isSelected = value.id === starter.id
        return (
          <motion.button
            key={starter.id}
            onClick={function() { onChange(starter) }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            title={starter.name + ' — ' + starter.gen + ' (' + starter.type + ')'}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: isSelected ? 'rgba(104,176,176,0.15)' : 'white',
              border: isSelected ? '3px solid ' + G3.borderTeal : '2px solid #D8D0B8',
              borderRadius: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              boxShadow: isSelected ? '0 0 0 2px rgba(104,160,176,0.3), 2px 2px 0 rgba(104,160,176,0.3)' : 'none',
              transition: 'border-color 0.1s, background 0.1s',
              minWidth: 64,
            }}
          >
            <img
              src={animSprite(starter.id)}
              alt={starter.name}
              onError={function(e) { e.target.src = staticSprite(starter.id) }}
              style={{ width: 48, height: 48, imageRendering: 'pixelated' }}
            />
            <span style={{
              fontFamily: G3.px, fontSize: '0.28rem',
              color: isSelected ? G3.borderTeal : G3.textMuted,
              letterSpacing: '-0.1px', lineHeight: 1.8,
            }}>
              {starter.name.slice(0, 6)}
            </span>
            <span style={{ fontFamily: G3.vt, fontSize: '0.75rem', color: '#A0988A' }}>
              {starter.gen}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ============================================================
   BACKGROUND CYCLE PICKER
   ============================================================ */
const BG_META = {
  Auto:    { icon: '🔄', hint: 'Follows the real-world clock automatically' },
  Morning: { icon: '🌅', hint: 'Lock to sunrise gradient (6AM look)'        },
  Day:     { icon: '☀️', hint: 'Lock to bright afternoon sky'               },
  Evening: { icon: '🌇', hint: 'Lock to sunset purple-orange gradient'      },
  Night:   { icon: '🌙', hint: 'Lock to deep night sky with stars'          },
}

function BgCyclePicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {BG_CYCLES.map(function(cycle) {
        var meta     = BG_META[cycle]
        var isActive = value === cycle
        return (
          <motion.button
            key={cycle}
            onClick={function() { onChange(cycle) }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            title={meta.hint}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: isActive ? 'rgba(104,176,176,0.15)' : 'white',
              border: isActive ? '2px solid ' + G3.borderTeal : '2px solid #D8D0B8',
              borderRadius: 5,
              padding: '5px 10px',
              cursor: 'pointer',
              boxShadow: isActive ? '2px 2px 0 rgba(104,160,176,0.35)' : 'none',
              transition: 'all 0.1s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
            <span style={{
              fontFamily: G3.px, fontSize: '0.34rem',
              color: isActive ? G3.headerBg : G3.textMuted,
              letterSpacing: '-0.1px',
            }}>
              {cycle.toUpperCase()}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ============================================================
   MAIN SETTINGS TAB
   ============================================================ */
export default function SettingsTab() {
  const {
    trainerName, setTrainerName,
    starterPokemon, soundEffects, music, backgroundCycle,
    updateSettings,
  } = useStore()

  function handleStarterChange(starter) {
    updateSettings({ starterPokemon: { id: starter.id, name: starter.name } })
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>

      {/* ── Header panel ── */}
      <div style={{
        background: G3.cream, border: '4px solid ' + G3.borderTeal,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(80,140,160,0.35)',
        flexShrink: 0,
      }}>
        <G3Header icon="⚙️">OPTIONS</G3Header>
        <div style={{ padding: '8px 12px' }}>
          <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.textMuted }}>
            All changes apply immediately — no save button needed.
          </p>
        </div>
      </div>

      {/* ── Trainer Settings ── */}
      <div style={{
        background: G3.cream, border: '4px solid ' + G3.borderOrange,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(200,120,96,0.35)',
        flexShrink: 0,
      }}>
        <G3Header icon="🧢">TRAINER PROFILE</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Trainer name */}
          <SettingRow label="TRAINER NAME" emoji="🧢">
            <input
              id="settings-trainer-name"
              type="text"
              value={trainerName}
              onChange={function(e) { setTrainerName(e.target.value.toUpperCase()) }}
              maxLength={16}
              placeholder="TRAINER RED"
              style={inputStyle}
              onFocus={function(e) { e.target.style.borderColor = G3.borderTeal }}
              onBlur={function(e)  { e.target.style.borderColor = '#C0B8A8' }}
            />
          </SettingRow>

          {/* Starter Pokémon */}
          <SettingRow
            label="STARTER POKéMON"
            emoji="🎮"
            hint={'Currently: ' + starterPokemon.name + ' (#' + starterPokemon.id + ')'}
          >
            <StarterPicker
              value={starterPokemon}
              onChange={handleStarterChange}
            />
          </SettingRow>
        </div>
      </div>

      {/* ── Audio Settings ── */}
      <div style={{
        background: G3.cream, border: '4px solid ' + G3.borderTeal,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(80,140,160,0.35)',
        flexShrink: 0,
      }}>
        <G3Header icon="🎵">AUDIO</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          <SettingRow label="SOUND EFFECTS" emoji="🔔" hint={soundEffects ? 'Interaction sounds are ON' : 'Sounds muted'}>
            <ToggleButton
              value={soundEffects}
              onChange={function(v) { updateSettings({ soundEffects: v }) }}
            />
          </SettingRow>

          <SettingRow label="MUSIC" emoji="🎶" hint={music ? 'Background lofi music playing' : 'Music is OFF'}>
            <ToggleButton
              value={music}
              onChange={function(v) { updateSettings({ music: v }) }}
            />
          </SettingRow>
        </div>
      </div>

      {/* ── Background Settings ── */}
      <div style={{
        background: G3.cream, border: '4px solid ' + G3.borderOrange,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: '2px 2px 0 rgba(200,120,96,0.35)',
        flexShrink: 0,
      }}>
        <G3Header icon="🌅">BACKGROUND CYCLE</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingRow
            label="TIME OF DAY"
            emoji="🕐"
            hint={BG_META[backgroundCycle] ? BG_META[backgroundCycle].hint : ''}
          >
            <BgCyclePicker
              value={backgroundCycle}
              onChange={function(v) { updateSettings({ backgroundCycle: v }) }}
            />
          </SettingRow>
        </div>
      </div>

      {/* ── About ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: G3.cream, border: '4px solid ' + G3.borderTeal,
          borderRadius: 8, overflow: 'hidden',
          boxShadow: '2px 2px 0 rgba(80,140,160,0.35)',
          flexShrink: 0,
        }}
      >
        <G3Header icon="ℹ️">ABOUT</G3Header>
        <div style={{ padding: '12px 14px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <motion.img
            src={animSprite(starterPokemon.id)}
            alt={starterPokemon.name}
            onError={function(e) { e.target.src = staticSprite(starterPokemon.id) }}
            style={{ width: 64, height: 64, imageRendering: 'pixelated', flexShrink: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div>
            <p style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.text, letterSpacing: '-0.2px', lineHeight: 1.8 }}>
              POKéMON PRODUCTIVITY
            </p>
            <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, lineHeight: 1.4, marginTop: 4 }}>
              A gamified task tracker inspired by the world of Pokémon.
              Complete habits, build streaks, and decorate your Secret Base!
            </p>
            <p style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.textMuted, marginTop: 4 }}>
              Trainer: <strong style={{ color: G3.text }}>{trainerName}</strong>
              {' '}· Starter: <strong style={{ color: G3.headerBg }}>{starterPokemon.name}</strong>
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  )
}
