import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlarmClock, ArrowRight, BookMarked, FileCheck, History, Keyboard, Languages, Layers, Lightbulb, Map as MapIcon, Mic, PenLine, Puzzle, Search, Shuffle } from 'lucide-react'

type Tip = { icon: React.ElementType; tint: string; title: string; body: string; link?: { to: string; label: string } }

const ROUTINE: Tip[] = [
  { icon: MapIcon, tint: 'bg-rose-100 text-brand', title: 'Bắt đầu từ Lộ trình', body: 'Mỗi ngày, học các mục trong kế hoạch hôm nay theo đúng thứ tự. Bài được mở lần lượt, vì bài sau dùng lại từ của bài trước.', link: { to: '/learning-path', label: 'Mở lộ trình' } },
  { icon: Layers, tint: 'bg-emerald-100 text-emerald-700', title: 'Ôn thẻ đến hạn trước khi học bài mới', body: 'Thẻ Flashcard đến hạn đúng lúc bạn sắp quên. Ôn ngay lúc đó giúp nhớ lâu hơn hẳn so với học dồn. Hãy tự đánh giá đúng mức nhớ của mình.', link: { to: '/flashcards', label: 'Ôn Flashcard' } },
  { icon: History, tint: 'bg-amber-100 text-amber-700', title: 'Đừng bỏ qua câu từng sai', body: 'Câu sai sẽ quay lại trong bài sau và trong mục Câu từng sai. Một câu chỉ được coi là đã thuộc khi bạn trả lời đúng 2 lần liên tiếp.', link: { to: '/learning-path/mistakes', label: 'Xem câu từng sai' } },
  { icon: Mic, tint: 'bg-sky-100 text-sky-700', title: 'Đọc to ở bước luyện nói', body: 'Nghe mẫu trước, rồi đọc cả câu với tốc độ tự nhiên ở nơi yên tĩnh. Sau khi chấm, bấm vào chữ màu đỏ để nghe mẫu, nghe lại giọng của bạn ngay tại đó, rồi đọc lại; chú ý thanh điệu thay vì đọc nhanh hơn.' },
  { icon: FileCheck, tint: 'bg-violet-100 text-violet-700', title: 'Thi thử để làm quen với đề trên máy', body: 'Khi đã học xong phần lớn một cấp, hãy làm đề mô phỏng có giờ và gõ tiếng Trung như khi thi thật. Điểm cao nhất được hiện ở Trang chủ.', link: { to: '/exams', label: 'Vào thi thử' } },
  { icon: Keyboard, tint: 'bg-slate-100 text-slate-700', title: 'Làm bài nhanh bằng bàn phím', body: 'Trên máy tính, nhấn phím 1–4 để chọn đáp án và Enter để đi tiếp. Tay không rời bàn phím, bạn sẽ học được nhiều câu hơn trong cùng số phút.' },
]

const MEMORY: Tip[] = [
  { icon: Puzzle, tint: 'bg-rose-100 text-brand', title: 'Tách chữ thành các phần có nghĩa', body: 'Nhiều chữ ghép từ những phần quen thuộc. Hãy tự kể một câu chuyện ngắn về chúng, câu chuyện càng lạ càng dễ nhớ.' },
  { icon: Lightbulb, tint: 'bg-amber-100 text-amber-700', title: 'Nhìn phần gợi âm', body: 'Một phần của chữ thường gợi cách đọc, phần còn lại gợi nghĩa. Biết một chữ, bạn đoán được cách đọc của cả nhóm chữ, nhưng nhớ kiểm tra lại thanh điệu.' },
  { icon: Languages, tint: 'bg-emerald-100 text-emerald-700', title: 'Tận dụng âm Hán Việt', body: 'Đây là lợi thế lớn của người Việt: rất nhiều từ tiếng Trung có âm và nghĩa gần với từ Hán Việt bạn đã biết.' },
  { icon: Shuffle, tint: 'bg-sky-100 text-sky-700', title: 'Học từ trong cụm, không học từ đơn lẻ', body: 'Nhớ cả cụm giúp bạn nhớ luôn cách dùng. Danh từ nên học cùng lượng từ của nó.' },
  { icon: AlarmClock, tint: 'bg-violet-100 text-violet-700', title: 'Ôn cách quãng, mỗi lần một ít', body: 'Mười lăm phút mỗi ngày hiệu quả hơn hai tiếng vào cuối tuần. Hãy thử nhớ lại trước khi lật thẻ, chính lúc cố nhớ là lúc trí nhớ được củng cố.' },
  { icon: PenLine, tint: 'bg-slate-100 text-slate-700', title: 'Viết tay và đọc thành tiếng', body: 'Khi học chữ khó, hãy viết vài lần theo đúng thứ tự nét và đọc thành tiếng cùng lúc. Mắt, tay và tai cùng làm việc sẽ giúp bạn nhớ chắc hơn.' },
]

/** Worked examples: what each memory tip looks like on real words. */
const EXAMPLES = [
  { title: 'Ghép nghĩa', rows: [['好', 'hǎo', 'tốt: 女 (nữ) + 子 (con), có mẹ có con là tốt'], ['明', 'míng', 'sáng: 日 (mặt trời) + 月 (mặt trăng)'], ['休', 'xiū', 'nghỉ: 人 (người) tựa vào 木 (cây)']] },
  { title: 'Cùng phần gợi âm 马 (mǎ)', rows: [['妈', 'mā', 'mẹ: thêm 女 (phụ nữ)'], ['吗', 'ma', 'trợ từ hỏi: thêm 口 (miệng)'], ['骂', 'mà', 'mắng: thêm hai 口 (miệng)']] },
  { title: 'Âm Hán Việt', rows: [['注意', 'zhùyì', 'chú ý'], ['时间', 'shíjiān', 'thời gian'], ['问题', 'wèntí', 'vấn đề']] },
  { title: 'Cặp dễ nhầm', rows: [['买', 'mǎi', 'mua: thanh 3'], ['卖', 'mài', 'bán: thanh 4, có thêm 十 ở trên'], ['一本书', 'yì běn shū', 'một quyển sách: học 书 cùng lượng từ 本']] },
]

const TipCard: React.FC<{ tip: Tip }> = ({ tip: { icon: Icon, tint, title, body, link } }) => (
  <article className="card-soft flex gap-4 p-5">
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tint}`}><Icon className="h-5 w-5" /></span>
    <div className="min-w-0">
      <h3 className="font-extrabold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
      {link && (
        <Link to={link.to} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
          {link.label}<ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  </article>
)

export const LearningTipsPage: React.FC = () => {
  const { hash } = useLocation()

  // A redirect from the old vocabulary tips address lands on its section, which the browser does not do by itself here.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
  <div className="mx-auto max-w-5xl space-y-8 pb-8">
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C8322B] to-[#8C1F1A] p-6 text-white sm:p-8">
      <span className="font-chinese pointer-events-none absolute -bottom-10 right-6 hidden select-none text-[11rem] font-bold leading-none text-white/[0.07] sm:block" aria-hidden="true">学</span>
      <h1 className="relative text-3xl font-extrabold tracking-tight">Mẹo học trên Yibi</h1>
      <p className="relative mt-2 max-w-xl text-sm font-medium text-white/90">Cách dùng website để học đều đặn mỗi ngày, cùng những mẹo nhớ từ vựng và chữ Hán lâu hơn.</p>
      <nav className="relative mt-5 flex flex-wrap gap-2" aria-label="Các phần của trang">
        <a href="#hoc-tren-web" className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold transition hover:bg-white/25">Học trên website</a>
        <a href="#nho-tu-vung" className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold transition hover:bg-white/25">Mẹo nhớ từ vựng</a>
      </nav>
    </header>

    <section id="hoc-tren-web" className="scroll-mt-20">
      <h2 className="text-xl font-extrabold text-slate-900">Học hiệu quả trên website</h2>
      <p className="mt-1 text-sm text-slate-500">Một buổi học tốt: ôn cái cũ trước, học cái mới sau.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {ROUTINE.map((tip) => <TipCard key={tip.title} tip={tip} />)}
      </div>
    </section>

    <section id="nho-tu-vung" className="scroll-mt-20">
      <h2 className="text-xl font-extrabold text-slate-900">Mẹo nhớ từ vựng</h2>
      <p className="mt-1 text-sm text-slate-500">Chọn vài mẹo hợp với bạn và thử ngay với các từ đang học.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {MEMORY.map((tip) => <TipCard key={tip.title} tip={tip} />)}
      </div>

      <h3 className="mt-8 text-lg font-extrabold text-slate-900">Ví dụ áp dụng</h3>
      <p className="mt-1 text-sm text-slate-500">Một số cách tách chữ ở đây là mẹo để dễ nhớ, không phải nguồn gốc chính xác của chữ.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {EXAMPLES.map(({ title, rows }) => (
          <article key={title} className="card-soft p-5">
            <h4 className="font-extrabold text-slate-900">{title}</h4>
            <ul className="mt-3 space-y-2.5">
              {rows.map(([hanzi, pinyin, note]) => (
                <li key={hanzi} className="flex items-baseline gap-3">
                  <span className="font-chinese shrink-0 text-xl font-bold text-slate-900">{hanzi}</span>
                  <span className="shrink-0 text-sm font-semibold text-brand">{pinyin}</span>
                  <span className="min-w-0 text-sm text-slate-600">{note}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>

    <section className="card-soft flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-extrabold text-slate-900">Thử ngay với từ mới</h2>
        <p className="mt-1 text-sm text-slate-500">Tra nghĩa, pinyin và ví dụ, hoặc học một từ mỗi ngày.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/vocabulary/search" className="btn-chunky btn-paper px-4 py-2.5 text-sm"><Search className="h-4 w-4" />Tra cứu từ vựng</Link>
        <Link to="/vocabulary/daily" className="btn-chunky btn-brand px-4 py-2.5 text-sm"><BookMarked className="h-4 w-4" />Từ vựng mỗi ngày</Link>
      </div>
    </section>
  </div>
  )
}
