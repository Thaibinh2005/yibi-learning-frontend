import React, { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Layers, LoaderCircle, RotateCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDueFlashcards, rateVocabulary, type SrsCard, type SrsRating } from '@/api/srsApi'
import {
  ExampleSentence,
  RATING_BUTTONS,
  RatingButtons,
  WordAudio,
  MeasureWordList,
  formatNextReview,
} from '@/components/flashcard/FlashcardParts'

const RELEARN_DELAY_MS = 10 * 60 * 1000

interface QueueItem {
  card: SrsCard
  availableAt: number
}

const displayHanzi = (hanzi: string) => hanzi.replace(/[0-9]+$/, '')

export const FlashcardPage: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadCards = () => {
    setLoading(true)
    getDueFlashcards()
      .then((items) => {
        const t = Date.now()
        setQueue(items.map((card) => ({ card, availableAt: t })))
        setRevealed(false)
        setError('')
        setNotice('')
      })
      .catch(() => setError('Không tải được bộ flashcard. Hãy đăng nhập và thử tải lại trang.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCards()
  }, [])

  // "Học lại" cards are appended with a later availableAt, so the queue stays
  // ordered by availability and the head is always the card to show (relearn
  // cards come back after 10 minutes, or early once nothing else is left).
  const current: QueueItem | undefined = queue[0]

  const review = useCallback(
    async (rating: SrsRating) => {
      if (!current || reviewing) return
      setReviewing(true)
      try {
        const updated = await rateVocabulary(current.card.vocabularyId, rating)
        setQueue((prev) => {
          const rest = prev.filter((q) => q !== current)
          return rating === 'AGAIN'
            ? [...rest, { card: current.card, availableAt: Date.now() + RELEARN_DELAY_MS }]
            : rest
        })
        setNotice(`${displayHanzi(current.card.hanzi)}: ${formatNextReview(rating, updated?.intervalDays)}`)
        setRevealed(false)
        setError('')
      } catch {
        setError('Chưa lưu được lượt ôn. Hãy thử lại.')
      } finally {
        setReviewing(false)
      }
    },
    [current, reviewing]
  )

  // Keyboard: Space/Enter = lật thẻ, 1-4 = chọn mức độ.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setRevealed(true)
        return
      }
      if (!revealed) return
      const btn = RATING_BUTTONS.find((b) => b.key === e.key)
      if (btn) review(btn.rating)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, revealed, review])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div>
          <Link to="/courses" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#C8322B]">
            <ArrowLeft className="h-3.5 w-3.5" />
            Trở lại bài học
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Flashcard của bạn</h1>
          <p className="mt-1 text-xs text-slate-500">Ôn các từ đã lưu theo lịch lặp lại ngắt quãng.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-[#C8322B]">
          <Layers className="h-4 w-4" />
          {queue.length} thẻ đến hạn
        </span>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải flashcard...
        </div>
      ) : current ? (
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{notice || 'Bấm vào thẻ hoặc nhấn Space để lật'}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              HSK {current.card.levelCode || current.card.hskLevel || '—'}
            </span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setRevealed(true)}
            className="my-8 flex min-h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 py-8 text-center hover:bg-slate-100"
          >
            <span className="font-chinese text-6xl font-bold tracking-wide text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              {displayHanzi(current.card.hanzi)}
            </span>
            <WordAudio hanzi={displayHanzi(current.card.hanzi)} audioUrl={current.card.audioUrl} />
            {revealed ? (
              <>
                <p className="mt-4 text-lg font-semibold text-[#C8322B]">{current.card.pinyin}</p>
                <p className="mt-1 text-sm text-slate-600">{current.card.meaningVi || 'Chưa có nghĩa tiếng Việt'}</p>
                {current.card.partOfSpeech && (
                  <span className="mt-2 text-xs font-medium italic text-slate-400">({current.card.partOfSpeech})</span>
                )}
                <MeasureWordList items={current.card.measureWords} />
                <ExampleSentence
                  word={displayHanzi(current.card.hanzi)}
                  sentence={current.card.exampleSentence}
                  pinyin={current.card.examplePinyin}
                  translation={current.card.exampleTranslation}
                  audioUrl={current.card.exampleAudioUrl}
                />
              </>
            ) : (
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                <BookOpen className="h-4 w-4" />
                Bấm để xem pinyin và nghĩa
              </span>
            )}
          </div>
          {revealed ? (
            <RatingButtons disabled={reviewing} onRate={review} />
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl bg-[#C8322B] px-4 py-3 text-sm font-semibold text-white hover:bg-red-800"
            >
              Lật thẻ
            </button>
          )}
          {reviewing && (
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              Đang lưu kết quả...
            </p>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-bold text-slate-800">Bạn đã ôn hết thẻ đến hạn</h2>
          <p className="mt-2 text-sm text-slate-500">
            Học thêm từ theo chủ đề hoặc từ một bài học, rồi quay lại sau để ôn tiếp.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/vocabulary/topic" className="inline-flex items-center gap-2 rounded-xl bg-[#C8322B] px-4 py-2.5 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4" />
              Từ vựng theo chủ đề
            </Link>
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
              Chọn bài học
            </Link>
          </div>
          <button onClick={loadCards} className="mx-auto mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">
            <RotateCw className="h-3.5 w-3.5" />
            Tải lại
          </button>
        </div>
      )}
    </div>
  )
}
