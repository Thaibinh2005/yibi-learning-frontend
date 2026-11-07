import React, { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Compass, Library, Loader2, Pencil, RefreshCw, Sparkles, Target } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useRequireLogin } from '@/router/useRequireLogin'
import {
  getLearningPathOverview,
  getRoadmap,
  getTodayPlan,
  updateLearningGoal,
  type DailyPlan,
  type Roadmap,
  type LearningGoalInput,
  type LearningPathOverview,
  type SkillStat,
} from '@/api/learningPathApi'
import { GoalForm, goalLabel, levelLabel } from '@/components/learningpath/GoalForm'
import { RoadmapView } from '@/components/learningpath/RoadmapView'
import { getMasterySummary, type MasterySummary } from '@/api/practiceApi'

const RADAR_AXES = [
  { key: 'listening', label: 'Nghe' },
  { key: 'reading', label: 'Đọc' },
  { key: 'writing', label: 'Viết' },
  { key: 'speaking', label: 'Nói' },
  { key: 'vocabulary', label: 'Từ vựng' },
  { key: 'grammar', label: 'Ngữ pháp' },
]

const RadarChart: React.FC<{ skills: SkillStat[] }> = ({ skills }) => {
  const center = { x: 160, y: 140 }
  const radius = 88
  const angleOf = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / RADAR_AXES.length
  const at = (index: number, fraction: number, reach = radius) => ({
    x: center.x + Math.cos(angleOf(index)) * reach * fraction,
    y: center.y + Math.sin(angleOf(index)) * reach * fraction,
  })
  const polygon = (fractions: number[]) =>
    fractions.map((fraction, index) => `${at(index, fraction).x},${at(index, fraction).y}`).join(' ')
  const stats = RADAR_AXES.map((axis) => skills.find((item) => item.skillKey === axis.key))
  const values = stats.map((skill) => (skill && skill.attempts >= 3 ? skill.accuracyPercent / 100 : 0))
  const hasMeasuredSkill = stats.some((skill) => skill && skill.attempts >= 3)

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 320 285" className="w-full max-w-[340px]" role="img" aria-label="Biểu đồ năng lực theo kỹ năng">
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon key={ring} points={polygon(RADAR_AXES.map(() => ring))} fill="none" stroke="#E7E5E4" strokeWidth="1" />
        ))}
        {RADAR_AXES.map((axis, index) => (
          <line key={axis.key} x1={center.x} y1={center.y} x2={at(index, 1).x} y2={at(index, 1).y} stroke="#E7E5E4" />
        ))}
        {hasMeasuredSkill && <polygon points={polygon(values)} fill="rgba(200,50,43,0.18)" stroke="#C8322B" strokeWidth="2.5" />}
        {RADAR_AXES.map((axis, index) => {
          const skill = stats[index]
          const measured = Boolean(skill && skill.attempts >= 3)
          const label = at(index, 1, radius + 22)
          return (
            <text key={axis.key} x={label.x} y={label.y + 4} textAnchor="middle" className="fill-slate-600 text-[11px] font-semibold">
              {axis.label}{measured ? ` ${skill?.accuracyPercent}%` : ' —'}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * A guest picks how to learn: a personal path needs an account (placement, goals, saved progress),
 * the textbook library can be browsed straight away.
 */
const GuestPathChooser: React.FC = () => {
  const navigate = useNavigate()
  const { requireLogin } = useRequireLogin()
  const choosePersonal = () => {
    if (requireLogin({ pathname: '/learning-path' })) navigate('/learning-path')
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Lộ trình học</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">Chọn cách bạn muốn học tiếng Trung với Yibi.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <button type="button" onClick={choosePersonal} className="card-soft group flex flex-col items-start gap-3 p-6 text-left transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-brand"><Sparkles className="h-6 w-6" /></span>
          <span className="text-lg font-extrabold text-slate-900">Theo cá nhân</span>
          <span className="text-sm leading-relaxed text-slate-500">Làm bài test xếp trình độ, đặt mục tiêu và nhận lộ trình riêng theo điểm mạnh, điểm yếu của bạn. Tiến độ được lưu lại.</span>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-brand">Đăng nhập để bắt đầu<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
        </button>
        <Link to="/courses" className="card-soft group flex flex-col items-start gap-3 p-6 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700"><BookOpen className="h-6 w-6" /></span>
          <span className="text-lg font-extrabold text-slate-900">Theo giáo trình</span>
          <span className="text-sm leading-relaxed text-slate-500">Xem nội dung giáo trình HSK 1–9: từ vựng, ngữ pháp, chữ Hán, bài đọc và bài nghe.</span>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-sky-700">Mở thư viện giáo trình<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
        </Link>
      </div>
      <section className="card-soft flex items-start gap-4 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><Target className="h-5 w-5" /></span>
        <p className="text-sm leading-relaxed text-slate-600">Lộ trình cá nhân chia bài theo đơn vị, nhắc ôn từ vựng và câu từng sai mỗi ngày, có bài kiểm tra vượt cấp khi bạn đã sẵn sàng.</p>
      </section>
    </div>
  )
}

export const PersonalizedLearningPage: React.FC = () => {
  const { isAuthenticated } = useRequireLogin()
  return isAuthenticated ? <LearnerPath /> : <GuestPathChooser />
}

const LearnerPath: React.FC = () => {
  const [overview, setOverview] = useState<LearningPathOverview | null>(null)
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [mastery, setMastery] = useState<MasterySummary | null>(null)
  const [error, setError] = useState('')
  const [goalDraft, setGoalDraft] = useState<LearningGoalInput | null>(null)
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalError, setGoalError] = useState('')

  const load = (level?: number) => Promise.all([getLearningPathOverview(), getTodayPlan(), getRoadmap(level)]).then(([nextOverview, nextPlan, nextRoadmap]) => {
    setOverview(nextOverview)
    setPlan(nextPlan)
    setRoadmap(nextRoadmap)
  })

  useEffect(() => {
    load().catch(() => setError('Không tải được dữ liệu lộ trình.'))
    // Extra numbers only: the page still works if this one call fails.
    getMasterySummary().then(setMastery).catch(() => setMastery(null))
  }, [])

  const saveGoal = async () => {
    if (!goalDraft) return
    setSavingGoal(true)
    setGoalError('')
    try {
      await updateLearningGoal(goalDraft)
      await load()
      setGoalDraft(null)
    } catch {
      setGoalError('Chưa lưu được mục tiêu. Hãy kiểm tra lại thông tin rồi thử lần nữa.')
    } finally {
      setSavingGoal(false)
    }
  }

  const goal = overview?.goal

  const selectedSkills = overview?.skills ?? []

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0">
        {error && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
        {!plan && !error && <div className="flex items-center justify-center gap-2 p-16 text-sm font-medium text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Đang tải lộ trình...</div>}
        {plan && roadmap && <RoadmapView plan={plan} roadmap={roadmap} onSelectLevel={(level) => { getRoadmap(level).then(setRoadmap).catch(() => setError('Không tải được cấp này.')) }} />}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        {goal && (
          <section className="card-soft p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-extrabold text-slate-900">Mục tiêu của bạn</h2>
              {!goalDraft && (
                <button
                  type="button"
                  onClick={() => setGoalDraft({
                    goalType: goal.goalType,
                    targetLevel: goal.targetLevel,
                    targetScore: goal.targetScore ?? null,
                    targetDate: goal.targetDate ?? null,
                    dailyMinutes: goal.dailyMinutes,
                  })}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {goal.goalSet ? 'Sửa' : 'Đặt mục tiêu'}
                </button>
              )}
            </div>
            {goalDraft ? (
              <div className="mt-4 space-y-4">
                <GoalForm value={goalDraft} onChange={setGoalDraft} />
                {goalError && <p role="alert" className="text-sm text-rose-700">{goalError}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={saveGoal} disabled={savingGoal} className="btn-chunky btn-brand flex-1">
                    {savingGoal && <Loader2 className="h-4 w-4 animate-spin" />}
                    Lưu
                  </button>
                  <button type="button" onClick={() => { setGoalDraft(null); setGoalError('') }} className="btn-chunky btn-paper">Hủy</button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-3 text-2xl font-extrabold tracking-tight text-brand">{levelLabel(goal.targetLevel)}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {goalLabel(goal.goalType)}
                  {goal.targetScore != null && ` · ${goal.targetScore} điểm`}
                  {goal.targetDate && ` · trước ${new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString('vi-VN')}`}
                  {` · ${goal.dailyMinutes} phút mỗi ngày`}
                  {!goal.goalSet && ' (mặc định, hãy đặt mục tiêu của bạn)'}
                </p>
              </>
            )}
          </section>
        )}

        <section className="card-soft p-5">
          <h2 className="font-extrabold text-slate-900">Năng lực của bạn</h2>
          <p className="mt-0.5 text-xs text-slate-500">Tỷ lệ câu đúng, cần từ 3 câu mỗi kỹ năng</p>
          <div className="mt-1"><RadarChart skills={selectedSkills} /></div>
          <ul className="space-y-2.5">
            {selectedSkills.map((skill) => {
              const measured = skill.priority !== 'INSUFFICIENT'
              return (
                <li key={skill.skillKey} title={`${skill.label}: ${skill.attempts} câu${measured ? `, đúng ${skill.accuracyPercent}%` : ''}`}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700">{skill.label}</span>
                    <span className="font-medium tabular-nums text-slate-500">
                      {measured ? `${skill.accuracyPercent}%` : 'Chưa đủ dữ liệu'}
                      {skill.priority === 'HIGH' && <b className="ml-1.5 text-brand">Cần ôn</b>}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    {measured && <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(skill.accuracyPercent, 2)}%` }} />}
                  </div>
                </li>
              )
            })}
          </ul>
          {mastery && mastery.totalAttempts > 0 && (
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
              <div><dd className="text-lg font-extrabold tabular-nums text-slate-900">{mastery.totalAttempts}</dd><dt className="text-[11px] font-medium text-slate-500">Câu đã luyện</dt></div>
              <div><dd className="text-lg font-extrabold tabular-nums text-slate-900">{mastery.bestStreak}</dd><dt className="text-[11px] font-medium text-slate-500">Chuỗi đúng</dt></div>
              <div><dd className="text-lg font-extrabold tabular-nums text-slate-900">{mastery.dueReviewCount}</dd><dt className="text-[11px] font-medium text-slate-500">Chủ đề đến hạn</dt></div>
            </dl>
          )}
        </section>

        <section className="card-soft p-5">
          <h2 className="font-extrabold text-slate-900">{overview?.assessmentCompleted ? 'Kết quả xếp trình độ' : 'Chưa chắc trình độ của mình?'}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{overview?.assessmentCompleted ? overview.levelSummary : 'Làm bài test khoảng 10–15 phút để lộ trình bắt đầu đúng cấp của bạn.'}</p>
          <Link to="/placement" className="btn-chunky btn-paper mt-4 w-full">
            {overview?.assessmentCompleted ? <RefreshCw className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
            {overview?.assessmentCompleted ? 'Làm lại bài test' : 'Làm bài test'}
          </Link>
          <Link to="/courses" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand"><Library className="h-3.5 w-3.5" />Tra cứu Thư viện giáo trình</Link>
        </section>
      </aside>
    </div>
  )
}
