import { useEffect } from 'react'
import { toast } from 'sonner'
import type { TranslationStatus } from '@/types/listening'

interface Watched {
  id: number
  title: string
  translationStatus: TranslationStatus
  translationMessage?: string
  /** Sentences that already have a Vietnamese line, out of `total`. */
  done: number
  total: number
}

/** Title, "12/40 câu đã dịch" and a bar, under the toast's heading. */
function Progress({ title, done, total }: { title: string; done: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  return (
    <div className="mt-0.5 w-full">
      <p className="line-clamp-1">{title}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sky-100" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Tiến trình dịch">
          <div className="h-full rounded-full bg-sky-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 font-semibold tabular-nums">{done}/{total} câu</span>
      </div>
    </div>
  )
}

const showRunning = (id: number, title: string, done: number, total: number) =>
  toast.loading('Đang dịch phụ đề sang tiếng Việt…', {
    id: toastId(id),
    description: <Progress title={title} done={done} total={total} />,
  })

/** Videos whose translation was seen running and whose outcome has not been announced yet (kept across pages). */
const awaiting = new Set<number>()

const toastId = (id: number) => `translate-${id}`

/** Starts the "translating" toast; called by the editor right after "Hoàn tất & tạo bản dịch". */
export function announceTranslationStarted(id: number, title: string, done: number, total: number) {
  awaiting.add(id)
  showRunning(id, title, done, total)
}

/**
 * Turns the background translation of the given videos into toasts: a loading toast while it runs, then success or
 * failure once. Pages that poll the videos call it; leaving them hides the loading toast, and the outcome is still
 * announced on the next page that sees it.
 */
export function useTranslationToasts(videos: Watched[]) {
  const key = videos.map((v) => `${v.id}:${v.translationStatus}:${v.done}/${v.total}`).join(',')

  useEffect(() => {
    for (const v of videos) {
      if (v.translationStatus === 'RUNNING') {
        awaiting.add(v.id)
        showRunning(v.id, v.title, v.done, v.total)
      } else if (awaiting.has(v.id)) {
        awaiting.delete(v.id)
        if (v.translationStatus === 'DONE') {
          toast.success('Đã dịch xong phụ đề tiếng Việt', {
            id: toastId(v.id),
            description: `${v.title} · ${v.done}/${v.total} câu`,
          })
        } else if (v.translationStatus === 'FAILED') {
          toast.error('Bản dịch chưa xong', {
            id: toastId(v.id),
            description: v.translationMessage ?? `${v.title} · đã dịch ${v.done}/${v.total} câu. Mở video và bấm "Dịch tiếp" để dịch nốt.`,
            duration: 8000,
          })
        } else {
          toast.dismiss(toastId(v.id))
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // A loading toast never ends by itself, so it goes away with the page that keeps it up to date.
  useEffect(
    () => () => {
      for (const id of awaiting) toast.dismiss(toastId(id))
    },
    []
  )
}
