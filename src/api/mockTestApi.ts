import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'

export type MockMode = 'PRACTICE' | 'EXAM'
export type MockSkill = 'listening' | 'reading' | 'writing'
export type MockLayout =
  | 'image_choice' | 'text_choice' | 'shared_images' | 'shared_text_right' | 'word_bank' | 'passage_choice'
  | 'shared_text' | 'radical_choice' | 'fill_char' | 'picture_word' | 'essay'
  | 'cloze_shared' | 'cloze_choice' | 'ordering' | 'group_choice'

export interface MockOption {
  key: string
  text?: string
  pinyin?: string
  image?: string
}

export interface MockAudio {
  file: string
  start?: number
  end?: number
  /** Drafts only: the clip's marks were guessed and a person should listen to it. */
  needsReview?: boolean
}

/** A passage, a block with its own options, or one listening clip shared by several questions. */
export interface MockGroup {
  id: string
  range: [number, number]
  passage?: string
  passagePinyin?: string
  sharedOptions?: MockOption[]
  images?: string[]
  audio?: MockAudio
  transcript?: string
}

/** choice (default): pick A–F · fill: write the character for the pinyin · write: open writing, not scored */
export type MockQuestionType = 'choice' | 'fill' | 'write'

export interface MockQuestion {
  /** Absent on a part's example. */
  no?: number
  question?: string
  questionPinyin?: string
  passage?: string
  passagePinyin?: string
  options?: MockOption[]
  optionsFrom?: 'shared' | 'group'
  group?: string
  type?: MockQuestionType
  /** radical_choice: which character of `question` is incomplete, and the part of it that is printed. */
  partial?: { index: number; shown: string }
  /** fill: the pinyin printed in the blank. */
  blankPinyin?: string
  /** write: the word to use, the picture, or an essay prompt with its minimum length. */
  word?: string
  image?: string
  images?: string[]
  prompt?: string
  minChars?: number
  /** write: model answer (withheld during a timed exam). */
  reference?: string
  audio?: MockAudio
  /** Sent in practice mode and after handing in; withheld during a timed exam. */
  answer?: string | null
  transcript?: string
}

export interface MockSection {
  skill: MockSkill
  part: number
  layout: MockLayout
  range: [number, number]
  instructionZh?: string
  introAudio?: MockAudio
  sharedOptions?: MockOption[]
  groups?: MockGroup[]
  example?: MockQuestion
  questions: MockQuestion[]
}

export interface MockPaper {
  id: string
  title: string
  level: number
  stage: string
  source: string
  durationMinutes: number
  questionCount: number
  parts: Array<{ skill: MockSkill; questionCount: number; minutes?: number | null }>
  sections: MockSection[]
}

export interface MockSummary {
  id: string
  title: string
  level: number
  stage: string
  source: string
  durationMinutes: number
  questionCount: number
  parts: Array<{ skill: MockSkill; questionCount: number; minutes?: number | null }>
  openAttempt?: { id: number; mode: MockMode; answeredCount: number; currentIndex: number } | null
  lastResult?: { id: number; mode: MockMode; score: number; maxScore: number; passed: boolean; correct: number; total: number; finishedAt: string } | null
}

export interface MockAttempt {
  id: number
  testId: string
  paperVersion?: number
  mode: MockMode
  answers: Record<string, string>
  currentIndex: number
  elapsedSeconds: number
  startedAt: string
  finishedAt?: string | null
  correct?: number | null
  total?: number | null
  score?: number | null
  maxScore?: number | null
  passed?: boolean | null
  skills?: Record<string, { correct: number; total: number; score: number }> | null
}

export interface MockAttemptView {
  attempt: MockAttempt
  paper: MockPaper
}

export const groupOf = (section: MockSection, question: MockQuestion) =>
  question.group ? section.groups?.find((g) => g.id === question.group) : undefined

/** The options a question is answered from: its own, its group's, or its part's. */
export const optionsOf = (section: MockSection, question: MockQuestion): MockOption[] => {
  if (question.options) return question.options
  if (question.optionsFrom === 'group') return groupOf(section, question)?.sharedOptions ?? []
  if (question.optionsFrom === 'shared') return section.sharedOptions ?? []
  return []
}

/** Open writing is kept for the learner to compare with the model answer but not scored. */
export const isScored = (question: MockQuestion) => question.type !== 'write'

/** A written character counts without spaces or punctuation ("的。" is "的"). */
export const bare = (text: string) => text.replace(/[\s\p{P}]/gu, '')

export const isCorrect = (question: MockQuestion, answer?: string) => {
  if (!answer || !question.answer || !isScored(question)) return false
  return question.type === 'fill' ? bare(answer) === bare(question.answer) : answer === question.answer
}

export interface MockProgress {
  answers: Record<string, string>
  currentIndex: number
  elapsedSeconds: number
}

export const listMockTests = async () =>
  (await axiosClient.get<ApiResponse<MockSummary[]>>('/mock-tests')).data.data

export const startMockTest = async (testId: string, mode: MockMode) =>
  (await axiosClient.post<ApiResponse<MockAttemptView>>(`/mock-tests/${encodeURIComponent(testId)}/attempts`, { mode })).data.data

export const getMockAttempt = async (attemptId: number) =>
  (await axiosClient.get<ApiResponse<MockAttemptView>>(`/mock-tests/attempts/${attemptId}`)).data.data

export const saveMockAttempt = async (attemptId: number, progress: MockProgress) =>
  (await axiosClient.put<ApiResponse<MockAttempt>>(`/mock-tests/attempts/${attemptId}`, progress)).data.data

export const submitMockAttempt = async (attemptId: number, progress: MockProgress) =>
  (await axiosClient.post<ApiResponse<MockAttemptView>>(`/mock-tests/attempts/${attemptId}/submit`, progress)).data.data

export const discardMockAttempt = async (attemptId: number) => {
  await axiosClient.delete(`/mock-tests/attempts/${attemptId}`)
}

export const SKILL_LABEL: Record<MockSkill, string> = { listening: 'Nghe', reading: 'Đọc', writing: 'Viết' }
