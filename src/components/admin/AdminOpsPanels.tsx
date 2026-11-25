import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Unlock,
  XCircle,
} from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { adminAudit, adminReports, adminUsers, resolveReport, setUserActive, setUserRole, systemStatus } from '@/api/adminOpsApi'
import { apiError } from '@/api/listeningApi'
import type { AdminUserPage, AuditPage, ReportPage, ReportStatus, ReportTarget, SystemStatus } from '@/types/adminOps'

const date = (value?: string) => (value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—')

function useDebounced(value: string, ms = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value.trim()), ms)
    return () => window.clearTimeout(t)
  }, [value, ms])
  return debounced
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 border-t border-slate-100 py-3">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page === 0} aria-label="Trang trước" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
      <span className="text-sm tabular-nums text-slate-600">{page + 1}/{totalPages}</span>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page + 1 >= totalPages} aria-label="Trang sau" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
    </div>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
      {children}
    </button>
  )
}

// ── Users ───────────────────────────────────────────────────────────────

/** Find users, lock or unlock them (a lock signs them out everywhere), give or take the admin role. */
export function UsersPanel() {
  const me = useAppSelector((state) => state.auth.user)
  const [query, setQuery] = useState('')
  const q = useDebounced(query)
  const [role, setRole] = useState('')
  const [active, setActive] = useState<boolean | undefined>()
  const [page, setPage] = useState(0)
  const [data, setData] = useState<AdminUserPage | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await adminUsers({ q, role, active, page }))
    } catch (err) {
      toast.error('Không tải được người dùng', { description: apiError(err, 'Hãy thử lại.') })
    }
  }, [q, role, active, page])

  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => setPage(0), [q, role, active])

  const act = async (action: () => Promise<void>, done: string) => {
    try {
      await action()
      toast.success(done)
      await load()
    } catch (err) {
      toast.error('Chưa thực hiện được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
        <label className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên đăng nhập hoặc email…" className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm focus:border-[#C8322B] focus:outline-none" />
        </label>
        <Chip on={role === ''} onClick={() => setRole('')}>Mọi quyền</Chip>
        <Chip on={role === 'ROLE_ADMIN'} onClick={() => setRole('ROLE_ADMIN')}>Admin</Chip>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <Chip on={active === undefined} onClick={() => setActive(undefined)}>Tất cả</Chip>
        <Chip on={active === false} onClick={() => setActive(false)}>Đang khoá</Chip>
      </div>
      {!data ? (
        <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : data.users.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">Không có người dùng phù hợp.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-2">Người dùng</th>
                <th className="px-3 py-2">Quyền</th>
                <th className="px-3 py-2">HSK</th>
                <th className="px-3 py-2">Đóng góp</th>
                <th className="px-3 py-2">Đăng nhập gần nhất</th>
                <th className="px-3 py-2">Tham gia</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.users.map((u) => {
                const self = me?.id === u.id
                return (
                  <tr key={u.id} className={u.active ? '' : 'bg-slate-50 text-slate-400'}>
                    <td className="px-5 py-2.5">
                      <p className="font-semibold text-slate-800">
                        {u.username} {self && <span className="text-xs font-normal text-slate-400">(bạn)</span>}
                        {!u.active && <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">Đang khoá</span>}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}{u.googleLinked && ' · Google'}</p>
                    </td>
                    <td className="px-3 py-2.5">{u.role === 'ROLE_ADMIN' ? <span className="rounded-full bg-[#C8322B]/10 px-2 py-0.5 text-xs font-bold text-[#C8322B]">Admin</span> : 'Học viên'}</td>
                    <td className="px-3 py-2.5">{u.hskLevel ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs">{u.lessonsContributed} bài · {u.lessonsPublished} công khai{u.openReports > 0 && ` · ${u.openReports} báo lỗi`}</td>
                    <td className="px-3 py-2.5 text-xs">{date(u.lastLogin)}</td>
                    <td className="px-3 py-2.5 text-xs">{date(u.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      {!self && (
                        <div className="flex justify-end gap-1">
                          {u.active ? (
                            <button
                              type="button"
                              title="Khoá tài khoản"
                              onClick={() => {
                                const reason = window.prompt(`Khoá "${u.username}"? Người này bị đăng xuất ngay. Lý do (không bắt buộc):`, '')
                                if (reason !== null) void act(() => setUserActive(u.id, false, reason.trim() || undefined), 'Đã khoá tài khoản')
                              }}
                              disabled={u.role === 'ROLE_ADMIN'}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30"
                            >
                              <Lock className="h-3.5 w-3.5" /> Khoá
                            </button>
                          ) : (
                            <button type="button" onClick={() => void act(() => setUserActive(u.id, true), 'Đã mở khoá tài khoản')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              <Unlock className="h-3.5 w-3.5" /> Mở khoá
                            </button>
                          )}
                          {u.role === 'ROLE_ADMIN' ? (
                            <button type="button" onClick={() => window.confirm(`Bỏ quyền admin của "${u.username}"?`) && void act(() => setUserRole(u.id, 'ROLE_USER'), 'Đã bỏ quyền admin')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              <ShieldOff className="h-3.5 w-3.5" /> Bỏ admin
                            </button>
                          ) : (
                            <button type="button" disabled={!u.active} onClick={() => window.confirm(`Cấp quyền admin cho "${u.username}"? Người này sẽ quản lý được toàn bộ trang quản trị.`) && void act(() => setUserRole(u.id, 'ROLE_ADMIN'), 'Đã cấp quyền admin')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30">
                              <ShieldCheck className="h-3.5 w-3.5" /> Cấp admin
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </section>
  )
}

// ── Reports ─────────────────────────────────────────────────────────────

const REASON_LABEL: Record<string, string> = {
  WRONG_TEXT: 'Sai chữ Hán', WRONG_TIME: 'Lệch thời gian', WRONG_TRANSLATION: 'Dịch sai', WRONG_PINYIN: 'Pinyin sai',
  WRONG_MEANING: 'Nghĩa sai', BAD_EXAMPLE: 'Ví dụ sai', INAPPROPRIATE: 'Không phù hợp', OTHER: 'Khác',
}
const TARGET_LABEL: Record<ReportTarget, string> = { LISTENING_SEGMENT: 'Câu nghe', LISTENING_LESSON: 'Bài nghe', VOCABULARY: 'Từ vựng' }

/** Content mistakes learners reported: what and where, a link to fix it, then close as fixed or dismissed. */
export function ReportsPanel() {
  const [status, setStatus] = useState<ReportStatus | ''>('OPEN')
  const [type, setType] = useState<ReportTarget | ''>('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<ReportPage | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await adminReports({ status, type, page }))
    } catch (err) {
      toast.error('Không tải được báo lỗi', { description: apiError(err, 'Hãy thử lại.') })
    }
  }, [status, type, page])

  useEffect(() => {
    void load()
  }, [load])

  const close = async (id: number, s: 'RESOLVED' | 'DISMISSED') => {
    const note = window.prompt(s === 'RESOLVED' ? 'Ghi chú cách đã sửa (không bắt buộc):' : 'Lý do bỏ qua (không bắt buộc):', '')
    if (note === null) return
    try {
      await resolveReport(id, s, note.trim() || undefined)
      toast.success(s === 'RESOLVED' ? 'Đã đánh dấu đã sửa' : 'Đã bỏ qua báo lỗi')
      await load()
    } catch (err) {
      toast.error('Chưa xử lý được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-5 py-3">
        <Chip on={status === 'OPEN'} onClick={() => { setStatus('OPEN'); setPage(0) }}>
          Chưa xử lý {data && data.openCount > 0 && <span className="ml-1 rounded-full bg-[#C8322B] px-1.5 py-0.5 text-[11px] text-white">{data.openCount}</span>}
        </Chip>
        <Chip on={status === 'RESOLVED'} onClick={() => { setStatus('RESOLVED'); setPage(0) }}>Đã sửa</Chip>
        <Chip on={status === 'DISMISSED'} onClick={() => { setStatus('DISMISSED'); setPage(0) }}>Bỏ qua</Chip>
        <Chip on={status === ''} onClick={() => { setStatus(''); setPage(0) }}>Tất cả</Chip>
        <select value={type} onChange={(e) => { setType(e.target.value as ReportTarget | ''); setPage(0) }} aria-label="Loại nội dung" className="ml-auto rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
          <option value="">Mọi loại</option>
          {(Object.keys(TARGET_LABEL) as ReportTarget[]).map((t) => <option key={t} value={t}>{TARGET_LABEL[t]}</option>)}
        </select>
      </div>
      {!data ? (
        <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : data.reports.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">{status === 'OPEN' ? 'Không có báo lỗi nào đang chờ. 🎉' : 'Không có báo lỗi phù hợp.'}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.reports.map((r) => (
            <li key={r.id} className="space-y-1.5 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{TARGET_LABEL[r.targetType]}</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700">{REASON_LABEL[r.reason] ?? r.reason}</span>
                {r.sameTargetOpen > 1 && r.status === 'OPEN' && <span className="rounded-full bg-red-50 px-2 py-0.5 font-bold text-red-600">{r.sameTargetOpen} người báo</span>}
                <span className="text-slate-400">@{r.reporterName ?? 'ẩn danh'} · {date(r.createdAt)}</span>
              </div>
              <p className="font-semibold text-slate-800">
                {r.targetTitle}
                {r.targetRef != null && <span className="font-normal text-slate-500"> · câu {r.targetRef + 1}</span>}
              </p>
              {r.targetText && <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{r.targetText}</p>}
              {r.note && <p className="text-sm text-slate-600">“{r.note}”</p>}
              {r.status !== 'OPEN' && (
                <p className="text-xs text-slate-500">
                  {r.status === 'RESOLVED' ? 'Đã sửa' : 'Bỏ qua'} bởi @{r.resolvedByName ?? '?'} · {date(r.resolvedAt)}{r.resolutionNote && ` · ${r.resolutionNote}`}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {r.link && (
                  <Link to={r.link} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <ExternalLink className="h-3.5 w-3.5" /> Mở để sửa
                  </Link>
                )}
                {r.targetType === 'VOCABULARY' && (
                  <span className="text-xs text-slate-500">Sửa từ vựng: dùng script dữ liệu (chưa có trình sửa trên giao diện).</span>
                )}
                {r.status === 'OPEN' && (
                  <>
                    <button type="button" onClick={() => void close(r.id, 'RESOLVED')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã sửa
                    </button>
                    <button type="button" onClick={() => void close(r.id, 'DISMISSED')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      <XCircle className="h-3.5 w-3.5" /> Bỏ qua
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </section>
  )
}

// ── System ──────────────────────────────────────────────────────────────

const FEATURE_LABEL: Record<string, string> = {
  'listening-translate': 'Dịch phụ đề (Nghe & Nói)',
  'question-generator': 'Sinh câu hỏi',
  'passage-generator': 'Sinh bài đọc',
  'lesson-content': 'Nội dung bài học AI',
}

function megabytes(bytes: number) {
  return bytes < 0 ? '—' : bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

/** Gemini keys and today's calls, services, storage and the queues waiting for an admin. */
export function SystemPanel() {
  const [data, setData] = useState<SystemStatus | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    try {
      setData(await systemStatus())
    } catch (err) {
      toast.error('Không tải được tình trạng hệ thống', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (!data) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>

  const tile = (label: string, value: React.ReactNode, hint?: string) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-slate-800"><Activity className="h-5 w-5 text-[#C8322B]" /> Tình trạng hệ thống</h2>
        <button type="button" onClick={() => void load()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.services.map((s) => (
          <div key={s.name} className={`rounded-2xl border p-4 shadow-xs ${s.up ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <p className={`flex items-center gap-1.5 font-bold ${s.up ? 'text-emerald-800' : 'text-red-700'}`}>
              {s.up ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {s.name}
            </p>
            <p className={`mt-1 text-xs ${s.up ? 'text-emerald-700' : 'text-red-600'}`}>{s.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tile('Người dùng', data.usersTotal, `${data.usersActiveToday} người đăng nhập hôm nay`)}
        {tile('Bài chờ duyệt', data.pendingLessons)}
        {tile('Báo lỗi chưa xử lý', data.openReports)}
        {tile('File tải lên', data.mediaFiles, megabytes(data.mediaBytes))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
          <h3 className="flex items-center gap-1.5 font-bold text-slate-800"><KeyRound className="h-4 w-4" /> Gemini hôm nay</h3>
          <span className="text-xs text-slate-500">
            {data.geminiKeys} khoá · mô hình theo thứ tự thử: {data.geminiModels.join(' → ') || '—'}
          </span>
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
            <Database className="h-3.5 w-3.5" /> {data.sentencesTranslatedToday} câu đã dịch hôm nay · {data.cachedTranslations} câu trong bộ nhớ đệm
          </span>
        </div>
        {data.geminiToday.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">Hôm nay chưa có lần gọi Gemini nào (số liệu tính từ khi bật bản này).</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-2">Chức năng</th>
                  <th className="px-3 py-2">Mô hình</th>
                  <th className="px-3 py-2 text-right">Thành công</th>
                  <th className="px-3 py-2 text-right">429 hết quota</th>
                  <th className="px-3 py-2 text-right">503 quá tải</th>
                  <th className="px-3 py-2 text-right">Lỗi khác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.geminiToday.map((g) => (
                  <tr key={`${g.feature}-${g.model}`}>
                    <td className="px-5 py-2">{FEATURE_LABEL[g.feature] ?? g.feature}</td>
                    <td className="px-3 py-2 font-mono text-xs">{g.model}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{g.outcomes.ok ?? 0}</td>
                    <td className={`px-3 py-2 text-right tabular-nums ${(g.outcomes['429'] ?? 0) > 0 ? 'font-bold text-red-600' : ''}`}>{g.outcomes['429'] ?? 0}</td>
                    <td className={`px-3 py-2 text-right tabular-nums ${(g.outcomes['503'] ?? 0) > 0 ? 'font-bold text-amber-600' : ''}`}>{g.outcomes['503'] ?? 0}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{g.outcomes.other ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// ── Audit log ───────────────────────────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
  USER_LOCK: 'Khoá tài khoản', USER_UNLOCK: 'Mở khoá tài khoản', USER_ROLE: 'Đổi quyền',
  LESSON_PUBLISH: 'Công khai bài', LESSON_REJECT: 'Từ chối bài', LESSON_HIDE: 'Ẩn bài', LESSON_DELETE: 'Xoá bài',
  LESSON_CATEGORIES: 'Đổi danh mục của bài', CATEGORY_CREATE: 'Thêm danh mục', CATEGORY_UPDATE: 'Sửa danh mục',
  CATEGORY_DELETE: 'Xoá danh mục', REPORT_RESOLVE: 'Đã sửa báo lỗi', REPORT_DISMISS: 'Bỏ qua báo lỗi',
}

/** Who did what in the admin pages, newest first. */
export function AuditPanel() {
  const [action, setAction] = useState('')
  const [query, setQuery] = useState('')
  const q = useDebounced(query)
  const [page, setPage] = useState(0)
  const [data, setData] = useState<AuditPage | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await adminAudit({ action, q, page }))
    } catch (err) {
      toast.error('Không tải được nhật ký', { description: apiError(err, 'Hãy thử lại.') })
    }
  }, [action, q, page])

  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => setPage(0), [action, q])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
        <label className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo admin, đối tượng, ghi chú…" className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm focus:border-[#C8322B] focus:outline-none" />
        </label>
        <select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Loại thao tác" className="rounded-lg border border-slate-200 px-2 py-2 text-sm">
          <option value="">Mọi thao tác</option>
          {Object.entries(ACTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {!data ? (
        <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : data.entries.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">Chưa có thao tác nào được ghi lại.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-2">Thời điểm</th>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Thao tác</th>
                <th className="px-3 py-2">Đối tượng</th>
                <th className="px-3 py-2">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.entries.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-5 py-2 text-xs text-slate-500">{date(e.createdAt)}</td>
                  <td className="px-3 py-2 font-semibold text-slate-700">@{e.adminUsername}</td>
                  <td className="px-3 py-2">{ACTION_LABEL[e.action] ?? e.action}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{e.targetType}{e.targetId && ` · ${e.targetId}`}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{e.detail ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </section>
  )
}
