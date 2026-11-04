export type StartMode = 'BASIC' | 'PLACEMENT'

export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'

export interface SurveyRequest {
  selfLevel: number
  startMode: StartMode
}

export interface PlacementStatus {
  onboardingCompleted: boolean
  startMode?: StartMode
  selfReportedLevel?: number
  hskLevel?: number
  inProgressAttemptId?: number
  latestAttemptId?: number
  poolReady: boolean
  speakingAvailable: boolean
}

export type QuestionType =
  | 'VOCAB_MEANING'
  | 'MEANING_HANZI'
  | 'PHONETICS_SELECT'
  | 'CLOZE'
  | 'GRAMMAR_SELECT'
  | 'SENTENCE_ORDER'
  | 'ERROR_CORRECTION'
  | 'LISTEN_WORD'
  | 'LISTEN_SENTENCE'
  | 'LISTEN_DIALOGUE'
  | 'READING_COMPREHENSION'
  | 'TRANSLATION'
  | 'KEYWORD_SENTENCE'
  | 'READ_ALOUD'

export interface PlacementChoice {
  key: string
  text: string
}

export interface PlacementQuestion {
  id: number
  skill: string
  type: QuestionType
  prompt: string
  promptPinyin?: string
  /** An audio URL, or `tts:<text>` when the browser should read the text aloud. */
  audioUrl?: string
  choices: PlacementChoice[]
  order: number
}

export interface SkillProgress {
  skill: string
  label: string
  answered: number
}

export interface PlacementStep {
  attemptId: number
  finished: boolean
  question?: PlacementQuestion
  answered: number
  minimumQuestions: number
  maximumQuestions: number
  skillProgress: SkillProgress[]
}

export interface PlacementAnswer {
  questionId: number
  choiceKey: string
  responseTimeSeconds: number
}

export interface SkillScore {
  skill: string
  label: string
  attempts: number
  correct: number
  theta: number
  level: number
}

export interface MissedWord {
  word: string
  pinyin: string
  inDeck: boolean
}

export interface PlacementResult {
  attemptId: number
  level: number
  confidence: Confidence
  theta: number
  standardError: number
  questionCount: number
  recommendedLevel: number
  skillScores: SkillScore[]
  strengths: string[]
  weaknesses: string[]
  weakTopics: string[]
  recommendedCourseId?: number
  recommendedCourseTitle?: string
  reviewCardsAdded: number
  missedWords: MissedWord[]
}
