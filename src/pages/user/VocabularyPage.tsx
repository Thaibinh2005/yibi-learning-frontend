import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Sparkles,
  RotateCcw,
  BookOpen,
  AlertCircle,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { getVocabularies } from '@/api/vocabularyApi'
import type { Vocabulary } from '@/types/vocabulary'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AudioButton } from '@/components/ui/AudioButton'

const PRIMARY = '#C8322B'
const PAGE_SIZE = 20

export const VocabularyPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loadMoreFailed, setLoadMoreFailed] = useState<boolean>(false)

  // A link can open this page on a word, such as "Tra trong từ điển" on the daily word.
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') ?? '')
  const [selectedHsk, setSelectedHsk] = useState<string>('all')
  const [page, setPage] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [attempt, setAttempt] = useState<number>(0)

  const fetchPage = (nextPage: number) =>
    getVocabularies({
      hskLevel: selectedHsk !== 'all' ? selectedHsk : undefined,
      search: searchQuery.trim() || undefined,
      page: nextPage,
      size: PAGE_SIZE,
    })

  useEffect(() => {
    const next = searchParams.get('q')
    if (next !== null) setSearchQuery(next)
  }, [searchParams])

  // Waits 300 ms after typing. Only the latest search may fill the list, since answers can arrive out of order.
  useEffect(() => {
    let current = true
    setIsLoading(true)
    setError(null)
    setLoadMoreFailed(false)

    const handler = setTimeout(async () => {
      try {
        const res = await fetchPage(0)
        if (!current) return
        const items = res.success && Array.isArray(res.data) ? res.data : []
        setVocabularies(items)
        setPage(0)
        setHasMore(items.length === PAGE_SIZE)
      } catch (err: any) {
        if (!current) return
        console.error('Error fetching vocabularies:', err)
        setError(err?.response?.data?.message || 'Không thể tải danh sách từ vựng. Vui lòng thử lại sau.')
      } finally {
        if (current) setIsLoading(false)
      }
    }, 300)

    return () => {
      current = false
      clearTimeout(handler)
    }
  }, [searchQuery, selectedHsk, attempt])

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    setLoadMoreFailed(false)
    const nextPage = page + 1
    try {
      const res = await fetchPage(nextPage)
      const items = res.success && Array.isArray(res.data) ? res.data : []
      setVocabularies((prev) => [...prev, ...items])
      setPage(nextPage)
      setHasMore(items.length === PAGE_SIZE)
    } catch (err) {
      console.error('Error loading more vocabularies:', err)
      setLoadMoreFailed(true)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleRetry = () => setAttempt((value) => value + 1)

  // Xóa bộ lọc
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedHsk('all')
  }

  return (
    <div className="space-y-6">
      {/* ── Header Title Card ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-[#C8322B] mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Kho từ vựng HSK 1 - 9</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Tra Cứu Từ Vựng Tiếng Trung
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gõ chữ Hán, pinyin hoặc nghĩa tiếng Việt, có dấu hay không dấu đều được.
          </p>
        </div>

        {/* Thống kê số lượng */}
        {!isLoading && (
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-500">Đang hiển thị</span>
            <div className="text-lg font-bold text-slate-800">
              <span style={{ color: PRIMARY }}>{vocabularies.length}</span>
              {hasMore ? '+' : ''} từ vựng
            </div>
          </div>
        )}
      </div>

      {/* ── Toolbar: Input Search & Select HSK ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Ô nhập từ khóa tìm kiếm (Input shadcn) */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ví dụ: 学习, xuexi, học tập, hoc tap..."
              className="pl-9 h-10 bg-slate-50 border-slate-200 text-sm placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#C8322B] focus-visible:border-[#C8322B] rounded-xl transition-all"
            />
          </div>

          {/* Hộp chọn cấp độ HSK (Select shadcn) */}
          <div className="w-full sm:w-56 shrink-0">
            <Select value={selectedHsk} onValueChange={setSelectedHsk}>
              <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#C8322B] focus:border-[#C8322B] text-sm">
                <SelectValue placeholder="Chọn cấp độ HSK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp độ (HSK 1 - 9)</SelectItem>
                <SelectItem value="1">HSK 1</SelectItem>
                <SelectItem value="2">HSK 2</SelectItem>
                <SelectItem value="3">HSK 3</SelectItem>
                <SelectItem value="4">HSK 4</SelectItem>
                <SelectItem value="5">HSK 5</SelectItem>
                <SelectItem value="6">HSK 6</SelectItem>
                <SelectItem value="7-9">HSK 7 - 9</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nút Reset bộ lọc (khi đang lọc) */}
          {(searchQuery || selectedHsk !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Content Area: Grid of Cards / Skeletons / Empty State ──── */}
      {isLoading ? (
        // Skeleton Loading State
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-9 w-20 rounded-lg" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-44 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Đã có lỗi xảy ra
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
            style={{ backgroundColor: PRIMARY }}
          >
            Thử lại
          </button>
        </div>
      ) : vocabularies.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Không tìm thấy từ vựng phù hợp
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc cấp độ HSK.
          </p>
          {(searchQuery || selectedHsk !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-[#C8322B] bg-rose-50 hover:bg-rose-100 transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      ) : (
        // Data Grid State
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {vocabularies.map((item) => {
              const primaryExample = item.exampleSentence
                ? {
                    sentence: item.exampleSentence,
                    pinyin: item.examplePinyin,
                    translation: item.exampleTranslation,
                  }
                : null

              return (
                <Card
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#C8322B]/40 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <CardContent className="p-0 space-y-3">
                    {/* Dòng trên: Chữ Hán lớn & Badge HSK */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span
                          className="text-3xl font-bold font-chinese text-slate-900 group-hover:text-[#C8322B] transition-colors tracking-wide"
                          style={{ fontFamily: "'Noto Serif SC', serif" }}
                        >
                          {item.hanzi}
                        </span>
                        {item.hanziTraditional &&
                          item.hanziTraditional !== item.hanzi && (
                            <span className="text-[11px] text-slate-400 font-chinese">
                              Phồn thể: {item.hanziTraditional}
                            </span>
                          )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#C8322B] border border-rose-100 shrink-0">
                          {item.levelCode || item.hskLevel ? `HSK ${item.levelCode || item.hskLevel}` : 'Ngoài HSK'}
                        </span>
                        {item.partOfSpeech && (
                          <span className="text-[10px] text-slate-400 capitalize">
                            {item.partOfSpeech}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phiên âm Pinyin & Nút phát âm */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 tracking-wide font-mono">
                        {item.pinyin}
                      </p>
                      <AudioButton
                        audioUrl={item.audioUrl}
                        text={item.hanzi}
                        size="sm"
                        title={`Nghe phát âm: ${item.hanzi}`}
                      />
                    </div>

                    {/* Nghĩa tiếng Việt */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        {item.meaningVi || <span className="font-normal italic text-slate-400">Chưa có nghĩa tiếng Việt</span>}
                      </p>
                      {item.meaningEn && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {item.meaningEn}
                        </p>
                      )}
                    </div>

                    {/* 1 Câu ví dụ tiêu biểu (câu tiếng Trung, pinyin và nghĩa Việt) */}
                    {primaryExample && (
                      <div className="pt-2 border-t border-dashed border-slate-100 space-y-1">
                        <p className="font-chinese text-slate-600 line-clamp-2 italic text-xs font-medium">
                          “{primaryExample.sentence}”
                        </p>
                        {primaryExample.pinyin && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                            {primaryExample.pinyin}
                          </p>
                        )}
                        {primaryExample.translation && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                            → {primaryExample.translation}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ── Logic Load More (Nút bấm & Cuộn) ──────────────────────── */}
          {hasMore && (
            <div className="pt-4 pb-2 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C8322B] hover:bg-brand-dark active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải thêm...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Tải thêm từ vựng</span>
                  </>
                )}
              </button>
            </div>
          )}

          {loadMoreFailed && (
            <p className="text-center text-xs font-medium text-red-600" role="alert">
              Chưa tải thêm được từ vựng. Hãy bấm lại nút trên để thử lại.
            </p>
          )}

          {!hasMore && vocabularies.length > 0 && (
            <div className="pt-4 pb-2 text-center text-xs text-slate-400">
              Đã hiển thị toàn bộ {vocabularies.length} từ vựng
            </div>
          )}
        </div>
      )}
    </div>
  )
}
