import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb, Mic, MicOff, Play, RotateCcw, Sprout, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { abandonPlacement, getPlacementStatus, saveSurvey } from '@/api/placementApi'
import { useAppDispatch } from '@/app/hooks'
import { setOnboardingCompleted } from '@/app/slices/authSlice'
import { InlineBanner } from '@/components/placement/InlineBanner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { speakChinese } from '@/lib/speech'
import type { PlacementStatus } from '@/types/placement'

const TIPS = [
  ['Làm theo khả năng, đừng đoán.', 'Không biết thì chọn đáp án bạn nghĩ gần nhất; kết quả vẫn đúng.'],
  ['Không quay lại câu trước.', 'Mỗi câu quyết định câu kế tiếp, nên bài chỉ đi tới.'],
  ['Dừng lúc nào cũng được.', 'Bài được lưu, bạn quay lại làm tiếp đúng câu đang dở.'],
  ['Đây không phải bài thi HSK chính thức.', 'Kết quả là ước lượng để xây lộ trình học cho bạn.'],
]

const FACTS = [
  ['Số câu', '15–30'],
  ['Thời gian', '10–15 phút'],
  ['Kỹ năng', '4 kỹ năng'],
  ['Phạm vi', 'HSK 1–9'],
]

export function PlacementIntroPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<PlacementStatus | null>(null)
  const [failed, setFailed] = useState(false)
  const [micChecked, setMicChecked] = useState<'ok' | 'denied' | null>(null)

  const load = useCallback(() => {
    getPlacementStatus().then(setStatus).catch(() => setFailed(true))
  }, [])
  useEffect(load, [load])

  const startFromBasics = async () => {
    await saveSurvey({ selfLevel: status?.selfReportedLevel ?? 0, startMode: 'BASIC' })
    dispatch(setOnboardingCompleted(true))
    navigate('/dashboard')
  }

  const restart = async () => {
    if (status?.inProgressAttemptId !== undefined) await abandonPlacement(status.inProgressAttemptId)
    navigate('/placement/test')
  }

  const checkMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setMicChecked('ok')
    } catch {
      setMicChecked('denied')
    }
  }

  if (failed) {
    return (
      <InlineBanner variant="danger" title="Chưa tải được trạng thái bài test.">
        Không có gì bị mất. Thử lại sau ít giây.
        <div className="mt-2">
          <Button variant="outline" size="sm" className="max-sm:h-11" onClick={() => { setFailed(false); load() }}>
            Thử lại
          </Button>
        </div>
      </InlineBanner>
    )
  }

  if (!status) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]" aria-busy="true">
        <Card className="space-y-4 rounded-2xl p-5 md:p-7">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full" />
        </Card>
        <Card className="space-y-4 rounded-2xl p-5 md:p-7">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    )
  }

  if (!status.poolReady) {
    return (
      <Card className="flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
        <div className="flex h-24 w-24 -rotate-3 items-center justify-center rounded-3xl bg-slate-100 font-chinese text-5xl font-black text-slate-400">易</div>
        <h1 className="text-xl font-bold text-slate-800">Bài test xếp trình độ chưa sẵn sàng</h1>
        <p className="max-w-lg text-base text-slate-600">
          Ngân hàng câu hỏi chưa đủ câu đã duyệt để đo chính xác. Bạn có thể bắt đầu từ HSK 1 ngay hoặc quay lại sau.
        </p>
        <div className="flex gap-2 pt-2">
          <Button className="gap-2 rounded-xl" onClick={startFromBasics}>
            <Sprout className="h-4 w-4" />
            Bắt đầu từ HSK 1
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/dashboard')}>
            Để sau
          </Button>
        </div>
      </Card>
    )
  }

  const resuming = status.inProgressAttemptId !== undefined
  return (
    <div className="space-y-6">
      {!status.speakingAvailable && (
        <InlineBanner variant="warn" mic title="Phần chấm phát âm tạm thời chưa dùng được.">
          Bài test vẫn làm được. Sẽ không có câu đọc to, và kỹ năng Phát âm hiện là "chưa đủ dữ liệu" trong kết quả.
        </InlineBanner>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-6 rounded-2xl bg-gradient-to-b from-white to-rose-50/40 p-5 md:p-7">
          <div className="flex items-start gap-5">
            <div className="flex h-[76px] w-[76px] shrink-0 -rotate-3 items-center justify-center rounded-3xl bg-primary font-chinese text-4xl font-black text-primary-foreground shadow-lg">易</div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {resuming ? 'Bài test đang làm dở' : 'Bài test xếp trình độ'}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                {resuming ? 'Tiếp tục bài test của bạn' : 'Tìm đúng điểm bắt đầu cho bạn'}
              </h1>
              <p className="text-base text-slate-600">
                {resuming
                  ? `${status.inProgressAnswered !== undefined ? `Bạn đã làm ${status.inProgressAnswered} câu. ` : ''}Bài được giữ nguyên ở câu đang làm, tiếp tục là xong sớm.`
                  : 'Trả lời vài câu nghe, nói, đọc, viết. Câu hỏi tự khó dần hoặc dễ dần theo cách bạn làm, để kết quả sát với trình độ thật.'}
              </p>
            </div>
          </div>

          {!resuming && (
            <>
              <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {FACTS.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-100 px-4 py-3.5">
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="text-xl font-bold tabular-nums text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-slate-800">Trước khi làm bài</h2>
                {TIPS.map(([title, body]) => (
                  <div key={title} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <p className="text-sm text-slate-600">
                      <b className="text-slate-800">{title}</b> {body}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" className="gap-2 rounded-xl" onClick={() => navigate('/placement/test')}>
              {resuming ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {resuming ? (
              <Button variant="outline" size="lg" className="gap-2 rounded-xl" onClick={restart}>
                <RotateCcw className="h-4 w-4" />
                Làm lại từ đầu
              </Button>
            ) : (
              <Button variant="ghost" size="lg" className="rounded-xl text-slate-500" onClick={startFromBasics}>
                Để sau, học từ HSK 1
              </Button>
            )}
          </div>
        </Card>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Chuẩn bị">
          <Card className="space-y-3.5 rounded-2xl p-5 md:p-7">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Chuẩn bị trước</h2>
            <div className="flex items-center gap-3.5 rounded-2xl bg-slate-100 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                <Volume2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block font-semibold text-slate-800">Loa hoặc tai nghe</b>
                <span className="text-xs text-slate-500">Câu nghe được đọc bằng giọng của trình duyệt.</span>
              </div>
              <Button variant="outline" size="sm" className="max-sm:h-11 gap-1.5 rounded-xl" onClick={() => speakChinese('你好，欢迎来到易比。', () => undefined, () => undefined)}>
                <Play className="h-4 w-4" />
                Nghe thử
              </Button>
            </div>
            {status.speakingAvailable ? (
              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-100 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                  <Mic className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block font-semibold text-slate-800">Micro</b>
                  <span className="text-xs text-slate-500">
                    {micChecked === 'ok'
                      ? 'Micro hoạt động tốt.'
                      : micChecked === 'denied'
                        ? 'Chưa được cho phép. Có thể bỏ qua các câu đọc to.'
                        : 'Cho câu đọc to. Có thể bỏ qua nếu không tiện.'}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="max-sm:h-11 rounded-xl" onClick={checkMic}>
                  Thử micro
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-100 px-4 py-3.5 opacity-60">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
                  <MicOff className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block font-semibold text-slate-800">Micro</b>
                  <span className="text-xs text-slate-500">Không cần lúc này vì phần đọc to đang tắt.</span>
                </div>
              </div>
            )}
          </Card>
          <Card className="space-y-2.5 rounded-2xl border-amber-100 bg-amber-50/60 p-5">
            <div className="flex items-center gap-2.5 text-amber-700">
              <Lightbulb className="h-5 w-5" />
              <b>Mẹo nhỏ</b>
            </div>
            <p className="text-sm text-amber-900">
              Tìm nơi yên tĩnh và dành khoảng 15 phút liền. Bạn có thể bấm phím <kbd className="rounded bg-white/70 px-1.5 text-xs font-semibold">1</kbd>–
              <kbd className="rounded bg-white/70 px-1.5 text-xs font-semibold">4</kbd> để chọn đáp án và{' '}
              <kbd className="rounded bg-white/70 px-1.5 text-xs font-semibold">Enter</kbd> để sang câu tiếp.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
