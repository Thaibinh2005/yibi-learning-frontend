import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, Clock, Eye, Flag, Headphones, Loader2, Maximize2, Minimize2, PenLine, RotateCcw, Send, StickyNote, Trophy, X, XCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getMockAttempt,
  groupOf,
  optionsOf,
  isCorrect,
  isScored,
  saveMockAttempt,
  startMockTest,
  submitMockAttempt,
  SKILL_LABEL,
  type MockAttempt,
  type MockPaper,
  type MockQuestion,
  type MockSection,
} from '@/api/mockTestApi'
import { apiError } from '@/api/listeningApi'
import { MockAudioPlayer } from '@/components/exam/MockAudioPlayer'
import { GroupBlock, MockExample, MockQuestionView, PictureBoard, audioNoteFor, instructionOf, pageKey, sharedPictures, sharesContent } from '@/components/exam/MockQuestionView'

const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const PINYIN_KEY = 'yibi_mock_pinyin'
const readPinyin = () => {
  try {
    return localStorage.getItem(PINYIN_KEY) !== '0'
  } catch {
    return true
  }
}

/** Flags and notes are the learner's own aids: kept in this browser per attempt, never sent or scored. */
const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const writeLocal = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private window or full storage: the aids just are not remembered */
  }
}

interface Item {
  section: MockSection
  question: MockQuestion
  no: number
}

/** Taking (or reviewing) one attempt at an official sample paper, one question at a time. */
export const MockTestPage: React.FC = () => {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [paper, setPaper] = useState<MockPaper | null>(null)
  const [attempt, setAttempt] = useState<MockAttempt | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPinyin, setShowPinyin] = useState(readPinyin)
  const [reviewing, setReviewing] = useState(false)
  // Practice: written answers (fill / write) show the answer only when the learner asks; choices as soon as chosen.
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [flags, setFlags] = useState<number[]>(() => readLocal(`yibi_mock_flags_${attemptId}`, []))
  const [notes, setNotes] = useState<Record<string, string>>(() => readLocal(`yibi_mock_notes_${attemptId}`, {}))
  const [openNotes, setOpenNotes] = useState<Set<number>>(new Set())
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => writeLocal(`yibi_mock_flags_${attemptId}`, flags), [attemptId, flags])
  useEffect(() => writeLocal(`yibi_mock_notes_${attemptId}`, notes), [attemptId, notes])
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else document.documentElement.requestFullscreen?.().catch(() => toast.error('Trình duyệt không cho bật toàn màn hình'))
  }
  const toggleFlag = (no: number) => setFlags((list) => (list.includes(no) ? list.filter((n) => n !== no) : [...list, no]))

  const load = useCallback(() => {
    getMockAttempt(Number(attemptId)).then((view) => {
      setPaper(view.paper)
      setAttempt(view.attempt)
      setAnswers(view.attempt.answers ?? {})
      setChecked(new Set(Object.keys(view.attempt.answers ?? {}).map(Number)))
      setIndex(view.attempt.currentIndex ?? 0)
      setElapsed(view.attempt.elapsedSeconds ?? 0)
    }).catch((err) => setError(apiError(err, 'Không mở được bài làm.')))
  }, [attemptId])
  useEffect(load, [load])

  const items: Item[] = useMemo(
    () => paper?.sections.flatMap((section) => section.questions.map((question) => ({ section, question, no: question.no ?? 0 }))) ?? [],
    [paper],
  )
  const pages: number[][] = useMemo(() => {
    const out: number[][] = []
    // One page per passage/clip shared by several questions, and per set of pictures A–F shared by several questions.
    const keyOf = (item: Item) => pageKey(item.section, item.question)
    items.forEach((item, i) => {
      const key = keyOf(item)
      const last = out[out.length - 1]
      const prev = last ? items[last[last.length - 1]] : undefined
      if (last && prev && key && prev.section === item.section && keyOf(prev) === key) last.push(i)
      else out.push([i])
    })
    return out
  }, [items])
  const finished = Boolean(attempt?.finishedAt)
  const practice = attempt?.mode === 'PRACTICE'
  const limit = (paper?.durationMinutes ?? 0) * 60

  // Elapsed time runs while the page is visible and the paper is open.
  useEffect(() => {
    if (!attempt || finished) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setElapsed((value) => value + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [attempt, finished])

  // Progress is saved a moment after each change, and every 15 s for the clock.
  const latest = useRef({ answers, index, elapsed })
  latest.current = { answers, index, elapsed }
  const save = useCallback(() => {
    if (!attempt || finished) return Promise.resolve()
    const { answers: a, index: i, elapsed: e } = latest.current
    return saveMockAttempt(attempt.id, { answers: a, currentIndex: i, elapsedSeconds: e }).then(() => undefined).catch(() => undefined)
  }, [attempt, finished])
  useEffect(() => {
    if (!attempt || finished) return
    const timer = window.setTimeout(save, 800)
    return () => window.clearTimeout(timer)
  }, [answers, index, attempt, finished, save])
  useEffect(() => {
    if (!attempt || finished) return
    const timer = window.setInterval(save, 15_000)
    return () => window.clearInterval(timer)
  }, [attempt, finished, save])

  const submit = useCallback(async (auto = false) => {
    if (!attempt || finished) return
    if (!auto) {
      const unanswered = items.length - Object.keys(latest.current.answers).length
      const flagNote = flags.length ? ` Bạn còn ${flags.length} câu đã gắn cờ.` : ''
      const message = (unanswered > 0 ? `Còn ${unanswered} câu chưa trả lời.${flagNote} Vẫn nộp bài?` : `Nộp bài và xem kết quả?${flagNote}`)
      if (!window.confirm(message)) return
    }
    setSubmitting(true)
    try {
      const { answers: a, index: i, elapsed: e } = latest.current
      const view = await submitMockAttempt(attempt.id, { answers: a, currentIndex: i, elapsedSeconds: e })
      setPaper(view.paper)
      setAttempt(view.attempt)
      setReviewing(false)
      if (auto) toast.info('Hết giờ, bài đã được nộp tự động')
      window.scrollTo({ top: 0 })
    } catch (err) {
      toast.error('Chưa nộp được bài', { description: apiError(err, 'Hãy bấm nộp lại.') })
    } finally {
      setSubmitting(false)
    }
  }, [attempt, finished, items.length, flags.length])

  const timeUp = Boolean(attempt) && !finished && !practice && limit > 0 && elapsed >= limit
  useEffect(() => {
    if (timeUp) submit(true)
  }, [timeUp, submit])

  const leave = async () => {
    await save()
    navigate('/exams')
  }

  const togglePinyin = () => {
    setShowPinyin((value) => {
      try { localStorage.setItem(PINYIN_KEY, value ? '0' : '1') } catch { /* private window */ }
      return !value
    })
  }

  const retry = async () => {
    if (!paper || !attempt) return
    try {
      const view = await startMockTest(paper.id, attempt.mode)
      navigate(`/exams/mock/${view.attempt.id}`)
    } catch (err) {
      toast.error('Chưa bắt đầu được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="card-soft max-w-md p-6 text-center">
          <p className="font-semibold text-rose-700">{error}</p>
          <Link to="/exams" className="btn-chunky btn-paper mt-4">Về trang Thi thử</Link>
        </div>
      </div>
    )
  }
  if (!paper || !attempt) {
    return <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Đang mở đề...</div>
  }

  if (finished && !reviewing) {
    return <ResultView paper={paper} attempt={attempt} onReview={(i) => { setIndex(i ?? 0); setReviewing(true) }} onRetry={retry} />
  }

  const at = Math.min(index, items.length - 1)
  const pageIndex = Math.max(0, pages.findIndex((page) => page.includes(at)))
  const page = pages[pageIndex] ?? [at]
  const current = items[page[0]]
  const pageItems = page.map((i) => items[i])
  const group = groupOf(current.section, current.question)
  const shared = sharesContent(group) ? group : undefined
  const pictures = page.length > 1 && !shared && sharedPictures(current.section, current.question) ? optionsOf(current.section, current.question) : undefined
  const remaining = practice ? null : limit - elapsed

  const stateOf = (item: Item) => {
    const chosen = answers[String(item.no)]
    const written = item.question.type === 'fill' || item.question.type === 'write'
    const revealed = finished || (practice && Boolean(chosen) && (!written || checked.has(item.no)))
    return { chosen, written, revealed, locked: finished || (practice && revealed) }
  }
  const groupRevealed = pageItems.every((item) => stateOf(item).revealed)

  const choose = (item: Item, value: string) => {
    if (stateOf(item).locked) return
    setAnswers((answersNow) => {
      const next = { ...answersNow }
      if (value.trim()) next[String(item.no)] = value
      else delete next[String(item.no)]
      return next
    })
  }
  /** Opens the page that holds item i (a question of a group opens the whole group). */
  const go = (i: number) => {
    setIndex(Math.max(0, Math.min(items.length - 1, i)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goPage = (n: number) => go(pages[Math.max(0, Math.min(pages.length - 1, n))][0])
  const label = page.length > 1 ? `Câu ${current.no}–${pageItems[pageItems.length - 1].no}` : `Câu ${current.no}`

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 lg:px-8">
          <button type="button" onClick={finished ? () => setReviewing(false) : leave} aria-label={finished ? 'Về kết quả' : 'Thoát (đã lưu bài)'} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold text-slate-900">{paper.title} · {finished ? 'Xem lại bài' : practice ? 'Luyện tập' : 'Thi thử'}</p>
            <p className="text-xs font-medium text-slate-500">{label}/{items.length} · đã làm {Object.keys(answers).length}</p>
          </div>
          <button type="button" onClick={togglePinyin} aria-pressed={showPinyin} className={`hidden rounded-xl border px-3 py-1.5 text-xs font-bold sm:block ${showPinyin ? 'border-brand bg-rose-50 text-brand' : 'border-border text-slate-500'}`}>
            Pinyin
          </button>
          <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen} aria-label={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} title={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            className="rounded-xl border border-border p-2 text-slate-600 hover:bg-slate-50">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {!finished && (
            <span className={`inline-flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums ${remaining != null && remaining < 120 ? 'text-rose-600' : 'text-slate-700'}`} role="timer"
              aria-label={remaining != null ? `Còn ${clock(remaining)} trên tổng ${paper.durationMinutes} phút` : 'Thời gian đã làm'}>
              <Clock className="h-4 w-4" />{clock(remaining ?? elapsed)}
              {remaining != null && <span className="hidden text-sm font-semibold text-slate-400 sm:inline">/ {clock(limit)}</span>}
            </span>
          )}
          {!finished && (
            <button type="button" onClick={() => submit()} disabled={submitting} className="btn-chunky btn-brand px-4 py-2 text-sm">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="hidden sm:inline">Nộp bài</span>
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
        <main className="min-w-0 space-y-4">
          <section className="card-soft p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-brand">
                {current.section.skill === 'listening' ? <Headphones className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                {SKILL_LABEL[current.section.skill]} · Phần {current.section.part}
              </span>
              <span className="text-slate-500">Câu {current.section.range[0]}–{current.section.range[1]} · {instructionOf(current.section)}</span>
            </div>

            {(current.section.introAudio || current.section.example) && (
              <details key={`${current.section.skill}${current.section.part}`} className="group mt-4 rounded-2xl border border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-slate-700">
                  Hướng dẫn và ví dụ
                  <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="space-y-3 border-t border-border p-4">
                  {current.section.introAudio && <MockAudioPlayer src={current.section.introAudio.file} label="Nghe hướng dẫn và ví dụ" />}
                  <MockExample section={current.section} showPinyin={showPinyin} />
                </div>
              </details>
            )}

            {shared && (
              <div className="mt-5">
                {page.length > 1 && <p className="mb-2 text-sm font-bold text-slate-700">{label} dùng chung đoạn dưới đây</p>}
                <GroupBlock group={shared} question={page.length === 1 ? current.question : undefined} revealed={groupRevealed}
                  examAudio={!practice && !finished} audioNote={audioNoteFor(paper.level <= 3)} />
              </div>
            )}
            {pictures && <p className="mt-5 text-sm font-bold text-slate-700">{label} chọn trong các hình dưới đây</p>}
            {/* A direct child of the card (sticky only holds inside its parent), so it stays under the header while
                scrolling through every question of the page. */}
            {pictures && (
              <div className="sticky top-16 z-10 -mx-2 mt-2 rounded-2xl bg-white/95 px-2 py-2 shadow-[0_6px_12px_-10px_rgba(0,0,0,0.25)] backdrop-blur">
                <PictureBoard options={pictures} />
              </div>
            )}
            {pageItems.map((item) => {
              const { chosen, written, revealed, locked } = stateOf(item)
              return (
                <div key={item.no} className={page.length > 1 ? 'mt-6 border-t border-border pt-5 first-of-type:border-0' : ''}>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-900 text-base font-extrabold text-white">{item.no}</span>
                    <span className="text-sm font-semibold text-slate-500">{SKILL_LABEL[item.section.skill]}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <button type="button" onClick={() => toggleFlag(item.no)} aria-pressed={flags.includes(item.no)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${flags.includes(item.no) ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-border text-slate-500 hover:bg-slate-50'}`}>
                        <Flag className={`h-3.5 w-3.5 ${flags.includes(item.no) ? 'fill-amber-500 text-amber-600' : ''}`} />{flags.includes(item.no) ? 'Đã gắn cờ' : 'Gắn cờ'}
                      </button>
                      <button type="button" onClick={() => setOpenNotes((set) => { const next = new Set(set); if (next.has(item.no)) next.delete(item.no); else next.add(item.no); return next })}
                        aria-expanded={openNotes.has(item.no)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${notes[item.no] ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-border text-slate-500 hover:bg-slate-50'}`}>
                        <StickyNote className="h-3.5 w-3.5" />Ghi chú
                      </button>
                    </div>
                  </div>
                  {(openNotes.has(item.no) || notes[item.no]) && (
                    <textarea
                      value={notes[item.no] ?? ''}
                      onChange={(event) => setNotes((all) => {
                        const next = { ...all }
                        if (event.target.value) next[item.no] = event.target.value
                        else delete next[item.no]
                        return next
                      })}
                      rows={2}
                      maxLength={1000}
                      placeholder="Ghi chú riêng cho câu này (chỉ bạn thấy, không tính điểm)…"
                      className="mt-3 w-full rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 text-sm outline-none focus:border-sky-400"
                    />
                  )}
                  <div className="mt-4">
                    <MockQuestionView
                      section={item.section}
                      question={item.question}
                      answer={chosen}
                      revealed={revealed}
                      locked={locked}
                      showPinyin={showPinyin}
                      examAudio={!practice && !finished}
                      readTwice={paper.level <= 3}
                      hideGroup={Boolean(shared)}
                      lettersOnly={Boolean(pictures)}
                      onAnswer={(value) => choose(item, value)}
                    />
                  </div>
                  {practice && !finished && written && !revealed && (
                    <button type="button" disabled={!chosen} onClick={() => setChecked((set) => new Set(set).add(item.no))} className="btn-chunky btn-paper mt-4">
                      {item.question.type === 'write' ? <><Eye className="h-4 w-4" />Xem bài mẫu</> : <><CheckCircle2 className="h-4 w-4" />Kiểm tra</>}
                    </button>
                  )}
                </div>
              )
            })}
          </section>

          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => goPage(pageIndex - 1)} disabled={pageIndex === 0} className="btn-chunky btn-paper"><ArrowLeft className="h-4 w-4" />Câu trước</button>
            {pageIndex < pages.length - 1 ? (
              <button type="button" onClick={() => goPage(pageIndex + 1)} className="btn-chunky btn-brand">Câu tiếp<ArrowRight className="h-4 w-4" /></button>
            ) : !finished ? (
              <button type="button" onClick={() => submit()} disabled={submitting} className="btn-chunky btn-brand"><Send className="h-4 w-4" />Nộp bài</button>
            ) : (
              <button type="button" onClick={() => setReviewing(false)} className="btn-chunky btn-brand">Về kết quả</button>
            )}
          </div>
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Palette items={items} answers={answers} flags={flags} current={page} reveal={finished || practice} finished={finished} onGo={go} />
        </aside>
      </div>
    </div>
  )
}

/** Question numbers by skill: answered, right/wrong (when answers are known), flagged, and the current page. */
const Palette: React.FC<{
  items: Item[]
  answers: Record<string, string>
  flags: number[]
  /** Items on the page being shown. */
  current: number[]
  reveal: boolean
  finished: boolean
  onGo: (index: number) => void
}> = ({ items, answers, flags, current, reveal, finished, onGo }) => {
  const answered = items.filter((item) => answers[String(item.no)]).length
  const groups = items.reduce<Record<string, number[]>>((acc, item, i) => {
    (acc[item.section.skill] ??= []).push(i)
    return acc
  }, {})
  return (
    <div className="card-soft space-y-4 p-4">
      {/* What each colour means, with the counts, above the numbers. */}
      <div className="space-y-2 border-b border-border pb-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-slate-300 bg-white" />Chưa làm <b className="ml-auto tabular-nums text-slate-900">{items.length - answered}</b></span>
          <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-slate-800" />Đã làm <b className="ml-auto tabular-nums text-slate-900">{answered}</b></span>
          <span className="inline-flex items-center gap-1.5"><Flag className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />Gắn cờ <b className="ml-auto tabular-nums text-slate-900">{flags.length}</b></span>
          <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded ring-2 ring-brand" />Đang xem</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Tiến độ làm bài" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={items.length}>
          <div className="h-full rounded-full bg-slate-800" style={{ width: `${items.length ? (answered / items.length) * 100 : 0}%` }} />
        </div>
      </div>
      {Object.entries(groups).map(([skill, indexes]) => (
        <div key={skill}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{SKILL_LABEL[skill as keyof typeof SKILL_LABEL]}</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {indexes.map((i) => {
              const item = items[i]
              const chosen = answers[String(item.no)]
              const answer = item.question.answer
              const scored = isScored(item.question)
              let tone = 'border-border bg-white text-slate-600 hover:bg-slate-50'
              if (chosen && reveal && answer && scored && (finished || item.question.type !== 'fill')) {
                tone = isCorrect(item.question, chosen) ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-rose-500 bg-rose-500 text-white'
              } else if (!chosen && finished && scored) tone = 'border-rose-300 bg-white text-rose-600'
              else if (!scored && finished) tone = 'border-sky-400 bg-sky-50 text-sky-700'
              else if (chosen) tone = 'border-slate-800 bg-slate-800 text-white'
              return (
                <button
                  key={item.no}
                  type="button"
                  onClick={() => onGo(i)}
                  aria-label={`Câu ${item.no}${chosen ? ', đã trả lời' : ''}${scored ? '' : ', phần viết'}`}
                  aria-current={current.includes(i) ? 'step' : undefined}
                  className={`relative h-9 rounded-lg border text-sm font-bold tabular-nums transition ${tone} ${current.includes(i) ? 'ring-2 ring-brand ring-offset-1' : ''}`}
                >
                  {item.no}
                  {flags.includes(item.no) && <Flag className="absolute -right-1 -top-1.5 h-3.5 w-3.5 fill-amber-500 text-amber-600" aria-label="đã gắn cờ" />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {(reveal || finished) && <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 text-[11px] text-slate-500">
        {reveal && <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Đúng</span>}
        {reveal && <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-rose-500" />Sai</span>}
        {finished && items.some((item) => !isScored(item.question)) && <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-sky-400" />Viết (tự đối chiếu)</span>}
      </div>}
    </div>
  )
}

const ResultView: React.FC<{
  paper: MockPaper
  attempt: MockAttempt
  onReview: (index?: number) => void
  onRetry: () => void
}> = ({ paper, attempt, onReview, onRetry }) => {
  const passed = Boolean(attempt.passed)
  const passMark = Math.ceil((attempt.maxScore ?? 0) * 0.6)
  const all = paper.sections.flatMap((s) => s.questions).map((q, i) => ({ q, i }))
  const wrong = all.filter(({ q }) => isScored(q) && !isCorrect(q, attempt.answers[String(q.no)]))
  const writing = all.filter(({ q }) => !isScored(q))
  const unscoredSkills = paper.parts.filter((part) => !attempt.skills?.[part.skill])
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link to="/exams" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand"><ArrowLeft className="h-4 w-4" />Về trang Thi thử</Link>
        <section className={`card-soft p-6 text-center ${passed ? 'border-emerald-200' : 'border-rose-200'}`}>
          <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {passed ? <Trophy className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-500">{paper.title} · {attempt.mode === 'PRACTICE' ? 'Luyện tập' : 'Thi thử'}</p>
          <p className="mt-1 text-5xl font-extrabold tabular-nums text-slate-900">{attempt.score}<span className="text-2xl text-slate-400">/{attempt.maxScore}</span></p>
          <p className={`mt-2 text-sm font-bold ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
            {passed ? 'Đạt' : 'Chưa đạt'} · cần từ {passMark} điểm · đúng {attempt.correct}/{attempt.total} câu · {clock(attempt.elapsedSeconds)}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* In the paper's order (listening, then reading); the stored scores come back in any order. */}
            {paper.parts.filter((part) => attempt.skills?.[part.skill]).map((part) => [part.skill, attempt.skills![part.skill]] as const).map(([skill, s]) => (
              <div key={skill} className="rounded-2xl border border-border p-4 text-left">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-800">{SKILL_LABEL[skill as keyof typeof SKILL_LABEL] ?? skill}</span>
                  <span className="text-lg font-extrabold tabular-nums text-slate-900">{s.score}/100</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${s.score}%` }} /></div>
                <p className="mt-1.5 text-xs text-slate-500">Đúng {s.correct}/{s.total} câu</p>
              </div>
            ))}
            {unscoredSkills.map((part) => (
              <div key={part.skill} className="rounded-2xl border border-dashed border-sky-300 p-4 text-left">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-800">{SKILL_LABEL[part.skill]}</span>
                  <span className="text-sm font-bold text-sky-700">Tự đối chiếu</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Bài viết tự do không chấm tự động; xem lại để so với bài mẫu.</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => onReview(wrong[0]?.i)} className="btn-chunky btn-brand"><CheckCircle2 className="h-4 w-4" />Xem lại bài</button>
            <button type="button" onClick={onRetry} className="btn-chunky btn-paper"><RotateCcw className="h-4 w-4" />Làm lại</button>
          </div>
        </section>
        {writing.length > 0 && (
          <section className="card-soft p-5">
            <h2 className="flex items-center gap-2 font-extrabold text-slate-900"><PenLine className="h-4 w-4 text-sky-600" />Phần viết tự đối chiếu ({writing.length})</h2>
            <p className="mt-1 text-sm text-slate-500">Các câu này không tính vào điểm. Mở từng câu để so bài của bạn với bài mẫu.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {writing.map(({ q, i }) => (
                <button key={q.no} type="button" onClick={() => onReview(i)} className="h-9 min-w-9 rounded-lg border border-sky-300 bg-sky-50 px-2 text-sm font-bold text-sky-700 hover:bg-sky-100">{q.no}</button>
              ))}
            </div>
          </section>
        )}
        {wrong.length > 0 && (
          <section className="card-soft p-5">
            <h2 className="font-extrabold text-slate-900">Câu sai hoặc bỏ trống ({wrong.length})</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {wrong.map(({ q, i }) => (
                <button key={q.no} type="button" onClick={() => onReview(i)} className="h-9 min-w-9 rounded-lg border border-rose-300 bg-rose-50 px-2 text-sm font-bold text-rose-700 hover:bg-rose-100">{q.no}</button>
              ))}
            </div>
          </section>
        )}
        <p className="text-center text-xs text-slate-400">{paper.source}</p>
      </div>
    </div>
  )
}
