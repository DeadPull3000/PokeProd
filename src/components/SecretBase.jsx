import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSecretBase } from '../store'
import { ITEM_LABELS, VALID_SECRET_BASE_SPRITES, itemUrl } from '../constants/gameData'
import { G3, G3Header, G3Panel } from './ui'

const GRID_SIZE = 8
const CELLS = Array.from({ length: GRID_SIZE }, (_, row) =>
  Array.from({ length: GRID_SIZE }, (_, col) => ({ row, col }))
).flat()

function CompletedTaskRow({ task, onClaim }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: task.isClaimed ? 'rgba(104,176,176,0.06)' : 'white',
        border: '1px solid',
        borderColor: task.isClaimed ? '#A8C8D0' : '#D8D0B8',
        borderLeft: '3px solid ' + (task.isClaimed ? G3.borderTeal : G3.borderOrange),
        borderRadius: 4,
        padding: '7px 10px',
        transition: 'background 0.2s',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: task.isClaimed ? 'rgba(104,176,176,0.12)' : '#F0EDD8',
          border: '2px solid ' + (task.isClaimed ? '#A8C8D0' : '#D8D0B8'),
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img
          src={itemUrl(task.rewardItemSprite)}
          alt={ITEM_LABELS[task.rewardItemSprite] || task.rewardItemSprite}
          style={{ width: 24, height: 24, imageRendering: 'pixelated' }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: G3.vt,
            fontSize: '1.05rem',
            color: task.isClaimed ? G3.textMuted : G3.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          {task.taskName}
        </p>
        <p
          style={{
            fontFamily: G3.px,
            fontSize: '0.32rem',
            color: task.isClaimed ? G3.borderTeal : G3.borderOrange,
            letterSpacing: '-0.1px',
            marginTop: 2,
          }}
        >
          {task.isClaimed ? 'CLAIMED' : ITEM_LABELS[task.rewardItemSprite] || task.rewardItemSprite}
        </p>
      </div>

      {task.isClaimed ? (
        <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.borderTeal, letterSpacing: '-0.1px', flexShrink: 0, lineHeight: 1.8 }}>
          IN BASE
        </span>
      ) : (
        <motion.button
          onClick={() => onClaim(task.id)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="g3-btn g3-btn-sm"
          style={{ fontSize: '0.33rem', padding: '4px 7px' }}
        >
          CLAIM
        </motion.button>
      )}
    </motion.div>
  )
}

function InventoryChip({ item, isSelected, onSelect }) {
  return (
    <motion.button
      onClick={() => onSelect(item.id)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={(ITEM_LABELS[item.spriteName] || item.spriteName) + (isSelected ? ' — Click a cell to place' : ' — Click to select')}
      style={{
        width: 52,
        height: 52,
        background: isSelected ? 'rgba(34,197,94,0.15)' : 'white',
        border: isSelected ? '3px solid #22c55e' : '2px solid #D8D0B8',
        borderRadius: 6,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: 4,
        position: 'relative',
        boxShadow: isSelected
          ? '0 0 0 2px rgba(34,197,94,0.4), 2px 2px 0 rgba(34,197,94,0.3)'
          : '1px 1px 0 rgba(0,0,0,0.12)',
        transition: 'border-color 0.1s, background 0.1s, box-shadow 0.1s',
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 16,
            height: 16,
            background: '#22c55e',
            border: '2px solid white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.5rem',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 2,
          }}
        >
          ✓
        </motion.div>
      )}
      <img
        src={itemUrl(item.spriteName)}
        alt={ITEM_LABELS[item.spriteName] || item.spriteName}
        style={{ width: 28, height: 28, imageRendering: 'pixelated' }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    </motion.button>
  )
}

function LogAndInventory() {
  const {
    completedTasks,
    inventory,
    selectedInventoryItem,
    claimReward,
    selectInventoryItem,
  } = useSecretBase()

  const unclaimedCount = completedTasks.filter((t) => !t.isClaimed).length

  function handleInventoryClick(itemId) {
    selectInventoryItem(selectedInventoryItem === itemId ? null : itemId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <G3Panel variant="orange" style={{ flexShrink: 0 }}>
        <G3Header
          icon="🏆"
          rightSlot={
            unclaimedCount > 0 ? (
              <span
                style={{
                  background: G3.borderOrange,
                  color: 'white',
                  fontFamily: G3.px,
                  fontSize: '0.3rem',
                  padding: '2px 5px',
                  borderRadius: 3,
                  letterSpacing: '-0.1px',
                }}
              >
                {unclaimedCount} NEW
              </span>
            ) : null
          }
        >
          COMPLETED LOG
        </G3Header>

        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <AnimatePresence mode="popLayout">
            {completedTasks.length === 0 ? (
              <motion.div
                key="empty-log"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: 'center',
                  padding: '16px 0',
                  background: 'rgba(248,248,237,0.7)',
                  border: '1px dashed #D8D0B8',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>📋</div>
                <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted }}>
                  No completed tasks yet!
                </p>
              </motion.div>
            ) : (
              completedTasks.map((task) => (
                <CompletedTaskRow key={task.id} task={task} onClaim={claimReward} />
              ))
            )}
          </AnimatePresence>
        </div>
      </G3Panel>

      <G3Panel variant="teal" style={{ flex: 1 }}>
        <G3Header
          icon="🎒"
          rightSlot={
            <span style={{ fontFamily: G3.px, fontSize: '0.32rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.1px' }}>
              {inventory.length} ITEMS
            </span>
          }
        >
          YOUR INVENTORY
        </G3Header>

        <div style={{ padding: '10px 12px' }}>
          {selectedInventoryItem && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '2px solid #22c55e',
                borderRadius: 5,
                padding: '5px 8px',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: G3.px, fontSize: '0.35rem', color: '#15803d', letterSpacing: '-0.1px', lineHeight: 1.8 }}>
                Click any EMPTY cell to place!
              </p>
              <p style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: '#166534', marginTop: 2 }}>
                (Click item again to deselect)
              </p>
            </motion.div>
          )}

          {inventory.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '20px 0',
                background: 'rgba(248,248,237,0.7)',
                border: '1px dashed #D8D0B8',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>🎒</div>
              <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted }}>
                Claim rewards to fill your inventory!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {inventory.map((item) => (
                <InventoryChip
                  key={item.id}
                  item={item}
                  isSelected={selectedInventoryItem === item.id}
                  onSelect={handleInventoryClick}
                />
              ))}
            </div>
          )}
        </div>
      </G3Panel>
    </div>
  )
}

function floorColor(row, col) {
  return (row + col) % 2 === 0 ? '#D4A373' : '#C8966A'
}

function RoomCell({ row, col, placedItem, isOccupied, selectedInventoryItem, onPlace, onPickup }) {
  const isTargetable = Boolean(selectedInventoryItem && !isOccupied)
  const isPickupable = Boolean(!selectedInventoryItem && isOccupied)

  return (
    <motion.div
      onClick={() => {
        if (isTargetable) onPlace(col, row)
        else if (isPickupable) onPickup(placedItem.id)
      }}
      whileHover={isTargetable || isPickupable ? { scale: 0.94 } : {}}
      whileTap={isTargetable || isPickupable ? { scale: 0.88 } : {}}
      style={{
        aspectRatio: '1 / 1',
        background: floorColor(row, col),
        border: '1px solid rgba(181,131,90,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isTargetable ? 'copy' : isPickupable ? 'grab' : 'default',
        position: 'relative',
        transition: 'background 0.1s',
      }}
    >
      {!isOccupied && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.04) 6px, rgba(0,0,0,0.04) 7px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {isTargetable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(34,197,94,0.18)',
            border: '2px solid rgba(34,197,94,0.5)',
            pointerEvents: 'none',
          }}
        />
      )}

      {isOccupied && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <img
            src={itemUrl(placedItem.spriteName)}
            alt={ITEM_LABELS[placedItem.spriteName] || placedItem.spriteName}
            style={{
              width: '68%',
              height: '68%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          {isPickupable && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 1,
              }}
            >
              <span
                style={{
                  fontFamily: G3.px,
                  fontSize: '0.2rem',
                  color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(0,0,0,0.55)',
                  padding: '1px 3px',
                  borderRadius: 2,
                  letterSpacing: '-0.1px',
                  lineHeight: 1.8,
                  pointerEvents: 'none',
                }}
              >
                PICK UP
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

function SecretBaseRoom() {
  const {
    placedItems,
    selectedInventoryItem,
    inventory,
    placeItem,
    pickupItem,
  } = useSecretBase()

  const selectedItem = inventory.find((i) => i.id === selectedInventoryItem) || null
  const placedCount = placedItems.length
  const emptyCount = GRID_SIZE * GRID_SIZE - placedCount

  return (
    <G3Panel variant="teal" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <G3Header
        icon="🏠"
        rightSlot={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: G3.px, fontSize: '0.3rem', letterSpacing: '-0.1px', color: 'rgba(255,255,255,0.85)' }}>
              {placedCount} PLACED
            </span>
            <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontFamily: G3.px, fontSize: '0.3rem', letterSpacing: '-0.1px', color: 'rgba(255,255,255,0.65)' }}>
              {emptyCount} FREE
            </span>
          </div>
        }
      >
        SECRET BASE
      </G3Header>

      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        <AnimatePresence mode="wait">
          {selectedInventoryItem ? (
            <motion.div
              key="place-mode"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '2px solid #22c55e',
                borderRadius: 5,
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <img src={itemUrl(selectedItem ? selectedItem.spriteName : 'nugget')} alt="" style={{ width: 24, height: 24, imageRendering: 'pixelated', flexShrink: 0 }} />
              <p style={{ fontFamily: G3.px, fontSize: '0.36rem', color: '#15803d', letterSpacing: '-0.1px', lineHeight: 1.8 }}>
                PLACING: {selectedItem ? (ITEM_LABELS[selectedItem.spriteName] || selectedItem.spriteName).toUpperCase() : '?'}
              </p>
              <span style={{ fontFamily: G3.vt, fontSize: '0.9rem', color: '#166534', marginLeft: 'auto' }}>
                Click a glowing cell
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="pickup-mode"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                background: 'rgba(248,248,237,0.7)',
                border: '1px solid #D8D0B8',
                borderRadius: 5,
                padding: '5px 10px',
                flexShrink: 0,
              }}
            >
              <p style={{ fontFamily: G3.vt, fontSize: '1rem', color: G3.textMuted, textAlign: 'center' }}>
                {placedItems.length === 0
                  ? '🏠 Your Secret Base awaits! Claim a reward and select an item to decorate.'
                  : '💡 Select an item from inventory to place · Click a placed item to pick it up'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{
            border: '4px solid #8B6040',
            borderRadius: 4,
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 280,
          }}
        >
          <div
            style={{
              height: 18,
              background: 'repeating-linear-gradient(90deg, #8B6040 0px, #8B6040 18px, #7A5235 18px, #7A5235 19px)',
              borderBottom: '2px solid #6B4426',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 6,
            }}
          >
            {[1, 3, 5, 7].map((i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 10,
                  background: 'linear-gradient(180deg, #B8D8F0 0%, #90C0E0 100%)',
                  border: '1px solid #6B7280',
                  borderRadius: 1,
                  marginRight: 18,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)', flex: 1 }}>
            {CELLS.map((cell) => {
              const placedItem = placedItems.find((p) => p.gridX === cell.col && p.gridY === cell.row)
              return (
                <RoomCell
                  key={`${cell.row}-${cell.col}`}
                  row={cell.row}
                  col={cell.col}
                  placedItem={placedItem}
                  isOccupied={Boolean(placedItem)}
                  selectedInventoryItem={selectedInventoryItem}
                  onPlace={(gridX, gridY) => placeItem(selectedInventoryItem, gridX, gridY)}
                  onPickup={pickupItem}
                />
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: '#D4A373', border: '1px solid rgba(181,131,90,0.3)' }} />
            <span style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted }}>Wooden floor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: 'rgba(34,197,94,0.3)', border: '2px solid #22c55e' }} />
            <span style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted }}>Available cell</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, background: '#D4A373', border: '1px solid rgba(181,131,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 6, height: 6, background: '#C89820', borderRadius: '50%' }} />
            </div>
            <span style={{ fontFamily: G3.vt, fontSize: '0.85rem', color: G3.textMuted }}>Item placed</span>
          </div>
        </div>
      </div>
    </G3Panel>
  )
}

function AddCompletedTaskForm() {
  const { addCompletedTask } = useSecretBase()
  const [taskName, setTaskName] = useState('')
  const [sprite, setSprite] = useState('nugget')

  function handleSubmit(e) {
    e.preventDefault()
    if (!taskName.trim()) return
    addCompletedTask(taskName.trim(), sprite)
    setTaskName('')
  }

  return (
    <G3Panel variant="orange">
      <G3Header icon="✏️">ADD TO LOG</G3Header>
      <form onSubmit={handleSubmit} style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="What did you accomplish?"
          className="g3-input"
          style={{ fontSize: '1.05rem', padding: '4px 8px' }}
        />

        <div>
          <div style={{ fontFamily: G3.px, fontSize: '0.32rem', color: G3.textMuted, marginBottom: 4 }}>
            CHOOSE REWARD:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {VALID_SECRET_BASE_SPRITES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSprite(s)}
                title={ITEM_LABELS[s] || s}
                style={{
                  width: 38,
                  height: 38,
                  background: sprite === s ? 'rgba(104,176,176,0.15)' : 'white',
                  border: sprite === s ? '3px solid ' + G3.borderTeal : '2px solid #D8D0B8',
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 3,
                  transition: 'border-color 0.1s, background 0.1s',
                }}
              >
                <img
                  src={itemUrl(s)}
                  alt={ITEM_LABELS[s] || s}
                  style={{ width: 22, height: 22, imageRendering: 'pixelated' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button
            type="submit"
            disabled={!taskName.trim()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="g3-btn g3-btn-sm"
            style={{ fontSize: '0.38rem', padding: '5px 10px' }}
          >
            LOG IT
          </motion.button>
        </div>
      </form>
    </G3Panel>
  )
}

export default function SecretBase() {
  const { secretBaseLoading, fetchSecretBase } = useSecretBase()

  useEffect(() => {
    fetchSecretBase()
  }, [fetchSecretBase])

  if (secretBaseLoading) {
    return (
      <div className="secret-base-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[120, 180].map((h, i) => (
            <div key={i} style={{ height: h, background: G3.creamDark, border: '2px solid #C0B8A8', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ background: G3.creamDark, border: '2px solid #C0B8A8', borderRadius: 8, minHeight: 280, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    )
  }

  return (
    <div className="secret-base-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 2 }}>
        <LogAndInventory />
        <AddCompletedTaskForm />
      </div>

      <div style={{ overflow: 'hidden', height: '100%' }}>
        <SecretBaseRoom />
      </div>
    </div>
  )
}
