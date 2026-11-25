import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useAuth, useSettings, usePokedex } from '../store'
import { supabase } from '../lib/supabase'
import { SPRITE_BASE, itemUrl } from '../constants/gameData'
import { G3, G3Header, G3Panel, SpriteImage, HPBar } from './ui'

const EGG_SPRITE_URL = itemUrl('pokemon-egg')
const BOSS_DB_ID = 1
const ATTACK_DAMAGE = 500
const ATTACK_COST = 100
const MAX_LOG_ITEMS = 6

function hpBarColor(pct) {
  if (pct > 0.5) return '#22c55e'
  if (pct > 0.2) return '#facc15'
  return '#ef4444'
}

function BossHpBar({ boss }) {
  const maxHp = boss.max_hp || boss.maxHp || 10000
  const currentHp = boss.current_hp !== undefined ? boss.current_hp : boss.currentHp || 0
  const pct = maxHp > 0 ? Math.max(0, currentHp) / maxHp : 0
  const barColor = hpBarColor(pct)
  const isDefeated = currentHp <= 0

  return (
    <div
      style={{
        background: G3.creamDark,
        border: `4px solid ${G3.text}`,
        borderRadius: 6,
        padding: '10px 14px',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.35)',
        maxWidth: 480,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span
          style={{
            fontFamily: G3.px,
            fontSize: '0.55rem',
            color: isDefeated ? G3.borderTeal : G3.text,
            letterSpacing: '-0.3px',
            lineHeight: 1.8,
          }}
        >
          {isDefeated ? 'RAID CLEARED!' : (boss.name || 'GIANT SLAKING OF SLOTH').toUpperCase()}
        </span>
        <span style={{ fontFamily: G3.px, fontSize: '0.38rem', color: G3.textMuted, letterSpacing: '-0.2px' }}>
          {isDefeated ? '0' : Math.max(0, currentHp).toLocaleString()}/{maxHp.toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: G3.px, fontSize: '0.36rem', color: G3.textMuted, flexShrink: 0 }}>HP</span>
        <div style={{ flex: 1 }}>
          <HPBar pct={pct} color={barColor} height={12} pulseOnLow={false} />
        </div>
        <span style={{ fontFamily: G3.px, fontSize: '0.36rem', color: barColor, flexShrink: 0, minWidth: 36, textAlign: 'right' }}>
          {Math.round(pct * 100)}%
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        <div
          style={{
            background: isDefeated ? 'rgba(104,176,176,0.15)' : 'rgba(249,115,22,0.12)',
            border: '1px solid ' + (isDefeated ? G3.borderTeal : '#f97316'),
            borderRadius: 3,
            padding: '1px 6px',
          }}
        >
          <span style={{ fontFamily: G3.px, fontSize: '0.3rem', color: isDefeated ? G3.borderTeal : '#f97316' }}>
            {isDefeated ? 'DEFEATED' : 'SLACKING'}
          </span>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 3, padding: '1px 6px' }}>
          <span style={{ fontFamily: G3.px, fontSize: '0.3rem', color: '#ef4444' }}>NORMAL TYPE</span>
        </div>
        <div
          style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.5)',
            borderRadius: 3,
            padding: '1px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <motion.div
            style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span style={{ fontFamily: G3.px, fontSize: '0.28rem', color: '#16a34a' }}>REALTIME</span>
        </div>
      </div>
    </div>
  )
}

function BossSprite({ isDefeated, shakeControls, isBossShaking }) {
  return (
    <motion.div
      animate={shakeControls}
      style={{
        width: 128,
        height: 128,
        margin: '0 auto 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transformOrigin: 'center bottom',
        position: 'relative',
      }}
    >
      {!isDefeated && (
        <motion.div
          animate={{ scaleX: [1, 0.88, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 14,
            background: 'rgba(0,0,0,0.18)',
            borderRadius: '50%',
            filter: 'blur(3px)',
          }}
        />
      )}

      {isDefeated ? (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 18px 4px rgba(255,215,0,0.5)',
                '0 0 36px 10px rgba(255,215,0,0.9)',
                '0 0 18px 4px rgba(255,215,0,0.5)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ borderRadius: '50%', padding: 6 }}
          >
            <img src={EGG_SPRITE_URL} alt="Legendary Egg" style={{ width: 96, height: 96, imageRendering: 'pixelated' }} />
          </motion.div>
          <span
            style={{
              fontFamily: G3.px,
              fontSize: '0.36rem',
              color: '#ca8a04',
              letterSpacing: '-0.2px',
              lineHeight: 1.8,
              textShadow: '0 0 8px rgba(255,215,0,0.6)',
            }}
          >
            LEGENDARY EGG!
          </span>
        </motion.div>
      ) : (
        <motion.div
          animate={isBossShaking ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <SpriteImage
            pokemonId={289}
            alt="Giant Slaking of Sloth"
            size={128}
            enableCry
            className={isBossShaking ? 'anim-flash-shake' : ''}
            style={{
              transform: 'scale(1.35)',
              transformOrigin: 'center bottom',
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
            }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

function BossArena({ boss, onRegisterFlash, isPlayerLunging, isBossShaking, playerSpriteId }) {
  const shakeControls = useAnimation()
  const currentHp = boss.current_hp !== undefined ? boss.current_hp : boss.currentHp || 0
  const isDefeated = currentHp <= 0

  useEffect(() => {
    onRegisterFlash(async () => {
      await shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      })
      shakeControls.set({ x: 0 })
    })
  }, [onRegisterFlash, shakeControls])

  return (
    <G3Panel variant="teal" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 220 }}>
      <G3Header
        icon="⚔️"
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isDefeated ? '#22c55e' : '#ef4444',
                boxShadow: '0 0 6px 2px ' + (isDefeated ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'),
              }}
            />
            <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: 'rgba(255,255,255,0.9)' }}>
              {isDefeated ? 'CLEARED' : 'LIVE RAID'}
            </span>
          </div>
        }
      >
        COMMUNITY BOSS BATTLE
      </G3Header>

      <div
        className={isDefeated ? '' : 'battle-bg-cave'}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 16px 0',
          background: isDefeated ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' : undefined,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <BossHpBar boss={boss} />

        {!isDefeated && (
          <div
            style={{
              position: 'absolute',
              right: '14%',
              bottom: '38%',
              width: 180,
              height: 32,
              background: 'linear-gradient(180deg, #8A7860 0%, #6A5840 55%, #4A3820 100%)',
              border: '2px solid #302010',
              boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.35), 0 3px 0 #201008',
              borderRadius: '50%',
              zIndex: 2,
            }}
          />
        )}

        {!isDefeated && (
          <div
            style={{
              position: 'absolute',
              left: '8%',
              bottom: '14%',
              width: 150,
              height: 40,
              background: 'linear-gradient(180deg, #9A8870 0%, #7A6850 55%, #5A4830 100%)',
              border: '2px solid #403020',
              boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3), 0 4px 0 #302010',
              borderRadius: '50%',
              zIndex: 2,
            }}
          />
        )}

        {!isDefeated && (
          <motion.div
            style={{ position: 'absolute', left: '10%', bottom: '20%', zIndex: 4 }}
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SpriteImage
              key={isPlayerLunging ? 'lunging' : 'idle'}
              pokemonId={playerSpriteId || 157}
              back
              alt="Your Pokémon"
              size={88}
              className={isPlayerLunging ? 'anim-lunge' : ''}
              fallbackOverride={`${SPRITE_BASE}/pokemon/back/157.png`}
            />
          </motion.div>
        )}

        <BossSprite isDefeated={isDefeated} shakeControls={shakeControls} isBossShaking={isBossShaking} />

        {!isDefeated && (
          <div className="hidden sm:block" style={{ position: 'absolute', top: 14, left: 14, background: G3.text, borderRadius: 4, padding: '2px 6px' }}>
            <span style={{ fontFamily: G3.px, fontSize: '0.38rem', color: '#F8E040' }}>BOSS LV.50</span>
          </div>
        )}

        <AnimatePresence>
          {isDefeated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              style={{
                background: 'linear-gradient(135deg, #F8E040, #FFD700)',
                border: '3px solid #C89820',
                borderRadius: 8,
                padding: '10px 24px',
                boxShadow: '0 0 30px 8px rgba(255,215,0,0.5), 3px 3px 0 #C89820',
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: G3.px, fontSize: '0.52rem', color: '#7A4800', lineHeight: 1.8 }}>RAID CLEARED!</p>
              <p style={{ fontFamily: G3.vt, fontSize: '1.1rem', color: '#5A3400', marginTop: 2 }}>
                The community defeated the Boss!
              </p>
              <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: '#7A4800', marginTop: 1 }}>
                You earned a Legendary Egg!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </G3Panel>
  )
}

function BattleLog({ raidLog }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '10px 12px', gap: 5, overflow: 'hidden' }}>
      <div style={{ fontFamily: G3.px, fontSize: '0.36rem', color: G3.textMuted, marginBottom: 2 }}>
        LIVE BATTLE LOG
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
        <AnimatePresence initial={false} mode="popLayout">
          {raidLog.map((msg, i) => {
            const isYou = msg.includes('[You]') || msg.includes('YOU unleashed')
            const isLive = msg.includes('[Live]')
            return (
              <motion.div
                key={msg + i}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  background: isYou ? 'rgba(255,215,0,0.12)' : isLive ? 'rgba(104,176,176,0.07)' : 'white',
                  border: '1px solid',
                  borderColor: isYou ? 'rgba(255,215,0,0.4)' : isLive ? 'rgba(104,176,176,0.25)' : '#E8E0D0',
                  borderLeft: '3px solid ' + (isYou ? '#ca8a04' : isLive ? G3.borderTeal : '#D8D0B8'),
                  borderRadius: 3,
                  padding: '4px 8px',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: G3.vt,
                    fontSize: isYou ? '1.05rem' : '0.95rem',
                    color: isYou ? '#7A4800' : isLive ? G3.borderTeal : G3.text,
                    fontWeight: isYou ? 'bold' : 'normal',
                    lineHeight: 1.3,
                    display: 'block',
                  }}
                >
                  {isYou && <span style={{ marginRight: 4 }}>⭐</span>}
                  {isLive && <span style={{ marginRight: 4 }}>🌐</span>}
                  {msg}
                  {isYou && <span style={{ marginLeft: 4 }}>⭐</span>}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ActionMenu({ boss, energy, onAttack, onReset }) {
  const currentHp = boss.current_hp !== undefined ? boss.current_hp : boss.currentHp || 0
  const isDefeated = currentHp <= 0
  const canAttack = energy >= ATTACK_COST && !isDefeated
  const [cooldown, setCooldown] = useState(false)
  const [attacking, setAttacking] = useState(false)

  function handleAttack() {
    if (!canAttack || cooldown || attacking) return
    setAttacking(true)
    setCooldown(true)
    onAttack().finally(() => {
      setAttacking(false)
      setTimeout(() => setCooldown(false), 600)
    })
  }

  const energyPct = Math.min(energy / 500, 1)

  return (
    <div
      className="raid-action-col"
      style={{
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: G3.px, fontSize: '0.33rem', color: G3.textMuted }}>ENERGY</span>
          <span style={{ fontFamily: G3.px, fontSize: '0.33rem', color: energy >= ATTACK_COST ? '#22c55e' : '#ef4444' }}>
            {energy}
          </span>
        </div>
        <div style={{ height: 10, background: '#E8E0D0', border: '2px solid #D0C8B0', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: energy >= ATTACK_COST ? '#3b82f6' : '#94a3b8' }}
            animate={{ width: energyPct * 100 + '%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted, marginTop: 3, textAlign: 'right' }}>
          Cost: {ATTACK_COST} / Attack
        </div>
      </div>

      {!isDefeated ? (
        <motion.button
          id="raid-attack-btn"
          onClick={handleAttack}
          disabled={!canAttack || cooldown}
          whileHover={canAttack && !cooldown ? { scale: 1.04, y: -1 } : {}}
          whileTap={canAttack && !cooldown ? { scale: 0.95, y: 1 } : {}}
          animate={cooldown ? { scale: [1, 1.08, 0.96, 1] } : {}}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            background: !canAttack || cooldown ? '#B8B0A0' : 'linear-gradient(180deg, #F05050 0%, #C03030 100%)',
            border: '3px solid ' + (!canAttack || cooldown ? '#908880' : '#901010'),
            borderRadius: 6,
            boxShadow: !canAttack || cooldown ? 'none' : '0 4px 0 #701010, 0 0 20px rgba(240,80,80,0.4)',
            fontFamily: G3.px,
            fontSize: '0.4rem',
            color: !canAttack || cooldown ? G3.textMuted : 'white',
            cursor: !canAttack || cooldown ? 'not-allowed' : 'pointer',
            padding: '10px 8px',
            letterSpacing: '-0.2px',
            lineHeight: 1.8,
            textShadow: !canAttack || cooldown ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          {attacking || cooldown ? 'STRIKING!' : 'ATTACK'}
          <br />
          <span style={{ fontSize: '0.32rem', opacity: 0.85 }}>
            {canAttack ? `(Cost: ${ATTACK_COST} Energy)` : energy < ATTACK_COST ? 'NOT ENOUGH ENERGY' : ''}
          </span>
        </motion.button>
      ) : (
        <motion.button
          id="raid-new-btn"
          onClick={onReset}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="g3-btn w-full"
          style={{ fontSize: '0.4rem', padding: '10px 8px' }}
        >
          NEW RAID
          <br />
          <span style={{ fontSize: '0.32rem', opacity: 0.85 }}>REMATCH?</span>
        </motion.button>
      )}

      {!isDefeated && (
        <div
          style={{
            width: '100%',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 4,
            padding: '5px 8px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontFamily: G3.px, fontSize: '0.3rem', color: '#dc2626', lineHeight: 1.8 }}>YOUR DAMAGE:</span>
          <br />
          <span style={{ fontFamily: G3.px, fontSize: '0.5rem', color: '#dc2626', textShadow: '0 0 8px rgba(239,68,68,0.5)' }}>
            {ATTACK_DAMAGE} HP
          </span>
        </div>
      )}

      <div style={{ width: '100%', background: 'rgba(104,176,176,0.08)', border: `1px solid ${G3.borderTeal}`, borderRadius: 4, padding: '4px 6px' }}>
        <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: G3.borderTeal, marginBottom: 3 }}>CONNECTED:</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: '#22c55e', borderRadius: 3, padding: '1px 4px' }}>
            <span style={{ fontFamily: G3.vt, fontSize: '0.75rem', color: 'white' }}>YOU</span>
          </motion.div>
          {['Ash', 'Dawn', 'May'].map((name, idx) => (
            <motion.div
              key={name}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: G3.borderTeal, borderRadius: 3, padding: '1px 4px' }}
            >
              <span style={{ fontFamily: G3.vt, fontSize: '0.75rem', color: 'white' }}>{name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BattleMenu({ boss, raidLog, energy, onAttack, onReset }) {
  return (
    <G3Panel variant="orange" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <G3Header icon="💬">BATTLE MENU</G3Header>
      <div className="raid-battle-menu-body">
        <BattleLog raidLog={raidLog} />
        <ActionMenu boss={boss} energy={energy} onAttack={onAttack} onReset={onReset} />
      </div>
    </G3Panel>
  )
}

function RaidStatsStrip({ boss, energy }) {
  const maxHp = boss.max_hp || boss.maxHp || 10000
  const currentHp = boss.current_hp !== undefined ? boss.current_hp : boss.currentHp || 0
  const pct = maxHp > 0 ? Math.max(0, currentHp) / maxHp : 0
  const dmgDealt = maxHp - Math.max(0, currentHp)
  const isDefeated = currentHp <= 0

  return (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
      {[
        { label: 'BOSS HP', value: isDefeated ? '0' : Math.max(0, currentHp).toLocaleString(), color: hpBarColor(pct) },
        { label: 'DMG DEALT', value: dmgDealt.toLocaleString(), color: '#f97316' },
        { label: 'YOUR ENERGY', value: energy.toString(), color: '#3b82f6' },
        { label: 'PROGRESS', value: Math.round((1 - pct) * 100) + '%', color: G3.borderTeal },
      ].map((stat) => (
        <div
          key={stat.label}
          style={{
            flex: 1,
            minWidth: 90,
            background: G3.cream,
            border: `2px solid ${G3.borderTeal}`,
            borderRadius: 6,
            padding: '6px 10px',
            boxShadow: '1px 1px 0 rgba(80,140,160,0.3)',
          }}
        >
          <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: G3.textMuted, marginBottom: 3 }}>{stat.label}</div>
          <div style={{ fontFamily: G3.px, fontSize: '0.52rem', color: stat.color, textShadow: `0 0 6px ${stat.color}40` }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RaidHub() {
  const { user } = useAuth()
  const { trainerName, starterPokemon } = useSettings()
  const { registerPokemon } = usePokedex()

  const [playerLunging, setPlayerLunging] = useState(false)
  const [bossShaking, setBossShaking] = useState(false)

  const [boss, setBoss] = useState({
    id: BOSS_DB_ID,
    name: 'Giant Slaking of Sloth',
    max_hp: 10000,
    current_hp: 10000,
  })
  const [raidLog, setRaidLog] = useState(['The raid has begun!', 'Co-op trainers are joining...'])
  const [energy, setEnergy] = useState(500)
  const [dbError, setDbError] = useState(null)

  const attackFlashRef = useRef(null)
  const logChannelRef = useRef(null)

  const registerFlash = useCallback((fn) => {
    attackFlashRef.current = fn
  }, [])

  function pushLog(msg) {
    setRaidLog((prev) => [msg, ...prev].slice(0, MAX_LOG_ITEMS))
  }

  useEffect(() => {
    async function fetchBoss() {
      const result = await supabase.from('raid_boss').select('*').eq('id', BOSS_DB_ID).single()
      if (result.error) {
        setDbError(result.error.message)
      } else if (result.data) {
        setBoss(result.data)
      }
    }
    fetchBoss()
  }, [])

  useEffect(() => {
    const hpChannel = supabase
      .channel('public:raid_boss')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'raid_boss' }, (payload) => {
        setBoss(payload.new)
        if (attackFlashRef.current) attackFlashRef.current()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(hpChannel)
    }
  }, [])

  useEffect(() => {
    const logChannel = supabase
      .channel('raid_log', { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'attack' }, (payload) => {
        if (payload?.payload?.message) {
          pushLog(payload.payload.message)
        }
      })
      .subscribe()

    logChannelRef.current = logChannel

    return () => {
      supabase.removeChannel(logChannel)
      logChannelRef.current = null
    }
  }, [])

  const handleAttack = useCallback(async () => {
    if (!user) return
    const currentHp = boss.current_hp !== undefined ? boss.current_hp : boss.currentHp || 0
    if (energy < ATTACK_COST || currentHp <= 0) return

    setEnergy((e) => Math.max(0, e - ATTACK_COST))

    const freshResult = await supabase.from('raid_boss').select('current_hp').eq('id', BOSS_DB_ID).single()
    const latestHp = freshResult.data ? freshResult.data.current_hp : currentHp
    const newHp = Math.max(0, latestHp - ATTACK_DAMAGE)

    const updateResult = await supabase.from('raid_boss').update({ current_hp: newHp }).eq('id', BOSS_DB_ID)
    if (updateResult.error) {
      setEnergy((e) => e + ATTACK_COST)
      pushLog('[System] Attack failed: ' + updateResult.error.message)
      return
    }

    const displayName = trainerName || (user.email ? user.email.split('@')[0] : 'Trainer')
    const broadcastMsg = `[Live] ${displayName} dealt ${ATTACK_DAMAGE} damage!`

    if (logChannelRef.current) {
      logChannelRef.current.send({
        type: 'broadcast',
        event: 'attack',
        payload: { message: broadcastMsg },
      })
    }

    pushLog(`[You] ${displayName} dealt ${ATTACK_DAMAGE} damage!`)

    setPlayerLunging(true)
    setTimeout(() => setPlayerLunging(false), 600)

    setTimeout(() => {
      setBossShaking(true)
      setTimeout(() => setBossShaking(false), 600)
      if (attackFlashRef.current) attackFlashRef.current()
    }, 200)

    if (newHp <= 0) {
      registerPokemon(289, false, 'raid')
    }
  }, [user, boss, energy, trainerName, registerPokemon])

  const handleReset = useCallback(async () => {
    const result = await supabase
      .from('raid_boss')
      .update({ current_hp: boss.max_hp || boss.maxHp || 10000 })
      .eq('id', BOSS_DB_ID)

    if (!result.error) {
      setEnergy(500)
      setRaidLog(['A new raid has started!', 'Trainers are assembling...'])
    }
  }, [boss])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
      {dbError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFF0F0',
            border: `2px solid ${G3.accentRed}`,
            borderRadius: 5,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.accentRed }}>DB: {dbError}</span>
          <span style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.accentRed }}>
            (Running in local mode — create the raid_boss table in Supabase)
          </span>
        </motion.div>
      )}

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,215,0,0.1)', border: '2px solid #ca8a04', borderRadius: 5, padding: '6px 10px', flexShrink: 0 }}
        >
          <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: '#92400e' }}>LOG IN to participate in the raid!</span>
        </motion.div>
      )}

      <RaidStatsStrip boss={boss} energy={energy} />

      <BossArena
        boss={boss}
        onRegisterFlash={registerFlash}
        isPlayerLunging={playerLunging}
        isBossShaking={bossShaking}
        playerSpriteId={starterPokemon ? starterPokemon.id : 157}
      />

      <div style={{ minHeight: 190, flexShrink: 0 }}>
        <BattleMenu boss={boss} raidLog={raidLog} energy={energy} onAttack={handleAttack} onReset={handleReset} />
      </div>
    </div>
  )
}
