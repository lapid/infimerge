import { combosMap, makeKey } from '../data/index.js'

/**
 * Pure function: try to combine two element IDs.
 * Returns an array of output element IDs, or null if no combo exists.
 */
export function combineElements(idA, idB) {
  const key = makeKey(idA, idB)
  const outputs = combosMap.get(key)
  return outputs?.length ? outputs : null
}
