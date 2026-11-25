import React, { useEffect, useState } from 'react'
import { LayoutGrid, List, PenLine, X } from 'lucide-react'
import { getVocabularies } from '@/api/vocabularyApi'
import { AudioButton } from '@/components/ui/AudioButton'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { displayHanzi } from '@/components/flashcard/useCardSession'
import type { Vocabulary } from '@/types/vocabulary'

interface CharInfo {
  hanzi: string
  pinyin: string
  meaning: string
  /** Set when the meaning comes from a word that contains the character, not from the character itself. */
  viaWord: string | null
  words: Vocabulary[]
}

const cache = new Map<string, CharInfo>()

const meaningOf = (word: Vocabulary) => word.meaningVi || word.meaningEn || ''

/** The first sense, without a leading register note such as "(thông tục)", for tiles and rows. */
const shortMeaning = (meaning: string) => {
  const parts: string[] = []
  let depth = 0
  let part = ''
  for (const char of meaning) {
    if ('(（'.includes(char)) depth += 1
    if (')）'.includes(char)) depth = Math.max(0, depth - 1)
    if (depth === 0 && ';；'.includes(char)) { parts.push(part); part = '' } else part += char
  }
  parts.push(part)
  const clean = parts.map((item) => item.replace(/[(（][^)）]*[)）]?/g, ' ').replace(/\s+/g, ' ').trim())
  return clean.find(Boolean) ?? meaning
}

const VOWELS = 'aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
const SYLLABLE = new RegExp(`(?:[zcs]h|[bpmfdtnlgkhjqxrzcsyw])?[${VOWELS}]+(?:ng|n(?![${VOWELS}])|r(?![${VOWELS}]))?`, 'gi')

/** Pinyin of the syllable of `char` in `word`, when the word has one syllable per character. */
const syllableOf = (word: Vocabulary, char: string): string => {
  const text = displayHanzi(word.hanzi)
  const spaced = word.pinyin.trim().split(/\s+/)
  const syllables = spaced.length > 1 ? spaced : word.pinyin.match(SYLLABLE) ?? []
  if (syllables.length !== Array.from(text).length) return ''
  return syllables[Array.from(text).indexOf(char)] ?? ''
}

/** Resolves a character to pinyin and meaning from the vocabulary: its own entry first, else a word that contains it. */
const loadChar = async (char: string): Promise<CharInfo> => {
  const hit = cache.get(char)
  if (hit) return hit
  const res = await getVocabularies({ search: char, size: 12 }).catch(() => null)
  const words = (res?.success && Array.isArray(res.data) ? res.data : []).filter((word) => displayHanzi(word.hanzi).includes(char))
  const own = words.find((word) => displayHanzi(word.hanzi) === char)
  const via = own ?? words[0]
  const info: CharInfo = {
    hanzi: char,
    pinyin: own ? own.pinyin : via ? syllableOf(via, char) : '',
    meaning: via ? meaningOf(via) : '',
    viaWord: own || !via ? null : displayHanzi(via.hanzi),
    words: words.filter((word) => displayHanzi(word.hanzi) !== char).slice(0, 4),
  }
  cache.set(char, info)
  return info
}

const useCharInfos = (chars: string[]) => {
  const key = chars.join('')
  const [infos, setInfos] = useState<CharInfo[] | null>(null)
  useEffect(() => {
    let cancelled = false
    setInfos(null)
    Promise.all(chars.map(loadChar)).then((list) => { if (!cancelled) setInfos(list) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return infos
}

interface Props {
  chars: string[]
  onWrite: (hanzi: string) => void
}

/** The characters of a lesson, as annotated tiles or a list, with a detail panel for the one picked. */
export const LessonCharacters: React.FC<Props> = ({ chars, onWrite }) => {
  const infos = useCharInfos(chars)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<string | null>(null)
  const current = infos?.find((info) => info.hanzi === selected) ?? null

  if (!infos) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5" aria-busy="true">
        {chars.map((char, index) => <Skeleton key={`${char}-${index}`} className="h-28 rounded-xl" />)}
      </div>
    )
  }

  const pick = (hanzi: string) => setSelected((value) => (value === hanzi ? null : hanzi))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs leading-snug text-muted-foreground">Bấm vào một chữ để xem nghĩa, từ ghép và luyện viết.</p>
        <div className="inline-flex shrink-0 rounded-xl border border-border p-0.5" role="group" aria-label="Kiểu hiển thị">
          {([['grid', LayoutGrid, 'Lưới'], ['list', List, 'Danh sách']] as const).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold', view === mode ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted')}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('grid gap-4', current && 'md:grid-cols-[minmax(0,1fr)_280px]')}>
        {view === 'grid' ? (
          <ul className={cn('grid gap-2', current ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5')}>
            {infos.map((info) => (
              <li key={info.hanzi}>
                <button
                  type="button"
                  aria-pressed={selected === info.hanzi}
                  onClick={() => pick(info.hanzi)}
                  className={cn('flex h-full w-full flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors hover:border-brand/40 hover:bg-muted', selected === info.hanzi ? 'border-brand bg-brand/5' : 'border-border bg-muted/40')}
                >
                  <span className="font-chinese text-3xl leading-tight text-foreground">{info.hanzi}</span>
                  <span className="mt-1 text-sm font-semibold leading-snug text-brand">{info.pinyin || '—'}</span>
                  <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{info.meaning ? shortMeaning(info.meaning) : 'Chưa có nghĩa'}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {infos.map((info) => (
              <li key={info.hanzi} className={cn('flex items-center gap-3 px-3 py-2', selected === info.hanzi && 'bg-brand/5')}>
                <button type="button" onClick={() => pick(info.hanzi)} aria-pressed={selected === info.hanzi} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="font-chinese w-10 shrink-0 text-center text-2xl leading-tight text-foreground">{info.hanzi}</span>
                  <span className="w-16 shrink-0 text-sm font-semibold leading-snug text-brand">{info.pinyin || '—'}</span>
                  <span className="min-w-0 truncate text-sm leading-snug text-muted-foreground">{info.meaning ? shortMeaning(info.meaning) : 'Chưa có nghĩa'}{info.viaWord ? ` (trong ${info.viaWord})` : ''}</span>
                </button>
                <AudioButton text={info.hanzi} size="sm" />
                <button type="button" onClick={() => onWrite(info.hanzi)} aria-label={`Luyện viết ${info.hanzi}`} title="Luyện viết" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted">
                  <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {current && (
          <aside aria-label={`Chi tiết chữ ${current.hanzi}`} className="h-fit rounded-xl border border-border bg-card p-4 max-md:fixed max-md:inset-x-3 max-md:bottom-20 max-md:z-40 max-md:max-h-[65vh] max-md:overflow-y-auto max-md:shadow-2xl md:sticky md:top-20">
            <div className="flex items-start justify-between gap-2">
              <span className="font-chinese text-6xl leading-tight text-foreground">{current.hanzi}</span>
              <div className="flex items-center gap-1">
                <AudioButton text={current.hanzi} size="md" />
                <button type="button" onClick={() => setSelected(null)} aria-label="Đóng chi tiết" className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
            <p className="mt-1 text-lg font-bold leading-snug text-brand">{current.pinyin || '—'}</p>
            <p className="mt-1 text-sm leading-snug text-foreground">{current.meaning || 'Chưa có nghĩa cho chữ này.'}</p>
            {current.viaWord && <p className="mt-0.5 text-xs leading-snug text-muted-foreground">Nghĩa lấy từ từ <span className="font-chinese">{current.viaWord}</span>.</p>}
            {current.words.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Từ có chữ này</h4>
                <ul className="mt-2 space-y-1.5">
                  {current.words.map((word) => (
                    <li key={word.id} className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-sm leading-snug">
                      <span className="font-chinese font-semibold text-foreground">{displayHanzi(word.hanzi)}</span>
                      <span className="ml-2 text-brand">{word.pinyin}</span>
                      <span className="block text-xs text-muted-foreground">{meaningOf(word)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button type="button" onClick={() => onWrite(current.hanzi)} className="btn-chunky btn-brand mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm">
              <PenLine className="h-4 w-4" aria-hidden="true" />Luyện viết chữ này
            </button>
          </aside>
        )}
      </div>
    </div>
  )
}
