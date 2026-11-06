import React, { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  History,
  Ear,
  Languages,
  Layers,
  Lock,
  MessagesSquare,
  Newspaper,
  PenLine,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { DailyPlan, DailyPlanItem, Roadmap, RoadmapNode, RoadmapUnit } from '@/api/learningPathApi'

const REVIEW_ICONS: Record<DailyPlanItem['type'], React.ElementType> = {
  REVIEW_CARDS: Layers,
  REVIEW_MISTAKES: History,
  PRACTICE: Target,
  LESSON: BookOpen,
}

const NODE_ICONS: Record<string, React.ElementType> = {
  VOCABULARY: BookOpen,
  HANZI: PenLine,
  GRAMMAR: Languages,
  DIALOGUE: MessagesSquare,
  READING: Newspaper,
  LISTENING: Ear,
  CHECKPOINT: Trophy,
}

/** How many units after the current one show before "Xem thêm"; HSK 7–9 has hundreds. */
const UPCOMING_UNITS_SHOWN = 3
/** The sideways swing of the path, as offsets repeating down each unit. */
const SWING = [0, 44, 72, 44, 0, -44, -72, -44]

const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('vi-VN')

const paceMessage = (plan: DailyPlan) => {
  if (plan.remainingLessons === 0) return 'Bạn đã hoàn thành mọi bài học đến cấp mục tiêu.'
  const estimate = `Còn ${plan.remainingLessons} bài đến mục tiêu, dự kiến xong vào ${formatDate(plan.estimatedFinishDate)} nếu học đều.`
  // The API omits null fields: no target date means there is no verdict.
  if (plan.onTrack == null) return estimate
  if (plan.onTrack) return `${estimate} Bạn đang kịp ngày mục tiêu.`
  return plan.requiredDailyMinutes
    ? `${estimate} Để kịp ngày mục tiêu, bạn cần khoảng ${plan.requiredDailyMinutes} phút mỗi ngày.`
    : `${estimate} Ngày mục tiêu đang quá gần, hãy cân nhắc dời lại.`
}

const NODE_STYLES: Record<RoadmapNode['status'], string> = {
  DONE: 'bg-emerald-500 text-white shadow-[0_5px_0_#047857] hover:brightness-105',
  CURRENT: 'bg-[#D72E32] text-white shadow-[0_5px_0_#A71F24] ring-4 ring-rose-200 hover:brightness-105',
  OPEN: 'bg-white text-[#B52A2A] border-2 border-rose-200 shadow-[0_5px_0_#fecdd3] hover:bg-rose-50',
  LOCKED: 'bg-slate-200 text-slate-400 shadow-[0_5px_0_#cbd5e1] cursor-not-allowed',
}

const PathNode: React.FC<{ node: RoadmapNode; offset: number }> = ({ node, offset }) => {
  const navigate = useNavigate()
  const locked = node.status === 'LOCKED'
  const Icon = NODE_ICONS[node.type] ?? Star
  const go = () => {
    if (!locked) navigate(`/learning-path/lesson/${node.id}`)
  }
  return (
    <li className="flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {node.status === 'CURRENT' && (
        <span className="mb-2 animate-bounce rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold text-[#B52A2A] shadow-xs motion-reduce:animate-none">
          Bắt đầu
        </span>
      )}
      <button
        type="button"
        disabled={locked}
        onClick={go}
        aria-current={node.status === 'CURRENT' ? 'step' : undefined}
        aria-label={`${node.title}${locked ? ' (chưa mở khóa)' : ''}`}
        className={`grid h-16 w-16 place-items-center rounded-full transition active:translate-y-0.5 ${NODE_STYLES[node.status]}`}
      >
        {node.status === 'DONE' ? <Check className="h-7 w-7" /> : locked ? <Lock className="h-6 w-6" /> : <Icon className="h-7 w-7" />}
      </button>
      <span className={`mt-2.5 max-w-[150px] text-center text-xs font-semibold leading-tight ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
        {node.title}
      </span>
      {node.wrongAnswers > 0 && node.status !== 'DONE' && (
        <span className="mt-0.5 text-[10px] font-medium text-rose-600">Đã sai {node.wrongAnswers} câu, xem lại nhé</span>
      )}
    </li>
  )
}

const UnitBlock: React.FC<{ unit: RoadmapUnit }> = ({ unit }) => {
  const locked = unit.status === 'LOCKED'
  const percent = unit.total ? Math.round((unit.completed / unit.total) * 100) : 0
  return (
    <section aria-label={`Đơn vị ${unit.number}: ${unit.title}`}>
      <header className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${locked ? 'bg-slate-100 text-slate-500' : unit.status === 'DONE' ? 'bg-emerald-600 text-white' : 'bg-[#B52A2A] text-white'}`}>
        <span className="text-3xl leading-none" aria-hidden="true">{unit.icon ?? '📘'}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold opacity-80">Đơn vị {unit.number}{unit.titleZh ? ` · ${unit.titleZh}` : ''}</span>
          <span className="block truncate text-base font-bold">{unit.title}</span>
        </span>
        <span className="shrink-0 text-right text-xs font-semibold">
          {unit.completed}/{unit.total}
          <span className="mt-1 block h-1.5 w-16 overflow-hidden rounded-full bg-black/15">
            <span className="block h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
          </span>
        </span>
      </header>
      <ol className="flex flex-col items-center gap-6 py-7">
        {unit.nodes.map((node, index) => <PathNode key={node.id} node={node} offset={SWING[index % SWING.length]} />)}
      </ol>
    </section>
  )
}

/** Today's work and the learner's path on one level, one node open at a time. */
export const RoadmapView: React.FC<{
  plan: DailyPlan
  roadmap: Roadmap
  onSelectLevel: (level: number) => void
}> = ({ plan, roadmap, onSelectLevel }) => {
  const [showAllUnits, setShowAllUnits] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const reviews = plan.items.filter((item) => item.type !== 'LESSON')
  // The path comes first; reviews have their own list below.
  const next = plan.items.find((item) => item.type === 'LESSON') ?? plan.items[0]
  const learnerLevel = roadmap.learnerLevel

  const { done, open } = useMemo(() => ({
    done: roadmap.units.filter((unit) => unit.status === 'DONE'),
    open: roadmap.units.filter((unit) => unit.status !== 'DONE'),
  }), [roadmap.units])
  const visible = showAllUnits ? open : open.slice(0, 1 + UPCOMING_UNITS_SHOWN)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-800">Lộ trình của bạn</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{paceMessage(plan)}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          <Clock3 className="h-3.5 w-3.5" />
          Hôm nay khoảng {plan.minutesPlanned} / {plan.minutesBudget} phút
        </span>
      </div>

      <nav aria-label="Chọn cấp" className="mt-4 flex flex-wrap gap-2">
        {roadmap.levels.map((level) => {
          const locked = level.status === 'LOCKED'
          const active = level.level === roadmap.shownLevel
          return (
            <button
              key={level.level}
              type="button"
              disabled={locked}
              onClick={() => onSelectLevel(level.level)}
              aria-current={active ? 'page' : undefined}
              title={locked ? 'Hoàn thành cấp trước hoặc vượt qua bài kiểm tra để mở khóa' : `${level.completed}/${level.total} bài`}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                active ? 'border-[#B52A2A] bg-red-50 text-[#B52A2A]' : locked ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {locked && <Lock className="h-3 w-3" />}
              {level.status === 'DONE' && <Check className="h-3 w-3 text-emerald-600" />}
              {level.label}
            </button>
          )
        })}
      </nav>

      {next && (
        <Link to={next.link} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#B52A2A] px-5 py-3.5 text-white transition hover:bg-[#9e2424]">
          <span className="min-w-0">
            <span className="block text-xs font-medium text-white/80">Học tiếp</span>
            <span className="block truncate text-sm font-bold">{next.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>
      )}

      {reviews.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ôn tập hôm nay</h3>
          {reviews.map((item) => {
            const Icon = REVIEW_ICONS[item.type]
            return (
              <Link key={item.title} to={item.link} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3 transition hover:bg-amber-50">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-amber-700"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{item.detail}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-400">{item.minutes} phút</span>
              </Link>
            )
          })}
        </div>
      )}

      {plan.openMistakes > 0 && !reviews.some((item) => item.type === 'REVIEW_MISTAKES') && (
        <Link to="/learning-path/mistakes" className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-sm transition hover:bg-amber-50">
          <History className="h-5 w-5 shrink-0 text-amber-700" />
          <span className="min-w-0 flex-1 font-semibold text-slate-800">Còn {plan.openMistakes} câu từng sai cần ôn</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
        </Link>
      )}

      {roadmap.shownLevel === learnerLevel && learnerLevel < 7 && (
        <Link to={`/learning-path/level-test/${learnerLevel}`} className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm transition hover:border-rose-300 hover:bg-rose-50/40">
          <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-slate-800">Đã biết cấp này? Kiểm tra vượt cấp</span>
            <span className="block text-xs text-slate-500">Đúng từ 80% sẽ mở ngay cấp tiếp theo.</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
        </Link>
      )}

      <div className="mt-6 space-y-2">
        {done.length > 0 && (
          <button type="button" onClick={() => setShowDone((value) => !value)} className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
            <Check className="h-3.5 w-3.5" />
            {showDone ? 'Ẩn' : 'Xem lại'} {done.length} đơn vị đã xong
          </button>
        )}
        {showDone && done.map((unit) => <UnitBlock key={unit.id} unit={unit} />)}
        {visible.map((unit) => <UnitBlock key={unit.id} unit={unit} />)}
        {!showAllUnits && open.length > visible.length && (
          <button type="button" onClick={() => setShowAllUnits(true)} className="w-full rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-semibold text-slate-500 hover:border-rose-200 hover:text-[#B52A2A]">
            Xem thêm {open.length - visible.length} đơn vị
          </button>
        )}
        {roadmap.units.length === 0 && <p className="text-sm text-slate-500">Chưa có bài học nào cho cấp này.</p>}
      </div>
    </section>
  )
}
