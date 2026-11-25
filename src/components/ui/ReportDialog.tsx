import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { Flag, Loader2, X } from 'lucide-react'
import { reportContent } from '@/api/reportApi'
import type { ReportReason, ReportTarget } from '@/types/adminOps'

const REASONS: Record<ReportTarget, { id: ReportReason; label: string }[]> = {
  LISTENING_SEGMENT: [
    { id: 'WRONG_TEXT', label: 'Sai chữ Hán trong câu' },
    { id: 'WRONG_TIME', label: 'Lệch thời gian với video' },
    { id: 'WRONG_TRANSLATION', label: 'Bản dịch tiếng Việt sai' },
    { id: 'WRONG_PINYIN', label: 'Pinyin sai' },
    { id: 'OTHER', label: 'Lỗi khác' },
  ],
  LISTENING_LESSON: [
    { id: 'WRONG_TIME', label: 'Nhiều câu lệch thời gian' },
    { id: 'WRONG_TRANSLATION', label: 'Bản dịch nhiều chỗ sai' },
    { id: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
    { id: 'OTHER', label: 'Lỗi khác' },
  ],
  VOCABULARY: [
    { id: 'WRONG_MEANING', label: 'Nghĩa tiếng Việt sai' },
    { id: 'WRONG_PINYIN', label: 'Pinyin sai' },
    { id: 'BAD_EXAMPLE', label: 'Câu ví dụ sai hoặc không tự nhiên' },
    { id: 'OTHER', label: 'Lỗi khác' },
  ],
}

/** Lets a learner report a mistake in a listening line, a listening lesson or a word. */
export function ReportDialog({ target, onClose }: {
  target: { type: ReportTarget; id: number; ref?: number; label: string }
  onClose: () => void
}) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const ready = !!reason && !busy && (reason !== 'OTHER' || note.trim() !== '')

  const send = async () => {
    if (!ready || !reason) return
    setBusy(true)
    try {
      await reportContent({ targetType: target.type, targetId: target.id, targetRef: target.ref, reason, note: note.trim() || undefined })
      toast.success('Đã gửi báo lỗi', { description: 'Cảm ơn bạn! Admin sẽ xem và sửa sớm.' })
      onClose()
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error('Chưa gửi được', { description: message ?? 'Hãy thử lại.' })
      setBusy(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 id="report-title" className="flex items-center gap-2 text-lg font-bold text-ink">
              <Flag className="h-5 w-5 text-brand" /> Báo lỗi
            </h2>
            <p className="line-clamp-2 text-sm text-slate-500">{target.label}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Đóng" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-bold text-slate-700">Lỗi gì?</legend>
            {REASONS[target.type].map((r) => (
              <label key={r.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${reason === r.id ? 'border-brand bg-rose-50/50 font-semibold text-ink' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                <input type="radio" name="reason" checked={reason === r.id} onChange={() => setReason(r.id)} className="accent-[#C8322B]" />
                {r.label}
              </label>
            ))}
          </fieldset>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={reason === 'OTHER' ? 'Mô tả ngắn lỗi bạn thấy (bắt buộc)' : 'Gợi ý sửa (không bắt buộc), ví dụ chữ hoặc nghĩa đúng'}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} disabled={busy} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 font-bold text-slate-700 hover:bg-slate-100">
            Huỷ
          </button>
          <button type="button" onClick={() => void send()} disabled={!ready} className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-brand py-3 font-extrabold text-white shadow-md disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />} Gửi báo lỗi
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
