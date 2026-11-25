import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, LoaderCircle, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { getLessonVocabularies } from '@/api/vocabularyApi'
import { rateVocabulary } from '@/api/srsApi'
import { markLessonCompleted } from '@/api/lessonApi'
import { LessonFrame } from '@/components/learningpath/LessonFrame'
import { AudioButton } from '@/components/ui/AudioButton'
import { displayHanzi } from '@/components/flashcard/useCardSession'
import { buildQuiz, shortMeaning } from '@/lib/wordQuiz'
import type { Vocabulary } from '@/types/vocabulary'

interface SessionProps {
  words: Vocabulary[]
  lessonId: string
  backTo: string
  level: string
  /** Only these words are asked; absent means the whole lesson. */
  onlyIds?: number[]
  onRestart: () => void
  onReviewWrong: (ids: number[]) => void
}

/** Mounted once the words are loaded; a new attempt is a new mount (a key). */
const QuizSession: React.FC<SessionProps> = ({ words, lessonId, backTo, level, onlyIds, onRestart, onReviewWrong }) => {
  const navigate = useNavigate()
  const questions = useMemo(() => buildQuiz(words, onlyIds), [words, onlyIds])
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [wrong, setWrong] = useState<Vocabulary[]>([])
  const [saveError, setSaveError] = useState('')

  const total = questions.length
  const question = questions[index]
  const finished = total > 0 && index >= total
  const answered = chosen !== null

  // Finishing the quiz counts as having done the lesson's words.
  useEffect(() => {
    if (finished) markLessonCompleted(Number(lessonId)).catch(() => undefined)
  }, [finished, lessonId])

  const choose = useCallback(
    (option: string) => {
      if (!question || chosen !== null) return
      setChosen(option)
      if (option === question.answer) return
      setWrong((list) => [...list, question.word])
      // A word answered wrongly goes to the learner's review deck to be asked again soon.
      rateVocabulary(question.word.id, 'AGAIN').catch(() => setSaveError('Chưa lưu được một số từ sai vào lịch ôn.'))
    },
    [question, chosen]
  )

  const next = useCallback(() => {
    setChosen(null)
    setIndex((i) => i + 1)
  }, [])

  /* Keyboard: 1-4 pick an option, Enter or Space goes on. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && target !== document.body && target.closest('input, textarea, select, [role="dialog"]')) return
      if (!question) return
      if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
        const option = question.options[Number(e.key) - 1]
        if (option) choose(option)
      } else if (answered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question, answered, choose, next])

  if (total === 0) {
    return (
      <LessonFrame label="Trắc nghiệm từ vựng" exitTo={backTo}>
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Bài này chưa đủ từ có nghĩa để ra đề trắc nghiệm.
          <div>
            <Link to={backTo} className="mt-4 inline-block font-semibold text-brand">Về bài học</Link>
          </div>
        </div>
      </LessonFrame>
    )
  }

  return (
    <LessonFrame
      progress={Math.min(index, total) / total}
      counter={finished ? undefined : `Câu ${index + 1}/${total}`}
      exitTo={backTo}
      confirmExit={!finished && index > 0}
    >
      {/* Floats over the page so the question and answers do not move when it appears. */}
      {saveError && <div role="alert" className="fixed left-1/2 top-20 z-30 -translate-x-1/2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 shadow-xs">{saveError}</div>}

      {finished ? (
        <div className="card-soft p-8 text-center shadow-xs sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-500">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-800">{onlyIds ? 'Ôn xong các từ sai!' : 'Xong rồi!'}</h2>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">{total - wrong.length}/{total} câu đúng</p>
          {wrong.length > 0 ? (
            <div className="mx-auto mt-5 max-w-md text-left">
              <p className="text-sm font-semibold text-slate-600">Từ cần ôn lại ({wrong.length}) — đã đưa vào lịch ôn:</p>
              <ul className="mt-2 space-y-2">
                {wrong.map((word) => (
                  <li key={word.id} className="flex items-baseline gap-3 rounded-xl border border-border px-3 py-2">
                    <span className="font-chinese text-xl font-bold text-slate-900">{displayHanzi(word.hanzi)}</span>
                    <span className="text-sm text-brand">{word.pinyin}</span>
                    <span className="min-w-0 text-sm text-slate-600">{shortMeaning(word)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{onlyIds ? 'Lần này bạn trả lời đúng hết.' : 'Bạn nhớ hết các từ của bài này.'}</p>
          )}
          <p className="mt-3 text-xs text-slate-400">Bài này đã được đánh dấu hoàn thành.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {wrong.length > 0 && (
              <button type="button" onClick={() => onReviewWrong(wrong.map((word) => word.id))} className="inline-flex items-center gap-2 rounded-xl border border-brand px-4 py-2.5 text-sm font-semibold text-brand hover:bg-rose-50">
                Ôn lại {wrong.length} từ sai
              </button>
            )}
            <button type="button" onClick={onRestart} className="btn-chunky btn-paper">
              <RotateCcw className="h-4 w-4" />
              Làm lại cả bài
            </button>
            <button type="button" onClick={() => navigate(`/courses/lessons/${lessonId}/flashcards?hskLevel=${level}`)} className="btn-chunky btn-paper">
              Học flashcard
            </button>
            <button type="button" onClick={() => navigate(backTo)} className="btn-chunky btn-brand">
              Về bài học
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100dvh-9rem)] flex-col card-soft p-4 shadow-xs sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Từ này nghĩa là gì?</p>
          <div className="my-[clamp(0.5rem,4dvh,2rem)] flex flex-wrap items-center justify-center gap-x-3 text-center">
            <span className="font-chinese text-[clamp(2.25rem,9dvh,5rem)] font-bold leading-tight tracking-wide text-slate-900">{displayHanzi(question.word.hanzi)}</span>
            <AudioButton audioUrl={question.word.audioUrl} text={displayHanzi(question.word.hanzi)} size="md" title="Nghe phát âm từ" />
            {answered && <span className="text-lg font-semibold text-brand">{question.word.pinyin}</span>}
          </div>

          <div className="grid flex-1 auto-rows-fr gap-[clamp(0.5rem,1.6dvh,1rem)]" role="group" aria-label="Các đáp án">
            {question.options.map((option, i) => {
              const isAnswer = option === question.answer
              const isChosen = option === chosen
              const state = !answered
                ? 'border-border bg-white text-slate-800 hover:bg-slate-50'
                : isAnswer
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : isChosen
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-border bg-white text-slate-400'
              return (
                <button
                  key={option}
                  type="button"
                  disabled={answered}
                  onClick={() => choose(option)}
                  className={`flex items-center gap-3 min-h-11 rounded-2xl border-2 px-4 py-2 text-left text-[clamp(1rem,2.4dvh,1.25rem)] font-medium leading-snug transition-colors ${state}`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                  <span className="min-w-0 flex-1">{option}</span>
                  {answered && isAnswer && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-label="Đáp án đúng" />}
                  {answered && isChosen && !isAnswer && <XCircle className="h-5 w-5 shrink-0 text-rose-600" aria-label="Bạn chọn sai" />}
                </button>
              )
            })}
          </div>

          {/* The slot is kept before answering, so the answers do not move when the button appears. */}
          <div className="mt-4 h-11 shrink-0">
            {answered && (
              <button type="button" onClick={next} autoFocus className="h-full w-full rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
                {index + 1 >= total ? 'Xem kết quả' : 'Tiếp tục'}
              </button>
            )}
          </div>
        </div>
      )}
    </LessonFrame>
  )
}

/** A multiple-choice quiz over the words of one library lesson, on a page of its own (see UserLayout FOCUS_PAGES). */
export const LessonQuizPage: React.FC = () => {
  const { lessonId = '' } = useParams<{ lessonId: string }>()
  const [searchParams] = useSearchParams()
  const level = searchParams.get('hskLevel') || '1'
  const backTo = `/courses?hskLevel=${encodeURIComponent(level)}&lessonId=${lessonId}`

  const [words, setWords] = useState<Vocabulary[] | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [loadTry, setLoadTry] = useState(0)
  const [onlyIds, setOnlyIds] = useState<number[] | undefined>(undefined)

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
  }, [lessonId, loadTry])

  const retry = () => {
    setError('')
    setWords(null)
    setLoadTry((n) => n + 1)
  }

  if (words) {
    return (
      <QuizSession
        key={`${lessonId}|${attempt}`}
        words={words}
        lessonId={lessonId}
        backTo={backTo}
        level={level}
        onlyIds={onlyIds}
        onRestart={() => { setOnlyIds(undefined); setAttempt((n) => n + 1) }}
        onReviewWrong={(ids) => { setOnlyIds(ids); setAttempt((n) => n + 1) }}
      />
    )
  }

  return (
    <LessonFrame label="Trắc nghiệm từ vựng" exitTo={backTo}>
      {error ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
          <button type="button" onClick={retry} className="ml-3 font-semibold underline">Thử lại</button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 card-soft p-16 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải câu hỏi...
        </div>
      )}
    </LessonFrame>
  )
}

export default LessonQuizPage
