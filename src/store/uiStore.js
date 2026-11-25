/* UI & Notification Toast Slice */
import { generateLocalId } from '../constants/gameData'

export const createUiSlice = (set, get) => ({
  activeTab: 'journey',
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  toasts: [],

  setActiveTab: (tab) => set({ activeTab: tab }),

  setOffline: (isOffline) => set({ isOffline }),

  pushToast: (message, type = 'info', duration = 3500) => {
    const id = generateLocalId()
    set((s) => ({
      toasts: [...s.toasts.slice(-3), { id, message, type }],
    }))
    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(id)
      }, duration)
    }
    return id
  },

  dismissToast: (id) => {
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    }))
  },
})
