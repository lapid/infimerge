import React, { useState } from 'react'
import DropZone from './DropZone.jsx'
import { useGame } from '../../hooks/useGame.js'
import { elementsMap } from '../../data/index.js'
import { clearGame } from '../../engine/persistence.js'

export default function WorkspacePanel() {
  const { state, dispatch } = useGame()
  const { slotA, slotB } = state
  const [confirming, setConfirming] = useState(false)

  function handleReset() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
      return
    }
    clearGame()
    dispatch({ type: 'RESET_GAME' })
    setConfirming(false)
  }

  const slotAEl = slotA ? elementsMap.get(slotA) : null

  function handleCombine() {
    if (slotA && slotB) {
      dispatch({ type: 'COMBINE_SLOTS', payload: { idA: slotA, idB: slotB } })
    }
  }

  function handleClear() {
    dispatch({ type: 'CLEAR_SLOTS' })
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6 relative">
      <h2 className="text-[#8b949e] text-sm uppercase tracking-wider">Combine Zone</h2>

      {/* Slots */}
      <div className="flex items-center gap-4">
        <DropZone slot="A" />
        <span className="text-[#8b949e] text-2xl font-light">+</span>
        <DropZone slot="B" />
      </div>

      {/* Lore */}
      {slotA && !slotB && slotAEl?.lore && (
        <p className="text-xs text-center max-w-xs leading-relaxed" style={{ color: '#8b949e', fontStyle: 'italic' }}>
          {slotAEl.lore}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {slotA && slotB && (
          <button
            onClick={handleCombine}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: '#1f6feb',
              color: '#fff',
              border: '1px solid #388bfd',
              cursor: 'pointer',
            }}
          >
            Combine!
          </button>
        )}
        {(slotA || slotB) && (
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: '#21262d',
              color: '#8b949e',
              border: '1px solid #30363d',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Hint */}
      {!slotA && !slotB && (
        <p className="text-[#8b949e] text-sm text-center max-w-xs">
          Click an element to select it, then click another to combine.
          <br />
          <span className="text-xs mt-1 block opacity-60">
            Elements with a glowing dot have undiscovered combos available.
          </span>
        </p>
      )}

      {/* Restart button — pinned to bottom */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        <button
          onClick={handleReset}
          className="px-4 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: confirming ? '#450a0a' : 'transparent',
            color: confirming ? '#fca5a5' : '#484f58',
            border: '1px solid ' + (confirming ? '#7f1d1d' : '#30363d'),
          }}
        >
          {confirming ? '⚠ Click again to restart' : '↺ Restart game'}
        </button>
      </div>
    </div>
  )
}
