/* Daily Gym Boss & Badge Case Slice (Phase 2.2) */
import { supabase } from '../lib/supabase'
import { getDailyGymLeader, GYM_LEADERS } from '../constants/pokedex151'

const BOSS_STORAGE = (userId) => `pokeprod_daily_boss_v1_${userId || 'local'}`
const BADGE_STORAGE = (userId) => `pokeprod_badges_v1_${userId || 'local'}`

const todayStr = () => new Date().toISOString().slice(0, 10)

function isMissingTable(err) {
  if (!err) return false
  const msg = (err.message || '').toLowerCase()
  return err.code === '42P01' || err.code === 'PGRST205' || msg.includes('does not exist') || msg.includes('schema cache')
}

function makeFreshBoss(date = todayStr()) {
  const leader = getDailyGymLeader(date)
  return {
    date,
    bossType: leader.element,
    leaderId: leader.id,
    bossHp: 4,
    currentHp: 4,
    isDefeated: false,
  }
}

function loadLocalBoss(userId) {
  try {
    const raw = localStorage.getItem(BOSS_STORAGE(userId))
    if (!raw) return makeFreshBoss()
    const parsed = JSON.parse(raw)
    if (parsed.date !== todayStr()) return makeFreshBoss()
    return parsed
  } catch {
    return makeFreshBoss()
  }
}

function saveLocalBoss(userId, boss) {
  try {
    localStorage.setItem(BOSS_STORAGE(userId), JSON.stringify(boss))
  } catch {
    /* ignore storage errors */
  }
}

function loadLocalBadges(userId) {
  try {
    const raw = localStorage.getItem(BADGE_STORAGE(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalBadges(userId, badges) {
  try {
    localStorage.setItem(BADGE_STORAGE(userId), JSON.stringify(badges))
  } catch {
    /* ignore storage errors */
  }
}

export const createBattleSlice = (set, get) => ({
  dailyBoss: makeFreshBoss(),
  gymBadges: [],
  battleLoading: false,
  battleCloudSynced: true,

  fetchBattleState: async () => {
    const state = get()
    const userId = state.session?.user?.id
    const today = todayStr()

    if (!userId) {
      set({
        dailyBoss: loadLocalBoss('local'),
        gymBadges: loadLocalBadges('local'),
        battleLoading: false,
      })
      return
    }

    set({ battleLoading: true })

    const [bossRes, badgeRes] = await Promise.all([
      supabase.from('daily_boss').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
      supabase.from('gym_badges').select('*').eq('user_id', userId).order('earned_at', { ascending: true }),
    ])

    if (bossRes.error && isMissingTable(bossRes.error)) {
      set({
        dailyBoss: loadLocalBoss(userId),
        gymBadges: loadLocalBadges(userId),
        battleLoading: false,
        battleCloudSynced: false,
      })
      return
    }

    let bossObj
    if (bossRes.data) {
      bossObj = {
        date: bossRes.data.date,
        bossType: bossRes.data.boss_type,
        leaderId: bossRes.data.leader_id,
        bossHp: Number(bossRes.data.boss_hp),
        currentHp: Number(bossRes.data.current_hp),
        isDefeated: Boolean(bossRes.data.is_defeated),
      }
    } else {
      bossObj = makeFreshBoss(today)
      await supabase.from('daily_boss').upsert(
        {
          user_id: userId,
          date: today,
          boss_type: bossObj.bossType,
          leader_id: bossObj.leaderId,
          boss_hp: bossObj.bossHp,
          current_hp: bossObj.currentHp,
          is_defeated: false,
        },
        { onConflict: 'user_id,date' }
      )
    }

    const badges = (badgeRes.data || []).map((b) => ({
      badgeType: b.badge_type,
      earnedAt: b.earned_at,
    }))

    saveLocalBoss(userId, bossObj)
    saveLocalBadges(userId, badges)
    set({
      dailyBoss: bossObj,
      gymBadges: badges,
      battleLoading: false,
      battleCloudSynced: true,
    })
  },

  strikeDailyBoss: async (elementType, damageOverride = null) => {
    const state = get()
    const current = state.dailyBoss?.date === todayStr() ? state.dailyBoss : makeFreshBoss()
    if (current.isDefeated) return { damage: 0, defeatedNow: false }

    const leader = GYM_LEADERS.find((l) => l.id === current.leaderId) || getDailyGymLeader()
    const isSuperEffective = elementType === leader.element
    const dmg = damageOverride !== null ? damageOverride : isSuperEffective ? 1 : 0.5
    const nextHp = Math.max(0, Number((current.currentHp - dmg).toFixed(1)))
    const defeatedNow = nextHp <= 0

    const nextBoss = {
      ...current,
      currentHp: nextHp,
      isDefeated: defeatedNow,
    }

    const userId = state.session?.user?.id
    let nextBadges = state.gymBadges
    if (defeatedNow) {
      const alreadyHas = nextBadges.some((b) => b.badgeType === leader.badgeType)
      if (!alreadyHas) {
        nextBadges = [
          ...nextBadges,
          { badgeType: leader.badgeType, earnedAt: new Date().toISOString() },
        ]
      }
    }

    set({ dailyBoss: nextBoss, gymBadges: nextBadges })
    saveLocalBoss(userId, nextBoss)
    saveLocalBadges(userId, nextBadges)

    if (defeatedNow) {
      state.pushToast?.(`🏅 GYM CLEARED! Earned the ${leader.badgeName}! (+100 XP & Pack)`, 'success', 4500)
      state.addXp(100)
      state.grantCardPack?.(1)
      state.registerPokemon?.(leader.aceId, false, 'battle')
    } else if (isSuperEffective) {
      state.pushToast?.(`⚡ Super effective! Dealt ${dmg} DMG to ${leader.leaderName}!`, 'info', 2500)
    }

    if (userId && state.battleCloudSynced) {
      await supabase
        .from('daily_boss')
        .upsert(
          {
            user_id: userId,
            date: nextBoss.date,
            boss_type: nextBoss.bossType,
            leader_id: nextBoss.leaderId,
            boss_hp: nextBoss.bossHp,
            current_hp: nextBoss.currentHp,
            is_defeated: nextBoss.isDefeated,
          },
          { onConflict: 'user_id,date' }
        )

      if (defeatedNow) {
        await supabase
          .from('gym_badges')
          .upsert(
            {
              user_id: userId,
              badge_type: leader.badgeType,
            },
            { onConflict: 'user_id,badge_type' }
          )
      }
    }

    return { damage: dmg, defeatedNow, isSuperEffective }
  },
})
