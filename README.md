# PokéProd (Lofi HeartGold)

PokéProd is a gamified productivity RPG built with **React**, **Tailwind CSS**, **Zustand**, **Recharts**, **Framer Motion**, and **Supabase**. Inspired by Pokémon HeartGold/SoulSilver and styled with a classic Gen 3 GBA palette (`#F8F8ED` cream panels, `#68A0B0` teal / `#E09078` orange borders, and `VT323` / `Press Start 2P` typography), it turns daily tasks, deep-work focus sessions, habits, and multi-step projects into a cohesive Pokémon adventure.

---

## Core Features

- **Professor Oak Authentication:** Classic dialogue intro backed by Supabase Auth.
- **Journey Quests & Evolution Projects:** Type-coded tasks (`Fire`, `Water`, `Grass`, `Psychic`, `Electric`, `Fairy`) advance the interactive **Route 1 Map** and award element & trainer XP. Multi-step **Projects** evolve your chosen starter line across 3 stages and sync to Supabase (with automatic localStorage fallback).
- **Safari Zone Focus Timer:** Gamified Pomodoro sessions with animated Gen 5 sprites, Gen 4/5 battle grounds, Pokéball catch animations, and anti-cheat tab-visibility detection.
- **Daily Gym Challenge & 8-Badge Case (`BattleTab`):** Every day features a rotating Gym Leader. Completing quests, habits, and Safari focus sessions deals damage (super-effective on matching element type) to earn persistent Gym Badges.
- **Pokédex Registry (`PokedexTab`):** Automatically registers starters, Safari catches, Nuzlocke companions, shiny habit encounters, project evolutions, Gym Leaders, and Raid bosses across Kanto `#001–#151` + special encounters with search, filters, and shiny toggles.
- **Nuzlocke Party & Daycare:** High-stakes deadline slots (max 6) with countdown HP bars and fainting penalties, plus an unlimited Daycare backlog.
- **Daily Habits, Weather Boost & Shiny Box:** Open-Meteo real-time weather type boosts, streak tracking, escalating shiny encounter odds (`1/4096` → `1/20`), and a persistent Shiny Box.
- **Secret Base:** Claim rewards from completed milestones and decorate an 8×8 room grid backed by Supabase.
- **Co-Op Raid Hub:** Real-time multiplayer boss battles powered by Supabase Postgres Changes + Broadcast channels.
- **Trainer Analytics & Achievements (`StatsTab`):** Recharts XP growth curve & element mastery charts, 30-day activity heatmap, and 8 unlockable meta-achievements.
- **Pokémon League Hub (`LeagueTab`):** Public Leaderboard standings, 8-character Friend Codes & Pal Pad invites, live Rival/Friend Quest Race Duels, and a Collectible TCG Card Binder with Booster Pack openings.
- **Professor Oak Smart Advisor:** Context-aware coaching tip card analyzing urgent Nuzlocke deadlines, Daily Gym weaknesses, unopened Booster Packs, and Type Balance gaps.
- **Mobile-First Responsive Layout & PWA:** Adaptive mobile header + bottom navigation bar on screens `< 768px`, offline status detection, PWA manifest, static sprite service-worker caching, browser deadline/habit alerts, and optional Gen 1–5 themes.
- **Save Data Export:** Export your full trainer profile, tasks, projects, habits, badges, and Pokédex to JSON from Settings.

---

## Tech Stack

- **Frontend:** React 19, Vite 5, Tailwind CSS v4, Framer Motion, Recharts
- **State Management:** Modular Zustand domain slices (`src/store/`) with `useShallow` selectors
- **Backend & Security:** Supabase Auth, Postgres with Row-Level Security (RLS), Realtime WebSockets
- **Testing:** Vitest, React Testing Library, JSDOM

---

## Architecture Overview

```text
src/
├── constants/
│   ├── gameData.js         # Elements, evolution lines, starters, nav items, achievements
│   └── pokedex151.js       # Kanto #1-#151 names & daily Gym Leader definitions
├── components/
│   ├── ui/                 # Shared G3Header, G3Panel, HPBar, SpriteImage, ErrorBoundary, Toasts
│   ├── Auth.jsx
│   ├── Background.jsx
│   ├── BattleTab.jsx
│   ├── DailyHabits.jsx
│   ├── JourneyTab.jsx
│   ├── NuzlockeParty.jsx
│   ├── PokedexTab.jsx
│   ├── RaidHub.jsx
│   ├── SafariZone.jsx
│   ├── SecretBase.jsx
│   ├── Settings.jsx
│   ├── Sidebar.jsx
│   └── StatsTab.jsx
├── store/                  # Domain slices composed cleanly via src/store/index.js
└── utils/
    └── exportSave.js       # JSON backup exporter
supabase/
└── migrations/
    ├── 001_v2_foundation_and_rls.sql
    └── 002_v2_core_gameplay.sql
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ or v20+ recommended)
- A Supabase project

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

3. Apply Database & RLS Migrations:
   Open your **Supabase Dashboard → SQL Editor** and run both migration scripts in order:
   - `supabase/migrations/001_v2_foundation_and_rls.sql` (Profiles + signup trigger, Tasks, Cloud Projects, Nuzlocke, Secret Base, Habits, Raid Boss, and Row-Level Security policies)
   - `supabase/migrations/002_v2_core_gameplay.sql` (Pokédex entries, Gym Badges, Daily Boss, Daily Analytics Snapshots + RLS)
   - `supabase/migrations/003_v2_social_and_cards.sql` (Public Leaderboard columns & Friend Codes, Friendships, Duels, Collected TCG Cards + RLS)

4. Run locally, lint, test, and build:
   ```bash
   npm run dev      # Start dev server
   npm run lint     # Run ESLint
   npm test         # Run Vitest unit & component suite
   npm run build    # Production build
   ```

---

## License

MIT
