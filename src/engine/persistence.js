const STORAGE_KEY = 'infimerge_v1'
const CURRENT_VERSION = 1

export function saveGame({ unlockedIds, discoveredIds }) {
  try {
    const data = {
      version: CURRENT_VERSION,
      savedAt: Date.now(),
      unlockedIds: [...unlockedIds],
      discoveredIds: [...discoveredIds],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Fail silently on quota errors
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.version !== CURRENT_VERSION) return null
    return {
      unlockedIds: new Set(data.unlockedIds ?? []),
      discoveredIds: new Set(data.discoveredIds ?? []),
    }
  } catch {
    return null
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
