import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthResponse } from '@/types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialAccessToken = localStorage.getItem('yibi_access_token')
const initialRefreshToken = localStorage.getItem('yibi_refresh_token')
const storedUser = localStorage.getItem('yibi_user')

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: !!initialAccessToken,
  isLoading: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<AuthResponse>
    ) => {
      const { access_token, refresh_token, userId, username, email, role, hskLevel } = action.payload
      const user: User = { id: userId, username, email, role, hskLevel }

      state.accessToken = access_token
      state.refreshToken = refresh_token
      state.user = user
      state.isAuthenticated = true

      localStorage.setItem('yibi_access_token', access_token)
      localStorage.setItem('yibi_refresh_token', refresh_token)
      localStorage.setItem('yibi_user', JSON.stringify(user))
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      localStorage.setItem('yibi_access_token', action.payload)
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false

      localStorage.removeItem('yibi_access_token')
      localStorage.removeItem('yibi_refresh_token')
      localStorage.removeItem('yibi_user')
    },
  },
})

export const { setCredentials, updateAccessToken, logout } = authSlice.actions
export default authSlice.reducer
