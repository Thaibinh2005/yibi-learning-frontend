import React, { useEffect, useRef, useState } from 'react'
import { BookCheck, CalendarDays, Camera, Check, Flame, KeyRound, Layers, Loader2, Pencil, ShieldCheck, Target, Trophy, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/hooks'
import { setAvatarUrl, setCredentials, setDisplayName } from '@/app/slices/authSlice'
import { changePassword, getAccount, removeAvatar, updateDisplayName, uploadAvatar, type AccountProfile } from '@/api/accountApi'
import {
  getLearningPathOverview,
  getStudyStats,
  updateLearningGoal,
  type LearningGoalInput,
  type LearningPathOverview,
  type StudyStats,
} from '@/api/learningPathApi'
import { apiError } from '@/api/listeningApi'
import { GoalForm, goalLabel, levelLabel } from '@/components/learningpath/GoalForm'
import { Avatar } from '@/components/ui/Avatar'

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#C8322B] focus:outline-none'

/**
 * Shrinks the chosen picture in the browser (centre square, 512 px, JPEG) before sending it: a phone photo of
 * several MB becomes a small upload, and any format the browser can show (WebP, and HEIC on Safari) is accepted.
 */
const toSquareJpeg = (file: File) =>
  new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      const side = Math.min(image.naturalWidth, image.naturalHeight)
      const size = Math.min(512, side)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) return reject(new Error('canvas'))
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, size, size)
      context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, size, size)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode'))), 'image/jpeg', 0.9)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode'))
    }
    image.src = url
  })

const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—')

/** The learner's own account: name, learning goal, quick numbers and password. */
export const AccountPage: React.FC = () => {
  const [account, setAccount] = useState<AccountProfile | null>(null)
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [overview, setOverview] = useState<LearningPathOverview | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAccount().then(setAccount).catch(() => setError('Không tải được thông tin tài khoản.'))
    // The numbers and the goal are extras: the page still works without them.
    getStudyStats().then(setStats).catch(() => setStats(null))
    getLearningPathOverview().then(setOverview).catch(() => setOverview(null))
  }, [])

  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>
  if (!account) return <div className="flex items-center justify-center gap-2 p-16 text-sm font-medium text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Đang tải tài khoản...</div>

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Thông tin cá nhân, mục tiêu học và bảo mật.</p>
      </header>

      <ProfileCard account={account} onSaved={setAccount} />

      <StatsRow stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {overview?.goal && <GoalCard overview={overview} onSaved={setOverview} />}
        <PasswordCard account={account} onChanged={() => setAccount({ ...account, passwordSet: true })} />
      </div>
    </div>
  )
}

const ProfileCard: React.FC<{ account: AccountProfile; onSaved: (account: AccountProfile) => void }> = ({ account, onSaved }) => {
  const dispatch = useAppDispatch()
  const [draft, setDraft] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const name = (draft ?? '').trim()
    if (!name) return toast.error('Vui lòng nhập tên hiển thị')
    if (name.length > 50) return toast.error('Tên hiển thị tối đa 50 ký tự')
    setSaving(true)
    try {
      const next = await updateDisplayName(name)
      onSaved(next)
      dispatch(setDisplayName(next.displayName))
      setDraft(null)
      toast.success('Đã lưu tên hiển thị')
    } catch (err) {
      toast.error('Chưa lưu được', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card-soft flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
      <AvatarPicker account={account} onSaved={onSaved} />
      <div className="min-w-0 flex-1">
        {draft === null ? (
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-2xl font-extrabold text-slate-900">{account.displayName}</h2>
            <button type="button" onClick={() => setDraft(account.displayName)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              <Pencil className="h-3.5 w-3.5" />Sửa tên
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); save() }} className="flex max-w-md items-center gap-2">
            <label htmlFor="display-name" className="sr-only">Tên hiển thị</label>
            <input id="display-name" autoFocus maxLength={50} value={draft} onChange={(event) => setDraft(event.target.value)} className={fieldClass} />
            <button type="submit" disabled={saving} aria-label="Lưu tên" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setDraft(null)} aria-label="Hủy" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
              <X className="h-4 w-4" />
            </button>
          </form>
        )}
        <p className="mt-1 truncate text-sm text-slate-500">@{account.username} · {account.email}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          {account.hskLevel != null && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-brand">{levelLabel(account.hskLevel)}</span>}
          {account.googleLinked && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">Đã liên kết Google</span>}
          {account.role === 'ROLE_ADMIN' && <span className="rounded-full bg-purple-50 px-2.5 py-1 text-purple-700">Quản trị viên</span>}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><CalendarDays className="h-3.5 w-3.5" />Tham gia {formatDate(account.createdAt)}</span>
        </div>
      </div>
    </section>
  )
}

const AvatarPicker: React.FC<{ account: AccountProfile; onSaved: (account: AccountProfile) => void }> = ({ account, onSaved }) => {
  const dispatch = useAppDispatch()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const apply = (next: AccountProfile) => {
    onSaved(next)
    dispatch(setAvatarUrl(next.avatarUrl ?? null))
  }

  const choose = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Hãy chọn một file ảnh')
    if (file.size > 15 * 1024 * 1024) return toast.error('Ảnh quá lớn (tối đa 15 MB)')
    setBusy(true)
    try {
      apply(await uploadAvatar(await toSquareJpeg(file)))
      toast.success('Đã cập nhật ảnh đại diện')
    } catch (err) {
      toast.error('Chưa đổi được ảnh', { description: apiError(err, 'Trình duyệt không đọc được ảnh này, hãy thử ảnh JPG hoặc PNG.') })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      apply(await removeAvatar())
      toast.success('Đã gỡ ảnh đại diện')
    } catch (err) {
      toast.error('Chưa gỡ được ảnh', { description: apiError(err, 'Hãy thử lại.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label="Đổi ảnh đại diện"
        className="group relative rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
      >
        <Avatar name={account.displayName} src={account.avatarUrl} className="h-20 w-20 text-3xl" />
        <span className={`absolute inset-0 grid place-items-center rounded-full bg-slate-900/45 text-white transition-opacity ${busy ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-brand text-white shadow-xs">
          <Camera className="h-3.5 w-3.5" />
        </span>
      </button>
      <input ref={input} type="file" accept="image/*" onChange={choose} className="hidden" />
      {account.avatarUploaded && (
        <button type="button" onClick={remove} disabled={busy} className="text-xs font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-50">
          Gỡ ảnh
        </button>
      )}
    </div>
  )
}

const StatsRow: React.FC<{ stats: StudyStats | null }> = ({ stats }) => {
  if (!stats) return null
  const items = [
    { icon: Flame, tint: 'bg-orange-100 text-orange-600', value: stats.streakDays, label: 'Ngày học liên tiếp' },
    { icon: BookCheck, tint: 'bg-emerald-100 text-emerald-700', value: stats.nodesCompleted, label: 'Bài đã hoàn thành' },
    { icon: Layers, tint: 'bg-sky-100 text-sky-700', value: stats.dueCards, label: 'Thẻ cần ôn' },
    {
      icon: Trophy,
      tint: 'bg-amber-100 text-amber-700',
      value: stats.bestExamScore != null ? stats.bestExamScore : '—',
      label: stats.bestExamLevel != null ? `Điểm thi thử cao nhất (${levelLabel(stats.bestExamLevel)})` : 'Điểm thi thử cao nhất',
    },
  ]
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Thống kê học tập">
      {items.map(({ icon: Icon, tint, value, label }) => (
        <div key={label} className="card-soft flex items-center gap-3 p-4">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-xl font-extrabold tabular-nums text-slate-900">{value}</p>
            <p className="text-xs font-medium leading-snug text-slate-500">{label}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

const GoalCard: React.FC<{ overview: LearningPathOverview; onSaved: (overview: LearningPathOverview) => void }> = ({ overview, onSaved }) => {
  const goal = overview.goal
  const [draft, setDraft] = useState<LearningGoalInput | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await updateLearningGoal(draft)
      onSaved(await getLearningPathOverview())
      setDraft(null)
      toast.success('Đã lưu mục tiêu')
    } catch (err) {
      toast.error('Chưa lưu được mục tiêu', { description: apiError(err, 'Hãy kiểm tra lại thông tin rồi thử lần nữa.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card-soft p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-extrabold text-slate-900"><Target className="h-5 w-5 text-brand" />Mục tiêu học</h2>
        {!draft && (
          <button
            type="button"
            onClick={() => setDraft({
              goalType: goal.goalType,
              targetLevel: goal.targetLevel,
              targetScore: goal.targetScore ?? null,
              targetDate: goal.targetDate ?? null,
              dailyMinutes: goal.dailyMinutes,
            })}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil className="h-3.5 w-3.5" />{goal.goalSet ? 'Sửa' : 'Đặt mục tiêu'}
          </button>
        )}
      </div>
      {draft ? (
        <div className="mt-4 space-y-4">
          <GoalForm value={draft} onChange={setDraft} />
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={saving} className="btn-chunky btn-brand flex-1">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Lưu
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn-chunky btn-paper">Hủy</button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-brand">{levelLabel(goal.targetLevel)}</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Mục đích</dt><dd className="font-semibold text-slate-800">{goalLabel(goal.goalType)}</dd></div>
            {goal.targetScore != null && <div className="flex justify-between gap-3"><dt className="text-slate-500">Điểm mục tiêu</dt><dd className="font-semibold text-slate-800">{goal.targetScore}</dd></div>}
            {goal.targetDate && <div className="flex justify-between gap-3"><dt className="text-slate-500">Hạn</dt><dd className="font-semibold text-slate-800">{formatDate(`${goal.targetDate}T00:00:00`)}</dd></div>}
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Mỗi ngày</dt><dd className="font-semibold text-slate-800">{goal.dailyMinutes} phút</dd></div>
          </dl>
          {!goal.goalSet && <p className="mt-3 text-xs text-slate-500">Đang dùng mục tiêu mặc định, hãy đặt mục tiêu của bạn.</p>}
        </>
      )}
    </section>
  )
}

const PasswordCard: React.FC<{ account: AccountProfile; onChanged: () => void }> = ({ account, onChanged }) => {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  // A Google account that never had a password of its own sets one without the old (random) password.
  const settingFirst = !account.passwordSet

  const reset = () => { setOpen(false); setCurrent(''); setNext(''); setConfirm(''); setFormError('') }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!settingFirst && !current) return setFormError('Vui lòng nhập mật khẩu hiện tại.')
    if (next.length < 6 || next.length > 100) return setFormError('Mật khẩu mới cần từ 6 đến 100 ký tự.')
    if (next !== confirm) return setFormError('Mật khẩu nhập lại không khớp.')
    setSaving(true)
    setFormError('')
    try {
      const tokens = await changePassword(settingFirst ? null : current, next)
      dispatch(setCredentials(tokens))
      onChanged()
      reset()
      toast.success(settingFirst ? 'Đã đặt mật khẩu' : 'Đã đổi mật khẩu', { description: 'Các thiết bị khác sẽ phải đăng nhập lại.' })
    } catch (err) {
      setFormError(apiError(err, 'Chưa đổi được mật khẩu. Hãy thử lại.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card-soft p-6">
      <h2 className="flex items-center gap-2 font-extrabold text-slate-900"><ShieldCheck className="h-5 w-5 text-emerald-600" />Bảo mật</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {settingFirst
          ? 'Bạn đang đăng nhập bằng Google. Đặt mật khẩu để có thể đăng nhập bằng email hoặc tên đăng nhập.'
          : 'Đổi mật khẩu sẽ đăng xuất tài khoản khỏi các thiết bị khác.'}
      </p>
      <p className="mt-2 text-xs text-slate-500">Đăng nhập gần nhất: {formatDate(account.lastLogin)}</p>

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="btn-chunky btn-paper mt-4 w-full">
          <KeyRound className="h-4 w-4" />{settingFirst ? 'Đặt mật khẩu' : 'Đổi mật khẩu'}
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          {/* Lets password managers tie the new password to this account. */}
          <input type="text" name="username" autoComplete="username" value={account.username} readOnly hidden />
          {!settingFirst && (
            <label className="block text-xs font-semibold text-slate-600">
              Mật khẩu hiện tại
              <input type="password" autoComplete="current-password" autoFocus value={current} onChange={(event) => setCurrent(event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
          )}
          <label className="block text-xs font-semibold text-slate-600">
            Mật khẩu mới
            <input type="password" autoComplete="new-password" autoFocus={settingFirst} value={next} onChange={(event) => setNext(event.target.value)} placeholder="Tối thiểu 6 ký tự" className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Nhập lại mật khẩu mới
            <input type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className={`${fieldClass} mt-1.5`} />
          </label>
          {formError && <p role="alert" className="text-sm text-rose-700">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-chunky btn-brand flex-1">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Lưu mật khẩu
            </button>
            <button type="button" onClick={reset} className="btn-chunky btn-paper">Hủy</button>
          </div>
        </form>
      )}
    </section>
  )
}
