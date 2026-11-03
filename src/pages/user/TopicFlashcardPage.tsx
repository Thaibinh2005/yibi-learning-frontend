import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Eye, Layers, LoaderCircle, RotateCcw, Sparkles, Trophy } from 'lucide-react'
import { getTopicBySlug, getVocabulariesByTopic } from '@/api/topicApi'
import { rateVocabulary, type SrsRating } from '@/api/srsApi'
import {
  ExampleSentence,
  RATING_BUTTONS,
  RatingButtons,
  WordAudio,
  MeasureWordList,
  formatNextReview,
} from '@/components/flashcard/FlashcardParts'
import type { VocabTopic } from '@/types/topic'
import type { Vocabulary } from '@/types/vocabulary'

const PAGE_SIZE = 100
const MAX_PAGES = 20
const RELEARN_DELAY_MS = 10 * 60 * 1000

interface QueueItem {
  /** Unique per queue entry so a card can be pinned while it is on screen. */
  key: number
  vocab: Vocabulary
  /** Earliest time this card should be shown again (ms since epoch). */
  availableAt: number
}

/** Pick the first card that is due; if none is due yet, show the one due soonest. */
const pickNext = (queue: QueueItem[], now: number): QueueItem | undefined => {
  if (queue.length === 0) return undefined
  const due = queue.find((q) => q.availableAt <= now)
  if (due) return due
  return queue.reduce((best, q) => (q.availableAt < best.availableAt ? q : best))
}

/** Some sources number homographs (会1, 点1); never show the digit to learners. */
const displayHanzi = (hanzi: string) => hanzi.replace(/[0-9]+$/, '')

let queueKeySeq = 0

export const TopicFlashcardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const hskFilter = searchParams.get('hsk') || undefined
  const backTo = `/vocabulary/topic/${slug}${hskFilter ? `?hsk=${encodeURIComponent(hskFilter)}` : ''}`

  const [topic, setTopic] = useState<VocabTopic | null>(null)
  const [words, setWords] = useState<Vocabulary[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [counts, setCounts] = useState<Record<SrsRating, number>>({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 })
  const [now, setNow] = useState(() => Date.now())
  // Card currently on screen. Pinned until it is rated so the 10-minute timer
  // can never swap the card while the learner is reading it.
  const [currentKey, setCurrentKey] = useState<number | null>(null)

  const startSession = useCallback((list: Vocabulary[]) => {
    const t = Date.now()
    setQueue(list.map((vocab) => ({ key: ++queueKeySeq, vocab, availableAt: t })))
    setCurrentKey(null)
    setCounts({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 })
    setRevealed(false)
    setNotice('')
    setNow(t)
  }, [])

  /* Load topic + every word of the topic (paged). */
  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const topicRes = await getTopicBySlug(slug, hskFilter)
        if (!cancelled && topicRes.success) setTopic(topicRes.data)

        const all: Vocabulary[] = []
        for (let page = 0; page < MAX_PAGES; page++) {
          const res = await getVocabulariesByTopic(slug, page, PAGE_SIZE, hskFilter)
          if (!res.success || !Array.isArray(res.data)) break
          all.push(...res.data)
          if (res.data.length < PAGE_SIZE) break
        }
        if (!cancelled) {
          setWords(all)
          startSession(all)
        }
      } catch {
        if (!cancelled) setError('Không tải được từ vựng của chủ đề. Hãy thử tải lại trang.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, hskFilter, startSession])

  /* Tick so "Học lại" cards come back once their 10 minutes are up. */
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  const pinned = useMemo(() => queue.find((q) => q.key === currentKey), [queue, currentKey])
  const current = pinned ?? pickNext(queue, now)

  useEffect(() => {
    if (current && current.key !== currentKey) setCurrentKey(current.key)
  }, [current, currentKey])
  const learned = counts.HARD + counts.GOOD + counts.EASY
  const total = words.length

  const rate = useCallback(
    async (rating: SrsRating) => {
      if (!current || saving) return
      setSaving(true)
      setError('')
      let intervalDays: number | undefined
      try {
        const card = await rateVocabulary(current.vocab.id, rating)
        intervalDays = card?.intervalDays
      } catch {
        setError('Chưa lưu được kết quả lên máy chủ — tiến độ phiên học vẫn được giữ.')
      }
      const t = Date.now()
      setQueue((prev) => {
        const rest = prev.filter((q) => q.key !== current.key)
        return rating === 'AGAIN'
          ? [...rest, { key: ++queueKeySeq, vocab: current.vocab, availableAt: t + RELEARN_DELAY_MS }]
          : rest
      })
      setCurrentKey(null)
      setCounts((c) => ({ ...c, [rating]: c[rating] + 1 }))
      setNotice(`${displayHanzi(current.vocab.hanzi)}: ${formatNextReview(rating, intervalDays)}`)
      setRevealed(false)
      setNow(t)
      setSaving(false)
    },
    [current, saving]
  )

  /* Keyboard: Space/Enter = lật thẻ, 1-4 = chọn mức độ. */
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
      if (btn) rate(btn.rating)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, revealed, rate])

  const waitingMinutes =
    current && current.availableAt > now ? Math.ceil((current.availableAt - now) / 60000) : 0

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
        <div>
          <Link
            to={backTo}
            className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-[#B52A2A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Về chủ đề
          </Link>
          <h1 className="text-lg font-bold text-stone-800">
            {topic?.icon} Flashcard: {topic?.titleVi || 'Chủ đề'}
          </h1>
          {hskFilter && <p className="mt-0.5 text-xs font-medium text-stone-500">Chỉ các từ {hskFilter}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">Đã thuộc {learned}</span>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[#B52A2A]">
            <Layers className="h-3.5 w-3.5" />
            Còn {queue.length} / {total}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-[#B52A2A] transition-all duration-300"
            style={{ width: `${(learned / total) * 100}%` }}
          />
        </div>
      )}

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-stone-200 bg-white p-16 text-sm text-stone-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải flashcard...
        </div>
      ) : current ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{notice || 'Bấm vào thẻ hoặc nhấn Space để lật'}</span>
            {current.vocab.levelCode && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-semibold text-stone-600">
                HSK {current.vocab.levelCode}
              </span>
            )}
          </div>

          {waitingMinutes > 0 && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              Bạn đã đi hết các thẻ mới — thẻ này còn {waitingMinutes} phút nữa mới đến lượt, ôn sớm cũng được.
            </p>
          )}

          <div
            role="button"
            tabIndex={0}
            onClick={() => setRevealed(true)}
            className="my-6 flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-stone-50 px-5 py-8 text-center transition-colors hover:bg-stone-100"
          >
            <span
              className="text-6xl font-bold tracking-wide text-stone-900 sm:text-7xl"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {displayHanzi(current.vocab.hanzi)}
            </span>
            <WordAudio hanzi={displayHanzi(current.vocab.hanzi)} audioUrl={current.vocab.audioUrl} />
            {revealed ? (
              <>
                <p className="mt-5 text-xl font-semibold text-[#B52A2A]">{current.vocab.pinyin}</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-700">
                  {current.vocab.meaningVi || 'Chưa có nghĩa tiếng Việt'}
                </p>
                {current.vocab.partOfSpeech && (
                  <span className="mt-2 text-xs font-medium italic text-stone-400">
                    ({current.vocab.partOfSpeech})
                  </span>
                )}
                <MeasureWordList items={current.vocab.measureWords} />
                <ExampleSentence
                  word={displayHanzi(current.vocab.hanzi)}
                  sentence={current.vocab.exampleSentence}
                  pinyin={current.vocab.examplePinyin}
                  translation={current.vocab.exampleTranslation}
                  audioUrl={current.vocab.exampleAudioUrl}
                />
              </>
            ) : (
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-stone-400">
                <Eye className="h-4 w-4" />
                Nhấn để xem phiên âm và nghĩa
              </span>
            )}
          </div>

          {revealed ? (
            <RatingButtons disabled={saving} onRate={rate} />
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl bg-[#B52A2A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#9B2323]"
            >
              Lật thẻ
            </button>
          )}

          {saving && (
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-400">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              Đang lưu kết quả...
            </p>
          )}
        </div>
      ) : total === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
          Chủ đề này chưa có từ vựng{hskFilter ? ` ở cấp ${hskFilter}` : ''}.
          <div>
            <Link to={backTo} className="mt-4 inline-block font-semibold text-[#B52A2A]">
              Về chủ đề
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-500">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-stone-800">Hoàn thành chủ đề!</h2>
          <p className="mt-1 text-sm text-stone-500">
            Bạn đã học {total} từ. Kết quả đã được lưu vào bộ Flashcard để ôn đúng lịch.
          </p>
          <div className="mx-auto mt-5 grid max-w-md grid-cols-4 gap-2 text-xs">
            {RATING_BUTTONS.map((b) => (
              <div key={b.rating} className={`rounded-xl border px-2 py-2 ${b.className}`}>
                <div className="text-lg font-bold">{counts[b.rating]}</div>
                <div>{b.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => startSession(words)}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              <RotateCcw className="h-4 w-4" />
              Học lại từ đầu
            </button>
            <Link
              to="/flashcards"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#9B2323]"
            >
              <Sparkles className="h-4 w-4" />
              Mở bộ Flashcard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopicFlashcardPage
