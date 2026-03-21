import { combosMap, elementToComboKeys, outputToComboKeys } from '../data/index.js'

// A combo is undiscovered if at least one output hasn't been found yet
function isUndiscovered(outputs, discoveredIds) {
  return outputs.some(id => !discoveredIds.has(id))
}

/**
 * Build active combo index from scratch.
 * Returns Map<elementId, number> = count of undiscovered combos reachable now.
 * A combo counts for element E when: both inputs unlocked + at least one output undiscovered.
 */
export function buildActiveComboIndex(unlockedIds, discoveredIds) {
  const index = new Map()

  for (const id of unlockedIds) {
    let count = 0
    for (const key of elementToComboKeys.get(id) ?? []) {
      const outputs = combosMap.get(key)
      if (!outputs) continue

      const [a, b] = key.split('+')
      const partner = a === id ? b : a

      if (unlockedIds.has(partner) && isUndiscovered(outputs, discoveredIds)) {
        count++
      }
    }
    index.set(id, count)
  }

  return index
}

/**
 * Incremental update after a new element is unlocked+discovered.
 * Mutates index in place — O(K) where K = combos involving newId.
 */
export function onElementUnlocked(index, newId, unlockedIds, discoveredIds) {
  // 1. Credit partners: for every combo newId participates in as INPUT,
  //    if the partner was already unlocked and the combo is still undiscovered,
  //    that partner gains one new available combo.
  for (const key of elementToComboKeys.get(newId) ?? []) {
    const outputs = combosMap.get(key)
    if (!outputs) continue

    const [a, b] = key.split('+')
    const partner = a === newId ? b : a

    if (partner !== newId && unlockedIds.has(partner) && isUndiscovered(outputs, discoveredIds)) {
      index.set(partner, (index.get(partner) ?? 0) + 1)
    }
  }

  // 2. Compute newId's own count fresh.
  let newCount = 0
  for (const key of elementToComboKeys.get(newId) ?? []) {
    const outputs = combosMap.get(key)
    if (!outputs) continue

    const [a, b] = key.split('+')
    const partner = a === newId ? b : a

    if (unlockedIds.has(partner) && isUndiscovered(outputs, discoveredIds)) {
      newCount++
    }
  }
  index.set(newId, newCount)

  // 3. Expire spent combos: any combo whose output SET is now fully discovered
  //    (newId being discovered may have completed it) → decrement both inputs.
  for (const key of outputToComboKeys.get(newId) ?? []) {
    const outputs = combosMap.get(key)
    if (!outputs) continue

    // Only expire if ALL outputs are now discovered
    if (!isUndiscovered(outputs, discoveredIds)) {
      const [a, b] = key.split('+')
      for (const inputId of [a, b]) {
        if (unlockedIds.has(inputId)) {
          index.set(inputId, Math.max(0, (index.get(inputId) ?? 0) - 1))
        }
      }
    }
  }
}

/**
 * Returns { available, discovered } for one element.
 * available = combos where both inputs are unlocked
 * discovered = of those, combos where ALL outputs are discovered
 * Used for X/Y display on element cards.
 */
export function getComboStats(elementId, unlockedIds, discoveredIds) {
  let available = 0
  let discovered = 0

  for (const key of elementToComboKeys.get(elementId) ?? []) {
    const outputs = combosMap.get(key)
    if (!outputs) continue

    const [a, b] = key.split('+')
    const partner = a === elementId ? b : a

    if (unlockedIds.has(partner)) {
      available++
      if (!isUndiscovered(outputs, discoveredIds)) discovered++
    }
  }

  return { available, discovered }
}
