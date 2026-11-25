import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowDown,
  ArrowUp,
  AudioLines,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Search,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import {
  adminCategories,
  adminDeleteLesson,
  adminLessons,
  approveLesson,
  createCategory,
  deleteCategory,
  hideLesson,
  rejectLesson,
  reorderCategories,
  updateCategory,
} from '@/api/listeningAdminApi'
import { apiError } from '@/api/listeningApi'
import { AddVideoDialog } from '@/components/listening/AddVideoDialog'
import { VISIBILITY, clock } from '@/components/listening/LessonCard'
import type { AdminLessonPage, AdminLessonRow, LessonVisibility, ListeningCategory } from '@/types/listening'

const LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']

const FILTERS: { id: LessonVisibility | ''; label: string }[] = [
  { id: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { id: 'PUBLISHED', label: 'Công khai' },
  { id: 'REJECTED', label: 'Bị từ chối' },
  { id: 'HIDDEN', label: 'Đã ẩn' },
  { id: '', label: 'Tất cả' },
]

const RIGHTS_LABEL: Record<string, string> = {
  YOUTUBE_EMBED: 'Nhúng YouTube',
  OWN: 'Tự sản xuất / tự nhập',
  CREATIVE_COMMONS: 'Creative Commons',
  PERMISSION: 'Được cho phép',
  PERSONAL_STUDY: 'Chỉ tự học',
}

/**
 * The community listening library for admins: the categories learners see (order, on/off, add, rename, delete), the
 * review queue of lessons contributors sent (approve into 1–3 categories, reject with a note, hide, delete), and the
 * team's own lessons: "+ Thêm video" opens the same dialog and editor as learners use, and finishing in the editor
 * comes back here (?publish=ID) to publish under "Đội ngũ Yibi".
 */
export function ListeningLibraryPanel() {
  const [categories, setCategories] = useState<ListeningCategory[] | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await adminCategories())
    } catch (err) {
      toast.error('Không tải được danh mục', { description: apiError(err, 'Hãy thử lại.') })
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <CategoryManager categories={categories} onChange={setCategories} reload={loadCategories} />
      <ReviewQueue categories={categories ?? []} onCategoriesChanged={loadCategories} />
    </div>
  )
}

// ── Categories ──────────────────────────────────────────────────────────

function CategoryManager({ categories, onChange, reload }: {
  categories: ListeningCategory[] | null
  onChange: (c: ListeningCategory[]) => void
  reload: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true)
    try {
      await action()
      toast.success(done)
      await reload()
    } catch (err) {
      toast.error('Chưa thực hiện được', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setBusy(false)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    if (!categories) return
    const ids = categories.map((c) => c.id)
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    try {
      onChange(await reorderCategories(ids))
    } catch (err) {
      toast.error('Chưa đổi được thứ tự', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  return (
    <section className="h-fit rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="font-bold text-slate-800">Danh mục</h2>
        <p className="text-xs text-slate-500">Thứ tự ở đây là thứ tự các hàng trên trang học viên. Danh mục tắt hoặc chưa có bài thì không hiện.</p>
      </div>
      {!categories ? (
        <div className="p-5"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {categories.map((c, i) =>
            editing === c.id ? (
              <CategoryEditor key={c.id} category={c} onCancel={() => setEditing(null)} onSaved={async () => { setEditing(null); await reload() }} />
            ) : (
              <li key={c.id} className={`flex items-center gap-2 px-4 py-2.5 ${c.active ? '' : 'opacity-60'}`}>
                <div className="flex flex-col">
                  <button type="button" onClick={() => void move(i, -1)} disabled={i === 0} aria-label={`Đưa ${c.name} lên`} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => void move(i, 1)} disabled={i === categories.length - 1} aria-label={`Đưa ${c.name} xuống`} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="truncate font-mono text-[11px] text-slate-400">/{c.slug} · {c.lessonCount} bài</p>
                </div>
                <button
                  type="button"
                  onClick={() => void run(() => updateCategory(c.id, { name: c.name, slug: c.slug, description: c.description, active: !c.active }), c.active ? 'Đã tắt danh mục' : 'Đã bật danh mục')}
                  disabled={busy}
                  aria-label={c.active ? `Tắt ${c.name}` : `Bật ${c.name}`}
                  title={c.active ? 'Đang hiện — bấm để tắt' : 'Đang tắt — bấm để bật'}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  {c.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setEditing(c.id)} aria-label={`Sửa ${c.name}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.confirm(`Xoá danh mục "${c.name}"? Bài trong danh mục vẫn được giữ.`) && void run(() => deleteCategory(c.id), 'Đã xoá danh mục')}
                  disabled={busy}
                  aria-label={`Xoá ${c.name}`}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
          )}
        </ul>
      )}
      <form
        className="space-y-2 border-t border-slate-100 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          void run(async () => {
            await createCategory({ name: name.trim(), description: description.trim() || undefined })
            setName('')
            setDescription('')
          }, 'Đã thêm danh mục')
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Tên danh mục mới, ví dụ: Ẩm thực" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#C8322B] focus:outline-none" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} placeholder="Mô tả ngắn (không bắt buộc)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#C8322B] focus:outline-none" />
        <button type="submit" disabled={busy || !name.trim()} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C8322B] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <Plus className="h-4 w-4" /> Thêm danh mục
        </button>
      </form>
    </section>
  )
}

function CategoryEditor({ category, onCancel, onSaved }: { category: ListeningCategory; onCancel: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [description, setDescription] = useState(category.description ?? '')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      await updateCategory(category.id, { name: name.trim(), slug: slug.trim(), description: description.trim() || undefined, active: category.active })
      toast.success('Đã lưu danh mục')
      await onSaved()
    } catch (err) {
      toast.error('Chưa lưu được', { description: apiError(err, 'Hãy thử lại.') })
      setBusy(false)
    }
  }
  return (
    <li className="space-y-2 bg-slate-50 px-4 py-3">
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label="Tên danh mục" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={80} aria-label="Đường dẫn" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-xs" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} aria-label="Mô tả" placeholder="Mô tả" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Huỷ</button>
        <button type="button" onClick={() => void save()} disabled={busy || !name.trim()} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Lưu</button>
      </div>
    </li>
  )
}

// ── Review queue ────────────────────────────────────────────────────────

function ReviewQueue({ categories, onCategoriesChanged }: { categories: ListeningCategory[]; onCategoriesChanged: () => Promise<void> }) {
  const [params, setParams] = useSearchParams()
  const publishId = Number(params.get('publish')) || null
  const [visibility, setVisibility] = useState<LessonVisibility | ''>(publishId ? '' : 'PENDING_REVIEW')
  const [editorialOnly, setEditorialOnly] = useState(!!publishId)
  const [adding, setAdding] = useState(false)
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<AdminLessonPage | null>(null)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [rejecting, setRejecting] = useState<AdminLessonRow | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => { setQ(query.trim()); setPage(0) }, 350)
    return () => window.clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    try {
      setData(await adminLessons({ visibility, categoryId, q, page, editorial: editorialOnly }))
    } catch (err) {
      toast.error('Không tải được danh sách bài', { description: apiError(err, 'Hãy thử lại.') })
    }
  }, [visibility, categoryId, q, page, editorialOnly])

  useEffect(() => {
    void load()
  }, [load])

  // Translations finish in the background: refresh while one runs, so "Công khai" unlocks by itself.
  const translating = data?.lessons.some((l) => l.translationStatus === 'RUNNING')
  useEffect(() => {
    if (!translating) return
    const timer = window.setInterval(() => void load(), 3000)
    return () => window.clearInterval(timer)
  }, [translating, load])

  // Back from the editor with ?publish=ID: open the publish dialog for that lesson once.
  useEffect(() => {
    if (!publishId || !data) return
    if (data.lessons.some((l) => l.id === publishId)) setApprovingId(publishId)
    const next = new URLSearchParams(params)
    next.delete('publish')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishId, data])

  const approving = approvingId !== null ? data?.lessons.find((l) => l.id === approvingId) ?? null : null

  const after = async () => {
    await Promise.all([load(), onCategoriesChanged()])
  }

  const act = async (action: () => Promise<void>, done: string) => {
    try {
      await action()
      toast.success(done)
      await after()
    } catch (err) {
      toast.error('Chưa thực hiện được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="space-y-3 border-b border-slate-100 px-5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={editorialOnly}
            onClick={() => { setEditorialOnly((v) => !v); setVisibility(editorialOnly ? 'PENDING_REVIEW' : ''); setPage(0) }}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${editorialOnly ? 'bg-[#C8322B] text-white' : 'bg-rose-50 text-[#C8322B] hover:bg-rose-100'}`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Do admin đăng
          </button>
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          {FILTERS.map((f) => (
            <button
              key={f.id || 'all'}
              type="button"
              aria-pressed={visibility === f.id}
              onClick={() => { setVisibility(f.id); setPage(0) }}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${visibility === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {f.label}
              {f.id === 'PENDING_REVIEW' && data && data.pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-[#C8322B] px-1.5 py-0.5 text-[11px] text-white">{data.pendingCount}</span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#C8322B] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#a92822]"
          >
            <Plus className="h-4 w-4" /> Thêm video
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên bài, người đóng góp, kênh…" className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm focus:border-[#C8322B] focus:outline-none" />
          </label>
          <select value={categoryId ?? ''} onChange={(e) => { setCategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(0) }} aria-label="Lọc theo danh mục" className="rounded-lg border border-slate-200 px-2 py-2 text-sm">
            <option value="">Mọi danh mục</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {!data ? (
        <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : data.lessons.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">
          {editorialOnly ? 'Chưa có bài nào do admin đăng. Bấm "Thêm video" để bắt đầu.'
            : visibility === 'PENDING_REVIEW' ? 'Không có bài nào chờ duyệt.' : 'Không có bài phù hợp.'}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.lessons.map((l) => {
            const vis = l.editorial && l.visibility === 'PRIVATE'
              ? { ...VISIBILITY.PRIVATE, label: 'Bản nháp' }
              : VISIBILITY[l.visibility]
            const translatedAll = l.segmentCount > 0 && l.translatedCount >= l.segmentCount
            return (
              <li key={l.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row">
                <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-40">
                  {l.videoId ? (
                    <img src={`https://i.ytimg.com/vi/${l.videoId}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center"><AudioLines className="h-8 w-8 text-slate-300" /></span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${vis.className}`}>
                      <vis.icon className="h-3 w-3" /> {vis.label}
                    </span>
                    <p className="min-w-0 font-semibold text-slate-800">{l.title}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {l.editorial ? <b className="text-[#C8322B]">Đội ngũ Yibi</b> : <>@{l.contributorName ?? 'ẩn danh'}</>}
                    {l.channelName && <> · kênh <b>{l.channelName}</b></>}
                    {' · '}{l.segmentCount} câu{l.durationSeconds != null && ` · ${clock(l.durationSeconds)}`}
                    {' · '}HSK {l.hskLevel ?? (l.estimatedLevel ? `${l.estimatedLevel} (ước tính)` : '—')}
                    {l.submittedAt && ` · gửi ${new Date(l.submittedAt).toLocaleDateString('vi-VN')}`}
                    {l.visibility === 'PUBLISHED' && ` · ${l.practiceCount} lượt luyện · ${l.saveCount} lượt lưu`}
                  </p>
                  <p className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${translatedAll ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      Dịch {l.translatedCount}/{l.segmentCount}
                    </span>
                    {l.status !== 'READY' && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">Chưa hoàn tất</span>}
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                      <ShieldCheck className="h-3 w-3" /> {RIGHTS_LABEL[l.usageRights ?? ''] ?? l.usageRights}
                      {l.rightsNote && ` — ${l.rightsNote}`}
                    </span>
                    {l.categories.map((c) => <span key={c.id} className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-[#C8322B]">{c.name}</span>)}
                  </p>
                  {l.description && <p className="text-sm text-slate-600">{l.description}</p>}
                  {l.reviewNote && <p className="text-xs italic text-slate-500">Ghi chú duyệt: {l.reviewNote}</p>}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {l.status === 'READY' && (
                      <Link to={`/listening/${l.id}?mode=transcript`} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Eye className="h-3.5 w-3.5" /> Xem
                      </Link>
                    )}
                    <Link to={`/listening/${l.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Pencil className="h-3.5 w-3.5" /> Sửa lời thoại
                    </Link>
                    {l.visibility !== 'PUBLISHED' && (
                      <button type="button" onClick={() => setApprovingId(l.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                        <Check className="h-3.5 w-3.5" /> {l.visibility === 'PENDING_REVIEW' ? 'Duyệt' : l.visibility === 'PRIVATE' ? 'Công khai' : 'Công khai lại'}
                      </button>
                    )}
                    {l.visibility === 'PUBLISHED' && (
                      <button type="button" onClick={() => setApprovingId(l.id)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        Danh mục & thông tin
                      </button>
                    )}
                    {l.visibility === 'PENDING_REVIEW' && (
                      <button type="button" onClick={() => setRejecting(l)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                        <XCircle className="h-3.5 w-3.5" /> Từ chối
                      </button>
                    )}
                    {l.visibility === 'PUBLISHED' && (
                      <button
                        type="button"
                        onClick={() => {
                          const note = window.prompt(`Ẩn "${l.title}" khỏi thư viện? Ghi lý do cho người đóng góp (không bắt buộc):`, '')
                          if (note !== null) void act(() => hideLesson(l.id, note.trim() || undefined), 'Đã ẩn bài')
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <EyeOff className="h-3.5 w-3.5" /> Ẩn
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => window.confirm(`Xoá hẳn "${l.title}"? Học viên đã lưu bài này sẽ mất nó.`) && void act(() => adminDeleteLesson(l.id), 'Đã xoá bài')}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xoá
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-slate-100 py-3">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page === 0} aria-label="Trang trước" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm tabular-nums text-slate-600">{page + 1}/{data.totalPages}</span>
          <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= data.totalPages} aria-label="Trang sau" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}

      {approving && (
        <ApproveDialog
          lesson={approving}
          categories={categories}
          onClose={() => setApprovingId(null)}
          onDone={async () => { setApprovingId(null); await after() }}
        />
      )}
      {adding && <AddVideoDialog usage={null} editorial onClose={() => setAdding(false)} />}
      {rejecting && (
        <RejectDialog
          lesson={rejecting}
          onClose={() => setRejecting(null)}
          onDone={async () => { setRejecting(null); await after() }}
        />
      )}
    </section>
  )
}

function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">{footer}</div>
      </div>
    </div>,
    document.body
  )
}

function ApproveDialog({ lesson, categories, onClose, onDone }: {
  lesson: AdminLessonRow
  categories: ListeningCategory[]
  onClose: () => void
  onDone: () => Promise<void>
}) {
  const [picked, setPicked] = useState<number[]>(lesson.categories.map((c) => c.id).slice(0, 3))
  const [title, setTitle] = useState(lesson.title)
  const [description, setDescription] = useState(lesson.description ?? '')
  const [level, setLevel] = useState(lesson.hskLevel ?? '')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const published = lesson.visibility === 'PUBLISHED'
  const blocked = lesson.status !== 'READY' ? 'Bài chưa hoàn tất: mở trình sửa và bấm Hoàn tất trước.'
    : lesson.translationStatus === 'RUNNING' ? `Đang dịch tiếng Việt: ${lesson.translatedCount}/${lesson.segmentCount} câu. Nút Công khai sẽ mở khi dịch xong.`
    : lesson.translatedCount < lesson.segmentCount ? `Còn ${lesson.segmentCount - lesson.translatedCount} câu chưa dịch. Mở trình sửa và bấm "Dịch tiếp".` : null

  const toggle = (id: number) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]))

  const save = async () => {
    setBusy(true)
    try {
      await approveLesson(lesson.id, {
        categoryIds: picked,
        title: title.trim() !== lesson.title ? title.trim() : undefined,
        description: description.trim() || undefined,
        hskLevel: level || undefined,
        note: note.trim() || undefined,
      })
      toast.success(published ? 'Đã lưu thông tin bài' : 'Đã công khai bài luyện', { description: title })
      await onDone()
    } catch (err) {
      toast.error('Chưa duyệt được', { description: apiError(err, 'Hãy thử lại.') })
      setBusy(false)
    }
  }

  return (
    <Modal
      title={published ? 'Danh mục & thông tin bài' : lesson.editorial ? 'Công khai bài của Đội ngũ Yibi' : 'Duyệt và công khai'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Huỷ</button>
          <button type="button" onClick={() => void save()} disabled={busy || picked.length === 0 || !!blocked || !title.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {published ? 'Lưu' : 'Công khai'}
          </button>
        </>
      }
    >
      {blocked && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{blocked}</p>}
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-slate-700">Danh mục (1–3) · {picked.length}/3</legend>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => {
            const on = picked.includes(c.id)
            return (
              <button key={c.id} type="button" aria-pressed={on} disabled={!on && picked.length >= 3} onClick={() => toggle(c.id)} className={`rounded-full border px-3 py-1 text-sm font-semibold disabled:opacity-40 ${on ? 'border-[#C8322B] bg-[#C8322B] text-white' : 'border-slate-200 text-slate-700'} ${c.active ? '' : 'italic'}`}>
                {c.name}{!c.active && ' (tắt)'}
              </button>
            )
          })}
        </div>
      </fieldset>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Tiêu đề</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Giới thiệu</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Cấp HSK</span>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2">
          <option value="">Theo ước tính{lesson.estimatedLevel ? ` (HSK ${lesson.estimatedLevel})` : ''}</option>
          {LEVELS.map((l) => <option key={l} value={l}>HSK {l}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Ghi chú cho người đóng góp (không bắt buộc)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
      </label>
    </Modal>
  )
}

function RejectDialog({ lesson, onClose, onDone }: { lesson: AdminLessonRow; onClose: () => void; onDone: () => Promise<void> }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async () => {
    setBusy(true)
    try {
      await rejectLesson(lesson.id, note.trim())
      toast.success('Đã từ chối bài', { description: 'Người đóng góp sẽ thấy góp ý của bạn.' })
      await onDone()
    } catch (err) {
      toast.error('Chưa từ chối được', { description: apiError(err, 'Hãy thử lại.') })
      setBusy(false)
    }
  }
  return (
    <Modal
      title={`Từ chối "${lesson.title}"`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Huỷ</button>
          <button type="button" onClick={() => void send()} disabled={busy || !note.trim()} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Từ chối</button>
        </>
      }
    >
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-700">Góp ý để người đóng góp sửa</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={4} placeholder="Ví dụ: Câu 12–15 lệch thời gian; bản dịch câu 3 chưa đúng nghĩa." className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2" />
      </label>
    </Modal>
  )
}
