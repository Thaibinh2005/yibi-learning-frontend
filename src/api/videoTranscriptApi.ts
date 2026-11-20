import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { SaveTranscriptRequest, YoutubeLanguages, YoutubeTranscript } from '@/types/video'

const BASE = '/admin/video-transcripts'

/** Subtitle tracks of a YouTube video (link or id). Reads YouTube only, saves nothing. */
export const getYoutubeLanguages = async (video: string): Promise<YoutubeLanguages> =>
  (await axiosClient.get<ApiResponse<YoutubeLanguages>>(`${BASE}/youtube/languages`, { params: { video } })).data.data

/** One track as timed segments; without a language the best simplified Chinese track is chosen. */
export const getYoutubeTranscript = async (
  video: string,
  language?: string,
  generated?: boolean
): Promise<YoutubeTranscript> =>
  (
    await axiosClient.get<ApiResponse<YoutubeTranscript>>(`${BASE}/youtube/transcript`, {
      params: { video, language, generated },
    })
  ).data.data

/** Turns the reviewed subtitles into a draft listening lesson of the admin. */
export const saveVideoTranscript = async (request: SaveTranscriptRequest): Promise<{ lessonId: number }> =>
  (await axiosClient.post<ApiResponse<{ lessonId: number }>>(BASE, request)).data.data
