import { useState } from 'react'
import { ArrowRight, Compass, Loader2, Sprout } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { saveSurvey } from '@/api/placementApi'
import { useAppDispatch } from '@/app/hooks'
import { setOnboardingCompleted } from '@/app/slices/authSlice'
import { InlineBanner } from '@/components/placement/InlineBanner'
import { LevelPickCard } from '@/components/placement/LevelPickCard'
import { StartModeCard } from '@/components/placement/StartModeCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SURVEY_LEVELS } from '@/lib/placement'
import type { StartMode } from '@/types/placement'

export function OnboardingSurveyPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [level, setLevel] = useState<number | null>(null)
  const [chosenMode, setChosenMode] = useState<StartMode | null>(null)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  // "Chưa biết gì" starts from the basics; any other level is worth measuring.
  const recommended: StartMode | null = level === null ? null : level === 0 ? 'BASIC' : 'PLACEMENT'
  const mode = chosenMode ?? recommended

  const submit = async () => {
    if (level === null || mode === null) return
    setSaving(true)
    setFailed(false)
    try {
      await saveSurvey({ selfLevel: level, startMode: mode })
      if (mode === 'BASIC') {
        dispatch(setOnboardingCompleted(true))
        navigate('/dashboard')
      } else {
        navigate('/placement')
      }
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bước 1 / 2 · Khoảng 1 phút</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Bạn đang ở đâu trên hành trình học tiếng Trung?</h1>
        <p className="text-base text-slate-600">
          Chọn mô tả gần nhất với bạn. Có thể đổi lại bất cứ lúc nào trong Lộ trình cá nhân.
        </p>
      </div>

      {failed && (
        <InlineBanner variant="danger" title="Chưa lưu được lựa chọn của bạn.">
          Kiểm tra kết nối rồi thử lại. Lựa chọn vẫn được giữ trên màn hình này.
        </InlineBanner>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section aria-label="Trình độ" className="grid gap-3 md:grid-cols-2">
          {SURVEY_LEVELS.map((item) => (
            <LevelPickCard
              key={item.value}
              tag={item.tag}
              sub={item.sub}
              title={item.title}
              description={item.description}
              selected={level === item.value}
              onSelect={() => setLevel(item.value)}
            />
          ))}
        </section>

        <Card className="space-y-3.5 rounded-2xl bg-gradient-to-b from-white to-rose-50/40 p-5 md:p-7 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bước 2 / 2</p>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Bạn muốn bắt đầu thế nào?</h2>
          <StartModeCard
            icon={<Sprout className="h-5 w-5" />}
            title="Bắt đầu từ cơ bản"
            description="Học từ HSK 1 ngay, không cần làm bài test. Phù hợp nếu bạn mới bắt đầu."
            selected={mode === 'BASIC'}
            recommended={recommended === 'BASIC'}
            onSelect={() => setChosenMode('BASIC')}
          />
          <StartModeCard
            icon={<Compass className="h-5 w-5" />}
            title="Xác định trình độ hiện tại"
            description="Bài test thích ứng 15–30 câu, khoảng 10–15 phút: nghe, nói, đọc, viết. Câu hỏi tự khó dần hoặc dễ dần theo cách bạn trả lời."
            selected={mode === 'PLACEMENT'}
            recommended={recommended === 'PLACEMENT'}
            onSelect={() => setChosenMode('PLACEMENT')}
          />
          <div className="space-y-2 pt-1">
            <Button
              size="lg"
              className="w-full gap-2 rounded-xl"
              disabled={level === null || mode === null || saving}
              onClick={submit}
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  Tiếp tục
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            {level === null && <p className="text-xs text-slate-500">Chọn một trình độ để tiếp tục.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
