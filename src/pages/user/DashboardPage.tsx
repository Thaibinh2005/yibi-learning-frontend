import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { getLearningPathOverview, getStudyStats, getTodayPlan, type DailyPlan, type LearningPathOverview, type StudyStats } from '@/api/learningPathApi'
import { GoalRing } from '@/components/learningpath/GoalRing'
import { levelLabel } from '@/components/learningpath/GoalForm'
import { ArrowRight, BookMarked, Check, FileCheck, Flame, History, Layers, Library, Play, Trophy } from 'lucide-react'

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/** Minutes studied per day against the daily goal: one series, so the title names it and no legend is needed. */
const WeekChart: React.FC<{ stats: StudyStats }> = ({ stats }) => {
  const goal = stats.dailyGoalMinutes
  const top = Math.max(goal, ...stats.week.map((day) => day.minutes), 1)
  const goalAt = (goal / top) * 100
  const today = stats.week[stats.week.length - 1]?.date
  return (
    <section className="card-soft p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-extrabold text-slate-900">Thời gian học 7 ngày qua</h2>
        <p className="text-xs font-medium text-slate-500">Hôm nay {stats.answersToday} câu{stats.answersToday > 0 ? `, đúng ${stats.accuracyToday}%` : ''} · {stats.nodesCompleted} bài đã xong</p>
      </div>
      <div className="relative mt-8 h-36">
        <div className="absolute inset-x-0 border-t-2 border-dashed border-slate-300" style={{ bottom: `${goalAt}%` }}>
          <span className="absolute -top-5 right-0 text-[11px] font-semibold text-slate-500">Mục tiêu {goal} phút</span>
        </div>
        <ol className="absolute inset-0 flex items-end justify-around gap-2 border-b border-slate-200">
          {stats.week.map((day) => {
            const date = new Date(`${day.date}T00:00:00`)
            const label = `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}: ${day.minutes} phút${day.goalMet ? ', đạt mục tiêu' : ''}`
            return (
              <li key={day.date} className="group relative flex h-full w-full max-w-10 flex-col items-center justify-end" aria-label={label}>
                <span className="pointer-events-none absolute z-10 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100" style={{ bottom: `${(day.minutes / top) * 100 + 4}%` }}>{label}</span>
                {day.minutes > 0 && <span className="mb-1 text-xs font-bold tabular-nums text-slate-700">{day.minutes}</span>}
                <span className="block w-full rounded-t bg-brand transition-[height] duration-500" style={{ height: day.minutes > 0 ? `${Math.max((day.minutes / top) * 100 - 10, 4)}%` : '2px', opacity: day.minutes > 0 ? 1 : 0.15 }} />
              </li>
            )
          })}
        </ol>
      </div>
      <ol className="mt-2 flex justify-around gap-2" aria-hidden="true">
        {stats.week.map((day) => (
          <li key={day.date} className={`flex w-full max-w-10 flex-col items-center text-xs ${day.date === today ? 'font-extrabold text-slate-900' : 'font-medium text-slate-500'}`}>
            {WEEKDAYS[new Date(`${day.date}T00:00:00`).getDay()]}
            <span className={`mt-1 grid h-4 w-4 place-items-center rounded-full ${day.goalMet ? 'bg-emerald-600 text-white' : ''}`}>{day.goalMet && <Check className="h-3 w-3" strokeWidth={3} />}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

const Stat: React.FC<{ icon: React.ElementType; tint: string; label: string; value: string; note: string }> = ({ icon: Icon, tint, label, value, note }) => (
  <div className="card-soft flex items-center gap-4 p-4 sm:p-5">
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tint}`}><Icon className="h-6 w-6" /></span>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="truncate text-xs text-slate-500">{note}</p>
    </div>
  </div>
)

const SHORTCUTS = [
  { to: '/learning-path/mistakes', icon: History, tint: 'bg-amber-100 text-amber-700', title: 'Câu từng sai', note: 'Ôn lại đến khi thuộc' },
  { to: '/vocabulary/daily', icon: BookMarked, tint: 'bg-sky-100 text-sky-700', title: 'Từ vựng mỗi ngày', note: 'Vài từ mới cho hôm nay' },
  { to: '/exams', icon: FileCheck, tint: 'bg-violet-100 text-violet-700', title: 'Thi thử trên máy', note: 'Nghe, đọc, gõ tiếng Trung' },
  { to: '/courses', icon: Library, tint: 'bg-rose-100 text-brand', title: 'Thư viện giáo trình', note: 'Tra cứu HSK 1–9' },
]

export const DashboardPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const username = user?.username || 'bạn'
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [overview, setOverview] = useState<LearningPathOverview | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    getStudyStats().then(setStats).catch(() => setStats(null))
    getTodayPlan().then(setPlan).catch(() => setPlan(null))
    getLearningPathOverview().then(setOverview).catch(() => setOverview(null))
  }, [isAuthenticated])

  const dueCards = stats?.dueCards ?? 0
  const level = overview?.availableHskLevel ?? user?.hskLevel ?? 1
  const next = plan?.items.find((item) => item.type === 'LESSON')
  const percent = stats?.goalPercent ?? 0

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C8322B] to-[#8C1F1A] p-6 text-white sm:p-8">
        <span className="font-chinese pointer-events-none absolute -bottom-12 right-32 hidden select-none sm:block text-[13rem] font-bold leading-none text-white/[0.07]" aria-hidden="true">学</span>
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {isAuthenticated && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                <Flame className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                {stats?.streakDays ?? 0} ngày liên tiếp
              </p>
            )}
            <h1 className="mt-3 break-words text-3xl font-extrabold tracking-tight sm:text-4xl">Chào {username}!</h1>
            <p className="mt-2 text-sm font-medium text-white/90">{!isAuthenticated ? 'Đăng nhập để có lộ trình riêng và lưu tiến độ học của bạn.' : next ? 'Bài tiếp theo của bạn đã sẵn sàng.' : 'Hôm nay học gì tiếp nhé?'}</p>
            <Link to={next?.link ?? '/learning-path'} className="btn-chunky mt-5 max-w-full bg-white px-6 py-3.5 text-base text-brand [--edge:#E7E5E4]">
              <Play className="h-5 w-5 shrink-0 fill-current" />
              <span className="truncate">{next ? `Học tiếp: ${next.title}` : isAuthenticated ? 'Mở lộ trình' : 'Bắt đầu học'}</span>
            </Link>
          </div>
          {isAuthenticated && <div className="flex items-center gap-4 sm:flex-col sm:gap-2 sm:text-center">
            <GoalRing percent={percent} size={112} stroke={12} trackColor="rgba(255,255,255,0.2)" color="#FBBF24">
              <span>
                <span className="block text-2xl font-extrabold leading-none tabular-nums">{stats?.todayMinutes ?? 0}</span>
                <span className="text-[11px] font-semibold text-white/85">/{stats?.dailyGoalMinutes ?? 0} phút</span>
              </span>
            </GoalRing>
            <p className="text-xs font-semibold text-white/90">Mục tiêu hôm nay: {percent}%</p>
          </div>}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Trophy} tint="bg-amber-100 text-amber-700" label="Cấp hiện tại" value={isAuthenticated ? levelLabel(level) : '—'} note={!isAuthenticated ? 'Đăng nhập để xem' : overview?.goal ? `Mục tiêu: ${levelLabel(overview.goal.targetLevel)}` : 'Theo lộ trình của bạn'} />
        <Stat icon={Layers} tint="bg-emerald-100 text-emerald-700" label="Thẻ cần ôn hôm nay" value={isAuthenticated ? String(dueCards) : '—'} note={!isAuthenticated ? 'Đăng nhập để xem' : dueCards > 0 ? 'Ôn ngay để không quên' : 'Không có thẻ đến hạn'} />
        {stats?.targetScore != null ? (
          <Stat icon={FileCheck} tint="bg-violet-100 text-violet-700" label="Điểm so với mục tiêu" value={`${stats.bestTowardTarget ?? '—'}/${stats.targetScore}`} note={stats.bestTowardTarget != null ? `Ước tính từ đề thi thử, thang ${stats.targetScale}` : 'Làm đề thi thử để biết điểm ước tính'} />
        ) : <Stat icon={FileCheck} tint="bg-violet-100 text-violet-700" label="Thi thử cao nhất" value={stats?.bestExamScore != null ? `${stats.bestExamScore}%` : '—'} note={!isAuthenticated ? 'Đăng nhập để xem' : stats?.bestExamLevel != null ? `Đề mô phỏng ${levelLabel(stats.bestExamLevel)}` : 'Chưa làm đề nào'} />}
      </div>

      {stats && <WeekChart stats={stats} />}

      <section>
        <h2 className="mb-3 text-lg font-extrabold text-slate-900">Luyện thêm</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SHORTCUTS.map(({ to, icon: Icon, tint, title, note }) => (
            <Link key={to} to={to} className="card-soft group flex items-center gap-3 !rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-800">{title}</span>
                <span className="block truncate text-xs text-slate-500">{note}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
