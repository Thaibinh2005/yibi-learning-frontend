import React, { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

/** Plays the learner's own take, which stays in the browser only; nothing is kept on the server. */
export const RecordingPlayer: React.FC<{ blob?: Blob | null; label?: string }> = ({ blob, label = 'Nghe lại giọng của bạn' }) => {
  const [state, setState] = useState<'idle' | 'playing' | 'failed'>('idle')
  const audio = useRef<HTMLAudioElement | null>(null)
  const url = useRef<string | null>(null)

  useEffect(() => () => {
    audio.current?.pause()
    if (url.current) URL.revokeObjectURL(url.current)
  }, [])

  const toggle = async () => {
    if (state === 'playing') {
      audio.current?.pause()
      setState('idle')
      return
    }
    try {
      if (!audio.current && blob) {
        url.current = URL.createObjectURL(blob)
        audio.current = new Audio(url.current)
        audio.current.onended = () => setState('idle')
      }
      if (!audio.current) throw new Error('nothing to play')
      audio.current.currentTime = 0
      await audio.current.play()
      setState('playing')
    } catch {
      setState('failed')
    }
  }

  if (!blob) return null
  return (
    <button type="button" onClick={toggle} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50">
      {state === 'playing' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      {state === 'failed' ? 'Chưa phát được, thử lại' : state === 'playing' ? 'Dừng' : label}
    </button>
  )
}
