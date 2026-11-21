import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { WritingDesk } from '@/components/hanzi/WritingDesk'
import { displayHanzi } from '@/components/flashcard/useCardSession'

const CJK = /[一-鿿]/

interface Props {
  /** The word to write; each Chinese character of it gets its own board, in order. */
  hanzi: string
  onClose: () => void
  /** Show as a panel in the page, beside the content, instead of a window over it. */
  inline?: boolean
}

/** A window to practise writing a word character by character, over the page the learner is on. */
export const WordWritingModal: React.FC<Props> = ({ hanzi, onClose, inline = false }) => {
  const chars = Array.from(displayHanzi(hanzi)).filter((char) => CJK.test(char))
  const [index, setIndex] = useState(0)
  const [written, setWritten] = useState<Set<string>>(new Set())
  const closeButton = useRef<HTMLButtonElement>(null)

  // Escape closes only this window, not the one under it.
  useEffect(() => {
    if (inline) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose, inline])

  useEffect(() => { if (!inline) closeButton.current?.focus() }, [inline])

  if (chars.length === 0) return null
  const char = chars[Math.min(index, chars.length - 1)]
  const last = index >= chars.length - 1

  const tree = (
    <div className={inline ? 'contents' : 'fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4'} role="presentation">
      {!inline && <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]" onClick={onClose} aria-hidden />}
      <div role="dialog" aria-modal={!inline} aria-labelledby="word-writing-title" className={`relative flex w-full flex-col overflow-hidden bg-white ${inline ? 'h-[calc(100dvh-10.5rem)] rounded-2xl border border-slate-200 md:h-[calc(100dvh-8.5rem)]' : 'h-[96dvh] rounded-t-3xl shadow-2xl sm:max-w-xl sm:rounded-3xl'}`}>
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-100 px-5 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C8322B]">Luyện viết</p>
            <h2 id="word-writing-title" className="font-chinese mt-0.5 text-2xl font-bold leading-tight text-slate-800">{displayHanzi(hanzi)}</h2>
            {chars.length > 1 && <p className="mt-0.5 text-xs text-slate-500">Từ có {chars.length} chữ — viết từng chữ một, theo thứ tự.</p>}
          </div>
          {chars.length > 1 && (
            <div className="flex items-center gap-2" role="tablist" aria-label="Các chữ của từ">
              {chars.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => setIndex(i)}
                  className={`font-chinese relative grid h-11 w-11 place-items-center rounded-xl border-2 text-xl font-bold ${i === index ? 'border-[#C8322B] bg-rose-50 text-[#C8322B]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {item}
                  {written.has(item) && <Check className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-emerald-500 p-0.5 text-white" aria-label="Đã viết" />}
                </button>
              ))}
            </div>
          )}
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Đóng" className="ml-auto self-start rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto max-w-3xl">
          <WritingDesk
            layout="split"
            target={{ char, kind: 'hanzi' }}
            onWritten={(done) => setWritten((prev) => new Set(prev).add(done.char))}
          />
          </div>
        </div>

        {chars.length > 1 && (
          <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <button type="button" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
              Chữ trước
            </button>
            <span className="text-xs font-semibold tabular-nums text-slate-500">Chữ {index + 1}/{chars.length}</span>
            {last ? (
              <button type="button" onClick={onClose} className="rounded-xl bg-[#C8322B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9B2323]">Xong</button>
            ) : (
              <button type="button" onClick={() => setIndex((i) => i + 1)} className="inline-flex items-center gap-1 rounded-xl bg-[#C8322B] px-3 py-2 text-sm font-semibold text-white hover:bg-[#9B2323]">
                Chữ sau
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  )
  return inline ? tree : createPortal(tree, document.body)
}
