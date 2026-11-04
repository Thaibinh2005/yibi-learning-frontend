import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StartModeCardProps {
  icon: ReactNode
  title: string
  description: string
  selected: boolean
  /** Shows the "Phù hợp với bạn" badge. */
  recommended?: boolean
  onSelect: () => void
}

export function StartModeCard({ icon, title, description, selected, recommended, onSelect }: StartModeCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'relative flex w-full flex-col gap-2.5 rounded-2xl p-5 text-left transition-shadow',
        selected ? 'bg-rose-50 ring-2 ring-primary' : 'bg-white ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300',
      )}
    >
      {recommended && (
        <span className="absolute right-3.5 top-3.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Phù hợp với bạn
        </span>
      )}
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-2xl',
          selected ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600',
        )}
      >
        {icon}
      </span>
      <b className="text-base font-bold text-slate-800">{title}</b>
      <p className="text-sm text-slate-500">{description}</p>
    </button>
  )
}
