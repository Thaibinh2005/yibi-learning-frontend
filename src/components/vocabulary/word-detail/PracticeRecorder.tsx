import React, { useEffect, useRef, useState } from 'react'
import { Mic, RotateCcw, Square } from 'lucide-react'

type Phase = 'idle' | 'recording' | 'recorded' | 'denied' | 'unsupported'

const MAX_SECONDS = 20

/**
 * Record yourself and listen back, to compare with the model sentence by ear. The recording stays in this browser
 * tab: it is not uploaded, stored or scored, since Yibi has no pronunciation assessment wired in for this.
 */
export const PracticeRecorder: React.FC = () => {
  const supported = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia
  const [phase, setPhase] = useState<Phase>(supported ? 'idle' : 'unsupported')
  const [seconds, setSeconds] = useState(0)
  const [url, setUrl] = useState<string | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<number | undefined>(undefined)

  const release = () => {
    window.clearInterval(timer.current)
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
  }

  // Stop the microphone when the tab or the modal closes.
  useEffect(() => () => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
    release()
  }, [])

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])

  const stop = () => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
  }

  useEffect(() => {
    if (phase === 'recording' && seconds >= MAX_SECONDS) stop()
  }, [phase, seconds])

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
    media.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data)
    media.onstop = () => {
      release()
      const blob = new Blob(chunks.current, { type: media.mimeType || 'audio/webm' })
      setUrl(URL.createObjectURL(blob))
      setPhase('recorded')
    }
    media.start()
    setSeconds(0)
    setUrl(null)
    setPhase('recording')
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  if (phase === 'unsupported') {
    return <p className="text-xs text-slate-500">Trình duyệt này không hỗ trợ ghi âm. Hãy đọc to theo câu mẫu.</p>
  }
  if (phase === 'denied') {
    return (
      <p className="text-xs text-rose-700">
        Chưa được phép dùng micro. Hãy cho phép micro trong trình duyệt rồi{' '}
        <button type="button" onClick={() => setPhase('idle')} className="font-semibold underline">thử lại</button>.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {phase === 'recording' ? (
        <button
          type="button"
          onClick={stop}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
        >
          <Square className="h-3.5 w-3.5" />
          Dừng ({seconds}s)
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {phase === 'recorded' ? <RotateCcw className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {phase === 'recorded' ? 'Ghi lại' : 'Ghi âm'}
        </button>
      )}
      {phase === 'recording' && <span className="h-2 w-2 animate-pulse rounded-full bg-rose-600" aria-hidden />}
      {url && phase === 'recorded' && <audio controls src={url} className="h-8 max-w-full" aria-label="Nghe lại bản ghi của bạn" />}
    </div>
  )
}
