import React from 'react'
import { useGame } from '../../hooks/useGame.js'

export default function ProgressBar({ total }) {
  const { state } = useGame()
  const count = state.discoveredIds?.size ?? 0
  const pct = Math.round((count / total) * 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#8b949e] whitespace-nowrap">
        {count} / {total}
      </span>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ width: 80, background: '#21262d' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: '#388bfd' }}
        />
      </div>
      <span className="text-xs text-[#8b949e]">{pct}%</span>
    </div>
  )
}
