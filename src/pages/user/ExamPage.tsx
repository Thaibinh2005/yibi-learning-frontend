import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock, Ear, FileCheck, Keyboard, LoaderCircle, Mic, Newspaper, Play, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getRoadmap,
  startMockExam,
  submitMockExam,
  type ExamPaper,
  type ExamQuestion,
  type ExamResult,
} from '@/api/learningPathApi'
import { PinyinInput } from '@/components/exam/PinyinInput'
import { AudioButton } from '@/components/ui/AudioButton'
import { GuestNotice } from '@/components/ui/GuestNotice'
import { useAppSelector } from '@/app/hooks'

const levelName = (level: number) => (level >= 7 ? 'HSK 7–9' : `HSK ${level}`)
const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const SECTION_ICONS: Record<string, React.ElementType> = { LISTENING: Ear, READING: Newspaper, TYPING: Keyboard }

const QuestionBlock: React.FC<{
  question: ExamQuestion
  number: number
  value: string
  onChange: (value: string) => void
  review?: ExamResult['review'][number]
}> = ({ question, number, value, onChange, review }) => (
  <div className="rounded-xl border border-slate-100 p-4">
    <p className="text-sm font-semibold text-slate-800"><span className="mr-1.5 text-slate-400">{number}.</span>{question.prompt}</p>
    {question.kind === 'TYPING' ? (
      <div className="mt-2.5"><PinyinInput value={value} onChange={onChange} disabled={Boolean(review)} label={`Câu ${number}: gõ chữ Hán`} /></div>
    ) : (
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => {
          const state = review
            ? option === review.answer ? 'border-emerald-400 bg-emerald-50' : option === value ? 'border-rose-400 bg-rose-50' : 'border-slate-200 opacity-60'
            : option === value ? 'border-[#C8322B] bg-red-50 text-[#C8322B]' : 'border-slate-200 hover:bg-slate-50'
          return <button key={option} type="button" disabled={Boolean(review)} onClick={() => onChange(option)} className={`font-chinese rounded-lg border px-3 py-2 text-left text-sm ${state}`}>{option}</button>
        })}
      </div>
    )}
    {review && (
      <p className={`mt-2 flex items-start gap-1.5 text-xs leading-relaxed ${review.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
        {review.correct ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
        <span>{review.correct ? 'Đúng. ' : `Đáp án: ${review.answer}. `}{review.explanation}</span>
      </p>
    )}
  </div>
)

/** A timed practice exam on the computer: listening, reading and typing Chinese. */
export const ExamPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [learnerLevel, setLearnerLevel] = useState<number | null>(null)
  const [paper, setPaper] = useState<ExamPaper | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const latestAnswers = useRef(answers)
  latestAnswers.current = answers

  useEffect(() => {
    if (!isAuthenticated) return
    getRoadmap().then((roadmap) => setLearnerLevel(roadmap.learnerLevel)).catch(() => setError('Không tải được trình độ của bạn.'))
  }, [isAuthenticated])

  const start = async (level: number) => {
    setBusy(true)
    setError('')
    try {
      const loaded = await startMockExam(level)
      setPaper(loaded)
      setAnswers({})
      setResult(null)
      setSecondsLeft(loaded.durationMinutes * 60)
    } catch {
      setError('Không tạo được đề thi. Hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  const submit = useCallback(async () => {
    if (!paper) return
    setBusy(true)
    setError('')
    try {
      setResult(await submitMockExam(paper.level, paper.seed, latestAnswers.current))
      window.scrollTo({ top: 0 })
    } catch {
      setError('Chưa nộp được bài. Hãy bấm nộp lại.')
    } finally {
      setBusy(false)
    }
  }, [paper])

  const running = Boolean(paper) && !result
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const timeUp = running && secondsLeft === 0
  useEffect(() => {
    if (timeUp) submit()
  }, [timeUp, submit])

  if (!paper) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h1 className="text-xl font-bold text-slate-800">Thi thử trên máy</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Mô phỏng cách thi HSK trên máy tính: có đồng hồ đếm ngược, phần nghe, phần đọc và gõ chữ Hán ngay trên trang. Đề do hệ thống tạo từ nội dung bài học của cấp đó, không phải đề thi HSK chính thức.</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />25 phút</span>
            <span className="flex items-center gap-1"><FileCheck className="h-3.5 w-3.5" />Đạt từ 60%</span>
            <span className="flex items-center gap-1"><Keyboard className="h-3.5 w-3.5" />Có bộ gõ pinyin trên trang</span>
          </div>
        </div>
        <Link to="/exams/hskk" className="card-soft group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700"><Mic className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-slate-900">Thi thử HSKK (nói)</span>
            <span className="block text-sm text-slate-500">Nhắc lại, trả lời câu hỏi và đọc thành tiếng, có ghi âm và chấm điểm ước lượng.</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
        </Link>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {!isAuthenticated && <GuestNotice title="Đăng nhập để vào thi" message="Đề thi thử được tạo theo cấp của bạn và lưu điểm để so với mục tiêu. Hãy đăng nhập để bắt đầu làm bài." />}
        {isAuthenticated && learnerLevel === null && !error && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải...</div>}
        <div className="grid gap-4 md:grid-cols-2">
          {learnerLevel !== null && Array.from({ length: learnerLevel }, (_, index) => learnerLevel - index).map((level) => (
            <div key={level} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div>
                <p className="font-semibold text-slate-800">Đề luyện {levelName(level)}</p>
                <p className="mt-0.5 text-xs text-slate-500">{level === learnerLevel ? 'Cấp hiện tại của bạn' : 'Ôn lại cấp đã qua'}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => start(level)} className="flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-[#C8322B] hover:bg-rose-100 disabled:opacity-50">
                <Play className="h-3 w-3 fill-[#C8322B]" /> Vào thi
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const reviewOf = (id: string) => result?.review.find((item) => item.id === id)
  let counter = 0

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs">
        <p className="font-bold text-slate-800">Đề luyện {levelName(paper.level)}</p>
        {running && <span className={`inline-flex items-center gap-1.5 font-mono text-lg font-bold ${secondsLeft < 120 ? 'text-rose-600' : 'text-slate-700'}`} role="timer"><Clock className="h-4 w-4" />{clock(secondsLeft)}</span>}
        {running && <button type="button" disabled={busy} onClick={submit} className="rounded-xl bg-[#C8322B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A32620] disabled:opacity-50">Nộp bài</button>}
        {result && <button type="button" onClick={() => setPaper(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Về danh sách đề</button>}
      </div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {result && (
        <div className={`rounded-2xl p-6 text-center ${result.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          <p className="text-4xl font-bold">{result.scorePercent}%</p>
          <p className="mt-1 text-sm font-bold">Ước tính {result.estimatedScore}/{result.scale} điểm{result.targetScore != null ? (result.estimatedScore >= result.targetScore ? ` · đã đạt mục tiêu ${result.targetScore}` : ` · còn thiếu ${result.targetScore - result.estimatedScore} so với mục tiêu ${result.targetScore}`) : ''}</p>
          <p className="mt-1 text-sm font-semibold">{result.passed ? 'Đạt' : 'Chưa đạt'} · đúng {result.correct}/{result.total} câu · cần từ {paper.passPercent}%</p>
        </div>
      )}
      {paper.sections.map((section) => {
        const Icon = SECTION_ICONS[section.kind] ?? FileCheck
        return (
          <section key={section.kind} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="flex items-center gap-2 font-bold text-slate-800"><Icon className="h-4 w-4 text-[#C8322B]" />{section.title}</h2>
            {section.kind === 'TYPING' && <p className="mt-1 text-xs text-slate-500">Gõ pinyin không dấu rồi nhấn phím cách hoặc số để chọn chữ. Xóa lùi để sửa.</p>}
            <div className="mt-3 space-y-5">
              {section.passages.map((passage, index) => (
                <div key={index} className="space-y-3">
                  {passage.title && <p className="text-sm font-semibold text-slate-600">{passage.title}</p>}
                  {passage.audioUrl && <audio controls preload="none" src={passage.audioUrl} className="w-full" />}
                  {!passage.audioUrl && section.kind === 'LISTENING' && passage.text && <AudioButton text={passage.text} size="lg" title="Nghe bài" />}
                  {section.kind !== 'LISTENING' && passage.text && <p className="font-chinese rounded-xl bg-slate-50 p-4 text-base leading-loose text-slate-800">{passage.text}</p>}
                  {passage.questions.map((question) => {
                    counter += 1
                    return (
                      <QuestionBlock
                        key={question.id}
                        question={question}
                        number={counter}
                        value={answers[question.id] ?? ''}
                        onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                        review={reviewOf(question.id)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
