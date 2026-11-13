import React from 'react'
import { STROKE_RULES } from '@/data/pinyin'

/** The eight stroke-order rules, each with an example the learner can open on the desk. */
export const StrokeRules: React.FC<{ onPickChar: (hanzi: string) => void }> = ({ onPickChar }) => (
  <ol className="grid gap-2">
    {STROKE_RULES.map((rule, index) => (
      <li key={rule.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-rose-50 text-sm font-extrabold text-brand">{index + 1}</span>
        <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-800">{rule.title}</span>
        <span className="flex gap-1">
          {[...rule.examples.replace(' ', '')].map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => onPickChar(char)}
              aria-label={`Xem bút thuận chữ ${char}`}
              className="font-chinese grid h-11 w-11 place-items-center rounded-xl text-2xl text-slate-800 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
            >
              {char}
            </button>
          ))}
        </span>
      </li>
    ))}
  </ol>
)
