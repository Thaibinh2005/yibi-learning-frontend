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

  /** Step 1 of sign-up: checks the form and emails a 6-digit code. Nothing is created yet. */
  sendRegisterOtp: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/register/send-otp', data)
    return response.data
  },

  resendRegisterOtp: async (email: string): Promise<ApiResponse<void>> => {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/register/resend-otp', { email })
    return response.data
  },

  /** Step 2 of sign-up: the right code creates the account and signs it in. */
  verifyRegisterOtp: async (email: string, code: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register/verify', { email, code })
    return response.data
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/logout')
    return response.data
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword })
    return response.data
  },

  exchangeGoogleCode: async (code: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/google/exchange', { code })
    return response.data
  },

  /** Uses the HttpOnly refresh cookie; the page never sees the refresh token. */
  refresh: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/refresh')
    return response.data
  },
}
