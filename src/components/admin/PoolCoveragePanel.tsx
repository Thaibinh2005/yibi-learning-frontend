import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { getPoolCoverage } from '@/api/adminApi'
import type { PoolCoverage } from '@/types/admin'

const LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']

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

/** Published questions per HSK band and skill against what the placement test needs; short cells are red. */
export function PoolCoveragePanel() {
  const [coverage, setCoverage] = useState<PoolCoverage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCoverage(await getPoolCoverage())
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'Không tải được độ phủ ngân hàng câu hỏi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const skills = coverage ? Array.from(new Set(coverage.cells.map((cell) => cell.skillKey))) : []
  const cellOf = (level: string, skill: string) =>
    coverage?.cells.find((cell) => cell.levelCode === level && cell.skillKey === skill)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Độ phủ ngân hàng câu hỏi</h2>
          <p className="text-xs text-slate-500">
            Số câu PUBLISHED trên mục tiêu của từng cấp và kỹ năng. Ô đỏ là chỗ bài test xếp trình độ còn thiếu câu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && !coverage && (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải độ phủ...
        </div>
      )}

      {coverage && (
        <>
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
              coverage.ready ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {coverage.ready ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {coverage.ready
              ? 'Đủ câu cho bài test xếp trình độ.'
              : `Còn thiếu ${coverage.totalMissing} câu để bài test chạy đủ.`}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">Cấp</th>
                  {skills.map((skill) => (
                    <th key={skill} scope="col" className="px-4 py-3 text-center font-bold">
                      {SKILL_LABELS[skill] ?? skill}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {LEVELS.map((level) => (
                  <tr key={level}>
                    <th scope="row" className="px-4 py-3 font-bold text-slate-700">HSK {level}</th>
                    {skills.map((skill) => {
                      const cell = cellOf(level, skill)
                      if (!cell) {
                        return <td key={skill} className="px-4 py-3 text-center text-slate-300">–</td>
                      }
                      const short = cell.missing > 0
                      return (
                        <td key={skill} className="px-2 py-2 text-center">
                          <span
                            className={`inline-block min-w-[64px] rounded-lg px-2 py-1.5 font-bold ${
                              short ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                            title={short ? `Thiếu ${cell.missing} câu` : 'Đủ'}
                          >
                            {cell.published}/{cell.target}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
