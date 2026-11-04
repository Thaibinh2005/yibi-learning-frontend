import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2, PartyPopper, Route, RotateCcw } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPlacementResult, getPlacementStatus } from '@/api/placementApi'
import { InlineBanner } from '@/components/placement/InlineBanner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FinishState {
  attemptId?: number
  answered?: number
}

/** The result is already stored when the last answer returns; this screen confirms it can be read, then offers it. */
export function PlacementFinishPage() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: FinishState | null }
  const [attemptId, setAttemptId] = useState<number | undefined>(state?.attemptId)
  const [answered, setAnswered] = useState<number | undefined>(state?.answered)
  const [phase, setPhase] = useState<'computing' | 'done' | 'error'>('computing')

  const load = useCallback(async () => {
    try {
      const id = attemptId ?? (await getPlacementStatus()).latestAttemptId
      if (id === undefined) {
        navigate('/placement', { replace: true })
        return
      }
      const [result] = await Promise.all([getPlacementResult(id), new Promise((resolve) => setTimeout(resolve, 1400))])
      setAttemptId(id)
      setAnswered(result.questionCount)
      setPhase('done')
    } catch {
      setPhase('error')
    }
  }, [attemptId, navigate])
  useEffect(() => {
    void load()
  }, [load])

  const stamp = (
    <div
      className={cn(
        'flex h-24 w-24 -rotate-3 items-center justify-center rounded-3xl bg-primary font-chinese text-5xl font-black text-primary-foreground shadow-xl',
        phase === 'computing' && 'animate-bounce motion-reduce:animate-none',
      )}
    >
      易
    </div>
  )

  return (
    <Card className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-b from-white to-rose-50/40 px-6 py-16 text-center">
      {phase === 'done' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
          {[8, 16, 25, 34, 44, 54, 63, 72, 81, 90].map((left, index) => (
            <i
              key={left}
              style={{ left: `${left}%`, animationDelay: `${(index % 5) * 0.25}s` }}
              className={cn(
                'absolute -top-3 h-3.5 w-2 animate-bounce rounded-sm not-italic',
                ['bg-primary', 'bg-amber-500', 'bg-emerald-600', 'bg-blue-600'][index % 4],
              )}
            />
          ))}
        </div>
      )}

      {phase === 'error' ? (
        <div className="flex flex-col items-center gap-3" role="alert">
          <InlineBanner variant="danger" title="Chưa tính được kết quả." className="text-left">
            Các câu trả lời đã được lưu, không bị mất. Thử lại để xem kết quả.
          </InlineBanner>
          <Button className="gap-2 rounded-xl" onClick={() => { setPhase('computing'); void load() }}>
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : phase === 'computing' ? (
        <div className="flex flex-col items-center gap-2" aria-live="polite" aria-busy="true">
          {stamp}
          <h1 className="pt-3 text-3xl font-bold tracking-tight text-slate-800">Đang tính trình độ của bạn...</h1>
          <p className="text-base text-slate-600">{answered ? `Tổng hợp ${answered} câu trả lời. ` : ''}Thường mất vài giây.</p>
          <ul className="mt-3 space-y-2.5 text-left text-sm">
            <li className="flex items-center gap-2.5 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" /> Tổng hợp câu trả lời
            </li>
            <li className="flex items-center gap-2.5 font-semibold text-primary">
              <Loader2 className="h-5 w-5 animate-spin" /> Ước lượng trình độ HSK
            </li>
            <li className="flex items-center gap-2.5 text-slate-500">
              <Route className="h-5 w-5" /> Chuẩn bị lộ trình cá nhân
            </li>
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {stamp}
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <PartyPopper className="h-3.5 w-3.5" />
            Hoàn thành {answered} câu
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Đã xong! Kết quả của bạn đã sẵn sàng.</h1>
          <p className="max-w-md text-base text-slate-600">Trình độ, điểm từng kỹ năng và lộ trình học gợi ý đã được cập nhật.</p>
          <Button size="lg" className="mt-3 gap-2 rounded-xl" onClick={() => navigate(`/placement/result/${attemptId}`)}>
            Xem kết quả
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}
