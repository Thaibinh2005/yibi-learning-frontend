import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { SANDHI_RULES } from '@/data/pinyin'
import { applySandhi, toneOf } from '@/lib/pinyinTools'
import { TONE_STYLE } from './toneStyle'

type Pair = [string, string]

const Syllable: React.FC<{ pair: Pair }> = ({ pair: [hanzi, pinyin] }) => {
  const style = TONE_STYLE[toneOf(pinyin)]
  return (
    <span className={`inline-flex min-w-16 flex-col items-center rounded-2xl border px-3 py-2 ${style.tint}`}>
      <span className="font-chinese text-3xl leading-tight text-slate-900">{hanzi}</span>
      <span className={`font-extrabold leading-snug ${style.text}`}>{pinyin}</span>
    </span>
  )
}

/** Tone-change rules, plus a box that applies the main ones to any pinyin the learner types. */
export const SandhiRules: React.FC = () => {
  const [typed, setTyped] = useState('nǐ hǎo')
  const { read, ambiguous } = applySandhi(typed)

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 focus-within:border-brand">
        <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          aria-label="Nhập pinyin có dấu để xem biến điệu"
          placeholder="Ví dụ: bù shì"
          className="min-w-0 flex-1 bg-transparent py-1 text-base font-semibold outline-none"
        />
        <span className="flex flex-wrap items-center gap-1.5" aria-live="polite">
          {typed.trim() ? read.map((syllable, i) => (
            <span key={i} className={`rounded-xl border px-2.5 py-1 text-sm font-extrabold leading-snug ${TONE_STYLE[toneOf(syllable)].tint} ${TONE_STYLE[toneOf(syllable)].text}`}>{syllable}</span>
          )) : null}
        </span>
      </label>
      {ambiguous && <p className="rounded-2xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">Ba thanh 3 trở lên: cách đọc phụ thuộc vào nghĩa của từ nên ô này không đổi. Xem ví dụ trong thẻ "Hai thanh 3 đi liền nhau".</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {SANDHI_RULES.map((rule) => (
          <article key={rule.id} className="card-soft space-y-3 p-5">
            <h3 className="text-base font-extrabold text-slate-900">{rule.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{rule.summary}</p>
            {rule.examples.map((example, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                {example.written.map((pair, j) => <Syllable key={`w${j}`} pair={pair} />)}
                <span className="text-slate-400" aria-label="đọc thành">→</span>
                {example.read.map((pair, j) => <Syllable key={`r${j}`} pair={pair} />)}
              </div>
            ))}
            {rule.more && <p className="text-sm leading-relaxed text-slate-500">{rule.more}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}
