import React from 'react'
import Header from './Header.jsx'
import ElementGrid from '../sidebar/ElementGrid.jsx'
import SearchBar from '../sidebar/SearchBar.jsx'
import CategoryFilter from '../sidebar/CategoryFilter.jsx'
import WorkspacePanel from '../workspace/WorkspacePanel.jsx'
import DiscoveryToast from '../ui/DiscoveryToast.jsx'

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0d1117', color: '#e6edf3' }}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex flex-col w-72 min-w-[220px] border-r border-[#30363d] overflow-hidden">
          <div className="p-3 space-y-2 border-b border-[#30363d]">
            <SearchBar />
            <CategoryFilter />
          </div>
          <div className="flex-1 overflow-y-auto">
            <ElementGrid />
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 overflow-hidden">
          <WorkspacePanel />
        </main>
      </div>

      {/* Toast layer */}
      <DiscoveryToast />
    </div>
  )
}
