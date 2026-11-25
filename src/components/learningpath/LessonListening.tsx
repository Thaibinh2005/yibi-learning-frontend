import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Lock, Pause, Play, RotateCcw } from 'lucide-react'
import { stopSpeaking } from '@/lib/speech'
import { cn } from '@/lib/utils'
import type { Vocabulary } from '@/types/vocabulary'
import { AudioButton } from '@/components/ui/AudioButton'
import { ListeningDictation } from './ListeningDictation'
import { QuestionList } from './QuestionList'
import { WordSaveCard } from './WordSaveCard'
import { evidenceOf, sentencesOf, text, tokenize, useLevelLookup, type Item } from './readingText'

const RATES = [0.75, 1] as const

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

interface PlayerProps {
  title: string
  src: string
  transcript: string
}

/** Audio player for one passage: play, seek, replay, slow speed. Without a recording it reads the text with the browser's voice. */
const ListeningPlayer: React.FC<PlayerProps> = ({ title, src, transcript }) => {
  const audio = useRef<HTMLAudioElement>(null)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState<number>(1)
  const [plays, setPlays] = useState(0)
  const voice = !src || failed

  useEffect(() => () => stopSpeaking(), [])

  const speak = (speed: number) => {
    if (!('speechSynthesis' in window)) { setFailed(true); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(transcript)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85 * speed
    utterance.onend = () => { setPlaying(false); setPlays((value) => value + 1) }
    utterance.onerror = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }

  const toggle = () => {
    if (voice) {
      if (playing) { stopSpeaking(); setPlaying(false) } else speak(rate)
      return
    }
    const element = audio.current
    if (!element) return
    if (playing) element.pause()
    else element.play().catch(() => setFailed(true))
  }

  const replay = () => {
    if (voice) { speak(rate); return }
    const element = audio.current
    if (!element) return
    element.currentTime = 0
    element.play().catch(() => setFailed(true))
  }

  const changeRate = (next: number) => {
    setRate(next)
    if (audio.current) audio.current.playbackRate = next
    if (voice && playing) speak(next)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
      <p className="text-sm font-bold text-foreground">{title}</p>
      {!voice && (
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setPlays((value) => value + 1) }}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); event.currentTarget.playbackRate = rate }}
          onError={() => setFailed(true)}
        />
      )}
      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={toggle} aria-label={playing ? 'Tạm dừng' : 'Nghe'} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white hover:bg-brand-dark">
          {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
        </button>
        {voice ? (
          <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">Bài này chưa có bản ghi âm, nên máy đọc thay. Giọng máy có thể khác giọng chuẩn.</p>
        ) : (
          <div className="min-w-0 flex-1">
            <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(time, duration || 1)} onChange={(event) => { if (audio.current) audio.current.currentTime = Number(event.target.value) }} aria-label="Tua đoạn nghe" className="w-full accent-[#C8322B]" />
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>{clock(time)}</span><span>{duration ? clock(duration) : '--:--'}</span></div>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={replay} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Nghe lại</button>
          <div className="inline-flex rounded-full border border-border p-0.5" role="group" aria-label="Tốc độ nghe">
            {RATES.map((value) => (
              <button key={value} type="button" aria-pressed={rate === value} onClick={() => changeRate(value)} className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', rate === value ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted')}>{String(value).replace('.', ',')}×</button>
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground" aria-live="polite">Đã nghe {plays} lần</span>
      </div>
    </div>
  )
}

interface Props {
  listenings: Item[]
  questions: Item[]
  hskLevel: number
}

/** A listening lesson: hear the passage first, answer, then open the text with pinyin and translation and tap words to save. */
export const LessonListening: React.FC<Props> = ({ listenings, questions, hskLevel }) => {
  const lookup = useLevelLookup(hskLevel)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [skipped, setSkipped] = useState(false)
  const [round, setRound] = useState(0)
  const [focus, setFocus] = useState(-1)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const [activeWord, setActiveWord] = useState<Vocabulary | null>(null)
  const marked = useRef<HTMLParagraphElement | null>(null)

  const passages = useMemo(() => listenings.map((item) => {
    const zh = sentencesOf(text(item.transcript))
    const py = sentencesOf(text(item.pinyin))
    const vi = sentencesOf(text(item.translation_vi))
    return { title: text(item.title), src: text(item.audio_url), transcript: text(item.transcript), zh, py: py.length === zh.length ? py : null, vi: vi.length === zh.length ? vi : null, rawPy: text(item.pinyin), rawVi: text(item.translation_vi) }
  }), [listenings])

  const allSentences = useMemo(() => passages.flatMap((passage) => passage.zh), [passages])
  const starts = passages.map((_, index) => passages.slice(0, index).reduce((sum, passage) => sum + passage.zh.length, 0))
  const answered = Object.keys(answers).length
  const revealed = skipped || (questions.length > 0 && answered === questions.length)

  useEffect(() => { if (revealed) marked.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [focus, revealed])

  const answer = (index: number, option: string) => {
    setAnswers((current) => ({ ...current, [index]: option }))
    setFocus(evidenceOf(text(questions[index].explanation), allSentences))
  }
  const reset = () => { setAnswers({}); setSkipped(false); setFocus(-1); setActiveWord(null); setRound((value) => value + 1) }

  return (
    <div className="space-y-4">
      <div className="sticky top-20 z-10 space-y-2 bg-white/95 pb-2 backdrop-blur">
        {passages.map((passage, index) => <ListeningPlayer key={`${round}-${index}`} title={passage.title || 'Đoạn nghe'} src={passage.src} transcript={passage.transcript} />)}
      </div>

      <QuestionList questions={questions} answers={answers} onAnswer={answer} onReset={reset} round={round} sentences={allSentences} showExplanation={revealed} onShowEvidence={setFocus} retryHint="Nghe lại, rồi xem câu được tô vàng trong văn bản." />

      {revealed ? (
        <section aria-label="Văn bản bài nghe" className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-foreground">Văn bản của bài nghe</h4>
            <div className="flex gap-1.5" role="group" aria-label="Lớp hiển thị của văn bản">
              {([['Pinyin', showPinyin, setShowPinyin], ['Bản dịch', showTranslation, setShowTranslation]] as const).map(([label, on, set]) => (
                <button key={label} type="button" aria-pressed={on} onClick={() => set(!on)} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold', on ? 'border-brand bg-brand text-white' : 'border-border text-muted-foreground hover:bg-muted')}>{label}</button>
              ))}
            </div>
          </div>
          {passages.map((passage, passageIndex) => (
            <div key={passageIndex} className="space-y-2">
              {passages.length > 1 && <p className="text-xs font-semibold text-muted-foreground">{passage.title}</p>}
              {passage.zh.map((sentence, index) => {
                const isFocus = starts[passageIndex] + index === focus
                return (
                  <div key={index} className={cn('rounded-lg px-2 py-1.5 transition-colors', isFocus && 'bg-amber-100 ring-1 ring-amber-300')}>
                    <div className="flex items-start gap-2">
                      <AudioButton text={sentence} size="sm" title="Nghe câu này (giọng máy)" className="mt-1.5 shrink-0" />
                      <p ref={isFocus ? marked : undefined} className="font-chinese min-w-0 text-xl leading-loose text-foreground">
                        {tokenize(sentence, lookup).map((token, tokenIndex) => token.word
                          ? <button key={tokenIndex} type="button" onClick={() => setActiveWord(token.word)} className={cn('rounded px-px underline decoration-dotted decoration-slate-300 underline-offset-4 hover:bg-brand/10', activeWord === token.word && 'bg-brand/10')}>{token.text}</button>
                          : <span key={tokenIndex}>{token.text}</span>)}
                      </p>
                    </div>
                    {showPinyin && passage.py && <p className="ml-9 text-sm leading-relaxed text-brand">{passage.py[index]}</p>}
                    {showTranslation && passage.vi && <p className="ml-9 text-sm leading-relaxed text-muted-foreground">{passage.vi[index]}</p>}
                  </div>
                )
              })}
              {showPinyin && !passage.py && passage.rawPy && <p className="text-sm leading-relaxed text-brand">{passage.rawPy}</p>}
              {showTranslation && !passage.vi && passage.rawVi && <p className="text-sm leading-relaxed text-muted-foreground">{passage.rawVi}</p>}
            </div>
          ))}
          <div aria-live="polite" className="min-h-[2.5rem]">
            {activeWord
              ? <WordSaveCard key={activeWord.id} word={activeWord} onClose={() => setActiveWord(null)} deckHint="Bài nghe 1" />
              : <p className="text-xs leading-snug text-muted-foreground">Bấm vào từ nào nghe chưa ra để xem nghĩa và lưu vào flashcard.</p>}
          </div>
          <ListeningDictation key={round} sentences={passages.flatMap((passage) => passage.zh.map((zh, index) => ({ zh, py: passage.py ? passage.py[index] : null })))} />
        </section>
      ) : (
        <section aria-label="Văn bản bài nghe" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4 shrink-0" aria-hidden="true" />{questions.length > 0 ? 'Văn bản sẽ mở sau khi bạn trả lời hết các câu hỏi.' : 'Nghe trước, rồi mới xem văn bản.'}</p>
          <button type="button" onClick={() => setSkipped(true)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted">{questions.length > 0 ? 'Bỏ qua, cho tôi xem' : 'Xem văn bản'}</button>
        </section>
      )}
    </div>
  )
}
