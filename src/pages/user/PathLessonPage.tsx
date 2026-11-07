import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPathNode, quizApi, scoreDialogueLine, type PathNodeDetail } from '@/api/learningPathApi'
import { LessonFrame } from '@/components/learningpath/LessonFrame'
import { PathNodeContent } from '@/components/learningpath/PathNodeContent'
import { PathQuizRunner } from '@/components/learningpath/PathQuizRunner'

/** A woven lesson or a unit test runs straight away; a dialogue or passage is read first, then its questions. */
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
      setQuizzing(loaded.type === 'LESSON' || loaded.type === 'CHECKPOINT')
    }).catch((cause) => {
      if (active) setError((cause as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không mở được bài này.')
    })
    return () => { active = false }
  }, [id])

  if (error) {
    return (
      <LessonFrame>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          <p className="font-semibold">{error}</p>
          <Link to="/learning-path" className="mt-2 inline-block font-bold underline">Về bài đang học</Link>
        </div>
      </LessonFrame>
    )
  }
  if (!node) {
    return <LessonFrame><div className="flex items-center justify-center gap-2 p-16 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Đang tải bài học...</div></LessonFrame>
  }

  const label = `${node.hskLevel >= 7 ? 'HSK 7–9' : `HSK ${node.hskLevel}`} · ${node.unitTitle} · ${node.title}`
  if (quizzing) {
    return (
      <PathQuizRunner
        key={id}
        api={api}
        label={label}
        scored={node.type === 'CHECKPOINT'}
        speak={(lineIndex, audio) => scoreDialogueLine(id, lineIndex, audio)}
        onContinue={(outcome) => navigate(outcome.nextNodeId && !outcome.newLevel ? `/learning-path/lesson/${outcome.nextNodeId}` : '/learning-path')}
      />
    )
  }
  return (
    <LessonFrame
      label={label}
      footer={(
        <div className="flex justify-end">
          <button type="button" onClick={() => setQuizzing(true)} className="btn-chunky btn-brand w-full py-3.5 text-base sm:w-auto">
            Trả lời câu hỏi<ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    >
      <PathNodeContent node={node} />
    </LessonFrame>
  )
}

/** The test that lets a learner who already knows a level move on. */
export const PathLevelTestPage: React.FC = () => {
  const { level } = useParams()
  const value = Number(level)
  const navigate = useNavigate()
  const api = useMemo(() => quizApi(`/learning-path/levels/${value}/test`), [value])
  return <PathQuizRunner api={api} label={`Kiểm tra vượt cấp · HSK ${value}`} scored onContinue={() => navigate('/learning-path')} />
}
