import React from 'react'
import ProgressBar from '../ui/ProgressBar.jsx'
import ResetButton from '../ui/ResetButton.jsx'
import { elementsMap } from '../../data/index.js'

const TOTAL = elementsMap.size

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] shrink-0"
      style={{ background: '#161b22' }}
    >
      <h1 className="text-lg font-bold tracking-tight text-[#e6edf3]">
        infimerge
      </h1>
      <div className="flex items-center gap-4">
        <ProgressBar total={TOTAL} />
        <ResetButton />
      </div>
    </header>
  )
}
