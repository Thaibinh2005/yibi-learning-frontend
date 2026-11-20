import type { CharTime, LearnerSegment } from '@/types/listening'

/** A line in the editor; `key` is local only, so React keeps rows steady through merges and splits. */
export interface EditRow extends LearnerSegment {
  key: number
}

let nextKey = 1
export const toRows = (segments: LearnerSegment[]): EditRow[] => segments.map((s) => ({ ...s, key: nextKey++ }))

const round = (n: number) => Math.round(n * 1000) / 1000

/** A translation made for the old text no longer fits. */
const stale = (row: LearnerSegment) => (row.vi ? true : undefined)

export function editText(rows: EditRow[], index: number, text: string): EditRow[] {
  const row = rows[index]
  if (!row || row.text === text) return rows
  // Whisper's per-character times belong to the old text; drop them so a split falls back to proportion.
  const next: EditRow = { ...row, text, viStale: stale(row), timing: null, words: undefined, pinyin: undefined }
  return rows.map((r, i) => (i === index ? next : r))
}

/** Joins row `index` with the one after it. */
export function mergeDown(rows: EditRow[], index: number): EditRow[] {
  const a = rows[index]
  const b = rows[index + 1]
  if (!a || !b) return rows
  const joint = /[㐀-鿿]$/.test(a.text) && /^[㐀-鿿]/.test(b.text) ? '' : ' '
  const merged: EditRow = {
    key: nextKey++,
    text: (a.text + joint + b.text).trim(),
    start: a.start ?? b.start ?? null,
    end: b.end ?? a.end ?? null,
    vi: [a.vi, b.vi].filter(Boolean).join(' ') || null,
    viStale: a.vi || b.vi ? true : undefined,
    timing: a.timing && b.timing ? [...a.timing, ...b.timing] : null,
  }
  return [...rows.slice(0, index), merged, ...rows.slice(index + 2)]
}

/**
 * Splits row `index` before character `at`. The cut time comes from Whisper's character times when they match the
 * text, else from the player's current time when it lies inside the line, else from the share of characters.
 */
export function splitAt(rows: EditRow[], index: number, at: number, playerTime?: number): EditRow[] {
  const row = rows[index]
  if (!row) return rows
  const left = row.text.slice(0, at).trim()
  const right = row.text.slice(at).trim()
  if (!left || !right) return rows
  const { start, end } = row
  let cut: number | null = null
  let leftTiming: CharTime[] | null = null
  let rightTiming: CharTime[] | null = null
  if (row.timing && row.timing.map((t) => t.w).join('') === row.text.replace(/\s+/g, '')) {
    const before = row.text.slice(0, at).replace(/\s+/g, '').length
    let count = 0
    const i = row.timing.findIndex((t) => (count += t.w.length) > before)
    if (i > 0) {
      cut = row.timing[i].start
      leftTiming = row.timing.slice(0, i)
      rightTiming = row.timing.slice(i)
    }
  }
  if (cut === null && start != null && end != null) {
    cut = playerTime !== undefined && playerTime > start + 0.05 && playerTime < end - 0.05
      ? playerTime
      : start + ((end - start) * left.length) / Math.max(1, left.length + right.length)
  }
  const first: EditRow = {
    key: nextKey++, text: left, start, end: cut === null ? null : round(cut), vi: row.vi, viStale: stale(row), timing: leftTiming,
  }
  const second: EditRow = {
    key: nextKey++, text: right, start: cut === null ? null : round(cut), end, vi: null, timing: rightTiming,
  }
  return [...rows.slice(0, index), first, second, ...rows.slice(index + 1)]
}

export function removeAt(rows: EditRow[], index: number): EditRow[] {
  return rows.filter((_, i) => i !== index)
}

export function setTimes(rows: EditRow[], index: number, patch: { start?: number | null; end?: number | null }): EditRow[] {
  return rows.map((r, i) => {
    if (i !== index) return r
    const clean = (v: number | null | undefined) => (v === undefined ? undefined : v === null ? null : round(Math.max(0, v)))
    return {
      ...r,
      ...(patch.start !== undefined ? { start: clean(patch.start) } : {}),
      ...(patch.end !== undefined ? { end: clean(patch.end) } : {}),
    }
  })
}

/** The index of the first row whose times are wrong (end not after start, or a missing time when `needTimes`). */
export function firstBadTime(rows: EditRow[], needTimes: boolean): number {
  return rows.findIndex((r) => {
    const hasStart = r.start != null
    const hasEnd = r.end != null
    if (needTimes && (!hasStart || !hasEnd)) return true
    return hasStart && hasEnd && (r.end as number) <= (r.start as number)
  })
}

/** The row being heard at `time`, or -1. */
export function rowAt(rows: EditRow[], time: number): number {
  return rows.findIndex((r) => r.start != null && r.end != null && time >= r.start && time < r.end)
}

export const toPayload = (rows: EditRow[]) =>
  rows.map(({ text, start, end, vi, viStale, timing }) => ({ text, start, end, vi, viStale, timing }))

/** The learner's own translation replaces the automatic one and is no longer stale. */
export function editVi(rows: EditRow[], index: number, vi: string): EditRow[] {
  const row = rows[index]
  const value = vi.trim() || null
  if (!row || (row.vi ?? null) === value) return rows
  return rows.map((r, i) => (i === index ? { ...r, vi: value, viStale: undefined } : r))
}

/** Rows that still have no translation, or a stale one. */
export const needsTranslation = (row: LearnerSegment) => !row.vi || !!row.viStale
