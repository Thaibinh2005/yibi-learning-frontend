import axiosClient from '@/api/axiosClient'

export type LessonContentItem = Record<string, unknown>

export interface LessonSections {
  objectives?: LessonContentItem[]
  phonetics?: LessonContentItem[]
  characters?: LessonContentItem[]
  vocabulary?: LessonContentItem[]
  dialogues?: LessonContentItem[]
  grammar?: LessonContentItem[]
  readings?: LessonContentItem[]
  exercises?: LessonContentItem[]
  culture_notes?: LessonContentItem[]
}

export interface LessonPayload {
  schema_version: number
  lesson_number: number
  title: string
  source?: {
    book_title?: string
    hsk_level?: number
    start_page?: number
    end_page?: number
    [key: string]: unknown
  }
  sections: LessonSections
  generated_lesson?: GeneratedLessonContent
}

export interface GeneratedLessonActivity {
  id: string
  question_code?: string
  topic_key?: string
  origin: 'ai_generated'
  type: 'multiple_choice'
  skill: 'vocabulary' | 'phonetics' | 'characters' | 'grammar'
  difficulty: 'easy' | 'medium'
  question: string
  options: string[]
  answer: string
  evidence: string
  explanation: string
  source_refs: Array<{ section: string; item_index: number }>
}

export interface GeneratedLessonContent {
  schema_version: number
  origin: 'ai_generated'
  generated_at: string
  model: string
  source_hash: string
  introduction: string
  objectives: string[]
  teaching_points: string[]
  activities: GeneratedLessonActivity[]
  source?: Record<string, unknown>
}

export interface Lesson {
  id: number
  courseId: number
  title: string
  lessonOrder: number
  lessonPayload: LessonPayload | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const getLessonsByCourse = async (courseId: number): Promise<Lesson[]> => {
  const response = await axiosClient.get<ApiResponse<Lesson[]>>(`/lessons/course/${courseId}`)
  return response.data.data
}

export const generateAiLessonContent = async (lessonId: number): Promise<GeneratedLessonContent> => {
  const response = await axiosClient.post<ApiResponse<GeneratedLessonContent>>(`/lessons/${lessonId}/ai-content`)
  return response.data.data
}

export const startLessonPracticeSession = async (lessonId: number): Promise<number> => {
  const response = await axiosClient.post<ApiResponse<{ sessionId: number }>>(`/practice/lessons/${lessonId}/sessions`)
  return response.data.data.sessionId
}

export interface PracticeAnswerResult {
  correct: boolean
  correctAnswer: string
  explanation: string
}

export const submitPracticeAnswer = async (
  sessionId: number,
  questionCode: string,
  answer: string,
  responseTimeMs: number,
): Promise<PracticeAnswerResult> => {
  const response = await axiosClient.post<ApiResponse<PracticeAnswerResult>>(
    `/practice/sessions/${sessionId}/answers`,
    { questionCode, answer, responseTimeMs },
  )
  return response.data.data
}
