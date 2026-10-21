import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  Library,
  Layers,
  FileCheck,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Flame,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/app/slices/authSlice'
import { authApi } from '@/api/authApi'

const PRIMARY = '#B52A2A'

interface NavMenuItem {
  label: string
  path: string
  icon: React.ElementType
  badge?: string
}

// ── Menu cấp 1 thông thường ─────────────────────────────────────
const MAIN_NAV_ITEMS: NavMenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Khóa học', path: '/courses', icon: GraduationCap },
]

const SECONDARY_NAV_ITEMS: NavMenuItem[] = [
  { label: 'Flashcard', path: '/flashcards', icon: Layers, badge: 'SRS' },
  { label: 'Thi thử', path: '/exams', icon: FileCheck },
]

// ── Các Menu con của nhóm Từ vựng ────────────────────────────────
const VOCABULARY_SUB_ITEMS = [
  { label: 'Từ vựng mỗi ngày', path: '/vocabulary/daily' },
  { label: 'Tra cứu từ vựng', path: '/vocabulary/search' },
  { label: 'Sổ tay từ vựng', path: '/vocabulary/notebook' },
  { label: 'Từ vựng theo chủ đề', path: '/vocabulary/topic' },
  { label: 'Mẹo nhớ từ vựng', path: '/vocabulary/tips' },
  { label: 'Lượng từ', path: '/vocabulary/quantifiers' },
]

export const UserLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Trạng thái mở/đóng của cụm Collapsible Từ vựng
  const isInsideVocab = location.pathname.startsWith('/vocabulary')
  const [isVocabOpen, setIsVocabOpen] = useState(true)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Tự động mở Collapsible Menu khi người dùng đang ở nhánh /vocabulary
  useEffect(() => {
    if (isInsideVocab) {
      setIsVocabOpen(true)
    }
  }, [location.pathname, isInsideVocab])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Đóng mobile menu khi chuyển route
  useEffect(() => {
    setIsMobileMenuOpen(false)
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

  // Tiêu đề trang động trên Header
  const getPageTitle = () => {
    const sub = VOCABULARY_SUB_ITEMS.find((item) => item.path === location.pathname)
    if (sub) return sub.label
    if (location.pathname === '/vocabulary') return 'Kho Từ Vựng HSK'

    const main = MAIN_NAV_ITEMS.find((item) => item.path === location.pathname)
    if (main) return main.label

    const sec = SECONDARY_NAV_ITEMS.find((item) => item.path === location.pathname)
    if (sec) return sec.label

    return 'Tổng quan'
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans selection:bg-[#B52A2A]/10 selection:text-[#B52A2A]">
      {/* ── Mobile Sidebar Overlay ────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar (Left Navigation) ─────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Navigation */}
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: PRIMARY }}
              >
                <span
                  className="font-chinese text-white font-black text-lg leading-none"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  易
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-800 select-none">
                  Yi<span style={{ color: PRIMARY }}>bi</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                  Học tiếng Trung AI
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3.5 space-y-1.5" aria-label="Main Navigation">
            {/* Nhóm 1: Menu học tập chính */}
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
              Học tập & Lộ trình
            </div>

            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-rose-50 text-[#B52A2A] font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#B52A2A]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              )
            })}

            {/* ── Nhiệm vụ 1: Group Header & Menu Cha 'Từ vựng' ──────────── */}
            <div className="pt-3">
              <div className="px-3 pb-1.5 text-xs font-semibold text-slate-400 tracking-wide uppercase select-none">
                TỪ VỰNG & NỀN TẢNG
              </div>

              {/* Menu cha 'Từ vựng' */}
              <button
                type="button"
                onClick={() => setIsVocabOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors select-none ${
                  isInsideVocab
                    ? 'bg-rose-50/50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon Library / BookOpen trong vòng tròn đỏ nhạt */}
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Library className="w-4 h-4 text-[#B52A2A]" />
                  </div>

                  {/* Text màu đỏ chủ đạo #B52A2A */}
                  <span className="text-base font-medium text-[#B52A2A]">
                    Từ vựng
                  </span>
                </div>

                {/* Chevron icon xoay khi mở/đóng */}
                <ChevronDown
                  className={`w-4 h-4 text-[#B52A2A] transition-transform duration-200 ${
                    isVocabOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* ── Nhiệm vụ 2 & 3: Danh sách 5 Menu Con (Sub-items) ──────── */}
              {isVocabOpen && (
                <div className="space-y-1 pl-4 pt-1.5 animate-fade-in">
                  {VOCABULARY_SUB_ITEMS.map((sub) => {
                    // Kiểm tra active (hoặc nếu là /vocabulary mặc định thì active mục đầu tiên)
                    const isActive =
                      location.pathname === sub.path ||
                      (sub.path === '/vocabulary/daily' && location.pathname === '/vocabulary')

                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={`flex items-center px-3.5 py-2 text-sm transition-all duration-150 ${
                          isActive
                            ? 'bg-rose-50 text-[#B52A2A] font-medium rounded-xl shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 rounded-xl'
                        }`}
                      >
                        {/* Bullet point tròn: đỏ khi Active, xám nhạt khi Inactive */}
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 transition-colors ${
                            isActive ? 'bg-[#B52A2A]' : 'bg-slate-300'
                          }`}
                        />
                        <span>{sub.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Nhóm 3: Menu phụ luyện tập & thi thử */}
            <div className="pt-3">
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
                Luyện tập & Đánh giá
              </div>

              {SECONDARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-rose-50 text-[#B52A2A] font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#B52A2A]' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#B52A2A] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Bottom: User HSK Mini Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Mục tiêu hiện tại
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                HSK {user?.hskLevel || 1}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: '45%', backgroundColor: PRIMARY }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Đã hoàn thành 45%</span>
              <span className="font-medium text-slate-600">HSK {(user?.hskLevel || 1) + 1}</span>
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main Container (Header + Content Area) ───────────────────── */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile hamburger + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 hidden sm:inline">
                YiBi
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <h2 className="text-sm font-semibold text-slate-700">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Right: Streak badge & User Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-orange-600 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>3 ngày streak</span>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left focus:outline-none"
                aria-expanded={isDropdownOpen}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>

                {/* Username */}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.username || 'Học viên'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {user?.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Học viên'}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg border border-slate-100 py-1.5 z-50 animate-fade-in divide-y divide-slate-100">
                  {/* User info snippet */}
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-semibold text-slate-800">
                      {user?.username || 'Học viên'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || 'user@yibi.vn'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-[#B52A2A]">
                      <Sparkles className="w-3 h-3" /> HSK {user?.hskLevel || 1} Standard
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      Thông tin tài khoản
                    </Link>
                    {user?.role === 'ROLE_ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Trang quản trị (Admin)
                      </Link>
                    )}
                  </div>

                  {/* Logout Action */}
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Content Area (<Outlet />) ─────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
