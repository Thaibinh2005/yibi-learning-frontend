import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Flame, FolderHeart, Headphones, Loader2, LogIn, Plus, Search, Sparkles, X } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { AddVideoDialog } from '@/components/listening/AddVideoDialog'
import { CategoryRow, RowItem } from '@/components/listening/CategoryRow'
import { LessonCard } from '@/components/listening/LessonCard'
import { SubmitLessonDialog } from '@/components/listening/SubmitLessonDialog'
import { VideoReadyModal } from '@/components/listening/VideoReadyModal'
import { useOpenLesson } from '@/components/listening/useOpenLesson'
import { useTranslationToasts } from '@/components/listening/useTranslationToasts'
import {
  apiError,
  deleteVideo,
  getCategoryPage,
  getLibrary,
  getLibraryCategories,
  listVideos,
  removeFromShelf,
  saveToShelf,
} from '@/api/listeningApi'
import type { CategoryPage, LibraryHome, ListeningCategory, VideoList, VideoSummary } from '@/types/listening'

export const LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']

/**
 * Dictation & shadowing. A bar of category chips on top: "Tất cả" shows the community library as sideways rows (one
 * per category the admins manage), "Video của tôi" the learner's own and saved lessons, a category all its lessons.
 * Everyone can browse; opening a lesson needs an account. The chosen chip is kept in the address (?c=slug).
 */
export function ListeningPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()
  const navigate = useNavigate()

  const [level, setLevel] = useState('')
  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  const [library, setLibrary] = useState<LibraryHome | null>(null)
  const [libraryError, setLibraryError] = useState<string | null>(null)
  const [mine, setMine] = useState<VideoList | null>(null)
  const [adding, setAdding] = useState(false)
  const [sharing, setSharing] = useState<VideoSummary | null>(null)
  const [categories, setCategories] = useState<ListeningCategory[]>([])
  const [params, setParams] = useSearchParams()
  const selected = params.get('c') ?? 'all'
  const isCategory = selected !== 'all' && selected !== 'mine'
  const [page, setPage] = useState(0)
  const [categoryPage, setCategoryPage] = useState<CategoryPage | null>(null)

  const select = (chip: string) => {
    const next = new URLSearchParams(params)
    if (chip === 'all') next.delete('c')
    else next.set('c', chip)
    setParams(next, { replace: true })
    setPage(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    getLibraryCategories().then(setCategories).catch(() => setCategories([]))
  }, [])
  // Set by the editor after "Hoàn tất & tạo bản dịch"; read once so a reload does not show the modal again.
  const [finishedId, setFinishedId] = useState<number | null>(
    () => (location.state as { finishedId?: number } | null)?.finishedId ?? null
  )
  useEffect(() => {
    if ((location.state as { finishedId?: number } | null)?.finishedId) navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  // Typing waits a moment before searching.
  useEffect(() => {
    const t = window.setTimeout(() => setQ(query.trim()), 350)
    return () => window.clearTimeout(t)
  }, [query])

  const loadLibrary = useCallback(async () => {
    try {
      setLibrary(await getLibrary({ level, q }))
      setLibraryError(null)
    } catch (err) {
      setLibraryError(apiError(err, 'Không tải được thư viện video.'))
    }
  }, [level, q])

  const loadMine = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setMine(await listVideos())
    } catch (err) {
      toast.error('Không tải được Video của tôi', { description: apiError(err, 'Hãy tải lại trang.') })
    }
  }, [isAuthenticated])

  useEffect(() => {
    void loadLibrary()
  }, [loadLibrary])

  const loadCategory = useCallback(async () => {
    if (!isCategory) return
    try {
      setCategoryPage(await getCategoryPage(selected, { level, q, page }))
    } catch (err) {
      toast.error('Không mở được danh mục', { description: apiError(err, 'Hãy thử lại.') })
    }
  }, [isCategory, selected, level, q, page])

  useEffect(() => {
    setCategoryPage(null)
  }, [selected])

  useEffect(() => {
    void loadCategory()
  }, [loadCategory])

  // A filter change starts the category from its first page.
  useEffect(() => {
    setPage(0)
  }, [level, q])

  useEffect(() => {
    void loadMine()
  }, [loadMine])

  // Keep "Video của tôi" fresh while a file is being transcribed or a translation is running.
  const busy = mine?.videos.some((v) => v.status === 'PROCESSING' || v.translationStatus === 'RUNNING')
  useEffect(() => {
    if (!busy) return
    const timer = window.setInterval(() => void loadMine(), 2500)
    return () => window.clearInterval(timer)
  }, [busy, loadMine])

  useTranslationToasts((mine?.videos ?? []).filter((v) => v.mine).map((v) => ({ ...v, done: v.translatedCount, total: v.segmentCount })))

  // "Video của tôi" follows the same filter as the library.
  const myVideos = useMemo(() => {
    const needle = q.toLowerCase()
    return (mine?.videos ?? []).filter(
      (v) => (!level || v.hskLevel === level) && (!needle || v.title.toLowerCase().includes(needle))
    )
  }, [mine, level, q])

  const known = useMemo(
    () => [
      ...(mine?.videos ?? []),
      ...(library?.newest ?? []),
      ...(library?.sections.flatMap((s) => s.videos) ?? []),
      ...(categoryPage?.videos ?? []),
    ],
    [mine, library, categoryPage]
  )
  const { open, dialogs, openDialog } = useOpenLesson(known)

  const remove = async (video: VideoSummary) => {
    if (!window.confirm(`Xoá "${video.title}"? Lời thoại và file đã tải lên sẽ bị xoá.`)) return
    try {
      await deleteVideo(video.id)
      toast.success('Đã xoá video', { description: video.title })
      await loadMine()
    } catch (err) {
      toast.error('Không xoá được video', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  const toggleSave = async (video: VideoSummary) => {
    try {
      if (video.saved) {
        await removeFromShelf(video.id)
        toast.success('Đã bỏ lưu', { description: video.title })
      } else {
        await saveToShelf(video.id)
        toast.success('Đã lưu vào Video của tôi', { description: video.title })
      }
      await Promise.all([loadMine(), loadLibrary(), loadCategory()])
    } catch (err) {
      toast.error('Chưa lưu được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  const finished = finishedId !== null ? mine?.videos.find((v) => v.id === finishedId) ?? null : null
  useEffect(() => {
    if (finishedId !== null && mine && !mine.videos.some((v) => v.id === finishedId)) setFinishedId(null)
  }, [mine, finishedId])

  const card = (video: VideoSummary) => (
    <LessonCard
      video={video}
      onOpen={() => open(video)}
      onDelete={() => void remove(video)}
      onToggleSave={isAuthenticated ? () => void toggleSave(video) : undefined}
      onShare={() => setSharing(video)}
    />
  )

  const filtered = level !== '' || q !== ''
  const libraryEmpty = library && library.newest.length === 0 && library.sections.length === 0

  return (
    <div className="space-y-8 pb-6 pt-2">
      {/* Toolbar: search, level and "Thêm video"; then the category chips */}
      <div className="w-full rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[180px] flex-1">
            <span className="sr-only">Tìm video</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên video hoặc kênh…"
              className="h-14 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-11 text-sm outline-none transition focus:border-brand/60 focus:bg-white focus:ring-2 focus:ring-rose-100 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Xoá tìm kiếm" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-200/70 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <label className="relative">
            <span className="sr-only">Lọc theo cấp HSK</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={`h-14 appearance-none rounded-full border pl-5 pr-11 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-rose-100 ${
                level ? 'border-brand/40 bg-rose-50 text-brand' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <option value="">Tất cả HSK</option>
              {LEVELS.map((l) => <option key={l} value={l}>HSK {l === '7-9' ? '7–9' : l}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 max-sm:w-full"
            >
              <Plus className="h-5 w-5" /> Thêm video
            </button>
          ) : (
            <Link
              to="/login"
              state={{ from: { pathname: '/listening' } }}
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark max-sm:w-full"
            >
              <LogIn className="h-5 w-5" /> Đăng nhập để luyện tập
            </Link>
          )}
        </div>

        <nav aria-label="Danh mục" className="mt-5 flex gap-2.5 overflow-x-auto whitespace-nowrap pb-3 [scrollbar-color:theme(colors.slate.300)_transparent] [scrollbar-width:thin]">
          <CategoryChip on={selected === 'all'} onClick={() => select('all')}>Tất cả</CategoryChip>
          {isAuthenticated && (
            <CategoryChip on={selected === 'mine'} onClick={() => select('mine')}>
              <FolderHeart className="h-4 w-4" /> Video của tôi
              {mine && mine.videos.length > 0 && <span className="text-xs opacity-75">{mine.videos.length}</span>}
            </CategoryChip>
          )}
          {categories
            .filter((c) => c.lessonCount > 0 || c.slug === selected)
            .map((c) => (
              <CategoryChip key={c.id} on={selected === c.slug} onClick={() => select(c.slug)} title={c.description}>
                {c.name}
              </CategoryChip>
            ))}
        </nav>
      </div>

      {/* ── "Video của tôi" chip: the learner's lessons as a grid ── */}
      {selected === 'mine' && (
        <section aria-label="Video của tôi" className="space-y-4">
          {!mine ? (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</div>
          ) : myVideos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
              <FolderHeart className="h-12 w-12 text-slate-300" />
              <p className="text-lg font-bold text-ink">{filtered ? 'Không có video của bạn phù hợp' : 'Bạn chưa có video nào'}</p>
              <p className="max-w-md text-sm text-slate-500">Bấm "Thêm video" ở trên, hoặc lưu bài từ thư viện cộng đồng.</p>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {myVideos.map((v) => <li key={v.id}>{card(v)}</li>)}
            </ul>
          )}
          <p className="text-xs text-slate-500">
            {mine && <>Hôm nay: {mine.usage.videosAdded}/{mine.usage.maxVideos} video đã thêm · {mine.usage.segmentsTranslated}/{mine.usage.maxSegments} câu đã dịch tự động.</>}
          </p>
        </section>
      )}

      {/* ── A category chip: all its lessons ── */}
      {isCategory && (
        <section aria-label={categoryPage?.category.name ?? 'Danh mục'} className="space-y-4">
          {!categoryPage ? (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-ink">{categoryPage.category.name}</h2>
                <p className="text-sm text-slate-500">
                  {categoryPage.category.description ? `${categoryPage.category.description} · ` : ''}{categoryPage.total} video
                </p>
              </div>
              {categoryPage.videos.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                  <Headphones className="h-12 w-12 text-slate-300" />
                  <p className="font-bold text-ink">Không có video phù hợp</p>
                </div>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryPage.videos.map((v) => <li key={v.id}>{card(v)}</li>)}
                </ul>
              )}
              {categoryPage.totalPages > 1 && (
                <nav aria-label="Trang" className="flex items-center justify-center gap-3">
                  <button type="button" onClick={() => setPage((n) => n - 1)} disabled={page === 0} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" /> Trước
                  </button>
                  <span className="text-sm font-bold tabular-nums text-slate-600">{page + 1}/{categoryPage.totalPages}</span>
                  <button type="button" onClick={() => setPage((n) => n + 1)} disabled={page + 1 >= categoryPage.totalPages} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">
                    Sau <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      )}

      {/* ── "Tất cả": the learner's row, then the community rows ── */}
      {selected === 'all' && isAuthenticated && myVideos.length > 0 && (
        <CategoryRow
          title="Video của tôi"
          description="Video bạn thêm và bài bạn đã lưu từ cộng đồng."
          icon={FolderHeart}
          count={myVideos.length}
          moreHref="/listening?c=mine"
        >
          {myVideos.map((v) => <RowItem key={`m-${v.id}`}>{card(v)}</RowItem>)}
        </CategoryRow>
      )}

      {/* Community library */}
      {selected === 'all' && libraryError && (
        <div role="alert" className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {libraryError}
        </div>
      )}
      {selected === 'all' && !library && !libraryError && (
        <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải thư viện…</div>
      )}
      {selected === 'all' && libraryEmpty && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <Headphones className="h-12 w-12 text-slate-300" />
          <p className="text-lg font-bold text-ink">{filtered ? 'Không có video phù hợp' : 'Thư viện cộng đồng chưa có video'}</p>
          <p className="max-w-md text-sm text-slate-500">
            {filtered ? 'Thử bỏ bớt bộ lọc hoặc tìm từ khác.' : 'Hãy thêm video, hoàn tất lời thoại rồi chia sẻ để mọi người cùng luyện.'}
          </p>
        </div>
      )}
      {selected === 'all' && library && library.popular.length > 0 && (
        <CategoryRow title="Được luyện nhiều" icon={Flame}>
          {library.popular.map((v) => <RowItem key={`p-${v.id}`}>{card(v)}</RowItem>)}
        </CategoryRow>
      )}
      {selected === 'all' && library && library.newest.length > 0 && (
        <CategoryRow title="Mới thêm" icon={Sparkles}>
          {library.newest.map((v) => <RowItem key={`n-${v.id}`}>{card(v)}</RowItem>)}
        </CategoryRow>
      )}
      {selected === 'all' && library?.sections.map((section) => (
        <CategoryRow
          key={section.category.id}
          title={section.category.name}
          description={section.category.description}
          count={section.total}
          moreHref={section.total > section.videos.length ? `/listening?c=${section.category.slug}` : undefined}
        >
          {section.videos.map((v) => <RowItem key={`${section.category.id}-${v.id}`}>{card(v)}</RowItem>)}
        </CategoryRow>
      ))}

      {finishedId !== null && (
        <VideoReadyModal
          video={finished}
          onClose={() => setFinishedId(null)}
          onPractise={() => {
            setFinishedId(null)
            if (finished) openDialog(finished)
          }}
        />
      )}
      {dialogs}
      {adding && <AddVideoDialog usage={mine?.usage ?? null} onClose={() => setAdding(false)} />}
      {sharing && (
        <SubmitLessonDialog
          lesson={sharing}
          admin={user?.role === 'ROLE_ADMIN'}
          onClose={() => setSharing(null)}
          onSubmitted={() => {
            setSharing(null)
            void loadMine()
            void loadLibrary()
            void getLibraryCategories().then(setCategories).catch(() => undefined)
          }}
        />
      )}
    </div>
  )
}

export function LevelChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition ${on ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  )
}

/** One chip of the category bar; the chosen one is filled with the brand colour. */
function CategoryChip({ on, onClick, title, children }: { on: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 ${
        on ? 'bg-brand font-semibold text-white shadow-sm' : 'border border-slate-200 bg-slate-50 font-medium text-slate-800 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
