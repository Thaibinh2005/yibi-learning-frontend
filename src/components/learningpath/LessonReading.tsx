import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Layers, RotateCcw, X } from 'lucide-react'
import { addDeckWords, createDeck, deckError, getDecks, type Deck } from '@/api/deckApi'
import { getVocabularies } from '@/api/vocabularyApi'
import { HARD_DECK_NAME } from '@/components/vocabulary/word-detail/WordDetailModal'
import { AudioButton } from '@/components/ui/AudioButton'
import { displayHanzi } from '@/components/flashcard/useCardSession'
import { cn } from '@/lib/utils'
import type { Vocabulary } from '@/types/vocabulary'

type Item = Record<string, unknown>

const CJK = /[一-鿿]/
const PAGE = 100
const MAX_WORD = 4
const levelWords = new Map<number, Promise<Vocabulary[]>>()

/** All words of one HSK level, paged because the API caps a page; cached for the session. */
const loadLevelWords = (level: number): Promise<Vocabulary[]> => {
  const cached = levelWords.get(level)
  if (cached) return cached
  const load = (async () => {
    const all: Vocabulary[] = []
    for (let page = 0; page < 30; page += 1) {
      const res = await getVocabularies({ hskLevel: level, page, size: PAGE })
      const list = res.success && Array.isArray(res.data) ? res.data : []
      all.push(...list)
      if (list.length < PAGE) break
    }
    return all
  })().catch(() => { levelWords.delete(level); return [] as Vocabulary[] })
  levelWords.set(level, load)
  return load
}

const text = (value: unknown) => (typeof value === 'string' ? value : '')

/** Splits at sentence-ending punctuation, keeping the mark with its sentence. */
const sentencesOf = (value: string) => (value.match(/[^。！？!?.]+[。！？!?.]?/g) ?? []).map((part) => part.trim()).filter(Boolean)

const stripMarks = (value: string) => value.replace(/[^一-鿿]/g, '')

type Token = { text: string; word: Vocabulary | null }

/** Longest-match segmentation against the level's words; unknown characters stay plain. */
const tokenize = (sentence: string, lookup: Map<string, Vocabulary>): Token[] => {
  const chars = Array.from(sentence)
  const tokens: Token[] = []
  let plain = ''
  const flush = () => { if (plain) { tokens.push({ text: plain, word: null }); plain = '' } }
  for (let i = 0; i < chars.length;) {
    let hit: Token | null = null
    if (CJK.test(chars[i])) {
      for (let len = Math.min(MAX_WORD, chars.length - i); len >= 1; len -= 1) {
        const piece = chars.slice(i, i + len).join('')
        const word = lookup.get(piece)
        if (word) { hit = { text: piece, word }; i += len; break }
      }
    }
    if (hit) { flush(); tokens.push(hit) } else { plain += chars[i]; i += 1 }
  }
  flush()
  return tokens
}

/** The sentence a question rests on: the Chinese quoted in its explanation, or -1. */
const evidenceOf = (explanation: string, sentences: string[]): number => {
  const quotes = [...explanation.matchAll(/['‘’"“”]([^'‘’"“”]+)['‘’"“”]/g)].map((match) => stripMarks(match[1])).filter((quote) => quote.length >= 2)
  for (const quote of quotes) {
    const found = sentences.findIndex((sentence) => stripMarks(sentence).includes(quote))
    if (found >= 0) return found
  }
  return -1
}

interface Props {
  readings: Item[]
  questions: Item[]
  hskLevel: number
}

/** A reading passage you can listen to, layer with pinyin and translation, and tap for words, beside its questions. */
export const LessonReading: React.FC<Props> = ({ readings, questions, hskLevel }) => {
  const [words, setWords] = useState<Vocabulary[]>([])
  const [showPinyin, setShowPinyin] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [hideHanzi, setHideHanzi] = useState(false)
  const [activeWord, setActiveWord] = useState<Vocabulary | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [focus, setFocus] = useState(-1)
  const [round, setRound] = useState(0)
  const marked = useRef<HTMLParagraphElement | null>(null)
  // Saving a word to a flashcard deck: pick a deck, or make one on the spot.
  const [picker, setPicker] = useState(false)
  const [decks, setDecks] = useState<Deck[] | null>(null)
  const [newDeck, setNewDeck] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const pickWord = (word: Vocabulary) => {
    setActiveWord(word)
    setPicker(false)
    setNotice(null)
  }

  const openPicker = () => {
    setPicker(true)
    setNotice(null)
    getDecks().then((list) => setDecks(list.filter((deck) => deck.name.trim().toLocaleLowerCase('vi') !== HARD_DECK_NAME.toLocaleLowerCase('vi')))).catch(() => { setDecks([]); setNotice({ ok: false, text: 'Chưa tải được danh sách bộ thẻ.' }) })
  }

  const saveTo = async (target: Deck | string) => {
    if (!activeWord || busy) return
    setBusy(true)
    try {
      const deck = typeof target === 'string' ? await createDeck(target) : target
      const result = await addDeckWords(deck.id, [activeWord.id])
      setNotice({ ok: true, text: result.changed ? `Đã lưu vào "${deck.name}".` : `Từ đã có trong "${deck.name}".` })
      setPicker(false)
      setNewDeck('')
      setDecks(null)
    } catch (err) {
      setNotice({ ok: false, text: deckError(err, 'Chưa lưu được từ này. Hãy thử lại.') })
    } finally { setBusy(false) }
  }

  useEffect(() => {
    let cancelled = false
    loadLevelWords(hskLevel).then((list) => { if (!cancelled) setWords(list) })
    return () => { cancelled = true }
  }, [hskLevel])

  const lookup = useMemo(() => {
    const map = new Map<string, Vocabulary>()
    for (const word of words) {
      const key = displayHanzi(word.hanzi)
      if (!map.has(key)) map.set(key, word)
    }
    return map
  }, [words])

  const passages = useMemo(() => readings.map((reading) => {
    const zh = sentencesOf(text(reading.text))
    const py = sentencesOf(text(reading.pinyin))
    const vi = sentencesOf(text(reading.translation_vi))
    return { title: text(reading.title), zh, py: py.length === zh.length ? py : null, vi: vi.length === zh.length ? vi : null, rawPy: text(reading.pinyin), rawVi: text(reading.translation_vi) }
  }), [readings])

  const allSentences = useMemo(() => passages.flatMap((passage) => passage.zh), [passages])
  const answered = Object.keys(answers).length
  const correct = questions.filter((item, index) => answers[index] !== undefined && answers[index] === text(item.answer)).length
  const done = questions.length > 0 && answered === questions.length

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
                            ? <button key={tokenIndex} type="button" onClick={() => pickWord(token.word as Vocabulary)} className={cn('rounded px-px underline decoration-dotted decoration-slate-300 underline-offset-4 hover:bg-brand/10', activeWord === token.word && 'bg-brand/10')}>{token.text}</button>
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
          {activeWord ? (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3">
              <div className="min-w-0">
                <p><span className="font-chinese text-2xl text-foreground">{displayHanzi(activeWord.hanzi)}</span><span className="ml-2 font-semibold text-brand">{activeWord.pinyin}</span></p>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{activeWord.meaningVi || activeWord.meaningEn}</p>
                {!picker && <button type="button" onClick={openPicker} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/5"><Layers className="h-3.5 w-3.5" aria-hidden="true" />Lưu vào flashcard</button>}
                {picker && (
                  <div className="mt-2 rounded-lg border border-border bg-muted/40 p-2.5">
                    <p className="text-xs font-semibold text-foreground">Lưu vào bộ thẻ nào?</p>
                    {decks === null ? <p className="mt-1 text-xs text-muted-foreground">Đang tải...</p> : (
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {decks.map((deck) => <li key={deck.id}><button type="button" disabled={busy} onClick={() => saveTo(deck)} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-brand hover:text-brand disabled:opacity-60">{deck.name}<span className="ml-1 font-normal text-muted-foreground">{deck.totalWords}</span></button></li>)}
                        {decks.length === 0 && <li className="text-xs text-muted-foreground">Bạn chưa có bộ thẻ nào. Tạo bộ đầu tiên bên dưới.</li>}
                      </ul>
                    )}
                    <form onSubmit={(event) => { event.preventDefault(); if (newDeck.trim()) void saveTo(newDeck.trim()) }} className="mt-2 flex gap-1.5">
                      <input value={newDeck} onChange={(event) => setNewDeck(event.target.value)} maxLength={80} placeholder="Tạo bộ mới, ví dụ: Bài đọc 1" aria-label="Tên bộ thẻ mới" className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-brand" />
                      <button type="submit" disabled={!newDeck.trim() || busy} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Tạo và lưu</button>
                    </form>
                    <button type="button" onClick={() => setPicker(false)} className="mt-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">Hủy</button>
                  </div>
                )}
                {notice && <p role={notice.ok ? 'status' : 'alert'} className={cn('mt-1.5 text-xs', notice.ok ? 'font-semibold text-emerald-700' : 'text-rose-700')}>{notice.text}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <AudioButton audioUrl={activeWord.audioUrl} text={displayHanzi(activeWord.hanzi)} size="sm" />
                <button type="button" onClick={() => setActiveWord(null)} aria-label="Đóng" className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          ) : <p className="text-xs leading-snug text-muted-foreground">Bấm vào một từ gạch chân để xem pinyin và nghĩa.</p>}
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        {questions.length > 0 && (
          <>
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Câu hỏi</span><span>Đã trả lời {answered}/{questions.length}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered}>
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
              </div>
            </div>

            {questions.map((item, index) => {
              const options = Array.isArray(item.options) ? item.options.map(String) : []
              const picked = answers[index]
              const right = text(item.answer)
              const evidence = picked !== undefined ? evidenceOf(text(item.explanation), allSentences) : -1
              return (
                <article key={`${round}-${index}`} className="rounded-xl border border-border bg-muted/40 p-3.5">
                  <p className="text-sm font-semibold leading-snug text-foreground"><span className="mr-1.5 text-muted-foreground">{index + 1}.</span>{text(item.question)}</p>
                  <div className="mt-2 space-y-1.5">
                    {options.map((option) => {
                      const state = picked === undefined ? 'border-border bg-card hover:bg-muted' : option === right ? 'border-emerald-300 bg-emerald-50' : option === picked ? 'border-rose-300 bg-rose-50' : 'border-border bg-card opacity-70'
                      return (
                        <button key={option} type="button" disabled={picked !== undefined} onClick={() => answer(index, option)} className={cn('flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm text-foreground', state)}>
                          <span>{option}</span>
                          {picked !== undefined && option === right && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
                          {picked !== undefined && option === picked && option !== right && <X className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />}
                        </button>
                      )
                    })}
                  </div>
                  {picked !== undefined && (
                    <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      <p><b className={picked === right ? 'text-emerald-700' : 'text-rose-700'}>{picked === right ? 'Chính xác. ' : `Đáp án đúng: ${right}. `}</b>{text(item.explanation)}</p>
                      {evidence >= 0 && <button type="button" onClick={() => setFocus(evidence)} className="mt-1 font-semibold text-brand hover:underline">Xem câu trong bài</button>}
                    </div>
                  )}
                </article>
              )
            })}

            {done && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4" role="status">
                <div>
                  <p className="text-lg font-bold text-foreground">Đúng {correct}/{questions.length} câu</p>
                  <p className="text-xs text-muted-foreground">{correct === questions.length ? 'Bạn hiểu bài rất tốt.' : 'Đọc lại câu được tô vàng rồi làm lại nhé.'}</p>
                </div>
                <button type="button" onClick={reset} className="btn-chunky btn-brand inline-flex shrink-0 items-center gap-2 px-4 py-2 text-sm"><RotateCcw className="h-4 w-4" aria-hidden="true" />Làm lại</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
