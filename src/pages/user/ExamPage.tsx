import React from 'react'
import { FileCheck, Clock, Award, Play } from 'lucide-react'

export const ExamPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-800">Luyện Thi HSK Mock Test</h1>
        <p className="text-xs text-slate-400 mt-1">
          Hệ sinh thái đề thi mô phỏng định dạng kỳ thi chuẩn HSK (Nghe, Đọc, Viết).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Đề thi thử HSK 1 - Mã H10901', questions: '40 câu (Nghe + Đọc)', time: '35 phút', bestScore: '95/100', status: 'Đã hoàn thành' },
          { title: 'Đề thi thử HSK 1 - Mã H10902', questions: '40 câu (Nghe + Đọc)', time: '35 phút', bestScore: '--', status: 'Chưa làm' },
          { title: 'Đề thi thử HSK 2 - Mã H20901', questions: '60 câu (Nghe + Đọc)', time: '50 phút', bestScore: '--', status: 'Chưa làm' },
          { title: 'Đề thi thử HSK 2 - Mã H20902', questions: '60 câu (Nghe + Đọc)', time: '50 phút', bestScore: '--', status: 'Chưa làm' },
        ].map((exam, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#B52A2A]">Thi Chuẩn HSK</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  exam.status === 'Đã hoàn thành' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {exam.status}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{exam.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> {exam.questions}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.time}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Điểm cao nhất: <strong className="text-slate-700">{exam.bestScore}</strong></span>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-[#B52A2A] font-semibold hover:bg-rose-100 transition-colors">
                <Play className="w-3 h-3 fill-[#B52A2A]" /> Vào thi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
