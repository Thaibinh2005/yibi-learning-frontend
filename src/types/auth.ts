export interface User {
  id: string
  username: string
  email: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  hskLevel?: number
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  userId: string
  username: string
  email: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  hskLevel?: number
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}
