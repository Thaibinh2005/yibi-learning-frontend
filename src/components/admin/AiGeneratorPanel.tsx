import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { generateQuestionsWithAi } from '@/api/adminApi'
import type { AiGenerationResult } from '@/types/admin'

interface AiGeneratorPanelProps {
  /** Called after questions were saved, so the page can refresh its counts. */
  onGenerated: () => void
}

const LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']

// Mirrors the skills each type may carry in AiQuestionGeneratorService.
const TYPES: { id: string; name: string; skills: string[] }[] = [
  { id: 'VOCAB_MEANING', name: 'Chọn nghĩa từ vựng', skills: ['vocabulary'] },
  { id: 'MEANING_HANZI', name: 'Chọn chữ Hán theo nghĩa', skills: ['vocabulary', 'characters'] },
  { id: 'PHONETICS_SELECT', name: 'Chọn pinyin', skills: ['phonetics'] },
  { id: 'CLOZE', name: 'Điền chỗ trống', skills: ['grammar', 'writing'] },
  { id: 'GRAMMAR_SELECT', name: 'Chọn cấu trúc ngữ pháp', skills: ['grammar'] },
  { id: 'SENTENCE_ORDER', name: 'Sắp xếp câu', skills: ['writing'] },
  { id: 'ERROR_CORRECTION', name: 'Sửa câu sai', skills: ['grammar', 'writing'] },
  { id: 'LISTEN_WORD', name: 'Nghe từ', skills: ['listening'] },
  { id: 'LISTEN_SENTENCE', name: 'Nghe câu', skills: ['listening'] },
  { id: 'LISTEN_DIALOGUE', name: 'Nghe hội thoại', skills: ['listening'] },
  { id: 'READING_COMPREHENSION', name: 'Đọc hiểu', skills: ['reading'] },
  { id: 'TRANSLATION', name: 'Dịch', skills: ['translation'] },
  { id: 'KEYWORD_SENTENCE', name: 'Đặt câu với từ khóa', skills: ['writing'] },
  { id: 'READ_ALOUD', name: 'Đọc to (nói)', skills: ['speaking'] },
]

const SKILL_LABELS: Record<string, string> = {
  vocabulary: 'Từ vựng',
  characters: 'Chữ Hán',
  phonetics: 'Ngữ âm',
  grammar: 'Ngữ pháp',
  listening: 'Nghe',
  reading: 'Đọc',
  writing: 'Viết',
  speaking: 'Nói',
  translation: 'Dịch',
}

const FIELD =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#B52A2A] focus:outline-none focus:ring-1 focus:ring-[#B52A2A]'
const LABEL = 'mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500'

/** Asks Gemini for questions at one level; the ones that pass the checks are saved as DRAFT for review. */
export function AiGeneratorPanel({ onGenerated }: AiGeneratorPanelProps) {
  const [levelCode, setLevelCode] = useState('1')
  const [questionType, setQuestionType] = useState(TYPES[0].id)
  const [skillKey, setSkillKey] = useState(TYPES[0].skills[0])
  const [topicKey, setTopicKey] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [count, setCount] = useState(5)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AiGenerationResult | null>(null)

  const type = TYPES.find((item) => item.id === questionType) ?? TYPES[0]

  const pickType = (id: string) => {
    const next = TYPES.find((item) => item.id === id) ?? TYPES[0]
    setQuestionType(next.id)
    setSkillKey(next.skills[0])
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const data = await generateQuestionsWithAi({
        levelCode,
        skillKey,
        questionType,
        topicKey: topicKey.trim() || undefined,
        difficulty,
        count,
      })
      setResult(data)
      if (data.createdIds.length > 0) onGenerated()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'Gemini chưa trả lời được. Thử lại sau ít phút.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <span className={LABEL}>1. Cấp độ HSK</span>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setLevelCode(level)}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    levelCode === level ? 'bg-[#B52A2A] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  HSK {level}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ai-type" className={LABEL}>2. Dạng câu hỏi</label>
              <select id="ai-type" value={questionType} onChange={(e) => pickType(e.target.value)} className={FIELD}>
                {TYPES.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ai-skill" className={LABEL}>3. Kỹ năng</label>
              <select
                id="ai-skill"
                value={skillKey}
                onChange={(e) => setSkillKey(e.target.value)}
                disabled={type.skills.length === 1}
                className={FIELD}
              >
                {type.skills.map((skill) => (
                  <option key={skill} value={skill}>{SKILL_LABELS[skill] ?? skill}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ai-topic" className={LABEL}>Chủ đề (tùy chọn)</label>
              <input
                id="ai-topic"
                value={topicKey}
                onChange={(e) => setTopicKey(e.target.value)}
                placeholder="gia đình, mua sắm..."
                maxLength={60}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="ai-difficulty" className={LABEL}>Độ khó (1–5)</label>
              <select id="ai-difficulty" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className={FIELD}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ai-count" className={LABEL}>Số câu (1–20)</label>
              <input
                id="ai-count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                className={FIELD}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Câu đạt kiểm tra được lưu ở trạng thái DRAFT, cần duyệt trong tab Ngân hàng câu hỏi.
            </p>
            <button
              type="submit"
              disabled={running}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#B52A2A] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-red-800 active:scale-95 disabled:opacity-50"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gemini đang soạn câu hỏi...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Sinh {count} câu bằng AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs" aria-live="polite">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Đã lưu {result.createdIds.length}/{result.requested} câu DRAFT
            <span className="font-mono text-xs font-normal text-slate-400">({result.model})</span>
          </div>
          {result.createdIds.length > 0 && (
            <p className="text-xs text-slate-500">Mã câu: {result.createdIds.map((id) => `#${id}`).join(', ')}</p>
          )}
          {result.rejected.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold text-amber-700">{result.rejected.length} câu bị loại:</p>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-slate-600">
                {result.rejected.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
