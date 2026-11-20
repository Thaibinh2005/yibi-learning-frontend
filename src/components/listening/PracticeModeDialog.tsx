import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Loader2, Mic, Pencil, ScrollText, X } from 'lucide-react'
import type { VideoSummary } from '@/types/listening'

export type PracticeMode = 'dictation' | 'shadowing' | 'transcript'

/** What the dialog needs of a lesson. */
export type ModeDialogLesson = Pick<VideoSummary, 'id' | 'title' | 'translationStatus'>

export const PRACTICE_MODES: { id: PracticeMode; label: string; short: string; icon: React.ElementType; description: string }[] = [
  { id: 'dictation', label: 'Nghe chép (Dictation)', short: 'Nghe chép', icon: Pencil, description: 'Nghe từng câu rồi gõ lại, máy chấm từng chữ.' },
  { id: 'shadowing', label: 'Nói nhại (Shadowing)', short: 'Nói nhại', icon: Mic, description: 'Nghe mẫu rồi ghi âm đọc theo, máy chấm độ chính xác.' },
  { id: 'transcript', label: 'Lời thoại (Transcript)', short: 'Lời thoại', icon: ScrollText, description: 'Xem lời thoại chạy theo video, có pinyin và bản dịch.' },
]

/** Asked when a finished video is opened: which kind of practice to start. */
export function PracticeModeDialog({ video, onClose }: { video: ModeDialogLesson; onClose: () => void }) {
  const navigate = useNavigate()
  const dialog = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    dialog.current?.querySelector<HTMLElement>('[data-mode]')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="practice-mode-title" className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 id="practice-mode-title" className="text-xl font-bold text-ink">Chọn cách luyện</h2>
            <p className="truncate text-sm text-slate-500">{video.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2 p-4">
          {PRACTICE_MODES.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              type="button"
              data-mode={id}
              onClick={() => navigate(`/listening/${video.id}?mode=${id}`)}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-brand/40 hover:bg-rose-50/40 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold text-slate-900">{label}</span>
                <span className="block text-sm text-slate-500">{description}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
            </button>
          ))}
          {video.translationStatus === 'RUNNING' && (
            <p className="flex items-center gap-2 px-1 pt-1 text-xs text-sky-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Bản dịch đang được tạo, bạn vẫn luyện được ngay.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
