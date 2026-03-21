import React, { useState } from 'react'
import DropZone from './DropZone.jsx'
import { useGame } from '../../hooks/useGame.js'
import { combineElements } from '../../engine/combineElements.js'
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

  const outputIds = slotA && slotB ? combineElements(slotA, slotB) : null
  const outputEls = outputIds ? outputIds.map(id => elementsMap.get(id)).filter(Boolean) : []

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

      {/* Output preview */}
      {outputEls.length > 0 && (
        <div key={outputIds.join(',')} className="combine-reveal flex flex-col items-center gap-2">
          <span className="text-[#8b949e] text-sm">→</span>
          <div className="flex gap-2 flex-wrap justify-center">
            {outputEls.map(outputEl => (
              <div
                key={outputEl.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: '#1c2128',
                  border: `1px solid ${outputEl.color}66`,
                  boxShadow: `0 0 16px ${outputEl.color}55`,
                }}
              >
                <span className="text-xl">{outputEl.emoji}</span>
                <span style={{ color: outputEl.color }}>{outputEl.name}</span>
                {!state.discoveredIds.has(outputEl.id) && (
                  <span className="text-xs text-[#fbbf24] ml-1 font-bold">✨ New!</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No combo message */}
      {slotA && slotB && outputEls.length === 0 && (
        <p className="text-[#8b949e] text-sm">No combination found.</p>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {slotA && slotB && (
          <button
            onClick={handleCombine}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: outputEls.length ? '#1f6feb' : '#21262d',
              color: outputEls.length ? '#fff' : '#8b949e',
              border: '1px solid ' + (outputEls.length ? '#388bfd' : '#30363d'),
              cursor: outputEls.length ? 'pointer' : 'default',
            }}
            disabled={outputEls.length === 0}
          >
            Combine
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
