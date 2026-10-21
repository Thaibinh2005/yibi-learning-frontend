import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setCredentials } from '@/app/slices/authSlice'
import { authApi } from '@/api/authApi'
import type { LoginRequest } from '@/types/auth'

// ── Brand token ───────────────────────────────────────────────
const PRIMARY = '#B52A2A'

// ── Inline SVG icons ──────────────────────────────────────────
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
)
const IconSpinner = () => (
  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

// ── Google "G" logo (official brand colors) ───────────────────
const IconGoogle = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  const [form, setForm] = useState<LoginRequest>({ usernameOrEmail: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.usernameOrEmail.trim() || !form.password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin đăng nhập.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await authApi.login(form)
      if (res.success && res.data) {
        dispatch(setCredentials(res.data))
        navigate(from, { replace: true })
      } else {
        setError(res.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Tên đăng nhập hoặc mật khẩu không chính xác.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fieldStyle = (name: string): React.CSSProperties => ({
    outline: 'none',
    borderColor: focusedField === name ? PRIMARY : '#e2e8f0',
    boxShadow: focusedField === name ? `0 0 0 3px ${PRIMARY}1a` : 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  })

  return (
    // ── Full-screen centered wrapper ─────────────────────────
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">

      {/* ── Login Card ────────────────────────────────────── */}
      <div
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-md border border-slate-100 px-8 py-10 animate-fade-up"
      >

        {/* ── Logo ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {/* Icon badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: PRIMARY }}
          >
            <span
              className="font-chinese text-white font-black text-2xl leading-none"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              易
            </span>
          </div>

          {/* Wordmark */}
          <span className="text-2xl font-bold tracking-tight text-slate-800 select-none">
            Yi<span style={{ color: PRIMARY }}>bi</span>
          </span>

          {/* Divider */}
          <div className="w-8 h-[2px] rounded-full mt-1" style={{ backgroundColor: PRIMARY, opacity: 0.25 }} />
        </div>

        {/* ── Heading ──────────────────────────────────────── */}
        <div className="text-center mb-7">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Đăng nhập
          </h1>
        </div>

        {/* ── Error alert ──────────────────────────────────── */}
        {error && (
          <div
            className="flex items-start gap-2 rounded-lg px-3.5 py-3 text-xs mb-5 animate-fade-in"
            style={{
              backgroundColor: `${PRIMARY}0d`,
              border: `1px solid ${PRIMARY}30`,
              color: PRIMARY,
            }}
          >
            <span className="mt-0.5 shrink-0"><IconAlert /></span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Username / Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="usernameOrEmail"
              className="block text-xs font-medium text-slate-500 tracking-wide uppercase"
            >
              Tên đăng nhập / Email
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 transition-colors duration-150"
                style={{ color: focusedField === 'usernameOrEmail' ? PRIMARY : undefined }}
              >
                <IconUser />
              </span>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                autoComplete="username"
                value={form.usernameOrEmail}
                onChange={handleChange}
                onFocus={() => setFocusedField('usernameOrEmail')}
                onBlur={() => setFocusedField(null)}
                placeholder="username hoặc email"
                disabled={isLoading}
                style={fieldStyle('usernameOrEmail')}
                className="w-full rounded-lg border bg-white pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-500 tracking-wide uppercase"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 transition-colors duration-150"
                style={{ color: focusedField === 'password' ? PRIMARY : undefined }}
              >
                <IconLock />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
                style={fieldStyle('password')}
                className="w-full rounded-lg border bg-white pl-9 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {/* Quên mật khẩu — dưới input, căn phải */}
            <div className="flex justify-end pt-0.5">
              <Link
                to="/forgot-password"
                className="text-xs font-medium transition-colors hover:opacity-75"
                style={{ color: PRIMARY }}
                tabIndex={-1}
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: PRIMARY }}
            onMouseEnter={(e) => { if (!isLoading) (e.currentTarget.style.backgroundColor = '#9e2424') }}
            onMouseLeave={(e) => { if (!isLoading) (e.currentTarget.style.backgroundColor = PRIMARY) }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <IconSpinner /> Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-slate-300 select-none">hoặc</span>
          </div>
        </div>

        {/* ── Google sign-in button ────────────────────────────── */}
        <button
          id="login-google-btn"
          type="button"
          onClick={() => showToast('Tính năng đang được phát triển')}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
        >
          <IconGoogle />
          Đăng nhập với Google
        </button>

        {/* ── Register separator ───────────────────────────────── */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
        </div>

        {/* ── Register link ─────────────────────────────────── */}
        <p className="text-center text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: PRIMARY }}
          >
            Đăng ký miễn phí
          </Link>
        </p>
      </div>

      {/* ── Page footer ──────────────────────────────────────── */}
      <p className="absolute bottom-5 text-xs text-slate-300 select-none">
        © {new Date().getFullYear()} Yibi · Nền tảng học tiếng Trung thông minh
      </p>

      {/* ── Toast notification ───────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm text-white shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
