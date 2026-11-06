import React, { useEffect, useState } from 'react'
import { ArrowLeft, Compass, Loader2, Pencil, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
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

const priorityLabels: Record<SkillStat['priority'], string> = {
  HIGH: 'Ưu tiên cao', MEDIUM: 'Ưu tiên vừa', LOW: 'Ôn định kỳ', INSUFFICIENT: 'Chưa đủ dữ liệu',
}

const priorityColors: Record<SkillStat['priority'], string> = {
  HIGH: 'bg-rose-50 text-rose-700', MEDIUM: 'bg-amber-50 text-amber-700',
  LOW: 'bg-emerald-50 text-emerald-700', INSUFFICIENT: 'bg-slate-100 text-slate-500',
}

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
          <polygon key={ring} points={polygon(RADAR_AXES.map(() => ring))} fill="none" stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {RADAR_AXES.map((axis, index) => (
          <line key={axis.key} x1={center.x} y1={center.y} x2={at(index, 1).x} y2={at(index, 1).y} stroke="#cbd5e1" />
        ))}
        {hasMeasuredSkill && <polygon points={polygon(values)} fill="rgba(181,42,42,0.18)" stroke="#B52A2A" strokeWidth="2.5" />}
        {RADAR_AXES.map((axis, index) => {
          const skill = stats[index]
          const measured = Boolean(skill && skill.attempts >= 3)
          const label = at(index, 1, radius + 22)
          return (
            <text key={axis.key} x={label.x} y={label.y + 4} textAnchor="middle" className="fill-slate-600 text-[11px]">
              {axis.label}{measured ? ` ${skill?.accuracyPercent}%` : ' —'}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export const PersonalizedLearningPage: React.FC = () => {
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
  const prioritySkills = selectedSkills.filter((skill) => skill.priority === 'HIGH' || skill.priority === 'MEDIUM')

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <Link to="/courses" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#B52A2A]"><ArrowLeft className="h-3.5 w-3.5" />Thư viện giáo trình</Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-[#B52A2A]"><Sparkles className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Lộ trình của tôi</h1>
              <p className="mt-1 text-xs text-slate-500">Lộ trình theo trình độ, việc cần làm hôm nay và năng lực của bạn ở cùng một nơi.</p>
            </div>
          </div>
        </div>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <div className="grid gap-5 lg:grid-cols-2">
            {goal && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold text-slate-800">Mục tiêu của bạn</h2>
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
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
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
                      <button
                        type="button"
                        onClick={saveGoal}
                        disabled={savingGoal}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#9e2424] disabled:opacity-50"
                      >
                        {savingGoal && <Loader2 className="h-4 w-4 animate-spin" />}
                        Lưu mục tiêu
                      </button>
                      <button
                        type="button"
                        onClick={() => { setGoalDraft(null); setGoalError('') }}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    {goalLabel(goal.goalType)} · {levelLabel(goal.targetLevel)}
                    {goal.targetScore != null && ` · ${goal.targetScore} điểm`}
                    {goal.targetDate && ` · trước ${new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString('vi-VN')}`}
                    {` · ${goal.dailyMinutes} phút mỗi ngày`}
                    {!goal.goalSet && ' (mặc định, hãy đặt mục tiêu của bạn)'}
                  </p>
                )}
              </section>
            )}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#B52A2A]">Trình độ hiện tại: HSK {overview?.availableHskLevel ?? 1}</p>
                  <h2 className="mt-2 text-lg font-bold text-slate-800">{overview?.assessmentCompleted ? 'Kết quả đánh giá của bạn' : 'Bắt đầu bằng bài đánh giá năng lực'}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{overview?.levelSummary ?? 'Làm bài test xếp trình độ để xác định mức HSK của bạn và xây dựng lộ trình học.'}</p>
                </div>
              </div>
              <Link to="/placement" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#B52A2A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#9e2424]">
                {overview?.assessmentCompleted ? <RefreshCw className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
                {overview?.assessmentCompleted ? 'Làm lại bài test xếp trình độ' : 'Làm bài test xếp trình độ'}
              </Link>
            </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-5">
            {plan && roadmap && <RoadmapView plan={plan} roadmap={roadmap} onSelectLevel={(level) => { getRoadmap(level).then(setRoadmap).catch(() => setError('Không tải được cấp này.')) }} />}
          </main>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="font-bold text-slate-800">Biểu đồ năng lực</h2>
            <p className="mt-1 text-xs text-slate-400">Tỷ lệ câu đúng · cần ít nhất 3 câu mỗi kỹ năng để đánh giá</p>
            <div className="mt-3"><RadarChart skills={selectedSkills} /></div>
            <div className="mt-2 space-y-2">
              {selectedSkills.map((skill) => (
                <div key={skill.skillKey} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <div><span className="text-xs font-semibold text-slate-700">{skill.label}</span><span className="ml-2 text-[10px] text-slate-400">{skill.attempts} câu</span></div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${priorityColors[skill.priority]}`}>{priorityLabels[skill.priority]}</span>
                </div>
              ))}
            </div>
            {prioritySkills.length > 0 && <p className="mt-4 text-xs leading-relaxed text-slate-500">Ưu tiên ôn: {prioritySkills.map((skill) => skill.label).join(', ')}. Điểm được tính từ bài test và các lượt luyện tập gần đây, không suy đoán kỹ năng thiếu dữ liệu.</p>}
            {mastery && mastery.totalAttempts > 0 && (
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2"><dd className="text-sm font-bold text-slate-800">{mastery.dueReviewCount}</dd><dt className="text-[10px] text-slate-500">Chủ đề đến hạn ôn</dt></div>
                <div className="rounded-lg bg-slate-50 p-2"><dd className="text-sm font-bold text-slate-800">{mastery.bestStreak}</dd><dt className="text-[10px] text-slate-500">Chuỗi đúng tốt nhất</dt></div>
                <div className="rounded-lg bg-slate-50 p-2"><dd className="text-sm font-bold text-slate-800">{mastery.totalAttempts}</dd><dt className="text-[10px] text-slate-500">Câu đã luyện</dt></div>
              </dl>
            )}
            {!overview?.assessmentCompleted && <p className="mt-4 text-xs text-slate-500">Biểu đồ cập nhật sau mỗi bài đánh giá hoặc lượt luyện tập.</p>}
          </aside>
        </div>
    </div>
  )
}
