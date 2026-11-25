/* Web Notification & Deadline Reminder Helper (Phase 4.2) */

const NOTIFIED_STORAGE = 'pokeprod_notified_alerts_v1'

function loadNotifiedSet() {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveNotifiedSet(set) {
  try {
    localStorage.setItem(NOTIFIED_STORAGE, JSON.stringify(Array.from(set).slice(-50)))
  } catch {
    /* ignore quota */
  }
}

export function canSendBrowserNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export function sendPokeNotification(title, body) {
  if (!canSendBrowserNotifications()) return false
  try {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
    })
    return true
  } catch {
    return false
  }
}

/**
 * Evaluates urgent Nuzlocke deadlines (< 4h) and uncompleted daily habits,
 * returning alert keys/messages and optionally firing browser notifications.
 */
export function checkAndDispatchReminders({ party = [], habits = [], notificationsEnabled = false }) {
  if (!notificationsEnabled || !canSendBrowserNotifications()) return []

  const notified = loadNotifiedSet()
  const triggered = []
  const now = Date.now()
  const fourHoursMs = 4 * 60 * 60 * 1000

  for (const member of party) {
    if (member.status !== 'active' || !member.deadline) continue
    const remaining = new Date(member.deadline).getTime() - now
    if (remaining > 0 && remaining <= fourHoursMs) {
      const key = `nuzlocke_${member.id}`
      if (!notified.has(key)) {
        const hrsLeft = Math.max(1, Math.ceil(remaining / 3_600_000))
        sendPokeNotification(
          '⚠️ Nuzlocke Deadline Alert!',
          `${member.taskName} has ~${hrsLeft}h left before your Pokémon faints!`
        )
        notified.add(key)
        triggered.push(key)
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const pendingHabits = habits.filter(
    (h) => !h.lastCompleted || h.lastCompleted.slice(0, 10) !== today
  )
  if (pendingHabits.length > 0 && new Date().getHours() >= 18) {
    const habitKey = `habits_${today}`
    if (!notified.has(habitKey)) {
      sendPokeNotification(
        '🔥 Daily Habit Streak Check-In',
        `You still have ${pendingHabits.length} daily habit(s) waiting today!`
      )
      notified.add(habitKey)
      triggered.push(habitKey)
    }
  }

  if (triggered.length > 0) saveNotifiedSet(notified)
  return triggered
}
