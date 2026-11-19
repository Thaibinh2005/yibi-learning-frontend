import React from 'react'
import type { LevelMeaning } from '@/types/vocabulary'

/** The short meaning of a word: the one of its level when the official syllabus has it, else the dictionary one. */
export const shortMeaning = (levelMeaning?: LevelMeaning | null, meaningVi?: string | null) =>
  levelMeaning?.main || meaningVi || ''

/**
 * The meaning on the back of a flashcard. A word of the official syllabus shows what its level teaches (main
 * meaning, secondary meanings, collocations, what is new at this level); any other word shows the dictionary meaning.
 */
export const LevelMeaningBlock: React.FC<{
  levelMeaning?: LevelMeaning | null
  meaningVi?: string | null
  partOfSpeech?: string | null
}> = ({ levelMeaning, meaningVi, partOfSpeech }) => {
  if (!levelMeaning) {
    return (
      <>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-700">{meaningVi || 'Chưa có nghĩa tiếng Việt'}</p>
        {partOfSpeech && <span className="mt-2 text-xs font-medium italic text-stone-400">({partOfSpeech})</span>}
      </>
    )
  }
  const pos = levelMeaning.partOfSpeechVi || partOfSpeech
  return (
    <div className="mt-2 flex max-w-md flex-col items-center gap-2">
      <p className="text-lg font-semibold leading-snug text-stone-800">{levelMeaning.main}</p>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {pos && <span className="font-medium italic text-stone-400">({pos})</span>}
        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700" title={levelMeaning.syllabusVersion ?? undefined}>
          Nghĩa HSK {levelMeaning.level}
        </span>
      </div>
      {levelMeaning.newAtLevel && (
        <p className="text-xs text-stone-500">
          <span className="font-semibold text-stone-600">Mới ở HSK {levelMeaning.level}:</span> {levelMeaning.newAtLevel}
        </p>
      )}
      {levelMeaning.secondary.length > 0 && (
        <p className="text-sm text-stone-600">
          <span className="font-semibold">Nghĩa phụ:</span> {levelMeaning.secondary.join('; ')}
        </p>
      )}
      {levelMeaning.collocations.length > 0 && (
        <ul className="w-full space-y-1 rounded-xl bg-white/70 px-4 py-2 text-left text-sm">
          {levelMeaning.collocations.map((c) => (
            <li key={c.zh} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-chinese text-base text-stone-900">{c.zh}</span>
              <span className="text-stone-600">{c.vi}</span>
            </li>
          ))}
        </ul>
      )}
      {levelMeaning.note && <p className="text-xs leading-relaxed text-stone-500">{levelMeaning.note}</p>}
    </div>
  )
}

/** What the learner met of this word at lower levels, for the word page (a flashcard shows only its own level). */
export const EarlierLevels: React.FC<{ levelMeaning?: LevelMeaning | null; compact?: boolean }> = ({ levelMeaning, compact }) => {
  const earlier = levelMeaning?.earlierLevels ?? []
  if (earlier.length === 0) return null
  if (compact) {
    return (
      <p className="mt-0.5 text-xs text-stone-500">
        Đã học: {earlier.map((e) => `HSK ${e.level} – ${e.main}`).join(' · ')}
      </p>
    )
  }
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Đã học ở cấp thấp hơn</h4>
      {earlier.map((e) => (
        <div key={e.level} className="rounded-2xl border border-stone-200/60 bg-white px-3.5 py-2.5 text-sm">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-600">HSK {e.level}</span>
            <span className="font-medium text-stone-800">{e.main}</span>
            {e.partOfSpeechVi && <span className="text-xs italic text-stone-400">({e.partOfSpeechVi})</span>}
          </div>
          {e.secondary.length > 0 && <p className="mt-1 text-xs text-stone-500">Nghĩa phụ: {e.secondary.join('; ')}</p>}
        </div>
      ))}
    </div>
  )
}
