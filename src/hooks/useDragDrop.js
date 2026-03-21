import { useGame } from './useGame.js'

/**
 * Returns drag source handlers for an element card,
 * and drop zone handlers for slot A/B.
 */
export function useDragSource(elementId) {
  function onDragStart(e) {
    e.dataTransfer.setData('text/plain', elementId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return { draggable: true, onDragStart }
}

export function useDropZone(slot) {
  const { state, dispatch } = useGame()

  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function onDrop(e) {
    e.preventDefault()
    const elementId = e.dataTransfer.getData('text/plain')
    if (!elementId) return

    if (slot === 'A') {
      dispatch({ type: 'SET_SLOT', payload: { slot: 'A', elementId } })
      // Auto-combine if slot B is already filled
      if (state.slotB) {
        dispatch({ type: 'COMBINE_SLOTS', payload: { idA: elementId, idB: state.slotB } })
      }
    } else {
      dispatch({ type: 'SET_SLOT', payload: { slot: 'B', elementId } })
      if (state.slotA) {
        dispatch({ type: 'COMBINE_SLOTS', payload: { idA: state.slotA, idB: elementId } })
      }
    }
  }

  return { onDragOver, onDrop }
}
