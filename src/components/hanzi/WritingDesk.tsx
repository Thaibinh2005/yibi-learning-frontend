import React, { useEffect, useRef, useState } from 'react'
import { Brush, Eye, PenLine, RotateCcw, Sparkles } from 'lucide-react'
import { rateWriting } from '@/api/hanziApi'
import { ratingFromMistakes } from '@/lib/pinyinTools'
import { useAppSelector } from '@/app/hooks'
import { AudioButton } from '@/components/ui/AudioButton'
import type { WritingMode } from '@/types/hanzi'
import { StrokeWriter } from './StrokeWriter'
import type { StrokeWriterHandle } from './StrokeWriter'

export interface DeskTarget {
  char: string
  /** A radical is practised but never sent to the review queue. */
  kind: 'radical' | 'hanzi'
  pinyin?: string
  caption?: string
  /** The form this radical takes inside other characters. */
  alt?: string
}

interface Props {
  target: DeskTarget | null
  onWritten: (target: DeskTarget) => void
  onPickAlt?: (char: string) => void
}

const MODES: Array<{ mode: WritingMode; label: string; icon: typeof Eye }> = [
  { mode: 'view', label: 'Xem', icon: Eye },
  { mode: 'trace', label: 'Đồ nét', icon: Brush },
  { mode: 'quiz', label: 'Tự viết', icon: PenLine },
]

type Notice = { tone: 'ok' | 'warn'; text: string } | null

/** The writing desk: one board, three modes, and the feedback of the last run. */
export const WritingDesk: React.FC<Props> = ({ target, onWritten, onPickAlt }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const writer = useRef<StrokeWriterHandle>(null)
  const [mode, setMode] = useState<WritingMode>('view')
  const [progress, setProgress] = useState<[number, number]>([0, 0])
  const [notice, setNotice] = useState<Notice>(null)
  const hints = useRef(0)
  const current = useRef<string | null>(null)

  // A new character starts clean: no old message, no hints counted against it.
  useEffect(() => {
    current.current = target?.char ?? null
    setNotice(null)
    setProgress([0, 0])
    hints.current = 0
  }, [target?.char])

  if (!target) {
    return (
      <div className="grid place-items-center gap-2 py-10 text-center">
        <span className="font-chinese text-7xl text-slate-200">字</span>
        <p className="max-w-[24ch] text-sm leading-relaxed text-slate-500">Chọn một bộ hoặc một chữ để bắt đầu</p>
      </div>
    )
  }

  const finish = async (strokeMistakes: number) => {
    // Each hint counts as a mistake, so a character written with help is not rated as easy.
    const mistakes = strokeMistakes + hints.current
    const written = target.char
    if (target.kind === 'radical') {
      onWritten(target)
      setNotice({ tone: 'ok', text: mistakes === 0 ? 'Chính xác. Bộ này đã được đánh dấu là đã học.' : `Xong, sai ${mistakes} nét. Bộ này đã được đánh dấu là đã học.` })
      return
    }
    if (!isAuthenticated) {
      setNotice({ tone: 'warn', text: 'Đăng nhập để lưu chữ cần ôn.' })
      return
    }
    try {
      await rateWriting(written, ratingFromMistakes(mistakes))
      if (current.current !== written) return
      onWritten(target)
      setNotice({ tone: 'ok', text: mistakes === 0 ? 'Chính xác. Đã lưu vào lịch ôn.' : `Sai hoặc cần gợi ý ${mistakes} lần. Đã lưu vào lịch ôn.` })
    } catch (error) {
      if (current.current !== written) return
      const notHsk = typeof error === 'object' && error !== null && (error as { response?: { status?: number } }).response?.status === 400
      setNotice({ tone: 'warn', text: notHsk ? 'Chữ này không thuộc danh sách chữ viết HSK nên không đưa vào lịch ôn.' : 'Chưa lưu được vào lịch ôn. Bạn vẫn có thể viết tiếp.' })
    }
  }

  const changeMode = (next: WritingMode) => {
    setMode(next)
    setNotice(null)
    setProgress([0, 0])
    hints.current = 0
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className="font-chinese text-4xl leading-tight text-slate-900">{target.char}</span>
        {target.pinyin && <span className="text-xl font-extrabold leading-snug text-brand">{target.pinyin}</span>}
        <AudioButton text={target.char} size="lg" title={`Nghe chữ ${target.char}`} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm text-slate-500">{target.caption}</span>
      </div>

      {target.alt && onPickAlt && (
        <p className="text-sm text-slate-500">
          Dạng trong chữ khác:{' '}
          <button type="button" onClick={() => onPickAlt(target.alt as string)} className="font-chinese rounded-lg px-1.5 text-lg text-slate-800 underline decoration-slate-300 underline-offset-4 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300">{target.alt}</button>
        </p>
      )}

      <div className="relative">
        <StrokeWriter
          key={target.char}
          ref={writer}
          char={target.char}
          mode={mode}
          onProgress={(done, total) => {
            setProgress([done, total])
            if (mode === 'trace' && total > 0 && done === total) setNotice({ tone: 'ok', text: 'Xong, bạn đã đồ hết các nét.' })
          }}
          onQuizComplete={({ mistakes }) => void finish(mistakes)}
          onMissingData={() => setNotice({ tone: 'warn', text: 'Chữ này chưa có hình nét nên chưa luyện viết được.' })}
        />
        {progress[1] > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-extrabold tabular-nums text-brand">
            {mode === 'view' ? `${progress[1]} nét` : `Nét ${Math.min(progress[0] + 1, progress[1])} / ${progress[1]}`}
          </span>
        )}
      </div>

      <div className="flex justify-center">
        <div className="inline-flex gap-1 rounded-2xl bg-slate-100 p-1" role="group" aria-label="Chế độ">
          {MODES.map(({ mode: value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => changeMode(value)}
              className={`inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                mode === value ? 'bg-white text-brand shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => { setNotice(null); hints.current = 0; writer.current?.restart() }} className="btn-chunky btn-paper px-4 py-2 text-sm">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />Viết lại
        </button>
        <button type="button" onClick={() => { if (mode === 'quiz') hints.current += 1; writer.current?.hint() }} disabled={mode === 'view'} className="btn-chunky btn-brand px-4 py-2 text-sm">
          <Sparkles className="h-4 w-4" aria-hidden="true" />Gợi ý nét
        </button>
      </div>

      <p aria-live="polite" className={`min-h-5 text-center text-sm leading-relaxed ${notice?.tone === 'ok' ? 'font-bold text-emerald-700' : 'text-slate-500'}`}>
        {notice?.text ?? (mode === 'quiz' ? 'Viết theo bút thuận, nét sai sẽ bị đánh dấu.' : mode === 'trace' ? 'Đồ theo nét mờ, không tính điểm.' : '')}
      </p>
    </div>
  )
}
