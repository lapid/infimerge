import { combineElements } from '../engine/combineElements.js'
import { buildActiveComboIndex, onElementUnlocked } from '../engine/activeComboIndex.js'
import { saveGame } from '../engine/persistence.js'
import { startingIds } from '../data/index.js'

export function makeInitialState(saved = null) {
  const unlockedIds = saved?.unlockedIds ?? new Set(startingIds)
  const discoveredIds = saved?.discoveredIds ?? new Set(startingIds)
  const activeComboIndex = buildActiveComboIndex(unlockedIds, discoveredIds)

  return {
    unlockedIds,
    discoveredIds,
    activeComboIndex,
    slotA: null,
    slotB: null,
    selectedId: null,
    searchQuery: '',
    activeCategory: 'all',
    recentDiscoveries: [],    // [{id, timestamp}]
    discoveryCount: discoveredIds.size,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }

    case 'SET_CATEGORY':
      return { ...state, activeCategory: action.payload }

    case 'SET_SLOT': {
      const { slot, elementId } = action.payload
      if (slot === 'A') return { ...state, slotA: elementId, selectedId: null }
      if (slot === 'B') return { ...state, slotB: elementId, selectedId: null }
      return state
    }

    case 'SET_SELECTED': {
      // Toggle selection
      const id = action.payload
      if (state.selectedId === id) return { ...state, selectedId: null }
      return { ...state, selectedId: id }
    }

    case 'CLICK_COMBINE': {
      const clickedId = action.payload
      if (!state.selectedId) {
        // First click: highlight in sidebar + show in slot A
        return { ...state, selectedId: clickedId, slotA: clickedId, slotB: null }
      }
      // Second click: always combine (same element = self-combo attempt)
      return doCombine(state, state.selectedId, clickedId)
    }

    case 'COMBINE_SLOTS': {
      const { idA, idB } = action.payload
      return doCombine(state, idA, idB)
    }

    case 'CLEAR_SLOTS':
      return { ...state, slotA: null, slotB: null, selectedId: null }

    case 'DISMISS_TOAST': {
      const ts = action.payload
      return {
        ...state,
        recentDiscoveries: state.recentDiscoveries.filter(d => d.timestamp !== ts),
      }
    }

    case 'RESET_GAME': {
      const fresh = makeInitialState()
      return fresh
    }

    default:
      return state
  }
}

function doCombine(state, idA, idB) {
  const outputIds = combineElements(idA, idB)  // string[] | null

  const baseState = {
    ...state,
    selectedId: null,
    slotA: null,
    slotB: null,
  }

  if (!outputIds) return baseState

  let newUnlocked = state.unlockedIds
  let newDiscovered = state.discoveredIds
  let newIndex = new Map(state.activeComboIndex)
  const newToasts = []

  for (const outputId of outputIds) {
    const alreadyKnown = newDiscovered.has(outputId)
    newUnlocked = addToSet(newUnlocked, outputId)

    if (!alreadyKnown) {
      newDiscovered = addToSet(newDiscovered, outputId)
      onElementUnlocked(newIndex, outputId, newUnlocked, newDiscovered)
      newToasts.push({ id: outputId, timestamp: Date.now(), isKnown: false })
    } else {
      newToasts.push({ id: outputId, timestamp: Date.now(), isKnown: true })
    }
  }

  const newState = {
    ...baseState,
    unlockedIds: newUnlocked,
    discoveredIds: newDiscovered,
    activeComboIndex: newIndex,
    discoveryCount: newDiscovered.size,
    recentDiscoveries: [
      ...newToasts,
      ...state.recentDiscoveries,
    ].slice(0, 5),
  }

  saveGame({ unlockedIds: newUnlocked, discoveredIds: newDiscovered })
  return newState
}

function addToSet(set, value) {
  if (set.has(value)) return set
  const next = new Set(set)
  next.add(value)
  return next
}
