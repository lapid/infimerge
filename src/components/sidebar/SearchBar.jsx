import React from 'react'
import { useGame } from '../../hooks/useGame.js'

export default function SearchBar() {
  const { state, dispatch } = useGame()

  return (
    <input
      type="search"
      placeholder="Search elements…"
      value={state.searchQuery}
      onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
      className="w-full rounded px-3 py-1.5 text-sm outline-none"
      style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        color: '#e6edf3',
      }}
    />
  )
}
