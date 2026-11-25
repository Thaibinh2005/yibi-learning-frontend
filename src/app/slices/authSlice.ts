import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthResponse } from '@/types/auth'

/**
 * Tokens never touch localStorage: the access token lives in memory only, the refresh token in an HttpOnly cookie the
 * page cannot read. localStorage keeps just the signed-in user's public details, which also tell a fresh page that a
 * session exists (the first request then gets an access token from the cookie).
 */
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  /** null until GET /placement/status has answered; not persisted. */
  onboardingCompleted: boolean | null
}

const USER_KEY = 'yibi_user'
/** Written by older versions; read once to move the session into the cookie, then removed. */
export const LEGACY_ACCESS_KEY = 'yibi_access_token'
export const LEGACY_REFRESH_KEY = 'yibi_refresh_token'

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function forgetLegacyTokens() {
  localStorage.removeItem(LEGACY_ACCESS_KEY)
  localStorage.removeItem(LEGACY_REFRESH_KEY)
}

const storedUser = readStoredUser()

const initialState: AuthState = {
  user: storedUser,
  accessToken: null,
  isAuthenticated: !!storedUser,
  isLoading: false,
  onboardingCompleted: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { access_token, userId, username, displayName, avatarUrl, email, role, hskLevel } = action.payload
      const user: User = { id: userId, username, displayName: displayName || username, avatarUrl: avatarUrl ?? null, email, role, hskLevel }

      state.accessToken = access_token
      state.user = user
      state.isAuthenticated = true

      localStorage.setItem(USER_KEY, JSON.stringify(user))
      forgetLegacyTokens()
    },
    /** After the account page saves a new display name. */
    setDisplayName: (state, action: PayloadAction<string>) => {
      if (!state.user) return
      state.user.displayName = action.payload
      localStorage.setItem(USER_KEY, JSON.stringify(state.user))
    },
    /** After the account page uploads or removes a picture. */
    setAvatarUrl: (state, action: PayloadAction<string | null>) => {
      if (!state.user) return
      state.user.avatarUrl = action.payload
      localStorage.setItem(USER_KEY, JSON.stringify(state.user))
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.onboardingCompleted = null

      localStorage.removeItem(USER_KEY)
      forgetLegacyTokens()
    },
  },
})

export const { setCredentials, setDisplayName, setAvatarUrl, updateAccessToken, setOnboardingCompleted, logout } = authSlice.actions
export default authSlice.reducer
