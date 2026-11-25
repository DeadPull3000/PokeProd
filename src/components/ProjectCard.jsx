import { Fragment, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EVOLUTION_LINES } from '../constants/gameData'
import { G3Header, SpriteImage } from './ui'

function StageDots({ total, current, color }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i <= current ? color : '#D8D0B8',
            border: `1px solid ${i <= current ? color : '#C0B8A8'}`,
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  )
}

function StageStrip({ line, currentStage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4, gap: 2 }}>
      {line.stages.map((s, i) => (
        <Fragment key={i}>
          <div
            style={{
              width: 26,
              height: 26,
              border: `2px solid ${i <= currentStage ? line.color : '#D0C8B8'}`,
              borderRadius: 3,
              background: i <= currentStage ? `${line.color}22` : '#F0EDE0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'border-color 0.3s, background 0.3s',
            }}
          >
            <SpriteImage
              pokemonId={s.id}
              alt={s.name}
              size={22}
              style={{ width: 22, opacity: i <= currentStage ? 1 : 0.35 }}
            />
          </div>
          {i < line.stages.length - 1 && (
            <span
              style={{
                fontSize: '0.42rem',
                fontFamily: 'monospace',
                color: i < currentStage ? line.color : '#B0A898',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ›
            </span>
          )}
        </Fragment>
      ))}
    </div>
  )
}

function SubTask({ st, onComplete }) {
  return (
    <motion.div
      layout
      className="g3-subtask"
      onClick={() => !st.completed && onComplete()}
      style={{ cursor: st.completed ? 'default' : 'pointer' }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          flexShrink: 0,
          border: `2px solid ${st.completed ? '#389848' : '#A0988A'}`,
          borderRadius: 2,
          background: st.completed ? '#389848' : 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        {st.completed && <span style={{ color: 'white', fontSize: 9, lineHeight: 1, fontWeight: 'bold' }}>✓</span>}
      </div>
      <span
        className="pk-dialogue-text"
        style={{
          fontSize: '1.05rem',
          textDecoration: st.completed ? 'line-through' : 'none',
          color: st.completed ? '#A0988A' : 'var(--g3-text)',
          transition: 'color 0.2s',
          flex: 1,
          minWidth: 0,
        }}
      >
        {st.text}
      </span>
    </motion.div>
  )
}

export default function ProjectCard({ project, onCompleteSubTask, onDeleteProject }) {
  const line = EVOLUTION_LINES[project.evoLineId] || EVOLUTION_LINES[0]
  const [isEvolving, setIsEvolving] = useState(false)
  const [evolvedStage, setEvolvedStage] = useState(project.currentStage)
  const prevStageRef = useRef(project.currentStage)

  useEffect(() => {
    if (project.currentStage > prevStageRef.current) {
      prevStageRef.current = project.currentStage
      const startTimer = setTimeout(() => setIsEvolving(true), 0)
      const endTimer = setTimeout(() => {
        setEvolvedStage(project.currentStage)
        setIsEvolving(false)
      }, 1600)
      return () => {
        clearTimeout(startTimer)
        clearTimeout(endTimer)
      }
    }
    prevStageRef.current = project.currentStage
  }, [project.currentStage])

  const displayedStage = isEvolving ? Math.max(0, project.currentStage - 1) : Math.max(evolvedStage, project.currentStage)
  const currentDisplayStage = line.stages[displayedStage] || line.stages[0]
  const completedCount = project.subTasks.filter((t) => t.completed).length
  const totalCount = project.subTasks.length
  const pct = totalCount > 0 ? completedCount / totalCount : 0
  const barColor = pct >= 1 ? '#389848' : pct > 0.5 ? '#78C858' : '#F8C800'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="g3-panel-teal overflow-hidden"
    >
      <G3Header
        icon="📋"
        pillCount={2}
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pk-label pk-white" style={{ fontSize: '0.42rem', opacity: 0.85 }}>
              ST.{displayedStage + 1}/3
            </span>
            <button
              onClick={onDeleteProject}
              aria-label={`Delete project ${project.name}`}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 3,
                color: 'white',
                width: 16,
                height: 16,
                cursor: 'pointer',
                fontSize: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-pixel)',
              }}
            >
              ✕
            </button>
          </div>
        }
      >
        {project.name.toUpperCase()}
      </G3Header>

      <div style={{ display: 'flex', gap: 0 }}>
        <div
          style={{
            width: 100,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${line.color}18 0%, ${line.color}08 100%)`,
            borderRight: '1px solid #D8D0B8',
            padding: '8px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div style={{ position: 'relative', height: 72, width: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isEvolving && (
              <div
                className="evo-flash"
                style={{
                  position: 'absolute',
                  inset: -8,
                  background: 'white',
                  zIndex: 10,
                  borderRadius: 4,
                  pointerEvents: 'none',
                }}
              />
            )}
            <motion.div
              key={displayedStage}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SpriteImage pokemonId={currentDisplayStage.id} alt={currentDisplayStage.name} size={64} enableCry />
            </motion.div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="pk-label" style={{ fontSize: '0.38rem', color: line.color, lineHeight: 1.4 }}>
              {currentDisplayStage.name}
            </div>
            <div className="pk-label-sm" style={{ color: 'var(--g3-text-muted)', fontSize: '0.33rem' }}>
              {currentDisplayStage.label}
            </div>
          </div>

          <StageDots total={3} current={displayedStage} color={line.color} />
          <StageStrip line={line} currentStage={displayedStage} />
        </div>

        <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
          {project.subTasks.map((st) => (
            <SubTask key={st.id} st={st} onComplete={() => onCompleteSubTask(project.id, st.id)} />
          ))}

          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span className="pk-label-sm" style={{ color: 'var(--g3-text-muted)', fontSize: '0.36rem' }}>
                {pct >= 1 ? '✅ PROJECT COMPLETE!' : pct > 0.33 ? '⚡ EVOLVING...' : '🌱 STARTED'}
              </span>
              <span className="pk-label-sm" style={{ fontSize: '0.36rem' }}>
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="hp-bar-track" style={{ height: 7 }}>
              <motion.div
                className="hp-bar-fill"
                style={{ background: barColor, width: `${pct * 100}%` }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
