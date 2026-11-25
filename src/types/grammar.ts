/** Mirrors dto/grammar/GrammarDtos. */
export interface GrammarExample {
  zh: string
  /** Syllables separated by spaces, with tone marks. */
  pinyin: string
  vi: string
}

export interface GrammarNote {
  title: string
  structure?: string | null
  explanation: string
  examples: GrammarExample[]
  /** DRAFT until the note has been read and approved. */
  status: 'DRAFT' | 'REVIEWED'
}

/** A grammar point of a lesson as the syllabus gives it, with its note when there is one. */
export interface GrammarPoint {
  id: number
  content: string
  category?: string | null
  categoryName?: string | null
  subcategory?: string | null
  note?: GrammarNote | null
}
