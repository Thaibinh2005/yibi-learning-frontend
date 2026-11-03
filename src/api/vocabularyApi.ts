import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { Vocabulary, DailyVocabulary, VocabularyQueryParams } from '@/types/vocabulary'

/**
 * Gọi endpoint GET /api/vocabularies với các tham số query (params):
 * - hskLevel?: number | string (1-6 or a source band such as "7-9")
 * - search?: string (Hán tự, Pinyin, hoặc nghĩa Việt)
 * - page?: number (mặc định 0)
 * - size?: number (mặc định 20)
 */
export const getVocabularies = async (
  params?: VocabularyQueryParams
): Promise<ApiResponse<Vocabulary[]>> => {
  const response = await axiosClient.get<ApiResponse<Vocabulary[]>>('/vocabularies', {
    params,
  })
  return response.data
}

export const getVocabularyById = async (
  id: number
): Promise<ApiResponse<Vocabulary>> => {
  const response = await axiosClient.get<ApiResponse<Vocabulary>>(`/vocabularies/${id}`)
  return response.data
}

export const getDailyVocabularies = async (
  params?: { hskLevel?: string; days?: number }
): Promise<ApiResponse<DailyVocabulary[]>> => {
  const response = await axiosClient.get<ApiResponse<DailyVocabulary[]>>('/vocabularies/daily', {
    params,
  })
  return response.data
}

export const getRandomVocabulary = async (
  hskLevel?: string
): Promise<ApiResponse<DailyVocabulary>> => {
  const response = await axiosClient.get<ApiResponse<DailyVocabulary>>('/vocabularies/random', {
    params: { hskLevel },
  })
  return response.data
}

export const vocabularyApi = {
  getVocabularies,
  getVocabularyById,
  getDailyVocabularies,
  getRandomVocabulary,
}

export default vocabularyApi
