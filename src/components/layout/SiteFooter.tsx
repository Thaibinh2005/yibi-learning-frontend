import React from 'react'
import { Link } from 'react-router-dom'

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Học tập',
    links: [
      { label: 'Lộ trình cá nhân', to: '/learning-path' },
      { label: 'Flashcard', to: '/flashcards' },
      { label: 'Nghe & Nói', to: '/listening' },
      { label: 'Thi thử HSK', to: '/exams' },
    ],
  },
  {
    title: 'Tài nguyên',
    links: [
      { label: 'Từ vựng mỗi ngày', to: '/vocabulary/daily' },
      { label: 'Thư viện giáo trình', to: '/courses' },
      { label: 'Mẹo học', to: '/tips' },
      { label: 'Tài khoản', to: '/account' },
    ],
  },
]

/** The page foot: what Yibi is, where to go next, and the copyright line. */
export const SiteFooter: React.FC = () => (
  // The bottom margin clears the phone's fixed bottom navigation.
  <footer className="mb-24 mt-10 rounded-[30px] border border-border bg-white p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] md:mb-6 md:px-10 md:py-9">
    <div className="grid gap-6 md:grid-cols-[2fr_1fr_1fr] md:gap-12">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-3">
          <img src="/logo-yibi.png" alt="" width={44} height={44} className="h-11 w-11" />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Yi<span className="text-brand">bi</span></span>
        </Link>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-slate-500">
          Học tiếng Trung cá nhân hóa theo chuẩn HSK 3.0: lộ trình theo trình độ, ôn tập ngắt quãng và luyện nghe nói mỗi ngày.
        </p>
      </div>

      {COLUMNS.map((column) => (
        <nav key={column.title} aria-label={column.title}>
          <h2 className="text-lg font-semibold text-slate-900">{column.title}</h2>
          <ul className="mt-3 space-y-2.5">
            {column.links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-[15px] text-slate-500 transition-colors hover:text-brand">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>

    <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:mt-10">
      <p>© {new Date().getFullYear()} Yibi. Học tiếng Trung cá nhân hóa.</p>
      <p>
        学中文，<span className="font-semibold text-brand">一步一步</span>
      </p>
    </div>
  </footer>
)
