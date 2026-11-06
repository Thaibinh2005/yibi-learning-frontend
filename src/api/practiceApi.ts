import axiosClient from './axiosClient'

export interface AdaptiveOption {
  key: string
  text: string
}

export interface AdaptiveQuestion {
  id?: number
  questionId?: number
  questionCode: string
  questionType: string
  skillKey: string
  topicKey: string
  prompt: string
  promptPinyin?: string
  promptAudioUrl?: string
  selectionReason: 'DUE_REVIEW' | 'WEAK_SKILL' | 'NEW_CONTENT'
  options: AdaptiveOption[]
}

export interface AdaptiveSessionResponse {
  sessionId: number
  levelCode: string
  questions: AdaptiveQuestion[]
}

export interface PracticeAnswerResult {
  correct: boolean
  correctAnswer: string
  explanation: string
  streak: number
  masteryScore: number
  intervalDays: number
  nextReviewAt: string
  attemptsCount: number
  correctCount: number
  sessionCompleted: boolean
  /** Read-aloud answers only: how close the recording was, from 0 to 1. */
  accuracy?: number
}

export interface SkillMasteryStat {
  skillKey: string
  label: string
  attemptsCount: number
  correctCount: number
  masteryScore: number
  accuracyPercent: number
  dueReviewCount: number
  correctStreak: number
  lastPracticedAt: string | null
}

export interface LevelMasteryStat {
  levelCode: string
  label: string
  attemptsCount: number
  correctCount: number
  accuracyPercent: number
  masteryScore: number
  dueReviewCount: number
}

export interface RecentSessionStat {
  sessionId: number
  levelCode: string
  mode: string
  state: string
  startedAt: string | null
  finishedAt: string | null
  totalAnswered: number
  correctAnswered: number
}

export interface MasterySummary {
  totalAttempts: number
  totalCorrect: number
  overallAccuracy: number
  averageMastery: number
  dueReviewCount: number
  bestStreak: number
  learnedTopicsCount: number
  skills: SkillMasteryStat[]
  levels: LevelMasteryStat[]
  recentSessions: RecentSessionStat[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const startAdaptiveSession = async (levelCode: string, limit: number = 10): Promise<AdaptiveSessionResponse> => {
  const response = await axiosClient.post<ApiResponse<AdaptiveSessionResponse>>('/practice/adaptive-sessions', {
    levelCode,
    limit,
  })
  return response.data.data
}

export const submitPracticeSpeaking = async (
  sessionId: number,
  questionCode: string,
  audio: Blob,
  responseTimeMs: number = 0,
): Promise<PracticeAnswerResult> => {
  const form = new FormData()
  form.append('questionCode', questionCode)
  form.append('responseTimeMs', String(responseTimeMs))
  form.append('audio', audio, 'speech.webm')
  const response = await axiosClient.post<ApiResponse<PracticeAnswerResult>>(`/practice/sessions/${sessionId}/speaking`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Scoring runs Whisper on the server, which can take longer than the default 15 s.
    timeout: 100_000,
  })
  return response.data.data
}

export const submitPracticeAnswer = async (
  sessionId: number,
  questionCode: string,
  answer: string,
  responseTimeMs: number = 0
): Promise<PracticeAnswerResult> => {
  const response = await axiosClient.post<ApiResponse<PracticeAnswerResult>>(
    `/practice/sessions/${sessionId}/answers`,
    {
      questionCode,
      answer,
      responseTimeMs,
    }
  )
  return response.data.data
}

export const getMasterySummary = async (): Promise<MasterySummary> => {
  const response = await axiosClient.get<ApiResponse<MasterySummary>>('/practice/mastery-summary')
  return response.data.data
}

