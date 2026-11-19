import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, ClipboardList, Clock, History, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getPlacementHistory } from '@/api/placementApi'
import { InlineBanner } from '@/components/placement/InlineBanner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Confidence, PlacementHistoryItem } from '@/types/placement'

const CONFIDENCE: Record<Confidence, { text: string; style: string }> = {
  HIGH: { text: 'Tin cậy cao', style: 'bg-emerald-50 text-emerald-800' },
  MEDIUM: { text: 'Tin cậy trung bình', style: 'bg-amber-50 text-amber-800' },
  LOW: { text: 'Tin cậy thấp', style: 'bg-red-50 text-red-800' },
}

const levelText = (level: number) => (level >= 7 ? 'HSK 7–9' : `HSK ${level}`)

const formatDate = (value: string) =>
  new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds} giây`
  const minutes = Math.round(seconds / 60)
  return `${minutes} phút`
}

/** Every finished placement test, newest first, each opening its result and its question-by-question review. */
export function PlacementHistoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<PlacementHistoryItem[] | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(() => {
    getPlacementHistory().then(setItems).catch(() => setFailed(true))
  }, [])
  useEffect(load, [load])

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-800">
            <History className="h-6 w-6 text-primary" />
            Lịch sử đánh giá trình độ
          </h1>
          <p className="mt-1 text-sm text-slate-500">Xem lại kết quả và từng câu của các lần bạn đã làm bài test.</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => navigate('/placement')}>
          <RotateCcw className="h-4 w-4" />
          Làm bài test mới
        </Button>
      </div>

      {failed && (
        <InlineBanner variant="danger" title="Chưa tải được lịch sử.">
          Thử lại sau ít giây.
          <div className="mt-2">
            <Button variant="outline" size="sm" className="max-sm:h-11" onClick={() => { setFailed(false); load() }}>Thử lại</Button>
          </div>
        </InlineBanner>
      )}

      {!items && !failed && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      )}

      {items && items.length === 0 && (
        <Card className="flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
          <ClipboardList className="h-10 w-10 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-800">Bạn chưa hoàn thành bài test nào</h2>
          <p className="max-w-sm text-sm text-slate-500">Làm bài test khoảng 10–15 phút để biết trình độ và có lộ trình học đúng cấp.</p>
          <Button className="mt-1 gap-2 rounded-xl" onClick={() => navigate('/placement')}>
            Làm bài test
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {items && items.length > 0 && (
        <ol className="space-y-3">
          {items.map((item, index) => {
            const percent = item.questionCount > 0 ? Math.round((item.correctCount / item.questionCount) * 100) : 0
            return (
              <li key={item.attemptId}>
                <Card className="flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
                  <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-rose-50 px-4 py-3 sm:w-28">
                    <span className="text-2xl font-extrabold tracking-tight text-primary">{levelText(item.level)}</span>
                    {index === 0 && <span className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-primary/70">Mới nhất</span>}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">{formatDate(item.finishedAt)}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', CONFIDENCE[item.confidence].style)}>
                        {CONFIDENCE[item.confidence].text}
                      </span>
                    </div>
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="tabular-nums">Đúng {item.correctCount}/{item.questionCount} câu ({percent}%)</span>
                      <span className="flex items-center gap-1 tabular-nums"><Clock className="h-3.5 w-3.5" />{formatDuration(item.durationSeconds)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link to={`/placement/result/${item.attemptId}`} className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Kết quả
                    </Link>
                    <Link to={`/placement/result/${item.attemptId}/review`} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-white hover:opacity-90">
                      Xem lại bài làm
                    </Link>
                  </div>
                </Card>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
