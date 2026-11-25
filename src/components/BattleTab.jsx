import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useBattle, useUI, ELEMENTS } from '../store'
import { GYM_LEADERS, getDailyGymLeader } from '../constants/pokedex151'
import { G3, G3Header, G3Panel, HPBar, SpriteImage } from './ui'

export default function BattleTab() {
  const { dailyBoss, gymBadges, battleLoading, battleCloudSynced, fetchBattleState, strikeDailyBoss } = useBattle()
  const { setActiveTab } = useUI()

  useEffect(() => {
    fetchBattleState()
  }, [fetchBattleState])

  const leader = GYM_LEADERS.find((l) => l.id === dailyBoss?.leaderId) || getDailyGymLeader()
  const el = ELEMENTS[leader.element] || ELEMENTS.fire
  const maxHp = dailyBoss?.bossHp || 4
  const currentHp = dailyBoss?.currentHp ?? maxHp
  const isDefeated = Boolean(dailyBoss?.isDefeated || currentHp <= 0)
  const hpPct = maxHp > 0 ? Math.max(0, currentHp) / maxHp : 0
  const earnedSet = new Set(gymBadges.map((b) => b.badgeType))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header
          icon="⚔️"
          pillCount={3}
          rightSlot={
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {!battleCloudSynced && (
                <span className="pk-label" style={{ fontSize: '0.28rem', color: '#604010', background: '#F8E040', padding: '1px 4px', borderRadius: 3 }}>
                  LOCAL
                </span>
              )}
              <span className="pk-label pk-white" style={{ fontSize: '0.38rem' }}>
                {gymBadges.length}/8 BADGES
              </span>
            </div>
          }
        >
          DAILY GYM CHALLENGE
        </G3Header>

        {battleLoading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <span className="pk-label" style={{ fontSize: '0.45rem', color: G3.textMuted }}>
              ENTERING GYM ARENA...
            </span>
          </div>
        ) : (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              className="battle-bg rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
              style={{ border: `3px solid ${leader.color}` }}
            >
              <div style={{ position: 'relative', zIndex: 2, flex: 1, minWidth: 0, width: '100%' }}>
                <div className="g3-panel" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                    <span className="pk-title" style={{ fontSize: '0.52rem', color: leader.color }}>
                      {leader.badgeEmoji} {leader.leaderName} — {leader.aceName}
                    </span>
                    <span className="pk-label" style={{ fontSize: '0.36rem', color: G3.textMuted }}>
                      {isDefeated ? 'CLEARED!' : `${currentHp} / ${maxHp} HP`}
                    </span>
                  </div>

                  <HPBar
                    pct={isDefeated ? 0 : hpPct}
                    height={10}
                    pulseOnLow={!isDefeated}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: G3.px,
                        fontSize: '0.32rem',
                        background: el.bgHex,
                        border: `1px solid ${el.borderColor}`,
                        color: el.borderColor,
                        padding: '2px 6px',
                        borderRadius: 3,
                      }}
                    >
                      WEAK TO: {el.emoji} {el.label.toUpperCase()} (1.0 DMG)
                    </span>
                    <span style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.textMuted }}>
                      Off-type quests: 0.5 DMG · Safari catch: 1.5 DMG
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    background: 'rgba(248, 248, 237, 0.94)',
                    border: '2px solid #D8D0B8',
                    borderRadius: 5,
                    padding: '6px 10px',
                  }}
                >
                  <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.text, lineHeight: 1.3 }}>
                    {isDefeated
                      ? `Victory! You conquered ${leader.name} and earned the ${leader.badgeName}!`
                      : `“${leader.quote}”`}
                  </p>
                </div>
              </div>

              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 130,
                }}
              >
                <motion.div
                  animate={isDefeated ? { opacity: 0.35, scale: 0.85 } : { y: [0, -6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <SpriteImage pokemonId={leader.aceId} alt={leader.aceName} size={104} enableCry />
                </motion.div>
                <span
                  style={{
                    marginTop: 4,
                    background: '#383028',
                    color: '#F8E040',
                    fontFamily: G3.px,
                    fontSize: '0.32rem',
                    padding: '2px 6px',
                    borderRadius: 3,
                  }}
                >
                  {leader.name}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveTab('journey')}
                className="g3-btn g3-btn-sm"
              >
                COMPLETE QUESTS TO ATTACK ▶
              </button>
              <button
                onClick={() => setActiveTab('safari')}
                className="g3-btn g3-btn-sm g3-btn-orange"
              >
                SAFARI FOCUS (1.5 DMG) ▶
              </button>
              {!isDefeated && (
                <button
                  onClick={() => strikeDailyBoss(leader.element, 0.5)}
                  className="g3-btn g3-btn-sm g3-btn-cream"
                  title="Quick training spar (-0.5 HP)"
                >
                  SPAR (-0.5 HP)
                </button>
              )}
            </div>
          </div>
        )}
      </G3Panel>

      <G3Panel variant="orange" style={{ flexShrink: 0 }}>
        <G3Header icon="🏅">TRAINER BADGE CASE ({gymBadges.length}/8)</G3Header>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3">
          {GYM_LEADERS.map((g) => {
            const isEarned = earnedSet.has(g.badgeType)
            const badgeRecord = gymBadges.find((b) => b.badgeType === g.badgeType)
            return (
              <motion.div
                key={g.id}
                whileHover={isEarned ? { scale: 1.04 } : {}}
                style={{
                  background: isEarned ? 'white' : G3.creamDark,
                  border: `2px solid ${isEarned ? g.color : '#C8C0B0'}`,
                  borderRadius: 6,
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textAlign: 'center',
                  boxShadow: isEarned ? `0 0 12px ${g.color}30` : 'none',
                  opacity: isEarned ? 1 : 0.65,
                }}
              >
                <div
                  style={{
                    fontSize: '1.8rem',
                    lineHeight: 1,
                    filter: isEarned ? 'none' : 'grayscale(100%) opacity(0.35)',
                  }}
                >
                  {g.badgeEmoji}
                </div>
                <span style={{ fontFamily: G3.px, fontSize: '0.33rem', color: isEarned ? g.color : G3.textMuted, lineHeight: 1.5 }}>
                  {g.badgeName.toUpperCase()}
                </span>
                <span style={{ fontFamily: G3.vt, fontSize: '0.88rem', color: G3.textMuted }}>
                  {isEarned
                    ? `Earned ${badgeRecord?.earnedAt ? new Date(badgeRecord.earnedAt).toLocaleDateString() : ''}`
                    : `${g.leaderName} (${g.element})`}
                </span>
              </motion.div>
            )
          })}
        </div>
      </G3Panel>
    </div>
  )
}
