import type { Tone } from '@/data/pinyin'

/** One hue per tone, used only on tone marks and contours; the mark and number always sit beside it. */
export const TONE_STYLE: Record<Tone, { text: string; tint: string; line: string; fill: string }> = {
  1: { text: 'text-cyan-700', tint: 'bg-cyan-50 border-cyan-200', line: 'stroke-cyan-700', fill: 'bg-cyan-700' },
  2: { text: 'text-amber-700', tint: 'bg-amber-50 border-amber-200', line: 'stroke-amber-700', fill: 'bg-amber-700' },
  3: { text: 'text-emerald-700', tint: 'bg-emerald-50 border-emerald-200', line: 'stroke-emerald-700', fill: 'bg-emerald-700' },
  4: { text: 'text-brand', tint: 'bg-rose-50 border-rose-200', line: 'stroke-brand', fill: 'bg-brand' },
  5: { text: 'text-slate-600', tint: 'bg-slate-100 border-slate-200', line: 'stroke-slate-500', fill: 'bg-slate-500' },
}
