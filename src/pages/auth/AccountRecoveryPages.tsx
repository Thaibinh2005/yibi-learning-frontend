import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, LoaderCircle } from 'lucide-react'
import { authApi } from '@/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials } from '@/app/slices/authSlice'

const messageOf = (cause: unknown, fallback: string) =>
  (cause as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback

const Card: React.FC<{ title: string; note?: string; children: React.ReactNode }> = ({ title, note, children }) => (
  <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-8">
    <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <Link to="/dashboard" className="mx-auto block w-fit" aria-label="Về trang chủ Yibi"><img src="/logo-yibi.png" alt="" width={64} height={64} className="h-16 w-16" /></Link>
        <p className="mt-1 text-xs font-semibold text-slate-500">Học tiếng Trung cá nhân hóa</p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-800">{title}</h1>
        {note && <p className="mt-2 text-sm leading-relaxed text-slate-500">{note}</p>}
      </div>
      {children}
    </div>
  </div>
)

const fieldClass = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-rose-100'
const submitClass = 'flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60'

const Failure: React.FC<{ text: string }> = ({ text }) => (
  <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-relaxed text-rose-700">{text}</p>
)

const BackToLogin = () => (
  <p className="mt-5 text-center text-sm">
    <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-brand hover:opacity-80"><ArrowLeft className="h-4 w-4" />Về đăng nhập</Link>
  </p>
)

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Vui lòng nhập đúng địa chỉ email.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (cause) {
      setError(messageOf(cause, 'Chưa gửi được yêu cầu. Hãy thử lại.'))
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <Card title="Kiểm tra hộp thư của bạn">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Nếu <b>{email.trim()}</b> đã đăng ký, bạn sẽ nhận được email có liên kết đặt lại mật khẩu trong ít phút. Liên kết có hiệu lực trong 30 phút.</p>
          <p className="mt-2 text-xs text-slate-500">Không thấy email? Hãy xem thêm trong mục thư rác.</p>
        </div>
        <BackToLogin />
      </Card>
    )
  }

  return (
    <Card title="Quên mật khẩu" note="Nhập email đã đăng ký, Yibi sẽ gửi cho bạn liên kết đặt mật khẩu mới.">
      {error && <Failure text={error} />}
      <form onSubmit={submit} noValidate className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Email
          <input id="forgot-email" type="email" autoComplete="email" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className={`${fieldClass} mt-1.5 font-normal normal-case tracking-normal`} />
        </label>
        <button type="submit" disabled={busy} className={submitClass}>
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}Gửi liên kết
        </button>
      </form>
      <BackToLogin />
    </Card>
  )
}

export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password.length < 6 || password.length > 100) {
      setError('Mật khẩu cần từ 6 đến 100 ký tự.')
      return
    }
    if (password !== confirm) {
      setError('Hai mật khẩu chưa khớp nhau.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
    } catch (cause) {
      setError(messageOf(cause, 'Chưa đổi được mật khẩu. Hãy thử lại.'))
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <Card title="Liên kết không hợp lệ" note="Hãy mở đúng liên kết trong email, hoặc yêu cầu liên kết mới.">
        <Link to="/forgot-password" className={submitClass}>Yêu cầu liên kết mới</Link>
        <BackToLogin />
      </Card>
    )
  }

  if (done) {
    return (
      <Card title="Đã đổi mật khẩu">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <p className="mt-3 text-sm text-slate-600">Bạn có thể đăng nhập bằng mật khẩu mới. Các phiên đăng nhập cũ sẽ tự kết thúc.</p>
        </div>
        <Link to="/login" className={`${submitClass} mt-5`}>Đăng nhập</Link>
      </Card>
    )
  }

  return (
    <Card title="Đặt mật khẩu mới">
      {error && <Failure text={error} />}
      <form onSubmit={submit} noValidate className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Mật khẩu mới
          <input id="new-password" type="password" autoComplete="new-password" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 6 ký tự" className={`${fieldClass} mt-1.5 font-normal normal-case tracking-normal`} />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Nhập lại mật khẩu
          <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Nhập lại mật khẩu mới" className={`${fieldClass} mt-1.5 font-normal normal-case tracking-normal`} />
        </label>
        <button type="submit" disabled={busy} className={submitClass}>
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}Đổi mật khẩu
        </button>
      </form>
      <BackToLogin />
    </Card>
  )
}

/** Google sent the browser back here with a one-time code, which becomes a normal sign-in. */
export const GoogleCallbackPage: React.FC = () => {
  const [params] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  // A code works once, and development mode runs effects twice.
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const code = params.get('code')
    if (!code) {
      setError('Thiếu thông tin đăng nhập từ Google. Hãy thử lại.')
      return
    }
    const returnTo = params.get('returnTo') ?? '/dashboard'
    authApi.exchangeGoogleCode(code).then((response) => {
      dispatch(setCredentials(response.data))
      navigate(returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/dashboard', { replace: true })
    }).catch((cause) => setError(messageOf(cause, 'Chưa đăng nhập được bằng Google. Hãy thử lại.')))
  }, [dispatch, navigate, params])

  if (error) {
    return (
      <Card title="Đăng nhập chưa thành công">
        <Failure text={error} />
        <BackToLogin />
      </Card>
    )
  }
  return (
    <Card title="Đang đăng nhập">
      <p className="flex items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang hoàn tất đăng nhập với Google...</p>
    </Card>
  )
}
