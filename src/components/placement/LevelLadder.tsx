import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface LevelLadderProps {
  /** The estimate on the HSK scale. */
  theta: number
  /** Half the width of the dashed band. */
  standardError: number
}

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** Percent along the nine-segment rail: level n is centred at (n - 0.5) / 9. */
const position = (value: number) => Math.max(0, Math.min(100, ((value - 0.5) / 9) * 100))

export function LevelLadder({ theta, standardError }: LevelLadderProps) {
  const level = Math.max(1, Math.min(9, Math.round(theta)))
  const low = position(theta - standardError)
  const high = position(theta + standardError)
  // The pin starts at HSK 1 and slides to the estimate once mounted.
  const [pin, setPin] = useState(position(1))
  useEffect(() => {
    const frame = requestAnimationFrame(() => setPin(position(theta)))
    return () => cancelAnimationFrame(frame)
  }, [theta])

  return (
    <div className="relative pb-2 pt-12" role="img" aria-label={`Thang HSK 1 đến 9, bạn ở khoảng HSK ${level}`}>
      <div
        className="absolute top-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-out motion-reduce:transition-none"
        style={{ left: `${pin}%` }}
      >
        <b className="whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">Bạn ở đây</b>
        <i className="h-[22px] w-0.5 bg-primary" />
      </div>
      <div
        className="absolute top-10 h-6 rounded-lg border border-dashed border-primary/50 bg-primary/15"
        style={{ left: `${low}%`, width: `${Math.max(2, high - low)}%` }}
        aria-hidden="true"
      />
      <div className="grid grid-cols-9 gap-1">
        {LEVELS.map((n) => (
          <span key={n} className={cn('h-3 rounded-md', n === level ? 'bg-primary' : n < level ? 'bg-rose-200' : 'bg-slate-100')} />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-9 gap-1 text-center text-xs font-semibold text-slate-500">
        {LEVELS.map((n) => (
          <span key={n} className={cn(n === level && 'text-primary')}>
            {n}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Vùng nét đứt là khoảng sai số: bài càng dài và đủ kỹ năng thì vùng này càng hẹp.
      </p>
    </div>
  )
}
