import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  useTasks,
  useHabits,
  useBattle,
  usePokedex,
  useXp,
  useStats,
  useProjects,
  useSecretBase,
  ELEMENTS,
} from '../store'
import { ACHIEVEMENTS } from '../constants/gameData'
import { G3, G3Header, G3Panel } from './ui'

function buildLast30Days(snapshots) {
  const map = new Map(snapshots.map((s) => [s.date, s]))
  const out = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = map.get(dateStr)
    const totalDone = (entry?.tasksCompleted || 0) + (entry?.habitsCompleted || 0)
    out.push({
      date: dateStr,
      shortDate: dateStr.slice(5),
      count: totalDone,
      xp: entry?.totalXp ?? null,
    })
  }
  return out
}

function buildXpTrendSeries(days, totalXP) {
  return days.reduce((acc, d, idx) => {
    const prev = acc.length ? acc[acc.length - 1].xp : 0
    const nextXp =
      d.xp !== null ? d.xp : idx === days.length - 1 ? Math.max(prev, totalXP) : prev
    acc.push({ day: d.shortDate, xp: nextXp })
    return acc
  }, [])
}

export default function StatsTab() {
  const { tasks } = useTasks()
  const { habits, caughtShinies } = useHabits()
  const { gymBadges } = useBattle()
  const { pokedexEntries } = usePokedex()
  const { xp, totalXP, trainerLevel, completedToday } = useXp()
  const { dailySnapshots, statsCloudSynced, fetchSnapshots } = useStats()
  const { projects } = useProjects()
  const { placedItems } = useSecretBase()

  const achievementStatus = useMemo(() => {
    const snapshot = {
      tasks,
      habits,
      caughtShinies,
      gymBadges,
      pokedexEntries,
      trainerLevel,
      completedToday,
      projects,
      placedItems,
    }
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: Boolean(a.check(snapshot)) }))
  }, [tasks, habits, caughtShinies, gymBadges, pokedexEntries, trainerLevel, completedToday, projects, placedItems])

  const unlockedAchievements = achievementStatus.filter((a) => a.unlocked).length

  useEffect(() => {
    fetchSnapshots()
  }, [fetchSnapshots])

  const completedTasksCount = useMemo(
    () => tasks.filter((t) => t.is_completed || t.completed).length,
    [tasks]
  )
  const completionRate = useMemo(() => {
    if (!tasks.length) return 0
    return Math.round((completedTasksCount / tasks.length) * 100)
  }, [tasks, completedTasksCount])

  const bestStreak = useMemo(
    () => habits.reduce((max, h) => Math.max(max, h.streak || 0), 0),
    [habits]
  )

  const uniquePokedexCount = useMemo(() => {
    return new Set(pokedexEntries.map((e) => e.pokemonId)).size
  }, [pokedexEntries])

  const last30 = useMemo(() => buildLast30Days(dailySnapshots), [dailySnapshots])

  /* Backfill monotonically for visual continuity in AreaChart */
  const xpChartData = useMemo(
    () => buildXpTrendSeries(last30.slice(-14), totalXP),
    [last30, totalXP]
  )

  const elementChartData = useMemo(
    () =>
      Object.entries(ELEMENTS).map(([key, el]) => ({
        name: el.label,
        xp: xp[key] || 0,
        color: el.color,
      })),
    [xp]
  )

  const kpis = [
    { label: 'TRAINER LEVEL', value: `Lv.${trainerLevel}`, sub: `${totalXP.toLocaleString()} XP`, color: G3.accentBlue },
    { label: 'BEST HABIT STREAK', value: `${bestStreak}d 🔥`, sub: `${habits.length} active habits`, color: G3.accentRed },
    { label: 'QUESTS DONE', value: `${completedTasksCount}`, sub: `${completionRate}% completion rate`, color: G3.accentGreen },
    { label: 'GYM & POKéDEX', value: `${gymBadges.length}/8 🏅`, sub: `${uniquePokedexCount} species registered`, color: G3.accentGold },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header
          icon="📊"
          pillCount={3}
          rightSlot={
            !statsCloudSynced ? (
              <span className="pk-label" style={{ fontSize: '0.28rem', color: '#604010', background: '#F8E040', padding: '1px 4px', borderRadius: 3 }}>
                LOCAL
              </span>
            ) : null
          }
        >
          TRAINER ANALYTICS
        </G3Header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-3">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: 'white',
                border: `2px solid ${G3.borderTeal}`,
                borderRadius: 6,
                padding: '10px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: G3.vt, fontSize: '1.85rem', color: k.color, lineHeight: 1.1 }}>
                {k.value}
              </div>
              <div style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.textMuted, marginTop: 4 }}>
                {k.label}
              </div>
              <div style={{ fontFamily: G3.vt, fontSize: '0.88rem', color: G3.textMuted, marginTop: 2 }}>
                {k.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </G3Panel>

      {/* 30-Day Activity Heatmap */}
      <G3Panel variant="orange" style={{ flexShrink: 0 }}>
        <G3Header icon="🗓️">30-DAY ACTIVITY HEATMAP</G3Header>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gap: 4 }}>
            {last30.map((cell) => {
              const bg =
                cell.count === 0
                  ? '#EDE8D0'
                  : cell.count <= 2
                  ? '#86efac'
                  : cell.count <= 5
                  ? '#22c55e'
                  : '#15803d'
              return (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} activities`}
                  style={{
                    aspectRatio: '1 / 1',
                    background: bg,
                    border: '1px solid #C8C0B0',
                    borderRadius: 2,
                  }}
                />
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.textMuted }}>
              Past 30 calendar days
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted }}>Less</span>
              {['#EDE8D0', '#86efac', '#22c55e', '#15803d'].map((c) => (
                <div key={c} style={{ width: 10, height: 10, background: c, border: '1px solid #C8C0B0', borderRadius: 2 }} />
              ))}
              <span style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted }}>More</span>
            </div>
          </div>
        </div>
      </G3Panel>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 flex-shrink-0">
        <G3Panel variant="teal">
          <G3Header icon="📈">XP GROWTH (14 DAYS)</G3Header>
          <div style={{ height: 210, padding: '12px 8px 4px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D0B8" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: G3.textMuted }} />
                <YAxis tick={{ fontSize: 10, fill: G3.textMuted }} />
                <Tooltip />
                <Area type="monotone" dataKey="xp" stroke={G3.borderTeal} fill="#68B0B044" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </G3Panel>

        <G3Panel variant="orange">
          <G3Header icon="⚡">ELEMENT MASTERY</G3Header>
          <div style={{ height: 210, padding: '12px 8px 4px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elementChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D0B8" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: G3.textMuted }} />
                <YAxis tick={{ fontSize: 10, fill: G3.textMuted }} />
                <Tooltip />
                <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
                  {elementChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </G3Panel>
      </div>

      {/* Achievements Shelf (Phase 5.3) */}
      <G3Panel variant="teal" style={{ flexShrink: 0 }}>
        <G3Header icon="🏆">
          {`TRAINER ACHIEVEMENTS (${unlockedAchievements}/${achievementStatus.length})`}
        </G3Header>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3">
          {achievementStatus.map((ach) => (
            <div
              key={ach.key}
              style={{
                background: ach.unlocked ? 'white' : G3.creamDark,
                border: `2px solid ${ach.unlocked ? '#eab308' : '#C8C0B0'}`,
                borderRadius: 6,
                padding: '8px 10px',
                opacity: ach.unlocked ? 1 : 0.6,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.15rem', filter: ach.unlocked ? 'none' : 'grayscale(100%)' }}>{ach.emoji}</span>
                <span style={{ fontFamily: G3.px, fontSize: '0.3rem', color: ach.unlocked ? '#ca8a04' : G3.textMuted, lineHeight: 1.5 }}>
                  {ach.title}
                </span>
              </div>
              <p style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: G3.textMuted, lineHeight: 1.2 }}>
                {ach.description}
              </p>
            </div>
          ))}
        </div>
      </G3Panel>
    </div>
  )
}
