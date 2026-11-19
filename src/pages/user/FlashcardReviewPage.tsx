import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Layers, LoaderCircle, Play, RotateCw } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { LessonFrame } from '@/components/learningpath/LessonFrame'
import { getDecks } from '@/api/deckApi'
import { getDueFlashcards, rateVocabulary, type SrsCard, type SrsRating } from '@/api/srsApi'
import {
  ExampleSentence,
  FlipCard,
  isCardShortcut,
  RATING_BUTTONS,
  RatingButtons,
  WordAudio,
  MeasureWordList,
  formatNextReview,
} from '@/components/flashcard/FlashcardParts'
import { LevelMeaningBlock } from '@/components/flashcard/LevelMeaning'
import { AudioButton } from '@/components/ui/AudioButton'
import { WordDetailModal } from '@/components/vocabulary/word-detail/WordDetailModal'

const RELEARN_DELAY_MS = 10 * 60 * 1000

interface QueueItem {
  card: SrsCard
  availableAt: number
}

const displayHanzi = (hanzi: string) => hanzi.replace(/[0-9]+$/, '')

/** Layout shared by both faces of the card. */
const FACE = 'flex min-h-72 w-full flex-col items-center justify-center rounded-2xl px-6 py-10 text-center transition-colors'

/**
 * The flip-card review on a page of its own, without the menus: only the cards, a way out and the progress on top,
 * and the flip or rating buttons at the bottom. ?deck=<id> reviews the due cards of one deck, otherwise all due cards.
 */
export const FlashcardReviewPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/flashcards" replace />
  return <Review />
}

const Review: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const deckId = Number(searchParams.get('deck')) || undefined
  const [deckName, setDeckName] = useState('')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  /** Cards of this session rated anything but "Học lại", for the progress bar. */
  const [done, setDone] = useState(0)
  /** First the learner looks over the words due, then the flip cards start. */
  const [stage, setStage] = useState<'preview' | 'cards'>('preview')
  const [openWordId, setOpenWordId] = useState<number | null>(null)
  const total = useRef(0)

  const loadCards = useCallback(() => {
    setLoading(true)
    getDueFlashcards(deckId)
      .then((items) => {
        const t = Date.now()
        setQueue(items.map((card) => ({ card, availableAt: t })))
        total.current = items.length
        setDone(0)
        setStage('preview')
        setRevealed(false)
        setError('')
        setNotice('')
      })
      .catch(() => setError('Không tải được thẻ cần ôn. Hãy thử tải lại trang.'))
      .finally(() => setLoading(false))
  }, [deckId])

  useEffect(loadCards, [loadCards])
  useEffect(() => {
    if (!deckId) return
    getDecks()
      .then((decks) => setDeckName(decks.find((d) => d.id === deckId)?.name ?? ''))
      .catch(() => setDeckName(''))
  }, [deckId])

  // "Học lại" cards are appended with a later availableAt, so the queue stays
  // ordered by availability and the head is always the card to show (relearn
  // cards come back after 10 minutes, or early once nothing else is left).
  const current: QueueItem | undefined = queue[0]

  const review = useCallback(
    async (rating: SrsRating) => {
      if (!current || saving) return
      setSaving(true)
      try {
        const updated = await rateVocabulary(current.card.vocabularyId, rating)
        setQueue((prev) => {
          const rest = prev.filter((q) => q !== current)
          return rating === 'AGAIN'
            ? [...rest, { card: current.card, availableAt: Date.now() + RELEARN_DELAY_MS }]
            : rest
        })
        if (rating !== 'AGAIN') setDone((d) => d + 1)
        setNotice(`${displayHanzi(current.card.hanzi)}: ${formatNextReview(rating, updated?.intervalDays)}`)
        setRevealed(false)
        setError('')
      } catch {
        setError('Chưa lưu được lượt ôn. Hãy thử lại.')
      } finally {
        setSaving(false)
      }
    },
    [current, saving]
  )

  // Keyboard: Space/Enter = lật thẻ (cả hai chiều), 1-4 = chọn mức độ.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stage !== 'cards' || !current || !isCardShortcut(e)) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setRevealed((r) => !r)
        return
      }
      if (!revealed) return
      const btn = RATING_BUTTONS.find((b) => b.key === e.key)
      if (btn) review(btn.rating)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, current, revealed, review])

  const exitTo = deckId ? `/flashcards/decks/${deckId}` : '/flashcards'
  const label = deckId ? `Ôn bộ: ${deckName || '…'}` : 'Ôn thẻ đến hạn'
  const progress = total.current > 0 ? done / total.current : undefined

  const previewing = stage === 'preview' && queue.length > 0
  const footer = previewing ? (
    <button
      type="button"
      onClick={() => setStage('cards')}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8322B] px-4 py-3.5 text-sm font-semibold text-white hover:bg-red-800"
    >
      <Play className="h-4 w-4" aria-hidden />
      Bắt đầu ôn {queue.length} thẻ
    </button>
  ) : current ? (
    <>
      {revealed ? (
        <RatingButtons disabled={saving} onRate={review} />
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="w-full rounded-xl bg-[#C8322B] px-4 py-3.5 text-sm font-semibold text-white hover:bg-red-800"
        >
          Lật thẻ
        </button>
      )}
      {saving && (
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          Đang lưu kết quả...
        </p>
      )}
    </>
  ) : undefined

  return (
    <LessonFrame
      label={label}
      progress={previewing ? undefined : progress}
      counter={!previewing && total.current ? `${done}/${total.current}` : undefined}
      exitTo={exitTo}
      footer={footer}
    >
      {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {openWordId !== null && <WordDetailModal vocabularyId={openWordId} onClose={() => setOpenWordId(null)} />}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải thẻ...
        </div>
      ) : previewing ? (
        <PreviewList cards={queue.map((q) => q.card)} onOpenWord={setOpenWordId} />
      ) : current ? (
        <>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{notice || 'Bấm vào thẻ hoặc nhấn Space để lật'}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              HSK {current.card.levelCode || current.card.hskLevel || '—'}
            </span>
          </div>
          <FlipCard
            key={`${current.card.vocabularyId}-${current.availableAt}`}
            flipped={revealed}
            onFlip={() => setRevealed((r) => !r)}
            className="my-5"
            frontClassName={`${FACE} bg-white shadow-sm hover:bg-slate-50`}
            backClassName={`${FACE} border border-slate-200 bg-white shadow-sm`}
            front={
              <>
                <span className="font-chinese text-7xl font-bold tracking-wide text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {displayHanzi(current.card.hanzi)}
                </span>
                <WordAudio hanzi={displayHanzi(current.card.hanzi)} audioUrl={current.card.audioUrl} />
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <BookOpen className="h-4 w-4" />
                  Bấm để xem pinyin và nghĩa
                </span>
              </>
            }
            back={
              <>
                <span className="font-chinese text-6xl font-bold tracking-wide text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  {displayHanzi(current.card.hanzi)}
                </span>
                <WordAudio hanzi={displayHanzi(current.card.hanzi)} audioUrl={current.card.audioUrl} />
                <p className="mt-4 text-lg font-semibold text-[#C8322B]">{current.card.pinyin}</p>
                <LevelMeaningBlock levelMeaning={current.card.levelMeaning} meaningVi={current.card.meaningVi} partOfSpeech={current.card.partOfSpeech} />
                <MeasureWordList items={current.card.measureWords} />
                <ExampleSentence
                  word={displayHanzi(current.card.hanzi)}
                  sentence={current.card.exampleSentence}
                  pinyin={current.card.examplePinyin}
                  translation={current.card.exampleTranslation}
                  audioUrl={current.card.exampleAudioUrl}
                />
              </>
            }
          />
        </>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-800">
            {total.current > 0 ? 'Bạn đã ôn xong!' : 'Không có thẻ nào đến hạn'}
            {deckId && deckName ? ` (${deckName})` : ''}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {total.current > 0 ? `Đã ôn ${done} thẻ trong lượt này.` : 'Quay lại sau, hoặc thêm từ vào thư mục để ôn tiếp.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => navigate(exitTo)} className="rounded-xl bg-[#C8322B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800">
              {deckId ? 'Về thư mục' : 'Về trang Flashcard'}
            </button>
            <button type="button" onClick={loadCards} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <RotateCw className="h-4 w-4" />
              Tải lại
            </button>
          </div>
        </div>
      )}
    </LessonFrame>
  )
}

/** The words due, to look over before the cards: character, reading, meaning and sound; tap one for its detail. */
const PreviewList: React.FC<{ cards: SrsCard[]; onOpenWord: (id: number) => void }> = ({ cards, onOpenWord }) => (
  <div>
    <h1 className="text-xl font-bold text-slate-800">Xem lại trước khi ôn</h1>
    <p className="mt-1 text-sm text-slate-500">
      {cards.length} từ đang chờ bạn. Đọc qua một lượt, bấm vào từ để xem chi tiết, rồi bắt đầu ôn bằng thẻ lật.
    </p>
    <ul className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {cards.map((card) => (
        <li key={card.cardId} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
          <button
            type="button"
            onClick={() => onOpenWord(card.vocabularyId)}
            title="Xem chi tiết từ"
            className="flex min-w-0 flex-1 items-baseline gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#C8322B]/30"
          >
            <span className="font-chinese text-2xl font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              {displayHanzi(card.hanzi)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#C8322B]">{card.levelMeaning?.pinyin || card.pinyin}</span>
              <span className="block truncate text-sm text-slate-600">
                {card.levelMeaning?.main || card.meaningVi?.split(/[;；]/)[0]?.trim() || ''}
              </span>
            </span>
          </button>
          {(card.levelCode || card.hskLevel) && (
            <span className="hidden flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 sm:inline">
              HSK {card.levelCode || card.hskLevel}
            </span>
          )}
          <AudioButton audioUrl={card.audioUrl} text={displayHanzi(card.hanzi)} size="md" title="Nghe phát âm" className="flex-shrink-0" />
        </li>
      ))}
    </ul>
  </div>
)

export default FlashcardReviewPage
