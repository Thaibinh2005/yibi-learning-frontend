/** Missing (null is left out of the JSON) for a non-Chinese track. */
export type TranscriptScript = 'simplified' | 'traditional' | 'unknown' | null | undefined

export type UsageRights = 'OWN' | 'CREATIVE_COMMONS' | 'PERMISSION'

export interface YoutubeLanguage {
  languageCode: string
  language: string
  isGenerated: boolean
  script?: TranscriptScript
}

export interface YoutubeLanguages {
  videoId: string
  languages: YoutubeLanguage[]
  recommended?: string | null
  recommendedIsGenerated?: boolean | null
}

/** Times in seconds. */
export interface TranscriptSegment {
  text: string
  start: number
  duration: number
  end: number
}

export interface YoutubeTranscript {
  videoId: string
  language: string
  languageCode: string
  isGenerated: boolean
  script?: TranscriptScript
  segments: TranscriptSegment[]
  traditionalChars: number
}

export interface SaveTranscriptRequest {
  videoId: string
  title: string
  languageCode: string
  isGenerated: boolean
  hskLevel?: string
  usageRights: UsageRights
  rightsNote?: string
  rightsConfirmed: boolean
  segments: { text: string; start: number; end: number }[]
}
