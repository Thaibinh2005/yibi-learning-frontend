import { topicIcon } from '@/components/vocabulary/topicIcons'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Info, LogIn, Play } from 'lucide-react'
import { AudioButton } from '@/components/ui/AudioButton'
import { HighlightWord } from '@/components/ui/HighlightWord'
import { MeasureWordList } from '@/components/flashcard/FlashcardParts'
import { EarlierLevels } from '@/components/flashcard/LevelMeaning'
import { StrokeWriter } from '@/components/hanzi/StrokeWriter'
import { PracticeRecorder } from './PracticeRecorder'
import type { Vocabulary, WordDetails } from '@/types/vocabulary'
import type { WordStudy } from '@/api/srsApi'

export const displayHanzi = (hanzi: string) => hanzi.replace(/[0-9]+$/, '')

/** Shown when a tab has no stored data, instead of anything made up. */
export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-500">
    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
    <div>{children}</div>
  </div>
)

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{children}</h3>
)

const LevelBadge: React.FC<{ level?: string | null; tone?: 'brand' | 'muted' }> = ({ level, tone = 'muted' }) =>
  level ? (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        tone === 'brand' ? 'bg-rose-50 text-[#C8322B]' : 'bg-slate-100 text-slate-600'
      }`}
    >
      HSK {level}
    </span>
  ) : null

const Loading: React.FC = () => (
  <div className="space-y-2">
    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
  </div>
)

type Example = WordDetails['examples'][number]

const ExampleCard: React.FC<{ word: string; example: Example; label?: React.ReactNode }> = ({ word, example, label }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
    <div className="flex items-start justify-between gap-3">
      <p className="font-chinese text-lg leading-relaxed text-slate-900">
        <HighlightWord sentence={example.zh} word={word} />
      </p>
      <AudioButton audioUrl={example.audioUrl} text={example.zh} size="sm" title="Nghe câu ví dụ" className="flex-shrink-0" />
    </div>
    {example.pinyin && <p className="font-pinyin mt-0.5 text-sm text-slate-500">{example.pinyin}</p>}
    <p className="mt-0.5 text-sm text-slate-700">{example.vi}</p>
    {label && <div className="mt-2">{label}</div>}
  </div>
)

/** The example to show under the main meaning: one written for the level meaning, else the word's own example. */
const mainExample = (vocab: Vocabulary, details: WordDetails | null): Example | null => {
  const forLevel = details?.examples.find((e) => e.forLevelMeaning)
  if (forLevel) return forLevel
  if (vocab.exampleSentence && vocab.exampleTranslation) {
    return { zh: vocab.exampleSentence, pinyin: vocab.examplePinyin, vi: vocab.exampleTranslation, audioUrl: vocab.exampleAudioUrl, forLevelMeaning: false }
  }
  return details?.examples[0] ?? null
}

// ── 1. Nghĩa & cách dùng ─────────────────────────────────────

export const MeaningTab: React.FC<{ vocab: Vocabulary; details: WordDetails | null }> = ({ vocab, details }) => {
  const [showFull, setShowFull] = useState(false)
  const lm = vocab.levelMeaning
  const word = displayHanzi(vocab.hanzi)
  const example = mainExample(vocab, details)
  const dictionary = (vocab.meaningVi || '').split(/[;；]/).map((s) => s.trim()).filter(Boolean)

  return (
    <div className="space-y-5">
      {lm ? (
        <>
          <section>
            <SectionTitle>Nghĩa chính ở HSK {lm.level}</SectionTitle>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3">
              <p className="text-lg font-semibold text-slate-900">{lm.main}</p>
              {lm.partOfSpeechVi && <p className="text-xs italic text-slate-500">({lm.partOfSpeechVi})</p>}
              {lm.newAtLevel && (
                <p className="mt-1 text-xs text-slate-600">
                  <span className="font-semibold">Mới ở HSK {lm.level}:</span> {lm.newAtLevel}
                </p>
              )}
              {example ? (
                <div className="mt-3">
                  <ExampleCard word={word} example={example} />
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Chưa có câu ví dụ cho nghĩa này.</p>
              )}
            </div>
          </section>

          <section>
            <SectionTitle>Nghĩa phụ</SectionTitle>
            {lm.secondary.length > 0 ? (
              <ul className="space-y-2">
                {lm.secondary.map((sense) => (
                  <li key={sense} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-2.5">
                    <p className="font-medium text-slate-800">{sense}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Chưa có câu ví dụ riêng cho nghĩa này.</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>Ở HSK {lm.level}, từ này chỉ học một nghĩa.</EmptyState>
            )}
          </section>

          <section>
            <SectionTitle>Ngữ cảnh sử dụng</SectionTitle>
            {lm.note ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">{lm.note}</p>
            ) : (
              <EmptyState>Chưa có ghi chú về ngữ cảnh sử dụng cho từ này.</EmptyState>
            )}
          </section>

          <EarlierLevels levelMeaning={lm} />
        </>
      ) : (
        <section>
          <SectionTitle>Nghĩa</SectionTitle>
          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
            <p className="text-lg font-semibold text-slate-900">{dictionary.slice(0, 2).join('; ') || 'Chưa có nghĩa tiếng Việt'}</p>
            {vocab.partOfSpeech && <p className="text-xs italic text-slate-500">({vocab.partOfSpeech})</p>}
            {example && (
              <div className="mt-3">
                <ExampleCard word={word} example={example} />
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">Từ này chưa có nghĩa chuẩn hoá theo cấp trong giáo trình chính thức.</p>
        </section>
      )}

      {dictionary.length > 1 && (
        <section>
          <button
            type="button"
            onClick={() => setShowFull((v) => !v)}
            aria-expanded={showFull}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFull ? 'rotate-180' : ''}`} />
            {showFull ? 'Ẩn nghĩa từ điển đầy đủ' : 'Xem nghĩa từ điển đầy đủ'}
          </button>
          {showFull && (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              {dictionary.map((sense) => (
                <li key={sense}>{sense}</li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  )
}

// ── 2. Ví dụ ─────────────────────────────────────────────────

export const ExamplesTab: React.FC<{ vocab: Vocabulary; details: WordDetails | null; failed: boolean }> = ({ vocab, details, failed }) => {
  const [showOthers, setShowOthers] = useState(false)
  if (failed) return <EmptyState>Không tải được câu ví dụ. Hãy đóng và mở lại.</EmptyState>
  if (!details) return <Loading />
  const word = displayHanzi(vocab.hanzi)
  const level = vocab.levelCode
  const ofLevel = details.examples.filter((e) => !level || e.levelCode === level)
  const others = details.examples.filter((e) => level && e.levelCode !== level)
  if (details.examples.length === 0) return <EmptyState>Từ này chưa có câu ví dụ.</EmptyState>
  return (
    <div className="space-y-3">
      {ofLevel.length > 0 ? (
        ofLevel.map((e) => (
          <ExampleCard
            key={e.zh}
            word={word}
            example={e}
            label={e.forLevelMeaning && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-[#C8322B]">Theo nghĩa HSK {e.levelCode}</span>}
          />
        ))
      ) : (
        <EmptyState>Chưa có câu ví dụ ở HSK {level}.</EmptyState>
      )}
      {others.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowOthers((v) => !v)}
            aria-expanded={showOthers}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showOthers ? 'rotate-180' : ''}`} />
            {showOthers ? 'Ẩn' : `Xem ${others.length} ví dụ ở cấp khác`}
          </button>
          {showOthers && (
            <div className="mt-2 space-y-3">
              {others.map((e) => (
                <ExampleCard key={e.zh} word={word} example={e} label={<LevelBadge level={e.levelCode} />} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 3. Cụm từ ────────────────────────────────────────────────

export const PhrasesTab: React.FC<{
  vocab: Vocabulary
  details: WordDetails | null
  failed: boolean
  onOpenWord: (id: number) => void
}> = ({ vocab, details, failed, onOpenWord }) => {
  const collocations = vocab.levelMeaning?.collocations ?? []
  const related = details?.relatedWords ?? []
  const groups = related.reduce<Record<string, typeof related>>((acc, w) => {
    ;(acc[w.via] ??= []).push(w)
    return acc
  }, {})
  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>Cụm từ thường gặp</SectionTitle>
        {collocations.length > 0 ? (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70 bg-white">
            {collocations.map((c) => (
              <li key={c.zh} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="font-chinese text-base text-slate-900">
                    <HighlightWord sentence={c.zh} word={displayHanzi(vocab.hanzi)} />
                  </p>
                  <p className="text-sm text-slate-600">{c.vi}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <LevelBadge level={vocab.levelMeaning?.level} tone="brand" />
                  <AudioButton text={c.zh} size="sm" title="Nghe cụm từ" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>Chưa có dữ liệu cụm từ cho từ này.</EmptyState>
        )}
      </section>

      {vocab.measureWords && vocab.measureWords.length > 0 && <MeasureWordList items={vocab.measureWords} className="w-full" />}

      <section>
        <SectionTitle>Từ liên quan (cùng chữ Hán)</SectionTitle>
        {failed ? (
          <EmptyState>Không tải được từ liên quan.</EmptyState>
        ) : !details ? (
          <Loading />
        ) : related.length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groups).map(([via, words]) => (
              <div key={via}>
                <p className="mb-1.5 text-xs text-slate-500">
                  Có chữ <span className="font-chinese text-base font-bold text-slate-800">{via}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {words.map((w) => (
                    <button
                      key={w.vocabularyId}
                      type="button"
                      onClick={() => onOpenWord(w.vocabularyId)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left hover:border-rose-200 hover:bg-rose-50/40"
                    >
                      <span className="font-chinese text-base font-semibold text-slate-900">{displayHanzi(w.hanzi)}</span>
                      {w.levelCode && <span className="ml-1.5 text-[10px] font-semibold text-slate-400">HSK {w.levelCode}</span>}
                      {w.meaning && <span className="block max-w-[11rem] truncate text-xs text-slate-500">{w.meaning}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>Chưa có từ HSK nào khác chứa chữ của từ này.</EmptyState>
        )}
      </section>

      {details && details.topics.length > 0 && (
        <section>
          <SectionTitle>Chủ đề</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {details.topics.map((t) => (
              <Link
                key={t.slug}
                to={`/vocabulary/topic/${t.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {React.createElement(topicIcon(t.icon), { className: 'h-3.5 w-3.5 text-slate-500', 'aria-hidden': true })}{t.titleVi}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── 4. Chữ Hán ───────────────────────────────────────────────

export const HanziTab: React.FC<{ vocab: Vocabulary; details: WordDetails | null; failed: boolean; onOpenWord: (id: number) => void }> = ({
  vocab,
  details,
  failed,
  onOpenWord,
}) => {
  const chars = details?.characters ?? []
  const [index, setIndex] = useState(0)
  const [strokes, setStrokes] = useState<Record<string, number>>({})
  const [missing, setMissing] = useState<Record<string, boolean>>({})
  if (failed) return <EmptyState>Không tải được thông tin chữ Hán.</EmptyState>
  if (!details) return <Loading />
  if (chars.length === 0) return <EmptyState>Không có chữ Hán để hiển thị.</EmptyState>
  const current = chars[Math.min(index, chars.length - 1)]
  const traditionalWord = vocab.hanziTraditional && vocab.hanziTraditional !== displayHanzi(vocab.hanzi) ? vocab.hanziTraditional : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>
          Giản thể: <span className="font-chinese text-lg font-bold text-slate-900">{displayHanzi(vocab.hanzi)}</span>
        </span>
        <span>
          Phồn thể:{' '}
          {traditionalWord ? (
            <span className="font-chinese text-lg font-bold text-slate-900">{traditionalWord}</span>
          ) : vocab.hanziTraditional ? (
            <span className="text-slate-500">giống giản thể</span>
          ) : (
            <span className="text-slate-400">chưa có dữ liệu</span>
          )}
        </span>
      </div>

      {chars.length > 1 && (
        <div className="flex gap-2" role="tablist" aria-label="Chọn chữ">
          {chars.map((c, i) => (
            <button
              key={c.hanzi}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`font-chinese h-11 w-11 rounded-xl border text-xl font-bold ${
                i === index ? 'border-[#C8322B] bg-rose-50 text-[#C8322B]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.hanzi}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
        <div className="mx-auto w-full max-w-[14rem] rounded-2xl border border-slate-200 bg-white p-2">
          {missing[current.hanzi] ? (
            <p className="p-6 text-center text-xs text-slate-500">Chưa có dữ liệu thứ tự nét cho chữ này.</p>
          ) : (
            <StrokeWriter
              key={current.hanzi}
              char={current.hanzi}
              mode="view"
              onProgress={(_, total) => setStrokes((s) => (s[current.hanzi] === total ? s : { ...s, [current.hanzi]: total }))}
              onMissingData={() => setMissing((m) => ({ ...m, [current.hanzi]: true }))}
            />
          )}
          <p className="mt-1 text-center text-[11px] text-slate-400">Thứ tự nét (lặp lại)</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 self-start text-sm">
          <dt className="text-slate-500">Chữ</dt>
          <dd className="font-chinese text-2xl font-bold text-slate-900">{current.hanzi}</dd>
          <dt className="text-slate-500">Phồn thể</dt>
          <dd className="font-chinese text-lg text-slate-800">
            {current.traditional ? (current.traditional === current.hanzi ? <span className="font-sans text-sm text-slate-500">giống giản thể</span> : current.traditional) : <span className="font-sans text-sm text-slate-400">chưa có dữ liệu</span>}
          </dd>
          <dt className="text-slate-500">Số nét</dt>
          <dd className="text-slate-800">{strokes[current.hanzi] ?? (missing[current.hanzi] ? <span className="text-slate-400">chưa có dữ liệu</span> : '…')}</dd>
          <dt className="text-slate-500">Bộ thủ</dt>
          <dd className="text-slate-400">chưa có dữ liệu đáng tin cậy</dd>
          {current.vocabularyId && (
            <>
              <dt className="text-slate-500">Là từ</dt>
              <dd>
                <button type="button" onClick={() => onOpenWord(current.vocabularyId!)} className="text-left hover:underline">
                  <span className="font-pinyin font-medium text-[#C8322B]">{current.pinyin}</span>
                  {current.meaning && <span className="text-slate-700"> – {current.meaning}</span>}
                  {current.levelCode && <span className="ml-1 text-xs text-slate-400">(HSK {current.levelCode})</span>}
                </button>
              </dd>
            </>
          )}
        </dl>
      </div>
      <Link to="/vocabulary/writing" className="inline-block text-xs font-semibold text-[#C8322B] hover:underline">
        Luyện viết chữ ở trang Viết chữ →
      </Link>
    </div>
  )
}

// ── 5. Luyện nói HSKK ────────────────────────────────────────

export const HskkTab: React.FC<{ vocab: Vocabulary; details: WordDetails | null }> = ({ vocab, details }) => {
  const word = displayHanzi(vocab.hanzi)
  const sentences = (details?.examples ?? []).filter((e) => !vocab.levelCode || e.levelCode === vocab.levelCode).slice(0, 3)
  const items = [
    { zh: word, pinyin: vocab.levelMeaning?.pinyin || vocab.pinyin, vi: vocab.levelMeaning?.main || '', audioUrl: vocab.audioUrl, label: 'Đọc từ' },
    ...sentences.map((s) => ({ zh: s.zh, pinyin: s.pinyin, vi: s.vi, audioUrl: s.audioUrl, label: 'Nhắc lại câu' })),
  ]
  return (
    <div className="space-y-3">
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
        Nghe câu mẫu, ghi âm giọng của bạn rồi nghe lại để tự so sánh. Bản ghi chỉ nằm trên trình duyệt này, không được gửi
        đi hay lưu lại, và Yibi không chấm điểm phát âm ở đây.
      </p>
      {items.map((item, i) => (
        <div key={`${item.zh}-${i}`} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="font-chinese text-lg text-slate-900">{item.zh}</p>
              {item.pinyin && <p className="font-pinyin text-sm text-slate-500">{item.pinyin}</p>}
              {item.vi && <p className="text-sm text-slate-600">{item.vi}</p>}
            </div>
            <AudioButton audioUrl={item.audioUrl} text={item.zh} size="md" title="Nghe mẫu" className="flex-shrink-0" />
          </div>
          <div className="mt-2">
            <PracticeRecorder />
          </div>
        </div>
      ))}
      {details && sentences.length === 0 && <EmptyState>Chưa có câu mẫu ở cấp này; bạn vẫn luyện đọc được từ.</EmptyState>}
      <Link to="/exams/hskk" className="inline-block text-xs font-semibold text-[#C8322B] hover:underline">
        Thi thử HSKK đầy đủ →
      </Link>
    </div>
  )
}

// ── 6. Ôn tập ────────────────────────────────────────────────

const STATUS: Record<'NEW' | 'LEARNING' | 'MASTERED', { label: string; className: string }> = {
  NEW: { label: 'Chưa học', className: 'bg-slate-100 text-slate-600' },
  LEARNING: { label: 'Đang nhớ', className: 'bg-amber-50 text-amber-700' },
  MASTERED: { label: 'Đã thuộc', className: 'bg-emerald-50 text-emerald-700' },
}

const formatDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const formatDate = (iso?: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('vi-VN') : '—')

export const ReviewTab: React.FC<{
  isAuthenticated: boolean
  study: WordStudy | null
  failed: boolean
  adding: boolean
  onAddFlashcard: () => void
}> = ({ isAuthenticated, study, failed, adding, onAddFlashcard }) => {
  if (!isAuthenticated) {
    return (
      <EmptyState>
        <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-[#C8322B] hover:underline">
          <LogIn className="h-3.5 w-3.5" />
          Đăng nhập
        </Link>{' '}
        để theo dõi trạng thái ghi nhớ và lịch ôn của từ này.
      </EmptyState>
    )
  }
  if (failed) return <EmptyState>Không tải được trạng thái ôn tập.</EmptyState>
  if (!study) return <Loading />
  const card = study.card
  const inDecks = study.decks.filter((d) => d.contains)
  return (
    <div className="space-y-5">
      {card ? (
        <>
          <section className="rounded-2xl border border-slate-200/70 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[card.status].className}`}>{STATUS[card.status].label}</span>
              {card.due && (
                <Link to="/flashcards" className="inline-flex items-center gap-1 rounded-lg bg-[#C8322B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800">
                  <Play className="h-3.5 w-3.5" />
                  Ôn ngay
                </Link>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Ôn tiếp theo</dt>
                <dd className="font-semibold text-slate-800">{card.due ? 'Hôm nay' : formatDate(card.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Lần ôn gần nhất</dt>
                <dd className="font-semibold text-slate-800">{card.lastReviewed ? formatDateTime(card.lastReviewed) : 'Chưa ôn'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Khoảng cách ôn</dt>
                <dd className="font-semibold text-slate-800">{card.intervalDays} ngày</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Nhớ đúng liên tiếp</dt>
                <dd className="font-semibold text-slate-800">{card.repetitions} lần</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Hệ số dễ (SRS)</dt>
                <dd className="font-semibold text-slate-800">{Number(card.easeFactor).toFixed(2)}</dd>
              </div>
            </dl>
          </section>
          <EmptyState>
            Lịch sử từng lần ôn chưa được lưu. Mục trên là trạng thái hiện tại theo lịch lặp lại ngắt quãng (SRS).
          </EmptyState>
        </>
      ) : (
        <EmptyState>
          Từ này chưa có trong flashcard của bạn.{' '}
          <button type="button" disabled={adding} onClick={onAddFlashcard} className="font-semibold text-[#C8322B] hover:underline disabled:opacity-50">
            Thêm vào flashcard
          </button>{' '}
          để bắt đầu ôn theo lịch.
        </EmptyState>
      )}

      <section>
        <SectionTitle>Có trong bộ từ vựng</SectionTitle>
        {inDecks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {inDecks.map((d) => (
              <Link key={d.id} to={`/flashcards/decks/${d.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                {d.name}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState>Từ này chưa nằm trong bộ từ vựng nào của bạn.</EmptyState>
        )}
      </section>
    </div>
  )
}
