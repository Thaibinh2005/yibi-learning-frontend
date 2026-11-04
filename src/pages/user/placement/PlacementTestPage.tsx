import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Loader2, LogOut, Sparkles } from 'lucide-react'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { answerPlacement, answerPlacementSpeaking, skipPlacementQuestion, startPlacement } from '@/api/placementApi'
import { useAppDispatch } from '@/app/hooks'
import { setOnboardingCompleted } from '@/app/slices/authSlice'
import { ExitDialog } from '@/components/placement/ExitDialog'
import { InlineBanner } from '@/components/placement/InlineBanner'
import { QuestionRenderer } from '@/components/placement/QuestionRenderer'
import { SkillJourney } from '@/components/placement/SkillJourney'
import { TestProgress } from '@/components/placement/TestProgress'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { skillLabel } from '@/lib/placement'
import type { PlacementStep } from '@/types/placement'

/** What went wrong in words the learner can act on: no connection, the server's own message, or a retry hint. */
function reasonOf(error: unknown): string {
  if (!isAxiosError(error)) return 'Có lỗi bất ngờ.'
  if (!error.response) return 'Không kết nối được máy chủ. Kiểm tra mạng rồi gửi lại.'
  const message = (error.response.data as { message?: string } | undefined)?.message
  if (error.response.status < 500 && message) return message
  return 'Máy chủ chưa xử lý được đáp án này. Thử gửi lại sau ít giây.'
}

export function PlacementTestPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<PlacementStep | null>(null)
  const [selection, setSelection] = useState<{ questionId: number; key: string } | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [failedQuestionId, setFailedQuestionId] = useState<number | null>(null)
  const [failureReason, setFailureReason] = useState<string | null>(null)
  const [exitOpen, setExitOpen] = useState(false)
  const shownAt = useRef(Date.now())

  const question = step?.question
  const questionId = question?.id
  const selected = selection && selection.questionId === questionId ? selection.key : null
  const submitFailed = failedQuestionId !== null && failedQuestionId === questionId
  const setSelected = (key: string) => questionId !== undefined && setSelection({ questionId, key })
  const setSubmitFailed = (failed: boolean) => setFailedQuestionId(failed ? (questionId ?? null) : null)

  const load = useCallback(() => {
    startPlacement()
      .then(setStep)
      .catch((error) => {
        // 400 means the bank cannot run a test (yet): the introduction explains it.
        if (isAxiosError(error) && error.response?.status === 400) navigate('/placement', { replace: true })
        else setLoadFailed(true)
      })
  }, [navigate])
  useEffect(load, [load])

  useEffect(() => {
    shownAt.current = Date.now()
  }, [questionId])

  const seconds = () => Math.round((Date.now() - shownAt.current) / 1000)

  const advance = useCallback(
    (next: PlacementStep) => {
      if (next.finished) {
        dispatch(setOnboardingCompleted(true))
        navigate('/placement/finish', { replace: true, state: { attemptId: next.attemptId, answered: next.answered } })
      } else {
        setStep(next)
      }
    },
    [dispatch, navigate],
  )

  const submit = useCallback(async () => {
    if (!step || !question || selected === null || submitting) return
    setSubmitting(true)
    setFailedQuestionId(null)
    try {
      advance(await answerPlacement(step.attemptId, { questionId: question.id, choiceKey: selected, responseTimeSeconds: seconds() }))
    } catch (error) {
      setFailureReason(reasonOf(error))
      setFailedQuestionId(question.id)
    } finally {
      setSubmitting(false)
    }
  }, [step, question, selected, submitting, advance])

  const submitSpeaking = async (audio: Blob) => {
    if (!step || !question) return
    advance(await answerPlacementSpeaking(step.attemptId, question.id, audio, seconds()))
  }

  const skip = async () => {
    if (!step || !question) return
    try {
      advance(await skipPlacementQuestion(step.attemptId, question.id))
    } catch (error) {
      setFailureReason(reasonOf(error))
      setSubmitFailed(true)
    }
  }

  // 1-4 pick an option, Enter continues; neither fires while the exit dialog is open or a control has focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (exitOpen || !question || question.type === 'READ_ALOUD') return
      const target = event.target as HTMLElement
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < question.choices.length) setSelected(question.choices[index].key)
      if (event.key === 'Enter' && selected !== null && target.tagName !== 'BUTTON') void submit()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exitOpen, question, selected, submit])

  if (loadFailed) {
    return (
      <InlineBanner variant="danger" title="Chưa tải được bài test.">
        Không có gì bị mất. Kiểm tra kết nối rồi thử lại.
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" className="max-sm:h-11" onClick={() => { setLoadFailed(false); load() }}>
            Thử lại
          </Button>
          <Button variant="ghost" size="sm" className="max-sm:h-11" onClick={() => navigate('/placement')}>
            Về trang giới thiệu
          </Button>
        </div>
      </InlineBanner>
    )
  }

  const speaking = question?.type === 'READ_ALOUD'
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
      <Card className="flex min-h-[520px] flex-col gap-5 rounded-2xl p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-primary">Câu {question?.order ?? '…'}</span>
            {question && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {speaking ? 'Đọc to' : skillLabel(question.skill)}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="max-sm:h-11 gap-1.5 text-slate-500" onClick={() => setExitOpen(true)}>
            <LogOut className="h-4 w-4" />
            Thoát
          </Button>
        </div>

        {step && <TestProgress answered={step.answered} minimum={step.minimumQuestions} maximum={step.maximumQuestions} />}

        {submitFailed && (
          <InlineBanner variant="danger" title="Chưa gửi được đáp án.">
            {failureReason ?? 'Kiểm tra kết nối rồi gửi lại.'} Câu trả lời của bạn vẫn được giữ trên màn hình.
            <div className="mt-2">
              <Button size="sm" className="max-sm:h-11" onClick={speaking ? skip : submit}>
                Gửi lại
              </Button>
            </div>
          </InlineBanner>
        )}

        {!question ? (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-8 w-3/5" />
            <Skeleton className="h-14 w-1/3" />
            <div className="grid gap-3 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[60px]" />
              ))}
            </div>
          </div>
        ) : (
          <div key={question.id} className="animate-fade-in flex-1" aria-live="polite">
            <span className="sr-only">Câu {question.order}</span>
            <QuestionRenderer
              question={question}
              selectedKey={selected}
              onSelect={setSelected}
              onSpeakingSubmit={submitSpeaking}
              onSkip={skip}
            />
          </div>
        )}

        {question && !speaking && (
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold">1</kbd>–<kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold">4</kbd> chọn
              đáp án · <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold">Enter</kbd> tiếp tục
            </span>
            <div className="flex flex-col gap-1 sm:items-end">
              <Button size="lg" className="gap-2 rounded-xl" disabled={selected === null || submitting} onClick={submit} aria-busy={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Tiếp tục
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>
              {selected === null && <span className="text-xs text-slate-500">Chọn một đáp án để tiếp tục.</span>}
            </div>
          </div>
        )}
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Hành trình">
        <Card className="space-y-1.5 rounded-2xl p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hành trình của bạn</p>
          {step ? (
            <SkillJourney skills={step.skillProgress} current={question?.skill ?? ''} />
          ) : (
            <div className="space-y-3 pt-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          )}
        </Card>
        {step && step.answered > 0 && (
          <Card className="space-y-2 rounded-2xl border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-emerald-800">
              <Sparkles className="h-5 w-5" />
              <b>Làm tốt lắm!</b>
            </div>
            <p className="text-sm text-emerald-900">Đã xong {step.answered} câu. Bài được lưu tự động, dừng lúc nào cũng được.</p>
          </Card>
        )}
      </aside>

      <ExitDialog open={exitOpen} questionNumber={question?.order ?? 1} onStay={() => setExitOpen(false)} onLeave={() => navigate('/placement')} />
    </div>
  )
}
