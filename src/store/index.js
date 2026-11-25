/* Composed Zustand Store + Shallow Domain Selectors */
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { createUiSlice } from './uiStore'
import { createAuthSlice } from './authStore'
import { createXpSlice } from './xpStore'
import { createSettingsSlice } from './settingsStore'
import { createTasksSlice } from './tasksStore'
import { createProjectsSlice } from './projectsStore'
import { createNuzlockeSlice } from './nuzlockeStore'
import { createSecretBaseSlice } from './secretBaseStore'
import { createHabitsSlice } from './habitsStore'
import { createRaidSlice } from './raidStore'

export { ELEMENTS, EVOLUTION_LINES, STARTERS, BG_CYCLES, BG_META } from '../constants/gameData'

export const useStore = create((set, get) => ({
  ...createUiSlice(set, get),
  ...createAuthSlice(set, get),
  ...createXpSlice(set, get),
  ...createSettingsSlice(set, get),
  ...createTasksSlice(set, get),
  ...createProjectsSlice(set, get),
  ...createNuzlockeSlice(set, get),
  ...createSecretBaseSlice(set, get),
  ...createHabitsSlice(set, get),
  ...createRaidSlice(set, get),
}))

/* Shallow domain hooks — prevent unrelated re-renders across tabs */
export const useUI = () =>
  useStore(
    useShallow((s) => ({
      activeTab: s.activeTab,
      setActiveTab: s.setActiveTab,
      isOffline: s.isOffline,
      setOffline: s.setOffline,
      toasts: s.toasts,
      pushToast: s.pushToast,
      dismissToast: s.dismissToast,
    }))
  )

export const useAuth = () =>
  useStore(
    useShallow((s) => ({
      session: s.session,
      user: s.user,
      authLoading: s.authLoading,
      checkSession: s.checkSession,
      setSession: s.setSession,
      signOut: s.signOut,
    }))
  )

export const useXp = () =>
  useStore(
    useShallow((s) => ({
      xp: s.xp,
      totalXP: s.totalXP,
      trainerLevel: s.trainerLevel,
      completedToday: s.completedToday,
      fetchProfile: s.fetchProfile,
      addXp: s.addXp,
      gainXP: s.gainXP,
      incrementCompletedToday: s.incrementCompletedToday,
    }))
  )

export const useSettings = () =>
  useStore(
    useShallow((s) => ({
      trainerName: s.trainerName,
      starterPokemon: s.starterPokemon,
      soundEffects: s.soundEffects,
      music: s.music,
      backgroundCycle: s.backgroundCycle,
      setTrainerName: s.setTrainerName,
      persistTrainerProfile: s.persistTrainerProfile,
      updateSettings: s.updateSettings,
    }))
  )

export const useTasks = () =>
  useStore(
    useShallow((s) => ({
      tasks: s.tasks,
      tasksLoading: s.tasksLoading,
      tasksError: s.tasksError,
      fetchTasks: s.fetchTasks,
      addTask: s.addTask,
      toggleTaskCompletion: s.toggleTaskCompletion,
      deleteTask: s.deleteTask,
    }))
  )

export const useProjects = () =>
  useStore(
    useShallow((s) => ({
      projects: s.projects,
      projectsLoading: s.projectsLoading,
      projectsError: s.projectsError,
      projectsCloudSynced: s.projectsCloudSynced,
      fetchProjects: s.fetchProjects,
      addProject: s.addProject,
      completeSubTask: s.completeSubTask,
      deleteProject: s.deleteProject,
    }))
  )

export const useNuzlocke = () =>
  useStore(
    useShallow((s) => ({
      party: s.party,
      daycare: s.daycare,
      nuzlockeLoading: s.nuzlockeLoading,
      fetchNuzlocke: s.fetchNuzlocke,
      addNuzlockeTask: s.addNuzlockeTask,
      updateNuzlockeStatus: s.updateNuzlockeStatus,
      deleteNuzlockeItem: s.deleteNuzlockeItem,
      checkFaintedTasks: s.checkFaintedTasks,
    }))
  )

export const useSecretBase = () =>
  useStore(
    useShallow((s) => ({
      completedTasks: s.completedTasks,
      inventory: s.inventory,
      placedItems: s.placedItems,
      selectedInventoryItem: s.selectedInventoryItem,
      secretBaseLoading: s.secretBaseLoading,
      fetchSecretBase: s.fetchSecretBase,
      addSecretBaseItem: s.addSecretBaseItem,
      updateItemPlacement: s.updateItemPlacement,
      claimReward: s.claimReward,
      addCompletedTask: s.addCompletedTask,
      selectInventoryItem: s.selectInventoryItem,
      placeItem: s.placeItem,
      pickupItem: s.pickupItem,
    }))
  )

export const useHabits = () =>
  useStore(
    useShallow((s) => ({
      habits: s.habits,
      habitsLoading: s.habitsLoading,
      weather: s.weather,
      caughtShinies: s.caughtShinies,
      _shinyEncounter: s._shinyEncounter,
      setWeather: s.setWeather,
      fetchHabits: s.fetchHabits,
      addHabitToDb: s.addHabitToDb,
      deleteHabitFromDb: s.deleteHabitFromDb,
      updateHabitStreak: s.updateHabitStreak,
      completeHabit: s.completeHabit,
      clearShinyEncounter: s.clearShinyEncounter,
    }))
  )
