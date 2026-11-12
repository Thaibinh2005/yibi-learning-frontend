import React, { useCallback, useEffect, useState } from 'react'
import { getVocabularies } from '@/api/vocabularyApi'
import { AudioButton } from '@/components/ui/AudioButton'
import { Skeleton } from '@/components/ui/skeleton'
import type { Vocabulary } from '@/types/vocabulary'

interface Props {
  query: string
  /** The character on the writing desk, to mark its chip. */
  activeChar: string | null
  /** Opens a character on the desk; `say` is the text to read aloud when it differs from the character. */
  onPickChar: (char: string, pinyin?: string, say?: string) => void
}

interface Word {
  key: string
  hanzi: string
  pinyin?: string
  meaning?: string
  level?: string
  /** True for the Hanzi the learner typed, which may not be an HSK word. */
  typed?: boolean
  audioUrl?: string
}

type Status = 'loading' | 'error' | 'ready'

const HAN = /\p{Script=Han}/gu
const hanChars = (text: string): string[] => text.match(HAN) ?? []

const toWord = (item: Vocabulary): Word => ({
  key: `v${item.id}`,
  hanzi: item.hanzi,
  pinyin: item.pinyin,
  meaning: item.meaningVi,
  level: item.levelCode ?? (item.hskLevel ? String(item.hskLevel) : undefined),
  audioUrl: item.audioUrl,
})

const levelLabel = (code: string) => `HSK ${code.replace('-', '–')}`

/** Words that match the search, each with one chip per character that opens the writing guide on the desk. */
export const LookupResults: React.FC<Props> = ({ query, activeChar, onPickChar }) => {
  const [status, setStatus] = useState<Status>('loading')
  const [found, setFound] = useState<Vocabulary[]>([])
  const [attempt, setAttempt] = useState(0)
  const [openWord, setOpenWord] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setOpenWord(null)
    getVocabularies({ search: query, size: 12 })
      .then((response) => { if (!cancelled) { setFound(response.data); setStatus('ready') } })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [query, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  // The typed Hanzi comes first, so any word can be written even if the HSK list does not have it.
  const typedHanzi = hanChars(query).join('')
  const words: Word[] = [
    ...(typedHanzi && !found.some((item) => item.hanzi === typedHanzi) ? [{ key: 'typed', hanzi: typedHanzi, meaning: 'Chữ bạn vừa gõ', typed: true } as Word] : []),
    ...found.map(toWord),
  ]

  const open = (word: Word) => {
    setOpenWord(word.key)
    const chars = hanChars(word.hanzi)
    const syllables = word.pinyin?.split(/\s+/) ?? []
    if (chars.length > 0) onPickChar(chars[0], syllables.length === chars.length ? syllables[0] : undefined, word.hanzi)
  }

  return (
    <section aria-label={`Kết quả tra "${query}"`} className="space-y-3">
      <h2 className="text-lg font-extrabold text-slate-900">Kết quả cho <span className="font-chinese">"{query}"</span></h2>

      {status === 'loading' && (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-3xl" />)}
        </div>
      )}

      {status === 'error' && (
        <div className="card-soft p-6 text-center" role="alert">
          <h3 className="font-extrabold text-slate-900">Chưa tra được lúc này</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Chưa có gì thay đổi. Thử lại sau ít giây.</p>
          <button type="button" onClick={retry} className="btn-chunky btn-brand mt-3 px-5 py-2 text-sm">Thử lại</button>
        </div>
      )}

      {status === 'ready' && words.length === 0 && (
        <div className="card-soft p-6 text-center">
          <p className="font-chinese text-5xl text-slate-300">空</p>
          <h3 className="mt-1 font-extrabold text-slate-900">Không tìm thấy từ nào</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">Thử gõ pinyin không dấu (ví dụ nihao), chữ Hán, hoặc một từ tiếng Việt ngắn hơn.</p>
        </div>
      )}

      {status === 'ready' && words.length > 0 && (
        <ul className="space-y-2">
          {words.map((word) => {
            const chars = hanChars(word.hanzi)
            const syllables = word.pinyin?.split(/\s+/) ?? []
            const isOpen = openWord === word.key
            return (
              <li key={word.key} className={`rounded-3xl border-2 bg-white p-3 ${isOpen ? 'border-brand' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => open(word)}
                    aria-expanded={isOpen}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
                  >
                    <span className="font-chinese text-4xl leading-tight text-slate-900">{word.hanzi}</span>
                    <span className="min-w-0">
                      {word.pinyin && <span className="block font-extrabold leading-snug text-brand">{word.pinyin}</span>}
                      <span className="block truncate text-sm leading-snug text-slate-600">{word.meaning}</span>
                    </span>
                  </button>
                  {word.level && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{levelLabel(word.level)}</span>}
                  <AudioButton text={word.hanzi} audioUrl={word.audioUrl} size="lg" title={`Nghe ${word.hanzi}`} className="shrink-0" />
                </div>
                {isOpen && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Hướng dẫn viết từng chữ</p>
                    <ul className="flex flex-wrap gap-2">
                      {chars.map((char, index) => (
                        <li key={`${char}${index}`}>
                          <button
                            type="button"
                            aria-pressed={activeChar === char}
                            onClick={() => onPickChar(char, syllables.length === chars.length ? syllables[index] : undefined)}
                            className={`flex min-h-14 min-w-14 flex-col items-center justify-center rounded-2xl border-2 px-2 py-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                              activeChar === char ? 'border-brand bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-200'
                            }`}
                          >
                            <span className="font-chinese text-3xl leading-tight text-slate-900">{char}</span>
                            {syllables.length === chars.length && <span className="text-xs font-bold leading-snug text-slate-500">{syllables[index]}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
