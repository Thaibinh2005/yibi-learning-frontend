import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { getTopicBySlug, getVocabulariesByTopic } from '@/api/topicApi'
import { LessonFrame } from '@/components/learningpath/LessonFrame'
import { CardSessionView } from '@/components/flashcard/CardSessionView'
import { useCardSession } from '@/components/flashcard/useCardSession'
import type { VocabTopic } from '@/types/topic'
import type { Vocabulary } from '@/types/vocabulary'

const PAGE_SIZE = 100
const MAX_PAGES = 20

interface SessionProps {
  words: Vocabulary[]
  topic: VocabTopic | null
  hskFilter?: string
  backTo: string
}

/** Mounted once the words are loaded, so the session starts from the full list. */
const TopicSession: React.FC<SessionProps> = ({ words, topic, hskFilter, backTo }) => {
  const session = useCardSession(words)
  const { total, learned, remaining } = session

  return (
    // A page of its own without the menus (see UserLayout FOCUS_PAGES): only the cards, a way out and the progress.
    <LessonFrame
      label={`${topic?.titleVi || 'Chủ đề'}${hskFilter ? ` · ${hskFilter}` : ''}`.trim()}
      progress={total > 0 ? learned / total : undefined}
      counter={total > 0 ? `Còn ${remaining}/${total}` : undefined}
      exitTo={backTo}
    >
      <CardSessionView
        session={session}
        doneTitle="Hoàn thành chủ đề!"
        doneText={`Bạn đã học ${total} từ. Kết quả đã được lưu vào bộ Flashcard để ôn đúng lịch.`}
        doneActions={
          <Link
            to="/flashcards"
            className="btn-chunky btn-brand"
          >
            <Sparkles className="h-4 w-4" />
            Mở bộ Flashcard
          </Link>
        }
        empty={
          <>
            Chủ đề này chưa có từ vựng{hskFilter ? ` ở cấp ${hskFilter}` : ''}.
            <div>
              <Link to={backTo} className="mt-4 inline-block font-semibold text-brand">
                Về chủ đề
              </Link>
            </div>
          </>
        }
      />
    </LessonFrame>
  )
}

export const TopicFlashcardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const hskFilter = searchParams.get('hsk') || undefined
  const backTo = `/vocabulary/topic/${slug}${hskFilter ? `?hsk=${encodeURIComponent(hskFilter)}` : ''}`

  const [topic, setTopic] = useState<VocabTopic | null>(null)
  const [words, setWords] = useState<Vocabulary[] | null>(null)
  const [error, setError] = useState('')

  /* Load topic + every word of the topic (paged). */
  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const load = async () => {
      setWords(null)
      setError('')
      try {
        const topicRes = await getTopicBySlug(slug, hskFilter)
        if (!cancelled && topicRes.success) setTopic(topicRes.data)

        const all: Vocabulary[] = []
        for (let page = 0; page < MAX_PAGES; page++) {
          const res = await getVocabulariesByTopic(slug, page, PAGE_SIZE, hskFilter)
          if (!res.success || !Array.isArray(res.data)) break
          all.push(...res.data)
          if (res.data.length < PAGE_SIZE) break
        }
        if (!cancelled) setWords(all)
      } catch {
        if (!cancelled) setError('Không tải được từ vựng của chủ đề. Hãy thử tải lại trang.')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, hskFilter])

  if (words) return <TopicSession key={`${slug}|${hskFilter ?? ''}`} words={words} topic={topic} hskFilter={hskFilter} backTo={backTo} />

  return (
    <LessonFrame
      label={`${topic?.titleVi || 'Chủ đề'}${hskFilter ? ` · ${hskFilter}` : ''}`.trim()}
      exitTo={backTo}
    >
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-stone-200 bg-white p-16 text-sm text-stone-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải flashcard...
        </div>
      )}
    </LessonFrame>
  )
}

export default TopicFlashcardPage
