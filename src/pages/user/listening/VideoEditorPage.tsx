import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpToLine,
  Check,
  ChevronLeft,
  Crosshair,
  Languages,
  Loader2,
  Lock,
  Minus,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Scissors,
  Timer,
  Trash2,
  Undo2,
  Volume2,
} from 'lucide-react'
import { announceTranslationStarted } from '@/components/listening/useTranslationToasts'
import { apiError, finishVideo, getMediaUrl, getVideo, retryTranscription, saveSegments, withdrawVideo } from '@/api/listeningApi'
import { SegmentPlayer, formatTime, speakChinese, type PlayerHandle } from '@/components/listening/SegmentPlayer'
import {
  editText,
  editVi,
  firstBadTime,
  mergeDown,
  needsTranslation,
  removeAt,
  rowAt,
  setTimes,
  splitAt,
  toPayload,
  toRows,
  type EditRow,
} from '@/components/listening/segmentEdits'
import type { VideoDetail } from '@/types/listening'

type SaveState = 'saved' | 'dirty' | 'saving' | 'error'
const HISTORY = 50
const RATES = [0.5, 0.75, 1, 1.25]

/**
 * Line editor for a learner's video: the player on one side; time | transcript | translation | actions on the other.
 * Every change is saved automatically and can be undone. "Hoàn tất & tạo bản dịch" makes the video practice material and
 * sends its lines to translation.
 */
export function VideoEditorPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const player = useRef<PlayerHandle>(null)

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rows, setRows] = useState<EditRow[]>([])
  const [past, setPast] = useState<EditRow[][]>([])
  const [future, setFuture] = useState<EditRow[][]>([])
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [selected, setSelected] = useState(0)
  const [editing, setEditing] = useState<{ index: number; field: 'text' | 'vi'; value: string } | null>(null)
  const [syncIndex, setSyncIndex] = useState<number | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)

  const version = useRef(0)
  const savedVersion = useRef(0)
  const rowsRef = useRef(rows)
  rowsRef.current = rows
  const textArea = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  const playable = !!video && (!!video.videoId || video.hasMedia)

  // ── Loading ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const v = await getVideo(id)
      setVideo(v)
      setRows(toRows(v.segments))
      setLoadError(null)
      return v
    } catch (err) {
      setLoadError(apiError(err, 'Không tải được video.'))
      return null
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!video?.hasMedia) return
    getMediaUrl(id).then(setMediaUrl).catch(() => setMediaUrl(null))
  }, [id, video?.hasMedia])

  // Whisper runs in the background: check every few seconds until the lines are there.
  useEffect(() => {
    if (video?.status !== 'PROCESSING') return
    const timer = window.setInterval(async () => {
      const v = await getVideo(id).catch(() => null)
      if (v && v.status !== 'PROCESSING') {
        setVideo(v)
        setRows(toRows(v.segments))
      }
    }, 4000)
    return () => window.clearInterval(timer)
  }, [id, video?.status])

  // While a translation runs, fill in the lines it finished without touching anything else.
  useEffect(() => {
    if (video?.translationStatus !== 'RUNNING') return
    const timer = window.setInterval(async () => {
      const v = await getVideo(id).catch(() => null)
      if (!v) return
      const byText = new Map(v.segments.filter((s) => s.vi && !s.viStale).map((s) => [s.text, s.vi as string]))
      setRows((current) => current.map((r) => (needsTranslation(r) && byText.has(r.text) ? { ...r, vi: byText.get(r.text), viStale: undefined } : r)))
      setVideo((old) => (old ? { ...old, translationStatus: v.translationStatus, translationMessage: v.translationMessage } : v))
    }, 3000)
    return () => window.clearInterval(timer)
  }, [id, video?.translationStatus])

  // ── Changing lines: history + autosave ───────────────────────────
  const commit = useCallback((next: EditRow[]) => {
    if (next === rowsRef.current) return
    setPast((p) => [...p.slice(-(HISTORY - 1)), rowsRef.current])
    setFuture([])
    setRows(next)
    version.current += 1
    setSaveState('dirty')
  }, [])

  const pastRef = useRef(past)
  pastRef.current = past
  const futureRef = useRef(future)
  futureRef.current = future

  const undo = useCallback(() => {
    const p = pastRef.current
    if (!p.length) return
    setFuture([rowsRef.current, ...futureRef.current].slice(0, HISTORY))
    setPast(p.slice(0, -1))
    setRows(p[p.length - 1])
    version.current += 1
    setSaveState('dirty')
  }, [])

  const redo = useCallback(() => {
    const f = futureRef.current
    if (!f.length) return
    setPast([...pastRef.current, rowsRef.current].slice(-HISTORY))
    setFuture(f.slice(1))
    setRows(f[0])
    version.current += 1
    setSaveState('dirty')
  }, [])

  // One save at a time: a change made while saving is sent right after, so an older list never lands last.
  const inFlight = useRef<Promise<boolean> | null>(null)
  const save = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) {
      await inFlight.current
      if (version.current === savedVersion.current) return true
    }
    const run = (async () => {
      const sent = version.current
      setSaveState('saving')
      try {
        const v = await saveSegments(id, toPayload(rowsRef.current))
        setSaveError(null)
        savedVersion.current = sent
        // Take the fresh pinyin and cached translations only if nothing changed while saving.
        if (version.current === sent) {
          setRows((current) =>
            v.segments.length === current.length ? v.segments.map((s, i) => ({ ...s, key: current[i].key })) : toRows(v.segments)
          )
          setSaveState('saved')
        } else {
          setSaveState('dirty')
        }
        setVideo((old) => (old ? { ...old, ...v, segments: old.segments } : v))
        return true
      } catch (err) {
        setSaveError(apiError(err, 'Chưa lưu được thay đổi.'))
        setSaveState('error')
        return false
      }
    })()
    inFlight.current = run
    try {
      return await run
    } finally {
      inFlight.current = null
    }
  }, [id])

  useEffect(() => {
    if (saveState !== 'dirty') return
    const timer = window.setTimeout(() => void save(), 1000)
    return () => window.clearTimeout(timer)
  }, [saveState, rows, save])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState === 'dirty' || saveState === 'saving') e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saveState])

  // ── Player ───────────────────────────────────────────────────────
  const active = rowAt(rows, time)
  useEffect(() => {
    if (!playing || active < 0 || editing) return
    listRef.current?.querySelector(`[data-row="${active}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [active, playing, editing])

  const playRow = (index: number) => {
    const row = rows[index]
    setSelected(index)
    if (!row) return
    if (!playable) {
      speakChinese(row.text, rate)
      return
    }
    if (row.start != null && row.end != null) player.current?.playRange(row.start, row.end)
    else if (row.start != null) {
      player.current?.seek(row.start)
      player.current?.play()
    }
  }

  const changeRate = (value: number) => {
    setRate(value)
    player.current?.setRate(value)
  }

  // ── Tap to time typed lines ──────────────────────────────────────
  const tap = useCallback(() => {
    if (syncIndex === null) return
    const t = Math.round((player.current?.getTime() ?? 0) * 1000) / 1000
    let next = rowsRef.current
    if (syncIndex > 0) next = setTimes(next, syncIndex - 1, { end: t })
    if (syncIndex < next.length) {
      next = setTimes(next, syncIndex, { start: t, end: null })
      setSelected(syncIndex)
      setSyncIndex(syncIndex + 1)
    } else {
      setSyncIndex(null)
      player.current?.pause()
    }
    commit(next)
  }, [syncIndex, commit])

  const startSync = () => {
    setEditing(null)
    setSyncIndex(0)
    player.current?.seek(0)
    player.current?.play()
  }

  // ── Editing a cell ───────────────────────────────────────────────
  const openEditor = (index: number, field: 'text' | 'vi') => {
    const row = rows[index]
    if (!row) return
    setSelected(index)
    setEditing({ index, field, value: field === 'text' ? row.text : row.vi ?? '' })
  }

  const closeEditor = (keep: boolean) => {
    if (editing && keep) {
      const value = editing.value.replace(/\s*\n\s*/g, ' ')
      if (editing.field === 'text') {
        if (value.trim()) commit(editText(rowsRef.current, editing.index, value.trim()))
      } else {
        commit(editVi(rowsRef.current, editing.index, value))
      }
    }
    setEditing(null)
  }

  const split = (index: number) => {
    if (editing?.index === index && editing.field === 'text') {
      const caret = textArea.current?.selectionStart ?? Math.floor(editing.value.length / 2)
      const edited = editText(rowsRef.current, index, editing.value.trim() || rows[index].text)
      setEditing(null)
      const next = splitAt(edited, index, caret, player.current?.getTime())
      if (next === edited) setFinishError('Đặt con trỏ vào giữa câu (không ở đầu hay cuối) rồi bấm Tách.')
      else {
        setFinishError(null)
        commit(next)
      }
    } else {
      openEditor(index, 'text')
      setFinishError('Đặt con trỏ vào chỗ muốn tách rồi bấm Tách lần nữa.')
    }
  }

  // ── Keyboard ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.tagName === 'SELECT'
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y' && !typing) {
        e.preventDefault()
        redo()
        return
      }
      if (typing || e.repeat) return
      if (e.key === ' ' && !(target.tagName === 'BUTTON')) {
        e.preventDefault()
        if (syncIndex !== null) tap()
        else if (playable) player.current?.toggle()
        else playRow(selected)
      } else if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(rowsRef.current.length - 1, s + 1))
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(0, s - 1))
      } else if (e.key.toLowerCase() === 'r' && !mod) {
        playRow(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ── Finish ───────────────────────────────────────────────────────
  const finish = async () => {
    setFinishError(null)
    if (editing) closeEditor(true)
    const bad = firstBadTime(rowsRef.current, playable)
    if (bad >= 0) {
      setSelected(bad)
      listRef.current?.querySelector(`[data-row="${bad}"]`)?.scrollIntoView({ block: 'center' })
      setFinishError(
        playable
          ? `Câu ${bad + 1} chưa có đủ thời gian bắt đầu/kết thúc, hoặc kết thúc không sau bắt đầu. Hãy dùng Gõ nhịp hoặc nút ⌖.`
          : `Câu ${bad + 1} có thời gian không hợp lệ.`
      )
      return
    }
    setFinishing(true)
    try {
      if ((saveState !== 'saved' || version.current !== savedVersion.current) && !(await save())) throw new Error('save')
      const done = await finishVideo(id)
      if (done.translationStatus === 'RUNNING') {
        const translated = done.segments.filter((s) => s.vi && !s.viStale).length
        announceTranslationStarted(id, done.title, translated, done.segments.length)
      }
      if (done.editorial) navigate(`/admin?tab=library&publish=${id}`)
      else navigate('/listening', { state: { finishedId: id } })
    } catch (err) {
      setFinishError(apiError(err, 'Chưa hoàn tất được. Hãy thử lại.'))
      setFinishing(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────
  const back = video?.editorial ? '/admin?tab=library' : '/listening'

  if (loadError) {
    return (
      <Shell back={back} title="Sửa lời thoại">
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <AlertCircle className="mx-auto h-8 w-8" />
          <p className="mt-2 font-bold">{loadError}</p>
          <Link to="/listening" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Về danh sách</Link>
        </div>
      </Shell>
    )
  }
  if (!video) {
    return (
      <Shell back={back} title="Sửa lời thoại">
        <div className="mt-16 flex justify-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </Shell>
    )
  }

  // Waiting for review, published, or someone else's: the lines cannot change here.
  if (!video.editable) {
    const pending = video.mine && video.visibility === 'PENDING_REVIEW'
    return (
      <Shell back={back} title={video.title}>
        <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Lock className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold text-ink">
            {pending ? 'Bài đang chờ duyệt' : video.mine ? 'Bài đã ở trong cộng đồng' : 'Bạn không sửa được bài này'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {pending
              ? 'Rút bài về để sửa; sửa xong hãy gửi lại để admin duyệt.'
              : video.mine
                ? 'Bài đã công khai nên chỉ admin sửa được. Hãy báo admin nếu cần chỉnh.'
                : 'Lời thoại do người khác đóng góp. Bạn vẫn luyện tập được như bình thường.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {pending && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    setVideo(await withdrawVideo(id))
                  } catch (err) {
                    setLoadError(apiError(err, 'Chưa rút được bài.'))
                  }
                }}
                className="rounded-xl bg-brand px-4 py-2.5 font-bold text-white"
              >
                Rút bài về để sửa
              </button>
            )}
            {video.status === 'READY' && (
              <Link to={`/listening/${id}`} className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50">Mở trang luyện tập</Link>
            )}
          </div>
        </div>
      </Shell>
    )
  }

  if (video.status === 'PROCESSING' || video.status === 'FAILED') {
    return (
      <Shell back={back} title={video.title}>
        <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {video.status === 'PROCESSING' ? (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand" />
              <h2 className="mt-4 text-xl font-bold text-ink">Đang nhận dạng lời thoại…</h2>
              <p className="mt-2 text-slate-500">File dài có thể mất vài phút. Bạn có thể rời trang, video sẽ ở trong danh sách khi xong.</p>
            </>
          ) : (
            <>
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <h2 className="mt-4 text-xl font-bold text-ink">Chưa nhận dạng được</h2>
              <p className="mt-2 text-slate-600">{video.statusMessage}</p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setVideo(await retryTranscription(id))
                  } catch (err) {
                    setLoadError(apiError(err, 'Không thử lại được.'))
                  }
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 font-extrabold text-white"
              >
                <RotateCcw className="h-4 w-4" /> Thử lại
              </button>
            </>
          )}
        </div>
      </Shell>
    )
  }

  const untimed = rows.some((r) => r.start == null || r.end == null)
  const translated = rows.filter((r) => r.vi && !r.viStale).length

  return (
    <Shell back={back}
      title={video.title}
      right={
        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} error={saveError} onRetry={() => void save()} />
          <IconButton label="Hoàn tác (Ctrl+Z)" onClick={undo} disabled={!past.length}><Undo2 className="h-4 w-4" /></IconButton>
          <IconButton label="Làm lại (Ctrl+Shift+Z)" onClick={redo} disabled={!future.length}><Redo2 className="h-4 w-4" /></IconButton>
          <button
            type="button"
            onClick={() => void finish()}
            disabled={finishing || rows.length === 0}
            className="ml-1 hidden items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-brand-dark disabled:opacity-50 sm:inline-flex"
          >
            {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
            {video.status === 'READY' ? 'Lưu & luyện tập' : 'Hoàn tất & tạo bản dịch'}
          </button>
        </div>
      }
    >
      <div className="mx-auto grid w-full max-w-[96rem] gap-5 px-4 pb-28 pt-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
        {/* ── Player side ───────────────────────────────────── */}
        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          {playable ? (
            <SegmentPlayer
              ref={player}
              videoId={video.videoId}
              mediaUrl={mediaUrl}
              mediaType={video.mediaType}
              onTime={setTime}
              onPlayingChange={setPlaying}
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl bg-slate-100 p-6 text-center">
              <Volume2 className="h-10 w-10 text-slate-400" />
              <p className="text-sm text-slate-600">Không có âm thanh. Bấm một câu để nghe bằng giọng đọc của trình duyệt.</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {playable && (
              <>
                <IconButton label={playing ? 'Dừng (Space)' : 'Phát (Space)'} onClick={() => player.current?.toggle()}>
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </IconButton>
                <span className="font-mono text-sm tabular-nums text-slate-600">{formatTime(time)}</span>
              </>
            )}
            <IconButton label="Nghe lại câu đang chọn (R)" onClick={() => playRow(selected)}><RotateCcw className="h-4 w-4" /></IconButton>
            <label className="ml-auto flex items-center gap-1 text-sm text-slate-600">
              Tốc độ
              <select value={rate} onChange={(e) => changeRate(Number(e.target.value))} className="rounded-lg border border-slate-200 px-1.5 py-1 text-sm">
                {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
              </select>
            </label>
          </div>

          {playable && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {syncIndex === null ? (
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 shrink-0 text-slate-500" />
                  <p className="flex-1 text-sm text-slate-600">
                    {untimed ? 'Có câu chưa có thời gian. ' : ''}Gõ nhịp: nghe từ đầu, nhấn Space mỗi khi một câu mới bắt đầu.
                  </p>
                  <button type="button" onClick={startSync} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700">Gõ nhịp</button>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <p className="text-sm text-slate-600">
                    {syncIndex < rows.length ? <>Nhấn khi câu <b>{syncIndex + 1}</b> bắt đầu: <span className="font-bold text-slate-900">{rows[syncIndex]?.text}</span></> : 'Nhấn khi câu cuối kết thúc.'}
                  </p>
                  <button type="button" onClick={tap} className="w-full rounded-2xl bg-brand py-4 text-lg font-extrabold text-white shadow-md active:scale-[0.98]">
                    {syncIndex < rows.length ? 'Câu tiếp theo (Space)' : 'Kết thúc (Space)'}
                  </button>
                  <button type="button" onClick={() => { setSyncIndex(null); player.current?.pause() }} className="text-sm font-bold text-slate-500 hover:text-slate-800">Dừng gõ nhịp</button>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            <b className="text-slate-700">Mẹo:</b> bấm vào câu hoặc bản dịch để sửa (Enter lưu, Esc huỷ) · ✂ tách tại con trỏ · ⤒⤓ gộp với câu trên/dưới ·
            Alt+↑/↓ chọn câu · R nghe lại · Ctrl+Z hoàn tác.
          </div>
        </aside>

        {/* ── Lines ─────────────────────────────────────────── */}
        <section className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-4 py-3 text-sm">
            <span className="font-extrabold text-slate-900">{rows.length} câu</span>
            <span className="text-slate-500">{translated}/{rows.length} đã dịch</span>
            {video.translationStatus === 'RUNNING' && <span className="inline-flex items-center gap-1 text-sky-700"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang dịch…</span>}
            {video.translationStatus === 'FAILED' && video.translationMessage && <span className="text-amber-700">{video.translationMessage}</span>}
          </div>
          <div className="hidden grid-cols-[2.5rem_9rem_minmax(0,1.3fr)_minmax(0,1fr)_8.5rem] gap-3 border-b border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 md:grid">
            <span>#</span><span>Thời gian</span><span>Transcript</span><span>Bản dịch</span><span className="text-right">Thao tác</span>
          </div>
          <ol ref={listRef} className="divide-y divide-slate-100">
            {rows.map((row, i) => {
              const isSelected = i === selected
              const isActive = i === active
              const badTime = row.start != null && row.end != null && row.end <= row.start
              return (
                <li
                  key={row.key}
                  data-row={i}
                  onClick={() => setSelected(i)}
                  className={`grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 px-4 py-3 md:grid-cols-[2.5rem_9rem_minmax(0,1.3fr)_minmax(0,1fr)_8.5rem] ${isActive ? 'bg-amber-50' : isSelected ? 'bg-sky-50/60' : ''}`}
                >
                  <span className={`pt-1 text-sm tabular-nums ${isActive ? 'font-extrabold text-amber-700' : 'text-slate-400'}`}>{i + 1}</span>

                  {/* time */}
                  <div className="col-start-2 md:col-start-auto">
                    <button type="button" onClick={(e) => { e.stopPropagation(); playRow(i) }} className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-1 font-mono text-xs tabular-nums hover:bg-sky-100 ${badTime ? 'text-red-600' : 'text-sky-700'}`} title="Nghe câu này">
                      <Play className="h-3 w-3" />
                      {formatTime(row.start)}
                      <span className="text-slate-400">→</span>
                      {formatTime(row.end)}
                    </button>
                    {isSelected && playable && (
                      <div className="mt-1.5 space-y-1">
                        <TimeControl label="Bắt đầu" onNudge={(d) => commit(setTimes(rows, i, { start: (row.start ?? time) + d }))} onNow={() => commit(setTimes(rows, i, { start: player.current?.getTime() ?? time }))} />
                        <TimeControl label="Kết thúc" onNudge={(d) => commit(setTimes(rows, i, { end: (row.end ?? time) + d }))} onNow={() => commit(setTimes(rows, i, { end: player.current?.getTime() ?? time }))} />
                      </div>
                    )}
                  </div>

                  {/* transcript */}
                  <div className="col-start-2 min-w-0 md:col-start-auto">
                    {editing?.index === i && editing.field === 'text' ? (
                      <textarea
                        ref={textArea}
                        autoFocus
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); closeEditor(true) }
                          if (e.key === 'Escape') { e.preventDefault(); closeEditor(false) }
                        }}
                        onBlur={() => closeEditor(true)}
                        rows={2}
                        aria-label={`Sửa câu ${i + 1}`}
                        className="w-full resize-none rounded-lg border-2 border-brand/60 px-2 py-1 text-lg leading-snug focus:outline-none"
                      />
                    ) : (
                      <button type="button" onClick={(e) => { e.stopPropagation(); openEditor(i, 'text') }} className="block w-full rounded-lg px-2 py-1 text-left hover:bg-slate-100" title="Bấm để sửa">
                        <span className="block text-lg leading-snug text-slate-900">{row.text}</span>
                        {row.pinyin && <span className="font-pinyin mt-0.5 block text-sm text-slate-500">{row.pinyin}</span>}
                        {row.flags?.includes('POLYPHONE') && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-amber-700"><AlertTriangle className="h-3 w-3" /> Có chữ nhiều cách đọc, kiểm tra pinyin</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* translation */}
                  <div className="col-start-2 min-w-0 md:col-start-auto">
                    {editing?.index === i && editing.field === 'vi' ? (
                      <textarea
                        autoFocus
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); closeEditor(true) }
                          if (e.key === 'Escape') { e.preventDefault(); closeEditor(false) }
                        }}
                        onBlur={() => closeEditor(true)}
                        rows={2}
                        aria-label={`Sửa bản dịch câu ${i + 1}`}
                        className="w-full resize-none rounded-lg border-2 border-brand/60 px-2 py-1 text-sm focus:outline-none"
                      />
                    ) : (
                      <button type="button" onClick={(e) => { e.stopPropagation(); openEditor(i, 'vi') }} className="block w-full rounded-lg px-2 py-1 text-left text-sm hover:bg-slate-100" title="Bấm để sửa bản dịch">
                        {row.vi ? (
                          <span className={row.viStale ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}>{row.vi}</span>
                        ) : (
                          <span className="italic text-slate-400">{video.translationStatus === 'RUNNING' ? 'Đang dịch…' : 'Chưa dịch'}</span>
                        )}
                        {row.viStale && <span className="ml-1 rounded bg-slate-100 px-1 text-[10px] font-bold uppercase text-slate-500">cũ</span>}
                      </button>
                    )}
                  </div>

                  {/* actions */}
                  <div className="col-start-2 flex items-start justify-start gap-0.5 md:col-start-auto md:justify-end">
                    <IconButton small label="Gộp với câu trên" disabled={i === 0} onClick={() => commit(mergeDown(rows, i - 1))}><ArrowUpToLine className="h-4 w-4" /></IconButton>
                    <IconButton small label="Gộp với câu dưới" disabled={i === rows.length - 1} onClick={() => commit(mergeDown(rows, i))}><ArrowDownToLine className="h-4 w-4" /></IconButton>
                    <IconButton small label="Tách tại con trỏ" onMouseDown={(e) => e.preventDefault()} onClick={() => split(i)}><Scissors className="h-4 w-4" /></IconButton>
                    <IconButton small danger label="Xoá câu" disabled={rows.length === 1} onClick={() => { commit(removeAt(rows, i)); setSelected(Math.max(0, i - 1)) }}><Trash2 className="h-4 w-4" /></IconButton>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      </div>

      {/* Bottom bar: messages and the finish button on a phone */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center gap-3">
          {finishError ? (
            <p role="alert" className="flex flex-1 items-center gap-2 text-sm font-semibold text-red-600"><AlertCircle className="h-4 w-4 shrink-0" /> {finishError}</p>
          ) : (
            <p className="flex-1 text-sm text-slate-500">Mọi thay đổi được lưu tự động. Hoàn tất để tạo pinyin, bản dịch và chuyển sang luyện tập.</p>
          )}
          <button
            type="button"
            onClick={() => void finish()}
            disabled={finishing || rows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-brand-dark disabled:opacity-50 sm:hidden"
          >
            {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Hoàn tất
          </button>
        </div>
      </div>
    </Shell>
  )
}

/** `back`: where the arrow goes — the admin library tab for the team's lessons, else the learner's list. */
function Shell({ title, right, back = '/listening', children }: {
  title: string
  right?: React.ReactNode
  back?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-3 px-4">
          <Link to={back} aria-label="Về danh sách" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
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

function IconButton({
  label, onClick, onMouseDown, disabled, danger, small, children,
}: {
  label: string
  onClick: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  disabled?: boolean
  danger?: boolean
  small?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={onMouseDown}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`grid place-items-center rounded-lg text-slate-500 transition disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${small ? 'h-8 w-8' : 'h-9 w-9'} ${danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-slate-100 hover:text-slate-900'}`}
    >
      {children}
    </button>
  )
}

function TimeControl({ label, onNudge, onNow }: { label: string; onNudge: (delta: number) => void; onNow: () => void }) {
  return (
    <div className="flex items-center gap-0.5 text-[11px] text-slate-500" onClick={(e) => e.stopPropagation()}>
      <span className="w-12">{label}</span>
      <IconButton small label={`${label} lùi 0,1 giây`} onClick={() => onNudge(-0.1)}><Minus className="h-3 w-3" /></IconButton>
      <IconButton small label={`${label} = thời điểm đang phát`} onClick={onNow}><Crosshair className="h-3.5 w-3.5" /></IconButton>
      <IconButton small label={`${label} tới 0,1 giây`} onClick={() => onNudge(0.1)}><Plus className="h-3 w-3" /></IconButton>
    </div>
  )
}

function SaveIndicator({ state, error, onRetry }: { state: SaveState; error: string | null; onRetry: () => void }) {
  if (state === 'error') {
    return (
      <button type="button" onClick={onRetry} title={error ?? undefined} className="hidden items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 sm:inline-flex">
        <AlertCircle className="h-3.5 w-3.5" /> Chưa lưu – thử lại
      </button>
    )
  }
  return (
    <span className="hidden items-center gap-1 text-xs text-slate-500 sm:inline-flex">
      {state === 'saved' ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Đã lưu</> : <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang lưu…</>}
    </span>
  )
}
