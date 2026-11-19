import { createPortal } from 'react-dom'
import React, { useEffect, useRef, useState } from 'react'
import { BookOpen, Clock, Folder, FolderOpen, FolderPlus, Gamepad2, Layers, LoaderCircle, Play, Plus, Sparkles, X } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { createDeck, deckError, getDecks, type Deck } from '@/api/deckApi'
import { useAppSelector } from '@/app/hooks'
import { GuestNotice } from '@/components/ui/GuestNotice'
import { getDueFlashcards, type SrsCard } from '@/api/srsApi'
import { DueMemoryRing, memoryStateOf } from '@/components/flashcard/DueMemoryRing'





/** The review deck is the learner's own; a guest can still practise topic flashcards without saving. */
export const FlashcardPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (isAuthenticated) return <LearnerFlashcards />
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-800">Flashcard</h1>
        <p className="mt-1 text-xs text-slate-500">Ôn từ vựng theo lịch lặp lại ngắt quãng.</p>
      </header>
      <GuestNotice title="Bộ flashcard của riêng bạn" message="Đăng nhập để lưu từ vào bộ flashcard và được nhắc ôn đúng lúc. Bạn vẫn có thể luyện flashcard theo chủ đề mà không cần tài khoản." />
      <Link to="/vocabulary/topic" className="mx-auto flex w-fit items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand"><BookOpen className="h-4 w-4" />Luyện flashcard theo chủ đề</Link>
    </div>
  )
}

/**
 * The learner's flashcard home: on the left a small list of the words due today and, below it, their decks
 * (folders); on the right the large study area with the ways to study (the vocabulary games and related decks are
 * still being designed). A review opens on a page of its own without the menus (/flashcards/review).
 */
const LearnerFlashcards: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Old links (/flashcards?deck=<id>) meant "review this deck": they go to the review page.
  const legacyDeck = searchParams.get('deck')
  const [decks, setDecks] = useState<Deck[]>([])
  const [decksLoading, setDecksLoading] = useState(true)
  const [due, setDue] = useState<SrsCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)

  useEffect(() => {
    getDueFlashcards()
      .then((items) => {
        setDue(items)
        setError('')
      })
      .catch(() => setError('Không tải được thẻ cần ôn. Hãy thử tải lại trang.'))
      .finally(() => setLoading(false))
    getDecks()
      .then(setDecks)
      .catch(() => setDecks([]))
      .finally(() => setDecksLoading(false))
  }, [])

  if (legacyDeck) return <Navigate to={`/flashcards/review?deck=${encodeURIComponent(legacyDeck)}`} replace />

  const startReview = (deckId?: number) => navigate(deckId ? `/flashcards/review?deck=${deckId}` : '/flashcards/review')

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {creatingFolder && (
        <CreateFolderDialog
          onClose={() => setCreatingFolder(false)}
          onCreated={(deck) => {
            setCreatingFolder(false)
            setDecks((list) => [deck, ...list.filter((d) => d.id !== deck.id)])
          }}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        {/* ── Left: due words, then folders ── */}
        <aside className="space-y-5 lg:sticky lg:top-4">
          <DuePanel cards={due} loading={loading} onStart={() => startReview()} />
          <FolderPanel
            decks={decks}
            loading={decksLoading}
            onReview={startReview}
            onCreate={() => setCreatingFolder(true)}
          />
        </aside>

        {/* ── Right: the study area ── */}
        <section className="min-h-[28rem] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <StudyHub dueCount={due.length} loading={loading} onStart={() => startReview()} />
        </section>
      </div>
    </div>
  )
}


/** How many words are due today, by memory state; "Ôn ngay" lists them to look over, then starts the review. */
const DuePanel: React.FC<{
  cards: SrsCard[]
  loading: boolean
  onStart: () => void
}> = ({ cards, loading, onStart }) => (
  <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-[#C8322B] shadow-sm shadow-rose-100">
          <Clock className="h-5 w-5" aria-hidden />
        </span>
        Cần ôn hôm nay
      </h2>
      <span className="min-w-[2.25rem] rounded-full bg-[#C8322B] px-2.5 py-1 text-center text-sm font-bold text-white shadow-sm shadow-[#C8322B]/30">{loading ? '…' : cards.length}</span>
    </div>
    {loading ? (
      <div className="mt-3 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    ) : cards.length === 0 ? (
      <p className="mt-4 text-sm text-slate-500">Không còn thẻ nào đến hạn. Tuyệt vời!</p>
    ) : (
      <>
        <DueMemoryRing states={cards.map(memoryStateOf)} />
        <button
          type="button"
          onClick={onStart}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C8322B] px-4 py-3 text-base font-semibold text-white shadow-md shadow-[#C8322B]/25 transition hover:-translate-y-0.5 hover:bg-[#9B2323] active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none"
        >
          <Play className="h-4 w-4" aria-hidden />
          Ôn ngay
        </button>
      </>
    )}
  </div>
)

/** The learner's decks as folders: open one to see and edit its words, or review its due cards. */
const FolderPanel: React.FC<{
  decks: Deck[]
  loading: boolean
  onReview: (id: number) => void
  onCreate: () => void
}> = ({ decks, loading, onReview, onCreate }) => (
  <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-[#C8322B] shadow-sm shadow-rose-100">
          <FolderOpen className="h-5 w-5" aria-hidden />
        </span>
        Thư mục
      </h2>
      <button
        type="button"
        onClick={onCreate}
        title="Tạo thư mục mới"
        aria-label="Tạo thư mục mới"
        className="grid h-[54px] w-[54px] flex-shrink-0 place-items-center rounded-2xl bg-[#C8322B] text-white shadow-md shadow-[#C8322B]/25 outline-none transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#9B2323] hover:shadow-lg hover:shadow-[#C8322B]/30 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#C8322B]/50 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
    {loading ? (
      <div className="mt-3 space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    ) : decks.length === 0 ? (
      <p className="mt-4 text-sm text-slate-500">
        Chưa có thư mục nào.{' '}
        <button type="button" onClick={onCreate} className="font-semibold text-[#C8322B] hover:underline">
          Tạo thư mục
        </button>{' '}
        để gom các từ bạn muốn ôn.
      </p>
    ) : (
      <ul className="mt-4 max-h-80 space-y-1 overflow-y-auto pr-1">
        {decks.map((d) => (
          <li key={d.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
            <Link to={`/flashcards/decks/${d.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Folder className="h-6 w-6 flex-shrink-0 text-slate-400" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-slate-800">{d.name}</span>
                <span className="block text-sm text-slate-400">
                  {d.totalWords} từ · đã thuộc {d.masteredWords}
                </span>
              </span>
            </Link>
            {d.dueWords > 0 && (
              <button
                type="button"
                onClick={() => onReview(d.id)}
                title={`Ôn ${d.dueWords} thẻ đến hạn của bộ này`}
                className="flex-shrink-0 rounded-full bg-[#C8322B] px-3 py-1 text-xs font-bold text-white shadow-sm shadow-[#C8322B]/30 hover:bg-[#9B2323]"
              >
                Ôn {d.dueWords}
              </button>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
)

/**
 * The large study area before a review starts. The vocabulary games and the related decks are still being
 * designed, so they are placeholders; the flip-card review works now.
 */
const StudyHub: React.FC<{ dueCount: number; loading: boolean; onStart: () => void }> = ({ dueCount, loading, onStart }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-bold text-slate-800">Học từ vựng</h1>
      <p className="mt-1 text-sm text-slate-500">Chọn cách học. Thẻ cần ôn và thư mục của bạn ở cột bên trái.</p>
    </div>

    <button
      type="button"
      onClick={onStart}
      disabled={loading || dueCount === 0}
      className="flex w-full items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 text-left transition-colors hover:bg-rose-50 disabled:cursor-default disabled:opacity-60"
    >
      <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-[#C8322B] text-white">
        <Layers className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-slate-800">Ôn bằng thẻ lật</span>
        <span className="block text-sm text-slate-500">
          {loading ? 'Đang tải…' : dueCount > 0 ? `${dueCount} thẻ đang chờ bạn hôm nay` : 'Hôm nay không còn thẻ đến hạn'}
        </span>
      </span>
    </button>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
        <Gamepad2 className="h-7 w-7 text-slate-300" />
        <p className="mt-2 font-semibold text-slate-600">Trò chơi học từ vựng</p>
        <p className="mt-1 text-xs text-slate-400">Đang thiết kế</p>
      </div>
      <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
        <Sparkles className="h-7 w-7 text-slate-300" />
        <p className="mt-2 font-semibold text-slate-600">Bộ từ vựng liên quan</p>
        <p className="mt-1 text-xs text-slate-400">Đang thiết kế</p>
      </div>
    </div>
  </div>
)

/** A small dialog to name and create a folder (a personal deck) without leaving the flashcard page. */
const CreateFolderDialog: React.FC<{ onClose: () => void; onCreated: (deck: Deck) => void }> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    input.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      previous?.focus?.()
    }
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = name.trim()
    if (!clean || saving) return
    setSaving(true)
    try {
      onCreated(await createDeck(clean))
    } catch (err) {
      setError(deckError(err, 'Chưa tạo được thư mục. Hãy thử lại.'))
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-slate-900/45" onClick={onClose} aria-hidden />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-folder-title"
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="create-folder-title" className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <FolderPlus className="h-5 w-5 text-[#C8322B]" />
              Thư mục mới
            </h2>
            <p className="mt-1 text-xs text-slate-500">Gom các từ bạn muốn ôn vào một thư mục riêng.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>
        <label htmlFor="folder-name" className="mt-5 block text-xs font-semibold text-slate-600">
          Tên thư mục
        </label>
        <input
          ref={input}
          id="folder-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          maxLength={80}
          placeholder="Ví dụ: Từ đi du lịch"
          aria-invalid={!!error}
          aria-describedby={error ? 'folder-name-error' : undefined}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C8322B] focus:ring-2 focus:ring-[#C8322B]/15"
        />
        {error && (
          <p id="folder-name-error" className="mt-1.5 text-xs text-rose-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Huỷ
          </button>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8322B] px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Tạo thư mục
          </button>
        </div>
      </form>
    </div>
    , document.body
  )
}
