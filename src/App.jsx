import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import Background from './components/Background'
import AudioController from './components/AudioController'
import Sidebar from './components/Sidebar'
import JourneyTab from './components/JourneyTab'
import SafariZone from './components/SafariZone'
import NuzlockeParty from './components/NuzlockeParty'
import SecretBase from './components/SecretBase'
import DailyHabits from './components/DailyHabits'
import RaidHub from './components/RaidHub'
import SettingsTab from './components/Settings'
import Auth from './components/Auth'
import { BattleTab, StatsTab } from './components/PlaceholderTabs'
import { useStore, ELEMENTS } from './store'
import { supabase } from './lib/supabase'

/* ── Tab content switcher ── */
function MainContent({ activeTab }) {
  const tabMap = {
    journey:     <JourneyTab />,
    safari:      <SafariZone />,
    nuzlocke:    <NuzlockeParty />,
    secretbase:  <SecretBase />,
    dailyhabits: <DailyHabits />,
    raidhub:     <RaidHub />,
    battle:      <BattleTab />,
    stats:       <StatsTab />,
    settings:    <SettingsTab />,
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        className="h-full"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
      >
        {tabMap[activeTab] || <JourneyTab />}
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Pixel-art loading splash ── */
function LoadingSplash() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10, 20, 30, 0.75)',
      backdropFilter: 'blur(4px)',
      gap: 14,
    }}>
      <motion.img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/175.gif"
        alt="Loading..."
        style={{ width: 64, height: 64, imageRendering: 'pixelated' }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="pk-label pk-white" style={{ fontSize: '0.5rem', letterSpacing: 2 }}>
        LOADING...
      </span>
    </div>
  )
}

export default function App() {
  const { activeTab, xp, backgroundCycle, authLoading, user, checkSession, setSession, signOut } = useStore()
  const isSafari = activeTab === 'safari'

  /* Pass forced scene to Background only when not 'Auto' */
  const forcedScene = backgroundCycle !== 'Auto' ? backgroundCycle : null

  /* Bootstrap session on mount + subscribe to auth state changes */
  useEffect(function() {
    checkSession()

    var listener = supabase.auth.onAuthStateChange(function(event, session) {
      setSession(session)
    })

    return function() {
      if (listener && listener.data && listener.data.subscription) {
        listener.data.subscription.unsubscribe()
      }
    }
  }, [])

  return (
    <div className="w-screen h-screen overflow-hidden">
      {/* AudioController lives outside Background so it never unmounts on tab change */}
      <AudioController />
      <Background forcedScene={forcedScene}>

        {/* ── Loading splash while session is being resolved ── */}
        {authLoading && <LoadingSplash />}

        {/* ── Auth screen (no user) ── */}
        {!authLoading && !user && (
          <Auth onSession={setSession} />
        )}

        {/* ── Main dashboard (authenticated) ── */}
        {!authLoading && user && (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ padding: '16px 14px' }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 1100,
                height: '100%',
                maxHeight: 830,
                display: 'flex',
                gap: 12,
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 14,
                padding: '14px',
                backdropFilter: 'blur(1px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Sidebar */}
              <div style={{ height: '100%', flexShrink: 0 }}>
                <Sidebar xpData={xp} elements={ELEMENTS} onSignOut={signOut} />
              </div>

              {/* Main content */}
              <div
                className={isSafari ? '' : 'g3-panel'}
                style={{
                  flex: 1,
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 8,
                  padding: isSafari ? 0 : '14px',
                  /* Force crisp cream, strip any browser dark-mode influence */
                  background: isSafari ? 'transparent' : '#F8F8ED',
                  color: '#383028',
                }}
              >
                <MainContent activeTab={activeTab} />
              </div>
            </div>
          </div>
        )}
      </Background>
    </div>
  )
}
