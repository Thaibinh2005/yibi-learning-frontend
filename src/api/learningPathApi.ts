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

export interface PlacementQuestion {
  id: string
  skillKey: string
  skillLabel: string
  topic: string
  lessonNumber: number
  prompt: string
  options: string[]
}

export interface PlacementTest {
  assessmentId: number
  hskLevel: number
  notice: string
  questions: PlacementQuestion[]
}

export interface AssessmentAnswer {
  questionId: string
  answer: string
  responseTimeSeconds: number
}

export interface AssessmentResult {
  assessmentId: number
  correctCount: number
  totalQuestions: number
  scorePercent: number
  levelSummary: string
  skills: SkillStat[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const getLearningPathOverview = async () =>
  (await axiosClient.get<ApiResponse<LearningPathOverview>>('/learning-path')).data.data

export const startPlacementAssessment = async () =>
  (await axiosClient.post<ApiResponse<PlacementTest>>('/learning-path/assessment')).data.data

export const submitPlacementAssessment = async (assessmentId: number, answers: AssessmentAnswer[]) =>
  (await axiosClient.post<ApiResponse<AssessmentResult>>(
    `/learning-path/assessment/${assessmentId}/submit`, { answers },
  )).data.data
