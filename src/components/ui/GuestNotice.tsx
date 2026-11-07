import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Lock, LogIn } from 'lucide-react'

/** Shown in place of a learner's own data when a guest opens a page that is built around it. */
export const GuestNotice: React.FC<{ title: string; message: string; className?: string }> = ({ title, message, className = '' }) => {
  const location = useLocation()
  return (
    <section className={`card-soft p-6 text-center sm:p-8 ${className}`}>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-brand"><Lock className="h-6 w-6" /></span>
      <h2 className="mt-3 text-lg font-extrabold text-slate-900">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500">{message}</p>
      <Link to="/login" state={{ from: { pathname: location.pathname, search: location.search } }} className="btn-chunky btn-brand mt-5 px-6 py-2.5 text-sm">
        <LogIn className="h-4 w-4" />
        Đăng nhập
      </Link>
    </section>
  )
}
