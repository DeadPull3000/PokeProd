import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocial, useCards, useUI } from '../store'
import { RIVAL_CHALLENGERS } from '../store/socialStore'
import { G3, G3Header, G3Panel, HPBar, SpriteImage } from './ui'

const RARITY_STYLES = {
  holo:   { border: '#eab308', badgeBg: '#fef08a', badgeText: '#854d0e', label: '★ HOLO RARE' },
  rare:   { border: '#68A0B0', badgeBg: '#e0f2fe', badgeText: '#075985', label: '◆ RARE' },
  common: { border: '#C0B8A8', badgeBg: '#F0EDD8', badgeText: '#706858', label: '● COMMON' },
}

function TcgCard({ card }) {
  const st = RARITY_STYLES[card.rarity] || RARITY_STYLES.common
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      className={card.rarity === 'holo' ? 'tcg-holo-card' : ''}
      style={{
        background: card.rarity === 'holo' ? '#FFFBEB' : 'white',
        border: `3px solid ${st.border}`,
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        boxShadow: card.rarity === 'holo' ? '0 0 14px rgba(234,179,8,0.45)' : '2px 2px 0 rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: G3.px, fontSize: '0.26rem', background: st.badgeBg, color: st.badgeText, padding: '1px 4px', borderRadius: 2 }}>
          {st.label}
        </span>
        <span style={{ fontFamily: G3.px, fontSize: '0.28rem', color: '#dc2626' }}>
          ATK {card.atk}
        </span>
      </div>
      <div style={{ padding: '6px 0' }}>
        <SpriteImage pokemonId={card.pokemonId} alt={card.cardTitle} size={56} enableCry />
      </div>
      <div style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.text, textAlign: 'center', lineHeight: 1.4 }}>
        {card.cardTitle}
      </div>
    </motion.div>
  )
}

function PackPullModal({ cards, onClose }) {
  if (!cards || cards.length === 0) return null
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
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <G3Panel variant="orange">
          <G3Header icon="🎴">BOOSTER PACK OPENED!</G3Header>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid grid-cols-3 gap-2.5">
              {cards.map((c) => (
                <TcgCard key={c.id} card={c} />
              ))}
            </div>
            <button onClick={onClose} className="g3-btn g3-btn-sm self-end">
              ADD TO BINDER ▶
            </button>
          </div>
        </G3Panel>
      </motion.div>
    </motion.div>
  )
}

function LeaderboardView() {
  const { leaderboard, friendCode, isPublicProfile, togglePublicProfile, socialCloudSynced } = useSocial()
  const { pushToast } = useUI()

  function copyCode() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(friendCode).catch(() => {})
    }
    pushToast(`Copied Friend Code: ${friendCode}`, 'info', 2200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <G3Panel variant="teal">
        <G3Header
          icon="🆔"
          rightSlot={
            !socialCloudSynced ? (
              <span className="pk-label" style={{ fontSize: '0.28rem', color: '#604010', background: '#F8E040', padding: '1px 4px', borderRadius: 3 }}>
                LOCAL
              </span>
            ) : null
          }
        >
          YOUR TRAINER CARD & CODE
        </G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.textMuted, marginBottom: 3 }}>FRIEND CODE:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: G3.px, fontSize: '0.58rem', color: G3.headerDark, letterSpacing: 1 }}>{friendCode}</span>
              <button onClick={copyCode} className="g3-btn g3-btn-sm g3-btn-cream" style={{ fontSize: '0.32rem' }}>
                COPY
              </button>
            </div>
          </div>

          <button
            onClick={() => togglePublicProfile(!isPublicProfile)}
            className={`g3-btn g3-btn-sm ${isPublicProfile ? '' : 'g3-btn-orange'}`}
            style={{ fontSize: '0.34rem' }}
          >
            {isPublicProfile ? '🌐 PUBLIC RANK: ON' : '🔒 PRIVATE MODE'}
          </button>
        </div>
      </G3Panel>

      <G3Panel variant="orange">
        <G3Header icon="🏆">POKéMON LEAGUE STANDINGS</G3Header>
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: entry.isYou ? 'rgba(104,176,176,0.16)' : 'white',
                border: `2px solid ${entry.isYou ? G3.borderTeal : '#D8D0B8'}`,
                borderRadius: 5,
                padding: '6px 10px',
              }}
            >
              <span
                style={{
                  fontFamily: G3.px,
                  fontSize: '0.45rem',
                  width: 26,
                  color: entry.rank === 1 ? '#ca8a04' : entry.rank <= 4 ? '#9333ea' : G3.textMuted,
                }}
              >
                #{entry.rank}
              </span>
              <SpriteImage pokemonId={entry.starterId || 25} alt={entry.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: G3.vt, fontSize: '1.15rem', fontWeight: 'bold', color: G3.text }}>
                    {entry.name}
                  </span>
                  <span
                    style={{
                      fontFamily: G3.px,
                      fontSize: '0.26rem',
                      padding: '1px 4px',
                      borderRadius: 3,
                      background: entry.rank === 1 ? '#fef08a' : '#F0EDD8',
                      color: entry.rank === 1 ? '#854d0e' : G3.textMuted,
                    }}
                  >
                    {entry.tier}
                  </span>
                </div>
                <span style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.textMuted }}>
                  Lv.{entry.level} {entry.isNpc ? '· League NPC' : entry.isYou ? '· YOU' : '· Online Trainer'}
                </span>
              </div>
              <span style={{ fontFamily: G3.px, fontSize: '0.38rem', color: G3.accentBlue }}>
                {(entry.xp || 0).toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      </G3Panel>
    </div>
  )
}

function FriendsView({ onChallenge }) {
  const { friends, sendFriendRequest, acceptFriendRequest } = useSocial()
  const [codeInput, setCodeInput] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!codeInput.trim()) return
    sendFriendRequest(codeInput.trim())
    setCodeInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <G3Panel variant="teal">
        <G3Header icon="🤝">ADD FRIEND BY CODE</G3Header>
        <form onSubmit={handleAdd} style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter 8-char code (e.g. PK8A12F0)"
            className="g3-input"
            style={{ fontSize: '1.05rem', padding: '4px 8px' }}
          />
          <button type="submit" disabled={!codeInput.trim()} className="g3-btn g3-btn-sm flex-shrink-0">
            ADD ▶
          </button>
        </form>
      </G3Panel>

      <G3Panel variant="orange">
        <G3Header icon="📟">PAL PAD ({friends.length})</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '18px 0', border: '1px dashed #D8D0B8', borderRadius: 6 }}>
              <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.textMuted }}>
                No friends connected yet! Share your Friend Code or launch a Rival Duel in the Duels tab.
              </p>
            </div>
          ) : (
            friends.map((fr) => (
              <div
                key={fr.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'white',
                  border: '1px solid #D8D0B8',
                  borderRadius: 5,
                  padding: '6px 10px',
                }}
              >
                <SpriteImage pokemonId={fr.starterId} alt={fr.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: G3.vt, fontSize: '1.15rem', color: G3.text }}>{fr.name}</div>
                  <div style={{ fontFamily: G3.px, fontSize: '0.3rem', color: G3.textMuted }}>
                    Lv.{fr.level} · {fr.xp} XP · {fr.status.toUpperCase()}
                  </div>
                </div>
                {fr.isIncoming ? (
                  <button onClick={() => acceptFriendRequest(fr.id)} className="g3-btn g3-btn-sm">
                    ACCEPT
                  </button>
                ) : fr.status === 'accepted' ? (
                  <button
                    onClick={() => onChallenge({ id: fr.friendUserId, name: fr.name })}
                    className="g3-btn g3-btn-sm g3-btn-orange"
                  >
                    DUEL ⚔️
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </G3Panel>
    </div>
  )
}

function DuelsView({ preselectedFriend }) {
  const { duels, startDuel } = useSocial()
  const { setActiveTab } = useUI()
  const [goalTasks, setGoalTasks] = useState(5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <G3Panel variant="teal">
        <G3Header icon="⚡">START A QUEST RACE DUEL</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: G3.px, fontSize: '0.34rem', color: G3.textMuted }}>GOAL:</span>
            {[3, 5, 8].map((n) => (
              <button
                key={n}
                onClick={() => setGoalTasks(n)}
                className={`g3-btn g3-btn-sm ${goalTasks === n ? '' : 'g3-btn-cream'}`}
                style={{ fontSize: '0.34rem' }}
              >
                {n} QUESTS
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {preselectedFriend && (
              <button
                onClick={() => startDuel({ opponentId: preselectedFriend.id, opponentName: preselectedFriend.name, goalTasks })}
                className="g3-btn g3-btn-sm g3-btn-orange"
              >
                VS {preselectedFriend.name}
              </button>
            )}
            {RIVAL_CHALLENGERS.map((r) => (
              <button
                key={r.id}
                onClick={() => startDuel({ opponentId: r.id, opponentName: r.name, goalTasks, durationHours: r.paceHours })}
                className="g3-btn g3-btn-sm"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <SpriteImage pokemonId={r.spriteId} alt={r.name} size={22} />
                <span>{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      </G3Panel>

      <G3Panel variant="orange">
        <G3Header icon="📜">ACTIVE & RECENT DUELS ({duels.length})</G3Header>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {duels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', border: '1px dashed #D8D0B8', borderRadius: 6 }}>
              <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.textMuted }}>
                No active duels! Challenge a Rival above, then complete quests on Journey to race!
              </p>
            </div>
          ) : (
            duels.map((d) => (
              <div key={d.id} style={{ background: 'white', border: '2px solid #D8D0B8', borderRadius: 6, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: G3.px, fontSize: '0.38rem', color: G3.text }}>
                    {d.challengerName} VS {d.opponentName}
                  </span>
                  <span
                    style={{
                      fontFamily: G3.px,
                      fontSize: '0.32rem',
                      color: d.status === 'completed' ? '#16a34a' : '#eab308',
                    }}
                  >
                    {d.status === 'completed' ? '🏆 VICTORY!' : '⚡ RACING'}
                  </span>
                </div>

                <HPBar
                  pct={d.challengerProgress / d.goalTasks}
                  color="#22c55e"
                  height={8}
                  showHeader
                  label={d.challengerName}
                  rightLabel={`${d.challengerProgress}/${d.goalTasks}`}
                  pulseOnLow={false}
                />
                <HPBar
                  pct={d.opponentProgress / d.goalTasks}
                  color="#f97316"
                  height={8}
                  showHeader
                  label={d.opponentName}
                  rightLabel={`${d.opponentProgress}/${d.goalTasks}`}
                  pulseOnLow={false}
                />

                {d.status === 'active' && (
                  <button onClick={() => setActiveTab('journey')} className="g3-btn g3-btn-sm self-end" style={{ fontSize: '0.32rem' }}>
                    COMPLETE QUESTS ▶
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </G3Panel>
    </div>
  )
}

function CardBinderView() {
  const { collectedCards, cardPacks, openCardPack, cardsCloudSynced } = useCards()
  const [pulledCards, setPulledCards] = useState(null)

  async function handleOpenPack() {
    const cards = await openCardPack()
    if (cards.length > 0) setPulledCards(cards)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <G3Panel variant="teal">
        <G3Header
          icon="🎴"
          rightSlot={
            !cardsCloudSynced ? (
              <span className="pk-label" style={{ fontSize: '0.28rem', color: '#604010', background: '#F8E040', padding: '1px 4px', borderRadius: 3 }}>
                LOCAL
              </span>
            ) : null
          }
        >
          BOOSTER PACKS ({cardPacks} AVAILABLE)
        </G3Header>
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontFamily: G3.vt, fontSize: '1.05rem', color: G3.textMuted, flex: 1, minWidth: 180 }}>
            Earn Booster Packs by leveling up, defeating Daily Gym Leaders, and winning Trainer Duels! Each pack yields 3 cards scaled to your Trainer Level.
          </p>
          <motion.button
            onClick={handleOpenPack}
            disabled={cardPacks <= 0}
            whileHover={cardPacks > 0 ? { scale: 1.04 } : {}}
            whileTap={cardPacks > 0 ? { scale: 0.96 } : {}}
            className="g3-btn g3-btn-orange"
          >
            OPEN BOOSTER PACK ({cardPacks}) ▶
          </motion.button>
        </div>
      </G3Panel>

      <G3Panel variant="orange">
        <G3Header icon="📚">CARD BINDER ({collectedCards.length})</G3Header>
        <div style={{ padding: 12 }}>
          {collectedCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', border: '1px dashed #D8D0B8', borderRadius: 6 }}>
              <p style={{ fontFamily: G3.vt, fontSize: '1.1rem', color: G3.textMuted }}>
                No cards in your binder yet! Open your Welcome Booster Pack above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {collectedCards.map((c) => (
                <TcgCard key={c.id} card={c} />
              ))}
            </div>
          )}
        </div>
      </G3Panel>

      <AnimatePresence>
        {pulledCards && <PackPullModal cards={pulledCards} onClose={() => setPulledCards(null)} />}
      </AnimatePresence>
    </div>
  )
}

export default function LeagueTab() {
  const { fetchSocialData } = useSocial()
  const { fetchCards, cardPacks } = useCards()
  const [subTab, setSubTab] = useState('leaderboard')
  const [duelTarget, setDuelTarget] = useState(null)

  useEffect(() => {
    fetchSocialData()
    fetchCards()
  }, [fetchSocialData, fetchCards])

  function handleChallengeFriend(fr) {
    setDuelTarget(fr)
    setSubTab('duels')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        {[
          { id: 'leaderboard', label: '🏆 LEAGUE' },
          { id: 'friends', label: '🤝 FRIENDS' },
          { id: 'duels', label: '⚡ DUELS' },
          { id: 'cards', label: `🎴 CARDS${cardPacks > 0 ? ` (${cardPacks})` : ''}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`g3-btn g3-btn-sm ${subTab === t.id ? '' : 'g3-btn-cream'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
        {subTab === 'leaderboard' && <LeaderboardView />}
        {subTab === 'friends' && <FriendsView onChallenge={handleChallengeFriend} />}
        {subTab === 'duels' && <DuelsView preselectedFriend={duelTarget} />}
        {subTab === 'cards' && <CardBinderView />}
      </div>
    </div>
  )
}
