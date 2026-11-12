/** The 214 Kangxi radicals, in stroke-count order: simple first, hard last. */
export interface Radical {
  /** The Kangxi form, as printed in dictionaries. */
  char: string
  strokes: number
  pinyin: string
  /** Hán Việt name. */
  hanViet: string
  meaning: string
  /** The form this radical takes inside other characters, or its simplified form. */
  alt?: string
}

type Row = [char: string, pinyin: string, hanViet: string, meaning: string, alt?: string]

const BY_STROKES: Array<[number, Row[]]> = [
  [1, [
    ['一', 'yī', 'Nhất', 'số một'], ['丨', 'gǔn', 'Cổn', 'nét sổ'], ['丶', 'zhǔ', 'Chủ', 'nét chấm'],
    ['丿', 'piě', 'Phiệt', 'nét phẩy'], ['乙', 'yǐ', 'Ất', 'can thứ hai', '乚'], ['亅', 'jué', 'Quyết', 'nét sổ móc'],
  ]],
  [2, [
    ['二', 'èr', 'Nhị', 'số hai'], ['亠', 'tóu', 'Đầu', 'cái nắp'], ['人', 'rén', 'Nhân', 'người', '亻'],
    ['儿', 'ér', 'Nhi', 'chân người'], ['入', 'rù', 'Nhập', 'đi vào'], ['八', 'bā', 'Bát', 'số tám'],
    ['冂', 'jiōng', 'Quynh', 'vùng biên giới'], ['冖', 'mì', 'Mịch', 'trùm lên'], ['冫', 'bīng', 'Băng', 'nước đá'],
    ['几', 'jī', 'Kỷ', 'cái ghế'], ['凵', 'kǎn', 'Khảm', 'há miệng'], ['刀', 'dāo', 'Đao', 'con dao', '刂'],
    ['力', 'lì', 'Lực', 'sức mạnh'], ['勹', 'bāo', 'Bao', 'bao bọc'], ['匕', 'bǐ', 'Chủy', 'cái thìa'],
    ['匚', 'fāng', 'Phương', 'cái hộp'], ['匸', 'xì', 'Hệ', 'che giấu'], ['十', 'shí', 'Thập', 'số mười'],
    ['卜', 'bǔ', 'Bốc', 'bói toán'], ['卩', 'jié', 'Tiết', 'đốt tre, ấn tín', '㔾'], ['厂', 'hàn', 'Hán', 'sườn núi'],
    ['厶', 'sī', 'Tư', 'riêng tư'], ['又', 'yòu', 'Hựu', 'lại nữa, bàn tay'],
  ]],
  [3, [
    ['口', 'kǒu', 'Khẩu', 'cái miệng'], ['囗', 'wéi', 'Vi', 'vây quanh'], ['土', 'tǔ', 'Thổ', 'đất'],
    ['士', 'shì', 'Sĩ', 'học trò'], ['夂', 'zhǐ', 'Trĩ', 'đi chậm'], ['夊', 'suī', 'Tuy', 'đi chậm'],
    ['夕', 'xī', 'Tịch', 'buổi tối'], ['大', 'dà', 'Đại', 'to lớn'], ['女', 'nǚ', 'Nữ', 'phụ nữ'],
    ['子', 'zǐ', 'Tử', 'con'], ['宀', 'mián', 'Miên', 'mái nhà'], ['寸', 'cùn', 'Thốn', 'tấc'],
    ['小', 'xiǎo', 'Tiểu', 'nhỏ'], ['尢', 'wāng', 'Uông', 'yếu, què'], ['尸', 'shī', 'Thi', 'thây người'],
    ['屮', 'chè', 'Triệt', 'mầm cây'], ['山', 'shān', 'Sơn', 'núi'], ['巛', 'chuān', 'Xuyên', 'sông', '川'],
    ['工', 'gōng', 'Công', 'thợ, công việc'], ['己', 'jǐ', 'Kỷ', 'bản thân'], ['巾', 'jīn', 'Cân', 'cái khăn'],
    ['干', 'gān', 'Can', 'khô, can thiệp'], ['幺', 'yāo', 'Yêu', 'nhỏ bé'], ['广', 'yǎn', 'Nghiễm', 'mái nhà rộng'],
    ['廴', 'yǐn', 'Dẫn', 'bước dài'], ['廾', 'gǒng', 'Củng', 'chắp tay'], ['弋', 'yì', 'Dặc', 'bắn tên'],
    ['弓', 'gōng', 'Cung', 'cái cung'], ['彐', 'jì', 'Ký', 'đầu con nhím', '彑'], ['彡', 'shān', 'Sam', 'lông, tóc'],
    ['彳', 'chì', 'Xích', 'bước chân trái'],
  ]],
  [4, [
    ['心', 'xīn', 'Tâm', 'tim, tâm', '忄'], ['戈', 'gē', 'Qua', 'cây giáo'], ['戶', 'hù', 'Hộ', 'cửa một cánh', '户'],
    ['手', 'shǒu', 'Thủ', 'bàn tay', '扌'], ['支', 'zhī', 'Chi', 'cành, chi nhánh'], ['攴', 'pū', 'Phộc', 'đánh nhẹ', '攵'],
    ['文', 'wén', 'Văn', 'chữ, văn'], ['斗', 'dǒu', 'Đẩu', 'cái đấu'], ['斤', 'jīn', 'Cân', 'cái rìu, cân'],
    ['方', 'fāng', 'Phương', 'vuông, phương'], ['无', 'wú', 'Vô', 'không'], ['日', 'rì', 'Nhật', 'mặt trời'],
    ['曰', 'yuē', 'Viết', 'nói rằng'], ['月', 'yuè', 'Nguyệt', 'mặt trăng'], ['木', 'mù', 'Mộc', 'cây'],
    ['欠', 'qiàn', 'Khiếm', 'thiếu, ngáp'], ['止', 'zhǐ', 'Chỉ', 'dừng lại'], ['歹', 'dǎi', 'Đãi', 'xấu, chết'],
    ['殳', 'shū', 'Thù', 'binh khí'], ['毋', 'wú', 'Vô', 'đừng, chớ'], ['比', 'bǐ', 'Tỷ', 'so sánh'],
    ['毛', 'máo', 'Mao', 'lông'], ['氏', 'shì', 'Thị', 'họ'], ['气', 'qì', 'Khí', 'hơi, khí'],
    ['水', 'shuǐ', 'Thủy', 'nước', '氵'], ['火', 'huǒ', 'Hỏa', 'lửa', '灬'], ['爪', 'zhǎo', 'Trảo', 'móng vuốt', '爫'],
    ['父', 'fù', 'Phụ', 'cha'], ['爻', 'yáo', 'Hào', 'hào quẻ'], ['爿', 'qiáng', 'Tường', 'mảnh gỗ'],
    ['片', 'piàn', 'Phiến', 'mảnh, tấm'], ['牙', 'yá', 'Nha', 'răng'], ['牛', 'niú', 'Ngưu', 'con trâu, bò', '牜'],
    ['犬', 'quǎn', 'Khuyển', 'con chó', '犭'],
  ]],
  [5, [
    ['玄', 'xuán', 'Huyền', 'huyền bí, màu đen'], ['玉', 'yù', 'Ngọc', 'ngọc'], ['瓜', 'guā', 'Qua', 'quả dưa'],
    ['瓦', 'wǎ', 'Ngõa', 'ngói'], ['甘', 'gān', 'Cam', 'ngọt'], ['生', 'shēng', 'Sinh', 'sống, sinh ra'],
    ['用', 'yòng', 'Dụng', 'dùng'], ['田', 'tián', 'Điền', 'ruộng'], ['疋', 'pǐ', 'Thất', 'tấm vải'],
    ['疒', 'nè', 'Nạch', 'bệnh tật'], ['癶', 'bō', 'Bát', 'gạt ra'], ['白', 'bái', 'Bạch', 'màu trắng'],
    ['皮', 'pí', 'Bì', 'da'], ['皿', 'mǐn', 'Mãnh', 'cái đĩa'], ['目', 'mù', 'Mục', 'con mắt'],
    ['矛', 'máo', 'Mâu', 'cây giáo'], ['矢', 'shǐ', 'Thỉ', 'mũi tên'], ['石', 'shí', 'Thạch', 'đá'],
    ['示', 'shì', 'Thị', 'chỉ thị, thờ cúng', '礻'], ['禸', 'róu', 'Nhữu', 'vết chân thú'], ['禾', 'hé', 'Hòa', 'cây lúa'],
    ['穴', 'xué', 'Huyệt', 'cái hang'], ['立', 'lì', 'Lập', 'đứng'],
  ]],
  [6, [
    ['竹', 'zhú', 'Trúc', 'cây tre', '⺮'], ['米', 'mǐ', 'Mễ', 'gạo'], ['糸', 'mì', 'Mịch', 'sợi tơ', '纟'],
    ['缶', 'fǒu', 'Phẫu', 'cái vò'], ['网', 'wǎng', 'Võng', 'cái lưới', '罒'], ['羊', 'yáng', 'Dương', 'con dê'],
    ['羽', 'yǔ', 'Vũ', 'lông vũ'], ['老', 'lǎo', 'Lão', 'già'], ['而', 'ér', 'Nhi', 'mà, và'],
    ['耒', 'lěi', 'Lỗi', 'cái cày'], ['耳', 'ěr', 'Nhĩ', 'cái tai'], ['聿', 'yù', 'Duật', 'cây bút'],
    ['肉', 'ròu', 'Nhục', 'thịt', '月'], ['臣', 'chén', 'Thần', 'bề tôi'], ['自', 'zì', 'Tự', 'tự mình, mũi'],
    ['至', 'zhì', 'Chí', 'đến'], ['臼', 'jiù', 'Cữu', 'cái cối'], ['舌', 'shé', 'Thiệt', 'cái lưỡi'],
    ['舛', 'chuǎn', 'Suyễn', 'trái nghịch'], ['舟', 'zhōu', 'Chu', 'cái thuyền'], ['艮', 'gèn', 'Cấn', 'bền cứng'],
    ['色', 'sè', 'Sắc', 'màu sắc'], ['艸', 'cǎo', 'Thảo', 'cỏ', '艹'], ['虍', 'hū', 'Hô', 'vằn con hổ'],
    ['虫', 'chóng', 'Trùng', 'sâu bọ'], ['血', 'xuè', 'Huyết', 'máu'], ['行', 'xíng', 'Hành', 'đi, thực hiện'],
    ['衣', 'yī', 'Y', 'quần áo', '衤'], ['襾', 'yà', 'Á', 'che đậy'],
  ]],
  [7, [
    ['見', 'jiàn', 'Kiến', 'nhìn thấy', '见'], ['角', 'jiǎo', 'Giác', 'cái sừng'], ['言', 'yán', 'Ngôn', 'lời nói', '讠'],
    ['谷', 'gǔ', 'Cốc', 'thung lũng'], ['豆', 'dòu', 'Đậu', 'hạt đậu'], ['豕', 'shǐ', 'Thỉ', 'con lợn'],
    ['豸', 'zhì', 'Trãi', 'loài thú dữ'], ['貝', 'bèi', 'Bối', 'vỏ sò, tiền', '贝'], ['赤', 'chì', 'Xích', 'màu đỏ'],
    ['走', 'zǒu', 'Tẩu', 'đi bộ, chạy'], ['足', 'zú', 'Túc', 'bàn chân', '⻊'], ['身', 'shēn', 'Thân', 'thân mình'],
    ['車', 'chē', 'Xa', 'xe', '车'], ['辛', 'xīn', 'Tân', 'cay đắng'], ['辰', 'chén', 'Thần', 'giờ thìn'],
    ['辵', 'chuò', 'Sước', 'chợt đi chợt dừng', '辶'], ['邑', 'yì', 'Ấp', 'làng, thành ấp', '阝'], ['酉', 'yǒu', 'Dậu', 'rượu, giờ dậu'],
    ['釆', 'biàn', 'Biện', 'phân biệt'], ['里', 'lǐ', 'Lý', 'dặm, trong'],
  ]],
  [8, [
    ['金', 'jīn', 'Kim', 'vàng, kim loại', '钅'], ['長', 'cháng', 'Trường', 'dài', '长'], ['門', 'mén', 'Môn', 'cái cổng', '门'],
    ['阜', 'fù', 'Phụ', 'gò đất', '阝'], ['隶', 'dài', 'Đãi', 'theo kịp'], ['隹', 'zhuī', 'Truy', 'chim đuôi ngắn'],
    ['雨', 'yǔ', 'Vũ', 'mưa'], ['青', 'qīng', 'Thanh', 'màu xanh'], ['非', 'fēi', 'Phi', 'không phải'],
  ]],
  [9, [
    ['面', 'miàn', 'Diện', 'mặt'], ['革', 'gé', 'Cách', 'da thuộc'], ['韋', 'wéi', 'Vi', 'da mềm', '韦'],
    ['韭', 'jiǔ', 'Cửu', 'rau hẹ'], ['音', 'yīn', 'Âm', 'âm thanh'], ['頁', 'yè', 'Hiệt', 'cái đầu, trang', '页'],
    ['風', 'fēng', 'Phong', 'gió', '风'], ['飛', 'fēi', 'Phi', 'bay', '飞'], ['食', 'shí', 'Thực', 'ăn', '饣'],
    ['首', 'shǒu', 'Thủ', 'cái đầu'], ['香', 'xiāng', 'Hương', 'mùi thơm'],
  ]],
  [10, [
    ['馬', 'mǎ', 'Mã', 'con ngựa', '马'], ['骨', 'gǔ', 'Cốt', 'xương'], ['高', 'gāo', 'Cao', 'cao'],
    ['髟', 'biāo', 'Bưu', 'tóc dài'], ['鬥', 'dòu', 'Đấu', 'đánh nhau', '斗'], ['鬯', 'chàng', 'Sưởng', 'rượu nếp thơm'],
    ['鬲', 'lì', 'Cách', 'cái đỉnh'], ['鬼', 'guǐ', 'Quỷ', 'con ma'],
  ]],
  [11, [
    ['魚', 'yú', 'Ngư', 'con cá', '鱼'], ['鳥', 'niǎo', 'Điểu', 'con chim', '鸟'], ['鹵', 'lǔ', 'Lỗ', 'muối mỏ'],
    ['鹿', 'lù', 'Lộc', 'con hươu'], ['麥', 'mài', 'Mạch', 'lúa mạch', '麦'], ['麻', 'má', 'Ma', 'cây gai'],
  ]],
  [12, [
    ['黃', 'huáng', 'Hoàng', 'màu vàng', '黄'], ['黍', 'shǔ', 'Thử', 'lúa nếp'], ['黑', 'hēi', 'Hắc', 'màu đen'],
    ['黹', 'zhǐ', 'Chỉ', 'may thêu'],
  ]],
  [13, [
    ['黽', 'mǐn', 'Mãnh', 'con ếch'], ['鼎', 'dǐng', 'Đỉnh', 'cái vạc'], ['鼓', 'gǔ', 'Cổ', 'cái trống'],
    ['鼠', 'shǔ', 'Thử', 'con chuột'],
  ]],
  [14, [['鼻', 'bí', 'Tỵ', 'cái mũi'], ['齊', 'qí', 'Tề', 'ngay ngắn', '齐']]],
  [15, [['齒', 'chǐ', 'Xỉ', 'răng', '齿']]],
  [16, [['龍', 'lóng', 'Long', 'con rồng', '龙'], ['龜', 'guī', 'Quy', 'con rùa', '龟']]],
  [17, [['龠', 'yuè', 'Dược', 'sáo ba ống']]],
]

export const RADICALS: Radical[] = BY_STROKES.flatMap(([strokes, rows]) =>
  rows.map(([char, pinyin, hanViet, meaning, alt]) => ({ char, strokes, pinyin, hanViet, meaning, alt })),
)

/** Stroke counts that have radicals, for the stepper; the last chip groups the rest. */
export const STROKE_STEPS: number[] = BY_STROKES.map(([strokes]) => strokes)

export const radicalsWithStrokes = (strokes: number): Radical[] => RADICALS.filter((r) => r.strokes === strokes)
