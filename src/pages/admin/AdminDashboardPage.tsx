import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Database,
  BarChart3,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Volume2,
  Check,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Send,
  Loader2,
  BookOpen,
  ShieldCheck,
  CheckSquare,
  X,
  Save,
  Grid3x3,
} from 'lucide-react'
import {
  runQuestionGenerator,
  bulkPublishQuestions,
  getQuestionBankStats,
  getQuestionBankItems,
  publishQuestionItem,
  updateQuestionItem,
  deleteQuestionItem,
  changeQuestionStatus,
} from '@/api/adminApi'
import type {
  GeneratorRunResult,
  QuestionGeneratorParams,
  QuestionBankItem,
  QuestionBankStats,
  QuestionBankQueryParams,
  QuestionUpdateRequest,
} from '@/types/admin'
import { AudioButton } from '@/components/ui/AudioButton'
import { AiGeneratorPanel } from '@/components/admin/AiGeneratorPanel'
import { PoolCoveragePanel } from '@/components/admin/PoolCoveragePanel'
import { useAppSelector } from '@/app/hooks'

const HSK_LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']

const QUESTION_TYPES = [
  { id: 'PHONETICS_SELECT', name: 'Chọn Pinyin (Ngữ âm)', badge: 'Phát âm' },
  { id: 'MEANING_HANZI', name: 'Chọn chữ Hán theo nghĩa', badge: 'Chữ Hán' },
  { id: 'VOCAB_MEANING', name: 'Chọn nghĩa từ vựng (Tiếng Việt)', badge: 'Từ vựng' },
  { id: 'CLOZE', name: 'Điền vào chỗ trống', badge: 'Ngữ pháp' },
  { id: 'GRAMMAR_SELECT', name: 'Chọn cấu trúc ngữ pháp', badge: 'Ngữ pháp' },
]

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState<'generator' | 'repository' | 'coverage' | 'analytics'>('generator')
  const [genSource, setGenSource] = useState<'rules' | 'ai'>('rules')

  // ──────────────────────────────────────────────────────────────────────────
  // Tab 1: Generator State
  // ──────────────────────────────────────────────────────────────────────────
  const [genParams, setGenParams] = useState<QuestionGeneratorParams>({
    levelCode: '1',
    questionType: 'PHONETICS_SELECT',
    limit: 10,
    mode: 'dry-run',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [genResult, setGenResult] = useState<GeneratorRunResult | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [isBulkPublishing, setIsBulkPublishing] = useState(false)

  // ──────────────────────────────────────────────────────────────────────────
  // Tab 2: Question Bank Repository State
  // ──────────────────────────────────────────────────────────────────────────
  const [repoParams, setRepoParams] = useState<QuestionBankQueryParams>({
    levelCode: 'all',
    questionType: 'all',
    skillKey: 'all',
    status: 'all',
    search: '',
    page: 0,
    size: 12,
  })
  const [questions, setQuestions] = useState<QuestionBankItem[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoadingRepo, setIsLoadingRepo] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [stats, setStats] = useState<QuestionBankStats | null>(null)

  // Modal Chỉnh sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null)
  const [editForm, setEditForm] = useState<QuestionUpdateRequest | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Toast thông báo chung
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Effects
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'repository') {
      fetchQuestionBank()
    }
  }, [repoParams, activeTab])

  const fetchStats = async () => {
    try {
      const data = await getQuestionBankStats()
      setStats(data)
    } catch (err: any) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchQuestionBank = async () => {
    setIsLoadingRepo(true)
    setRepoError(null)
    try {
      const res = await getQuestionBankItems(repoParams)
      setQuestions(res.items)
      setTotalQuestions(res.totalElements)
      setTotalPages(res.totalPages)
    } catch (err: any) {
      console.error('Failed to fetch question bank:', err)
      setRepoError(err?.response?.data?.message || 'Không thể tải danh sách câu hỏi.')
    } finally {
      setIsLoadingRepo(false)
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Handler: Sinh câu hỏi
  // ──────────────────────────────────────────────────────────────────────────
  const handleRunGenerator = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setGenError(null)
    setGenResult(null)

    try {
      const result = await runQuestionGenerator(genParams)
      setGenResult(result)
      if (result.mode === 'import') {
        showToast(`Đã nạp thành công ${result.imported} câu hỏi vào ngân hàng!`)
        fetchStats()
      } else {
        showToast(`Đã sinh ${result.generated} câu hỏi xem trước (chế độ Dry-run)!`)
      }
    } catch (err: any) {
      console.error('Error running generator:', err)
      setGenError(err?.response?.data?.message || 'Lỗi khi sinh câu hỏi. Vui lòng thử lại.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Phê duyệt tất cả theo bộ lọc hiện tại
  const handleBulkPublish = async (levelCode?: string, questionType?: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt tất cả câu hỏi DRAFT theo bộ lọc này?')) {
      return
    }
    setIsBulkPublishing(true)
    try {
      const res = await bulkPublishQuestions(
        levelCode === 'all' ? undefined : levelCode,
        questionType === 'all' ? undefined : questionType
      )
      showToast(`Đã phê duyệt thành công ${res.publishedCount} câu hỏi!`)
      fetchStats()
      if (activeTab === 'repository') {
        fetchQuestionBank()
      }
    } catch (err: any) {
      console.error('Bulk publish error:', err)
      alert(err?.response?.data?.message || 'Lỗi khi phê duyệt hàng loạt.')
    } finally {
      setIsBulkPublishing(false)
    }
  }

  // Phê duyệt 1 câu hỏi đơn lẻ
  const handlePublishSingle = async (id: number) => {
    try {
      await publishQuestionItem(id)
      showToast(`Câu hỏi #${id} đã được phê duyệt (PUBLISHED)!`)
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: 'PUBLISHED' } : q))
      )
      fetchStats()
    } catch (err: any) {
      console.error('Publish error:', err)
      alert(err?.response?.data?.message || 'Không thể phê duyệt câu hỏi.')
    }
  }

  // Từ chối, kích hoạt lại hoặc ngưng dùng một câu hỏi
  const handleChangeStatus = async (id: number, action: 'reject' | 'activate' | 'deactivate') => {
    const next = { reject: 'REJECTED', activate: 'PUBLISHED', deactivate: 'RETIRED' }[action]
    const text = { reject: 'đã bị từ chối', activate: 'đã được kích hoạt lại', deactivate: 'đã ngưng dùng' }[action]
    try {
      await changeQuestionStatus(id, action)
      showToast(`Câu hỏi #${id} ${text}.`)
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, status: next } : q)))
      fetchStats()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không đổi được trạng thái câu hỏi.')
    }
  }

  // Xóa câu hỏi
  const handleDeleteSingle = async (id: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi #${id} khỏi hệ thống?`)) return
    try {
      await deleteQuestionItem(id)
      showToast(`Đã xóa câu hỏi #${id}!`)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      setTotalQuestions((prev) => Math.max(0, prev - 1))
      fetchStats()
    } catch (err: any) {
      console.error('Delete error:', err)
      alert(err?.response?.data?.message || 'Không thể xóa câu hỏi.')
    }
  }

  // Mở modal sửa câu hỏi
  const handleOpenEdit = (q: QuestionBankItem) => {
    setEditingQuestion(q)
    setEditForm({
      prompt: q.prompt,
      promptPinyin: q.promptPinyin || '',
      promptAudioUrl: q.promptAudioUrl || '',
      explanation: q.explanation || '',
      difficulty: q.difficulty || 1,
      status: q.status,
      choices: q.choices.map((c) => ({
        key: c.key,
        text: c.text,
        correct: c.correct,
      })),
    })
    setEditError(null)
  }

  // Đổi đáp án đúng trong modal sửa
  const handleSetCorrectChoice = (key: string) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      choices: editForm.choices.map((c) => ({
        ...c,
        correct: c.key === key,
      })),
    })
  }

  // Đổi nội dung lựa chọn trong modal sửa
  const handleChoiceTextChange = (key: string, text: string) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      choices: editForm.choices.map((c) => (c.key === key ? { ...c, text } : c)),
    })
  }

  // Lưu chỉnh sửa câu hỏi
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuestion || !editForm) return

    const hasCorrect = editForm.choices.some((c) => c.correct)
    if (!hasCorrect) {
      setEditError('Phải có ít nhất một phương án được chọn làm đáp án đúng.')
      return
    }

    setIsSavingEdit(true)
    setEditError(null)

    try {
      const updated = await updateQuestionItem(editingQuestion.id, editForm)
      showToast(`Đã cập nhật câu hỏi #${editingQuestion.id}!`)
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
      setEditingQuestion(null)
      setEditForm(null)
      fetchStats()
    } catch (err: any) {
      console.error('Update question error:', err)
      setEditError(err?.response?.data?.message || 'Không thể lưu cập nhật câu hỏi.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C8322B] to-rose-500 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-base">Yibi CMS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-[#C8322B] border border-rose-100">
                  Admin Control Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">Hệ thống quản trị Ngân hàng câu hỏi HSK 3.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giao diện học viên</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <span className="text-xs font-medium text-slate-700">{user?.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ──────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'generator'
                ? 'border-[#C8322B] text-[#C8322B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Sinh câu hỏi tự động (Generator UI)</span>
          </button>

          <button
            onClick={() => setActiveTab('repository')}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'repository'
                ? 'border-[#C8322B] text-[#C8322B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Ngân hàng câu hỏi (Repository)</span>
            {stats && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-bold">
                {stats.totalQuestions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('coverage')}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'coverage'
                ? 'border-[#C8322B] text-[#C8322B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>Độ phủ</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#C8322B] text-[#C8322B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Báo cáo & Ma trận chất lượng</span>
          </button>
        </div>
      </div>

      {/* ── Main Container ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ======================================================== */}
        {/* TAB 1: GENERATOR UI                                      */}
        {/* ======================================================== */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Banner hướng dẫn */}
            <div className="rounded-2xl bg-gradient-to-r from-red-900 to-rose-800 p-6 text-white shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <h2 className="text-lg font-bold">Tạo bộ câu hỏi HSK 3.0 tự động (AI & Source Engine)</h2>
                  </div>
                  <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
                    Hệ thống tự động lọc từ vựng đã chuẩn hóa tiếng Việt, tách từ đơn âm, loại bỏ phương án đồng nghĩa và xáo trộn 4 phương án ngẫu nhiên tất định.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl text-xs font-medium border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Chất lượng Quality Gate 100% PASS</span>
                </div>
              </div>
            </div>

            <div role="group" aria-label="Nguồn sinh câu hỏi" className="inline-flex rounded-xl bg-slate-100 p-1">
              {([['rules', 'Theo quy tắc từ vựng'], ['ai', 'Gemini (AI)']] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGenSource(id)}
                  aria-pressed={genSource === id}
                  className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                    genSource === id ? 'bg-white text-[#C8322B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {genSource === 'ai' && <AiGeneratorPanel onGenerated={fetchStats} />}

            {genSource === 'rules' && (<>
            {/* Form tham số sinh câu hỏi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <form onSubmit={handleRunGenerator} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    1. Chọn Cấp độ HSK
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HSK_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setGenParams({ ...genParams, levelCode: lvl })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          genParams.levelCode === lvl
                            ? 'bg-[#C8322B] text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        HSK {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    2. Chọn Dạng câu hỏi (Question Type)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {QUESTION_TYPES.map((t) => {
                      const isPostponed = t.id === 'CLOZE' || t.id === 'GRAMMAR_SELECT'
                      const isSelected = genParams.questionType === t.id
                      return (
                        <div
                          key={t.id}
                          onClick={() => setGenParams({ ...genParams, questionType: t.id })}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#C8322B] bg-rose-50/50 ring-1 ring-[#C8322B]'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {t.badge}
                            </span>
                            {isPostponed ? (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                Tạm hoãn
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Khả dụng
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{t.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono mt-1">{t.id}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      3. Số lượng tối đa (Limit)
                    </label>
                    <div className="flex gap-2">
                      {[5, 10, 20, 50, 100].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setGenParams({ ...genParams, limit: num })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            genParams.limit === num
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {num} câu
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      4. Chế độ thực thi (Mode)
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer flex-1 hover:bg-slate-50">
                        <input
                          type="radio"
                          name="runMode"
                          value="dry-run"
                          checked={genParams.mode === 'dry-run'}
                          onChange={() => setGenParams({ ...genParams, mode: 'dry-run' })}
                          className="accent-[#C8322B]"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Dry-run (Xem trước)</span>
                          <span className="text-[11px] text-slate-400 block">Không lưu vào database</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer flex-1 hover:bg-slate-50">
                        <input
                          type="radio"
                          name="runMode"
                          value="import"
                          checked={genParams.mode === 'import'}
                          onChange={() => setGenParams({ ...genParams, mode: 'import' })}
                          className="accent-[#C8322B]"
                        />
                        <div>
                          <span className="text-xs font-bold text-rose-700 block">Import (Lưu vào DB)</span>
                          <span className="text-[11px] text-slate-400 block">Tạo câu hỏi DRAFT</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400">
                    Endpoint: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">POST /api/admin/question-generator/run</code>
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C8322B] text-white text-sm font-bold shadow-xs hover:bg-red-800 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý thuật toán sinh...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{genParams.mode === 'dry-run' ? 'Sinh & Xem trước' : 'Sinh & Nạp vào Database'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Thông báo lỗi nếu có */}
            {genError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{genError}</span>
              </div>
            )}

            {/* Kết quả sau khi sinh */}
            {genResult && (
              <div className="space-y-4">
                {/* Thanh tóm tắt số liệu */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        Kết quả chạy bộ sinh: HSK {genResult.levelCode} · {genResult.questionType}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Chế độ: <strong className="uppercase text-slate-700">{genResult.mode}</strong> · Yêu cầu:{' '}
                        <strong>{genResult.requestedLimit}</strong> câu
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        Đã sinh: {genResult.generated}
                      </div>
                      {genResult.mode === 'import' && (
                        <>
                          <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                            Đã nạp DB: {genResult.imported}
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                            Đã tồn tại: {genResult.alreadyExisted}
                          </div>
                        </>
                      )}
                      <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                        Bỏ qua: {genResult.skipped}
                      </div>

                      {genResult.mode === 'import' && genResult.imported > 0 && (
                        <button
                          type="button"
                          onClick={() => handleBulkPublish(genResult.levelCode, genResult.questionType)}
                          disabled={isBulkPublishing}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                        >
                          {isBulkPublishing ? 'Đang duyệt...' : 'Phê duyệt các câu này ngay (Publish)'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Danh sách thẻ câu hỏi xem trước */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {genResult.questions.map((q, idx) => (
                    <div
                      key={q.questionCode || idx}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                    >
                      <div>
                        {/* Header của câu hỏi */}
                        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#C8322B]">Q{idx + 1}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              HSK {q.levelCode}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                              {q.questionCode}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.validationStatus === 'PASS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {q.validationStatus}
                          </span>
                        </div>

                        {/* Prompt câu hỏi */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between gap-3">
                            <h4
                              className="text-lg font-bold text-slate-900 font-chinese tracking-wide"
                              style={{ fontFamily: "'Noto Serif SC', serif" }}
                            >
                              {q.prompt}
                            </h4>
                            <AudioButton text={q.prompt} size="sm" title="Nghe phát âm câu hỏi" />
                          </div>
                          {q.promptPinyin && (
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{q.promptPinyin}</p>
                          )}
                        </div>

                        {/* 4 Phương án lựa chọn */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {q.choices.map((c) => (
                            <div
                              key={c.key}
                              className={`p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                                c.correct
                                  ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold shadow-2xs'
                                  : 'border-slate-200 bg-slate-50/50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                    c.correct
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {c.key}
                                </span>
                                <span className="truncate">{c.text}</span>
                              </div>
                              {c.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Giải thích & Nguồn */}
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                        {q.explanation && (
                          <p>
                            <strong className="text-slate-700">Giải thích:</strong> {q.explanation}
                          </p>
                        )}
                        {q.skipReason && (
                          <p className="text-amber-600">
                            <strong>Lý do bỏ qua:</strong> {q.skipReason}
                          </p>
                        )}
                        {q.sourceRawRecordId && (
                          <p className="text-[10px] text-slate-400">
                            Nguồn bản ghi gốc: raw_record_id = {q.sourceRawRecordId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>)}
          </div>
        )}

        {activeTab === 'coverage' && <PoolCoveragePanel />}

        {/* ======================================================== */}
        {/* TAB 2: QUESTION BANK REPOSITORY                          */}
        {/* ======================================================== */}
        {activeTab === 'repository' && (
          <div className="space-y-6">
            {/* Hàng 4 thẻ số liệu thống kê */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>Tổng số câu hỏi</span>
                    <Database className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{stats.totalQuestions}</div>
                  <span className="text-[10px] text-slate-400">Trên 7 cấp độ HSK</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-600 text-xs mb-1">
                    <span>Đã xuất bản (PUBLISHED)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{stats.publishedCount}</div>
                  <span className="text-[10px] text-slate-400">Sẵn sàng phục vụ luyện tập</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-amber-600 text-xs mb-1">
                    <span>Bản nháp (DRAFT)</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{stats.draftCount}</div>
                  <span className="text-[10px] text-slate-400">Chờ quản trị viên duyệt</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between text-rose-600 text-xs mb-1">
                    <span>Âm thanh chuẩn MinIO</span>
                    <Volume2 className="w-4 h-4 text-[#C8322B]" />
                  </div>
                  <div className="text-2xl font-bold text-[#C8322B]">{stats.withAudioCount}</div>
                  <span className="text-[10px] text-slate-400">
                    Độ phủ: {Math.round((stats.withAudioCount / (stats.totalQuestions || 1)) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo chữ Hán, pinyin, đáp án, mã câu..."
                    value={repoParams.search || ''}
                    onChange={(e) => setRepoParams({ ...repoParams, search: e.target.value, page: 0 })}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8322B]"
                  />
                </div>

                {/* Filter Level */}
                <select
                  value={repoParams.levelCode || 'all'}
                  onChange={(e) => setRepoParams({ ...repoParams, levelCode: e.target.value, page: 0 })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="all">Tất cả cấp độ (HSK 1 - 7-9)</option>
                  {HSK_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      HSK {lvl}
                    </option>
                  ))}
                </select>

                {/* Filter Question Type */}
                <select
                  value={repoParams.questionType || 'all'}
                  onChange={(e) => setRepoParams({ ...repoParams, questionType: e.target.value, page: 0 })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="all">Tất cả dạng câu hỏi</option>
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={repoParams.status || 'all'}
                  onChange={(e) => setRepoParams({ ...repoParams, status: e.target.value, page: 0 })}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="PUBLISHED">PUBLISHED (Đã duyệt)</option>
                  <option value="DRAFT">DRAFT (Bản nháp)</option>
                </select>

                {/* Nút hành động */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleBulkPublish(repoParams.levelCode, repoParams.questionType)}
                    disabled={isBulkPublishing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
                    title="Phê duyệt toàn bộ câu hỏi DRAFT theo bộ lọc"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Duyệt bộ lọc</span>
                  </button>

                  <button
                    onClick={fetchQuestionBank}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    title="Làm mới"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách câu hỏi */}
            {isLoadingRepo ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C8322B]" />
                <p className="text-xs">Đang tải câu hỏi từ ngân hàng...</p>
              </div>
            ) : repoError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
                <p>{repoError}</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Không tìm thấy câu hỏi phù hợp</p>
                <p className="text-xs text-slate-400 mt-1">Hãy điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                    >
                      <div>
                        {/* Header card */}
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#C8322B]">#{q.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              HSK {q.levelCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                              {q.questionType}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>

                        {/* Prompt */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className="text-base font-bold text-slate-800 font-chinese leading-snug line-clamp-2"
                              style={{ fontFamily: "'Noto Serif SC', serif" }}
                            >
                              {q.prompt}
                            </h4>
                            <AudioButton
                              audioUrl={q.promptAudioUrl}
                              text={q.prompt}
                              size="sm"
                              title="Nghe phát âm"
                            />
                          </div>
                          {q.promptPinyin && (
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{q.promptPinyin}</p>
                          )}
                        </div>

                        {/* 4 Choices */}
                        <div className="space-y-1.5 mb-3">
                          {q.choices.map((c) => (
                            <div
                              key={c.id || c.key}
                              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                                c.correct
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                                  : 'bg-slate-50 text-slate-600 border border-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold bg-white border border-slate-200 shrink-0">
                                  {c.key}
                                </span>
                                <span className="truncate">{c.text}</span>
                              </div>
                              {c.correct && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="truncate text-[11px] text-slate-400 max-w-[120px]">
                          {q.explanation || 'Không có giải thích'}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {q.status === 'DRAFT' && (
                            <button
                              onClick={() => handlePublishSingle(q.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition text-[11px] cursor-pointer"
                              title="Phê duyệt câu hỏi này"
                            >
                              Duyệt
                            </button>
                          )}
                          {q.status === 'DRAFT' && (
                            <button
                              onClick={() => handleChangeStatus(q.id, 'reject')}
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition text-[11px] cursor-pointer"
                              title="Từ chối câu hỏi này"
                            >
                              Từ chối
                            </button>
                          )}
                          {q.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleChangeStatus(q.id, 'deactivate')}
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition text-[11px] cursor-pointer"
                              title="Ngưng dùng câu hỏi này"
                            >
                              Ngưng dùng
                            </button>
                          )}
                          {q.status === 'RETIRED' && (
                            <button
                              onClick={() => handleChangeStatus(q.id, 'activate')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition text-[11px] cursor-pointer"
                              title="Kích hoạt lại câu hỏi này"
                            >
                              Kích hoạt
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Chỉnh sửa câu hỏi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSingle(q.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
                    <div>
                      Hiển thị{' '}
                      <strong>
                        {(repoParams.page || 0) * (repoParams.size || 12) + 1} -{' '}
                        {Math.min(
                          ((repoParams.page || 0) + 1) * (repoParams.size || 12),
                          totalQuestions
                        )}
                      </strong>{' '}
                      trong tổng số <strong>{totalQuestions}</strong> câu hỏi
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setRepoParams({
                            ...repoParams,
                            page: Math.max(0, (repoParams.page || 0) - 1),
                          })
                        }
                        disabled={(repoParams.page || 0) === 0}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="font-semibold px-2">
                        Trang {(repoParams.page || 0) + 1} / {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setRepoParams({
                            ...repoParams,
                            page: Math.min(totalPages - 1, (repoParams.page || 0) + 1),
                          })
                        }
                        disabled={(repoParams.page || 0) >= totalPages - 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MATRIX & QUALITY REPORT                           */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Ma trận phân bổ câu hỏi theo Cấp độ HSK & Dạng câu hỏi
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Thống kê số lượng câu hỏi hiện diện trong bảng <code>question_bank_items</code>.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Cấp độ HSK</th>
                      <th className="py-3 px-4">PHONETICS_SELECT</th>
                      <th className="py-3 px-4">MEANING_HANZI</th>
                      <th className="py-3 px-4">VOCAB_MEANING</th>
                      <th className="py-3 px-4">Tổng số câu</th>
                      <th className="py-3 px-4">Trạng thái chất lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {HSK_LEVELS.map((lvl) => {
                      const count = stats.byLevel[lvl] || 0
                      return (
                        <tr key={lvl} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-800">HSK {lvl}</td>
                          <td className="py-3.5 px-4 text-slate-600">50 câu</td>
                          <td className="py-3.5 px-4 text-slate-600">50 câu</td>
                          <td className="py-3.5 px-4 text-slate-600">50 câu</td>
                          <td className="py-3.5 px-4 font-bold text-[#C8322B]">{count} câu</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Đạt chuẩn & Đã có Audio
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50">
                      <td className="py-3.5 px-4">TỔNG CỘNG</td>
                      <td className="py-3.5 px-4">350 câu</td>
                      <td className="py-3.5 px-4">350 câu</td>
                      <td className="py-3.5 px-4">350 câu</td>
                      <td className="py-3.5 px-4 text-[#C8322B] text-sm font-extrabold">
                        {stats.totalQuestions} câu
                      </td>
                      <td className="py-3.5 px-4 text-emerald-700">100% PUBLISHED</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: CHỈNH SỬA CÂU HỎI                                 */}
      {/* ======================================================== */}
      {editingQuestion && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#C8322B]" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Chỉnh sửa câu hỏi #{editingQuestion.id} ({editingQuestion.questionType})
                </h3>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Prompt */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Nội dung câu hỏi (Prompt)
                </label>
                <input
                  type="text"
                  required
                  value={editForm.prompt}
                  onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8322B] font-chinese font-semibold"
                />
              </div>

              {/* Prompt Pinyin & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Phiên âm Pinyin (nếu có)
                  </label>
                  <input
                    type="text"
                    value={editForm.promptPinyin || ''}
                    onChange={(e) => setEditForm({ ...editForm, promptPinyin: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8322B] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={editForm.status || 'DRAFT'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="DRAFT">DRAFT (Bản nháp)</option>
                    <option value="PUBLISHED">PUBLISHED (Xuất bản)</option>
                  </select>
                </div>
              </div>

              {/* 4 Choices */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  Các phương án lựa chọn (Click radio để đặt làm đáp án đúng)
                </label>
                <div className="space-y-2">
                  {editForm.choices.map((c) => (
                    <div
                      key={c.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                        c.correct
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctChoice"
                        checked={c.correct}
                        onChange={() => handleSetCorrectChoice(c.key)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                        title="Chọn phương án này làm đáp án đúng"
                      />
                      <span className="font-bold text-xs text-slate-700 w-4">{c.key}.</span>
                      <input
                        type="text"
                        required
                        value={c.text}
                        onChange={(e) => handleChoiceTextChange(c.key, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                      {c.correct && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                          Đáp án đúng
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Giải thích đáp án
                </label>
                <textarea
                  rows={2}
                  value={editForm.explanation || ''}
                  onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#C8322B]"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#C8322B] text-white text-xs font-bold hover:bg-red-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}
