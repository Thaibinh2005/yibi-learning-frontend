import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, Eye, Loader2, Pencil, Save, Scissors, Send, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  discardMockDraft,
  getMockDraft,
  publishMockTest,
  recutClips,
  saveMockDraft,
  type MockDraft,
  type MockDraftPaper,
} from '@/api/mockTestAdminApi'
import { groupOf, optionsOf, SKILL_LABEL, type MockAudio, type MockGroup, type MockOption, type MockQuestion, type MockSection } from '@/api/mockTestApi'
import { apiError } from '@/api/listeningApi'
import { ClipEditor, useSourcePlayer, type SourcePlayer } from '@/components/admin/MockClipEditor'
import { GroupBlock, MockExample, MockQuestionView, PictureBoard, audioNoteFor, instructionOf, pageKey, sharedPictures, sharesContent } from '@/components/exam/MockQuestionView'

type Marks = Record<string, { start: number; end: number }>

const pad = (n: number) => String(n).padStart(2, '0')

/** Every clip of the paper by the key the server re-cuts it by ("L1_intro", "q05", "q29-30"). */
const clipsOf = (paper: MockDraftPaper) => {
  const out: { key: string; audio: MockAudio }[] = []
  for (const s of paper.sections) {
    if (s.introAudio) out.push({ key: `L${s.part}_intro`, audio: s.introAudio })
    for (const g of s.groups ?? []) if (g.audio) out.push({ key: `q${pad(g.range[0])}-${pad(g.range[1])}`, audio: g.audio })
    for (const q of s.questions) if (q.audio && !(q.group && s.groups?.find((g) => g.id === q.group)?.audio)) out.push({ key: `q${pad(q.no ?? 0)}`, audio: q.audio })
  }
  return out
}

const marksOf = (paper: MockDraftPaper): Marks =>
  Object.fromEntries(clipsOf(paper).map(({ key, audio }) => [key, { start: audio.start ?? 0, end: audio.end ?? 0 }]))

/** The same checks the server makes before publishing, live while editing. Each item points at a question. */
const blockingOf = (paper: MockDraftPaper) => {
  const out: { no: number; text: string }[] = []
  for (const s of paper.sections) {
    for (const g of s.groups ?? []) if (g.audio?.needsReview) out.push({ no: g.range[0], text: `Câu ${g.range[0]}–${g.range[1]}: cần nghe lại đoạn audio nhóm` })
    for (const q of s.questions) {
      const no = q.no ?? 0
      if (q.audio?.needsReview) out.push({ no, text: `Câu ${no}: cần nghe lại đoạn audio` })
      if (q.type === 'write') continue
      if (!q.answer) out.push({ no, text: `Câu ${no}: thiếu đáp án` })
      else if ((q.type ?? 'choice') === 'choice') {
        const keys = optionsOf(s, q).map((o) => o.key)
        if (keys.length && !keys.includes(q.answer)) out.push({ no, text: `Câu ${no}: đáp án ${q.answer} không có trong các lựa chọn` })
      }
    }
  }
  return out
}

const TYPE_LABEL = { choice: 'Trắc nghiệm', fill: 'Điền chữ', write: 'Viết (không chấm)' }

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#C8322B]'

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block text-xs font-semibold text-slate-500">{label}<div className="mt-1">{children}</div></label>
)

const OptionsEditor: React.FC<{ options: MockOption[]; answer?: string | null; onChange: (options: MockOption[]) => void }> = ({ options, answer, onChange }) => (
  <div className="grid gap-2 sm:grid-cols-2">
    {options.map((o, i) => (
      <div key={o.key} className={`flex items-center gap-2 rounded-lg border p-1.5 ${o.key === answer ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-extrabold">{o.key}</span>
        {o.image && <img src={o.image} alt="" className="h-10 w-10 rounded object-contain" />}
        {o.image && (
          <button type="button" title="Bỏ ảnh, chỉ dùng chữ" onClick={() => onChange(options.map((x, j) => (j === i ? { ...x, image: undefined } : x)))}
            className="shrink-0 rounded px-1.5 text-[11px] font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600">Bỏ ảnh</button>
        )}
        {(
          <input value={o.text ?? ''} onChange={(e) => onChange(options.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} className={`${inputClass} font-chinese`} />
        )}
      </div>
    ))}
  </div>
)

/** One question as the admin edits it: text, options, answer, transcript, and its clip. */
const QuestionEditor: React.FC<{
  section: MockSection
  question: MockQuestion
  issues: string[]
  clip?: { key: string; audio: MockAudio }
  /** Without the original recording the clip can be heard and ticked, not re-cut. */
  canRecut: boolean
  marks: Marks
  setMarks: (key: string, m: { start: number; end: number }) => void
  peaks: number[] | null
  source: SourcePlayer
  onChange: (update: (q: MockQuestion) => void) => void
}> = ({ section, question, issues, clip, canRecut, marks, setMarks, peaks, source, onChange }) => {
  const type = question.type ?? 'choice'
  const keys = optionsOf(section, question).map((o) => o.key)
  return (
    <article id={`q-${question.no}`} className={`scroll-mt-28 rounded-2xl border bg-white p-4 ${issues.length ? 'border-amber-300' : 'border-slate-200'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-extrabold text-white">{question.no}</span>
        <span className="text-xs font-semibold text-slate-500">{TYPE_LABEL[type]}{question.group ? ` · nhóm ${question.group}` : ''}</span>
        {issues.map((text) => <span key={text} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{text.replace(/^Câu \d+: /, '')}</span>)}
      </div>
      <div className="mt-3 space-y-3">
        {question.image && <img src={question.image} alt="" className="max-h-32 rounded-lg object-contain" />}
        {question.image && section.layout === 'radical_choice' && !question.partial && (
          <button type="button" onClick={() => onChange((q) => { q.partial = { index: 0, shown: '' }; q.question = q.question ?? ''; delete q.image })}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Nhập dạng chữ thay ảnh</button>
        )}
        {question.images?.map((src) => <img key={src} src={src} alt="" className="max-h-48 rounded-lg object-contain" />)}
        {question.partial && (
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Từ (đầy đủ)"><input value={question.question ?? ''} onChange={(e) => onChange((q) => { q.question = e.target.value })} className={`${inputClass} font-chinese`} /></Field>
            <Field label="Pinyin (cách nhau bằng dấu cách)"><input value={question.questionPinyin ?? ''} onChange={(e) => onChange((q) => { q.questionPinyin = e.target.value })} className={`${inputClass} font-pinyin`} /></Field>
            <Field label="Chữ thiếu là chữ thứ (1, 2…)"><input type="number" min={1} value={question.partial.index + 1} onChange={(e) => onChange((q) => { q.partial = { ...q.partial!, index: Math.max(0, Number(e.target.value) - 1) } })} className={inputClass} /></Field>
            <Field label="Phần in ra của chữ thiếu"><input value={question.partial.shown} onChange={(e) => onChange((q) => { q.partial = { ...q.partial!, shown: e.target.value } })} className={`${inputClass} font-chinese`} /></Field>
          </div>
        )}
        {question.passage != null && (
          <Field label="Đoạn văn"><textarea value={question.passage} rows={3} onChange={(e) => onChange((q) => { q.passage = e.target.value })} className={`${inputClass} font-chinese`} /></Field>
        )}
        {type === 'write' ? (
          <>
            {question.word != null && <Field label="Từ phải dùng"><input value={question.word} onChange={(e) => onChange((q) => { q.word = e.target.value })} className={`${inputClass} font-chinese`} /></Field>}
            {question.prompt != null && <Field label="Đề bài"><textarea value={question.prompt} rows={3} onChange={(e) => onChange((q) => { q.prompt = e.target.value })} className={`${inputClass} font-chinese`} /></Field>}
            <Field label="Bài mẫu (học viên xem sau khi viết)"><textarea value={question.reference ?? ''} rows={2} onChange={(e) => onChange((q) => { q.reference = e.target.value || undefined })} className={`${inputClass} font-chinese`} /></Field>
          </>
        ) : (
          question.question != null && section.layout !== 'ordering' && !question.partial && (
            <Field label={type === 'fill' ? 'Câu (chỗ trống viết là （　）)' : 'Câu hỏi'}><input value={question.question} onChange={(e) => onChange((q) => { q.question = e.target.value })} className={`${inputClass} font-chinese`} /></Field>
          )
        )}
        {type === 'fill' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Pinyin gợi ý"><input value={question.blankPinyin ?? ''} onChange={(e) => onChange((q) => { q.blankPinyin = e.target.value })} className={`${inputClass} font-pinyin`} /></Field>
            <Field label="Đáp án (chữ Hán)"><input value={question.answer ?? ''} onChange={(e) => onChange((q) => { q.answer = e.target.value.trim() || null })} className={`${inputClass} font-chinese`} /></Field>
          </div>
        )}
        {type === 'choice' && question.options && (
          <OptionsEditor options={question.options} answer={question.answer} onChange={(options) => onChange((q) => { q.options = options })} />
        )}
        {type === 'choice' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Đáp án đúng:</span>
            {keys.map((key) => (
              <button key={key} type="button" onClick={() => onChange((q) => { q.answer = key })} className={`h-8 w-8 rounded-full border-2 text-sm font-extrabold ${question.answer === key ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{key}</button>
            ))}
          </div>
        )}
        {clip && !canRecut && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
            <audio controls preload="none" src={clip.audio.file} className="h-9" />
            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <input type="checkbox" checked={!clip.audio.needsReview} onChange={(e) => onChange((q) => { if (q.audio) q.audio.needsReview = !e.target.checked })} className="accent-emerald-600" />
              Đã kiểm tra
            </label>
          </div>
        )}
        {clip && canRecut && (
          <ClipEditor label={`Audio câu ${question.no}`} audio={clip.audio} marks={marks[clip.key] ?? { start: clip.audio.start ?? 0, end: clip.audio.end ?? 0 }}
            onMarks={(m) => setMarks(clip.key, m)} peaks={peaks} source={source}
            onChecked={(checked) => onChange((q) => { if (q.audio) q.audio.needsReview = !checked })} />
        )}
        {(question.transcript != null || question.audio) && !question.group?.startsWith('a') && (
          <Field label="Lời thoại (học viên xem sau khi trả lời)"><textarea value={question.transcript ?? ''} rows={2} onChange={(e) => onChange((q) => { q.transcript = e.target.value })} className={`${inputClass} font-chinese`} /></Field>
        )}
      </div>
    </article>
  )
}

/** "Làm thử như học viên": the paper in practice mode, answers kept only on this page. */
const Preview: React.FC<{ paper: MockDraftPaper }> = ({ paper }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const isRevealed = (q: MockQuestion) => {
    const no = q.no ?? 0
    return Boolean(answers[no]) && ((q.type ?? 'choice') === 'choice' || checked.has(no))
  }
  return (
    <div className="space-y-4">
      {paper.sections.map((section) => {
        // The same pages as the learner gets: a shared passage/clip or a shared set of pictures keeps its questions together.
        const blocks: MockQuestion[][] = []
        for (const q of section.questions) {
          const last = blocks[blocks.length - 1]
          const key = pageKey(section, q)
          if (last && key && pageKey(section, last[0]) === key) last.push(q)
          else blocks.push([q])
        }
        return (
          <section key={`${section.skill}${section.part}`} className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">{SKILL_LABEL[section.skill]} · Phần {section.part} <span className="text-sm font-normal text-slate-500">{instructionOf(section)}</span></h2>
            {blocks.map((block) => {
              const first = block[0]
              const group = groupOf(section, first)
              const shared = sharesContent(group) ? group : undefined
              const pictures = block.length > 1 && !shared && sharedPictures(section, first) ? optionsOf(section, first) : undefined
              const last = block[block.length - 1]
              return (
                <div key={first.no} className="rounded-2xl border border-slate-200 bg-white p-4">
                  {block.length > 1 && <p className="mb-3 text-sm font-bold text-slate-700">Câu {first.no}–{last.no} {pictures ? 'chọn trong các hình dưới đây' : 'dùng chung đoạn dưới đây'}</p>}
                  {shared && <div className="mb-4"><GroupBlock group={shared} question={block.length === 1 ? first : undefined} revealed={block.every(isRevealed)} examAudio={false} audioNote={audioNoteFor(paper.level <= 3)} /></div>}
                  {pictures && (
                    <div className="sticky top-[4.5rem] z-20 -mx-2 mb-2 rounded-2xl bg-white/95 px-2 py-2 shadow-[0_6px_12px_-10px_rgba(0,0,0,0.25)] backdrop-blur">
                      <PictureBoard options={pictures} />
                    </div>
                  )}
                  {block.map((q) => {
                    const no = q.no ?? 0
                    const revealed = isRevealed(q)
                    const written = q.type === 'fill' || q.type === 'write'
                    return (
                      <div key={no} className={block.length > 1 ? 'border-t border-slate-100 pt-4 mt-4 first:mt-0 first:border-0 first:pt-0' : ''}>
                        <p className="mb-3 text-sm font-extrabold text-slate-700">Câu {no}</p>
                        <MockQuestionView section={section} question={q} answer={answers[no]} revealed={revealed} locked={revealed} showPinyin examAudio={false}
                          hideGroup={Boolean(shared)} lettersOnly={Boolean(pictures)} readTwice={paper.level <= 3}
                          onAnswer={(v) => setAnswers((a) => ({ ...a, [no]: v }))} />
                        {written && !revealed && answers[no] && (
                          <button type="button" onClick={() => setChecked((set) => new Set(set).add(no))} className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold">Kiểm tra</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}

/** Checking an imported (or published) sample paper before learners get it. */
export const MockTestReviewPage: React.FC = () => {
  const { testId = '' } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<MockDraft | null>(null)
  const [paper, setPaper] = useState<MockDraftPaper | null>(null)
  const [dirty, setDirty] = useState(false)
  const [marks, setMarksState] = useState<Marks>({})
  const [peaks, setPeaks] = useState<number[] | null>(null)
  const [busy, setBusy] = useState<'save' | 'recut' | 'publish' | 'discard' | null>(null)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const source = useSourcePlayer(draft?.sourceAudioUrl)

  const take = useCallback((d: MockDraft) => {
    setDraft(d)
    setPaper(structuredClone(d.paper))
    setMarksState(marksOf(d.paper))
    setDirty(false)
  }, [])

  useEffect(() => {
    getMockDraft(testId).then(take).catch((err) => setError(apiError(err, 'Không mở được đề.')))
  }, [testId, take])

  useEffect(() => {
    if (!draft?.peaksUrl) return
    fetch(draft.peaksUrl).then((r) => r.json()).then(setPeaks).catch(() => setPeaks(null))
  }, [draft?.peaksUrl])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const edit = (change: (p: MockDraftPaper) => void) => {
    setPaper((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      change(next)
      return next
    })
    setDirty(true)
  }
  const setMarks = (key: string, m: { start: number; end: number }) => setMarksState((all) => ({ ...all, [key]: m }))

  const clips = useMemo(() => (paper ? clipsOf(paper) : []), [paper])
  const pending = clips.filter(({ key, audio }) => {
    const m = marks[key]
    return m && (Math.abs(m.start - (audio.start ?? 0)) > 0.04 || Math.abs(m.end - (audio.end ?? 0)) > 0.04)
  })
  const blocking = useMemo(() => (paper ? blockingOf(paper) : []), [paper])
  const questionCount = paper?.sections.reduce((n, s) => n + s.questions.length, 0) ?? 0

  const save = async () => {
    if (!paper) return null
    setBusy('save')
    try {
      const saved = await saveMockDraft(testId, paper)
      const keepMarks = marks
      take(saved)
      setMarksState((fresh) => ({ ...fresh, ...Object.fromEntries(Object.entries(keepMarks).filter(([k]) => k in fresh)) }))
      toast.success('Đã lưu bản nháp')
      return saved
    } catch (err) {
      toast.error('Chưa lưu được', { description: apiError(err, 'Hãy thử lại.') })
      return null
    } finally {
      setBusy(null)
    }
  }

  const recut = async () => {
    if (!pending.length) return
    if (dirty && !(await save())) return
    setBusy('recut')
    try {
      const cut = pending.map(({ key }) => ({ key, start: marks[key].start, end: marks[key].end }))
      take(await recutClips(testId, cut))
      toast.success(`Đã cắt lại ${cut.length} đoạn`)
    } catch (err) {
      toast.error('Chưa cắt lại được', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setBusy(null)
    }
  }

  const publish = async () => {
    if (pending.length) return toast.error('Còn đoạn audio đã đổi mốc nhưng chưa cắt lại.')
    if (dirty && !(await save())) return
    if (!window.confirm('Xuất bản đề này? Học viên sẽ thấy phiên bản mới ngay; bài đang làm dở vẫn giữ phiên bản cũ.')) return
    setBusy('publish')
    try {
      const version = await publishMockTest(testId)
      toast.success(`Đã xuất bản phiên bản ${version}`)
      take(await getMockDraft(testId))
    } catch (err) {
      toast.error('Chưa xuất bản được', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setBusy(null)
    }
  }

  const discard = async () => {
    const neverPublished = !draft?.publishedVersion
    if (!window.confirm(neverPublished ? 'Đề chưa từng xuất bản: bỏ bản nháp sẽ xoá hẳn đề và các file của nó. Tiếp tục?' : 'Bỏ mọi thay đổi chưa xuất bản?')) return
    setBusy('discard')
    try {
      const deleted = await discardMockDraft(testId)
      toast.success(deleted ? 'Đã xoá đề' : 'Đã bỏ bản nháp')
      if (deleted) navigate('/admin?tab=mocktests')
      else take(await getMockDraft(testId))
    } catch (err) {
      toast.error('Chưa thực hiện được', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setBusy(null)
    }
  }

  if (error) {
    return <div className="grid min-h-screen place-items-center p-6"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error} <Link to="/admin?tab=mocktests" className="ml-2 underline">Quay lại</Link></div></div>
  }
  if (!draft || !paper) {
    return <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Đang mở đề…</div>
  }

  const canPublish = (draft.hasDraft || dirty) && blocking.length === 0 && pending.length === 0
  const clipByKey = new Map(clips.map((c) => [c.key, c]))

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/admin?tab=mocktests" aria-label="Về danh sách đề" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold text-slate-900">{paper.title} · {draft.id}</p>
            <p className="text-xs text-slate-500">
              {draft.status === 'DRAFT' ? 'Nháp, chưa xuất bản' : draft.status === 'HIDDEN' ? `Đang ẩn · v${draft.publishedVersion}` : `Đã xuất bản v${draft.publishedVersion}`}
              {draft.hasDraft && draft.publishedVersion ? ' · có thay đổi chưa xuất bản' : ''}{dirty ? ' · chưa lưu' : ''}
            </p>
          </div>
          <button type="button" onClick={() => setPreview((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            {preview ? <><Pencil className="h-4 w-4" />Sửa đề</> : <><Eye className="h-4 w-4" />Làm thử như học viên</>}
          </button>
          {pending.length > 0 && (
            <button type="button" onClick={recut} disabled={busy != null} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
              {busy === 'recut' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}Cắt lại {pending.length} đoạn
            </button>
          )}
          <button type="button" onClick={save} disabled={!dirty || busy != null} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu nháp
          </button>
          <button type="button" onClick={publish} disabled={!canPublish || busy != null} title={canPublish ? '' : 'Xử lý hết các mục cần soát trước'} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8322B] px-3 py-2 text-xs font-bold text-white disabled:bg-slate-300">
            {busy === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Xuất bản
          </button>
          {(draft.hasDraft || dirty) && (
            <button type="button" onClick={discard} disabled={busy != null} aria-label="Bỏ bản nháp" title="Bỏ bản nháp" className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 pt-5">
        <section className={`rounded-2xl border p-4 ${blocking.length ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
            {blocking.length ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            {questionCount} câu · {clips.length} đoạn audio ·{' '}
            {blocking.length ? <span className="text-amber-800">{blocking.length} việc cần xử lý trước khi xuất bản</span> : <span className="text-emerald-800">Không còn gì chặn việc xuất bản</span>}
            {pending.length > 0 && <span className="text-sky-700">· {pending.length} đoạn đã đổi mốc chưa cắt lại</span>}
          </p>
          {blocking.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {blocking.map((b) => (
                <a key={b.text} href={`#q-${b.no}`} onClick={() => setPreview(false)} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-xs hover:bg-amber-100">{b.text}</a>
              ))}
            </div>
          )}
          {!draft.canRecut && clips.length > 0 && <p className="mt-2 text-xs text-slate-600">Đề này không có file audio gốc nên chỉ nghe được các đoạn đã cắt, không chỉnh mốc được.</p>}
          {draft.notes.length > 0 && (
            <details className="group mt-3">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-bold text-slate-600">Ghi chú khi đọc đề ({draft.notes.length})<ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" /></summary>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-slate-600">{draft.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </details>
          )}
        </section>

        {preview ? <Preview paper={paper} /> : paper.sections.map((section, si) => (
          <section key={`${section.skill}${section.part}`} className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-base font-extrabold text-slate-900">
                {SKILL_LABEL[section.skill]} · Phần {section.part} · câu {section.range[0]}–{section.range[1]}
                <span className="ml-2 text-sm font-normal text-slate-500">{instructionOf(section)}</span>
              </h2>
              {section.instructionZh && <p className="font-chinese mt-1 text-sm text-slate-500">{section.instructionZh}</p>}
              {section.introAudio && !draft.canRecut && <audio controls preload="none" src={section.introAudio.file} className="mt-3 h-9" />}
              {section.introAudio && draft.canRecut && (
                <div className="mt-3"><ClipEditor label="Lời giới thiệu và ví dụ" audio={section.introAudio} marks={marks[`L${section.part}_intro`] ?? { start: 0, end: 0 }}
                  onMarks={(m) => setMarks(`L${section.part}_intro`, m)} peaks={peaks} source={source} /></div>
              )}
              {section.sharedOptions && (
                <div className="mt-3"><p className="mb-1.5 text-xs font-semibold text-slate-500">Lựa chọn dùng chung</p>
                  <OptionsEditor options={section.sharedOptions} onChange={(options) => edit((p) => { p.sections[si].sharedOptions = options })} /></div>
              )}
              {section.example && <details className="mt-3"><summary className="cursor-pointer text-xs font-bold text-slate-600">Ví dụ trên đề</summary><div className="mt-2"><MockExample section={section} showPinyin /></div></details>}
            </div>

            {(section.groups ?? []).map((group: MockGroup, gi) => {
              const key = `q${pad(group.range[0])}-${pad(group.range[1])}`
              const clip = clipByKey.get(key)
              const setGroup = (change: (g: MockGroup) => void) => edit((p) => { change(p.sections[si].groups![gi]) })
              return (
                <div key={group.id} className={`rounded-2xl border bg-white p-4 ${group.audio?.needsReview ? 'border-amber-300' : 'border-slate-200'}`}>
                  <p className="text-sm font-extrabold text-slate-800">Nhóm câu {group.range[0]}–{group.range[1]}</p>
                  <div className="mt-2 space-y-3">
                    {group.passage != null && <Field label="Đoạn văn (chỗ trống viết là （41）, gạch chân là <u>…</u>)"><textarea value={group.passage} rows={6} onChange={(e) => setGroup((g) => { g.passage = e.target.value })} className={`${inputClass} font-chinese`} /></Field>}
                    {group.images?.map((src) => <img key={src} src={src} alt="" className="max-h-32 rounded-lg object-contain" />)}
                    {group.sharedOptions && <OptionsEditor options={group.sharedOptions} onChange={(options) => setGroup((g) => { g.sharedOptions = options })} />}
                    {clip && draft.canRecut && (
                      <ClipEditor label={`Audio nhóm câu ${group.range[0]}–${group.range[1]}`} audio={clip.audio} marks={marks[key] ?? { start: clip.audio.start ?? 0, end: clip.audio.end ?? 0 }}
                        onMarks={(m) => setMarks(key, m)} peaks={peaks} source={source}
                        onChecked={(checked) => setGroup((g) => { if (g.audio) g.audio.needsReview = !checked })} />
                    )}
                    {clip && !draft.canRecut && <audio controls preload="none" src={clip.audio.file} className="h-9" />}
                    {group.transcript != null && <Field label="Lời thoại nhóm"><textarea value={group.transcript} rows={3} onChange={(e) => setGroup((g) => { g.transcript = e.target.value })} className={`${inputClass} font-chinese`} /></Field>}
                  </div>
                </div>
              )
            })}

            {section.questions.map((question, qi) => {
              const clip = question.audio ? clipByKey.get(`q${pad(question.no ?? 0)}`) : undefined
              return (
                <QuestionEditor
                  key={question.no}
                  section={section}
                  question={question}
                  issues={blocking.filter((b) => b.no === question.no && b.text.startsWith(`Câu ${question.no}:`)).map((b) => b.text)}
                  clip={clip}
                  canRecut={draft.canRecut}
                  marks={marks}
                  setMarks={setMarks}
                  peaks={peaks}
                  source={source}
                  onChange={(change) => edit((p) => { change(p.sections[si].questions[qi]) })}
                />
              )
            })}
          </section>
        ))}
      </main>
    </div>
  )
}
