import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/app/store'
import { LEGACY_REFRESH_KEY, logout, setCredentials } from '@/app/slices/authSlice'
import type { ApiResponse, AuthResponse } from '@/types/auth'

export const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  // The refresh-token cookie (HttpOnly, path /api/auth) must travel with auth calls.
  withCredentials: true,
})

const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/logout', '/auth/google', '/auth/forgot-password', '/auth/reset-password']
const isAuthCall = (url?: string) => !!url && AUTH_PATHS.some((p) => url.includes(p))

let refreshing: Promise<string> | null = null

/**
 * A new access token from the refresh cookie. Concurrent callers share one request. A browser that still holds a
 * refresh token from before the cookie sends it once in the body; the answer moves it into the cookie.
 */
export function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    const legacy = localStorage.getItem(LEGACY_REFRESH_KEY)
    refreshing = axios
      .post<ApiResponse<AuthResponse>>('/api/auth/refresh', legacy ? { refreshToken: legacy } : {}, { withCredentials: true })
      .then((response) => {
        store.dispatch(setCredentials(response.data.data))
        return response.data.data.access_token
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

// ── Request: attach the access token, fetching one first when the page has just loaded ──
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const auth = store.getState().auth
    let token = auth.accessToken
    if (!token && auth.isAuthenticated && !isAuthCall(config.url)) {
      try {
        token = await refreshAccessToken()
      } catch {
        // The session is gone (cookie expired or revoked): continue as a guest; protected pages send to /login.
        store.dispatch(logout())
      }
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// ── Response: on 401 refresh once and retry ──
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (isAuthCall(originalRequest?.url)) return Promise.reject(error)

    // A guest has no session to refresh: hand the error to the page instead of forcing a trip to /login.
    if (!store.getState().auth.isAuthenticated) return Promise.reject(error)

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const token = await refreshAccessToken()
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosClient(originalRequest)
      } catch (refreshError) {
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
