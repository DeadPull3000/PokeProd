/* Social, Friends, Duels & Pokémon League Leaderboard Slice (Phase 3) */
import { supabase } from '../lib/supabase'
import { calcTrainerLevel, generateLocalId } from '../constants/gameData'

const DUELS_KEY = (userId) => `pokeprod_duels_v1_${userId || 'local'}`
const FRIENDS_KEY = (userId) => `pokeprod_friends_v1_${userId || 'local'}`

const NPC_LEAGUE_TRAINERS = [
  { id: 'npc-red',     name: 'CHAMPION RED',   xp: 1240, starterId: 6,   isNpc: true },
  { id: 'npc-lance',   name: 'ELITE LANCE',    xp: 920,  starterId: 149, isNpc: true },
  { id: 'npc-sabrina', name: 'ELITE SABRINA',  xp: 680,  starterId: 65,  isNpc: true },
  { id: 'npc-blue',    name: 'RIVAL BLUE',     xp: 440,  starterId: 9,   isNpc: true },
  { id: 'npc-misty',   name: 'LEADER MISTY',   xp: 220,  starterId: 121, isNpc: true },
]

export const RIVAL_CHALLENGERS = [
  { id: 'rival-blue', name: 'RIVAL BLUE', spriteId: 9, paceHours: 2 },
  { id: 'rival-silver', name: 'RIVAL SILVER', spriteId: 157, paceHours: 2 },
  { id: 'rival-green', name: 'RIVAL GREEN', spriteId: 3, paceHours: 3 },
]

export function deriveFriendCode(userId = 'local') {
  let hash = 0x811c9dc5
  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  const suffix = (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)
  return `PK${suffix}`
}

function isMissingTable(err) {
  if (!err) return false
  const msg = (err.message || '').toLowerCase()
  return err.code === '42P01' || err.code === 'PGRST205' || msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('column')
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore storage errors */
  }
}

export const createSocialSlice = (set, get) => ({
  friendCode: 'PKTRAINR',
  isPublicProfile: true,
  friends: [],
  leaderboard: [],
  duels: [],
  socialLoading: false,
  socialCloudSynced: true,

  fetchSocialData: async () => {
    const state = get()
    const userId = state.session?.user?.id
    const myCode = deriveFriendCode(userId || 'local')

    if (!userId) {
      const localDuels = loadJson(DUELS_KEY('local'), [])
      const localFriends = loadJson(FRIENDS_KEY('local'), [])
      const combinedBoard = buildLeaderboard([], {
        id: 'local',
        name: state.trainerName,
        xp: state.totalXP,
        starterId: state.starterPokemon?.id || 155,
      })
      set({
        friendCode: myCode,
        friends: localFriends,
        duels: localDuels,
        leaderboard: combinedBoard,
        socialLoading: false,
      })
      return
    }

    set({ socialLoading: true, friendCode: myCode })

    /* Ensure own friend_code exists on profile (fails gracefully if migration 003 pending) */
    await supabase
      .from('profiles')
      .update({ friend_code: myCode, is_public: state.isPublicProfile })
      .eq('id', userId)

    const [lbRes, frRes, duelRes] = await Promise.all([
      supabase.from('profiles').select('id, username, xp, starter_id, is_public').eq('is_public', true).order('xp', { ascending: false }).limit(20),
      supabase.from('friendships').select('*').or(`user_a.eq.${userId},user_b.eq.${userId}`),
      supabase.from('duels').select('*').or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`).order('created_at', { ascending: false }).limit(15),
    ])

    const missingSocial = isMissingTable(lbRes.error) || isMissingTable(frRes.error) || isMissingTable(duelRes.error)

    if (missingSocial) {
      const localDuels = loadJson(DUELS_KEY(userId), [])
      const localFriends = loadJson(FRIENDS_KEY(userId), [])
      const board = buildLeaderboard([], {
        id: userId,
        name: state.trainerName,
        xp: state.totalXP,
        starterId: state.starterPokemon?.id || 155,
      })
      set({
        friends: localFriends,
        duels: localDuels,
        leaderboard: board,
        socialLoading: false,
        socialCloudSynced: false,
      })
      return
    }

    const cloudProfiles = (lbRes.data || []).map((p) => ({
      id: p.id,
      name: (p.username || 'TRAINER').toUpperCase(),
      xp: p.xp || 0,
      starterId: p.starter_id || 155,
      isYou: p.id === userId,
    }))

    const board = buildLeaderboard(cloudProfiles, {
      id: userId,
      name: state.trainerName,
      xp: state.totalXP,
      starterId: state.starterPokemon?.id || 155,
    })

    /* Map friendships */
    const rawFriends = frRes.data || []
    const otherIds = rawFriends.map((f) => (f.user_a === userId ? f.user_b : f.user_a)).filter(Boolean)
    let friendProfilesMap = new Map()
    if (otherIds.length > 0) {
      const fpRes = await supabase.from('profiles').select('id, username, xp, starter_id').in('id', otherIds)
      if (!fpRes.error && fpRes.data) {
        friendProfilesMap = new Map(fpRes.data.map((p) => [p.id, p]))
      }
    }

    const mappedFriends = rawFriends.map((f) => {
      const otherId = f.user_a === userId ? f.user_b : f.user_a
      const prof = friendProfilesMap.get(otherId)
      return {
        id: f.id,
        friendUserId: otherId,
        name: (prof?.username || 'TRAINER').toUpperCase(),
        xp: prof?.xp || 0,
        level: calcTrainerLevel(prof?.xp || 0),
        starterId: prof?.starter_id || 25,
        status: f.status,
        isIncoming: f.user_b === userId && f.status === 'pending',
      }
    })

    const cloudDuels = (duelRes.data || []).map((d) => ({
      id: d.id,
      challengerId: d.challenger_id,
      opponentId: d.opponent_id,
      challengerName: d.challenger_name,
      opponentName: d.opponent_name,
      goalTasks: d.goal_tasks,
      challengerProgress: d.challenger_progress,
      opponentProgress: d.opponent_progress,
      status: d.status,
      winnerId: d.winner_id,
      expiresAt: d.expires_at,
      isRivalNpc: !d.opponent_id,
    }))

    const localOnlyDuels = loadJson(DUELS_KEY(userId), []).filter((d) => d.isRivalNpc)
    const mergedDuels = [...localOnlyDuels, ...cloudDuels]

    set({
      friends: mappedFriends,
      duels: mergedDuels,
      leaderboard: board,
      socialLoading: false,
      socialCloudSynced: true,
    })
  },

  togglePublicProfile: async (isPublic) => {
    const state = get()
    set({ isPublicProfile: isPublic })
    if (state.session && state.socialCloudSynced) {
      await supabase
        .from('profiles')
        .update({ is_public: isPublic })
        .eq('id', state.session.user.id)
      get().fetchSocialData()
    }
  },

  sendFriendRequest: async (codeInput) => {
    const code = (codeInput || '').trim().toUpperCase()
    const state = get()
    if (!code) return
    if (code === state.friendCode) {
      state.pushToast?.("You can't add your own Friend Code!", 'warning')
      return
    }

    const userId = state.session?.user?.id
    if (!userId || !state.socialCloudSynced) {
      state.pushToast?.('Apply SQL migration 003_v2_social_and_cards.sql to add real friends by code.', 'warning', 4500)
      return
    }

    const targetRes = await supabase
      .from('profiles')
      .select('id, username')
      .eq('friend_code', code)
      .maybeSingle()

    if (targetRes.error || !targetRes.data) {
      state.pushToast?.(`No trainer found with code ${code}.`, 'error')
      return
    }

    const { error } = await supabase.from('friendships').insert([
      { user_a: userId, user_b: targetRes.data.id, status: 'pending' },
    ])

    if (error) {
      state.pushToast?.(`Friend request failed: ${error.message}`, 'error')
      return
    }

    state.pushToast?.(`Friend request sent to ${(targetRes.data.username || code).toUpperCase()}!`, 'success')
    await get().fetchSocialData()
  },

  acceptFriendRequest: async (friendshipId) => {
    const state = get()
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)

    if (error) {
      state.pushToast?.(`Could not accept friend request: ${error.message}`, 'error')
      return
    }
    state.pushToast?.('Friend added to your Pal Pad!', 'success')
    await get().fetchSocialData()
  },

  startDuel: async ({ opponentId = null, opponentName = 'RIVAL BLUE', goalTasks = 5, durationHours = 2 }) => {
    const state = get()
    const userId = state.session?.user?.id || 'local'
    const expiresAt = new Date(Date.now() + durationHours * 3_600_000).toISOString()
    const isRivalNpc = !opponentId || String(opponentId).startsWith('rival-')

    const newDuel = {
      id: generateLocalId(),
      challengerId: userId,
      opponentId: isRivalNpc ? null : opponentId,
      challengerName: state.trainerName || 'TRAINER',
      opponentName,
      goalTasks,
      challengerProgress: 0,
      opponentProgress: 0,
      status: 'active',
      winnerId: null,
      expiresAt,
      isRivalNpc,
    }

    if (isRivalNpc || !state.session || !state.socialCloudSynced) {
      const next = [newDuel, ...state.duels]
      set({ duels: next })
      saveJson(DUELS_KEY(userId), next.filter((d) => d.isRivalNpc))
      state.pushToast?.(`Duel started vs ${opponentName}! Complete ${goalTasks} quests!`, 'info', 3500)
      return newDuel
    }

    const res = await supabase
      .from('duels')
      .insert([{
        challenger_id: userId,
        opponent_id: opponentId,
        challenger_name: newDuel.challengerName,
        opponent_name: opponentName,
        goal_tasks: goalTasks,
        status: 'active',
        expires_at: expiresAt,
      }])
      .select('*')
      .single()

    if (res.error) {
      state.pushToast?.(`Could not create duel: ${res.error.message}`, 'error')
      return null
    }
    state.pushToast?.(`Duel challenge sent to ${opponentName}!`, 'success')
    await get().fetchSocialData()
    return res.data
  },

  advanceActiveDuels: async (delta = 1) => {
    const state = get()
    const userId = state.session?.user?.id || 'local'
    const active = state.duels.filter((d) => d.status === 'active')
    if (active.length === 0) return

    let wonDuel = false
    const updated = state.duels.map((d) => {
      if (d.status !== 'active') return d
      const isChallenger = d.challengerId === userId || d.isRivalNpc
      const nextChallenger = isChallenger ? d.challengerProgress + delta : d.challengerProgress
      const nextOpponent = !isChallenger
        ? d.opponentProgress + delta
        : d.isRivalNpc && Math.random() < 0.45
        ? Math.min(d.goalTasks - 1, d.opponentProgress + 1)
        : d.opponentProgress

      const myProg = isChallenger ? nextChallenger : nextOpponent
      const completed = myProg >= d.goalTasks
      if (completed) wonDuel = true

      return {
        ...d,
        challengerProgress: Math.min(d.goalTasks, nextChallenger),
        opponentProgress: Math.min(d.goalTasks, nextOpponent),
        status: completed ? 'completed' : 'active',
        winnerId: completed ? userId : d.winnerId,
      }
    })

    set({ duels: updated })
    saveJson(DUELS_KEY(userId), updated.filter((d) => d.isRivalNpc))

    if (wonDuel) {
      state.pushToast?.('⚔️ DUEL VICTORY! +150 XP & +1 Booster Pack!', 'success', 4500)
      state.addXp(150)
      state.grantCardPack?.(1)
    }

    if (state.session && state.socialCloudSynced) {
      const cloudUpdates = updated.filter((d) => !d.isRivalNpc)
      await Promise.all(
        cloudUpdates.map((d) =>
          supabase
            .from('duels')
            .update({
              challenger_progress: d.challengerProgress,
              opponent_progress: d.opponentProgress,
              status: d.status,
              winner_id: d.winnerId,
            })
            .eq('id', d.id)
        )
      )
    }
  },
})

function buildLeaderboard(cloudEntries, selfEntry) {
  const byId = new Map()
  for (const npc of NPC_LEAGUE_TRAINERS) {
    byId.set(npc.id, { ...npc, level: calcTrainerLevel(npc.xp), isYou: false })
  }
  for (const row of cloudEntries) {
    byId.set(row.id, { ...row, level: calcTrainerLevel(row.xp) })
  }
  byId.set(selfEntry.id, {
    ...selfEntry,
    level: calcTrainerLevel(selfEntry.xp),
    isYou: true,
  })

  return Array.from(byId.values())
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      tier: idx === 0 ? 'CHAMPION' : idx <= 4 ? 'ELITE FOUR' : 'TRAINER',
    }))
}
