import React, { useState, useEffect } from 'react'
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

const PRIMARY = '#B52A2A'
const PAGE_SIZE = 20

export const VocabularyPage: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Bộ lọc tìm kiếm & cấp độ HSK
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedHsk, setSelectedHsk] = useState<string>('all')

  // Phân trang dạng Cuộn & Nút bấm (Load More)
  const [page, setPage] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)

  // Tự động tìm kiếm với debounce 300ms khi thay đổi từ khóa hoặc cấp độ HSK
  useEffect(() => {
    setIsLoading(true)
    setError(null)

    const handler = setTimeout(async () => {
      try {
        const hskLevelNumber =
          selectedHsk !== 'all' ? parseInt(selectedHsk, 10) : undefined

        const res = await getVocabularies({
          hskLevel: hskLevelNumber,
          search: searchQuery.trim() || undefined,
          page: 0,
          size: PAGE_SIZE,
        })

        if (res.success && Array.isArray(res.data)) {
          setVocabularies(res.data)
          setPage(0)
          setHasMore(res.data.length === PAGE_SIZE)
        } else {
          setVocabularies([])
          setHasMore(false)
        }
      } catch (err: any) {
        console.error('Error fetching vocabularies:', err)
        setError(
          err?.response?.data?.message ||
            'Không thể tải danh sách từ vựng. Vui lòng thử lại sau.'
        )
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [searchQuery, selectedHsk])

  // Xử lý nạp thêm từ vựng khi bấm nút "Tải thêm từ vựng" (Load More)
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1

    try {
      const hskLevelNumber =
        selectedHsk !== 'all' ? parseInt(selectedHsk, 10) : undefined

      const res = await getVocabularies({
        hskLevel: hskLevelNumber,
        search: searchQuery.trim() || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      })

      if (res.success && Array.isArray(res.data)) {
        setVocabularies((prev) => [...prev, ...res.data])
        setPage(nextPage)
        setHasMore(res.data.length === PAGE_SIZE)
      } else {
        setHasMore(false)
      }
    } catch (err: any) {
      console.error('Error loading more vocabularies:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Thử lại khi có lỗi
  const handleRetry = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const hskLevelNumber =
        selectedHsk !== 'all' ? parseInt(selectedHsk, 10) : undefined

      const res = await getVocabularies({
        hskLevel: hskLevelNumber,
        search: searchQuery.trim() || undefined,
        page: 0,
        size: PAGE_SIZE,
      })

      if (res.success && Array.isArray(res.data)) {
        setVocabularies(res.data)
        setPage(0)
        setHasMore(res.data.length === PAGE_SIZE)
      } else {
        setVocabularies([])
        setHasMore(false)
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Không thể tải danh sách từ vựng. Vui lòng thử lại sau.'
      )
    } finally {
      setIsLoading(false)
    }
  }

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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-[#B52A2A] mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Kho từ vựng chuẩn HSK 1 - 6 mở rộng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Tra Cứu Từ Vựng Tiếng Trung
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tra cứu chữ Hán, phiên âm Pinyin, ngữ nghĩa và ví dụ câu theo chuẩn khung HSK.
          </p>
        </div>

        {/* Thống kê số lượng */}
        {!isLoading && (
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400">Đang hiển thị</span>
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
              placeholder="Nhập chữ Hán, Pinyin hoặc nghĩa tiếng Việt..."
              className="pl-9 h-10 bg-slate-50 border-slate-200 text-sm placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#B52A2A] focus-visible:border-[#B52A2A] rounded-xl transition-all"
            />
          </div>

          {/* Hộp chọn cấp độ HSK (Select shadcn) */}
          <div className="w-full sm:w-56 shrink-0">
            <Select value={selectedHsk} onValueChange={setSelectedHsk}>
              <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#B52A2A] focus:border-[#B52A2A] text-sm">
                <SelectValue placeholder="Chọn cấp độ HSK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp độ (HSK 1 - 6)</SelectItem>
                <SelectItem value="1">HSK 1</SelectItem>
                <SelectItem value="2">HSK 2</SelectItem>
                <SelectItem value="3">HSK 3</SelectItem>
                <SelectItem value="4">HSK 4</SelectItem>
                <SelectItem value="5">HSK 5</SelectItem>
                <SelectItem value="6">HSK 6</SelectItem>
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
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-[#B52A2A] bg-rose-50 hover:bg-rose-100 transition-colors inline-flex items-center gap-1.5"
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
              // Trích xuất 1 câu ví dụ tiêu biểu (ưu tiên mảng examples, fallback sang exampleSentence)
              const primaryExample =
                item.examples && item.examples.length > 0
                  ? item.examples[0]
                  : item.exampleSentence
                  ? {
                      sentence: item.exampleSentence,
                      pinyin: item.examplePinyin,
                      translation: undefined,
                    }
                  : null

              return (
                <Card
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#B52A2A]/40 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <CardContent className="p-0 space-y-3">
                    {/* Dòng trên: Chữ Hán lớn & Badge HSK */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span
                          className="text-3xl font-bold font-chinese text-slate-900 group-hover:text-[#B52A2A] transition-colors tracking-wide"
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#B52A2A] border border-rose-100 shrink-0">
                          HSK {item.hskLevel}
                        </span>
                        {item.partOfSpeech && (
                          <span className="text-[10px] text-slate-400 capitalize">
                            {item.partOfSpeech}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phiên âm Pinyin */}
                    <div>
                      <p className="text-sm font-medium text-slate-400 tracking-wide">
                        {item.pinyin}
                      </p>
                    </div>

                    {/* Nghĩa tiếng Việt */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        {item.meaningVi}
                      </p>
                      {item.meaningEn && (
                        <p className="text-xs text-slate-400 mt-0.5">
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#B52A2A] hover:bg-[#992222] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
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
