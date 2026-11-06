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
  hskLevel: number
  contentType: string
}

export type GoalType = 'HSK' | 'HSKK' | 'COMMUNICATION'

export interface LearningGoalInput {
  goalType: GoalType
  targetLevel: number
  targetScore?: number | null
  targetDate?: string | null
  dailyMinutes: number
}

export interface LearningGoal extends LearningGoalInput {
  goalSet: boolean
}

export interface DailyPlanItem {
  type: 'REVIEW_CARDS' | 'PRACTICE' | 'LESSON'
  title: string
  detail: string
  minutes: number
  link: string
  lessonId?: number | null
}

export interface DailyPlan {
  goal: LearningGoal
  currentLevel: number
  minutesBudget: number
  minutesPlanned: number
  items: DailyPlanItem[]
  remainingLessons: number
  estimatedDays: number
  estimatedFinishDate: string
  onTrack?: boolean | null
  requiredDailyMinutes?: number | null
}

export interface LearningPathOverview {
  assessmentCompleted: boolean
  availableHskLevel: number
  latestScorePercent: number | null
  levelSummary: string
  skills: SkillStat[]
  recommendedLessons: RecommendedLesson[]
  goal: LearningGoal
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const getLearningPathOverview = async () =>
  (await axiosClient.get<ApiResponse<LearningPathOverview>>('/learning-path')).data.data

export const getTodayPlan = async () =>
  (await axiosClient.get<ApiResponse<DailyPlan>>('/learning-path/today')).data.data

export const updateLearningGoal = async (goal: LearningGoalInput) =>
  (await axiosClient.put<ApiResponse<LearningGoal>>('/learning-path/goal', goal)).data.data
