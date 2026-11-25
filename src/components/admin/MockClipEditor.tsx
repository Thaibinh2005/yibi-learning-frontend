import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pause, Play, Scissors } from 'lucide-react'
import type { MockAudio } from '@/api/mockTestApi'

/** Peaks are the loudness every 50 ms of the original recording (made with the import). */
const PEAKS_PER_SECOND = 20

export interface SourcePlayer {
  /** Plays the original recording from `from` until `to`, or stops when that same range is playing. */
  play: (from: number, to: number) => void
  stop: () => void
  playing: { from: number; to: number } | null
  time: number
  ready: boolean
}

/** One hidden player for the original recording, shared by every clip on the page. */
export const useSourcePlayer = (url?: string | null): SourcePlayer => {
  const audio = useRef<HTMLAudioElement | null>(null)
  const stopAt = useRef(0)
  const [playing, setPlaying] = useState<{ from: number; to: number } | null>(null)
  const [time, setTime] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!url) return
    const el = new Audio()
    el.preload = 'metadata'
    el.src = url
    el.onloadedmetadata = () => setReady(true)
    el.ontimeupdate = () => {
      setTime(el.currentTime)
      if (el.currentTime >= stopAt.current) {
        el.pause()
        setPlaying(null)
      }
    }
    el.onpause = () => setPlaying(null)
    audio.current = el
    return () => {
      el.pause()
      el.src = ''
      audio.current = null
    }
  }, [url])

  const stop = useCallback(() => {
    audio.current?.pause()
    setPlaying(null)
  }, [])

  const play = useCallback((from: number, to: number) => {
    const el = audio.current
    if (!el) return
    if (playing && playing.from === from && playing.to === to) {
      stop()
      return
    }
    stopAt.current = to
    el.currentTime = Math.max(0, from)
    el.play().then(() => setPlaying({ from, to })).catch(() => setPlaying(null))
  }, [playing, stop])

  return { play, stop, playing, time, ready }
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`

/**
 * Marks of one clip over the waveform of the original recording: drag the edges or nudge them, listen to the start,
 * the end or the whole range, then re-cut. Moved marks are only applied to the clip file when re-cut.
 */
export const ClipEditor: React.FC<{
  label: string
  audio: MockAudio
  marks: { start: number; end: number }
  onMarks: (marks: { start: number; end: number }) => void
  peaks: number[] | null
  source: SourcePlayer
  onChecked?: (checked: boolean) => void
}> = ({ label, audio, marks, onMarks, peaks, source, onChecked }) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const savedStart = audio.start ?? 0
  const savedEnd = audio.end ?? 0
  const from = Math.max(0, Math.min(savedStart, marks.start) - 5)
  const to = Math.max(savedEnd, marks.end) + 5
  const span = Math.max(1, to - from)
  const x = (t: number) => ((t - from) / span) * width
  const moved = Math.abs(marks.start - savedStart) > 0.04 || Math.abs(marks.end - savedEnd) > 0.04

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    const height = 72
    c.width = width * ratio
    c.height = height * ratio
    const g = c.getContext('2d')
    if (!g) return
    g.scale(ratio, ratio)
    g.clearRect(0, 0, width, height)
    g.fillStyle = 'rgba(200, 50, 43, 0.08)'
    g.fillRect(x(marks.start), 0, x(marks.end) - x(marks.start), height)
    if (!peaks) return
    const first = Math.floor(from * PEAKS_PER_SECOND)
    const last = Math.min(peaks.length, Math.ceil(to * PEAKS_PER_SECOND))
    const bar = Math.max(1, width / Math.max(1, last - first))
    for (let i = first; i < last; i++) {
      const t = i / PEAKS_PER_SECOND
      const v = peaks[i] ?? 0
      const h = Math.max(1, v * (height - 6))
      g.fillStyle = t >= marks.start && t <= marks.end ? '#C8322B' : '#cbd5e1'
      g.fillRect(x(t), (height - h) / 2, Math.max(1, bar - 0.5), h)
    }
  }, [peaks, width, from, to, marks.start, marks.end]) // eslint-disable-line react-hooks/exhaustive-deps

  const drag = (edge: 'start' | 'end') => (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const el = box.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const move = (e: PointerEvent) => {
      const t = Math.round((from + ((e.clientX - rect.left) / rect.width) * span) * 10) / 10
      if (edge === 'start') onMarks({ start: Math.max(0, Math.min(t, marks.end - 0.5)), end: marks.end })
      else onMarks({ start: marks.start, end: Math.max(t, marks.start + 0.5) })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const nudge = (edge: 'start' | 'end', by: number) => {
    const next = { ...marks }
    next[edge] = Math.max(0, Math.round((next[edge] + by) * 10) / 10)
    if (next.end - next.start >= 0.5) onMarks(next)
  }

  const playingThis = source.playing && source.playing.from >= from && source.playing.to <= to
  const head = playingThis && source.time >= from && source.time <= to ? x(source.time) : null
  const isPlaying = (a: number, b: number) => source.playing?.from === a && source.playing?.to === b

  const PlayButton: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => (
    <button type="button" disabled={!source.ready} onClick={() => source.play(a, b)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
      {isPlaying(a, b) ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{children}
    </button>
  )

  return (
    <div className={`rounded-xl border p-3 ${audio.needsReview ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <div className="flex flex-wrap items-center gap-2">
          {moved && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700"><Scissors className="h-3 w-3" />Mốc đã đổi, chưa cắt lại</span>}
          {onChecked && (
            <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${audio.needsReview ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
              <input type="checkbox" checked={!audio.needsReview} onChange={(e) => onChecked(e.target.checked)} className="accent-emerald-600" />
              {audio.needsReview ? 'Cần nghe lại' : 'Đã kiểm tra'}
            </label>
          )}
        </div>
      </div>
      <div ref={box} className="relative mt-2 h-[72px] w-full select-none rounded-lg bg-slate-50" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const t = from + ((e.clientX - rect.left) / rect.width) * span
        source.play(t, marks.end)
      }}>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        {!peaks && <span className="absolute inset-0 grid place-items-center text-xs text-slate-400">Không có dạng sóng</span>}
        {head != null && <div className="pointer-events-none absolute inset-y-0 w-px bg-slate-900" style={{ left: head }} />}
        {(['start', 'end'] as const).map((edge) => (
          <div
            key={edge}
            role="slider"
            aria-label={edge === 'start' ? 'Mốc đầu' : 'Mốc cuối'}
            aria-valuenow={marks[edge]}
            tabIndex={0}
            onPointerDown={drag(edge)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') nudge(edge, e.shiftKey ? -0.5 : -0.1)
              if (e.key === 'ArrowRight') nudge(edge, e.shiftKey ? 0.5 : 0.1)
            }}
            className="absolute inset-y-0 -ml-1.5 w-3 cursor-ew-resize focus:outline-none"
            style={{ left: x(marks[edge]) }}
          >
            <div className="mx-auto h-full w-0.5 bg-[#C8322B]" />
            <div className="absolute -top-1 left-0 h-3 w-3 rounded-full border-2 border-white bg-[#C8322B] shadow" />
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {(['start', 'end'] as const).map((edge) => (
          <span key={edge} className="inline-flex items-center gap-1">
            <span className="font-semibold text-slate-500">{edge === 'start' ? 'Đầu' : 'Cuối'}</span>
            <button type="button" onClick={() => nudge(edge, -0.5)} className="rounded border border-slate-200 px-1.5 hover:bg-slate-50">−0.5</button>
            <button type="button" onClick={() => nudge(edge, -0.1)} className="rounded border border-slate-200 px-1.5 hover:bg-slate-50">−0.1</button>
            <span className="w-14 text-center font-mono tabular-nums text-slate-800">{fmt(marks[edge])}</span>
            <button type="button" onClick={() => nudge(edge, 0.1)} className="rounded border border-slate-200 px-1.5 hover:bg-slate-50">+0.1</button>
            <button type="button" onClick={() => nudge(edge, 0.5)} className="rounded border border-slate-200 px-1.5 hover:bg-slate-50">+0.5</button>
          </span>
        ))}
        <span className="text-slate-400">Dài {(marks.end - marks.start).toFixed(1)}s</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PlayButton a={marks.start} b={Math.min(marks.end, marks.start + 3)}>3 giây đầu</PlayButton>
        <PlayButton a={Math.max(marks.start, marks.end - 3)} b={marks.end}>3 giây cuối</PlayButton>
        <PlayButton a={marks.start} b={marks.end}>Cả đoạn (theo mốc)</PlayButton>
        <audio controls preload="none" src={audio.file} className="h-8 max-w-[260px]" aria-label="Đoạn đã cắt" />
      </div>
    </div>
  )
}
