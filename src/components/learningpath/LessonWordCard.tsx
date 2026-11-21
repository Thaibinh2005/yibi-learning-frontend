import React, { useState } from 'react'
import { BookmarkPlus, Eye, LoaderCircle, PenLine } from 'lucide-react'
import { HighlightWord } from '@/components/ui/HighlightWord'
import { AudioButton } from '@/components/ui/AudioButton'
import type { WordStatus } from '@/api/srsApi'
import type { Vocabulary } from '@/types/vocabulary'

interface Props {
  hanzi: string
  pinyin: string
  partOfSpeech: string
  meaning: string
  /** The meaning is English because there is no Vietnamese one. */
  englishOnly: boolean
  example: { zh: string; vi: string } | null
  /** The matching word of the bank; absent when the list word could not be matched to a record. */
  word?: Vocabulary
  /** The learner's flashcard for the word; null when there is none. */
  status: WordStatus | null
  /** False until the states have loaded, so no badge flashes in the meantime. */
  statusLoaded: boolean
  saving: boolean
  /** Conceal the meaning and the translation until the learner taps them, to test themselves. */
  hideMeaning: boolean
  onOpen: (vocabularyId: number) => void
  /** Open the writing window for this word. */
  onWrite: () => void
  onSave: (vocabularyId: number) => void
}

const BADGE: Record<WordStatus['status'], { label: string; className: string }> = {
  NEW: { label: 'Đã lưu', className: 'bg-sky-50 text-sky-700' },
  LEARNING: { label: 'Đang học', className: 'bg-amber-50 text-amber-700' },
  MASTERED: { label: 'Đã thuộc', className: 'bg-emerald-50 text-emerald-700' },
}

/** One word of a lesson's vocabulary list: sound, its detail window, the learner's flashcard state and a way to save it. */
export const LessonWordCard: React.FC<Props> = ({
  hanzi, pinyin, partOfSpeech, meaning, englishOnly, example, word, status, statusLoaded, saving, hideMeaning, onOpen, onWrite, onSave,
}) => {
  const [revealed, setRevealed] = useState(false)
  const concealed = hideMeaning && !revealed
  const firstChar = Array.from(hanzi)[0] ?? ''
  const canWrite = /[\u4e00-\u9fff]/.test(firstChar)
  const exampleAudio = word?.exampleSentence === example?.zh ? word?.exampleAudioUrl : null

  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {word ? (
            <button
              type="button"
              onClick={() => onOpen(word.id)}
              title="Xem chi tiết từ"
              className="font-chinese rounded-lg text-xl font-bold text-slate-800 underline decoration-slate-300 decoration-dotted underline-offset-4 hover:text-[#C8322B] hover:decoration-[#C8322B]"
            >
              {hanzi}
            </button>
          ) : (
            <span className="font-chinese text-xl font-bold text-slate-800">{hanzi}</span>
          )}
          <AudioButton audioUrl={word?.audioUrl} text={hanzi} size="sm" title="Nghe phát âm từ" />
          <span className="text-sm text-[#C8322B]">{pinyin}</span>
          {partOfSpeech && <span className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-500">{partOfSpeech}</span>}
          {canWrite && (
            <button
              type="button"
              onClick={onWrite}
              title="Luyện viết từ này"
              aria-label={`Luyện viết ${hanzi}`}
              className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-[#C8322B]"
            >
              <PenLine className="h-4 w-4" />
            </button>
          )}
        </p>

        {word && statusLoaded && (
          <span className="flex items-center gap-1.5">
            {status ? (
              <>
                {status.due && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">Đến hạn ôn</span>}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE[status.status].className}`}>{BADGE[status.status].label}</span>
              </>
            ) : (
              <>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Chưa lưu</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(word.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  {saving ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
                  Lưu
                </button>
              </>
            )}
          </span>
        )}
      </div>

      {concealed ? (
        <button type="button" onClick={() => setRevealed(true)} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700">
          <Eye className="h-3.5 w-3.5" />
          Bấm để xem nghĩa
        </button>
      ) : meaning ? (
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{meaning}{englishOnly && ' (tiếng Anh)'}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-400">Chưa có nghĩa.</p>
      )}

      {example && !concealed && (
        <div className="mt-2 flex items-start gap-2 border-l-2 border-slate-200 pl-3 text-sm leading-relaxed">
          <p className="min-w-0 flex-1">
            <span className="font-chinese text-slate-800"><HighlightWord sentence={example.zh} word={hanzi} /></span>
            {example.vi && <span className="block text-xs text-slate-500">{example.vi}</span>}
          </p>
          <AudioButton audioUrl={exampleAudio} text={example.zh} size="sm" title="Nghe câu ví dụ" />
        </div>
      )}
    </article>
  )
}
