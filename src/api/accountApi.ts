import axiosClient from './axiosClient'
import type { ApiResponse, AuthResponse } from '@/types/auth'

export interface AccountProfile {
  id: string
  /** The sign-in name; it cannot change. */
  username: string
  displayName: string
  /** Google profile picture; null shows the initial. */
  avatarUrl?: string | null
  /** True when the shown picture was uploaded here (it can be removed; the Google picture then shows again). */
  avatarUploaded: boolean
  email: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  hskLevel?: number | null
  googleLinked: boolean
  /** False for a Google account that has never set a password of its own: no current password is asked. */
  passwordSet: boolean
  createdAt: string
  lastLogin?: string | null
}

export const getAccount = async () =>
  (await axiosClient.get<ApiResponse<AccountProfile>>('/account')).data.data

export const updateDisplayName = async (displayName: string) =>
  (await axiosClient.patch<ApiResponse<AccountProfile>>('/account/profile', { displayName })).data.data

export const uploadAvatar = async (picture: Blob) => {
  const form = new FormData()
  form.append('file', picture, 'avatar.jpg')
  return (await axiosClient.post<ApiResponse<AccountProfile>>('/account/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data.data
}

export const removeAvatar = async () =>
  (await axiosClient.delete<ApiResponse<AccountProfile>>('/account/avatar')).data.data

/** Other sessions are signed out; the answer carries new tokens for this one. */
export const changePassword = async (currentPassword: string | null, newPassword: string) =>
  (await axiosClient.post<ApiResponse<AuthResponse>>('/account/password', { currentPassword, newPassword })).data.data
