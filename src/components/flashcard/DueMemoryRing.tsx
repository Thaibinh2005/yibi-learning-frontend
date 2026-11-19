import React, { useMemo, useState } from 'react'

/** Where a due card stands in the learner's memory, from its flashcard. */
export type MemoryState = 'NEW' | 'RELEARN' | 'LEARNING' | 'MASTERED'

/** As in the flashcard stats: answered right three times in a row. */
const MASTERED_REPETITIONS = 3

/**
 * New: never reviewed. Relearn: reviewed, but the last answer was "Học lại", which sets the run of right answers
 * back to 0. Learning: right 1-2 times in a row. Mastered: right 3 times or more.
 */
export const memoryStateOf = (card: { repetition?: number | null; lastReviewed?: string | null }): MemoryState => {
  if (!card.lastReviewed) return 'NEW'
  const repetitions = card.repetition ?? 0
  if (repetitions === 0) return 'RELEARN'
  return repetitions >= MASTERED_REPETITIONS ? 'MASTERED' : 'LEARNING'
}

/**
 * Four categorical slots from the dataviz reference palette (light mode), fixed per state so a state keeps its
 * colour whatever else is due. Any two states can end up side by side (a missing state joins its neighbours), so the
 * set was validated on all pairs: worst CVD ΔE 13.0, worst normal-vision ΔE 19.6. Yellow and magenta sit below 3:1
 * on white, so every state is also named with its count in the legend.
 */
const STATES: { key: MemoryState; label: string; color: string }[] = [
  { key: 'NEW', label: 'Mới', color: '#2a78d6' },
  { key: 'RELEARN', label: 'Học lại', color: '#e87ba4' },
  { key: 'LEARNING', label: 'Đang nhớ', color: '#eda100' },
  { key: 'MASTERED', label: 'Đã thuộc', color: '#008300' },
]

const SIZE = 132
const STROKE = 16
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/** Surface gap between two segments, in px along the ring. */
const GAP = 3

/** The cards due today split by memory state, as a ring with the total inside and a legend naming each state. */
export const DueMemoryRing: React.FC<{ states: MemoryState[] }> = ({ states }) => {
  const [active, setActive] = useState<MemoryState | null>(null)
  const total = states.length

  const slices = useMemo(() => {
    const counts = new Map<MemoryState, number>()
    for (const state of states) counts.set(state, (counts.get(state) ?? 0) + 1)
    return STATES.filter((s) => counts.has(s.key)).map((s) => ({ ...s, count: counts.get(s.key)! }))
  }, [states])

  if (total === 0) return null

  // One segment fills the ring; several share it minus a gap after each, the first starting at 12 o'clock.
  const several = slices.length > 1
  const usable = CIRCUMFERENCE - (several ? GAP * slices.length : 0)
  let offset = several ? GAP / 2 : 0
  const arcs = slices.map((slice) => {
    const length = Math.max((slice.count / total) * usable, 1)
    const arc = { ...slice, length, start: offset }
    offset += length + (several ? GAP : 0)
    return arc
  })

  const focused = slices.find((s) => s.key === active)
  const percent = (count: number) => Math.round((count / total) * 100)

  return (
    <figure className="mt-4 flex items-center gap-4" aria-label="Thẻ cần ôn hôm nay theo mức độ ghi nhớ">
      <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f1f0ec" strokeWidth={STROKE} />
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={active === arc.key ? STROKE + 4 : STROKE}
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={-arc.start}
              opacity={active && active !== arc.key ? 0.35 : 1}
              className="cursor-pointer transition-[opacity,stroke-width] duration-150"
              onMouseEnter={() => setActive(arc.key)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
        {/* The total, or the hovered state's share, in the middle. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums leading-none text-slate-900">{focused ? focused.count : total}</span>
          <span className="mt-1 text-[11px] font-medium text-slate-500">
            {focused ? `${focused.label} · ${percent(focused.count)}%` : 'thẻ cần ôn'}
          </span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1">
        {STATES.map((s) => {
          const count = slices.find((slice) => slice.key === s.key)?.count ?? 0
          return (
            <li
              key={s.key}
              onMouseEnter={() => count > 0 && setActive(s.key)}
              onMouseLeave={() => setActive(null)}
              className={`flex items-center gap-2 rounded-lg px-1.5 py-0.5 text-sm transition-opacity ${
                (active && active !== s.key) || count === 0 ? 'opacity-50' : ''
              }`}
            >
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
              <span className="font-medium text-slate-700">{s.label}</span>
              <span className="ml-auto tabular-nums text-slate-900">{count}</span>
              <span className="w-9 text-right text-xs tabular-nums text-slate-400">{percent(count)}%</span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
