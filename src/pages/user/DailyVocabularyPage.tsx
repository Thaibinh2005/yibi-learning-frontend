import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Volume2,
  Star,
  Clock,
  Search,
  BookOpen,
  Check,
  Bell,
  Sparkles,
} from 'lucide-react'
import { getVocabularies } from '@/api/vocabularyApi'
import type { Vocabulary } from '@/types/vocabulary'

const PRIMARY = '#B52A2A'

// Interface đại diện cho từ vựng hiển thị chi tiết hôm nay
interface RichMeaning {
  id: number
  primary: string
  explanation?: string
  examples?: string
}

interface RichExample {
  sentence: string
  pinyin: string
  translation: string
}

interface DailyVocabItem {
  id: number
  hanzi: string
  pinyin: string
  hskLevel: number
  partOfSpeech: string
  tags?: string[]
  dateLabel: string
  imageUrl?: string
  meanings: RichMeaning[]
  examples: RichExample[]
}

// Dữ liệu mẫu giàu ngữ nghĩa cho từ tiêu biểu (chuẩn theo thiết kế tham chiếu)
const DEFAULT_TODAY_WORD: DailyVocabItem = {
  id: 1001,
  hanzi: '面',
  pinyin: 'miàn',
  hskLevel: 2,
  partOfSpeech: 'Danh từ',
  tags: ['Lượng từ'],
  dateLabel: 'Thứ Bảy, 17 tháng 10, 2026',
  imageUrl: '/images/vocab_surface_demo.jpg',
  meanings: [
    {
      id: 1,
      primary: 'bề mặt, mặt phẳng',
      explanation: 'chỉ phần phía trước hoặc bề ngoài của vật',
    },
    {
      id: 2,
      primary: 'mặt, phương diện',
      explanation: 'chỉ khía cạnh, lĩnh vực',
    },
    {
      id: 3,
      primary: 'mì, sợi mì',
      examples: 'vd: 面条 miàntiáo (mì sợi), 牛肉面 (mì bò), 方便面 (mì ăn liền)',
    },
    {
      id: 4,
      primary: 'bột mì',
      examples: 'vd: 面粉 miànfěn (bột mì)',
    },
  ],
  examples: [
    {
      sentence: '这个桌子的表面很光滑。',
      pinyin: 'zhè ge zhuō zi de biǎomiàn hěn guāng huá .',
      translation: 'Bề mặt cái bàn này rất trơn láng.',
    },
    {
      sentence: '他在很多方面都很优秀。',
      pinyin: 'tā zài hěn duō fāngmiàn dōu hěn yōuxiù .',
      translation: 'Anh ấy xuất sắc ở nhiều phương diện.',
    },
  ],
}

// Danh sách các từ của những ngày trước (theo thiết kế tham chiếu)
const INITIAL_PREVIOUS_DAYS: DailyVocabItem[] = [
  {
    id: 1002,
    hanzi: '下边',
    pinyin: 'xiàbian',
    hskLevel: 1,
    partOfSpeech: 'Danh từ',
    dateLabel: '16 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'bên dưới, phía dưới',
        explanation: 'chỉ vị trí ở tầng dưới hoặc phía sau',
      },
    ],
    examples: [
      {
        sentence: '书在桌子下边。',
        pinyin: 'shū zài zhuōzi xiàbian .',
        translation: 'Sách ở dưới bàn.',
      },
    ],
  },
  {
    id: 1003,
    hanzi: '背心',
    pinyin: 'bèixīn',
    hskLevel: 3,
    partOfSpeech: 'Danh từ',
    dateLabel: '15 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'áo ba lỗ, áo không tay',
        explanation: 'loại áo may không có tay mặc mùa hè',
      },
    ],
    examples: [
      {
        sentence: '夏天他喜欢穿背心。',
        pinyin: 'xiàtiān tā xǐhuan chuān bèixīn .',
        translation: 'Mùa hè anh ấy thích mặc áo ba lỗ.',
      },
    ],
  },
  {
    id: 1004,
    hanzi: '滑',
    pinyin: 'huá',
    hskLevel: 3,
    partOfSpeech: 'Tính từ',
    dateLabel: '14 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'trơn, trượt',
        explanation: 'bề mặt nhẵn bóng dễ trượt ngã',
      },
    ],
    examples: [
      {
        sentence: '下雨天地很滑，走路要小心。',
        pinyin: 'xiàyǔ tiān dì hěn huá, zǒulù yào xiǎoxīn .',
        translation: 'Trời mưa đất rất trơn, đi đứng phải cẩn thận.',
      },
    ],
  },
  {
    id: 1005,
    hanzi: '泪水',
    pinyin: 'lèishuǐ',
    hskLevel: 3,
    partOfSpeech: 'Danh từ',
    dateLabel: '13 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'nước mắt',
        explanation: 'chất lỏng chảy ra từ khóe mắt khi khóc hoặc xúc động',
      },
    ],
    examples: [
      {
        sentence: '她的眼里含着泪水。',
        pinyin: 'tā de yǎn lǐ hán zhe lèishuǐ .',
        translation: 'Trong mắt cô ấy ngân ngấn nước mắt.',
      },
    ],
  },
  {
    id: 1006,
    hanzi: '适合',
    pinyin: 'shìhé',
    hskLevel: 3,
    partOfSpeech: 'Động từ',
    dateLabel: '12 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'phù hợp, thích hợp',
        explanation: 'vừa vặn, hợp với nhu cầu hoặc hoàn cảnh',
      },
    ],
    examples: [
      {
        sentence: '这件衣服很适合你。',
        pinyin: 'zhè jiàn yīfu hěn shìhé nǐ .',
        translation: 'Bộ quần áo này rất hợp với bạn.',
      },
    ],
  },
  {
    id: 1007,
    hanzi: '听讲',
    pinyin: 'tīngjiǎng',
    hskLevel: 2,
    partOfSpeech: 'Động từ',
    dateLabel: '11 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'nghe giảng',
        explanation: 'chú ý lắng nghe bài giảng trên lớp',
      },
    ],
    examples: [
      {
        sentence: '上课要认真听讲。',
        pinyin: 'shàngkè yào rènzhēn tīngjiǎng .',
        translation: 'Trong giờ học phải chăm chú nghe giảng.',
      },
    ],
  },
  {
    id: 1008,
    hanzi: '车',
    pinyin: 'chē',
    hskLevel: 1,
    partOfSpeech: 'Danh từ',
    dateLabel: '10 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'xe, phương tiện',
        explanation: 'phương tiện giao thông có bánh di chuyển',
      },
    ],
    examples: [
      {
        sentence: '这是谁的车？',
        pinyin: 'zhè shì shéi de chē ?',
        translation: 'Đây là xe của ai?',
      },
    ],
  },
  {
    id: 1009,
    hanzi: '途径',
    pinyin: 'tújìng',
    hskLevel: 4,
    partOfSpeech: 'Danh từ',
    dateLabel: '9 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'con đường, phương tiện, kênh',
        explanation: 'cách thức hoặc con đường đạt được mục tiêu',
      },
    ],
    examples: [
      {
        sentence: '学习是获取知识的重要途径。',
        pinyin: 'xuéxí shì huòqǔ zhīshi de zhòngyào tújìng .',
        translation: 'Học tập là con đường quan trọng để tích lũy tri thức.',
      },
    ],
  },
  {
    id: 1010,
    hanzi: '逻辑',
    pinyin: 'luóji',
    hskLevel: 4,
    partOfSpeech: 'Danh từ',
    dateLabel: '8 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'logic',
        explanation: 'tính quy luật, logic trong tư duy và lập luận',
      },
    ],
    examples: [
      {
        sentence: '他的讲话很有逻辑。',
        pinyin: 'tā de jiǎnghuà hěn yǒu luóji .',
        translation: 'Bài nói của anh ấy rất có logic.',
      },
    ],
  },
  {
    id: 1011,
    hanzi: '暑假',
    pinyin: 'shǔjià',
    hskLevel: 2,
    partOfSpeech: 'Danh từ',
    dateLabel: '7 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'kỳ nghỉ hè',
        explanation: 'khoảng thời gian nghỉ hè của học sinh, sinh viên',
      },
    ],
    examples: [
      {
        sentence: '今年暑假你打算去哪儿？',
        pinyin: 'jīnnián shǔjià nǐ dǎsuàn qù nǎr ?',
        translation: 'Kỳ nghỉ hè năm nay bạn định đi đâu?',
      },
    ],
  },
  {
    id: 1012,
    hanzi: '牛',
    pinyin: 'niú',
    hskLevel: 1,
    partOfSpeech: 'Danh từ',
    dateLabel: '6 tháng 10, 2026',
    meanings: [
      {
        id: 1,
        primary: 'bò, trâu',
        explanation: 'loài động vật ăn cỏ có sừng',
      },
    ],
    examples: [
      {
        sentence: '草地上有几头牛。',
        pinyin: 'cǎodì shang yǒu jǐ tóu niú .',
        translation: 'Trên đồng cỏ có mấy con bò.',
      },
    ],
  },
]

export const DailyVocabularyPage: React.FC = () => {
  // Từ vựng đang được chọn hiển thị ở cột bên trái (mặc định là từ hôm nay)
  const [selectedWord, setSelectedWord] = useState<DailyVocabItem>(DEFAULT_TODAY_WORD)
  // Danh sách từ vựng những ngày trước
  const [previousDays, setPreviousDays] = useState<DailyVocabItem[]>(INITIAL_PREVIOUS_DAYS)

  // Trạng thái đã lưu vào sổ tay
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Tải thêm từ vựng thực tế từ Database để làm phong phú danh sách ngày trước
  useEffect(() => {
    const fetchMoreFromDb = async () => {
      try {
        const res = await getVocabularies({ page: 0, size: 20 })
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Gộp các từ từ CSDL vào danh sách ngày trước (nếu chưa có)
          const dbItems: DailyVocabItem[] = res.data.map((v: Vocabulary, index: number) => {
            const rawMeanings = v.meaningVi ? v.meaningVi.split(/[,;]/).map((s) => s.trim()) : [v.hanzi]
            const meanings: RichMeaning[] = rawMeanings.map((m, idx) => ({
              id: idx + 1,
              primary: m,
            }))

            const exSentence = v.exampleSentence || (v.examples && v.examples[0]?.sentence) || ''
            const exPinyin = v.examplePinyin || (v.examples && v.examples[0]?.pinyin) || ''
            const exTrans = (v.examples && v.examples[0]?.translation) || ''

            const examples: RichExample[] = exSentence
              ? [
                  {
                    sentence: exSentence,
                    pinyin: exPinyin,
                    translation: exTrans,
                  },
                ]
              : []

            return {
              id: v.id + 2000,
              hanzi: v.hanzi,
              pinyin: v.pinyin,
              hskLevel: v.hskLevel || 1,
              partOfSpeech: v.partOfSpeech || 'Từ vựng',
              dateLabel: `${Math.max(1, 5 - index)} tháng 10, 2026`,
              meanings,
              examples,
            }
          })

          // Giữ các từ mẫu ban đầu và nối thêm các từ từ DB
          const existingHanzis = new Set(INITIAL_PREVIOUS_DAYS.map((w) => w.hanzi))
          const filteredDbItems = dbItems.filter((w) => !existingHanzis.has(w.hanzi) && w.hanzi !== '面')
          setPreviousDays([...INITIAL_PREVIOUS_DAYS, ...filteredDbItems.slice(0, 5)])
        }
      } catch (err) {
        console.warn('Could not fetch DB vocabularies for history:', err)
      }
    }

    fetchMoreFromDb()
  }, [])

  // Phát âm chữ Hán qua Web Speech API
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  // Lưu từ vào sổ tay cá nhân
  const handleToggleSave = () => {
    setIsSaved(!isSaved)
    const msg = !isSaved ? 'Đã lưu vào sổ tay từ vựng!' : 'Đã xóa khỏi sổ tay'
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Toast Thông Báo Nhẹ ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Tiêu Đề Trang ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Từ vựng tiếng Trung hôm nay
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Mỗi ngày một từ mới theo giáo trình HSK, đổi lúc 0 giờ (giờ Việt Nam). Nghe phát âm,
          đọc ví dụ rồi lưu vào sổ tay để ôn theo lịch lặp lại ngắt quãng.
        </p>
      </div>

      {/* ── Bố Cục 2 Cột: Từ Vựng Hôm Nay & Danh Sách Ngày Trước ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Cột Trái (Chi Tiết Từ Vựng Hôm Nay) — Chiếm 8/12 cột ─── */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Dòng Header thẻ: Badges & Ngày tháng */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-[#B52A2A] border border-rose-100">
                HSK {selectedWord.hskLevel}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {selectedWord.partOfSpeech}
              </span>
              {selectedWord.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="text-xs text-slate-400 font-medium">
              {selectedWord.dateLabel}
            </div>
          </div>

          {/* Khối Chữ Hán Lớn, Pinyin & Hình Ảnh Minh Họa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              {/* Chữ Hán siêu lớn */}
              <div
                className="text-6xl sm:text-7xl font-bold text-slate-900 tracking-wide font-chinese select-none"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                {selectedWord.hanzi}
              </div>

              {/* Phiên âm Pinyin */}
              <div className="text-2xl font-medium text-slate-500 mt-2 tracking-wide font-mono">
                {selectedWord.pinyin}
              </div>

              {/* Nút bấm nghe phát âm & Lưu sổ tay */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => handleSpeak(selectedWord.hanzi)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-[#B52A2A] text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Nghe phát âm chuẩn giọng Bắc Kinh"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isSaved
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isSaved ? 'Đã lưu vào sổ tay' : 'Lưu vào sổ tay từ vựng'}
                >
                  <Star className={`w-5 h-5 ${isSaved ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Hình ảnh minh họa (nếu có) */}
            {selectedWord.imageUrl && (
              <div className="w-40 h-28 sm:w-48 sm:h-34 rounded-2xl overflow-hidden border border-slate-100 shadow-xs shrink-0 bg-slate-50">
                <img
                  src={selectedWord.imageUrl}
                  alt={selectedWord.hanzi}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Mục NGHĨA (Đánh số thứ tự 1, 2, 3...) */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              NGHĨA
            </h3>

            <div className="space-y-3">
              {selectedWord.meanings.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <span className="text-sm font-bold text-slate-800 w-4 shrink-0 mt-0.5">
                    {m.id}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-slate-800 leading-snug">
                      {m.primary}
                    </span>
                    {m.explanation && (
                      <p className="text-xs text-slate-500 mt-0.5 italic">
                        {m.explanation}
                      </p>
                    )}
                    {m.examples && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        {m.examples}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mục CÂU VÍ DỤ */}
          {selectedWord.examples.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                CÂU VÍ DỤ
              </h3>

              <div className="space-y-3">
                {selectedWord.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex items-start gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <button
                      onClick={() => handleSpeak(ex.sentence)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 hover:text-[#B52A2A] text-slate-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors shadow-2xs cursor-pointer"
                      title="Nghe câu ví dụ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <p
                        className="text-sm sm:text-base font-medium text-slate-800 font-chinese"
                        style={{ fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {ex.sentence}
                      </p>
                      <p className="text-xs text-slate-400 font-mono tracking-wide">
                        {ex.pinyin}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {ex.translation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thanh Nút Bấm Cuối Card */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
            <Link
              to="/vocabulary/search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#B52A2A] transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Tra từ điển</span>
            </Link>

            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#B52A2A] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Học giáo trình HSK {selectedWord.hskLevel}</span>
            </Link>
          </div>
        </div>

        {/* ── Cột Phải (Những Ngày Trước) — Chiếm 4/12 cột ─────────── */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs sticky top-20 space-y-4">
          {/* Header Cột Phải */}
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Những ngày trước</span>
          </div>

          {/* Danh Sách Từ Vựng Các Ngày Trước */}
          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto pr-1">
            {previousDays.map((item) => {
              const isCurrent = selectedWord.id === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedWord(item)}
                  className={`group flex items-start justify-between py-3 px-2.5 rounded-xl cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-rose-50/70 border border-rose-100'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Chữ Hán bên trái */}
                  <div
                    className={`text-xl sm:text-2xl font-bold font-chinese tracking-wide shrink-0 transition-colors ${
                      isCurrent
                        ? 'text-[#B52A2A]'
                        : 'text-slate-800 group-hover:text-[#B52A2A]'
                    }`}
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {item.hanzi}
                  </div>

                  {/* Thông tin nghĩa, Pinyin và ngày tháng bên phải */}
                  <div className="flex-1 ml-4 text-left">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 leading-snug">
                      {item.meanings[0]?.primary || item.hanzi}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.pinyin} · {item.dateLabel}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Khung Thông Báo Nhỏ Chân Cột Phải */}
          <div className="bg-rose-50/60 border border-rose-100/80 rounded-xl p-3 text-[11px] text-slate-600 text-center leading-relaxed flex items-center justify-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[#B52A2A] shrink-0" />
            <span>Bật thông báo để nhận từ mới mỗi sáng lúc 0 giờ.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
