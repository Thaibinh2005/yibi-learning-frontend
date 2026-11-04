import { cn } from '@/lib/utils'

interface TestProgressProps {
  answered: number
  minimum: number
  maximum: number
}

/** One slot per possible question: answered, the current one, still to come, and the optional ones past the minimum. */
export function TestProgress({ answered, minimum, maximum }: TestProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-label="Tiến độ bài test"
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-valuenow={answered}
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: maximum }, (_, index) => (
          <i
            key={index}
            className={cn(
              'h-2 max-w-7 flex-1 rounded-full not-italic transition-colors duration-[400ms] motion-reduce:transition-none',
              index < answered && 'bg-primary',
              index === answered && 'bg-white ring-2 ring-inset ring-primary',
              index > answered && index < minimum && 'bg-slate-100',
              index > answered && index >= minimum && 'border border-dashed border-slate-300 bg-transparent',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-slate-500">
        Bài dài từ {minimum} đến {maximum} câu; có thể kết thúc sớm khi kết quả đã rõ.
      </span>
    </div>
  )
}
