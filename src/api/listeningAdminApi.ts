import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { AdminLessonPage, LessonVisibility, ListeningCategory } from '@/types/listening'

const BASE = '/admin/listening'

export interface CategoryPayload {
  name: string
  slug?: string
  description?: string
  active?: boolean
}

export const adminCategories = async (): Promise<ListeningCategory[]> =>
  (await axiosClient.get<ApiResponse<ListeningCategory[]>>(`${BASE}/categories`)).data.data

export const createCategory = async (payload: CategoryPayload): Promise<ListeningCategory> =>
  (await axiosClient.post<ApiResponse<ListeningCategory>>(`${BASE}/categories`, payload)).data.data

export const updateCategory = async (id: number, payload: CategoryPayload): Promise<ListeningCategory> =>
  (await axiosClient.put<ApiResponse<ListeningCategory>>(`${BASE}/categories/${id}`, payload)).data.data

export const deleteCategory = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE}/categories/${id}`)
}

export const reorderCategories = async (ids: number[]): Promise<ListeningCategory[]> =>
  (await axiosClient.put<ApiResponse<ListeningCategory[]>>(`${BASE}/categories/order`, { ids })).data.data

export const adminLessons = async (filter: {
  visibility?: LessonVisibility | ''
  categoryId?: number
  q?: string
  page?: number
}): Promise<AdminLessonPage> => {
  const params = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== undefined && v !== ''))
  return (await axiosClient.get<ApiResponse<AdminLessonPage>>(`${BASE}/lessons`, { params })).data.data
}

export const approveLesson = async (
  id: number,
  payload: { categoryIds: number[]; title?: string; description?: string; hskLevel?: string; note?: string }
): Promise<void> => {
  await axiosClient.post(`${BASE}/lessons/${id}/approve`, payload)
}

export const rejectLesson = async (id: number, note: string): Promise<void> => {
  await axiosClient.post(`${BASE}/lessons/${id}/reject`, { note })
}

export const hideLesson = async (id: number, note?: string): Promise<void> => {
  await axiosClient.post(`${BASE}/lessons/${id}/hide`, { note })
}

export const setLessonCategories = async (id: number, categoryIds: number[]): Promise<void> => {
  await axiosClient.put(`${BASE}/lessons/${id}/categories`, { categoryIds })
}

export const adminDeleteLesson = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE}/lessons/${id}`)
}
