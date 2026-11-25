import React, { useState } from 'react'
import { Layers, X } from 'lucide-react'
import { addDeckWords, createDeck, deckError, getDecks, type Deck } from '@/api/deckApi'
import { HARD_DECK_NAME } from '@/components/vocabulary/word-detail/WordDetailModal'
import { AudioButton } from '@/components/ui/AudioButton'
import { displayHanzi } from '@/components/flashcard/useCardSession'
import { cn } from '@/lib/utils'
import type { Vocabulary } from '@/types/vocabulary'

interface Props {
  word: Vocabulary
  onClose: () => void
  /** Example for the new-deck box, e.g. "Bài đọc 1". */
  deckHint?: string
}

const isHardDeck = (name: string) => name.trim().toLocaleLowerCase('vi') === HARD_DECK_NAME.toLocaleLowerCase('vi')

/** A tapped word with its pinyin and meaning, and saving it to a flashcard deck: pick one, or make one on the spot. */
export const WordSaveCard: React.FC<Props> = ({ word, onClose, deckHint = 'Bài đọc 1' }) => {
  const [picker, setPicker] = useState(false)
  const [decks, setDecks] = useState<Deck[] | null>(null)
  const [newDeck, setNewDeck] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const openPicker = () => {
    setPicker(true)
    setNotice(null)
    getDecks().then((list) => setDecks(list.filter((deck) => !isHardDeck(deck.name)))).catch(() => { setDecks([]); setNotice({ ok: false, text: 'Chưa tải được danh sách bộ thẻ.' }) })
  }

  const saveTo = async (target: Deck | string) => {
    if (busy) return
    setBusy(true)
    try {
      const deck = typeof target === 'string' ? await createDeck(target) : target
      const result = await addDeckWords(deck.id, [word.id])
      setNotice({ ok: true, text: result.changed ? `Đã lưu vào "${deck.name}".` : `Từ đã có trong "${deck.name}".` })
      setPicker(false)
      setNewDeck('')
      setDecks(null)
    } catch (err) {
      setNotice({ ok: false, text: deckError(err, 'Chưa lưu được từ này. Hãy thử lại.') })
    } finally { setBusy(false) }
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 max-xl:fixed max-xl:inset-x-3 max-xl:bottom-20 max-xl:z-40 max-xl:mx-auto max-xl:max-h-[65vh] max-xl:max-w-md max-xl:overflow-y-auto max-xl:shadow-2xl md:max-xl:bottom-6">
      <div className="min-w-0">
        <p><span className="font-chinese text-2xl text-foreground">{displayHanzi(word.hanzi)}</span><span className="ml-2 font-semibold text-brand">{word.pinyin}</span></p>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{word.meaningVi || word.meaningEn}</p>
        {!picker && <button type="button" onClick={openPicker} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/5"><Layers className="h-3.5 w-3.5" aria-hidden="true" />Lưu vào flashcard</button>}
        {picker && (
          <div className="mt-2 rounded-lg border border-border bg-muted/40 p-2.5">
            <p className="text-xs font-semibold text-foreground">Lưu vào bộ thẻ nào?</p>
            {decks === null ? <p className="mt-1 text-xs text-muted-foreground">Đang tải...</p> : (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {decks.map((deck) => <li key={deck.id}><button type="button" disabled={busy} onClick={() => saveTo(deck)} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-brand hover:text-brand disabled:opacity-60">{deck.name}<span className="ml-1 font-normal text-muted-foreground">{deck.totalWords}</span></button></li>)}
                {decks.length === 0 && <li className="text-xs text-muted-foreground">Bạn chưa có bộ thẻ nào. Tạo bộ đầu tiên bên dưới.</li>}
              </ul>
            )}
            <form onSubmit={(event) => { event.preventDefault(); if (newDeck.trim()) void saveTo(newDeck.trim()) }} className="mt-2 flex gap-1.5">
              <input value={newDeck} onChange={(event) => setNewDeck(event.target.value)} maxLength={80} placeholder={`Tạo bộ mới, ví dụ: ${deckHint}`} aria-label="Tên bộ thẻ mới" className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-brand" />
              <button type="submit" disabled={!newDeck.trim() || busy} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Tạo và lưu</button>
            </form>
            <button type="button" onClick={() => setPicker(false)} className="mt-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">Hủy</button>
          </div>
        )}
        {notice && <p role={notice.ok ? 'status' : 'alert'} className={cn('mt-1.5 text-xs', notice.ok ? 'font-semibold text-emerald-700' : 'text-rose-700')}>{notice.text}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <AudioButton audioUrl={word.audioUrl} text={displayHanzi(word.hanzi)} size="sm" />
        <button type="button" onClick={onClose} aria-label="Đóng" className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"><X className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </div>
  )
}
