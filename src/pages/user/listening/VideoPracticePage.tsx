import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Flag,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Send,
  Undo2,
  ArrowRight,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Headphones,
  Languages,
  Lightbulb,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Type,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslationToasts } from '@/components/listening/useTranslationToasts'
import {
  apiError,
  getMediaUrl,
  getVideo,
  markPractised,
  removeFromShelf,
  saveToShelf,
  scoreShadowing,
  translateVideo,
  withdrawVideo,
} from '@/api/listeningApi'
import { useAppSelector } from '@/app/hooks'
import { VISIBILITY } from '@/components/listening/LessonCard'
import { SubmitLessonDialog } from '@/components/listening/SubmitLessonDialog'
import { ReportDialog } from '@/components/ui/ReportDialog'
import type { ReportTarget } from '@/types/adminOps'
import { SegmentPlayer, formatTime, speakChinese, type PlayerHandle } from '@/components/listening/SegmentPlayer'
import { checkDictation, type DictationResult } from '@/components/listening/dictation'
import { PRACTICE_MODES, type PracticeMode } from '@/components/listening/PracticeModeDialog'
import { VoiceRecorder } from '@/components/placement/VoiceRecorder'
import { WordDetailModal } from '@/components/vocabulary/word-detail/WordDetailModal'
import type { LearnerSegment, ShadowingResult, VideoDetail } from '@/types/listening'

type VideoSize = '50' | '75' | '100'
const SIZES: VideoSize[] = ['50', '75', '100']
const RATES = [0.5, 0.75, 1, 1.25]
const SIZE_KEY = 'listening.videoSize'

function savedSize(): VideoSize {
  try {
    const v = window.localStorage.getItem(SIZE_KEY)
    return v === '50' || v === '75' || v === '100' ? v : '50'
  } catch {
    return '50'
  }
}

/** What every practice panel gets from the page: the player, the speed and playback of one sentence. */
interface PlayerControls {
  playing: boolean
  rate: number
  setRate: (rate: number) => void
  /** Plays the sentence, or pauses when something is already playing. */
  toggleSentence: (segment: LearnerSegment) => void
  playSentence: (segment: LearnerSegment) => void
}

/**
 * Practice on a finished video. The video sits beside the panel of the chosen mode (dictation, shadowing or the
 * transcript); the learner picks how wide the video is, or puts both in full screen.
 */
export function VideoPracticePage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const [params, setParams] = useSearchParams()
  const mode: PracticeMode = PRACTICE_MODES.some((m) => m.id === params.get('mode'))
    ? (params.get('mode') as PracticeMode)
    : 'transcript'
  const player = useRef<PlayerHandle>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [time, setTime] = useState(0)
  const [rate, setRateState] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [size, setSizeState] = useState<VideoSize>(savedSize)
  const [fullscreen, setFullscreen] = useState(false)
  const [wordId, setWordId] = useState<number | null>(null)
  const [sharing, setSharing] = useState(false)
  const [reporting, setReporting] = useState<{ type: ReportTarget; id: number; ref?: number; label: string } | null>(null)
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'ROLE_ADMIN')

  const load = useCallback(async () => {
    try {
      setVideo(await getVideo(id))
    } catch (err) {
      setError(apiError(err, 'Không tải được video.'))
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!video?.hasMedia) return
    getMediaUrl(id).then(setMediaUrl).catch(() => setMediaUrl(null))
  }, [id, video?.hasMedia])

  // Translations arrive in the background; refresh until they are done.
  useEffect(() => {
    if (video?.translationStatus !== 'RUNNING') return
    const timer = window.setInterval(() => void load(), 3000)
    return () => window.clearInterval(timer)
  }, [video?.translationStatus, load])

  useEffect(() => {
    const onChange = () => setFullscreen(!!stage.current && document.fullscreenElement === stage.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useTranslationToasts(
    video?.mine ? [{ ...video, done: video.segments.filter((s) => s.vi && !s.viStale).length, total: video.segments.length }] : []
  )

  // Practising someone else's lesson counts towards "Được luyện nhiều" (once a day, by the server).
  const practisedOnce = useRef(false)
  useEffect(() => {
    if (!video || video.mine || video.status !== 'READY' || practisedOnce.current) return
    practisedOnce.current = true
    markPractised(video.id)
  }, [video])

  const toggleSave = async () => {
    if (!video) return
    try {
      if (video.saved) await removeFromShelf(video.id)
      else await saveToShelf(video.id)
      toast.success(video.saved ? 'Đã bỏ lưu' : 'Đã lưu vào Video của tôi', { description: video.title })
      setVideo({ ...video, saved: !video.saved })
    } catch (err) {
      toast.error('Chưa lưu được', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  const withdraw = async () => {
    if (!video) return
    try {
      setVideo(await withdrawVideo(video.id))
      toast.success('Đã rút bài về', { description: 'Bạn có thể sửa rồi gửi lại.' })
    } catch (err) {
      toast.error('Chưa rút được bài', { description: apiError(err, 'Hãy thử lại.') })
    }
  }

  const playable = !!video && (!!video.videoId || video.hasMedia)

  const setRate = (r: number) => {
    setRateState(r)
    player.current?.setRate(r)
  }

  const playSentence = useCallback(
    (segment: LearnerSegment) => {
      if (playable && segment.start != null && segment.end != null) {
        player.current?.setRate(rate)
        player.current?.playRange(segment.start, segment.end)
      } else {
        speakChinese(segment.text, rate)
      }
    },
    [playable, rate]
  )

  const toggleSentence = useCallback(
    (segment: LearnerSegment) => {
      if (player.current?.isPlaying()) player.current.pause()
      else playSentence(segment)
    },
    [playSentence]
  )

  const setSize = (s: VideoSize) => {
    setSizeState(s)
    try {
      window.localStorage.setItem(SIZE_KEY, s)
    } catch {
      // Only a convenience.
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    else void stage.current?.requestFullscreen?.().catch(() => undefined)
  }

  const switchMode = (m: PracticeMode) => {
    player.current?.pause()
    setParams({ mode: m }, { replace: true })
  }

  if (error) {
    return (
      <Frame title="Luyện tập">
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <AlertCircle className="mx-auto h-8 w-8" />
          <p className="mt-2 font-bold">{error}</p>
        </div>
      </Frame>
    )
  }
  if (!video) {
    return (
      <Frame title="Luyện tập">
        <div className="mt-16 flex justify-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </Frame>
    )
  }
  if (video.status !== 'READY') {
    return (
      <Frame title={video.title}>
        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-slate-800">Video chưa hoàn tất.</p>
          {video.editable && (
            <Link to={`/listening/${id}/edit`} className="mt-4 inline-block rounded-xl bg-brand px-4 py-2.5 font-bold text-white">Tiếp tục sửa lời thoại</Link>
          )}
        </div>
      </Frame>
    )
  }

  const segments = video.segments
  // Someone else's lesson can only be fixed by reporting; one's own is simply edited.
  const reportLine = video.editable
    ? undefined
    : (index: number) => setReporting({ type: 'LISTENING_SEGMENT', id: video.id, ref: index, label: `Câu ${index + 1}: ${segments[index]?.text ?? ''}` })
  const active = segments.findIndex((s) => s.start != null && s.end != null && time >= s.start && time < s.end)
  const controls: PlayerControls = { playing, rate, setRate, toggleSentence, playSentence }
  const sideBySide = size !== '100'
  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled

  return (
    <Frame
      title={video.title}
      right={
        <>
          <div role="tablist" aria-label="Chế độ luyện" className="hidden rounded-xl bg-slate-100 p-1 md:inline-flex">
            {PRACTICE_MODES.map(({ id: m, short, icon: Icon }) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${mode === m ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Icon className="h-4 w-4" /> {short}
              </button>
            ))}
          </div>
          {!video.mine && video.visibility === 'PUBLISHED' && (
            <button
              type="button"
              onClick={() => void toggleSave()}
              aria-pressed={video.saved}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition ${video.saved ? 'border-brand bg-brand text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {video.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              <span className="hidden xl:inline">{video.saved ? 'Đã lưu' : 'Lưu'}</span>
            </button>
          )}
          {video.mine && video.editable && (video.visibility === 'PRIVATE' || video.visibility === 'REJECTED') && (
            <button type="button" onClick={() => setSharing(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-brand hover:bg-rose-100">
              <Send className="h-4 w-4" /> <span className="hidden xl:inline">Chia sẻ</span>
            </button>
          )}
          {video.editable && (
            <Link to={`/listening/${id}/edit`} aria-label="Sửa lời thoại" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Pencil className="h-4 w-4" /> <span className="hidden xl:inline">Sửa lời thoại</span>
            </Link>
          )}
        </>
      }
    >
      {/* Mode switch on small screens */}
      <div className="mx-auto flex max-w-[96rem] gap-1 px-4 pt-3 md:hidden">
        {PRACTICE_MODES.map(({ id: m, short, icon: Icon }) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => switchMode(m)}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-sm font-bold ${mode === m ? 'bg-white text-brand shadow-sm' : 'text-slate-500'}`}
          >
            <Icon className="h-4 w-4" /> {short}
          </button>
        ))}
      </div>

      <div ref={stage} className={fullscreen ? 'h-full overflow-y-auto bg-slate-50 p-4' : 'mx-auto w-full max-w-[96rem] px-4 pb-16 pt-4'}>
        <Credits
          video={video}
          onWithdraw={() => void withdraw()}
          onReport={video.editable ? undefined : () => setReporting({ type: 'LISTENING_LESSON', id: video.id, label: video.title })}
        />
        <TranslationBanner video={video} onRetry={!video.editable ? undefined : async () => {
          try {
            setVideo(await translateVideo(id))
          } catch (err) {
            toast.error('Chưa dịch tiếp được', { description: apiError(err, 'Hãy thử lại sau.') })
          }
        }} />

        <div className={sideBySide ? 'flex flex-col gap-5 lg:flex-row lg:items-start' : 'space-y-5'}>
          <div
            style={sideBySide ? ({ '--video-w': `${size}%` } as React.CSSProperties) : undefined}
            className={sideBySide ? `space-y-2 lg:sticky lg:w-[var(--video-w)] lg:shrink-0 ${fullscreen ? 'lg:top-0' : 'lg:top-20'}` : 'space-y-2'}
          >
            <div className="flex items-center justify-end gap-1">
              <span className="mr-1 hidden text-xs font-bold text-slate-400 lg:inline">Cỡ video</span>
              {canFullscreen && (
                <SizeButton active={fullscreen} onClick={toggleFullscreen} label={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
                  {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  <span className="hidden sm:inline">{fullscreen ? 'Thoát' : 'Toàn màn hình'}</span>
                </SizeButton>
              )}
              {SIZES.map((s) => (
                <SizeButton key={s} active={size === s} onClick={() => setSize(s)} label={`Video rộng ${s}%`} className="hidden lg:inline-flex">
                  {s}%
                </SizeButton>
              ))}
            </div>
            <div className={sideBySide ? '' : 'mx-auto'} style={sideBySide ? undefined : { maxWidth: fullscreen ? 'calc(78vh * 16 / 9)' : 'calc(70vh * 16 / 9)' }}>
              {playable ? (
                <SegmentPlayer ref={player} videoId={video.videoId} mediaUrl={mediaUrl} mediaType={video.mediaType} onTime={setTime} onPlayingChange={setPlaying} />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-600">
                  <Headphones className="h-10 w-10 text-slate-400" />
                  Không có file âm thanh: câu được đọc bằng giọng của trình duyệt.
                </div>
              )}
            </div>
          </div>

          <section className="min-w-0 flex-1">
            {mode === 'dictation' && <DictationPanel key={`d-${id}`} segments={segments} controls={controls} onReport={reportLine} />}
            {mode === 'shadowing' && <ShadowingPanel key={`s-${id}`} videoId={id} segments={segments} controls={controls} onWord={setWordId} onReport={reportLine} />}
            {mode === 'transcript' && (
              <TranscriptPanel
                segments={segments}
                active={active}
                controls={controls}
                onPlayFrom={(s) => {
                  if (playable && s.start != null) {
                    player.current?.seek(s.start)
                    player.current?.play()
                  } else speakChinese(s.text, rate)
                }}
                onToggleVideo={() => player.current?.toggle()}
                onWord={setWordId}
                onReport={reportLine}
              />
            )}
          </section>
        </div>
      </div>
      {wordId !== null && <WordDetailModal vocabularyId={wordId} onClose={() => setWordId(null)} />}
      {reporting && <ReportDialog target={reporting} onClose={() => setReporting(null)} />}
      {sharing && (
        <SubmitLessonDialog
          lesson={video}
          admin={isAdmin}
          onClose={() => setSharing(false)}
          onSubmitted={(detail) => {
            setSharing(false)
            setVideo(detail)
          }}
        />
      )}
    </Frame>
  )
}

/**
 * Who made what: the YouTube channel the video belongs to, the contributor of the lines, the categories; for the
 * contributor, where the lesson stands in review and the admin's note.
 */
function Credits({ video, onWithdraw, onReport }: { video: VideoDetail; onWithdraw: () => void; onReport?: () => void }) {
  const vis = VISIBILITY[video.visibility]
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
        {video.channelName && (
          <span className="inline-flex items-center gap-1.5">
            Video:
            {video.channelUrl ? (
              <a href={video.channelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-brand">
                {video.channelName} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <b className="text-slate-700">{video.channelName}</b>
            )}
          </span>
        )}
        {video.videoId && (
          <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold hover:text-brand">
            Xem trên YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {video.contributorName && (
          <span>
            {video.editorial ? 'Biên soạn' : 'Lời thoại'}:{' '}
            <b className="text-slate-700">{video.editorial ? 'Đội ngũ Yibi' : video.mine ? 'bạn' : `@${video.contributorName}`}</b>
          </span>
        )}
        {video.categories.map((c) => (
          <Link key={c.id} to={`/listening/c/${c.slug}`} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200">
            {c.name}
          </Link>
        ))}
        {onReport && (
          <button type="button" onClick={onReport} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-brand">
            <Flag className="h-3.5 w-3.5" /> Báo lỗi bài
          </button>
        )}
        {video.mine && video.visibility !== 'PRIVATE' && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${vis.className}`}>
            <vis.icon className="h-3.5 w-3.5" /> {vis.label}
          </span>
        )}
      </div>
      {video.mine && video.visibility === 'PENDING_REVIEW' && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="flex-1">Bài đang chờ admin duyệt. Muốn sửa thì rút bài về, sửa xong gửi lại.</span>
          <button type="button" onClick={onWithdraw} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 font-bold">
            <Undo2 className="h-4 w-4" /> Rút bài về
          </button>
        </div>
      )}
      {video.mine && video.visibility === 'REJECTED' && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-bold">Bài chưa được duyệt.</p>
          {video.reviewNote && <p className="mt-0.5">Góp ý của admin: {video.reviewNote}</p>}
          <p className="mt-0.5">Hãy sửa theo góp ý rồi bấm "Chia sẻ" để gửi lại.</p>
        </div>
      )}
      {video.mine && video.visibility === 'HIDDEN' && (
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          Admin đã tạm ẩn bài khỏi thư viện{video.reviewNote ? `: ${video.reviewNote}` : '.'}
        </div>
      )}
    </div>
  )
}

// ── Toolbar shared by dictation and shadowing ─────────────────────────

function SentenceToolbar({ segment, pos, total, labels, onGo, controls, onRestart, restartLabel }: {
  segment: LearnerSegment
  pos: number
  total: number
  /** Text of each option in the sentence picker. */
  labels: string[]
  onGo: (pos: number) => void
  controls: PlayerControls
  onRestart: () => void
  restartLabel: string
}) {
  const icon = 'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 p-2">
      <button
        type="button"
        onClick={() => controls.toggleSentence(segment)}
        aria-label={controls.playing ? 'Tạm dừng' : 'Phát câu này (Alt+P)'}
        title={controls.playing ? 'Tạm dừng' : 'Phát câu này (Alt+P)'}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white hover:bg-slate-700"
      >
        {controls.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button type="button" onClick={() => onGo(pos - 1)} disabled={pos === 0} aria-label="Câu trước" title="Câu trước" className={icon}>
        <SkipBack className="h-4 w-4" />
      </button>
      <label className="sr-only" htmlFor="sentence-picker">Chọn câu</label>
      <select
        id="sentence-picker"
        value={pos}
        onChange={(e) => onGo(Number(e.target.value))}
        className="h-10 min-w-0 rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700"
      >
        {labels.map((label, i) => <option key={i} value={i}>{label}</option>)}
      </select>
      <button type="button" onClick={() => onGo(pos + 1)} disabled={pos >= total - 1} aria-label="Câu sau" title="Câu sau" className={icon}>
        <SkipForward className="h-4 w-4" />
      </button>
      <label className="sr-only" htmlFor="rate-picker">Tốc độ</label>
      <select
        id="rate-picker"
        value={controls.rate}
        onChange={(e) => controls.setRate(Number(e.target.value))}
        title="Tốc độ"
        className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700"
      >
        {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
      </select>
      <button type="button" onClick={onRestart} aria-label={restartLabel} title={restartLabel} className={`${icon} ml-auto`}>
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Alt+P plays the current sentence from anywhere on the page, the answer box included. */
function useAltP(action: () => void) {
  const ref = useRef(action)
  ref.current = action
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        ref.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}

// ── Dictation ─────────────────────────────────────────────────────────

type Outcome = { result: DictationResult; score: number } | 'skipped'

function DictationPanel({ segments, controls, onReport }: {
  segments: LearnerSegment[]
  controls: PlayerControls
  onReport?: (index: number) => void
}) {
  const [order, setOrder] = useState<number[]>(() => segments.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({})
  const [hints, setHints] = useState(0)
  const [summary, setSummary] = useState(false)
  const input = useRef<HTMLTextAreaElement>(null)

  const index = order[pos]
  const segment = segments[index]
  const answer = answers[index] ?? ''
  const outcome = outcomes[index]
  const checked = outcome !== undefined && outcome !== 'skipped'
  const last = pos >= order.length - 1

  useAltP(() => segment && controls.toggleSentence(segment))

  // A new sentence plays by itself once, unless it was already answered.
  useEffect(() => {
    if (summary || !segment) return
    input.current?.focus()
    if (outcomes[index] !== undefined) return
    const t = window.setTimeout(() => controls.playSentence(segment), 300)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, order, summary])

  const go = (p: number) => {
    if (p < 0 || p >= order.length) return
    setHints(0)
    setPos(p)
  }

  const check = () => {
    if (!segment || !answer.trim()) return
    const r = checkDictation(segment.text, segment.pinyin, answer)
    setOutcomes((o) => ({ ...o, [index]: { result: r, score: Math.max(0, r.score - hints * 0.1) } }))
  }

  const skip = () => {
    setOutcomes((o) => ({ ...o, [index]: 'skipped' }))
    if (last) setSummary(true)
    else go(pos + 1)
  }

  const retry = () => {
    setOutcomes((o) => {
      const next = { ...o }
      delete next[index]
      return next
    })
    setAnswers((a) => ({ ...a, [index]: '' }))
    setHints(0)
    input.current?.focus()
    controls.playSentence(segment)
  }

  const next = () => {
    if (last) setSummary(true)
    else go(pos + 1)
  }

  const restart = (subset?: number[]) => {
    const started = Object.keys(outcomes).length > 0
    if (!subset && started && !summary && !window.confirm('Làm lại bài từ câu đầu tiên? Kết quả hiện tại sẽ bị xoá.')) return
    setOrder(subset ?? segments.map((_, i) => i))
    setOutcomes({})
    setAnswers({})
    setHints(0)
    setSummary(false)
    setPos(0)
  }

  const labels = order.map((i, p) => {
    const o = outcomes[i]
    const mark = o === undefined ? '' : o === 'skipped' ? ' · bỏ qua' : ` · ${Math.round(o.score * 100)}%`
    return `Câu ${p + 1}/${order.length}${mark}`
  })

  if (summary) {
    const scores = order.map((i) => {
      const o = outcomes[i]
      return o && o !== 'skipped' ? o.score : 0
    })
    const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const weak = order.filter((_, p) => scores[p] < 0.6)
    const skipped = order.filter((i) => outcomes[i] === 'skipped' || outcomes[i] === undefined).length
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Kết quả nghe chép</p>
        <p className="mt-2 text-5xl font-extrabold text-slate-900">{Math.round(average * 100)}%</p>
        <p className="mt-2 text-slate-500">
          {order.length - weak.length}/{order.length} câu đạt từ 60%{skipped > 0 ? ` · ${skipped} câu bỏ qua` : ''}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {weak.length > 0 && (
            <button type="button" onClick={() => restart(weak)} className="rounded-2xl bg-brand px-5 py-3 font-extrabold text-white">
              Luyện lại {weak.length} câu chưa đạt
            </button>
          )}
          <button type="button" onClick={() => restart()} className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
            Làm lại từ đầu
          </button>
          <button type="button" onClick={() => setSummary(false)} className="rounded-2xl px-5 py-3 font-bold text-slate-500 hover:bg-slate-50">
            Xem lại từng câu
          </button>
        </div>
      </div>
    )
  }

  const hanzi = segment.text.replace(/[^㐀-鿿]/g, '')
  const result = checked ? outcome.result : null
  const score = checked ? outcome.score : 0

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SentenceToolbar
        segment={segment}
        pos={pos}
        total={order.length}
        labels={labels}
        onGo={go}
        controls={controls}
        onRestart={() => restart()}
        restartLabel="Làm lại từ đầu"
      />

      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm text-slate-500">
          <span>Gõ chữ Hán (hoặc pinyin) bạn nghe được</span>
          {!checked && hints < 3 && (
            <button type="button" onClick={() => setHints((h) => h + 1)} className="inline-flex shrink-0 items-center gap-1 font-bold text-amber-700 hover:text-amber-900">
              <Lightbulb className="h-4 w-4" /> Gợi ý ({3 - hints})
            </button>
          )}
        </div>
        {hints > 0 && !checked && (
          <div className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {hints >= 1 && <p>Câu có {hanzi.length} chữ Hán.</p>}
            {hints >= 2 && <p>Bắt đầu bằng: <b className="text-lg">{hanzi.slice(0, 1)}</b></p>}
            {hints >= 3 && segment.pinyin && <p>Pinyin: <span className="font-pinyin">{segment.pinyin}</span></p>}
            <p className="mt-1 text-xs text-amber-700">Mỗi gợi ý trừ 10% điểm câu này.</p>
          </div>
        )}

        <textarea
          ref={input}
          value={answer}
          onChange={(e) => setAnswers((a) => ({ ...a, [index]: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              if (checked) next()
              else check()
            }
          }}
          readOnly={checked}
          aria-readonly={checked}
          rows={3}
          placeholder="Gõ câu bạn nghe được…"
          aria-label="Câu trả lời"
          className={`w-full resize-none rounded-2xl border-2 px-4 py-3 text-2xl leading-relaxed transition focus:outline-none ${checked ? 'cursor-default border-slate-100 bg-slate-50 text-slate-400 opacity-60' : 'border-slate-200 focus:border-brand'}`}
        />

        <div className="mt-3 flex gap-3">
          {checked ? (
            <button type="button" onClick={retry} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
              <RotateCcw className="h-4 w-4" /> Làm lại
            </button>
          ) : (
            <button type="button" onClick={skip} className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50">
              Bỏ qua
            </button>
          )}
          {checked ? (
            <button type="button" onClick={next} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-base font-extrabold text-white shadow-md">
              {last ? <>Xem kết quả <Check className="h-5 w-5" /></> : <>Câu tiếp <ArrowRight className="h-5 w-5" /></>}
            </button>
          ) : (
            <button type="button" onClick={check} disabled={!answer.trim()} className="flex-1 rounded-2xl bg-brand py-3 text-base font-extrabold text-white shadow-md disabled:opacity-50">
              Kiểm tra
            </button>
          )}
        </div>

        {outcome === 'skipped' && (
          <p className="mt-3 text-sm text-slate-500">Bạn đã bỏ qua câu này. Gõ rồi bấm Kiểm tra để làm.</p>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className={`rounded-2xl px-4 py-3 ${score >= 0.9 ? 'bg-emerald-50' : score >= 0.6 ? 'bg-amber-50' : 'bg-red-50'}`}>
              <p className="text-sm font-bold text-slate-600">Điểm câu này: <span className="text-2xl text-slate-900">{Math.round(score * 100)}%</span></p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-500">Đáp án</p>
              <p className="text-2xl tracking-wide">
                {result.expected.map((c, i) => (
                  <span key={i} className={c.hit ? 'text-emerald-700' : 'text-slate-400 underline decoration-red-400 decoration-2'}>{c.ch}</span>
                ))}
              </p>
              {result.typed.some((c) => !c.hit) && (
                <>
                  <p className="mt-2 text-xs font-bold uppercase text-slate-500">Bạn gõ</p>
                  <p className="text-2xl tracking-wide">
                    {result.typed.map((c, i) => <span key={i} className={c.hit ? 'text-emerald-700' : 'text-red-600 line-through'}>{c.ch}</span>)}
                  </p>
                </>
              )}
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              {onReport && (
                <button type="button" onClick={() => onReport(index)} className="float-right inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-brand">
                  <Flag className="h-3.5 w-3.5" /> Báo lỗi câu này
                </button>
              )}
              <p className="text-xl text-slate-900">{segment.text}</p>
              {segment.pinyin && <p className="font-pinyin text-sm text-slate-500">{segment.pinyin}</p>}
              {segment.vi && <p className="mt-1 text-sm text-slate-600">{segment.vi}</p>}
            </div>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">Enter: kiểm tra / câu tiếp · Alt+P: nghe lại</p>
      </div>
    </div>
  )
}

// ── Shadowing ─────────────────────────────────────────────────────────

function ShadowingPanel({ videoId, segments, controls, onWord, onReport }: {
  videoId: number
  segments: LearnerSegment[]
  controls: PlayerControls
  onWord: (id: number) => void
  onReport?: (index: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [showVi, setShowVi] = useState(false)
  const [results, setResults] = useState<Record<number, ShadowingResult>>({})
  const [attempt, setAttempt] = useState(0)
  const segment = segments[index]
  const result = results[index]

  useAltP(() => controls.toggleSentence(segment))

  const go = (i: number) => {
    if (i < 0 || i >= segments.length) return
    setIndex(i)
    setAttempt((a) => a + 1)
  }

  const again = () => {
    setResults((r) => {
      const next = { ...r }
      delete next[index]
      return next
    })
    setAttempt((a) => a + 1)
  }

  const labels = segments.map((_, i) => {
    const r = results[i]
    return `Câu ${i + 1}/${segments.length}${r ? ` · ${Math.round(r.accuracy * 100)}%` : ''}`
  })

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SentenceToolbar
        segment={segment}
        pos={index}
        total={segments.length}
        labels={labels}
        onGo={go}
        controls={controls}
        onRestart={again}
        restartLabel="Đọc lại câu này"
      />
      <div className="p-4 sm:p-5">
        <div className="flex justify-end gap-4">
          {onReport && (
            <button type="button" onClick={() => onReport(index)} className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-brand">
              <Flag className="h-4 w-4" /> Báo lỗi
            </button>
          )}
          <button type="button" onClick={() => setShowVi((v) => !v)} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800">
            {showVi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showVi ? 'Ẩn' : 'Hiện'} nghĩa
          </button>
        </div>
        <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-5 text-center">
          <Sentence segment={segment} pinyin onWord={onWord} size="text-3xl" />
          {showVi && segment.vi && <p className="mt-2 text-slate-600">{segment.vi}</p>}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">Nghe mẫu (▶ hoặc Alt+P) rồi ghi âm, đọc theo đúng nhịp và thanh điệu.</p>
        <div className="mt-3">
          <VoiceRecorder
            key={`${index}-${attempt}`}
            maxSeconds={Math.min(60, Math.ceil(((segment.end ?? 0) - (segment.start ?? 0)) * 2.5) + 5)}
            note="Bản ghi chỉ dùng để chấm, không được lưu."
            onSubmit={async (audio) => {
              const r = await scoreShadowing(videoId, index, audio)
              setResults((all) => ({ ...all, [index]: r }))
            }}
            onSkip={() => go(index + 1)}
          />
        </div>
        {result && (
          <div className={`mt-4 rounded-2xl px-4 py-3 ${result.passed ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <p className="font-bold text-slate-800">
              {result.passed ? 'Tốt lắm!' : 'Thử lại nhé.'} Độ chính xác <span className="text-2xl">{Math.round(result.accuracy * 100)}%</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">Máy nghe được: <span className="text-lg text-slate-900">{result.transcript || '(không rõ)'}</span></p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={again} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                <RotateCcw className="h-4 w-4" /> Đọc lại
              </button>
              {index + 1 < segments.length && (
                <button type="button" onClick={() => go(index + 1)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white">
                  Câu tiếp <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Transcript ────────────────────────────────────────────────────────

function TranscriptPanel({ segments, active, controls, onPlayFrom, onToggleVideo, onWord, onReport }: {
  segments: LearnerSegment[]
  active: number
  controls: PlayerControls
  onPlayFrom: (s: LearnerSegment) => void
  onToggleVideo: () => void
  onWord: (id: number) => void
  onReport?: (index: number) => void
}) {
  const [showHanzi, setShowHanzi] = useState(true)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showVi, setShowVi] = useState(true)
  const list = useRef<HTMLOListElement>(null)
  useEffect(() => {
    if (active >= 0) list.current?.querySelector(`[data-row="${active}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [active])
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-2">
        <button
          type="button"
          onClick={onToggleVideo}
          aria-label={controls.playing ? 'Tạm dừng' : 'Phát'}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white hover:bg-slate-700"
        >
          {controls.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <Toggle on={showHanzi} onChange={setShowHanzi} icon={Type} label="Chữ Hán" />
        <Toggle on={showPinyin} onChange={setShowPinyin} icon={Headphones} label="Pinyin" />
        <Toggle on={showVi} onChange={setShowVi} icon={Languages} label="Tiếng Việt" />
        <select
          value={controls.rate}
          onChange={(e) => controls.setRate(Number(e.target.value))}
          aria-label="Tốc độ"
          className="ml-auto h-10 rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700"
        >
          {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
        </select>
      </div>
      <ol ref={list} className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
        {segments.map((s, i) => (
          <li key={i} data-row={i} className={`group flex gap-3 px-4 py-3 ${i === active ? 'bg-amber-50' : ''}`}>
            <button type="button" onClick={() => onPlayFrom(s)} aria-label={`Phát từ câu ${i + 1}`} className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand hover:text-white">
              <Play className="h-3.5 w-3.5" />
            </button>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-xs text-slate-400">{formatTime(s.start)}</span>
              {showHanzi && <Sentence segment={s} pinyin={showPinyin} onWord={onWord} />}
              {!showHanzi && showPinyin && <p className="font-pinyin text-lg text-slate-700">{s.pinyin}</p>}
              {!showHanzi && !showPinyin && <p className="text-slate-300">••••••</p>}
              {showVi && <p className={`mt-1 text-sm ${s.vi ? 'text-slate-600' : 'italic text-slate-400'}`}>{s.vi ?? 'Chưa có bản dịch'}</p>}
            </div>
            {onReport && (
              <button
                type="button"
                onClick={() => onReport(i)}
                aria-label={`Báo lỗi câu ${i + 1}`}
                title="Báo lỗi câu này"
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-300 opacity-60 transition hover:bg-rose-50 hover:text-brand group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The sentence with pinyin over each word; words of the HSK bank open their detail card. */
function Sentence({ segment, pinyin, onWord, size = 'text-xl' }: {
  segment: LearnerSegment
  pinyin: boolean
  onWord: (id: number) => void
  size?: string
}) {
  if (!segment.words?.length) {
    return (
      <div>
        <p className={`${size} text-slate-900`}>{segment.text}</p>
        {pinyin && segment.pinyin && <p className="font-pinyin text-sm text-slate-500">{segment.pinyin}</p>}
      </div>
    )
  }
  return (
    <p className={`${size} leading-[2.4] text-slate-900`}>
      {segment.words.map((w, i) => {
        const body = pinyin && w.py ? <ruby>{w.w}<rt className="text-[0.55em] font-normal text-slate-500">{w.py}</rt></ruby> : w.w
        return w.id ? (
          <button key={i} type="button" onClick={() => onWord(w.id as number)} className={`rounded px-0.5 hover:bg-amber-100 ${w.hsk && Number(w.hsk[0]) >= 4 ? 'underline decoration-amber-400 decoration-2 underline-offset-[6px]' : ''}`} title={`HSK ${w.hsk}`}>
            {body}
          </button>
        ) : (
          <span key={i}>{body}</span>
        )
      })}
    </p>
  )
}

// ── Shared bits ───────────────────────────────────────────────────────

function SizeButton({ active, onClick, label, className = '', children }: {
  active: boolean
  onClick: () => void
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-bold transition ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'} ${className}`}
    >
      {children}
    </button>
  )
}

function TranslationBanner({ video, onRetry }: { video: VideoDetail; onRetry?: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  if (video.translationStatus === 'RUNNING') {
    const done = video.segments.filter((s) => s.vi && !s.viStale).length
    return (
      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo bản dịch tiếng Việt… {done}/{video.segments.length} câu. Bạn vẫn luyện được trong lúc chờ.
      </div>
    )
  }
  if (video.translationStatus === 'FAILED') {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertCircle className="h-4 w-4" /> <span className="flex-1">{video.translationMessage ?? 'Bản dịch chưa xong.'}</span>
        {onRetry && (
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await onRetry() } finally { setBusy(false) } }} className="rounded-xl bg-amber-600 px-3 py-1.5 font-bold text-white disabled:opacity-50">
            Dịch tiếp
          </button>
        )}
      </div>
    )
  }
  return null
}

function Toggle({ on, onChange, icon: Icon, label }: { on: boolean; onChange: (v: boolean) => void; icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold transition ${on ? 'border-brand bg-rose-50 text-brand' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}

function Frame({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-3 px-4">
          <Link to="/listening" aria-label="Về danh sách" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-ink">{title}</h1>
          {right}
        </div>
      </header>
      {children}
    </div>
  )
}

