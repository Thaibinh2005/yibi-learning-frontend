import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertCircle, ChevronLeft, ChevronRight, Headphones, Loader2, Search, X } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { LessonCard } from '@/components/listening/LessonCard'
import { useOpenLesson } from '@/components/listening/useOpenLesson'
import { apiError, getCategoryPage, removeFromShelf, saveToShelf } from '@/api/listeningApi'
import { LEVELS, LevelChip } from '@/pages/user/listening/ListeningPage'
import type { CategoryPage, VideoSummary } from '@/types/listening'

/** "Xem tất cả" of one category: every published lesson in it, filtered by level and title, a page at a time. */
export function ListeningCategoryPage() {
  const { slug = '' } = useParams()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [level, setLevel] = useState('')
  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<CategoryPage | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(query.trim())
      setPage(0)
    }, 350)
    return () => window.clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    try {
      setData(await getCategoryPage(slug, { level, q, page }))
      setError(null)
    } catch (err) {
      setError(apiError(err, 'Không tải được danh mục.'))
    }
  }, [slug, level, q, page])

  useEffect(() => {
    void load()
  }, [load])

  const { open, dialogs } = useOpenLesson(data?.videos ?? [])

  const toggleSave = async (video: VideoSummary) => {
    try {
      if (video.saved) await removeFromShelf(video.id)
      else await saveToShelf(video.id)
      toast.success(video.saved ? 'Đã bỏ lưu' : 'Đã lưu vào Video của tôi', { description: video.title })
      await load()
    } catch (err) {
      toast.error('Chưa lưu được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  return (
    <div className="space-y-6 pb-6 pt-2">
      <div>
        <Link to="/listening" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800">
          <ChevronLeft className="h-4 w-4" /> Nghe chép & Nói nhại
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{data?.category.name ?? 'Danh mục'}</h1>
        {data?.category.description && <p className="mt-1 text-slate-500">{data.category.description}</p>}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block lg:w-80">
          <span className="sr-only">Tìm trong danh mục</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm trong danh mục…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm shadow-sm focus:border-brand focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Xoá tìm kiếm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <div role="group" aria-label="Lọc theo trình độ" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <LevelChip on={level === ''} onClick={() => { setLevel(''); setPage(0) }}>Tất cả</LevelChip>
          {LEVELS.map((l) => (
            <LevelChip key={l} on={level === l} onClick={() => { setLevel(l); setPage(0) }}>HSK {l}</LevelChip>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {!data && !error && <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</div>}

      {data && data.videos.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <Headphones className="h-12 w-12 text-slate-300" />
          <p className="font-bold text-ink">Không có video phù hợp</p>
        </div>
      )}

      {data && data.videos.length > 0 && (
        <>
          <p className="text-sm text-slate-500">{data.total} video</p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.videos.map((v) => (
              <li key={v.id}>
                <LessonCard video={v} onOpen={() => open(v)} onToggleSave={isAuthenticated ? () => void toggleSave(v) : undefined} />
              </li>
            ))}
          </ul>
          {data.totalPages > 1 && (
            <nav aria-label="Trang" className="flex items-center justify-center gap-3">
              <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page === 0} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              <span className="text-sm font-bold tabular-nums text-slate-600">{page + 1}/{data.totalPages}</span>
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= data.totalPages} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">
                Sau <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}
      {dialogs}
    </div>
  )
}
