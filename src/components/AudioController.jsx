import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

const TRACKS = {
  journey:     'https://vgmsite.com/soundtracks/pokemon-heartgold-and-soulsilver-soundtrack/exhsvbsz/1-25%20Route%2029.mp3',
  safari:      'https://vgmsite.com/soundtracks/pokemon-heartgold-and-soulsilver-soundtrack/eonohokg/2-38%20National%20Park.mp3',
  raidhub:     'https://vgmsite.com/soundtracks/pokemon-heartgold-and-soulsilver-soundtrack/xojebjeb/1-26%20Battle%21%20%28Wild%20Pok%C3%A9mon%E2%80%94Johto%20Version%29.mp3',
  dailyhabits: 'https://vgmsite.com/soundtracks/pokemon-heartgold-and-soulsilver-soundtrack/szjswuuy/1-29%20Goldenrod%20City.mp3',
  _default:    'https://vgmsite.com/soundtracks/pokemon-heartgold-and-soulsilver-soundtrack/abomxowv/1-15%20Pok%C3%A9mon%20Center.mp3',
}

const TRACK_NAMES = {
  journey:     'Route 29',
  safari:      'National Park',
  raidhub:     'Wild Battle! (Johto)',
  dailyhabits: 'Goldenrod City',
  _default:    'Pokémon Center',
}

const BGM_VOLUME = 0.15
const FADE_STEPS = 20
const FADE_MS    = 600

function getTrackUrl(tab) {
  return TRACKS[tab] || TRACKS._default
}

function getTrackName(tab) {
  return TRACK_NAMES[tab] || TRACK_NAMES._default
}

export default function AudioController() {
  const music     = useStore((s) => s.music)
  const activeTab = useStore((s) => s.activeTab)

  const audioRef   = useRef(null)
  const fadeRef    = useRef(null)
  const activeTabRef = useRef(activeTab)

  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  const [blocked, setBlocked]       = useState(false)
  const [nowPlaying, setNowPlaying] = useState(null)

  useEffect(() => {
    const a = new Audio()
    a.loop = true
    a.volume = 0
    a.preload = 'auto'
    audioRef.current = a

    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current)
      a.pause()
      a.src = ''
    }
  }, [])

  function fadeTo(targetVol, onDone) {
    const audio = audioRef.current
    if (!audio) return
    if (fadeRef.current) clearInterval(fadeRef.current)

    const startVol = audio.volume
    const step = (targetVol - startVol) / FADE_STEPS
    let count = 0
    fadeRef.current = setInterval(() => {
      count++
      const next = startVol + step * count
      audio.volume = Math.max(0, Math.min(BGM_VOLUME, next))
      if (count >= FADE_STEPS) {
        clearInterval(fadeRef.current)
        audio.volume = targetVol
        if (onDone) onDone()
      }
    }, FADE_MS / FADE_STEPS)
  }

  /* React to music toggle */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!music) {
      fadeTo(0, () => {
        audio.pause()
        setBlocked(false)
        setNowPlaying(null)
      })
      return
    }

    const tab = activeTabRef.current
    const url = getTrackUrl(tab)
    if (audio.src !== url) {
      audio.pause()
      audio.src = url
      audio.volume = 0
      audio.load()
    }

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setBlocked(false)
          setNowPlaying(getTrackName(tab))
          fadeTo(BGM_VOLUME)
        })
        .catch(() => {
          setBlocked(true)
        })
    }
  }, [music])

  /* React to tab changes (crossfade) */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !music) return
    if (audio.paused) return

    const url = getTrackUrl(activeTab)
    if (audio.src === url) return

    fadeTo(0, () => {
      audio.pause()
      audio.src = url
      audio.volume = 0
      audio.load()
      const p = audio.play()
      if (p !== undefined) {
        p.then(() => {
          setNowPlaying(getTrackName(activeTab))
          fadeTo(BGM_VOLUME)
        }).catch(() => {
          setBlocked(true)
        })
      }
    })
  }, [activeTab, music])

  function handleUnlock() {
    const audio = audioRef.current
    if (!audio) return

    audio.src = getTrackUrl(activeTab)
    audio.volume = 0
    audio.loop = true
    audio.load()

    audio.play()
      .then(() => {
        setBlocked(false)
        setNowPlaying(getTrackName(activeTab))
        fadeTo(BGM_VOLUME)
      })
      .catch(() => {})
  }

  if (!music) return null

  return (
    <>
      <AnimatePresence>
        {music && blocked && (
          <motion.div
            key="unlock-btn"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{ position: 'fixed', bottom: 72, right: 20, zIndex: 9999 }}
          >
            <motion.button
              onClick={handleUnlock}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              animate={{
                boxShadow: [
                  '0 0 12px 3px rgba(104,176,176,0.4)',
                  '0 0 22px 7px rgba(104,176,176,0.7)',
                  '0 0 12px 3px rgba(104,176,176,0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'linear-gradient(135deg, #68B0B0, #408090)',
                border: '3px solid #305070',
                borderRadius: 10,
                padding: '9px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '3px 3px 0 #305070',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🎵</span>
              <div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.38rem', color: 'white', letterSpacing: '-0.2px', lineHeight: 1.8, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                  PLAY MUSIC
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: -2 }}>
                  Click to unlock audio
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {music && nowPlaying && !blocked && (
          <motion.div
            key={'np-' + nowPlaying}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35 }}
            className="hidden md:flex"
            style={{
              position: 'fixed',
              bottom: 20,
              left: 20,
              zIndex: 9999,
              background: 'rgba(248,248,237,0.92)',
              border: '2px solid #68A0B0',
              borderRadius: 8,
              padding: '5px 10px',
              alignItems: 'center',
              gap: 7,
              boxShadow: '2px 2px 0 rgba(80,140,160,0.35)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.span
              animate={{ y: [0, -3, 0], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '1rem' }}
            >
              🎵
            </motion.span>
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.3rem', color: '#68A0B0', letterSpacing: '-0.1px', lineHeight: 1.8 }}>
                NOW PLAYING
              </div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: '1rem', color: '#383028', lineHeight: 1.2 }}>
                {nowPlaying}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
