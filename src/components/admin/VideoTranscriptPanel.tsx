import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Play,
  Save,
  Search,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react'
import { getYoutubeLanguages, getYoutubeTranscript, saveVideoTranscript } from '@/api/videoTranscriptApi'
import type {
  TranscriptScript,
  UsageRights,
  YoutubeLanguage,
  YoutubeLanguages,
} from '@/types/video'

const LEVELS = ['1', '2', '3', '4', '5', '6', '7-9']

const RIGHTS: { value: UsageRights; label: string }[] = [
  { value: 'OWN', label: 'Video của kênh mình' },
  { value: 'CREATIVE_COMMONS', label: 'Giấy phép Creative Commons' },
  { value: 'PERMISSION', label: 'Chủ kênh đã cho phép' },
]

const SCRIPT_LABEL: Record<NonNullable<TranscriptScript>, string> = {
  simplified: 'Giản thể',
  traditional: 'Phồn thể',
  unknown: 'Chưa rõ giản/phồn',
}

interface EditableSegment {
  key: number
  text: string
  start: number
  end: number
}

/** The transcript under review, from YouTube. */
interface Draft {
  videoId: string
  languageCode: string
  language: string
  isGenerated: boolean
  script: TranscriptScript
  traditionalChars: number
  segments: EditableSegment[]
}

let nextKey = 1

function errorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || fallback
}

/** 75.5 -> "01:15.5"; over an hour -> "1:01:15.5". */
export function formatTime(seconds: number): string {
  const tenths = Math.round(seconds * 10)
  const h = Math.floor(tenths / 36000)
  const m = Math.floor((tenths % 36000) / 600)
  const s = (tenths % 600) / 10
  const mm = String(m).padStart(2, '0')
  const ss = s.toFixed(1).padStart(4, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function TrackChip({
  track,
  active,
  recommended,
  disabled,
  onPick,
}: {
  track: YoutubeLanguage
  active: boolean
  recommended: boolean
  disabled: boolean
  onPick: () => void
}) {
  // The backend leaves null fields out of the JSON, so a non-Chinese track has no `script` at all.
  const chinese = track.script != null
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!chinese || disabled}
      title={chinese ? undefined : 'Chỉ dùng được phụ đề tiếng Trung'}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8322B]/40 ${
        active
          ? 'border-[#C8322B] bg-rose-50 text-[#C8322B]'
          : chinese
            ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
            : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
      }`}
    >
      {recommended && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-label="Đề xuất" />}
      <span className="font-semibold">{track.languageCode}</span>
      <span className="text-xs text-slate-500">{track.language}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
          track.isGenerated ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        {track.isGenerated ? 'Tự động' : 'Thủ công'}
      </span>
      {track.script && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            track.script === 'simplified'
              ? 'bg-sky-50 text-sky-700'
              : track.script === 'traditional'
                ? 'bg-violet-50 text-violet-700'
                : 'bg-slate-100 text-slate-600'
          }`}
        >
          {SCRIPT_LABEL[track.script]}
        </span>
      )}
    </button>
  )
}

/**
 * Admin tool: read the Chinese subtitles of a YouTube video, review and edit them, then save them as the source of
 * dictation and shadowing exercises. Nothing is stored until "Lưu" is pressed.
 */
export function VideoTranscriptPanel() {
  const [url, setUrl] = useState('')
  const [languages, setLanguages] = useState<YoutubeLanguages | null>(null)
  const [checking, setChecking] = useState(false)
  const [loadingTrack, setLoadingTrack] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [playFrom, setPlayFrom] = useState<number | null>(null)

  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [rights, setRights] = useState<UsageRights | ''>('')
  const [rightsNote, setRightsNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  /** The draft lesson the last save created. */
  const [created, setCreated] = useState<{ id: number; title: string } | null>(null)

  const resetForm = () => {
    setTitle('')
    setLevel('')
    setRights('')
    setRightsNote('')
    setConfirmed(false)
    setSaveError(null)
  }

  const loadTrack = async (video: string, language?: string, generated?: boolean) => {
    setLoadingTrack(true)
    setError(null)
    try {
      const t = await getYoutubeTranscript(video, language, generated)
      setDraft({
        videoId: t.videoId,
        languageCode: t.languageCode,
        language: t.language,
        isGenerated: t.isGenerated,
        script: t.script,
        traditionalChars: t.traditionalChars,
        segments: t.segments.map((s) => ({ key: nextKey++, text: s.text, start: s.start, end: s.end })),
      })
      setPlayFrom(null)
    } catch (err) {
      setError(errorMessage(err, 'Không lấy được phụ đề.'))
    } finally {
      setLoadingTrack(false)
    }
  }

  const check = async () => {
    const value = url.trim()
    if (!value) {
      setError('Hãy dán link hoặc mã video YouTube.')
      return
    }
    setChecking(true)
    setError(null)
    setCreated(null)
    setLanguages(null)
    setDraft(null)
    resetForm()
    try {
      const result = await getYoutubeLanguages(value)
      setLanguages(result)
      if (result.recommended) {
        await loadTrack(result.videoId, result.recommended, result.recommendedIsGenerated ?? undefined)
      } else if (result.languages.some((l) => l.script === 'traditional')) {
        setError('Video chỉ có phụ đề tiếng Trung phồn thể. Bấm vào bản đó nếu vẫn muốn dùng và tự chuyển sang giản thể khi duyệt.')
      } else if (result.languages.length === 0) {
        setError('Video này không có phụ đề nào.')
      } else {
        setError('Video không có phụ đề tiếng Trung.')
      }
    } catch (err) {
      setError(errorMessage(err, 'Không kiểm tra được video.'))
    } finally {
      setChecking(false)
    }
  }

  const updateSegment = (key: number, patch: Partial<EditableSegment>) =>
    setDraft((d) => (d ? { ...d, segments: d.segments.map((s) => (s.key === key ? { ...s, ...patch } : s)) } : d))

  const removeSegment = (key: number) =>
    setDraft((d) => (d ? { ...d, segments: d.segments.filter((s) => s.key !== key) } : d))

  const invalidAt = draft?.segments.findIndex((s) => !(s.start >= 0 && s.end > s.start)) ?? -1
  const canSave =
    !!draft && draft.segments.length > 0 && invalidAt < 0 && title.trim() !== '' && rights !== '' && confirmed && !saving

  const save = async () => {
    if (!draft || !canSave) return
    setSaving(true)
    setSaveError(null)
    try {
      const result = await saveVideoTranscript({
        videoId: draft.videoId,
        title: title.trim(),
        languageCode: draft.languageCode,
        isGenerated: draft.isGenerated,
        hskLevel: level || undefined,
        usageRights: rights,
        rightsNote: rightsNote.trim() || undefined,
        rightsConfirmed: confirmed,
        segments: draft.segments.map(({ text, start, end }) => ({ text, start, end })),
      })
      setCreated({ id: result.lessonId, title: title.trim() })
    } catch (err) {
      setSaveError(errorMessage(err, 'Không lưu được phụ đề.'))
    } finally {
      setSaving(false)
    }
  }

  const busy = checking || loadingTrack

  return (
    <div className="space-y-6">
      {/* ── Step 1: the link ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-800">Lấy phụ đề tiếng Trung từ YouTube</h2>
        <p className="mt-1 text-sm text-slate-500">
          Dùng cho bài nghe chép (dictation) và nói nhại (shadowing). Sau khi duyệt, phụ đề thành một bài luyện nháp của bạn; công khai nó ở tab Thư viện video.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Chỉ dùng video của kênh mình, video có giấy phép Creative Commons, hoặc video mà chủ kênh đã đồng ý cho dùng.
          </span>
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            void check()
          }}
        >
          <label htmlFor="yt-url" className="sr-only">
            Link YouTube
          </label>
          <input
            id="yt-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… hoặc mã 11 ký tự"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#C8322B] focus:outline-none focus:ring-2 focus:ring-[#C8322B]/20"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8322B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a92822] disabled:opacity-60 cursor-pointer"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Kiểm tra phụ đề
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {languages && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Phụ đề có sẵn ({languages.languages.length})
            </p>
            {languages.languages.length === 0 ? (
              <p className="text-sm text-slate-500">Không có phụ đề nào.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {languages.languages.map((track) => (
                  <TrackChip
                    key={`${track.languageCode}-${track.isGenerated}`}
                    track={track}
                    active={draft?.languageCode === track.languageCode && draft?.isGenerated === track.isGenerated}
                    recommended={
                      languages.recommended === track.languageCode &&
                      languages.recommendedIsGenerated === track.isGenerated
                    }
                    disabled={busy}
                    onPick={() => void loadTrack(languages.videoId, track.languageCode, track.isGenerated)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {loadingTrack && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải phụ đề…
        </div>
      )}

      {/* ── Step 2: review ───────────────────────────────────────── */}
      {draft && !loadingTrack && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-slate-800">Xem trước</span>
              <span className="text-sm text-slate-500">
                {draft.languageCode} · {draft.isGenerated ? 'tự động' : 'thủ công'} · {draft.segments.length} đoạn
              </span>
            </div>

            <div className="space-y-2 px-5 pt-3">
              {draft.isGenerated && (
                <Warning>Phụ đề tự động thường sai chữ và thiếu dấu câu. Hãy đọc và sửa kỹ từng đoạn.</Warning>
              )}
              {draft.script === 'traditional' && (
                <Warning>Đây là phụ đề phồn thể, không phải giản thể.</Warning>
              )}
              {draft.script === 'unknown' && (
                <Warning>YouTube không ghi rõ phụ đề "zh" là giản thể hay phồn thể; hãy kiểm tra khi duyệt.</Warning>
              )}
              {draft.traditionalChars > 0 && (
                <Warning>Có {draft.traditionalChars} chữ phồn thể trong phụ đề.</Warning>
              )}
            </div>

            <ol className="max-h-[36rem] divide-y divide-slate-100 overflow-y-auto px-2 py-2">
              {draft.segments.map((s, i) => {
                const bad = !(s.start >= 0 && s.end > s.start)
                return (
                  <li key={s.key} className={`flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center ${bad ? 'bg-red-50' : ''}`}>
                    <div className="flex items-center gap-2 sm:w-64 sm:shrink-0">
                      <span className="w-8 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setPlayFrom(s.start)}
                        className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 font-mono text-xs text-sky-700 hover:bg-sky-50 cursor-pointer"
                        title="Phát từ mốc này"
                      >
                        <Play className="h-3 w-3" />
                        {formatTime(s.start)} → {formatTime(s.end)}
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={s.start}
                        aria-label={`Bắt đầu đoạn ${i + 1} (giây)`}
                        onChange={(e) => updateSegment(s.key, { start: Number(e.target.value) })}
                        className="w-16 rounded-md border border-slate-200 px-1 py-0.5 text-xs tabular-nums"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={s.end}
                        aria-label={`Kết thúc đoạn ${i + 1} (giây)`}
                        onChange={(e) => updateSegment(s.key, { end: Number(e.target.value) })}
                        className="w-16 rounded-md border border-slate-200 px-1 py-0.5 text-xs tabular-nums"
                      />
                    </div>
                    <input
                      value={s.text}
                      aria-label={`Nội dung đoạn ${i + 1}`}
                      onChange={(e) => updateSegment(s.key, { text: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 text-base text-slate-800 hover:border-slate-200 focus:border-[#C8322B] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeSegment(s.key)}
                      aria-label={`Xoá đoạn ${i + 1}`}
                      className="self-end rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 sm:self-auto cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* ── Player and save form ─────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-xs">
              <iframe
                key={`${draft.videoId}-${playFrom ?? 'idle'}`}
                title="Video YouTube"
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${draft.videoId}?rel=0${
                  playFrom !== null ? `&start=${Math.floor(playFrom)}&autoplay=1` : ''
                }`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="font-semibold text-slate-800">Duyệt và lưu</h3>
              <Field label="Tiêu đề *">
                <input
                  value={title}
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                />
              </Field>
              <Field label="Cấp HSK">
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm">
                  <option value="">Chưa xếp cấp</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      HSK {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quyền sử dụng video *">
                <select
                  value={rights}
                  onChange={(e) => setRights(e.target.value as UsageRights | '')}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                >
                  <option value="">Chọn…</option>
                  {RIGHTS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ghi chú quyền (link giấy phép, email đồng ý…)">
                <input
                  value={rightsNote}
                  maxLength={500}
                  onChange={(e) => setRightsNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                />
              </Field>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 accent-[#C8322B]"
                />
                Tôi đã duyệt phụ đề và xác nhận được phép dùng video này.
              </label>
              {invalidAt >= 0 && (
                <p className="text-xs text-red-600">Đoạn {invalidAt + 1} có thời gian kết thúc không sau thời gian bắt đầu.</p>
              )}
              {saveError && (
                <p role="alert" className="text-sm text-red-600">
                  {saveError}
                </p>
              )}
              {created && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Đã tạo bài luyện nháp "{created.title}".
                  </p>
                  <p className="mt-1 text-xs">
                    Mở trình sửa để kiểm tra lời thoại, bấm Hoàn tất (tạo pinyin và bản dịch), rồi công khai ở tab Thư viện video.
                  </p>
                  <Link to={`/listening/${created.id}/edit`} className="mt-2 inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
                    Mở trình sửa lời thoại
                  </Link>
                </div>
              )}
              <button
                type="button"
                onClick={() => void save()}
                disabled={!canSave}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8322B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a92822] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Tạo bài luyện nháp
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  )
}
