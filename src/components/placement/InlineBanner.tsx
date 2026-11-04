import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, MicOff, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'info' | 'warn' | 'danger' | 'ok'

interface InlineBannerProps {
  variant: Variant
  title: string
  children?: ReactNode
  /** Use the microphone icon for permission problems. */
  mic?: boolean
  className?: string
}

const STYLES: Record<Variant, string> = {
  info: 'bg-blue-50 text-blue-900',
  warn: 'bg-amber-50 text-amber-900',
  danger: 'bg-red-50 text-red-800',
  ok: 'bg-emerald-50 text-emerald-800',
}

export function InlineBanner({ variant, title, children, mic, className }: InlineBannerProps) {
  const Icon = mic ? MicOff : { info: Info, warn: TriangleAlert, danger: AlertCircle, ok: CheckCircle2 }[variant]
  return (
    <div
      role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm leading-5', STYLES[variant], className)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-0.5">{children}</div>}
      </div>
    </div>
  )
}
