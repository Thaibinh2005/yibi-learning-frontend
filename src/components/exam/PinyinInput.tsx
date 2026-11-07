import React, { useEffect, useState } from 'react'
import { getPinyinCandidates } from '@/api/learningPathApi'

const HAN = /\p{Script=Han}/u

/**
 * Types Chinese in the page itself, for machines without a Chinese input method: type pinyin without tones, then
 * press space or a number to pick. Characters from a real input method are accepted as they are.
 */
export const PinyinInput: React.FC<{
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label: string
}> = ({ value, onChange, disabled, label }) => {
  const [buffer, setBuffer] = useState('')
  const [candidates, setCandidates] = useState<string[]>([])

  useEffect(() => {
    if (!buffer) {
      setCandidates([])
      return
    }
    let active = true
    const timer = window.setTimeout(() => {
      getPinyinCandidates(buffer).then((items) => active && setCandidates(items)).catch(() => active && setCandidates([]))
    }, 120)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [buffer])

  const pick = (word: string) => {
    onChange(value + word)
    setBuffer('')
    setCandidates([])
  }

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    if (event.key === ' ' && candidates.length > 0) {
      event.preventDefault()
      pick(candidates[0])
    } else if (/^[1-8]$/.test(event.key) && candidates[Number(event.key) - 1]) {
      event.preventDefault()
      pick(candidates[Number(event.key) - 1])
    } else if (event.key === 'Backspace' && !buffer && value) {
      event.preventDefault()
      onChange([...value].slice(0, -1).join(''))
    } else if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const typed = event.target.value
    if (HAN.test(typed)) {
      onChange(value + [...typed].filter((char) => HAN.test(char)).join(''))
      setBuffer('')
    } else {
      setBuffer(typed.toLowerCase().replace(/[^a-zü]/g, ''))
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 focus-within:border-[#C8322B]">
        {value && <span className="font-chinese text-lg font-semibold text-slate-800">{value}</span>}
        <input
          aria-label={label}
          value={buffer}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKey}
          autoComplete="off"
          spellCheck={false}
          placeholder={value ? '' : 'Gõ pinyin, ví dụ: nihao'}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#C8322B] outline-none placeholder:text-slate-300"
        />
      </div>
      {candidates.length > 0 && (
        <div role="listbox" aria-label="Chọn chữ" className="mt-1.5 flex flex-wrap gap-1.5">
          {candidates.map((word, index) => (
            <button key={word} type="button" onClick={() => pick(word)} className="font-chinese rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-semibold text-slate-800 hover:border-rose-300 hover:bg-rose-50">
              <span className="mr-1 text-[10px] font-normal text-slate-400">{index + 1}</span>{word}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
