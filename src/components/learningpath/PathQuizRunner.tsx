import React, { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, History, Layers, LoaderCircle, PartyPopper, RotateCcw, XCircle } from 'lucide-react'
import type { CheckedAnswer, PathQuiz, QuizOutcome, quizApi } from '@/api/learningPathApi'
import { AudioButton } from '@/components/ui/AudioButton'
import { playFeedbackSound } from '@/lib/feedbackSound'

const levelName = (level: number) => (level >= 7 ? 'HSK 7–9' : `HSK ${level}`)

/** The answer just shown must not stay in the same place when a question comes back. */
const rotate = (options: string[], by: number) => options.map((_, i) => options[(i + by) % options.length])

/**
 * One question at a time with instant feedback, then the result and what comes next. A question answered wrongly
 * comes back at the end until it is right, but the score only counts the first answer.
 */
export const PathQuizRunner: React.FC<{
  api: ReturnType<typeof quizApi>
  onContinue: (outcome: QuizOutcome) => void
  onReview?: () => void
  /** Off for a test that decides a level: there a wrong answer is final. */
  retryWrong?: boolean
}> = ({ api, onContinue, onReview, retryWrong = true }) => {
  const [quiz, setQuiz] = useState<PathQuiz | null>(null)
  const [order, setOrder] = useState<number[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState<CheckedAnswer | null>(null)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  const finish = async (loaded: PathQuiz, finalAnswers: Record<string, string>) => {
    setBusy(true)
    setError('')
    try {
      setOutcome(await api.submit(loaded.seed, finalAnswers))
    } catch {
      setError('Chưa lưu được kết quả. Hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    let active = true
    setQuiz(null)
    setOutcome(null)
    setIndex(0)
    setAnswers({})
    setPicked(null)
    setChecked(null)
    setError('')
    api.start().then((loaded) => {
      if (!active) return
      setQuiz(loaded)
      setOrder(loaded.questions.map((_, i) => i))
      // Nothing to answer (a note without questions): reading it is enough.
      if (loaded.questions.length === 0) finish(loaded, {})
    }).catch((cause) => {
      if (active) setError((cause as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không tải được câu hỏi.')
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a new attempt is the only reason to restart
  }, [attempt])

  if (error && !quiz) return <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
  if (!quiz || (busy && !outcome && quiz.questions.length === 0)) {
    return <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang chuẩn bị câu hỏi...</div>
  }

  if (outcome) {
    return (
      <div className="mx-auto max-w-md space-y-5 py-6 text-center">
        <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full ${outcome.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {outcome.passed ? <PartyPopper className="h-11 w-11" /> : <RotateCcw className="h-10 w-10" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{outcome.passed ? 'Hoàn thành!' : 'Chưa đạt'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Đúng {outcome.correct}/{outcome.total} câu · {outcome.scorePercent}%
            {!outcome.passed && `. Cần từ ${quiz.passPercent}% để mở bài tiếp theo.`}
          </p>
        </div>
        {outcome.newLevel && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Chúc mừng! Bạn đã lên {levelName(outcome.newLevel)}.</p>}
        {outcome.mistakesAdded > 0 && <p className="text-xs font-medium text-slate-500">Đã lưu {outcome.mistakesAdded} câu sai, chúng sẽ quay lại ở các bài sau.</p>}
        {outcome.mistakesReviewed > 0 && <p className="text-xs font-medium text-slate-500">Đã ôn {outcome.mistakesReviewed} câu từng sai{outcome.mistakesResolved > 0 ? `, thuộc thêm ${outcome.mistakesResolved} câu` : ''}.</p>}
        {outcome.cardsAdded > 0 && <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><Layers className="h-3.5 w-3.5" />Đã thêm {outcome.cardsAdded} từ vào lịch ôn tập</p>}
        <div className="flex flex-wrap justify-center gap-2">
          {!outcome.passed && onReview && <button type="button" onClick={onReview} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Xem lại bài</button>}
          {!outcome.passed && <button type="button" onClick={() => setAttempt((value) => value + 1)} className="rounded-xl bg-[#B52A2A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#9e2424]">Làm lại</button>}
          {outcome.passed && <button type="button" onClick={() => onContinue(outcome)} className="inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#9e2424]">{outcome.nextNodeId ? 'Bài tiếp theo' : 'Về lộ trình'}<ArrowRight className="h-4 w-4" /></button>}
        </div>
      </div>
    )
  }

  const question = quiz.questions[order[index]]
  const last = index === order.length - 1
  const retrying = index >= quiz.questions.length

  const check = async () => {
    if (!picked) return
    setBusy(true)
    setError('')
    try {
      const result = await api.check(quiz.seed, question.id, picked)
      setChecked(result)
      // Only the first answer counts, so a question that comes back cannot raise the score.
      setAnswers((current) => (question.id in current ? current : { ...current, [question.id]: picked }))
      if (!result.correct && retryWrong) setOrder((current) => [...current, order[index]])
      playFeedbackSound(result.correct)
    } catch {
      setError('Không kiểm tra được đáp án. Hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  const next = () => {
    if (last) {
      finish(quiz, answers)
      return
    }
    setIndex((value) => value + 1)
    setPicked(null)
    setChecked(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((index + (checked ? 1 : 0)) / order.length) * 100}%` }} />
        </span>
        <span className="text-xs font-semibold text-slate-400">{index + 1}/{order.length}</span>
      </div>

      {(retrying || question.fromMistakes) && (
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
          <History className="h-3.5 w-3.5" />{retrying ? 'Làm lại câu vừa sai' : 'Câu bạn từng sai'}
        </p>
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-chinese text-lg font-bold leading-relaxed text-slate-800">{question.prompt}</p>
          {question.pinyin && <p className="mt-1 text-sm text-[#B52A2A]">{question.pinyin}</p>}
        </div>
        {question.audioText && <AudioButton text={question.audioText} size="md" title="Nghe phát âm" />}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {rotate(question.options, retrying ? index : 0).map((option) => {
          const isPicked = picked === option
          const isAnswer = checked?.correctAnswer === option
          const style = checked
            ? isAnswer ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : isPicked ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-400'
            : isPicked ? 'border-[#B52A2A] bg-red-50 text-[#B52A2A]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          return (
            <button key={option} type="button" disabled={Boolean(checked)} onClick={() => setPicked(option)} className={`font-chinese rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${style}`}>
              {option}
            </button>
          )
        })}
      </div>

      {checked && (
        <div className={`rounded-xl p-4 text-sm ${checked.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`} role="status">
          <p className="flex items-center gap-1.5 font-bold">
            {checked.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {checked.correct ? 'Chính xác!' : `Đáp án đúng: ${checked.correctAnswer}`}
          </p>
          {checked.explanation && <p className="mt-1 leading-relaxed opacity-90">{checked.explanation}</p>}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}

      <div className="flex justify-end">
        {checked ? (
          <button type="button" disabled={busy} onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#9e2424] disabled:opacity-50">
            {last ? 'Xem kết quả' : 'Tiếp tục'}<ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" disabled={!picked || busy} onClick={check} className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Kiểm tra</button>
        )}
      </div>
    </div>
  )
}
