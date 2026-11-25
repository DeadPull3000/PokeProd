import { motion } from 'framer-motion'
import { useSettings, useStore } from '../store'
import { STARTERS, BG_CYCLES, BG_META } from '../constants/gameData'
import { G3, G3Header, G3Panel, SpriteImage } from './ui'
import { downloadSaveJson } from '../utils/exportSave'

function SettingRow({ label, emoji, children, hint }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'white',
        border: '1px solid #D8D0B8',
        borderLeft: '3px solid ' + G3.borderTeal,
        borderRadius: 4,
        padding: '8px 12px',
      }}
    >
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: G3.px, fontSize: '0.38rem', color: G3.textMuted, letterSpacing: '-0.2px', marginBottom: 5 }}>
          {label}
        </div>
        {children}
        {hint && <div style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted, marginTop: 3 }}>{hint}</div>}
      </div>
    </div>
  )
}

function ToggleButton({ value, onChange, onLabel = 'ON', offLabel = 'OFF' }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[true, false].map((v) => {
        const active = value === v
        return (
          <motion.button
            key={String(v)}
            onClick={() => onChange(v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: active ? G3.headerBg : G3.creamDark,
              border: '2px solid ' + (active ? '#408090' : '#C0B8A8'),
              borderRadius: 4,
              boxShadow: active ? '2px 2px 0 #408090' : 'none',
              fontFamily: G3.px,
              fontSize: '0.38rem',
              color: active ? 'white' : G3.textMuted,
              cursor: 'pointer',
              padding: '4px 12px',
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

function StarterPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
      {STARTERS.map((starter) => {
        const isSelected = value.id === starter.id
        return (
          <motion.button
            key={starter.id}
            onClick={() => onChange(starter)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            title={`${starter.name} — ${starter.gen} (${starter.type})`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
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
            <SpriteImage pokemonId={starter.id} alt={starter.name} size={48} enableCry />
            <span style={{ fontFamily: G3.px, fontSize: '0.28rem', color: isSelected ? G3.borderTeal : G3.textMuted, lineHeight: 1.8 }}>
              {starter.name.slice(0, 6)}
            </span>
            <span style={{ fontFamily: G3.vt, fontSize: '0.75rem', color: '#A0988A' }}>{starter.gen}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

function BgCyclePicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {BG_CYCLES.map((cycle) => {
        const meta = BG_META[cycle]
        const isActive = value === cycle
        return (
          <motion.button
            key={cycle}
            onClick={() => onChange(cycle)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            title={meta.hint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
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
            <span style={{ fontFamily: G3.px, fontSize: '0.34rem', color: isActive ? G3.headerBg : G3.textMuted }}>
              {cycle.toUpperCase()}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

export default function SettingsTab() {
  const {
    trainerName,
    setTrainerName,
    persistTrainerProfile,
    starterPokemon,
    soundEffects,
    music,
    backgroundCycle,
    updateSettings,
  } = useSettings()

  function handleStarterChange(starter) {
    updateSettings({ starterPokemon: { id: starter.id, name: starter.name } })
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header icon="⚙️">OPTIONS</G3Header>
        <div style={{ padding: '8px 12px' }}>
          <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.textMuted }}>
            All changes apply immediately and persist across sessions.
          </p>
        </div>
      </G3Panel>

      <G3Panel variant="orange" style={{ flexShrink: 0 }}>
        <G3Header icon="🧢">TRAINER PROFILE</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingRow label="TRAINER NAME" emoji="🧢">
            <input
              id="settings-trainer-name"
              type="text"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              onBlur={persistTrainerProfile}
              maxLength={16}
              placeholder="TRAINER RED"
              className="g3-input"
              style={{ fontSize: '1.15rem', padding: '5px 10px' }}
            />
          </SettingRow>

          <SettingRow
            label="STARTER POKéMON"
            emoji="🎮"
            hint={`Currently: ${starterPokemon.name} (#${starterPokemon.id})`}
          >
            <StarterPicker value={starterPokemon} onChange={handleStarterChange} />
          </SettingRow>
        </div>
      </G3Panel>

      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header icon="🎵">AUDIO</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingRow label="SOUND EFFECTS" emoji="🔔" hint={soundEffects ? 'Interaction sounds are ON' : 'Sounds muted'}>
            <ToggleButton value={soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
          </SettingRow>

          <SettingRow label="MUSIC" emoji="🎶" hint={music ? 'Background lofi music playing' : 'Music is OFF'}>
            <ToggleButton value={music} onChange={(v) => updateSettings({ music: v })} />
          </SettingRow>
        </div>
      </G3Panel>

      <G3Panel variant="orange" style={{ flexShrink: 0 }}>
        <G3Header icon="🌅">BACKGROUND CYCLE</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingRow label="TIME OF DAY" emoji="🕐" hint={BG_META[backgroundCycle] ? BG_META[backgroundCycle].hint : ''}>
            <BgCyclePicker value={backgroundCycle} onChange={(v) => updateSettings({ backgroundCycle: v })} />
          </SettingRow>
        </div>
      </G3Panel>

      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header icon="💾">SAVE & DATA EXPORT</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, flex: 1, minWidth: 180 }}>
            Download a complete JSON backup of your tasks, projects, habits, badges, Secret Base, and Pokédex.
          </p>
          <button
            type="button"
            onClick={() => {
              const state = useStore.getState()
              downloadSaveJson(state)
              state.pushToast?.('Save data exported to JSON!', 'success', 2500)
            }}
            className="g3-btn g3-btn-sm"
          >
            EXPORT SAVE (.JSON) ▶
          </button>
        </div>
      </G3Panel>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <G3Panel variant="teal" style={{ flexShrink: 0 }}>
          <G3Header icon="ℹ️">ABOUT</G3Header>
          <div style={{ padding: '12px 14px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <SpriteImage pokemonId={starterPokemon.id} alt={starterPokemon.name} size={64} />
            </motion.div>
            <div>
              <p style={{ fontFamily: G3.px, fontSize: '0.4rem', color: G3.text, lineHeight: 1.8 }}>POKéMON PRODUCTIVITY</p>
              <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, lineHeight: 1.4, marginTop: 4 }}>
                A gamified task tracker inspired by the world of Pokémon. Complete habits, build streaks, and decorate your Secret Base!
              </p>
              <p style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.textMuted, marginTop: 4 }}>
                Trainer: <strong style={{ color: G3.text }}>{trainerName}</strong> · Starter:{' '}
                <strong style={{ color: G3.headerBg }}>{starterPokemon.name}</strong>
              </p>
            </div>
          </div>
        </G3Panel>
      </motion.div>
    </div>
  )
}
