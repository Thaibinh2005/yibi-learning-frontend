import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type { MockPaper } from './mockTestApi'

export type MockTestStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN'
export type ImportStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED'

export interface MockTestRow {
  id: string
  level: number
  title: string
  status: MockTestStatus
  origin: 'BUNDLE' | 'IMPORT' | 'EDITED'
  publishedVersion?: number | null
  hasDraft: boolean
  /** Things that block publishing the draft (clips to check, missing answers). */
  toReview: number
  attempts: number
  updatedAt: string
  publishedAt?: string | null
}

export interface MockImport {
  id: number
  level?: number | null
  status: ImportStatus
  step?: string | null
  progress: number
  message?: string | null
  pdfName?: string | null
  audioName?: string | null
  testId?: string | null
  problems: string[]
  createdAt: string
  updatedAt: string
}

export interface MockAdminOverview {
  tests: MockTestRow[]
  imports: MockImport[]
}

export interface PdfInspection {
  pages: number
  hasText: boolean
  hasAnswers: boolean
  level?: number | null
  supported: boolean
  cover: {
    level?: number | null
    totalMinutes?: number | null
    questionCount?: number | null
    skills: Record<string, { questions: number; minutes: number }>
  }
}

/** A paper being checked: the draft (with review flags and extraction notes) or a copy of the published one. */
export interface MockDraftPaper extends MockPaper {
  problems?: string[]
}

export interface MockDraft {
  id: string
  status: MockTestStatus
  origin: string
  publishedVersion?: number | null
  hasDraft: boolean
  paper: MockDraftPaper
  sourceAudioUrl?: string | null
  peaksUrl?: string | null
  canRecut: boolean
  /** What must be settled before publishing. */
  blocking: string[]
  /** What the extractor noticed (wrong numbering on the answer page, unused pictures…). */
  notes: string[]
}

export interface ClipCut {
  key: string
  start: number
  end: number
}

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

export const getMockAdminOverview = async () =>
  (await axiosClient.get<ApiResponse<MockAdminOverview>>('/admin/mock-tests')).data.data

export const inspectPdf = async (pdf: File) => {
  const form = new FormData()
  form.append('pdf', pdf)
  return (await axiosClient.post<ApiResponse<PdfInspection>>('/admin/mock-tests/inspect', form, { ...MULTIPART, timeout: 120_000 })).data.data
}

export const uploadMockTest = async (pdf: File, audio: File, level: number | null, onProgress?: (percent: number) => void) => {
  const form = new FormData()
  form.append('pdf', pdf)
  form.append('audio', audio)
  if (level) form.append('level', String(level))
  return (await axiosClient.post<ApiResponse<MockImport>>('/admin/mock-tests/imports', form, {
    ...MULTIPART,
    timeout: 15 * 60_000,
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })).data.data
}

export const getMockImport = async (id: number) =>
  (await axiosClient.get<ApiResponse<MockImport>>(`/admin/mock-tests/imports/${id}`)).data.data

export const deleteMockImport = async (id: number) => {
  await axiosClient.delete(`/admin/mock-tests/imports/${id}`)
}

export const getMockDraft = async (testId: string) =>
  (await axiosClient.get<ApiResponse<MockDraft>>(`/admin/mock-tests/${encodeURIComponent(testId)}`)).data.data

export const saveMockDraft = async (testId: string, paper: MockDraftPaper) =>
  (await axiosClient.put<ApiResponse<MockDraft>>(`/admin/mock-tests/${encodeURIComponent(testId)}/draft`, paper)).data.data

export const discardMockDraft = async (testId: string) =>
  (await axiosClient.delete<ApiResponse<boolean>>(`/admin/mock-tests/${encodeURIComponent(testId)}/draft`)).data.data

export const recutClips = async (testId: string, clips: ClipCut[]) =>
  (await axiosClient.post<ApiResponse<MockDraft>>(`/admin/mock-tests/${encodeURIComponent(testId)}/recut`, { clips }, { timeout: 5 * 60_000 })).data.data

export const publishMockTest = async (testId: string) =>
  (await axiosClient.post<ApiResponse<number>>(`/admin/mock-tests/${encodeURIComponent(testId)}/publish`)).data.data

export const setMockTestHidden = async (testId: string, hidden: boolean) => {
  await axiosClient.post(`/admin/mock-tests/${encodeURIComponent(testId)}/visibility`, { hidden })
}
