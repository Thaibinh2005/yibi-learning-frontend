import { useCallback, useState } from 'react'

const KEY = 'yibi.hanzi.learnedRadicals'

const read = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

/** Radicals the learner has written once. Kept in this browser only: radicals never go to the review queue. */
export const useLearnedRadicals = () => {
  const [learned, setLearned] = useState<Set<string>>(() => new Set(read()))

  const markLearned = useCallback((char: string) => {
    if (learned.has(char)) return
    const next = new Set(learned).add(char)
    setLearned(next)
    try { localStorage.setItem(KEY, JSON.stringify([...next])) } catch { /* private window: the tick lasts for this visit */ }
  }, [learned])

  return { learned, markLearned }
}
