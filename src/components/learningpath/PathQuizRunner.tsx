import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, History, Languages, Layers, LoaderCircle, Mic, RotateCcw, Sparkles, Star, X } from 'lucide-react'
import type { CheckedAnswer, LessonStep, PathContentItem, PathQuiz, QuizOutcome, quizApi, SpeakingResult } from '@/api/learningPathApi'
import { SpeakLine } from './SpeakLine'
import { LessonFrame } from '@/components/learningpath/LessonFrame'
import { GrammarCard } from '@/components/learningpath/PathNodeContent'
import { AudioButton } from '@/components/ui/AudioButton'
import { playFeedbackSound } from '@/lib/feedbackSound'

const levelName = (level: number) => (level >= 7 ? 'HSK 7–9' : `HSK ${level}`)
const text = (value: unknown) => (value === null || value === undefined ? '' : String(value))

/** The answer just shown must not stay in the same place when a question comes back. */
const rotate = (options: string[], by: number) => options.map((_, i) => options[(i + by) % options.length])

/** Stars for how much was right at the first try. */
export const starsOf = (scorePercent: number) => (scorePercent >= 90 ? 3 : scorePercent >= 70 ? 2 : 1)

const stepsOf = (quiz: PathQuiz): LessonStep[] => quiz.steps ?? quiz.questions.map((q) => ({ kind: 'QUESTION', questionId: q.id }))

const HAN_RUN = /([\p{Script=Han}＿]+)/u
const onlyHan = (value: string) => /^[\p{Script=Han}＿，。！？、]+$/u.test(value)

/** Chinese stands out from the Vietnamese around it, since it is what the question is about. */
const HanText: React.FC<{ value: string }> = ({ value }) => (
  <>
    {value.split(HAN_RUN).map((part, index) => (index % 2 === 1
      ? <span key={index} className="mx-0.5 align-[-0.08em] text-[1.45em] font-bold text-brand">{part}</span>
      : <span key={index}>{part}</span>))}
  </>
)

const StepTag: React.FC<{ icon: React.ElementType; className: string; children: React.ReactNode }> = ({ icon: Icon, className, children }) => (
  <p className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${className}`}>
    <Icon className="h-3.5 w-3.5" />{children}
  </p>
)

const WordStep: React.FC<{ word: PathContentItem }> = ({ word }) => {
  const example = word.example as Record<string, unknown> | undefined
  return (
    <div className="animate-fade-up">
      <StepTag icon={Sparkles} className="bg-amber-100 text-amber-800">Từ mới</StepTag>
      <article className="card-soft mt-4 px-6 py-8 text-center sm:py-10">
        <p className="text-base font-semibold text-brand">{text(word.pinyin)}</p>
        <p className="font-chinese mt-1 text-6xl font-bold leading-tight text-slate-900 sm:text-7xl">{text(word.simplified)}</p>
        <div className="mt-4 flex justify-center">
          <AudioButton audioUrl={word.audio_url as string | null | undefined} text={text(word.simplified)} size="lg" className="!h-12 !w-12" />
        </div>
        <p className="mx-auto mt-4 max-w-md text-lg font-semibold leading-snug text-slate-800">{text(word.meaning_vi) || text(word.meaning_en)}</p>
        {text(word.part_of_speech) && <p className="font-chinese mt-2 text-xs text-slate-500">{text(word.part_of_speech)}</p>}
        {example && text(example.zh) && (
          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-left">
            <p className="font-chinese text-base font-medium text-slate-800">{text(example.zh)}</p>
            <p className="mt-0.5 text-sm text-slate-500">{text(example.vi) || text(example.en)}</p>
          </div>
        )}
      </article>
    </div>
  )
}

const CONFETTI = ['#C8322B', '#F59E0B', '#059669', '#0284C7', '#7C3AED']

const Confetti: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
    {Array.from({ length: 22 }, (_, i) => (
      <span
        key={i}
        className="animate-confetti absolute top-0 block h-3 w-2 rounded-sm"
        style={{ left: `${(i * 37) % 100}%`, backgroundColor: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 7) * 90}ms` }}
      />
    ))}
  </div>
)

const Tile: React.FC<{ label: string; value: string; className: string }> = ({ label, value, className }) => (
  <div className={`rounded-2xl p-3 ${className}`}>
    <dd className="text-xl font-extrabold tabular-nums">{value}</dd>
    <dt className="mt-0.5 text-[11px] font-semibold opacity-80">{label}</dt>
  </div>
)

/**
 * A lesson one step at a time with instant feedback, then the result and what comes next. A question answered
 * wrongly comes back at the end until it is right, but the score only counts the first answer.
 */
export const PathQuizRunner: React.FC<{
  api: ReturnType<typeof quizApi>
  onContinue: (outcome: QuizOutcome) => void
  /** Scores a recorded line; a lesson without it skips its speaking steps. */
  speak?: (lineIndex: number, audio: Blob) => Promise<SpeakingResult>
  /** A test that needs a score: no feedback or second try on any question until it is handed in. */
  scored?: boolean
  label?: string
  exitTo?: string
}> = ({ api, onContinue, speak, scored = false, label, exitTo }) => {
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
  // Keys 1-4 pick an option and Enter moves on; set on each render so it always sees the current step.
  const onKey = useRef<(event: KeyboardEvent) => void>(() => undefined)

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey.current(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

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
      setOrder(stepsOf(loaded).map((_, i) => i).filter((i) => speak || stepsOf(loaded)[i].kind !== 'SPEAK'))
      // Nothing to answer (a note without questions): reading it is enough.
      if (stepsOf(loaded).length === 0) finish(loaded, {})
    }).catch((cause) => {
      if (active) setError((cause as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không tải được câu hỏi.')
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a new attempt is the only reason to restart
  }, [attempt])

  if (error && !quiz) {
    return <LessonFrame label={label} exitTo={exitTo}><p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">{error}</p></LessonFrame>
  }
  if (!quiz || (busy && !outcome && order.length === 0)) {
    return <LessonFrame label={label} exitTo={exitTo}><div className="flex items-center justify-center gap-2 p-16 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Đang chuẩn bị bài học...</div></LessonFrame>
  }

  if (outcome) {
    onKey.current = () => undefined
    const stars = starsOf(outcome.scorePercent)
    const showStars = outcome.passed && outcome.total > 0
    return (
      <LessonFrame
        exitTo={exitTo}
        footer={outcome.passed ? (
          <button type="button" onClick={() => onContinue(outcome)} className="btn-chunky btn-brand w-full py-3.5 text-base">{outcome.nextNodeId ? 'Bài tiếp theo' : 'Về lộ trình'}<ArrowRight className="h-5 w-5" /></button>
        ) : (
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="btn-chunky btn-brand w-full py-3.5 text-base"><RotateCcw className="h-5 w-5" />Làm lại</button>
        )}
      >
        {outcome.passed && <Confetti />}
        <div className="relative mx-auto max-w-md space-y-6 pt-6 text-center sm:pt-10">
          {showStars ? (
            <p className="flex items-end justify-center gap-2" role="img" aria-label={`${stars} trên 3 sao`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className="animate-pop" style={{ animationDelay: `${n * 160}ms` }}>
                  <Star className={`${n === 2 ? 'h-20 w-20' : 'h-14 w-14'} ${n <= stars ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-200'}`} strokeWidth={1.5} />
                </span>
              ))}
            </p>
          ) : (
            <div className={`animate-pop mx-auto grid h-24 w-24 place-items-center rounded-full ${outcome.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {outcome.passed ? <Check className="h-12 w-12" strokeWidth={3} /> : <RotateCcw className="h-11 w-11" />}
            </div>
          )}
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{outcome.passed ? 'Hoàn thành!' : 'Chưa đạt'}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {outcome.passed
                ? stars === 3 ? 'Xuất sắc, gần như không sai câu nào.' : stars === 2 ? 'Tốt lắm, cố thêm chút nữa là đủ 3 sao.' : 'Đã xong bài. Những câu sai sẽ quay lại để bạn ôn.'
                : `Cần từ ${quiz.passPercent}% để mở bài tiếp theo. Bạn làm lại được ngay.`}
            </p>
          </div>
          {outcome.newLevel && <p className="animate-pop rounded-2xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900">Chúc mừng! Bạn đã lên {levelName(outcome.newLevel)}.</p>}
          {outcome.total > 0 && (
            <dl className="grid grid-cols-3 gap-2">
              <Tile label={scored ? 'Câu đúng' : 'Đúng ngay lần đầu'} value={`${outcome.correct}/${outcome.total}`} className="bg-emerald-50 text-emerald-900" />
              <Tile label="Điểm" value={`${outcome.scorePercent}%`} className="bg-amber-50 text-amber-900" />
              <Tile label={outcome.cardsAdded > 0 ? 'Từ vào lịch ôn' : 'Câu sai đã lưu'} value={String(outcome.cardsAdded > 0 ? outcome.cardsAdded : outcome.mistakesAdded)} className="bg-sky-50 text-sky-900" />
            </dl>
          )}
          <div className="space-y-1 text-xs font-medium text-slate-500">
            {outcome.cardsAdded > 0 && outcome.mistakesAdded > 0 && <p>Đã lưu {outcome.mistakesAdded} câu sai, chúng sẽ quay lại ở các bài sau.</p>}
            {outcome.mistakesReviewed > 0 && <p className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />Đã ôn {outcome.mistakesReviewed} câu từng sai{outcome.mistakesResolved > 0 ? `, thuộc thêm ${outcome.mistakesResolved} câu` : ''}.</p>}
          </div>
        </div>
      </LessonFrame>
    )
  }

  const steps = stepsOf(quiz)
  const step = steps[order[index]]
  const question = step.kind === 'QUESTION' ? quiz.questions.find((q) => q.id === step.questionId) : undefined
  const last = index === order.length - 1
  const retrying = index >= new Set(order).size
  const frameProps = {
    label,
    exitTo,
    confirmExit: index > 0,
    progress: (index + (checked ? 1 : 0)) / Math.max(order.length, 1),
    counter: `${index + 1}/${order.length}`,
  }

  const check = async () => {
    if (!picked || !question || busy) return
    if (scored) {
      const chosen = { ...answers, [question.id]: picked }
      setAnswers(chosen)
      if (last) {
        finish(quiz, chosen)
      } else {
        setIndex((value) => value + 1)
        setPicked(null)
      }
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await api.check(quiz.seed, question.id, picked)
      setChecked(result)
      // Only the first answer counts, so a question that comes back cannot raise the score.
      setAnswers((current) => (question.id in current ? current : { ...current, [question.id]: picked }))
      if (!result.correct) setOrder((current) => [...current, order[index]])
      playFeedbackSound(result.correct)
    } catch {
      setError('Không kiểm tra được đáp án. Hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  const next = () => {
    if (busy) return
    if (last) {
      finish(quiz, answers)
      return
    }
    setIndex((value) => value + 1)
    setPicked(null)
    setChecked(null)
  }

  const continueButton = (className = 'btn-brand') => (
    <button type="button" disabled={busy} onClick={next} className={`btn-chunky ${className} w-full shrink-0 py-3.5 text-base sm:w-auto sm:min-w-44`}>
      {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>{last ? 'Xem kết quả' : 'Tiếp tục'}<ArrowRight className="h-5 w-5" /></>}
    </button>
  )
  const errorLine = error && <p role="alert" className="mb-3 text-sm font-medium text-rose-700">{error}</p>

  if (!question) {
    onKey.current = (event) => {
      if (event.key === 'Enter' && step.kind !== 'SPEAK' && !event.repeat) {
        event.preventDefault()
        next()
      }
    }
    if (step.kind === 'SPEAK' && speak) {
      return (
        <LessonFrame {...frameProps} footer={error ? errorLine : undefined}>
          <SpeakLine key={index} line={step.data ?? {}} lineIndex={step.lineIndex ?? 0} speak={speak} onDone={next} />
        </LessonFrame>
      )
    }
    return (
      <LessonFrame {...frameProps} footer={<>{errorLine}<div className="flex justify-end">{continueButton()}</div></>}>
        {step.kind === 'TEACH_GRAMMAR' ? (
          <div key={index} className="animate-fade-up">
            <StepTag icon={Languages} className="bg-violet-100 text-violet-800">Ngữ pháp mới</StepTag>
            <div className="mt-4"><GrammarCard point={step.data ?? {}} /></div>
          </div>
        ) : <WordStep key={index} word={step.data ?? {}} />}
      </LessonFrame>
    )
  }

  const options = rotate(question.options, retrying ? index : 0)
  const bigOptions = options.every(onlyHan)
  onKey.current = (event) => {
    if (event.repeat) return
    if (event.key === 'Enter') {
      event.preventDefault()
      if (checked) next()
      else check()
    } else if (!checked && /^[1-9]$/.test(event.key) && options[Number(event.key) - 1]) {
      setPicked(options[Number(event.key) - 1])
    }
  }

  return (
    <LessonFrame
      {...frameProps}
      footerClassName={checked ? (checked.correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50') : undefined}
      footer={checked ? (
        <div className="animate-fade-up flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" role="status">
          <div className={`flex min-w-0 gap-3 ${checked.correct ? 'text-emerald-900' : 'text-rose-900'}`}>
            <span className={`animate-pop grid h-11 w-11 shrink-0 place-items-center rounded-full text-white ${checked.correct ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {checked.correct ? <Check className="h-6 w-6" strokeWidth={3} /> : <X className="h-6 w-6" strokeWidth={3} />}
            </span>
            <div className="min-w-0">
              <p className="font-chinese text-base font-extrabold">{checked.correct ? 'Chính xác!' : `Đáp án đúng: ${checked.correctAnswer}`}</p>
              {checked.explanation && <p className="font-chinese mt-0.5 text-sm leading-relaxed opacity-90">{checked.explanation}</p>}
            </div>
          </div>
          {continueButton(checked.correct ? 'btn-jade' : 'btn-brand')}
        </div>
      ) : (
        <>
          {errorLine}
          <div className="flex items-center justify-between gap-3">
            <p className="hidden text-xs font-medium text-slate-500 sm:block">{scored ? `Bấm phím 1–${options.length} để chọn, Enter để đi tiếp. Kết quả hiện sau khi nộp bài.` : `Bấm phím 1–${options.length} để chọn, Enter để kiểm tra`}</p>
            <button type="button" disabled={!picked || busy} onClick={check} className="btn-chunky btn-jade w-full py-3.5 text-base sm:w-auto sm:min-w-44">
              {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : scored ? (last ? 'Nộp bài' : 'Tiếp tục') : 'Kiểm tra'}
            </button>
          </div>
        </>
      )}
    >
      <div key={index} className="animate-fade-up space-y-6">
        {(retrying || question.fromMistakes) && (
          <StepTag icon={History} className="bg-amber-100 text-amber-800">{retrying ? 'Làm lại câu vừa sai' : 'Câu bạn từng sai'}</StepTag>
        )}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-chinese text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl"><HanText value={question.prompt} /></h1>
            {question.pinyin && <p className="mt-1 text-base font-medium text-brand">{question.pinyin}</p>}
          </div>
          {question.audioText && <AudioButton text={question.audioText} size="lg" title="Nghe phát âm" className="shrink-0" />}
        </div>

        <div className={`grid gap-3 ${options.join('').length > 90 ? '' : 'sm:grid-cols-2'}`}>
          {options.map((option, position) => {
            const isPicked = picked === option
            const isAnswer = checked?.correctAnswer === option
            const style = checked
              ? isAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : isPicked ? 'animate-shake border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-400'
              : isPicked ? 'border-brand bg-rose-50 text-brand' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            return (
              <button
                key={option}
                type="button"
                disabled={Boolean(checked)}
                aria-pressed={isPicked}
                onClick={() => setPicked(option)}
                className={`font-chinese flex min-h-16 items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-semibold transition-colors ${bigOptions ? 'text-2xl' : 'text-base'} ${style}`}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-current text-xs font-bold opacity-60`}>{position + 1}</span>
                <span className="min-w-0">{option}</span>
              </button>
            )
          })}
        </div>
      </div>
    </LessonFrame>
  )
}

