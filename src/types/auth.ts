export interface User {
  id: string
  username: string
  /** The name shown in the app; older stored sessions may lack it, so fall back to the username. */
  displayName?: string
  /** Profile picture link (Google sign-in); absent shows the initial. */
  avatarUrl?: string | null
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
  displayName?: string
  avatarUrl?: string | null
  email: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  hskLevel?: number
  access_token: string
  /** No longer sent: the refresh token travels in an HttpOnly cookie. */
  refresh_token?: string
  token_type: string
  expires_in: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}
