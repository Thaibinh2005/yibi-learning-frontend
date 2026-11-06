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
  type: 'REVIEW_CARDS' | 'REVIEW_MISTAKES' | 'PRACTICE' | 'LESSON'
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
  openMistakes: number
}

export interface LearningPathOverview {
  assessmentCompleted: boolean
  availableHskLevel: number
  latestScorePercent: number | null
  levelSummary: string
  skills: SkillStat[]
  goal: LearningGoal
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const getLearningPathOverview = async () =>
  (await axiosClient.get<ApiResponse<LearningPathOverview>>('/learning-path')).data.data

export type PathStatus = 'DONE' | 'CURRENT' | 'OPEN' | 'LOCKED'

export interface RoadmapNode {
  id: number
  title: string
  type: string
  minutes: number
  status: PathStatus
  wrongAnswers: number
  bestScore: number
}

export interface RoadmapUnit {
  id: number
  number: number
  title: string
  titleZh?: string | null
  icon?: string | null
  status: PathStatus
  completed: number
  total: number
  nodes: RoadmapNode[]
}

export interface RoadmapLevelSummary {
  level: number
  label: string
  status: PathStatus
  completed: number
  total: number
}

export interface Roadmap {
  learnerLevel: number
  shownLevel: number
  levels: RoadmapLevelSummary[]
  units: RoadmapUnit[]
}

export const getRoadmap = async (level?: number) =>
  (await axiosClient.get<ApiResponse<Roadmap>>('/learning-path/roadmap', { params: level ? { level } : undefined })).data.data

export type PathContentItem = Record<string, unknown>

export interface PathNodeDetail {
  id: number
  title: string
  type: string
  hskLevel: number
  unitTitle: string
  status: PathStatus
  bestScore: number
  content: Record<string, unknown>
}

export interface QuizQuestion {
  id: string
  type: string
  prompt: string
  pinyin?: string | null
  audioText?: string | null
  options: string[]
  /** An old mistake asked again; it does not count towards the score. */
  fromMistakes: boolean
}

export interface PathQuiz {
  seed: number
  passPercent: number
  questions: QuizQuestion[]
}

export interface CheckedAnswer {
  correct: boolean
  correctAnswer: string
  explanation: string
}

export interface QuizOutcome {
  scorePercent: number
  correct: number
  total: number
  passed: boolean
  cardsAdded: number
  nextNodeId?: number | null
  newLevel?: number | null
  mistakesAdded: number
  mistakesReviewed: number
  mistakesResolved: number
}

export interface MistakeItem {
  id: number
  level: number
  skill: string
  prompt: string
  answer: string
  lastPicked?: string | null
  wrongCount: number
  correctStreak: number
}

export interface MistakesSummary {
  open: number
  resolved: number
  streakToResolve: number
  items: MistakeItem[]
}

export const getMistakes = async () =>
  (await axiosClient.get<ApiResponse<MistakesSummary>>('/learning-path/mistakes')).data.data

export interface SpeakingResult {
  accuracy: number
  passed: boolean
}

export const getPathNode = async (id: number) =>
  (await axiosClient.get<ApiResponse<PathNodeDetail>>(`/learning-path/nodes/${id}`)).data.data

/** Where a quiz lives: one node, or the test on a whole level. */
export const quizApi = (base: string) => ({
  start: async () => (await axiosClient.post<ApiResponse<PathQuiz>>(base)).data.data,
  check: async (seed: number, questionId: string, answer: string) =>
    (await axiosClient.post<ApiResponse<CheckedAnswer>>(`${base}/check`, { seed, questionId, answer })).data.data,
  submit: async (seed: number, answers: Record<string, string>) =>
    (await axiosClient.post<ApiResponse<QuizOutcome>>(`${base}/submit`, { seed, answers })).data.data,
})

export const scoreDialogueLine = async (nodeId: number, lineIndex: number, audio: Blob) => {
  const form = new FormData()
  form.append('lineIndex', String(lineIndex))
  form.append('audio', audio, 'speech.webm')
  const response = await axiosClient.post<ApiResponse<SpeakingResult>>(`/learning-path/nodes/${nodeId}/speak`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Scoring runs Whisper on the server, which can take longer than the default 15 s.
    timeout: 100_000,
  })
  return response.data.data
}

export const getTodayPlan = async () =>
  (await axiosClient.get<ApiResponse<DailyPlan>>('/learning-path/today')).data.data

export const updateLearningGoal = async (goal: LearningGoalInput) =>
  (await axiosClient.put<ApiResponse<LearningGoal>>('/learning-path/goal', goal)).data.data

export interface StudyStats {
  streakDays: number
  todayMinutes: number
  dailyGoalMinutes: number
  goalPercent: number
  answersToday: number
  accuracyToday: number
  nodesCompleted: number
  dueCards: number
  bestExamScore?: number | null
  bestExamLevel?: number | null
  week: Array<{ date: string; minutes: number; goalMet: boolean }>
}

export const getStudyStats = async () =>
  (await axiosClient.get<ApiResponse<StudyStats>>('/learning-path/stats')).data.data

export const recordStudyActivity = async (seconds: number) => {
  await axiosClient.post('/learning-path/activity', { seconds })
}

export interface ExamQuestion {
  id: string
  kind: 'CHOICE' | 'TYPING'
  prompt: string
  options: string[]
}

export interface ExamPaper {
  seed: number
  level: number
  durationMinutes: number
  passPercent: number
  sections: Array<{
    title: string
    kind: string
    passages: Array<{ title?: string | null; text?: string | null; audioUrl?: string | null; questions: ExamQuestion[] }>
  }>
}

export interface ExamResult {
  scorePercent: number
  correct: number
  total: number
  passed: boolean
  review: Array<{ id: string; correct: boolean; answer: string; explanation: string }>
}

export const startMockExam = async (level: number) =>
  (await axiosClient.post<ApiResponse<ExamPaper>>(`/learning-path/mock-exam/${level}`)).data.data

export const submitMockExam = async (level: number, seed: number, answers: Record<string, string>) =>
  (await axiosClient.post<ApiResponse<ExamResult>>(`/learning-path/mock-exam/${level}/submit`, { seed, answers })).data.data

export const getPinyinCandidates = async (typed: string) =>
  (await axiosClient.get<ApiResponse<string[]>>('/learning-path/ime', { params: { q: typed } })).data.data
