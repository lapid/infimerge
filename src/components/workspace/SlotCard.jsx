import React from 'react'

export default function SlotCard({ element, onClear }) {
  return (
    <div className="flex flex-col items-center gap-2 relative w-full h-full justify-center">
      <span className="text-3xl">{element.emoji}</span>
      <span className="text-xs text-[#e6edf3] text-center px-1 leading-tight">
        {element.name}
      </span>
      <button
        onClick={onClear}
        className="absolute top-1 right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center transition-colors"
        style={{ background: '#30363d', color: '#8b949e' }}
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}
