import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'

export type HskkTierCode = 'PRIMARY' | 'INTERMEDIATE' | 'ADVANCED'

export interface HskkTier {
  tier: HskkTierCode
  open: boolean
  requiredLevel: number
  bestScore?: number | null
  attempts: number
}

export interface HskkStatus {
  speechReady: boolean
  tiers: HskkTier[]
  targetScore?: number | null
}

export interface HskkQuestion {
  id: string
  kind: 'REPEAT' | 'REPLY' | 'SPEAK' | 'RETELL' | 'READ'
  listenText?: string | null
  showText?: string | null
  prepSeconds: number
  answerSeconds: number
}

export interface HskkPaper {
  attemptId: number
  tier: HskkTierCode
  parts: Array<{ title: string; instruction: string; questions: HskkQuestion[] }>
}

export interface HskkResult {
  scorePercent: number
  passed: boolean
  passPercent: number
  targetScore?: number | null
  reachedTarget?: boolean | null
  answered: number
  total: number
  parts: Array<{
    title: string
    weight: number
    averageScore: number
    items: Array<{ questionId: string; kind: HskkQuestion['kind']; reference: string; transcript?: string | null; score: number; answered: boolean }>
  }>
}

export const getHskkStatus = async () =>
  (await axiosClient.get<ApiResponse<HskkStatus>>('/hskk/status')).data.data

export const startHskk = async (tier: HskkTierCode) =>
  (await axiosClient.post<ApiResponse<HskkPaper>>(`/hskk/${tier}/start`)).data.data

export const submitHskkAnswer = async (attemptId: number, questionId: string, audio: Blob) => {
  const form = new FormData()
  form.append('questionId', questionId)
  form.append('audio', audio, 'answer.webm')
  // Recognition runs on the server and a long answer takes a while.
  return (await axiosClient.post<ApiResponse<{ questionId: string; score: number }>>(`/hskk/attempts/${attemptId}/answers`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120_000,
  })).data.data
}

export const finishHskk = async (attemptId: number) =>
  (await axiosClient.post<ApiResponse<HskkResult>>(`/hskk/attempts/${attemptId}/finish`)).data.data
