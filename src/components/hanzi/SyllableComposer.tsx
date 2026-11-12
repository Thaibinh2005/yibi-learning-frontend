import React, { useCallback, useEffect, useState } from 'react'
import { getHanziBySyllable } from '@/api/hanziApi'
import { FINALS, INITIALS } from '@/data/pinyin'
import type { Tone } from '@/data/pinyin'
import { composeSyllable } from '@/lib/pinyinTools'
import { Skeleton } from '@/components/ui/skeleton'
import type { HanziSyllable } from '@/types/hanzi'
import { TONE_STYLE } from './toneStyle'

interface Props {
  selected: string | null
  onPickChar: (hanzi: string, pinyin?: string) => void
}

type Status = 'loading' | 'error' | 'ready'

const TONE_OPTIONS: Array<{ tone: Tone; mark: string; label: string }> = [
  { tone: 1, mark: 'ā', label: 'thanh 1' }, { tone: 2, mark: 'á', label: 'thanh 2' }, { tone: 3, mark: 'ǎ', label: 'thanh 3' },
  { tone: 4, mark: 'à', label: 'thanh 4' }, { tone: 5, mark: 'a', label: 'nhẹ' },
]

const levelLabel = (code: string) => `HSK ${code.replace('-', '–')}`

const Option: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode; label?: string }> = ({ on, onClick, children, label }) => (
  <button
    type="button"
    aria-pressed={on}
    aria-label={label}
    onClick={onClick}
    className={`h-11 min-w-11 rounded-2xl border-2 px-2.5 text-base font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
      on ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
    }`}
  >
    {children}
  </button>
)

/** Picks an initial, a final and a tone, then lists the HSK writing characters read that way. */
export const SyllableComposer: React.FC<Props> = ({ selected, onPickChar }) => {
  const [initial, setInitial] = useState('n')
  const [final, setFinal] = useState('i')
  const [tone, setTone] = useState<Tone>(3)
  const [status, setStatus] = useState<Status>('loading')
  const [hits, setHits] = useState<HanziSyllable[]>([])
  const [attempt, setAttempt] = useState(0)

  const syllable = composeSyllable(initial, final, tone)
  const toneStyle = TONE_STYLE[tone]

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    const timer = window.setTimeout(() => {
      getHanziBySyllable({ initial, final, tone })
        .then((response) => { if (!cancelled) { setHits(response.data); setStatus('ready') } })
        .catch(() => { if (!cancelled) setStatus('error') })
    }, 200)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [initial, final, tone, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const otherTone = () => setTone((tone % 5 + 1) as Tone)

  return (
    <div className="space-y-4">
      <div className="card-soft space-y-5 p-5">
        <section>
          <h3 className="mb-2 flex items-center gap-2 font-extrabold text-slate-900"><span className="grid h-6 w-6 place-items-center rounded-lg bg-rose-50 text-xs text-brand">1</span>Thanh mẫu</h3>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Thanh mẫu">
            <Option on={initial === ''} onClick={() => setInitial('')} label="Không có thanh mẫu">∅</Option>
            {INITIALS.map((value) => <Option key={value} on={initial === value} onClick={() => setInitial(value)}>{value}</Option>)}
          </div>
        </section>
        <section>
          <h3 className="mb-2 flex items-center gap-2 font-extrabold text-slate-900"><span className="grid h-6 w-6 place-items-center rounded-lg bg-rose-50 text-xs text-brand">2</span>Vận mẫu</h3>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Vận mẫu">
            {FINALS.map((value) => <Option key={value} on={final === value} onClick={() => setFinal(value)}>{value}</Option>)}
          </div>
        </section>
        <section>
          <h3 className="mb-2 flex items-center gap-2 font-extrabold text-slate-900"><span className="grid h-6 w-6 place-items-center rounded-lg bg-rose-50 text-xs text-brand">3</span>Thanh điệu</h3>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Thanh điệu">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.tone}
                type="button"
                aria-pressed={tone === option.tone}
                onClick={() => setTone(option.tone)}
                className={`flex h-14 min-w-20 flex-col items-center justify-center rounded-2xl border-2 leading-tight transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                  tone === option.tone ? `${TONE_STYLE[option.tone].fill} border-transparent text-white` : `bg-white ${TONE_STYLE[option.tone].text} border-slate-200 hover:border-slate-300`
                }`}
              >
                <span className="text-lg font-extrabold">{option.mark}</span>
                <span className="text-xs font-semibold">{option.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="card-soft p-5" aria-live="polite">
        <p className="flex flex-wrap items-center justify-center gap-2 text-lg font-extrabold text-slate-500">
          <b className="text-slate-900">{initial || '∅'}</b>+<b className="text-slate-900">{final}</b>+<span className={toneStyle.text}>{tone === 5 ? 'thanh nhẹ' : `thanh ${tone}`}</span>=
          <span className={`text-4xl leading-tight ${toneStyle.text}`}>{syllable}</span>
        </p>

        {status === 'loading' && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-busy="true">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 text-center" role="alert">
            <p className="font-chinese text-5xl text-slate-300">断</p>
            <h4 className="mt-1 font-extrabold text-slate-900">Chưa tải được danh sách chữ</h4>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Bạn vẫn thấy âm tiết vừa ghép. Mạng có thể đang chậm, thử lại sau ít giây.</p>
            <button type="button" onClick={retry} className="btn-chunky btn-brand mt-3 px-5 py-2 text-sm">Thử lại</button>
          </div>
        )}

        {status === 'ready' && hits.length === 0 && (
          <div className="py-6 text-center">
            <p className="font-chinese text-5xl text-slate-300">空</p>
            <h4 className="mt-1 font-extrabold text-slate-900">Chưa có chữ HSK cho âm này</h4>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Có thể tổ hợp này không có trong tiếng Trung, hoặc chưa có chữ viết HSK nào đọc như vậy. Thử đổi thanh điệu hoặc vận mẫu.</p>
            <button type="button" onClick={otherTone} className="btn-chunky btn-paper mt-3 px-5 py-2 text-sm">Thử thanh khác</button>
          </div>
        )}

        {status === 'ready' && hits.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {hits.map((hit) => (
              <li key={`${hit.hanzi}-${hit.pinyin}`}>
                <button
                  type="button"
                  onClick={() => onPickChar(hit.hanzi, hit.pinyin)}
                  aria-pressed={selected === hit.hanzi}
                  className={`flex w-full flex-col items-center rounded-2xl border-2 bg-white px-2 py-3 transition-[box-shadow,border-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 ${
                    selected === hit.hanzi ? 'border-brand' : 'border-slate-200 hover:border-rose-200 hover:shadow-md'
                  }`}
                >
                  <span className="font-chinese text-5xl leading-tight text-slate-900">{hit.hanzi}</span>
                  <span className="text-xs font-bold text-slate-500">{levelLabel(hit.levelCode)} · chữ viết</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
