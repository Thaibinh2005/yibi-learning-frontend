import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLearningPathOverview, type LearningPathOverview, type SkillStat } from '@/api/learningPathApi'

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
  const [error, setError] = useState('')
  useEffect(() => {
    getLearningPathOverview().then(setOverview).catch(() => setError('Không tải được dữ liệu lộ trình.'))
  }, [])

  const selectedSkills = overview?.skills ?? []
  const prioritySkills = selectedSkills.filter((skill) => skill.priority === 'HIGH' || skill.priority === 'MEDIUM')

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <Link to="/courses" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#B52A2A]"><ArrowLeft className="h-3.5 w-3.5" />Quay lại khóa học</Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-[#B52A2A]"><Sparkles className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Lộ trình cá nhân hóa</h1>
              <p className="mt-1 text-xs text-slate-500">Xác định trình độ HSK 1–9 và ưu tiên ôn tập theo kết quả của bạn.</p>
            </div>
          </div>
          <Link
            to="/practice/adaptive"
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/80 px-4 py-2.5 text-xs font-bold text-[#B52A2A] hover:bg-red-100 transition-colors self-start sm:self-auto"
          >
            <span>Luyện tập thích ứng (AI / SRS)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-5">
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

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="font-bold text-slate-800">Kế hoạch ôn tập đề xuất</h2>
              {overview?.recommendedLessons?.length ? (
                <div className="mt-4 space-y-3">
                  {overview.recommendedLessons.map((lesson) => (
                    <Link key={lesson.lessonId} to="/courses" className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 hover:border-red-200 hover:bg-red-50/30">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B52A2A]" />
                      <div><p className="text-sm font-semibold text-slate-800">Bài {lesson.lessonNumber}: {lesson.title}</p><p className="mt-1 text-xs text-slate-500">{lesson.reason}</p></div>
                    </Link>
                  ))}
                </div>
              ) : <p className="mt-3 text-sm text-slate-500">Làm bài test xếp trình độ trước để hệ thống đề xuất bài ôn phù hợp.</p>}
            </section>
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
            {prioritySkills.length > 0 && <p className="mt-4 text-xs leading-relaxed text-slate-500">Ưu tiên ôn: {prioritySkills.map((skill) => skill.label).join(', ')}. Điểm hiện được tính từ kết quả bạn đã làm, không suy đoán kỹ năng thiếu dữ liệu.</p>}
            {!overview?.assessmentCompleted && <p className="mt-4 text-xs text-slate-500">Biểu đồ sẽ cập nhật sau khi bạn hoàn thành bài đánh giá.</p>}
          </aside>
        </div>
    </div>
  )
}
