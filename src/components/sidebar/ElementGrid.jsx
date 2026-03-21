import React, { useMemo } from 'react'
import { useGame } from '../../hooks/useGame.js'
import { elementsMap } from '../../data/index.js'
import ElementCard from './ElementCard.jsx'

export default function ElementGrid() {
  const { state } = useGame()
  const { unlockedIds, searchQuery, activeCategory, activeComboIndex } = state

  const elements = useMemo(() => {
    let list = [...unlockedIds]
      .map(id => elementsMap.get(id))
      .filter(Boolean)

    if (activeCategory !== 'all') {
      list = list.filter(e => e.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(e => e.name.toLowerCase().includes(q))
    }

    // Sort: glowing first (more combos = higher priority), then by tier, then name
    list.sort((a, b) => {
      const ga = activeComboIndex?.get(a.id) ?? 0
      const gb = activeComboIndex?.get(b.id) ?? 0
      if (gb !== ga) return gb - ga
      if (a.tier !== b.tier) return a.tier - b.tier
      return a.name.localeCompare(b.name)
    })

    return list
  }, [unlockedIds, searchQuery, activeCategory, activeComboIndex])

  if (elements.length === 0) {
    return (
      <div className="p-4 text-sm text-[#8b949e] text-center">
        No elements found.
      </div>
    )
  }

  return (
    <div className="p-2 grid grid-cols-1 gap-1">
      {elements.map(el => (
        <ElementCard key={el.id} element={el} />
      ))}
    </div>
  )
}
