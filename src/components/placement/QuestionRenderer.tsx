import { AnswerOption } from './AnswerOption'
import { ListenPlayer } from './ListenPlayer'
import { VoiceRecorder } from './VoiceRecorder'
import { cn } from '@/lib/utils'
import type { PlacementQuestion, QuestionType } from '@/types/placement'

interface QuestionRendererProps {
  question: PlacementQuestion
  selectedKey: string | null
  onSelect: (key: string) => void
  /** Called with the recording of a read-aloud question; reject to show the failure banner. */
  onSpeakingSubmit?: (audio: Blob) => Promise<void>
  onSkip?: () => void
}

const LISTEN: QuestionType[] = ['LISTEN_WORD', 'LISTEN_SENTENCE', 'LISTEN_DIALOGUE']
const HANZI_OPTIONS: QuestionType[] = ['MEANING_HANZI', 'SENTENCE_ORDER', 'CLOZE', 'KEYWORD_SENTENCE', 'ERROR_CORRECTION']
const ONE_COLUMN: QuestionType[] = ['READING_COMPREHENSION', 'SENTENCE_ORDER', 'KEYWORD_SENTENCE', 'TRANSLATION']

/** The prompt may hold a passage, a list of fragments or a sentence to read, separated by line breaks. */
function splitPrompt(prompt: string) {
  const lines = prompt.split('\n').map((line) => line.trim()).filter(Boolean)
  return { head: lines[0] ?? '', rest: lines.slice(1) }
}

/** The sentence with its blank drawn as a highlighted slot that shows the option currently chosen. */
function SentenceWithBlank({ sentence, chosen }: { sentence: string; chosen?: string }) {
  const parts = sentence.split(/_{2,}/)
  return (
    <div className="rounded-2xl bg-amber-50/60 px-5 py-4 font-chinese text-2xl font-medium leading-10 tracking-wide text-slate-800 ring-1 ring-amber-100">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <span
              aria-label={chosen ? `Chỗ trống: ${chosen}` : 'Chỗ trống'}
              className="mx-1 inline-block min-w-[72px] border-b-2 border-primary bg-rose-50 px-2.5 text-center text-primary"
            >
              {chosen ?? '\u00a0'}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

function Prompt({ children }: { children: string }) {
  return <p className="text-xl font-semibold leading-[30px] tracking-tight text-slate-800">{children}</p>
}

function Options({ question, selectedKey, onSelect }: Pick<QuestionRendererProps, 'question' | 'selectedKey' | 'onSelect'>) {
  const hanzi = HANZI_OPTIONS.includes(question.type)
  return (
    <div
      role="group"
      aria-label="Đáp án"
      className={cn('grid gap-3', ONE_COLUMN.includes(question.type) ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}
    >
      {question.choices.map((choice) => (
        <AnswerOption
          key={choice.key}
          optionKey={choice.key}
          text={choice.text}
          hanzi={hanzi}
          selected={selectedKey === choice.key}
          onSelect={() => onSelect(choice.key)}
        />
      ))}
    </div>
  )
}

export function QuestionRenderer({ question, selectedKey, onSelect, onSpeakingSubmit, onSkip }: QuestionRendererProps) {
  const options = <Options question={question} selectedKey={selectedKey} onSelect={onSelect} />
  const { head, rest } = splitPrompt(question.prompt)

  if (question.type === 'READ_ALOUD') {
    // The sentence to read is on its own line, or on the same line after the first colon.
    const colon = head.search(/[:：]/)
    const sentence = rest.length > 0 ? rest.join(' ') : colon >= 0 ? head.slice(colon + 1).trim() : ''
    const instruction = rest.length > 0 || colon < 0 ? head : head.slice(0, colon + 1)
    return (
      <div className="flex flex-col gap-5">
        <Prompt>{instruction}</Prompt>
        {sentence && (
          <div className="rounded-2xl bg-amber-50/60 px-5 py-6 text-center ring-1 ring-amber-100">
            <p className="font-chinese text-3xl font-bold leading-[48px] tracking-wider text-slate-800">{sentence}</p>
          </div>
        )}
        {onSpeakingSubmit && onSkip && <VoiceRecorder onSubmit={onSpeakingSubmit} onSkip={onSkip} />}
      </div>
    )
  }

  if (LISTEN.includes(question.type) && question.audioUrl) {
    return (
      <div className="flex flex-col gap-5">
        <Prompt>{head}</Prompt>
        <ListenPlayer audioUrl={question.audioUrl} />
        {rest.length > 0 && <p className="text-lg font-semibold text-slate-800">{rest.join(' ')}</p>}
        {options}
      </div>
    )
  }

  if (question.type === 'READING_COMPREHENSION') {
    // The first line is the instruction, the lines up to "Câu hỏi" are the passage, the last line is the question.
    const lines = question.prompt.split('\n').map((line) => line.trim()).filter(Boolean)
    const questionIndex = lines.findIndex((line) => /^c[âa]u h[ỏo]i/i.test(line))
    const passage = questionIndex > 1 ? lines.slice(1, questionIndex) : lines.slice(1, -1)
    const ask = questionIndex > 0 ? lines.slice(questionIndex).join(' ').replace(/^c[âa]u h[ỏo]i:?\s*/i, '') : lines[lines.length - 1]
    return (
      <div className="flex flex-col gap-5">
        <Prompt>{lines[0] ?? ''}</Prompt>
        <div className="rounded-2xl bg-amber-50/50 px-5 py-5 font-chinese text-xl font-medium leading-9 tracking-wide ring-1 ring-amber-100">
          {passage.join('\n')}
        </div>
        <p className="text-lg font-semibold text-slate-800">{ask}</p>
        {options}
      </div>
    )
  }

  if (question.type === 'SENTENCE_ORDER') {
    const fragments = (rest.length > 0 ? rest : head.split(':').slice(1).join(':').split('/'))
      .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
      .filter(Boolean)
    return (
      <div className="flex flex-col gap-5">
        <Prompt>{rest.length > 0 ? head : head.split(':')[0] + '.'}</Prompt>
        {fragments.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Các mảnh câu">
            {fragments.map((fragment, index) => (
              <span key={index} className="rounded-xl bg-slate-100 px-3.5 py-2 font-chinese text-xl font-bold tracking-wide">
                {fragment}
              </span>
            ))}
          </div>
        )}
        {options}
      </div>
    )
  }

  if ((question.type === 'CLOZE' || question.type === 'GRAMMAR_SELECT') && /_{2,}/.test(question.prompt)) {
    // The instruction and the sentence are on separate lines, or on one line split at the first colon.
    const sentenceLine = rest.find((line) => /_{2,}/.test(line))
    const colon = head.search(/[:：]/)
    const sentence = sentenceLine ?? (colon >= 0 ? head.slice(colon + 1).trim() : head)
    const instruction = sentenceLine ? head : colon >= 0 ? head.slice(0, colon + 1) : 'Chọn từ điền vào chỗ trống.'
    const chosen = question.choices.find((choice) => choice.key === selectedKey)?.text
    return (
      <div className="flex flex-col gap-5">
        <Prompt>{instruction}</Prompt>
        <SentenceWithBlank sentence={sentence} chosen={chosen} />
        {options}
      </div>
    )
  }

  const hanziPrompt = question.type === 'VOCAB_MEANING' || question.type === 'PHONETICS_SELECT'
  const quoted = hanziPrompt ? head.match(/[一-鿿]+/)?.[0] : undefined
  return (
    <div className="flex flex-col gap-5">
      {question.type === 'VOCAB_MEANING' && quoted ? (
        <div className="flex flex-col gap-1.5">
          <Prompt>Từ tiếng Trung này có nghĩa là gì?</Prompt>
          <p className="font-chinese text-4xl font-bold leading-[56px] tracking-wide text-slate-800">{quoted}</p>
          {question.promptPinyin && <p className="text-base font-medium text-slate-500">{question.promptPinyin}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Prompt>{head}</Prompt>
          {rest.length > 0 && <p className="whitespace-pre-line text-lg text-slate-700">{rest.join('\n')}</p>}
          {question.promptPinyin && <p className="text-base font-medium text-slate-500">{question.promptPinyin}</p>}
        </div>
      )}
      {options}
    </div>
  )
}
