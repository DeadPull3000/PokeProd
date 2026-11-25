import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ELEMENTS, EVOLUTION_LINES } from '../constants/gameData'
import { useTasks, useProjects, useXp, useNuzlocke, useBattle, useCards, useUI } from '../store'
import RouteMap from './RouteMap'
import { ROUTE_PATH } from '../routeData'
import ProjectCard from './ProjectCard'
import { G3Header, SpriteImage } from './ui'
import { getOakAdvice } from '../utils/oakAdvisor'

/* ── XP Orb ── */
function XPOrb({ element, onComplete }) {
  const el = ELEMENTS[element] || ELEMENTS.fire
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -70, scale: 1.8 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      <div
        style={{
          background: el.color,
          color: 'white',
          border: `3px solid ${el.borderColor}`,
          boxShadow: `0 0 16px 6px ${el.glowColor}`,
          borderRadius: 5,
          padding: '3px 8px',
        }}
      >
        <span className="pk-label pk-white" style={{ fontSize: '0.48rem' }}>+XP!</span>
      </div>
    </motion.div>
  )
}

/* ── Element selector pill ── */
function ElementPill({ el, selected, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick(el.id)}
      style={{
        border: `2px solid ${selected ? el.borderColor : 'var(--g3-border-orange)'}`,
        background: selected ? el.bgHex : 'var(--g3-cream-light)',
        borderRadius: 4,
        padding: '3px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      <img src={el.itemSprite} alt={el.itemName} className="pixel-sprite" style={{ width: 14, height: 14 }} />
      <span className="pk-label" style={{ fontSize: '0.4rem', color: selected ? el.borderColor : 'var(--g3-text)' }}>
        {el.label}
      </span>
    </motion.button>
  )
}

/* ── Individual task row ── */
function TaskRow({ task }) {
  const { toggleTaskCompletion, deleteTask } = useTasks()
  const text = task.task_name || task.text || ''
  const element = task.element_type || task.element || 'fire'
  const isDone = task.is_completed || task.completed || false
  const el = ELEMENTS[element] || ELEMENTS.fire
  const [showOrb, setShowOrb] = useState(false)
  const [completing, setCompleting] = useState(false)

  const handleCheck = () => {
    if (completing || isDone) return
    setCompleting(true)
    setShowOrb(true)
    toggleTaskCompletion(task.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={
        isDone
          ? { opacity: 0.5, x: 10, filter: `drop-shadow(0 0 4px ${el.glowColor})` }
          : { opacity: 1, x: 0, filter: 'none' }
      }
      exit={{ opacity: 0, x: 30 }}
      transition={{ layout: { duration: 0.2 }, default: { duration: 0.25 } }}
      className="g3-task group relative"
      style={{ borderLeftColor: el.color }}
    >
      <img src={el.itemSprite} alt="" className="pixel-sprite flex-shrink-0" style={{ width: 18, height: 18 }} />

      <button
        type="button"
        aria-label={`Complete quest ${text}`}
        onClick={handleCheck}
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          border: `2px solid ${isDone ? el.color : 'var(--g3-text-muted)'}`,
          borderRadius: 2,
          background: isDone ? el.color : 'white',
          cursor: isDone ? 'default' : 'pointer',
          color: 'white',
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.45rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {isDone && '✓'}
      </button>

      <p
        className="pk-dialogue-text flex-1 min-w-0 truncate"
        style={{
          fontSize: '1.1rem',
          textDecoration: isDone ? 'line-through' : 'none',
          color: isDone ? '#A0988A' : 'var(--g3-text)',
        }}
      >
        {text}
      </p>

      <span
        className="pk-label flex-shrink-0"
        style={{
          fontSize: '0.38rem',
          padding: '1px 5px',
          border: `1px solid ${el.borderColor}`,
          borderRadius: 3,
          background: el.bgHex,
          color: el.borderColor,
        }}
      >
        {el.emoji} {el.label}
      </span>

      <button
        type="button"
        aria-label={`Delete quest ${text}`}
        onClick={() => deleteTask(task.id)}
        className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{
          width: 20,
          height: 20,
          border: '2px solid var(--g3-accent-red)',
          borderRadius: 2,
          background: '#FFF0F0',
          color: 'var(--g3-accent-red)',
          cursor: 'pointer',
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.42rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>

      <AnimatePresence>
        {showOrb && <XPOrb element={element} onComplete={() => setShowOrb(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Add task form ── */
function AddTaskForm() {
  const { addTask } = useTasks()
  const [text, setText] = useState('')
  const [element, setElement] = useState('fire')
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addTask(text.trim(), element)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div style={{ background: 'var(--g3-cream-light)', border: '1px solid #D8D0B8', borderRadius: 5 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px' }}>
          <span className="pk-label" style={{ flexShrink: 0, color: 'var(--g3-border-teal)' }}>▶</span>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What quest awaits today?"
            className="g3-input"
            style={{ fontSize: '1.1rem', padding: '4px 8px' }}
          />
          <button type="submit" disabled={!text.trim()} className="g3-btn g3-btn-sm flex-shrink-0">
            ADD
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '4px 8px 8px', borderTop: '1px solid #D8D0B8' }}>
                <div className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', marginBottom: 4 }}>
                  SELECT TYPE:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {Object.values(ELEMENTS).map((el) => (
                    <ElementPill key={el.id} el={el} selected={element === el.id} onClick={setElement} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}

/* ── Create Project Form ── */
function CreateProjectForm({ onClose }) {
  const { addProject } = useProjects()
  const [name, setName] = useState('')
  const [evoLineId, setEvoLineId] = useState(0)
  const [subTasks, setSubTasks] = useState(['', '', ''])

  const handleSubmit = () => {
    if (!name.trim()) return
    const filled = subTasks.filter((t) => t.trim())
    if (!filled.length) return
    addProject(name.trim(), evoLineId, subTasks)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="g3-panel-teal overflow-hidden"
    >
      <G3Header icon="✏️" pillCount={3}>NEW PROJECT</G3Header>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div className="pk-label" style={{ fontSize: '0.4rem', marginBottom: 4, color: 'var(--g3-text-muted)' }}>
            PROJECT NAME:
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name..."
            className="g3-input"
            style={{ fontSize: '1.1rem', padding: '4px 8px' }}
            autoFocus
          />
        </div>

        <div>
          <div className="pk-label" style={{ fontSize: '0.4rem', marginBottom: 4, color: 'var(--g3-text-muted)' }}>
            EVOLUTION LINE:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {EVOLUTION_LINES.map((line, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setEvoLineId(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: `2px solid ${evoLineId === i ? line.color : 'var(--g3-border-orange)'}`,
                  borderRadius: 5,
                  background: evoLineId === i ? `${line.color}18` : 'var(--g3-cream-light)',
                  padding: '4px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {evoLineId === i && (
                  <span className="pk-label" style={{ fontSize: '0.38rem', color: line.color }}>▶</span>
                )}
                <SpriteImage pokemonId={line.stages[0].id} alt={line.stages[0].name} size={28} />
                <span className="pk-label" style={{ fontSize: '0.38rem', color: line.color }}>
                  {line.stages[0].name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="pk-label" style={{ fontSize: '0.4rem', marginBottom: 4, color: 'var(--g3-text-muted)' }}>
            SUB-TASKS ({subTasks.filter((t) => t.trim()).length} added):
          </div>
          {subTasks.map((st, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <span className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)', width: 14, flexShrink: 0 }}>
                {i + 1}.
              </span>
              <input
                type="text"
                value={st}
                onChange={(e) => {
                  const next = [...subTasks]
                  next[i] = e.target.value
                  setSubTasks(next)
                }}
                placeholder={`Sub-task ${i + 1}...`}
                className="g3-input"
                style={{ fontSize: '1.05rem', padding: '3px 7px' }}
              />
            </div>
          ))}
          {subTasks.length < 5 && (
            <button
              type="button"
              onClick={() => setSubTasks((prev) => [...prev, ''])}
              className="g3-btn-cream pk-label"
              style={{
                fontSize: '0.38rem',
                padding: '3px 8px',
                border: '1px dashed var(--g3-border-orange)',
                borderRadius: 3,
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--g3-text-muted)',
                fontFamily: 'var(--font-pixel)',
              }}
            >
              + ADD SUB-TASK
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button className="g3-btn g3-btn-sm g3-btn-orange" onClick={onClose}>CANCEL</button>
          <button className="g3-btn g3-btn-sm" onClick={handleSubmit} disabled={!name.trim()}>
            CREATE ▶
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Route Map panel (right column) ── */
function RouteMapPanel({ completedToday }) {
  const steps = ROUTE_PATH.length
  const clampedCount = Math.min(completedToday, steps - 1)

  return (
    <div className="g3-panel-teal overflow-hidden" style={{ flexShrink: 0 }}>
      <G3Header icon="🗺️" pillCount={2}>ROUTE 1</G3Header>

      <div style={{ padding: '10px 8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <RouteMap completedCount={completedToday} />

        <div style={{ width: '100%', textAlign: 'center' }}>
          <div className="pk-label" style={{ fontSize: '0.38rem', color: 'var(--g3-text-muted)' }}>
            QUESTS TODAY:
          </div>
          <div className="pk-label pk-green" style={{ fontSize: '0.55rem', marginTop: 2 }}>
            {completedToday} / {steps - 1}
          </div>
          <div className="hp-bar-track" style={{ marginTop: 4, height: 6 }}>
            <motion.div
              className="hp-bar-fill hp-green"
              style={{ width: `${(clampedCount / (steps - 1)) * 100}%` }}
              animate={{ width: `${(clampedCount / (steps - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div
          style={{
            width: '100%',
            background: 'var(--g3-cream-light)',
            border: '1px solid #D8D0B8',
            borderRadius: 4,
            padding: '5px 8px',
            textAlign: 'center',
          }}
        >
          <p className="pk-dialogue-text" style={{ fontSize: '0.95rem', color: 'var(--g3-text-muted)', lineHeight: 1.35 }}>
            {completedToday === 0
              ? '✨ Complete a quest to start your journey!'
              : completedToday >= steps - 1
              ? '🏆 Pallet Town reached! Amazing work!'
              : `🌿 ${steps - 1 - completedToday} more quest${steps - 1 - completedToday !== 1 ? 's' : ''} to reach town!`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function JourneyTab() {
  const { tasks, tasksLoading, tasksError, fetchTasks } = useTasks()
  const { projects, projectsLoading, projectsCloudSynced, fetchProjects, completeSubTask, deleteProject } = useProjects()
  const { xp, completedToday } = useXp()
  const { party } = useNuzlocke()
  const { dailyBoss } = useBattle()
  const { cardPacks } = useCards()
  const { setActiveTab } = useUI()

  const oakTip = getOakAdvice({ tasks, xp, party, cardPacks, dailyBoss })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const activeTasks = tasks.filter((t) => !(t.is_completed || t.completed))

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [fetchTasks, fetchProjects])

  return (
    <div className="journey-layout">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minWidth: 0, paddingRight: 2 }}>
        <div className="g3-panel-teal overflow-hidden" style={{ flexShrink: 0 }}>
          <G3Header
            icon="⚔️"
            pillCount={3}
            rightSlot={
              <span className="pk-label pk-white" style={{ fontSize: '0.38rem', opacity: 0.8 }}>
                {activeTasks.length} remaining
              </span>
            }
          >
            QUICK QUESTS
          </G3Header>

          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <AddTaskForm />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <AnimatePresence mode="popLayout">
                {tasksLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: 'center', padding: '16px 0', color: 'var(--g3-text-muted)' }}
                  >
                    <span className="pk-label" style={{ fontSize: '0.5rem' }}>LOADING QUESTS...</span>
                  </motion.div>
                ) : tasksError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: '8px 10px', background: '#FFF0F0', border: '2px solid var(--g3-accent-red)', borderRadius: 4 }}
                  >
                    <p className="pk-dialogue-text" style={{ fontSize: '0.95rem', color: 'var(--g3-accent-red)' }}>
                      {tasksError}
                    </p>
                  </motion.div>
                ) : tasks.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      textAlign: 'center',
                      padding: '16px 0',
                      background: 'var(--g3-cream-light)',
                      border: '1px dashed #D8D0B8',
                      borderRadius: 5,
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>⭐</div>
                    <p className="pk-dialogue-text" style={{ fontSize: '1rem', color: 'var(--g3-text-muted)' }}>
                      All quests complete! Well done, Trainer!
                    </p>
                  </motion.div>
                ) : (
                  tasks.map((task) => <TaskRow key={task.id} task={task} />)
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="g3-panel overflow-hidden">
            <G3Header
              icon="🧬"
              pillCount={2}
              rightSlot={
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {!projectsCloudSynced && (
                    <span
                      title="Run supabase/migrations/001_v2_foundation_and_rls.sql to sync Projects to cloud"
                      className="pk-label"
                      style={{
                        fontSize: '0.3rem',
                        color: '#604010',
                        background: '#F8E040',
                        padding: '1px 4px',
                        borderRadius: 3,
                      }}
                    >
                      LOCAL
                    </span>
                  )}
                  <span className="pk-label pk-white" style={{ fontSize: '0.38rem', opacity: 0.75 }}>
                    {projects.length} active
                  </span>
                  <motion.button
                    onClick={() => setShowCreateForm((v) => !v)}
                    className="g3-btn g3-btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.38rem' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {showCreateForm ? '✕ CANCEL' : '+ NEW PROJECT'}
                  </motion.button>
                </div>
              }
            >
              PROJECTS
            </G3Header>
          </div>

          <AnimatePresence>
            {showCreateForm && <CreateProjectForm onClose={() => setShowCreateForm(false)} />}
          </AnimatePresence>

          {projectsLoading ? (
            <div style={{ textAlign: 'center', padding: '14px 0', color: 'var(--g3-text-muted)' }}>
              <span className="pk-label" style={{ fontSize: '0.42rem' }}>LOADING PROJECTS...</span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {projects.length === 0 && !showCreateForm ? (
                <motion.div
                  key="no-projects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    textAlign: 'center',
                    padding: '14px 0',
                    background: 'var(--g3-cream)',
                    border: '1px dashed var(--g3-border-orange)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🥚</div>
                  <p className="pk-dialogue-text" style={{ fontSize: '1rem', color: 'var(--g3-text-muted)' }}>
                    Create a project to start evolving!
                  </p>
                </motion.div>
              ) : (
                projects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    onCompleteSubTask={completeSubTask}
                    onDeleteProject={() => deleteProject(proj.id)}
                  />
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="journey-route-col">
        <RouteMapPanel completedToday={completedToday} />

        {/* Professor Oak's Smart Advisor Tip (Phase 5.5) */}
        <div className="g3-panel overflow-hidden" style={{ flexShrink: 0 }}>
          <G3Header icon="👨‍🔬" pillCount={2}>{oakTip.badge}</G3Header>
          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p className="pk-dialogue-text" style={{ fontSize: '0.96rem', color: 'var(--g3-text)', lineHeight: 1.35 }}>
              {oakTip.message}
            </p>
            {oakTip.actionTab && (
              <button
                onClick={() => setActiveTab(oakTip.actionTab)}
                className="g3-btn g3-btn-sm self-end"
                style={{ fontSize: '0.32rem' }}
              >
                {oakTip.actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
