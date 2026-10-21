import React from 'react'
import { Layers, RotateCw, Volume2 } from 'lucide-react'

export const FlashcardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Luyện Flashcard (SRS)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ghi nhớ ngắt quãng theo thuật toán SuperMemo SM-2.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 text-[#B52A2A]">
            12 từ cần ôn hôm nay
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto my-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center space-y-6">
          <div className="flex items-center justify-between w-full text-xs text-slate-400">
            <span>Thẻ 1 / 12</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">HSK 1</span>
          </div>

          <div className="py-8">
            <span
              className="text-6xl font-bold text-slate-900 font-chinese tracking-wide"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              苹果
            </span>
            <p className="text-lg font-semibold text-[#B52A2A] mt-3">píngguǒ</p>
            <p className="text-sm text-slate-500 mt-1">Quả táo</p>
          </div>

          <div className="w-full flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
              Chưa thuộc (1 ngày)
            </button>
            <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              Khó (3 ngày)
            </button>
            <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
              Đã thuộc (6 ngày)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
