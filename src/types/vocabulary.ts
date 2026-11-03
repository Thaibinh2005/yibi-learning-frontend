export interface VocabularyExample {
  sentence: string
  pinyin?: string
  translation?: string
}

/** A measure word (量词) used with a noun, e.g. 本 for 书. */
export interface MeasureWord {
  measureWord: string
  measureWordTraditional?: string | null
  pinyin: string
  meaningVi?: string | null
  /** e.g. 一本书 */
  examplePhrase: string
  /** e.g. yì běn shū */
  examplePinyin: string
}

export interface Vocabulary {
  id: number
  hanzi: string
  hanziTraditional?: string
  pinyin: string
  meaningVi: string
  meaningEn?: string
  hskLevel: number | null
  levelCode?: string
  partOfSpeech?: string
  exampleSentence?: string
  examplePinyin?: string
  exampleTranslation?: string
  exampleAudioUrl?: string
  measureWords?: MeasureWord[]
  examples?: VocabularyExample[]
  audioUrl?: string
  strokeCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface DailyVocabulary {
  id: number
  hanzi: string
  hanziTraditional?: string
  pinyin: string
  meaningVi: string
  meanings: string[]
  hskLevel: number | null
  levelCode?: string
  partOfSpeech?: string
  audioUrl?: string
  date: string
  dateLabel: string
  isToday: boolean
  measureWords?: MeasureWord[]
}

export interface VocabularyQueryParams {
  hskLevel?: number | string
  search?: string
  page?: number
  size?: number
}
