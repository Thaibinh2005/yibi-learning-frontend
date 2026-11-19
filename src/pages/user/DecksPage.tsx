import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, FolderPlus, Layers, LoaderCircle, Pencil, Play, Trash2, X } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { GuestNotice } from '@/components/ui/GuestNotice'
import { createDeck, deckError, deleteDeck, getDecks, renameDeck, type Deck } from '@/api/deckApi'

const MAX_NAME = 80

/** The learner's own vocabulary decks: create, rename, delete, and see how far each one is learnt. */
export const DecksPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h1 className="text-xl font-bold text-slate-800">Bộ từ vựng của tôi</h1>
        </header>
        <GuestNotice title="Bộ từ vựng cá nhân" message="Đăng nhập để tự tạo các bộ từ vựng và ôn chúng bằng flashcard." />
      </div>
    )
  }
  return <LearnerDecks />
}

const LearnerDecks: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const load = () => {
    setLoading(true)
    getDecks()
      .then((list) => {
        setDecks(list)
        setError('')
      })
      .catch((err) => setError(deckError(err, 'Không tải được bộ từ vựng. Hãy thử tải lại trang.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name || creating) return
    setCreating(true)
    try {
      const deck = await createDeck(name)
      setDecks((list) => [deck, ...list])
      setNewName('')
      setError('')
    } catch (err) {
      setError(deckError(err, 'Chưa tạo được bộ từ vựng.'))
    } finally {
      setCreating(false)
    }
  }

  const saveName = async (deck: Deck) => {
    const name = editName.trim()
    if (!name || name === deck.name) {
      setEditingId(null)
      return
    }
    try {
      const updated = await renameDeck(deck.id, name)
      setDecks((list) => list.map((d) => (d.id === deck.id ? updated : d)))
      setEditingId(null)
      setError('')
    } catch (err) {
      setError(deckError(err, 'Chưa đổi được tên bộ từ vựng.'))
    }
  }

  const remove = async (deck: Deck) => {
    if (!window.confirm(`Xoá bộ "${deck.name}"? Tiến độ ghi nhớ của các từ vẫn được giữ trong Flashcard.`)) return
    try {
      await deleteDeck(deck.id)
      setDecks((list) => list.filter((d) => d.id !== deck.id))
      setError('')
    } catch (err) {
      setError(deckError(err, 'Chưa xoá được bộ từ vựng.'))
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <Link to="/flashcards" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#C8322B]">
          <ArrowLeft className="h-3.5 w-3.5" />
          Flashcard
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Bộ từ vựng của tôi</h1>
        <p className="mt-1 text-xs text-slate-500">
          Gom từ trong kho HSK thành các bộ riêng. Một từ nằm trong nhiều bộ vẫn chỉ có một tiến độ ghi nhớ.
        </p>
        <form onSubmit={create} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={MAX_NAME}
            placeholder="Tên bộ mới, ví dụ: Từ đi du lịch"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C8322B] focus:ring-2 focus:ring-[#C8322B]/15"
          />
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8322B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {creating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
            Tạo bộ
          </button>
        </form>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải bộ từ vựng...
        </div>
      ) : decks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          <Layers className="mx-auto mb-3 h-6 w-6 text-slate-400" />
          Bạn chưa có bộ từ vựng nào. Đặt tên ở ô phía trên để tạo bộ đầu tiên.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {decks.map((deck) => {
            const learnedPct = deck.totalWords ? Math.round((deck.learnedWords / deck.totalWords) * 100) : 0
            const masteredPct = deck.totalWords ? Math.round((deck.masteredWords / deck.totalWords) * 100) : 0
            return (
              <li key={deck.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                {editingId === deck.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      saveName(deck)
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      autoFocus
                      value={editName}
                      maxLength={MAX_NAME}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && setEditingId(null)}
                      aria-label="Tên bộ từ vựng"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold outline-none focus:border-[#C8322B]"
                    />
                    <button type="submit" title="Lưu tên" className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button type="button" title="Huỷ" onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/flashcards/decks/${deck.id}`} className="min-w-0 break-words font-bold text-slate-800 hover:text-[#C8322B]">
                      {deck.name}
                    </Link>
                    <div className="flex flex-shrink-0 gap-1">
                      <button
                        type="button"
                        title="Đổi tên"
                        onClick={() => {
                          setEditingId(deck.id)
                          setEditName(deck.name)
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" title="Xoá bộ" onClick={() => remove(deck)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  {deck.totalWords} từ · đã học {deck.learnedWords} · đã thuộc {deck.masteredWords}
                </p>
                <div
                  className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={learnedPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Tiến độ đã học"
                >
                  <div className="absolute inset-y-0 left-0 rounded-full bg-rose-200" style={{ width: `${learnedPct}%` }} />
                  <div className="absolute inset-y-0 left-0 rounded-full bg-[#C8322B]" style={{ width: `${masteredPct}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {learnedPct}% đã học · {masteredPct}% đã thuộc
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/flashcards/decks/${deck.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Xem và sửa từ
                  </Link>
                  {deck.dueWords > 0 && (
                    <Link
                      to={`/flashcards/review?deck=${deck.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8322B] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Ôn {deck.dueWords} thẻ đến hạn
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default DecksPage
