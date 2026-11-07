import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Ear, Info, LoaderCircle, Lock, Mic, Timer, X } from 'lucide-react'
import { finishHskk, getHskkStatus, startHskk, submitHskkAnswer, type HskkPaper, type HskkQuestion, type HskkResult, type HskkStatus, type HskkTierCode } from '@/api/speakingApi'
import { levelLabel } from '@/components/learningpath/GoalForm'
import { RecordingPlayer } from '@/components/learningpath/RecordingPlayer'
import { AudioButton } from '@/components/ui/AudioButton'
import { speakChinese, stopSpeaking } from '@/lib/speech'

const TIER_INFO: Record<HskkTierCode, { name: string; levels: string; shape: string }> = {
  PRIMARY: { name: 'HSKK Sơ cấp', levels: 'Tương ứng HSK 1–2', shape: '27 câu · nhắc lại, trả lời ngắn, trả lời câu hỏi' },
  INTERMEDIATE: { name: 'HSKK Trung cấp', levels: 'Tương ứng HSK 3–4', shape: '14 câu · nhắc lại, nói theo tình huống, trả lời câu hỏi' },
  ADVANCED: { name: 'HSKK Cao cấp', levels: 'Tương ứng HSK 5 trở lên', shape: '6 câu · kể lại, đọc thành tiếng, nêu quan điểm' },
}

const KIND_HINT: Record<HskkQuestion['kind'], string> = {
  REPEAT: 'Nhắc lại câu vừa nghe',
  REPLY: 'Trả lời câu vừa nghe',
  SPEAK: 'Trả lời câu hỏi',
  RETELL: 'Kể lại đoạn vừa nghe',
  READ: 'Đọc to đoạn văn',
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

type Phase = 'listen' | 'prep' | 'record'

/** The exam room: each question moves on by itself, as in the real test, and answers are sent in the background. */
const ExamRoom: React.FC<{ paper: HskkPaper; stream: MediaStream; onFinish: (result: HskkResult, takes: Map<string, Blob>) => void; onQuit: () => void }> = ({ paper, stream, onFinish, onQuit }) => {
  const questions = useMemo(() => paper.parts.flatMap((part) => part.questions.map((question) => ({ question, part }))), [paper])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('listen')
  const [seconds, setSeconds] = useState(0)
  const [spokenFailed, setSpokenFailed] = useState(false)
  const [sending, setSending] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState('')

  // Answers go one at a time: the recognizer on the server works through them in turn.
  const queue = useRef<Promise<void>>(Promise.resolve())
  const unsent = useRef<Array<{ id: string; audio: Blob }>>([])
  const queued = useRef(0)
  const sent = useRef(0)
  const recorder = useRef<MediaRecorder | null>(null)
  const takes = useRef(new Map<string, Blob>())

  const current = questions[index]

  const send = useCallback((id: string, audio: Blob) => {
    queued.current += 1
    queue.current = queue.current.then(async () => {
      try {
        await submitHskkAnswer(paper.attemptId, id, audio)
      } catch {
        unsent.current.push({ id, audio })
      }
      sent.current += 1
      setSending((value) => (value ? { ...value, done: sent.current } : value))
    })
  }, [paper.attemptId])

  const finish = useCallback(async () => {
    setSending({ done: sent.current, total: queued.current })
    await queue.current
    // One more try for whatever the server could not take the first time.
    for (const answer of unsent.current.splice(0)) {
      await submitHskkAnswer(paper.attemptId, answer.id, answer.audio).catch(() => undefined)
    }
    try {
      onFinish(await finishHskk(paper.attemptId), takes.current)
    } catch {
      setError('Chưa nộp được bài. Hãy kiểm tra kết nối rồi thử lại.')
    }
  }, [onFinish, paper.attemptId])

  const advance = useCallback(() => {
    if (index + 1 >= questions.length) {
      finish()
    } else {
      setIndex(index + 1)
      setPhase('listen')
      setSpokenFailed(false)
    }
  }, [finish, index, questions.length])

  const afterListening = useCallback(() => {
    const prep = current.question.prepSeconds
    setPhase(prep > 0 ? 'prep' : 'record')
    setSeconds(prep > 0 ? prep : current.question.answerSeconds)
  }, [current])

  // Listening: played once; a browser without Chinese speech shows the text instead.
  useEffect(() => {
    if (phase !== 'listen') return
    const text = current.question.listenText
    if (!text) {
      afterListening()
      return
    }
    let moved = false
    let failed = false
    let readTimer: number | undefined
    const move = () => {
      if (!moved) {
        moved = true
        afterListening()
      }
    }
    // Nothing heard: show the text instead, and leave time to read it.
    const fail = () => {
      if (failed || moved) return
      failed = true
      setSpokenFailed(true)
      readTimer = window.setTimeout(move, 2500 + text.length * 150)
    }
    const begun = Date.now()
    // A machine with no Chinese voice can report "finished" at once without any sound.
    const started = speakChinese(text, () => {
      if (Date.now() - begun < text.length * 100) fail()
      else move()
    }, fail)
    if (!started) fail()
    const fallback = window.setTimeout(fail, 3000 + text.length * 450)
    return () => {
      moved = true
      window.clearTimeout(fallback)
      window.clearTimeout(readTimer)
      stopSpeaking()
    }
  }, [phase, current, afterListening])

  // Recording: starts by itself and stops when the time is up or the learner says they are done.
  useEffect(() => {
    if (phase !== 'record') return
    const chunks: Blob[] = []
    const media = new MediaRecorder(stream)
    recorder.current = media
    media.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
    media.onstop = () => {
      if (chunks.length > 0) {
        const take = new Blob(chunks, { type: media.mimeType || 'audio/webm' })
        takes.current.set(current.question.id, take)
        send(current.question.id, take)
      }
      advance()
    }
    media.start()
    return () => {
      media.ondataavailable = null
      media.onstop = null
      if (media.state !== 'inactive') media.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one recording per question
  }, [phase, index])

  useEffect(() => {
    if (phase === 'listen' || sending) return
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [phase, index, sending])

  const stopRecording = () => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
  }

  const startSpeaking = useCallback(() => {
    setPhase('record')
    setSeconds(current.question.answerSeconds)
  }, [current])

  useEffect(() => {
    if (seconds > 0 || phase === 'listen') return
    if (phase === 'prep') startSpeaking()
    else stopRecording()
  }, [seconds, phase, startSpeaking])

  if (sending) {
    return (
      <div className="card-soft mx-auto max-w-lg p-8 text-center">
        {error ? (
          <>
            <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>
            <button type="button" onClick={finish} className="btn-chunky btn-brand mt-4 px-5 py-2.5 text-sm">Nộp lại</button>
          </>
        ) : (
          <>
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-brand" />
            <h2 className="mt-3 text-lg font-extrabold text-slate-900">Đang chấm bài của bạn</h2>
            <p className="mt-1 text-sm text-slate-500">Đã chấm {sending.done}/{sending.total} câu. Vui lòng giữ nguyên trang này.</p>
          </>
        )}
      </div>
    )
  }

  const { question, part } = current
  const quit = () => {
    if (window.confirm('Thoát bài thi? Các câu đã làm sẽ không được tính điểm.')) onQuit()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={quit} aria-label="Thoát" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100"><X className="h-6 w-6" /></button>
        <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label="Tiến độ bài thi">
          <span className="block h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-slate-500">{index + 1}/{questions.length}</span>
      </div>

      <section className="card-soft p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{part.title}</p>
        <p className="mt-1 text-sm text-slate-600">{part.instruction}</p>

        <div className="mt-6 min-h-24 text-center">
          {question.showText && <p className="font-chinese text-left text-xl font-bold leading-loose text-slate-900">{question.showText}</p>}
          {phase === 'listen' && question.listenText && (
            <p className="flex flex-col items-center gap-2 text-sm font-bold text-sky-700"><Ear className="h-10 w-10 animate-pulse" />Hãy lắng nghe...</p>
          )}
          {spokenFailed && question.listenText && (
            <p className="font-chinese mt-3 rounded-xl bg-amber-50 p-3 text-left text-lg font-bold leading-relaxed text-amber-950">
              <span className="block font-sans text-xs font-semibold">Trình duyệt chưa đọc được tiếng Trung, nên câu được hiện ra:</span>
              {question.listenText}
            </p>
          )}
          {phase !== 'listen' && !question.showText && !spokenFailed && (
            <p className="text-sm font-semibold text-slate-500">{KIND_HINT[question.kind]}</p>
          )}
        </div>

        {phase === 'prep' && (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-sky-50 p-5 text-sky-900">
            <p className="inline-flex items-center gap-1.5 text-sm font-bold"><Timer className="h-4 w-4" />Thời gian chuẩn bị</p>
            <p className="text-4xl font-extrabold tabular-nums">{clock(Math.max(seconds, 0))}</p>
            <button type="button" onClick={startSpeaking} className="btn-chunky btn-brand px-5 py-2.5 text-sm"><Mic className="h-4 w-4" />Bắt đầu nói ngay</button>
          </div>
        )}
        {phase === 'record' && (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-rose-50 p-5 text-rose-900">
            <p className="inline-flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-600" />Đang ghi âm: {KIND_HINT[question.kind].toLowerCase()}</p>
            <p className="text-4xl font-extrabold tabular-nums">{clock(Math.max(seconds, 0))}</p>
            <button type="button" onClick={stopRecording} className="btn-chunky btn-jade px-5 py-2.5 text-sm"><Check className="h-4 w-4" />Trả lời xong</button>
          </div>
        )}
      </section>
    </div>
  )
}

const ResultView: React.FC<{ result: HskkResult; takes: Map<string, Blob>; onAgain: () => void }> = ({ result, takes, onAgain }) => (
  <div className="mx-auto max-w-3xl space-y-5 pb-8">
    <section className={`rounded-3xl p-6 text-center ${result.passed ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
      <p className="text-5xl font-extrabold tabular-nums">{result.scorePercent}<span className="text-2xl">/100</span></p>
      <p className="mt-2 font-bold">{result.passed ? 'Đạt' : 'Chưa đạt'} (mức đạt từ {result.passPercent}) · đã chấm {result.answered}/{result.total} câu</p>
      {result.targetScore != null && (
        <p className="mt-1 text-sm font-semibold">{result.reachedTarget ? `Đã đạt mục tiêu ${result.targetScore} điểm của bạn.` : `Còn thiếu ${result.targetScore - result.scorePercent} điểm so với mục tiêu ${result.targetScore}.`}</p>
      )}
    </section>

    <p className="flex gap-2 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>Đây là <b>điểm ước lượng</b> để luyện tập, không phải điểm thi chính thức. Máy so bản ghi với câu mẫu ở phần nhắc lại và đọc; phần tự nói chỉ tính theo độ dài câu trả lời, chưa đánh giá được nội dung, độ trôi chảy và thanh điệu.</span>
    </p>

    {result.parts.map((part) => (
      <section key={part.title} className="card-soft p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-extrabold text-slate-900">{part.title}</h2>
          <span className="shrink-0 text-sm font-bold tabular-nums text-slate-600">{part.averageScore}/100 · chiếm {part.weight}%</span>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {part.items.map((item) => (
            <li key={item.questionId} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-chinese line-clamp-4 min-w-0 font-semibold leading-relaxed text-slate-800">{item.reference}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ${item.score >= 60 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>{item.score}</span>
              </div>
              <p className="font-chinese mt-1 text-sm text-slate-500">{item.answered ? `Máy nghe được: ${item.transcript || '(không nghe rõ)'}` : 'Chưa chấm được câu này'}</p>
              <div className="mt-2 flex items-center gap-2">
                <RecordingPlayer blob={takes.get(item.questionId)} />
                {item.reference.length <= 200 && <AudioButton text={item.reference} size="md" title="Nghe mẫu" />}
              </div>
            </li>
          ))}
        </ul>
      </section>
    ))}

    <div className="flex flex-wrap justify-center gap-3">
      <button type="button" onClick={onAgain} className="btn-chunky btn-brand px-5 py-3 text-sm">Làm đề khác</button>
    </div>
  </div>
)

export const HskkPage: React.FC = () => {
  const [status, setStatus] = useState<HskkStatus | null>(null)
  const [paper, setPaper] = useState<HskkPaper | null>(null)
  const [result, setResult] = useState<HskkResult | null>(null)
  const [takes, setTakes] = useState<Map<string, Blob>>(new Map())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const stream = useRef<MediaStream | null>(null)

  const releaseMic = () => {
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
  }

  const load = useCallback(() => {
    getHskkStatus().then(setStatus).catch(() => setError('Không tải được thông tin bài thi. Hãy thử lại.'))
  }, [])

  useEffect(() => {
    load()
    return releaseMic
  }, [load])

  const start = async (tier: HskkTierCode) => {
    setBusy(true)
    setError('')
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Cần cho phép dùng micro để thi. Nhấn biểu tượng ổ khóa cạnh địa chỉ trang, bật quyền Micro rồi thử lại.')
      setBusy(false)
      return
    }
    try {
      setResult(null)
      setPaper(await startHskk(tier))
      window.scrollTo({ top: 0 })
    } catch (cause) {
      releaseMic()
      setError((cause as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không tạo được đề thi. Hãy thử lại.')
    } finally {
      setBusy(false)
    }
  }

  const leave = () => {
    releaseMic()
    setPaper(null)
    setResult(null)
    load()
  }

  if (result) return <ResultView result={result} takes={takes} onAgain={leave} />
  if (paper && stream.current) {
    return <ExamRoom paper={paper} stream={stream.current} onQuit={leave} onFinish={(finished, recorded) => { releaseMic(); setTakes(recorded); setPaper(null); setResult(finished) }} />
  }

  return (
    <div className="space-y-5">
      <header className="card-soft p-5 sm:p-6">
        <Link to="/exams" className="text-xs font-bold text-brand hover:underline">← Về thi thử HSK</Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Thi thử HSKK (nói)</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Mô phỏng theo cấu trúc đề HSKK: thang 100 điểm, đạt từ 60. Câu hỏi tự chuyển như khi thi thật, mỗi câu nghe chỉ phát một lần. Hãy ngồi nơi yên tĩnh và đeo tai nghe có micro nếu được.</p>
        <p className="mt-2 text-xs text-slate-500">Bài làm được ghi âm chỉ để chấm; âm thanh không được lưu lại. Bạn nghe lại được ở trang kết quả ngay sau khi thi.</p>
      </header>

      {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}
      {status && !status.speechReady && <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">Dịch vụ chấm phát âm chưa sẵn sàng nên chưa thể thi lúc này. Hãy thử lại sau.</p>}
      {!status && !error && <p className="flex items-center gap-2 p-4 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải...</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {status?.tiers.map((tier) => {
          const info = TIER_INFO[tier.tier]
          return (
            <article key={tier.tier} className="card-soft flex flex-col p-5">
              <h2 className="font-extrabold text-slate-900">{info.name}</h2>
              <p className="text-xs font-semibold text-slate-500">{info.levels}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{info.shape}</p>
              {tier.bestScore != null && <p className="mt-2 text-xs font-bold text-emerald-700">Cao nhất: {tier.bestScore}/100 · {tier.attempts} lần thi</p>}
              {tier.open ? (
                <button type="button" disabled={busy || !status.speechReady} onClick={() => start(tier.tier)} className="btn-chunky btn-brand mt-4 w-full py-2.5 text-sm disabled:opacity-60">
                  {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <>Vào thi<ArrowRight className="h-4 w-4" /></>}
                </button>
              ) : (
                <p className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-500"><Lock className="h-4 w-4" />Mở từ {levelLabel(tier.requiredLevel)}</p>
              )}
            </article>
          )
        })}
      </div>
      {status?.targetScore != null && <p className="text-sm font-semibold text-slate-600">Mục tiêu HSKK của bạn: {status.targetScore}/100 điểm.</p>}
    </div>
  )
}
