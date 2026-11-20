import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Languages, Loader2, Play, X } from 'lucide-react'
import type { VideoSummary } from '@/types/listening'

/**
 * Shown on the list after "Hoàn tất & tạo bản dịch": the video is in the learner's library, with "Luyện ngay" to
 * start practising. `video` is null while the list is still loading.
 */
export function VideoReadyModal({ video, onClose, onPractise }: {
  video: VideoSummary | null
  onClose: () => void
  onPractise: () => void
}) {
  const primary = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (video) primary.current?.focus()
  }, [video])

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-ready-title"
        aria-describedby="video-ready-alert"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="relative px-6 pb-2 pt-6 text-center">
          <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-3 top-3 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h2 id="video-ready-title" className="mt-4 text-2xl font-bold text-ink">Hoàn tất!</h2>
          {video && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{video.title}</p>}
        </div>

        <div className="space-y-3 px-6 py-4">
          <div id="video-ready-alert" role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Video đã có trong thư viện của bạn</p>
              {video && <p className="text-sm text-emerald-700">{video.segmentCount} câu, có pinyin cho từng câu.</p>}
            </div>
          </div>
          {video?.translationStatus === 'RUNNING' && (
            <p className="flex items-start gap-2 px-1 text-sm text-slate-600">
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-sky-600" />
              Bản dịch tiếng Việt đang được tạo ({video.translatedCount}/{video.segmentCount} câu). Tiến trình hiện ở góc trên bên phải, bạn có thể luyện ngay.
            </p>
          )}
          {video?.translationStatus === 'DONE' && (
            <p className="flex items-center gap-2 px-1 text-sm text-slate-600">
              <Languages className="h-4 w-4 text-emerald-600" /> Đã có bản dịch tiếng Việt.
            </p>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 font-bold text-slate-700 hover:bg-slate-100">
            Đóng
          </button>
          <button
            ref={primary}
            type="button"
            onClick={onPractise}
            disabled={!video}
            className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-brand py-3 font-extrabold uppercase tracking-wide text-white shadow-md transition hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
          >
            {video ? <Play className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />} Luyện ngay
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
