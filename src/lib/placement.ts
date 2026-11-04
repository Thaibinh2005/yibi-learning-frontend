/** Skills the placement test measures, in the order the journey panel and the result show them. */
export const PLACEMENT_SKILLS: { skill: string; label: string }[] = [
  { skill: 'vocabulary', label: 'Từ vựng' },
  { skill: 'characters', label: 'Chữ Hán' },
  { skill: 'grammar', label: 'Ngữ pháp' },
  { skill: 'listening', label: 'Nghe hiểu' },
  { skill: 'reading', label: 'Đọc hiểu' },
  { skill: 'writing', label: 'Viết câu' },
  { skill: 'speaking', label: 'Phát âm' },
]

export const skillLabel = (skill: string) =>
  PLACEMENT_SKILLS.find((s) => s.skill === skill)?.label ?? skill

/** The survey's level cards; `value` is what the backend stores (7 stands for the whole 7-9 band). */
export const SURVEY_LEVELS: { value: number; tag: string; sub: string; title: string; description: string }[] = [
  { value: 0, tag: '0', sub: 'CHƯA', title: 'Chưa biết gì về tiếng Trung', description: 'Mới bắt đầu, chưa đọc được chữ Hán hay pinyin.' },
  { value: 1, tag: 'HSK', sub: '1', title: 'Chào hỏi, giới thiệu bản thân, đếm số', description: 'Hiểu và nói được những câu rất ngắn, rất quen thuộc.' },
  { value: 2, tag: 'HSK', sub: '2', title: 'Nói về gia đình, giờ giấc, mua sắm đơn giản', description: 'Giao tiếp được những tình huống quen thuộc hằng ngày.' },
  { value: 3, tag: 'HSK', sub: '3', title: 'Trò chuyện về sinh hoạt, đọc văn bản ngắn', description: 'Kể chuyện đơn giản, đọc hiểu đoạn văn quen thuộc.' },
  { value: 4, tag: 'HSK', sub: '4', title: 'Trao đổi khá trôi chảy về nhiều chủ đề', description: 'Thảo luận được chủ đề quen thuộc, đọc bài báo ngắn.' },
  { value: 5, tag: 'HSK', sub: '5', title: 'Đọc báo, xem phim có phụ đề tiếng Trung', description: 'Diễn đạt trôi chảy, hiểu nội dung khá phức tạp.' },
  { value: 6, tag: 'HSK', sub: '6', title: 'Hiểu hầu hết nội dung, kể cả chủ đề trừu tượng', description: 'Đọc tài liệu dài, tham gia thảo luận chuyên sâu.' },
  { value: 7, tag: 'HSK', sub: '7–9', title: 'Dùng tiếng Trung thành thạo trong học thuật, công việc', description: 'Gần với người bản ngữ ở cả bốn kỹ năng.' },
]
