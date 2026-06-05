const S = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'
const animSprite = (id) => `${S}/pokemon/versions/generation-v/black-white/animated/${id}.gif`
const animBack   = (id) => `${S}/pokemon/versions/generation-v/black-white/animated/back/${id}.gif`
const staticSprite = (id) => `${S}/pokemon/${id}.png`

export const getTimeOfDay = (hour = new Date().getHours()) => {
  if (hour >= 6  && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 20) return 'evening'
  return 'night'
}

export const SCENES = {
  morning: {
    label: 'Morning',
    gradient: 'linear-gradient(160deg, #fde8d0 0%, #fbb98c 25%, #f9a576 40%, #c5dff5 65%, #a8d4f5 85%, #90c8f0 100%)',
    overlayGradient: 'linear-gradient(to bottom, rgba(255,200,150,0.3) 0%, transparent 40%, rgba(160,210,245,0.2) 100%)',
    groundColor: 'linear-gradient(to bottom, #86efac, #4ade80)',
    pokemon: [
      { id: 16,  name: 'PIDGEY',  gen: 'Gen I',   src: animSprite(16),  style: { top: '12%', left: '8%' },   animClass: 'float-a', scale: 3.5 },
      { id: 278, name: 'WINGULL', gen: 'Gen III',  src: animSprite(278), style: { top: '6%',  right: '18%' }, animClass: 'float-b', scale: 3 },
      { id: 396, name: 'STARLY',  gen: 'Gen IV',  src: animSprite(396), style: { top: '20%', left: '52%' },  animClass: 'float-c', scale: 2.8 },
    ],
    clouds: true,
    stars: false,
    sunMoon: { type: 'sun', color: 'radial-gradient(circle, #fef3c7, #fbbf24)', glow: 'rgba(251,191,36,0.5)', size: 60, top: '8%', right: '14%' },
    timeLabel: '🌅 Morning',
    groundFlowers: true,
  },
  afternoon: {
    label: 'Afternoon',
    gradient: 'linear-gradient(160deg, #bae6fd 0%, #7dd3fc 30%, #38bdf8 55%, #f0f9ff 70%, #fef9c3 88%, #fde68a 100%)',
    overlayGradient: 'linear-gradient(to bottom, rgba(186,230,253,0.2) 0%, transparent 50%)',
    groundColor: 'linear-gradient(to bottom, #86efac, #22c55e)',
    pokemon: [
      { id: 143, name: 'SNORLAX',   gen: 'Gen I',   src: animSprite(143),    style: { bottom: '17%', left: '6%' },   animClass: 'float-c', scale: 4 },
      { id: 761, name: 'BOUNSWEET', gen: 'Gen VII',  src: staticSprite(761),  style: { bottom: '22%', left: '32%' },  animClass: 'float-a', scale: 3 },
      { id: 916, name: 'LECHONK',   gen: 'Gen IX',   src: staticSprite(916),  style: { bottom: '16%', right: '10%' }, animClass: 'float-b', scale: 3.2 },
    ],
    clouds: true,
    stars: false,
    sunMoon: { type: 'sun', color: 'radial-gradient(circle, #fef9c3, #fde68a)', glow: 'rgba(253,230,138,0.6)', size: 72, top: '5%', right: '20%' },
    timeLabel: '☀️ Afternoon',
    groundFlowers: true,
  },
  evening: {
    label: 'Evening',
    gradient: 'linear-gradient(160deg, #7c3aed 0%, #9333ea 15%, #c026d3 30%, #db2777 45%, #f97316 60%, #fb923c 75%, #fbbf24 90%, #fde68a 100%)',
    overlayGradient: 'linear-gradient(to bottom, rgba(124,58,237,0.25) 0%, transparent 50%, rgba(249,115,22,0.15) 100%)',
    groundColor: 'linear-gradient(to bottom, #1e1b4b, #312e81)',
    pokemon: [
      { id: 250, name: 'HO-OH',  gen: 'Gen II', src: animSprite(250), style: { top: '10%', left: '48%' },  animClass: 'float-a', scale: 4.5 },
      { id: 517, name: 'MUNNA',  gen: 'Gen V',  src: animSprite(517), style: { top: '26%', right: '12%' }, animClass: 'float-b', scale: 3.2 },
    ],
    clouds: false,
    stars: false,
    sunMoon: null,
    timeLabel: '🌇 Evening',
    groundFlowers: false,
    eveningSun: true,
  },
  night: {
    label: 'Night',
    gradient: 'linear-gradient(160deg, #0a0a1a 0%, #0d1117 20%, #0f172a 40%, #1e1b4b 60%, #2e1065 80%, #1a0533 100%)',
    overlayGradient: 'linear-gradient(to bottom, rgba(30,27,75,0.4) 0%, transparent 60%)',
    groundColor: 'linear-gradient(to bottom, #0f172a, #020617)',
    pokemon: [
      { id: 163, name: 'HOOTHOOT', gen: 'Gen II',  src: animSprite(163), style: { top: '14%', left: '10%' },   animClass: 'float-a', scale: 3.5 },
      { id: 197, name: 'UMBREON',  gen: 'Gen II',  src: animSprite(197), style: { bottom: '20%', left: '5%' }, animClass: 'float-c', scale: 3 },
      { id: 872, name: 'SNOM',     gen: 'Gen VIII', src: staticSprite(872), style: { bottom: '24%', right: '8%' }, animClass: 'float-b', scale: 3 },
      { id: 885, name: 'DREEPY',   gen: 'Gen VIII', src: staticSprite(885), style: { top: '18%', right: '22%' }, animClass: 'drift',   scale: 2.8 },
    ],
    clouds: false,
    stars: true,
    sunMoon: { type: 'moon', color: 'radial-gradient(circle, #f8fafc, #cbd5e1)', glow: 'rgba(203,213,225,0.3)', size: 52, top: '8%', right: '12%' },
    timeLabel: '🌙 Night',
    groundFlowers: false,
  },
}

export { animSprite, animBack, staticSprite }
