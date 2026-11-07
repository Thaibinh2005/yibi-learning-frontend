import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  GraduationCap,
  BookOpen,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AudioButton } from '@/components/ui/AudioButton'
import { getTopicBySlug, getVocabulariesByTopic } from '@/api/topicApi'
import { VOCAB_TOPICS, type VocabTopic } from '@/data/vocabTopics'
import type { Vocabulary } from '@/types/vocabulary'

const PRIMARY = '#C8322B'
const PAGE_SIZE = 30

/* ═══════════════════════════════════════════════════
   Main Detail Page
   ═══════════════════════════════════════════════════ */
export const VocabularyTopicDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  // HSK level chosen on the topic list page (e.g. "HSK 7-9"); filters words by level.
  const [searchParams] = useSearchParams()
  const hskFilter = searchParams.get('hsk') || undefined

  // Topic metadata
  const [topic, setTopic] = useState<VocabTopic | null>(null)
  const [isLoadingTopic, setIsLoadingTopic] = useState(true)

  // Vocabulary list
  const [vocabs, setVocabs] = useState<Vocabulary[]>([])
  const [isLoadingVocabs, setIsLoadingVocabs] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalLoaded, setTotalLoaded] = useState(0)


  /* ── Load topic metadata ── */
  useEffect(() => {
    if (!slug) return

    let isMounted = true
    setIsLoadingTopic(true)

    const loadTopic = async () => {
      try {
        const res = await getTopicBySlug(slug, hskFilter)
        if (isMounted && res.success && res.data) {
          setTopic(res.data)
        } else if (isMounted) {
          // Fallback to local data
          const local = VOCAB_TOPICS.find((t) => t.slug === slug)
          if (local) setTopic(local)
        }
      } catch {
        // Fallback to local data
        if (isMounted) {
          const local = VOCAB_TOPICS.find((t) => t.slug === slug)
          if (local) setTopic(local)
        }
      } finally {
        if (isMounted) setIsLoadingTopic(false)
      }
    }

    loadTopic()
    return () => {
      isMounted = false
    }
  }, [slug, hskFilter])

  /* ── Load vocabulary list (initial + pages) ── */
  const loadVocabs = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!slug) return
      setIsLoadingVocabs(true)

      try {
        const res = await getVocabulariesByTopic(slug, pageNum, PAGE_SIZE, hskFilter)
        if (res.success && Array.isArray(res.data)) {
          if (append) {
            setVocabs((prev) => [...prev, ...res.data])
          } else {
            setVocabs(res.data)
          }
          setTotalLoaded((prev) => (append ? prev + res.data.length : res.data.length))
          setHasMore(res.data.length === PAGE_SIZE)
          setPage(pageNum)
        } else {
          if (!append) {
            // Fallback: use sample words from topic
            if (topic?.sampleWords) {
              setVocabs(
                topic.sampleWords.map((sw) => ({
                  id: sw.id,
                  hanzi: sw.hanzi,
                  pinyin: sw.pinyin,
                  meaningVi: sw.meaningVi,
                  hskLevel: parseInt(sw.levelCode || '1', 10) || 1,
                  levelCode: sw.levelCode || undefined,
                }))
              )
              setTotalLoaded(topic.sampleWords.length)
            }
            setHasMore(false)
          }
        }
      } catch (err) {
        console.warn('Error loading vocabularies:', err)
        if (!append && topic?.sampleWords) {
          setVocabs(
            topic.sampleWords.map((sw) => ({
              id: sw.id,
              hanzi: sw.hanzi,
              pinyin: sw.pinyin,
              meaningVi: sw.meaningVi,
              hskLevel: parseInt(sw.levelCode || '1', 10) || 1,
              levelCode: sw.levelCode || undefined,
            }))
          )
          setTotalLoaded(topic.sampleWords.length)
          setHasMore(false)
        }
      } finally {
        setIsLoadingVocabs(false)
      }
    },
    [slug, topic, hskFilter]
  )

  // Initial load of vocabs when topic or slug changes
  useEffect(() => {
    if (slug) {
      setVocabs([])
      setPage(0)
      setHasMore(true)
      setTotalLoaded(0)
      loadVocabs(0, false)
    }
  }, [slug, hskFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (!isLoadingVocabs && hasMore) {
      loadVocabs(page + 1, true)
    }
  }

  /* ── Loading skeleton ── */
  if (isLoadingTopic) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 animate-pulse space-y-4">
            <div className="h-6 w-32 bg-stone-200 rounded-lg" />
            <div className="h-10 w-3/4 bg-stone-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-stone-200 rounded-lg" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-stone-200/80 animate-pulse flex items-center gap-4"
            >
              <div className="w-8 h-8 bg-stone-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-20 bg-stone-200 rounded" />
                <div className="h-4 w-40 bg-stone-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4">
            <div className="text-5xl">😕</div>
            <h2 className="text-xl font-bold text-stone-800">
              Không tìm thấy chủ đề
            </h2>
            <p className="text-sm text-stone-500">
              Chủ đề &ldquo;{slug}&rdquo; không tồn tại hoặc đã bị xóa.
            </p>
            <Button
              onClick={() => navigate('/vocabulary/topic')}
              className="rounded-xl bg-[#C8322B] hover:bg-[#9B2323] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách chủ đề
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── BACK NAVIGATION ── */}
        <Link
          to="/vocabulary/topic"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-[#C8322B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách chủ đề
        </Link>

        {/* ── TOPIC HEADER ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -z-0 opacity-50 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl sm:text-5xl p-3 bg-stone-50 rounded-2xl border border-stone-200/50 flex-shrink-0">
                {topic.icon || '📖'}
              </span>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-red-100 text-[#C8322B] text-xs font-bold">
                    {hskFilter || topic.hskLevel}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {topic.wordCount} từ vựng
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {topic.titleVi}{' '}
                  <span className="text-lg font-medium text-stone-500">
                    ({topic.titleZh})
                  </span>
                </h1>
                <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                  {topic.description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() =>
                  navigate(
                    `/vocabulary/topic/${slug}/flashcards${
                      hskFilter ? `?hsk=${encodeURIComponent(hskFilter)}` : ''
                    }`
                  )
                }
                disabled={topic.wordCount === 0}
                className="rounded-2xl font-semibold text-sm px-5 py-2.5 transition-all bg-[#C8322B] hover:bg-[#9B2323] text-white shadow-sm"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Học theo Flashcard
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-2xl border border-stone-200/60 text-xs font-medium text-stone-500">
                <Layers className="w-3.5 h-3.5" />
                Đã tải {vocabs.length}
                {topic.wordCount ? ` / ${topic.wordCount}` : ''} từ
              </div>
            </div>
          </div>
        </div>

        {/* ── VOCABULARY LIST ── */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-stone-700 flex items-center gap-2 px-1">
            <BookOpen className="w-4 h-4 text-[#C8322B]" />
            Danh sách từ vựng
          </h2>

          {/* Loading initial */}
          {isLoadingVocabs && vocabs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200/80 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-7 h-7 animate-spin text-[#C8322B]" />
              <span className="text-sm font-medium">
                Đang nạp từ vựng của chủ đề...
              </span>
            </div>
          ) : vocabs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 text-stone-500 text-sm">
              Chưa có từ vựng nào trong chủ đề này.
            </div>
          ) : (
            <>
              {/* Vocab cards */}
              <div className="space-y-2.5">
                {vocabs.map((vocab, index) => (
                  <div
                    key={`${vocab.id}-${index}`}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 hover:border-[#C8322B]/30 hover:shadow-sm transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Number badge */}
                      <span className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>

                      {/* Word content */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <span
                            className="text-xl sm:text-2xl font-bold text-stone-900"
                            style={{
                              fontFamily: "'Noto Serif SC', serif",
                            }}
                          >
                            {vocab.hanzi.replace(/[0-9]+$/, '')}
                          </span>
                          {vocab.pinyin && (
                            <span className="text-sm font-semibold text-[#C8322B]">
                              {vocab.pinyin}
                            </span>
                          )}
                          {vocab.levelCode && (
                            <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-500 text-[10px] font-bold">
                              HSK {vocab.levelCode}
                            </span>
                          )}
                          {vocab.partOfSpeech && (
                            <span className="text-[11px] font-medium text-stone-400 italic">
                              ({vocab.partOfSpeech})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-700 leading-snug truncate">
                          {vocab.meaningVi || 'Chưa có nghĩa tiếng Việt'}
                        </p>
                        {vocab.exampleSentence && (
                          <div className="mt-1.5 rounded-xl bg-stone-50 px-3 py-2 text-xs leading-relaxed">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="text-sm text-stone-800"
                                style={{ fontFamily: "'Noto Serif SC', serif" }}
                              >
                                {vocab.exampleSentence}
                              </p>
                              <AudioButton
                                audioUrl={vocab.exampleAudioUrl}
                                text={vocab.exampleSentence}
                                size="sm"
                                title="Nghe câu ví dụ"
                                className="flex-shrink-0"
                              />
                            </div>
                            {vocab.examplePinyin && (
                              <p className="text-stone-500">{vocab.examplePinyin}</p>
                            )}
                            {vocab.exampleTranslation && (
                              <p className="italic text-stone-600">{vocab.exampleTranslation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Audio */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AudioButton
                        audioUrl={vocab.audioUrl}
                        text={vocab.hanzi}
                        size="md"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingVocabs}
                    className="rounded-2xl border-stone-300 hover:border-[#C8322B] hover:text-[#C8322B] px-8 py-3 text-sm font-semibold"
                  >
                    {isLoadingVocabs ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tải thêm...
                      </>
                    ) : (
                      'Tải thêm từ vựng'
                    )}
                  </Button>
                </div>
              )}

              {/* All loaded message */}
              {!hasMore && vocabs.length > 0 && (
                <div className="pt-2 text-center text-xs text-stone-400 font-medium">
                  ✓ Đã hiển thị tất cả {vocabs.length} từ vựng
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VocabularyTopicDetailPage

