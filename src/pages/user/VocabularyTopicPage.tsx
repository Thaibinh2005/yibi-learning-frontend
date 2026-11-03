import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Sparkles,
  ArrowDownWideNarrow,
  ArrowDownAZ,
  RotateCcw,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getTopics } from '@/api/topicApi'
import { VOCAB_TOPICS, type VocabTopic } from '@/data/vocabTopics'

const PRIMARY = '#B52A2A'

const HSK_LEVELS = [
  'Tất cả',
  'HSK 1',
  'HSK 2',
  'HSK 3',
  'HSK 4',
  'HSK 5',
  'HSK 6',
  'HSK 7-9',
]

export const VocabularyTopicPage: React.FC = () => {
  const navigate = useNavigate()

  // Topics state
  const [topics, setTopics] = useState<VocabTopic[]>(VOCAB_TOPICS)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedHsk, setSelectedHsk] = useState<string>('Tất cả')
  const [sortOption, setSortOption] = useState<'count' | 'az'>('count')

  // Fetch topics from API or fallback to local seed data
  useEffect(() => {
    let isMounted = true

    const loadTopics = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const cleanHsk = selectedHsk === 'Tất cả' ? undefined : selectedHsk
        const res = await getTopics({
          hskLevel: cleanHsk,
          search: searchQuery.trim() || undefined,
          sort: sortOption,
        })

        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setTopics(res.data)
        } else if (isMounted) {
          filterClientTopics()
        }
      } catch (err) {
        console.warn('API error, falling back to local topics:', err)
        if (isMounted) {
          filterClientTopics()
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    const filterClientTopics = () => {
      let filtered = [...VOCAB_TOPICS]

      // Filter by HSK
      if (selectedHsk !== 'Tất cả') {
        filtered = filtered.filter(
          (t) => t.hskLevel.toLowerCase() === selectedHsk.toLowerCase()
        )
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        filtered = filtered.filter(
          (t) =>
            t.titleVi.toLowerCase().includes(q) ||
            t.titleZh.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.sampleWords.some(
              (w) =>
                w.hanzi.toLowerCase().includes(q) ||
                w.meaningVi.toLowerCase().includes(q)
            )
        )
      }

      // Sort
      if (sortOption === 'az') {
        filtered.sort((a, b) => a.titleVi.localeCompare(b.titleVi, 'vi'))
      } else {
        filtered.sort((a, b) => b.wordCount - a.wordCount)
      }

      setTopics(filtered)
    }

    const timer = setTimeout(loadTopics, 200)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchQuery, selectedHsk, sortOption])

  const handleOpenTopic = (topic: VocabTopic) => {
    navigate(
      selectedHsk === 'Tất cả'
        ? `/vocabulary/topic/${topic.slug}`
        : `/vocabulary/topic/${topic.slug}?hsk=${encodeURIComponent(selectedHsk)}`
    )
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedHsk('Tất cả')
    setSortOption('count')
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── 1. HEADER SECTION ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-50 rounded-full blur-3xl -z-0 opacity-60 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#B52A2A] text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Chủ đề từ vựng HSK 3.0
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Từ vựng tiếng Trung theo chủ đề
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
                Học từ vựng qua ngữ cảnh thực tế với 178 chủ đề toàn diện từ đời
                sống, ẩm thực, du lịch, giao tiếp đến công sở và học thuật.
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className="px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/60 text-center min-w-[100px]">
                <div className="text-xl font-bold text-[#B52A2A]">178</div>
                <div className="text-xs text-stone-500 font-medium">Chủ đề</div>
              </div>
              <div className="px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/60 text-center min-w-[100px]">
                <div className="text-xl font-bold text-stone-800">HSK 1-9</div>
                <div className="text-xs text-stone-500 font-medium">Cấp độ</div>
              </div>
              <div className="px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/60 text-center min-w-[100px]">
                <div className="text-xl font-bold text-emerald-600">Audio</div>
                <div className="text-xs text-stone-500 font-medium">Phát âm chuẩn</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. SEARCH & SORT BAR + HSK FILTER TABS ── */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 space-y-6">
          {/* Row 1: Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm chủ đề (ví dụ: ẩm thực, du lịch, công việc...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-10 py-3 rounded-2xl border-stone-200 focus:border-[#B52A2A] focus:ring-[#B52A2A] text-sm bg-stone-50/50 hover:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Options Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSortOption('count')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  sortOption === 'count'
                    ? 'bg-white text-[#B52A2A] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowDownWideNarrow className="w-4 h-4" />
                Nhiều từ nhất
              </button>
              <button
                type="button"
                onClick={() => setSortOption('az')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  sortOption === 'az'
                    ? 'bg-white text-[#B52A2A] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowDownAZ className="w-4 h-4" />
                A - Z
              </button>
            </div>
          </div>

          {/* Row 2: HSK Level Filter Pills */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Lọc theo cấp độ HSK:</span>
              {(searchQuery || selectedHsk !== 'Tất cả' || sortOption !== 'count') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-[#B52A2A] hover:underline font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {HSK_LEVELS.map((level) => {
                const isActive = selectedHsk === level
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedHsk(level)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#B52A2A] text-white shadow-sm ring-2 ring-[#B52A2A]/20'
                        : 'bg-stone-100/80 text-stone-700 hover:bg-stone-200/70'
                    }`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── 3. TOPIC CARDS GRID ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-base font-bold text-stone-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#B52A2A]" />
              Danh sách chủ đề ({topics.length})
            </h2>
            <span className="text-xs text-stone-500">
              Nhấn vào thẻ chủ đề để học toàn bộ từ vựng
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border border-stone-200/80 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-5 w-3/4 rounded-md" />
                      <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-lg" />
                    <Skeleton className="h-6 w-16 rounded-lg" />
                    <Skeleton className="h-6 w-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : topics.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4">
              <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-stone-800">
                Không tìm thấy chủ đề phù hợp
              </h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Không có chủ đề nào khớp với từ khóa &ldquo;{searchQuery}&rdquo; và bộ lọc
                đã chọn. Bạn hãy thử tìm kiếm với cụm từ khác nhé!
              </p>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-xl border-stone-300 hover:border-[#B52A2A] hover:text-[#B52A2A]"
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.map((topic) => (
                <div
                  key={topic.id || topic.slug}
                  onClick={() => handleOpenTopic(topic)}
                  className="group bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 hover:border-[#B52A2A]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header: Icon, Titles, Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl sm:text-4xl p-2.5 bg-stone-50 group-hover:bg-red-50/60 rounded-2xl border border-stone-200/50 group-hover:border-[#B52A2A]/20 transition-colors">
                          {topic.icon || '📖'}
                        </span>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-[#B52A2A] transition-colors leading-snug">
                            {topic.titleVi}
                          </h3>
                          <p className="text-xs sm:text-sm font-medium text-stone-500">
                            {topic.titleZh}
                          </p>
                        </div>
                      </div>

                      {/* HSK Badge */}
                      <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold whitespace-nowrap group-hover:bg-red-100 group-hover:text-[#B52A2A] transition-colors">
                        {selectedHsk === 'Tất cả' ? topic.hskLevel : selectedHsk}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>

                    {/* Sample Words Chips */}
                    {topic.sampleWords && topic.sampleWords.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                          Từ vựng tiêu biểu:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {topic.sampleWords.slice(0, 4).map((sw, idx) => (
                            <span
                              key={idx}
                              title={`${sw.pinyin}: ${sw.meaningVi}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 group-hover:bg-stone-100 border border-stone-200/60 text-xs text-stone-700 transition-colors"
                            >
                              <span className="font-semibold text-stone-900">
                                {sw.hanzi}
                              </span>
                              {sw.pinyin && (
                                <span className="text-stone-400 text-[11px]">
                                  ({sw.pinyin})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer: Word count & Action */}
                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-500">
                      <strong className="text-stone-800 font-bold">
                        {topic.wordCount || topic.sampleWords?.length || 0}
                      </strong>{' '}
                      từ vựng
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#B52A2A] font-semibold group-hover:translate-x-0.5 transition-transform">
                      Khám phá
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VocabularyTopicPage
