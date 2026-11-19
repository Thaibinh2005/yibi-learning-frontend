import { createPortal } from 'react-dom'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bookmark, BookmarkCheck, Check, Flag, FolderPlus, LoaderCircle, X } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { AudioButton } from '@/components/ui/AudioButton'
import { shortMeaning } from '@/components/flashcard/LevelMeaning'
import { getVocabularyById, getWordDetails } from '@/api/vocabularyApi'
import { addFlashcard, getWordStudy, type WordStudy } from '@/api/srsApi'
import { addDeckWords, createDeck, deckError, removeDeckWords } from '@/api/deckApi'
import type { Vocabulary, WordDetails } from '@/types/vocabulary'
import { displayHanzi, ExamplesTab, HanziTab, HskkTab, MeaningTab, PhrasesTab, ReviewTab } from './WordDetailTabs'

/** The deck that holds the words marked hard; made the first time a word is marked. */
export const HARD_DECK_NAME = 'Từ khó'
const isHardDeck = (name: string) => name.trim().toLocaleLowerCase('vi') === HARD_DECK_NAME.toLocaleLowerCase('vi')

const TABS = [
  { key: 'meaning', label: 'Nghĩa & cách dùng' },
  { key: 'examples', label: 'Ví dụ' },
  { key: 'phrases', label: 'Cụm từ' },
  { key: 'hanzi', label: 'Chữ Hán' },
  { key: 'hskk', label: 'Luyện nói HSKK' },
  { key: 'review', label: 'Ôn tập' },
] as const
type TabKey = (typeof TABS)[number]['key']

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, audio[controls], [tabindex]:not([tabindex="-1"])'

/**
 * The detail of a word in a modal, over the page the learner is on. On a wide screen it is as wide as a flashcard
 * (max-w-2xl) and keeps one height whatever the tab, so switching tabs does not resize it; on a phone it is a sheet. It shows what the word's level teaches first,
 * reads only stored data (an empty tab says so), and lets a signed-in learner save the word to their decks or mark
 * it hard. A related word opens in the same modal, with a way back.
 */
export const WordDetailModal: React.FC<{ vocabularyId: number; onClose: () => void; onChanged?: () => void }> = ({
  vocabularyId,
  onClose,
  onChanged,
}) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [trail, setTrail] = useState<number[]>([vocabularyId])
  const currentId = trail[trail.length - 1]
  const [tab, setTab] = useState<TabKey>('meaning')

  const [vocab, setVocab] = useState<Vocabulary | null>(null)
  const [vocabFailed, setVocabFailed] = useState(false)
  const [details, setDetails] = useState<WordDetails | null>(null)
  const [detailsFailed, setDetailsFailed] = useState(false)
  const [study, setStudy] = useState<WordStudy | null>(null)
  const [studyFailed, setStudyFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)
  const [newDeck, setNewDeck] = useState('')

  const panel = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTrail([vocabularyId])
  }, [vocabularyId])

  const loadStudy = useCallback(
    (id: number) => {
      if (!isAuthenticated) return
      getWordStudy(id)
        .then((s) => {
          setStudy(s)
          setStudyFailed(false)
        })
        .catch(() => setStudyFailed(true))
    },
    [isAuthenticated]
  )

  useEffect(() => {
    let cancelled = false
    setVocab(null)
    setDetails(null)
    setStudy(null)
    setVocabFailed(false)
    setDetailsFailed(false)
    setStudyFailed(false)
    setMessage('')
    setSaveOpen(false)
    scroller.current?.scrollTo({ top: 0 })
    getVocabularyById(currentId)
      .then((res) => !cancelled && (res.success ? setVocab(res.data) : setVocabFailed(true)))
      .catch(() => !cancelled && setVocabFailed(true))
    getWordDetails(currentId)
      .then((res) => !cancelled && (res.success ? setDetails(res.data) : setDetailsFailed(true)))
      .catch(() => !cancelled && setDetailsFailed(true))
    if (isAuthenticated) {
      getWordStudy(currentId)
        .then((s) => !cancelled && setStudy(s))
        .catch(() => !cancelled && setStudyFailed(true))
    }
    return () => {
      cancelled = true
    }
  }, [currentId, isAuthenticated])

  // Page behind does not scroll; Esc closes (or first closes the save menu); focus stays inside and returns after.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (saveOpen) setSaveOpen(false)
        else onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const nodes = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    // Capture, so page shortcuts (flashcard keys) never see the keys pressed in the modal.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose, saveOpen])

  const openWord = (id: number) => {
    if (id === currentId) return
    setTrail((t) => [...t, id])
    setTab('meaning')
  }

  const act = async (action: () => Promise<string>) => {
    if (busy) return
    setBusy(true)
    try {
      setMessage(await action())
      loadStudy(currentId)
      onChanged?.()
    } catch (err) {
      setMessage(deckError(err, 'Chưa thực hiện được. Hãy thử lại.'))
    } finally {
      setBusy(false)
    }
  }

  const decks = study?.decks ?? []
  const hardDeck = decks.find((d) => isHardDeck(d.name))
  const isHard = !!hardDeck?.contains
  const savedCount = decks.filter((d) => d.contains && !isHardDeck(d.name)).length

  const toggleDeck = (deck: { id: number; name: string; contains: boolean }) =>
    act(async () => {
      if (deck.contains) {
        await removeDeckWords(deck.id, [currentId])
        return `Đã bỏ khỏi "${deck.name}".`
      }
      const r = await addDeckWords(deck.id, [currentId])
      return r.changed ? `Đã lưu vào "${deck.name}".` : `Từ đã có trong "${deck.name}".`
    })

  const createAndSave = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newDeck.trim()
    if (!name) return
    act(async () => {
      const deck = await createDeck(name)
      await addDeckWords(deck.id, [currentId])
      setNewDeck('')
      return `Đã tạo bộ "${deck.name}" và lưu từ.`
    })
  }

  const toggleHard = () =>
    act(async () => {
      if (hardDeck?.contains) {
        await removeDeckWords(hardDeck.id, [currentId])
        return 'Đã bỏ đánh dấu từ khó.'
      }
      const deck = hardDeck ?? (await createDeck(HARD_DECK_NAME))
      await addDeckWords(deck.id, [currentId])
      return `Đã đánh dấu là từ khó (bộ "${HARD_DECK_NAME}").`
    })

  const addCard = () =>
    act(async () => {
      await addFlashcard(currentId)
      return 'Đã thêm vào flashcard. Từ này sẽ có trong lượt ôn hôm nay.'
    })

  const word = vocab ? displayHanzi(vocab.hanzi) : ''
  const lm = vocab?.levelMeaning
  const pinyin = lm?.pinyin || vocab?.pinyin
  const partOfSpeech = lm?.partOfSpeechVi || vocab?.partOfSpeech
  const level = lm?.level || vocab?.levelCode

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-detail-title"
        tabIndex={-1}
        className="relative flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#FAF8F4] shadow-2xl outline-none sm:h-[min(86vh,50rem)] sm:max-w-2xl sm:rounded-3xl"
      >
        {/* Header: stays in view while the content scrolls */}
        <header className="border-b border-slate-200/80 bg-white px-5 pb-3 pt-4 sm:px-6">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden />
          <div className="flex items-start gap-3">
            {trail.length > 1 && (
              <button
                type="button"
                onClick={() => setTrail((t) => t.slice(0, -1))}
                className="mt-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Quay lại từ trước"
                title="Quay lại từ trước"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              {vocab ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 id="word-detail-title" className="font-chinese text-4xl font-bold leading-tight text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                      {word}
                    </h2>
                    <AudioButton audioUrl={vocab.audioUrl} text={word} size="lg" title="Nghe phát âm" />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold text-[#C8322B]">{pinyin}</p>
                  <p className="mt-0.5 text-base font-medium text-slate-800">{shortMeaning(lm, vocab.meaningVi?.split(/[;；]/)[0])}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    {partOfSpeech && <span className="italic text-slate-500">({partOfSpeech})</span>}
                    {level && <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-[#C8322B]">HSK {level}</span>}
                    {isHard && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">Từ khó</span>}
                  </div>
                </>
              ) : vocabFailed ? (
                <p id="word-detail-title" className="py-3 text-sm text-rose-700">Không tải được từ này.</p>
              ) : (
                <div id="word-detail-title" className="space-y-2 py-1" aria-label="Đang tải">
                  <div className="h-10 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                </div>
              )}
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Đóng" title="Đóng (Esc)">
              <X className="h-5 w-5" />
            </button>
          </div>

          {vocab && (
            <div className="relative mt-3 flex flex-wrap gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSaveOpen((v) => !v)}
                    aria-expanded={saveOpen}
                    aria-haspopup="true"
                    disabled={!study}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                      savedCount ? 'bg-[#C8322B] text-white hover:bg-red-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {savedCount ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {savedCount ? `Đã lưu (${savedCount} bộ)` : 'Lưu từ'}
                  </button>
                  <button
                    type="button"
                    onClick={toggleHard}
                    disabled={!study || busy}
                    aria-pressed={isHard}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                      isHard ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Flag className="h-4 w-4" />
                    {isHard ? 'Bỏ đánh dấu từ khó' : 'Đánh dấu từ khó'}
                  </button>
                </>
              ) : (
                <Link to="/login" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <Bookmark className="h-4 w-4" />
                  Đăng nhập để lưu từ
                </Link>
              )}
              {busy && <LoaderCircle className="h-4 w-4 animate-spin self-center text-slate-400" />}

              {saveOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Lưu vào bộ từ vựng</p>
                  {decks.filter((d) => !isHardDeck(d.name)).length > 0 ? (
                    <ul className="max-h-48 space-y-1 overflow-y-auto">
                      {decks
                        .filter((d) => !isHardDeck(d.name))
                        .map((d) => (
                          <li key={d.id}>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => toggleDeck(d)}
                              aria-pressed={d.contains}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
                            >
                              <span className={`grid h-4 w-4 flex-shrink-0 place-items-center rounded border ${d.contains ? 'border-[#C8322B] bg-[#C8322B] text-white' : 'border-slate-300'}`}>
                                {d.contains && <Check className="h-3 w-3" />}
                              </span>
                              <span className="min-w-0 truncate">{d.name}</span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">Bạn chưa có bộ từ vựng nào.</p>
                  )}
                  <form onSubmit={createAndSave} className="mt-2 flex gap-1.5 border-t border-slate-100 pt-2">
                    <input
                      value={newDeck}
                      onChange={(e) => setNewDeck(e.target.value)}
                      maxLength={80}
                      placeholder="Tạo bộ mới…"
                      aria-label="Tên bộ mới"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-[#C8322B]"
                    />
                    <button type="submit" disabled={!newDeck.trim() || busy} className="rounded-lg bg-[#C8322B] p-1.5 text-white disabled:opacity-50" aria-label="Tạo bộ và lưu từ" title="Tạo bộ và lưu từ">
                      <FolderPlus className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
          {message && <p className="mt-2 text-xs text-slate-600" role="status">{message}</p>}
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200/80 bg-white px-3 sm:px-4" role="tablist" aria-label="Nội dung từ">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`word-tab-${t.key}`}
              aria-selected={tab === t.key}
              aria-controls="word-tab-panel"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key ? 'border-[#C8322B] text-[#C8322B]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content: the only part that scrolls */}
        <div ref={scroller} id="word-tab-panel" role="tabpanel" aria-labelledby={`word-tab-${tab}`} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          {!vocab ? (
            vocabFailed ? null : <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ) : tab === 'meaning' ? (
            <MeaningTab vocab={vocab} details={details} />
          ) : tab === 'examples' ? (
            <ExamplesTab vocab={vocab} details={details} failed={detailsFailed} />
          ) : tab === 'phrases' ? (
            <PhrasesTab vocab={vocab} details={details} failed={detailsFailed} onOpenWord={openWord} />
          ) : tab === 'hanzi' ? (
            <HanziTab key={currentId} vocab={vocab} details={details} failed={detailsFailed} onOpenWord={openWord} />
          ) : tab === 'hskk' ? (
            <HskkTab key={currentId} vocab={vocab} details={details} />
          ) : (
            <ReviewTab isAuthenticated={isAuthenticated} study={study} failed={studyFailed} adding={busy} onAddFlashcard={addCard} />
          )}
        </div>
      </div>
    </div>
    , document.body
  )
}

export default WordDetailModal
