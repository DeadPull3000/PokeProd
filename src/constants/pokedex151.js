/* Kanto Pokédex #001-#151 Metadata + Popular Johto/Hoenn Starters */
export const KANTO_NAMES = [
  'BULBASAUR','IVYSAUR','VENUSAUR','CHARMANDER','CHARMELEON','CHARIZARD','SQUIRTLE','WARTORTLE','BLASTOISE','CATERPIE',
  'METAPOD','BUTTERFREE','WEEDLE','KAKUNA','BEEDRILL','PIDGEY','PIDGEOTTO','PIDGEOT','RATTATA','RATICATE',
  'SPEAROW','FEAROW','EKANS','ARBOK','PIKACHU','RAICHU','SANDSHREW','SANDSLASH','NIDORAN♀','NIDORINA',
  'NIDOQUEEN','NIDORAN♂','NIDORINO','NIDOKING','CLEFAIRY','CLEFABLE','VULPIX','NINETALES','JIGGLYPUFF','WIGGLYTUFF',
  'ZUBAT','GOLBAT','ODDISH','GLOOM','VILEPLUME','PARAS','PARASECT','VENONAT','VENOMOTH','DIGLETT',
  'DUGTRIO','MEOWTH','PERSIAN','PSYDUCK','GOLDUCK','MANKEY','PRIMEAPE','GROWLITHE','ARCANINE','POLIWAG',
  'POLIWHIRL','POLIWRATH','ABRA','KADABRA','ALAKAZAM','MACHOP','MACHOKE','MACHAMP','BELLSPROUT','WEEPINBELL',
  'VICTREEBEL','TENTACOOL','TENTACRUEL','GEODUDE','GRAVELER','GOLEM','PONYTA','RAPIDASH','SLOWPOKE','SLOWBRO',
  'MAGNEMITE','MAGNETON','FARFETCHD','DODUO','DODRIO','SEEL','DEWGONG','GRIMER','MUK','SHELLDER',
  'CLOYSTER','GASTLY','HAUNTER','GENGAR','ONIX','DROWZEE','HYPNO','KRABBY','KINGLER','VOLTORB',
  'ELECTRODE','EXEGGCUTE','EXEGGUTOR','CUBONE','MAROWAK','HITMONLEE','HITMONCHAN','LICKITUNG','KOFFING','WEEZING',
  'RHYHORN','RHYDON','CHANSEY','TANGELA','KANGASKHAN','HORSEA','SEADRA','GOLDEEN','SEAKING','STARYU',
  'STARMIE','MR. MIME','SCYTHER','JYNX','ELECTABUZZ','MAGMAR','PINSIR','TAUROS','MAGIKARP','GYARADOS',
  'LAPRAS','DITTO','EEVEE','VAPOREON','JOLTEON','FLAREON','PORYGON','OMANYTE','OMASTAR','KABUTO',
  'KABUTOPS','AERODACTYL','SNORLAX','ARTICUNO','ZAPDOS','MOLTRES','DRATINI','DRAGONAIR','DRAGONITE','MEWTWO','MEW',
]

const EXTRA_NAMES = {
  152: 'CHIKORITA', 155: 'CYNDAQUIL', 157: 'TYPHLOSION', 158: 'TOTODILE',
  172: 'PICHU', 252: 'TREECKO', 255: 'TORCHIC', 258: 'MUDKIP',
  289: 'SLAKING', 518: 'MUSHARNA',
}

export function getPokemonName(id) {
  if (id >= 1 && id <= 151) return KANTO_NAMES[id - 1]
  return EXTRA_NAMES[id] || `POKéMON #${id}`
}

export const KANTO_POKEDEX = KANTO_NAMES.map((name, idx) => ({
  id: idx + 1,
  name,
}))

export const GYM_LEADERS = [
  {
    id: 'blaine',
    name: 'BLAINES VOLCANO',
    leaderName: 'BLAINE',
    badgeName: 'Volcano Badge',
    badgeType: 'fire',
    badgeEmoji: '🌋',
    element: 'fire',
    aceId: 59,
    aceName: 'ARCANINE',
    quote: 'Hah! Complete Fire quests (Health & Fitness) to melt my defenses!',
    color: '#f97316',
  },
  {
    id: 'misty',
    name: 'CERULEAN CASCADE',
    leaderName: 'MISTY',
    badgeName: 'Cascade Badge',
    badgeType: 'water',
    badgeEmoji: '💧',
    element: 'water',
    aceId: 121,
    aceName: 'STARMIE',
    quote: 'Stay consistent with Water quests (Chores & Self-Care)!',
    color: '#0ea5e9',
  },
  {
    id: 'erika',
    name: 'CELADON GARDEN',
    leaderName: 'ERIKA',
    badgeName: 'Rainbow Badge',
    badgeType: 'grass',
    badgeEmoji: '🌈',
    element: 'grass',
    aceId: 45,
    aceName: 'VILEPLUME',
    quote: 'Nurture Grass quests (Growth & Learning) to earn my Rainbow Badge.',
    color: '#22c55e',
  },
  {
    id: 'sabrina',
    name: 'SAFFRON SANCTUM',
    leaderName: 'SABRINA',
    badgeName: 'Marsh Badge',
    badgeType: 'psychic',
    badgeEmoji: '🔮',
    element: 'psychic',
    aceId: 65,
    aceName: 'ALAKAZAM',
    quote: 'I foresaw your victory — unleash Psychic deep-work focus!',
    color: '#a855f7',
  },
  {
    id: 'surge',
    name: 'VERMILION POWER',
    leaderName: 'LT. SURGE',
    badgeName: 'Thunder Badge',
    badgeType: 'electric',
    badgeEmoji: '⚡',
    element: 'electric',
    aceId: 26,
    aceName: 'RAICHU',
    quote: 'Shock me with rapid-fire Electric quests (<5 min tasks)!',
    color: '#eab308',
  },
  {
    id: 'whitney',
    name: 'GOLDENROD STAR',
    leaderName: 'WHITNEY',
    badgeName: 'Plain Badge',
    badgeType: 'fairy',
    badgeEmoji: '🌟',
    element: 'fairy',
    aceId: 36,
    aceName: 'CLEFABLE',
    quote: 'Stay connected! Fairy quests (Social & Family) win my heart!',
    color: '#ec4899',
  },
  {
    id: 'koga',
    name: 'FUCHSIA SHADOW',
    leaderName: 'KOGA',
    badgeName: 'Soul Badge',
    badgeType: 'soul',
    badgeEmoji: '💗',
    element: 'psychic',
    aceId: 94,
    aceName: 'GENGAR',
    quote: 'Master your discipline through Psychic focus and steady streaks!',
    color: '#7c3aed',
  },
  {
    id: 'giovanni',
    name: 'VIRIDIAN CITADEL',
    leaderName: 'GIOVANNI',
    badgeName: 'Earth Badge',
    badgeType: 'earth',
    badgeEmoji: '🌿',
    element: 'fire',
    aceId: 112,
    aceName: 'RHYDON',
    quote: 'Only unyielding Fitness & Determination can claim the Earth Badge!',
    color: '#15803d',
  },
]

export function getDailyGymLeader(dateStr = new Date().toISOString().slice(0, 10)) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  }
  return GYM_LEADERS[hash % GYM_LEADERS.length]
}
