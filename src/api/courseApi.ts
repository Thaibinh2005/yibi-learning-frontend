import axiosClient from '@/api/axiosClient'

export interface Course {
  id: number
  title: string
  description: string | null
  hskLevel: number
  totalLessons: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const getCourses = async (hskLevel?: number): Promise<Course[]> => {
  const response = await axiosClient.get<ApiResponse<Course[]>>('/courses', {
    params: hskLevel ? { hskLevel } : undefined,
  })
  return response.data.data
}
