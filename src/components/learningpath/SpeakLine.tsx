import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, LoaderCircle, Mic, RotateCcw, Square } from 'lucide-react'
import type { PathContentItem, SpeakingResult } from '@/api/learningPathApi'
import { AudioButton } from '@/components/ui/AudioButton'
import { createRecognition, matchedCharacters } from '@/lib/speechMatch'
import { speakChinese } from '@/lib/speech'
import { RecordingPlayer } from './RecordingPlayer'

type Phase = 'idle' | 'listening' | 'scoring' | 'done' | 'denied' | 'failed'
type Character = { han: string; pinyin: string }

const MAX_SECONDS = 20
// The turn ends by itself after this much quiet once the learner has spoken.
const QUIET_MS = 1500
const MIN_SPEECH_MS = 300
const LIVE_BROKEN_KEY = 'yibi-live-speech-broken'
const isHan = (character: string) => /\p{Script=Han}/u.test(character)
const textOf = (value: unknown) => (typeof value === 'string' ? value : '')

const charactersOf = (line: PathContentItem): Character[] => {
  const given = (line as { chars?: unknown }).chars
  if (Array.isArray(given) && given.length > 0) return given.map((c) => ({ han: textOf((c as Character).han), pinyin: textOf((c as Character).pinyin) }))
  return [...textOf(line.zh)].map((han) => ({ han, pinyin: '' }))
}

/**
 * Read a sentence aloud, Duolingo style: each character has its pinyin, turns green as soon as it is heard right
 * (where the browser recognizes speech live), and after the check the ones still wrong turn red, to be heard and read again.
 * The server's check decides the result, so it is the same in every browser.
 */
export const SpeakLine: React.FC<{
  line: PathContentItem
  lineIndex: number
  speak: (lineIndex: number, audio: Blob) => Promise<SpeakingResult>
  onDone: () => void
}> = ({ line, lineIndex, speak, onDone }) => {
  const characters = charactersOf(line)
  const sentence = characters.map((c) => c.han)
  const [phase, setPhase] = useState<Phase>('idle')
  const [live, setLive] = useState<boolean[]>(() => sentence.map(() => false))
  const [result, setResult] = useState<SpeakingResult | null>(null)
  const [recorded, setRecorded] = useState<Blob | null>(null)
  const [seconds, setSeconds] = useState(0)
  // Some Chromium browsers (Cốc Cốc, Brave...) have the recognizer but no service behind it; it then fails at once.
  const [liveAvailable, setLiveAvailable] = useState(() => createRecognition() !== null && sessionStorage.getItem(LIVE_BROKEN_KEY) !== '1')
  const media = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const recognition = useRef<ReturnType<typeof createRecognition>>(null)
  const timer = useRef<number | undefined>(undefined)
  const quietWatch = useRef<{ context: AudioContext; frame: number } | null>(null)

  const release = () => {
    window.clearInterval(timer.current)
    if (quietWatch.current) {
      cancelAnimationFrame(quietWatch.current.frame)
      quietWatch.current.context.close().catch(() => undefined)
      quietWatch.current = null
    }
    recognition.current?.abort()
    recognition.current = null
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
  }
  useEffect(() => release, [])

  const stop = () => {
    recognition.current?.stop()
    if (media.current && media.current.state !== 'inactive') media.current.stop()
  }

  useEffect(() => {
    if (phase === 'listening' && seconds >= MAX_SECONDS) stop()
  }, [phase, seconds])

  const start = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setPhase('denied')
      return
    }
    const chunks: Blob[] = []
    const recorder = new MediaRecorder(stream.current)
    media.current = recorder
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
    recorder.onstop = async () => {
      release()
      const audio = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      setRecorded(audio)
      setPhase('scoring')
      try {
        setResult(await speak(lineIndex, audio))
        setPhase('done')
      } catch {
        setPhase('failed')
      }
    }
    recorder.start()
    watchForQuiet(stream.current, recorder)

    // Live colouring only: green as each character is heard. It may end the turn only after it really heard words;
    // a recognizer that fails or hears nothing must never cut the recording short.
    const live = liveAvailable ? createRecognition() : null
    if (live) {
      recognition.current = live
      let heardWords = false
      live.onresult = (event) => {
        const heard = Array.from(event.results).map((r) => r[0]?.transcript ?? '').join('')
        if (heard.trim()) heardWords = true
        setLive(matchedCharacters(sentence, heard))
      }
      live.onerror = () => {
        if (!heardWords) {
          sessionStorage.setItem(LIVE_BROKEN_KEY, '1')
          setLiveAvailable(false)
        }
      }
      const begun = performance.now()
      live.onend = () => {
        recognition.current = null
        if (heardWords && recorder.state !== 'inactive') recorder.stop()
        // Ended at once without a word: there is no recognizer behind it in this browser.
        else if (!heardWords && performance.now() - begun < 2000) {
          sessionStorage.setItem(LIVE_BROKEN_KEY, '1')
          setLiveAvailable(false)
        }
      }
      try {
        live.start()
      } catch {
        recognition.current = null
      }
    }
    setLive(sentence.map(() => false))
    setResult(null)
    setSeconds(0)
    setPhase('listening')
    timer.current = window.setInterval(() => setSeconds((value) => value + 1), 1000)
  }

  /** Ends the turn after a pause that follows speech, measured on the microphone itself, so it works in every browser. */
  const watchForQuiet = (source: MediaStream, recorder: MediaRecorder) => {
    try {
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      analyser.fftSize = 1024
      context.createMediaStreamSource(source).connect(analyser)
      const samples = new Float32Array(analyser.fftSize)
      let loudSince = 0
      let spoke = false
      let quietSince = 0
      const check = () => {
        if (recorder.state === 'inactive') return
        analyser.getFloatTimeDomainData(samples)
        let sum = 0
        for (const value of samples) sum += value * value
        const loud = Math.sqrt(sum / samples.length) > 0.02
        const now = performance.now()
        if (loud) {
          quietSince = 0
          if (!loudSince) loudSince = now
          if (now - loudSince > MIN_SPEECH_MS) spoke = true
        } else {
          loudSince = 0
          if (!quietSince) quietSince = now
          if (spoke && now - quietSince > QUIET_MS) {
            recognition.current?.stop()
            recorder.stop()
            return
          }
        }
        if (quietWatch.current) quietWatch.current.frame = requestAnimationFrame(check)
      }
      quietWatch.current = { context, frame: requestAnimationFrame(check) }
    } catch {
      // Without Web Audio the learner stops by hand, or the time limit does.
    }
  }

  const markOf = (index: number): 'ok' | 'bad' | 'none' => {
    if (!isHan(sentence[index])) return 'none'
    if (phase === 'done' && result?.marks) return result.marks[index]?.mark === 'ok' ? 'ok' : 'bad'
    if (phase === 'listening' || phase === 'scoring') return live[index] ? 'ok' : 'none'
    return 'none'
  }
  const wrong = phase === 'done' && result?.marks ? result.marks.filter((m) => m.mark === 'bad').length : 0

  return (
    <div className="animate-fade-up space-y-5">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800"><Mic className="h-3.5 w-3.5" />Đọc to câu này</p>

      <div className="rounded-3xl bg-white p-5 shadow-xs ring-1 ring-slate-200/80 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="flex flex-wrap items-end gap-x-1 gap-y-3" aria-label={textOf(line.zh)}>
            {characters.map((c, index) => {
              const mark = markOf(index)
              const spoken = isHan(c.han)
              return (
                <button
                  key={index}
                  type="button"
                  disabled={!spoken}
                  onClick={() => speakChinese(c.han, () => undefined, () => undefined)}
                  title={spoken ? 'Nghe chữ này' : undefined}
                  className={`flex flex-col items-center rounded-lg px-0.5 transition-colors duration-300 ${spoken ? 'hover:bg-slate-100' : 'cursor-default'} ${mark === 'bad' ? 'bg-rose-50' : ''}`}
                >
                  <span className={`min-h-4 text-xs font-semibold ${mark === 'ok' ? 'text-emerald-600' : mark === 'bad' ? 'text-rose-600' : 'text-slate-500'}`}>{c.pinyin}</span>
                  <span className={`font-chinese text-3xl font-bold leading-tight ${mark === 'ok' ? 'text-emerald-600' : mark === 'bad' ? 'text-rose-600 underline decoration-2 underline-offset-4' : spoken ? 'text-slate-900' : 'text-slate-400'}`} data-mark={mark}>{c.han}</span>
                </button>
              )
            })}
          </p>
          <AudioButton text={textOf(line.zh)} size="lg" title="Nghe cả câu" className="shrink-0" />
        </div>
        <p className="mt-3 text-sm text-slate-500">{textOf(line.vi)}</p>
      </div>

      {phase === 'done' && result ? (
        <div className={`animate-pop rounded-3xl p-5 ${result.passed ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`} role="status">
          <p className="text-3xl font-extrabold tabular-nums">{Math.round(result.accuracy * 100)}%</p>
          <p className="mt-1 text-sm font-semibold">
            {result.passed && wrong === 0 ? 'Tuyệt vời, đọc đúng hết!' : result.passed ? 'Tốt lắm! Vẫn còn vài chữ màu đỏ, bấm vào để nghe lại.' : 'Những chữ màu đỏ chưa đúng. Bấm vào từng chữ để nghe, rồi đọc lại cả câu.'}
          </p>
          {result.heard && <p className="font-chinese mt-1 text-xs opacity-80">Máy nghe được: {result.heard}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <RecordingPlayer key={recorded ? recorded.size : 0} blob={recorded} />
            <span className="flex-1" />
            {(!result.passed || wrong > 0) && <button type="button" onClick={start} className="btn-chunky btn-paper"><RotateCcw className="h-4 w-4" />Đọc lại</button>}
            <button type="button" onClick={onDone} className="btn-chunky btn-brand">Tiếp tục<ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-amber-50/60 px-5 py-6 text-center ring-1 ring-amber-100">
          {phase === 'scoring' ? (
            <p className="flex items-center gap-2 text-sm font-bold text-slate-700" aria-busy="true"><LoaderCircle className="h-5 w-5 animate-spin" />Đang chấm...</p>
          ) : (
            <>
              <button
                type="button"
                onClick={phase === 'listening' ? stop : start}
                aria-label={phase === 'listening' ? 'Dừng ghi âm' : 'Bắt đầu nói'}
                className={`relative grid h-20 w-20 place-items-center rounded-full text-white shadow-[0_5px_0_#8C1F1A] transition active:translate-y-1 active:shadow-none ${phase === 'listening' ? 'bg-rose-600' : 'bg-brand'}`}
              >
                {phase === 'listening' && <span className="absolute -inset-2 animate-ping rounded-full ring-2 ring-rose-400/50 motion-reduce:animate-none" />}
                {phase === 'listening' ? <Square className="h-7 w-7 fill-current" /> : <Mic className="h-8 w-8" />}
              </button>
              <p className="text-sm font-bold text-slate-700">
                {phase === 'listening' ? (liveAvailable ? 'Đang nghe... chữ đúng sẽ chuyển xanh' : 'Đang nghe... đọc xong thì dừng một chút, hoặc nhấn để dừng') : 'Nhấn micro rồi đọc cả câu'}
              </p>
              {phase === 'listening' && <p className="text-xs tabular-nums text-slate-500">{seconds}s / {MAX_SECONDS}s</p>}
              {phase === 'denied' && <p role="alert" className="text-sm text-rose-700">Trình duyệt chưa cho dùng micro. Nhấn biểu tượng ổ khóa cạnh địa chỉ trang, bật Micro rồi thử lại.</p>}
              {phase === 'failed' && <p role="alert" className="text-sm text-rose-700">Chưa chấm được. Dịch vụ chấm phát âm đang bận, hãy đọc lại hoặc bỏ qua câu này.</p>}
              <p className="text-xs text-slate-500">
                {liveAvailable ? 'Chữ chuyển màu ngay nhờ nhận dạng giọng nói của trình duyệt, nên âm thanh có thể được gửi tới nhà cung cấp trình duyệt. ' : ''}
                Bản ghi chỉ dùng để chấm, không được lưu lại.
              </p>
              <button type="button" onClick={onDone} className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline">Không nói được lúc này</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
