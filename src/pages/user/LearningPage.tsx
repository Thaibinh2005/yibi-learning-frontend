import React from 'react'
import { BookOpen, CheckCircle, Clock } from 'lucide-react'

export const LearningPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-800">Lộ Trình Khóa Học HSK</h1>
        <p className="text-xs text-slate-400 mt-1">
          Hệ thống bài học chuẩn khung giáo trình HSK quốc tế kết hợp phát âm AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Bài 1: Chào hỏi cơ bản (问候)', desc: 'Làm quen với 你好, 谢谢, 再见 và ngữ điệu thanh điệu cơ bản.', duration: '25 phút', status: 'Đã hoàn thành' },
          { title: 'Bài 2: Giới thiệu bản thân (自我介绍)', desc: 'Học cách xưng hô, hỏi tên và quốc tịch: 我叫..., 我是...', duration: '30 phút', status: 'Đang học' },
          { title: 'Bài 3: Gia đình & Bạn bè (家庭与朋友)', desc: 'Từ vựng về người thân trong gia đình, đếm số từ 1 - 10.', duration: '35 phút', status: 'Chưa mở' },
          { title: 'Bài 4: Thời gian & Ngày tháng (时间与日期)', desc: 'Cách nói giờ giấc, các ngày trong tuần và lịch trình sinh hoạt.', duration: '40 phút', status: 'Chưa mở' },
        ].map((lesson, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#B52A2A]">Cấp độ HSK 1</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  lesson.status === 'Đã hoàn thành' ? 'bg-emerald-50 text-emerald-600' :
                  lesson.status === 'Đang học' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {lesson.status}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{lesson.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{lesson.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.duration}</span>
              <button className="font-semibold text-[#B52A2A] hover:underline">Vào học</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
