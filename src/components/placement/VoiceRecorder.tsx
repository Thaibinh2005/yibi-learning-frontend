import { useEffect, useRef, useState } from 'react'
import { Mic, RotateCcw, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { InlineBanner } from './InlineBanner'

type Phase = 'idle' | 'recording' | 'recorded' | 'scoring' | 'denied' | 'failed'

interface VoiceRecorderProps {
  /** Called with the finished recording; resolves when the answer has been scored. Reject to show the failure banner. */
  onSubmit: (audio: Blob) => Promise<void>
  onSkip: () => void
  maxSeconds?: number
  /** Says what happens to the recording; placement answers are not kept, lesson ones are. */
  note?: string
}

const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export function VoiceRecorder({ onSubmit, onSkip, maxSeconds = 30, note = 'Bản ghi không được lưu sau khi chấm.' }: VoiceRecorderProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const blob = useRef<Blob | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const release = () => {
    window.clearInterval(timer.current)
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
  }

  useEffect(() => release, [])

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const stop = () => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
  }

  useEffect(() => {
    if (phase === 'recording' && seconds >= maxSeconds) stop()
  }, [phase, seconds, maxSeconds])

  const start = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setPhase('denied')
      return
    }
    chunks.current = []
    const media = new MediaRecorder(stream.current)
    recorder.current = media
    media.ondataavailable = (event) => event.data.size > 0 && chunks.current.push(event.data)
    media.onstop = () => {
      release()
      blob.current = new Blob(chunks.current, { type: media.mimeType || 'audio/webm' })
      setPreview(URL.createObjectURL(blob.current))
      setPhase('recorded')
    }
    media.start()
    setSeconds(0)
    setPhase('recording')
    timer.current = window.setInterval(() => setSeconds((value) => value + 1), 1000)
  }

  const submit = async () => {
    if (!blob.current) return
    setPhase('scoring')
    try {
      await onSubmit(blob.current)
    } catch {
      setPhase('failed')
    }
  }

  const recorded = phase === 'recorded' || phase === 'failed'

  return (
    <div className="flex flex-col gap-4">
      {(phase === 'idle' || phase === 'recording' || phase === 'recorded' || phase === 'scoring' || phase === 'failed') && (
        <div className="flex flex-col items-center gap-3.5 rounded-2xl bg-amber-50/60 px-5 py-7 text-center ring-1 ring-amber-100">
          {phase === 'scoring' ? (
            <div className="flex flex-col items-center gap-2" aria-busy="true">
              <Skeleton className="h-10 w-10 rounded-full" />
              <b>Đang chấm phát âm...</b>
              <span className="text-xs text-slate-500">Thường mất vài giây.</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={phase === 'recording' ? stop : start}
                aria-label={phase === 'recording' ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
                className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              >
                {phase === 'recording' && (
                  <>
                    <span className="absolute -inset-2.5 animate-ping rounded-full ring-2 ring-primary/35 motion-reduce:animate-none" />
                    <Square className="h-6 w-6 fill-current" />
                  </>
                )}
                {phase !== 'recording' && (recorded ? <RotateCcw className="h-6 w-6" /> : <Mic className="h-6 w-6" />)}
              </button>
              {phase === 'recording' ? (
                <>
                  <span className="text-sm font-semibold tabular-nums text-primary">{format(seconds)}</span>
                  <span className="text-xs text-slate-500">Đang ghi âm. Nhấn lại để dừng.</span>
                </>
              ) : recorded ? (
                <span className="text-sm text-slate-600">
                  Đã ghi {format(seconds)}. Nghe lại nếu muốn, nhấn micro để ghi lại, hoặc gửi bản ghi.
                  {preview && <audio controls src={preview} className="mx-auto mt-2 h-10 w-full max-w-xs" aria-label="Nghe lại bản ghi vừa thu" />}
                </span>
              ) : (
                <>
                  <b>Nhấn micro rồi đọc câu trên</b>
                  <span className="text-xs text-slate-500">Đọc rõ, không cần quá nhanh. Có thể ghi lại nếu chưa ưng.</span>
                </>
              )}
            </>
          )}
        </div>
      )}

      {phase === 'denied' && (
        <InlineBanner variant="warn" mic title="Trình duyệt chưa cho phép dùng micro.">
          Nhấn biểu tượng ổ khóa cạnh địa chỉ trang, bật quyền Micro rồi thử lại. Hoặc bỏ qua câu này, kết quả vẫn tính được.
        </InlineBanner>
      )}
      {phase === 'failed' && (
        <InlineBanner variant="warn" title="Chưa chấm được bản ghi.">
          Dịch vụ chấm phát âm đang bận. Thử gửi lại, hoặc bỏ qua câu này. Phát âm sẽ là "chưa đủ dữ liệu".
        </InlineBanner>
      )}

      <div className={cn('flex flex-wrap items-center gap-2', 'justify-between')}>
        <Button type="button" variant="ghost" className="rounded-xl text-slate-500" onClick={onSkip} disabled={phase === 'scoring'}>
          Bỏ qua câu này
        </Button>
        <div className="flex items-center gap-2">
          {phase === 'denied' && (
            <Button type="button" variant="outline" className="rounded-xl" onClick={start}>
              Thử lại
            </Button>
          )}
          {(phase === 'recorded' || phase === 'failed') && (
            <Button type="button" className="gap-2 rounded-xl" size="lg" onClick={submit}>
              {phase === 'failed' ? 'Gửi lại' : 'Gửi bản ghi'}
            </Button>
          )}
          {(phase === 'idle' || phase === 'recording') && (
            <span className="text-xs text-slate-500">{note}</span>
          )}
        </div>
      </div>
    </div>
  )
}
