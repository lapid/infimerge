import React, { useEffect } from 'react'
import { useGame } from '../../hooks/useGame.js'
import { elementsMap } from '../../data/index.js'

const AUTO_DISMISS_MS = 3500

export default function DiscoveryToast() {
  const { state, dispatch } = useGame()
  const toasts = state.recentDiscoveries ?? []

  useEffect(() => {
    if (toasts.length === 0) return
    const latest = toasts[0]
    const timer = setTimeout(() => {
      dispatch({ type: 'DISMISS_TOAST', payload: latest.timestamp })
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toasts])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none"
      style={{ maxWidth: 240 }}
    >
      {toasts.slice(0, 3).map(toast => {
        const el = elementsMap.get(toast.id)
        if (!el) return null
        const isKnown = toast.isKnown
        return (
          <div
            key={toast.timestamp}
            className="toast-enter flex items-center gap-3 px-4 py-3 rounded-xl pointer-events-auto"
            style={{
              background: '#161b22',
              border: `1px solid ${isKnown ? '#30363d' : el.color + '88'}`,
              boxShadow: isKnown ? 'none' : `0 0 16px ${el.color}44`,
              opacity: isKnown ? 0.7 : 1,
            }}
            onClick={() => dispatch({ type: 'DISMISS_TOAST', payload: toast.timestamp })}
          >
            <span className="text-2xl" style={{ opacity: isKnown ? 0.5 : 1 }}>{el.emoji}</span>
            <div>
              <p className="text-xs" style={{ color: isKnown ? '#484f58' : '#8b949e' }}>
                {isKnown ? 'Already unlocked' : 'New discovery!'}
              </p>
              <p className="text-sm font-semibold" style={{ color: isKnown ? '#8b949e' : el.color }}>
                {el.name}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
