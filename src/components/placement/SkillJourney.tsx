import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SkillProgress } from '@/types/placement'

interface SkillJourneyProps {
  skills: SkillProgress[]
  current: string
}

/** The skills the test measures: done, the one on screen, and those still to come. */
export function SkillJourney({ skills, current }: SkillJourneyProps) {
  return (
    <ul className="flex flex-col" aria-label="Hành trình của bạn">
      {skills.map((item) => {
        const now = item.skill === current
        const done = !now && item.answered >= 2
        return (
          <li key={item.skill} className="flex items-center gap-3 py-2">
            <span
              className={cn(
                'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full',
                now && 'bg-primary text-primary-foreground ring-4 ring-rose-50',
                done && 'bg-emerald-700 text-white',
                !now && !done && 'bg-slate-100',
              )}
              aria-hidden="true"
            >
              {done && <Check className="h-3 w-3" />}
            </span>
            <span
              className={cn(
                'flex-1 text-sm',
                now && 'font-semibold text-primary',
                done && 'font-semibold text-slate-800',
                !now && !done && 'text-slate-500',
              )}
            >
              {item.skill === 'speaking' ? 'Đọc to' : item.label}
            </span>
            <span className="text-xs text-slate-500">
              {now ? 'đang đo' : done ? `${item.answered} câu` : item.skill === 'speaking' ? 'có thể bỏ qua' : ''}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
