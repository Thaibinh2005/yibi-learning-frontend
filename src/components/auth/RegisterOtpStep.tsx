import React, { useEffect, useRef, useState } from 'react'
import { authApi } from '@/api/authApi'
import type { AuthResponse } from '@/types/auth'

const PRIMARY = '#B52A2A'
const LENGTH = 6
const RESEND_SECONDS = 60

interface Props {
  email: string
  /** Called with the new session once the code is right and the account exists. */
  onVerified: (session: AuthResponse) => void
  /** Back to the form, for a wrong email or an expired sign-up. */
  onBack: () => void
}

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

/** Step 2 of sign-up: the six digits emailed to the learner, with a resend after a minute. */
export const RegisterOtpStep: React.FC<Props> = ({ email, onVerified, onBack }) => {
  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(''))
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const verify = async (code: string) => {
    if (verifying) return
    setVerifying(true)
    setError('')
    setInfo('')
    try {
      const res = await authApi.verifyRegisterOtp(email, code)
      if (res.success && res.data) {
        onVerified(res.data)
        return
      }
      setError(res.message || 'Mã xác thực không đúng.')
    } catch (err) {
      setError(errorMessage(err, 'Chưa xác thực được. Vui lòng thử lại.'))
    }
    setDigits(Array(LENGTH).fill(''))
    inputs.current[0]?.focus()
    setVerifying(false)
  }

  /** Puts digits in from `index` on (typing one, or pasting all six), and submits when the code is complete. */
  const fill = (index: number, value: string) => {
    const incoming = value.replace(/\D/g, '').slice(0, LENGTH - index)
    if (!incoming) return
    const next = [...digits]
    incoming.split('').forEach((d, i) => { next[index + i] = d })
    setDigits(next)
    const after = Math.min(index + incoming.length, LENGTH - 1)
    inputs.current[after]?.focus()
    if (next.every(Boolean)) void verify(next.join(''))
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (next[index]) {
        next[index] = ''
      } else if (index > 0) {
        next[index - 1] = ''
        inputs.current[index - 1]?.focus()
      }
      setDigits(next)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const resend = async () => {
    setError('')
    setInfo('')
    try {
      await authApi.resendRegisterOtp(email)
      setInfo('Đã gửi mã mới. Mã cũ không còn dùng được.')
      setCooldown(RESEND_SECONDS)
      setDigits(Array(LENGTH).fill(''))
      inputs.current[0]?.focus()
    } catch (err) {
      setError(errorMessage(err, 'Chưa gửi lại được mã. Vui lòng thử lại.'))
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Xác thực email</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nhập mã 6 số vừa được gửi tới
          <br />
          <span className="font-semibold text-slate-700 break-all">{email}</span>
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (digits.every(Boolean)) void verify(digits.join('')) }}
        className="space-y-5"
      >
        <div className="flex justify-center gap-2" role="group" aria-label="Mã xác thực 6 số">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              value={digit}
              onChange={(e) => fill(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={(e) => { e.preventDefault(); fill(i, e.clipboardData.getData('text')) }}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={LENGTH}
              disabled={verifying}
              aria-label={`Chữ số ${i + 1}`}
              className="h-12 w-11 rounded-lg border border-slate-200 bg-white text-center text-xl font-semibold tabular-nums text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#B52A2A] focus:border-[#B52A2A] disabled:opacity-60"
            />
          ))}
        </div>

        {error && <p className="text-center text-sm text-red-600" role="alert">{error}</p>}
        {info && <p className="text-center text-sm text-emerald-600" aria-live="polite">{info}</p>}

        <button
          type="submit"
          disabled={verifying || !digits.every(Boolean)}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: PRIMARY }}
        >
          {verifying ? 'Đang xác thực...' : 'Xác thực và tạo tài khoản'}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-slate-500 hover:text-slate-700">
          ← Sửa thông tin
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="font-semibold disabled:cursor-not-allowed disabled:text-slate-400"
          style={cooldown > 0 ? undefined : { color: PRIMARY }}
        >
          {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : 'Gửi lại mã'}
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">Không thấy email? Hãy kiểm tra thư mục Spam hoặc Quảng cáo.</p>
    </div>
  )
}
