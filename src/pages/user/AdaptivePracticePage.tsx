import React, { useEffect, useState, useMemo } from 'react'
import {
  Brain,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Volume2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Layers,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AudioButton } from '@/components/ui/AudioButton'
import {
  getMasterySummary,
  startAdaptiveSession,
  submitPracticeAnswer,
  type AdaptiveQuestion,
  type AdaptiveSessionResponse,
  type MasterySummary,
  type PracticeAnswerResult,
  type SkillMasteryStat,
} from '@/api/practiceApi'

const PRIMARY = '#B52A2A'

const skillMeta: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  vocabulary: { label: 'Từ vựng', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  phonetics: { label: 'Ngữ âm', icon: Volume2, color: 'text-blue-600', bg: 'bg-blue-50' },
  characters: { label: 'Chữ Hán', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  grammar: { label: 'Ngữ pháp', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
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

// ── SVG Radar Chart Component ─────────────────────────────────────
const MasteryRadarChart: React.FC<{ skills: SkillMasteryStat[] }> = ({ skills }) => {
  const axes = [
    { key: 'vocabulary', label: 'Từ vựng', x: 160, y: 22 },
    { key: 'phonetics', label: 'Ngữ âm', x: 285, y: 120 },
    { key: 'grammar', label: 'Ngữ pháp', x: 235, y: 248 },
    { key: 'characters', label: 'Chữ Hán', x: 85, y: 248 },
  ]
  const center = { x: 160, y: 135 }
  const radius = 86

  const point = (index: number, fraction: number) => {
    const angle = -Math.PI / 2 + index * (Math.PI / 2)
    return `${center.x + Math.cos(angle) * radius * fraction},${
      center.y + Math.sin(angle) * radius * fraction
    }`
  }

  const values = axes.map((axis) => {
    const skill = skills.find((s) => s.skillKey === axis.key)
    // If attempts count >= 1, use masteryScore (0..1), otherwise 0.1 for visibility
    return skill && skill.attemptsCount > 0 ? Math.max(0.08, skill.masteryScore) : 0.05
  })

  const hasAnyAttempt = skills.some((s) => s.attemptsCount > 0)

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        viewBox="0 0 320 280"
        className="w-full max-w-[320px] drop-shadow-xs"
        role="img"
        aria-label="Biểu đồ năng lực theo kỹ năng"
      >
        {/* Radar Rings: 25%, 50%, 75%, 100% */}
        {[0.25, 0.5, 0.75, 1.0].map((ring) => (
          <polygon
            key={ring}
            points={axes.map((_, i) => point(i, ring)).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray={ring < 1.0 ? '3,3' : undefined}
          />
        ))}

        {/* Axis radial lines */}
        {axes.map((axis, i) => (
          <line
            key={axis.key}
            x1={center.x}
            y1={center.y}
            x2={point(i, 1).split(',')[0]}
            y2={point(i, 1).split(',')[1]}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        ))}

        {/* Skill Polygon Fill */}
        <polygon
          points={axes.map((_, i) => point(i, values[i])).join(' ')}
          fill={hasAnyAttempt ? 'rgba(181, 42, 42, 0.22)' : 'rgba(148, 163, 184, 0.12)'}
          stroke={hasAnyAttempt ? PRIMARY : '#94a3b8'}
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Data points */}
        {axes.map((axis, i) => {
          const [cx, cy] = point(i, values[i]).split(',')
          return (
            <circle
              key={`dot-${axis.key}`}
              cx={cx}
              cy={cy}
              r="4.5"
              fill={hasAnyAttempt ? PRIMARY : '#94a3b8'}
              stroke="#ffffff"
              strokeWidth="2"
            />
          )
        })}

        {/* Labels */}
        {axes.map((axis) => {
          const skill = skills.find((s) => s.skillKey === axis.key)
          const pct = skill && skill.attemptsCount > 0 ? Math.round(skill.masteryScore * 100) : 0
          return (
            <text
              key={`label-${axis.key}`}
              x={axis.x}
              y={axis.y}
              textAnchor="middle"
              className="fill-slate-700 text-[11px] font-semibold"
            >
              {axis.label}
              <tspan className="fill-slate-400 font-normal">
                {skill && skill.attemptsCount > 0 ? ` (${pct}%)` : ' (0%)'}
              </tspan>
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────────
export const AdaptivePracticePage: React.FC = () => {
  // Mode: 'DASHBOARD' | 'QUIZ' | 'SUMMARY'
  const [mode, setMode] = useState<'DASHBOARD' | 'QUIZ' | 'SUMMARY'>('DASHBOARD')

  // Dashboard state
  const [mastery, setMastery] = useState<MasterySummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('1')
  const [questionLimit, setQuestionLimit] = useState<number>(10)
  const [startingSession, setStartingSession] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Quiz state
  const [activeSession, setActiveSession] = useState<AdaptiveSessionResponse | null>(null)
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [userSelectedChoice, setUserSelectedChoice] = useState<string | null>(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [answerResult, setAnswerResult] = useState<PracticeAnswerResult | null>(null)
  const [sessionStreak, setSessionStreak] = useState<number>(0)
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0)
  const [sessionAttempts, setSessionAttempts] = useState<Array<{
    question: AdaptiveQuestion
    userAnswer: string
    isCorrect: boolean
    correctAnswer: string
    explanation: string
  }>>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  // Load summary on mount
  const loadSummaryData = async () => {
    try {
      setLoadingSummary(true)
      const data = await getMasterySummary()
      setMastery(data)
    } catch (err) {
      console.error('Failed to load mastery summary', err)
      setErrorMsg('Không tải được dữ liệu năng lực học tập. Vui lòng thử lại.')
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    loadSummaryData()
  }, [])

  // Start Adaptive Session
  const handleStartSession = async (level: string = selectedLevel) => {
    try {
      setStartingSession(true)
      setErrorMsg(null)
      const session = await startAdaptiveSession(level, questionLimit)
      if (!session.questions || session.questions.length === 0) {
        setErrorMsg(`Chưa có câu hỏi đã phát hành cho HSK ${level}. Vui lòng chọn cấp độ khác.`)
        return
      }
      setActiveSession(session)
      setCurrentIdx(0)
      setUserSelectedChoice(null)
      setAnswerResult(null)
      setSessionStreak(0)
      setSessionCorrectCount(0)
      setSessionAttempts([])
      setQuestionStartTime(Date.now())
      setMode('QUIZ')
    } catch (err: any) {
      console.error('Failed to start adaptive session', err)
      setErrorMsg(err.response?.data?.message || 'Không thể khởi tạo phiên luyện tập thích ứng.')
    } finally {
      setStartingSession(false)
    }
  }

  // Submit Answer
  const handleSelectChoice = async (choiceText: string) => {
    if (!activeSession || userSelectedChoice || submittingAnswer) return
    const currentQ = activeSession.questions[currentIdx]
    if (!currentQ) return

    setUserSelectedChoice(choiceText)
    setSubmittingAnswer(true)
    const elapsedMs = Date.now() - questionStartTime

    try {
      const res = await submitPracticeAnswer(
        activeSession.sessionId,
        currentQ.questionCode,
        choiceText,
        elapsedMs
      )
      setAnswerResult(res)
      if (res.correct) {
        setSessionCorrectCount((prev) => prev + 1)
        setSessionStreak(res.streak)
      } else {
        setSessionStreak(0)
      }

      setSessionAttempts((prev) => [
        ...prev,
        {
          question: currentQ,
          userAnswer: choiceText,
          isCorrect: res.correct,
          correctAnswer: res.correctAnswer,
          explanation: res.explanation,
        },
      ])
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
    if (currentIdx + 1 < activeSession.questions.length) {
      setCurrentIdx((prev) => prev + 1)
      setUserSelectedChoice(null)
      setAnswerResult(null)
      setQuestionStartTime(Date.now())
    } else {
      // Completed session
      setMode('SUMMARY')
      loadSummaryData() // Refresh dashboard in background
    }
  }

  // Current Question
  const activeQuestion = activeSession?.questions[currentIdx]
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

      {/* ─────────────────────────────────────────────────────────────
          MODE: DASHBOARD & CONFIGURATOR
      ────────────────────────────────────────────────────────────── */}
      {mode === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <header className="rounded-3xl border border-red-100 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 p-6 md:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-44 h-44 rounded-full bg-red-100/40 blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#B52A2A] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Thuật toán Bayesian Smoothing & Spaced Repetition</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                  Luyện tập Thích ứng & Thống kê Năng lực
                </h1>
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Hệ thống phân tích lịch sử làm bài, tự động điều chỉnh độ khó và ưu tiên câu hỏi ôn tập tới hạn (SRS),
                  tập trung vào kỹ năng còn yếu để tối ưu hóa thời gian ghi nhớ của bạn.
                </p>
              </div>

              {/* Quick Launch CTA */}
              <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleStartSession(selectedLevel)}
                  disabled={startingSession}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#B52A2A] text-white font-bold text-base shadow-md shadow-red-900/10 hover:bg-[#9c2323] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  {startingSession ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Brain className="w-5 h-5" />
                  )}
                  <span>Bắt đầu Luyện tập HSK {selectedLevel}</span>
                </button>
                <div className="text-[11px] text-center text-slate-400 font-medium">
                  {mastery?.dueReviewCount || 0} nội dung đang chờ ôn tập hôm nay
                </div>
              </div>
            </div>
          </header>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Mastery Score */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-red-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Độ thành thạo (Mastery)
                </span>
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-[#B52A2A]">
                  <Brain className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {mastery ? `${Math.round(mastery.averageMastery * 100)}%` : '0%'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tính theo xác suất hậu nghiệm Bayesian</p>
            </div>

            {/* Card 2: Due Reviews (SRS) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-amber-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cần ôn tập hôm nay
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600">
                {mastery?.dueReviewCount ?? 0}{' '}
                <span className="text-xs font-semibold text-slate-400">mục</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Đến hạn Spaced Repetition</p>
            </div>

            {/* Card 3: Best Streak */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-orange-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Chuỗi đúng tốt nhất
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {mastery?.bestStreak ?? 0}{' '}
                <span className="text-xs font-semibold text-slate-400">câu liên tiếp</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Độ tập trung cao nhất</p>
            </div>

            {/* Card 4: Accuracy & Attempts */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tỉ lệ đúng / Tổng số
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {mastery?.overallAccuracy ?? 0}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {mastery?.totalCorrect ?? 0}/{mastery?.totalAttempts ?? 0} câu đã luyện tập
              </p>
            </div>
          </div>

          {/* Main Grid: Radar Chart + Skills + Configurator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Radar Chart & Skills Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Radar Chart Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">
                      Bản đồ Năng lực Kỹ năng (Radar Mastery)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Đo lường độ vững vàng 4 trụ cột ngôn ngữ dựa trên thuật toán Spaced Repetition
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>

                {loadingSummary ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#B52A2A]" />
                    <span className="text-xs">Đang nạp dữ liệu năng lực...</span>
                  </div>
                ) : (
                  <MasteryRadarChart skills={mastery?.skills || []} />
                )}

                {/* Skill Detail Bars */}
                <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
                  {(mastery?.skills || []).map((sk) => {
                    const meta = skillMeta[sk.skillKey] || skillMeta.vocabulary
                    const Icon = meta.icon
                    const masteryPct = Math.round(sk.masteryScore * 100)

                    return (
                      <div
                        key={sk.skillKey}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">{meta.label}</div>
                              <div className="text-[11px] text-slate-400">
                                {sk.attemptsCount} câu đã làm · Đúng {sk.accuracyPercent}%
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-800">{masteryPct}%</div>
                            {sk.dueReviewCount > 0 ? (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                {sk.dueReviewCount} cần ôn lại
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Đã cập nhật</span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${masteryPct}%`,
                              backgroundColor: masteryPct >= 70 ? '#10b981' : masteryPct >= 40 ? '#f59e0b' : PRIMARY,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Practice Configurator & Level Overview (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Practice Launcher Box */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-[#B52A2A]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Thiết lập Lượt Luyện tập</h2>
                    <p className="text-xs text-slate-400">Chọn cấp độ HSK mục tiêu</p>
                  </div>
                </div>

                {/* Level selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Cấp độ HSK
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7-9'].map((lvl) => {
                      const isSelected = selectedLevel === lvl
                      const lvlData = mastery?.levels?.find((l) => l.levelCode === lvl)
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedLevel(lvl)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-[#B52A2A] bg-red-50 text-[#B52A2A] font-bold shadow-xs'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs">HSK {lvl}</div>
                          {lvlData && lvlData.attemptsCount > 0 && (
                            <div className="text-[10px] text-slate-400">
                              {Math.round(lvlData.masteryScore * 100)}%
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Limit selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Số lượng câu hỏi
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionLimit(num)}
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                          questionLimit === num
                            ? 'border-[#B52A2A] bg-red-50 text-[#B52A2A]'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Rule Info Box */}
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 text-xs text-amber-900 space-y-1.5 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Thứ tự ưu tiên câu hỏi tự động:</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-amber-800/90">
                    <li>
                      <strong>Tới hạn ôn tập (DUE_REVIEW):</strong> Các kiến thức đến lịch ôn tập Spaced Repetition hôm nay.
                    </li>
                    <li>
                      <strong>Kỹ năng còn yếu (WEAK_SKILL):</strong> Các câu hỏi có độ thành thạo dưới 70%.
                    </li>
                    <li>
                      <strong>Kiến thức mới (NEW_CONTENT):</strong> Mở rộng vốn từ và mẫu câu tiếp theo trong ngân hàng.
                    </li>
                  </ol>
                </div>

                {/* Start Button */}
                <button
                  type="button"
                  onClick={() => handleStartSession(selectedLevel)}
                  disabled={startingSession}
                  className="w-full py-3.5 rounded-2xl bg-[#B52A2A] text-white font-bold text-sm shadow-sm hover:bg-[#9c2323] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {startingSession ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span>Bắt đầu Luyện tập ngay</span>
                </button>
              </div>

              {/* Recent Sessions List */}
              {mastery?.recentSessions && mastery.recentSessions.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Lịch sử luyện tập gần đây
                  </h3>
                  <div className="space-y-2">
                    {mastery.recentSessions.map((s) => (
                      <div
                        key={s.sessionId}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-700">
                            HSK {s.levelCode} · {s.mode === 'ADAPTIVE' ? 'Thích ứng' : s.mode}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {s.startedAt ? new Date(s.startedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">
                            {s.correctAnswered}/{s.totalAnswered}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">câu đúng</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE: ACTIVE QUIZ (Interactive Question Card)
      ────────────────────────────────────────────────────────────── */}
      {mode === 'QUIZ' && activeQuestion && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Quiz Top Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn thoát lượt luyện tập hiện tại? Kết quả các câu đã làm vẫn được lưu.')) {
                  setMode('DASHBOARD')
                  loadSummaryData()
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
                Câu hỏi {currentIdx + 1} / {activeSession?.questions.length}
              </span>
              <span>HSK {activeSession?.levelCode}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B52A2A] rounded-full transition-all duration-300"
                style={{
                  width: `${(((currentIdx + 1) / (activeSession?.questions.length || 1)) * 100).toFixed(0)}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-xs space-y-6">
            {/* Badges: Reason & Skill */}
            <div className="flex flex-wrap items-center gap-2">
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
                <AudioButton
                  audioUrl={activeQuestion.promptAudioUrl}
                  text={activeQuestion.prompt}
                  size="lg"
                  title="Phát âm tiếng Trung chuẩn MinIO"
                  className="shrink-0"
                />
              </div>
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeQuestion.options.map((opt) => {
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
                        {opt.key}
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
            </div>

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
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                      Mastery: {Math.round(answerResult.masteryScore * 100)}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                      {answerResult.intervalDays > 0
                        ? `Lịch ôn tiếp: +${answerResult.intervalDays} ngày`
                        : 'Ôn lại sau: 4 giờ'}
                    </span>
                  </div>
                </div>

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
                    {currentIdx + 1 < (activeSession?.questions.length || 0)
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
                <div className="text-2xl font-black">{sessionStreak}</div>
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
                onClick={() => handleStartSession(activeSession.levelCode)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#B52A2A] text-white font-bold text-sm shadow-sm hover:bg-[#9c2323] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Luyện tập lượt tiếp theo</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('DASHBOARD')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Xem Dashboard Năng lực</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AdaptivePracticePage

