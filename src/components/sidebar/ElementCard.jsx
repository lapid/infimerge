import React, { memo, useState } from 'react'
import { useGame } from '../../hooks/useGame.js'
import { useClickCombine } from '../../hooks/useClickCombine.js'
import { useDragSource } from '../../hooks/useDragDrop.js'
import { getComboStats } from '../../engine/activeComboIndex.js'

const ElementCard = memo(function ElementCard({ element, isNew }) {
  const { state } = useGame()
  const { selectedId, onCardClick } = useClickCombine()
  const dragProps = useDragSource(element.id)
  const [imgFailed, setImgFailed] = useState(false)

  const undiscovered = state.activeComboIndex?.get(element.id) ?? 0
  const isGlowing = undiscovered > 0
  const isSelected = selectedId === element.id
  const { available, discovered } = isGlowing || isSelected
    ? getComboStats(element.id, state.unlockedIds, state.discoveredIds)
    : { available: 0, discovered: 0 }

  const glowLo = `0 0 6px ${element.color}88,  inset 0 0 0 1px ${element.color}44`
  const glowHi = `0 0 14px ${element.color}cc, inset 0 0 0 1px ${element.color}99`

  const style = {
    '--glow-shadow-lo': glowLo,
    '--glow-shadow-hi': glowHi,
    cursor: 'grab',
    boxShadow: isSelected
      ? `0 0 0 2px #388bfd, 0 0 14px ${element.color}66`
      : isGlowing ? glowLo : 'none',
    background: isSelected ? '#1c2128' : '#161b22',
    border: '1px solid ' + (isSelected ? '#388bfd' : isGlowing ? element.color + '77' : '#30363d'),
    borderRadius: '10px',
    padding: '9px 11px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    userSelect: 'none',
  }

  const iconSrc = `/icons/${element.id}.png`
  const showImg = !imgFailed

  return (
    <div
      style={style}
      className={`card-hover ${isGlowing && !isSelected ? 'glow-pulse' : ''} ${isNew ? 'discovery-bounce' : ''}`}
      onClick={() => onCardClick(element.id)}
      {...dragProps}
      title={available > 0 ? `${element.name} — ${discovered}/${available} combos found` : element.name}
    >
      {/* Icon: custom PNG if available, else emoji */}
      {showImg ? (
        <img
          src={iconSrc}
          alt={element.name}
          width={24}
          height={24}
          style={{ imageRendering: 'pixelated', flexShrink: 0 }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="text-lg leading-none" style={{ flexShrink: 0 }}>{element.emoji}</span>
      )}

      <span className="text-sm text-[#e6edf3] leading-none truncate">{element.name}</span>

      {available > 0 && (
        <span
          className="ml-auto shrink-0 flex items-center gap-1 text-[10px] font-mono tabular-nums"
          style={{ color: isGlowing ? element.color : '#484f58' }}
        >
          {discovered}/{available}
          {isGlowing && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: element.color, boxShadow: `0 0 4px ${element.color}` }}
            />
          )}
        </span>
      )}
    </div>
  )
})

export default ElementCard
