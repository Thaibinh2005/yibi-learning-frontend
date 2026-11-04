import axiosClient from '@/api/axiosClient'

export interface SkillStat {
  skillKey: string
  label: string
  attempts: number
  accuracyPercent: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT'
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  lastPracticedAt: string | null
}

export interface RecommendedLesson {
  lessonId: number
  lessonNumber: number
  title: string
  reason: string
}

export interface LearningPathOverview {
  assessmentCompleted: boolean
  availableHskLevel: number
  latestScorePercent: number | null
  levelSummary: string
  skills: SkillStat[]
  recommendedLessons: RecommendedLesson[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const getLearningPathOverview = async () =>
  (await axiosClient.get<ApiResponse<LearningPathOverview>>('/learning-path')).data.data
