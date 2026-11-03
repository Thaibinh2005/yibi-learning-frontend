import React from 'react'
import { Quote, Ruler } from 'lucide-react'
import { AudioButton } from '@/components/ui/AudioButton'
import type { SrsRating } from '@/api/srsApi'
import type { MeasureWord } from '@/types/vocabulary'

export const RATING_BUTTONS: {
  rating: SrsRating
  label: string
  hint: string
  key: string
  className: string
}[] = [
  { rating: 'AGAIN', label: 'Học lại', hint: '10 phút', key: '1', className: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' },
  { rating: 'HARD', label: 'Khó', hint: '1-3 ngày', key: '2', className: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
  { rating: 'GOOD', label: 'Tốt', hint: '1-4 ngày', key: '3', className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
  { rating: 'EASY', label: 'Dễ', hint: '1-7 ngày', key: '4', className: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200' },
]

export const formatNextReview = (rating: SrsRating, intervalDays?: number | null) => {
  if (rating === 'AGAIN' || !intervalDays) return 'Ôn lại sau 10 phút'
  return `Ôn lại sau ${intervalDays} ngày`
}

export const RatingButtons: React.FC<{
  disabled?: boolean
  onRate: (rating: SrsRating) => void
}> = ({ disabled, onRate }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {RATING_BUTTONS.map((b) => (
      <button
        key={b.rating}
        type="button"
        disabled={disabled}
        onClick={() => onRate(b.rating)}
        className={`flex flex-col items-center rounded-xl border px-2 py-3 transition-colors disabled:opacity-50 ${b.className}`}
      >
        <span className="text-sm font-bold">{b.label}</span>
        <span className="mt-0.5 text-[11px] font-medium opacity-80">{b.hint}</span>
        <span className="mt-1 hidden text-[10px] opacity-50 sm:block">phím {b.key}</span>
      </button>
    ))}
  </div>
)

/**
 * Word pronunciation button shown on both card faces. Uses the MinIO audio when
 * available, otherwise the browser's Chinese voice (AudioButton fallback).
 * AudioButton stops click propagation, so it never flips the card.
 */
export const WordAudio: React.FC<{ hanzi: string; audioUrl?: string | null }> = ({ hanzi, audioUrl }) => (
  <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-stone-500">
    <AudioButton audioUrl={audioUrl} text={hanzi} size="lg" title="Nghe phát âm từ" />
    Nghe phát âm
  </span>
)

/** Example sentence shown on the back of a flashcard; the word is highlighted. */
export const ExampleSentence: React.FC<{
  word: string
  sentence?: string | null
  pinyin?: string | null
  translation?: string | null
  audioUrl?: string | null
}> = ({ word, sentence, pinyin, translation, audioUrl }) => {
  if (!sentence) return null
  const parts = word ? sentence.split(word) : [sentence]
  return (
    <div className="mt-5 w-full max-w-md border-t border-stone-200 pt-4 text-left">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
          <Quote className="h-3 w-3" />
          Ví dụ
        </p>
        {/* Falls back to the browser's Chinese voice when no MinIO audio exists yet. */}
        <AudioButton audioUrl={audioUrl} text={sentence} size="sm" title="Nghe câu ví dụ" />
      </div>
      <p className="text-base leading-relaxed text-stone-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && <span className="font-bold text-[#B52A2A]">{word}</span>}
          </React.Fragment>
        ))}
      </p>
      {pinyin && <p className="mt-1 text-xs text-stone-500">{pinyin}</p>}
      {translation && <p className="mt-1 text-sm italic text-stone-600">{translation}</p>}
    </div>
  )
}

/**
 * Measure words (量词) of a noun with a ready-made "一 + 量词 + 名词" example.
 * Renders nothing when the word has no measure word.
 */
export const MeasureWordList: React.FC<{ items?: MeasureWord[] | null; className?: string }> = ({
  items,
  className = 'mt-4 w-full max-w-md',
}) => {
  if (!items || items.length === 0) return null
  return (
    <div className={`${className} rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-3 text-left`}>
      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
        <Ruler className="h-3 w-3" />
        Lượng từ
      </p>
      <ul className="space-y-2">
        {items.map((mw) => (
          <li key={mw.measureWord} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-stone-800">
                <span className="text-lg font-bold text-amber-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {mw.measureWord}
                </span>
                {mw.measureWordTraditional && (
                  <span className="ml-1 text-xs text-stone-400">({mw.measureWordTraditional})</span>
                )}
                <span className="ml-1.5 font-semibold text-amber-700">{mw.pinyin}</span>
                {mw.meaningVi && <span className="ml-1.5 text-xs text-stone-600">— {mw.meaningVi}</span>}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                Ví dụ:{' '}
                <span className="text-sm text-stone-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {mw.examplePhrase}
                </span>{' '}
                <span className="italic">{mw.examplePinyin}</span>
              </p>
            </div>
            <AudioButton text={mw.examplePhrase} size="sm" title="Nghe ví dụ lượng từ" className="mt-1 flex-shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  )
}
