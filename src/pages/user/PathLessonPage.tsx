import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPathNode, quizApi, type PathNodeDetail } from '@/api/learningPathApi'
import { PathNodeContent } from '@/components/learningpath/PathNodeContent'
import { PathQuizRunner } from '@/components/learningpath/PathQuizRunner'

/** Learn the material of one node, then pass its quiz to open the next one. */
export const PathLessonPage: React.FC = () => {
  const { nodeId } = useParams()
  const id = Number(nodeId)
  const navigate = useNavigate()
  const [node, setNode] = useState<PathNodeDetail | null>(null)
  const [error, setError] = useState('')
  const [quizzing, setQuizzing] = useState(false)
  const api = useMemo(() => quizApi(`/learning-path/nodes/${id}/quiz`), [id])

  useEffect(() => {
    let active = true
    setNode(null)
    setError('')
    getPathNode(id).then((loaded) => {
      if (!active) return
      setNode(loaded)
      // A unit test has nothing to read first.
      setQuizzing(loaded.type === 'CHECKPOINT')
    }).catch((cause) => {
      if (active) setError((cause as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không mở được bài này.')
    })
    return () => { active = false }
  }, [id])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/learning-path" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#B52A2A]"><ArrowLeft className="h-3.5 w-3.5" />Về lộ trình</Link>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p className="font-semibold">{error}</p>
          <Link to="/learning-path" className="mt-2 inline-block font-semibold underline">Về bài đang học</Link>
        </div>
      )}
      {!node && !error && <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải bài học...</div>}
      {node && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#B52A2A]">{node.hskLevel >= 7 ? 'HSK 7–9' : `HSK ${node.hskLevel}`} · {node.unitTitle}</p>
          <h1 className="mt-1 text-xl font-bold text-slate-800">{node.title}</h1>
          <div className="mt-5">
            {quizzing ? (
              <PathQuizRunner
                key={id}
                api={api}
                onReview={node.type === 'CHECKPOINT' ? undefined : () => setQuizzing(false)}
                onContinue={(outcome) => navigate(outcome.nextNodeId && !outcome.newLevel ? `/learning-path/lesson/${outcome.nextNodeId}` : '/learning-path')}
              />
            ) : (
              <>
                <PathNodeContent node={node} />
                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={() => setQuizzing(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-6 py-3 text-sm font-bold text-white hover:bg-[#9e2424]">
                    Làm bài kiểm tra<ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

/** The test that lets a learner who already knows a level move on. */
export const PathLevelTestPage: React.FC = () => {
  const { level } = useParams()
  const value = Number(level)
  const navigate = useNavigate()
  const api = useMemo(() => quizApi(`/learning-path/levels/${value}/test`), [value])
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/learning-path" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#B52A2A]"><ArrowLeft className="h-3.5 w-3.5" />Về lộ trình</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#B52A2A]">Kiểm tra vượt cấp</p>
        <h1 className="mt-1 mb-5 text-xl font-bold text-slate-800">Toàn bộ HSK {value}</h1>
        <PathQuizRunner api={api} retryWrong={false} onContinue={() => navigate('/learning-path')} />
      </section>
    </div>
  )
}
