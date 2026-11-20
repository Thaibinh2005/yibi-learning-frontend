import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { AlertCircle, Check, Globe2, Loader2, Send, ShieldCheck, X } from 'lucide-react'
import { apiError, getLibraryCategories, submitVideo } from '@/api/listeningApi'
import type { ListeningCategory, ShareRights, VideoDetail } from '@/types/listening'

/** What the dialog needs of a lesson: an uploaded file (media but no YouTube id) needs its sharing right stated. */
export interface SubmittableLesson {
  id: number
  title: string
  videoId?: string
  hasMedia: boolean
  description?: string
  categories?: { id: number }[]
}

const RIGHTS: { id: ShareRights; label: string; hint: string }[] = [
  { id: 'OWN', label: 'Tôi tự sản xuất', hint: 'Bạn thu âm hoặc quay file này.' },
  { id: 'CREATIVE_COMMONS', label: 'Giấy phép Creative Commons', hint: 'Ghi link nguồn và loại giấy phép.' },
  { id: 'PERMISSION', label: 'Được tác giả cho phép', hint: 'Ghi ai đã cho phép và cách liên hệ.' },
]

/**
 * Sends a finished lesson to the community: 1–3 categories (the admin settles them on review), a short description,
 * and for an uploaded file, the right to share it. The contributor is credited for the lines; a YouTube video stays
 * credited to its channel.
 */
export function SubmitLessonDialog({ lesson, admin = false, onClose, onSubmitted }: {
  lesson: SubmittableLesson
  /** An admin's lesson is published at once. */
  admin?: boolean
  onClose: () => void
  onSubmitted: (detail: VideoDetail) => void
}) {
  const [categories, setCategories] = useState<ListeningCategory[] | null>(null)
  const [picked, setPicked] = useState<number[]>(() => (lesson.categories ?? []).map((c) => c.id).slice(0, 3))
  const [description, setDescription] = useState(lesson.description ?? '')
  const [rights, setRights] = useState<ShareRights | null>(null)
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const isUpload = lesson.hasMedia && !lesson.videoId

  useEffect(() => {
    getLibraryCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const toggle = (id: number) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]))

  const ready =
    !busy && confirmed && picked.length > 0 &&
    (!isUpload || (rights !== null && (rights === 'OWN' || note.trim() !== '')))

  const send = async () => {
    if (!ready) return
    setBusy(true)
    setError(null)
    try {
      const detail = await submitVideo(lesson.id, {
        categoryIds: picked,
        description: description.trim() || undefined,
        usageRights: isUpload ? rights ?? undefined : undefined,
        rightsNote: isUpload ? note.trim() || undefined : undefined,
        confirmed,
      })
      toast.success(detail.visibility === 'PUBLISHED' ? 'Đã công khai bài luyện' : 'Đã gửi bài lên cộng đồng', {
        description: detail.visibility === 'PUBLISHED' ? lesson.title : 'Admin sẽ duyệt trước khi bài hiện trong thư viện.',
      })
      onSubmitted(detail)
    } catch (err) {
      setError(apiError(err, 'Chưa gửi được bài.'))
      setBusy(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="submit-lesson-title" className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 id="submit-lesson-title" className="flex items-center gap-2 text-xl font-bold text-ink">
              <Globe2 className="h-5 w-5 text-brand" /> Chia sẻ lên cộng đồng
            </h2>
            <p className="truncate text-sm text-slate-500">{lesson.title}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Đóng" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {admin
              ? 'Bạn là admin nên bài sẽ được công khai ngay.'
              : 'Admin sẽ xem lại lời thoại, bản dịch và danh mục trước khi bài hiện trong thư viện. Bạn được ghi công là người đóng góp lời thoại.'}
            {lesson.videoId && ' Video vẫn được ghi công cho kênh YouTube gốc.'}
          </p>

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-slate-700">Danh mục (chọn 1–3) · {picked.length}/3</legend>
            {categories === null ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có danh mục nào được mở.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const on = picked.includes(c.id)
                  const full = !on && picked.length >= 3
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      disabled={full}
                      onClick={() => toggle(c.id)}
                      title={c.description}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition disabled:opacity-40 ${on ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                    >
                      {on && <Check className="h-3.5 w-3.5" />} {c.name}
                    </button>
                  )
                })}
              </div>
            )}
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Giới thiệu ngắn (không bắt buộc)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Video nói về gì, hợp với người học trình độ nào…"
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </label>

          {isUpload && (
            <fieldset className="space-y-2">
              <legend className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Quyền chia sẻ file này
              </legend>
              {RIGHTS.map((r) => (
                <label key={r.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${rights === r.id ? 'border-brand bg-rose-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="rights" checked={rights === r.id} onChange={() => setRights(r.id)} className="mt-1 accent-[#C8322B]" />
                  <span>
                    <span className="block text-sm font-bold text-slate-800">{r.label}</span>
                    <span className="block text-xs text-slate-500">{r.hint}</span>
                  </span>
                </label>
              ))}
              {rights && rights !== 'OWN' && (
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  placeholder={rights === 'CREATIVE_COMMONS' ? 'Link nguồn · CC BY 4.0' : 'Người cho phép, cách liên hệ'}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
                />
              )}
              <p className="text-xs text-slate-500">File tải lên chỉ để tự học thì không chia sẻ được.</p>
            </fieldset>
          )}

          <label className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 accent-[#C8322B]" />
            Lời thoại và bản dịch do tôi kiểm tra, nội dung phù hợp để chia sẻ và không vi phạm bản quyền.
          </label>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} disabled={busy} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 font-bold text-slate-700 hover:bg-slate-100">
            Huỷ
          </button>
          <button type="button" onClick={() => void send()} disabled={!ready} className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-brand py-3 font-extrabold text-white shadow-md transition hover:brightness-95 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {admin ? 'Công khai' : 'Gửi duyệt'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
