import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isTextToSpeech, speakChinese, stopSpeaking, textOf } from '@/lib/speech'

interface ListenPlayerProps {
  /** An audio file URL, or `tts:<text>` to read the text aloud. */
  audioUrl: string
}

const BARS = [10, 22, 30, 16, 26, 12, 28, 20, 32, 14, 24, 18, 30, 10, 22, 16, 28, 12, 24, 18]

export function ListenPlayer({ audioUrl }: ListenPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = () => {
    stopSpeaking()
    audioRef.current?.pause()
    setPlaying(false)
  }

  useEffect(() => stop, [audioUrl])

  const play = () => {
    stop()
    setFailed(false)
    setPlaying(true)
    const done = () => setPlaying(false)
    const fail = () => {
      setPlaying(false)
      setFailed(true)
    }
    if (isTextToSpeech(audioUrl)) {
      if (!speakChinese(textOf(audioUrl), done, fail)) fail()
      return
    }
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.onended = done
    audio.onerror = fail
    audio.play().catch(fail)
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-blue-50 px-4 py-4" role="group" aria-label="Phát âm thanh">
      <button
        type="button"
        onClick={playing ? stop : play}
        aria-label={playing ? 'Tạm dừng' : 'Phát'}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
      >
        {playing ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
      </button>
      <div className="flex h-8 min-w-0 flex-1 items-center gap-[3px] overflow-hidden" aria-hidden="true">
        {BARS.map((height, index) => (
          <i
            key={index}
            style={{ height, animationDelay: `${(index % 3) * 0.15}s` }}
            className={cn('w-1 rounded-sm not-italic', playing ? 'animate-pulse bg-blue-700' : 'bg-blue-300')}
          />
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="max-sm:h-11 gap-1.5 rounded-xl" onClick={play}>
        <RotateCcw className="h-4 w-4" />
        Nghe lại
      </Button>
      {failed && (
        <p role="alert" className="basis-full text-sm text-red-700">
          Trình duyệt chưa phát được âm thanh. Hãy bật loa hoặc thử trình duyệt khác.
        </p>
      )}
    </div>
  )
}
