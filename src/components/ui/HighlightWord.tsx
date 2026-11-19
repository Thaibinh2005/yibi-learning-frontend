import React from 'react'

/** The word as written in a sentence: syllabus entries like "长2" carry a homograph number. */
const bare = (word: string | null | undefined) => (word ?? '').trim().replace(/[0-9]+$/, '')

/**
 * A sentence with every occurrence of the word underlined, so the learner sees where the word sits in the example.
 * A sentence that does not contain the word as written (a separable verb split by other words) is shown as it is.
 */
export const HighlightWord: React.FC<{ sentence: string; word?: string | null; className?: string }> = ({ sentence, word, className }) => {
  const target = bare(word)
  if (!target || !sentence.includes(target)) return <>{sentence}</>
  const parts = sentence.split(target)
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className={className ?? 'font-semibold text-brand underline decoration-brand/70 decoration-2 underline-offset-4'}>{target}</span>
          )}
        </React.Fragment>
      ))}
    </>
  )
}
