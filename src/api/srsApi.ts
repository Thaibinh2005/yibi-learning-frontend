import axiosClient from '@/api/axiosClient'
import type { LevelMeaning, MeasureWord } from '@/types/vocabulary'

interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface SrsCard {
  cardId: number
  vocabularyId: number
  hanzi: string
  pinyin: string
  meaningVi: string | null
  hskLevel: number | null
  levelCode?: string
  exampleSentence: string | null
  examplePinyin: string | null
  exampleTranslation?: string | null
  exampleAudioUrl?: string | null
  measureWords?: MeasureWord[]
  partOfSpeech?: string | null
  levelMeaning?: LevelMeaning | null
  audioUrl: string | null
  intervalDays?: number
  dueDate?: string
  /** Right answers in a row; 0 after "Học lại". */
  repetition?: number
  /** Absent for a card never reviewed. */
  lastReviewed?: string | null
}

/** Four-button rating used by topic flashcards. */
export type SrsRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

export interface AddLessonCardsResult {
  added: number
  alreadyInDeck: number
  unavailable: number
}

export const addLessonVocabularyToFlashcards = async (lessonId: number) =>
  (await axiosClient.post<ApiResponse<AddLessonCardsResult>>(`/srs/add-lesson/${lessonId}`)).data.data

/** Cards due today; with a deck id, only the words of that deck. */
export const getDueFlashcards = async (deckId?: number) =>
  (await axiosClient.get<ApiResponse<SrsCard[]>>('/srs/due', { params: deckId ? { deckId } : undefined })).data.data

/** Rates a word (adds it to the user's deck if missing) and returns the rescheduled card. */
export const rateVocabulary = async (vocabularyId: number, rating: SrsRating) =>
  (await axiosClient.post<ApiResponse<SrsCard>>('/srs/rate', { vocabularyId, rating })).data.data

export const reviewFlashcard = async (cardId: number, grade: number) =>
  (await axiosClient.post<ApiResponse<SrsCard>>('/srs/review', { cardId, grade })).data.data

/** The learner's flashcard for a word (absent if none) and their decks, marking those holding it. */
export interface WordStudy {
  vocabularyId: number
  card?: {
    status: 'NEW' | 'LEARNING' | 'MASTERED'
    repetitions: number
    intervalDays: number
    easeFactor: number
    dueDate: string
    lastReviewed?: string | null
    due: boolean
  } | null
  decks: { id: number; name: string; contains: boolean }[]
}

export const getWordStudy = async (vocabularyId: number) =>
  (await axiosClient.get<ApiResponse<WordStudy>>(`/srs/words/${vocabularyId}`)).data.data

/** A word's flashcard state for the learner; a word with no flashcard has no entry. */
export interface WordStatus {
  vocabularyId: number
  status: 'NEW' | 'LEARNING' | 'MASTERED'
  due: boolean
}

export const getWordStatuses = async (ids: number[]) =>
  (await axiosClient.get<ApiResponse<WordStatus[]>>('/srs/word-status', { params: { ids: ids.join(',') } })).data.data

export const addFlashcard = async (vocabularyId: number) =>
  (await axiosClient.post<ApiResponse<SrsCard>>(`/srs/add/${vocabularyId}`)).data.data
