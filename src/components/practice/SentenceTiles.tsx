import React, { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'

const stripMarks = (text: string) => text.replace(/[\s。？！，、.?!,：:]/g, '').toLowerCase()

const sameLetters = (a: string, b: string) => [...a].sort().join('') === [...b].sort().join('')

/**
 * Words to arrange, read from prompts like "Sắp xếp ...: 爸爸 / 去 / 商店" or a numbered list.
 * Returns nothing unless the words really build one of the options, so a badly formed prompt
 * falls back to ordinary multiple choice.
 */
export const parseSentenceTiles = (prompt: string, options: { text: string }[]): string[] | null => {
  const colon = prompt.search(/[:：]/)
  const body = colon >= 0 ? prompt.slice(colon + 1) : prompt
  const tokens = (body.includes('/') || body.includes('／') ? body.split(/[/／]/) : body.split(/\r?\n/))
    .map((token) => token.replace(/^\s*\d+[.)、]\s*/, '').trim())
    .filter(Boolean)
  if (tokens.length < 2) return null
  const letters = stripMarks(tokens.join(''))
  return options.some((option) => sameLetters(stripMarks(option.text), letters)) ? tokens : null
}

export const sentenceMatches = (a: string, b: string) => stripMarks(a) === stripMarks(b)

const shuffled = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Tap words to build the sentence, then check it. */
export const SentenceTiles: React.FC<{
  tokens: string[]
  disabled: boolean
  onCheck: (sentence: string) => void
}> = ({ tokens, disabled, onCheck }) => {
  const pool = useMemo(() => shuffled(tokens.map((text, id) => ({ id, text }))), [tokens])
  const [picked, setPicked] = useState<number[]>([])
  const chinese = { fontFamily: "'Noto Serif SC', serif" }
  const textOf = (id: number) => pool.find((tile) => tile.id === id)?.text ?? ''

  return (
    <div className="space-y-4">
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-3" aria-label="Câu của bạn">
        {picked.length === 0 && <span className="text-xs text-slate-400">Bấm các từ bên dưới theo đúng thứ tự</span>}
        {picked.map((id) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => setPicked((current) => current.filter((item) => item !== id))}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-lg font-semibold text-slate-800 disabled:opacity-70"
            style={chinese}
          >
            {textOf(id)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((tile) => {
          const used = picked.includes(tile.id)
          return (
            <button
              key={tile.id}
              type="button"
              disabled={disabled || used}
              onClick={() => setPicked((current) => [...current, tile.id])}
              className={`rounded-xl border px-3 py-2 text-lg font-semibold transition ${used ? 'border-slate-100 text-transparent' : 'border-slate-200 text-slate-800 hover:border-rose-200 hover:bg-rose-50/40'}`}
              style={chinese}
            >
              {tile.text}
            </button>
          )
        })}
      </div>
      {!disabled && (
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => setPicked([])} disabled={picked.length === 0} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-40">
            <RotateCcw className="h-3.5 w-3.5" />
            Xếp lại
          </button>
          <button
            type="button"
            disabled={picked.length !== tokens.length}
            onClick={() => onCheck(picked.map(textOf).join(''))}
            className="rounded-2xl bg-[#B52A2A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#9e2424] disabled:opacity-40"
          >
            Kiểm tra
          </button>
        </div>
      )}
    </div>
  )
}
