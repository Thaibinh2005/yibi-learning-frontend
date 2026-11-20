/** Mirrors dto/hanzi/HanziSyllableResponse and dto/srs/SrsWriting*. */
export interface HanziSyllable {
  hanzi: string
  pinyin: string
  /** "1" to "6", or "7-9". */
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
