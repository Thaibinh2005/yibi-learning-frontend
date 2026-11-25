import React from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { groupOf, isCorrect, optionsOf, type MockGroup, type MockOption, type MockQuestion, type MockSection } from '@/api/mockTestApi'
import { MockAudioPlayer } from './MockAudioPlayer'

export const SECTION_INSTRUCTIONS: Record<string, string> = {
  'listening:image_choice': 'Nghe cụm từ, chọn hình đúng.',
  'listening:text_choice': 'Nghe rồi chọn đáp án đúng.',
  'listening:shared_images': 'Nghe hội thoại, chọn hình phù hợp nhất.',
  'reading:shared_images': 'Đọc câu, chọn hình phù hợp.',
  'reading:shared_text_right': 'Chọn câu trả lời phù hợp.',
  'reading:shared_text': 'Chọn câu phù hợp từ các câu A–F.',
  'reading:word_bank': 'Chọn từ thích hợp điền vào chỗ trống.',
  'reading:passage_choice': 'Đọc đoạn văn, trả lời câu hỏi.',
  'reading:cloze_shared': 'Đọc đoạn văn, chọn câu điền vào mỗi chỗ trống.',
  'reading:cloze_choice': 'Đọc đoạn văn, chọn đáp án cho mỗi chỗ trống.',
  'reading:ordering': 'Sắp xếp các đoạn A–E theo đúng thứ tự.',
  'reading:group_choice': 'Đọc đoạn văn, trả lời các câu hỏi.',
  'writing:radical_choice': 'Chọn bộ phận còn thiếu của chữ Hán.',
  'writing:fill_char': 'Viết chữ Hán theo pinyin vào chỗ trống.',
  'writing:picture_word': 'Nhìn hình, dùng từ đã cho viết một câu.',
  'writing:essay': 'Viết bài theo yêu cầu.',
}

export const instructionOf = (section: MockSection) =>
  SECTION_INSTRUCTIONS[`${section.skill}:${section.layout}`] ?? 'Chọn đáp án đúng.'

/** Chinese with its pinyin above, as on the paper. */
const Zh: React.FC<{ text?: string; pinyin?: string; showPinyin: boolean; className?: string }> = ({ text, pinyin, showPinyin, className = 'text-lg' }) => {
  if (!text) return null
  return (
    <span className="inline-flex flex-col">
      {showPinyin && pinyin && <span className="font-pinyin text-xs font-medium text-slate-500">{pinyin}</span>}
      <span className={`font-chinese leading-relaxed text-slate-900 ${className}`}>{text}</span>
    </span>
  )
}

/** A passage: gaps written （41） stand out (the current one most), <u>…</u> is underlined as on the paper. */
export const Passage: React.FC<{ text: string; current?: number; filled?: Record<number, string> }> = ({ text, current, filled }) => {
  const parts = text.split(/(<u>.*?<\/u>|（\d+）)/g).filter(Boolean)
  return (
    <p className="font-chinese whitespace-pre-line text-lg leading-loose text-slate-900">
      {parts.map((part, index) => {
        const gap = part.match(/^（(\d+)）$/)
        if (gap) {
          const no = Number(gap[1])
          const fill = filled?.[no]
          return (
            <span key={index} className={`mx-0.5 inline-block rounded-md border px-1.5 text-base font-bold tabular-nums ${
              no === current ? 'border-brand bg-rose-50 text-brand' : 'border-slate-300 text-slate-500'}`}>
              {fill ? `${no}·${fill}` : no}
            </span>
          )
        }
        const underline = part.match(/^<u>(.*)<\/u>$/)
        if (underline) return <u key={index} className="decoration-brand decoration-2 underline-offset-4">{underline[1]}</u>
        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </p>
  )
}

/** "写字" with 字 printed as its part 宀 and a box for the missing piece; the whole character once revealed. */
export const PartialWord: React.FC<{ question: MockQuestion; revealed: boolean; showPinyin: boolean; size?: 'lg' | 'sm' }> = ({ question, revealed, showPinyin, size = 'lg' }) => {
  const chars = Array.from(question.question ?? '')
  const syllables = (question.questionPinyin ?? '').split(/\s+/)
  const partial = question.partial
  const box = size === 'lg' ? 'h-16 w-16 text-4xl' : 'h-11 w-11 text-2xl'
  return (
    <div className="flex items-end gap-1.5">
      {chars.map((char, i) => {
        const missing = partial?.index === i
        return (
          <span key={i} className="inline-flex flex-col items-center">
            {showPinyin && <span className="font-pinyin text-xs font-medium text-slate-500">{syllables[i] ?? ''}</span>}
            <span className={`font-chinese relative grid place-items-center rounded-lg border-2 ${box} ${
              missing ? (revealed ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-dashed border-brand bg-rose-50 text-slate-700') : 'border-slate-200 bg-white text-slate-900'}`}>
              {missing && !revealed ? partial!.shown : char}
              {missing && !revealed && <span className="absolute -right-2 -top-2 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">+ ?</span>}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/** The sentence of a fill-the-blank item, with the chosen word shown in the blank. */
const BlankSentence: React.FC<{ text: string; filled?: string }> = ({ text, filled }) => {
  const parts = text.split('（　）')
  return (
    <span className="font-chinese text-xl leading-loose text-slate-900">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className={`mx-1 inline-block min-w-[3.5rem] border-b-2 px-2 text-center ${filled ? 'border-brand font-bold text-brand' : 'border-slate-400 text-transparent'}`}>
              {filled || '__'}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  )
}

type OptionState = 'idle' | 'chosen' | 'right' | 'wrong' | 'faded'

const optionClass: Record<OptionState, string> = {
  idle: 'border-border bg-white hover:border-slate-300 hover:bg-slate-50',
  chosen: 'border-brand bg-rose-50 ring-2 ring-rose-100',
  right: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100',
  wrong: 'border-rose-500 bg-rose-50',
  faded: 'border-border bg-white opacity-55',
}

const OptionButton: React.FC<{
  option: MockOption
  state: OptionState
  disabled: boolean
  showPinyin: boolean
  onClick: () => void
  compact?: boolean
  long?: boolean
  /** Radicals: one big character. */
  big?: boolean
}> = ({ option, state, disabled, showPinyin, onClick, compact, long, big }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={state === 'chosen'}
    className={`relative flex w-full gap-3 rounded-2xl border-2 p-3 text-left transition ${optionClass[state]} ${option.image && !option.text ? 'flex-col items-center' : long ? 'items-start' : 'items-center'} disabled:cursor-default`}
  >
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
      state === 'right' ? 'bg-emerald-500 text-white' : state === 'wrong' ? 'bg-rose-500 text-white' : state === 'chosen' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
    } ${option.image && !option.text ? 'absolute left-2 top-2' : ''}`}>{option.key}</span>
    {option.image && <img src={option.image} alt={`Hình ${option.key}`} className={`object-contain ${option.text ? 'h-10 w-10' : `w-full ${compact ? 'h-24' : 'h-32 sm:h-36'}`}`} loading="lazy" />}
    {option.text && (long
      ? <span className="font-chinese text-base leading-relaxed text-slate-900">{option.text}</span>
      : <Zh text={option.text} pinyin={option.pinyin} showPinyin={showPinyin} className={big ? 'text-4xl' : 'text-lg'} />)}
    {state === 'right' && <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-emerald-600" />}
    {state === 'wrong' && <XCircle className="absolute right-2 top-2 h-5 w-5 text-rose-600" />}
  </button>
)

/** What questions of one group share: the passage (with this question's gap marked), pictures, and the clip. */
export const GroupBlock: React.FC<{
  group: MockGroup
  question?: MockQuestion
  revealed: boolean
  examAudio: boolean
  audioNote?: string
}> = ({ group, question, revealed, examAudio, audioNote }) => (
  <div className="space-y-3">
    {group.audio && (
      <MockAudioPlayer src={group.audio.file} label={`Nghe đoạn câu ${group.range[0]}–${group.range[1]}`} maxPlays={examAudio ? 1 : undefined} note={audioNote} />
    )}
    {group.passage && (
      <div className="max-h-[50vh] overflow-y-auto rounded-2xl bg-slate-50 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Đoạn văn câu {group.range[0]}–{group.range[1]}</p>
        <Passage text={group.passage} current={question?.no} />
      </div>
    )}
    {group.images?.map((src) => <img key={src} src={src} alt="" className="max-h-48 rounded-xl object-contain" loading="lazy" />)}
    {revealed && group.transcript && (
      <div className="rounded-2xl border border-border p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lời thoại câu {group.range[0]}–{group.range[1]}</p>
        <p className="font-chinese mt-1 text-lg leading-relaxed text-slate-800">{group.transcript}</p>
      </div>
    )}
  </div>
)

/** Characters written, not counting spaces. */
export const audioNoteFor = (readTwice: boolean) =>
  readTwice ? 'Như đề thật: đoạn này chỉ phát 1 lần (trong đó câu được đọc 2 lần).' : 'Như đề thật: đoạn này chỉ phát 1 lần.'

/** A group whose questions belong on one page: they share a passage or a listening clip. */
export const sharesContent = (group?: MockGroup) => Boolean(group && (group.audio || group.passage))

/** Questions answered from the same set of pictures A–F (their part's or their group's) share a page too. */
export const sharedPictures = (section: MockSection, question: MockQuestion) =>
  !question.options && (question.optionsFrom === 'shared' || question.optionsFrom === 'group')
    && optionsOf(section, question).some((o) => o.image && !o.text)

/** Questions with the same key are shown on one page: a shared passage/clip, or a shared set of pictures. */
export const pageKey = (section: MockSection, question: MockQuestion): string | null => {
  if (sharesContent(groupOf(section, question))) return `g:${question.group}`
  if (sharedPictures(section, question)) return `p:${question.group ?? ''}`
  return null
}

/** The shared pictures A–F shown once above the questions that use them; the right one is marked once revealed. */
export const PictureBoard: React.FC<{ options: MockOption[]; marked?: Record<string, 'right' | 'chosen'> }> = ({ options, marked = {} }) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
    {options.map((option) => (
      <div key={option.key} className={`relative rounded-xl border-2 bg-white p-1.5 ${marked[option.key] === 'right' ? 'border-emerald-400' : 'border-border'}`}>
        <span className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-xs font-extrabold text-white">{option.key}</span>
        {option.image && <img src={option.image} alt={`Hình ${option.key}`} className="h-16 w-full object-contain sm:h-20" loading="lazy" />}
      </div>
    ))}
  </div>
)

export const charCount = (text: string) => text.replace(/\s/g, '').length

/**
 * One question of a sample paper. `revealed` shows the correct answer (practice once answered or checked, or after
 * handing in); `locked` stops changes.
 */
export const MockQuestionView: React.FC<{
  section: MockSection
  question: MockQuestion
  answer?: string
  revealed: boolean
  locked: boolean
  showPinyin: boolean
  examAudio: boolean
  /** Items of HSK 1-3 are read twice inside one clip; from HSK 4 once. */
  readTwice?: boolean
  /** The page shows the group's passage/clip once above all its questions. */
  hideGroup?: boolean
  /** The page shows the shared pictures once; this question only needs the letters. */
  lettersOnly?: boolean
  onAnswer: (value: string) => void
}> = ({ section, question, answer, revealed, locked, showPinyin, examAudio, readTwice = true, hideGroup = false, lettersOnly = false, onAnswer }) => {
  const group = groupOf(section, question)
  const type = question.type ?? 'choice'
  const options = optionsOf(section, question)
  const correctAnswer = question.answer ?? undefined
  const stateOf = (key: string): OptionState => {
    if (revealed && correctAnswer) {
      if (key === correctAnswer) return 'right'
      if (key === answer) return 'wrong'
      return 'faded'
    }
    return key === answer ? 'chosen' : 'idle'
  }
  const imageGrid = options.some((o) => o.image && !o.text)
  const many = options.length > 3
  const longOptions = section.layout === 'ordering' || section.layout === 'cloze_shared' || options.some((o) => (o.text?.length ?? 0) > 24)
  const filled = section.layout === 'word_bank' ? options.find((o) => o.key === (revealed ? correctAnswer : answer))?.text : undefined
  const audioNote = readTwice ? 'Như đề thật: đoạn này chỉ phát 1 lần (trong đó câu được đọc 2 lần).' : 'Như đề thật: đoạn này chỉ phát 1 lần.'

  return (
    <div className="space-y-5">
      {group && !hideGroup && <GroupBlock group={group} question={question} revealed={revealed} examAudio={examAudio} audioNote={audioNote} />}
      {question.audio && !group?.audio && (
        <MockAudioPlayer src={question.audio.file} label={`Nghe câu ${question.no ?? ''}`} maxPlays={examAudio ? 1 : undefined} note={audioNote} />
      )}

      {question.passage && (
        <div className="rounded-2xl bg-slate-50 p-4"><Zh text={question.passage} pinyin={question.passagePinyin} showPinyin={showPinyin} className="text-xl" /></div>
      )}
      {question.image && <img src={question.image} alt="" className="max-h-56 rounded-xl bg-white object-contain" />}
      {question.images?.map((src) => <img key={src} src={src} alt="" className="max-h-96 w-full rounded-xl bg-white object-contain" />)}

      {question.partial && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-600">Chữ trong ô đỏ còn thiếu một bộ phận. Chọn bộ phận ghép vào cho đúng:</p>
          <PartialWord question={question} revealed={revealed} showPinyin />
        </div>
      )}
      {type === 'choice' && question.question && section.layout !== 'ordering' && !question.partial && (
        section.layout === 'word_bank'
          ? <div><BlankSentence text={question.question} filled={filled} />{showPinyin && question.questionPinyin && <p className="font-pinyin text-xs text-slate-500">{question.questionPinyin}</p>}</div>
          : <div className="flex items-start gap-2">{(question.passage || section.layout === 'passage_choice') && <span className="mt-1 text-lg text-amber-500">★</span>}<Zh text={question.question} pinyin={question.questionPinyin} showPinyin={showPinyin} className="text-xl" /></div>
      )}
      {section.layout === 'ordering' && group && (
        <p className="text-base font-bold text-slate-800">Đoạn nào đứng ở vị trí thứ {(question.no ?? 0) - group.range[0] + 1}?</p>
      )}
      {(section.layout === 'cloze_shared' || section.layout === 'cloze_choice') && (
        <p className="text-base font-bold text-slate-800">Chọn đáp án cho chỗ trống <span className="text-brand">({question.no})</span></p>
      )}

      {type === 'choice' && lettersOnly && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn hình">
          {options.map((option) => {
            const state = stateOf(option.key)
            return (
              <button key={option.key} type="button" disabled={locked} onClick={() => onAnswer(option.key)} aria-pressed={state === 'chosen'}
                className={`grid h-12 w-12 place-items-center rounded-xl border-2 text-lg font-extrabold transition disabled:cursor-default ${optionClass[state]} ${
                  state === 'right' ? 'text-emerald-700' : state === 'wrong' ? 'text-rose-700' : state === 'chosen' ? 'text-brand' : 'text-slate-700'}`}>
                {option.key}
              </button>
            )
          })}
        </div>
      )}
      {type === 'choice' && !lettersOnly && (
        <div className={`grid gap-3 ${longOptions ? '' : imageGrid ? (many ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3') : many ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
          {options.map((option) => (
            <OptionButton
              key={option.key}
              option={option}
              state={stateOf(option.key)}
              disabled={locked}
              showPinyin={showPinyin}
              compact={many}
              long={longOptions}
              big={section.layout === 'radical_choice'}
              onClick={() => onAnswer(option.key)}
            />
          ))}
        </div>
      )}

      {type === 'fill' && <FillBlank question={question} answer={answer} revealed={revealed} locked={locked} showPinyin={showPinyin} onAnswer={onAnswer} />}
      {type === 'write' && <Writing question={question} answer={answer} revealed={revealed} locked={locked} onAnswer={onAnswer} />}

      {revealed && type !== 'write' && correctAnswer && (
        <div className={`flex items-start gap-2 rounded-2xl p-4 text-sm ${isCorrect(question, answer) ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {isCorrect(question, answer) ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="font-semibold">{isCorrect(question, answer) ? 'Chính xác!' : answer ? `Chưa đúng. Đáp án đúng là ${correctAnswer}.` : `Chưa trả lời. Đáp án đúng là ${correctAnswer}.`}</span>
        </div>
      )}
      {revealed && question.transcript && !group?.transcript && (
        <div className="rounded-2xl border border-border p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lời thoại</p>
          <p className="font-chinese mt-1 text-lg leading-relaxed text-slate-800">{question.transcript}</p>
        </div>
      )}
    </div>
  )
}

/** "我（ de ）车坏了。": the learner writes the character in the blank, the pinyin hint above it. */
const FillBlank: React.FC<{
  question: MockQuestion
  answer?: string
  revealed: boolean
  locked: boolean
  showPinyin: boolean
  onAnswer: (value: string) => void
}> = ({ question, answer, revealed, locked, showPinyin, onAnswer }) => {
  const [before, after] = (question.question ?? '（　）').split('（　）')
  const right = isCorrect(question, answer)
  return (
    <div className="space-y-2">
      {showPinyin && question.questionPinyin && <p className="font-pinyin text-xs text-slate-500">{question.questionPinyin}</p>}
      <div className="font-chinese flex flex-wrap items-end gap-1 text-2xl leading-loose text-slate-900">
        <span>{before}</span>
        <label className="inline-flex flex-col items-center">
          <span className="font-pinyin text-sm font-bold text-brand">{question.blankPinyin}</span>
          <input
            value={answer ?? ''}
            onChange={(event) => onAnswer(event.target.value)}
            disabled={locked}
            maxLength={4}
            lang="zh"
            aria-label={`Chữ Hán cho "${question.blankPinyin ?? ''}"`}
            className={`font-chinese h-12 w-16 rounded-xl border-2 text-center text-2xl outline-none focus:border-brand ${
              revealed ? (right ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50') : 'border-slate-300 bg-white'}`}
          />
        </label>
        <span>{after}</span>
      </div>
      {!revealed && <p className="text-xs text-slate-500">Gõ chữ Hán bằng bộ gõ tiếng Trung (pinyin), ví dụ gõ "{question.blankPinyin?.normalize('NFD').replace(/[̀-ͯ]/g, '')}" rồi chọn chữ.</p>}
    </div>
  )
}

/** Open writing: a sentence with the word about the picture, or an essay. Kept, compared with the model, not scored. */
const Writing: React.FC<{
  question: MockQuestion
  answer?: string
  revealed: boolean
  locked: boolean
  onAnswer: (value: string) => void
}> = ({ question, answer, revealed, locked, onAnswer }) => {
  const essay = Boolean(question.prompt)
  const count = charCount(answer ?? '')
  return (
    <div className="space-y-3">
      {question.word && <p className="text-base text-slate-700">Dùng từ: <span className="font-chinese text-2xl font-bold text-brand">{question.word}</span></p>}
      {question.prompt && <p className="font-chinese rounded-2xl bg-slate-50 p-4 text-lg leading-relaxed text-slate-900">{question.prompt}</p>}
      <textarea
        value={answer ?? ''}
        onChange={(event) => onAnswer(event.target.value)}
        disabled={locked}
        rows={essay ? 10 : 3}
        maxLength={3000}
        lang="zh"
        placeholder={essay ? 'Viết bài của bạn bằng chữ Hán…' : 'Viết một câu có dùng từ đã cho…'}
        className="font-chinese w-full rounded-2xl border-2 border-slate-300 bg-white p-3 text-lg leading-relaxed outline-none focus:border-brand disabled:bg-slate-50"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><Info className="h-3.5 w-3.5" />Phần viết không được chấm tự động; hãy tự đối chiếu với bài mẫu.</span>
        <span className={`tabular-nums ${question.minChars && count < question.minChars ? 'text-amber-600' : ''}`}>
          {count} chữ{question.minChars ? ` / tối thiểu ${question.minChars}` : ''}
        </span>
      </div>
      {revealed && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Bài mẫu</p>
          <p className="font-chinese mt-1 text-lg leading-relaxed text-slate-800">{question.reference || 'Đề không có bài mẫu cho câu này. Hãy đối chiếu với yêu cầu của đề.'}</p>
        </div>
      )}
    </div>
  )
}

/** The part's worked example, as printed on the paper (answer shown). */
export const MockExample: React.FC<{ section: MockSection; showPinyin: boolean }> = ({ section, showPinyin }) => {
  const example = section.example
  if (!example) return null
  const options = optionsOf(section, example)
  return (
    <div className="space-y-3">
      {example.image && <img src={example.image} alt="" className="max-h-36 rounded-xl bg-white object-contain" />}
      {example.passage && <Zh text={example.passage} pinyin={example.passagePinyin} showPinyin={showPinyin} />}
      {example.partial ? (
        <div className="flex items-end gap-3">
          <PartialWord question={example} revealed={false} showPinyin size="sm" />
          <span className="pb-3 text-slate-400">→</span>
          <PartialWord question={example} revealed showPinyin size="sm" />
        </div>
      ) : example.type === 'fill' && example.question
        ? <p className="font-chinese text-lg">{example.question.replace('（　）', `（${example.answer ?? ''}）`)} <span className="font-pinyin text-sm text-brand">{example.blankPinyin}</span></p>
        : example.question && <div><Zh text={example.question} pinyin={example.questionPinyin} showPinyin={showPinyin} /></div>}
      {example.word && <p className="text-sm text-slate-700">Từ: <span className="font-chinese font-bold">{example.word}</span>{example.reference && <> → <span className="font-chinese">{example.reference}</span></>}</p>}
      {options.length > 0 && (
        <div className={`grid gap-2 ${options.some((o) => o.image) ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {options.map((option) => (
            <div key={option.key} className={`relative rounded-xl border-2 p-2 ${option.key === example.answer ? 'border-emerald-500 bg-emerald-50' : 'border-border'}`}>
              <span className="text-xs font-extrabold text-slate-600">{option.key}</span>
              {option.image && <img src={option.image} alt={`Hình ${option.key}`} className="h-14 w-full object-contain" loading="lazy" />}
              {option.text && <span className="font-chinese block text-sm">{option.text}</span>}
            </div>
          ))}
        </div>
      )}
      {example.answer && example.type !== 'fill' && <p className="text-xs font-semibold text-emerald-700">Đáp án ví dụ: {example.answer}</p>}
    </div>
  )
}
