import { create } from 'zustand'
import { supabase } from './lib/supabase'

const generateId = () => Math.random().toString(36).substring(2, 10)

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'
const ITEM = (name) => `${SPRITE_BASE}/items/${name}.png`

/* Daily persistence for route map progress */
const TODAY_KEY = 'completedToday_' + new Date().toISOString().slice(0, 10)
const loadCompletedToday = () => parseInt(localStorage.getItem(TODAY_KEY) || '0', 10)
const saveCompletedToday = (n) => localStorage.setItem(TODAY_KEY, String(n))

/* Clean up old date keys */
;(function cleanOldKeys() {
  const today = new Date().toISOString().slice(0, 10)
  Object.keys(localStorage)
    .filter(function(k) { return k.startsWith('completedToday_') && !k.endsWith(today) })
    .forEach(function(k) { localStorage.removeItem(k) })
})()

/* Element definitions */
export const ELEMENTS = {
  fire: {
    id: 'fire', label: 'Fire', emoji: '🔥', description: 'Health & Fitness',
    color: '#f97316', borderColor: '#ea580c', bgHex: '#fff7ed',
    glowColor: 'rgba(249,115,22,0.7)',
    itemSprite: ITEM('potion'), itemName: 'Potion', xpKey: 'fire',
  },
  water: {
    id: 'water', label: 'Water', emoji: '💧', description: 'Chores & Self-Care',
    color: '#0ea5e9', borderColor: '#0284c7', bgHex: '#f0f9ff',
    glowColor: 'rgba(14,165,233,0.7)',
    itemSprite: ITEM('fresh-water'), itemName: 'Fresh Water', xpKey: 'water',
  },
  grass: {
    id: 'grass', label: 'Grass', emoji: '🌿', description: 'Growth & Learning',
    color: '#22c55e', borderColor: '#16a34a', bgHex: '#f0fdf4',
    glowColor: 'rgba(34,197,94,0.7)',
    itemSprite: ITEM('oran-berry'), itemName: 'Oran Berry', xpKey: 'grass',
  },
  psychic: {
    id: 'psychic', label: 'Psychic', emoji: '🔮', description: 'Deep Work & Focus',
    color: '#a855f7', borderColor: '#9333ea', bgHex: '#faf5ff',
    glowColor: 'rgba(168,85,247,0.7)',
    itemSprite: ITEM('kings-rock'), itemName: "King's Rock", xpKey: 'psychic',
  },
  electric: {
    id: 'electric', label: 'Electric', emoji: '⚡', description: 'Quick Tasks (<5 min)',
    color: '#eab308', borderColor: '#ca8a04', bgHex: '#fefce8',
    glowColor: 'rgba(234,179,8,0.7)',
    itemSprite: ITEM('thunder-stone'), itemName: 'Thunder Stone', xpKey: 'electric',
  },
  fairy: {
    id: 'fairy', label: 'Fairy', emoji: '🧚', description: 'Social & Family',
    color: '#ec4899', borderColor: '#db2777', bgHex: '#fdf2f8',
    glowColor: 'rgba(236,72,153,0.7)',
    itemSprite: ITEM('moon-stone'), itemName: 'Moon Stone', xpKey: 'fairy',
  },
}

/* Evolution lines (Gen 3 starters + Pikachu) */
export const EVOLUTION_LINES = [
  {
    id: 0, name: 'Bulbasaur Line', color: '#40A840',
    stages: [
      { id: 1,   name: 'BULBASAUR', label: 'Seedling' },
      { id: 2,   name: 'IVYSAUR',   label: 'Growing'  },
      { id: 3,   name: 'VENUSAUR',  label: 'Blooming' },
    ],
  },
  {
    id: 1, name: 'Charmander Line', color: '#F87038',
    stages: [
      { id: 4,  name: 'CHARMANDER', label: 'Ember'   },
      { id: 5,  name: 'CHARMELEON', label: 'Flame'   },
      { id: 6,  name: 'CHARIZARD',  label: 'Blazing' },
    ],
  },
  {
    id: 2, name: 'Squirtle Line', color: '#6890F0',
    stages: [
      { id: 7,  name: 'SQUIRTLE',  label: 'Droplet' },
      { id: 8,  name: 'WARTORTLE', label: 'Tide'    },
      { id: 9,  name: 'BLASTOISE', label: 'Torrent' },
    ],
  },
  {
    id: 3, name: 'Pikachu Line', color: '#F8D030',
    stages: [
      { id: 172, name: 'PICHU',   label: 'Spark'   },
      { id: 25,  name: 'PIKACHU', label: 'Charged' },
      { id: 26,  name: 'RAICHU',  label: 'Thunder' },
    ],
  },
]

/* Zustand store */
export const useStore = create(function(set, get) {
  return {
    /* ----------------------------------------------------------------
       AUTH STATE
    ---------------------------------------------------------------- */
    session: null,
    user: null,
    authLoading: true,

    /* Check existing Supabase session on app mount */
    checkSession: async function() {
      var result = await supabase.auth.getSession()
      var session = result.data && result.data.session ? result.data.session : null
      set({
        session: session,
        user: session ? session.user : null,
        authLoading: false,
      })
      if (session) {
        get().fetchProfile()
        get().fetchTasks()
        get().fetchNuzlocke()
        get().fetchSecretBase()
        get().fetchHabits()
      }
    },

    /* Called by onAuthStateChange listener in App.jsx */
    setSession: function(session) {
      set({
        session: session,
        user: session ? session.user : null,
        authLoading: false,
      })
      if (session) {
        get().fetchProfile()
        get().fetchTasks()
        get().fetchNuzlocke()
        get().fetchSecretBase()
        get().fetchHabits()
      }
    },

    /* Sign out and clear local auth state */
    signOut: async function() {
      await supabase.auth.signOut()
      set({ session: null, user: null, tasks: [], party: [], daycare: [], completedTasks: [], inventory: [], placedItems: [], habits: [] })
    },

    /* Quick tasks */
    tasks: [
      { id: generateId(), text: 'Morning walk in tall grass', element: 'fire',    completed: false, createdAt: Date.now() - 5000 },
      { id: generateId(), text: 'Read 20 pages of a new book', element: 'grass',  completed: false, createdAt: Date.now() - 4000 },
      { id: generateId(), text: 'Hydrate - drink 8 glasses',   element: 'water',  completed: false, createdAt: Date.now() - 3000 },
      { id: generateId(), text: 'Deep focus work session',      element: 'psychic',completed: false, createdAt: Date.now() - 2000 },
      { id: generateId(), text: 'Reply to message from Mom',    element: 'fairy',  completed: false, createdAt: Date.now() - 1000 },
    ],

    /* Projects with evolution mechanic */
    projects: [
      {
        id: generateId(),
        name: 'Learn React',
        evoLineId: 0,
        currentStage: 0,
        completed: false,
        createdAt: Date.now(),
        subTasks: [
          { id: generateId(), text: 'Complete hooks tutorial', completed: false },
          { id: generateId(), text: 'Build first component',   completed: false },
          { id: generateId(), text: 'Deploy to production',    completed: false },
        ],
      },
    ],

    /* XP per element */
    xp: { fire: 240, water: 180, grass: 310, psychic: 150, electric: 420, fairy: 95 },

    /* Route map — persists to localStorage, resets each day */
    completedToday: loadCompletedToday(),

    /* App state */
    activeTab: 'journey',
    trainerName: 'TRAINER RED',
    /* trainerLevel is derived dynamically from totalXP — never hardcoded */
    trainerLevel: 1,
    totalXP: 0,

    /* Settings */
    starterPokemon: { id: 155, name: 'CYNDAQUIL' },
    soundEffects: true,
    music: false,
    backgroundCycle: 'Auto',

    /* Nuzlocke Party - max 6 high-stakes weekly tasks */
    party: [
      {
        id: generateId(),
        taskName: 'Finish project proposal',
        pokemonId: 39,
        deadline: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
      {
        id: generateId(),
        taskName: 'Weekly gym sessions (3x)',
        pokemonId: 66,
        deadline: new Date(Date.now() + 1.2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
      {
        id: generateId(),
        taskName: 'Read design system docs',
        pokemonId: 54,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      },
    ],

    /* Daycare - unlimited backlog without deadlines */
    daycare: [
      { id: generateId(), taskName: 'Learn Blender basics' },
      { id: generateId(), taskName: 'Reorganise bookshelf' },
      { id: generateId(), taskName: 'Plan summer trip itinerary' },
    ],

    /* Secret Base - gamified completed tasks & room decorations */
    /* rewardItemSprite must be one of the valid PokeAPI item slugs */
    completedTasks: [
      { id: generateId(), taskName: 'Beat the Elite Four', rewardItemSprite: 'master-ball', isClaimed: false },
      { id: generateId(), taskName: 'Finish 30-day journal streak', rewardItemSprite: 'nugget', isClaimed: false },
      { id: generateId(), taskName: 'Complete first workout week', rewardItemSprite: 'poke-doll', isClaimed: true },
      { id: generateId(), taskName: 'Read 12 books this year', rewardItemSprite: 'rare-bone', isClaimed: false },
      { id: generateId(), taskName: 'Learn a new recipe', rewardItemSprite: 'big-mushroom', isClaimed: false },
    ],

    /* Items claimed but not yet placed on the room grid */
    inventory: [
      { id: generateId(), spriteName: 'poke-doll' },
      { id: generateId(), spriteName: 'light-ball' },
    ],

    /* Items the user has dragged onto the 8x8 room grid */
    placedItems: [
      { id: generateId(), spriteName: 'leaf-stone',  gridX: 1, gridY: 1 },
      { id: generateId(), spriteName: 'water-stone', gridX: 5, gridY: 3 },
      { id: generateId(), spriteName: 'fire-stone',  gridX: 3, gridY: 6 },
    ],

    /* ID of the inventory item currently selected for placement (null = none) */
    selectedInventoryItem: null,

    /* Daily Habits - recurring tasks with streak tracking */
    habits: [
      { id: generateId(), name: 'Morning meditation', streak: 16, lastCompleted: null },
      { id: generateId(), name: 'Drink 8 glasses of water', streak: 7, lastCompleted: null },
      { id: generateId(), name: 'Read for 20 minutes', streak: 4, lastCompleted: null },
      { id: generateId(), name: 'Evening walk', streak: 2, lastCompleted: null },
      { id: generateId(), name: '10 minutes of stretching', streak: 0, lastCompleted: null },
    ],

    /* Weather state - updated via Open-Meteo API fetch */
    weather: { condition: 'Clear', typeBoost: 'Fire', icon: '☀️', color: '#ef4444' },

    /* Shiny Pokemon caught via habit streak luck rolls */
    caughtShinies: [],

    /* Co-op Raid Hub */
    raidBoss: {
      id: 'boss-1',
      name: 'Giant Slaking of Sloth',
      maxHp: 10000,
      currentHp: 10000,
      spriteId: 289,
    },
    raidEnergy: 500,
    raidLog: ['The raid has begun!', 'Co-op trainers are joining...'],

    /* ----------------------------------------------------------------
       PROFILE / LEVEL / XP (Supabase backed)
    ---------------------------------------------------------------- */

    /* Load XP from the profiles table and derive level */
    fetchProfile: async function() {
      var state = get()
      if (!state.session) return
      var result = await supabase
        .from('profiles')
        .select('xp, username')
        .eq('id', state.session.user.id)
        .single()
      if (!result.error && result.data) {
        var xpVal = result.data.xp || 0
        var levelVal = Math.floor(xpVal / 100) + 1
        set({
          totalXP: xpVal,
          trainerLevel: levelVal,
          trainerName: result.data.username
            ? result.data.username.toUpperCase()
            : state.trainerName,
        })
      }
    },

    /* Add XP: update local state immediately, then persist */
    addXp: async function(amount) {
      var state = get()
      var newXp = state.totalXP + amount
      var newLevel = Math.floor(newXp / 100) + 1
      set({ totalXP: newXp, trainerLevel: newLevel })
      if (state.session) {
        await supabase
          .from('profiles')
          .update({ xp: newXp })
          .eq('id', state.session.user.id)
      }
    },

    /* ----------------------------------------------------------------
       CLOUD TASK ACTIONS (Journey Tab - Supabase backed)
    ---------------------------------------------------------------- */

    tasksLoading: false,
    tasksError: null,

    /* Loading flags for cloud-backed tabs */
    nuzlockeLoading: true,
    secretBaseLoading: true,
    habitsLoading: true,


    /* Fetch all tasks for the current user from Supabase */
    fetchTasks: async function() {
      var state = get()
      if (!state.session) return
      set({ tasksLoading: true, tasksError: null })
      var result = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (result.error) {
        set({ tasksLoading: false, tasksError: result.error.message })
      } else {
        set({ tasks: result.data || [], tasksLoading: false })
      }
    },

    /* Insert a new task into Supabase then re-fetch */
    addTask: async function(text, element) {
      var state = get()
      if (!state.session) return
      var userId = state.session.user.id
      await supabase.from('tasks').insert([{
        user_id: userId,
        task_name: text,
        element_type: element,
        is_completed: false,
      }])
      get().fetchTasks()
    },

    /* Mark a task complete in Supabase then re-fetch (also awards local XP) */
    toggleTaskCompletion: async function(id) {
      var state = get()
      var task = state.tasks.find(function(t) { return t.id === id })
      if (!task || task.is_completed) return
      var element = task.element_type || 'fire'
      var xpGain = element === 'electric' ? 15 : element === 'psychic' ? 50 : 30
      /* Optimistic local update for the XP bar */
      var n = state.completedToday + 1
      saveCompletedToday(n)
      set(function(s) {
        return {
          xp: { ...s.xp, [element]: (s.xp[element] || 0) + xpGain },
          totalXP: s.totalXP + xpGain,
          completedToday: n,
        }
      })
      await supabase.from('tasks').update({ is_completed: true }).eq('id', id)
      get().fetchTasks()
    },

    /* Legacy local task actions kept for compatibility with other tabs */
    completeTask: function(id) {
      const task = get().tasks.find(function(t) { return t.id === id })
      if (!task) return
      const xpGain = (task.element_type || task.element) === 'electric' ? 15 : (task.element_type || task.element) === 'psychic' ? 50 : 30
      set(function(state) {
        const n = state.completedToday + 1
        saveCompletedToday(n)
        return {
          tasks: state.tasks.map(function(t) { return t.id === id ? { ...t, is_completed: true, completed: true } : t }),
          xp: { ...state.xp, [(task.element_type || task.element)]: state.xp[(task.element_type || task.element)] + xpGain },
          totalXP: state.totalXP + xpGain,
          completedToday: n,
        }
      })
      setTimeout(function() {
        set(function(state) { return { tasks: state.tasks.filter(function(t) { return t.id !== id }) } })
      }, 1200)
    },

    deleteTask: function(id) {
      set(function(state) { return { tasks: state.tasks.filter(function(t) { return t.id !== id }) } })
    },

    /* Project actions */
    addProject: function(name, evoLineId, subTaskTexts) {
      const project = {
        id: generateId(),
        name,
        evoLineId,
        currentStage: 0,
        completed: false,
        createdAt: Date.now(),
        subTasks: subTaskTexts.filter(function(t) { return t.trim() }).map(function(text) { return { id: generateId(), text, completed: false } }),
      }
      set(function(state) { return { projects: [...state.projects, project] } })
    },

    completeSubTask: function(projectId, subTaskId) {
      set(function(state) {
        const projects = state.projects.map(function(proj) {
          if (proj.id !== projectId) return proj
          const newSubTasks = proj.subTasks.map(function(st) { return st.id === subTaskId ? { ...st, completed: true } : st })
          const done = newSubTasks.filter(function(st) { return st.completed }).length
          const total = newSubTasks.length
          const pct = total > 0 ? done / total : 0
          const newStage = pct >= 1 ? 2 : pct > 0.33 ? 1 : 0
          return { ...proj, subTasks: newSubTasks, currentStage: newStage, completed: pct >= 1 }
        })
        return { projects }
      })
    },

    deleteProject: function(id) {
      set(function(state) { return { projects: state.projects.filter(function(p) { return p.id !== id }) } })
    },

    /* Safari Zone XP — updates element radar AND total XP (persisted to DB) */
    gainXP: function(element, amount) {
      set(function(state) {
        return {
          xp: { ...state.xp, [element]: (state.xp[element] || 0) + amount },
        }
      })
      /* addXp handles totalXP + trainerLevel + Supabase persistence */
      get().addXp(amount)
    },


    setActiveTab: function(tab) { set({ activeTab: tab }) },

    setTrainerName: function(name) { set({ trainerName: name }) },

    /* ----------------------------------------------------------------
       NUZLOCKE PARTY — CLOUD ACTIONS (Supabase backed)
    ---------------------------------------------------------------- */

    fetchNuzlocke: async function() {
      var state = get()
      if (!state.session) return
      set({ nuzlockeLoading: true })
      var result = await supabase
        .from('nuzlocke_party')
        .select('*')
        .eq('user_id', state.session.user.id)
        .order('created_at', { ascending: true })
      if (!result.error) {
        var rows = result.data || []
        /* Map DB columns → local shape */
        var party = rows.filter(function(r) { return r.location === 'party' }).map(function(r) {
          return { id: r.id, taskName: r.task_name, pokemonId: r.pokemon_id, deadline: r.deadline, status: r.status }
        })
        var daycare = rows.filter(function(r) { return r.location === 'daycare' }).map(function(r) {
          return { id: r.id, taskName: r.task_name }
        })
        set({ party: party, daycare: daycare, nuzlockeLoading: false })
      } else {
        set({ nuzlockeLoading: false })
      }
    },

    addNuzlockeTask: async function(taskName, pokemonId, deadline, location) {
      var state = get()
      if (!state.session) return
      await supabase.from('nuzlocke_party').insert([{
        user_id: state.session.user.id,
        task_name: taskName,
        pokemon_id: pokemonId || null,
        deadline: deadline || null,
        status: location === 'party' ? 'active' : null,
        location: location || 'daycare',
      }])
      get().fetchNuzlocke()
    },

    updateNuzlockeStatus: async function(id, status) {
      await supabase.from('nuzlocke_party').update({ status: status }).eq('id', id)
      get().fetchNuzlocke()
    },

    /* ----------------------------------------------------------------
       SECRET BASE — CLOUD ACTIONS (Supabase backed)
    ---------------------------------------------------------------- */

    fetchSecretBase: async function() {
      var state = get()
      if (!state.session) return
      set({ secretBaseLoading: true })
      var result = await supabase
        .from('secret_base_items')
        .select('*')
        .eq('user_id', state.session.user.id)
        .order('created_at', { ascending: true })
      if (!result.error) {
        var rows = result.data || []
        var inventory = rows.filter(function(r) { return !r.is_placed }).map(function(r) {
          return { id: r.id, spriteName: r.sprite_name }
        })
        var placedItems = rows.filter(function(r) { return r.is_placed }).map(function(r) {
          return { id: r.id, spriteName: r.sprite_name, gridX: r.grid_x, gridY: r.grid_y }
        })
        set({ inventory: inventory, placedItems: placedItems, secretBaseLoading: false })
      } else {
        set({ secretBaseLoading: false })
      }
    },

    addSecretBaseItem: async function(spriteName) {
      var state = get()
      if (!state.session) return
      await supabase.from('secret_base_items').insert([{
        user_id: state.session.user.id,
        sprite_name: spriteName,
        is_placed: false,
        grid_x: null,
        grid_y: null,
      }])
      get().fetchSecretBase()
    },

    updateItemPlacement: async function(id, gridX, gridY, isPlaced) {
      await supabase.from('secret_base_items').update({
        is_placed: isPlaced,
        grid_x: isPlaced ? gridX : null,
        grid_y: isPlaced ? gridY : null,
      }).eq('id', id)
      get().fetchSecretBase()
    },

    /* ----------------------------------------------------------------
       DAILY HABITS — CLOUD ACTIONS (Supabase backed)
    ---------------------------------------------------------------- */

    fetchHabits: async function() {
      var state = get()
      if (!state.session) return
      set({ habitsLoading: true })
      var result = await supabase
        .from('daily_habits')
        .select('*')
        .eq('user_id', state.session.user.id)
        .order('created_at', { ascending: true })
      if (!result.error) {
        var habits = (result.data || []).map(function(r) {
          return { id: r.id, name: r.name, streak: r.streak || 0, lastCompleted: r.last_completed_date }
        })
        set({ habits: habits, habitsLoading: false })
      } else {
        set({ habitsLoading: false })
      }
    },

    updateHabitStreak: async function(id, newStreak, lastCompletedDate) {
      await supabase.from('daily_habits').update({
        streak: newStreak,
        last_completed_date: lastCompletedDate,
      }).eq('id', id)
      get().fetchHabits()
    },

    addHabitToDb: async function(name) {
      var state = get()
      if (!state.session) return
      await supabase.from('daily_habits').insert([{
        user_id: state.session.user.id,
        name: name,
        streak: 0,
        last_completed_date: null,
      }])
      get().fetchHabits()
    },

    deleteHabitFromDb: async function(id) {
      await supabase.from('daily_habits').delete().eq('id', id)
      get().fetchHabits()
    },

    updateSettings: function(patch) { set(patch) },


    /* Nuzlocke Party actions */
    addToParty: function(taskName, pokemonId, deadline) {
      set(function(state) {
        if (state.party.length >= 6) return state
        return {
          party: [...state.party, { id: generateId(), taskName, pokemonId, deadline, status: 'active' }],
        }
      })
    },

    completePartyTask: function(id) {
      set(function(state) {
        return {
          party: state.party.map(function(p) { return p.id === id ? { ...p, status: 'completed' } : p }),
          totalXP: state.totalXP + 100,
        }
      })
    },

    removeFromParty: function(id) {
      set(function(state) { return { party: state.party.filter(function(p) { return p.id !== id }) } })
    },

    checkFaintedTasks: function() {
      const now = Date.now()
      set(function(state) {
        return {
          party: state.party.map(function(p) {
            return (p.status === 'active' && new Date(p.deadline).getTime() < now)
              ? { ...p, status: 'fainted' }
              : p
          }),
        }
      })
    },

    /* Daycare actions */
    addToDaycare: function(taskName) {
      set(function(state) { return { daycare: [...state.daycare, { id: generateId(), taskName }] } })
    },

    deleteDaycare: function(id) {
      set(function(state) { return { daycare: state.daycare.filter(function(d) { return d.id !== id }) } })
    },

    moveDaycareToParty: function(daycareId, deadline) {
      set(function(state) {
        if (state.party.length >= 6) return state
        const item = state.daycare.find(function(d) { return d.id === daycareId })
        if (!item) return state
        const pokemonId = Math.floor(Math.random() * 151) + 1
        return {
          daycare: state.daycare.filter(function(d) { return d.id !== daycareId }),
          party: [...state.party, { id: generateId(), taskName: item.taskName, pokemonId, deadline, status: 'active' }],
        }
      })
    },

    /* ----------------------------------------------------------------
       SECRET BASE ACTIONS
    ---------------------------------------------------------------- */

    /* Mark a completedTask as claimed and push its reward to inventory */
    claimReward: function(taskId) {
      set(function(state) {
        const task = state.completedTasks.find(function(t) { return t.id === taskId })
        if (!task || task.isClaimed) return state
        return {
          completedTasks: state.completedTasks.map(function(t) {
            return t.id === taskId ? { ...t, isClaimed: true } : t
          }),
          inventory: [...state.inventory, { id: generateId(), spriteName: task.rewardItemSprite }],
        }
      })
    },

    /* Add an arbitrary completed task entry to the log (called when tasks finish) */
    addCompletedTask: function(taskName, rewardItemSprite) {
      var VALID_SPRITES = ['poke-doll','nugget','leaf-stone','water-stone','fire-stone','big-mushroom','rare-bone','light-ball','master-ball']
      var sprite = VALID_SPRITES.includes(rewardItemSprite) ? rewardItemSprite : 'nugget'
      set(function(state) {
        return {
          completedTasks: [...state.completedTasks, { id: generateId(), taskName: taskName, rewardItemSprite: sprite, isClaimed: false }],
        }
      })
    },

    /* Set the currently selected inventory item (null to deselect) */
    selectInventoryItem: function(itemId) {
      set({ selectedInventoryItem: itemId })
    },

    /* Move item from inventory onto the grid at (gridX, gridY) */
    placeItem: function(itemId, gridX, gridY) {
      set(function(state) {
        var item = state.inventory.find(function(i) { return i.id === itemId })
        if (!item) return state
        /* Don't stack on an occupied cell */
        var occupied = state.placedItems.some(function(p) { return p.gridX === gridX && p.gridY === gridY })
        if (occupied) return state
        return {
          inventory: state.inventory.filter(function(i) { return i.id !== itemId }),
          placedItems: [...state.placedItems, { id: generateId(), spriteName: item.spriteName, gridX: gridX, gridY: gridY }],
          selectedInventoryItem: null,
        }
      })
    },

    /* Pick up a placed item and return it to inventory */
    pickupItem: function(placedId) {
      set(function(state) {
        var item = state.placedItems.find(function(p) { return p.id === placedId })
        if (!item) return state
        return {
          placedItems: state.placedItems.filter(function(p) { return p.id !== placedId }),
          inventory: [...state.inventory, { id: generateId(), spriteName: item.spriteName }],
        }
      })
    },

    /* ----------------------------------------------------------------
       PART 6 — WEATHER / HABITS / SHINY ACTIONS
    ---------------------------------------------------------------- */

    /* Update weather from API result */
    setWeather: function(condition, typeBoost, icon, color) {
      set({ weather: { condition, typeBoost, icon, color } })
    },

    /* Complete a habit for today — applies streak logic & shiny roll */
    completeHabit: function(habitId) {
      set(function(state) {
        var today = new Date().toISOString().slice(0, 10)
        var habit = state.habits.find(function(h) { return h.id === habitId })
        if (!habit) return state

        /* Prevent double-completion on same calendar day */
        if (habit.lastCompleted && habit.lastCompleted.slice(0, 10) === today) return state

        var newStreak = habit.streak + 1

        /* Shiny odds thresholds based on new streak value */
        var threshold
        if (newStreak <= 2)       threshold = 1 / 4096
        else if (newStreak <= 6)  threshold = 1 / 1000
        else if (newStreak <= 14) threshold = 1 / 100
        else                      threshold = 1 / 20

        var roll = Math.random()
        var isShiny = roll < threshold

        var newShinies = state.caughtShinies
        if (isShiny) {
          var pokemonId = Math.floor(Math.random() * 151) + 1
          newShinies = [...state.caughtShinies, {
            id: generateId(),
            pokemonId: pokemonId,
            dateCaught: new Date().toISOString(),
          }]
        }

        return {
          habits: state.habits.map(function(h) {
            return h.id === habitId
              ? { ...h, streak: newStreak, lastCompleted: new Date().toISOString() }
              : h
          }),
          caughtShinies: newShinies,
          /* Signal shiny encounter via a flag — component watches this */
          _shinyEncounter: isShiny ? (newShinies[newShinies.length - 1] || null) : null,
        }
      })
    },

    /* Add a new custom habit */
    addHabit: function(name) {
      set(function(state) {
        return {
          habits: [...state.habits, { id: generateId(), name, streak: 0, lastCompleted: null }],
        }
      })
    },

    /* Remove a habit */
    deleteHabit: function(habitId) {
      set(function(state) {
        return { habits: state.habits.filter(function(h) { return h.id !== habitId }) }
      })
    },

    /* ----------------------------------------------------------------
       RAID HUB ACTIONS
    ---------------------------------------------------------------- */

    /* User attacks the raid boss (costs 100 energy, deals 500 damage) */
    raidAttack: function() {
      set(function(state) {
        if (state.raidEnergy < 100) return state
        if (state.raidBoss.currentHp <= 0) return state
        var newHp = Math.max(0, state.raidBoss.currentHp - 500)
        var msg = 'YOU unleashed a massive attack for 500 damage!'
        var newLog = [msg, ...state.raidLog].slice(0, 6)
        return {
          raidBoss: { ...state.raidBoss, currentHp: newHp },
          raidEnergy: state.raidEnergy - 100,
          raidLog: newLog,
        }
      })
    },

    /* Simulated trainer hits — called by the setInterval in the component */
    raidTick: function(trainerName, damage) {
      set(function(state) {
        if (state.raidBoss.currentHp <= 0) return state
        var newHp = Math.max(0, state.raidBoss.currentHp - damage)
        var time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        var msg = '[' + time + '] ' + trainerName + ' dealt ' + damage + ' damage!'
        var newLog = [msg, ...state.raidLog].slice(0, 6)
        return {
          raidBoss: { ...state.raidBoss, currentHp: newHp },
          raidLog: newLog,
        }
      })
    },

    /* Reset the raid (for rematch) */
    raidReset: function() {
      set(function(state) {
        return {
          raidBoss: { ...state.raidBoss, currentHp: state.raidBoss.maxHp },
          raidEnergy: 500,
          raidLog: ['A new raid has started!', 'Trainers are assembling...'],
        }
      })
    },
  }
})
