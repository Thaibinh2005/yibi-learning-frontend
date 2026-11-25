import React from 'react'
import { AudioButton } from '@/components/ui/AudioButton'
import { TONE_STYLE } from '@/components/hanzi/toneStyle'
import { toneOf } from '@/lib/pinyinTools'
import { grammarLabel } from '@/lib/grammarLabels'
import type { GrammarPoint } from '@/types/grammar'

/** Pinyin with each syllable in the colour of its tone; the tone mark stays on the syllable, so colour is never alone. */
const Pinyin: React.FC<{ text: string }> = ({ text }) => (
  <span className="font-pinyin text-sm">
    {text.split(/\s+/).filter(Boolean).map((token, i) => {
      const [, letters = token, rest = ''] = token.match(/^(\p{L}+)(.*)$/u) ?? []
      return (
        <span key={i}>
          <span className={`font-semibold ${TONE_STYLE[toneOf(letters)].text}`}>{letters}</span>
          {rest && <span className="text-slate-400">{rest}</span>}{' '}
        </span>
      )
    })}
  </span>
)

/** One grammar point of a lesson: the written note when there is one, else the syllabus line with its labels in Vietnamese. */
export const LessonGrammarCard: React.FC<{ point: GrammarPoint; showDraft?: boolean }> = ({ point, showDraft = false }) => {
  const { note } = point
  const labels = [point.category, point.categoryName, point.subcategory].map(grammarLabel).filter(Boolean)

  if (!note) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        {labels.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
            {labels.map((label, i) => (
              <React.Fragment key={`${label}-${i}`}>
                {i > 0 && <span aria-hidden className="text-slate-300">›</span>}
                <span>{label}</span>
              </React.Fragment>
            ))}
          </p>
        )}
        <p className="font-chinese mt-1.5 text-lg font-semibold leading-relaxed text-slate-800">{point.content}</p>
        <p className="mt-1 text-xs text-slate-400">Điểm này chưa có phần giải thích.</p>
      </article>
    )
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-lg font-bold leading-snug text-slate-800">{note.title}</h3>
        {note.structure && <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-mono text-sm font-semibold text-slate-700">{note.structure}</span>}
        {showDraft && note.status === 'DRAFT' && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500" title="Nội dung đang chờ được kiểm duyệt">Bản nháp</span>}
      </div>

      {labels.length > 0 && <p className="mt-1 text-xs text-slate-400">{labels.join(' › ')}</p>}
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{note.explanation}</p>

      {note.examples.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
          {note.examples.map((example, i) => (
            <li key={i} className="flex items-start gap-3 py-3">
              <AudioButton text={example.zh} size="sm" title="Nghe câu ví dụ" className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-chinese text-lg leading-snug text-slate-900">{example.zh}</p>
                <p className="mt-0.5 leading-snug"><Pinyin text={example.pinyin} /></p>
                <p className="mt-0.5 text-sm text-slate-600">{example.vi}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
