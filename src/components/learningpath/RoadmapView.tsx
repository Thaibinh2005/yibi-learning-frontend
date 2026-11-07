import React, { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Ear,
  History,
  Layers,
  Lock,
  MessagesSquare,
  Newspaper,
  Play,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { starsOf } from '@/components/learningpath/PathQuizRunner'
import type { DailyPlan, DailyPlanItem, Roadmap, RoadmapNode, RoadmapUnit } from '@/api/learningPathApi'

const REVIEW_STYLES: Record<DailyPlanItem['type'], { icon: React.ElementType; tint: string }> = {
  REVIEW_CARDS: { icon: Layers, tint: 'bg-emerald-100 text-emerald-700' },
  REVIEW_MISTAKES: { icon: History, tint: 'bg-amber-100 text-amber-700' },
  PRACTICE: { icon: Target, tint: 'bg-sky-100 text-sky-700' },
  LESSON: { icon: BookOpen, tint: 'bg-rose-100 text-brand' },
}

const NODE_ICONS: Record<string, React.ElementType> = {
  LESSON: BookOpen,
  DIALOGUE: MessagesSquare,
  READING: Newspaper,
  LISTENING: Ear,
  CHECKPOINT: Trophy,
}

/** Each unit has its own colour, so the long path has landmarks. */
const UNIT_THEMES = [
  { banner: 'bg-[#C8322B]', node: 'bg-[#C8322B] shadow-[0_6px_0_#8C1F1A]', ring: 'ring-rose-200', accent: 'text-[#C8322B] border-rose-200 shadow-[0_6px_0_#FECDD3]' },
  { banner: 'bg-teal-700', node: 'bg-teal-700 shadow-[0_6px_0_#134E4A]', ring: 'ring-teal-200', accent: 'text-teal-700 border-teal-200 shadow-[0_6px_0_#99F6E4]' },
  { banner: 'bg-indigo-600', node: 'bg-indigo-600 shadow-[0_6px_0_#3730A3]', ring: 'ring-indigo-200', accent: 'text-indigo-600 border-indigo-200 shadow-[0_6px_0_#C7D2FE]' },
  { banner: 'bg-amber-700', node: 'bg-amber-700 shadow-[0_6px_0_#78350F]', ring: 'ring-amber-200', accent: 'text-amber-700 border-amber-200 shadow-[0_6px_0_#FDE68A]' },
]
type UnitTheme = (typeof UNIT_THEMES)[number]

/** How many units after the current one show before "Xem thêm"; HSK 7–9 has hundreds. */
const UPCOMING_UNITS_SHOWN = 3
/** The sideways swing of the path, as offsets repeating down each unit. */
const SWING = [0, 48, 76, 48, 0, -48, -76, -48]

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

const PathNode: React.FC<{ node: RoadmapNode; offset: number; theme: UnitTheme }> = ({ node, offset, theme }) => {
  const navigate = useNavigate()
  const locked = node.status === 'LOCKED'
  const current = node.status === 'CURRENT'
  const Icon = NODE_ICONS[node.type] ?? Star
  const go = () => {
    if (!locked) navigate(`/learning-path/lesson/${node.id}`)
  }
  const style = {
    DONE: 'bg-amber-400 text-amber-950 shadow-[0_6px_0_#B45309] hover:brightness-105',
    CURRENT: `${theme.node} text-white ring-8 ${theme.ring} hover:brightness-110`,
    OPEN: `border-4 bg-white hover:bg-slate-50 ${theme.accent}`,
    LOCKED: 'bg-slate-200 text-slate-400 shadow-[0_6px_0_#D6D3D1] cursor-not-allowed',
  }[node.status]
  return (
    <li className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {current && (
        <span className="absolute -top-10 z-10 animate-bounce whitespace-nowrap rounded-xl border-2 border-slate-200 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-brand shadow-xs motion-reduce:animate-none">
          Bắt đầu
        </span>
      )}
      <button
        type="button"
        disabled={locked}
        onClick={go}
        aria-current={current ? 'step' : undefined}
        aria-label={`${node.title}${locked ? ' (chưa mở khóa)' : ''}`}
        className={`grid h-[72px] w-[72px] place-items-center rounded-full transition-[transform,box-shadow,filter] duration-100 ${locked ? '' : 'active:translate-y-1.5 active:shadow-none'} ${style}`}
      >
        {node.status === 'DONE' ? <Check className="h-8 w-8" strokeWidth={3} /> : locked ? <Lock className="h-6 w-6" /> : current ? <Play className="ml-1 h-8 w-8 fill-current" /> : <Icon className="h-7 w-7" />}
      </button>
      <span className={`mt-3 max-w-[140px] text-center text-xs font-bold leading-tight ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
        {node.title}
      </span>
      {node.status === 'DONE' && node.bestScore > 0 && (
        <span className="mt-1 flex gap-0.5" role="img" aria-label={`${starsOf(node.bestScore)} trên 3 sao`}>
          {[1, 2, 3].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= starsOf(node.bestScore) ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-200'}`} />)}
        </span>
      )}
      {node.wrongAnswers > 0 && node.status !== 'DONE' && (
        <span className="mt-1 text-[11px] font-semibold text-rose-600">Đã sai {node.wrongAnswers} câu</span>
      )}
    </li>
  )
}

const UnitBlock: React.FC<{ unit: RoadmapUnit }> = ({ unit }) => {
  const locked = unit.status === 'LOCKED'
  const theme = UNIT_THEMES[(unit.number - 1) % UNIT_THEMES.length]
  const percent = unit.total ? Math.round((unit.completed / unit.total) * 100) : 0
  return (
    <section aria-label={`Đơn vị ${unit.number}: ${unit.title}`}>
      <header className={`flex items-center gap-4 rounded-3xl px-5 py-4 ${locked ? 'bg-slate-200/70 text-slate-500' : `${theme.banner} text-white`}`}>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl leading-none ${locked ? 'bg-white/60 grayscale' : 'bg-white/20'}`} aria-hidden="true">{unit.icon ?? '📘'}</span>
        <span className="min-w-0 flex-1">
          <span className="font-chinese block truncate text-xs font-semibold opacity-85">Đơn vị {unit.number}{unit.titleZh ? ` · ${unit.titleZh}` : ''}</span>
          <span className="block truncate text-lg font-extrabold leading-snug">{unit.title}</span>
        </span>
        <span className="shrink-0 text-right text-xs font-bold tabular-nums">
          {unit.completed}/{unit.total}
          <span className="mt-1 block h-2 w-14 overflow-hidden rounded-full bg-black/15 sm:w-20">
            <span className={`block h-full rounded-full ${locked ? 'bg-slate-400' : 'bg-white'}`} style={{ width: `${percent}%` }} />
          </span>
        </span>
      </header>
      <ol className="flex flex-col items-center gap-9 pb-10 pt-16">
        {unit.nodes.map((node, index) => <PathNode key={node.id} node={node} theme={theme} offset={SWING[index % SWING.length]} />)}
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
  const shown = roadmap.levels.find((level) => level.level === roadmap.shownLevel)

  const { done, open } = useMemo(() => ({
    done: roadmap.units.filter((unit) => unit.status === 'DONE'),
    open: roadmap.units.filter((unit) => unit.status !== 'DONE'),
  }), [roadmap.units])
  const visible = showAllUnits ? open : open.slice(0, 1 + UPCOMING_UNITS_SHOWN)

  return (
    <section className="space-y-5">
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{shown?.label ?? 'Lộ trình'}</h1>
          {shown && <span className="text-sm font-bold tabular-nums text-slate-500">{shown.completed}/{shown.total} bài</span>}
        </div>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">{paceMessage(plan)}</p>
      </header>

      <nav aria-label="Chọn cấp" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
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
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition ${
                active ? 'border-brand bg-brand text-white' : locked ? 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {locked && <Lock className="h-3.5 w-3.5" />}
              {level.status === 'DONE' && <Check className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-emerald-600'}`} strokeWidth={3} />}
              {level.label}
            </button>
          )
        })}
      </nav>

      {next && (
        <Link to={next.link} className="btn-chunky btn-brand w-full justify-between rounded-3xl px-6 py-4">
          <span className="min-w-0 text-left">
            <span className="block text-xs font-semibold text-white/85">Học tiếp · khoảng {next.minutes} phút</span>
            <span className="block truncate text-lg font-extrabold">{next.title}</span>
          </span>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20"><ArrowRight className="h-5 w-5" /></span>
        </Link>
      )}

      {reviews.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-slate-800">Ôn tập hôm nay</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock3 className="h-3.5 w-3.5" />{plan.minutesPlanned}/{plan.minutesBudget} phút</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {reviews.map((item) => {
              const { icon: Icon, tint } = REVIEW_STYLES[item.type]
              return (
                <Link key={item.title} to={item.link} title={item.detail} className="card-soft flex items-center gap-3 !rounded-2xl p-3 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-snug text-slate-800">{item.title}</span>
                    <span className="block text-xs font-medium text-slate-500">{item.minutes} phút</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {plan.openMistakes > 0 && !reviews.some((item) => item.type === 'REVIEW_MISTAKES') && (
        <Link to="/learning-path/mistakes" className="card-soft flex items-center gap-3 !rounded-2xl p-3 text-sm font-bold text-slate-800 transition hover:shadow-md">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><History className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">Còn {plan.openMistakes} câu từng sai cần ôn</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
        </Link>
      )}

      {roadmap.shownLevel === learnerLevel && learnerLevel < 7 && (
        <Link to={`/learning-path/level-test/${learnerLevel}`} className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand">
          <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="min-w-0 flex-1">Đã biết cấp này? Kiểm tra vượt cấp, đúng từ 80% sẽ mở cấp tiếp theo</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      )}

      <div className="space-y-2 overflow-x-hidden pt-2">
        {done.length > 0 && (
          <button type="button" onClick={() => setShowDone((value) => !value)} className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50">
            <Check className="h-4 w-4" strokeWidth={3} />
            {showDone ? 'Ẩn' : 'Xem lại'} {done.length} đơn vị đã xong
          </button>
        )}
        {showDone && done.map((unit) => <UnitBlock key={unit.id} unit={unit} />)}
        {visible.map((unit) => <UnitBlock key={unit.id} unit={unit} />)}
        {!showAllUnits && open.length > visible.length && (
          <button type="button" onClick={() => setShowAllUnits(true)} className="btn-chunky btn-paper w-full">
            Xem thêm {open.length - visible.length} đơn vị
          </button>
        )}
        {roadmap.units.length === 0 && <p className="text-sm text-slate-500">Chưa có bài học nào cho cấp này.</p>}
      </div>
    </section>
  )
}
