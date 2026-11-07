import React from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * A full-screen study page without menus: a way out and the progress on top, the work in the middle,
 * the next action always in reach at the bottom.
 */
export const LessonFrame: React.FC<{
  label?: string
  /** 0 to 1; left out when there is nothing to count. */
  progress?: number
  counter?: string
  exitTo?: string
  /** Set while leaving would lose answers. */
  confirmExit?: boolean
  footer?: React.ReactNode
  footerClassName?: string
  children: React.ReactNode
}> = ({ label, progress, counter, exitTo = '/learning-path', confirmExit, footer, footerClassName = 'border-slate-200 bg-white', children }) => {
  const navigate = useNavigate()
  const exit = () => {
    if (!confirmExit || window.confirm('Thoát bài học? Tiến độ của lượt này sẽ không được lưu.')) navigate(exitTo)
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
          <button type="button" onClick={exit} aria-label="Thoát" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-6 w-6" />
          </button>
          {progress !== undefined && (
            <span className="h-4 flex-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ bài học">
              <span className="relative block h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out" style={{ width: `${Math.max(progress * 100, 4)}%` }}>
                <span className="absolute inset-x-2 top-1 block h-1 rounded-full bg-white/35" />
              </span>
            </span>
          )}
          {counter && <span className="shrink-0 text-sm font-bold tabular-nums text-slate-500">{counter}</span>}
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8 pt-2 sm:pt-6">
        {label && <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>}
        {children}
      </main>

      {footer && (
        <footer className={`sticky bottom-0 z-20 border-t-2 ${footerClassName}`}>
          <div className="mx-auto w-full max-w-2xl px-4 py-4">{footer}</div>
        </footer>
      )}
    </div>
  )
}
