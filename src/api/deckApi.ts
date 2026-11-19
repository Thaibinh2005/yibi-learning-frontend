import axiosClient from '@/api/axiosClient'

interface ApiResponse<T> { success: boolean; message: string; data: T }

/** A personal vocabulary deck with its progress (learnt = reviewed at least once, mastered = right 3 times in a row). */
export interface Deck {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  totalWords: number
  learnedWords: number
  masteredWords: number
  dueWords: number
}

export type MemoryStatus = 'NEW' | 'LEARNING' | 'MASTERED'

export interface DeckWord {
  vocabularyId: number
  hanzi: string
  pinyin: string | null
  meaning: string | null
  levelCode: string | null
  addedAt: string
  lastReviewed: string | null
  dueDate: string | null
  repetitions: number
  intervalDays: number
  status: MemoryStatus
  due: boolean
}

export interface DeckWordPage {
  deck: Deck
  items: DeckWord[]
  total: number
  page: number
  size: number
  /** Every word id of the deck, to mark search results already added. */
  memberIds: number[]
}

export interface DeckChangeResult { changed: number; skipped: number }

export type DeckWordStatusFilter = '' | 'NEW' | 'LEARNING' | 'MASTERED' | 'LEARNED' | 'DUE'
export type DeckWordSort = 'added' | 'reviewed' | 'memory'

export interface DeckWordQuery {
  search?: string
  level?: string
  topic?: string
  status?: DeckWordStatusFilter
  sort?: DeckWordSort
  direction?: 'asc' | 'desc'
  page?: number
  size?: number
}

/** The server's message for a failed call, or the fallback. */
export const deckError = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

export const getDecks = async () => (await axiosClient.get<ApiResponse<Deck[]>>('/decks')).data.data

export const createDeck = async (name: string) =>
  (await axiosClient.post<ApiResponse<Deck>>('/decks', { name })).data.data

export const renameDeck = async (deckId: number, name: string) =>
  (await axiosClient.patch<ApiResponse<Deck>>(`/decks/${deckId}`, { name })).data.data

export const deleteDeck = async (deckId: number) => {
  await axiosClient.delete(`/decks/${deckId}`)
}

export const getDeckWords = async (deckId: number, query: DeckWordQuery) => {
  const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v !== undefined))
  return (await axiosClient.get<ApiResponse<DeckWordPage>>(`/decks/${deckId}/words`, { params })).data.data
}

export const addDeckWords = async (deckId: number, vocabularyIds: number[]) =>
  (await axiosClient.post<ApiResponse<DeckChangeResult>>(`/decks/${deckId}/words`, { vocabularyIds })).data.data

export const removeDeckWords = async (deckId: number, vocabularyIds: number[]) =>
  (await axiosClient.post<ApiResponse<DeckChangeResult>>(`/decks/${deckId}/words/remove`, { vocabularyIds })).data.data

export const transferDeckWords = async (
  deckId: number,
  targetDeckId: number,
  mode: 'MOVE' | 'COPY',
  vocabularyIds: number[]
) =>
  (await axiosClient.post<ApiResponse<DeckChangeResult>>(`/decks/${deckId}/words/transfer`, { targetDeckId, mode, vocabularyIds }))
    .data.data
