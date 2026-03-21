import React from 'react'
import { GameProvider } from './context/GameContext.jsx'
import AppShell from './components/layout/AppShell.jsx'

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  )
}
