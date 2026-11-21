import { useCallback, useEffect, useMemo, useState } from 'react'
import { rateVocabulary, type SrsRating } from '@/api/srsApi'
import { useAppSelector } from '@/app/hooks'
import { formatNextReview, isCardShortcut, RATING_BUTTONS } from '@/components/flashcard/FlashcardParts'
import type { Vocabulary } from '@/types/vocabulary'

const RELEARN_DELAY_MS = 10 * 60 * 1000
const NO_COUNTS: Record<SrsRating, number> = { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 }

export interface QueueItem {
  /** Unique per queue entry so a card can be pinned while it is on screen. */
  key: number
  vocab: Vocabulary
  /** Earliest time this card should be shown again (ms since epoch). */
  availableAt: number
}

/** Some sources number homographs (会1, 点1); never show the digit to learners. */
export const displayHanzi = (hanzi: string) => hanzi.replace(/[0-9]+$/, '')

let queueKeySeq = 0

const buildQueue = (list: Vocabulary[], at: number): QueueItem[] =>
  list.map((vocab) => ({ key: ++queueKeySeq, vocab, availableAt: at }))

/** Pick the first card that is due; if none is due yet, show the one due soonest. */
const pickNext = (queue: QueueItem[], now: number): QueueItem | undefined => {
  if (queue.length === 0) return undefined
  const due = queue.find((q) => q.availableAt <= now)
  if (due) return due
  return queue.reduce((best, q) => (q.availableAt < best.availableAt ? q : best))
}

/**
 * One flashcard session over a fixed word list: the queue, flipping, four-level rating and the keyboard.
 * Mount it once the words are loaded; a new list needs a new mount (a key).
 */
export const useCardSession = (words: Vocabulary[]) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [queue, setQueue] = useState<QueueItem[]>(() => buildQueue(words, Date.now()))
  const [revealed, setRevealed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [counts, setCounts] = useState(NO_COUNTS)
  const [now, setNow] = useState(() => Date.now())
  // Card on screen: pinned until rated so the 10-minute timer never swaps it while it is being read.
  const [currentKey, setCurrentKey] = useState<number | null>(null)

  const restart = useCallback(() => {
    const t = Date.now()
    setQueue(buildQueue(words, t))
    setCurrentKey(null)
    setCounts(NO_COUNTS)
    setRevealed(false)
    setNotice('')
    setNow(t)
  }, [words])

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

  const rate = useCallback(
    async (rating: SrsRating) => {
      if (!current || saving) return
      setSaving(true)
      setError('')
      let intervalDays: number | undefined
      // A guest practises without saving; only a signed-in learner's ratings go to their review deck.
      if (isAuthenticated) try {
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
    [current, saving, isAuthenticated]
  )

  /* Keyboard: Space/Enter = lật thẻ (cả hai chiều), 1-4 = chọn mức độ. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || !isCardShortcut(e)) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setRevealed((r) => !r)
        return
      }
      if (!revealed) return
      const btn = RATING_BUTTONS.find((b) => b.key === e.key)
      if (btn) rate(btn.rating)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, revealed, rate])

  return {
    current,
    revealed,
    setRevealed,
    saving,
    error,
    notice,
    counts,
    rate,
    restart,
    isAuthenticated,
    remaining: queue.length,
    total: words.length,
    learned: counts.HARD + counts.GOOD + counts.EASY,
    waitingMinutes: current && current.availableAt > now ? Math.ceil((current.availableAt - now) / 60000) : 0,
  }
}

export type CardSession = ReturnType<typeof useCardSession>
