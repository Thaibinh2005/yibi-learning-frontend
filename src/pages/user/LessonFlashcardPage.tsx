import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { getLessonVocabularies } from '@/api/vocabularyApi'
import { markLessonCompleted } from '@/api/lessonApi'
import { LessonFrame } from '@/components/learningpath/LessonFrame'
import { CardSessionView } from '@/components/flashcard/CardSessionView'
import { useCardSession } from '@/components/flashcard/useCardSession'
import type { Vocabulary } from '@/types/vocabulary'

interface SessionProps {
  words: Vocabulary[]
  lessonId: string
  backTo: string
}

/** Mounted once the words are loaded, so the session starts from the full list. */
const LessonSession: React.FC<SessionProps> = ({ words, lessonId, backTo }) => {
  const navigate = useNavigate()
  const session = useCardSession(words)
  const { total, learned, remaining } = session
  const finished = total > 0 && !session.current

  // Going through every card counts as having done the lesson's words.
  useEffect(() => {
    if (finished) markLessonCompleted(Number(lessonId)).catch(() => undefined)
  }, [finished, lessonId])

  return (
    <LessonFrame
      label="Từ vựng của bài"
      progress={total > 0 ? learned / total : undefined}
      counter={total > 0 ? `Còn ${remaining}/${total}` : undefined}
      exitTo={backTo}
    >
      <CardSessionView
        session={session}
        doneTitle="Xong từ vựng của bài!"
        doneText={`Bạn đã học ${total} từ. Kết quả đã được lưu vào bộ Flashcard để ôn đúng lịch, và bài này đã được đánh dấu hoàn thành.`}
        doneActions={
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#C8322B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#9B2323]"
          >
            Về bài học
          </button>
        }
        empty="Bài này chưa có từ vựng để học thẻ."
      />
    </LessonFrame>
  )
}

/** Flip cards for the words of one library lesson, on a page of its own (see UserLayout FOCUS_PAGES). */
export const LessonFlashcardPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [searchParams] = useSearchParams()
  const level = searchParams.get('hskLevel') || '1'
  // The library reopens this lesson's window from these two parameters.
  const backTo = `/courses?hskLevel=${encodeURIComponent(level)}&lessonId=${lessonId}`

  const [words, setWords] = useState<Vocabulary[] | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const id = Number(lessonId)
    if (!Number.isFinite(id)) return
    let cancelled = false
    getLessonVocabularies(id)
      .then((res) => {
        if (!cancelled) setWords(res.success && Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được từ vựng của bài. Hãy thử lại.')
      })
    return () => {
      cancelled = true
    }
  }, [lessonId, attempt])

  const retry = () => {
    setError('')
    setWords(null)
    setAttempt((n) => n + 1)
  }

  if (words) return <LessonSession key={lessonId} words={words} lessonId={lessonId ?? ''} backTo={backTo} />

  return (
    <LessonFrame label="Từ vựng của bài" exitTo={backTo}>
      {error ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
          <button type="button" onClick={retry} className="ml-3 font-semibold underline">Thử lại</button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-stone-200 bg-white p-16 text-sm text-stone-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải flashcard...
        </div>
      )}
    </LessonFrame>
  )
}

export default LessonFlashcardPage
