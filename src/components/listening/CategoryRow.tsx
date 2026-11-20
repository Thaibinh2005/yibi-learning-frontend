import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * A titled row of cards that scrolls sideways (snap on touch, arrow buttons on wider screens), with "Xem tất cả"
 * when the section has more than it shows.
 */
export function CategoryRow({ title, description, icon: Icon, moreHref, moreLabel = 'Xem tất cả', count, children }: {
  title: string
  description?: string
  icon?: React.ElementType
  moreHref?: string
  moreLabel?: string
  count?: number
  children: React.ReactNode
}) {
  const scroller = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    measure()
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure, children])

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.85), behavior: 'smooth' })
  }

  const arrow = 'grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-white'

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            {Icon && <Icon className="h-5 w-5 text-brand" />}
            <span className="truncate">{title}</span>
            {count != null && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-500">{count}</span>}
          </h2>
          {description && <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {moreHref && (
            <Link to={moreHref} className="rounded-xl px-2 py-1.5 text-sm font-bold text-brand hover:bg-rose-50">
              {moreLabel} →
            </Link>
          )}
          <div className="hidden gap-1.5 md:flex">
            <button type="button" onClick={() => scrollBy(-1)} disabled={edges.start} aria-label={`Cuộn ${title} sang trái`} className={arrow}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} disabled={edges.end} aria-label={`Cuộn ${title} sang phải`} className={arrow}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <ul
        ref={scroller}
        onScroll={measure}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-3 [scrollbar-width:thin]"
      >
        {children}
      </ul>
    </section>
  )
}

/** One card slot of a {@link CategoryRow}. */
export function RowItem({ children }: { children: React.ReactNode }) {
  return <li className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-[300px]">{children}</li>
}
