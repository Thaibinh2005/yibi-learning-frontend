import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LevelPickCardProps {
  tag: string
  sub: string
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}

export function LevelPickCard({ tag, sub, title, description, selected, onSelect }: LevelPickCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3.5 rounded-2xl bg-white px-4 py-4 text-left transition-shadow',
        selected
          ? 'bg-rose-50 ring-2 ring-primary'
          : 'ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300',
      )}
    >
      <span
        className={cn(
          'flex h-[52px] w-[52px] shrink-0 flex-col items-center justify-center rounded-2xl text-sm font-bold leading-tight',
          selected ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600',
        )}
      >
        {tag}
        <small className={cn('text-xs font-semibold', selected ? 'text-white/80' : 'text-slate-500')}>{sub}</small>
      </span>
      <span className="min-w-0 flex-1">
        <b className="block font-semibold text-slate-800">{title}</b>
        <span className="mt-0.5 block text-sm text-slate-500">{description}</span>
      </span>
      <span
        className={cn(
          'flex h-[22px] w-[22px] shrink-0 items-center justify-center self-center rounded-full',
          selected ? 'bg-primary text-primary-foreground' : 'ring-2 ring-slate-200',
        )}
        aria-hidden="true"
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  )
}
