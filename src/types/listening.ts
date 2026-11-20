export type ListeningSource = 'YOUTUBE' | 'UPLOAD' | 'MANUAL'
export type VideoStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'FAILED'
export type TranslationStatus = 'NONE' | 'RUNNING' | 'DONE' | 'FAILED'
/** PRIVATE → PENDING_REVIEW → PUBLISHED (or REJECTED); HIDDEN when an admin takes a published lesson down. */
export type LessonVisibility = 'PRIVATE' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN'

/** One piece of a sentence; `py`, `id`, `hsk` are missing for punctuation and other non-Chinese text. */
export interface SegmentWord {
  w: string
  py?: string
  id?: number
  hsk?: string
}

/** One character Whisper heard, with its time; used to split a line exactly. */
export interface CharTime {
  w: string
  start: number
  end: number
}

/** Times in seconds; missing while typed text is not timed yet. Null fields are left out of the JSON. */
export interface LearnerSegment {
  text: string
  start?: number | null
  end?: number | null
  pinyin?: string
  vi?: string | null
  viStale?: boolean
  words?: SegmentWord[]
  flags?: string[]
  timing?: CharTime[] | null
}

export interface ListeningUsage {
  videosAdded: number
  maxVideos: number
  segmentsTranslated: number
  maxSegments: number
  maxMediaMb: number
  maxMediaMinutes: number
}

export interface VideoSummary {
  id: number
  title: string
  source: ListeningSource
  videoId?: string
  hasMedia: boolean
  status: VideoStatus
  statusMessage?: string
  translationStatus: TranslationStatus
  segmentCount: number
  translatedCount: number
  updatedAt: string
  /** When the last sentence ends; missing while no sentence is timed. */
  durationSeconds?: number
  /** The admin's level, else estimated from the HSK words used: "1".."6" or "7-9". */
  hskLevel?: string
  visibility: LessonVisibility
  /** The viewer contributed this lesson. */
  mine: boolean
  /** The viewer saved this (someone else's) published lesson. */
  saved: boolean
  /** The YouTube channel the video belongs to; nobody in the app owns it. */
  channelName?: string
  contributorName?: string
  practiceCount: number
}

export interface CategoryRef {
  id: number
  name: string
  slug: string
}

export interface ListeningCategory extends CategoryRef {
  description?: string
  sortOrder: number
  active: boolean
  /** Published lessons in it. */
  lessonCount: number
}

export interface LibrarySection {
  category: ListeningCategory
  videos: VideoSummary[]
  total: number
}

export interface LibraryHome {
  newest: VideoSummary[]
  popular: VideoSummary[]
  sections: LibrarySection[]
}

export interface CategoryPage {
  category: ListeningCategory
  videos: VideoSummary[]
  page: number
  totalPages: number
  total: number
}

export type ShareRights = 'OWN' | 'CREATIVE_COMMONS' | 'PERMISSION'

export interface VideoList {
  videos: VideoSummary[]
  usage: ListeningUsage
}

export interface VideoDetail {
  id: number
  title: string
  source: ListeningSource
  videoId?: string
  hasMedia: boolean
  mediaType?: string
  status: VideoStatus
  statusMessage?: string
  translationStatus: TranslationStatus
  translationMessage?: string
  segments: LearnerSegment[]
  updatedAt: string
  visibility: LessonVisibility
  mine: boolean
  /** The viewer may change the lines now. */
  editable: boolean
  saved: boolean
  channelName?: string
  channelUrl?: string
  contributorName?: string
  description?: string
  usageRights?: string
  /** The admin's note on a rejection or approval; only for the contributor. */
  reviewNote?: string
  hskLevel?: string
  categories: CategoryRef[]
}

export interface ShadowingResult {
  accuracy: number
  transcript: string
  passed: boolean
}

export interface AdminLessonRow {
  id: number
  title: string
  source: ListeningSource
  videoId?: string
  hasMedia: boolean
  visibility: LessonVisibility
  status: VideoStatus
  translationStatus: TranslationStatus
  segmentCount: number
  translatedCount: number
  hskLevel?: string
  estimatedLevel?: string
  durationSeconds?: number
  contributorName?: string
  channelName?: string
  usageRights?: string
  rightsNote?: string
  description?: string
  reviewNote?: string
  categories: CategoryRef[]
  submittedAt?: string
  publishedAt?: string
  practiceCount: number
  saveCount: number
}

export interface AdminLessonPage {
  lessons: AdminLessonRow[]
  page: number
  totalPages: number
  total: number
  pendingCount: number
}
