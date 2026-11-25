/* Professor Oak's Context-Aware Productivity Advisor (Phase 5.5) */
import { ELEMENTS } from '../constants/gameData'
import { getDailyGymLeader } from '../constants/pokedex151'

export function getOakAdvice({ tasks = [], xp = {}, party = [], cardPacks = 0, dailyBoss = null }) {
  const urgentParty = party.find((p) => {
    if (p.status !== 'active' || !p.deadline) return false
    const left = new Date(p.deadline).getTime() - Date.now()
    return left > 0 && left < 12 * 3_600_000
  })

  if (urgentParty) {
    return {
      badge: 'URGENT NUZLOCKE',
      element: 'fire',
      message: `Careful! "${urgentParty.taskName}" is critically low on HP (<12h left). Prioritize finishing it before your companion faints!`,
      actionTab: 'nuzlocke',
      actionLabel: 'OPEN PARTY ▶',
    }
  }

  const leader = getDailyGymLeader()
  const activeMatchingQuest = tasks.find(
    (t) => !(t.is_completed || t.completed) && (t.element_type || t.element) === leader.element
  )

  if (dailyBoss && !dailyBoss.isDefeated) {
    const el = ELEMENTS[leader.element] || ELEMENTS.fire
    if (activeMatchingQuest) {
      return {
        badge: 'GYM STRATEGY',
        element: leader.element,
        message: `${leader.leaderName} is weak to ${el.emoji} ${el.label}! Complete "${activeMatchingQuest.task_name || activeMatchingQuest.text}" for 1.0 Super-Effective DMG.`,
        actionTab: 'battle',
        actionLabel: 'VIEW GYM ▶',
      }
    }
  }

  if (cardPacks > 0) {
    return {
      badge: 'BOOSTER READY',
      element: 'electric',
      message: `You have ${cardPacks} unopened Booster Pack${cardPacks > 1 ? 's' : ''}! Visit League Hub → Card Binder to pull new Trainer Cards.`,
      actionTab: 'league',
      actionLabel: 'OPEN PACKS ▶',
    }
  }

  /* Find lowest-trained Type Balance element */
  const entries = Object.entries(ELEMENTS)
  let lowest = entries[0]
  for (const pair of entries) {
    if ((xp[pair[0]] || 0) < (xp[lowest[0]] || 0)) lowest = pair
  }
  const [lowKey, lowEl] = lowest

  return {
    badge: 'TRAINING TIP',
    element: lowKey,
    message: `Your ${lowEl.emoji} ${lowEl.label} (${lowEl.description}) stats are trailing behind. Try logging a quick ${lowEl.label} quest today to balance your radar!`,
    actionTab: null,
    actionLabel: null,
  }
}
