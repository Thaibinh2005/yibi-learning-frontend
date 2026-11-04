import axiosClient from '@/api/axiosClient'
import type { ApiResponse } from '@/types/auth'
import type {
  PlacementAnswer,
  PlacementResult,
  PlacementStatus,
  PlacementStep,
  SurveyRequest,
} from '@/types/placement'

// Scoring a recording runs Whisper on the server, which can take longer than the default 15 s.
const SPEAKING_TIMEOUT_MS = 100_000

export const saveSurvey = async (request: SurveyRequest) =>
  (await axiosClient.post<ApiResponse<string>>('/onboarding/survey', request)).data.data

export const getPlacementStatus = async () =>
  (await axiosClient.get<ApiResponse<PlacementStatus>>('/placement/status')).data.data

export const startPlacement = async () =>
  (await axiosClient.post<ApiResponse<PlacementStep>>('/placement/start')).data.data

export const answerPlacement = async (attemptId: number, answer: PlacementAnswer) =>
  (await axiosClient.post<ApiResponse<PlacementStep>>(`/placement/${attemptId}/answer`, answer)).data.data

export const answerPlacementSpeaking = async (
  attemptId: number,
  questionId: number,
  audio: Blob,
  responseTimeSeconds: number,
) => {
  const form = new FormData()
  form.append('questionId', String(questionId))
  form.append('responseTimeSeconds', String(responseTimeSeconds))
  form.append('audio', audio, 'speech.webm')
  const response = await axiosClient.post<ApiResponse<PlacementStep>>(`/placement/${attemptId}/speaking`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: SPEAKING_TIMEOUT_MS,
  })
  return response.data.data
}

export const skipPlacementQuestion = async (attemptId: number, questionId: number) =>
  (await axiosClient.post<ApiResponse<PlacementStep>>(`/placement/${attemptId}/skip`, null, {
    params: { questionId },
  })).data.data

export const abandonPlacement = async (attemptId: number) =>
  (await axiosClient.post<ApiResponse<string>>(`/placement/${attemptId}/abandon`)).data.data

export const getPlacementResult = async (attemptId: number) =>
  (await axiosClient.get<ApiResponse<PlacementResult>>(`/placement/${attemptId}/result`)).data.data
