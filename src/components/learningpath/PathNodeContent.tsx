import React, { useState } from 'react'
import { Mic, X } from 'lucide-react'
import { scoreDialogueLine, type PathContentItem, type PathNodeDetail, type SpeakingResult } from '@/api/learningPathApi'
import { VoiceRecorder } from '@/components/placement/VoiceRecorder'
import { AudioButton } from '@/components/ui/AudioButton'

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value))
const items = (value: unknown) => (Array.isArray(value) ? (value as PathContentItem[]) : [])

export const GrammarCard: React.FC<{ point: PathContentItem }> = ({ point }) => (
  <article className="rounded-2xl border border-slate-200 p-4">
    <p className="font-chinese text-lg font-bold text-slate-800">{text(point.content)}</p>
    {(text(point.subcategory) || text(point.category_name)) && <p className="mt-0.5 text-xs text-slate-400">{text(point.subcategory) || text(point.category_name)}</p>}
    {text(point.explanation_vi) && <p className="mt-2 text-sm leading-relaxed text-slate-600">{text(point.explanation_vi)}</p>}
    {text(point.example_zh) && (
      <div className="mt-2 flex items-start justify-between gap-2 border-l-2 border-rose-200 pl-3 text-sm leading-relaxed">
        <p>
          <span className="font-chinese block text-slate-800">{text(point.example_zh)}</span>
          <span className="block text-xs text-[#C8322B]">{text(point.example_pinyin)}</span>
          <span className="block text-xs text-slate-500">{text(point.example_vi)}</span>
        </p>
        <AudioButton text={text(point.example_zh)} size="sm" />
      </div>
    )}
  </article>
)

const DialogueLine: React.FC<{ line: PathContentItem; nodeId: number; index: number }> = ({ line, nodeId, index }) => {
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState<SpeakingResult | null>(null)
  const right = text(line.speaker).toUpperCase() === 'B'
  return (
    <li className={`flex flex-col ${right ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${right ? 'bg-rose-50' : 'bg-slate-100'}`}>
        <p className="text-[11px] font-bold text-slate-400">{text(line.speaker)}</p>
        <p className="font-chinese text-base font-semibold leading-relaxed text-slate-800">{text(line.zh)}</p>
        <p className="text-xs text-[#C8322B]">{text(line.pinyin)}</p>
        <p className="mt-0.5 text-xs text-slate-500">{text(line.vi)}</p>
        <div className="mt-2 flex items-center gap-2">
          <AudioButton text={text(line.zh)} size="sm" />
          <button type="button" onClick={() => setRecording((value) => !value)} aria-label="Đọc theo câu này" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white">
            {recording ? <X className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {recording ? 'Đóng' : 'Đọc theo'}
          </button>
          {result && <span className={`text-xs font-bold ${result.passed ? 'text-emerald-700' : 'text-amber-700'}`}>{Math.round(result.accuracy * 100)}% {result.passed ? 'Tốt lắm!' : 'Thử lại nhé'}</span>}
        </div>
      </div>
      {recording && (
        <div className="mt-2 w-full max-w-md">
          <VoiceRecorder
            maxSeconds={20}
            onSkip={() => setRecording(false)}
            onSubmit={async (audio) => {
              setResult(await scoreDialogueLine(nodeId, index, audio))
              setRecording(false)
            }}
          />
        </div>
      )}
    </li>
  )
}

const Passage: React.FC<{ content: Record<string, unknown>; listening: boolean }> = ({ content, listening }) => {
  const body = text(content.text) || text(content.transcript)
  return (
    <article className="rounded-2xl border border-slate-200 p-5">
      <p className="font-bold text-slate-800">{text(content.title)}</p>
      {listening && (typeof content.audio_url === 'string'
        ? <audio controls preload="none" src={content.audio_url} className="mt-3 w-full" />
        : <div className="mt-3"><AudioButton text={body} size="lg" title="Nghe bài" /></div>)}
      {listening
        ? <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-[#C8322B]">Xem văn bản</summary><p className="font-chinese mt-2 text-base leading-loose text-slate-800">{body}</p><p className="mt-1 text-sm text-[#C8322B]">{text(content.pinyin)}</p><p className="mt-1 text-sm text-slate-600">{text(content.translation_vi)}</p></details>
        : <><p className="font-chinese mt-3 text-lg leading-loose text-slate-800">{body}</p><details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-[#C8322B]">Xem pinyin và bản dịch</summary><p className="mt-2 text-sm text-[#C8322B]">{text(content.pinyin)}</p><p className="mt-1 text-sm text-slate-600">{text(content.translation_vi)}</p></details></>}
    </article>
  )
}

/** The material of one node, shown before its quiz. */
export const PathNodeContent: React.FC<{ node: PathNodeDetail }> = ({ node }) => {
  const { content } = node
  switch (node.type) {
    case 'DIALOGUE':
      return (
        <div>
          <p className="mb-3 text-xs text-slate-500">Nghe từng câu rồi bấm “Đọc theo” để thu âm và chấm phát âm.</p>
          <ol className="space-y-3">{items(content.lines).map((line, index) => <DialogueLine key={index} line={line} nodeId={node.id} index={index} />)}</ol>
        </div>
      )
    case 'READING':
    case 'LISTENING':
      return <Passage content={content} listening={node.type === 'LISTENING'} />
    default:
      return <p className="text-sm leading-relaxed text-slate-600">Bài kiểm tra tổng hợp từ vựng và các kỹ năng của đơn vị <b>{node.unitTitle}</b>.</p>
  }
}
