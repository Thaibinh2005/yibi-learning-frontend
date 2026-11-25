import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Eye, EyeOff, FileAudio, FileText, Info, Loader2, RefreshCw, Trash2, Upload, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  deleteMockImport,
  getMockAdminOverview,
  inspectPdf,
  setMockTestHidden,
  uploadMockTest,
  type MockAdminOverview,
  type MockImport,
  type MockTestRow,
  type PdfInspection,
} from '@/api/mockTestAdminApi'
import { apiError } from '@/api/listeningApi'

const MAX_PDF = 40 * 1024 * 1024
const MAX_AUDIO = 110 * 1024 * 1024
const AUDIO_TYPES = ['mp3', 'm4a', 'wav', 'aac', 'ogg']
const SUPPORTED = [1, 2, 3, 4, 5, 6]

const STEPS: { id: string; label: string }[] = [
  { id: 'pdf', label: 'Đọc PDF' },
  { id: 'transcribe', label: 'Nhận dạng audio' },
  { id: 'split', label: 'Cắt theo câu' },
  { id: 'ingest', label: 'Lưu đề' },
]
const STEP_ORDER = ['upload', 'queued', 'pdf', 'transcribe', 'split', 'package', 'ingest', 'done']

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
const minutes = (seconds: number) => `${Math.floor(seconds / 60)} phút ${Math.round(seconds % 60)} giây`

type Check = { ok: boolean | 'warn'; text: string }

const CheckLine: React.FC<{ check: Check }> = ({ check }) => (
  <li className={`flex items-start gap-2 text-sm ${check.ok === true ? 'text-emerald-700' : check.ok === 'warn' ? 'text-amber-700' : 'text-rose-700'}`}>
    {check.ok === true ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : check.ok === 'warn' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
    <span>{check.text}</span>
  </li>
)

/** Upload form: checks the files before sending (text layer, answer page, level, length) and explains each problem. */
const UploadCard: React.FC<{ onStarted: () => void }> = ({ onStarted }) => {
  const [level, setLevel] = useState<number | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [inspection, setInspection] = useState<PdfInspection | null>(null)
  const [inspecting, setInspecting] = useState(false)
  const [inspectError, setInspectError] = useState('')
  const [audioSeconds, setAudioSeconds] = useState<number | null>(null)
  const [audioError, setAudioError] = useState('')
  const [uploading, setUploading] = useState<number | null>(null)
  const pdfInput = useRef<HTMLInputElement>(null)
  const audioInput = useRef<HTMLInputElement>(null)

  const choosePdf = async (file: File | null) => {
    setPdf(file)
    setInspection(null)
    setInspectError('')
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) return setInspectError('File đề phải là PDF.')
    if (file.size > MAX_PDF) return setInspectError(`PDF ${mb(file.size)}, vượt giới hạn 40 MB.`)
    setInspecting(true)
    try {
      setInspection(await inspectPdf(file))
    } catch (err) {
      setInspectError(apiError(err, 'Không kiểm tra được PDF.'))
    } finally {
      setInspecting(false)
    }
  }

  const chooseAudio = (file: File | null) => {
    setAudio(file)
    setAudioSeconds(null)
    setAudioError('')
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!AUDIO_TYPES.includes(ext)) return setAudioError('Audio phải là MP3, M4A, WAV, AAC hoặc OGG.')
    if (file.size > MAX_AUDIO) return setAudioError(`Audio ${mb(file.size)}, vượt giới hạn 110 MB.`)
    const url = URL.createObjectURL(file)
    const probe = new Audio()
    probe.preload = 'metadata'
    probe.onloadedmetadata = () => {
      setAudioSeconds(probe.duration)
      URL.revokeObjectURL(url)
    }
    probe.onerror = () => {
      setAudioError('Trình duyệt không đọc được file audio này. Hãy kiểm tra file có mở được không.')
      URL.revokeObjectURL(url)
    }
    probe.src = url
  }

  const coverLevel = inspection?.level ?? null
  const listening = inspection?.cover.skills.listening
  const checks: Check[] = []
  if (inspection) {
    checks.push(inspection.hasText
      ? { ok: true, text: `PDF có lớp chữ (${inspection.pages} trang).` }
      : { ok: false, text: 'PDF là bản scan/ảnh, hệ thống không đọc được chữ. Hãy dùng bản PDF gốc (bôi đen được chữ).' })
    checks.push(inspection.hasAnswers
      ? { ok: true, text: 'Có trang đáp án (样卷答案).' }
      : { ok: false, text: 'Không tìm thấy trang đáp án, đề sẽ không chấm được điểm.' })
    if (coverLevel) {
      checks.push(level && level !== coverLevel
        ? { ok: 'warn', text: `Bìa đề ghi HSK ${coverLevel} nhưng bạn chọn HSK ${level}. Hệ thống sẽ dùng cấp bạn chọn.` }
        : { ok: true, text: `Bìa đề: HSK ${coverLevel}${inspection.cover.questionCount ? `, ${inspection.cover.questionCount} câu` : ''}${inspection.cover.totalMinutes ? `, ${inspection.cover.totalMinutes} phút` : ''}.` })
    } else {
      checks.push({ ok: level ? 'warn' : false, text: level ? 'Không đọc được cấp trên bìa đề; sẽ dùng cấp bạn chọn.' : 'Không đọc được cấp trên bìa đề. Hãy chọn cấp HSK.' })
    }
    const wanted = level ?? coverLevel
    if (wanted && !SUPPORTED.includes(wanted)) {
      checks.push({ ok: false, text: `Chưa hỗ trợ đọc đề HSK ${wanted === 7 ? '7–9' : wanted}: bố cục các phần của cấp này chưa được lập trình.` })
    }
  }
  if (audioSeconds != null) {
    if (listening) {
      const expected = listening.minutes * 60
      const ratio = audioSeconds / expected
      checks.push(ratio < 0.7 || ratio > 1.7
        ? { ok: 'warn', text: `Bìa đề ghi phần nghe khoảng ${listening.minutes} phút, audio dài ${minutes(audioSeconds)}. Có đúng file của đề này không?` }
        : { ok: true, text: `Audio dài ${minutes(audioSeconds)}, khớp với phần nghe khoảng ${listening.minutes} phút trên bìa.` })
    } else {
      checks.push({ ok: true, text: `Audio dài ${minutes(audioSeconds)}.` })
    }
  }
  const blocked = !pdf || !audio || inspecting || Boolean(inspectError) || Boolean(audioError) || !inspection
    || checks.some((c) => c.ok === false)

  const submit = async () => {
    if (!pdf || !audio || blocked) return
    setUploading(0)
    try {
      await uploadMockTest(pdf, audio, level, setUploading)
      toast.success('Đã tải lên, hệ thống đang xử lý', { description: 'Bạn có thể rời trang; tiến độ hiện ở danh sách bên dưới.' })
      setPdf(null)
      setAudio(null)
      setInspection(null)
      setAudioSeconds(null)
      if (pdfInput.current) pdfInput.current.value = ''
      if (audioInput.current) audioInput.current.value = ''
      onStarted()
    } catch (err) {
      toast.error('Chưa tải lên được', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setUploading(null)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Upload className="h-5 w-5 text-[#C8322B]" />Tải đề thi mẫu mới</h2>
      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <p className="flex items-center gap-1.5 font-bold"><Info className="h-4 w-4" />Trước khi tải lên</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          <li><b>PDF phải có lớp chữ</b> (đề gốc dạng điện tử, không phải bản scan). Thử bôi đen chữ trong PDF: bôi được là dùng được.</li>
          <li><b>PDF phải có trang đáp án</b> (样卷答案) để chấm điểm.</li>
          <li><b>Audio là file nghe liền của cả đề</b>, đúng đề với PDF. Không cần tự cắt: hệ thống tự tách theo từng câu.</li>
          <li>Hiện đọc được bố cục <b>HSK 1–6</b>. Xử lý mất khoảng 3–10 phút; xong sẽ thành <b>bản nháp</b> để soát trước khi học viên thấy.</li>
        </ul>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="block text-sm font-semibold text-slate-700">
          Cấp HSK
          <select value={level ?? ''} onChange={(e) => setLevel(e.target.value ? Number(e.target.value) : null)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Tự nhận theo bìa đề</option>
            {SUPPORTED.map((n) => <option key={n} value={n}>HSK {n}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" />File đề (PDF, tối đa 40 MB)</span>
          <input ref={pdfInput} type="file" accept="application/pdf,.pdf" onChange={(e) => choosePdf(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-1.5"><FileAudio className="h-4 w-4" />Audio phần nghe (tối đa 110 MB)</span>
          <input ref={audioInput} type="file" accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg" onChange={(e) => chooseAudio(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold" />
        </label>
      </div>

      {(inspecting || inspectError || audioError || checks.length > 0) && (
        <ul className="mt-4 space-y-1.5 rounded-xl border border-slate-200 p-4">
          {inspecting && <li className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Đang kiểm tra PDF…</li>}
          {inspectError && <CheckLine check={{ ok: false, text: inspectError }} />}
          {audioError && <CheckLine check={{ ok: false, text: audioError }} />}
          {checks.map((check) => <CheckLine key={check.text} check={check} />)}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={submit} disabled={blocked || uploading != null} className="inline-flex items-center gap-2 rounded-xl bg-[#C8322B] px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300">
          {uploading != null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading != null ? `Đang tải lên ${uploading}%` : 'Tải lên và xử lý'}
        </button>
        {uploading != null && <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#C8322B] transition-all" style={{ width: `${uploading}%` }} /></div>}
      </div>
    </section>
  )
}

const ImportCard: React.FC<{ item: MockImport; onDelete: (id: number) => void }> = ({ item, onDelete }) => {
  const active = item.status === 'QUEUED' || item.status === 'RUNNING'
  const at = STEP_ORDER.indexOf(item.step ?? 'queued')
  return (
    <li className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">{item.pdfName} <span className="font-normal text-slate-400">+ {item.audioName}</span></p>
          <p className="text-xs text-slate-500">#{item.id} · {new Date(item.createdAt).toLocaleString('vi-VN')}{item.level ? ` · HSK ${item.level}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {item.status === 'DONE' && item.testId && (
            <Link to={`/admin/mock-tests/${encodeURIComponent(item.testId)}`} className="rounded-lg bg-[#C8322B] px-3 py-1.5 text-xs font-bold text-white">Soát đề</Link>
          )}
          {!active && (
            <button type="button" onClick={() => onDelete(item.id)} aria-label="Xoá khỏi danh sách" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
          )}
        </div>
      </div>
      {active && (
        <>
          <ol className="mt-3 flex flex-wrap gap-2 text-xs">
            {STEPS.map((step) => {
              const index = STEP_ORDER.indexOf(step.id)
              const done = at > index
              const now = at === index || (step.id === 'split' && item.step === 'package')
              return (
                <li key={step.id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${done ? 'bg-emerald-50 text-emerald-700' : now ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : now ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{step.label}
                </li>
              )
            })}
          </ol>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-amber-500 transition-all" style={{ width: `${item.progress}%` }} /></div>
          <p className="mt-1.5 text-xs text-slate-500">{item.message} · Bạn có thể rời trang, hệ thống vẫn tiếp tục.</p>
        </>
      )}
      {item.status === 'FAILED' && <p className="mt-2 flex items-start gap-1.5 text-sm text-rose-700"><XCircle className="mt-0.5 h-4 w-4 shrink-0" />{item.message}</p>}
      {item.status === 'DONE' && (
        <p className="mt-2 text-sm text-emerald-700">
          {item.message}{item.problems.length > 0 && <span className="text-amber-700"> · {item.problems.length} điểm cần kiểm tra</span>}
        </p>
      )}
    </li>
  )
}

const STATUS_CHIP: Record<MockTestRow['status'], { label: string; tone: string }> = {
  DRAFT: { label: 'Nháp', tone: 'bg-amber-50 text-amber-700' },
  PUBLISHED: { label: 'Đã xuất bản', tone: 'bg-emerald-50 text-emerald-700' },
  HIDDEN: { label: 'Đang ẩn', tone: 'bg-slate-100 text-slate-600' },
}

/** Sample papers: upload with checks, the import queue with progress, and every paper with its state. */
export const MockTestAdminPanel: React.FC = () => {
  const [data, setData] = useState<MockAdminOverview | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => getMockAdminOverview().then((overview) => {
    setData(overview)
    setError('')
  }).catch((err) => setError(apiError(err, 'Không tải được danh sách đề.'))), [])
  useEffect(() => { load() }, [load])

  // While an upload is being processed the list refreshes itself.
  const active = data?.imports.some((i) => i.status === 'QUEUED' || i.status === 'RUNNING')
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(load, 4000)
    return () => window.clearInterval(timer)
  }, [active, load])

  const removeImport = async (id: number) => {
    try {
      await deleteMockImport(id)
      load()
    } catch (err) {
      toast.error('Chưa xoá được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  const toggleHidden = async (test: MockTestRow) => {
    const hide = test.status === 'PUBLISHED'
    if (hide && test.attempts > 0 && !window.confirm(`Đề có ${test.attempts} lượt làm. Ẩn đề thì học viên không bắt đầu lượt mới được (bài cũ vẫn xem lại được). Tiếp tục?`)) return
    try {
      await setMockTestHidden(test.id, hide)
      toast.success(hide ? 'Đã ẩn đề' : 'Đã hiện đề')
      load()
    } catch (err) {
      toast.error('Chưa đổi được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <UploadCard onStarted={load} />

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {data && data.imports.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Lượt tải lên gần đây</h2>
            <button type="button" onClick={load} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"><RefreshCw className="h-3.5 w-3.5" />Làm mới</button>
          </div>
          <ul className="mt-3 space-y-3">
            {data.imports.map((item) => <ImportCard key={item.id} item={item} onDelete={removeImport} />)}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Các đề thi mẫu</h2>
        {!data && !error && <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Đang tải…</p>}
        {data && data.tests.length === 0 && <p className="mt-3 text-sm text-slate-500">Chưa có đề nào.</p>}
        {data && data.tests.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Đề</th><th className="py-2 pr-3">Trạng thái</th><th className="py-2 pr-3">Bản nháp</th><th className="py-2 pr-3">Lượt làm</th><th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {data.tests.map((test) => (
                  <tr key={test.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-3">
                      <p className="font-bold text-slate-800">{test.title}</p>
                      <p className="text-xs text-slate-400">{test.id}{test.origin === 'BUNDLE' ? ' · có sẵn trong mã nguồn' : ''}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CHIP[test.status].tone}`}>{STATUS_CHIP[test.status].label}</span>
                      {test.publishedVersion && <span className="ml-2 text-xs text-slate-400">v{test.publishedVersion}</span>}
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      {test.hasDraft
                        ? test.toReview > 0 ? <span className="font-semibold text-amber-700">Còn {test.toReview} việc cần soát</span> : <span className="font-semibold text-emerald-700">Sẵn sàng xuất bản</span>
                        : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-3 pr-3 tabular-nums text-slate-600">{test.attempts}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/mock-tests/${encodeURIComponent(test.id)}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">{test.hasDraft ? 'Soát đề' : 'Xem / sửa'}</Link>
                        {test.publishedVersion && (
                          <button type="button" onClick={() => toggleHidden(test)} title={test.status === 'PUBLISHED' ? 'Ẩn với học viên' : 'Hiện lại cho học viên'} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                            {test.status === 'PUBLISHED' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
