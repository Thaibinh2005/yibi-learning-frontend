import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface ExitDialogProps {
  open: boolean
  /** The question the attempt is saved at. */
  questionNumber: number
  onStay: () => void
  onLeave: () => void
}

/** A plain modal: the app has no dialog primitive and the test needs one confirmation only. */
export function ExitDialog({ open, questionNumber, onStay, onLeave }: ExitDialogProps) {
  const stay = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    stay.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onStay()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onStay])

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[2px]" onClick={onStay} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-title"
        className="fixed left-1/2 top-1/2 z-50 flex w-[440px] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 id="exit-title" className="text-lg font-bold text-slate-800">
          Thoát bài test?
        </h3>
        <p className="text-sm text-slate-500">
          Bài được lưu ở câu {questionNumber}. Lần sau bạn tiếp tục đúng chỗ này, không phải làm lại.
        </p>
        <div className="mt-1.5 flex justify-end gap-2">
          <Button ref={stay} variant="outline" className="rounded-xl" onClick={onStay}>
            Tiếp tục làm bài
          </Button>
          <Button className="rounded-xl" onClick={onLeave}>
            Thoát và lưu
          </Button>
        </div>
      </div>
    </>
  )
}
