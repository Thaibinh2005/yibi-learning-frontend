import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, History, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getMistakes, quizApi, type MistakesSummary } from '@/api/learningPathApi'
import { PathQuizRunner } from '@/components/learningpath/PathQuizRunner'

const SKILL_LABELS: Record<string, string> = {
  vocabulary: 'Từ vựng',
  phonetics: 'Phát âm',
  characters: 'Chữ Hán',
  grammar: 'Ngữ pháp',
  reading: 'Đọc hiểu',
  listening: 'Nghe hiểu',
}

/** A review that clears the questions a learner got wrong. */
export const PathMistakesReviewPage: React.FC = () => {
  const navigate = useNavigate()
  const api = useMemo(() => quizApi('/learning-path/mistakes/quiz'), [])
  return <PathQuizRunner api={api} label="Ôn câu từng sai" exitTo="/learning-path/mistakes" onContinue={() => navigate('/learning-path/mistakes')} />
}

/** The questions a learner got wrong and what they picked. */
export const PathMistakesPage: React.FC = () => {
  const [summary, setSummary] = useState<MistakesSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMistakes().then(setSummary).catch(() => setError('Không tải được danh sách câu sai.'))
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/learning-path" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand"><ArrowLeft className="h-4 w-4" />Về lộ trình</Link>
      {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {!summary && !error && <div className="flex items-center justify-center gap-2 p-16 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Đang tải...</div>}

      {summary && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white sm:p-8">
          <History className="absolute -right-4 -top-4 h-36 w-36 opacity-15" aria-hidden="true" />
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Câu từng làm sai</h1>
          <p className="mt-2 max-w-lg text-sm font-medium text-white/95">
            Đúng {summary.streakToResolve} lần liên tiếp thì câu đó được coi là đã thuộc và rời khỏi danh sách.
          </p>
          <dl className="mt-5 flex gap-8">
            <div><dd className="text-3xl font-extrabold tabular-nums">{summary.open}</dd><dt className="text-xs font-semibold text-white/90">Cần ôn</dt></div>
            <div><dd className="text-3xl font-extrabold tabular-nums">{summary.resolved}</dd><dt className="text-xs font-semibold text-white/90">Đã thuộc</dt></div>
          </dl>
          {summary.open > 0 && (
            <Link to="/learning-path/mistakes/review" className="btn-chunky mt-6 bg-white text-orange-700 [--edge:#C2410C]">
              Ôn ngay<ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      )}

      {summary && summary.open === 0 && (
        <div className="card-soft flex items-center gap-3 p-5 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          Không còn câu nào cần ôn. Câu sai sẽ tự xuất hiện ở đây khi bạn làm bài trong lộ trình.
        </div>
      )}

      {summary && summary.open > 0 && (
        <>
          <ul className="space-y-3">
            {summary.items.map((item) => (
              <li key={item.id} className="card-soft p-4 sm:p-5">
                <p className="font-chinese text-base font-bold text-slate-900">{item.prompt}</p>
                <div className="font-chinese mt-2 space-y-1 text-sm">
                  <p className="flex gap-2 text-emerald-800"><span className="shrink-0 font-bold">Đúng:</span><span>{item.answer}</span></p>
                  {item.lastPicked && <p className="flex gap-2 text-rose-700"><span className="shrink-0 font-bold">Bạn chọn:</span><span>{item.lastPicked}</span></p>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                  <span>{item.level >= 7 ? 'HSK 7–9' : `HSK ${item.level}`}</span>
                  <span>{SKILL_LABELS[item.skill] ?? item.skill}</span>
                  <span>Sai {item.wrongCount} lần</span>
                  <span className="ml-auto inline-flex items-center gap-1" aria-label={`Đang đúng ${item.correctStreak} trên ${summary.streakToResolve} lần`}>
                    {Array.from({ length: summary.streakToResolve }, (_, n) => (
                      <span key={n} className={`h-2 w-5 rounded-full ${n < item.correctStreak ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {summary.open > summary.items.length && <p className="text-center text-xs text-slate-500">Đang hiện {summary.items.length} câu sai nhiều nhất.</p>}
        </>
      )}
    </div>
  )
}
