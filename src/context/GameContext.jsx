import React, { createContext, useReducer, useEffect } from 'react'
import { gameReducer, makeInitialState } from '../store/gameReducer.js'
import { loadGame } from '../engine/persistence.js'

export const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    null,
    () => makeInitialState(loadGame())
  )

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}
