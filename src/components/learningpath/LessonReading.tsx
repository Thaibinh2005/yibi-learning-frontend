import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AudioButton } from '@/components/ui/AudioButton'
import { cn } from '@/lib/utils'
import type { Vocabulary } from '@/types/vocabulary'
import { QuestionList } from './QuestionList'
import { WordSaveCard } from './WordSaveCard'
import { evidenceOf, sentencesOf, text, tokenize, useLevelLookup, type Item } from './readingText'

interface Props {
  readings: Item[]
  questions: Item[]
  hskLevel: number
}

/** A reading passage you can listen to, layer with pinyin and translation, and tap for words, beside its questions. */
export const LessonReading: React.FC<Props> = ({ readings, questions, hskLevel }) => {
  const lookup = useLevelLookup(hskLevel)
  const [showPinyin, setShowPinyin] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [hideHanzi, setHideHanzi] = useState(false)
  const [activeWord, setActiveWord] = useState<Vocabulary | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [focus, setFocus] = useState(-1)
  const [round, setRound] = useState(0)
  const marked = useRef<HTMLParagraphElement | null>(null)

  const passages = useMemo(() => readings.map((reading) => {
    const zh = sentencesOf(text(reading.text))
    const py = sentencesOf(text(reading.pinyin))
    const vi = sentencesOf(text(reading.translation_vi))
    return { title: text(reading.title), zh, py: py.length === zh.length ? py : null, vi: vi.length === zh.length ? vi : null, rawPy: text(reading.pinyin), rawVi: text(reading.translation_vi) }
  }), [readings])

  const allSentences = useMemo(() => passages.flatMap((passage) => passage.zh), [passages])

  useEffect(() => { marked.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [focus])

  const answer = (index: number, option: string) => {
    setAnswers((current) => ({ ...current, [index]: option }))
    setFocus(evidenceOf(text(questions[index].explanation), allSentences))
  }
  const reset = () => { setAnswers({}); setFocus(-1); setRound((value) => value + 1) }

  const toggles = [
    ['Pinyin', showPinyin, setShowPinyin],
    ['Bản dịch', showTranslation, setShowTranslation],
    ['Ẩn chữ Hán', hideHanzi, setHideHanzi],
  ] as const

  const starts = passages.map((_, index) => passages.slice(0, index).reduce((sum, passage) => sum + passage.zh.length, 0))
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-3 xl:sticky xl:top-20 xl:self-start">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lớp hiển thị của đoạn văn">
          {toggles.map(([label, on, set]) => (
            <button key={label} type="button" aria-pressed={on} onClick={() => set(!on)} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold', on ? 'border-brand bg-brand text-white' : 'border-border text-muted-foreground hover:bg-muted')}>{label}</button>
          ))}
        </div>

        {passages.map((passage, passageIndex) => {
          const start = starts[passageIndex]
          return (
            <article key={passageIndex} className="rounded-xl border border-border bg-muted/40 p-4">
              {passage.title && <h4 className="text-sm font-bold text-foreground">{passage.title}</h4>}
              <div className="mt-2 space-y-2.5">
                {passage.zh.map((sentence, index) => {
                  const isFocus = start + index === focus
                  return (
                    <div key={index} className={cn('rounded-lg px-2 py-1.5 transition-colors', isFocus && 'bg-amber-100 ring-1 ring-amber-300')}>
                      <div className="flex items-start gap-2">
                        <AudioButton text={sentence} size="sm" title="Nghe câu này" className="mt-1 shrink-0" />
                        <p ref={isFocus ? marked : undefined} className={cn('font-chinese min-w-0 text-xl leading-loose text-foreground transition', hideHanzi && 'select-none blur-sm')} aria-hidden={hideHanzi}>
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
              </div>
              {showPinyin && !passage.py && passage.rawPy && <p className="mt-2 text-sm leading-relaxed text-brand">{passage.rawPy}</p>}
              {showTranslation && !passage.vi && passage.rawVi && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{passage.rawVi}</p>}
            </article>
          )
        })}

        <div aria-live="polite" className="min-h-[3.5rem]">
          {activeWord
            ? <WordSaveCard key={activeWord.id} word={activeWord} onClose={() => setActiveWord(null)} />
            : <p className="text-xs leading-snug text-muted-foreground">Bấm vào một từ gạch chân để xem pinyin và nghĩa.</p>}
        </div>
      </div>

      <QuestionList questions={questions} answers={answers} onAnswer={answer} onReset={reset} round={round} sentences={allSentences} onShowEvidence={setFocus} retryHint="Đọc lại câu được tô vàng rồi làm lại nhé." />
    </div>
  )
}
