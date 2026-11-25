import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, PenLine } from 'lucide-react'
import { AudioButton } from '@/components/ui/AudioButton'
import { cn } from '@/lib/utils'

const CJK = /[一-鿿]/

export interface DictationSentence {
  zh: string
  /** Pinyin of the same sentence, when the book gives it sentence by sentence. */
  py: string | null
}

/** Which units of `target` are matched in order by `input` (longest common subsequence), so one slip does not shift the rest. */
const matchedUnits = (target: string[], input: string[]): boolean[] => {
  const rows = target.length + 1
  const cols = input.length + 1
  const table = Array.from({ length: rows }, () => new Array<number>(cols).fill(0))
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      table[i][j] = target[i - 1] === input[j - 1] ? table[i - 1][j - 1] + 1 : Math.max(table[i - 1][j], table[i][j - 1])
    }
  }
  const marks = new Array<boolean>(target.length).fill(false)
  for (let i = rows - 1, j = cols - 1; i > 0 && j > 0;) {
    if (target[i - 1] === input[j - 1]) { marks[i - 1] = true; i -= 1; j -= 1 } else if (table[i - 1][j] >= table[i][j - 1]) i -= 1
    else j -= 1
  }
  return marks
}

/** Letters of pinyin without tone marks, so learners can type without a tone keyboard (v stands for ü). */
const letters = (value: string) => Array.from(value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/v/g, 'u')).filter((char) => /[a-z]/.test(char))

type Graded = { ok: boolean; text: string }[]
interface Result { mode: 'hanzi' | 'pinyin'; units: Graded; percent: number }

const grade = (sentence: DictationSentence, input: string): Result | null => {
  if (CJK.test(input)) {
    const target = Array.from(sentence.zh)
    const marks = matchedUnits(target.filter((char) => CJK.test(char)), Array.from(input).filter((char) => CJK.test(char)))
    let next = 0
    const units = target.map((char) => ({ text: char, ok: CJK.test(char) ? marks[next++] : true }))
    return { mode: 'hanzi', units, percent: Math.round((marks.filter(Boolean).length / Math.max(1, marks.length)) * 100) }
  }
  if (!sentence.py) return null
  const syllables = sentence.py.split(/\s+/).filter((part) => letters(part).length > 0)
  const flat = syllables.flatMap((syllable, index) => letters(syllable).map((char) => ({ char, index })))
  const marks = matchedUnits(flat.map((unit) => unit.char), letters(input))
  const units = syllables.map((syllable, index) => ({ text: syllable, ok: flat.every((unit, position) => unit.index !== index || marks[position]) }))
  return { mode: 'pinyin', units, percent: Math.round((marks.filter(Boolean).length / Math.max(1, marks.length)) * 100) }
}

interface Props {
  sentences: DictationSentence[]
}

/** Optional dictation after the review: hear one sentence, type it as Hanzi or pinyin, and see which words were right. */
export const ListeningDictation: React.FC<Props> = ({ sentences }) => {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result | 'nopinyin' | null>(null)
  const sentence = sentences[index]
  if (sentences.length === 0) return null

  const go = (next: number) => { setIndex(next); setInput(''); setResult(null) }
  const check = () => {
    const graded = grade(sentence, input)
    setResult(graded ?? 'nopinyin')
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
        <PenLine className="h-4 w-4" aria-hidden="true" />Luyện chép chính tả <span className="text-xs font-normal text-muted-foreground">(tùy chọn)</span>
      </button>
    )
  }

  return (
    <section aria-label="Chép chính tả" className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-foreground">Chép chính tả</h4>
        <button type="button" onClick={() => setOpen(false)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Đóng</button>
      </div>
      <p className="text-xs leading-snug text-muted-foreground">Nghe một câu rồi gõ lại bằng chữ Hán hoặc pinyin. Pinyin không cần gõ dấu thanh. Câu được đọc bằng giọng máy.</p>

      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Câu trước" className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
        <div className="flex items-center gap-2"><span className="text-sm font-semibold text-foreground">Câu {index + 1}/{sentences.length}</span><AudioButton key={index} text={sentence.zh} size="md" title="Nghe câu này" /></div>
        <button type="button" onClick={() => go(index + 1)} disabled={index === sentences.length - 1} aria-label="Câu sau" className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); if (input.trim()) check() }} className="flex gap-2">
        <input value={input} onChange={(event) => { setInput(event.target.value); setResult(null) }} lang="zh" placeholder="Gõ chữ Hán hoặc pinyin" aria-label="Câu bạn nghe được" autoComplete="off" className="font-chinese min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-brand" />
        <button type="submit" disabled={!input.trim()} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Kiểm tra</button>
      </form>

      {result === 'nopinyin' && <p role="alert" className="text-xs text-rose-700">Câu này chưa có pinyin để chấm. Hãy gõ chữ Hán.</p>}
      {result && result !== 'nopinyin' && (
        <div role="status" className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-bold text-foreground">{result.percent === 100 ? 'Chính xác hoàn toàn!' : `Đúng ${result.percent}%`}</p>
          <p className={cn('mt-1 leading-loose', result.mode === 'hanzi' ? 'font-chinese text-xl' : 'text-base')}>
            {result.units.map((unit, position) => <span key={position} className={cn(unit.ok ? 'text-emerald-700' : 'rounded bg-rose-100 px-0.5 text-rose-700', result.mode === 'pinyin' && 'mr-1.5')}>{unit.text}</span>)}
          </p>
          {result.percent < 100 && <p className="mt-1 text-xs text-muted-foreground">Phần màu đỏ là chỗ chưa khớp. Nghe lại rồi thử tiếp.</p>}
        </div>
      )}
    </section>
  )
}
