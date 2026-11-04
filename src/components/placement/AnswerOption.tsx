import { cn } from '@/lib/utils'

interface AnswerOptionProps {
  optionKey: string
  text: string
  /** Render the text in Noto Serif SC, larger. */
  hanzi?: boolean
  selected: boolean
  onSelect: () => void
}

export function AnswerOption({ optionKey, text, hanzi, selected, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex min-h-[60px] w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-shadow duration-150',
        selected ? 'bg-rose-50 ring-2 ring-primary' : 'bg-white ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300',
      )}
    >
      <span
        className={cn(
          'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-sm font-bold',
          selected ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600',
        )}
      >
        {optionKey}
      </span>
      <span className={cn(hanzi ? 'font-chinese text-xl font-bold tracking-wide' : 'text-base font-medium', 'text-slate-800')}>
        {text}
      </span>
    </button>
  )
}
