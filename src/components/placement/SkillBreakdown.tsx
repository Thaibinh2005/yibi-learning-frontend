import { cn } from '@/lib/utils'
import type { SkillScore } from '@/types/placement'

interface SkillBreakdownProps {
  /** Skills with enough answers to score. */
  scores: SkillScore[]
  /** Every skill; those missing from `scores` show as "chưa đủ". */
  allSkills: { skill: string; label: string }[]
}

export function SkillBreakdown({ scores, allSkills }: SkillBreakdownProps) {
  return (
    <ul className="flex flex-col gap-3.5">
      {allSkills.map(({ skill, label }) => {
        const score = scores.find((s) => s.skill === skill)
        return (
          <li key={skill} className={cn('grid grid-cols-[96px_1fr_64px] items-center gap-3 sm:grid-cols-[120px_1fr_64px] sm:gap-3.5', !score && 'text-slate-500')}>
            <span className="font-semibold">{label}</span>
            <div
              className={cn('h-2 overflow-hidden rounded-full', score ? 'bg-slate-100' : 'border border-dashed border-slate-300')}
              role={score ? 'progressbar' : undefined}
              aria-valuemin={score ? 0 : undefined}
              aria-valuemax={score ? 9 : undefined}
              aria-valuenow={score?.level}
              aria-label={score ? `${label}: HSK ${score.level}` : undefined}
            >
              {score && <div className="h-full rounded-full bg-primary" style={{ width: `${(score.level / 9) * 100}%` }} />}
            </div>
            <span className={cn('text-right tabular-nums', score ? 'font-bold text-slate-800' : 'text-xs')}>
              {score ? `HSK ${score.level}` : 'chưa đủ'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
