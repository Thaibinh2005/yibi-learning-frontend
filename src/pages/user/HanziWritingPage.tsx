import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { INITIALS } from '@/data/pinyin'
import { speakChinese } from '@/lib/speech'
import { RADICALS } from '@/data/radicals'
import { ToneChart } from '@/components/hanzi/ToneChart'
import { SandhiRules } from '@/components/hanzi/SandhiRules'
import { FinalsPanel, InitialsPanel } from '@/components/hanzi/SoundGroups'
import { LookupBar } from '@/components/hanzi/LookupBar'
import { LookupResults } from '@/components/hanzi/LookupResults'
import { RadicalGrid } from '@/components/hanzi/RadicalGrid'
import { SyllableComposer } from '@/components/hanzi/SyllableComposer'
import { WritePanel } from '@/components/hanzi/WritePanel'
import { WritingDesk } from '@/components/hanzi/WritingDesk'
import type { DeskTarget } from '@/components/hanzi/WritingDesk'
import { useLearnedRadicals } from '@/components/hanzi/useLearnedRadicals'

const TABS = [
  { key: 'radicals', label: 'Bộ thủ', count: RADICALS.length },
  { key: 'tones', label: 'Thanh điệu' },
  { key: 'sandhi', label: 'Biến điệu' },
  { key: 'initials', label: 'Thanh mẫu', count: INITIALS.length },
  { key: 'finals', label: 'Vận mẫu' },
  { key: 'compose', label: 'Ghép âm' },
  { key: 'write', label: 'Luyện viết' },
] as const

type TabKey = (typeof TABS)[number]['key']
const isTab = (value: string | null): value is TabKey => TABS.some((tab) => tab.key === value)

const WIDE = '(min-width: 1024px)'
/** True on screens wide enough for the desk to sit beside the content; below that the desk is a sheet. */
const useIsWide = () => useSyncExternalStore(
  (notify) => { const query = window.matchMedia(WIDE); query.addEventListener('change', notify); return () => query.removeEventListener('change', notify) },
  () => window.matchMedia(WIDE).matches,
  () => true,
)

export const HanziWritingPage: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const tab: TabKey = isTab(params.get('tab')) ? (params.get('tab') as TabKey) : 'radicals'
  const char = params.get('char')
  const query = params.get('q')
  const { learned, markLearned } = useLearnedRadicals()
  const isWide = useIsWide()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pinyin, setPinyin] = useState<string | undefined>()
  // What the learner picked decides whether it is a radical (never sent to the review queue), not the tab they are on now.
  const [kind, setKind] = useState<DeskTarget['kind']>(() => (tab === 'radicals' ? 'radical' : 'hanzi'))
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)

  const radical = kind === 'radical' && char ? RADICALS.find((r) => r.char === char || r.alt === char) : undefined
  const target: DeskTarget | null = char
    ? radical
      ? { char, kind: 'radical', pinyin: radical.pinyin, caption: `${radical.hanViet} · ${radical.meaning} · ${radical.strokes} nét`, alt: char === radical.char ? radical.alt : radical.char }
      : { char, kind: 'hanzi', pinyin }
    : null

  const update = useCallback((next: Record<string, string | null>) => {
    const merged = new URLSearchParams(params)
    Object.entries(next).forEach(([key, value]) => (value === null ? merged.delete(key) : merged.set(key, value)))
    setParams(merged, { replace: true })
  }, [params, setParams])

  const pick = useCallback((value: string, nextPinyin?: string, nextKind: DeskTarget['kind'] = 'hanzi', say: string = value) => {
    // Tapping a character says it; the browser's voice may be missing, which is not worth an error.
    speakChinese(say, () => undefined, () => undefined)
    setPinyin(nextPinyin)
    setKind(nextKind)
    update({ char: value })
    setSheetOpen(true)
  }, [update])
  const sheetShown = sheetOpen && !isWide

  useEffect(() => {
    if (!sheetShown) return undefined
    const opener = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSheetOpen(false); return }
      if (event.key !== 'Tab' || !dialog.current) return
      const items = dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])')
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [sheetShown])

  // Keeps the active tab in view in the scrolling tab strip, only when the tab changes.
  useEffect(() => {
    document.getElementById(`tab-${tab}`)?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [tab])

  const moveTab = (event: React.KeyboardEvent) => {
    const index = TABS.findIndex((t) => t.key === tab)
    const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 : null
    if (next === null) return
    event.preventDefault()
    const target = TABS[(next + TABS.length) % TABS.length].key
    update({ tab: target })
    requestAnimationFrame(() => document.getElementById(`tab-${target}`)?.focus())
  }

  const desk = (
    <WritingDesk
      target={target}
      onWritten={(written) => { if (written.kind === 'radical') markLearned(radical?.char ?? written.char); else setRefreshKey((n) => n + 1) }}
      onPickAlt={(alt) => update({ char: alt })}
    />
  )

  return (
    <div className="pb-24 md:pb-6">
      <header className="flex flex-wrap items-end gap-4 pb-4 pt-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Từ vựng · HSK 3.0</p>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">Viết chữ Hán</h1>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-slate-600">Học bộ thủ, âm tiết và bút thuận. Viết đúng từng nét, chữ sai sẽ quay lại ôn.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-2.5">
          <span className="text-2xl font-extrabold tabular-nums text-brand">{learned.size}</span>
          <span className="text-sm leading-snug text-slate-600"><b className="block text-slate-800">Bộ thủ đã học</b>trên {RADICALS.length} bộ</span>
        </div>
      </header>

      <div className="pb-4">
        <LookupBar key={query ?? ''} query={query} onSearch={(text) => update({ q: text })} onClear={() => update({ q: null })} />
      </div>

      <div role="tablist" aria-label="Nội dung viết chữ" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-3 [scrollbar-width:none]">
        {TABS.map((item) => (
          <button
            key={item.key}
            id={`tab-${item.key}`}
            role="tab"
            type="button"
            aria-selected={tab === item.key}
            aria-controls="hanzi-panel"
            tabIndex={tab === item.key ? 0 : -1}
            onClick={() => update({ tab: item.key, q: null })}
            onKeyDown={moveTab}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-2xl border-2 px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
              tab === item.key ? 'border-rose-200 bg-rose-50 text-brand' : 'border-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
            {'count' in item && <span className="rounded-full bg-white/80 px-1.5 text-xs font-extrabold tabular-nums text-slate-500">{item.count}</span>}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div id="hanzi-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="min-w-0">
          {query && <LookupResults query={query} activeChar={char} onPickChar={(hanzi, hanziPinyin, say) => pick(hanzi, hanziPinyin, 'hanzi', say)} />}
          {!query && tab === 'radicals' && <RadicalGrid selected={radical?.char ?? null} learned={learned} onSelect={(r) => pick(r.char, undefined, 'radical')} />}
          {!query && tab === 'tones' && <ToneChart onPickChar={(hanzi, hanziPinyin) => pick(hanzi, hanziPinyin)} />}
          {!query && tab === 'sandhi' && <SandhiRules />}
          {!query && tab === 'initials' && <InitialsPanel />}
          {!query && tab === 'finals' && <FinalsPanel />}
          {!query && tab === 'compose' && <SyllableComposer selected={char} onPickChar={(hanzi, hanziPinyin) => pick(hanzi, hanziPinyin)} />}
          {!query && tab === 'write' && <WritePanel selected={char} refreshKey={refreshKey} onPickChar={pick} />}
          <p className="mt-6 text-xs leading-relaxed text-slate-400">Dữ liệu nét: Hanzi Writer (Make Me a Hanzi, Arphic Public License).</p>
        </div>

        {isWide && <aside className="card-soft sticky top-20 p-5" aria-label="Bàn viết">{desk}</aside>}
      </div>

      {target && !isWide && !sheetOpen && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="fixed inset-x-3 bottom-20 z-20 flex items-center gap-3 rounded-3xl bg-slate-900 p-2.5 text-left text-white shadow-lg"
          aria-label={`Mở bảng viết chữ ${target.char}`}
        >
          <span className="font-chinese grid h-11 w-11 place-items-center rounded-2xl bg-card text-3xl text-slate-900">{target.char}</span>
          <span className="min-w-0 flex-1 text-sm font-bold leading-snug">{target.pinyin ?? 'Bàn viết'}<span className="block truncate text-xs font-normal opacity-70">Chạm để tập viết</span></span>
          <span className="btn-chunky btn-brand px-4 py-2 text-sm">Viết</span>
        </button>
      )}

      {sheetShown && createPortal(
        <div>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div ref={dialog} role="dialog" aria-modal="true" aria-label="Bàn viết" className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-card p-4 pb-8 shadow-lg animate-fade-up">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300" aria-hidden="true" />
            <button ref={closeButton} type="button" onClick={() => setSheetOpen(false)} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-2xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300" aria-label="Đóng bảng viết">
              <X className="h-5 w-5" />
            </button>
            {desk}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
