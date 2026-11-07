import React from 'react'
import type { GoalType, LearningGoalInput } from '@/api/learningPathApi'

const GOALS: { value: GoalType; label: string; description: string }[] = [
  { value: 'HSK', label: 'Thi HSK', description: 'Ưu tiên từ vựng, ngữ pháp và đọc' },
  { value: 'HSKK', label: 'Thi HSKK', description: 'Ưu tiên nghe và nói' },
  { value: 'COMMUNICATION', label: 'Giao tiếp', description: 'Ưu tiên nghe và từ vựng thông dụng' },
]

const LEVELS = [1, 2, 3, 4, 5, 6, 7]
const MINUTE_PRESETS = [10, 20, 30, 45, 60]

export const levelLabel = (level: number) => (level >= 7 ? 'HSK 7–9' : `HSK ${level}`)
export const goalLabel = (goal: GoalType) => GOALS.find((item) => item.value === goal)?.label ?? goal

const todayIso = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#C8322B] focus:outline-none'

/** Collects the goal, target and daily study time; used by the onboarding survey and the learning path page. */
export const GoalForm: React.FC<{
  value: LearningGoalInput
  onChange: (value: LearningGoalInput) => void
}> = ({ value, onChange }) => {
  // HSK 1-2 are out of 200, HSK 3 and above out of 300, HSKK out of 100; communication has no score.
  const scaleOf = (goal: LearningGoalInput) => (goal.goalType === 'COMMUNICATION' ? 0 : goal.goalType === 'HSKK' ? 100 : goal.targetLevel <= 2 ? 200 : 300)
  const set = (patch: Partial<LearningGoalInput>) => {
    const next = { ...value, ...patch }
    const top = scaleOf(next)
    onChange({ ...next, targetScore: top === 0 || next.targetScore == null ? null : Math.min(next.targetScore, top) })
  }
  const scale = scaleOf(value)
  const passMark = Math.round(scale * 0.6)

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">Bạn học để làm gì?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {GOALS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              aria-pressed={value.goalType === goal.value}
              onClick={() => set({ goalType: goal.value })}
              className={`rounded-xl border p-3 text-left transition ${
                value.goalType === goal.value
                  ? 'border-[#C8322B] bg-rose-50'
                  : 'border-slate-200 hover:border-rose-200'
              }`}
            >
              <span className="block text-sm font-bold text-slate-800">{goal.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{goal.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-semibold text-slate-700">
          Cấp mục tiêu
          <select
            className={`${fieldClass} mt-1.5`}
            value={value.targetLevel}
            onChange={(event) => set({ targetLevel: Number(event.target.value) })}
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>{levelLabel(level)}</option>
            ))}
          </select>
        </label>
        {scale > 0 ? (
          <label className="block text-sm font-semibold text-slate-700">
            Điểm mục tiêu <span className="font-normal text-slate-400">(thang {scale}, không bắt buộc)</span>
            <input
              type="number"
              min={0}
              max={scale}
              className={`${fieldClass} mt-1.5`}
              value={value.targetScore ?? ''}
              placeholder={`Đạt từ ${passMark}`}
              onChange={(event) => set({ targetScore: event.target.value === '' ? null : Math.min(Number(event.target.value), scale) })}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">Mục tiêu cao sẽ nâng mức cần đạt của bài kiểm tra trên lộ trình, tối đa 95%.</span>
          </label>
        ) : (
          <p className="self-center text-sm text-slate-500">Mục tiêu giao tiếp không dùng điểm số.</p>
        )}
        <label className="block text-sm font-semibold text-slate-700">
          Ngày mục tiêu <span className="font-normal text-slate-400">(không bắt buộc)</span>
          <input
            type="date"
            min={todayIso()}
            className={`${fieldClass} mt-1.5`}
            value={value.targetDate ?? ''}
            onChange={(event) => set({ targetDate: event.target.value || null })}
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">Mỗi ngày bạn học được bao lâu?</legend>
        <div className="flex flex-wrap gap-2">
          {MINUTE_PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={value.dailyMinutes === minutes}
              onClick={() => set({ dailyMinutes: minutes })}
              className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                value.dailyMinutes === minutes
                  ? 'border-[#C8322B] bg-rose-50 text-[#C8322B]'
                  : 'border-slate-200 text-slate-600 hover:border-rose-200'
              }`}
            >
              {minutes} phút
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
