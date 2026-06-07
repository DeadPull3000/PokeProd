import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'

/* ============================================================
   CONSTANTS
   ============================================================ */

const BOSS_SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/289.gif'
const EGG_SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pokemon-egg.png'

const BOSS_DB_ID = 1
const ATTACK_DAMAGE = 500
const ATTACK_COST = 100
const MAX_LOG_ITEMS = 6

/* Gen 3 GBA palette tokens */
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

/* ============================================================
   HELPERS
   ============================================================ */

function hpBarColor(pct) {
  if (pct > 0.5) return '#22c55e'
  if (pct > 0.2) return '#facc15'
  return '#ef4444'
}

/* ============================================================
   SHARED SUB-COMPONENTS
   ============================================================ */

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
   SECTION A  --  BOSS ARENA
   ============================================================ */

function BossHpBar({ boss }) {
  var maxHp = boss.max_hp || boss.maxHp || 10000
  var currentHp = boss.current_hp !== undefined ? boss.current_hp : (boss.currentHp || 0)
  var pct = maxHp > 0 ? Math.max(0, currentHp) / maxHp : 0
  var barColor = hpBarColor(pct)
  var isDefeated = currentHp <= 0

  return (
    <div style={{
      background: '#EDE8D0',
      border: '4px solid #383028',
      borderRadius: 6,
      padding: '10px 14px',
      boxShadow: '3px 3px 0 rgba(0,0,0,0.35)',
      maxWidth: 480,
      width: '100%',
    }}>
      {/* Name row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{
          fontFamily: G3.px, fontSize: '0.55rem',
          color: isDefeated ? G3.borderTeal : G3.text,
          letterSpacing: '-0.3px', lineHeight: 1.8,
        }}>
          {isDefeated ? 'RAID CLEARED!' : (boss.name || 'GIANT SLAKING OF SLOTH').toUpperCase()}
        </span>
        <span style={{
          fontFamily: G3.px, fontSize: '0.38rem',
          color: G3.textMuted, letterSpacing: '-0.2px',
        }}>
          {isDefeated ? '0' : Math.max(0, currentHp).toLocaleString()}/{maxHp.toLocaleString()}
        </span>
      </div>

      {/* HP label + bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: G3.px, fontSize: '0.36rem',
          color: G3.textMuted, letterSpacing: '-0.2px', flexShrink: 0,
        }}>
          HP
        </span>
        <div style={{
          flex: 1, height: 12,
          background: '#383028',
          border: '2px solid #181818',
          borderRadius: 0,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{ height: '100%', background: barColor, borderRadius: 0 }}
            animate={{ width: (Math.max(0, pct) * 100) + '%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span style={{
          fontFamily: G3.px, fontSize: '0.36rem',
          color: barColor, letterSpacing: '-0.2px', flexShrink: 0,
          minWidth: 36, textAlign: 'right',
        }}>
          {Math.round(pct * 100)}%
        </span>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <div style={{
          background: isDefeated ? 'rgba(104,176,176,0.15)' : 'rgba(249,115,22,0.12)',
          border: '1px solid ' + (isDefeated ? G3.borderTeal : '#f97316'),
          borderRadius: 3, padding: '1px 6px',
        }}>
          <span style={{
            fontFamily: G3.px, fontSize: '0.3rem',
            color: isDefeated ? G3.borderTeal : '#f97316',
            letterSpacing: '-0.1px',
          }}>
            {isDefeated ? 'DEFEATED' : 'SLACKING'}
          </span>
        </div>
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 3, padding: '1px 6px',
        }}>
          <span style={{ fontFamily: G3.px, fontSize: '0.3rem', color: '#ef4444', letterSpacing: '-0.1px' }}>
            NORMAL TYPE
          </span>
        </div>
        {/* Realtime badge */}
        <div style={{
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.5)',
          borderRadius: 3, padding: '1px 6px',
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <motion.div
            style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span style={{ fontFamily: G3.px, fontSize: '0.28rem', color: '#16a34a', letterSpacing: '-0.1px' }}>
            REALTIME
          </span>
        </div>
      </div>
    </div>
  )
}

/* Boss sprite with breathing animation + attack flash */
function BossSprite({ isDefeated, shakeControls, isShaking }) {
  return (
    <motion.div
      animate={shakeControls}
      style={{
        width: 128, height: 128,
        margin: '0 auto 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transformOrigin: 'center bottom',
        position: 'relative',
      }}
    >
      {/* Ground shadow */}
      {!isDefeated && (
        <motion.div
          animate={{ scaleX: [1, 0.88, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: -8, left: '50%',
            transform: 'translateX(-50%)',
            width: 80, height: 14,
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
            <img
              src={EGG_SPRITE_URL}
              alt="Legendary Egg"
              style={{ width: 96, height: 96, imageRendering: 'pixelated' }}
            />
          </motion.div>
          <span style={{
            fontFamily: G3.px, fontSize: '0.36rem',
            color: '#ca8a04', letterSpacing: '-0.2px', lineHeight: 1.8,
            textShadow: '0 0 8px rgba(255,215,0,0.6)',
          }}>
            LEGENDARY EGG!
          </span>
        </motion.div>
      ) : (
        <motion.img
          key={isShaking ? 'shaking' : 'idle'}
          src={BOSS_SPRITE_URL}
          alt="Giant Slaking of Sloth"
          onError={function(e) { e.target.style.opacity = '0.4' }}
          onMouseEnter={function() {
            if (!useStore.getState().soundEffects) return
            try {
              var a = new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/289.ogg')
              a.volume = 0.3
              a.play().catch(function() {})
            } catch(e) {}
          }}
          className={isShaking ? 'pixel-sprite anim-flash-shake' : 'pixel-sprite'}
          style={{
            width: 128, height: 128,
            imageRendering: 'pixelated',
            transform: 'scale(1.5)',
            transformOrigin: 'center bottom',
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
            cursor: 'pointer',
          }}
          animate={isShaking ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  )
}

/* Boss arena panel */
function BossArena({ boss, onAttackFlash, isPlayerLunging, isBossShaking, playerSpriteId }) {
  var shakeControls = useAnimation()
  var currentHp = boss.current_hp !== undefined ? boss.current_hp : (boss.currentHp || 0)
  var isDefeated = currentHp <= 0

  useEffect(function() {
    onAttackFlash.current = async function() {
      await shakeControls.start({
        x: [0, -14, 14, -10, 10, -6, 6, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      })
      shakeControls.set({ x: 0 })
    }
  }, [onAttackFlash, shakeControls])

  var PLAYER_BACK = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${playerSpriteId || 157}.gif`

  return (
    <div style={{
      background: G3.cream,
      border: '4px solid ' + G3.borderTeal,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '2px 2px 0 rgba(80,140,160,0.35), 0 4px 24px rgba(0,0,0,0.22)',
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
    }}>
      <G3Header icon="⚔️" rightSlot={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isDefeated ? '#22c55e' : '#ef4444',
            boxShadow: '0 0 6px 2px ' + (isDefeated ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'),
          }} />
          <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.1px' }}>
            {isDefeated ? 'CLEARED' : 'LIVE RAID'}
          </span>
        </div>
      }>
        COMMUNITY BOSS BATTLE
      </G3Header>

      {/* ── Cave Battle Arena ── */}
      <div className={isDefeated ? '' : 'battle-bg-cave'} style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 16px 0',
        background: isDefeated
          ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
          : undefined,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <BossHpBar boss={boss} />

        {/* Boss platform — stone oval */}
        {!isDefeated && (
          <div style={{
            position: 'absolute',
            right: '14%', bottom: '38%',
            width: 180, height: 32,
            background: 'linear-gradient(180deg, #8A7860 0%, #6A5840 55%, #4A3820 100%)',
            border: '2px solid #302010',
            boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.35), 0 3px 0 #201008',
            borderRadius: '50%',
            zIndex: 2,
          }} />
        )}

        {/* Player platform — stone oval on left */}
        {!isDefeated && (
          <div style={{
            position: 'absolute',
            left: '8%', bottom: '14%',
            width: 150, height: 40,
            background: 'linear-gradient(180deg, #9A8870 0%, #7A6850 55%, #5A4830 100%)',
            border: '2px solid #403020',
            boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3), 0 4px 0 #302010',
            borderRadius: '50%',
            zIndex: 2,
          }} />
        )}

        {/* Player back sprite — lunges on attack */}
        {!isDefeated && (
          <motion.div
            style={{
              position: 'absolute',
              left: '10%', bottom: '20%',
              zIndex: 4,
            }}
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              key={isPlayerLunging ? 'lunging' : 'idle'}
              src={PLAYER_BACK}
              alt="Your Pokémon"
              className={`pixel-sprite ${isPlayerLunging ? 'anim-lunge' : ''}`}
              style={{ width: 'auto', height: 88, imageRendering: 'pixelated' }}
              onError={function(e) {
                e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/157.png'
              }}
            />
          </motion.div>
        )}

        <BossSprite isDefeated={isDefeated} shakeControls={shakeControls} isBossShaking={isBossShaking} />

        {!isDefeated && (
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: '#383028', borderRadius: 4, padding: '2px 6px',
          }}>
            <span style={{ fontFamily: G3.px, fontSize: '0.38rem', color: '#F8E040', letterSpacing: '-0.2px' }}>
              BOSS LV.50
            </span>
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
              <p style={{ fontFamily: G3.px, fontSize: '0.52rem', color: '#7A4800', letterSpacing: '-0.3px', lineHeight: 1.8 }}>
                RAID CLEARED!
              </p>
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
    </div>
  )
}

/* ============================================================
   SECTION C  --  BATTLE LOG + ACTION MENU
   ============================================================ */

function BattleLog({ raidLog }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '10px 12px',
      gap: 5,
      overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: G3.px, fontSize: '0.36rem',
        color: G3.textMuted, letterSpacing: '-0.2px', marginBottom: 2,
      }}>
        LIVE BATTLE LOG
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflow: 'hidden',
      }}>
        <AnimatePresence initial={false} mode="popLayout">
          {raidLog.map(function(msg, i) {
            /* Detect message category for styling */
            var isYou    = msg.includes('[You]') || msg.includes('YOU unleashed')
            var isLive   = msg.includes('[Live]')
            var isSystem = !isYou && !isLive
            return (
              <motion.div
                key={msg + i}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  background: isYou    ? 'rgba(255,215,0,0.12)'
                             : isLive  ? 'rgba(104,176,176,0.07)'
                             : 'white',
                  border: '1px solid',
                  borderColor: isYou   ? 'rgba(255,215,0,0.4)'
                              : isLive ? 'rgba(104,176,176,0.25)'
                              : '#E8E0D0',
                  borderLeft: '3px solid ' + (isYou ? '#ca8a04' : isLive ? G3.borderTeal : '#D8D0B8'),
                  borderRadius: 3,
                  padding: '4px 8px',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  fontFamily: G3.vt,
                  fontSize: isYou ? '1.05rem' : '0.95rem',
                  color: isYou   ? '#7A4800'
                        : isLive ? G3.borderTeal
                        : G3.text,
                  fontWeight: isYou ? 'bold' : 'normal',
                  lineHeight: 1.3,
                  display: 'block',
                }}>
                  {isYou  && <span style={{ marginRight: 4 }}>⭐</span>}
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
  var currentHp = boss.current_hp !== undefined ? boss.current_hp : (boss.currentHp || 0)
  var maxHp = boss.max_hp || boss.maxHp || 10000
  var isDefeated = currentHp <= 0
  var canAttack = energy >= ATTACK_COST && !isDefeated
  var [cooldown, setCooldown] = useState(false)
  var [attacking, setAttacking] = useState(false)

  function handleAttack() {
    if (!canAttack || cooldown || attacking) return
    setAttacking(true)
    setCooldown(true)
    onAttack().finally(function() {
      setAttacking(false)
      setTimeout(function() { setCooldown(false) }, 600)
    })
  }

  var energyPct = Math.min(energy / 500, 1)

  return (
    <div style={{
      width: 200,
      flexShrink: 0,
      borderLeft: '1px solid #E8E0D0',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
    }}>
      {/* Energy display */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: G3.px, fontSize: '0.33rem', color: G3.textMuted, letterSpacing: '-0.1px' }}>
            ENERGY
          </span>
          <span style={{
            fontFamily: G3.px, fontSize: '0.33rem',
            color: energy >= ATTACK_COST ? '#22c55e' : '#ef4444',
            letterSpacing: '-0.1px',
          }}>
            {energy}
          </span>
        </div>
        <div style={{
          height: 10, background: '#E8E0D0',
          border: '2px solid #D0C8B0', borderRadius: 0, overflow: 'hidden',
        }}>
          <motion.div
            style={{ height: '100%', background: energy >= ATTACK_COST ? '#3b82f6' : '#94a3b8' }}
            animate={{ width: (energyPct * 100) + '%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted, marginTop: 3, textAlign: 'right' }}>
          Cost: {ATTACK_COST} / Attack
        </div>
      </div>

      {/* Attack / New Raid button */}
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
            background: !canAttack || cooldown
              ? '#B8B0A0'
              : 'linear-gradient(180deg, #F05050 0%, #C03030 100%)',
            border: '3px solid ' + (!canAttack || cooldown ? '#908880' : '#901010'),
            borderRadius: 6,
            boxShadow: !canAttack || cooldown
              ? 'none'
              : '0 4px 0 #701010, 0 0 20px rgba(240,80,80,0.4)',
            fontFamily: G3.px,
            fontSize: '0.4rem',
            color: !canAttack || cooldown ? '#706858' : 'white',
            cursor: !canAttack || cooldown ? 'not-allowed' : 'pointer',
            padding: '10px 8px',
            letterSpacing: '-0.2px',
            lineHeight: 1.8,
            textShadow: !canAttack || cooldown ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          {attacking ? 'STRIKING!' : cooldown ? 'STRIKING!' : 'ATTACK'}
          <br />
          <span style={{ fontSize: '0.32rem', opacity: 0.85 }}>
            {canAttack ? '(Cost: ' + ATTACK_COST + ' Energy)' : energy < ATTACK_COST ? 'NOT ENOUGH ENERGY' : ''}
          </span>
        </motion.button>
      ) : (
        <motion.button
          id="raid-new-btn"
          onClick={onReset}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, #68B0B0 0%, #408090 100%)',
            border: '3px solid #305070',
            borderRadius: 6,
            boxShadow: '0 4px 0 #305070, 0 0 14px rgba(104,176,176,0.5)',
            fontFamily: G3.px,
            fontSize: '0.4rem', color: 'white',
            cursor: 'pointer', padding: '10px 8px',
            letterSpacing: '-0.2px', lineHeight: 1.8,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          NEW RAID
          <br />
          <span style={{ fontSize: '0.32rem', opacity: 0.85 }}>REMATCH?</span>
        </motion.button>
      )}

      {/* Damage preview */}
      {!isDefeated && (
        <div style={{
          width: '100%',
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 4, padding: '5px 8px', textAlign: 'center',
        }}>
          <span style={{ fontFamily: G3.px, fontSize: '0.3rem', color: '#dc2626', letterSpacing: '-0.1px', lineHeight: 1.8 }}>
            YOUR DAMAGE:
          </span>
          <br />
          <span style={{
            fontFamily: G3.px, fontSize: '0.5rem',
            color: '#dc2626', letterSpacing: '-0.3px',
            textShadow: '0 0 8px rgba(239,68,68,0.5)',
          }}>
            {ATTACK_DAMAGE} HP
          </span>
        </div>
      )}

      {/* Live trainers chip */}
      <div style={{
        width: '100%',
        background: 'rgba(104,176,176,0.08)',
        border: '1px solid ' + G3.borderTeal,
        borderRadius: 4, padding: '4px 6px',
      }}>
        <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: G3.borderTeal, letterSpacing: '-0.1px', marginBottom: 3 }}>
          CONNECTED:
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ background: '#22c55e', borderRadius: 3, padding: '1px 4px' }}
          >
            <span style={{ fontFamily: G3.vt, fontSize: '0.75rem', color: 'white' }}>YOU</span>
          </motion.div>
          {['Ash', 'Dawn', 'May'].map(function(name) {
            return (
              <motion.div
                key={name}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: G3.borderTeal, borderRadius: 3, padding: '1px 4px' }}
              >
                <span style={{ fontFamily: G3.vt, fontSize: '0.75rem', color: 'white' }}>{name}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* Two-pane battle menu */
function BattleMenu({ boss, raidLog, energy, onAttack, onReset }) {
  return (
    <div style={{
      background: G3.cream,
      border: '4px solid ' + G3.borderOrange,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '2px 2px 0 rgba(200,120,96,0.35), 0 4px 16px rgba(0,0,0,0.18)',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <G3Header icon="💬">BATTLE MENU</G3Header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <BattleLog raidLog={raidLog} />
        <ActionMenu boss={boss} energy={energy} onAttack={onAttack} onReset={onReset} />
      </div>
    </div>
  )
}

/* ============================================================
   RAID STATS STRIP
   ============================================================ */

function RaidStatsStrip({ boss, energy }) {
  var maxHp = boss.max_hp || boss.maxHp || 10000
  var currentHp = boss.current_hp !== undefined ? boss.current_hp : (boss.currentHp || 0)
  var pct = maxHp > 0 ? Math.max(0, currentHp) / maxHp : 0
  var dmgDealt = maxHp - Math.max(0, currentHp)
  var isDefeated = currentHp <= 0

  return (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
      {[
        { label: 'BOSS HP',     value: isDefeated ? '0' : Math.max(0, currentHp).toLocaleString(), color: hpBarColor(pct) },
        { label: 'DMG DEALT',   value: dmgDealt.toLocaleString(),                                   color: '#f97316' },
        { label: 'YOUR ENERGY', value: energy.toString(),                                            color: '#3b82f6' },
        { label: 'PROGRESS',    value: Math.round((1 - pct) * 100) + '%',                           color: G3.borderTeal },
      ].map(function(stat) {
        return (
          <div key={stat.label} style={{
            flex: 1, minWidth: 90,
            background: G3.cream,
            border: '2px solid ' + G3.borderTeal,
            borderRadius: 6,
            padding: '6px 10px',
            boxShadow: '1px 1px 0 rgba(80,140,160,0.3)',
          }}>
            <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: G3.textMuted, letterSpacing: '-0.1px', marginBottom: 3 }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: G3.px, fontSize: '0.52rem',
              color: stat.color, letterSpacing: '-0.3px',
              textShadow: '0 0 6px ' + stat.color + '40',
            }}>
              {stat.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ============================================================
   MAIN TAB COMPONENT  --  SUPABASE REALTIME WIRED
   ============================================================ */

export default function RaidHub() {
  /* Auth + settings from Zustand */
  var { user, trainerName, raidEnergy, raidAttack: localRaidAttack, starterPokemon } = useStore()

  /* Animation states for battle moves */
  var [playerLunging, setPlayerLunging] = useState(false)
  var [bossShaking, setBossShaking] = useState(false)

  /* Local state — boss is source-of-truth from DB */
  var [boss, setBoss] = useState({
    id: BOSS_DB_ID,
    name: 'Giant Slaking of Sloth',
    max_hp: 10000,
    current_hp: 10000,
  })
  var [raidLog, setRaidLog] = useState([
    'The raid has begun!',
    'Co-op trainers are joining...',
  ])
  var [energy, setEnergy] = useState(500)
  var [dbError, setDbError] = useState(null)

  var attackFlashRef = useRef(null)
  var logChannelRef  = useRef(null)

  /* ---- Helper: push a message to the front of log (max 6) ---- */
  function pushLog(msg) {
    setRaidLog(function(prev) {
      return [msg, ...prev].slice(0, MAX_LOG_ITEMS)
    })
  }

  /* ---- Part 1: Fetch initial boss state from DB on mount ---- */
  useEffect(function() {
    async function fetchBoss() {
      var result = await supabase
        .from('raid_boss')
        .select('*')
        .eq('id', BOSS_DB_ID)
        .single()
      if (result.error) {
        setDbError(result.error.message)
        /* Fall back gracefully to default local state */
      } else if (result.data) {
        setBoss(result.data)
      }
    }
    fetchBoss()
  }, [])

  /* ---- Part 2: Realtime DB subscription for Boss HP ---- */
  useEffect(function() {
    var hpChannel = supabase
      .channel('public:raid_boss')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'raid_boss' },
        function(payload) {
          setBoss(payload.new)
          /* Trigger boss shake animation whenever HP changes */
          if (attackFlashRef.current) attackFlashRef.current()
        }
      )
      .subscribe()

    return function() {
      supabase.removeChannel(hpChannel)
    }
  }, [])

  /* ---- Part 3: Broadcast channel for live battle chat ---- */
  useEffect(function() {
    var logChannel = supabase
      .channel('raid_log', { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'attack' }, function(payload) {
        if (payload && payload.payload && payload.payload.message) {
          pushLog(payload.payload.message)
        }
      })
      .subscribe()

    logChannelRef.current = logChannel

    return function() {
      supabase.removeChannel(logChannel)
      logChannelRef.current = null
    }
  }, [])

  /* ---- Part 4: True attack action ---- */
  var handleAttack = useCallback(async function() {
    /* Security: must be logged in */
    if (!user) return

    var currentHp = boss.current_hp !== undefined ? boss.current_hp : (boss.currentHp || 0)
    if (energy < ATTACK_COST || currentHp <= 0) return

    /* Deduct energy locally (optimistic) */
    setEnergy(function(e) { return Math.max(0, e - ATTACK_COST) })

    /* Fetch the absolute latest HP to avoid race conditions */
    var freshResult = await supabase
      .from('raid_boss')
      .select('current_hp')
      .eq('id', BOSS_DB_ID)
      .single()

    var latestHp = freshResult.data ? freshResult.data.current_hp : currentHp
    var newHp = Math.max(0, latestHp - ATTACK_DAMAGE)

    /* Update HP in database -- triggers realtime for all clients */
    var updateResult = await supabase
      .from('raid_boss')
      .update({ current_hp: newHp })
      .eq('id', BOSS_DB_ID)

    if (updateResult.error) {
      /* Rollback energy on failure */
      setEnergy(function(e) { return e + ATTACK_COST })
      pushLog('[System] Attack failed: ' + updateResult.error.message)
      return
    }

    /* Broadcast the attack event to all connected clients */
    var displayName = trainerName || (user && user.email ? user.email.split('@')[0] : 'Trainer')
    var attackMsg = '[You] ' + displayName + ' dealt ' + ATTACK_DAMAGE + ' damage!'
    var broadcastMsg = '[Live] ' + displayName + ' dealt ' + ATTACK_DAMAGE + ' damage!'

    if (logChannelRef.current) {
      logChannelRef.current.send({
        type: 'broadcast',
        event: 'attack',
        payload: { message: broadcastMsg },
      })
    }

    /* Also push the "your" version locally (self:true ensures it comes via broadcast too,
       but we tag it distinctly so the local message shows with gold stars) */
    pushLog(attackMsg)

    /* Trigger the player lunge animation */
    setPlayerLunging(true)
    setTimeout(function() { setPlayerLunging(false) }, 600)

    /* After 200ms, trigger the boss flash-shake */
    setTimeout(function() {
      setBossShaking(true)
      setTimeout(function() { setBossShaking(false) }, 600)
      /* Also run the framer-motion shake from the ref */
      if (attackFlashRef.current) attackFlashRef.current()
    }, 200)
  }, [user, boss, energy, trainerName])

  /* ---- Part 5: New Raid reset (resets DB back to full HP) ---- */
  var handleReset = useCallback(async function() {
    var result = await supabase
      .from('raid_boss')
      .update({ current_hp: boss.max_hp || boss.maxHp || 10000 })
      .eq('id', BOSS_DB_ID)

    if (!result.error) {
      setEnergy(500)
      setRaidLog(['A new raid has started!', 'Trainers are assembling...'])
    }
  }, [boss])

  var currentHp = boss.current_hp !== undefined ? boss.current_hp : (boss.currentHp || 0)
  var maxHp = boss.max_hp || boss.maxHp || 10000

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      overflow: 'hidden',
    }}>
      {/* DB error banner */}
      {dbError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFF0F0',
            border: '2px solid #D04030',
            borderRadius: 5, padding: '6px 10px',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: '#D04030' }}>
            DB: {dbError}
          </span>
          <span style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: '#D04030' }}>
            (Running in local mode -- create the raid_boss table in Supabase)
          </span>
        </motion.div>
      )}

      {/* Auth warning banner */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,215,0,0.1)',
            border: '2px solid #ca8a04',
            borderRadius: 5, padding: '6px 10px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: '#92400e' }}>
            LOG IN to participate in the raid!
          </span>
        </motion.div>
      )}

      {/* Stats strip */}
      <RaidStatsStrip boss={boss} energy={energy} />

      {/* Boss arena */}
      <BossArena
        boss={boss}
        onAttackFlash={attackFlashRef}
        isPlayerLunging={playerLunging}
        isBossShaking={bossShaking}
        playerSpriteId={starterPokemon ? starterPokemon.id : 157}
      />

      {/* Battle menu */}
      <div style={{ height: 190, flexShrink: 0 }}>
        <BattleMenu
          boss={boss}
          raidLog={raidLog}
          energy={energy}
          onAttack={handleAttack}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}
