/** Teaching content for the pinyin and stroke-order tabs: tones, sandhi, initials, finals, spelling and stroke rules. */

export type Tone = 1 | 2 | 3 | 4 | 5

export interface ToneInfo {
  tone: Tone
  mark: string
  name: string
  hint: string
  /** Pitch contour on a 1-5 scale: the start, the lowest or middle point, the end. */
  contour: Array<[number, number]>
  example: { pinyin: string; hanzi: string; meaning: string }
}

export const TONES: ToneInfo[] = [
  { tone: 1, mark: 'ā', name: 'Thanh 1 · thanh ngang', hint: 'Cao và bằng, kéo dài. Giữ giọng cao như hát một nốt.', contour: [[0, 5], [1, 5]], example: { pinyin: 'bā', hanzi: '八', meaning: 'tám' } },
  { tone: 2, mark: 'á', name: 'Thanh 2 · thanh sắc', hint: 'Từ mức trung bình đi lên cao, như khi hỏi "hả?".', contour: [[0, 3], [1, 5]], example: { pinyin: 'bá', hanzi: '拔', meaning: 'nhổ' } },
  { tone: 3, mark: 'ǎ', name: 'Thanh 3 · xuống rồi lên', hint: 'Hạ thấp rồi vòng lên. Gần giống dấu hỏi nhưng sâu hơn.', contour: [[0, 2], [0.35, 1], [1, 4]], example: { pinyin: 'bǎ', hanzi: '把', meaning: 'cầm' } },
  { tone: 4, mark: 'à', name: 'Thanh 4 · thanh rơi', hint: 'Từ cao rơi nhanh xuống thấp, dứt khoát như ra lệnh.', contour: [[0, 5], [1, 1]], example: { pinyin: 'bà', hanzi: '爸', meaning: 'bố' } },
]

export const NEUTRAL_TONE = {
  name: 'Thanh nhẹ',
  hint: 'Đọc ngắn, nhẹ, không có dấu, thường ở âm tiết cuối của từ như 吧, 的, 们.',
  example: { pinyin: 'ba', hanzi: '吧' },
}

export interface SandhiRule {
  id: string
  title: string
  summary: string
  /** Each line: the syllables as written, an arrow, then as read. */
  examples: Array<{ written: Array<[string, string]>; read: Array<[string, string]> }>
  more?: string
}

/** Pairs are [hanzi, pinyin]. */
export const SANDHI_RULES: SandhiRule[] = [
  {
    id: 'third-third',
    title: 'Hai thanh 3 đi liền nhau',
    summary: 'Âm tiết đầu đọc thành thanh 2, âm tiết sau giữ thanh 3.',
    examples: [{ written: [['你', 'nǐ'], ['好', 'hǎo']], read: [['你', 'ní'], ['好', 'hǎo']] }],
    more: 'Ba thanh 3 liền nhau: chia nhóm theo nghĩa. 展览馆 đọc zhán lán guǎn (2+1), 我很好 đọc wǒ hén hǎo (1+2).',
  },
  {
    id: 'half-third',
    title: 'Nửa thanh 3',
    summary: 'Thanh 3 trước thanh 1, 2, 4 hoặc thanh nhẹ chỉ đọc nửa đầu: trầm, đi xuống, không vòng lên.',
    examples: [{ written: [['老', 'lǎo'], ['师', 'shī']], read: [['老', 'lǎo'], ['师', 'shī']] }, { written: [['北', 'běi'], ['京', 'jīng']], read: [['北', 'běi'], ['京', 'jīng']] }],
  },
  {
    id: 'bu',
    title: 'Chữ 不 (bù)',
    summary: 'Đứng trước thanh 4 thì đổi thành thanh 2 (bú). Còn lại giữ thanh 4.',
    examples: [{ written: [['不', 'bù'], ['是', 'shì']], read: [['不', 'bú'], ['是', 'shì']] }],
    more: 'Giữ nguyên: 不吃 bù chī, 不好 bù hǎo. Giữa hai từ lặp, đọc thanh nhẹ: 好不好 hǎo bu hǎo.',
  },
  {
    id: 'yi',
    title: 'Chữ 一 (yī)',
    summary: 'Trước thanh 4 đổi thành thanh 2 (yí). Trước thanh 1, 2, 3 đổi thành thanh 4 (yì). Đứng một mình, đếm số, số thứ tự hoặc cuối từ thì giữ thanh 1.',
    examples: [{ written: [['一', 'yī'], ['个', 'gè']], read: [['一', 'yí'], ['个', 'gè']] }, { written: [['一', 'yī'], ['天', 'tiān']], read: [['一', 'yì'], ['天', 'tiān']] }],
    more: 'Giữ thanh 1: 第一 dì yī, 一二三 yī èr sān. Giữa động từ lặp, đọc thanh nhẹ: 看一看 kàn yi kàn.',
  },
  {
    id: 'aa',
    title: 'Tính từ lặp (AA)',
    summary: 'Với một số tính từ đơn âm tiết, âm tiết thứ hai có thể đọc thành thanh 1 kèm uốn lưỡi (er) trong khẩu ngữ miền Bắc.',
    examples: [{ written: [['慢', 'màn'], ['慢', 'màn']], read: [['慢', 'màn'], ['慢', 'mār']] }, { written: [['好', 'hǎo'], ['好', 'hǎo']], read: [['好', 'hǎo'], ['好', 'hāor']] }],
  },
]

export interface SoundGroup {
  id: string
  title: string
  sounds: Array<{ letter: string; like?: string }>
}

/** `like` is a rough Vietnamese comparison, only a memory aid. */
export const INITIAL_GROUPS: SoundGroup[] = [
  { id: 'lips', title: 'Hai môi và răng môi', sounds: [{ letter: 'b', like: 'pua' }, { letter: 'p', like: 'pua, bật hơi' }, { letter: 'm', like: 'mua' }, { letter: 'f', like: 'phua' }] },
  { id: 'tongue-tip', title: 'Đầu lưỡi', sounds: [{ letter: 'd', like: 'tưa' }, { letter: 't', like: 'thưa, bật hơi' }, { letter: 'n', like: 'nưa' }, { letter: 'l', like: 'lưa' }] },
  { id: 'tongue-root', title: 'Cuống lưỡi', sounds: [{ letter: 'g', like: 'cưa' }, { letter: 'k', like: 'khưa, bật hơi' }, { letter: 'h', like: 'hưa' }] },
  { id: 'tongue-face', title: 'Mặt lưỡi', sounds: [{ letter: 'j', like: 'chi' }, { letter: 'q', like: 'chi, bật hơi' }, { letter: 'x', like: 'xi' }] },
  { id: 'tongue-front', title: 'Đầu lưỡi trước', sounds: [{ letter: 'z', like: 'chư' }, { letter: 'c', like: 'chư, bật hơi' }, { letter: 's', like: 'xư' }] },
  { id: 'retroflex', title: 'Đầu lưỡi sau (uốn lưỡi)', sounds: [{ letter: 'zh', like: 'trư' }, { letter: 'ch', like: 'trư, bật hơi' }, { letter: 'sh', like: 'sư' }, { letter: 'r', like: 'rư' }] },
]

export const INITIALS: string[] = INITIAL_GROUPS.flatMap((g) => g.sounds.map((s) => s.letter))

export const FINAL_GROUPS: SoundGroup[] = [
  { id: 'simple', title: 'Vận mẫu đơn', sounds: ['a', 'o', 'e', 'i', 'u', 'ü'].map((letter) => ({ letter })) },
  { id: 'compound', title: 'Vận mẫu kép', sounds: ['ai', 'ei', 'ao', 'ou', 'ia', 'ie', 'iao', 'iu', 'ua', 'uo', 'uai', 'ui', 'üe'].map((letter) => ({ letter })) },
  { id: 'nasal', title: 'Vận mẫu mũi', sounds: ['an', 'en', 'ang', 'eng', 'ong', 'ian', 'in', 'iang', 'ing', 'iong', 'uan', 'un', 'uang', 'ueng', 'üan', 'ün'].map((letter) => ({ letter })) },
  { id: 'retroflex', title: 'Vận mẫu uốn lưỡi', sounds: [{ letter: 'er', like: 'không ghép thanh mẫu' }] },
]

export const FINALS: string[] = FINAL_GROUPS.flatMap((g) => g.sounds.map((s) => s.letter))

export interface SpellingRule {
  id: string
  title: string
  chips: string[]
  note?: string
}

export const SPELLING_RULES: SpellingRule[] = [
  { id: 'i-null', title: 'i sau z, c, s, zh, ch, sh, r đọc gần như "ư"', chips: ['zi', 'ci', 'si', 'zhi', 'chi', 'shi', 'ri'] },
  { id: 'u-umlaut', title: 'ü bỏ hai chấm sau j, q, x; giữ sau n, l', chips: ['ju', 'qu', 'xu', 'nǚ', 'lǜ'], note: 'ju, qu, xu thực chất là jü, qü, xü. nǚ (nữ) khác nǔ (nỗ lực).' },
  { id: 'y-w', title: 'Đứng một mình: thêm y hoặc w', chips: ['i → yi', 'u → wu', 'ü → yu', 'üe → yue'] },
  { id: 'short', title: 'Rút gọn khi có thanh mẫu', chips: ['iou → iu · liù', 'uei → ui · duì', 'uen → un · chūn'], note: 'Viết tắt nhưng khi đọc vẫn có âm giữa.' },
]

export interface StrokeRule {
  id: string
  title: string
  examples: string
}

/** The eight stroke-order rules, in the order they are taught. */
export const STROKE_RULES: StrokeRule[] = [
  { id: 'horizontal-first', title: 'Ngang trước, sổ sau', examples: '十' },
  { id: 'left-falling-first', title: 'Phẩy trước, mác sau', examples: '人' },
  { id: 'top-first', title: 'Trên trước, dưới sau', examples: '三' },
  { id: 'left-first', title: 'Trái trước, phải sau', examples: '你' },
  { id: 'outside-first', title: 'Ngoài trước, trong sau', examples: '月' },
  { id: 'enclose-last', title: 'Vào nhà trước, đóng cửa sau', examples: '国' },
  { id: 'middle-first', title: 'Giữa trước, hai bên sau', examples: '小' },
  { id: 'dot', title: 'Nét chấm: ở trên viết trước, ở trong hoặc bên phải viết sau', examples: '主 玉' },
]
