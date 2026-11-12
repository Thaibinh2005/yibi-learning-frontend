import React, { useState, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BookMarked,
  ChevronDown,
  ExternalLink,
  FileCheck,
  Flame,
  House,
  Layers,
  Library,
  LogOut,
  Map as MapIcon,
  Menu,
  X,
  Lightbulb,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/app/slices/authSlice'
import { authApi } from '@/api/authApi'
import { getLearningPathOverview, getStudyStats, recordStudyActivity, type StudyStats } from '@/api/learningPathApi'
import { GoalRing } from '@/components/learningpath/GoalRing'
import { levelLabel } from '@/components/learningpath/GoalForm'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  isActive: (pathname: string) => boolean
}

const startsWith = (...prefixes: string[]) => (pathname: string) => prefixes.some((prefix) => pathname.startsWith(prefix))

const NAV_ITEMS: NavItem[] = [
  { label: 'Trang chủ', path: '/dashboard', icon: House, isActive: (pathname) => pathname === '/dashboard' || pathname === '/' },
  { label: 'Lộ trình', path: '/learning-path', icon: MapIcon, isActive: startsWith('/learning-path', '/placement', '/onboarding', '/practice') },
  { label: 'Flashcard', path: '/flashcards', icon: Layers, isActive: startsWith('/flashcards') },
  { label: 'Thi thử', path: '/exams', icon: FileCheck, isActive: startsWith('/exams') },
]

const VOCABULARY_SUB_ITEMS = [
  { label: 'Từ vựng mỗi ngày', path: '/vocabulary/daily' },
  { label: 'Tra cứu từ vựng', path: '/vocabulary/search' },
  { label: 'Từ vựng theo chủ đề', path: '/vocabulary/topic' },
  { label: 'Viết chữ', path: '/vocabulary/writing' },
]

/** These pages take the whole screen, so nothing competes with the question being answered. */
const FOCUS_PAGES = /^\/learning-path\/(lesson\/|level-test\/|mistakes\/review)/

const navRow = (active: boolean) =>
  `flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-[15px] font-bold transition-colors ${
    active ? 'border-rose-200 bg-rose-50 text-brand' : 'border-transparent text-slate-600 hover:bg-slate-100'
  }`

export const UserLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null)
  const [pathLevel, setPathLevel] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isInsideVocab = location.pathname.startsWith('/vocabulary')
  const [isVocabOpen, setIsVocabOpen] = useState(isInsideVocab)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const focused = FOCUS_PAGES.test(location.pathname)

  // Study time counts only while the page is visible and the learner has been active in the last two minutes.
  useEffect(() => {
    if (!isAuthenticated) return
    const refresh = () => { getStudyStats().then(setStudyStats).catch(() => undefined) }
    refresh()
    let lastInput = Date.now()
    const markActive = () => { lastInput = Date.now() }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((name) => window.addEventListener(name, markActive, { passive: true }))
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInput < 120_000) {
        recordStudyActivity(30).then(refresh).catch(() => undefined)
      }
    }, 30_000)
    return () => {
      window.clearInterval(timer)
      events.forEach((name) => window.removeEventListener(name, markActive))
    }
  }, [isAuthenticated])

  // The level can rise during a lesson, so it is read again after each page rather than kept from login.
  useEffect(() => {
    if (focused || !isAuthenticated) return
    getLearningPathOverview().then((overview) => setPathLevel(overview.availableHskLevel)).catch(() => undefined)
  }, [location.pathname, focused, isAuthenticated])

  useEffect(() => {
    if (isInsideVocab) setIsVocabOpen(true)
  }, [isInsideVocab])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setIsDropdownOpen(false)
      await authApi.logout().catch(() => {
        // Tiếp tục logout cục bộ dù backend có trả lỗi
      })
    } finally {
      dispatch(logout())
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  const getPageTitle = () => {
    const { pathname } = location
    const sub = VOCABULARY_SUB_ITEMS.find((item) => item.path === pathname)
    if (sub) return sub.label
    if (pathname === '/tips') return 'Mẹo học'
    if (pathname === '/vocabulary') return 'Kho từ vựng HSK'
    if (pathname.startsWith('/vocabulary')) return 'Từ vựng'
    if (pathname === '/learning-path/practice') return 'Luyện tập'
    if (pathname === '/learning-path/mistakes') return 'Câu từng sai'
    if (pathname.startsWith('/onboarding')) return 'Khảo sát trình độ'
    if (pathname.startsWith('/placement/result')) return 'Kết quả xếp trình độ'
    if (pathname.startsWith('/placement')) return 'Bài test xếp trình độ'
    if (pathname === '/courses') {
      const level = Number(new URLSearchParams(location.search).get('hskLevel') || 1)
      return `Giáo trình HSK ${level === 7 ? '7–9' : level}`
    }
    return NAV_ITEMS.find((item) => item.isActive(pathname))?.label ?? 'Yibi'
  }

  if (focused) {
    return <div className="min-h-screen bg-background text-slate-800 animate-fade-in"><Outlet /></div>
  }

  const level = pathLevel ?? user?.hskLevel ?? 1
  const goalPercent = studyStats?.goalPercent ?? 0

  return (
    <div className="flex min-h-screen bg-background font-sans text-slate-800 selection:bg-rose-200">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden border-r-2 border-slate-200/70 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 shrink-0 items-center justify-between px-5">
          <Link to="/dashboard" className="group flex items-center gap-3">
            <img src="/logo-yibi.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 transition-transform group-hover:-rotate-6" />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="select-none text-2xl font-extrabold tracking-tight text-slate-900">Yi<span className="text-brand">bi</span></span>
              <span className="mt-1 select-none whitespace-nowrap text-[11px] font-semibold text-slate-500">Học tiếng Trung cá nhân hóa</span>
            </span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden" aria-label="Đóng menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 pb-3 [scrollbar-width:thin]" aria-label="Điều hướng chính">
          {NAV_ITEMS.map(({ label, path, icon: Icon, isActive }) => {
            const active = isActive(location.pathname)
            return (
              <Link key={path} to={path} aria-current={active ? 'page' : undefined} className={navRow(active)}>
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            )
          })}

          <button type="button" aria-expanded={isVocabOpen} onClick={() => setIsVocabOpen((value) => !value)} className={`w-full justify-between ${navRow(isInsideVocab)}`}>
            <span className="flex items-center gap-3"><BookMarked className="h-5 w-5 shrink-0" />Từ vựng</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isVocabOpen ? 'rotate-180' : ''}`} />
          </button>
          {isVocabOpen && (
            <div className="animate-fade-in ml-6 space-y-0.5 border-l-2 border-slate-100 pl-3">
              {VOCABULARY_SUB_ITEMS.map((sub) => {
                const active = location.pathname === sub.path || (sub.path === '/vocabulary/daily' && location.pathname === '/vocabulary')
                return (
                  <Link key={sub.path} to={sub.path} aria-current={active ? 'page' : undefined} className={`block rounded-xl px-3 py-2 text-sm transition-colors ${active ? 'bg-rose-50 font-bold text-brand' : 'font-medium text-slate-600 hover:bg-slate-100'}`}>
                    {sub.label}
                  </Link>
                )
              })}
            </div>
          )}

          <Link to="/courses" aria-current={location.pathname === '/courses' ? 'page' : undefined} className={navRow(location.pathname === '/courses')}>
            <Library className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap">Thư viện giáo trình</span>
          </Link>

          <Link to="/tips" aria-current={location.pathname === '/tips' ? 'page' : undefined} className={navRow(location.pathname === '/tips')}>
            <Lightbulb className="h-5 w-5 shrink-0" />
            Mẹo học
          </Link>
        </nav>

        <div className="shrink-0 p-3">
          {!isAuthenticated ? (
            <Link to="/login" className="block rounded-2xl border-2 border-slate-200/70 p-3 transition-colors hover:bg-slate-50">
              <span className="block text-sm font-extrabold text-slate-800">Chưa đăng nhập</span>
              <span className="block text-xs font-medium text-slate-500">Đăng nhập để lưu tiến độ học</span>
            </Link>
          ) : (
          <Link to="/dashboard" className="flex items-center gap-3 rounded-2xl border-2 border-slate-200/70 p-3 transition-colors hover:bg-slate-50">
            <GoalRing percent={goalPercent} size={52} stroke={6}>
              <span className="text-[11px] font-extrabold tabular-nums text-slate-800">{goalPercent}%</span>
            </GoalRing>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-slate-800">Hôm nay</span>
              <span className="block text-xs font-medium tabular-nums text-slate-500">{studyStats?.todayMinutes ?? 0}/{studyStats?.dailyGoalMinutes ?? 0} phút · {levelLabel(level)}</span>
            </span>
          </Link>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden" aria-label="Mở menu">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="truncate text-sm font-bold text-slate-500">{getPageTitle()}</h2>
          </div>

          {!isAuthenticated ? (
            <Link to="/login" state={{ from: { pathname: location.pathname, search: location.search } }} className="btn-chunky btn-brand shrink-0 px-4 py-2 text-sm">Đăng nhập</Link>
          ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-extrabold tabular-nums text-orange-600" title={`${studyStats?.streakDays ?? 0} ngày học liên tiếp`} aria-label={`${studyStats?.streakDays ?? 0} ngày học liên tiếp`}>
              <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
              {studyStats?.streakDays ?? 0}
            </span>

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen((value) => !value)} className="flex items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-slate-100 focus:outline-none" aria-expanded={isDropdownOpen} aria-label="Tài khoản">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="animate-fade-in absolute right-0 z-50 mt-2 w-60 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white py-1.5 shadow-lg">
                  <div className="px-4 py-2.5">
                    <p className="truncate text-sm font-bold text-slate-800">{user?.username || 'Học viên'}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
                    <span className="mt-2 inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-brand">{levelLabel(level)}</span>
                  </div>
                  <div className="py-1">
                    {user?.role === 'ROLE_ADMIN' && (
                      <Link to="/admin" className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50">
                        <ExternalLink className="h-4 w-4" />
                        Trang quản trị
                      </Link>
                    )}
                  </div>
                  <div className="py-1">
                    <button onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50">
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </header>

        <main className="animate-fade-in mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-2 sm:px-6 md:pb-10 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* The sidebar is off-screen on a phone, so the main places stay under the thumb. */}
      <nav aria-label="Điều hướng nhanh" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t-2 border-slate-200/70 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {[...NAV_ITEMS, { label: 'Từ vựng', path: '/vocabulary/daily', icon: BookMarked, isActive: startsWith('/vocabulary') }].map(({ label, path, icon: Icon, isActive }) => {
          const active = isActive(location.pathname)
          return (
            <Link key={path} to={path} aria-current={active ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${active ? 'text-brand' : 'text-slate-500'}`}>
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
