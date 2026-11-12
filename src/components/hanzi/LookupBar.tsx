import React, { useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  /** The search that is showing results, if any; the box starts with it. */
  query: string | null
  onSearch: (text: string) => void
  onClear: () => void
}

/** Search box for words: Hanzi from the system's Chinese keyboard, pinyin with or without tone marks, or Vietnamese. */
export const LookupBar: React.FC<Props> = ({ query, onSearch, onClear }) => {
  const [value, setValue] = useState(query ?? '')
  // Enter that confirms an IME candidate must not count as a search.
  const composing = useRef(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const text = value.trim()
    if (composing.current || !text) return
    onSearch(text)
  }

  return (
    <form onSubmit={submit} role="search" className="flex items-center gap-2 rounded-3xl border-2 border-slate-200 bg-white p-1.5 pl-4 focus-within:border-brand">
      <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onCompositionStart={() => { composing.current = true }}
        onCompositionEnd={() => { composing.current = false }}
        aria-label="Tra từ: gõ chữ Hán, pinyin hoặc nghĩa tiếng Việt"
        placeholder="Gõ chữ Hán, pinyin hoặc nghĩa tiếng Việt. Ví dụ: 你好, nihao, xin chào"
        autoComplete="off"
        enterKeyHint="search"
        className="font-chinese min-w-0 flex-1 bg-transparent py-2 text-base font-semibold outline-none placeholder:font-normal placeholder:text-slate-400"
      />
      {(value || query) && (
        <button
          type="button"
          onClick={() => { setValue(''); onClear() }}
          aria-label="Xóa nội dung tra"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <button type="submit" className="btn-chunky btn-brand shrink-0 px-5 py-2.5 text-sm">Tìm</button>
    </form>
  )
}
