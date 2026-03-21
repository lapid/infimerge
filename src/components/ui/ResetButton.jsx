import React, { useState } from 'react'
import { useGame } from '../../hooks/useGame.js'
import { clearGame } from '../../engine/persistence.js'

export default function ResetButton() {
  const { dispatch } = useGame()
  const [confirming, setConfirming] = useState(false)

  function handleClick() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
      return
    }
    clearGame()
    dispatch({ type: 'RESET_GAME' })
    setConfirming(false)
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 rounded text-xs transition-colors"
      style={{
        background: confirming ? '#450a0a' : '#21262d',
        color: confirming ? '#fca5a5' : '#8b949e',
        border: '1px solid ' + (confirming ? '#7f1d1d' : '#30363d'),
      }}
      title={confirming ? 'Click again to confirm reset' : 'Reset game'}
    >
      {confirming ? 'Confirm reset?' : '↺ Reset'}
    </button>
  )
}
