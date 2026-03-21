import React, { useRef, useEffect } from 'react'
import { useGame } from '../../hooks/useGame.js'
import { useDropZone } from '../../hooks/useDragDrop.js'
import { elementsMap } from '../../data/index.js'
import SlotCard from './SlotCard.jsx'

export default function DropZone({ slot }) {
  const { state, dispatch } = useGame()
  const dropProps = useDropZone(slot)
  const elementId = slot === 'A' ? state.slotA : state.slotB
  const element = elementId ? elementsMap.get(elementId) : null
  const prevId = useRef(null)

  // Track when element changes so we can trigger pop animation
  const didChange = elementId !== prevId.current
  useEffect(() => { prevId.current = elementId }, [elementId])

  function handleClear() {
    dispatch({ type: 'SET_SLOT', payload: { slot, elementId: null } })
  }

  return (
    <div
      {...dropProps}
      className="flex flex-col items-center justify-center rounded-xl"
      style={{
        width: 120,
        height: 120,
        background: element ? '#1c2128' : '#161b22',
        border: '2px dashed ' + (element ? '#388bfd' : '#30363d'),
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {element ? (
        <div key={elementId} className="slot-pop w-full h-full">
          <SlotCard element={element} onClear={handleClear} />
        </div>
      ) : (
        <span className="text-[#8b949e] text-xs text-center px-2">
          Drop {slot === 'A' ? '1st' : '2nd'} element here
        </span>
      )}
    </div>
  )
}
