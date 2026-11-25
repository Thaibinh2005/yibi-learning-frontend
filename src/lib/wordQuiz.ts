import type { Vocabulary } from '@/types/vocabulary'

export interface QuizQuestion {
  word: Vocabulary
  options: string[]
  answer: string
}

const MAX_MEANING = 48

/** The meaning shown as an answer: the level's main meaning, else the first sense of the long one. */
export const shortMeaning = (word: Vocabulary): string => {
  const raw = word.levelMeaning?.main?.trim() || word.meaningVi?.trim() || ''
  const first = raw.split(';')[0].replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
  return first.length > MAX_MEANING ? `${first.slice(0, MAX_MEANING - 1).trimEnd()}…` : first
}

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * One question per word of the lesson: the word, its meaning and three meanings of other words.
 * Words with no usable meaning are left out, and so are repeated meanings (two words that read the same).
 * With onlyIds, only those words are asked and the wrong options still come from the whole lesson.
 */
export const buildQuiz = (words: Vocabulary[], onlyIds?: number[]): QuizQuestion[] => {
  const usable = words
    .map((word) => ({ word, meaning: shortMeaning(word) }))
    .filter((item) => item.meaning !== '')
  const seen = new Set<string>()
  const unique = usable.filter((item) => {
    const key = item.meaning.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (unique.length < 4) return []
  const asked = onlyIds ? unique.filter((item) => onlyIds.includes(item.word.id)) : unique
  return shuffle(asked).map(({ word, meaning }) => {
    const wrong = shuffle(unique.filter((item) => item.word.id !== word.id)).slice(0, 3).map((item) => item.meaning)
    return { word, answer: meaning, options: shuffle([meaning, ...wrong]) }
  })
}
