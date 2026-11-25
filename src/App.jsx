import { lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import Background from './components/Background'
import AudioController from './components/AudioController'
import Sidebar, { MobileBottomNav, MobileTrainerHeader } from './components/Sidebar'
import JourneyTab from './components/JourneyTab'
import Auth from './components/Auth'
import { ErrorBoundary, ToastContainer } from './components/ui'
import { useAuth, useSettings, useUI, useXp, ELEMENTS } from './store'
import { supabase } from './lib/supabase'
import { animSprite } from './constants/gameData'

/* Code-split heavy tabs so initial bundle stays compact (Phase 4.4) */
const SafariZone = lazy(() => import('./components/SafariZone'))
const NuzlockeParty = lazy(() => import('./components/NuzlockeParty'))
const SecretBase = lazy(() => import('./components/SecretBase'))
const DailyHabits = lazy(() => import('./components/DailyHabits'))
const RaidHub = lazy(() => import('./components/RaidHub'))
const SettingsTab = lazy(() => import('./components/Settings'))
const BattleTab = lazy(() => import('./components/BattleTab'))
const PokedexTab = lazy(() => import('./components/PokedexTab'))
const StatsTab = lazy(() => import('./components/StatsTab'))

function TabFallback() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <img src={animSprite(175)} alt="Loading tab" style={{ width: 48, height: 48, imageRendering: 'pixelated' }} />
      <span className="pk-label" style={{ fontSize: '0.45rem', color: 'var(--g3-text-muted)' }}>
        LOADING AREA...
      </span>
    </div>
  )
}

function MainContent({ activeTab }) {
  const tabMap = {
    journey: <JourneyTab />,
    safari: <SafariZone />,
    nuzlocke: <NuzlockeParty />,
    secretbase: <SecretBase />,
    dailyhabits: <DailyHabits />,
    raidhub: <RaidHub />,
    battle: <BattleTab />,
    pokedex: <PokedexTab />,
    stats: <StatsTab />,
    settings: <SettingsTab />,
  }
  return (
    <ErrorBoundary key={activeTab}>
      <Suspense fallback={<TabFallback />}>
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
      </Suspense>
    </ErrorBoundary>
  )
}

function LoadingSplash() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 20, 30, 0.75)',
        backdropFilter: 'blur(4px)',
        gap: 14,
      }}
    >
      <motion.img
        src={animSprite(175)}
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
  const { activeTab, setOffline, pushToast } = useUI()
  const { xp } = useXp()
  const { backgroundCycle } = useSettings()
  const { authLoading, user, checkSession, setSession, signOut } = useAuth()

  const isSafari = activeTab === 'safari'
  const forcedScene = backgroundCycle !== 'Auto' ? backgroundCycle : null

  useEffect(() => {
    checkSession()

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    const handleOnline = () => {
      setOffline(false)
      pushToast('Connection restored!', 'success', 2500)
    }
    const handleOffline = () => {
      setOffline(true)
      pushToast('You are offline — changes may not sync.', 'warning', 4000)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      if (listener?.data?.subscription) {
        listener.data.subscription.unsubscribe()
      }
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkSession, setSession, setOffline, pushToast])

  return (
    <div className="w-screen h-screen overflow-hidden">
      <AudioController />
      <ToastContainer />
      <Background forcedScene={forcedScene}>
        {authLoading && <LoadingSplash />}

        {!authLoading && !user && <Auth onSession={setSession} />}

        {!authLoading && user && (
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-3.5">
            <div className="app-shell">
              <MobileTrainerHeader xpData={xp} elements={ELEMENTS} onSignOut={signOut} />

              <div className="desktop-only-sidebar" style={{ height: '100%', flexShrink: 0 }}>
                <Sidebar xpData={xp} elements={ELEMENTS} onSignOut={signOut} />
              </div>

              <div
                className={isSafari ? '' : 'g3-panel'}
                style={{
                  flex: 1,
                  minHeight: 0,
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 8,
                  padding: isSafari ? 0 : '12px',
                  background: isSafari ? 'transparent' : '#F8F8ED',
                  color: '#383028',
                }}
              >
                <MainContent activeTab={activeTab} />
              </div>

              <MobileBottomNav />
            </div>
          </div>
        )}
      </Background>
    </div>
  )
}
