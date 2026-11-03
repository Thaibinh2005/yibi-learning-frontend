export interface SampleWord {
  id: number
  hanzi: string
  pinyin: string
  meaningVi: string
  levelCode?: string | null
}

export interface VocabTopic {
  id: number
  slug: string
  titleVi: string
  titleZh: string
  icon: string
  description: string
  hskLevel: string
  wordCount: number
  sampleWords: SampleWord[]
}

export interface TopicQueryParams {
  hskLevel?: string
  search?: string
  sort?: 'count' | 'az'
}
