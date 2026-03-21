import { useGame } from './useGame.js'

export function useClickCombine() {
  const { state, dispatch } = useGame()

  function onCardClick(elementId) {
    dispatch({ type: 'CLICK_COMBINE', payload: elementId })
  }

  return {
    selectedId: state.selectedId,
    onCardClick,
  }
}
