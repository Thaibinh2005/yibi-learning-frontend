import axiosClient from './axiosClient'
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/logout')
    return response.data
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken })
    return response.data
  },
}
