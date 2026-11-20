import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert } from 'lucide-react'
import { Toaster } from 'sonner'

/** The icon in a soft round badge, like the status icons on the app's cards. */
function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`grid h-9 w-9 place-items-center rounded-full ${className}`}>{children}</span>
}

/**
 * App-wide notifications (sonner) drawn like the app's own cards: white, rounded-2xl, soft border and shadow, the
 * status shown by a tinted icon badge and a thin coloured edge.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      duration={5000}
      gap={10}
      offset={{ top: 76, right: 16 }}
      mobileOffset={{ top: 12, left: 12, right: 12 }}
      icons={{
        success: <Badge className="bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></Badge>,
        error: <Badge className="bg-red-50 text-red-600"><AlertCircle className="h-5 w-5" /></Badge>,
        warning: <Badge className="bg-amber-50 text-amber-600"><TriangleAlert className="h-5 w-5" /></Badge>,
        info: <Badge className="bg-sky-50 text-sky-600"><Info className="h-5 w-5" /></Badge>,
        loading: <Badge className="bg-sky-50 text-sky-600"><Loader2 className="h-5 w-5 animate-spin" /></Badge>,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group relative flex w-[var(--width)] items-start gap-3 rounded-2xl border border-slate-200 border-l-4 bg-white py-3.5 pl-3.5 pr-10 font-sans shadow-xl shadow-slate-900/10',
          icon: 'shrink-0',
          content: 'min-w-0 flex-1 pt-0.5',
          title: 'text-sm font-bold leading-snug text-slate-900',
          description: 'mt-0.5 text-sm leading-snug text-slate-500',
          closeButton:
            'absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 [&>svg]:h-3.5 [&>svg]:w-3.5',
          actionButton: 'rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white hover:brightness-95',
          cancelButton: 'rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100',
          success: 'border-l-emerald-500',
          error: 'border-l-red-500',
          warning: 'border-l-amber-500',
          info: 'border-l-sky-500',
          loading: 'border-l-sky-500',
          default: 'border-l-slate-300',
        },
      }}
    />
  )
}
