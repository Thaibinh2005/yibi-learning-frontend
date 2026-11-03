import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { VocabTopic, TopicQueryParams } from '@/types/topic'
import type { Vocabulary } from '@/types/vocabulary'

export const getTopics = async (
  params?: TopicQueryParams
): Promise<ApiResponse<VocabTopic[]>> => {
  const response = await axiosClient.get<ApiResponse<VocabTopic[]>>('/topics', {
    params,
  })
  return response.data
}

export const getTopicBySlug = async (
  slug: string,
  hskLevel?: string
): Promise<ApiResponse<VocabTopic>> => {
  const response = await axiosClient.get<ApiResponse<VocabTopic>>(`/topics/${slug}`, {
    params: { hskLevel },
  })
  return response.data
}

export const getVocabulariesByTopic = async (
  slug: string,
  page: number = 0,
  size: number = 20,
  hskLevel?: string
): Promise<ApiResponse<Vocabulary[]>> => {
  const response = await axiosClient.get<ApiResponse<Vocabulary[]>>(
    `/topics/${slug}/vocabularies`,
    {
      params: { page, size, hskLevel },
    }
  )
  return response.data
}

export const topicApi = {
  getTopics,
  getTopicBySlug,
  getVocabulariesByTopic,
}

export default topicApi

