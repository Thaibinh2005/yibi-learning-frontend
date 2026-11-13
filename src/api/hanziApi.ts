import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { HanziSyllable, WritingCard, WritingRating } from '@/types/hanzi'

/** Characters for a syllable. An empty `initial` means no initial; leave a part out to match any. */
export const getHanziBySyllable = async (
  params: { initial?: string; final?: string; tone?: number },
): Promise<ApiResponse<HanziSyllable[]>> =>
  (await axiosClient.get<ApiResponse<HanziSyllable[]>>('/hanzi/syllables', { params })).data

/** The HSK writing characters, optionally of one level. */
export const getWritingHanzi = async (level?: string): Promise<ApiResponse<HanziSyllable[]>> =>
  (await axiosClient.get<ApiResponse<HanziSyllable[]>>('/hanzi/writing', { params: level ? { level } : undefined })).data

export const getDueWritingCards = async (): Promise<ApiResponse<WritingCard[]>> =>
  (await axiosClient.get<ApiResponse<WritingCard[]>>('/srs/writing/due')).data

/** Rates a written character and returns its rescheduled card; the card is created on the first rating. */
export const rateWriting = async (hanzi: string, rating: WritingRating): Promise<ApiResponse<WritingCard>> =>
  (await axiosClient.post<ApiResponse<WritingCard>>('/srs/writing/rate', { hanzi, rating })).data
