import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Clock, History, Lightbulb, X } from 'lucide-react'
import { isAxiosError } from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPlacementReview } from '@/api/placementApi'
import { InlineBanner } from '@/components/placement/InlineBanner'
import { ListenPlayer } from '@/components/placement/ListenPlayer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PLACEMENT_SKILLS } from '@/lib/placement'
import { cn } from '@/lib/utils'
import type { PlacementReview, ReviewItem } from '@/types/placement'

type Filter = 'all' | 'wrong' | string

const levelText = (level: number) => (level >= 7 ? 'HSK 7–9' : `HSK ${level}`)
const hasChinese = (text: string) => /[一-鿿]/.test(text)

/** One question as it was asked, with what the learner chose, the right answer and why. */
function ReviewCard({ item }: { item: ReviewItem }) {
  const speaking = item.type === 'READ_ALOUD'
  const lines = (item.prompt ?? '').split('\n').map((line) => line.trim()).filter(Boolean)
  const skipped = !speaking && item.choices.length > 0 && !item.selectedChoiceKey

  return (
    <Card className={cn('space-y-4 rounded-2xl border-l-4 p-5 md:p-6', item.correct ? 'border-l-emerald-400' : 'border-l-red-400')}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 tabular-nums text-slate-700">Câu {item.order}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{speaking ? 'Đọc to' : item.skillLabel}</span>
        {item.levelCode && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">HSK {item.levelCode.replace('-', '–')}</span>}
        <span className="flex items-center gap-1 text-slate-400"><Clock className="h-3.5 w-3.5" />{item.responseTimeSeconds}s</span>
        <span className={cn('ml-auto flex items-center gap-1 rounded-full px-2.5 py-1', item.correct ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
          {item.correct ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {speaking ? (item.correct ? 'Đạt' : 'Chưa đạt') : item.correct ? 'Đúng' : 'Sai'}
        </span>
      </div>

      {!item.prompt ? (
        <p className="text-sm italic text-slate-500">Câu hỏi này đã bị gỡ khỏi ngân hàng đề nên không còn nội dung để xem lại.</p>
      ) : (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <p
              key={i}
              className={cn(
                i === 0 ? 'text-lg font-semibold text-slate-800' : 'text-slate-700',
                i > 0 && hasChinese(line) && 'font-chinese text-xl leading-9 tracking-wide',
              )}
            >
              {line}
            </p>
          ))}
          {item.promptPinyin && <p className="text-sm font-medium text-slate-500">{item.promptPinyin}</p>}
          {item.audioUrl && <ListenPlayer audioUrl={item.audioUrl} />}
        </div>
      )}

      {item.choices.length > 0 && (
        <ul className="grid gap-2" aria-label="Các đáp án">
          {item.choices.map((choice) => {
            const picked = choice.key === item.selectedChoiceKey
            return (
              <li
                key={choice.key}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-3.5 py-2.5',
                  choice.correct ? 'border-emerald-300 bg-emerald-50' : picked ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white',
                )}
              >
                <span className="mt-0.5 w-5 shrink-0 text-sm font-bold text-slate-500">{choice.key}</span>
                <span className={cn('flex-1 text-slate-800', hasChinese(choice.text) && 'font-chinese text-lg')}>{choice.text}</span>
                <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs font-semibold">
                  {choice.correct && <span className="flex items-center gap-1 text-emerald-700"><Check className="h-3.5 w-3.5" />Đáp án đúng</span>}
                  {picked && <span className={choice.correct ? 'text-emerald-700' : 'flex items-center gap-1 text-red-700'}>{!choice.correct && <X className="h-3.5 w-3.5" />}Bạn chọn</span>}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {skipped && <p className="text-sm text-slate-500">Bạn chưa chọn đáp án cho câu này.</p>}

      {speaking && item.answerText && (
        <div className="rounded-xl bg-amber-50/60 px-4 py-3 ring-1 ring-amber-100">
          <p className="text-xs font-semibold text-slate-500">Câu cần đọc</p>
          <p className="font-chinese text-xl tracking-wide text-slate-800">{item.answerText}</p>
        </div>
      )}

      {item.explanation && (
        <div className="flex gap-2.5 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="whitespace-pre-line">{item.explanation}</p>
        </div>
      )}
    </Card>
  )
}

/** Question-by-question review of a finished placement test. */
export function PlacementReviewPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState<PlacementReview | null>(null)
  const [error, setError] = useState<'failed' | 'missing' | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const load = useCallback(() => {
    getPlacementReview(Number(attemptId))
      .then(setReview)
      .catch((e) => setError(isAxiosError(e) && e.response?.status === 404 ? 'missing' : 'failed'))
  }, [attemptId])
  useEffect(load, [load])

  const skills = useMemo(() => {
    if (!review) return []
    const present = new Set(review.items.map((item) => item.skill))
    return PLACEMENT_SKILLS.filter((s) => present.has(s.skill))
  }, [review])

  const shown = useMemo(() => {
    if (!review) return []
    if (filter === 'all') return review.items
    if (filter === 'wrong') return review.items.filter((item) => !item.correct)
    return review.items.filter((item) => item.skill === filter)
  }, [review, filter])

  if (error === 'missing') {
    return (
      <Card className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
        <h1 className="text-xl font-bold text-slate-800">Không tìm thấy bài làm này</h1>
        <p className="text-base text-slate-600">Bài test chưa hoàn thành, không tồn tại hoặc không thuộc về tài khoản của bạn.</p>
        <Button className="rounded-xl" onClick={() => navigate('/placement/history')}>Về lịch sử đánh giá</Button>
      </Card>
    )
  }
  if (error === 'failed') {
    return (
      <div className="mx-auto max-w-3xl">
        <InlineBanner variant="danger" title="Chưa tải được bài làm.">
          Thử lại sau ít giây.
          <div className="mt-2">
            <Button variant="outline" size="sm" className="max-sm:h-11" onClick={() => { setError(null); load() }}>Thử lại</Button>
          </div>
        </InlineBanner>
      </div>
    )
  }
  if (!review) {
    return (
      <div className="mx-auto max-w-3xl space-y-3" aria-busy="true">
        <Skeleton className="h-24 rounded-2xl" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    )
  }

  const correct = review.items.filter((item) => item.correct).length
  const wrong = review.items.length - correct
  const chips: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'Tất cả', count: review.items.length },
    { value: 'wrong', label: 'Câu sai', count: wrong },
    ...skills.map((s) => ({ value: s.skill, label: s.label, count: review.items.filter((item) => item.skill === s.skill).length })),
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link to={`/placement/result/${review.attemptId}`} className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />Về kết quả
        </Link>
        <span className="text-slate-300">·</span>
        <Link to="/placement/history" className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800">
          <History className="h-4 w-4" />Lịch sử đánh giá
        </Link>
      </div>

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl p-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Xem lại bài làm</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {new Date(review.finishedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {' · '}Kết quả {levelText(review.level)}
          </p>
        </div>
        <dl className="ml-auto flex gap-5 text-center">
          <div><dd className="text-2xl font-extrabold tabular-nums text-emerald-600">{correct}</dd><dt className="text-xs font-medium text-slate-500">Đúng</dt></div>
          <div><dd className="text-2xl font-extrabold tabular-nums text-red-600">{wrong}</dd><dt className="text-xs font-medium text-slate-500">Sai</dt></div>
          <div><dd className="text-2xl font-extrabold tabular-nums text-slate-800">{review.items.length}</dd><dt className="text-xs font-medium text-slate-500">Tổng</dt></div>
        </dl>
      </Card>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc câu hỏi">
        {chips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            aria-pressed={filter === chip.value}
            onClick={() => setFilter(chip.value)}
            className={cn(
              'h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors',
              filter === chip.value ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            )}
          >
            {chip.label} <span className="tabular-nums opacity-70">{chip.count}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Card className="rounded-2xl px-6 py-10 text-center text-sm text-slate-500">
          {filter === 'wrong' ? 'Bạn không sai câu nào. Rất tốt!' : 'Không có câu nào ở mục này.'}
        </Card>
      ) : (
        <ol className="space-y-4">
          {shown.map((item) => <li key={item.order}><ReviewCard item={item} /></li>)}
        </ol>
      )}
    </div>
  )
}
