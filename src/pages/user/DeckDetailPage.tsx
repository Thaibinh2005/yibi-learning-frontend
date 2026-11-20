import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowUpWideNarrow,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FolderInput,
  LoaderCircle,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { GuestNotice } from '@/components/ui/GuestNotice'
import { shortMeaning } from '@/components/flashcard/LevelMeaning'
import { getVocabularies } from '@/api/vocabularyApi'
import { getTopics } from '@/api/topicApi'
import {
  addDeckWords,
  deckError,
  getDecks,
  getDeckWords,
  removeDeckWords,
  transferDeckWords,
  type Deck,
  type DeckWord,
  type DeckWordPage,
  type DeckWordSort,
  type DeckWordStatusFilter,
  type MemoryStatus,
} from '@/api/deckApi'
import type { Vocabulary } from '@/types/vocabulary'
import { WordDetailModal } from '@/components/vocabulary/word-detail/WordDetailModal'
import type { VocabTopic } from '@/types/topic'

const PAGE_SIZE = 50
const LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']
const displayHanzi = (hanzi: string) => hanzi.replace(/[0-9]+$/, '')

const STATUS_LABEL: Record<MemoryStatus, { label: string; className: string }> = {
  NEW: { label: 'Chưa học', className: 'bg-slate-100 text-slate-600' },
  LEARNING: { label: 'Đang nhớ', className: 'bg-amber-50 text-amber-700' },
  MASTERED: { label: 'Đã thuộc', className: 'bg-emerald-50 text-emerald-700' },
}

const SORT_LABEL: Record<DeckWordSort, string> = {
  added: 'Ngày thêm',
  reviewed: 'Lần ôn gần nhất',
  memory: 'Mức độ ghi nhớ',
}

/** Default direction per sort: newest first for dates, weakest first for memory. */
const DEFAULT_DIRECTION: Record<DeckWordSort, 'asc' | 'desc'> = { added: 'desc', reviewed: 'desc', memory: 'asc' }

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#C8322B]'

const useDebounced = <T,>(value: T, delay = 300) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—')

export const DeckDetailPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (!isAuthenticated) {
    return <GuestNotice title="Bộ từ vựng cá nhân" message="Đăng nhập để xem và sửa bộ từ vựng của bạn." />
  }
  return <LearnerDeck />
}

const LearnerDeck: React.FC = () => {
  const deckId = Number(useParams<{ deckId: string }>().deckId)

  const [data, setData] = useState<DeckWordPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [openWordId, setOpenWordId] = useState<number | null>(null)
  // Saving or marking a word in the modal can change this deck, so it is read again when the modal closes.
  const changedInModal = useRef(false)

  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState<DeckWordStatusFilter>('')
  const [sort, setSort] = useState<DeckWordSort>('added')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounced(search.trim())

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [otherDecks, setOtherDecks] = useState<Deck[]>([])
  const [targetDeck, setTargetDeck] = useState('')
  const [topics, setTopics] = useState<VocabTopic[]>([])

  // Only the latest request may show its result, so a slow older answer never replaces a newer filter's list.
  const requestSeq = useRef(0)
  const load = useCallback(() => {
    const seq = ++requestSeq.current
    setLoading(true)
    getDeckWords(deckId, { search: debouncedSearch, level, topic, status, sort, direction, page, size: PAGE_SIZE })
      .then((result) => {
        if (seq !== requestSeq.current) return
        setData(result)
        setError('')
      })
      .catch((err) => seq === requestSeq.current && setError(deckError(err, 'Không tải được bộ từ vựng.')))
      .finally(() => seq === requestSeq.current && setLoading(false))
  }, [deckId, debouncedSearch, level, topic, status, sort, direction, page])

  useEffect(load, [load])

  // A new filter shows its first page, with nothing selected.
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, level, topic, status, sort, direction])
  useEffect(() => {
    setSelected(new Set())
  }, [debouncedSearch, level, topic, status, sort, direction, page])

  useEffect(() => {
    getDecks().then((list) => setOtherDecks(list.filter((d) => d.id !== deckId))).catch(() => setOtherDecks([]))
    getTopics({ sort: 'az' })
      .then((res) => setTopics(res.success ? res.data : []))
      .catch(() => setTopics([]))
  }, [deckId])

  const members = useMemo(() => new Set(data?.memberIds ?? []), [data])
  const items = data?.items ?? []
  const allOnPageSelected = items.length > 0 && items.every((w) => selected.has(w.vocabularyId))
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const filtered = !!(debouncedSearch || level || topic || status)

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const run = async (action: () => Promise<string>) => {
    if (busy) return
    setBusy(true)
    try {
      setNotice(await action())
      setError('')
      setSelected(new Set())
      load()
      getDecks().then((list) => setOtherDecks(list.filter((d) => d.id !== deckId))).catch(() => undefined)
    } catch (err) {
      setError(deckError(err, 'Chưa thực hiện được. Hãy thử lại.'))
    } finally {
      setBusy(false)
    }
  }

  const ids = [...selected]
  const removeSelected = () =>
    window.confirm(`Bỏ ${ids.length} từ khỏi bộ này? Tiến độ ghi nhớ của từ vẫn được giữ.`) &&
    run(async () => {
      const r = await removeDeckWords(deckId, ids)
      return `Đã bỏ ${r.changed} từ khỏi bộ.`
    })

  const transfer = (mode: 'MOVE' | 'COPY') => {
    const target = otherDecks.find((d) => String(d.id) === targetDeck)
    if (!target) return
    run(async () => {
      const r = await transferDeckWords(deckId, target.id, mode, ids)
      const verb = mode === 'MOVE' ? 'Đã chuyển' : 'Đã sao chép'
      return `${verb} ${r.changed} từ sang "${target.name}"${r.skipped ? ` (${r.skipped} từ đã có sẵn ở đó)` : ''}.`
    })
  }

  const addWords = (vocabularyIds: number[]) =>
    run(async () => {
      const r = await addDeckWords(deckId, vocabularyIds)
      return r.changed ? `Đã thêm ${r.changed} từ vào bộ.` : 'Các từ này đã có trong bộ.'
    })

  const deck = data?.deck

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <Link to="/flashcards/decks" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#C8322B]">
          <ArrowLeft className="h-3.5 w-3.5" />
          Bộ từ vựng của tôi
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-slate-800">{deck?.name ?? 'Bộ từ vựng'}</h1>
            {deck && (
              <p className="mt-1 text-xs text-slate-500">
                {deck.totalWords} từ · đã học {deck.learnedWords} · đã thuộc {deck.masteredWords} · {deck.dueWords} thẻ đến hạn
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              aria-expanded={showAdd}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAdd ? 'Đóng' : 'Thêm từ'}
            </button>
            {deck && deck.dueWords > 0 && (
              <Link
                to={`/flashcards/review?deck=${deckId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8322B] px-3 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                <Play className="h-4 w-4" />
                Ôn {deck.dueWords} thẻ
              </Link>
            )}
          </div>
        </div>
        {deck && deck.totalWords > 0 && (
          <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="absolute inset-y-0 left-0 rounded-full bg-rose-200" style={{ width: `${(deck.learnedWords / deck.totalWords) * 100}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-[#C8322B]" style={{ width: `${(deck.masteredWords / deck.totalWords) * 100}%` }} />
          </div>
        )}
      </header>

      {showAdd && <AddWordsPanel members={members} busy={busy} onAdd={addWords} />}

      {openWordId !== null && (
        <WordDetailModal
          vocabularyId={openWordId}
          onChanged={() => {
            changedInModal.current = true
          }}
          onClose={() => {
            setOpenWordId(null)
            if (changedInModal.current) {
              changedInModal.current = false
              load()
            }
          }}
        />
      )}

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button type="button" title="Ẩn" onClick={() => setNotice('')} className="rounded p-1 hover:bg-emerald-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {/* Filters and sort */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm trong bộ: chữ Hán, pinyin hoặc nghĩa tiếng Việt"
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C8322B]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass} aria-label="Lọc theo cấp HSK">
            <option value="">Mọi cấp HSK</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>HSK {l}</option>
            ))}
          </select>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${selectClass} max-w-[14rem]`} aria-label="Lọc theo chủ đề">
            <option value="">Mọi chủ đề</option>
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>{t.icon} {t.titleVi}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as DeckWordStatusFilter)} className={selectClass} aria-label="Lọc theo trạng thái ghi nhớ">
            <option value="">Mọi trạng thái</option>
            <option value="NEW">Chưa học</option>
            <option value="LEARNING">Đang nhớ</option>
            <option value="MASTERED">Đã thuộc</option>
            <option value="LEARNED">Đã học (đang nhớ + đã thuộc)</option>
            <option value="DUE">Đến hạn ôn</option>
          </select>
          <div className="ml-auto flex items-center gap-1">
            <select
              value={sort}
              onChange={(e) => {
                const next = e.target.value as DeckWordSort
                setSort(next)
                setDirection(DEFAULT_DIRECTION[next])
              }}
              className={selectClass}
              aria-label="Sắp xếp"
            >
              {(Object.keys(SORT_LABEL) as DeckWordSort[]).map((s) => (
                <option key={s} value={s}>Xếp theo: {SORT_LABEL[s]}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
              title={direction === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              aria-label={direction === 'asc' ? 'Đang tăng dần, bấm để giảm dần' : 'Đang giảm dần, bấm để tăng dần'}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              {direction === 'asc' ? <ArrowUpWideNarrow className="h-4 w-4" /> : <ArrowDownWideNarrow className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/95 p-3 text-sm shadow-sm backdrop-blur">
          <span className="font-semibold text-[#C8322B]">Đã chọn {selected.size} từ</span>
          <button
            type="button"
            disabled={busy}
            onClick={removeSelected}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Bỏ khỏi bộ
          </button>
          {otherDecks.length > 0 ? (
            <>
              <select value={targetDeck} onChange={(e) => setTargetDeck(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs" aria-label="Bộ đích">
                <option value="">Chọn bộ đích…</option>
                {otherDecks.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy || !targetDeck}
                onClick={() => transfer('MOVE')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FolderInput className="h-3.5 w-3.5" />
                Di chuyển
              </button>
              <button
                type="button"
                disabled={busy || !targetDeck}
                onClick={() => transfer('COPY')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" />
                Sao chép
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-500">Tạo thêm bộ khác để di chuyển hoặc sao chép từ.</span>
          )}
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-700">
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Words */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading && !data ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Đang tải từ...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {filtered ? 'Không có từ nào khớp bộ lọc.' : 'Bộ này chưa có từ nào. Bấm "Thêm từ" để chọn từ trong kho HSK.'}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={() =>
                  setSelected(allOnPageSelected ? new Set() : new Set(items.map((w) => w.vocabularyId)))
                }
                aria-label="Chọn tất cả từ trên trang"
                className="h-4 w-4 accent-[#C8322B]"
              />
              <span>{data?.total} từ{filtered ? ' khớp bộ lọc' : ''}</span>
              {loading && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
            </div>
            <ul className="divide-y divide-slate-100">
              {items.map((w) => (
                <WordRow
                  key={w.vocabularyId}
                  word={w}
                  checked={selected.has(w.vocabularyId)}
                  onToggle={() => toggle(w.vocabularyId)}
                  onOpen={() => setOpenWordId(w.vocabularyId)}
                />
              ))}
            </ul>
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3 border-t border-slate-100 p-3 text-sm">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-slate-600">Trang {page + 1} / {pageCount}</span>
                <button
                  type="button"
                  disabled={page + 1 >= pageCount}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

const WordRow: React.FC<{ word: DeckWord; checked: boolean; onToggle: () => void; onOpen: () => void }> = ({
  word,
  checked,
  onToggle,
  onOpen,
}) => {
  const status = STATUS_LABEL[word.status]
  return (
    <li className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50/70 ${checked ? 'bg-rose-50/50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        aria-label={`Chọn ${displayHanzi(word.hanzi)}`}
        className="mt-1.5 h-4 w-4 flex-shrink-0 accent-[#C8322B]"
      />
      <button
        type="button"
        onClick={onOpen}
        title="Xem chi tiết từ"
        className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#C8322B]/30"
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-chinese text-xl font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {displayHanzi(word.hanzi)}
          </span>
          {word.pinyin && <span className="font-pinyin text-sm font-medium text-[#C8322B]">{word.pinyin}</span>}
          {word.levelCode && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">HSK {word.levelCode}</span>}
        </div>
        {word.meaning && <p className="mt-0.5 text-sm text-slate-600">{word.meaning}</p>}
      </button>
      <div className="flex flex-shrink-0 flex-col items-end gap-1 text-right">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
        <span className="text-[11px] text-slate-400">
          {word.lastReviewed ? `Ôn ${formatDate(word.lastReviewed)}` : `Thêm ${formatDate(word.addedAt)}`}
        </span>
        {word.due && <span className="text-[11px] font-semibold text-[#C8322B]">Đến hạn ôn</span>}
      </div>
    </li>
  )
}

/** Search the HSK bank (chữ Hán, pinyin or Vietnamese meaning) and add words to the deck. */
const AddWordsPanel: React.FC<{ members: Set<number>; busy: boolean; onAdd: (ids: number[]) => void }> = ({ members, busy, onAdd }) => {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('')
  const [results, setResults] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const debounced = useDebounced(query.trim())

  useEffect(() => {
    if (!debounced && !level) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    getVocabularies({ search: debounced || undefined, hskLevel: level || undefined, size: 30 })
      .then((res) => {
        if (cancelled) return
        setResults(res.success && Array.isArray(res.data) ? res.data : [])
        setFailed(false)
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [debounced, level])

  const notAdded = results.filter((v) => !members.has(v.id)).map((v) => v.id)

  return (
    <section className="space-y-3 rounded-2xl border border-rose-200 bg-white p-4">
      <h2 className="text-sm font-bold text-slate-800">Thêm từ từ kho HSK</h2>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ chữ Hán, pinyin (ni hao) hoặc nghĩa (xin chào)"
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C8322B]"
          />
        </div>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass} aria-label="Cấp HSK của từ cần thêm">
          <option value="">Mọi cấp HSK</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>HSK {l}</option>
          ))}
        </select>
      </div>

      {failed && <p className="text-sm text-rose-700">Không tìm được từ. Hãy thử lại.</p>}
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tìm...
        </p>
      ) : results.length > 0 ? (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{results.length} kết quả</span>
            {notAdded.length > 1 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onAdd(notAdded)}
                className="font-semibold text-[#C8322B] hover:underline disabled:opacity-50"
              >
                Thêm cả {notAdded.length} từ
              </button>
            )}
          </div>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-100">
            {results.map((v) => {
              const added = members.has(v.id)
              return (
                <li key={v.id} className="flex items-center gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-chinese text-lg font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        {displayHanzi(v.hanzi)}
                      </span>
                      <span className="font-pinyin text-sm text-[#C8322B]">{v.pinyin}</span>
                      {v.levelCode && <span className="text-[11px] font-semibold text-slate-500">HSK {v.levelCode}</span>}
                    </div>
                    <p className="truncate text-sm text-slate-600">{shortMeaning(v.levelMeaning, v.meaningVi)}</p>
                  </div>
                  {added ? (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      Đã có
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onAdd([v.id])}
                      className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-[#C8322B] hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      ) : debounced || level ? (
        <p className="text-sm text-slate-500">Không tìm thấy từ nào.</p>
      ) : (
        <p className="text-sm text-slate-500">Mỗi từ được thêm sẽ có một thẻ flashcard để ôn, nếu bạn chưa có thẻ của từ đó.</p>
      )}
    </section>
  )
}

export default DeckDetailPage
