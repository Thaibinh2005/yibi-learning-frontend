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
  /** e.g. một quyển sách; missing when not translated yet */
  exampleTranslation?: string | null
}

/** The meaning of a word for the HSK level the official syllabus teaches it at. */
export interface LevelMeaning {
  syllabusVersion?: string | null
  level: string
  pinyin: string
  partOfSpeech?: string | null
  partOfSpeechVi?: string | null
  main: string
  secondary: string[]
  collocations: { zh: string; vi: string }[]
  note?: string | null
  newAtLevel?: string | null
  /** Meanings of the same word taught at lower levels, lowest first; for the word page, not the flashcard. */
  earlierLevels?: LevelMeaning[]
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
  /** Present for words of the official syllabus; otherwise show meaningVi. */
  levelMeaning?: LevelMeaning | null
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
  levelMeaning?: LevelMeaning | null
}

export interface VocabularyQueryParams {
  hskLevel?: number | string
  search?: string
  page?: number
  size?: number
}

/** GET /vocabularies/{id}/details: every list is empty when the data is missing. */
export interface WordDetails {
  vocabularyId: number
  /** Stored sentences, the one written for the meaning of the word's level first. */
  examples: { zh: string; pinyin?: string | null; vi: string; audioUrl?: string | null; levelCode?: string | null; forLevelMeaning: boolean }[]
  /** Each character of the word; reading and meaning are those of the character as an HSK word, if it is one. */
  characters: { hanzi: string; traditional?: string | null; vocabularyId?: number | null; pinyin?: string | null; meaning?: string | null; levelCode?: string | null }[]
  /** HSK words containing one of this word's characters (via). */
  relatedWords: { vocabularyId: number; hanzi: string; pinyin?: string | null; meaning?: string | null; levelCode?: string | null; via: string }[]
  topics: { slug: string; titleVi: string; icon?: string | null }[]
}
