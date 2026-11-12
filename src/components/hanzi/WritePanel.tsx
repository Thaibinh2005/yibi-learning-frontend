import React, { useCallback, useEffect, useState } from 'react'
import { getDueWritingCards, getWritingHanzi } from '@/api/hanziApi'
import { useAppSelector } from '@/app/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import type { HanziSyllable, WritingCard } from '@/types/hanzi'
import { StrokeRules } from './StrokeRules'

interface Props {
  selected: string | null
  /** Changes when a character has just been rated, so the due list is fetched again. */
  refreshKey: number
  onPickChar: (hanzi: string, pinyin?: string) => void
}

const LEVELS = ['1-2', '3', '4', '5', '6', '7-9']
const levelLabel = (code: string) => `HSK ${code.replace('-', '–')}`

type Status = 'loading' | 'error' | 'ready'

/** The HSK writing characters by level, the ones due for review, and the stroke-order rules. */
export const WritePanel: React.FC<Props> = ({ selected, refreshKey, onPickChar }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [level, setLevel] = useState('1-2')
  const [status, setStatus] = useState<Status>('loading')
  const [chars, setChars] = useState<HanziSyllable[]>([])
  const [due, setDue] = useState<WritingCard[]>([])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getWritingHanzi(level)
      .then((response) => { if (!cancelled) { setChars(response.data); setStatus('ready') } })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [level, attempt])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let cancelled = false
    getDueWritingCards()
      .then((response) => { if (!cancelled) setDue(response.data) })
      .catch(() => { if (!cancelled) setDue([]) })
    return () => { cancelled = true }
  }, [isAuthenticated, refreshKey])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return (
    <div className="space-y-5">
      {isAuthenticated && due.length > 0 && (
        <section className="card-soft p-5">
          <h3 className="mb-3 font-extrabold text-slate-900">Đến hạn ôn <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs tabular-nums text-brand">{due.length}</span></h3>
          <ul className="flex flex-wrap gap-2">
            {due.map((card) => (
              <li key={card.cardId}>
                <button
                  type="button"
                  onClick={() => onPickChar(card.hanzi, card.pinyin ?? undefined)}
                  aria-label={`Ôn chữ ${card.hanzi}`}
                  className="font-chinese grid h-14 w-14 place-items-center rounded-2xl border-2 border-rose-200 bg-rose-50 text-3xl text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
                >
                  {card.hanzi}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card-soft space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Cấp độ">
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={level === value}
              onClick={() => setLevel(value)}
              className={`h-11 rounded-2xl border-2 px-4 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                level === value ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {levelLabel(value)}
            </button>
          ))}
        </div>

        {status === 'loading' && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8" aria-busy="true">
            {Array.from({ length: 16 }, (_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 text-center" role="alert">
            <h4 className="font-extrabold text-slate-900">Chưa tải được danh sách chữ</h4>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Chưa có gì thay đổi. Thử lại sau ít giây.</p>
            <button type="button" onClick={retry} className="btn-chunky btn-brand mt-3 px-5 py-2 text-sm">Thử lại</button>
          </div>
        )}

        {status === 'ready' && chars.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">Cấp độ này chưa có chữ viết.</p>
        )}

        {status === 'ready' && chars.length > 0 && (
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {chars.map((item) => (
              <li key={item.hanzi}>
                <button
                  type="button"
                  aria-pressed={selected === item.hanzi}
                  onClick={() => onPickChar(item.hanzi, item.pinyin)}
                  className={`flex w-full flex-col items-center rounded-2xl border-2 bg-white py-2 transition-[box-shadow,border-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                    selected === item.hanzi ? 'border-brand' : 'border-slate-200 hover:border-rose-200 hover:shadow-md'
                  }`}
                >
                  <span className="font-chinese text-3xl leading-tight text-slate-900">{item.hanzi}</span>
                  <span className="text-xs font-bold leading-snug text-slate-500">{item.pinyin}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-soft p-5">
        <h3 className="mb-3 text-lg font-extrabold text-slate-900">Quy tắc bút thuận</h3>
        <StrokeRules onPickChar={(hanzi) => onPickChar(hanzi)} />
      </section>
    </div>
  )
}
