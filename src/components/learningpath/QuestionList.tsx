import React from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { evidenceOf, text, type Item } from './readingText'

interface Props {
  questions: Item[]
  answers: Record<number, string>
  onAnswer: (index: number, option: string) => void
  onReset: () => void
  /** Bumps on reset so the cards start fresh. */
  round: number
  /** Sentences of the passage, to find the one an answer rests on; leave empty to hide that link. */
  sentences?: string[]
  /** Show the book's explanation after an answer. Off while a listening text must stay hidden. */
  showExplanation?: boolean
  onShowEvidence?: (sentenceIndex: number) => void
  retryHint: string
}

/** Multiple-choice questions with progress, feedback on each answer and a score at the end. */
export const QuestionList: React.FC<Props> = ({ questions, answers, onAnswer, onReset, round, sentences = [], showExplanation = true, onShowEvidence, retryHint }) => {
  if (questions.length === 0) return null
  const answered = Object.keys(answers).length
  const correct = questions.filter((item, index) => answers[index] !== undefined && answers[index] === text(item.answer)).length
  const done = answered === questions.length

  return (
    <div className="min-w-0 space-y-3">
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Câu hỏi</span><span>Đã trả lời {answered}/{questions.length}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered}>
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
      </div>

      {questions.map((item, index) => {
        const options = Array.isArray(item.options) ? item.options.map(String) : []
        const picked = answers[index]
        const right = text(item.answer)
        const evidence = picked !== undefined && showExplanation ? evidenceOf(text(item.explanation), sentences) : -1
        return (
          <article key={`${round}-${index}`} className="rounded-xl border border-border bg-muted/40 p-3.5">
            <p className="text-sm font-semibold leading-snug text-foreground"><span className="mr-1.5 text-muted-foreground">{index + 1}.</span>{text(item.question)}</p>
            <div className="mt-2 space-y-1.5">
              {options.map((option) => {
                const state = picked === undefined ? 'border-border bg-card hover:bg-muted' : option === right ? 'border-emerald-300 bg-emerald-50' : option === picked ? 'border-rose-300 bg-rose-50' : 'border-border bg-card opacity-70'
                return (
                  <button key={option} type="button" disabled={picked !== undefined} onClick={() => onAnswer(index, option)} className={cn('flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm text-foreground', state)}>
                    <span>{option}</span>
                    {picked !== undefined && option === right && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
                    {picked !== undefined && option === picked && option !== right && <X className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
            {picked !== undefined && (
              <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <p><b className={picked === right ? 'text-emerald-700' : 'text-rose-700'}>{picked === right ? 'Chính xác. ' : `Đáp án đúng: ${right}. `}</b>{showExplanation ? text(item.explanation) : ''}</p>
                {evidence >= 0 && onShowEvidence && <button type="button" onClick={() => onShowEvidence(evidence)} className="mt-1 font-semibold text-brand hover:underline">Xem câu trong bài</button>}
              </div>
            )}
          </article>
        )
      })}

      {done && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4" role="status">
          <div>
            <p className="text-lg font-bold text-foreground">Đúng {correct}/{questions.length} câu</p>
            <p className="text-xs text-muted-foreground">{correct === questions.length ? 'Bạn hiểu bài rất tốt.' : retryHint}</p>
          </div>
          <button type="button" onClick={onReset} className="btn-chunky btn-brand inline-flex shrink-0 items-center gap-2 px-4 py-2 text-sm"><RotateCcw className="h-4 w-4" aria-hidden="true" />Làm lại</button>
        </div>
      )}
    </div>
  )
}
