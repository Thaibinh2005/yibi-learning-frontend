import React from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import {
  BookOpen,
  GraduationCap,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react'

const PRIMARY = '#B52A2A'

export const DashboardPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user)
  const username = user?.username || 'Bạn'

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner Card ────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* Subtle decorative background Hanzi */}
        <div
          className="absolute -right-6 -bottom-8 select-none pointer-events-none text-slate-100 font-bold text-9xl leading-none opacity-60 font-chinese"
          style={{ fontFamily: "'Noto Serif SC', serif" }}
        >
          学
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#B52A2A] border border-rose-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>YiBi AI Chinese Learning Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Chào mừng <span style={{ color: PRIMARY }}>{username}</span> đến với YiBi!
          </h1>

          <p className="text-sm text-slate-500 leading-relaxed">
            “千里之行，始于足下” — Hành trình vạn dặm bắt đầu từ một bước chân. Hãy tiếp tục duy trì thói quen học tiếng Trung mỗi ngày để đạt mục tiêu HSK nhé!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm active:scale-95"
              style={{ backgroundColor: PRIMARY }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9e2424')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
            >
              <BookOpen className="w-4 h-4" />
              Tiếp tục bài học
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/flashcards"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              Ôn 12 từ SRS hôm nay
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: HSK Level */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cấp độ hiện tại</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              HSK {user?.hskLevel || 1}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mục tiêu tiếp theo: HSK {(user?.hskLevel || 1) + 1}
            </p>
          </div>
        </div>

        {/* Metric 2: Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chuỗi ngày học</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">3 ngày</div>
            <p className="text-xs text-slate-400 mt-1">Duy trì liên tục để nhận huy hiệu</p>
          </div>
        </div>

        {/* Metric 3: SRS Flashcards */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Từ vựng cần ôn</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">12 từ vựng</div>
            <p className="text-xs text-slate-400 mt-1">Thuật toán lặp lại ngắt quãng SM-2</p>
          </div>
        </div>

        {/* Metric 4: Exam Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Điểm thi thử cao nhất</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">95 / 100</div>
            <p className="text-xs text-slate-400 mt-1">Đề HSK 1 Mẫu số 01 (Đạt)</p>
          </div>
        </div>
      </div>

      {/* ── Feature Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Khóa học */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#B52A2A]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Khóa học HSK Chuẩn
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lộ trình bài học theo giáo trình chuẩn HSK với chữ Hán, Pinyin, nghĩa tiếng Việt và audio giọng Bắc Kinh.
            </p>
          </div>
          <Link
            to="/courses"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B52A2A] hover:underline"
          >
            Vào học ngay <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Ôn tập Flashcard SRS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Flashcard Thuật Toán SRS
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ghi nhớ từ vựng thông minh bằng SuperMemo SM-2. Tự động tính toán chu kỳ lặp lại giúp nhớ lâu không quên.
            </p>
          </div>
          <Link
            to="/flashcards"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
          >
            Bắt đầu ôn tập <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Thi thử trực tuyến */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Thi Thử HSK Thực Chiến
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mô phỏng kỳ thi HSK thật với đồng hồ đếm ngược, phần nghe Audio chuẩn và chấm điểm tức thì.
            </p>
          </div>
          <Link
            to="/exams"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            Làm bài thi thử <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
