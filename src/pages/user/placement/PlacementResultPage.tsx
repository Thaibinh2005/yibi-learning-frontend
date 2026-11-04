import { useCallback, useEffect, useState } from 'react'
import { GraduationCap, Info, Layers, RotateCcw, ShieldCheck, Zap } from 'lucide-react'
import { isAxiosError } from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { getPlacementResult } from '@/api/placementApi'
import { InlineBanner } from '@/components/placement/InlineBanner'
import { LevelLadder } from '@/components/placement/LevelLadder'
import { NextStepList, type NextStep } from '@/components/placement/NextStepList'
import { SkillBreakdown } from '@/components/placement/SkillBreakdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PLACEMENT_SKILLS, skillLabel } from '@/lib/placement'
import { cn } from '@/lib/utils'
import type { Confidence, PlacementResult } from '@/types/placement'

const CONFIDENCE: Record<Confidence, { text: string; style: string }> = {
  HIGH: { text: 'Độ tin cậy cao', style: 'bg-emerald-50 text-emerald-800' },
  MEDIUM: { text: 'Độ tin cậy trung bình', style: 'bg-amber-50 text-amber-800' },
  LOW: { text: 'Độ tin cậy thấp', style: 'bg-red-50 text-red-800' },
}

function summaryOf(result: PlacementResult) {
  if (result.confidence === 'LOW') {
    return `Mới có ${result.questionCount} câu và một số kỹ năng chưa đo được, nên kết quả còn rộng. Làm thêm luyện tập thích ứng để đo rõ hơn.`
  }
  const strong = result.strengths.map(skillLabel).join(', ')
  const weak = result.weaknesses.map(skillLabel).join(', ')
  const parts = [`Bạn đã làm ${result.questionCount} câu.`]
  if (strong) parts.push(`Bạn mạnh về ${strong}.`)
  if (weak) parts.push(`${weak} là phần nên củng cố trước khi học tiếp.`)
  return parts.join(' ')
}

export function PlacementResultPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<PlacementResult | null>(null)
  const [error, setError] = useState<'failed' | 'missing' | null>(null)

  const load = useCallback(() => {
    getPlacementResult(Number(attemptId))
      .then(setResult)
      .catch((e) => setError(isAxiosError(e) && e.response?.status === 404 ? 'missing' : 'failed'))
  }, [attemptId])
  useEffect(load, [load])

  if (error === 'missing') {
    return (
      <Card className="flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
        <h1 className="text-xl font-bold text-slate-800">Không tìm thấy kết quả này</h1>
        <p className="text-base text-slate-600">Kết quả không tồn tại hoặc không thuộc về tài khoản của bạn.</p>
        <Button className="rounded-xl" onClick={() => navigate('/placement')}>
          Về bài test xếp trình độ
        </Button>
      </Card>
    )
  }
  if (error === 'failed') {
    return (
      <InlineBanner variant="danger" title="Chưa tải được kết quả.">
        Kết quả vẫn được lưu. Thử lại sau ít giây.
        <div className="mt-2">
          <Button variant="outline" size="sm" className="max-sm:h-11" onClick={() => { setError(null); load() }}>
            Thử lại
          </Button>
        </div>
      </InlineBanner>
    )
  }
  if (!result) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Card className="space-y-4 rounded-2xl p-5 md:p-7">
          <Skeleton className="h-9 w-2/5" />
          <Skeleton className="h-16 w-full" />
        </Card>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-3.5 rounded-2xl p-5 md:p-7">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </Card>
          <Card className="space-y-3.5 rounded-2xl p-5 md:p-7">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-16 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  const confidence = CONFIDENCE[result.confidence]
  const weakSkill = result.weaknesses.map(skillLabel).join(', ')
  const steps: NextStep[] = [
    result.recommendedCourseId !== undefined
      ? {
          icon: <GraduationCap className="h-5 w-5" />,
          title: `Bắt đầu khóa học HSK ${result.recommendedLevel}`,
          description: `Lộ trình được đặt ở HSK ${result.level}, mục tiêu tiếp theo HSK ${Math.min(9, result.level + 1)}.`,
          to: `/courses?hskLevel=${Math.min(result.recommendedLevel, 6)}`,
        }
      : {
          icon: <GraduationCap className="h-5 w-5" />,
          title: `Khóa học HSK ${result.recommendedLevel}`,
          description: `Chưa có khóa học ở cấp này. Lộ trình vẫn được đặt ở HSK ${result.level}.`,
        },
    ...(result.reviewCardsAdded > 0
      ? [
          {
            icon: <Layers className="h-5 w-5" />,
            title: `Ôn ${result.reviewCardsAdded} từ bạn làm sai`,
            description: 'Đã thêm vào Flashcard, đến hạn ôn hôm nay.',
            to: '/flashcards',
          },
        ]
      : []),
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Luyện tập thích ứng',
      description: weakSkill
        ? `Tập trung vào ${weakSkill} và các kỹ năng chưa đủ dữ liệu.`
        : 'Tập trung vào các kỹ năng chưa đủ dữ liệu.',
      to: '/practice/adaptive',
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="space-y-2 rounded-2xl bg-gradient-to-b from-white to-rose-50/40 p-5 md:p-7">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex h-24 w-24 shrink-0 -rotate-3 items-center justify-center rounded-3xl bg-primary font-chinese text-5xl font-black text-primary-foreground shadow-xl">易</div>
          <div className="min-w-[260px] flex-1 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trình độ ước lượng của bạn</p>
            <div className="flex flex-wrap items-center gap-3.5">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 md:text-6xl">HSK {result.level}</h1>
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', confidence.style)}>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {confidence.text}
              </span>
            </div>
            <p className="text-base text-slate-600">{summaryOf(result)}</p>
          </div>
        </div>
        <LevelLadder theta={result.theta} standardError={result.standardError} />
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-4 rounded-2xl p-5 md:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-1.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Từng kỹ năng</h2>
            <span className="text-xs text-slate-500">Cần ít nhất 3 câu để chấm một kỹ năng</span>
          </div>
          <SkillBreakdown scores={result.skillScores} allSkills={PLACEMENT_SKILLS} />
          <InlineBanner variant="info" title="Kỹ năng &quot;chưa đủ&quot; không bị tính điểm.">
            Luyện tập thích ứng sẽ bổ sung dữ liệu cho các kỹ năng này.
          </InlineBanner>
        </Card>

        <div className="space-y-6">
          {result.skillScores.length > 0 && (
            <Card className="space-y-3.5 rounded-2xl p-5 md:p-7">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">Điểm mạnh và cần củng cố</h2>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Điểm mạnh</p>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.length > 0 ? (
                    result.strengths.map((skill) => (
                      <span key={skill} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        {skillLabel(skill)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Chưa có kỹ năng nào nổi bật hơn trình độ chung.</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nên củng cố trước</p>
                <div className="flex flex-wrap gap-2">
                  {result.weaknesses.length > 0 ? (
                    result.weaknesses.map((skill) => (
                      <span key={skill} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        {skillLabel(skill)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Chưa có kỹ năng nào yếu hơn trình độ chung.</span>
                  )}
                </div>
              </div>
              {result.missedWords.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Từ bạn làm sai</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missedWords.map((word) => (
                      <span key={word.word} className="inline-flex items-baseline gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                        <span className="font-chinese text-base font-bold text-slate-800">{word.word}</span>
                        {word.pinyin}
                      </span>
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                    Đã thêm vào Flashcard để ôn.
                  </p>
                </div>
              )}
            </Card>
          )}
          <Card className="space-y-3 rounded-2xl p-5 md:p-7">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Bước tiếp theo</h2>
            <NextStepList steps={steps} />
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs text-slate-500">Đây là ước lượng để xây lộ trình học, không thay thế bài thi HSK chính thức.</p>
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => navigate('/placement')}>
          <RotateCcw className="h-4 w-4" />
          Làm lại bài test
        </Button>
      </div>
    </div>
  )
}
