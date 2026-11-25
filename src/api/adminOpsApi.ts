import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { AdminUserPage, AuditPage, ReportPage, ReportStatus, ReportTarget, SystemStatus } from '@/types/adminOps'

const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null))

export const adminUsers = async (filter: { q?: string; role?: string; active?: boolean; page?: number }): Promise<AdminUserPage> =>
  (await axiosClient.get<ApiResponse<AdminUserPage>>('/admin/users', { params: clean(filter) })).data.data

export const setUserActive = async (id: string, active: boolean, reason?: string): Promise<void> => {
  await axiosClient.put(`/admin/users/${id}/active`, { active, reason })
}

export const setUserRole = async (id: string, role: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<void> => {
  await axiosClient.put(`/admin/users/${id}/role`, { role })
}

export const adminAudit = async (filter: { action?: string; q?: string; page?: number }): Promise<AuditPage> =>
  (await axiosClient.get<ApiResponse<AuditPage>>('/admin/audit', { params: clean(filter) })).data.data

export const adminReports = async (filter: { status?: ReportStatus | ''; type?: ReportTarget | ''; page?: number }): Promise<ReportPage> =>
  (await axiosClient.get<ApiResponse<ReportPage>>('/admin/reports', { params: clean(filter) })).data.data

export const resolveReport = async (id: number, status: 'RESOLVED' | 'DISMISSED', note?: string): Promise<void> => {
  await axiosClient.post(`/admin/reports/${id}/resolve`, { status, note })
}

export const systemStatus = async (): Promise<SystemStatus> =>
  (await axiosClient.get<ApiResponse<SystemStatus>>('/admin/system', { timeout: 20000 })).data.data
