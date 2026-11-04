import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface NextStep {
  icon: ReactNode
  title: string
  description: string
  /** No link means the step is shown but not available. */
  to?: string
}

export function NextStepList({ steps }: { steps: NextStep[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {steps.map((step) => {
        const body = (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">{step.icon}</span>
            <span className="min-w-0 flex-1">
              <b className="block font-semibold text-slate-800">{step.title}</b>
              <span className="block text-xs text-slate-500">{step.description}</span>
            </span>
            {step.to && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />}
          </>
        )
        const base = 'flex items-center gap-3.5 rounded-2xl bg-slate-100 px-4 py-3.5'
        return (
          <li key={step.title}>
            {step.to ? (
              <Link to={step.to} className={cn(base, 'transition-colors hover:bg-slate-200/70')}>
                {body}
              </Link>
            ) : (
              <div className={cn(base, 'opacity-60')}>{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
