import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePokedex } from '../store'
import { KANTO_POKEDEX, getPokemonName } from '../constants/pokedex151'
import { shinySprite, shinyStatic, staticSprite } from '../constants/gameData'
import { G3, G3Header, G3Panel, HPBar, SpriteImage } from './ui'

const SOURCE_LABELS = {
  starter: 'Starter Partner',
  safari: 'Safari Zone Catch',
  nuzlocke: 'Nuzlocke Party',
  habit_shiny: 'Habit Streak Shiny Roll',
  project: 'Project Evolution',
  battle: 'Gym Leader Victory',
  raid: 'Co-Op Raid Victory',
  manual: 'Encountered',
}

function PokedexDetailModal({ slot, onClose }) {
  const [showShiny, setShowShiny] = useState(Boolean(slot.hasShiny && !slot.normalEntry))
  if (!slot) return null

  const activeEntry = showShiny && slot.shinyEntry ? slot.shinyEntry : slot.normalEntry || slot.shinyEntry
  const imgSrc = showShiny ? shinySprite(slot.id) : undefined
  const fallbackSrc = showShiny ? shinyStatic(slot.id) : staticSprite(slot.id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.68)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 360 }}
      >
        <G3Panel variant="teal">
          <G3Header
            icon="📖"
            rightSlot={
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.45)',
                  borderRadius: 3,
                  color: 'white',
                  width: 18,
                  height: 18,
                  cursor: 'pointer',
                  fontFamily: G3.px,
                  fontSize: '0.4rem',
                }}
              >
                ✕
              </button>
            }
          >
            NO.{String(slot.id).padStart(3, '0')} {slot.name}
          </G3Header>

          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 8,
                background: showShiny
                  ? 'radial-gradient(circle, rgba(255,215,0,0.25), #EDE8D0)'
                  : G3.creamDark,
                border: `3px solid ${showShiny ? '#eab308' : G3.borderTeal}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SpriteImage
                pokemonId={slot.id}
                srcOverride={imgSrc}
                fallbackOverride={fallbackSrc}
                alt={slot.name}
                size={88}
                enableCry
              />
            </div>

            {slot.hasShiny && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setShowShiny(false)}
                  className={`g3-btn g3-btn-sm ${!showShiny ? '' : 'g3-btn-cream'}`}
                >
                  NORMAL
                </button>
                <button
                  onClick={() => setShowShiny(true)}
                  className={`g3-btn g3-btn-sm ${showShiny ? 'g3-btn-orange' : 'g3-btn-cream'}`}
                >
                  ✨ SHINY
                </button>
              </div>
            )}

            <div style={{ width: '100%', background: 'white', border: '1px solid #D8D0B8', borderRadius: 6, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: G3.px, fontSize: '0.35rem', color: G3.textMuted }}>ORIGIN:</span>
                <span style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.text }}>
                  {SOURCE_LABELS[activeEntry?.source] || activeEntry?.source || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: G3.px, fontSize: '0.35rem', color: G3.textMuted }}>REGISTERED:</span>
                <span style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.text }}>
                  {activeEntry?.firstSeenAt ? new Date(activeEntry.firstSeenAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <p style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.textMuted, marginTop: 4, textAlign: 'center' }}>
                Tip: Hover sprite to hear Pokémon cry!
              </p>
            </div>
          </div>
        </G3Panel>
      </motion.div>
    </motion.div>
  )
}

export default function PokedexTab() {
  const { pokedexEntries, pokedexLoading, pokedexCloudSynced, fetchPokedex } = usePokedex()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)

  useEffect(() => {
    fetchPokedex()
  }, [fetchPokedex])

  const entryMap = useMemo(() => {
    const map = new Map()
    for (const entry of pokedexEntries) {
      const existing = map.get(entry.pokemonId) || { normalEntry: null, shinyEntry: null }
      if (entry.isShiny) existing.shinyEntry = entry
      else existing.normalEntry = entry
      map.set(entry.pokemonId, existing)
    }
    return map
  }, [pokedexEntries])

  /* Merge Kanto #1-#151 plus any caught non-Kanto starters/bosses (e.g. Slaking #289, Cyndaquil #155) */
  const allSlots = useMemo(() => {
    const extraIds = Array.from(entryMap.keys())
      .filter((id) => id > 151)
      .sort((a, b) => a - b)
      .map((id) => ({ id, name: getPokemonName(id) }))

    return [...KANTO_POKEDEX, ...extraIds].map((mon) => {
      const data = entryMap.get(mon.id)
      return {
        id: mon.id,
        name: mon.name,
        isCaught: Boolean(data),
        hasShiny: Boolean(data?.shinyEntry),
        normalEntry: data?.normalEntry || null,
        shinyEntry: data?.shinyEntry || null,
      }
    })
  }, [entryMap])

  const caughtKantoCount = allSlots.filter((s) => s.id <= 151 && s.isCaught).length
  const totalUniqueCaught = allSlots.filter((s) => s.isCaught).length
  const shinyCount = pokedexEntries.filter((e) => e.isShiny).length

  const filteredSlots = useMemo(() => {
    const q = search.trim().toUpperCase()
    return allSlots.filter((slot) => {
      if (filter === 'caught' && !slot.isCaught) return false
      if (filter === 'missing' && slot.isCaught) return false
      if (filter === 'shiny' && !slot.hasShiny) return false
      if (q) {
        const numStr = String(slot.id).padStart(3, '0')
        return slot.name.includes(q) || numStr.includes(q) || String(slot.id) === q
      }
      return true
    })
  }, [allSlots, filter, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>
      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header
          icon="📖"
          pillCount={3}
          rightSlot={
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {!pokedexCloudSynced && (
                <span className="pk-label" style={{ fontSize: '0.28rem', color: '#604010', background: '#F8E040', padding: '1px 4px', borderRadius: 3 }}>
                  LOCAL
                </span>
              )}
              <span className="pk-label pk-white" style={{ fontSize: '0.38rem' }}>
                {caughtKantoCount}/151 KANTO
              </span>
            </div>
          }
        >
          POKéDEX REGISTRY
        </G3Header>

        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <HPBar
                pct={caughtKantoCount / 151}
                color="#389848"
                height={9}
                showHeader
                label="KANTO COMPLETION"
                rightLabel={`${Math.round((caughtKantoCount / 151) * 100)}% (${totalUniqueCaught} total · ✨ ${shinyCount})`}
                pulseOnLow={false}
              />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search # or name..."
              className="g3-input"
              style={{ width: 170, fontSize: '1rem', padding: '4px 8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `ALL (${allSlots.length})` },
              { id: 'caught', label: `CAUGHT (${totalUniqueCaught})` },
              { id: 'missing', label: `MISSING (${151 - caughtKantoCount})` },
              { id: 'shiny', label: `✨ SHINY (${shinyCount})` },
            ].map((pill) => {
              const active = filter === pill.id
              return (
                <button
                  key={pill.id}
                  onClick={() => setFilter(pill.id)}
                  className={`g3-btn g3-btn-sm ${active ? '' : 'g3-btn-cream'}`}
                  style={{ fontSize: '0.34rem', padding: '4px 8px' }}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>
        </div>
      </G3Panel>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
        {pokedexLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <span className="pk-label" style={{ fontSize: '0.48rem', color: G3.textMuted }}>
              SCANNING POKéDEX DATA...
            </span>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="g3-panel" style={{ padding: 24, textAlign: 'center' }}>
            <p className="pk-dialogue-text" style={{ color: G3.textMuted }}>
              No Pokémon match this filter yet. Catch sessions in Safari Zone, hatch Nuzlocke tasks, or build habit streaks!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
            {filteredSlots.map((slot) => (
              <motion.button
                key={slot.id}
                whileHover={slot.isCaught ? { scale: 1.05 } : {}}
                whileTap={slot.isCaught ? { scale: 0.96 } : {}}
                onClick={() => slot.isCaught && setSelectedSlot(slot)}
                style={{
                  background: slot.isCaught ? 'white' : '#EDE8D0',
                  border: `2px solid ${slot.hasShiny ? '#eab308' : slot.isCaught ? G3.borderTeal : '#D0C8B8'}`,
                  borderRadius: 6,
                  padding: '6px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  cursor: slot.isCaught ? 'pointer' : 'default',
                  position: 'relative',
                  boxShadow: slot.isCaught ? '1px 1px 0 rgba(104,160,176,0.3)' : 'none',
                }}
              >
                {slot.hasShiny && (
                  <span style={{ position: 'absolute', top: 2, right: 4, fontSize: '0.65rem' }}>✨</span>
                )}
                <img
                  src={staticSprite(slot.id)}
                  alt={slot.isCaught ? slot.name : 'Unknown Pokémon'}
                  loading="lazy"
                  className="pixel-sprite"
                  style={{
                    width: 48,
                    height: 48,
                    filter: slot.isCaught ? 'none' : 'brightness(0) opacity(0.22)',
                  }}
                />
                <span style={{ fontFamily: G3.px, fontSize: '0.28rem', color: G3.textMuted }}>
                  #{String(slot.id).padStart(3, '0')}
                </span>
                <span
                  style={{
                    fontFamily: G3.vt,
                    fontSize: '0.82rem',
                    color: slot.isCaught ? G3.text : G3.textMuted,
                    lineHeight: 1.1,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {slot.isCaught ? slot.name : '???'}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedSlot && <PokedexDetailModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />}
      </AnimatePresence>
    </div>
  )
}
