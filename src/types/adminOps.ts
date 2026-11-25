export interface AdminUserRow {
  id: string
  username: string
  email: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  active: boolean
  hskLevel?: number
  googleLinked: boolean
  createdAt?: string
  lastLogin?: string
  lessonsContributed: number
  lessonsPublished: number
  openReports: number
}

export interface Paged {
  page: number
  totalPages: number
  total: number
}

export interface AdminUserPage extends Paged {
  users: AdminUserRow[]
}

export interface AuditEntry {
  id: number
  adminUsername: string
  action: string
  targetType: string
  targetId?: string
  detail?: string
  createdAt: string
}

export interface AuditPage extends Paged {
  entries: AuditEntry[]
}

export type ReportTarget = 'LISTENING_SEGMENT' | 'LISTENING_LESSON' | 'VOCABULARY'
export type ReportReason =
  | 'WRONG_TEXT' | 'WRONG_TIME' | 'WRONG_TRANSLATION' | 'WRONG_PINYIN'
  | 'WRONG_MEANING' | 'BAD_EXAMPLE' | 'INAPPROPRIATE' | 'OTHER'
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED'

export interface ReportRow {
  id: number
  targetType: ReportTarget
  targetId: number
  targetRef?: number
  reason: ReportReason
  note?: string
  status: ReportStatus
  reporterName?: string
  createdAt: string
  targetTitle: string
  /** The reported sentence ("中文 — tiếng Việt") for a listening line. */
  targetText?: string
  /** Where an admin fixes it (the listening editor); missing for a word. */
  link?: string
  resolutionNote?: string
  resolvedByName?: string
  resolvedAt?: string
  /** Open reports on the same spot, this one included. */
  sameTargetOpen: number
}

export interface ReportPage extends Paged {
  reports: ReportRow[]
  openCount: number
}

export interface GeminiUsage {
  feature: string
  model: string
  outcomes: Record<string, number>
}

export interface ServiceCheck {
  name: string
  up: boolean
  detail: string
}

export interface SystemStatus {
  geminiKeys: number
  geminiModels: string[]
  geminiToday: GeminiUsage[]
  sentencesTranslatedToday: number
  cachedTranslations: number
  services: ServiceCheck[]
  mediaFiles: number
  mediaBytes: number
  usersTotal: number
  usersActiveToday: number
  openReports: number
  pendingLessons: number
}
