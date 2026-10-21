import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/authApi'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const PRIMARY = '#B52A2A'

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên đăng nhập')
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(30, 'Tên đăng nhập không được vượt quá 30 ký tự')
      .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    email: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập địa chỉ email')
      .email('Định dạng email không hợp lệ'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Khởi tạo useForm với zodResolver
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  })

  // Xử lý gửi Form
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const response = await authApi.register({
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })

      if (response.success) {
        showToastMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...', 'success')
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Đăng ký thành công! Hãy đăng nhập để bắt đầu học.' },
            replace: true,
          })
        }, 1500)
      } else {
        showToastMsg(response.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error')
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Đăng ký không thành công. Tên đăng nhập hoặc email có thể đã tồn tại.'
      showToastMsg(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // ── Full-screen centered wrapper ─────────────────────────
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-8">

      {/* ── Register Card ─────────────────────────────────── */}
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-md border border-slate-100 px-8 py-9 animate-fade-up"
      >
        {/* ── Logo ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 mb-6">
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

          <span className="text-2xl font-bold tracking-tight text-slate-800 select-none">
            Yi<span style={{ color: PRIMARY }}>bi</span>
          </span>

          <div className="w-8 h-[2px] rounded-full mt-0.5" style={{ backgroundColor: PRIMARY, opacity: 0.25 }} />
        </div>

        {/* ── Heading ──────────────────────────────────────── */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Tạo tài khoản mới
          </h1>
        </div>

        {/* ── shadcn/ui Form ───────────────────────────────── */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                    Tên đăng nhập
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <IconUser />
                      </span>
                      <Input
                        placeholder="Ví dụ: yibihocvien"
                        autoComplete="username"
                        disabled={isLoading}
                        className="pl-9 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-[#B52A2A] focus-visible:border-[#B52A2A] text-sm text-slate-800 placeholder-slate-300 rounded-lg"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <IconMail />
                      </span>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className="pl-9 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-[#B52A2A] focus-visible:border-[#B52A2A] text-sm text-slate-800 placeholder-slate-300 rounded-lg"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                    Mật khẩu
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <IconLock />
                      </span>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tối thiểu 6 ký tự"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="pl-9 pr-10 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-[#B52A2A] focus-visible:border-[#B52A2A] text-sm text-slate-800 placeholder-slate-300 rounded-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                    Xác nhận mật khẩu
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <IconLock />
                      </span>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="pl-9 pr-10 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-[#B52A2A] focus-visible:border-[#B52A2A] text-sm text-slate-800 placeholder-slate-300 rounded-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: PRIMARY }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#9e2424'
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = PRIMARY
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <IconSpinner /> Đang đăng ký tài khoản...
                </span>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>
        </Form>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
        </div>

        {/* ── Login link ────────────────────────────────────── */}
        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: PRIMARY }}
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      {/* ── Page footer ──────────────────────────────────────── */}
      <p className="absolute bottom-4 text-xs text-slate-300 select-none">
        © {new Date().getFullYear()} Yibi · Nền tảng học tiếng Trung thông minh
      </p>

      {/* ── Floating Toast notification ──────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up"
          role="alert"
          aria-live="polite"
        >
          <div
            className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm text-white shadow-xl border ${
              toast.type === 'success'
                ? 'bg-slate-900 border-slate-700'
                : 'bg-red-900 border-red-700'
            }`}
          >
            {toast.type === 'success' ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shrink-0">
                <IconCheck />
              </span>
            ) : (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white shrink-0">
                <IconAlert />
              </span>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
