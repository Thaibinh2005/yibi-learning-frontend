import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Bookmark, FileAudio, Keyboard, Loader2, MonitorPlay, Play, Upload, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { apiError, createVideo, lookupYoutube, saveToShelf, uploadVideo } from '@/api/listeningApi'
import type { ListeningUsage, VideoSummary } from '@/types/listening'

type Tab = 'youtube' | 'file' | 'manual'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'youtube', label: 'YouTube', icon: MonitorPlay },
  { id: 'file', label: 'Tải file', icon: Upload },
  { id: 'manual', label: 'Nhập thủ công', icon: Keyboard },
]

const ACCEPT = '.mp3,.m4a,.aac,.wav,.ogg,.oga,.opus,.flac,.webm,.mp4,.m4v,.mov,audio/*,video/*'

/** Reads how long a local file plays, so an over-long file is refused before it is uploaded. */
function mediaDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement(file.type.startsWith('audio/') ? 'audio' : 'video')
    const done = (value: number | null) => {
      URL.revokeObjectURL(url)
      resolve(value)
    }
    el.preload = 'metadata'
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? el.duration : null)
    el.onerror = () => done(null)
    el.src = url
  })
}

/**
 * Adds the learner's own listening material: a YouTube link (its Chinese subtitles), an audio/video file (Whisper
 * writes the lines, or the learner types them), or typed text. "Bắt đầu luyện tập" opens the line editor.
 */
export function AddVideoDialog({ usage, onClose }: { usage: ListeningUsage | null; onClose: () => void }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('youtube')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [manualLink, setManualLink] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [typeWithFile, setTypeWithFile] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  // Published lessons of the pasted YouTube video, offered instead of adding it again.
  const [existing, setExisting] = useState<VideoSummary[]>([])

  useEffect(() => {
    setExisting([])
    const link = url.trim()
    if (tab !== 'youtube' || !/^[A-Za-z0-9_-]{11}$|youtu/.test(link)) return
    let cancelled = false
    const t = window.setTimeout(() => {
      lookupYoutube(link)
        .then((found) => !cancelled && setExisting(found))
        .catch(() => undefined)
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [url, tab])

  const reuse = async (lesson: VideoSummary, how: 'practise' | 'save') => {
    if (how === 'save') {
      try {
        if (!lesson.mine && !lesson.saved) await saveToShelf(lesson.id)
        toast.success('Đã lưu vào Video của tôi', { description: lesson.title })
        onClose()
        navigate('/listening', { replace: true })
      } catch (err) {
        setError(apiError(err, 'Chưa lưu được.'))
      }
      return
    }
    onClose()
    navigate(`/listening?open=${lesson.id}`)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    dialog.current?.querySelector<HTMLElement>('input, button')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const limitReached = !!usage && usage.videosAdded >= usage.maxVideos
  const lines = text.split('\n').filter((l) => l.trim()).length
  const ready =
    !busy && confirmed && !limitReached &&
    (tab === 'youtube' ? url.trim() !== '' : tab === 'file' ? !!file && (!typeWithFile || lines > 0) : lines > 0)

  const pickFile = async (picked: File | null) => {
    setError(null)
    setFile(null)
    if (!picked) return
    const maxMb = usage?.maxMediaMb ?? 100
    if (picked.size > maxMb * 1024 * 1024) {
      setError(`File lớn hơn ${maxMb} MB.`)
      return
    }
    const seconds = await mediaDuration(picked)
    const maxMinutes = usage?.maxMediaMinutes ?? 20
    if (seconds !== null && seconds > maxMinutes * 60) {
      setError(`File dài ${Math.round(seconds / 60)} phút, tối đa ${maxMinutes} phút.`)
      return
    }
    setFile(picked)
  }

  const start = async () => {
    if (!ready) return
    setBusy(true)
    setError(null)
    try {
      let id: number
      if (tab === 'youtube') {
        id = (await createVideo({ source: 'YOUTUBE', youtubeUrl: url.trim(), confirmed })).id
      } else if (tab === 'manual') {
        id = (await createVideo({ title: title.trim() || undefined, source: 'MANUAL', text, youtubeUrl: manualLink.trim() || undefined, confirmed })).id
      } else {
        setProgress(0)
        id = (await uploadVideo(file as File, undefined, typeWithFile ? text : undefined, setProgress)).id
      }
      toast.success('Đã thêm video', {
        description: tab === 'file' && !typeWithFile
          ? 'Đang nhận dạng lời thoại, bạn sẽ thấy từng câu khi xong.'
          : 'Kiểm tra lời thoại rồi bấm "Hoàn tất & tạo bản dịch".',
      })
      navigate(`/listening/${id}/edit`)
    } catch (err) {
      setError(apiError(err, 'Không thêm được video.'))
      setBusy(false)
      setProgress(null)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="add-video-title" className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="add-video-title" className="text-xl font-bold text-ink">Thêm video luyện nghe</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Đóng" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div role="tablist" aria-label="Nguồn video" className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              disabled={busy}
              onClick={() => { setTab(id); setError(null) }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition ${tab === id ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {tab === 'youtube' && (
            <Field label="Link YouTube" hint="Tên video lấy theo tiêu đề trên YouTube và được ghi công cho kênh gốc. Video cần có phụ đề tiếng Trung (giản thể); không có phụ đề thì dùng mục Nhập thủ công.">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none" />
            </Field>
          )}
          {tab === 'youtube' && existing.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-bold text-emerald-900">Video này đã có bài luyện trong thư viện cộng đồng</p>
              <p className="text-xs text-emerald-800">Dùng luôn bài có sẵn (đã có pinyin và bản dịch), hoặc vẫn tự tạo bản của bạn bên dưới.</p>
              <ul className="mt-2 space-y-2">
                {existing.map((lesson) => (
                  <li key={lesson.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">{lesson.title}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        {lesson.segmentCount} câu{lesson.contributorName ? ` · lời thoại @${lesson.contributorName}` : ''}
                        {lesson.practiceCount > 0 && <><Users className="ml-1 h-3 w-3" /> {lesson.practiceCount}</>}
                      </span>
                    </span>
                    <button type="button" onClick={() => void reuse(lesson, 'save')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                      <Bookmark className="h-3.5 w-3.5" /> Lưu
                    </button>
                    <button type="button" onClick={() => void reuse(lesson, 'practise')} className="inline-flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-bold text-white">
                      <Play className="h-3.5 w-3.5" /> Luyện ngay
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'file' && (
            <>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-6 text-center hover:border-brand/50 hover:bg-rose-50/30">
                <FileAudio className="h-8 w-8 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{file ? file.name : 'Chọn file âm thanh hoặc video'}</span>
                <span className="text-xs text-slate-500">
                  Tên video lấy theo tên file · mp3, m4a, wav, ogg, webm, mp4, mov · tối đa {usage?.maxMediaMb ?? 100} MB, {usage?.maxMediaMinutes ?? 20} phút
                </span>
                <input type="file" accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => void pickFile(e.target.files?.[0] ?? null)} />
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={typeWithFile} onChange={(e) => setTypeWithFile(e.target.checked)} className="mt-0.5 accent-[#C8322B]" />
                Tôi có sẵn lời thoại, muốn tự nhập (không nhận dạng tự động)
              </label>
              {!typeWithFile && <p className="text-xs text-slate-500">Lời thoại sẽ được nhận dạng tự động; file dài có thể mất vài phút.</p>}
              {typeWithFile && <TextArea value={text} onChange={setText} lines={lines} />}
            </>
          )}

          {tab === 'manual' && (
            <>
              <Field label="Tên bài (không bắt buộc)" hint="Để trống thì lấy câu đầu tiên làm tên.">
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Ví dụ: Hội thoại đi mua sắm" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none" />
              </Field>
              <TextArea value={text} onChange={setText} lines={lines} />
              <Field label="Link YouTube để nghe kèm (không bắt buộc)" hint="Có link thì bạn gõ nhịp để gắn thời gian cho từng câu; không có thì nghe bằng giọng đọc của trình duyệt.">
                <input value={manualLink} onChange={(e) => setManualLink(e.target.value)} placeholder="https://youtu.be/…" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none" />
              </Field>
            </>
          )}

          <label className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 accent-[#C8322B]" />
            Bài luyện sẽ ở chế độ riêng tư. Tôi chỉ chia sẻ lên cộng đồng khi nội dung phù hợp và không vi phạm bản quyền.
          </label>

          {usage && (
            <p className={`text-xs ${limitReached ? 'font-bold text-red-600' : 'text-slate-500'}`}>
              Hôm nay đã thêm {usage.videosAdded}/{usage.maxVideos} video.
            </p>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          {progress !== null && (
            <div className="mb-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{progress < 1 ? `Đang tải lên ${Math.round(progress * 100)}%` : 'Đang xử lý…'}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => void start()}
            disabled={!ready}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-extrabold text-white shadow-md transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            Bắt đầu luyện tập
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

function TextArea({ value, onChange, lines }: { value: string; onChange: (v: string) => void; lines: number }) {
  return (
    <Field label={`Lời thoại tiếng Trung (mỗi dòng một câu) · ${lines} câu`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        placeholder={'你好！\n我叫王明。\n很高兴认识你。'}
        className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-base leading-relaxed focus:border-brand focus:outline-none"
      />
    </Field>
  )
}
