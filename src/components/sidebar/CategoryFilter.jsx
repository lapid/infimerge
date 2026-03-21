import React from 'react'
import { useGame } from '../../hooks/useGame.js'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'primordial', label: 'Primal' },
  { id: 'gas', label: 'Gas' },
  { id: 'liquid', label: 'Liquid' },
  { id: 'solid', label: 'Solid' },
  { id: 'mineral', label: 'Mineral' },
  { id: 'life', label: 'Life' },
  { id: 'animal', label: 'Animal' },
  { id: 'plant', label: 'Plant' },
  { id: 'food', label: 'Food' },
  { id: 'human', label: 'Human' },
  { id: 'technology', label: 'Tech' },
  { id: 'energy', label: 'Energy' },
  { id: 'weather', label: 'Weather' },
  { id: 'structure', label: 'Structure' },
  { id: 'celestial', label: 'Celestial' },
  { id: 'myth', label: 'Myth' },
  { id: 'concept', label: 'Concept' },
]

export default function CategoryFilter() {
  const { state, dispatch } = useGame()
  const active = state.activeCategory

  return (
    <div className="flex flex-wrap gap-1">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat.id })}
          className="px-2 py-0.5 rounded text-xs transition-colors"
          style={{
            background: active === cat.id ? '#388bfd' : '#21262d',
            color: active === cat.id ? '#fff' : '#8b949e',
            border: '1px solid ' + (active === cat.id ? '#388bfd' : '#30363d'),
          }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
