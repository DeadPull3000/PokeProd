/* ============================================================
   POKÉPROD CONSTANTS & SPRITE HELPERS
   Centralized domain definitions shared across stores & UI.
   ============================================================ */

export const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'
export const ITEM_BASE = `${SPRITE_BASE}/items/`
export const CRY_BASE = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/'

export const itemUrl = (slug) => `${ITEM_BASE}${slug}.png`
export const animSprite = (id) => `${SPRITE_BASE}/pokemon/versions/generation-v/black-white/animated/${id}.gif`
export const animBack = (id) => `${SPRITE_BASE}/pokemon/versions/generation-v/black-white/animated/back/${id}.gif`
export const staticSprite = (id) => `${SPRITE_BASE}/pokemon/${id}.png`
export const staticBack = (id) => `${SPRITE_BASE}/pokemon/back/${id}.png`
export const shinySprite = (id) => `${SPRITE_BASE}/pokemon/versions/generation-v/black-white/animated/shiny/${id}.gif`
export const shinyStatic = (id) => `${SPRITE_BASE}/pokemon/shiny/${id}.png`

export const XP_PER_LEVEL = 100
export const calcTrainerLevel = (totalXP) => Math.floor(Math.max(0, totalXP || 0) / XP_PER_LEVEL) + 1

/* Element definitions for tasks & Type Balance radar */
export const ELEMENTS = {
  fire: {
    id: 'fire', label: 'Fire', emoji: '🔥', description: 'Health & Fitness',
    color: '#f97316', borderColor: '#ea580c', bgHex: '#fff7ed',
    glowColor: 'rgba(249,115,22,0.7)',
    itemSprite: itemUrl('potion'), itemName: 'Potion', xpKey: 'fire',
  },
  water: {
    id: 'water', label: 'Water', emoji: '💧', description: 'Chores & Self-Care',
    color: '#0ea5e9', borderColor: '#0284c7', bgHex: '#f0f9ff',
    glowColor: 'rgba(14,165,233,0.7)',
    itemSprite: itemUrl('fresh-water'), itemName: 'Fresh Water', xpKey: 'water',
  },
  grass: {
    id: 'grass', label: 'Grass', emoji: '🌿', description: 'Growth & Learning',
    color: '#22c55e', borderColor: '#16a34a', bgHex: '#f0fdf4',
    glowColor: 'rgba(34,197,94,0.7)',
    itemSprite: itemUrl('oran-berry'), itemName: 'Oran Berry', xpKey: 'grass',
  },
  psychic: {
    id: 'psychic', label: 'Psychic', emoji: '🔮', description: 'Deep Work & Focus',
    color: '#a855f7', borderColor: '#9333ea', bgHex: '#faf5ff',
    glowColor: 'rgba(168,85,247,0.7)',
    itemSprite: itemUrl('kings-rock'), itemName: "King's Rock", xpKey: 'psychic',
  },
  electric: {
    id: 'electric', label: 'Electric', emoji: '⚡', description: 'Quick Tasks (<5 min)',
    color: '#eab308', borderColor: '#ca8a04', bgHex: '#fefce8',
    glowColor: 'rgba(234,179,8,0.7)',
    itemSprite: itemUrl('thunder-stone'), itemName: 'Thunder Stone', xpKey: 'electric',
  },
  fairy: {
    id: 'fairy', label: 'Fairy', emoji: '🧚', description: 'Social & Family',
    color: '#ec4899', borderColor: '#db2777', bgHex: '#fdf2f8',
    glowColor: 'rgba(236,72,153,0.7)',
    itemSprite: itemUrl('moon-stone'), itemName: 'Moon Stone', xpKey: 'fairy',
  },
}

/* Project evolution lines */
export const EVOLUTION_LINES = [
  {
    id: 0, name: 'Bulbasaur Line', color: '#40A840',
    stages: [
      { id: 1, name: 'BULBASAUR', label: 'Seedling' },
      { id: 2, name: 'IVYSAUR',   label: 'Growing'  },
      { id: 3, name: 'VENUSAUR',  label: 'Blooming' },
    ],
  },
  {
    id: 1, name: 'Charmander Line', color: '#F87038',
    stages: [
      { id: 4, name: 'CHARMANDER', label: 'Ember'   },
      { id: 5, name: 'CHARMELEON', label: 'Flame'   },
      { id: 6, name: 'CHARIZARD',  label: 'Blazing' },
    ],
  },
  {
    id: 2, name: 'Squirtle Line', color: '#6890F0',
    stages: [
      { id: 7, name: 'SQUIRTLE',  label: 'Droplet' },
      { id: 8, name: 'WARTORTLE', label: 'Tide'    },
      { id: 9, name: 'BLASTOISE', label: 'Torrent' },
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

/* Starter Pokémon choices */
export const STARTERS = [
  { id: 1,   name: 'BULBASAUR',  gen: 'Kanto', type: 'Grass/Poison' },
  { id: 4,   name: 'CHARMANDER', gen: 'Kanto', type: 'Fire'         },
  { id: 7,   name: 'SQUIRTLE',   gen: 'Kanto', type: 'Water'        },
  { id: 152, name: 'CHIKORITA',  gen: 'Johto', type: 'Grass'        },
  { id: 155, name: 'CYNDAQUIL',  gen: 'Johto', type: 'Fire'         },
  { id: 158, name: 'TOTODILE',   gen: 'Johto', type: 'Water'        },
  { id: 252, name: 'TREECKO',    gen: 'Hoenn', type: 'Grass'        },
  { id: 255, name: 'TORCHIC',    gen: 'Hoenn', type: 'Fire'         },
  { id: 258, name: 'MUDKIP',     gen: 'Hoenn', type: 'Water'        },
]

/* Background cycle options */
export const BG_CYCLES = ['Auto', 'Morning', 'Day', 'Evening', 'Night']

export const BG_META = {
  Auto:    { icon: '🔄', hint: 'Follows the real-world clock automatically' },
  Morning: { icon: '🌅', hint: 'Lock to sunrise gradient (6AM look)'        },
  Day:     { icon: '☀️', hint: 'Lock to bright afternoon sky'               },
  Evening: { icon: '🌇', hint: 'Lock to sunset purple-orange gradient'      },
  Night:   { icon: '🌙', hint: 'Lock to deep night sky with stars'          },
}

/* Secret Base item definitions */
export const VALID_SECRET_BASE_SPRITES = [
  'poke-doll', 'nugget', 'leaf-stone', 'water-stone',
  'fire-stone', 'big-mushroom', 'rare-bone', 'light-ball', 'master-ball',
]

export const ITEM_LABELS = {
  'poke-doll':    'Poke Doll',
  'nugget':       'Nugget',
  'leaf-stone':   'Leaf Stone',
  'water-stone':  'Water Stone',
  'fire-stone':   'Fire Stone',
  'big-mushroom': 'Big Mushroom',
  'rare-bone':    'Rare Bone',
  'light-ball':   'Light Ball',
  'master-ball':  'Master Ball',
}

export const generateLocalId = () => Math.random().toString(36).substring(2, 10)

export const NAV_ITEMS = [
  { id: 'journey',     emoji: '🗺️', label: 'JOURNEY',     shortLabel: 'JOURNEY' },
  { id: 'safari',      emoji: '🌿', label: 'SAFARI ZONE', shortLabel: 'SAFARI' },
  { id: 'nuzlocke',    emoji: '☠️', label: 'NUZLOCKE',    shortLabel: 'PARTY' },
  { id: 'secretbase',  emoji: '🏠', label: 'SECRET BASE', shortLabel: 'BASE' },
  { id: 'dailyhabits', emoji: '🌦️', label: 'DAILY HABITS',shortLabel: 'HABITS' },
  { id: 'raidhub',     emoji: '🗡️', label: 'RAID HUB',    shortLabel: 'RAID' },
  { id: 'battle',      emoji: '⚔️', label: 'BATTLE',      shortLabel: 'BATTLE' },
  { id: 'pokedex',     emoji: '📖', label: 'POKéDEX',     shortLabel: 'DEX' },
  { id: 'league',      emoji: '🏆', label: 'LEAGUE',      shortLabel: 'LEAGUE' },
  { id: 'stats',       emoji: '📊', label: 'STATS',       shortLabel: 'STATS' },
  { id: 'settings',    emoji: '⚙️', label: 'SETTINGS',    shortLabel: 'OPTS' },
]

export const THEMES = [
  { id: 'gen3', name: 'Gen 3 GBA',     subtitle: 'Classic Cream (Default)', swatch: '#68B0B0' },
  { id: 'gen1', name: 'Gen 1 DMG',     subtitle: 'Game Boy Monochrome',     swatch: '#306230' },
  { id: 'gen2', name: 'Gen 2 Johto',   subtitle: 'Gold & Silver GBC',       swatch: '#3838B8' },
  { id: 'gen4', name: 'Gen 4 Sinnoh',  subtitle: 'Diamond & Pearl DS',      swatch: '#4A6CF7' },
  { id: 'gen5', name: 'Gen 5 Unova',   subtitle: 'Black & White DS',        swatch: '#2D6DB5' },
]

export function mapWeatherCode(code) {
  if (code === 0 || code === 1)
    return { condition: 'Sunny', typeBoost: 'Fire & Grass', icon: '☀️', color: '#ef4444' }
  if (code === 2 || code === 3)
    return { condition: 'Cloudy', typeBoost: 'Normal & Fairy', icon: '☁️', color: '#6b7280' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return { condition: 'Rain', typeBoost: 'Water & Electric', icon: '🌧️', color: '#3b82f6' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { condition: 'Snow', typeBoost: 'Ice & Steel', icon: '❄️', color: '#06b6d4' }
  return { condition: 'Cloudy', typeBoost: 'Normal & Fairy', icon: '🌫️', color: '#6b7280' }
}

/* Meta-Achievement definitions (Phase 5.3) */
export const ACHIEVEMENTS = [
  {
    key: 'first_quest',
    emoji: '🏅',
    title: 'FIRST STEPS',
    description: 'Complete your first quest on Journey.',
    check: (s) => s.tasks?.some((t) => t.is_completed || t.completed) || (s.completedToday || 0) > 0,
  },
  {
    key: 'on_fire',
    emoji: '🔥',
    title: 'ON FIRE',
    description: 'Reach a 7-day habit streak.',
    check: (s) => s.habits?.some((h) => (h.streak || 0) >= 7),
  },
  {
    key: 'shiny_luck',
    emoji: '✨',
    title: 'LUCKY STAR',
    description: 'Catch a Shiny Pokémon.',
    check: (s) => (s.caughtShinies?.length || 0) > 0 || s.pokedexEntries?.some((p) => p.isShiny),
  },
  {
    key: 'homeowner',
    emoji: '🏠',
    title: 'HOMEOWNER',
    description: 'Place 3+ items in your Secret Base.',
    check: (s) => (s.placedItems?.length || 0) >= 3,
  },
  {
    key: 'gym_badge',
    emoji: '⚔️',
    title: 'GYM CHALLENGER',
    description: 'Defeat a Daily Gym Leader.',
    check: (s) => (s.gymBadges?.length || 0) >= 1,
  },
  {
    key: 'dex_researcher',
    emoji: '📖',
    title: 'POKéDEX PRO',
    description: 'Register 10+ Pokémon species.',
    check: (s) => new Set((s.pokedexEntries || []).map((p) => p.pokemonId)).size >= 10,
  },
  {
    key: 'ace_trainer',
    emoji: '🌟',
    title: 'ACE TRAINER',
    description: 'Reach Trainer Level 5.',
    check: (s) => (s.trainerLevel || 1) >= 5,
  },
  {
    key: 'evolution_master',
    emoji: '🧬',
    title: 'EVOLUTION MASTER',
    description: 'Fully evolve a multi-step Project.',
    check: (s) => s.projects?.some((p) => p.completed || (p.currentStage || 0) >= 2),
  },
]
