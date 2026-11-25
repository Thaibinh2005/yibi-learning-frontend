import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { GrammarPoint } from '@/types/grammar'

/** The grammar points of one library lesson with their notes; open to guests. */
export const getLessonGrammar = async (lessonId: number): Promise<ApiResponse<GrammarPoint[]>> => {
  const response = await axiosClient.get<ApiResponse<GrammarPoint[]>>(`/grammar/lesson/${lessonId}`)
  return response.data
}
