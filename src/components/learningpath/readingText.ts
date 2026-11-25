import { useEffect, useMemo, useState } from 'react'
import { getVocabularies } from '@/api/vocabularyApi'
import { displayHanzi } from '@/components/flashcard/useCardSession'
import type { Vocabulary } from '@/types/vocabulary'

export type Item = Record<string, unknown>

const CJK = /[一-鿿]/
const PAGE = 100
const MAX_WORD = 4
const levelWords = new Map<number, Promise<Vocabulary[]>>()

/** All words of one HSK level, paged because the API caps a page; cached for the session. */
export const loadLevelWords = (level: number): Promise<Vocabulary[]> => {
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

export const text = (value: unknown) => (typeof value === 'string' ? value : '')

/** Splits at sentence-ending punctuation, keeping the mark with its sentence. */
export const sentencesOf = (value: string) => (value.match(/[^。！？!?.]+[。！？!?.]?/g) ?? []).map((part) => part.trim()).filter(Boolean)

const stripMarks = (value: string) => value.replace(/[^一-鿿]/g, '')

export type Token = { text: string; word: Vocabulary | null }

/** Longest-match segmentation against the level's words; unknown characters stay plain. */
export const tokenize = (sentence: string, lookup: Map<string, Vocabulary>): Token[] => {
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
export const evidenceOf = (explanation: string, sentences: string[]): number => {
  const quotes = [...explanation.matchAll(/['‘’"“”]([^'‘’"“”]+)['‘’"“”]/g)].map((match) => stripMarks(match[1])).filter((quote) => quote.length >= 2)
  for (const quote of quotes) {
    const found = sentences.findIndex((sentence) => stripMarks(sentence).includes(quote))
    if (found >= 0) return found
  }
  return -1
}

/** Word lookup (by hanzi) over the words of one HSK level, for tapping words in a passage. */
export const useLevelLookup = (hskLevel: number) => {
  const [words, setWords] = useState<Vocabulary[]>([])
  useEffect(() => {
    let cancelled = false
    loadLevelWords(hskLevel).then((list) => { if (!cancelled) setWords(list) })
    return () => { cancelled = true }
  }, [hskLevel])
  return useMemo(() => {
    const map = new Map<string, Vocabulary>()
    for (const word of words) {
      const key = displayHanzi(word.hanzi)
      if (!map.has(key)) map.set(key, word)
    }
    return map
  }, [words])
}
