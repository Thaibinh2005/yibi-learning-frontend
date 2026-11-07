import React from 'react'

/** How far along today's goal is, as a ring. The number inside carries the value, so colour is never alone. */
export const GoalRing: React.FC<{
  percent: number
  size?: number
  stroke?: number
  trackColor?: string
  color?: string
  children?: React.ReactNode
}> = ({ percent, size = 96, stroke = 10, trackColor = '#E7E5E4', color = '#C8322B', children }) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const filled = Math.min(Math.max(percent, 0), 100) / 100
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-center">{children}</span>
    </span>
  )
}
