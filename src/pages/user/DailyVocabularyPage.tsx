import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Volume2,
  Clock,
  Search,
  BookOpen,
  Check,
  Bell,
  Sparkles,
  Layers,
  RotateCcw,
  GraduationCap,
  Loader2,
  Calendar,
  Shuffle,
  ChevronRight,
} from 'lucide-react'
import { getDailyVocabularies, getRandomVocabulary } from '@/api/vocabularyApi'
import { AudioButton } from '@/components/ui/AudioButton'
import { MeasureWordList } from '@/components/flashcard/FlashcardParts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { DailyVocabulary } from '@/types/vocabulary'
import { VOCAB_TOPICS } from '@/data/vocabTopics'

const PRIMARY = '#C8322B'

const HSK_LEVELS = [
  'Tất cả',
  'HSK 1',
  'HSK 2',
  'HSK 3',
  'HSK 4',
  'HSK 5',
  'HSK 6',
]

// Fallback seed generator if backend is not yet started
const generateFallbackDailyVocabs = (hskLevel?: string): DailyVocabulary[] => {
  const allSampleWords = VOCAB_TOPICS.flatMap((t) => t.sampleWords || [])
  const filtered =
    hskLevel && hskLevel !== 'Tất cả'
      ? allSampleWords.filter((w) => {
          const lvl = w.levelCode || '1'
          const target = hskLevel.replace('HSK', '').trim()
          return lvl === target
        })
      : allSampleWords

  const pool = filtered.length > 0 ? filtered : allSampleWords
  const result: DailyVocabulary[] = []
  const now = new Date()

  for (let i = 0; i < 15; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)

    const seed = d.getFullYear() * 1000 + (d.getMonth() + 1) * 31 + d.getDate()
    const idx = Math.abs(seed) % pool.length
    const sample = pool[idx] || pool[0]

    const daysOfWeek = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ]
    const dayName = daysOfWeek[d.getDay()]
    const dateLabel =
      i === 0
        ? `Hôm nay, ${dayName}, ${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`
        : `${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`

    const meanings = sample.meaningVi ? sample.meaningVi.split(';').map((s) => s.trim()) : []

    result.push({
      id: sample.id || 1000 + i,
      hanzi: sample.hanzi,
      pinyin: sample.pinyin,
      meaningVi: sample.meaningVi,
      meanings: meanings.length > 0 ? meanings : [sample.meaningVi],
      hskLevel: parseInt(sample.levelCode || '1', 10) || 1,
      levelCode: sample.levelCode || '1',
      partOfSpeech: 'Từ vựng HSK',
      date: d.toISOString().split('T')[0],
      dateLabel,
      isToday: i === 0,
    })
  }

  return result
}

export const DailyVocabularyPage: React.FC = () => {
  // Level filter
  const [selectedHsk, setSelectedHsk] = useState<string>('Tất cả')

  // Realtime vocabulary list
  const [dailyVocabs, setDailyVocabs] = useState<DailyVocabulary[]>([])
  const [selectedWord, setSelectedWord] = useState<DailyVocabulary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isShuffling, setIsShuffling] = useState<boolean>(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Countdown clock to 00:00 midnight ICT
  const [countdown, setCountdown] = useState<string>('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      // Tính thời gian tới 00:00 ngày mai
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setCountdown(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        )
      } else {
        setCountdown('00:00:00')
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load realtime daily vocabulary from database
  const loadDailyVocabs = useCallback(async (level: string) => {
    setIsLoading(true)
    try {
      const cleanHsk = level === 'Tất cả' ? undefined : level
      const res = await getDailyVocabularies({ hskLevel: cleanHsk, days: 15 })

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setDailyVocabs(res.data)
        setSelectedWord(res.data[0])
      } else {
        // Fallback to local deterministic generator
        const fallback = generateFallbackDailyVocabs(level)
        setDailyVocabs(fallback)
        setSelectedWord(fallback[0])
      }
    } catch (err) {
      console.warn('API error, using local fallback:', err)
      const fallback = generateFallbackDailyVocabs(level)
      setDailyVocabs(fallback)
      setSelectedWord(fallback[0])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDailyVocabs(selectedHsk)
  }, [selectedHsk, loadDailyVocabs])

  // Lấy ngẫu nhiên 1 từ khác từ database
  const handleRandomWord = async () => {
    setIsShuffling(true)
    try {
      const cleanHsk = selectedHsk === 'Tất cả' ? undefined : selectedHsk
      const res = await getRandomVocabulary(cleanHsk)
      if (res.success && res.data) {
        setSelectedWord(res.data)
        showToast(`Đã đổi sang từ ngẫu nhiên: ${res.data.hanzi}`)
      }
    } catch (err) {
      console.warn('Could not fetch random word:', err)
      // Pick random from current list
      if (dailyVocabs.length > 0) {
        const randomIdx = Math.floor(Math.random() * dailyVocabs.length)
        setSelectedWord(dailyVocabs[randomIdx])
      }
    } finally {
      setIsShuffling(false)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Phân tích các nghĩa thành danh sách hiển thị
  const parsedMeanings = selectedWord
    ? selectedWord.meanings && selectedWord.meanings.length > 0
      ? selectedWord.meanings
      : selectedWord.meaningVi
      ? selectedWord.meaningVi.split(';').map((s) => s.trim())
      : []
    : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Toast Thông Báo Nhẹ ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-stone-800">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER SECTION ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-50 rounded-full blur-3xl -z-0 opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C8322B] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Realtime HSK 3.0 Daily Vocabulary
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Từ vựng tiếng Trung mỗi ngày
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Mỗi ngày một từ vựng chọn lọc từ kho cơ sở dữ liệu HSK 3.0, tự động cập nhật
              lúc 00:00 (giờ Việt Nam). Nghe phát âm chuẩn và ghi nhớ nghĩa.
            </p>
          </div>

          {/* Quick Realtime Countdown Widget */}
          <div className="flex items-center gap-4 bg-stone-50 border border-stone-200/70 p-4 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/60 flex items-center justify-center text-[#C8322B] shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Đổi từ mới sau:
              </div>
              <div className="text-lg font-bold font-mono text-stone-800 tracking-wider">
                {countdown || '--:--:--'}
              </div>
            </div>
          </div>
        </div>

        {/* ── HSK Filter Tabs & Random Word Button ── */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C8322B]" />
              Cấp độ:
            </span>
            {HSK_LEVELS.map((level) => {
              const isActive = selectedHsk === level
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedHsk(level)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#C8322B] text-white shadow-sm ring-2 ring-[#C8322B]/20'
                      : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  {level}
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomWord}
            disabled={isShuffling || isLoading}
            className="rounded-xl border-stone-200 hover:border-[#C8322B] hover:text-[#C8322B] text-xs font-semibold h-9 px-4 gap-1.5"
          >
            {isShuffling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Shuffle className="w-3.5 h-3.5" />
            )}
            Đổi từ ngẫu nhiên
          </Button>
        </div>
      </div>

      {/* ── 2. BỐ CỤC 2 CỘT: TỪ HÔM NAY & NHỮNG NGÀY TRƯỚC ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── CỘT TRÁI: CHI TIẾT TỪ VỰNG ĐƯỢC CHỌN (8/12 CỘT) ────────── */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-4 w-40 rounded-lg" />
              </div>
              <Skeleton className="h-24 w-48 rounded-2xl" />
              <Skeleton className="h-6 w-32 rounded-lg" />
              <div className="space-y-3 pt-4">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            </div>
          ) : !selectedWord ? (
            <div className="py-16 text-center text-stone-500 space-y-3">
              <div className="text-4xl">📖</div>
              <p className="font-semibold text-stone-800">
                Chưa có từ vựng cho cấp độ này.
              </p>
              <Button
                size="sm"
                onClick={() => setSelectedHsk('Tất cả')}
                className="rounded-xl bg-[#C8322B] text-white"
              >
                Xem tất cả cấp độ
              </Button>
            </div>
          ) : (
            <>
              {/* Header card: Cấp độ HSK, từ loại, nhãn thời gian */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-red-50 text-[#C8322B] border border-red-100">
                    HSK {selectedWord.levelCode || selectedWord.hskLevel}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-stone-100 text-stone-700">
                    {selectedWord.partOfSpeech || 'Từ vựng HSK'}
                  </span>
                  {selectedWord.isToday && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                      ★ Từ hôm nay
                    </span>
                  )}
                </div>

                <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {selectedWord.dateLabel}
                </div>
              </div>

              {/* Chữ Hán lớn, Pinyin, Phát âm */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
                <div>
                  {/* Chữ Hán siêu lớn */}
                  <div
                    className="text-6xl sm:text-7xl font-bold text-stone-900 tracking-wide select-none"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {selectedWord.hanzi}
                  </div>

                  {/* Phiên âm Pinyin */}
                  <div className="text-2xl font-semibold text-[#C8322B] mt-2 tracking-wide font-mono">
                    {selectedWord.pinyin}
                  </div>

                  {/* Nút bấm nghe phát âm */}
                  <div className="flex items-center gap-3 mt-4">
                    <AudioButton
                      audioUrl={selectedWord.audioUrl}
                      text={selectedWord.hanzi}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Quick Info Box */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2 sm:min-w-[200px]">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Thông tin từ vựng
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
                    <div>
                      Hán tự phồn thể:{' '}
                      <strong className="text-stone-900 font-semibold">
                        {selectedWord.hanziTraditional || selectedWord.hanzi}
                      </strong>
                    </div>
                    <div>
                      Cấp độ chuẩn:{' '}
                      <strong className="text-[#C8322B] font-semibold">
                        HSK {selectedWord.levelCode || selectedWord.hskLevel}
                      </strong>
                    </div>
                    <div>
                      Từ loại:{' '}
                      <strong className="text-stone-900 font-semibold">
                        {selectedWord.partOfSpeech || 'Từ vựng'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mục NGHĨA TIẾNG VIỆT (Đánh số 1, 2, 3...) */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#C8322B]" />
                  Ý nghĩa tiếng Việt
                </h3>

                <div className="space-y-2.5">
                  {parsedMeanings.length === 0 ? (
                    <div className="text-sm text-stone-600 italic">
                      {selectedWord.meaningVi || 'Chưa có bản dịch tiếng Việt.'}
                    </div>
                  ) : (
                    parsedMeanings.map((meaningText, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex items-start gap-3 hover:bg-stone-50 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="text-sm text-stone-800 font-medium leading-relaxed">
                          {meaningText}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lượng từ đi kèm danh từ (nếu có) */}
              <MeasureWordList items={selectedWord.measureWords} className="w-full" />

              {/* Footer Links: Học flashcard, tra từ điển, chủ đề */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/vocabulary/search?q=${encodeURIComponent(selectedWord.hanzi)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 hover:text-[#C8322B] hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Tra trong từ điển</span>
                  </Link>

                  <Link
                    to="/flashcards"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 hover:text-[#C8322B] hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Ôn qua Flashcard</span>
                  </Link>
                </div>

                <Link
                  to="/vocabulary/topic"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#C8322B] hover:underline"
                >
                  <span>Xem từ vựng theo chủ đề</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── CỘT PHẢI: NHỮNG NGÀY TRƯỚC (4/12 CỘT) ──────────────────── */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-sm sticky top-20 space-y-4">
          {/* Header Cột Phải */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 text-stone-800 font-bold text-base">
              <Clock className="w-4 h-4 text-[#C8322B]" />
              <span>Những ngày trước</span>
            </div>
            <span className="text-xs text-stone-400 font-semibold">
              {dailyVocabs.length > 1 ? `${dailyVocabs.length - 1} ngày` : ''}
            </span>
          </div>

          {/* Danh Sách Từ Vựng Các Ngày Trước */}
          <div className="divide-y divide-stone-100 max-h-[580px] overflow-y-auto pr-1 space-y-1">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="py-3 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))
            ) : dailyVocabs.length <= 1 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                Chưa có lịch sử các ngày trước.
              </div>
            ) : (
              dailyVocabs.slice(1).map((item) => {
                const isCurrent = selectedWord?.id === item.id
                return (
                  <div
                    key={`${item.id}-${item.date}`}
                    onClick={() => setSelectedWord(item)}
                    className={`group flex items-start justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-red-50/70 border border-red-100 shadow-xs'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    {/* Chữ Hán bên trái */}
                    <div
                      className={`text-2xl font-bold tracking-wide shrink-0 transition-colors ${
                        isCurrent
                          ? 'text-[#C8322B]'
                          : 'text-stone-800 group-hover:text-[#C8322B]'
                      }`}
                      style={{ fontFamily: "'Noto Serif SC', serif" }}
                    >
                      {item.hanzi}
                    </div>

                    {/* Thông tin nghĩa, Pinyin và ngày tháng bên phải */}
                    <div className="flex-1 ml-3.5 text-left min-w-0">
                      <p className="text-xs font-semibold text-stone-800 truncate leading-snug">
                        {item.meanings && item.meanings[0]
                          ? item.meanings[0]
                          : item.meaningVi}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5 truncate font-mono">
                        {item.pinyin} ·{' '}
                        <span className="font-sans text-stone-500">
                          {item.dateLabel}
                        </span>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 shrink-0 ml-2">
                      HSK {item.levelCode || item.hskLevel}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Khung Thông Báo Nhỏ Chân Cột Phải */}
          <div className="bg-red-50/60 border border-red-100 rounded-2xl p-3.5 text-xs text-stone-600 text-center leading-relaxed flex items-center justify-center gap-2">
            <Bell className="w-4 h-4 text-[#C8322B] shrink-0" />
            <span>Từ vựng mới tự động cập nhật mỗi ngày lúc 00:00.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyVocabularyPage
