import React from 'react'
import { NEUTRAL_TONE, TONES } from '@/data/pinyin'
import { contourPath } from '@/lib/pinyinTools'
import { TONE_STYLE } from './toneStyle'

const LEVELS = [1, 2, 3, 4, 5]

/** The four tones as pitch contours on a 1-5 scale, plus the neutral tone. */
export const ToneChart: React.FC<{ onPickChar?: (hanzi: string, pinyin?: string) => void }> = ({ onPickChar }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {TONES.map((tone) => {
        const style = TONE_STYLE[tone.tone]
        return (
          <article key={tone.tone} className={`rounded-3xl border-2 p-4 ${style.tint}`}>
            <div className={`text-3xl font-extrabold leading-tight ${style.text}`}>{tone.mark}</div>
            <svg viewBox="0 0 120 100" className="my-2 block h-auto w-full" role="img" aria-label={`${tone.name}: đường cao độ trên thang 1 đến 5`}>
              <g className="stroke-current text-slate-300" strokeWidth="1">
                {LEVELS.map((level) => <path key={level} d={`M14 ${90 - (level - 1) * 20}H106`} />)}
              </g>
              <path d={contourPath(tone.contour)} className={`animate-draw-line fill-none ${style.line}`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="font-extrabold leading-snug text-slate-900">{tone.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{tone.hint}</p>
            <button
              type="button"
              onClick={() => onPickChar?.(tone.example.hanzi, tone.example.pinyin)}
              className={`mt-2 flex items-baseline gap-2 rounded-xl font-bold leading-snug ${style.text} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300`}
              aria-label={`Viết chữ ${tone.example.hanzi}, ${tone.example.pinyin}, ${tone.example.meaning}`}
            >
              <span>{tone.example.pinyin}</span>
              <span className="font-chinese text-2xl text-slate-900">{tone.example.hanzi}</span>
              <span className="text-sm font-medium text-slate-500">{tone.example.meaning}</span>
            </button>
          </article>
        )
      })}
    </div>
    <div className="card-soft flex flex-wrap items-center gap-4 p-4">
      <span className={`grid h-14 w-14 place-items-center rounded-2xl ${TONE_STYLE[5].tint} border-2`}>
        <span className="font-chinese text-2xl">{NEUTRAL_TONE.example.hanzi}</span>
      </span>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700"><b>{NEUTRAL_TONE.name}</b>. {NEUTRAL_TONE.hint}</p>
    </div>
    <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
      Hình vẽ theo thang cao độ 1 đến 5. So sánh với dấu tiếng Việt chỉ để dễ nhớ: tiếng Trung đổi cao độ, không đổi cách bật hơi.
    </p>
  </div>
)
