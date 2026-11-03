import axiosClient from '@/api/axiosClient'
import type { MeasureWord } from '@/types/vocabulary'

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
  audioUrl: string | null
  intervalDays?: number
  dueDate?: string
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

export const getDueFlashcards = async () =>
  (await axiosClient.get<ApiResponse<SrsCard[]>>('/srs/due')).data.data

/** Rates a word (adds it to the user's deck if missing) and returns the rescheduled card. */
export const rateVocabulary = async (vocabularyId: number, rating: SrsRating) =>
  (await axiosClient.post<ApiResponse<SrsCard>>('/srs/rate', { vocabularyId, rating })).data.data

export const reviewFlashcard = async (cardId: number, grade: number) =>
  (await axiosClient.post<ApiResponse<SrsCard>>('/srs/review', { cardId, grade })).data.data
