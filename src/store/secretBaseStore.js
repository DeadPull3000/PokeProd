/* Secret Base Inventory & 8x8 Grid Slice — Supabase Backed */
import { supabase } from '../lib/supabase'
import { VALID_SECRET_BASE_SPRITES, generateLocalId } from '../constants/gameData'

const DEFAULT_COMPLETED_TASKS = [
  { id: 'sb-1', taskName: 'Beat the Elite Four', rewardItemSprite: 'master-ball', isClaimed: false },
  { id: 'sb-2', taskName: 'Finish 30-day journal streak', rewardItemSprite: 'nugget', isClaimed: false },
  { id: 'sb-3', taskName: 'Complete first workout week', rewardItemSprite: 'poke-doll', isClaimed: true },
  { id: 'sb-4', taskName: 'Read 12 books this year', rewardItemSprite: 'rare-bone', isClaimed: false },
  { id: 'sb-5', taskName: 'Learn a new recipe', rewardItemSprite: 'big-mushroom', isClaimed: false },
]

export const createSecretBaseSlice = (set, get) => ({
  completedTasks: DEFAULT_COMPLETED_TASKS,
  inventory: [],
  placedItems: [],
  selectedInventoryItem: null,
  secretBaseLoading: false,

  fetchSecretBase: async () => {
    const state = get()
    if (!state.session) return
    set({ secretBaseLoading: true })

    const result = await supabase
      .from('secret_base_items')
      .select('*')
      .eq('user_id', state.session.user.id)
      .order('created_at', { ascending: true })

    if (!result.error) {
      const rows = result.data || []
      const inventory = rows
        .filter((r) => !r.is_placed)
        .map((r) => ({ id: r.id, spriteName: r.sprite_name }))
      const placedItems = rows
        .filter((r) => r.is_placed)
        .map((r) => ({
          id: r.id,
          spriteName: r.sprite_name,
          gridX: r.grid_x,
          gridY: r.grid_y,
        }))
      set({ inventory, placedItems, secretBaseLoading: false })
    } else {
      set({ secretBaseLoading: false })
      state.pushToast?.(`Failed to load Secret Base: ${result.error.message}`, 'error')
    }
  },

  addSecretBaseItem: async (spriteName) => {
    const state = get()
    if (!state.session) return
    const { error } = await supabase.from('secret_base_items').insert([{
      user_id: state.session.user.id,
      sprite_name: spriteName,
      is_placed: false,
      grid_x: null,
      grid_y: null,
    }])

    if (error) {
      state.pushToast?.(`Failed to claim item: ${error.message}`, 'error')
      return
    }
    state.pushToast?.('Reward added to Secret Base inventory!', 'success', 2200)
    await get().fetchSecretBase()
  },

  updateItemPlacement: async (id, gridX, gridY, isPlaced) => {
    const state = get()
    const { error } = await supabase
      .from('secret_base_items')
      .update({
        is_placed: isPlaced,
        grid_x: isPlaced ? gridX : null,
        grid_y: isPlaced ? gridY : null,
      })
      .eq('id', id)

    if (error) {
      state.pushToast?.(`Failed to update item placement: ${error.message}`, 'error')
      return
    }
    await get().fetchSecretBase()
  },

  claimReward: (taskId) => {
    const state = get()
    const task = state.completedTasks.find((t) => t.id === taskId)
    if (!task || task.isClaimed) return
    set({
      completedTasks: state.completedTasks.map((t) =>
        t.id === taskId ? { ...t, isClaimed: true } : t
      ),
    })
    state.addSecretBaseItem(task.rewardItemSprite)
  },

  addCompletedTask: (taskName, rewardItemSprite) => {
    const sprite = VALID_SECRET_BASE_SPRITES.includes(rewardItemSprite)
      ? rewardItemSprite
      : 'nugget'
    set((state) => ({
      completedTasks: [
        ...state.completedTasks,
        { id: generateLocalId(), taskName, rewardItemSprite: sprite, isClaimed: false },
      ],
    }))
  },

  selectInventoryItem: (itemId) => set({ selectedInventoryItem: itemId }),

  placeItem: (itemId, gridX, gridY) => {
    const state = get()
    const occupied = state.placedItems.some((p) => p.gridX === gridX && p.gridY === gridY)
    if (occupied) return
    state.updateItemPlacement(itemId, gridX, gridY, true)
    set({ selectedInventoryItem: null })
  },

  pickupItem: (placedId) => {
    get().updateItemPlacement(placedId, null, null, false)
  },
})
