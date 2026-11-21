import React from 'react'
import { Eye, LoaderCircle, RotateCcw, Trophy } from 'lucide-react'
import { displayHanzi, type CardSession } from '@/components/flashcard/useCardSession'
import {
  ExampleSentence,
  FlipCard,
  MeasureWordList,
  RATING_BUTTONS,
  RatingButtons,
  WordAudio,
} from '@/components/flashcard/FlashcardParts'
import { LevelMeaningBlock } from '@/components/flashcard/LevelMeaning'

/** Layout shared by both faces: capped to the screen, and what does not fit scrolls inside the card. */
const FACE = 'flex min-h-56 max-h-[calc(100dvh-21rem)] w-full flex-col items-center overflow-y-auto rounded-2xl px-5 py-5 text-center transition-colors'

/** Centres the content of a face while it is short, and lets it start at the top while it is long. */
const CONTENT = 'my-auto flex w-full flex-col items-center'

interface Props {
  session: CardSession
  /** Heading and body of the finished screen. */
  doneTitle: string
  doneText: string
  /** Buttons after "Học lại từ đầu" on the finished screen. */
  doneActions?: React.ReactNode
  /** Shown instead of the cards when the list has no words. */
  empty: React.ReactNode
}

/** The card, its rating buttons and the finished screen of a flashcard session (topic page, lesson modal). */
export const CardSessionView: React.FC<Props> = ({ session, doneTitle, doneText, doneActions, empty }) => {
  const { current, revealed, setRevealed, saving, error, notice, counts, rate, restart, total, waitingMinutes } = session

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {current ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{notice || 'Bấm vào thẻ hoặc nhấn Space để lật'}</span>
            {current.vocab.levelCode && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-semibold text-stone-600">
                HSK {current.vocab.levelCode}
              </span>
            )}
          </div>

          {waitingMinutes > 0 && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
              Bạn đã đi hết các thẻ mới — thẻ này còn {waitingMinutes} phút nữa mới đến lượt, ôn sớm cũng được.
            </p>
          )}

          <FlipCard
            key={current.key}
            flipped={revealed}
            onFlip={() => setRevealed((r) => !r)}
            className="my-3"
            frontClassName={`${FACE} bg-stone-50 hover:bg-stone-100`}
            backClassName={`${FACE} border border-stone-200 bg-white`}
            front={
              <div className={CONTENT}>
                <span
                  className="text-5xl font-bold tracking-wide text-stone-900 sm:text-6xl"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {displayHanzi(current.vocab.hanzi)}
                </span>
                <WordAudio hanzi={displayHanzi(current.vocab.hanzi)} audioUrl={current.vocab.audioUrl} />
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-stone-400">
                  <Eye className="h-4 w-4" />
                  Nhấn để xem phiên âm và nghĩa
                </span>
              </div>
            }
            back={
              <div className={CONTENT}>
                <span
                  className="text-4xl font-bold tracking-wide text-stone-900 sm:text-5xl"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {displayHanzi(current.vocab.hanzi)}
                </span>
                <WordAudio hanzi={displayHanzi(current.vocab.hanzi)} audioUrl={current.vocab.audioUrl} />
                <p className="font-pinyin mt-2 text-xl font-semibold text-[#C8322B]">{current.vocab.pinyin}</p>
                <LevelMeaningBlock
                  levelMeaning={current.vocab.levelMeaning}
                  meaningVi={current.vocab.meaningVi}
                  partOfSpeech={current.vocab.partOfSpeech}
                />
                <MeasureWordList items={current.vocab.measureWords} />
                <ExampleSentence
                  word={displayHanzi(current.vocab.hanzi)}
                  sentence={current.vocab.exampleSentence}
                  pinyin={current.vocab.examplePinyin}
                  translation={current.vocab.exampleTranslation}
                  audioUrl={current.vocab.exampleAudioUrl}
                />
              </div>
            }
          />

          <div className="sticky bottom-0 -mx-4 -mb-4 rounded-b-3xl border-t border-stone-100 bg-white px-4 pb-4 pt-3 sm:-mx-5 sm:-mb-5 sm:px-5 sm:pb-5">
          {revealed ? (
            <RatingButtons disabled={saving} onRate={rate} />
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl bg-[#C8322B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#9B2323]"
            >
              Lật thẻ
            </button>
          )}

          {saving && (
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-400">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              Đang lưu kết quả...
            </p>
          )}
          </div>
        </div>
      ) : total === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
          {empty}
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-500">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-stone-800">{doneTitle}</h2>
          <p className="mt-1 text-sm text-stone-500">{doneText}</p>
          <div className="mx-auto mt-5 grid max-w-md grid-cols-4 gap-2 text-xs">
            {RATING_BUTTONS.map((b) => (
              <div key={b.rating} className={`rounded-xl border px-2 py-2 ${b.className}`}>
                <div className="text-lg font-bold">{counts[b.rating]}</div>
                <div>{b.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              <RotateCcw className="h-4 w-4" />
              Học lại từ đầu
            </button>
            {doneActions}
          </div>
        </div>
      )}
    </div>
  )
}
