/** Mirrors dto/hanzi/HanziSyllableResponse and dto/srs/SrsWriting*. */
export interface HanziSyllable {
  hanzi: string
  pinyin: string
  /** "1" to "6", "7-9", or "1-2" for the list shared by levels 1 and 2. */
  levelCode: string
}

export type WritingRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

export interface WritingCard {
  cardId: number
  hanzi: string
  pinyin: string | null
  repetition: number
  intervalDays: number
  easeFactor: number
  dueDate: string
  lastReviewed: string | null
}

export type WritingMode = 'view' | 'trace' | 'quiz'
