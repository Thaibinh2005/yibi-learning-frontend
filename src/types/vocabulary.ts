export interface VocabularyExample {
  sentence: string
  pinyin?: string
  translation?: string
}

export interface Vocabulary {
  id: number
  hanzi: string
  hanziTraditional?: string
  pinyin: string
  meaningVi: string
  meaningEn?: string
  hskLevel: number
  partOfSpeech?: string
  exampleSentence?: string
  examplePinyin?: string
  examples?: VocabularyExample[]
  audioUrl?: string
  strokeCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface VocabularyQueryParams {
  hskLevel?: number
  search?: string
  page?: number
  size?: number
}
