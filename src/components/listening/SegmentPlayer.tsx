import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

/** Controls shared by the YouTube player and the browser's own audio/video element. */
export interface PlayerHandle {
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (seconds: number) => void
  /** Plays from `start` and pauses by itself at `end`. */
  playRange: (start: number, end: number) => void
  getTime: () => number
  setRate: (rate: number) => void
  isPlaying: () => boolean
}

interface Props {
  videoId?: string
  mediaUrl?: string | null
  mediaType?: string
  /** Called about ten times a second while playing, and after a seek. */
  onTime?: (seconds: number) => void
  onPlayingChange?: (playing: boolean) => void
  /** Called when a range started with playRange reaches its end. */
  onRangeEnd?: () => void
  className?: string
}

// ── Minimal typing of the YouTube IFrame API ───────────────────────
interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getPlayerState: () => number
  setPlaybackRate: (rate: number) => void
  destroy: () => void
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, options: unknown) => YTPlayer; PlayerState: { PLAYING: number } }
    onYouTubeIframeAPIReady?: () => void
  }
}

let youtubeApi: Promise<void> | null = null
function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (!youtubeApi) {
    youtubeApi = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => {
        youtubeApi = null
        reject(new Error('YouTube API failed to load'))
      }
      document.head.appendChild(script)
    })
  }
  return youtubeApi
}

const PLAYING = 1

/**
 * One player for both sources. YouTube has no time events, so the time is polled; the same poll stops a range at its
 * end, which keeps a sentence from running into the next one.
 */
export const SegmentPlayer = forwardRef<PlayerHandle, Props>(function SegmentPlayer(
  { videoId, mediaUrl, mediaType, onTime, onPlayingChange, onRangeEnd, className = '' },
  ref
) {
  const host = useRef<HTMLDivElement>(null)
  const yt = useRef<YTPlayer | null>(null)
  const media = useRef<HTMLMediaElement | null>(null)
  const rangeEnd = useRef<number | null>(null)
  const pendingRate = useRef(1)
  const callbacks = useRef({ onTime, onPlayingChange, onRangeEnd })
  callbacks.current = { onTime, onPlayingChange, onRangeEnd }

  const time = () => (yt.current ? yt.current.getCurrentTime?.() ?? 0 : media.current?.currentTime ?? 0)
  const playing = () =>
    yt.current ? yt.current.getPlayerState?.() === PLAYING : !!media.current && !media.current.paused && !media.current.ended

  const pause = () => {
    rangeEnd.current = null
    if (yt.current) yt.current.pauseVideo()
    else media.current?.pause()
  }

  useImperativeHandle(ref, () => ({
    play: () => {
      if (yt.current) yt.current.playVideo()
      else void media.current?.play().catch(() => undefined)
    },
    pause,
    toggle: () => {
      if (playing()) pause()
      else if (yt.current) yt.current.playVideo()
      else void media.current?.play().catch(() => undefined)
    },
    seek: (seconds) => {
      if (yt.current) yt.current.seekTo(seconds, true)
      else if (media.current) media.current.currentTime = seconds
      callbacks.current.onTime?.(seconds)
    },
    playRange: (start, end) => {
      rangeEnd.current = end
      if (yt.current) {
        yt.current.seekTo(start, true)
        yt.current.playVideo()
      } else if (media.current) {
        media.current.currentTime = start
        void media.current.play().catch(() => undefined)
      }
    },
    getTime: time,
    setRate: (rate) => {
      pendingRate.current = rate
      if (yt.current) yt.current.setPlaybackRate(rate)
      else if (media.current) media.current.playbackRate = rate
    },
    isPlaying: playing,
  }))

  // YouTube player
  useEffect(() => {
    if (!videoId || !host.current) return
    let cancelled = false
    const mount = document.createElement('div')
    host.current.appendChild(mount)
    loadYoutubeApi()
      .then(() => {
        if (cancelled || !window.YT) return
        yt.current = new window.YT.Player(mount, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
          events: {
            onReady: () => yt.current?.setPlaybackRate(pendingRate.current),
            onStateChange: (e: { data: number }) => callbacks.current.onPlayingChange?.(e.data === PLAYING),
          },
        })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
      yt.current?.destroy()
      yt.current = null
      mount.remove()
    }
  }, [videoId])

  // One poll for both sources: report the time and stop a range at its end.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!playing()) return
      const t = time()
      callbacks.current.onTime?.(t)
      if (rangeEnd.current !== null && t >= rangeEnd.current - 0.05) {
        pause()
        callbacks.current.onRangeEnd?.()
      }
    }, 80)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (videoId) {
    return <div ref={host} className={`aspect-video w-full overflow-hidden rounded-2xl bg-black [&>div]:h-full [&_iframe]:h-full [&_iframe]:w-full ${className}`} />
  }
  if (!mediaUrl) {
    return (
      <div className={`grid aspect-video w-full place-items-center rounded-2xl bg-slate-100 text-sm text-slate-500 ${className}`}>
        Đang tải file…
      </div>
    )
  }
  const events = {
    onPlay: () => callbacks.current.onPlayingChange?.(true),
    onPause: () => callbacks.current.onPlayingChange?.(false),
    onSeeked: (e: React.SyntheticEvent<HTMLMediaElement>) => callbacks.current.onTime?.(e.currentTarget.currentTime),
    onLoadedMetadata: (e: React.SyntheticEvent<HTMLMediaElement>) => {
      e.currentTarget.playbackRate = pendingRate.current
    },
  }
  if (mediaType?.startsWith('audio/')) {
    return (
      <div className={`flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 ${className}`}>
        <span className="text-5xl" aria-hidden>🎧</span>
        <audio ref={(el) => { media.current = el }} src={mediaUrl} controls preload="metadata" className="w-full" {...events} />
      </div>
    )
  }
  return (
    <video
      ref={(el) => { media.current = el }}
      src={mediaUrl}
      controls
      playsInline
      preload="metadata"
      className={`aspect-video w-full rounded-2xl bg-black ${className}`}
      {...events}
    />
  )
})

/** Reads a sentence with the browser's Chinese voice, for typed text that has no recording. */
export function speakChinese(text: string, rate = 1) {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = rate
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('zh'))
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
  return true
}

/** 75.5 -> "01:15.5"; an hour or more -> "1:01:15.5". */
export function formatTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '--:--.-'
  const tenths = Math.round(seconds * 10)
  const h = Math.floor(tenths / 36000)
  const m = Math.floor((tenths % 36000) / 600)
  const s = (tenths % 600) / 10
  const mm = String(m).padStart(2, '0')
  const ss = s.toFixed(1).padStart(4, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
