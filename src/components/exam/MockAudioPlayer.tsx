import React, { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react'

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

/** Plays used per clip during a timed exam, kept while the page is open (going back to a question does not reset it). */
const usedPlays = new Map<string, number>()

/**
 * One listening clip. With `maxPlays` (a timed exam) it can be played that many times, like the real test where
 * the recording runs once; a clip shared by several questions counts once. Pausing is still allowed.
 */
export const MockAudioPlayer: React.FC<{
  src: string
  label?: string
  maxPlays?: number
  /** Shown under the bar in a timed exam, e.g. that each item is read twice inside the clip. */
  note?: string
}> = ({ src, label = 'Nghe', maxPlays, note }) => {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [plays, setPlaysState] = useState(() => usedPlays.get(src) ?? 0)
  const [failed, setFailed] = useState(false)
  const setPlays = (update: (n: number) => number) => setPlaysState((n) => {
    const next = update(n)
    usedPlays.set(src, next)
    return next
  })

  // A new question brings a new clip: start over (a clip already used in this exam stays used).
  useEffect(() => {
    setPlaying(false)
    setTime(0)
    setPlaysState(usedPlays.get(src) ?? 0)
    setFailed(false)
  }, [src])

  const used = maxPlays != null && plays >= maxPlays && !playing
  const toggle = () => {
    const el = audio.current
    if (!el || used) return
    if (playing) {
      el.pause()
      return
    }
    if (el.ended || el.currentTime === 0) setPlays((n) => n + 1)
    if (el.ended) el.currentTime = 0
    el.play().catch(() => setFailed(true))
  }

  const restart = () => {
    const el = audio.current
    if (!el || maxPlays != null) return
    el.currentTime = 0
    el.play().catch(() => setFailed(true))
  }

  const percent = duration ? Math.min(100, (time / duration) * 100) : 0
  const free = maxPlays == null

  // Practice only: listen again from any point, skip back or ahead, and slow down.
  const [rate, setRate] = useState(1)
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = rate
  }, [rate, src])
  const seekTo = (seconds: number) => {
    const el = audio.current
    if (!el || !free || !duration) return
    el.currentTime = Math.max(0, Math.min(duration - 0.05, seconds))
    setTime(el.currentTime)
  }
  const seekBar = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    seekTo(((event.clientX - rect.left) / rect.width) * duration)
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 p-3">
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration)
          event.currentTarget.playbackRate = rate
        }}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={used || failed}
        aria-label={playing ? 'Tạm dừng' : label}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_3px_0_#8C1F1A] transition active:translate-y-0.5 active:shadow-none disabled:bg-slate-300 disabled:shadow-none"
      >
        {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="ml-0.5 h-5 w-5 fill-white" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-slate-500">
          <span>{failed ? 'Không tải được audio' : used ? 'Đã nghe xong' : label}</span>
          {/* A timed exam has one clock for the whole paper (in the header), not one per clip. */}
          {maxPlays == null && <span className="tabular-nums">{clock(time)} / {clock(duration)}</span>}
        </div>
        <div
          className={`relative mt-1.5 overflow-hidden rounded-full bg-slate-200 ${free ? 'h-3 cursor-pointer' : 'h-2'}`}
          role={free ? 'slider' : 'progressbar'}
          aria-label={free ? 'Tua đến chỗ muốn nghe' : undefined}
          aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}
          tabIndex={free ? 0 : undefined}
          onClick={free ? seekBar : undefined}
          onKeyDown={free ? (event) => {
            if (event.key === 'ArrowLeft') seekTo(time - 5)
            if (event.key === 'ArrowRight') seekTo(time + 5)
          } : undefined}
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${percent}%` }} />
        </div>
        {free && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <button type="button" onClick={() => seekTo(time - 5)} aria-label="Lùi 5 giây" className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 font-semibold text-slate-600 hover:bg-slate-200"><RotateCcw className="h-3.5 w-3.5" />5s</button>
            <button type="button" onClick={() => seekTo(time + 5)} aria-label="Tiến 5 giây" className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 font-semibold text-slate-600 hover:bg-slate-200">5s<RotateCw className="h-3.5 w-3.5" /></button>
            <span className="ml-1 text-slate-400">Tốc độ</span>
            {[0.75, 1, 1.25].map((value) => (
              <button key={value} type="button" onClick={() => setRate(value)} aria-pressed={rate === value}
                className={`rounded-lg px-1.5 py-0.5 font-bold tabular-nums ${rate === value ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-200'}`}>{value}×</button>
            ))}
            <span className="ml-auto hidden text-slate-400 sm:inline">Bấm vào thanh để nghe lại từ chỗ đó</span>
          </div>
        )}
        {maxPlays != null && (
          <p className="mt-1 text-[11px] text-slate-500">{note ?? `Như đề thật: đoạn này chỉ phát ${maxPlays} lần.`}</p>
        )}
      </div>
      {maxPlays == null && (
        <button type="button" onClick={restart} aria-label="Nghe lại từ đầu" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-200">
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
