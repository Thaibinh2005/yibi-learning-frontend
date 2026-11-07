export const PRACTICE_LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']
const DEFAULT_SIZE = 10

/** The requested level if valid, otherwise the learner's own (course level 7 is the HSK 7-9 band). */
export const normalizeLevel = (requested: string | null | undefined, learnerLevel?: number | null) => {
  if (requested && PRACTICE_LEVELS.includes(requested)) return requested
  if (!learnerLevel) return '1'
  return learnerLevel >= 7 ? '7-9' : String(learnerLevel)
}

/** The practice API accepts 5 to 30 questions. */
export const normalizeLimit = (requested: string | null | undefined) => {
  const size = Number(requested)
  return Number.isInteger(size) && size >= 5 && size <= 30 ? size : DEFAULT_SIZE
}
