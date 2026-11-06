import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
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

/** The questions a learner got wrong, what they picked, and a review that clears them. */
export const PathMistakesPage: React.FC = () => {
  const [summary, setSummary] = useState<MistakesSummary | null>(null)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const api = useMemo(() => quizApi('/learning-path/mistakes/quiz'), [])

  const load = useCallback(() => {
    setError('')
    getMistakes().then(setSummary).catch(() => setError('Không tải được danh sách câu sai.'))
  }, [])

  useEffect(load, [load])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/learning-path" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#B52A2A]"><ArrowLeft className="h-3.5 w-3.5" />Về lộ trình</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#B52A2A]">Ôn tập</p>
        <h1 className="mt-1 text-xl font-bold text-slate-800">Câu từng làm sai</h1>
        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        {!summary && !error && <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải...</div>}

        {summary && reviewing && (
          <div className="mt-5">
            <PathQuizRunner api={api} onContinue={() => { setReviewing(false); load() }} />
          </div>
        )}

        {summary && !reviewing && (
          <>
            <p className="mt-1 text-sm text-slate-500">
              {summary.open > 0
                ? `Còn ${summary.open} câu cần ôn, đã thuộc ${summary.resolved} câu. Đúng ${summary.streakToResolve} lần liên tiếp thì câu đó được coi là đã thuộc.`
                : `Không còn câu nào cần ôn. Bạn đã thuộc ${summary.resolved} câu từng sai.`}
            </p>
            {summary.open === 0 && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />Câu sai sẽ tự xuất hiện ở đây khi bạn làm bài trong lộ trình.
              </div>
            )}
            {summary.open > 0 && (
              <>
                <button type="button" onClick={() => setReviewing(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-6 py-3 text-sm font-bold text-white hover:bg-[#9e2424]">
                  Ôn ngay<ArrowRight className="h-4 w-4" />
                </button>
                <ul className="mt-6 divide-y divide-slate-100">
                  {summary.items.map((item) => (
                    <li key={item.id} className="py-3.5">
                      <p className="font-chinese text-sm font-bold text-slate-800">{item.prompt}</p>
                      <p className="font-chinese mt-1 text-sm text-emerald-700">Đáp án: {item.answer}</p>
                      {item.lastPicked && <p className="font-chinese text-sm text-rose-700">Bạn đã chọn: {item.lastPicked}</p>}
                      <p className="mt-1 text-xs text-slate-500">
                        {item.level >= 7 ? 'HSK 7–9' : `HSK ${item.level}`} · {SKILL_LABELS[item.skill] ?? item.skill} · sai {item.wrongCount} lần · đang đúng {item.correctStreak}/{summary.streakToResolve}
                      </p>
                    </li>
                  ))}
                </ul>
                {summary.open > summary.items.length && <p className="mt-2 text-xs text-slate-500">Đang hiện {summary.items.length} câu sai nhiều nhất.</p>}
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
