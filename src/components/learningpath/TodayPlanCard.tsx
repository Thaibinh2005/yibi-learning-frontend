import React from 'react'
import { BookOpen, CalendarCheck, Clock3, Layers, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DailyPlan, DailyPlanItem } from '@/api/learningPathApi'

const ICONS: Record<DailyPlanItem['type'], React.ElementType> = {
  REVIEW_CARDS: Layers,
  PRACTICE: Target,
  LESSON: BookOpen,
}

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

/** Today's work, largest priority first; refreshed from the learner's latest results on every visit. */
export const TodayPlanCard: React.FC<{ plan: DailyPlan }> = ({ plan }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 font-bold text-slate-800">
        <CalendarCheck className="h-5 w-5 text-[#B52A2A]" />
        Kế hoạch hôm nay
      </h2>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        <Clock3 className="h-3.5 w-3.5" />
        Khoảng {plan.minutesPlanned} / {plan.minutesBudget} phút
      </span>
    </div>

    {plan.items.length > 0 ? (
      <ol className="mt-4 space-y-2.5">
        {plan.items.map((item) => {
          const Icon = ICONS[item.type]
          return (
            <li key={`${item.type}-${item.lessonId ?? item.title}`}>
              <Link
                to={item.link}
                className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 transition hover:border-red-200 hover:bg-red-50/30"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-50 text-[#B52A2A]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{item.detail}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-400">{item.minutes} phút</span>
              </Link>
            </li>
          )
        })}
      </ol>
    ) : (
      <p className="mt-3 text-sm text-slate-500">Hôm nay không còn việc nào trong kế hoạch.</p>
    )}

    <p className="mt-4 text-xs leading-relaxed text-slate-500">{paceMessage(plan)}</p>
  </section>
)
