import React, { useEffect, useState } from 'react'
import { BookOpen, Clock, Headphones, Lightbulb, ListChecks, Loader2, LogIn, Play, RotateCcw, Timer, Trophy, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  discardMockAttempt,
  listMockTests,
  startMockTest,
  SKILL_LABEL,
  type MockMode,
  type MockSummary,
} from '@/api/mockTestApi'
import { apiError } from '@/api/listeningApi'
import { useRequireLogin } from '@/router/useRequireLogin'

const SKILL_ICON: Record<string, React.ElementType> = { listening: Headphones, reading: BookOpen, writing: ListChecks }
const MODE_LABEL: Record<MockMode, string> = { PRACTICE: 'Luyện tập', EXAM: 'Thi thử' }

const Status: React.FC<{ test: MockSummary }> = ({ test }) => {
  const open = test.openAttempt
  if (open) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        Đang làm câu {Math.min(open.currentIndex + 1, test.questionCount)}/{test.questionCount} · {MODE_LABEL[open.mode]}
      </span>
    )
  }
  if (test.lastResult) {
    const r = test.lastResult
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${r.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
        <Trophy className="h-3.5 w-3.5" />Đã làm · {r.score}/{r.maxScore} · {r.passed ? 'Đạt' : 'Chưa đạt'}
      </span>
    )
  }
  return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Chưa làm</span>
}

/** Official HSK 3.0 sample papers: status, contents, and starting or resuming an attempt. */
export const MockTestList: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, requireLogin } = useRequireLogin()
  const [tests, setTests] = useState<MockSummary[] | null>(null)
  const [error, setError] = useState('')
  const [choosing, setChoosing] = useState<MockSummary | null>(null)
  const [params, setParams] = useSearchParams()

  const load = () => listMockTests().then(setTests).catch(() => setError('Không tải được danh sách đề thi.'))
  useEffect(() => { load() }, [isAuthenticated])

  const open = (test: MockSummary) => {
    // A guest signs in first and comes back here with ?mock=<id>, which opens this paper again (see below).
    if (!requireLogin({ pathname: '/exams', search: `?mock=${encodeURIComponent(test.id)}` })) return
    if (test.openAttempt) navigate(`/exams/mock/${test.openAttempt.id}`)
    else setChoosing(test)
  }

  // Back from the login page: carry on with the paper the guest had picked.
  const wanted = params.get('mock')
  useEffect(() => {
    if (!wanted || !isAuthenticated || !tests) return
    const test = tests.find((t) => t.id === wanted)
    setParams((p) => { p.delete('mock'); return p }, { replace: true })
    if (test) open(test)
  }, [wanted, isAuthenticated, tests]) // eslint-disable-line react-hooks/exhaustive-deps

  const restart = async (test: MockSummary) => {
    if (!test.openAttempt) return
    if (!window.confirm('Bỏ bài đang làm và làm lại từ đầu?')) return
    try {
      await discardMockAttempt(test.openAttempt.id)
      setChoosing({ ...test, openAttempt: null })
      load()
    } catch (err) {
      toast.error('Chưa làm lại được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Đề thi mẫu HSK 3.0</h2>
        <p className="mt-0.5 text-sm text-slate-500">Đề mẫu chính thức, có audio phần nghe. Luyện tập để xem đáp án ngay, hoặc thi thử có tính giờ.</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          Bản quyền đề mẫu thuộc Trung tâm Hợp tác Giao lưu Ngôn ngữ Trung Quốc và Nước ngoài (中外语言交流合作中心), công bố tại{' '}
          <a href="https://www.chinesetest.cn/HSK" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-brand">chinesetest.cn</a>.
          Yibi chỉ chuyển sang dạng làm bài trực tuyến để phục vụ việc học, không dùng vào mục đích thương mại.
        </p>
      </div>
      {!isAuthenticated && (
        <p className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
          <LogIn className="h-3.5 w-3.5" />Bạn đang xem với tư cách khách. Đăng nhập để làm bài, lưu bài đang làm và xem lại kết quả.
        </p>
      )}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {!tests && !error && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Đang tải đề...</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tests?.map((test) => (
          <article key={test.id} className="card-soft flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{test.title}</h3>
                <p className="text-sm font-semibold text-brand">{test.stage}</p>
              </div>
              <span className="rounded-xl bg-rose-50 px-2 py-1 text-[11px] font-bold text-brand">Đề mẫu</span>
            </div>
            <div className="mt-3"><Status test={test} /></div>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
              {test.parts.map((part) => {
                const Icon = SKILL_ICON[part.skill] ?? ListChecks
                return <li key={part.skill} className="inline-flex items-center gap-1.5"><Icon className="h-4 w-4 text-slate-400" />{SKILL_LABEL[part.skill]} {part.questionCount} câu</li>
              })}
            </ul>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-600"><Clock className="h-4 w-4 text-slate-400" />{test.questionCount} câu · {test.durationMinutes} phút</p>
            <div className="mt-5 flex items-center gap-2 pt-1 sm:mt-auto">
              <button type="button" onClick={() => open(test)} className="btn-chunky btn-brand flex-1">
                <Play className="h-4 w-4 fill-white" />{test.openAttempt ? 'Tiếp tục' : test.lastResult ? 'Làm lại' : 'Làm bài'}
              </button>
              {test.openAttempt && (
                <button type="button" onClick={() => restart(test)} title="Làm lại từ đầu" aria-label="Làm lại từ đầu" className="btn-chunky btn-paper px-3"><RotateCcw className="h-4 w-4" /></button>
              )}
              {!test.openAttempt && test.lastResult && (
                <button type="button" onClick={() => navigate(`/exams/mock/${test.lastResult!.id}`)} className="btn-chunky btn-paper">Xem bài</button>
              )}
            </div>
          </article>
        ))}
      </div>
      {choosing && <ModeDialog test={choosing} onClose={() => setChoosing(null)} />}
    </section>
  )
}

const ModeDialog: React.FC<{ test: MockSummary; onClose: () => void }> = ({ test, onClose }) => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<MockMode>('PRACTICE')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const begin = async () => {
    setBusy(true)
    try {
      const view = await startMockTest(test.id, mode)
      navigate(`/exams/mock/${view.attempt.id}`)
    } catch (err) {
      toast.error('Chưa bắt đầu được', { description: apiError(err, 'Hãy thử lại.') })
      setBusy(false)
    }
  }

  const choices: { value: MockMode; icon: React.ElementType; title: string; text: string }[] = [
    { value: 'PRACTICE', icon: Lightbulb, title: 'Luyện tập', text: 'Hiện đáp án và lời thoại ngay khi chọn. Không tính giờ, nghe lại bao nhiêu lần cũng được.' },
    { value: 'EXAM', icon: Timer, title: 'Thi thử', text: `Như thi thật: ${test.durationMinutes} phút, mỗi câu nghe chỉ phát một lần, chấm điểm khi nộp bài.` },
  ]

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="mode-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="mode-title" className="text-xl font-extrabold text-slate-900">{test.title} · Chọn cách làm bài</h2>
            <p className="mt-0.5 text-sm text-slate-500">{test.questionCount} câu · {test.durationMinutes} phút</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-3" role="radiogroup" aria-label="Chế độ làm bài">
          {choices.map(({ value, icon: Icon, title, text }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${mode === value ? 'border-brand bg-rose-50' : 'border-border hover:bg-slate-50'}`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${mode === value ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-5 w-5" /></span>
              <span>
                <span className="block font-extrabold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-slate-600">{text}</span>
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={begin} disabled={busy} className="btn-chunky btn-brand mt-6 w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}Bắt đầu
        </button>
      </div>
    </div>
  )
}
