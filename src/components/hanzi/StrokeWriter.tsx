import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import type { CharacterJson } from 'hanzi-writer'
import type { WritingMode } from '@/types/hanzi'

export interface StrokeWriterHandle {
  /** Starts the current mode again from the first stroke. */
  restart: () => void
  /** Shows the outline for a moment while writing. */
  hint: () => void
}

interface Props {
  char: string
  mode: WritingMode
  /** Called once when the last stroke of a quiz is accepted. */
  onQuizComplete?: (result: { mistakes: number }) => void
  /** Called when the stroke file of the character is missing. */
  onMissingData?: () => void
  /** Called with the strokes written so far and the total, as the learner writes. */
  onProgress?: (done: number, total: number) => void
}

/** Same version as the hanzi-writer-data dev dependency, so the bundled files and the CDN ones agree. */
const CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1'

const fetchStrokes = (url: string): Promise<CharacterJson> =>
  fetch(url).then((response) => (response.ok ? (response.json() as Promise<CharacterJson>) : Promise.reject(new Error(`No stroke data at ${url}`))))

/**
 * The HSK characters and radicals are copied to /hanzi-data by scripts/copy-hanzi-data.mjs. Any other character
 * (a word the learner typed) is fetched from the CDN; a missing file may answer with the app's HTML, which fails to parse.
 */
const loadStrokeData = (char: string, onLoad: (data: CharacterJson) => void, onError: (error?: unknown) => void) => {
  const name = `${encodeURIComponent(char)}.json`
  fetchStrokes(`/hanzi-data/${name}`)
    .catch(() => fetchStrokes(`${CDN}/${name}`))
    .then(onLoad, onError)
}

/** Hanzi Writer only reads classic colour strings, so an HSL triplet from the CSS variables is turned into #rrggbb. */
const cssColor = (name: string): string => {
  const [h, s, l] = getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).map(parseFloat)
  if ([h, s, l].some(Number.isNaN)) return '#000000'
  const sat = s / 100
  const light = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sat * Math.min(light, 1 - light)
  const channel = (n: number) => Math.round(255 * (light - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))))
  return `#${[0, 8, 4].map((n) => channel(n).toString(16).padStart(2, '0')).join('')}`
}

/** The writing board: animation, outline tracing and a graded quiz, drawn by Hanzi Writer. */
export const StrokeWriter = forwardRef<StrokeWriterHandle, Props>(({ char, mode, onQuizComplete, onMissingData, onProgress }, ref) => {
  const frame = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const writer = useRef<HanziWriter | null>(null)
  const [missing, setMissing] = useState(false)
  const [run, setRun] = useState(0)
  const [width, setWidth] = useState(0)
  const callbacks = useRef({ onQuizComplete, onMissingData, onProgress })
  useEffect(() => { callbacks.current = { onQuizComplete, onMissingData, onProgress } })

  // The board is square and as wide as its frame, so it is drawn again when the frame changes size.
  useEffect(() => {
    const node = frame.current
    if (!node) return undefined
    setWidth(Math.round(node.clientWidth))
    const observer = new ResizeObserver(() => setWidth(Math.round(node.clientWidth)))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const target = box.current
    if (!target || width === 0) return undefined
    let cancelled = false
    target.innerHTML = ''
    setMissing(false)
    let total = 0

    // Hanzi Writer writes the page's full address into each clip-path. The address changes when the learner
    // switches tab, and the strokes then lose their clip and turn into black blobs. A bare #id always resolves.
    const keepLocalRefs = () => {
      target.querySelectorAll('[clip-path]').forEach((node) => {
        const value = node.getAttribute('clip-path') ?? ''
        const local = value.replace(/url\(["']?[^#"')]*#([^"')]+)["']?\)/, 'url(#$1)')
        if (local !== value) node.setAttribute('clip-path', local)
      })
    }
    const refs = new MutationObserver(keepLocalRefs)
    refs.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['clip-path'] })
    const instance = HanziWriter.create(target, char, {
      width,
      height: width,
      padding: 12,
      strokeColor: cssColor('--foreground'),
      outlineColor: cssColor('--border'),
      highlightColor: cssColor('--primary'),
      drawingColor: cssColor('--foreground'),
      drawingWidth: 14,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 250,
      showOutline: mode !== 'quiz',
      showCharacter: mode === 'view',
      showHintAfterMisses: mode === 'quiz' ? 3 : 1,
      charDataLoader: loadStrokeData,
      onLoadCharDataSuccess: (data) => { if (cancelled) return; total = data.strokes.length; callbacks.current.onProgress?.(0, total) },
      onLoadCharDataError: () => { if (cancelled) return; setMissing(true); callbacks.current.onMissingData?.() },
    })
    writer.current = instance

    if (mode === 'view') {
      void instance.loopCharacterAnimation()
    } else {
      void instance.quiz({
        onCorrectStroke: (stroke) => { if (!cancelled) callbacks.current.onProgress?.(stroke.strokeNum + 1, total) },
        onComplete: (summary) => {
          if (cancelled) return
          callbacks.current.onProgress?.(total, total)
          if (mode === 'quiz') callbacks.current.onQuizComplete?.({ mistakes: summary.totalMistakes })
        },
      })
    }
    return () => {
      cancelled = true
      refs.disconnect()
      // Hanzi Writer throws when its character data never loaded (a missing stroke file); that must not break the page.
      try {
        instance.cancelQuiz()
        instance.pauseAnimation().catch(() => undefined)
      } catch {
        /* nothing was drawn, so there is nothing to stop */
      }
      writer.current = null
    }
  }, [char, mode, run, width])

  useImperativeHandle(ref, () => ({
    restart: () => setRun((n) => n + 1),
    hint: () => {
      const current = writer.current
      if (!current) return
      void current.showOutline({ duration: 200 })
      window.setTimeout(() => { if (mode === 'quiz') void current.hideOutline({ duration: 300 }) }, 1500)
    },
  }), [mode])

  return (
    <div ref={frame} className="relative mx-auto aspect-square w-full max-w-sm rounded-md border-2 border-rose-300 bg-card">
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-rose-200" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M0 0L100 100M100 0L0 100M50 0V100M0 50H100" stroke="currentColor" strokeWidth=".6" strokeDasharray="2 2" fill="none" />
      </svg>
      <div ref={box} className="relative h-full w-full" role="img" aria-label={`Bảng viết chữ ${char}. Viết nét cần chuột hoặc ngón tay; bạn vẫn xem được bút thuận ở chế độ Xem.`} />
      {missing && (
        <div className="absolute inset-0 grid place-items-center bg-card text-center">
          <div>
            <span className="font-chinese text-9xl leading-none text-slate-300">{char}</span>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">Chữ này chưa có hình nét, bạn vẫn xem được mặt chữ</p>
          </div>
        </div>
      )}
    </div>
  )
})
StrokeWriter.displayName = 'StrokeWriter'
