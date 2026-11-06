import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Ear,
  Flame,
  Layers,
  Loader2,
  Mic,
  Newspaper,
  PenLine,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTodayPlan, type DailyPlan } from '@/api/learningPathApi'
import {
  startAdaptiveSession,
  submitPracticeAnswer,
  submitPracticeSpeaking,
  type AdaptiveQuestion,
  type AdaptiveSessionResponse,
  type PracticeAnswerResult,
} from '@/api/practiceApi'
import { VoiceRecorder } from '@/components/placement/VoiceRecorder'
import { parseSentenceTiles, SentenceTiles, sentenceMatches } from '@/components/practice/SentenceTiles'
import { playFeedbackSound } from '@/lib/feedbackSound'
import { AudioButton } from '@/components/ui/AudioButton'

const skillMeta: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  vocabulary: { label: 'Từ vựng', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  phonetics: { label: 'Ngữ âm', icon: Volume2, color: 'text-blue-600', bg: 'bg-blue-50' },
  characters: { label: 'Chữ Hán', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  grammar: { label: 'Ngữ pháp', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  listening: { label: 'Nghe hiểu', icon: Ear, color: 'text-sky-600', bg: 'bg-sky-50' },
  reading: { label: 'Đọc hiểu', icon: Newspaper, color: 'text-teal-600', bg: 'bg-teal-50' },
  writing: { label: 'Viết câu', icon: PenLine, color: 'text-rose-600', bg: 'bg-rose-50' },
  speaking: { label: 'Phát âm', icon: Mic, color: 'text-orange-600', bg: 'bg-orange-50' },
}

const reasonMeta: Record<string, { label: string; desc: string; badgeClass: string; icon: React.ElementType }> = {
  DUE_REVIEW: {
    label: 'Ôn tập định kỳ (SRS)',
    desc: 'Đến hạn ôn tập theo Spaced Repetition',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock,
  },
  WEAK_SKILL: {
    label: 'Cần cải thiện',
    desc: 'Độ thành thạo dưới 70%',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: AlertCircle,
  },
  NEW_CONTENT: {
    label: 'Kiến thức mới',
    desc: 'Nội dung tiếp cận lần đầu',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Sparkles,
  },
}

/** A question on screen; a retry repeats a missed question at the end, graded here and not counted again. */
type QueueItem = AdaptiveQuestion & { retry?: boolean; correctAnswer?: string; explanation?: string }

/** One adaptive practice run: starts by itself, then shows the questions and a summary with the updated plan. */
export const PracticeSession: React.FC<{
  level: string
  limit: number
  onExit: () => void
}> = ({ level, limit, onExit }) => {
  const [mode, setMode] = useState<'LOADING' | 'QUIZ' | 'SUMMARY'>('LOADING')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [updatedPlan, setUpdatedPlan] = useState<DailyPlan | null>(null)
  const [activeSession, setActiveSession] = useState<AdaptiveSessionResponse | null>(null)
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [userSelectedChoice, setUserSelectedChoice] = useState<string | null>(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [answerResult, setAnswerResult] = useState<PracticeAnswerResult | null>(null)
  const [sessionStreak, setSessionStreak] = useState<number>(0)
  const [bestStreak, setBestStreak] = useState<number>(0)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [retries, setRetries] = useState<QueueItem[]>([])
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0)
  const [sessionAttempts, setSessionAttempts] = useState<Array<{
    question: AdaptiveQuestion
    userAnswer: string
    isCorrect: boolean
    correctAnswer: string
    explanation: string
  }>>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  const startSession = useCallback(async () => {
    setMode('LOADING')
    setErrorMsg(null)
    setUpdatedPlan(null)
    try {
      const session = await startAdaptiveSession(level, limit)
      if (!session.questions || session.questions.length === 0) {
        setErrorMsg(`Chưa có câu hỏi đã phát hành cho HSK ${level}. Vui lòng chọn cấp độ khác.`)
        return
      }
      setActiveSession(session)
      setCurrentIdx(0)
      setUserSelectedChoice(null)
      setAnswerResult(null)
      setSessionStreak(0)
      setBestStreak(0)
      setSessionCorrectCount(0)
      setSessionAttempts([])
      setQueue(session.questions)
      setRetries([])
      setQuestionStartTime(Date.now())
      setMode('QUIZ')
    } catch (err: any) {
      console.error('Failed to start adaptive session', err)
      setErrorMsg(err.response?.data?.message || 'Không thể khởi tạo phiên luyện tập thích ứng.')
    }
  }, [level, limit])

  // StrictMode runs effects twice in development; one visit must create one session.
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    startSession()
  }, [startSession])

  const applyResult = (question: QueueItem, answer: string, res: PracticeAnswerResult) => {
    playFeedbackSound(res.correct)
    setAnswerResult(res)
    if (res.correct) {
      setSessionCorrectCount((prev) => prev + 1)
      setSessionStreak((prev) => {
        const next = prev + 1
        setBestStreak((best) => Math.max(best, next))
        return next
      })
    } else {
      setSessionStreak(0)
      // Missed questions come back once at the end; a recording is not repeated.
      if (question.questionType !== 'READ_ALOUD') {
        setRetries((prev) => [...prev, { ...question, retry: true, correctAnswer: res.correctAnswer, explanation: res.explanation }])
      }
    }
    setSessionAttempts((prev) => [
      ...prev,
      { question, userAnswer: answer, isCorrect: res.correct, correctAnswer: res.correctAnswer, explanation: res.explanation },
    ])
  }

  const handleSpeaking = async (audio: Blob) => {
    if (!activeSession) return
    const currentQ = queue[currentIdx]
    const res = await submitPracticeSpeaking(activeSession.sessionId, currentQ.questionCode, audio, Date.now() - questionStartTime)
    setUserSelectedChoice('speaking')
    applyResult(currentQ, 'speaking', res)
  }

  // Submit Answer
  const handleSelectChoice = async (choiceText: string) => {
    if (!activeSession || userSelectedChoice || submittingAnswer) return
    const currentQ = queue[currentIdx]
    if (!currentQ) return

    setUserSelectedChoice(choiceText)
    if (currentQ.retry) {
      const correct = sentenceMatches(choiceText, currentQ.correctAnswer ?? '')
      playFeedbackSound(correct)
      setAnswerResult({
        correct,
        correctAnswer: currentQ.correctAnswer ?? '',
        explanation: currentQ.explanation ?? '',
        streak: 0,
        masteryScore: 0,
        intervalDays: 0,
        nextReviewAt: '',
        attemptsCount: 0,
        correctCount: 0,
        sessionCompleted: false,
      })
      return
    }
    setSubmittingAnswer(true)
    const elapsedMs = Date.now() - questionStartTime

    try {
      const res = await submitPracticeAnswer(
        activeSession.sessionId,
        currentQ.questionCode,
        choiceText,
        elapsedMs
      )
      applyResult(currentQ, choiceText, res)

    } catch (err: any) {
      console.error('Failed to submit answer', err)
      setErrorMsg('Lỗi khi gửi đáp án. Vui lòng thử lại.')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (!activeSession) return
    const nextQueue = currentIdx + 1 < queue.length ? queue : [...queue, ...retries]
    if (nextQueue !== queue) {
      setQueue(nextQueue)
      setRetries([])
    }
    if (currentIdx + 1 < nextQueue.length) {
      setCurrentIdx((prev) => prev + 1)
      setUserSelectedChoice(null)
      setAnswerResult(null)
      setQuestionStartTime(Date.now())
    } else {
      // The answers changed the learner's stats, so ask for the plan again.
      setMode('SUMMARY')
      getTodayPlan().then(setUpdatedPlan).catch(() => setUpdatedPlan(null))
    }
  }

  // Current Question
  const activeQuestion = queue[currentIdx]
  const isSpeaking = activeQuestion?.questionType === 'READ_ALOUD'
  const tiles = useMemo(
    () => (activeQuestion?.questionType === 'SENTENCE_ORDER' ? parseSentenceTiles(activeQuestion.prompt, activeQuestion.options) : null),
    [activeQuestion],
  )
  const chooseSentence = (sentence: string) => {
    const option = activeQuestion?.options.find((item) => sentenceMatches(item.text, sentence))
    handleSelectChoice(option?.text ?? sentence)
  }
  const currentReason = activeQuestion ? reasonMeta[activeQuestion.selectionReason] || reasonMeta.NEW_CONTENT : null
  const currentSkill = activeQuestion ? skillMeta[activeQuestion.skillKey] || skillMeta.vocabulary : null

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── ERROR ALERT ── */}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs font-semibold underline hover:no-underline ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {mode === 'LOADING' && !errorMsg && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang chuẩn bị câu hỏi...
        </div>
      )}

      {mode === 'LOADING' && errorMsg && (
        <div className="text-center">
          <button type="button" onClick={onExit} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Về Lộ trình của tôi
          </button>
        </div>
      )}

      {mode === 'QUIZ' && activeQuestion && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Quiz Top Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn thoát lượt luyện tập hiện tại? Kết quả các câu đã làm vẫn được lưu.')) {
                  onExit()
                }
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Dừng luyện tập</span>
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>Chuỗi đúng: {sessionStreak} 🔥</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Câu hỏi {currentIdx + 1} / {queue.length}
              </span>
              <span>HSK {activeSession?.levelCode}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B52A2A] rounded-full transition-all duration-300"
                style={{
                  width: `${(((currentIdx + 1) / (queue.length || 1)) * 100).toFixed(0)}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-xs space-y-6">
            {/* Badges: Reason & Skill */}
            <div className="flex flex-wrap items-center gap-2">
              {activeQuestion.retry && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Làm lại câu sai</span>
                </span>
              )}
              {currentReason && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentReason.badgeClass}`}
                >
                  <currentReason.icon className="w-3.5 h-3.5" />
                  <span>{currentReason.label}</span>
                </span>
              )}

              {currentSkill && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${currentSkill.bg} ${currentSkill.color}`}
                >
                  <currentSkill.icon className="w-3 h-3" />
                  <span>{currentSkill.label}</span>
                </span>
              )}
            </div>

            {/* Prompt with Chinese Typography & Audio */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2
                    className="text-2xl md:text-3xl font-bold text-slate-900 leading-relaxed tracking-wide"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {activeQuestion.prompt}
                  </h2>
                  {activeQuestion.promptPinyin && (
                    <div className="text-base text-slate-500 font-medium tracking-wide">
                      {activeQuestion.promptPinyin}
                    </div>
                  )}
                </div>

                {/* Audio Button */}
                {!isSpeaking && !tiles && (
                  <AudioButton
                    audioUrl={activeQuestion.promptAudioUrl}
                    text={activeQuestion.prompt}
                    size="lg"
                    title="Nghe phát âm"
                    className="shrink-0"
                  />
                )}
              </div>
            </div>

            {isSpeaking && !answerResult && (
              <VoiceRecorder key={currentIdx} onSubmit={handleSpeaking} onSkip={handleNextQuestion} />
            )}

            {tiles && (
              <SentenceTiles key={currentIdx} tokens={tiles} disabled={userSelectedChoice !== null || submittingAnswer} onCheck={chooseSentence} />
            )}

            {/* 4 Choices */}
            {!isSpeaking && !tiles && <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeQuestion.options.map((opt, optIndex) => {
                const isSelected = userSelectedChoice === opt.text
                const isAnswered = userSelectedChoice !== null

                let btnClass = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                if (isAnswered) {
                  if (answerResult) {
                    if (opt.text.trim().toLowerCase() === answerResult.correctAnswer.trim().toLowerCase()) {
                      btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    } else if (isSelected && !answerResult.correct) {
                      btnClass = 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                    } else {
                      btnClass = 'border-slate-100 text-slate-400 opacity-60'
                    }
                  }
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectChoice(opt.text)}
                    disabled={isAnswered || submittingAnswer}
                    className={`p-4 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-3 ${btnClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="text-sm md:text-base font-medium">{opt.text}</span>
                    </div>

                    {isAnswered && answerResult && (
                      <div className="shrink-0">
                        {opt.text.trim().toLowerCase() === answerResult.correctAnswer.trim().toLowerCase() && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                        {isSelected && !answerResult.correct && (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>}

            {/* Immediate Explanation Box */}
            {answerResult && (
              <div
                className={`p-5 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                  answerResult.correct
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                    : 'border-rose-200 bg-rose-50/70 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {answerResult.correct ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Chính xác! Làm rất tốt!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span className="text-rose-700">Chưa chính xác!</span>
                      </>
                    )}
                  </div>

                  {/* Bayesian Mastery change badge */}
                  {!activeQuestion.retry && <div className="flex items-center gap-2 text-xs font-semibold">
                    {answerResult.accuracy != null && (
                      <span className="px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                        Độ khớp: {Math.round(answerResult.accuracy * 100)}%
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                      Mastery: {Math.round(answerResult.masteryScore * 100)}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                      {answerResult.intervalDays > 0
                        ? `Lịch ôn tiếp: +${answerResult.intervalDays} ngày`
                        : 'Ôn lại sau: 4 giờ'}
                    </span>
                  </div>}
                </div>

                {(tiles || isSpeaking) && !answerResult.correct && (
                  <div className="mt-2 text-base font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                    Câu đúng: {answerResult.correctAnswer}
                  </div>
                )}
                <div className="text-xs md:text-sm leading-relaxed mt-2 text-slate-700">
                  <strong className="text-slate-900">Giải thích: </strong>
                  {answerResult.explanation || `Đáp án đúng là "${answerResult.correctAnswer}".`}
                </div>
              </div>
            )}

            {/* Next / Finish Button */}
            {answerResult && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#B52A2A] text-white font-bold text-sm shadow-md hover:bg-[#9c2323] transition-all transform hover:-translate-y-0.5"
                >
                  <span>
                    {currentIdx + 1 < queue.length || retries.length > 0
                      ? 'Câu tiếp theo'
                      : 'Hoàn thành lượt luyện tập'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE: SESSION SUMMARY
      ────────────────────────────────────────────────────────────── */}
      {mode === 'SUMMARY' && activeSession && (
        <div className="space-y-6 max-w-2xl mx-auto text-center py-6 animate-in zoom-in-95 duration-200">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-xs space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#B52A2A] flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800">
                Chúc mừng bạn đã hoàn thành bài luyện tập!
              </h2>
              <p className="text-xs text-slate-400">
                Kết quả đã được cập nhật vào bảng Spaced Repetition và thuật toán thích ứng
              </p>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50">
                <div className="text-2xl font-black text-slate-800">
                  {sessionCorrectCount}/{activeSession.questions.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Số câu đúng</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
                <div className="text-2xl font-black">
                  {Math.round((sessionCorrectCount / (activeSession.questions.length || 1)) * 100)}%
                </div>
                <div className="text-[11px] text-emerald-600 mt-0.5">Tỉ lệ chính xác</div>
              </div>

              <div className="p-3 rounded-2xl bg-orange-50 text-orange-700">
                <div className="text-2xl font-black">{bestStreak}</div>
                <div className="text-[11px] text-orange-600 mt-0.5">Chuỗi cao nhất</div>
              </div>
            </div>

            {/* Review Breakdown */}
            <div className="text-left space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chi tiết các câu đã làm ({sessionAttempts.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {sessionAttempts.map((attempt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      attempt.isCorrect
                        ? 'border-emerald-100 bg-emerald-50/40 text-emerald-950'
                        : 'border-rose-100 bg-rose-50/40 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {attempt.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-bold truncate" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        {attempt.question.prompt}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                      Đ/án: {attempt.correctAnswer}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => startSession()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#B52A2A] text-white font-bold text-sm shadow-sm hover:bg-[#9c2323] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Luyện tập lượt tiếp theo</span>
              </button>

              <button
                type="button"
                onClick={onExit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Về Lộ trình của tôi</span>
              </button>
            </div>
          </div>
          {updatedPlan?.items[0] && (
            <Link
              to={updatedPlan.items[0].link}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[#B52A2A] px-5 py-4 text-left text-white transition hover:bg-[#9e2424]"
            >
              <span className="min-w-0">
                <span className="block text-xs font-medium text-white/80">Việc tiếp theo trong lộ trình</span>
                <span className="block truncate text-sm font-bold">{updatedPlan.items[0].title}</span>
                <span className="block truncate text-xs text-white/80">{updatedPlan.items[0].detail}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
