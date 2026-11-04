export type HskLevelCode = '1' | '2' | '3' | '4' | '5' | '6' | '7-9'

export type QuestionTypeCode =
  | 'PHONETICS_SELECT'
  | 'MEANING_HANZI'
  | 'VOCAB_MEANING'
  | 'CLOZE'
  | 'GRAMMAR_SELECT'

export type QuestionStatusCode = 'DRAFT' | 'PUBLISHED' | 'REVIEWED' | 'RETIRED' | 'REJECTED'

export interface ChoicePreview {
  key: string
  text: string
  correct: boolean
}

export interface GeneratedQuestionPreview {
  questionCode: string
  questionType: QuestionTypeCode | string
  levelCode: string
  skillKey: string
  topicKey: string
  prompt: string
  promptPinyin?: string | null
  correctAnswer: string
  choices: ChoicePreview[]
  explanation: string
  sourceRawRecordId?: number | null
  validationStatus: string
  skipReason?: string | null
}

export interface GeneratorRunResult {
  mode: 'dry-run' | 'import'
  levelCode: string
  questionType: string
  requestedLimit: number
  generated: number
  skipped: number
  failedGate: number
  imported: number
  alreadyExisted: number
  failedInsert: number
  questions: GeneratedQuestionPreview[]
}

export interface QuestionGeneratorParams {
  levelCode: string
  questionType: string
  limit: number
  mode: 'dry-run' | 'import'
}

export interface QuestionBankChoice {
  id: number
  key: string
  order: number
  text: string
  audioUrl?: string | null
  correct: boolean
}

export interface QuestionBankItem {
  id: number
  questionCode: string
  questionType: string
  skillKey: string
  standardCode: string
  versionCode: string
  levelCode: string
  topicKey: string
  prompt: string
  promptPinyin?: string | null
  promptAudioUrl?: string | null
  answerText: string
  explanation: string
  difficulty: number
  origin: string
  status: QuestionStatusCode | string
  lessonId?: number | null
  sourceRawRecordId?: number | null
  contentHash?: string | null
  createdAt?: string
  updatedAt?: string
  choices: QuestionBankChoice[]
}

export interface QuestionBankPageResponse {
  items: QuestionBankItem[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface QuestionBankStats {
  totalQuestions: number
  publishedCount: number
  draftCount: number
  withAudioCount: number
  byLevel: Record<string, number>
  byType: Record<string, number>
  bySkill: Record<string, number>
}

export interface QuestionBankQueryParams {
  levelCode?: string
  skillKey?: string
  questionType?: string
  status?: string
  search?: string
  page?: number
  size?: number
}

export interface ChoiceUpdateRequest {
  key: string
  text: string
  correct: boolean
}

export interface QuestionUpdateRequest {
  prompt: string
  promptPinyin?: string
  promptAudioUrl?: string
  explanation?: string
  difficulty?: number
  status?: string
  choices: ChoiceUpdateRequest[]
}


export interface AiGenerationParams {
  levelCode: string
  skillKey: string
  questionType: string
  topicKey?: string
  difficulty?: number
  count?: number
}

export interface AiGenerationResult {
  requested: number
  model: string
  /** Ids of the DRAFT questions that were saved. */
  createdIds: number[]
  /** Why each rejected question was not saved. */
  rejected: string[]
}

export interface PoolCoverageCell {
  levelCode: string
  skillKey: string
  published: number
  target: number
  missing: number
}

export interface PoolCoverage {
  ready: boolean
  totalMissing: number
  cells: PoolCoverageCell[]
}
