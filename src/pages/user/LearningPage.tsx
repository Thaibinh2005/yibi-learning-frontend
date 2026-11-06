import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Clock3, Layers, LoaderCircle, Play, Sparkles, X, XCircle } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getCourses, type Course } from '@/api/courseApi'
import { generateAiLessonContent, getLessonsByCourse, startLessonPracticeSession, submitPracticeAnswer, type GeneratedLessonActivity, type Lesson, type LessonContentItem, type PracticeAnswerResult } from '@/api/lessonApi'
import { addLessonVocabularyToFlashcards } from '@/api/srsApi'
import { AudioButton } from '@/components/ui/AudioButton'

// Level 7 is the combined HSK 7–9 band: the syllabus does not split it.
const HSK_LEVELS = Array.from({ length: 7 }, (_, index) => index + 1)
const FULL_SECTIONS = ['vocabulary', 'characters', 'grammar', 'readings', 'listenings', 'questions']
const hskLabel =(level: number) => (level === 7 ? '7–9' : String(level))
const TOPIC_GROUPS = [
  { key: 'VOCABULARY', title: 'Từ vựng', icon: '♧' },
  { key: 'GRAMMAR', title: 'Ngữ pháp', icon: '✎' },
  { key: 'HANZI', title: 'Chữ Hán', icon: '字' },
  { key: 'READING', title: 'Bài đọc', icon: '📖' },
  { key: 'LISTENING', title: 'Bài nghe', icon: '🎧' },
]

const SECTION_LABELS: Array<{ key: keyof NonNullable<Lesson['lessonPayload']>['sections']; label: string }> = [
  { key: 'objectives', label: 'Mục tiêu' }, { key: 'phonetics', label: 'Phát âm' },
  { key: 'characters', label: 'Chữ Hán' }, { key: 'vocabulary', label: 'Từ vựng' },
  { key: 'dialogues', label: 'Hội thoại' }, { key: 'grammar', label: 'Ngữ pháp' },
  { key: 'readings', label: 'Bài đọc' }, { key: 'listenings', label: 'Bài nghe' },
  { key: 'questions', label: 'Câu hỏi' }, { key: 'exercises', label: 'Bài tập' },
  { key: 'culture_notes', label: 'Văn hóa' },
]

const showValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return ''
  if (Array.isArray(value)) return value.map(showValue).filter(Boolean).join(' · ')
  if (typeof value === 'object') return Object.entries(value as Record<string, unknown>)
    .map(([key, nested]) => {
      const text = showValue(nested)
      return text ? `${key.replaceAll('_', ' ')}: ${text}` : ''
    }).filter(Boolean).join(' | ')
  return String(value)
}

const QuestionCard: React.FC<{ item: LessonContentItem }> = ({ item }) => {
  const [picked, setPicked] = useState<string | null>(null)
  const options = Array.isArray(item.options) ? item.options.map(String) : []
  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
      <p className="text-sm font-semibold text-slate-800">{showValue(item.question)}</p>
      <div className="mt-2 space-y-1.5">
        {options.map((option) => {
          const state = picked !== null && option === item.answer ? 'border-emerald-300 bg-emerald-50' : picked !== null && option === picked ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'
          return <button key={option} type="button" disabled={picked !== null} onClick={() => setPicked(option)} className={`block w-full rounded-lg border px-3 py-2 text-left text-sm text-slate-700 ${state}`}>{option}</button>
        })}
      </div>
      {picked !== null && <p className="mt-2 text-xs leading-relaxed text-slate-500">{picked === item.answer ? 'Chính xác. ' : `Đáp án đúng: ${showValue(item.answer).replace(/[.。]$/, '')}. `}{showValue(item.explanation)}</p>}
    </article>
  )
}

const lessonTitle = (lesson: Lesson) => lesson.lessonPayload?.title || lesson.title
const lessonNumber = (lesson: Lesson) => lesson.lessonPayload?.lesson_number ?? lesson.lessonOrder

export const LearningPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedLevel = Number(searchParams.get('hskLevel') || 1)
  const selectedHskLevel = Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 7 ? requestedLevel : 1
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_GROUPS[0].key)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [error, setError] = useState('')
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checkedAnswers, setCheckedAnswers] = useState<Set<string>>(new Set())
  const [answerResults, setAnswerResults] = useState<Record<string, PracticeAnswerResult>>({})
  const [answerStartedAt, setAnswerStartedAt] = useState<Record<string, number>>({})
  const [practiceSessionId, setPracticeSessionId] = useState<number | null>(null)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['vocabulary', 'grammar', 'characters', 'readings', 'listenings', 'questions']))
  const [addingFlashcards, setAddingFlashcards] = useState(false)
  const [flashcardMessage, setFlashcardMessage] = useState('')

  useEffect(() => {
    if (!lessonModalOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLessonModalOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [lessonModalOpen])

  useEffect(() => {
    let active = true
    setLoadingCourses(true)
    getCourses().then((items) => {
      if (!active) return
      const matching = items.filter((course) => course.hskLevel === selectedHskLevel)
        .sort((a, b) => b.totalLessons - a.totalLessons)
      setCourses(matching)
      setSelectedCourse(matching[0] ?? null)
      if (matching.length === 0) setError(`Chưa có khóa học HSK ${selectedHskLevel} trong hệ thống.`)
    }).catch(() => active && setError('Không tải được khóa học. Hãy kiểm tra backend.'))
      .finally(() => active && setLoadingCourses(false))
    return () => { active = false }
  }, [selectedHskLevel])

  useEffect(() => {
    if (!selectedCourse) { setLessons([]); setSelectedLesson(null); return }
    let active = true
    setLoadingLessons(true)
    getLessonsByCourse(selectedCourse.id).then((items) => {
      if (!active) return
      const ordered = [...items].sort((a, b) => lessonNumber(a) - lessonNumber(b))
      setLessons(ordered)
      if (ordered.length === 0) setError(`Khóa học ${selectedCourse.title} chưa có bài học.`)
    }).catch(() => active && setError('Không tải được danh sách bài học.'))
      .finally(() => active && setLoadingLessons(false))
    return () => { active = false }
  }, [selectedCourse?.id])

  useEffect(() => {
    setSelectedTopic(TOPIC_GROUPS.find((group) => lessons.some((lesson) => lesson.contentType === group.key))?.key ?? TOPIC_GROUPS[0].key)
  }, [lessons])

  useEffect(() => {
    setAnswers({})
    setCheckedAnswers(new Set())
    setAnswerResults({})
    setAnswerStartedAt({})
    setPracticeSessionId(null)
    setAiError('')
    setOpenSections(new Set(['vocabulary', 'grammar', 'characters', 'readings', 'listenings', 'questions']))
  }, [selectedLesson?.id])

  const topic = TOPIC_GROUPS.find((group) => group.key === selectedTopic) ?? TOPIC_GROUPS[0]
  const topicLessons = useMemo(() => lessons.filter((lesson) => lesson.contentType === topic.key), [lessons, topic])
  const activeSections = useMemo(() => {
    const sections = selectedLesson?.lessonPayload?.sections
    if (!sections) return []
    return SECTION_LABELS.map((section) => ({ ...section, items: sections[section.key] ?? [] }))
      // Textbook exercises are not AI-generated quiz questions. Keep them in
      // the stored source payload, but show them separately from lesson preview.
      .filter((section) => section.items.length > 0 && section.key !== 'exercises')
  }, [selectedLesson])
  const generated = selectedLesson?.lessonPayload?.generated_lesson
  const vocabularyCount = selectedLesson?.lessonPayload?.sections?.vocabulary?.length ?? 0
  const grammarCount = selectedLesson?.lessonPayload?.sections?.grammar?.length ?? 0
  const dialogueCount = selectedLesson?.lessonPayload?.sections?.dialogues?.length ?? 0
  const sourceExerciseCount = selectedLesson?.lessonPayload?.sections?.exercises?.length ?? 0

  const openLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setPracticeMode(false)
    setFlashcardMessage('')
    setLessonModalOpen(true)
  }

  const startPractice = async () => {
    if (!selectedLesson) return
    setGenerating(true)
    setAiError('')
    try {
      const created = generated ?? await generateAiLessonContent(selectedLesson.id)
      const updated: Lesson = { ...selectedLesson, lessonPayload: selectedLesson.lessonPayload ? { ...selectedLesson.lessonPayload, generated_lesson: created } : null }
      setSelectedLesson(updated)
      setLessons((current) => current.map((lesson) => lesson.id === updated.id ? updated : lesson))
      const sessionId = await startLessonPracticeSession(selectedLesson.id)
      setPracticeSessionId(sessionId)
      setAnswers({})
      setCheckedAnswers(new Set())
      setAnswerResults({})
      setAnswerStartedAt({})
      setPracticeMode(true)
    } catch (cause) {
      const responseMessage = (cause as { response?: { data?: { message?: string } } })?.response?.data?.message
      setAiError(responseMessage || 'Chưa tạo được bài luyện tập. Kiểm tra cấu hình Gemini trên backend rồi thử lại.')
    } finally { setGenerating(false) }
  }

  const addFlashcards = async () => {
    if (!selectedLesson) return
    setAddingFlashcards(true)
    setFlashcardMessage('')
    try {
      const result = await addLessonVocabularyToFlashcards(selectedLesson.id)
      setFlashcardMessage(`${result.added} từ đã thêm${result.alreadyInDeck ? ` · ${result.alreadyInDeck} từ đã có` : ''}${result.unavailable ? ` · ${result.unavailable} từ chưa có trong bộ flashcard` : ''}`)
      if (result.added > 0 || result.alreadyInDeck > 0) window.setTimeout(() => navigate('/flashcards'), 850)
    } catch { setFlashcardMessage('Không thêm được từ vựng. Hãy đăng nhập lại và thử lần nữa.') }
    finally { setAddingFlashcards(false) }
  }

  const toggleSection = (key: string) => setOpenSections((current) => {
    const next = new Set(current)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })

  const chooseAnswer = (id: string, answer: string) => {
    setAnswers((current) => ({ ...current, [id]: answer }))
    setAnswerStartedAt((current) => ({ ...current, [id]: performance.now() }))
    setAnswerResults((current) => { const next = { ...current }; delete next[id]; return next })
    setCheckedAnswers((current) => { const next = new Set(current); next.delete(id); return next })
  }

  const checkAnswer = async (activity: GeneratedLessonActivity) => {
    const selected = answers[activity.id]
    if (!practiceSessionId || !activity.question_code || !selected) {
      setAiError('Câu hỏi chưa được lưu vào ngân hàng. Hãy tải lại bài học rồi thử lại.')
      return
    }
    try {
      const result = await submitPracticeAnswer(
        practiceSessionId,
        activity.question_code,
        selected,
        Math.max(0, Math.round(performance.now() - (answerStartedAt[activity.id] ?? performance.now()))),
      )
      setAnswerResults((current) => ({ ...current, [activity.id]: result }))
      setCheckedAnswers((current) => new Set(current).add(activity.id))
    } catch {
      setAiError('Không lưu được kết quả luyện tập. Hãy thử kiểm tra lại câu trả lời.')
    }
  }

  const renderSourceItem = (item: LessonContentItem, index: number) => {
    if (typeof item.simplified === 'string') {
      const meaning = showValue(item.meaning_vi) || showValue(item.meaning_en)
      const example = item.example && typeof item.example === 'object' ? (item.example as Record<string, unknown>) : null
      return (
        <article key={index} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-chinese text-xl font-bold text-slate-800">{item.simplified}</span>
            <span className="text-sm text-[#B52A2A]">{showValue(item.pinyin)}</span>
            {showValue(item.part_of_speech) && <span className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-500">{showValue(item.part_of_speech)}</span>}
          </p>
          {meaning ? <p className="mt-1 text-sm leading-relaxed text-slate-600">{meaning}{!item.meaning_vi && ' (tiếng Anh)'}</p> : <p className="mt-1 text-xs text-slate-400">Chưa có nghĩa.</p>}
          {example && <p className="mt-2 border-l-2 border-slate-200 pl-3 text-sm leading-relaxed"><span className="font-chinese text-slate-800">{showValue(example.zh)}</span><span className="block text-xs text-slate-500">{showValue(example.en)}</span></p>}
        </article>
      )
    }
    if (typeof item.question === 'string') return <QuestionCard key={index} item={item} />
    if (typeof item.text === 'string' || typeof item.transcript === 'string') {
      const body = showValue(item.text) || showValue(item.transcript)
      const isListening = typeof item.transcript === 'string'
      return (
        <article key={index} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-sm font-semibold text-slate-800">{showValue(item.title)}</p>
          {isListening && (typeof item.audio_url === 'string'
            ? <audio controls preload="none" src={item.audio_url} className="mt-2 w-full" />
            : <p className="mt-2 text-xs text-slate-400">Âm thanh của bài này chưa sẵn sàng.</p>)}
          {isListening
            ? <details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-[#B52A2A]">Xem văn bản</summary><p className="font-chinese mt-2 text-base leading-loose text-slate-800">{body}</p><p className="mt-1 text-sm text-[#B52A2A]">{showValue(item.pinyin)}</p><p className="mt-1 text-sm text-slate-600">{showValue(item.translation_vi)}</p></details>
            : <><p className="font-chinese mt-2 text-base leading-loose text-slate-800">{body}</p><details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-[#B52A2A]">Xem pinyin và bản dịch</summary><p className="mt-2 text-sm text-[#B52A2A]">{showValue(item.pinyin)}</p><p className="mt-1 text-sm text-slate-600">{showValue(item.translation_vi)}</p></details></>}
        </article>
      )
    }
    if (typeof item.hanzi === 'string' && Object.keys(item).length === 1) {
      return <span key={index} className="font-chinese grid h-14 w-14 place-items-center rounded-xl border border-slate-100 bg-slate-50/70 text-2xl text-slate-800">{item.hanzi}</span>
    }
    return (
    <article key={index} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
      {Object.entries(item).filter(([, value]) => showValue(value)).map(([key, value]) => (
        <p key={key} className="mb-1 last:mb-0 text-sm leading-relaxed text-slate-600"><span className="font-semibold capitalize text-slate-700">{key.replaceAll('_', ' ')}: </span>{showValue(value)}</p>
      ))}
    </article>
    )
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-[#B52A2A]"><BookOpen className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold text-slate-800">Lộ trình bài học HSK {hskLabel(selectedHskLevel)}</h1><p className="mt-1 text-sm text-slate-500">Chọn từ vựng, ngữ pháp hoặc chữ Hán, mở bài học và luyện tập theo nội dung giáo trình.</p></div>
          <Link to="/learning-path" className="ml-auto hidden items-center gap-2 rounded-xl bg-[#B52A2A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-800 sm:inline-flex"><Sparkles className="h-4 w-4" />Lộ trình cá nhân</Link>
        </div>
      </header>

      <nav aria-label="Chọn cấp giáo trình HSK" className="flex flex-wrap gap-2">
        {HSK_LEVELS.map((level) => <Link key={level} to={`/courses?hskLevel=${level}`} aria-current={selectedHskLevel === level ? 'page' : undefined} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${selectedHskLevel === level ? 'border-[#B52A2A] bg-red-50 text-[#B52A2A]' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>HSK {hskLabel(level)}</Link>)}
      </nav>

      {error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {loadingCourses || loadingLessons ? <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải giáo trình...</div> : courses.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Chưa có dữ liệu cho HSK {hskLabel(selectedHskLevel)}.</div> : (
        <div className="grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Nhóm bài</span><span>{lessons.length} bài</span></div>
            <div className="space-y-2">
              {TOPIC_GROUPS.map((group) => {
                const count = lessons.filter((lesson) => lesson.contentType === group.key).length
                if (!count) return null
                const active = group.key === selectedTopic
                return <button key={group.key} onClick={() => setSelectedTopic(group.key)} className={`w-full rounded-2xl border p-3 text-left transition ${active ? 'border-rose-200 bg-rose-50/80 text-[#B52A2A]' : 'border-transparent text-slate-700 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ${active ? 'bg-[#D94343] text-white' : 'bg-slate-100 text-slate-500'}`}>{group.icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{group.title}</span><span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-200"><span className="block h-full w-0 rounded-full bg-[#D94343]" /></span></span><span className="text-xs font-semibold">0/{count}</span></div>
                </button>
              })}
            </div>
            <Link to="/learning-path" className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:hidden"><Sparkles className="h-4 w-4 text-[#B52A2A]" />Lộ trình cá nhân hóa</Link>
          </aside>

          <main className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-xl">{topic.icon}</span><div><h2 className="font-bold text-slate-800">{topic.title}</h2><p className="text-xs text-slate-500">{topicLessons.length} bài học trong nhóm</p></div></div>
              <span className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{topicLessons.length} bài</span>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              {topicLessons.map((lesson, index) => {
                const sections = lesson.lessonPayload?.sections
                const vocab = sections?.vocabulary?.length ?? 0
                const grammar = sections?.grammar?.length ?? 0
                const characters = sections?.characters?.length ?? 0
                const dialogues = sections?.dialogues?.length ?? 0
                return <article key={lesson.id} className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-rose-200 hover:bg-rose-50/30 sm:gap-4 sm:px-5">
                  <button type="button" onClick={() => openLesson(lesson)} aria-label={`Mở bài ${lessonNumber(lesson)}: ${lessonTitle(lesson)}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#F36565] to-[#D72E32] text-white shadow-[0_3px_0_#A71F24] transition hover:scale-105"><Play className="ml-0.5 h-5 w-5 fill-current" /></button>
                  <button type="button" onClick={() => openLesson(lesson)} className="min-w-0 flex-1 text-left"><h3 className="truncate font-bold text-slate-800">Bài {lessonNumber(lesson)}: {lessonTitle(lesson)}</h3><div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500">{vocab > 0 && <span className="rounded-full bg-slate-100 px-2 py-1">♧ {vocab} từ vựng</span>}{grammar > 0 && <span className="rounded-full bg-slate-100 px-2 py-1">文 {grammar} ngữ pháp</span>}{characters > 0 && <span className="rounded-full bg-slate-100 px-2 py-1">字 {characters} chữ Hán</span>}{dialogues > 0 && <span className="rounded-full bg-slate-100 px-2 py-1">▢ {dialogues} hội thoại</span>}</div></button>
                  <button type="button" onClick={() => openLesson(lesson)} className="hidden items-center gap-1 text-xs font-semibold text-slate-400 transition group-hover:text-[#B52A2A] sm:inline-flex"><span>12 phút</span><ChevronRight className="h-4 w-4" /></button>
                </article>
              })}
              {topicLessons.length === 0 && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Nhóm này chưa có bài học trong giáo trình.</p>}
            </div>
          </main>
        </div>
      )}

      {lessonModalOpen && selectedLesson && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/45 p-0 backdrop-blur-[2px] sm:p-3 md:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setLessonModalOpen(false) }}>
        <section role="dialog" aria-modal="true" aria-labelledby="lesson-modal-title" className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-none bg-white shadow-2xl sm:h-[92dvh] sm:max-h-[calc(100dvh-1.5rem)] sm:max-w-5xl sm:rounded-2xl md:rounded-3xl">
          <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-3 py-3 sm:gap-4 sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-start gap-3"><button type="button" onClick={() => practiceMode ? setPracticeMode(false) : setLessonModalOpen(false)} aria-label="Quay lại" className="mt-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">{practiceMode ? <ArrowLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}</button><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#B52A2A]">HSK {hskLabel(selectedHskLevel)} · Bài {lessonNumber(selectedLesson)}</p><h2 id="lesson-modal-title" className="mt-1 text-xl font-bold text-slate-800">{lessonTitle(selectedLesson)}</h2><p className="mt-1 text-xs text-slate-500">{selectedLesson.lessonPayload?.source?.book_title ?? selectedCourse?.title}{selectedLesson.lessonPayload?.source?.start_page ? ` · Trang ${selectedLesson.lessonPayload.source.start_page}-${selectedLesson.lessonPayload.source.end_page}` : ''}</p></div></div>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              {!practiceMode && <button type="button" onClick={addFlashcards} disabled={addingFlashcards || vocabularyCount === 0} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Layers className="h-4 w-4" />{addingFlashcards ? 'Đang thêm...' : 'Flashcard'}</button>}
              {!practiceMode && <button type="button" onClick={startPractice} disabled={generating || !selectedLesson.lessonPayload} className="inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-60">{generating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{generating ? 'AI đang chuẩn bị bài học...' : generated ? 'Học lại' : 'Bắt đầu học'}</button>}
            </div>
            {aiError && <p role="alert" className="basis-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700">{aiError}</p>}
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-5 md:px-7 md:py-6">
            {flashcardMessage && !practiceMode && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flashcardMessage}</div>}
            {practiceMode && generated ? <div className="mx-auto max-w-3xl space-y-5">
              <div className="rounded-2xl bg-violet-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Bài học được xây dựng từ giáo trình</p><p className="mt-2 text-sm leading-relaxed text-slate-700">{generated.introduction}</p>{generated.teaching_points?.length > 0 && <div className="mt-4 space-y-2">{generated.teaching_points.map((point, index) => <p key={index} className="rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-slate-700"><b className="mr-2 text-violet-700">{index + 1}.</b>{point}</p>)}</div>}{generated.objectives.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">{generated.objectives.map((objective, index) => <li key={index}>{objective}</li>)}</ul>}</div>
              {generated.activities.map((activity: GeneratedLessonActivity, index) => {
                const chosen = answers[activity.id]
                const checked = checkedAnswers.has(activity.id)
                const correct = answerResults[activity.id]?.correct ?? chosen?.trim().toLocaleLowerCase() === activity.answer.trim().toLocaleLowerCase()
                return <article key={activity.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">{activity.skill === 'grammar' ? 'Ngữ pháp' : activity.skill === 'vocabulary' ? 'Từ vựng' : activity.skill === 'phonetics' ? 'Phát âm' : 'Chữ Hán'}</span><span className="text-xs text-slate-400">Câu {index + 1}/{generated.activities.length}</span></div><div className="flex items-start justify-between gap-2"><p className="font-semibold leading-relaxed text-slate-800">{activity.question}</p><AudioButton text={activity.question} size="sm" title="Phát âm câu hỏi" /></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{activity.options.map((option, optionIndex) => <button key={optionIndex} type="button" onClick={() => chooseAnswer(activity.id, option)} className={`rounded-xl border px-3.5 py-3 text-left text-sm transition ${chosen === option ? 'border-[#B52A2A] bg-red-50 font-semibold text-[#B52A2A]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{String.fromCharCode(65 + optionIndex)}. {option}</button>)}</div><div className="mt-3 flex items-center gap-3"><button type="button" disabled={!chosen || checked} onClick={() => checkAnswer(activity)} className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Kiểm tra</button>{checked && <span className={`inline-flex items-center gap-1 text-xs font-semibold ${correct ? 'text-emerald-700' : 'text-rose-700'}`}>{correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{correct ? 'Chính xác' : `Chưa đúng · Đáp án: ${answerResults[activity.id]?.correctAnswer ?? activity.answer}`}</span>}</div>{checked && <div className="mt-2 space-y-1 text-xs leading-relaxed text-slate-500"><p><b>Căn cứ trong bài:</b> {activity.evidence}</p><p>{answerResults[activity.id]?.explanation || activity.explanation}</p></div>}</article>
              })}
              <p className="text-center text-[11px] text-slate-400">Bài luyện tập được tạo từ dữ liệu của bài học · {generated.model}</p>
            </div> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0 space-y-5">
                <section className="rounded-2xl bg-slate-50 p-5"><h3 className="font-bold text-slate-800">Bài này học gì?</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{selectedLesson.lessonPayload?.sections?.objectives?.map((item) => showValue(item)).filter(Boolean).join(' ') || (selectedLesson.contentType === 'READING' ? 'Đọc đoạn văn, rồi trả lời câu hỏi để kiểm tra mức hiểu.' : selectedLesson.contentType === 'LISTENING' ? 'Nghe đoạn văn, rồi trả lời câu hỏi để kiểm tra mức hiểu.' : `Làm quen với nội dung bài ${lessonNumber(selectedLesson)} qua từ vựng, hội thoại và điểm ngữ pháp trong giáo trình.`)}</p><div className="mt-4 flex flex-wrap gap-2">{activeSections.map((section) => <span key={section.key} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{section.label} · {section.items.length}</span>)}</div></section>
                {sourceExerciseCount > 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500"><b className="text-slate-700">Bài tập trong sách: {sourceExerciseCount} mục.</b> Đây là nội dung gốc được trích từ giáo trình. Bộ câu trắc nghiệm AI sẽ xuất hiện riêng sau khi bấm “Bắt đầu học”.</div>}
                {activeSections.map((section) => {
                  const isOpen = openSections.has(section.key)
                  return <section key={section.key} className="overflow-hidden rounded-2xl border border-slate-200"><button type="button" aria-expanded={isOpen} onClick={() => toggleSection(section.key)} className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50"><span className="font-bold text-slate-800">{section.label}<span className="ml-2 text-xs font-medium text-slate-400">{section.items.length}</span></span><ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className={`border-t border-slate-100 p-4 ${section.key === 'characters' ? 'flex flex-wrap gap-2' : 'space-y-3'}`}>{section.items.slice(0, FULL_SECTIONS.includes(section.key) ? undefined : 5).map(renderSourceItem)}{!FULL_SECTIONS.includes(section.key) && section.items.length > 5 && <p className="text-xs text-slate-400">Còn {section.items.length - 5} nội dung khác sẽ có trong phần học.</p>}{section.key === 'vocabulary' && <p className="text-xs text-slate-400">Nghĩa: CVDICT (CC BY-SA 4.0), dịch tự động, chưa kiểm duyệt hết. Câu ví dụ: Tatoeba (CC BY 2.0 FR).</p>}</div>}</section>
                })}
              </div>
              <aside className="h-fit min-w-0 rounded-2xl border border-slate-200 p-4 lg:sticky lg:top-0"><h3 className="font-bold text-slate-800">Trong bài học</h3><div className="mt-3 space-y-2 text-sm text-slate-600">{activeSections.map((section) => <p key={section.key} className="flex justify-between"><span>{section.label}</span><b>{section.items.length}</b></p>)}<p className="flex justify-between"><span>Thời lượng</span><b className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />12 phút</b></p></div><p className="mt-4 rounded-xl bg-violet-50 p-3 text-xs leading-relaxed text-violet-800">Bấm “Bắt đầu học” để vào bài luyện tập trắc nghiệm do AI tạo từ dữ liệu của bài này.</p></aside>
            </div>}
          </div>
          {!practiceMode && <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400 sm:px-7"><span>{vocabularyCount > 0 ? `${vocabularyCount} từ trong bài · Có thể thêm vào bộ flashcard cá nhân` : ''}</span><button type="button" onClick={() => setLessonModalOpen(false)} className="font-semibold text-slate-500 hover:text-slate-800">Đóng</button></footer>}
        </section>
      </div>, document.body)}
    </div>
  )
}
