import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AudioLines,
  Bookmark,
  BookmarkCheck,
  Clock,
  EyeOff,
  FileAudio,
  Globe2,
  Hourglass,
  Keyboard,
  Languages,
  ListOrdered,
  Loader2,
  Lock,
  MonitorPlay,
  Pencil,
  Send,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
import type { LessonVisibility, VideoSummary } from '@/types/listening'

export const LEVEL_STYLE: Record<string, string> = {
  '1': 'bg-emerald-500',
  '2': 'bg-teal-500',
  '3': 'bg-sky-500',
  '4': 'bg-indigo-500',
  '5': 'bg-violet-500',
  '6': 'bg-fuchsia-600',
  '7-9': 'bg-brand',
}

const SOURCE_ICON = { YOUTUBE: MonitorPlay, UPLOAD: FileAudio, MANUAL: Keyboard }
const SOURCE_LABEL = { YOUTUBE: 'YouTube', UPLOAD: 'File tải lên', MANUAL: 'Nhập thủ công' }

export const VISIBILITY: Record<LessonVisibility, { label: string; icon: React.ElementType; className: string }> = {
  PRIVATE: { label: 'Riêng tư', icon: Lock, className: 'bg-slate-900/75 text-white' },
  PENDING_REVIEW: { label: 'Chờ duyệt', icon: Hourglass, className: 'bg-amber-500 text-white' },
  PUBLISHED: { label: 'Công khai', icon: Globe2, className: 'bg-emerald-600 text-white' },
  REJECTED: { label: 'Bị từ chối', icon: XCircle, className: 'bg-red-600 text-white' },
  HIDDEN: { label: 'Đã ẩn', icon: EyeOff, className: 'bg-slate-600 text-white' },
}

/** 75 → "1:15", 3725 → "1:02:05". */
export function clock(seconds: number) {
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** A lesson the viewer may send to the community from its card. */
export const canShare = (v: VideoSummary) =>
  v.mine && v.status === 'READY' && (v.visibility === 'PRIVATE' || v.visibility === 'REJECTED')

/**
 * A lesson on a card. The viewer's own lessons show edit/delete and where they stand (private, waiting, public);
 * community lessons show the channel the video belongs to, the contributor of the lines and a save toggle.
 */
export function LessonCard({ video, onOpen, onDelete, onToggleSave, onShare, className = '' }: {
  video: VideoSummary
  onOpen: () => void
  onDelete?: () => void
  /** Missing for guests. */
  onToggleSave?: () => void
  onShare?: () => void
  className?: string
}) {
  const Icon = SOURCE_ICON[video.source]
  const round = 'grid h-9 w-9 place-items-center rounded-full bg-white/85 text-slate-700 shadow-sm backdrop-blur transition'
  const chip = 'inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur'
  const vis = VISIBILITY[video.visibility]
  return (
    <article className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md ${className}`}>
      <div className="group relative aspect-video overflow-hidden rounded-2xl bg-slate-100 shadow-md">
        <button type="button" onClick={onOpen} aria-label={`Mở ${video.title}`} className="block h-full w-full">
          {video.videoId ? (
            <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="grid h-full w-full place-items-center bg-gradient-to-br from-rose-50 to-amber-50 transition-transform duration-300 group-hover:scale-105">
              <AudioLines className="h-12 w-12 text-brand/60" />
            </span>
          )}
        </button>

        {video.mine && (
          <span className={`pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${vis.className}`}>
            <vis.icon className="h-3.5 w-3.5" /> {vis.label}
          </span>
        )}

        <div className="absolute right-2 top-2 flex items-center gap-2">
          {video.mine && (
            <Link to={`/listening/${video.id}/edit`} aria-label={`Sửa lời thoại ${video.title}`} title="Sửa lời thoại" className={`${round} hover:bg-white hover:text-slate-900`}>
              <Pencil className="h-4 w-4" />
            </Link>
          )}
          {video.hskLevel && (
            <span title="Trình độ (ước tính theo từ vựng HSK nếu admin chưa đặt)" className={`rounded-full px-3 py-1 text-sm font-bold text-white shadow-sm ${LEVEL_STYLE[video.hskLevel] ?? 'bg-slate-500'}`}>
              HSK {video.hskLevel}
            </span>
          )}
          {onToggleSave && !video.mine && (
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={video.saved}
              aria-label={video.saved ? `Bỏ lưu ${video.title}` : `Lưu ${video.title} vào Video của tôi`}
              title={video.saved ? 'Bỏ lưu' : 'Lưu vào Video của tôi'}
              className={`${round} ${video.saved ? '!bg-brand text-white' : 'hover:bg-white hover:text-brand'}`}
            >
              {video.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
          )}
          {onDelete && video.mine && video.visibility !== 'PUBLISHED' && (
            <button type="button" onClick={onDelete} aria-label={`Xoá ${video.title}`} title="Xoá video" className={`${round} hover:bg-red-600 hover:text-white`}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
          {video.durationSeconds != null && <span className={chip}><Clock className="h-3.5 w-3.5" /> {clock(video.durationSeconds)}</span>}
          <span className={chip}><ListOrdered className="h-3.5 w-3.5" /> {video.segmentCount} câu</span>
          {video.mine ? <StatusChip video={video} className={chip} /> : video.practiceCount > 0 && (
            <span className={chip}><Users className="h-3.5 w-3.5" /> {video.practiceCount} lượt luyện</span>
          )}
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-3 line-clamp-2 px-1 text-left text-lg font-bold leading-snug text-ink transition hover:text-brand">
        {video.title}
      </button>
      <div className="mt-1 flex min-w-0 items-center gap-1 px-1 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{video.channelName ?? SOURCE_LABEL[video.source]}</span>
        {!video.mine && video.editorial && <span className="shrink-0 font-semibold text-brand">· Đội ngũ Yibi</span>}
        {!video.mine && !video.editorial && video.contributorName && <span className="truncate">· lời thoại @{video.contributorName}</span>}
        {video.saved && <span className="shrink-0 font-semibold text-brand">· Đã lưu</span>}
      </div>
      {onShare && canShare(video) && (
        <button type="button" onClick={onShare} className="mx-1 mt-2 inline-flex w-fit items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-rose-100">
          <Send className="h-3.5 w-3.5" /> {video.visibility === 'REJECTED' ? 'Sửa rồi gửi lại' : 'Chia sẻ lên cộng đồng'}
        </button>
      )}
    </article>
  )
}

/** Processing or translation state of the viewer's own lesson; nothing once everything is done. */
function StatusChip({ video, className }: { video: VideoSummary; className: string }) {
  if (video.status === 'PROCESSING') return <span className={className}><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang nhận dạng</span>
  if (video.status === 'FAILED') return <span className={`${className} !bg-red-600/90`}><AlertCircle className="h-3.5 w-3.5" /> Nhận dạng lỗi</span>
  if (video.status === 'DRAFT') return <span className={`${className} !bg-amber-500/90`}><Pencil className="h-3.5 w-3.5" /> Bản nháp</span>
  if (video.translationStatus === 'RUNNING') {
    return <span className={className}><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang dịch {video.translatedCount}/{video.segmentCount}</span>
  }
  if (video.translationStatus === 'FAILED') return <span className={`${className} !bg-amber-500/90`}><Languages className="h-3.5 w-3.5" /> Dịch chưa xong</span>
  return null
}
