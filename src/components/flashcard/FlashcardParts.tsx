import React from 'react'
import { HighlightWord } from '@/components/ui/HighlightWord'
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
 * A card that turns over in 3D between its front and back. Clicking anywhere on it turns it; buttons inside (audio)
 * stop the click themselves. The hidden face is inert, so its buttons cannot be focused or clicked through.
 * Give it a `key` per card: a new card then starts on its front at once instead of turning back while already
 * showing the next card's answer.
 */
export const FlipCard: React.FC<{
  flipped: boolean
  onFlip: () => void
  front: React.ReactNode
  back: React.ReactNode
  frontClassName?: string
  backClassName?: string
  className?: string
}> = ({ flipped, onFlip, front, back, frontClassName = '', backClassName = '', className = '' }) => (
  <div
    role="button"
    tabIndex={0}
    aria-pressed={flipped}
    aria-label={flipped ? 'Lật về mặt trước' : 'Lật thẻ để xem nghĩa'}
    onClick={onFlip}
    className={`flip-card cursor-pointer select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#C8322B]/40 ${className}`}
  >
    <div className={`flip-card-inner ${flipped ? 'is-flipped' : ''}`}>
      <div className={`flip-card-face ${frontClassName}`} aria-hidden={flipped} inert={flipped}>
        {front}
      </div>
      <div className={`flip-card-face flip-card-back ${backClassName}`} aria-hidden={!flipped} inert={!flipped}>
        {back}
      </div>
    </div>
  </div>
)

/**
 * Whether a key press belongs to the flashcard shortcuts: not typed in a field, not on another button or link (only
 * for Enter/Space, which must keep doing their own job there), not held down and without Ctrl/Alt/Cmd.
 */
export const isCardShortcut = (e: KeyboardEvent) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return false
  const target = e.target as HTMLElement | null
  if (!target || target === document.body) return true
  if (target.isContentEditable || target.closest('input, textarea, select')) return false
  // Keys pressed in a dialog over the card (the word detail) are the dialog's.
  if (target.closest('[role="dialog"]')) return false
  // Digits do nothing on a button, so 1-4 rate the card wherever the focus is.
  if (e.key !== ' ' && e.key !== 'Enter') return true
  if (target.closest('.flip-card')) return target.classList.contains('flip-card')
  return !target.closest('button, a, [role="button"]')
}

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
  return (
    <div className="mt-5 w-full max-w-md border-t border-stone-200 pt-4 text-left">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
          <Quote className="h-3.5 w-3.5" />
          Ví dụ
        </p>
        {/* Falls back to the browser's Chinese voice when no MinIO audio exists yet. */}
        <AudioButton audioUrl={audioUrl} text={sentence} size="sm" title="Nghe câu ví dụ" />
      </div>
      <p className="font-chinese text-xl leading-relaxed text-stone-900">
        <HighlightWord sentence={sentence} word={word} />
      </p>
      {pinyin && <p className="font-pinyin mt-1 text-sm text-stone-500">{pinyin}</p>}
      {translation && <p className="mt-1 text-base text-stone-700">{translation}</p>}
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
    <div className={`${className} rounded-2xl border border-amber-200/70 bg-amber-50/60 px-4 py-3.5 text-left`}>
      <p className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
        <Ruler className="h-3.5 w-3.5" />
        Lượng từ
      </p>
      <ul className="divide-y divide-amber-200/60">
        {items.map((mw) => (
          <li key={mw.measureWord} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-chinese text-3xl font-bold leading-none text-amber-800">{mw.measureWord}</span>
                {mw.measureWordTraditional && (
                  <span className="font-chinese text-base text-stone-400">({mw.measureWordTraditional})</span>
                )}
                <span className="font-pinyin text-base font-semibold text-amber-700">{mw.pinyin}</span>
              </p>
              {mw.meaningVi && <p className="mt-1 text-sm leading-snug text-stone-700">{mw.meaningVi}</p>}
              <div className="mt-2 rounded-xl bg-white/80 px-3 py-2">
                <p className="font-chinese text-xl font-semibold text-stone-900">
                  <HighlightWord sentence={mw.examplePhrase} word={mw.measureWord} className="text-amber-700 underline decoration-amber-500 decoration-2 underline-offset-4" />
                </p>
                <p className="mt-0.5 text-sm text-amber-700/90">{mw.examplePinyin}</p>
                {mw.exampleTranslation && <p className="mt-0.5 text-sm text-stone-600">{mw.exampleTranslation}</p>}
              </div>
            </div>
            <AudioButton text={mw.examplePhrase} size="md" title="Nghe ví dụ lượng từ" className="mt-1 flex-shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  )
}
