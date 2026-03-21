import elementsRaw from './elements.json'
import combinationsRaw from './combinations.json'

// elementsMap: id => element object
export const elementsMap = new Map(elementsRaw.map(e => [e.id, e]))

// Combo key = sorted "idA+idB"
function makeKey(a, b) {
  return a < b ? `${a}+${b}` : `${b}+${a}`
}

// combosMap: "idA+idB" => string[]   (one or more output IDs)
export const combosMap = new Map()

// elementToComboKeys: elementId => Set<comboKey>
export const elementToComboKeys = new Map(elementsRaw.map(e => [e.id, new Set()]))

// outputToComboKeys: outputId => comboKey[]
export const outputToComboKeys = new Map(elementsRaw.map(e => [e.id, []]))

for (const combo of combinationsRaw) {
  const [a, b] = combo.inputs
  const key = makeKey(a, b)

  // Normalize: support both `output: "x"` and `outputs: ["x","y"]`
  const outputs = combo.outputs
    ? combo.outputs
    : combo.output ? [combo.output] : []

  if (!combosMap.has(key)) {
    combosMap.set(key, outputs)
    elementToComboKeys.get(a)?.add(key)
    elementToComboKeys.get(b)?.add(key)
    for (const out of outputs) {
      outputToComboKeys.get(out)?.push(key)
    }
  }
}

export const startingIds = elementsRaw
  .filter(e => e.isStarting)
  .map(e => e.id)

export { makeKey }
