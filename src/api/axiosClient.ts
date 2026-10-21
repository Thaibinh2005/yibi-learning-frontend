import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/app/store'
import { updateAccessToken, logout } from '@/app/slices/authSlice'
import type { ApiResponse, AuthResponse } from '@/types/auth'

export const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Request Interceptor: Attach JWT Access Token ────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('yibi_access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// ── Response Interceptor: Handle Token Refresh on 401 ───────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Skip refresh token logic for auth endpoints
    if (
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register')
    ) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue pending requests while token is being refreshed
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return axiosClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('yibi_refresh_token')
      if (!refreshToken) {
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post<ApiResponse<AuthResponse>>(
          '/api/auth/refresh',
          { refreshToken }
        )

        const newAccessToken = response.data.data.access_token
        store.dispatch(updateAccessToken(newAccessToken))

        processQueue(null, newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return axiosClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
