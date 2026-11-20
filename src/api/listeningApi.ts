import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CategoryPage,
  CharTime,
  LibraryHome,
  ListeningCategory,
  ShadowingResult,
  ShareRights,
  VideoDetail,
  VideoList,
  VideoSummary,
} from '@/types/listening'

const BASE = '/listening'

export const listVideos = async (): Promise<VideoList> =>
  (await axiosClient.get<ApiResponse<VideoList>>(`${BASE}/videos`)).data.data

export const getVideo = async (id: number): Promise<VideoDetail> =>
  (await axiosClient.get<ApiResponse<VideoDetail>>(`${BASE}/videos/${id}`)).data.data

/** YOUTUBE reads the video's Chinese subtitles; MANUAL takes typed text (one sentence per line) and an optional link. */
export const createVideo = async (request: {
  /** Left out: the YouTube title, or the first sentence of typed text. */
  title?: string
  source: 'YOUTUBE' | 'MANUAL'
  youtubeUrl?: string
  text?: string
  confirmed: boolean
}): Promise<VideoDetail> =>
  (await axiosClient.post<ApiResponse<VideoDetail>>(`${BASE}/videos`, request, { timeout: 60000 })).data.data

/** Without `text` the file is transcribed by Whisper in the background; with it the learner times the typed lines. */
export const uploadVideo = async (
  file: File,
  /** Left out: the file's name. */
  title: string | undefined,
  text: string | undefined,
  onProgress?: (fraction: number) => void
): Promise<VideoDetail> => {
  const form = new FormData()
  form.append('file', file)
  if (title) form.append('title', title)
  form.append('confirmed', 'true')
  if (text) form.append('text', text)
  const response = await axiosClient.post<ApiResponse<VideoDetail>>(`${BASE}/videos/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(e.loaded / e.total)
    },
  })
  return response.data.data
}

export interface SegmentPayload {
  text: string
  start?: number | null
  end?: number | null
  vi?: string | null
  viStale?: boolean
  timing?: CharTime[] | null
}

export const saveSegments = async (id: number, segments: SegmentPayload[], title?: string): Promise<VideoDetail> =>
  (await axiosClient.put<ApiResponse<VideoDetail>>(`${BASE}/videos/${id}/segments`, { title, segments })).data.data

export const finishVideo = async (id: number): Promise<VideoDetail> =>
  (await axiosClient.post<ApiResponse<VideoDetail>>(`${BASE}/videos/${id}/finish`)).data.data

export const translateVideo = async (id: number): Promise<VideoDetail> =>
  (await axiosClient.post<ApiResponse<VideoDetail>>(`${BASE}/videos/${id}/translate`)).data.data

export const retryTranscription = async (id: number): Promise<VideoDetail> =>
  (await axiosClient.post<ApiResponse<VideoDetail>>(`${BASE}/videos/${id}/retry`)).data.data

export const deleteVideo = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE}/videos/${id}`)
}

/** A signed link the player can open without the login header; it expires after a few hours. */
export const getMediaUrl = async (id: number): Promise<string> =>
  (await axiosClient.get<ApiResponse<{ url: string; expiresAt: number }>>(`${BASE}/videos/${id}/media-url`)).data.data.url

export const scoreShadowing = async (id: number, index: number, audio: Blob): Promise<ShadowingResult> => {
  const form = new FormData()
  form.append('audio', audio, 'speech.webm')
  return (
    await axiosClient.post<ApiResponse<ShadowingResult>>(`${BASE}/videos/${id}/segments/${index}/shadowing`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })
  ).data.data
}

// ── Community library (readable by guests) ─────────────────────────────

export const getLibrary = async (filter: { level?: string; q?: string } = {}): Promise<LibraryHome> =>
  (await axiosClient.get<ApiResponse<LibraryHome>>(`${BASE}/library`, { params: clean(filter) })).data.data

export const getLibraryCategories = async (): Promise<ListeningCategory[]> =>
  (await axiosClient.get<ApiResponse<ListeningCategory[]>>(`${BASE}/library/categories`)).data.data

export const getCategoryPage = async (
  slug: string,
  filter: { level?: string; q?: string; page?: number } = {}
): Promise<CategoryPage> =>
  (await axiosClient.get<ApiResponse<CategoryPage>>(`${BASE}/library/categories/${encodeURIComponent(slug)}`, { params: clean(filter) }))
    .data.data

/** Published lessons of a YouTube video, offered before the learner adds the same video again. */
export const lookupYoutube = async (youtube: string): Promise<VideoSummary[]> =>
  (await axiosClient.get<ApiResponse<VideoSummary[]>>(`${BASE}/library/lookup`, { params: { youtube } })).data.data

// ── Sharing and the learner's shelf ────────────────────────────────────

export interface SubmitPayload {
  categoryIds: number[]
  description?: string
  /** Only for an uploaded file. */
  usageRights?: ShareRights
  rightsNote?: string
  confirmed: boolean
}

export const submitVideo = async (id: number, payload: SubmitPayload): Promise<VideoDetail> =>
  (await axiosClient.post<ApiResponse<VideoDetail>>(`${BASE}/videos/${id}/submit`, payload)).data.data

export const withdrawVideo = async (id: number): Promise<VideoDetail> =>
  (await axiosClient.post<ApiResponse<VideoDetail>>(`${BASE}/videos/${id}/withdraw`)).data.data

export const saveToShelf = async (id: number): Promise<void> => {
  await axiosClient.post(`${BASE}/videos/${id}/save`)
}

export const removeFromShelf = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE}/videos/${id}/save`)
}

/** Counted once per learner per day; a failure does not matter to the learner. */
export const markPractised = (id: number): void => {
  axiosClient.post(`${BASE}/videos/${id}/practised`).catch(() => undefined)
}

function clean<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)) as Partial<T>
}

export function apiError(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || fallback
}
