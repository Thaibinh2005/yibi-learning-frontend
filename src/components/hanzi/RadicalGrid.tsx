import React, { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { RADICALS, STROKE_STEPS } from '@/data/radicals'
import type { Radical } from '@/data/radicals'

interface Props {
  selected: string | null
  learned: Set<string>
  onSelect: (radical: Radical) => void
}

/** Steps 1 to 7 are single stroke counts; the last step gathers every radical with 8 strokes or more. */
const STEPS = [...STROKE_STEPS.filter((n) => n <= 7), 8]
const inStep = (radical: Radical, step: number) => (step === 8 ? radical.strokes >= 8 : radical.strokes === step)

/** The 214 Kangxi radicals by stroke count, simple to hard. */
export const RadicalGrid: React.FC<Props> = ({ selected, learned, onSelect }) => {
  const firstOpen = STEPS.find((step) => RADICALS.filter((r) => inStep(r, step)).some((r) => !learned.has(r.char))) ?? 1
  const [step, setStep] = useState(() => {
    const open = RADICALS.find((r) => r.char === selected)
    return open ? (open.strokes >= 8 ? 8 : open.strokes) : firstOpen
  })

  const groups = useMemo(() => {
    const byStrokes = new Map<number, Radical[]>()
    RADICALS.filter((r) => inStep(r, step)).forEach((r) => byStrokes.set(r.strokes, [...(byStrokes.get(r.strokes) ?? []), r]))
    return [...byStrokes.entries()]
  }, [step])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo số nét">
        <span className="mr-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">Số nét</span>
        {STEPS.map((value) => {
          const all = RADICALS.filter((r) => inStep(r, value))
          const done = all.every((r) => learned.has(r.char))
          const on = value === step
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() => setStep(value)}
              className={`relative grid h-11 min-w-11 place-items-center rounded-2xl border-2 px-2 font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                on ? 'border-brand bg-brand text-white' : done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {value === 8 ? '8+' : value}
              <span className={`absolute bottom-0.5 right-1.5 text-xs font-bold tabular-nums ${on ? 'text-white/80' : 'text-slate-400'}`}>{all.length}</span>
            </button>
          )
        })}
      </div>

      {groups.map(([strokes, radicals]) => {
        const done = radicals.filter((r) => learned.has(r.char)).length
        return (
          <section key={strokes} className="mt-6">
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-base font-extrabold text-slate-900">{strokes} nét</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${done === radicals.length ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-brand'}`}>
                {done}/{radicals.length} đã học
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {radicals.map((radical) => {
                const isSelected = radical.char === selected
                const isLearned = learned.has(radical.char)
                return (
                  <li key={radical.char}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelect(radical)}
                      className={`relative flex w-full flex-col items-start rounded-3xl border-2 p-3.5 text-left transition-[box-shadow,border-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                        isSelected ? 'border-brand bg-rose-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <span className="font-chinese text-5xl leading-tight text-slate-900">{radical.char}</span>
                      <span className="mt-0.5 font-bold leading-snug text-brand">{radical.pinyin}</span>
                      <span className="text-sm font-bold leading-snug text-slate-800">{radical.hanViet}</span>
                      <span className="text-xs leading-snug text-slate-500">{radical.meaning}</span>
                      {isLearned ? (
                        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white" >
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                          <span className="sr-only">Đã học</span>
                        </span>
                      ) : radical.alt ? (
                        <span className="font-chinese absolute right-3 top-3 text-sm text-slate-400">{radical.alt}<span className="sr-only"> là dạng khác của bộ này</span></span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
