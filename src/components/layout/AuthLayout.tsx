import React from 'react'

// ── Decorative Hanzi characters for the brand panel ──────────
const BRAND_HANZI = [
  { char: '学', top: '8%',  left: '10%', size: '7rem',  delay: '0s',   dur: '11s' },
  { char: '习', top: '20%', left: '72%', size: '5rem',  delay: '1.5s', dur: '9s'  },
  { char: '语', top: '45%', left: '5%',  size: '9rem',  delay: '0.8s', dur: '13s' },
  { char: '言', top: '62%', left: '68%', size: '6rem',  delay: '2.2s', dur: '10s' },
  { char: '文', top: '78%', left: '20%', size: '5.5rem',delay: '0.4s', dur: '12s' },
  { char: '化', top: '88%', left: '60%', size: '7.5rem',delay: '1.8s', dur: '8s'  },
  { char: '知', top: '35%', left: '82%', size: '4.5rem',delay: '3s',   dur: '14s' },
  { char: '道', top: '55%', left: '40%', size: '8rem',  delay: '1.2s', dur: '11s' },
]

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* ════════════════════════════════════════
          LEFT — Brand Panel (hidden on mobile)
          ════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #fdf6f0 0%, #f7ede8 40%, #f0e0dc 100%)' }}
      >
        {/* Decorative Hanzi — Noto Serif SC, very low opacity */}
        {BRAND_HANZI.map((h, i) => (
          <span
            key={i}
            className="font-chinese absolute select-none pointer-events-none font-black text-[#B52A2A]"
            style={{
              top: h.top,
              left: h.left,
              fontSize: h.size,
              opacity: 0.07,
              lineHeight: 1,
              // inline CSS custom properties for the keyframe animation
              ['--dur' as string]: h.dur,
              ['--delay' as string]: h.delay,
              ['--float-op' as string]: '0.07',
              animation: `float-slow ${h.dur} ease-in-out ${h.delay} infinite`,
            }}
          >
            {h.char}
          </span>
        ))}

        {/* Top — Logo mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: '#B52A2A' }}
            >
              <span className="font-chinese text-white font-black text-xl leading-none">易</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              Yi<span style={{ color: '#B52A2A' }}>bi</span>
            </span>
          </div>
        </div>

        {/* Center — Hero text */}
        <div className="relative z-10 space-y-6">
          {/* Large decorative character */}
          <div
            className="font-chinese font-black leading-none select-none"
            style={{ fontSize: 'clamp(5rem, 10vw, 8rem)', color: '#B52A2A', opacity: 0.18 }}
          >
            學
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-800 leading-snug">
              Hành trình <br />
              <span style={{ color: '#B52A2A' }}>khám phá</span> tiếng Trung
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-xs">
              Học theo lộ trình HSK được cá nhân hóa. Luyện phát âm với AI. 
              Chinh phục từng chữ Hán mỗi ngày.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 pt-2">
            {[
              { value: '10,000+', label: 'Từ vựng' },
              { value: 'HSK 1–6', label: 'Lộ trình' },
              { value: 'AI Tutor', label: 'Hỗ trợ' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-bold text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Quote */}
        <div className="relative z-10">
          <blockquote className="font-chinese text-slate-400 text-sm italic leading-relaxed">
            "活到老，学到老" — Học đến hơi thở cuối cùng
          </blockquote>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Form Panel
          ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col">
        {/* Mobile-only header */}
        <header className="lg:hidden flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#B52A2A' }}
          >
            <span className="font-chinese text-white font-black text-base leading-none">易</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">
            Yi<span style={{ color: '#B52A2A' }}>bi</span>
          </span>
        </header>

        {/* Scrollable form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-300 pb-6 px-4">
          © {new Date().getFullYear()} Yibi · Nền tảng học tiếng Trung thông minh
        </footer>
      </div>
    </div>
  )
}
