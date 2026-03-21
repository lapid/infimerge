#!/usr/bin/env node
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const elements = JSON.parse(readFileSync(join(root, 'src/data/elements.json'), 'utf8'))
const combinations = JSON.parse(readFileSync(join(root, 'src/data/combinations.json'), 'utf8'))

let errors = 0
let warnings = 0

function error(msg) { console.error(`  ✗ ERROR: ${msg}`); errors++ }
function warn(msg)  { console.warn(`  ⚠ WARN:  ${msg}`); warnings++ }
function ok(msg)    { console.log(`  ✓ ${msg}`) }

console.log('\n=== Infimerge Data Validator ===\n')

// --- Element checks ---
console.log('--- Elements ---')

const elementIds = new Set(elements.map(e => e.id))
const startingIds = new Set(elements.filter(e => e.isStarting).map(e => e.id))

// Duplicate IDs
const seen = new Set()
for (const el of elements) {
  if (seen.has(el.id)) error(`Duplicate element id: "${el.id}"`)
  else seen.add(el.id)
}

// Required fields
const REQUIRED_FIELDS = ['id', 'name', 'emoji', 'category', 'tier', 'color', 'isStarting']
const VALID_CATEGORIES = new Set(['primordial','gas','liquid','solid','mineral','life','animal','plant','human','technology','energy','weather','celestial','myth','concept','food','structure'])
for (const el of elements) {
  for (const f of REQUIRED_FIELDS) {
    if (el[f] === undefined) error(`Element "${el.id}" missing field: ${f}`)
  }
  if (!VALID_CATEGORIES.has(el.category)) warn(`Element "${el.id}" has unknown category: "${el.category}"`)
  if (typeof el.tier !== 'number' || el.tier < 0 || el.tier > 6) warn(`Element "${el.id}" has unusual tier: ${el.tier}`)
  if (!/^#[0-9A-Fa-f]{6}$/.test(el.color)) warn(`Element "${el.id}" has invalid color: "${el.color}"`)
}

ok(`${elements.length} elements (${startingIds.size} starting)`)

// --- Combination checks ---
console.log('\n--- Combinations ---')

const makeKey = (a, b) => a < b ? `${a}+${b}` : `${b}+${a}`
const comboKeys = new Set()
const reachable = new Set(startingIds)

for (const [i, combo] of combinations.entries()) {
  if (!Array.isArray(combo.inputs) || combo.inputs.length !== 2) {
    error(`Combo #${i} has invalid inputs: ${JSON.stringify(combo.inputs)}`)
    continue
  }
  // Normalize output/outputs
  const outputs = combo.outputs ?? (combo.output ? [combo.output] : [])
  if (outputs.length === 0) {
    error(`Combo #${i} has no output`)
    continue
  }

  const [a, b] = combo.inputs
  const key = makeKey(a, b)

  // Duplicate combo
  if (comboKeys.has(key)) {
    warn(`Duplicate combo key: "${key}" (outputs: ${outputs.join(', ')})`)
  } else {
    comboKeys.add(key)
  }

  // Dangling input references
  if (!elementIds.has(a)) error(`Combo "${key}" references unknown input: "${a}"`)
  if (!elementIds.has(b)) error(`Combo "${key}" references unknown input: "${b}"`)

  // Dangling output references
  for (const out of outputs) {
    if (!elementIds.has(out)) error(`Combo "${key}" references unknown output: "${out}"`)
    if (startingIds.has(out)) warn(`Combo "${key}" produces a starting element: "${out}"`)
    reachable.add(out)
  }
}

ok(`${combinations.length} combinations, ${comboKeys.size} unique keys`)

// --- Reachability check ---
console.log('\n--- Reachability ---')

const unreachable = elements
  .filter(e => !e.isStarting && !reachable.has(e.id))
  .map(e => e.id)

if (unreachable.length > 0) {
  for (const id of unreachable) warn(`Element "${id}" is not reachable by any combination`)
} else {
  ok('All non-starting elements are reachable')
}

// --- Summary ---
console.log('\n=== Summary ===')
console.log(`  Elements:     ${elements.length}`)
console.log(`  Combinations: ${combinations.length} (${comboKeys.size} unique)`)
console.log(`  Errors:       ${errors}`)
console.log(`  Warnings:     ${warnings}`)
console.log(`  Unreachable:  ${unreachable.length}`)
console.log('')

if (errors > 0) {
  console.error('FAILED — fix errors before deploying.\n')
  process.exit(1)
} else {
  console.log('PASSED\n')
}
