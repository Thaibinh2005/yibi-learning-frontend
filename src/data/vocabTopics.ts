// Danh sách 178 chủ đề từ vựng HSK tiếng Trung
export interface SampleWord {
  id: number
  hanzi: string
  pinyin: string
  meaningVi: string
  levelCode?: string | null
}

export interface VocabTopic {
  id: number
  slug: string
  titleVi: string
  titleZh: string
  icon: string
  description: string
  hskLevel: string
  wordCount: number
  sampleWords: SampleWord[]
}

export const VOCAB_TOPICS: VocabTopic[] = [
  {
    "id": 1,
    "slug": "chao-hoi-va-lam-quen",
    "titleVi": "Chào hỏi & Làm quen",
    "titleZh": "问候与结识",
    "icon": "👋",
    "description": "Chào hỏi, giới thiệu bản thân và xã giao cơ bản.",
    "hskLevel": "HSK 1",
    "wordCount": 28,
    "sampleWords": [
      {
        "id": 313616,
        "hanzi": "你好",
        "pinyin": "nǐ hǎo",
        "meaningVi": "xin chào",
        "levelCode": "1"
      },
      {
        "id": 288079,
        "hanzi": "再见",
        "pinyin": "zàijiàn",
        "meaningVi": "tạm biệt",
        "levelCode": "1"
      },
      {
        "id": 289112,
        "hanzi": "告别",
        "pinyin": "gàobié",
        "meaningVi": "rời đi",
        "levelCode": "3"
      },
      {
        "id": 294343,
        "hanzi": "告辞",
        "pinyin": "gào cí",
        "meaningVi": "nói lời tạm biệt",
        "levelCode": "7-9"
      },
      {
        "id": 323514,
        "hanzi": "寒暄",
        "pinyin": "hánxuān",
        "meaningVi": "trao đổi lời chào hỏi thông thường",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 2,
    "slug": "ban-than-va-thong-tin-ca-nhan",
    "titleVi": "Bản thân & Thông tin cá nhân",
    "titleZh": "个人信息",
    "icon": "👤",
    "description": "Tên tuổi, quốc tịch, quê quán, số điện thoại.",
    "hskLevel": "HSK 1",
    "wordCount": 131,
    "sampleWords": [
      {
        "id": 323846,
        "hanzi": "一举两得",
        "pinyin": "yìjǔ-liǎngdé",
        "meaningVi": "một hành động, hai kết quả (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 297965,
        "hanzi": "一卡通",
        "pinyin": "Yī kǎ tōng",
        "meaningVi": "tên của các loại thẻ thông minh không tiếp xúc, nổi bật là Yikatong (chủ yếu cho giao thông công cộng ở Bắc Kinh) và iPASS (chủ yếu cho giao thông công cộng ở Đài Loan)",
        "levelCode": "7-9"
      },
      {
        "id": 316146,
        "hanzi": "中华",
        "pinyin": "Zhōnghuá",
        "meaningVi": "Trung Hoa (tên gọi trang trọng thay thế)",
        "levelCode": "5"
      },
      {
        "id": 288853,
        "hanzi": "中年",
        "pinyin": "zhōngnián",
        "meaningVi": "tuổi trung niên",
        "levelCode": "2"
      },
      {
        "id": 287979,
        "hanzi": "他",
        "pinyin": "tā",
        "meaningVi": "anh ấy",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 3,
    "slug": "thoi-gian-va-gio-giac",
    "titleVi": "Thời gian & Giờ giấc",
    "titleZh": "时间与钟点",
    "icon": "⏰",
    "description": "Hỏi giờ, phút, giây, buổi sáng, trưa, tối.",
    "hskLevel": "HSK 1",
    "wordCount": 285,
    "sampleWords": [
      {
        "id": 290096,
        "hanzi": "…分之…",
        "pinyin": "fēn zhī",
        "meaningVi": "…phần…",
        "levelCode": "4"
      },
      {
        "id": 288057,
        "hanzi": "一会儿",
        "pinyin": "yīhuìr",
        "meaningVi": "một lúc",
        "levelCode": "1"
      },
      {
        "id": 291741,
        "hanzi": "一向",
        "pinyin": "yīxiàng",
        "meaningVi": "một khoảng thời gian trong quá khứ gần đây",
        "levelCode": "5"
      },
      {
        "id": 297915,
        "hanzi": "一大早",
        "pinyin": "yī dà zǎo",
        "meaningVi": "lúc bình minh",
        "levelCode": "7-9"
      },
      {
        "id": 291736,
        "hanzi": "一旦",
        "pinyin": "yīdàn",
        "meaningVi": "trong trường hợp (điều gì đó xảy ra)",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 4,
    "slug": "ngay-thang-va-lich",
    "titleVi": "Ngày tháng & Lịch",
    "titleZh": "日期与日历",
    "icon": "📅",
    "description": "Thứ trong tuần, ngày tháng, năm, dịp lễ.",
    "hskLevel": "HSK 1",
    "wordCount": 388,
    "sampleWords": [
      {
        "id": 289717,
        "hanzi": "一切",
        "pinyin": "yīqiè",
        "meaningVi": "mọi thứ",
        "levelCode": "3"
      },
      {
        "id": 297977,
        "hanzi": "一天到晚",
        "pinyin": "yītiāndàowǎn",
        "meaningVi": "cả ngày",
        "levelCode": "7-9"
      },
      {
        "id": 297978,
        "hanzi": "一头",
        "pinyin": "yītóu",
        "meaningVi": "một cái đầu",
        "levelCode": "7-9"
      },
      {
        "id": 297970,
        "hanzi": "一年到头",
        "pinyin": "yīniándàotóu",
        "meaningVi": "suốt cả năm",
        "levelCode": "7-9"
      },
      {
        "id": 321442,
        "hanzi": "一并",
        "pinyin": "yíbìng",
        "meaningVi": "gộp lại",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 5,
    "slug": "thoi-tiet-va-khi-hau",
    "titleVi": "Thời tiết & Khí hậu",
    "titleZh": "天气与气候",
    "icon": "☀️",
    "description": "Nắng, mưa, gió, tuyết, nhiệt độ và dự báo thời tiết.",
    "hskLevel": "HSK 2",
    "wordCount": 185,
    "sampleWords": [
      {
        "id": 318758,
        "hanzi": "一帆风顺",
        "pinyin": "yìfān-fēngshùn",
        "meaningVi": "thuận buồm xuôi gió (thành ngữ)",
        "levelCode": "6"
      },
      {
        "id": 288021,
        "hanzi": "下雨",
        "pinyin": "xiàyǔ",
        "meaningVi": "trời mưa",
        "levelCode": "1"
      },
      {
        "id": 288708,
        "hanzi": "下雪",
        "pinyin": "xià xuě",
        "meaningVi": "tuyết rơi",
        "levelCode": "2"
      },
      {
        "id": 318714,
        "hanzi": "严寒",
        "pinyin": "yánhán",
        "meaningVi": "lạnh giá khắc nghiệt",
        "levelCode": "6"
      },
      {
        "id": 318792,
        "hanzi": "中暑",
        "pinyin": "zhòngshǔ",
        "meaningVi": "bị cảm nắng",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 6,
    "slug": "con-so-va-so-dem",
    "titleVi": "Con số & Số đếm",
    "titleZh": "数字与计数",
    "icon": "🔢",
    "description": "Số đếm từ 0 đến hàng tỷ, số thứ tự, phần trăm.",
    "hskLevel": "HSK 1",
    "wordCount": 290,
    "sampleWords": [
      {
        "id": 288052,
        "hanzi": "一",
        "pinyin": "yī",
        "meaningVi": "một",
        "levelCode": "1"
      },
      {
        "id": 318851,
        "hanzi": "一一",
        "pinyin": "yīyī",
        "meaningVi": "từng cái một",
        "levelCode": "6"
      },
      {
        "id": 313494,
        "hanzi": "一下",
        "pinyin": "yíxià",
        "meaningVi": "(dùng sau động từ) thử xem",
        "levelCode": null
      },
      {
        "id": 288059,
        "hanzi": "一下儿",
        "pinyin": "yīxià r",
        "meaningVi": "(dạng er hóa) (dùng sau động từ) thử xem",
        "levelCode": "1"
      },
      {
        "id": 291740,
        "hanzi": "一下子",
        "pinyin": "yī xià zi",
        "meaningVi": "trong chốc lát",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 7,
    "slug": "mau-sac-va-hinh-khoi",
    "titleVi": "Màu sắc & Hình khối",
    "titleZh": "颜色与形状",
    "icon": "🎨",
    "description": "Gam màu sắc, hình tròn, vuông, kích thước.",
    "hskLevel": "HSK 2",
    "wordCount": 254,
    "sampleWords": [
      {
        "id": 297961,
        "hanzi": "一家人",
        "pinyin": "yìjiārén",
        "meaningVi": "cả gia đình",
        "levelCode": "7-9"
      },
      {
        "id": 323510,
        "hanzi": "一针见血",
        "pinyin": "yìzhēn-jiànxiě",
        "meaningVi": "nghĩa đen: chích một cái trúng máu (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 297959,
        "hanzi": "一锅粥",
        "pinyin": "yīguōzhōu",
        "meaningVi": "(nghĩa đen) một nồi cháo",
        "levelCode": "7-9"
      },
      {
        "id": 313776,
        "hanzi": "下来",
        "pinyin": "xiàlái",
        "meaningVi": "đi xuống",
        "levelCode": "2"
      },
      {
        "id": 293312,
        "hanzi": "不亦乐乎",
        "pinyin": "bù yì lè hū",
        "meaningVi": "nghĩa đen: chẳng phải vui sao? (trích Khổng Tử)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 8,
    "slug": "nha-cua-va-phong-oc",
    "titleVi": "Nhà cửa & Phòng ốc",
    "titleZh": "房屋与居室",
    "icon": "🏠",
    "description": "Phòng khách, phòng ngủ, bếp, nhà tắm, ban công.",
    "hskLevel": "HSK 2",
    "wordCount": 339,
    "sampleWords": [
      {
        "id": 297961,
        "hanzi": "一家人",
        "pinyin": "yìjiārén",
        "meaningVi": "cả gia đình",
        "levelCode": "7-9"
      },
      {
        "id": 290594,
        "hanzi": "万一",
        "pinyin": "wànyī",
        "meaningVi": "phòng khi",
        "levelCode": "4"
      },
      {
        "id": 292628,
        "hanzi": "上台",
        "pinyin": "shàngtái",
        "meaningVi": "lên nắm quyền (trong chính trị)",
        "levelCode": "6"
      },
      {
        "id": 321955,
        "hanzi": "上层",
        "pinyin": "shàngcéng",
        "meaningVi": "tầng trên",
        "levelCode": "7-9"
      },
      {
        "id": 296606,
        "hanzi": "上流",
        "pinyin": "shàng liú",
        "meaningVi": "tầng lớp thượng lưu",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 9,
    "slug": "do-dung-gia-dinh",
    "titleVi": "Đồ dùng gia đình",
    "titleZh": "家居用品",
    "icon": "🛋️",
    "description": "Bàn ghế, giường tủ, đèn, quạt, đồ điện.",
    "hskLevel": "HSK 2",
    "wordCount": 157,
    "sampleWords": [
      {
        "id": 293928,
        "hanzi": "丁",
        "pinyin": "dīng",
        "meaningVi": "nam trưởng thành",
        "levelCode": "7-9"
      },
      {
        "id": 290908,
        "hanzi": "不得了",
        "pinyin": "bù dé liǎo",
        "meaningVi": "cực kỳ nghiêm trọng",
        "levelCode": "5"
      },
      {
        "id": 288945,
        "hanzi": "不论",
        "pinyin": "búlùn",
        "meaningVi": "bất kể",
        "levelCode": "3"
      },
      {
        "id": 290969,
        "hanzi": "丑",
        "pinyin": "chǒu",
        "meaningVi": "chú hề",
        "levelCode": "5"
      },
      {
        "id": 293279,
        "hanzi": "丙",
        "pinyin": "bǐng",
        "meaningVi": "thứ ba trong mười Thiên Can 十天干",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 10,
    "slug": "do-dung-ca-nhan",
    "titleVi": "Đồ dùng cá nhân",
    "titleZh": "个人随身物品",
    "icon": "🎒",
    "description": "Ví tiền, chìa khóa, ô dù, kính mắt, túi xách.",
    "hskLevel": "HSK 2",
    "wordCount": 158,
    "sampleWords": [
      {
        "id": 290096,
        "hanzi": "…分之…",
        "pinyin": "fēn zhī",
        "meaningVi": "…phần…",
        "levelCode": "4"
      },
      {
        "id": 292865,
        "hanzi": "一路上",
        "pinyin": "yīlùshàng",
        "meaningVi": "trên đường đi",
        "levelCode": "6"
      },
      {
        "id": 297491,
        "hanzi": "下海",
        "pinyin": "xià hǎi",
        "meaningVi": "ra biển",
        "levelCode": "7-9"
      },
      {
        "id": 298514,
        "hanzi": "专柜",
        "pinyin": "zhuānguì",
        "meaningVi": "quầy bán hàng dành riêng cho một loại sản phẩm nhất định (ví dụ: rượu)",
        "levelCode": "7-9"
      },
      {
        "id": 293954,
        "hanzi": "东道主",
        "pinyin": "dōng dào zhǔ",
        "meaningVi": "chủ nhà",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 11,
    "slug": "hoat-dong-hang-ngay",
    "titleVi": "Hoạt động hàng ngày",
    "titleZh": "日常生活",
    "icon": "🚶",
    "description": "Thức dậy, rửa mặt, đi làm, ăn cơm, xem TV, đi dạo.",
    "hskLevel": "HSK 1",
    "wordCount": 36,
    "sampleWords": [
      {
        "id": 287948,
        "hanzi": "上学",
        "pinyin": "shàngxué",
        "meaningVi": "đi học",
        "levelCode": "1"
      },
      {
        "id": 296603,
        "hanzi": "上岗",
        "pinyin": "shàng gǎng",
        "meaningVi": "nhận chức",
        "levelCode": "7-9"
      },
      {
        "id": 287941,
        "hanzi": "上班",
        "pinyin": "shàngbān",
        "meaningVi": "đi làm",
        "levelCode": "1"
      },
      {
        "id": 287945,
        "hanzi": "上课",
        "pinyin": "shàngkè",
        "meaningVi": "đi học",
        "levelCode": "1"
      },
      {
        "id": 288042,
        "hanzi": "休息",
        "pinyin": "xiūxí",
        "meaningVi": "nghỉ",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 12,
    "slug": "giac-ngu-va-nghi-ngoi",
    "titleVi": "Giấc ngủ & Nghỉ ngơi",
    "titleZh": "睡眠与休息",
    "icon": "🛌",
    "description": "Đi ngủ, thức giấc, mất ngủ, ngủ trưa, mơ, mệt.",
    "hskLevel": "HSK 2",
    "wordCount": 256,
    "sampleWords": [
      {
        "id": 287940,
        "hanzi": "上",
        "pinyin": "shàng",
        "meaningVi": "(hình thức kết hợp) trên",
        "levelCode": "1"
      },
      {
        "id": 297506,
        "hanzi": "下意识",
        "pinyin": "xià yì shí",
        "meaningVi": "tâm thức tiềm ẩn",
        "levelCode": "7-9"
      },
      {
        "id": 287662,
        "hanzi": "不",
        "pinyin": "bù",
        "meaningVi": "không",
        "levelCode": "1"
      },
      {
        "id": 293310,
        "hanzi": "不懈",
        "pinyin": "bù xiè",
        "meaningVi": "không mệt mỏi",
        "levelCode": "7-9"
      },
      {
        "id": 293353,
        "hanzi": "不知",
        "pinyin": "bù zhī",
        "meaningVi": "không biết",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 13,
    "slug": "thoi-quen-sinh-hoat",
    "titleVi": "Thói quen sinh hoạt",
    "titleZh": "生活习惯",
    "icon": "⚡",
    "description": "Thói quen tốt/xấu, đúng giờ, dậy sớm, tự giác.",
    "hskLevel": "HSK 3",
    "wordCount": 58,
    "sampleWords": [
      {
        "id": 297920,
        "hanzi": "一个劲儿",
        "pinyin": "yīgèjìnr",
        "meaningVi": "(dạng er hóa) liên tục",
        "levelCode": "7-9"
      },
      {
        "id": 297927,
        "hanzi": "一味",
        "pinyin": "yīwèi",
        "meaningVi": "một cách kiên trì",
        "levelCode": "7-9"
      },
      {
        "id": 292864,
        "hanzi": "一贯",
        "pinyin": "yīguàn",
        "meaningVi": "nhất quán",
        "levelCode": "6"
      },
      {
        "id": 289819,
        "hanzi": "主动",
        "pinyin": "zhǔdòng",
        "meaningVi": "chủ động",
        "levelCode": "3"
      },
      {
        "id": 288704,
        "hanzi": "习惯",
        "pinyin": "xíguàn",
        "meaningVi": "thói quen",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 14,
    "slug": "ve-sinh-ca-nhan",
    "titleVi": "Vệ sinh cá nhân",
    "titleZh": "个人卫生",
    "icon": "🧼",
    "description": "Tắm gội, cắt tóc, rửa tay, kem đánh răng, xà phòng.",
    "hskLevel": "HSK 2",
    "wordCount": 28,
    "sampleWords": [
      {
        "id": 297948,
        "hanzi": "以身作则",
        "pinyin": "yǐ shēn zuò zé",
        "meaningVi": "làm gương (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 289658,
        "hanzi": "先进",
        "pinyin": "xiānjìn",
        "meaningVi": "tiên tiến (công nghệ, v.v.)",
        "levelCode": "3"
      },
      {
        "id": 290524,
        "hanzi": "刷子",
        "pinyin": "shuā zi",
        "meaningVi": "bàn chải",
        "levelCode": "4"
      },
      {
        "id": 290523,
        "hanzi": "刷牙",
        "pinyin": "shuā yá",
        "meaningVi": "đánh răng",
        "levelCode": "4"
      },
      {
        "id": 289638,
        "hanzi": "卫生间",
        "pinyin": "wèi shēng jiān",
        "meaningVi": "phòng tắm",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 15,
    "slug": "nha-bep-va-nau-nuong",
    "titleVi": "Nhà bếp & Nấu nướng",
    "titleZh": "厨房与烹饪",
    "icon": "🍳",
    "description": "Nồi niêu, bếp, gia vị, xào nấu, nướng, luộc.",
    "hskLevel": "HSK 2",
    "wordCount": 117,
    "sampleWords": [
      {
        "id": 297924,
        "hanzi": "一目了然",
        "pinyin": "yī mù liǎo rán",
        "meaningVi": "rõ ràng ngay từ cái nhìn đầu tiên (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 297959,
        "hanzi": "一锅粥",
        "pinyin": "yīguōzhōu",
        "meaningVi": "(nghĩa đen) một nồi cháo",
        "levelCode": "7-9"
      },
      {
        "id": 313812,
        "hanzi": "下面",
        "pinyin": "xiàmiàn",
        "meaningVi": "bên dưới",
        "levelCode": "2"
      },
      {
        "id": 289472,
        "hanzi": "人才",
        "pinyin": "réncái",
        "meaningVi": "tài năng",
        "levelCode": "3"
      },
      {
        "id": 293242,
        "hanzi": "便饭",
        "pinyin": "biàn fàn",
        "meaningVi": "bữa ăn thường",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 16,
    "slug": "thanh-vien-gia-dinh",
    "titleVi": "Thành viên gia đình",
    "titleZh": "家庭成员",
    "icon": "👨‍👩‍👧‍👦",
    "description": "Bố mẹ, ông bà, anh chị em, con cái trong gia đình.",
    "hskLevel": "HSK 1",
    "wordCount": 149,
    "sampleWords": [
      {
        "id": 297961,
        "hanzi": "一家人",
        "pinyin": "yìjiārén",
        "meaningVi": "cả gia đình",
        "levelCode": "7-9"
      },
      {
        "id": 290474,
        "hanzi": "上门",
        "pinyin": "shàng mén",
        "meaningVi": "ghé thăm",
        "levelCode": "4"
      },
      {
        "id": 324226,
        "hanzi": "不肖",
        "pinyin": "búxiào",
        "meaningVi": "(văn học) không giống cha mẹ",
        "levelCode": "7-9"
      },
      {
        "id": 298486,
        "hanzi": "主妇",
        "pinyin": "zhǔfù",
        "meaningVi": "người nội trợ",
        "levelCode": "7-9"
      },
      {
        "id": 318553,
        "hanzi": "产出",
        "pinyin": "chǎnchū",
        "meaningVi": "sản xuất (sinh viên tốt nghiệp, sữa mẹ, chất thải độc hại, ý tưởng sáng tạo, v.v.)",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 17,
    "slug": "ho-hang-va-than-toc",
    "titleVi": "Họ hàng & Thân tộc",
    "titleZh": "亲戚与家族",
    "icon": "🌳",
    "description": "Cô dì chú bác, anh chị em họ, cháu chắt, tổ tiên.",
    "hskLevel": "HSK 3",
    "wordCount": 201,
    "sampleWords": [
      {
        "id": 297913,
        "hanzi": "一不小心",
        "pinyin": "yībuxiǎoxīn",
        "meaningVi": "hơi bất cẩn một chút",
        "levelCode": "7-9"
      },
      {
        "id": 297982,
        "hanzi": "一心一意",
        "pinyin": "yī xīn yī yì",
        "meaningVi": "tập trung suy nghĩ và nỗ lực",
        "levelCode": "7-9"
      },
      {
        "id": 293305,
        "hanzi": "不慎",
        "pinyin": "bù shèn",
        "meaningVi": "bất cẩn",
        "levelCode": "7-9"
      },
      {
        "id": 293325,
        "hanzi": "不服",
        "pinyin": "bù fú",
        "meaningVi": "không chấp nhận điều gì",
        "levelCode": "7-9"
      },
      {
        "id": 293335,
        "hanzi": "不理",
        "pinyin": "bù lǐ",
        "meaningVi": "từ chối thừa nhận",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 18,
    "slug": "tinh-ban-va-ban-be",
    "titleVi": "Tình bạn & Bạn bè",
    "titleZh": "友情与朋友",
    "icon": "🤝",
    "description": "Bạn thân, bạn cùng lớp, bạn đồng nghiệp, tình bạn.",
    "hskLevel": "HSK 2",
    "wordCount": 98,
    "sampleWords": [
      {
        "id": 290909,
        "hanzi": "不敢当",
        "pinyin": "bù gǎn dāng",
        "meaningVi": "nghĩa đen: tôi không dám (nhận vinh dự)",
        "levelCode": "5"
      },
      {
        "id": 295290,
        "hanzi": "久仰",
        "pinyin": "jiǔ yǎng",
        "meaningVi": "kính ngữ: Tôi đã mong được gặp bạn từ lâu.",
        "levelCode": "7-9"
      },
      {
        "id": 294752,
        "hanzi": "互信",
        "pinyin": "hù xìn",
        "meaningVi": "tin tưởng lẫn nhau",
        "levelCode": "7-9"
      },
      {
        "id": 288392,
        "hanzi": "交",
        "pinyin": "jiāo",
        "meaningVi": "giao nộp",
        "levelCode": "2"
      },
      {
        "id": 295088,
        "hanzi": "交情",
        "pinyin": "jiāo qing",
        "meaningVi": "tình bạn",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 19,
    "slug": "tinh-yeu-va-hen-ho",
    "titleVi": "Tình yêu & Hẹn hò",
    "titleZh": "恋爱与约会",
    "icon": "❤️",
    "description": "Tình yêu, hẹn hò, tỏ tình, người yêu, lãng mạn.",
    "hskLevel": "HSK 3",
    "wordCount": 127,
    "sampleWords": [
      {
        "id": 294489,
        "hanzi": "乖巧",
        "pinyin": "guāi qiǎo",
        "meaningVi": "thông minh (trẻ em)",
        "levelCode": "7-9"
      },
      {
        "id": 289239,
        "hanzi": "交往",
        "pinyin": "jiāowǎng",
        "meaningVi": "giao thiệp (với)",
        "levelCode": "3"
      },
      {
        "id": 316804,
        "hanzi": "亲情",
        "pinyin": "qīnqíng",
        "meaningVi": "tình cảm",
        "levelCode": "5"
      },
      {
        "id": 290433,
        "hanzi": "亲爱",
        "pinyin": "qīn ài",
        "meaningVi": "thân yêu",
        "levelCode": "4"
      },
      {
        "id": 293636,
        "hanzi": "传奇",
        "pinyin": "chuánqí",
        "meaningVi": "huyền thoại",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 20,
    "slug": "hon-nhan-va-dam-cuoi",
    "titleVi": "Hôn nhân & Đám cưới",
    "titleZh": "婚姻与婚礼",
    "icon": "💍",
    "description": "Kết hôn, đám cưới, cô dâu, chú rể, vợ chồng, ly hôn.",
    "hskLevel": "HSK 3",
    "wordCount": 70,
    "sampleWords": [
      {
        "id": 313819,
        "hanzi": "丈夫",
        "pinyin": "zhàngfu",
        "meaningVi": "chồng",
        "levelCode": "2"
      },
      {
        "id": 290474,
        "hanzi": "上门",
        "pinyin": "shàng mén",
        "meaningVi": "ghé thăm",
        "levelCode": "4"
      },
      {
        "id": 295664,
        "hanzi": "两口子",
        "pinyin": "liǎngkǒuzi",
        "meaningVi": "vợ chồng",
        "levelCode": "7-9"
      },
      {
        "id": 318692,
        "hanzi": "乌龟",
        "pinyin": "wūguī",
        "meaningVi": "con rùa",
        "levelCode": "6"
      },
      {
        "id": 295081,
        "hanzi": "交叉",
        "pinyin": "jiāochā",
        "meaningVi": "giao nhau",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 21,
    "slug": "tre-em-va-nuoi-day-con",
    "titleVi": "Trẻ em & Nuôi dạy con",
    "titleZh": "儿童与育儿",
    "icon": "👶",
    "description": "Trẻ sơ sinh, em bé, nuôi dưỡng, giáo dục con cái.",
    "hskLevel": "HSK 3",
    "wordCount": 71,
    "sampleWords": [
      {
        "id": 297927,
        "hanzi": "一味",
        "pinyin": "yīwèi",
        "meaningVi": "một cách kiên trì",
        "levelCode": "7-9"
      },
      {
        "id": 294488,
        "hanzi": "乖",
        "pinyin": "guāi",
        "meaningVi": "(dùng cho trẻ em) ngoan ngoãn, cư xử tốt",
        "levelCode": "7-9"
      },
      {
        "id": 294489,
        "hanzi": "乖巧",
        "pinyin": "guāi qiǎo",
        "meaningVi": "thông minh (trẻ em)",
        "levelCode": "7-9"
      },
      {
        "id": 298355,
        "hanzi": "争执",
        "pinyin": "zhēng zhí",
        "meaningVi": "tranh chấp",
        "levelCode": "7-9"
      },
      {
        "id": 318553,
        "hanzi": "产出",
        "pinyin": "chǎnchū",
        "meaningVi": "sản xuất (sinh viên tốt nghiệp, sữa mẹ, chất thải độc hại, ý tưởng sáng tạo, v.v.)",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 22,
    "slug": "tuoi-tac-va-the-he",
    "titleVi": "Tuổi tác & Thế hệ",
    "titleZh": "年龄与世代",
    "icon": "⏳",
    "description": "Tuổi thơ, thanh thiếu niên, người trưởng thành, người già.",
    "hskLevel": "HSK 4",
    "wordCount": 79,
    "sampleWords": [
      {
        "id": 317044,
        "hanzi": "一代",
        "pinyin": "yídài",
        "meaningVi": "thế hệ",
        "levelCode": "5"
      },
      {
        "id": 293928,
        "hanzi": "丁",
        "pinyin": "dīng",
        "meaningVi": "nam trưởng thành",
        "levelCode": "7-9"
      },
      {
        "id": 297505,
        "hanzi": "下一代",
        "pinyin": "xià yī dài",
        "meaningVi": "thế hệ tiếp theo",
        "levelCode": "7-9"
      },
      {
        "id": 296762,
        "hanzi": "世代",
        "pinyin": "shìdài",
        "meaningVi": "nhiều thế hệ",
        "levelCode": "7-9"
      },
      {
        "id": 288853,
        "hanzi": "中年",
        "pinyin": "zhōngnián",
        "meaningVi": "tuổi trung niên",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 23,
    "slug": "giao-tiep-ung-xu",
    "titleVi": "Giao tiếp & Ứng xử",
    "titleZh": "人际交往与礼仪",
    "icon": "🗣️",
    "description": "Lịch sự, khiêm tốn, lễ phép, tôn trọng, giao tiếp xã hội.",
    "hskLevel": "HSK 3",
    "wordCount": 73,
    "sampleWords": [
      {
        "id": 287660,
        "hanzi": "不客气",
        "pinyin": "bù kè qi",
        "meaningVi": "không có chi",
        "levelCode": "1"
      },
      {
        "id": 289238,
        "hanzi": "交流",
        "pinyin": "jiāoliú",
        "meaningVi": "trao đổi",
        "levelCode": "3"
      },
      {
        "id": 290249,
        "hanzi": "交际",
        "pinyin": "jiāo jì",
        "meaningVi": "giao tiếp",
        "levelCode": "4"
      },
      {
        "id": 293298,
        "hanzi": "伯母",
        "pinyin": "bó mǔ",
        "meaningVi": "vợ của anh trai của cha",
        "levelCode": "7-9"
      },
      {
        "id": 290676,
        "hanzi": "兄弟",
        "pinyin": "xiōngdì",
        "meaningVi": "anh em",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 24,
    "slug": "loi-chuc-va-chuc-mung",
    "titleVi": "Lời chúc & Chúc mừng",
    "titleZh": "祝愿与祝贺",
    "icon": "🎉",
    "description": "Chúc mừng sinh nhật, năm mới, vạn sự như ý, thành công.",
    "hskLevel": "HSK 2",
    "wordCount": 80,
    "sampleWords": [
      {
        "id": 288768,
        "hanzi": "一路平安",
        "pinyin": "yī lù píng ān",
        "meaningVi": "có chuyến đi vui vẻ",
        "levelCode": "2"
      },
      {
        "id": 288769,
        "hanzi": "一路顺风",
        "pinyin": "yī lù shùn fēng",
        "meaningVi": "chúc lên đường bình an (thành ngữ)",
        "levelCode": "2"
      },
      {
        "id": 313825,
        "hanzi": "上来",
        "pinyin": "shànglái",
        "meaningVi": "đi lên",
        "levelCode": "2"
      },
      {
        "id": 291303,
        "hanzi": "亏",
        "pinyin": "kuī",
        "meaningVi": "lỗ (tiền)",
        "levelCode": "5"
      },
      {
        "id": 321668,
        "hanzi": "侥幸",
        "pinyin": "jiǎoxìng",
        "meaningVi": "may mắn",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 25,
    "slug": "loi-xin-loi-va-cam-on",
    "titleVi": "Lời xin lỗi & Cảm ơn",
    "titleZh": "道歉与感谢",
    "icon": "🙏",
    "description": "Cảm ơn, xin lỗi, không có gì, đừng bận tâm, thứ lỗi.",
    "hskLevel": "HSK 1",
    "wordCount": 33,
    "sampleWords": [
      {
        "id": 288161,
        "hanzi": "不好意思",
        "pinyin": "bùhǎoyìsī",
        "meaningVi": "cảm thấy xấu hổ",
        "levelCode": "2"
      },
      {
        "id": 287660,
        "hanzi": "不客气",
        "pinyin": "bù kè qi",
        "meaningVi": "không có chi",
        "levelCode": "1"
      },
      {
        "id": 290848,
        "hanzi": "作出",
        "pinyin": "zuòchū",
        "meaningVi": "đưa ra",
        "levelCode": "4"
      },
      {
        "id": 288971,
        "hanzi": "吵",
        "pinyin": "chǎo",
        "meaningVi": "cãi nhau",
        "levelCode": "3"
      },
      {
        "id": 323766,
        "hanzi": "失礼",
        "pinyin": "shīlǐ",
        "meaningVi": "cư xử thất lễ",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 26,
    "slug": "mau-thuan-va-hoa-giai",
    "titleVi": "Mâu thuẫn & Hòa giải",
    "titleZh": "矛盾与和解",
    "icon": "🕊️",
    "description": "Cãi vã, hiểu lầm, tranh cãi, tha thứ, hòa giải.",
    "hskLevel": "HSK 4",
    "wordCount": 75,
    "sampleWords": [
      {
        "id": 289769,
        "hanzi": "争",
        "pinyin": "zhēng",
        "meaningVi": "cố gắng giành",
        "levelCode": "3"
      },
      {
        "id": 318418,
        "hanzi": "争吵",
        "pinyin": "zhēngchǎo",
        "meaningVi": "cãi nhau",
        "levelCode": "6"
      },
      {
        "id": 298355,
        "hanzi": "争执",
        "pinyin": "zhēng zhí",
        "meaningVi": "tranh chấp",
        "levelCode": "7-9"
      },
      {
        "id": 298350,
        "hanzi": "争端",
        "pinyin": "zhēng duān",
        "meaningVi": "tranh chấp",
        "levelCode": "7-9"
      },
      {
        "id": 291836,
        "hanzi": "争议",
        "pinyin": "zhēngyì",
        "meaningVi": "tranh cãi",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 27,
    "slug": "moi-quan-he-xa-hoi",
    "titleVi": "Mối quan hệ xã hội",
    "titleZh": "社会人脉",
    "icon": "🌐",
    "description": "Đồng hương, hàng xóm, đối tác, quen biết, kết nối.",
    "hskLevel": "HSK 4",
    "wordCount": 112,
    "sampleWords": [
      {
        "id": 297546,
        "hanzi": "乡亲",
        "pinyin": "xiāng qīn",
        "meaningVi": "người đồng hương (cùng làng)",
        "levelCode": "7-9"
      },
      {
        "id": 296840,
        "hanzi": "书记",
        "pinyin": "shūjì",
        "meaningVi": "thư ký (quan chức đứng đầu của một chi nhánh đảng xã hội chủ nghĩa hoặc cộng sản)",
        "levelCode": "7-9"
      },
      {
        "id": 289354,
        "hanzi": "乱",
        "pinyin": "luàn",
        "meaningVi": "trong tình trạng rối loạn",
        "levelCode": "3"
      },
      {
        "id": 288392,
        "hanzi": "交",
        "pinyin": "jiāo",
        "meaningVi": "giao nộp",
        "levelCode": "2"
      },
      {
        "id": 289239,
        "hanzi": "交往",
        "pinyin": "jiāowǎng",
        "meaningVi": "giao thiệp (với)",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 28,
    "slug": "bua-an-va-thoi-quen-an-uong",
    "titleVi": "Bữa ăn & Thói quen ăn uống",
    "titleZh": "一日三餐",
    "icon": "🍽️",
    "description": "Bữa sáng, bữa trưa, bữa tối, đói, no, khẩu vị.",
    "hskLevel": "HSK 1",
    "wordCount": 61,
    "sampleWords": [
      {
        "id": 288851,
        "hanzi": "中餐",
        "pinyin": "Zhōng cān",
        "meaningVi": "bữa trưa",
        "levelCode": "2"
      },
      {
        "id": 290194,
        "hanzi": "伙",
        "pinyin": "huǒ",
        "meaningVi": "bữa ăn (viết tắt của 伙食)",
        "levelCode": "4"
      },
      {
        "id": 294880,
        "hanzi": "伙食",
        "pinyin": "huǒ shí",
        "meaningVi": "thức ăn",
        "levelCode": "7-9"
      },
      {
        "id": 323513,
        "hanzi": "佳肴",
        "pinyin": "jiāyáo",
        "meaningVi": "món ăn ngon",
        "levelCode": "7-9"
      },
      {
        "id": 293242,
        "hanzi": "便饭",
        "pinyin": "biàn fàn",
        "meaningVi": "bữa ăn thường",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 29,
    "slug": "mon-an-trung-hoa",
    "titleVi": "Món ăn Trung Hoa",
    "titleZh": "中华美食",
    "icon": "🥟",
    "description": "Sủi cảo, bánh bao, vịt quay, lẩu, mì kéo, đậu phụ.",
    "hskLevel": "HSK 2",
    "wordCount": 34,
    "sampleWords": [
      {
        "id": 313812,
        "hanzi": "下面",
        "pinyin": "xiàmiàn",
        "meaningVi": "bên dưới",
        "levelCode": "2"
      },
      {
        "id": 297808,
        "hanzi": "严密",
        "pinyin": "yán mì",
        "meaningVi": "nghiêm ngặt",
        "levelCode": "7-9"
      },
      {
        "id": 294168,
        "hanzi": "分泌",
        "pinyin": "fēn mì",
        "meaningVi": "tiết ra",
        "levelCode": "7-9"
      },
      {
        "id": 287644,
        "hanzi": "包子",
        "pinyin": "bāo zi",
        "meaningVi": "bánh bao (bánh hấp có nhân)",
        "levelCode": "1"
      },
      {
        "id": 293086,
        "hanzi": "奥秘",
        "pinyin": "ào mì",
        "meaningVi": "bí mật",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 30,
    "slug": "do-uong-va-tra",
    "titleVi": "Đồ uống & Trà",
    "titleZh": "饮料与茶饮",
    "icon": "🍵",
    "description": "Nước lọc, trà xanh, trà sữa, nước ép, cà phê.",
    "hskLevel": "HSK 1",
    "wordCount": 214,
    "sampleWords": [
      {
        "id": 316693,
        "hanzi": "中外",
        "pinyin": "zhōngwài",
        "meaningVi": "Trung-Ngoại",
        "levelCode": "5"
      },
      {
        "id": 324139,
        "hanzi": "举棋不定",
        "pinyin": "jǔqí-búdìng",
        "meaningVi": "do dự không biết đi nước nào (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 324158,
        "hanzi": "五湖四海",
        "pinyin": "wǔhú-sìhǎi",
        "meaningVi": "khắp mọi miền đất nước",
        "levelCode": "7-9"
      },
      {
        "id": 293563,
        "hanzi": "仇",
        "pinyin": "choú, qiú",
        "meaningVi": "(choú) hận",
        "levelCode": "7-9"
      },
      {
        "id": 288575,
        "hanzi": "全国",
        "pinyin": "quán guó",
        "meaningVi": "cả nước",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 31,
    "slug": "ruou-va-bia",
    "titleVi": "Rượu & Bia",
    "titleZh": "酒水与酒吧",
    "icon": "🍺",
    "description": "Bia, rượu vang, rượu trắng, say xỉn, cạn ly, quán bar.",
    "hskLevel": "HSK 3",
    "wordCount": 48,
    "sampleWords": [
      {
        "id": 298514,
        "hanzi": "专柜",
        "pinyin": "zhuānguì",
        "meaningVi": "quầy bán hàng dành riêng cho một loại sản phẩm nhất định (ví dụ: rượu)",
        "levelCode": "7-9"
      },
      {
        "id": 318792,
        "hanzi": "中暑",
        "pinyin": "zhòngshǔ",
        "meaningVi": "bị cảm nắng",
        "levelCode": "6"
      },
      {
        "id": 292062,
        "hanzi": "出台",
        "pinyin": "chū tái",
        "meaningVi": "chính thức ra mắt (chính sách, chương trình,...)",
        "levelCode": "6"
      },
      {
        "id": 289421,
        "hanzi": "啤酒",
        "pinyin": "píjiǔ",
        "meaningVi": "bia (từ mượn)",
        "levelCode": "3"
      },
      {
        "id": 297470,
        "hanzi": "喜酒",
        "pinyin": "xǐ jiǔ",
        "meaningVi": "tiệc cưới",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 32,
    "slug": "trai-cay-va-hoa-qua",
    "titleVi": "Trái cây & Hoa quả",
    "titleZh": "水果与采摘",
    "icon": "🍎",
    "description": "Táo, chuối, dưa hấu, nho, cam, dâu tây, xoài.",
    "hskLevel": "HSK 1",
    "wordCount": 62,
    "sampleWords": [
      {
        "id": 298448,
        "hanzi": "中庸",
        "pinyin": "zhōng yōng",
        "meaningVi": "trung dung (Nho giáo)",
        "levelCode": "7-9"
      },
      {
        "id": 289446,
        "hanzi": "亲",
        "pinyin": "qīn, qìng",
        "meaningVi": "(qīn) cha mẹ",
        "levelCode": "3"
      },
      {
        "id": 288911,
        "hanzi": "保证",
        "pinyin": "bǎozhèng",
        "meaningVi": "bảo đảm",
        "levelCode": "3"
      },
      {
        "id": 296531,
        "hanzi": "儒学",
        "pinyin": "Rú xué",
        "meaningVi": "Nho giáo",
        "levelCode": "7-9"
      },
      {
        "id": 296530,
        "hanzi": "儒家",
        "pinyin": "rújiā",
        "meaningVi": "Trường phái Nho gia, do Khổng Tử 孔子 (551-479 TCN) và Mạnh Tử 孟子 (khoảng 372-khoảng 289 TCN) sáng lập",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 33,
    "slug": "rau-cu-qua",
    "titleVi": "Rau củ quả",
    "titleZh": "新鲜蔬菜",
    "icon": "🥦",
    "description": "Bắp cải, rau muống, cà rốt, khoai tây, cà chua, nấm.",
    "hskLevel": "HSK 2",
    "wordCount": 31,
    "sampleWords": [
      {
        "id": 293928,
        "hanzi": "丁",
        "pinyin": "dīng",
        "meaningVi": "nam trưởng thành",
        "levelCode": "7-9"
      },
      {
        "id": 296107,
        "hanzi": "刨",
        "pinyin": "páo, bào",
        "meaningVi": "(páo) đào",
        "levelCode": "7-9"
      },
      {
        "id": 293789,
        "hanzi": "单薄",
        "pinyin": "dān bó",
        "meaningVi": "yếu ớt",
        "levelCode": "7-9"
      },
      {
        "id": 296003,
        "hanzi": "南瓜",
        "pinyin": "nán guā",
        "meaningVi": "bí ngô",
        "levelCode": "7-9"
      },
      {
        "id": 291618,
        "hanzi": "土豆",
        "pinyin": "tǔdòu",
        "meaningVi": "khoai tây (",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 34,
    "slug": "thit-va-hai-san",
    "titleVi": "Thịt & Hải sản",
    "titleZh": "肉类与海鲜",
    "icon": "🥩",
    "description": "Thịt bò, thịt lợn, thịt gà, cá, tôm, cua, mực.",
    "hskLevel": "HSK 2",
    "wordCount": 96,
    "sampleWords": [
      {
        "id": 293928,
        "hanzi": "丁",
        "pinyin": "dīng",
        "meaningVi": "nam trưởng thành",
        "levelCode": "7-9"
      },
      {
        "id": 287746,
        "hanzi": "个",
        "pinyin": "gè",
        "meaningVi": "(lượng từ dùng trước danh từ không có lượng từ cụ thể)",
        "levelCode": "1"
      },
      {
        "id": 289116,
        "hanzi": "个人",
        "pinyin": "gèrén",
        "meaningVi": "cá nhân",
        "levelCode": "3"
      },
      {
        "id": 290126,
        "hanzi": "个体",
        "pinyin": "gètǐ",
        "meaningVi": "cá nhân",
        "levelCode": "4"
      },
      {
        "id": 290125,
        "hanzi": "个别",
        "pinyin": "gèbié",
        "meaningVi": "cá nhân",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 35,
    "slug": "gia-vi-va-huong-vi",
    "titleVi": "Gia vị & Hương vị",
    "titleZh": "调料与口味",
    "icon": "🧂",
    "description": "Chua, cay, mặn, ngọt, đắng, muối, đường, giấm.",
    "hskLevel": "HSK 2",
    "wordCount": 196,
    "sampleWords": [
      {
        "id": 288781,
        "hanzi": "一直",
        "pinyin": "yīzhí",
        "meaningVi": "thẳng (theo đường thẳng)",
        "levelCode": "2"
      },
      {
        "id": 291738,
        "hanzi": "一路",
        "pinyin": "yīlù",
        "meaningVi": "cả chặng đường",
        "levelCode": "5"
      },
      {
        "id": 292865,
        "hanzi": "一路上",
        "pinyin": "yīlùshàng",
        "meaningVi": "trên đường đi",
        "levelCode": "6"
      },
      {
        "id": 288769,
        "hanzi": "一路顺风",
        "pinyin": "yī lù shùn fēng",
        "meaningVi": "chúc lên đường bình an (thành ngữ)",
        "levelCode": "2"
      },
      {
        "id": 297491,
        "hanzi": "下海",
        "pinyin": "xià hǎi",
        "meaningVi": "ra biển",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 36,
    "slug": "trang-mieng-va-banh-ngot",
    "titleVi": "Tráng miệng & Bánh ngọt",
    "titleZh": "甜品与糕点",
    "icon": "🍰",
    "description": "Bánh kem, kem, chè, sô cô la, bánh quy, thạch.",
    "hskLevel": "HSK 2",
    "wordCount": 42,
    "sampleWords": [
      {
        "id": 292616,
        "hanzi": "三明治",
        "pinyin": "sān míng zhì",
        "meaningVi": "bánh sandwich (từ mượn)",
        "levelCode": "6"
      },
      {
        "id": 289819,
        "hanzi": "主动",
        "pinyin": "zhǔdòng",
        "meaningVi": "chủ động",
        "levelCode": "3"
      },
      {
        "id": 318726,
        "hanzi": "元宵",
        "pinyin": "yuánxiāo",
        "meaningVi": "Lễ Hội Đèn Lồng",
        "levelCode": "6"
      },
      {
        "id": 293277,
        "hanzi": "冰棍儿",
        "pinyin": "bīnggùnr",
        "meaningVi": "kem que",
        "levelCode": "7-9"
      },
      {
        "id": 314380,
        "hanzi": "冰激凌",
        "pinyin": "bīngjīlíng",
        "meaningVi": "kem",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 37,
    "slug": "nha-hang-va-goi-mon",
    "titleVi": "Nhà hàng & Gọi món",
    "titleZh": "餐厅与点餐",
    "icon": "🛎️",
    "description": "Đặt bàn, xem thực đơn, gọi món, phục vụ, tính tiền.",
    "hskLevel": "HSK 2",
    "wordCount": 94,
    "sampleWords": [
      {
        "id": 318845,
        "hanzi": "下单",
        "pinyin": "xiàdān",
        "meaningVi": "đặt hàng",
        "levelCode": "6"
      },
      {
        "id": 297499,
        "hanzi": "下手",
        "pinyin": "xiàshǒu",
        "meaningVi": "bắt đầu",
        "levelCode": "7-9"
      },
      {
        "id": 287711,
        "hanzi": "东",
        "pinyin": "dōng",
        "meaningVi": "phía đông",
        "levelCode": "1"
      },
      {
        "id": 288688,
        "hanzi": "为",
        "pinyin": "wéi",
        "meaningVi": "làm (với tư cách)",
        "levelCode": "2"
      },
      {
        "id": 317007,
        "hanzi": "乘务员",
        "pinyin": "chéngwùyuán",
        "meaningVi": "nhân viên phục vụ trên máy bay, tàu hỏa, thuyền, v.v.",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 38,
    "slug": "quan-ca-phe-va-tra-sua",
    "titleVi": "Quán cà phê & Trà sữa",
    "titleZh": "咖啡厅与奶茶",
    "icon": "☕",
    "description": "Không gian quán, cỡ cốc, độ ngọt, trân châu, mang đi.",
    "hskLevel": "HSK 2",
    "wordCount": 3,
    "sampleWords": [
      {
        "id": 288571,
        "hanzi": "取",
        "pinyin": "qǔ",
        "meaningVi": "lấy",
        "levelCode": "2"
      },
      {
        "id": 288674,
        "hanzi": "外卖",
        "pinyin": "wài mài",
        "meaningVi": "(của nhà hàng) cung cấp bữa ăn mang về hoặc giao hàng tận nhà",
        "levelCode": "2"
      },
      {
        "id": 313872,
        "hanzi": "奶茶",
        "pinyin": "nǎichá",
        "meaningVi": "trà sữa",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 39,
    "slug": "nau-an-va-che-bien",
    "titleVi": "Nấu ăn & Chế biến",
    "titleZh": "烹饪技法",
    "icon": "🔪",
    "description": "Thái, băm, ướp, khuấy, đun sôi, ninh hầm, gia nhiệt.",
    "hskLevel": "HSK 3",
    "wordCount": 177,
    "sampleWords": [
      {
        "id": 289717,
        "hanzi": "一切",
        "pinyin": "yīqiè",
        "meaningVi": "mọi thứ",
        "levelCode": "3"
      },
      {
        "id": 296217,
        "hanzi": "七嘴八舌",
        "pinyin": "qī zuǐ bā shé",
        "meaningVi": "thảo luận sôi nổi với mọi người nói cùng lúc",
        "levelCode": "7-9"
      },
      {
        "id": 296937,
        "hanzi": "丝",
        "pinyin": "sī",
        "meaningVi": "lụa",
        "levelCode": "7-9"
      },
      {
        "id": 290694,
        "hanzi": "严",
        "pinyin": "yán",
        "meaningVi": "chặt (được niêm phong kín)",
        "levelCode": "4"
      },
      {
        "id": 297808,
        "hanzi": "严密",
        "pinyin": "yán mì",
        "meaningVi": "nghiêm ngặt",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 40,
    "slug": "dung-cu-an-uong",
    "titleVi": "Dụng cụ ăn uống",
    "titleZh": "餐具",
    "icon": "🥢",
    "description": "Bát đũa, thìa, dĩa, dao ăn, cốc, đĩa, khăn ăn.",
    "hskLevel": "HSK 2",
    "wordCount": 71,
    "sampleWords": [
      {
        "id": 291891,
        "hanzi": "专辑",
        "pinyin": "zhuānjí",
        "meaningVi": "album",
        "levelCode": "5"
      },
      {
        "id": 292070,
        "hanzi": "传出",
        "pinyin": "chuán chū",
        "meaningVi": "truyền ra ngoài",
        "levelCode": "6"
      },
      {
        "id": 290148,
        "hanzi": "光盘",
        "pinyin": "guāng pán",
        "meaningVi": "đĩa CD",
        "levelCode": "4"
      },
      {
        "id": 294529,
        "hanzi": "光碟",
        "pinyin": "guāngdié",
        "meaningVi": "đĩa quang",
        "levelCode": "7-9"
      },
      {
        "id": 319123,
        "hanzi": "兑",
        "pinyin": "duì",
        "meaningVi": "đổi tiền",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 41,
    "slug": "thuc-an-nhanh-va-an-vat",
    "titleVi": "Thức ăn nhanh & Ăn vặt",
    "titleZh": "快餐与小吃",
    "icon": "🍔",
    "description": "Bánh mì kẹp, gà rán, khoai tây chiên, pizza, xiên que.",
    "hskLevel": "HSK 2",
    "wordCount": 7,
    "sampleWords": [
      {
        "id": 290658,
        "hanzi": "小吃",
        "pinyin": "xiǎo chī",
        "meaningVi": "đồ ăn vặt",
        "levelCode": "4"
      },
      {
        "id": 288452,
        "hanzi": "快餐",
        "pinyin": "kuài cān",
        "meaningVi": "thức ăn nhanh",
        "levelCode": "2"
      },
      {
        "id": 294481,
        "hanzi": "瓜子",
        "pinyin": "guā zǐ",
        "meaningVi": "hạt dưa",
        "levelCode": "7-9"
      },
      {
        "id": 292671,
        "hanzi": "薯条",
        "pinyin": "shǔ tiáo",
        "meaningVi": "khoai tây chiên",
        "levelCode": "6"
      },
      {
        "id": 292670,
        "hanzi": "薯片",
        "pinyin": "shǔ piàn",
        "meaningVi": "khoai tây chiên giòn",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 42,
    "slug": "dinh-duong-va-an-kieng",
    "titleVi": "Dinh dưỡng & Ăn kiêng",
    "titleZh": "营养与节食",
    "icon": "🥗",
    "description": "Calo, vitamin, chất đạm, ăn chay, giảm cân.",
    "hskLevel": "HSK 4",
    "wordCount": 15,
    "sampleWords": [
      {
        "id": 293315,
        "hanzi": "不正之风",
        "pinyin": "bù zhèng zhī fēng",
        "meaningVi": "xu hướng không lành mạnh",
        "levelCode": "7-9"
      },
      {
        "id": 290910,
        "hanzi": "不良",
        "pinyin": "bùliáng",
        "meaningVi": "xấu",
        "levelCode": "5"
      },
      {
        "id": 291235,
        "hanzi": "健全",
        "pinyin": "jiànquán",
        "meaningVi": "khỏe mạnh",
        "levelCode": "5"
      },
      {
        "id": 290232,
        "hanzi": "减肥",
        "pinyin": "jiǎnféi",
        "meaningVi": "giảm cân",
        "levelCode": "4"
      },
      {
        "id": 288432,
        "hanzi": "卡",
        "pinyin": "kǎ, qiǎ",
        "meaningVi": "(kǎ) dừng",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 43,
    "slug": "quan-ao-va-thoi-trang",
    "titleVi": "Quần áo & Thời trang",
    "titleZh": "服装与时尚",
    "icon": "👗",
    "description": "Áo sơ mi, áo khoác, quần bò, váy, đầm, phong cách.",
    "hskLevel": "HSK 1",
    "wordCount": 122,
    "sampleWords": [
      {
        "id": 291746,
        "hanzi": "一身",
        "pinyin": "yī shēn",
        "meaningVi": "toàn thân",
        "levelCode": "5"
      },
      {
        "id": 287946,
        "hanzi": "上网",
        "pinyin": "shàng wǎng",
        "meaningVi": "lên mạng",
        "levelCode": "1"
      },
      {
        "id": 289502,
        "hanzi": "上衣",
        "pinyin": "shàng yī",
        "meaningVi": "áo khoác",
        "levelCode": "3"
      },
      {
        "id": 313500,
        "hanzi": "件",
        "pinyin": "jiàn",
        "meaningVi": "món",
        "levelCode": "1"
      },
      {
        "id": 323921,
        "hanzi": "体裁",
        "pinyin": "tǐcái",
        "meaningVi": "thể loại",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 44,
    "slug": "giay-dep-va-phu-kien",
    "titleVi": "Giày dép & Phụ kiện",
    "titleZh": "鞋帽与配饰",
    "icon": "👟",
    "description": "Giày thể thao, mũ nón, khăn quàng, thắt lưng, tất.",
    "hskLevel": "HSK 2",
    "wordCount": 72,
    "sampleWords": [
      {
        "id": 288052,
        "hanzi": "一",
        "pinyin": "yī",
        "meaningVi": "một",
        "levelCode": "1"
      },
      {
        "id": 291740,
        "hanzi": "一下子",
        "pinyin": "yī xià zi",
        "meaningVi": "trong chốc lát",
        "levelCode": "5"
      },
      {
        "id": 297976,
        "hanzi": "一体",
        "pinyin": "yītǐ",
        "meaningVi": "một thể thống nhất",
        "levelCode": "7-9"
      },
      {
        "id": 289717,
        "hanzi": "一切",
        "pinyin": "yīqiè",
        "meaningVi": "mọi thứ",
        "levelCode": "3"
      },
      {
        "id": 290717,
        "hanzi": "一律",
        "pinyin": "yīlù",
        "meaningVi": "giống nhau",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 45,
    "slug": "my-pham-va-cham-soc-da",
    "titleVi": "Mỹ phẩm & Chăm sóc da",
    "titleZh": "美妆与护肤",
    "icon": "💄",
    "description": "Son môi, phấn, kem dưỡng, mặt nạ, trang điểm.",
    "hskLevel": "HSK 3",
    "wordCount": 33,
    "sampleWords": [
      {
        "id": 290668,
        "hanzi": "兴奋",
        "pinyin": "xīngfèn",
        "meaningVi": "phấn khích",
        "levelCode": "4"
      },
      {
        "id": 297686,
        "hanzi": "兴高采烈",
        "pinyin": "xìng gāo cǎi liè",
        "meaningVi": "vui vẻ và phấn khích (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 322916,
        "hanzi": "再接再厉",
        "pinyin": "zàijiē-zàilì",
        "meaningVi": "tiếp tục phấn đấu (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 289981,
        "hanzi": "刺激",
        "pinyin": "cìjī",
        "meaningVi": "kích thích",
        "levelCode": "4"
      },
      {
        "id": 295622,
        "hanzi": "力求",
        "pinyin": "lìqiú",
        "meaningVi": "nỗ lực hết mình",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 46,
    "slug": "sieu-thi-va-cua-hang",
    "titleVi": "Siêu thị & Cửa hàng",
    "titleZh": "超市与商店",
    "icon": "🛒",
    "description": "Xe đẩy, quầy thu ngân, khuyến mãi, giảm giá, kệ hàng.",
    "hskLevel": "HSK 2",
    "wordCount": 46,
    "sampleWords": [
      {
        "id": 316598,
        "hanzi": "一次性",
        "pinyin": "yícìxìng",
        "meaningVi": "một lần",
        "levelCode": "5"
      },
      {
        "id": 290474,
        "hanzi": "上门",
        "pinyin": "shàng mén",
        "meaningVi": "ghé thăm",
        "levelCode": "4"
      },
      {
        "id": 318845,
        "hanzi": "下单",
        "pinyin": "xiàdān",
        "meaningVi": "đặt hàng",
        "levelCode": "6"
      },
      {
        "id": 298516,
        "hanzi": "专卖店",
        "pinyin": "zhuān mài diàn",
        "meaningVi": "cửa hàng chuyên doanh",
        "levelCode": "7-9"
      },
      {
        "id": 287853,
        "hanzi": "买",
        "pinyin": "mǎi",
        "meaningVi": "mua",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 47,
    "slug": "cho-truyen-thong-va-mac-ca",
    "titleVi": "Chợ truyền thống & Mặc cả",
    "titleZh": "传统菜市与讨价还价",
    "icon": "🧺",
    "description": "Đi chợ, tươi sống, cân ký, trả giá, mặc cả, đắt rẻ.",
    "hskLevel": "HSK 2",
    "wordCount": 110,
    "sampleWords": [
      {
        "id": 297294,
        "hanzi": "万古长青",
        "pinyin": "wàn gǔ cháng qīng",
        "meaningVi": "giữ mãi tươi mới",
        "levelCode": "7-9"
      },
      {
        "id": 290636,
        "hanzi": "下降",
        "pinyin": "xiàjiàng",
        "meaningVi": "giảm",
        "levelCode": "4"
      },
      {
        "id": 287840,
        "hanzi": "两",
        "pinyin": "liǎng",
        "meaningVi": "hai",
        "levelCode": "1"
      },
      {
        "id": 295668,
        "hanzi": "亮相",
        "pinyin": "liàng xiàng",
        "meaningVi": "tạo dáng (kinh kịch Trung Quốc)",
        "levelCode": "7-9"
      },
      {
        "id": 313606,
        "hanzi": "便宜",
        "pinyin": "piányi",
        "meaningVi": "rẻ",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 48,
    "slug": "gia-ca-va-chi-phi",
    "titleVi": "Giá cả & Chi phí",
    "titleZh": "价格与开销",
    "icon": "🏷️",
    "description": "Bao nhiêu tiền, giá gốc, chiết khấu, đắt đỏ, tiết kiệm.",
    "hskLevel": "HSK 1",
    "wordCount": 309,
    "sampleWords": [
      {
        "id": 288058,
        "hanzi": "一块儿",
        "pinyin": "yīkuàir",
        "meaningVi": "(dạng er hóa) một khối",
        "levelCode": "1"
      },
      {
        "id": 297905,
        "hanzi": "一线",
        "pinyin": "yī xiàn",
        "meaningVi": "tiền tuyến",
        "levelCode": "7-9"
      },
      {
        "id": 296608,
        "hanzi": "上任",
        "pinyin": "shàngrèn",
        "meaningVi": "nhậm chức",
        "levelCode": "7-9"
      },
      {
        "id": 296612,
        "hanzi": "上调",
        "pinyin": "shàng tiáo",
        "meaningVi": "tăng (giá)",
        "levelCode": "7-9"
      },
      {
        "id": 297502,
        "hanzi": "下调",
        "pinyin": "xià diào, xià tiáo",
        "meaningVi": "(xià diào) giáng chức",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 49,
    "slug": "phuong-thuc-thanh-toan",
    "titleVi": "Phương thức thanh toán",
    "titleZh": "支付方式",
    "icon": "💳",
    "description": "Tiền mặt, thẻ ngân hàng, quét mã QR, chuyển khoản.",
    "hskLevel": "HSK 2",
    "wordCount": 32,
    "sampleWords": [
      {
        "id": 297965,
        "hanzi": "一卡通",
        "pinyin": "Yī kǎ tōng",
        "meaningVi": "tên của các loại thẻ thông minh không tiếp xúc, nổi bật là Yikatong (chủ yếu cho giao thông công cộng ở Bắc Kinh) và iPASS (chủ yếu cho giao thông công cộng ở Đài Loan)",
        "levelCode": "7-9"
      },
      {
        "id": 315210,
        "hanzi": "不便",
        "pinyin": "búbiàn",
        "meaningVi": "bất tiện",
        "levelCode": "4"
      },
      {
        "id": 294253,
        "hanzi": "付款",
        "pinyin": "fùkuǎn",
        "meaningVi": "trả một số tiền",
        "levelCode": "7-9"
      },
      {
        "id": 288739,
        "hanzi": "信用卡",
        "pinyin": "xìnyòngkǎ",
        "meaningVi": "thẻ tín dụng",
        "levelCode": "2"
      },
      {
        "id": 316889,
        "hanzi": "充值",
        "pinyin": "chōngzhí",
        "meaningVi": "nạp tiền (vào thẻ)",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 50,
    "slug": "tien-te-va-doi-tien",
    "titleVi": "Tiền tệ & Đổi tiền",
    "titleZh": "货币与兑换",
    "icon": "💴",
    "description": "Nhân dân tệ, Việt Nam đồng, Đô la, tỷ giá hối đoái.",
    "hskLevel": "HSK 2",
    "wordCount": 186,
    "sampleWords": [
      {
        "id": 290717,
        "hanzi": "一律",
        "pinyin": "yīlù",
        "meaningVi": "giống nhau",
        "levelCode": "4"
      },
      {
        "id": 292872,
        "hanzi": "一时",
        "pinyin": "yī shí",
        "meaningVi": "một khoảng thời gian",
        "levelCode": "6"
      },
      {
        "id": 290719,
        "hanzi": "一致",
        "pinyin": "yīzhì",
        "meaningVi": "nhất quán",
        "levelCode": "4"
      },
      {
        "id": 297923,
        "hanzi": "一面",
        "pinyin": "yīmiàn",
        "meaningVi": "một bên",
        "levelCode": "7-9"
      },
      {
        "id": 292871,
        "hanzi": "一齐",
        "pinyin": "yīqí",
        "meaningVi": "cùng một lúc",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 51,
    "slug": "mua-sam-online",
    "titleVi": "Mua sắm online",
    "titleZh": "网购与电商",
    "icon": "📦",
    "description": "Đặt hàng, giỏ hàng, giao hàng, đánh giá sản phẩm.",
    "hskLevel": "HSK 3",
    "wordCount": 65,
    "sampleWords": [
      {
        "id": 318845,
        "hanzi": "下单",
        "pinyin": "xiàdān",
        "meaningVi": "đặt hàng",
        "levelCode": "6"
      },
      {
        "id": 294447,
        "hanzi": "估算",
        "pinyin": "gū suàn",
        "meaningVi": "sự đánh giá",
        "levelCode": "7-9"
      },
      {
        "id": 314801,
        "hanzi": "估计",
        "pinyin": "gūjì",
        "meaningVi": "ước tính",
        "levelCode": "4"
      },
      {
        "id": 293857,
        "hanzi": "低估",
        "pinyin": "dī gū",
        "meaningVi": "đánh giá thấp",
        "levelCode": "7-9"
      },
      {
        "id": 297095,
        "hanzi": "体谅",
        "pinyin": "tǐliàng",
        "meaningVi": "thấu hiểu",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 52,
    "slug": "doi-tra-hang-va-bao-hanh",
    "titleVi": "Đổi trả hàng & Bảo hành",
    "titleZh": "售后与退换货",
    "icon": "🔄",
    "description": "Đổi hàng, trả hàng, hoàn tiền, phiếu bảo hành.",
    "hskLevel": "HSK 4",
    "wordCount": 113,
    "sampleWords": [
      {
        "id": 291729,
        "hanzi": "一流",
        "pinyin": "yī liú",
        "meaningVi": "chất lượng hàng đầu",
        "levelCode": "5"
      },
      {
        "id": 316268,
        "hanzi": "优质",
        "pinyin": "yōuzhì",
        "meaningVi": "chất lượng cao",
        "levelCode": "5"
      },
      {
        "id": 296592,
        "hanzi": "伤残",
        "pinyin": "shāng cán",
        "meaningVi": "tàn tật",
        "levelCode": "7-9"
      },
      {
        "id": 290848,
        "hanzi": "作出",
        "pinyin": "zuòchū",
        "meaningVi": "đưa ra",
        "levelCode": "4"
      },
      {
        "id": 318695,
        "hanzi": "保修",
        "pinyin": "bǎoxiū",
        "meaningVi": "bảo đảm giữ đối tượng trong tình trạng tốt",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 53,
    "slug": "qua-tang-va-ky-niem",
    "titleVi": "Quà tặng & Kỷ niệm",
    "titleZh": "礼物与纪念品",
    "icon": "🎁",
    "description": "Tặng quà, gói quà, thiệp chúc mừng, quà lưu niệm.",
    "hskLevel": "HSK 2",
    "wordCount": 82,
    "sampleWords": [
      {
        "id": 290594,
        "hanzi": "万一",
        "pinyin": "wànyī",
        "meaningVi": "phòng khi",
        "levelCode": "4"
      },
      {
        "id": 291976,
        "hanzi": "不料",
        "pinyin": "búliào",
        "meaningVi": "một cách bất ngờ",
        "levelCode": "6"
      },
      {
        "id": 289239,
        "hanzi": "交往",
        "pinyin": "jiāowǎng",
        "meaningVi": "giao thiệp (với)",
        "levelCode": "3"
      },
      {
        "id": 295084,
        "hanzi": "交集",
        "pinyin": "jiāo jí",
        "meaningVi": "(cảm xúc đa dạng) xảy ra đồng thời",
        "levelCode": "7-9"
      },
      {
        "id": 295174,
        "hanzi": "介入",
        "pinyin": "jièrù",
        "meaningVi": "can thiệp",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 54,
    "slug": "hang-hieu-va-thoi-thuong",
    "titleVi": "Hàng hiệu & Thời thượng",
    "titleZh": "奢侈品与潮流",
    "icon": "✨",
    "description": "Thương hiệu nổi tiếng, hàng cao cấp, xa xỉ phẩm.",
    "hskLevel": "HSK 4",
    "wordCount": 42,
    "sampleWords": [
      {
        "id": 293315,
        "hanzi": "不正之风",
        "pinyin": "bù zhèng zhī fēng",
        "meaningVi": "xu hướng không lành mạnh",
        "levelCode": "7-9"
      },
      {
        "id": 323282,
        "hanzi": "代言",
        "pinyin": "dàiyán",
        "meaningVi": "làm người phát ngôn",
        "levelCode": "7-9"
      },
      {
        "id": 292573,
        "hanzi": "倾向",
        "pinyin": "qīngxiàng",
        "meaningVi": "xu hướng",
        "levelCode": "6"
      },
      {
        "id": 293969,
        "hanzi": "动向",
        "pinyin": "dòngxiàng",
        "meaningVi": "xu hướng",
        "levelCode": "7-9"
      },
      {
        "id": 291058,
        "hanzi": "动态",
        "pinyin": "dòngtài",
        "meaningVi": "chuyển động",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 55,
    "slug": "giao-thong-cong-cong",
    "titleVi": "Giao thông công cộng",
    "titleZh": "公共交通",
    "icon": "🚏",
    "description": "Tuyến đường, điểm dừng, chuyển tuyến, vé xe.",
    "hskLevel": "HSK 2",
    "wordCount": 74,
    "sampleWords": [
      {
        "id": 297965,
        "hanzi": "一卡通",
        "pinyin": "Yī kǎ tōng",
        "meaningVi": "tên của các loại thẻ thông minh không tiếp xúc, nổi bật là Yikatong (chủ yếu cho giao thông công cộng ở Bắc Kinh) và iPASS (chủ yếu cho giao thông công cộng ở Đài Loan)",
        "levelCode": "7-9"
      },
      {
        "id": 315157,
        "hanzi": "乘坐",
        "pinyin": "chéngzuò",
        "meaningVi": "đi (phương tiện giao thông)",
        "levelCode": "4"
      },
      {
        "id": 315005,
        "hanzi": "乘客",
        "pinyin": "chéngkè",
        "meaningVi": "hành khách",
        "levelCode": "4"
      },
      {
        "id": 289237,
        "hanzi": "交警",
        "pinyin": "jiāo jǐng",
        "meaningVi": "cảnh sát giao thông (viết tắt của 交通警察)",
        "levelCode": "3"
      },
      {
        "id": 288395,
        "hanzi": "交通",
        "pinyin": "jiāotōng",
        "meaningVi": "kết nối",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 56,
    "slug": "taxi-va-goi-xe-cong-nghe",
    "titleVi": "Taxi & Gọi xe công nghệ",
    "titleZh": "出租车与网约车",
    "icon": "🚕",
    "description": "Vẫy xe, ứng dụng gọi xe, đồng hồ tính tiền, tài xế.",
    "hskLevel": "HSK 2",
    "wordCount": 13,
    "sampleWords": [
      {
        "id": 297930,
        "hanzi": "仪表",
        "pinyin": "yí biǎo",
        "meaningVi": "diện mạo",
        "levelCode": "7-9"
      },
      {
        "id": 313619,
        "hanzi": "出租车",
        "pinyin": "chūzūchē",
        "meaningVi": "taxi",
        "levelCode": "1"
      },
      {
        "id": 288625,
        "hanzi": "司机",
        "pinyin": "sījī",
        "meaningVi": "tài xế",
        "levelCode": "2"
      },
      {
        "id": 315143,
        "hanzi": "师傅",
        "pinyin": "shīfu",
        "meaningVi": "bậc thầy",
        "levelCode": "4"
      },
      {
        "id": 297522,
        "hanzi": "弦",
        "pinyin": "xián",
        "meaningVi": "dây cung",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 57,
    "slug": "xe-dap-va-xe-may",
    "titleVi": "Xe đạp & Xe máy",
    "titleZh": "自行车与电动车",
    "icon": "🚲",
    "description": "Đi xe đạp, xe đạp công cộng, xe máy điện, mũ bảo hiểm.",
    "hskLevel": "HSK 2",
    "wordCount": 15,
    "sampleWords": [
      {
        "id": 292826,
        "hanzi": "修车",
        "pinyin": "xiū chē",
        "meaningVi": "sửa xe đạp (ô tô, v.v.)",
        "levelCode": "6"
      },
      {
        "id": 288659,
        "hanzi": "停车场",
        "pinyin": "tíngchēchǎng",
        "meaningVi": "bãi đỗ xe",
        "levelCode": "2"
      },
      {
        "id": 298319,
        "hanzi": "折叠",
        "pinyin": "zhé dié",
        "meaningVi": "gấp",
        "levelCode": "7-9"
      },
      {
        "id": 291364,
        "hanzi": "摩托",
        "pinyin": "mó tuō",
        "meaningVi": "mô tơ (từ mượn)",
        "levelCode": "5"
      },
      {
        "id": 317664,
        "hanzi": "摩托车",
        "pinyin": "mótuōchē",
        "meaningVi": "(từ mượn) xe máy",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 58,
    "slug": "o-to-va-lai-xe",
    "titleVi": "Ô tô & Lái xe",
    "titleZh": "汽车与自驾",
    "icon": "🚗",
    "description": "Bằng lái xe, vô lăng, phanh, chân ga, đổ xăng, đỗ xe.",
    "hskLevel": "HSK 3",
    "wordCount": 30,
    "sampleWords": [
      {
        "id": 287943,
        "hanzi": "上车",
        "pinyin": "shàng chē",
        "meaningVi": "lên (xe buýt, tàu, ô tô, v.v.)",
        "levelCode": "1"
      },
      {
        "id": 288017,
        "hanzi": "下车",
        "pinyin": "xiàchē",
        "meaningVi": "xuống (xe buýt, tàu, ô tô,...)",
        "levelCode": "1"
      },
      {
        "id": 290959,
        "hanzi": "乘车",
        "pinyin": "chéng chē",
        "meaningVi": "đi (xe ô tô hoặc xe ngựa)",
        "levelCode": "5"
      },
      {
        "id": 290864,
        "hanzi": "保养",
        "pinyin": "bǎoyǎng",
        "meaningVi": "chăm sóc sức khỏe tốt (hoặc giữ gìn)",
        "levelCode": "5"
      },
      {
        "id": 292826,
        "hanzi": "修车",
        "pinyin": "xiū chē",
        "meaningVi": "sửa xe đạp (ô tô, v.v.)",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 59,
    "slug": "may-bay-va-san-bay",
    "titleVi": "Máy bay & Sân bay",
    "titleZh": "飞机与机场",
    "icon": "✈️",
    "description": "Check-in, thẻ lên máy bay, cất cánh, hạ cánh, hành lý.",
    "hskLevel": "HSK 2",
    "wordCount": 39,
    "sampleWords": [
      {
        "id": 317007,
        "hanzi": "乘务员",
        "pinyin": "chéngwùyuán",
        "meaningVi": "nhân viên phục vụ trên máy bay, tàu hỏa, thuyền, v.v.",
        "levelCode": "5"
      },
      {
        "id": 295153,
        "hanzi": "劫持",
        "pinyin": "jié chí",
        "meaningVi": "bắt cóc",
        "levelCode": "7-9"
      },
      {
        "id": 288123,
        "hanzi": "坐",
        "pinyin": "zuò",
        "meaningVi": "ngồi",
        "levelCode": "1"
      },
      {
        "id": 322856,
        "hanzi": "失事",
        "pinyin": "shīshì",
        "meaningVi": "(đối với máy bay, tàu thuyền, v.v.) gặp tai nạn (rơi máy bay, đắm tàu, va chạm xe cộ, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 295444,
        "hanzi": "客机",
        "pinyin": "kè jī",
        "meaningVi": "máy bay chở khách",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 60,
    "slug": "tau-hoa-va-ga-tau",
    "titleVi": "Tàu hỏa & Ga tàu",
    "titleZh": "火车与高铁",
    "icon": "🚄",
    "description": "Tàu cao tốc, toa tàu, ghế mềm, giường nằm, sân ga.",
    "hskLevel": "HSK 2",
    "wordCount": 16,
    "sampleWords": [
      {
        "id": 317007,
        "hanzi": "乘务员",
        "pinyin": "chéngwùyuán",
        "meaningVi": "nhân viên phục vụ trên máy bay, tàu hỏa, thuyền, v.v.",
        "levelCode": "5"
      },
      {
        "id": 290834,
        "hanzi": "准时",
        "pinyin": "zhǔn shí",
        "meaningVi": "đúng giờ",
        "levelCode": "4"
      },
      {
        "id": 315397,
        "hanzi": "动车",
        "pinyin": "dòngchē",
        "meaningVi": "(Trung Quốc) tàu cao tốc (loại D hoặc C)",
        "levelCode": "4"
      },
      {
        "id": 292774,
        "hanzi": "卧铺",
        "pinyin": "wò pù",
        "meaningVi": "giường nằm (trên tàu)",
        "levelCode": "6"
      },
      {
        "id": 288249,
        "hanzi": "地铁站",
        "pinyin": "dì tiě zhàn",
        "meaningVi": "ga tàu điện ngầm",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 61,
    "slug": "ve-xe-va-dat-cho",
    "titleVi": "Vé xe & Đặt chỗ",
    "titleZh": "票务与预订",
    "icon": "🎫",
    "description": "Mua vé, đặt chỗ, hủy vé, đổi vé, vé khứ hồi.",
    "hskLevel": "HSK 2",
    "wordCount": 22,
    "sampleWords": [
      {
        "id": 296533,
        "hanzi": "入场券",
        "pinyin": "rù chǎng quàn",
        "meaningVi": "vé vào cửa",
        "levelCode": "7-9"
      },
      {
        "id": 292593,
        "hanzi": "券",
        "pinyin": "quàn",
        "meaningVi": "trái phiếu (đặc biệt là tài liệu chia làm hai, mỗi bên giữ một nửa)",
        "levelCode": "6"
      },
      {
        "id": 296837,
        "hanzi": "售票",
        "pinyin": "shòupiào",
        "meaningVi": "bán vé",
        "levelCode": "7-9"
      },
      {
        "id": 315379,
        "hanzi": "售票员",
        "pinyin": "shòupiàoyuán",
        "meaningVi": "nhân viên bán vé",
        "levelCode": "4"
      },
      {
        "id": 290047,
        "hanzi": "定",
        "pinyin": "dìng",
        "meaningVi": "cố định",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 62,
    "slug": "hoi-duong-va-chi-duong",
    "titleVi": "Hỏi đường & Chỉ đường",
    "titleZh": "问路与指路",
    "icon": "🧭",
    "description": "Đi thẳng, rẽ trái, rẽ phải, qua ngã tư, quay đầu.",
    "hskLevel": "HSK 1",
    "wordCount": 31,
    "sampleWords": [
      {
        "id": 297971,
        "hanzi": "一旁",
        "pinyin": "yī páng",
        "meaningVi": "để sang một bên",
        "levelCode": "7-9"
      },
      {
        "id": 293406,
        "hanzi": "侧面",
        "pinyin": "cè miàn",
        "meaningVi": "bên cạnh",
        "levelCode": "7-9"
      },
      {
        "id": 297668,
        "hanzi": "信件",
        "pinyin": "xìn jiàn",
        "meaningVi": "bức thư (gửi qua đường bưu điện)",
        "levelCode": "7-9"
      },
      {
        "id": 315042,
        "hanzi": "再说",
        "pinyin": "zàishuō",
        "meaningVi": "nói lại",
        "levelCode": "4"
      },
      {
        "id": 315375,
        "hanzi": "十字路口",
        "pinyin": "shízì lùkǒu",
        "meaningVi": "ngã tư",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 63,
    "slug": "luat-giao-thong-va-bien-bao",
    "titleVi": "Luật giao thông & Biển báo",
    "titleZh": "交通规则与标志",
    "icon": "🚦",
    "description": "Đèn xanh đèn đỏ, vạch kẻ đường, tốc độ tối đa, xử phạt.",
    "hskLevel": "HSK 3",
    "wordCount": 45,
    "sampleWords": [
      {
        "id": 297297,
        "hanzi": "万无一失",
        "pinyin": "wàn wú yī shī",
        "meaningVi": "chắc chắn",
        "levelCode": "7-9"
      },
      {
        "id": 296345,
        "hanzi": "侵害",
        "pinyin": "qīnhài",
        "meaningVi": "xâm phạm",
        "levelCode": "7-9"
      },
      {
        "id": 292570,
        "hanzi": "侵犯",
        "pinyin": "qīnfàn",
        "meaningVi": "xâm phạm",
        "levelCode": "6"
      },
      {
        "id": 288905,
        "hanzi": "保安",
        "pinyin": "bǎo ān",
        "meaningVi": "bảo đảm an ninh công cộng",
        "levelCode": "3"
      },
      {
        "id": 288910,
        "hanzi": "保险",
        "pinyin": "bǎoxiǎn",
        "meaningVi": "bảo hiểm",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 64,
    "slug": "tai-nan-va-sua-xe",
    "titleVi": "Tai nạn & Sửa xe",
    "titleZh": "事故与维修",
    "icon": "🔧",
    "description": "Va chạm, hỏng xe, chết máy, cứu hộ, xưởng sửa chữa.",
    "hskLevel": "HSK 4",
    "wordCount": 29,
    "sampleWords": [
      {
        "id": 289540,
        "hanzi": "事故",
        "pinyin": "shìgù",
        "meaningVi": "tai nạn",
        "levelCode": "3"
      },
      {
        "id": 292826,
        "hanzi": "修车",
        "pinyin": "xiū chē",
        "meaningVi": "sửa xe đạp (ô tô, v.v.)",
        "levelCode": "6"
      },
      {
        "id": 293545,
        "hanzi": "冲撞",
        "pinyin": "chōng zhuàng",
        "meaningVi": "va chạm",
        "levelCode": "7-9"
      },
      {
        "id": 290966,
        "hanzi": "冲突",
        "pinyin": "chōngtú",
        "meaningVi": "xung đột",
        "levelCode": "5"
      },
      {
        "id": 292061,
        "hanzi": "出事",
        "pinyin": "chū shì",
        "meaningVi": "gặp tai nạn",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 65,
    "slug": "tac-duong-va-gio-cao-diem",
    "titleVi": "Tắc đường & Giờ cao điểm",
    "titleZh": "堵车与高峰期",
    "icon": "🚗🚙",
    "description": "Kẹt xe, ùn ứ, giờ tan tầm, chậm trễ, đông đúc.",
    "hskLevel": "HSK 2",
    "wordCount": 27,
    "sampleWords": [
      {
        "id": 319491,
        "hanzi": "不及",
        "pinyin": "bùjí",
        "meaningVi": "không đạt",
        "levelCode": "7-9"
      },
      {
        "id": 297299,
        "hanzi": "亡羊补牢",
        "pinyin": "wáng yáng bǔ láo",
        "meaningVi": "nghĩa đen: sửa chuồng sau khi cừu bị mất (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 291660,
        "hanzi": "先后",
        "pinyin": "xiānhòu",
        "meaningVi": "sớm hay muộn",
        "levelCode": "5"
      },
      {
        "id": 289203,
        "hanzi": "及时",
        "pinyin": "jíshí",
        "meaningVi": "kịp thời",
        "levelCode": "3"
      },
      {
        "id": 290056,
        "hanzi": "堵车",
        "pinyin": "dǔ chē",
        "meaningVi": "kẹt xe",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 66,
    "slug": "khach-san-va-nha-nghi",
    "titleVi": "Khách sạn & Nhà nghỉ",
    "titleZh": "酒店与住宿",
    "icon": "🏨",
    "description": "Lễ tân, loại phòng, chìa khóa phòng, dịch vụ phòng.",
    "hskLevel": "HSK 2",
    "wordCount": 37,
    "sampleWords": [
      {
        "id": 291727,
        "hanzi": "业务",
        "pinyin": "yèwù",
        "meaningVi": "kinh doanh",
        "levelCode": "5"
      },
      {
        "id": 297431,
        "hanzi": "五星级",
        "pinyin": "wǔ xīng jí",
        "meaningVi": "khách sạn năm sao",
        "levelCode": "7-9"
      },
      {
        "id": 315404,
        "hanzi": "入住",
        "pinyin": "rùzhù",
        "meaningVi": "nhận phòng (ở khách sạn, v.v.)",
        "levelCode": "4"
      },
      {
        "id": 296298,
        "hanzi": "前台",
        "pinyin": "qián tái",
        "meaningVi": "sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 294414,
        "hanzi": "功",
        "pinyin": "gōng",
        "meaningVi": "hành động hoặc dịch vụ có công",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 67,
    "slug": "danh-lam-thang-canh",
    "titleVi": "Danh lam thắng cảnh",
    "titleZh": "名胜古迹与景点",
    "icon": "🏞️",
    "description": "Di tích lịch sử, cảnh đẹp thiên nhiên, bảo tàng, chùa chiền.",
    "hskLevel": "HSK 3",
    "wordCount": 34,
    "sampleWords": [
      {
        "id": 293695,
        "hanzi": "丛林",
        "pinyin": "cónglín",
        "meaningVi": "rừng rậm",
        "levelCode": "7-9"
      },
      {
        "id": 318702,
        "hanzi": "免税",
        "pinyin": "miǎnshuì",
        "meaningVi": "không chịu thuế (của chùa, hoàng gia, v.v.)",
        "levelCode": "6"
      },
      {
        "id": 288318,
        "hanzi": "公园",
        "pinyin": "gōngyuán",
        "meaningVi": "công viên (dành cho công chúng giải trí)",
        "levelCode": "2"
      },
      {
        "id": 298224,
        "hanzi": "再现",
        "pinyin": "zài xiàn",
        "meaningVi": "tái tạo",
        "levelCode": "7-9"
      },
      {
        "id": 290898,
        "hanzi": "博物馆",
        "pinyin": "bówùguǎn",
        "meaningVi": "bảo tàng",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 68,
    "slug": "hanh-ly-va-chuan-bi",
    "titleVi": "Hành lý & Chuẩn bị du lịch",
    "titleZh": "行李与行前准备",
    "icon": "🧳",
    "description": "Vali, sắp xếp đồ đạc, đồ dùng cần thiết, đồ dùng xách tay.",
    "hskLevel": "HSK 2",
    "wordCount": 68,
    "sampleWords": [
      {
        "id": 296601,
        "hanzi": "上场",
        "pinyin": "shàngchǎng",
        "meaningVi": "lên sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 313651,
        "hanzi": "做饭",
        "pinyin": "zuò fàn",
        "meaningVi": "chuẩn bị bữa ăn",
        "levelCode": "1"
      },
      {
        "id": 289302,
        "hanzi": "克服",
        "pinyin": "kèfú",
        "meaningVi": "(cố gắng) khắc phục (khó khăn, v.v.)",
        "levelCode": "3"
      },
      {
        "id": 288111,
        "hanzi": "准备",
        "pinyin": "zhǔnbèi",
        "meaningVi": "sự chuẩn bị",
        "levelCode": "1"
      },
      {
        "id": 293697,
        "hanzi": "凑合",
        "pinyin": "còuhe",
        "meaningVi": "tập hợp",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 69,
    "slug": "ho-chieu-va-thi-thuc",
    "titleVi": "Hộ chiếu & Thị thực (Visa)",
    "titleZh": "护照与签证",
    "icon": "🛂",
    "description": "Hộ chiếu, xin visa, gia hạn visa, đại sứ quán.",
    "hskLevel": "HSK 3",
    "wordCount": 22,
    "sampleWords": [
      {
        "id": 288479,
        "hanzi": "亮",
        "pinyin": "liàng",
        "meaningVi": "sáng",
        "levelCode": "2"
      },
      {
        "id": 315331,
        "hanzi": "使馆",
        "pinyin": "shǐguǎn",
        "meaningVi": "lãnh sự quán",
        "levelCode": "4"
      },
      {
        "id": 317006,
        "hanzi": "保质期",
        "pinyin": "bǎozhìqī",
        "meaningVi": "thời hạn sử dụng",
        "levelCode": "5"
      },
      {
        "id": 318530,
        "hanzi": "入境",
        "pinyin": "rùjìng",
        "meaningVi": "nhập cảnh",
        "levelCode": "6"
      },
      {
        "id": 316762,
        "hanzi": "到期",
        "pinyin": "dàoqī",
        "meaningVi": "đến hạn (khoản vay, v.v.)",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 70,
    "slug": "hai-quan-va-xuat-nhap-canh",
    "titleVi": "Hải quan & Xuất nhập cảnh",
    "titleZh": "海关与出入境",
    "icon": "🛃",
    "description": "Cửa khẩu, tờ khai hải quan, kiểm tra an ninh.",
    "hskLevel": "HSK 4",
    "wordCount": 54,
    "sampleWords": [
      {
        "id": 288905,
        "hanzi": "保安",
        "pinyin": "bǎo ān",
        "meaningVi": "bảo đảm an ninh công cộng",
        "levelCode": "3"
      },
      {
        "id": 318530,
        "hanzi": "入境",
        "pinyin": "rùjìng",
        "meaningVi": "nhập cảnh",
        "levelCode": "6"
      },
      {
        "id": 294497,
        "hanzi": "关税",
        "pinyin": "guān shuì",
        "meaningVi": "thuế hải quan",
        "levelCode": "7-9"
      },
      {
        "id": 318500,
        "hanzi": "出境",
        "pinyin": "chūjìng",
        "meaningVi": "rời khỏi một quốc gia hoặc khu vực",
        "levelCode": "6"
      },
      {
        "id": 288432,
        "hanzi": "卡",
        "pinyin": "kǎ, qiǎ",
        "meaningVi": "(kǎ) dừng",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 71,
    "slug": "ban-do-va-huong-dan-vien",
    "titleVi": "Bản đồ & Hướng dẫn viên",
    "titleZh": "导游与地图",
    "icon": "🗺️",
    "description": "Bản đồ du lịch, tour du lịch, hướng dẫn viên, lộ trình.",
    "hskLevel": "HSK 3",
    "wordCount": 37,
    "sampleWords": [
      {
        "id": 318758,
        "hanzi": "一帆风顺",
        "pinyin": "yìfān-fēngshùn",
        "meaningVi": "thuận buồm xuôi gió (thành ngữ)",
        "levelCode": "6"
      },
      {
        "id": 288768,
        "hanzi": "一路平安",
        "pinyin": "yī lù píng ān",
        "meaningVi": "có chuyến đi vui vẻ",
        "levelCode": "2"
      },
      {
        "id": 291303,
        "hanzi": "亏",
        "pinyin": "kuī",
        "meaningVi": "lỗ (tiền)",
        "levelCode": "5"
      },
      {
        "id": 287804,
        "hanzi": "介绍",
        "pinyin": "jièshào",
        "meaningVi": "giới thiệu (ai với ai)",
        "levelCode": "1"
      },
      {
        "id": 292055,
        "hanzi": "出动",
        "pinyin": "chū dòng",
        "meaningVi": "bắt đầu chuyến đi",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 72,
    "slug": "du-lich-bien-va-nghi-duong",
    "titleVi": "Du lịch biển & Nghỉ dưỡng",
    "titleZh": "海滨与度假",
    "icon": "🏖️",
    "description": "Bãi biển, cát trắng, tắm biển, lướt sóng, resort.",
    "hskLevel": "HSK 3",
    "wordCount": 62,
    "sampleWords": [
      {
        "id": 297491,
        "hanzi": "下海",
        "pinyin": "xià hǎi",
        "meaningVi": "ra biển",
        "levelCode": "7-9"
      },
      {
        "id": 291326,
        "hanzi": "两岸",
        "pinyin": "liǎngàn",
        "meaningVi": "song phương",
        "levelCode": "5"
      },
      {
        "id": 294191,
        "hanzi": "丰满",
        "pinyin": "fēng mǎn",
        "meaningVi": "đầy đặn",
        "levelCode": "7-9"
      },
      {
        "id": 318773,
        "hanzi": "人山人海",
        "pinyin": "rénshān-rénhǎi",
        "meaningVi": "(thành ngữ) đám đông",
        "levelCode": "6"
      },
      {
        "id": 293694,
        "hanzi": "从早到晚",
        "pinyin": "cóngzǎodàowǎn",
        "meaningVi": "từ sáng đến tối",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 73,
    "slug": "du-lich-kham-pha-va-leo-nui",
    "titleVi": "Du lịch khám phá & Leo núi",
    "titleZh": "探险与登山",
    "icon": "🧗",
    "description": "Phượt, leo núi, cắm trại, đi bộ đường dài, mạo hiểm.",
    "hskLevel": "HSK 4",
    "wordCount": 51,
    "sampleWords": [
      {
        "id": 322778,
        "hanzi": "不言而喻",
        "pinyin": "bùyán’éryù",
        "meaningVi": "không cần nói cũng hiểu",
        "levelCode": "7-9"
      },
      {
        "id": 293241,
        "hanzi": "便道",
        "pinyin": "biàn dào",
        "meaningVi": "vỉa hè",
        "levelCode": "7-9"
      },
      {
        "id": 297515,
        "hanzi": "先天",
        "pinyin": "xiāntiān",
        "meaningVi": "giai đoạn phôi thai (đối lập với 后天)",
        "levelCode": "7-9"
      },
      {
        "id": 318026,
        "hanzi": "冒险",
        "pinyin": "màoxiǎn",
        "meaningVi": "mạo hiểm",
        "levelCode": "6"
      },
      {
        "id": 294069,
        "hanzi": "发掘",
        "pinyin": "fājué",
        "meaningVi": "khai quật",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 74,
    "slug": "nhiep-anh-va-chup-anh-du-lich",
    "titleVi": "Nhiếp ảnh & Chụp ảnh du lịch",
    "titleZh": "摄影与拍照",
    "icon": "📸",
    "description": "Máy ảnh, chụp hình, tạo dáng, góc chụp, bức ảnh.",
    "hskLevel": "HSK 2",
    "wordCount": 19,
    "sampleWords": [
      {
        "id": 295668,
        "hanzi": "亮相",
        "pinyin": "liàng xiàng",
        "meaningVi": "tạo dáng (kinh kịch Trung Quốc)",
        "levelCode": "7-9"
      },
      {
        "id": 291149,
        "hanzi": "光线",
        "pinyin": "guāngxiàn",
        "meaningVi": "tia sáng",
        "levelCode": "5"
      },
      {
        "id": 291049,
        "hanzi": "典礼",
        "pinyin": "diǎnlǐ",
        "meaningVi": "lễ",
        "levelCode": "5"
      },
      {
        "id": 316809,
        "hanzi": "合影",
        "pinyin": "héyǐng",
        "meaningVi": "chụp ảnh chung",
        "levelCode": "5"
      },
      {
        "id": 288861,
        "hanzi": "周年",
        "pinyin": "zhōunián",
        "meaningVi": "kỷ niệm",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 75,
    "slug": "mua-qua-luu-niem",
    "titleVi": "Mua quà lưu niệm",
    "titleZh": "购买纪念品",
    "icon": "🎎",
    "description": "Đặc sản địa phương, đồ thủ công mỹ nghệ, quà tặng.",
    "hskLevel": "HSK 3",
    "wordCount": 54,
    "sampleWords": [
      {
        "id": 318554,
        "hanzi": "习俗",
        "pinyin": "xísú",
        "meaningVi": "phong tục",
        "levelCode": "6"
      },
      {
        "id": 297546,
        "hanzi": "乡亲",
        "pinyin": "xiāng qīn",
        "meaningVi": "người đồng hương (cùng làng)",
        "levelCode": "7-9"
      },
      {
        "id": 287853,
        "hanzi": "买",
        "pinyin": "mǎi",
        "meaningVi": "mua",
        "levelCode": "1"
      },
      {
        "id": 288394,
        "hanzi": "交朋友",
        "pinyin": "jiāo péng you",
        "meaningVi": "kết bạn",
        "levelCode": "2"
      },
      {
        "id": 289473,
        "hanzi": "人工",
        "pinyin": "réngōng",
        "meaningVi": "nhân tạo",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 76,
    "slug": "trai-nghiem-van-hoa-dia-phuong",
    "titleVi": "Trải nghiệm văn hóa địa phương",
    "titleZh": "体验民俗文化",
    "icon": "🏮",
    "description": "Phong tục tập quán, thưởng thức nghệ thuật dân gian.",
    "hskLevel": "HSK 4",
    "wordCount": 73,
    "sampleWords": [
      {
        "id": 293008,
        "hanzi": "主流",
        "pinyin": "zhǔliú",
        "meaningVi": "dòng chính (của một con sông)",
        "levelCode": "6"
      },
      {
        "id": 318554,
        "hanzi": "习俗",
        "pinyin": "xísú",
        "meaningVi": "phong tục",
        "levelCode": "6"
      },
      {
        "id": 288704,
        "hanzi": "习惯",
        "pinyin": "xíguàn",
        "meaningVi": "thói quen",
        "levelCode": "2"
      },
      {
        "id": 296481,
        "hanzi": "人文",
        "pinyin": "rénwén",
        "meaningVi": "nhân văn",
        "levelCode": "7-9"
      },
      {
        "id": 291470,
        "hanzi": "人物",
        "pinyin": "rénwù",
        "meaningVi": "người",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 77,
    "slug": "thue-nha-va-mua-nha",
    "titleVi": "Thuê nhà & Mua nhà",
    "titleZh": "租房与买房",
    "icon": "🏢",
    "description": "Thuê nhà, hợp đồng thuê, tiền cọc, chủ nhà, môi giới.",
    "hskLevel": "HSK 3",
    "wordCount": 41,
    "sampleWords": [
      {
        "id": 321717,
        "hanzi": "不动产",
        "pinyin": "búdòngchǎn",
        "meaningVi": "bất động sản",
        "levelCode": "7-9"
      },
      {
        "id": 287711,
        "hanzi": "东",
        "pinyin": "dōng",
        "meaningVi": "phía đông",
        "levelCode": "1"
      },
      {
        "id": 293954,
        "hanzi": "东道主",
        "pinyin": "dōng dào zhǔ",
        "meaningVi": "chủ nhà",
        "levelCode": "7-9"
      },
      {
        "id": 290811,
        "hanzi": "中介",
        "pinyin": "zhōng jiè",
        "meaningVi": "làm trung gian",
        "levelCode": "4"
      },
      {
        "id": 298484,
        "hanzi": "主",
        "pinyin": "zhǔ",
        "meaningVi": "chủ",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 78,
    "slug": "phong-khach-va-noi-that",
    "titleVi": "Phòng khách & Nội thất",
    "titleZh": "客厅与家具",
    "icon": "🛋️",
    "description": "Sofa, bàn trà, tivi, kệ sách, bình hoa, tranh treo tường.",
    "hskLevel": "HSK 2",
    "wordCount": 103,
    "sampleWords": [
      {
        "id": 298442,
        "hanzi": "中国画",
        "pinyin": "Zhōng guó huà",
        "meaningVi": "tranh Trung Quốc",
        "levelCode": "7-9"
      },
      {
        "id": 289769,
        "hanzi": "争",
        "pinyin": "zhēng",
        "meaningVi": "cố gắng giành",
        "levelCode": "3"
      },
      {
        "id": 298354,
        "hanzi": "争先恐后",
        "pinyin": "zhēngxiānkǒnghòu",
        "meaningVi": "tranh nhau làm trước và sợ bị làm sau (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 298351,
        "hanzi": "争分夺秒",
        "pinyin": "zhēng fēn duó miǎo",
        "meaningVi": "nghĩa đen: tranh từng phút, cướp từng giây (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 289770,
        "hanzi": "争取",
        "pinyin": "zhēngqǔ",
        "meaningVi": "đấu tranh giành",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 79,
    "slug": "phong-ngu-va-giuong-chieu",
    "titleVi": "Phòng ngủ & Giường chiếu",
    "titleZh": "卧室与床上用品",
    "icon": "🛏️",
    "description": "Giường, đệm, chăn, ga, gối, tủ quần áo, bàn trang điểm.",
    "hskLevel": "HSK 2",
    "wordCount": 38,
    "sampleWords": [
      {
        "id": 295691,
        "hanzi": "临床",
        "pinyin": "línchuáng",
        "meaningVi": "lâm sàng",
        "levelCode": "7-9"
      },
      {
        "id": 293133,
        "hanzi": "伴奏",
        "pinyin": "bànzòu",
        "meaningVi": "đệm nhạc",
        "levelCode": "7-9"
      },
      {
        "id": 297853,
        "hanzi": "养活",
        "pinyin": "yǎng huo",
        "meaningVi": "chu cấp",
        "levelCode": "7-9"
      },
      {
        "id": 288379,
        "hanzi": "加油",
        "pinyin": "jiāyóu",
        "meaningVi": "thêm dầu",
        "levelCode": "2"
      },
      {
        "id": 291642,
        "hanzi": "卧室",
        "pinyin": "wò shì",
        "meaningVi": "phòng ngủ",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 80,
    "slug": "ban-cong-va-san-vuon",
    "titleVi": "Ban công & Sân vườn",
    "titleZh": "阳台与花园",
    "icon": "🪴",
    "description": "Trồng hoa, tưới cây, phơi quần áo, hóng gió, cây cảnh.",
    "hskLevel": "HSK 3",
    "wordCount": 4,
    "sampleWords": [
      {
        "id": 291396,
        "hanzi": "盆",
        "pinyin": "pén",
        "meaningVi": "chậu",
        "levelCode": "5"
      },
      {
        "id": 294756,
        "hanzi": "花卉",
        "pinyin": "huā huì",
        "meaningVi": "hoa và cây cảnh",
        "levelCode": "7-9"
      },
      {
        "id": 288356,
        "hanzi": "花园",
        "pinyin": "huāyuán",
        "meaningVi": "vườn",
        "levelCode": "2"
      },
      {
        "id": 290705,
        "hanzi": "阳台",
        "pinyin": "yángtái",
        "meaningVi": "ban công",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 81,
    "slug": "thiet-bi-dien-tu-gia-dung",
    "titleVi": "Thiết bị điện tử gia dụng",
    "titleZh": "家用电器",
    "icon": "🔌",
    "description": "Tủ lạnh, máy giặt, điều hòa, lò vi sóng, bình siêu tốc.",
    "hskLevel": "HSK 2",
    "wordCount": 9,
    "sampleWords": [
      {
        "id": 314289,
        "hanzi": "冰箱",
        "pinyin": "bīngxiāng",
        "meaningVi": "tủ lạnh",
        "levelCode": "3"
      },
      {
        "id": 292808,
        "hanzi": "协调",
        "pinyin": "xiétiáo",
        "meaningVi": "phối hợp",
        "levelCode": "6"
      },
      {
        "id": 317035,
        "hanzi": "家电",
        "pinyin": "jiādiàn",
        "meaningVi": "đồ điện gia dụng",
        "levelCode": "5"
      },
      {
        "id": 292769,
        "hanzi": "微波炉",
        "pinyin": "wēi bō lú",
        "meaningVi": "lò vi sóng",
        "levelCode": "6"
      },
      {
        "id": 296892,
        "hanzi": "水壶",
        "pinyin": "shuǐ hú",
        "meaningVi": "ấm đun nước",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 82,
    "slug": "sua-chua-nha-cua",
    "titleVi": "Sửa chữa nhà cửa",
    "titleZh": "房屋维修",
    "icon": "🔨",
    "description": "Sửa điện nước, rò rỉ, thợ sửa, búa, đinh, kìm, tua vít.",
    "hskLevel": "HSK 4",
    "wordCount": 66,
    "sampleWords": [
      {
        "id": 296592,
        "hanzi": "伤残",
        "pinyin": "shāng cán",
        "meaningVi": "tàn tật",
        "levelCode": "7-9"
      },
      {
        "id": 289695,
        "hanzi": "修",
        "pinyin": "xiū",
        "meaningVi": "trang trí",
        "levelCode": "3"
      },
      {
        "id": 291703,
        "hanzi": "修复",
        "pinyin": "xiū fù",
        "meaningVi": "khôi phục",
        "levelCode": "5"
      },
      {
        "id": 290678,
        "hanzi": "修理",
        "pinyin": "xiūlǐ",
        "meaningVi": "sửa chữa",
        "levelCode": "4"
      },
      {
        "id": 297708,
        "hanzi": "修补",
        "pinyin": "xiū bǔ",
        "meaningVi": "sửa chữa",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 83,
    "slug": "tien-dien-nuoc-va-dich-vu",
    "titleVi": "Tiền điện nước & Dịch vụ",
    "titleZh": "水电与物业费",
    "icon": "💡",
    "description": "Hóa đơn điện nước, phí quản lý tòa nhà, gas, mạng internet.",
    "hskLevel": "HSK 3",
    "wordCount": 13,
    "sampleWords": [
      {
        "id": 290016,
        "hanzi": "单",
        "pinyin": "dān",
        "meaningVi": "hóa đơn",
        "levelCode": "4"
      },
      {
        "id": 290074,
        "hanzi": "发票",
        "pinyin": "fā piào",
        "meaningVi": "hóa đơn",
        "levelCode": "4"
      },
      {
        "id": 287813,
        "hanzi": "开",
        "pinyin": "kāi",
        "meaningVi": "mở (ngoại động từ hoặc nội động từ)",
        "levelCode": "1"
      },
      {
        "id": 292409,
        "hanzi": "开关",
        "pinyin": "kāi guān",
        "meaningVi": "công tắc điện",
        "levelCode": "6"
      },
      {
        "id": 292663,
        "hanzi": "手续费",
        "pinyin": "shǒuxùfèi",
        "meaningVi": "phí dịch vụ",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 84,
    "slug": "chuyen-nha-va-don-dep",
    "titleVi": "Chuyển nhà & Dọn dẹp",
    "titleZh": "搬家与大扫除",
    "icon": "📦",
    "description": "Đóng thùng, thuê xe chở đồ, dọn dẹp nhà cửa, quét nhà.",
    "hskLevel": "HSK 3",
    "wordCount": 23,
    "sampleWords": [
      {
        "id": 297957,
        "hanzi": "一干二净",
        "pinyin": "yī gān èr jìng",
        "meaningVi": "hoàn toàn (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 292382,
        "hanzi": "井",
        "pinyin": "jǐng",
        "meaningVi": "cái giếng",
        "levelCode": "6"
      },
      {
        "id": 292385,
        "hanzi": "净",
        "pinyin": "jìng",
        "meaningVi": "sạch",
        "levelCode": "6"
      },
      {
        "id": 290862,
        "hanzi": "包装",
        "pinyin": "bāozhuāng",
        "meaningVi": "đóng gói",
        "levelCode": "5"
      },
      {
        "id": 288432,
        "hanzi": "卡",
        "pinyin": "kǎ, qiǎ",
        "meaningVi": "(kǎ) dừng",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 85,
    "slug": "khu-dan-cu-va-hang-xom",
    "titleVi": "Khu dân cư & Hàng xóm",
    "titleZh": "社区与邻里",
    "icon": "🏘️",
    "description": "Khu đô thị, ban quản lý, bảo vệ, hàng xóm láng giềng.",
    "hskLevel": "HSK 3",
    "wordCount": 54,
    "sampleWords": [
      {
        "id": 289818,
        "hanzi": "主持",
        "pinyin": "zhǔchí",
        "meaningVi": "phụ trách",
        "levelCode": "3"
      },
      {
        "id": 288904,
        "hanzi": "保",
        "pinyin": "bǎo",
        "meaningVi": "phòng thủ",
        "levelCode": "3"
      },
      {
        "id": 293155,
        "hanzi": "保佑",
        "pinyin": "bǎoyòu",
        "meaningVi": "phù hộ và bảo vệ",
        "levelCode": "7-9"
      },
      {
        "id": 291931,
        "hanzi": "保健",
        "pinyin": "bǎojiàn",
        "meaningVi": "bảo vệ sức khỏe",
        "levelCode": "6"
      },
      {
        "id": 290863,
        "hanzi": "保卫",
        "pinyin": "bǎo wèi",
        "meaningVi": "phòng thủ",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 86,
    "slug": "truong-hoc-va-lop-hoc",
    "titleVi": "Trường học & Lớp học",
    "titleZh": "学校与课堂",
    "icon": "🏫",
    "description": "Trường mầm non, tiểu học, trung học, đại học, giảng đường.",
    "hskLevel": "HSK 1",
    "wordCount": 173,
    "sampleWords": [
      {
        "id": 291736,
        "hanzi": "一旦",
        "pinyin": "yīdàn",
        "meaningVi": "trong trường hợp (điều gì đó xảy ra)",
        "levelCode": "5"
      },
      {
        "id": 297294,
        "hanzi": "万古长青",
        "pinyin": "wàn gǔ cháng qīng",
        "meaningVi": "giữ mãi tươi mới",
        "levelCode": "7-9"
      },
      {
        "id": 287940,
        "hanzi": "上",
        "pinyin": "shàng",
        "meaningVi": "(hình thức kết hợp) trên",
        "levelCode": "1"
      },
      {
        "id": 292627,
        "hanzi": "上市",
        "pinyin": "shàngshì",
        "meaningVi": "ra mắt thị trường (sản phẩm mới)",
        "levelCode": "6"
      },
      {
        "id": 296606,
        "hanzi": "上流",
        "pinyin": "shàng liú",
        "meaningVi": "tầng lớp thượng lưu",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 87,
    "slug": "dung-cu-hoc-tap-va-sach-vo",
    "titleVi": "Dụng cụ học tập & Sách vở",
    "titleZh": "文具与书本",
    "icon": "✏️",
    "description": "Bút, thước kẻ, tẩy, vở ghi, sách giáo khoa, cặp sách.",
    "hskLevel": "HSK 1",
    "wordCount": 155,
    "sampleWords": [
      {
        "id": 292629,
        "hanzi": "上演",
        "pinyin": "shàngyǎn",
        "meaningVi": "chiếu (phim)",
        "levelCode": "6"
      },
      {
        "id": 320933,
        "hanzi": "下行",
        "pinyin": "xiàxíng",
        "meaningVi": "(của xe lửa) đi xuống (tức là rời thủ đô)",
        "levelCode": "7-9"
      },
      {
        "id": 289829,
        "hanzi": "专题",
        "pinyin": "zhuāntí",
        "meaningVi": "chủ đề cụ thể (được đề cập trong sách, bài giảng, chương trình TV, v.v.)",
        "levelCode": "3"
      },
      {
        "id": 293279,
        "hanzi": "丙",
        "pinyin": "bǐng",
        "meaningVi": "thứ ba trong mười Thiên Can 十天干",
        "levelCode": "7-9"
      },
      {
        "id": 320935,
        "hanzi": "丛",
        "pinyin": "cóng",
        "meaningVi": "đám",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 88,
    "slug": "mon-hoc-va-chuyen-nganh",
    "titleVi": "Môn học & Chuyên ngành",
    "titleZh": "科目与专业",
    "icon": "📚",
    "description": "Toán, văn, tiếng Anh, tiếng Trung, lịch sử, kinh tế.",
    "hskLevel": "HSK 2",
    "wordCount": 317,
    "sampleWords": [
      {
        "id": 293928,
        "hanzi": "丁",
        "pinyin": "dīng",
        "meaningVi": "nam trưởng thành",
        "levelCode": "7-9"
      },
      {
        "id": 287941,
        "hanzi": "上班",
        "pinyin": "shàngbān",
        "meaningVi": "đi làm",
        "levelCode": "1"
      },
      {
        "id": 320253,
        "hanzi": "上行",
        "pinyin": "shàngxíng",
        "meaningVi": "(tàu) hướng lên (tức là về hướng thủ đô)",
        "levelCode": "7-9"
      },
      {
        "id": 297501,
        "hanzi": "下台",
        "pinyin": "xiàtái",
        "meaningVi": "rời khỏi sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 320933,
        "hanzi": "下行",
        "pinyin": "xiàxíng",
        "meaningVi": "(của xe lửa) đi xuống (tức là rời thủ đô)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 89,
    "slug": "giao-vien-va-hoc-sinh",
    "titleVi": "Giáo viên & Học sinh",
    "titleZh": "老师与学生",
    "icon": "👩‍🏫",
    "description": "Thầy cô giáo, học sinh, sinh viên, cán sự lớp.",
    "hskLevel": "HSK 1",
    "wordCount": 37,
    "sampleWords": [
      {
        "id": 288107,
        "hanzi": "中学生",
        "pinyin": "zhōng xué shēng",
        "meaningVi": "học sinh trung học",
        "levelCode": "1"
      },
      {
        "id": 318553,
        "hanzi": "产出",
        "pinyin": "chǎnchū",
        "meaningVi": "sản xuất (sinh viên tốt nghiệp, sữa mẹ, chất thải độc hại, ý tưởng sáng tạo, v.v.)",
        "levelCode": "6"
      },
      {
        "id": 288882,
        "hanzi": "作文",
        "pinyin": "zuòwén",
        "meaningVi": "viết bài văn",
        "levelCode": "2"
      },
      {
        "id": 288125,
        "hanzi": "做",
        "pinyin": "zuò",
        "meaningVi": "làm",
        "levelCode": "1"
      },
      {
        "id": 288023,
        "hanzi": "先生",
        "pinyin": "xiānshēng",
        "meaningVi": "giáo viên",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 90,
    "slug": "thi-cu-va-diem-so",
    "titleVi": "Thi cử & Điểm số",
    "titleZh": "考试与成绩",
    "icon": "📝",
    "description": "Kỳ thi, đề thi, làm bài, điểm thi, đỗ, trượt, xếp hạng.",
    "hskLevel": "HSK 2",
    "wordCount": 284,
    "sampleWords": [
      {
        "id": 288062,
        "hanzi": "一点儿",
        "pinyin": "yīdiǎnr",
        "meaningVi": "(dạng er hóa) một chút",
        "levelCode": "1"
      },
      {
        "id": 296601,
        "hanzi": "上场",
        "pinyin": "shàngchǎng",
        "meaningVi": "lên sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 297487,
        "hanzi": "下场",
        "pinyin": "xià chǎng, xià chang",
        "meaningVi": "(xià chǎng) rời khỏi (sân khấu, phòng thi, sân đấu, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 319398,
        "hanzi": "下滑",
        "pinyin": "xiàhuá",
        "meaningVi": "trượt xuống (dốc, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 293954,
        "hanzi": "东道主",
        "pinyin": "dōng dào zhǔ",
        "meaningVi": "chủ nhà",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 91,
    "slug": "thu-vien-va-tu-hoc",
    "titleVi": "Thư viện & Tự học",
    "titleZh": "图书馆与自习",
    "icon": "📖",
    "description": "Mượn sách, trả sách, thẻ thư viện, phòng tự học, yên tĩnh.",
    "hskLevel": "HSK 2",
    "wordCount": 16,
    "sampleWords": [
      {
        "id": 289561,
        "hanzi": "书架",
        "pinyin": "shū jià",
        "meaningVi": "giá sách",
        "levelCode": "3"
      },
      {
        "id": 293856,
        "hanzi": "低调",
        "pinyin": "dī diào",
        "meaningVi": "giọng thấp",
        "levelCode": "7-9"
      },
      {
        "id": 316532,
        "hanzi": "图书",
        "pinyin": "túshū",
        "meaningVi": "sách (trong thư viện hoặc hiệu sách)",
        "levelCode": "5"
      },
      {
        "id": 287991,
        "hanzi": "图书馆",
        "pinyin": "túshūguǎn",
        "meaningVi": "thư viện",
        "levelCode": "1"
      },
      {
        "id": 289862,
        "hanzi": "安",
        "pinyin": "ān",
        "meaningVi": "(hình thức kết hợp) yên lặng",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 92,
    "slug": "du-hoc-va-hoc-bong",
    "titleVi": "Du học & Học bổng",
    "titleZh": "留学与奖学金",
    "icon": "🎓",
    "description": "Du học sinh, xin học bổng, chi phí du học, cuộc sống xa nhà.",
    "hskLevel": "HSK 3",
    "wordCount": 5,
    "sampleWords": [
      {
        "id": 295034,
        "hanzi": "减免",
        "pinyin": "jiǎn miǎn",
        "meaningVi": "giảm hoặc miễn (thuế, hình phạt, tiền thuê, học phí, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 290242,
        "hanzi": "奖学金",
        "pinyin": "jiǎngxuéjīn",
        "meaningVi": "học bổng",
        "levelCode": "4"
      },
      {
        "id": 289702,
        "hanzi": "学费",
        "pinyin": "xuéfèi",
        "meaningVi": "học phí",
        "levelCode": "3"
      },
      {
        "id": 289346,
        "hanzi": "留学",
        "pinyin": "liúxué",
        "meaningVi": "du học",
        "levelCode": "3"
      },
      {
        "id": 288484,
        "hanzi": "留学生",
        "pinyin": "liúxuéshēng",
        "meaningVi": "du học sinh",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 93,
    "slug": "tot-nghiep-va-hoc-vi",
    "titleVi": "Tốt nghiệp & Học vị",
    "titleZh": "毕业与学位",
    "icon": "📜",
    "description": "Lễ tốt nghiệp, bằng cử nhân, thạc sĩ, tiến sĩ, kỷ yếu.",
    "hskLevel": "HSK 3",
    "wordCount": 8,
    "sampleWords": [
      {
        "id": 318553,
        "hanzi": "产出",
        "pinyin": "chǎnchū",
        "meaningVi": "sản xuất (sinh viên tốt nghiệp, sữa mẹ, chất thải độc hại, ý tưởng sáng tạo, v.v.)",
        "levelCode": "6"
      },
      {
        "id": 315095,
        "hanzi": "博士",
        "pinyin": "bóshì",
        "meaningVi": "tiến sĩ (học vị học thuật)",
        "levelCode": "4"
      },
      {
        "id": 291710,
        "hanzi": "学位",
        "pinyin": "xuéwèi",
        "meaningVi": "bằng cấp học thuật",
        "levelCode": "5"
      },
      {
        "id": 297764,
        "hanzi": "学士",
        "pinyin": "xué shì",
        "meaningVi": "bằng cử nhân",
        "levelCode": "7-9"
      },
      {
        "id": 291251,
        "hanzi": "届",
        "pinyin": "jiè",
        "meaningVi": "đến (nơi chốn hoặc thời gian)",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 94,
    "slug": "ngon-ngu-va-dich-thuat",
    "titleVi": "Ngôn ngữ & Dịch thuật",
    "titleZh": "语言与翻译",
    "icon": "🗣️🌐",
    "description": "Phiên dịch, biên dịch, ngữ pháp, phát âm, từ vựng, từ điển.",
    "hskLevel": "HSK 3",
    "wordCount": 134,
    "sampleWords": [
      {
        "id": 291727,
        "hanzi": "业务",
        "pinyin": "yèwù",
        "meaningVi": "kinh doanh",
        "levelCode": "5"
      },
      {
        "id": 288104,
        "hanzi": "中文",
        "pinyin": "zhōngwén",
        "meaningVi": "ngôn ngữ Trung Quốc",
        "levelCode": "1"
      },
      {
        "id": 289821,
        "hanzi": "主意",
        "pinyin": "zhǔyì",
        "meaningVi": "kế hoạch",
        "levelCode": "3"
      },
      {
        "id": 291340,
        "hanzi": "买卖",
        "pinyin": "mǎimài",
        "meaningVi": "mua bán",
        "levelCode": "5"
      },
      {
        "id": 317555,
        "hanzi": "事务",
        "pinyin": "shìwù",
        "meaningVi": "(chính trị, kinh tế, v.v.) công việc",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 95,
    "slug": "dai-hoc-va-nghien-cuu-sinh",
    "titleVi": "Đại học & Nghiên cứu sinh",
    "titleZh": "高等教育与科研",
    "icon": "🏛️",
    "description": "Học thuật, phòng thí nghiệm, đề tài nghiên cứu, giáo sư.",
    "hskLevel": "HSK 4",
    "wordCount": 41,
    "sampleWords": [
      {
        "id": 287940,
        "hanzi": "上",
        "pinyin": "shàng",
        "meaningVi": "(hình thức kết hợp) trên",
        "levelCode": "1"
      },
      {
        "id": 289830,
        "hanzi": "专业",
        "pinyin": "zhuānyè",
        "meaningVi": "chuyên môn",
        "levelCode": "3"
      },
      {
        "id": 293826,
        "hanzi": "倒塌",
        "pinyin": "dǎo tā",
        "meaningVi": "sụp đổ (công trình)",
        "levelCode": "7-9"
      },
      {
        "id": 315095,
        "hanzi": "博士",
        "pinyin": "bóshì",
        "meaningVi": "tiến sĩ (học vị học thuật)",
        "levelCode": "4"
      },
      {
        "id": 292502,
        "hanzi": "名誉",
        "pinyin": "míngyū",
        "meaningVi": "danh tiếng",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 96,
    "slug": "hoc-online-va-khoa-hoc-tu-xa",
    "titleVi": "Học online & Khóa học từ xa",
    "titleZh": "线上学习与远程课程",
    "icon": "💻🎓",
    "description": "Học trực tuyến, video bài giảng, phòng học ảo, tài liệu số.",
    "hskLevel": "HSK 3",
    "wordCount": 52,
    "sampleWords": [
      {
        "id": 287946,
        "hanzi": "上网",
        "pinyin": "shàng wǎng",
        "meaningVi": "lên mạng",
        "levelCode": "1"
      },
      {
        "id": 318846,
        "hanzi": "下线",
        "pinyin": "xiàxiàn",
        "meaningVi": "rời mạng",
        "levelCode": "6"
      },
      {
        "id": 289829,
        "hanzi": "专题",
        "pinyin": "zhuāntí",
        "meaningVi": "chủ đề cụ thể (được đề cập trong sách, bài giảng, chương trình TV, v.v.)",
        "levelCode": "3"
      },
      {
        "id": 296555,
        "hanzi": "丧生",
        "pinyin": "sàng shēng",
        "meaningVi": "chết",
        "levelCode": "7-9"
      },
      {
        "id": 289544,
        "hanzi": "事业",
        "pinyin": "shìyè",
        "meaningVi": "công việc",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 97,
    "slug": "ky-nang-mem-va-thuyet-trinh",
    "titleVi": "Kỹ năng mềm & Thuyết trình",
    "titleZh": "软实力与演讲表达",
    "icon": "🎤",
    "description": "Kỹ năng giao tiếp, làm việc nhóm, thuyết trình trước đám đông.",
    "hskLevel": "HSK 4",
    "wordCount": 65,
    "sampleWords": [
      {
        "id": 297974,
        "hanzi": "一手",
        "pinyin": "yīshǒu",
        "meaningVi": "một kỹ năng",
        "levelCode": "7-9"
      },
      {
        "id": 297922,
        "hanzi": "一技之长",
        "pinyin": "yī jì zhī cháng",
        "meaningVi": "thành thạo trong một lĩnh vực cụ thể (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 293336,
        "hanzi": "不了了之",
        "pinyin": "bù liǎo liǎo zhī",
        "meaningVi": "giải quyết vấn đề bằng cách để nó không được giải quyết",
        "levelCode": "7-9"
      },
      {
        "id": 298512,
        "hanzi": "专长",
        "pinyin": "zhuāncháng",
        "meaningVi": "chuyên môn",
        "levelCode": "7-9"
      },
      {
        "id": 292458,
        "hanzi": "两手",
        "pinyin": "liǎngshǒu",
        "meaningVi": "hai tay của một người",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 98,
    "slug": "khen-thuong-va-ky-luat",
    "titleVi": "Khen thưởng & Kỷ luật",
    "titleZh": "奖惩与校规",
    "icon": "🏆",
    "description": "Giấy khen, học sinh giỏi, nội quy, vi phạm, khiển trách.",
    "hskLevel": "HSK 4",
    "wordCount": 44,
    "sampleWords": [
      {
        "id": 298449,
        "hanzi": "中止",
        "pinyin": "zhōng zhǐ",
        "meaningVi": "ngừng",
        "levelCode": "7-9"
      },
      {
        "id": 296345,
        "hanzi": "侵害",
        "pinyin": "qīnhài",
        "meaningVi": "xâm phạm",
        "levelCode": "7-9"
      },
      {
        "id": 292570,
        "hanzi": "侵犯",
        "pinyin": "qīnfàn",
        "meaningVi": "xâm phạm",
        "levelCode": "6"
      },
      {
        "id": 288125,
        "hanzi": "做",
        "pinyin": "zuò",
        "meaningVi": "làm",
        "levelCode": "1"
      },
      {
        "id": 295034,
        "hanzi": "减免",
        "pinyin": "jiǎn miǎn",
        "meaningVi": "giảm hoặc miễn (thuế, hình phạt, tiền thuê, học phí, v.v.)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 99,
    "slug": "nghe-nghiep-pho-bien",
    "titleVi": "Nghề nghiệp phổ biến",
    "titleZh": "常见职业",
    "icon": "👨‍💼",
    "description": "Bác sĩ, giáo viên, kỹ sư, luật sư, kế toán, cảnh sát.",
    "hskLevel": "HSK 1",
    "wordCount": 89,
    "sampleWords": [
      {
        "id": 297974,
        "hanzi": "一手",
        "pinyin": "yīshǒu",
        "meaningVi": "một kỹ năng",
        "levelCode": "7-9"
      },
      {
        "id": 317125,
        "hanzi": "业",
        "pinyin": "yè",
        "meaningVi": "ngành kinh doanh",
        "levelCode": "6"
      },
      {
        "id": 297895,
        "hanzi": "业绩",
        "pinyin": "yèjī",
        "meaningVi": "thành tích",
        "levelCode": "7-9"
      },
      {
        "id": 324328,
        "hanzi": "两下子",
        "pinyin": "liǎngxiàzi",
        "meaningVi": "một vài lần",
        "levelCode": "7-9"
      },
      {
        "id": 288856,
        "hanzi": "中医",
        "pinyin": "zhōngyī",
        "meaningVi": "y học cổ truyền Trung Quốc",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 100,
    "slug": "tim-viec-va-phong-van",
    "titleVi": "Tìm việc & Phỏng vấn",
    "titleZh": "求职与面试",
    "icon": "💼",
    "description": "Hồ sơ xin việc, nhà tuyển dụng, phỏng vấn, trúng tuyển.",
    "hskLevel": "HSK 3",
    "wordCount": 95,
    "sampleWords": [
      {
        "id": 324305,
        "hanzi": "井底之蛙",
        "pinyin": "jǐngdǐzhīwā",
        "meaningVi": "ếch ngồi đáy giếng (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 291716,
        "hanzi": "亚军",
        "pinyin": "yà jūn",
        "meaningVi": "vị trí thứ hai (trong một cuộc thi thể thao)",
        "levelCode": "5"
      },
      {
        "id": 291023,
        "hanzi": "代理",
        "pinyin": "dàilǐ",
        "meaningVi": "đại diện cho ai đó trong một vị trí trách nhiệm",
        "levelCode": "5"
      },
      {
        "id": 288690,
        "hanzi": "位",
        "pinyin": "wèi",
        "meaningVi": "vị trí",
        "levelCode": "2"
      },
      {
        "id": 290608,
        "hanzi": "位置",
        "pinyin": "wèizhì",
        "meaningVi": "vị trí",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 101,
    "slug": "hop-dong-va-thu-viec",
    "titleVi": "Hợp đồng & Thử việc",
    "titleZh": "合同与试用期",
    "icon": "✍️",
    "description": "Hợp đồng lao động, thời gian thử việc, điều khoản, ký kết.",
    "hskLevel": "HSK 4",
    "wordCount": 62,
    "sampleWords": [
      {
        "id": 293954,
        "hanzi": "东道主",
        "pinyin": "dōng dào zhǔ",
        "meaningVi": "chủ nhà",
        "levelCode": "7-9"
      },
      {
        "id": 290729,
        "hanzi": "义务",
        "pinyin": "yìwù",
        "meaningVi": "nhiệm vụ",
        "levelCode": "4"
      },
      {
        "id": 290500,
        "hanzi": "事先",
        "pinyin": "shìxiān",
        "meaningVi": "trước thời hạn",
        "levelCode": "4"
      },
      {
        "id": 297574,
        "hanzi": "享有",
        "pinyin": "xiǎngyǒu",
        "meaningVi": "hưởng (quyền lợi, đặc quyền,...)",
        "levelCode": "7-9"
      },
      {
        "id": 288291,
        "hanzi": "份",
        "pinyin": "fèn",
        "meaningVi": "lượng từ cho quà tặng, báo, tạp chí, giấy tờ, báo cáo, hợp đồng, v.v.",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 102,
    "slug": "van-phong-va-ban-lam-viec",
    "titleVi": "Văn phòng & Bàn làm việc",
    "titleZh": "办公室与工位",
    "icon": "🏢",
    "description": "Bàn làm việc, máy in, tài liệu, kẹp ghim, máy tính.",
    "hskLevel": "HSK 2",
    "wordCount": 95,
    "sampleWords": [
      {
        "id": 287941,
        "hanzi": "上班",
        "pinyin": "shàngbān",
        "meaningVi": "đi làm",
        "levelCode": "1"
      },
      {
        "id": 287946,
        "hanzi": "上网",
        "pinyin": "shàng wǎng",
        "meaningVi": "lên mạng",
        "levelCode": "1"
      },
      {
        "id": 297501,
        "hanzi": "下台",
        "pinyin": "xiàtái",
        "meaningVi": "rời khỏi sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 291891,
        "hanzi": "专辑",
        "pinyin": "zhuānjí",
        "meaningVi": "album",
        "levelCode": "5"
      },
      {
        "id": 287966,
        "hanzi": "书",
        "pinyin": "shū",
        "meaningVi": "sách",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 103,
    "slug": "dong-nghiep-va-cap-tren",
    "titleVi": "Đồng nghiệp & Cấp trên",
    "titleZh": "同事与领导",
    "icon": "👔",
    "description": "Sếp, giám đốc, trưởng phòng, đồng nghiệp, cấp dưới.",
    "hskLevel": "HSK 2",
    "wordCount": 53,
    "sampleWords": [
      {
        "id": 297904,
        "hanzi": "一把手",
        "pinyin": "yībǎshǒu",
        "meaningVi": "người lao động",
        "levelCode": "7-9"
      },
      {
        "id": 296610,
        "hanzi": "上司",
        "pinyin": "shàngsī",
        "meaningVi": "sếp",
        "levelCode": "7-9"
      },
      {
        "id": 296600,
        "hanzi": "上报",
        "pinyin": "shàng bào",
        "meaningVi": "báo cáo lên cấp trên",
        "levelCode": "7-9"
      },
      {
        "id": 296618,
        "hanzi": "上游",
        "pinyin": "shàngyóu",
        "meaningVi": "thượng nguồn (của sông)",
        "levelCode": "7-9"
      },
      {
        "id": 291495,
        "hanzi": "上级",
        "pinyin": "shàngjí",
        "meaningVi": "cấp trên",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 104,
    "slug": "hop-hanh-va-bao-cao",
    "titleVi": "Họp hành & Báo cáo",
    "titleZh": "开会与工作汇报",
    "icon": "📊",
    "description": "Cuộc họp, biên bản họp, báo cáo tiến độ, thuyết trình.",
    "hskLevel": "HSK 3",
    "wordCount": 165,
    "sampleWords": [
      {
        "id": 296217,
        "hanzi": "七嘴八舌",
        "pinyin": "qī zuǐ bā shé",
        "meaningVi": "thảo luận sôi nổi với mọi người nói cùng lúc",
        "levelCode": "7-9"
      },
      {
        "id": 296600,
        "hanzi": "上报",
        "pinyin": "shàng bào",
        "meaningVi": "báo cáo lên cấp trên",
        "levelCode": "7-9"
      },
      {
        "id": 289829,
        "hanzi": "专题",
        "pinyin": "zhuāntí",
        "meaningVi": "chủ đề cụ thể (được đề cập trong sách, bài giảng, chương trình TV, v.v.)",
        "levelCode": "3"
      },
      {
        "id": 316508,
        "hanzi": "中期",
        "pinyin": "zhōngqī",
        "meaningVi": "giữa (một khoảng thời gian)",
        "levelCode": "5"
      },
      {
        "id": 289821,
        "hanzi": "主意",
        "pinyin": "zhǔyì",
        "meaningVi": "kế hoạch",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 105,
    "slug": "luong-bong-va-phuc-loi",
    "titleVi": "Lương bổng & Phúc lợi",
    "titleZh": "薪酬与福利",
    "icon": "💰",
    "description": "Lương cơ bản, thưởng, bảo hiểm, trợ cấp, tăng lương.",
    "hskLevel": "HSK 3",
    "wordCount": 77,
    "sampleWords": [
      {
        "id": 297502,
        "hanzi": "下调",
        "pinyin": "xià diào, xià tiáo",
        "meaningVi": "(xià diào) giáng chức",
        "levelCode": "7-9"
      },
      {
        "id": 290813,
        "hanzi": "中奖",
        "pinyin": "zhòng jiǎng",
        "meaningVi": "trúng thưởng (trong xổ số, v.v.)",
        "levelCode": "4"
      },
      {
        "id": 316985,
        "hanzi": "主食",
        "pinyin": "zhǔshí",
        "meaningVi": "lương thực chính",
        "levelCode": "5"
      },
      {
        "id": 298352,
        "hanzi": "争光",
        "pinyin": "zhēng guāng",
        "meaningVi": "giành vinh dự",
        "levelCode": "7-9"
      },
      {
        "id": 322332,
        "hanzi": "享用",
        "pinyin": "xiǎngyòng",
        "meaningVi": "thưởng thức (tức là có quyền sử dụng hoặc hưởng lợi)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 106,
    "slug": "nghi-phep-va-tang-ca",
    "titleVi": "Nghỉ phép & Tăng ca",
    "titleZh": "请假与加班",
    "icon": "⏰🏢",
    "description": "Xin nghỉ phép, nghỉ ốm, làm thêm giờ, chấm công.",
    "hskLevel": "HSK 3",
    "wordCount": 5,
    "sampleWords": [
      {
        "id": 288746,
        "hanzi": "休假",
        "pinyin": "xiūjià",
        "meaningVi": "đi nghỉ",
        "levelCode": "2"
      },
      {
        "id": 318380,
        "hanzi": "兼职",
        "pinyin": "jiānzhí",
        "meaningVi": "làm nhiều công việc cùng lúc",
        "levelCode": "6"
      },
      {
        "id": 290224,
        "hanzi": "加班",
        "pinyin": "jiā bān",
        "meaningVi": "làm thêm giờ",
        "levelCode": "4"
      },
      {
        "id": 318787,
        "hanzi": "打卡",
        "pinyin": "dǎkǎ",
        "meaningVi": "(nhân viên) chấm công vào (hoặc ra)",
        "levelCode": "6"
      },
      {
        "id": 287922,
        "hanzi": "请假",
        "pinyin": "qǐngjià",
        "meaningVi": "xin nghỉ phép",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 107,
    "slug": "thang-tien-va-doi-viec",
    "titleVi": "Thăng tiến & Đổi việc",
    "titleZh": "晋升与跳槽",
    "icon": "📈",
    "description": "Thăng chức, chuyển công tác, từ chức, nhảy việc, sa thải.",
    "hskLevel": "HSK 4",
    "wordCount": 41,
    "sampleWords": [
      {
        "id": 297501,
        "hanzi": "下台",
        "pinyin": "xiàtái",
        "meaningVi": "rời khỏi sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 297489,
        "hanzi": "下岗",
        "pinyin": "xià gǎng",
        "meaningVi": "(của lính gác, lính canh, v.v.) rời ca",
        "levelCode": "7-9"
      },
      {
        "id": 288019,
        "hanzi": "下课",
        "pinyin": "xiàkè",
        "meaningVi": "tan học",
        "levelCode": "1"
      },
      {
        "id": 296499,
        "hanzi": "任职",
        "pinyin": "rènzhí",
        "meaningVi": "giữ chức vụ",
        "levelCode": "7-9"
      },
      {
        "id": 295909,
        "hanzi": "免职",
        "pinyin": "miǎn zhí",
        "meaningVi": "cách chức",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 108,
    "slug": "kinh-doanh-va-khoi-nghiep",
    "titleVi": "Kinh doanh & Khởi nghiệp",
    "titleZh": "商务与创业",
    "icon": "🚀",
    "description": "Thành lập công ty, gọi vốn, kế hoạch kinh doanh, thị trường.",
    "hskLevel": "HSK 4",
    "wordCount": 102,
    "sampleWords": [
      {
        "id": 292627,
        "hanzi": "上市",
        "pinyin": "shàngshì",
        "meaningVi": "ra mắt thị trường (sản phẩm mới)",
        "levelCode": "6"
      },
      {
        "id": 322413,
        "hanzi": "专卖",
        "pinyin": "zhuānmài",
        "meaningVi": "độc quyền",
        "levelCode": "7-9"
      },
      {
        "id": 317125,
        "hanzi": "业",
        "pinyin": "yè",
        "meaningVi": "ngành kinh doanh",
        "levelCode": "6"
      },
      {
        "id": 291727,
        "hanzi": "业务",
        "pinyin": "yèwù",
        "meaningVi": "kinh doanh",
        "levelCode": "5"
      },
      {
        "id": 291340,
        "hanzi": "买卖",
        "pinyin": "mǎimài",
        "meaningVi": "mua bán",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 109,
    "slug": "tiep-thi-va-ban-hang",
    "titleVi": "Tiếp thị & Bán hàng",
    "titleZh": "市场营销与销售",
    "icon": "📣",
    "description": "Quảng cáo, tiếp thị, khách hàng mục tiêu, doanh số.",
    "hskLevel": "HSK 4",
    "wordCount": 55,
    "sampleWords": [
      {
        "id": 298514,
        "hanzi": "专柜",
        "pinyin": "zhuānguì",
        "meaningVi": "quầy bán hàng dành riêng cho một loại sản phẩm nhất định (ví dụ: rượu)",
        "levelCode": "7-9"
      },
      {
        "id": 292458,
        "hanzi": "两手",
        "pinyin": "liǎngshǒu",
        "meaningVi": "hai tay của một người",
        "levelCode": "6"
      },
      {
        "id": 323282,
        "hanzi": "代言",
        "pinyin": "dàiyán",
        "meaningVi": "làm người phát ngôn",
        "levelCode": "7-9"
      },
      {
        "id": 323331,
        "hanzi": "传单",
        "pinyin": "chuándān",
        "meaningVi": "tờ rơi",
        "levelCode": "7-9"
      },
      {
        "id": 289987,
        "hanzi": "促销",
        "pinyin": "cùxiāo",
        "meaningVi": "thúc đẩy bán hàng",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 110,
    "slug": "tai-chinh-va-ke-toan",
    "titleVi": "Tài chính & Kế toán",
    "titleZh": "财务与会计",
    "icon": "🧮",
    "description": "Báo cáo tài chính, thuế, sổ sách, kiểm toán, thu chi.",
    "hskLevel": "HSK 4",
    "wordCount": 49,
    "sampleWords": [
      {
        "id": 317515,
        "hanzi": "亏损",
        "pinyin": "kuīsǔn",
        "meaningVi": "thâm hụt",
        "levelCode": "6"
      },
      {
        "id": 295087,
        "hanzi": "交纳",
        "pinyin": "jiāo nà",
        "meaningVi": "nộp (thuế hoặc phí)",
        "levelCode": "7-9"
      },
      {
        "id": 290297,
        "hanzi": "会计",
        "pinyin": "kuàijì",
        "meaningVi": "kế toán",
        "levelCode": "4"
      },
      {
        "id": 318702,
        "hanzi": "免税",
        "pinyin": "miǎnshuì",
        "meaningVi": "không chịu thuế (của chùa, hoàng gia, v.v.)",
        "levelCode": "6"
      },
      {
        "id": 294497,
        "hanzi": "关税",
        "pinyin": "guān shuì",
        "meaningVi": "thuế hải quan",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 111,
    "slug": "cham-soc-khach-hang",
    "titleVi": "Chăm sóc khách hàng",
    "titleZh": "客户服务与支持",
    "icon": "🎧",
    "description": "Tổng đài, hỗ trợ khách hàng, giải quyết khiếu nại, hài lòng.",
    "hskLevel": "HSK 3",
    "wordCount": 97,
    "sampleWords": [
      {
        "id": 288163,
        "hanzi": "不满",
        "pinyin": "bùmǎn",
        "meaningVi": "bực bội",
        "levelCode": "2"
      },
      {
        "id": 295586,
        "hanzi": "乐意",
        "pinyin": "lè yì",
        "meaningVi": "sẵn sàng làm gì đó",
        "levelCode": "7-9"
      },
      {
        "id": 318513,
        "hanzi": "互助",
        "pinyin": "hùzhù",
        "meaningVi": "hỗ trợ lẫn nhau",
        "levelCode": "6"
      },
      {
        "id": 294853,
        "hanzi": "会诊",
        "pinyin": "huì zhěn",
        "meaningVi": "hội chẩn (y tế)",
        "levelCode": "7-9"
      },
      {
        "id": 290848,
        "hanzi": "作出",
        "pinyin": "zuòchū",
        "meaningVi": "đưa ra",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 112,
    "slug": "dam-phan-va-ky-ket",
    "titleVi": "Đàm phán & Ký kết hợp đồng",
    "titleZh": "商务谈判与签约",
    "icon": "🤝📑",
    "description": "Thương lượng giá cả, điều khoản đàm phán, đối tác thương mại.",
    "hskLevel": "HSK 5",
    "wordCount": 66,
    "sampleWords": [
      {
        "id": 289240,
        "hanzi": "交易",
        "pinyin": "jiāoyì",
        "meaningVi": "giao dịch",
        "levelCode": "3"
      },
      {
        "id": 295089,
        "hanzi": "交涉",
        "pinyin": "jiāo shè",
        "meaningVi": "đàm phán (với)",
        "levelCode": "7-9"
      },
      {
        "id": 288291,
        "hanzi": "份",
        "pinyin": "fèn",
        "meaningVi": "lượng từ cho quà tặng, báo, tạp chí, giấy tờ, báo cáo, hợp đồng, v.v.",
        "levelCode": "2"
      },
      {
        "id": 290194,
        "hanzi": "伙",
        "pinyin": "huǒ",
        "meaningVi": "bữa ăn (viết tắt của 伙食)",
        "levelCode": "4"
      },
      {
        "id": 290195,
        "hanzi": "伙伴",
        "pinyin": "huǒ bàn",
        "meaningVi": "đối tác",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 113,
    "slug": "dao-duc-nghe-nghiep",
    "titleVi": "Đạo đức nghề nghiệp",
    "titleZh": "职业素养与规范",
    "icon": "⚖️",
    "description": "Trách nhiệm, trung thực, bảo mật thông tin, văn hóa công ty.",
    "hskLevel": "HSK 5",
    "wordCount": 61,
    "sampleWords": [
      {
        "id": 297501,
        "hanzi": "下台",
        "pinyin": "xiàtái",
        "meaningVi": "rời khỏi sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 289830,
        "hanzi": "专业",
        "pinyin": "zhuānyè",
        "meaningVi": "chuyên môn",
        "levelCode": "3"
      },
      {
        "id": 291882,
        "hanzi": "主管",
        "pinyin": "zhǔguǎn",
        "meaningVi": "phụ trách",
        "levelCode": "5"
      },
      {
        "id": 296473,
        "hanzi": "人品",
        "pinyin": "rén pǐn",
        "meaningVi": "phẩm chất",
        "levelCode": "7-9"
      },
      {
        "id": 291023,
        "hanzi": "代理",
        "pinyin": "dàilǐ",
        "meaningVi": "đại diện cho ai đó trong một vị trí trách nhiệm",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 114,
    "slug": "co-the-con-nguoi",
    "titleVi": "Cơ thể con người & Bộ phận",
    "titleZh": "人体部位",
    "icon": "🧍",
    "description": "Đầu, mắt, mũi, miệng, tay, chân, tim, dạ dày, lưng.",
    "hskLevel": "HSK 2",
    "wordCount": 405,
    "sampleWords": [
      {
        "id": 323846,
        "hanzi": "一举两得",
        "pinyin": "yìjǔ-liǎngdé",
        "meaningVi": "một hành động, hai kết quả (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 297914,
        "hanzi": "一刹那",
        "pinyin": "yīchànà",
        "meaningVi": "một khoảnh khắc",
        "levelCode": "7-9"
      },
      {
        "id": 297978,
        "hanzi": "一头",
        "pinyin": "yītóu",
        "meaningVi": "một cái đầu",
        "levelCode": "7-9"
      },
      {
        "id": 297970,
        "hanzi": "一年到头",
        "pinyin": "yīniándàotóu",
        "meaningVi": "suốt cả năm",
        "levelCode": "7-9"
      },
      {
        "id": 297974,
        "hanzi": "一手",
        "pinyin": "yīshǒu",
        "meaningVi": "một kỹ năng",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 115,
    "slug": "suc-khoe-va-the-trang",
    "titleVi": "Sức khỏe & Thể trạng",
    "titleZh": "健康与体质",
    "icon": "💪",
    "description": "Khỏe mạnh, yếu ớt, miễn dịch, dẻo dai, mệt mỏi.",
    "hskLevel": "HSK 2",
    "wordCount": 102,
    "sampleWords": [
      {
        "id": 297965,
        "hanzi": "一卡通",
        "pinyin": "Yī kǎ tōng",
        "meaningVi": "tên của các loại thẻ thông minh không tiếp xúc, nổi bật là Yikatong (chủ yếu cho giao thông công cộng ở Bắc Kinh) và iPASS (chủ yếu cho giao thông công cộng ở Đài Loan)",
        "levelCode": "7-9"
      },
      {
        "id": 293310,
        "hanzi": "不懈",
        "pinyin": "bù xiè",
        "meaningVi": "không mệt mỏi",
        "levelCode": "7-9"
      },
      {
        "id": 293353,
        "hanzi": "不知",
        "pinyin": "bù zhī",
        "meaningVi": "không biết",
        "levelCode": "7-9"
      },
      {
        "id": 318219,
        "hanzi": "不适",
        "pinyin": "búshì",
        "meaningVi": "không khỏe",
        "levelCode": "6"
      },
      {
        "id": 288309,
        "hanzi": "个子",
        "pinyin": "gèzi",
        "meaningVi": "chiều cao",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 116,
    "slug": "trieu-chung-benh-va-dau-om",
    "titleVi": "Triệu chứng bệnh & Đau ốm",
    "titleZh": "疾病症状与不适",
    "icon": "🤒",
    "description": "Sốt, ho, cảm cúm, đau đầu, đau bụng, chóng mặt, buồn nôn.",
    "hskLevel": "HSK 2",
    "wordCount": 56,
    "sampleWords": [
      {
        "id": 293310,
        "hanzi": "不懈",
        "pinyin": "bù xiè",
        "meaningVi": "không mệt mỏi",
        "levelCode": "7-9"
      },
      {
        "id": 293353,
        "hanzi": "不知",
        "pinyin": "bù zhī",
        "meaningVi": "không biết",
        "levelCode": "7-9"
      },
      {
        "id": 318219,
        "hanzi": "不适",
        "pinyin": "búshì",
        "meaningVi": "không khỏe",
        "levelCode": "6"
      },
      {
        "id": 296595,
        "hanzi": "伤脑筋",
        "pinyin": "shāng nǎo jīn",
        "meaningVi": "thực sự đau đầu",
        "levelCode": "7-9"
      },
      {
        "id": 293048,
        "hanzi": "作",
        "pinyin": "zuò",
        "meaningVi": "làm",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 117,
    "slug": "benh-vien-va-phong-kham",
    "titleVi": "Bệnh viện & Phòng khám",
    "titleZh": "医院与就医",
    "icon": "🏥",
    "description": "Khoa khám bệnh, cấp cứu, đăng ký khám, nội trú, xuất viện.",
    "hskLevel": "HSK 2",
    "wordCount": 60,
    "sampleWords": [
      {
        "id": 297487,
        "hanzi": "下场",
        "pinyin": "xià chǎng, xià chang",
        "meaningVi": "(xià chǎng) rời khỏi (sân khấu, phòng thi, sân đấu, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 288865,
        "hanzi": "住院",
        "pinyin": "zhùyuàn",
        "meaningVi": "nhập viện",
        "levelCode": "2"
      },
      {
        "id": 292165,
        "hanzi": "儿科",
        "pinyin": "ér kē",
        "meaningVi": "khoa nhi",
        "levelCode": "6"
      },
      {
        "id": 294399,
        "hanzi": "公立",
        "pinyin": "gōnglì",
        "meaningVi": "công lập (ví dụ: trường học, bệnh viện)",
        "levelCode": "7-9"
      },
      {
        "id": 290391,
        "hanzi": "内科",
        "pinyin": "nèi kē",
        "meaningVi": "nội khoa",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 118,
    "slug": "bac-si-va-y-ta",
    "titleVi": "Bác sĩ & Y tá",
    "titleZh": "医生与医护人员",
    "icon": "👨‍⚕️",
    "description": "Bác sĩ đa khoa, chuyên khoa, y tá, điều dưỡng, khám bệnh.",
    "hskLevel": "HSK 1",
    "wordCount": 25,
    "sampleWords": [
      {
        "id": 289827,
        "hanzi": "专家",
        "pinyin": "zhuānjiā",
        "meaningVi": "chuyên gia",
        "levelCode": "3"
      },
      {
        "id": 289828,
        "hanzi": "专门",
        "pinyin": "zhuānmén",
        "meaningVi": "chuyên gia",
        "levelCode": "3"
      },
      {
        "id": 288856,
        "hanzi": "中医",
        "pinyin": "zhōngyī",
        "meaningVi": "y học cổ truyền Trung Quốc",
        "levelCode": "2"
      },
      {
        "id": 294853,
        "hanzi": "会诊",
        "pinyin": "huì zhěn",
        "meaningVi": "hội chẩn (y tế)",
        "levelCode": "7-9"
      },
      {
        "id": 288023,
        "hanzi": "先生",
        "pinyin": "xiānshēng",
        "meaningVi": "giáo viên",
        "levelCode": "1"
      }
    ]
  },
  {
    "id": 119,
    "slug": "thuoc-men-va-hieu-thuoc",
    "titleVi": "Thuốc men & Hiệu thuốc",
    "titleZh": "药品与药店",
    "icon": "💊",
    "description": "Thuốc tây, thuốc đông y, viên uống, siro, thuốc kháng sinh.",
    "hskLevel": "HSK 2",
    "wordCount": 49,
    "sampleWords": [
      {
        "id": 291871,
        "hanzi": "中药",
        "pinyin": "zhōngyào",
        "meaningVi": "y học cổ truyền Trung Quốc",
        "levelCode": "5"
      },
      {
        "id": 297278,
        "hanzi": "丸",
        "pinyin": "wán",
        "meaningVi": "quả cầu",
        "levelCode": "7-9"
      },
      {
        "id": 321240,
        "hanzi": "丸子",
        "pinyin": "wánzi",
        "meaningVi": "viên thuốc",
        "levelCode": "7-9"
      },
      {
        "id": 296150,
        "hanzi": "偏方",
        "pinyin": "piān fāng",
        "meaningVi": "bài thuốc dân gian",
        "levelCode": "7-9"
      },
      {
        "id": 294962,
        "hanzi": "剂",
        "pinyin": "jì",
        "meaningVi": "liều lượng (thuốc)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 120,
    "slug": "kham-benh-va-dieu-tri",
    "titleVi": "Khám bệnh & Điều trị",
    "titleZh": "诊断与治疗",
    "icon": "🩺",
    "description": "Xét nghiệm máu, chụp X-quang, siêu âm, phác đồ điều trị.",
    "hskLevel": "HSK 3",
    "wordCount": 20,
    "sampleWords": [
      {
        "id": 297707,
        "hanzi": "休养",
        "pinyin": "xiū yǎng",
        "meaningVi": "hồi phục",
        "levelCode": "7-9"
      },
      {
        "id": 288865,
        "hanzi": "住院",
        "pinyin": "zhùyuàn",
        "meaningVi": "nhập viện",
        "levelCode": "2"
      },
      {
        "id": 294773,
        "hanzi": "化验",
        "pinyin": "huà yàn",
        "meaningVi": "xét nghiệm hóa học",
        "levelCode": "7-9"
      },
      {
        "id": 290713,
        "hanzi": "医疗",
        "pinyin": "yīliáo",
        "meaningVi": "điều trị y tế",
        "levelCode": "4"
      },
      {
        "id": 290188,
        "hanzi": "回复",
        "pinyin": "huí fù",
        "meaningVi": "trả lời",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 121,
    "slug": "rang-ham-mat-va-nha-khoa",
    "titleVi": "Răng hàm mặt & Nha khoa",
    "titleZh": "口腔与牙科",
    "icon": "🦷",
    "description": "Đau răng, sâu răng, nhổ răng, niềng răng, nha sĩ.",
    "hskLevel": "HSK 3",
    "wordCount": 14,
    "sampleWords": [
      {
        "id": 289819,
        "hanzi": "主动",
        "pinyin": "zhǔdòng",
        "meaningVi": "chủ động",
        "levelCode": "3"
      },
      {
        "id": 290523,
        "hanzi": "刷牙",
        "pinyin": "shuā yá",
        "meaningVi": "đánh răng",
        "levelCode": "4"
      },
      {
        "id": 296491,
        "hanzi": "忍心",
        "pinyin": "rěn xīn",
        "meaningVi": "có lòng làm việc gì đó",
        "levelCode": "7-9"
      },
      {
        "id": 292322,
        "hanzi": "机关",
        "pinyin": "jīguān",
        "meaningVi": "cơ chế",
        "levelCode": "6"
      },
      {
        "id": 314206,
        "hanzi": "牙",
        "pinyin": "yá",
        "meaningVi": "răng",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 122,
    "slug": "tam-ly-va-cang-thang",
    "titleVi": "Tâm lý & Căng thẳng",
    "titleZh": "心理与压力",
    "icon": "🧠",
    "description": "Stress, lo âu, trầm cảm, thư giãn tâm trí, tư vấn tâm lý.",
    "hskLevel": "HSK 4",
    "wordCount": 121,
    "sampleWords": [
      {
        "id": 288948,
        "hanzi": "不安",
        "pinyin": "bùān",
        "meaningVi": "không yên",
        "levelCode": "3"
      },
      {
        "id": 289354,
        "hanzi": "乱",
        "pinyin": "luàn",
        "meaningVi": "trong tình trạng rối loạn",
        "levelCode": "3"
      },
      {
        "id": 291702,
        "hanzi": "休闲",
        "pinyin": "xiū xián",
        "meaningVi": "giải trí",
        "levelCode": "5"
      },
      {
        "id": 293860,
        "hanzi": "低迷",
        "pinyin": "dīmí",
        "meaningVi": "mờ mịt (cảnh vật, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 297482,
        "hanzi": "侠义",
        "pinyin": "xiá yì",
        "meaningVi": "nghĩa hiệp",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 123,
    "slug": "the-duc-va-ren-luyen",
    "titleVi": "Thể dục & Rèn luyện sức khỏe",
    "titleZh": "体育锻炼与健身",
    "icon": "🏃",
    "description": "Tập thể dục, chạy bộ, nâng tạ, cardio, rèn luyện thân thể.",
    "hskLevel": "HSK 2",
    "wordCount": 35,
    "sampleWords": [
      {
        "id": 290554,
        "hanzi": "体操",
        "pinyin": "tǐcāo",
        "meaningVi": "thể dục dụng cụ",
        "levelCode": "4"
      },
      {
        "id": 288650,
        "hanzi": "体育场",
        "pinyin": "tǐ yù chǎng",
        "meaningVi": "sân vận động",
        "levelCode": "2"
      },
      {
        "id": 288651,
        "hanzi": "体育馆",
        "pinyin": "tǐyūguǎn",
        "meaningVi": "phòng gym",
        "levelCode": "2"
      },
      {
        "id": 291705,
        "hanzi": "修养",
        "pinyin": "xiūyǎng",
        "meaningVi": "sự rèn luyện",
        "levelCode": "5"
      },
      {
        "id": 295063,
        "hanzi": "健美",
        "pinyin": "jiàn měi",
        "meaningVi": "khỏe đẹp",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 124,
    "slug": "giam-can-va-voc-dang",
    "titleVi": "Giảm cân & Vóc dáng",
    "titleZh": "减脂与塑形",
    "icon": "⚖️🏃",
    "description": "Cân nặng, giảm mỡ, giữ dáng, béo phì, thân hình thon gọn.",
    "hskLevel": "HSK 3",
    "wordCount": 18,
    "sampleWords": [
      {
        "id": 294367,
        "hanzi": "个头儿",
        "pinyin": "gètóur",
        "meaningVi": "kích cỡ",
        "levelCode": "7-9"
      },
      {
        "id": 318828,
        "hanzi": "低碳",
        "pinyin": "dītàn",
        "meaningVi": "(định ngữ) ít carbon",
        "levelCode": "6"
      },
      {
        "id": 323911,
        "hanzi": "体魄",
        "pinyin": "tǐpò",
        "meaningVi": "thể chất",
        "levelCode": "7-9"
      },
      {
        "id": 297709,
        "hanzi": "修长",
        "pinyin": "xiū cháng",
        "meaningVi": "mảnh mai",
        "levelCode": "7-9"
      },
      {
        "id": 290235,
        "hanzi": "健身",
        "pinyin": "jiàn shēn",
        "meaningVi": "tập thể dục",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 125,
    "slug": "phong-chong-dich-benh",
    "titleVi": "Phòng chống dịch bệnh",
    "titleZh": "传染病防护",
    "icon": "😷",
    "description": "Đeo khẩu trang, khử khuẩn, cách ly, tiêm vắc-xin, dịch bệnh.",
    "hskLevel": "HSK 4",
    "wordCount": 12,
    "sampleWords": [
      {
        "id": 318417,
        "hanzi": "传染",
        "pinyin": "chuánrǎn",
        "meaningVi": "lây nhiễm",
        "levelCode": "6"
      },
      {
        "id": 318316,
        "hanzi": "传染病",
        "pinyin": "chuánrǎnbìng",
        "meaningVi": "bệnh truyền nhiễm",
        "levelCode": "6"
      },
      {
        "id": 317296,
        "hanzi": "免疫",
        "pinyin": "miǎnyì",
        "meaningVi": "miễn dịch (với bệnh)",
        "levelCode": "6"
      },
      {
        "id": 295479,
        "hanzi": "口罩",
        "pinyin": "kǒuzhào",
        "meaningVi": "khẩu trang (phẫu thuật, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 290102,
        "hanzi": "封闭",
        "pinyin": "fēngbì",
        "meaningVi": "đóng kín",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 126,
    "slug": "bao-hiem-y-te",
    "titleVi": "Bảo hiểm y tế",
    "titleZh": "医疗保险",
    "icon": "📑🏥",
    "description": "Thẻ bảo hiểm, thanh toán viện phí, hoàn trả tiền khám.",
    "hskLevel": "HSK 4",
    "wordCount": 14,
    "sampleWords": [
      {
        "id": 297574,
        "hanzi": "享有",
        "pinyin": "xiǎngyǒu",
        "meaningVi": "hưởng (quyền lợi, đặc quyền,...)",
        "levelCode": "7-9"
      },
      {
        "id": 294252,
        "hanzi": "付费",
        "pinyin": "fùfèi",
        "meaningVi": "trả tiền",
        "levelCode": "7-9"
      },
      {
        "id": 288910,
        "hanzi": "保险",
        "pinyin": "bǎoxiǎn",
        "meaningVi": "bảo hiểm",
        "levelCode": "3"
      },
      {
        "id": 293448,
        "hanzi": "偿还",
        "pinyin": "cháng huán",
        "meaningVi": "hoàn trả",
        "levelCode": "7-9"
      },
      {
        "id": 290326,
        "hanzi": "利益",
        "pinyin": "lìyì",
        "meaningVi": "lợi ích",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 127,
    "slug": "bong-da-va-bong-ro",
    "titleVi": "Bóng đá & Bóng rổ",
    "titleZh": "足球与篮球",
    "icon": "⚽🏀",
    "description": "Đá bóng, ném bóng, thủ môn, trọng tài, sân vận động.",
    "hskLevel": "HSK 2",
    "wordCount": 14,
    "sampleWords": [
      {
        "id": 289538,
        "hanzi": "世界杯",
        "pinyin": "Shì jiè bēi",
        "meaningVi": "Cúp bóng đá thế giới (World Cup)",
        "levelCode": "3"
      },
      {
        "id": 298460,
        "hanzi": "仲裁",
        "pinyin": "zhòng cái",
        "meaningVi": "trọng tài",
        "levelCode": "7-9"
      },
      {
        "id": 293587,
        "hanzi": "出局",
        "pinyin": "chūjú",
        "meaningVi": "(cầu thủ bóng chày) bị loại",
        "levelCode": "7-9"
      },
      {
        "id": 320949,
        "hanzi": "回合",
        "pinyin": "huíhé",
        "meaningVi": "một phần của chuỗi trận đấu (hoặc phân đoạn của trận đấu) giữa cùng hai đối thủ",
        "levelCode": "7-9"
      },
      {
        "id": 297277,
        "hanzi": "外援",
        "pinyin": "wài yuán",
        "meaningVi": "viện trợ nước ngoài",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 128,
    "slug": "boi-loi-va-the-thao-duoi-nuoc",
    "titleVi": "Bơi lội & Thể thao dưới nước",
    "titleZh": "游泳与水上运动",
    "icon": "🏊",
    "description": "Bơi ếch, bơi sải, bể bơi, lặn biển, lướt ván, cứu hộ.",
    "hskLevel": "HSK 2",
    "wordCount": 12,
    "sampleWords": [
      {
        "id": 297498,
        "hanzi": "下山",
        "pinyin": "xiàshān",
        "meaningVi": "xuống núi",
        "levelCode": "7-9"
      },
      {
        "id": 297491,
        "hanzi": "下海",
        "pinyin": "xià hǎi",
        "meaningVi": "ra biển",
        "levelCode": "7-9"
      },
      {
        "id": 321332,
        "hanzi": "夕阳",
        "pinyin": "xīyáng",
        "meaningVi": "hoàng hôn",
        "levelCode": "7-9"
      },
      {
        "id": 293676,
        "hanzi": "此起彼伏",
        "pinyin": "cǐ qǐ bǐ fú",
        "meaningVi": "chỗ này nổi lên, chỗ kia lặn xuống (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 289938,
        "hanzi": "沉",
        "pinyin": "chén",
        "meaningVi": "chìm",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 129,
    "slug": "dien-kinh-va-chay-bo",
    "titleVi": "Điền kinh & Chạy bộ",
    "titleZh": "田径与跑步",
    "icon": "👟🏃",
    "description": "Chạy cự ly ngắn, marathon, nhảy cao, nhảy xa, đường chạy.",
    "hskLevel": "HSK 3",
    "wordCount": 86,
    "sampleWords": [
      {
        "id": 323846,
        "hanzi": "一举两得",
        "pinyin": "yìjǔ-liǎngdé",
        "meaningVi": "một hành động, hai kết quả (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 298513,
        "hanzi": "专程",
        "pinyin": "zhuānchéng",
        "meaningVi": "cụ thể",
        "levelCode": "7-9"
      },
      {
        "id": 293953,
        "hanzi": "东奔西走",
        "pinyin": "dōngbēnxīzǒu",
        "meaningVi": "chạy đông chạy tây (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 289639,
        "hanzi": "为了",
        "pinyin": "wèi le",
        "meaningVi": "để",
        "levelCode": "3"
      },
      {
        "id": 292771,
        "hanzi": "为此",
        "pinyin": "wèi cǐ",
        "meaningVi": "vì lý do này",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 130,
    "slug": "the-hinh-va-gym",
    "titleVi": "Thể hình & Gym",
    "titleZh": "器械健身与力量训练",
    "icon": "🏋️",
    "description": "Phòng gym, tạ, máy chạy bộ, huấn luyện viên cá nhân.",
    "hskLevel": "HSK 3",
    "wordCount": 11,
    "sampleWords": [
      {
        "id": 288019,
        "hanzi": "下课",
        "pinyin": "xiàkè",
        "meaningVi": "tan học",
        "levelCode": "1"
      },
      {
        "id": 293333,
        "hanzi": "不可思议",
        "pinyin": "bù kě sī yì",
        "meaningVi": "không thể tưởng tượng được (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 295325,
        "hanzi": "举重",
        "pinyin": "jǔ zhòng",
        "meaningVi": "nâng tạ",
        "levelCode": "7-9"
      },
      {
        "id": 323437,
        "hanzi": "体态",
        "pinyin": "tǐtài",
        "meaningVi": "dáng vẻ",
        "levelCode": "7-9"
      },
      {
        "id": 288651,
        "hanzi": "体育馆",
        "pinyin": "tǐyūguǎn",
        "meaningVi": "phòng gym",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 131,
    "slug": "yoga-va-thien",
    "titleVi": "Yoga & Thiền",
    "titleZh": "瑜伽与冥想",
    "icon": "🧘",
    "description": "Tập yoga, thiền định, hít thở, thư giãn, thảm yoga.",
    "hskLevel": "HSK 4",
    "wordCount": 40,
    "sampleWords": [
      {
        "id": 291702,
        "hanzi": "休闲",
        "pinyin": "xiū xián",
        "meaningVi": "giải trí",
        "levelCode": "5"
      },
      {
        "id": 295026,
        "hanzi": "兼顾",
        "pinyin": "jiāngù",
        "meaningVi": "giải quyết đồng thời nhiều việc",
        "levelCode": "7-9"
      },
      {
        "id": 318652,
        "hanzi": "减压",
        "pinyin": "jiǎnyā",
        "meaningVi": "giảm áp lực",
        "levelCode": "6"
      },
      {
        "id": 289727,
        "hanzi": "印象",
        "pinyin": "yìnxiàng",
        "meaningVi": "ấn tượng (điều gì đó lưu lại trong tâm trí)",
        "levelCode": "3"
      },
      {
        "id": 323627,
        "hanzi": "口头禅",
        "pinyin": "kǒutóuchán",
        "meaningVi": "câu nói Thiền lặp lại như sáo rỗng",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 132,
    "slug": "tro-choi-dien-tu-va-game",
    "titleVi": "Trò chơi điện tử & Game",
    "titleZh": "电子游戏与电竞",
    "icon": "🎮",
    "description": "Chơi game, thể thao điện tử, tay cầm, game thủ, nạp thẻ.",
    "hskLevel": "HSK 3",
    "wordCount": 50,
    "sampleWords": [
      {
        "id": 293311,
        "hanzi": "不亚于",
        "pinyin": "bù yà yú",
        "meaningVi": "không kém hơn",
        "levelCode": "7-9"
      },
      {
        "id": 293325,
        "hanzi": "不服",
        "pinyin": "bù fú",
        "meaningVi": "không chấp nhận điều gì",
        "levelCode": "7-9"
      },
      {
        "id": 293954,
        "hanzi": "东道主",
        "pinyin": "dōng dào zhǔ",
        "meaningVi": "chủ nhà",
        "levelCode": "7-9"
      },
      {
        "id": 298353,
        "hanzi": "争气",
        "pinyin": "zhēng qì",
        "meaningVi": "làm việc chăm chỉ vì điều gì",
        "levelCode": "7-9"
      },
      {
        "id": 316759,
        "hanzi": "低头",
        "pinyin": "dītóu",
        "meaningVi": "cúi đầu",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 133,
    "slug": "xem-phim-va-rap-chieu-phim",
    "titleVi": "Xem phim & Rạp chiếu phim",
    "titleZh": "电影与影院",
    "icon": "🎬",
    "description": "Mua vé xem phim, bắp rang bơ, đạo diễn, diễn viên, bom tấn.",
    "hskLevel": "HSK 2",
    "wordCount": 63,
    "sampleWords": [
      {
        "id": 296617,
        "hanzi": "上映",
        "pinyin": "shàng yìng",
        "meaningVi": "chiếu",
        "levelCode": "7-9"
      },
      {
        "id": 292629,
        "hanzi": "上演",
        "pinyin": "shàngyǎn",
        "meaningVi": "chiếu (phim)",
        "levelCode": "6"
      },
      {
        "id": 298489,
        "hanzi": "主人公",
        "pinyin": "zhǔ rén gōng",
        "meaningVi": "nhân vật chính (của tiểu thuyết hoặc phim)",
        "levelCode": "7-9"
      },
      {
        "id": 318072,
        "hanzi": "主演",
        "pinyin": "zhǔyǎn",
        "meaningVi": "đóng vai chính",
        "levelCode": "6"
      },
      {
        "id": 288324,
        "hanzi": "关机",
        "pinyin": "guān jī",
        "meaningVi": "tắt (máy móc hoặc thiết bị)",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 134,
    "slug": "nghe-nhac-va-nhac-cu",
    "titleVi": "Nghe nhạc & Nhạc cụ",
    "titleZh": "音乐与乐器",
    "icon": "🎵🎸",
    "description": "Bài hát, ca sĩ, đàn piano, đàn guitar, tai nghe, hòa nhạc.",
    "hskLevel": "HSK 2",
    "wordCount": 65,
    "sampleWords": [
      {
        "id": 291891,
        "hanzi": "专辑",
        "pinyin": "zhuānjí",
        "meaningVi": "album",
        "levelCode": "5"
      },
      {
        "id": 324453,
        "hanzi": "主打",
        "pinyin": "zhǔdǎ",
        "meaningVi": "chính",
        "levelCode": "7-9"
      },
      {
        "id": 321988,
        "hanzi": "主题曲",
        "pinyin": "zhǔtíqǔ",
        "meaningVi": "bài hát chủ đề",
        "levelCode": "7-9"
      },
      {
        "id": 298491,
        "hanzi": "主题歌",
        "pinyin": "zhǔtígē",
        "meaningVi": "bài hát chủ đề",
        "levelCode": "7-9"
      },
      {
        "id": 318567,
        "hanzi": "乐器",
        "pinyin": "yuèqì",
        "meaningVi": "nhạc cụ",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 135,
    "slug": "doc-sach-va-bao-chi",
    "titleVi": "Đọc sách & Báo chí",
    "titleZh": "阅读与报刊",
    "icon": "📰",
    "description": "Đọc sách, tiểu thuyết, truyện tranh, tạp chí, báo hàng ngày.",
    "hskLevel": "HSK 2",
    "wordCount": 222,
    "sampleWords": [
      {
        "id": 296600,
        "hanzi": "上报",
        "pinyin": "shàng bào",
        "meaningVi": "báo cáo lên cấp trên",
        "levelCode": "7-9"
      },
      {
        "id": 289829,
        "hanzi": "专题",
        "pinyin": "zhuāntí",
        "meaningVi": "chủ đề cụ thể (được đề cập trong sách, bài giảng, chương trình TV, v.v.)",
        "levelCode": "3"
      },
      {
        "id": 293279,
        "hanzi": "丙",
        "pinyin": "bǐng",
        "meaningVi": "thứ ba trong mười Thiên Can 十天干",
        "levelCode": "7-9"
      },
      {
        "id": 320935,
        "hanzi": "丛",
        "pinyin": "cóng",
        "meaningVi": "đám",
        "levelCode": "7-9"
      },
      {
        "id": 316508,
        "hanzi": "中期",
        "pinyin": "zhōngqī",
        "meaningVi": "giữa (một khoảng thời gian)",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 136,
    "slug": "xem-kich-va-trien-lam",
    "titleVi": "Xem kịch & Triển lãm",
    "titleZh": "戏剧与艺术展览",
    "icon": "🎭",
    "description": "Vở kịch, nhà hát, phòng tranh, triển lãm điêu khắc, vé xem.",
    "hskLevel": "HSK 4",
    "wordCount": 211,
    "sampleWords": [
      {
        "id": 292628,
        "hanzi": "上台",
        "pinyin": "shàngtái",
        "meaningVi": "lên nắm quyền (trong chính trị)",
        "levelCode": "6"
      },
      {
        "id": 296601,
        "hanzi": "上场",
        "pinyin": "shàngchǎng",
        "meaningVi": "lên sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 292629,
        "hanzi": "上演",
        "pinyin": "shàngyǎn",
        "meaningVi": "chiếu (phim)",
        "levelCode": "6"
      },
      {
        "id": 297501,
        "hanzi": "下台",
        "pinyin": "xiàtái",
        "meaningVi": "rời khỏi sân khấu",
        "levelCode": "7-9"
      },
      {
        "id": 297487,
        "hanzi": "下场",
        "pinyin": "xià chǎng, xià chang",
        "meaningVi": "(xià chǎng) rời khỏi (sân khấu, phòng thi, sân đấu, v.v.)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 137,
    "slug": "khieu-vu-va-nhay-hien-dai",
    "titleVi": "Khiêu vũ & Nhảy hiện đại",
    "titleZh": "舞蹈与跳舞",
    "icon": "💃",
    "description": "Học nhảy, khiêu vũ, múa ba-lê, hip-hop, sàn nhảy, nhịp điệu.",
    "hskLevel": "HSK 3",
    "wordCount": 26,
    "sampleWords": [
      {
        "id": 293953,
        "hanzi": "东奔西走",
        "pinyin": "dōngbēnxīzǒu",
        "meaningVi": "chạy đông chạy tây (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 315060,
        "hanzi": "弹",
        "pinyin": "tán",
        "meaningVi": "gảy (dây đàn)",
        "levelCode": "4"
      },
      {
        "id": 297999,
        "hanzi": "抑扬顿挫",
        "pinyin": "yì yáng dùn cuò",
        "meaningVi": "nhịp điệu",
        "levelCode": "7-9"
      },
      {
        "id": 298411,
        "hanzi": "指手画脚",
        "pinyin": "zhǐshǒuhuàjiǎo",
        "meaningVi": "khoa tay múa chân (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 294357,
        "hanzi": "歌舞",
        "pinyin": "gē wǔ",
        "meaningVi": "hát và múa",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 138,
    "slug": "hoat-dong-ngoai-troi",
    "titleVi": "Hoạt động ngoài trời",
    "titleZh": "户外活动与郊游",
    "icon": "🏕️",
    "description": "Dã ngoại, cắm trại, câu cá, thả diều, nướng BBQ, picnic.",
    "hskLevel": "HSK 3",
    "wordCount": 17,
    "sampleWords": [
      {
        "id": 288318,
        "hanzi": "公园",
        "pinyin": "gōngyuán",
        "meaningVi": "công viên (dành cho công chúng giải trí)",
        "levelCode": "2"
      },
      {
        "id": 318555,
        "hanzi": "出游",
        "pinyin": "chūyóu",
        "meaningVi": "đi du lịch",
        "levelCode": "6"
      },
      {
        "id": 319607,
        "hanzi": "园区",
        "pinyin": "yuánqū",
        "meaningVi": "khu phát triển cho một nhóm doanh nghiệp liên quan",
        "levelCode": "7-9"
      },
      {
        "id": 291782,
        "hanzi": "园林",
        "pinyin": "yuán lín",
        "meaningVi": "vườn",
        "levelCode": "5"
      },
      {
        "id": 298539,
        "hanzi": "庄园",
        "pinyin": "zhuāng yuán",
        "meaningVi": "trang viên",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 139,
    "slug": "cong-vien-giai-tri",
    "titleVi": "Công viên giải trí",
    "titleZh": "游乐园与娱乐设施",
    "icon": "🎡",
    "description": "Vòng quay mặt trời, tàu lượn siêu tốc, nhà ma, đu quay.",
    "hskLevel": "HSK 3",
    "wordCount": 13,
    "sampleWords": [
      {
        "id": 293954,
        "hanzi": "东道主",
        "pinyin": "dōng dào zhǔ",
        "meaningVi": "chủ nhà",
        "levelCode": "7-9"
      },
      {
        "id": 322688,
        "hanzi": "副本",
        "pinyin": "fùběn",
        "meaningVi": "bản sao",
        "levelCode": "7-9"
      },
      {
        "id": 321264,
        "hanzi": "博弈",
        "pinyin": "bóyì",
        "meaningVi": "các trò chơi (như cờ, xúc xắc, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 318333,
        "hanzi": "围棋",
        "pinyin": "wéiqí",
        "meaningVi": "trò chơi cờ vây",
        "levelCode": "6"
      },
      {
        "id": 290275,
        "hanzi": "局",
        "pinyin": "jú",
        "meaningVi": "hẹp",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 140,
    "slug": "dong-vat-nuoi-va-thu-cung",
    "titleVi": "Động vật nuôi & Thú cưng",
    "titleZh": "宠物与家养动物",
    "icon": "🐶🐱",
    "description": "Chó, mèo, thỏ, vẹt, chuột hamster, thức ăn thú cưng.",
    "hskLevel": "HSK 1",
    "wordCount": 53,
    "sampleWords": [
      {
        "id": 294489,
        "hanzi": "乖巧",
        "pinyin": "guāi qiǎo",
        "meaningVi": "thông minh (trẻ em)",
        "levelCode": "7-9"
      },
      {
        "id": 297299,
        "hanzi": "亡羊补牢",
        "pinyin": "wáng yáng bǔ láo",
        "meaningVi": "nghĩa đen: sửa chuồng sau khi cừu bị mất (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 291620,
        "hanzi": "兔",
        "pinyin": "tù",
        "meaningVi": "thỏ",
        "levelCode": "5"
      },
      {
        "id": 316771,
        "hanzi": "兔子",
        "pinyin": "tùzi",
        "meaningVi": "thỏ",
        "levelCode": "5"
      },
      {
        "id": 288754,
        "hanzi": "养",
        "pinyin": "yǎng",
        "meaningVi": "nuôi (động vật)",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 141,
    "slug": "dong-vat-hoang-da",
    "titleVi": "Động vật hoang dã",
    "titleZh": "野生动物",
    "icon": "🦁🐼",
    "description": "Gấu trúc, hổ, sư tử, voi, hươu cao cổ, khỉ, gấu.",
    "hskLevel": "HSK 2",
    "wordCount": 78,
    "sampleWords": [
      {
        "id": 288161,
        "hanzi": "不好意思",
        "pinyin": "bùhǎoyìsī",
        "meaningVi": "cảm thấy xấu hổ",
        "levelCode": "2"
      },
      {
        "id": 293320,
        "hanzi": "不耻下问",
        "pinyin": "bù chǐ xià wèn",
        "meaningVi": "không cảm thấy xấu hổ khi hỏi và học từ cấp dưới",
        "levelCode": "7-9"
      },
      {
        "id": 290969,
        "hanzi": "丑",
        "pinyin": "chǒu",
        "meaningVi": "chú hề",
        "levelCode": "5"
      },
      {
        "id": 290959,
        "hanzi": "乘车",
        "pinyin": "chéng chē",
        "meaningVi": "đi (xe ô tô hoặc xe ngựa)",
        "levelCode": "5"
      },
      {
        "id": 296756,
        "hanzi": "使唤",
        "pinyin": "shǐ huàn",
        "meaningVi": "ra lệnh cho ai một cách tùy tiện",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 142,
    "slug": "chim-muong-va-con-trung",
    "titleVi": "Chim muông & Côn trùng",
    "titleZh": "鸟类与昆虫",
    "icon": "🦜🦋",
    "description": "Chim bồ câu, đại bàng, bướm, ong, kiến, muỗi, ruồi.",
    "hskLevel": "HSK 3",
    "wordCount": 125,
    "sampleWords": [
      {
        "id": 288944,
        "hanzi": "不断",
        "pinyin": "búduàn",
        "meaningVi": "không ngừng",
        "levelCode": "3"
      },
      {
        "id": 298512,
        "hanzi": "专长",
        "pinyin": "zhuāncháng",
        "meaningVi": "chuyên môn",
        "levelCode": "7-9"
      },
      {
        "id": 291868,
        "hanzi": "中断",
        "pinyin": "zhōng duàn",
        "meaningVi": "cắt ngắn",
        "levelCode": "5"
      },
      {
        "id": 290072,
        "hanzi": "二手",
        "pinyin": "èrshǒu",
        "meaningVi": "thu được gián tiếp",
        "levelCode": "4"
      },
      {
        "id": 288775,
        "hanzi": "以为",
        "pinyin": "yǐwéi",
        "meaningVi": "nghĩ rằng (tức là cho là đúng ...) (Thường có hàm ý rằng quan niệm đó là sai lầm – ngoại trừ khi diễn đạt ý kiến hiện tại của chính mình.)",
        "levelCode": "2"
      }
    ]
  },
  {
    "id": 143,
    "slug": "sinh-vat-bien-va-ca",
    "titleVi": "Sinh vật biển & Cá",
    "titleZh": "海洋生物与鱼类",
    "icon": "🐬🐳",
    "description": "Cá voi, cá heo, cá mập, rùa biển, sứa, san hô.",
    "hskLevel": "HSK 3",
    "wordCount": 22,
    "sampleWords": [
      {
        "id": 297491,
        "hanzi": "下海",
        "pinyin": "xià hǎi",
        "meaningVi": "ra biển",
        "levelCode": "7-9"
      },
      {
        "id": 318692,
        "hanzi": "乌龟",
        "pinyin": "wūguī",
        "meaningVi": "con rùa",
        "levelCode": "6"
      },
      {
        "id": 318814,
        "hanzi": "大洋洲",
        "pinyin": "Dàyángzhōu",
        "meaningVi": "Châu Đại Dương",
        "levelCode": "6"
      },
      {
        "id": 288217,
        "hanzi": "大海",
        "pinyin": "dàhǎi",
        "meaningVi": "biển",
        "levelCode": "2"
      },
      {
        "id": 292846,
        "hanzi": "洋",
        "pinyin": "yáng",
        "meaningVi": "đại dương",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 144,
    "slug": "hoa-va-cay-coi",
    "titleVi": "Hoa & Cây cối",
    "titleZh": "花卉与植物",
    "icon": "🌸🌻",
    "description": "Hoa hồng, hoa cúc, hoa sen, hoa mẫu đơn, lá cây, cành cây.",
    "hskLevel": "HSK 2",
    "wordCount": 178,
    "sampleWords": [
      {
        "id": 297978,
        "hanzi": "一头",
        "pinyin": "yītóu",
        "meaningVi": "một cái đầu",
        "levelCode": "7-9"
      },
      {
        "id": 313776,
        "hanzi": "下来",
        "pinyin": "xiàlái",
        "meaningVi": "đi xuống",
        "levelCode": "2"
      },
      {
        "id": 293302,
        "hanzi": "不定",
        "pinyin": "búdìng",
        "meaningVi": "không xác định",
        "levelCode": "7-9"
      },
      {
        "id": 316146,
        "hanzi": "中华",
        "pinyin": "Zhōnghuá",
        "meaningVi": "Trung Hoa (tên gọi trang trọng thay thế)",
        "levelCode": "5"
      },
      {
        "id": 289810,
        "hanzi": "中华民族",
        "pinyin": "zhōnghuámínzú",
        "meaningVi": "dân tộc Trung Hoa",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 145,
    "slug": "rung-ram-va-cay-xanh",
    "titleVi": "Rừng rậm & Cây xanh",
    "titleZh": "森林与绿化",
    "icon": "🌲🌳",
    "description": "Rừng nguyên sinh, bảo tồn rừng, trồng cây, phủ xanh đồi trọc.",
    "hskLevel": "HSK 4",
    "wordCount": 18,
    "sampleWords": [
      {
        "id": 293695,
        "hanzi": "丛林",
        "pinyin": "cónglín",
        "meaningVi": "rừng rậm",
        "levelCode": "7-9"
      },
      {
        "id": 296107,
        "hanzi": "刨",
        "pinyin": "páo, bào",
        "meaningVi": "(páo) đào",
        "levelCode": "7-9"
      },
      {
        "id": 314156,
        "hanzi": "园",
        "pinyin": "yuán",
        "meaningVi": "đất dùng để trồng cây",
        "levelCode": "3"
      },
      {
        "id": 317906,
        "hanzi": "干燥",
        "pinyin": "gānzào",
        "meaningVi": "(về thời tiết, khí hậu, đất đai, v.v.) khô",
        "levelCode": "6"
      },
      {
        "id": 289348,
        "hanzi": "录",
        "pinyin": "lù",
        "meaningVi": "khắc gỗ",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 146,
    "slug": "nui-non-va-song-ngoi",
    "titleVi": "Núi non & Sông ngòi",
    "titleZh": "山川与河流",
    "icon": "⛰️🌊",
    "description": "Núi cao, đỉnh núi, sông Trường Giang, Hoàng Hà, thác nước.",
    "hskLevel": "HSK 3",
    "wordCount": 102,
    "sampleWords": [
      {
        "id": 318758,
        "hanzi": "一帆风顺",
        "pinyin": "yìfān-fēngshùn",
        "meaningVi": "thuận buồm xuôi gió (thành ngữ)",
        "levelCode": "6"
      },
      {
        "id": 296618,
        "hanzi": "上游",
        "pinyin": "shàngyóu",
        "meaningVi": "thượng nguồn (của sông)",
        "levelCode": "7-9"
      },
      {
        "id": 320253,
        "hanzi": "上行",
        "pinyin": "shàngxíng",
        "meaningVi": "(tàu) hướng lên (tức là về hướng thủ đô)",
        "levelCode": "7-9"
      },
      {
        "id": 297498,
        "hanzi": "下山",
        "pinyin": "xiàshān",
        "meaningVi": "xuống núi",
        "levelCode": "7-9"
      },
      {
        "id": 297507,
        "hanzi": "下游",
        "pinyin": "xiàyóu",
        "meaningVi": "hạ lưu (của sông)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 147,
    "slug": "bien-va-dai-duong",
    "titleVi": "Biển & Đại dương",
    "titleZh": "海洋与大洋",
    "icon": "🌊⛵",
    "description": "Đại dương, sóng biển, thủy triều, hòn đảo, bờ biển, đáy biển.",
    "hskLevel": "HSK 3",
    "wordCount": 104,
    "sampleWords": [
      {
        "id": 297491,
        "hanzi": "下海",
        "pinyin": "xià hǎi",
        "meaningVi": "ra biển",
        "levelCode": "7-9"
      },
      {
        "id": 291891,
        "hanzi": "专辑",
        "pinyin": "zhuānjí",
        "meaningVi": "album",
        "levelCode": "5"
      },
      {
        "id": 291326,
        "hanzi": "两岸",
        "pinyin": "liǎngàn",
        "meaningVi": "song phương",
        "levelCode": "5"
      },
      {
        "id": 318773,
        "hanzi": "人山人海",
        "pinyin": "rénshān-rénhǎi",
        "meaningVi": "(thành ngữ) đám đông",
        "levelCode": "6"
      },
      {
        "id": 291876,
        "hanzi": "众多",
        "pinyin": "zhòngduō",
        "meaningVi": "đông đảo",
        "levelCode": "5"
      }
    ]
  },
  {
    "id": 148,
    "slug": "vu-tru-va-thien-van",
    "titleVi": "Vũ trụ & Thiên văn",
    "titleZh": "宇宙与天文",
    "icon": "🌌🪐",
    "description": "Mặt trời, mặt trăng, các vì sao, hành tinh, thiên thạch.",
    "hskLevel": "HSK 4",
    "wordCount": 113,
    "sampleWords": [
      {
        "id": 292870,
        "hanzi": "一模一样",
        "pinyin": "yī mú yī yàng",
        "meaningVi": "hoàn toàn giống nhau (thành ngữ)",
        "levelCode": "6"
      },
      {
        "id": 297498,
        "hanzi": "下山",
        "pinyin": "xiàshān",
        "meaningVi": "xuống núi",
        "levelCode": "7-9"
      },
      {
        "id": 293312,
        "hanzi": "不亦乐乎",
        "pinyin": "bù yì lè hū",
        "meaningVi": "nghĩa đen: chẳng phải vui sao? (trích Khổng Tử)",
        "levelCode": "7-9"
      },
      {
        "id": 291984,
        "hanzi": "不成",
        "pinyin": "bù chéng",
        "meaningVi": "không được",
        "levelCode": "6"
      },
      {
        "id": 289910,
        "hanzi": "不然",
        "pinyin": "bùrán",
        "meaningVi": "không phải vậy",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 149,
    "slug": "moi-truong-va-o-nhiem",
    "titleVi": "Môi trường & Ô nhiễm",
    "titleZh": "环境与污染",
    "icon": "🌫️🚯",
    "description": "Ô nhiễm không khí, khói bụi, rác thải nhựa, ô nhiễm nguồn nước.",
    "hskLevel": "HSK 4",
    "wordCount": 15,
    "sampleWords": [
      {
        "id": 293587,
        "hanzi": "出局",
        "pinyin": "chūjú",
        "meaningVi": "(cầu thủ bóng chày) bị loại",
        "levelCode": "7-9"
      },
      {
        "id": 317372,
        "hanzi": "周边",
        "pinyin": "zhōubiān",
        "meaningVi": "ngoại vi",
        "levelCode": "6"
      },
      {
        "id": 290305,
        "hanzi": "垃圾",
        "pinyin": "lājī",
        "meaningVi": "rác",
        "levelCode": "4"
      },
      {
        "id": 321125,
        "hanzi": "媒介",
        "pinyin": "méijiè",
        "meaningVi": "trung gian",
        "levelCode": "7-9"
      },
      {
        "id": 297336,
        "hanzi": "尾气",
        "pinyin": "wěi qì",
        "meaningVi": "khí thải",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 150,
    "slug": "tai-che-va-bao-ve-moi-truong",
    "titleVi": "Tái chế & Bảo vệ môi trường",
    "titleZh": "垃圾分类与回收",
    "icon": "♻️",
    "description": "Phân loại rác, tái chế, tiết kiệm năng lượng, sống xanh.",
    "hskLevel": "HSK 4",
    "wordCount": 6,
    "sampleWords": [
      {
        "id": 292934,
        "hanzi": "再生",
        "pinyin": "zàishēng",
        "meaningVi": "tái sinh",
        "levelCode": "6"
      },
      {
        "id": 291088,
        "hanzi": "分类",
        "pinyin": "fēnlèi",
        "meaningVi": "phân loại",
        "levelCode": "5"
      },
      {
        "id": 291191,
        "hanzi": "回收",
        "pinyin": "huíshōu",
        "meaningVi": "tái chế",
        "levelCode": "5"
      },
      {
        "id": 323039,
        "hanzi": "翻新",
        "pinyin": "fānxīn",
        "meaningVi": "tân trang",
        "levelCode": "7-9"
      },
      {
        "id": 295150,
        "hanzi": "节水",
        "pinyin": "jié shuǐ",
        "meaningVi": "tiết kiệm nước",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 151,
    "slug": "bien-doi-khi-hau-va-thien-tai",
    "titleVi": "Biến đổi khí hậu & Thiên tai",
    "titleZh": "气候变化与自然灾害",
    "icon": "🌋🌪️",
    "description": "Động đất, sóng thần, lũ lụt, hạn hán, biến đổi khí hậu.",
    "hskLevel": "HSK 5",
    "wordCount": 12,
    "sampleWords": [
      {
        "id": 291548,
        "hanzi": "受灾",
        "pinyin": "shòuzāi",
        "meaningVi": "bị thiên tai",
        "levelCode": "5"
      },
      {
        "id": 291046,
        "hanzi": "地震",
        "pinyin": "dìzhèn",
        "meaningVi": "động đất",
        "levelCode": "5"
      },
      {
        "id": 318430,
        "hanzi": "干旱",
        "pinyin": "gānhàn",
        "meaningVi": "hạn hán",
        "levelCode": "6"
      },
      {
        "id": 291264,
        "hanzi": "救灾",
        "pinyin": "jiù zāi",
        "meaningVi": "cứu trợ thiên tai",
        "levelCode": "5"
      },
      {
        "id": 294617,
        "hanzi": "旱",
        "pinyin": "hàn",
        "meaningVi": "hạn hán",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 152,
    "slug": "may-tinh-va-phan-mem",
    "titleVi": "Máy tính & Phần mềm",
    "titleZh": "电脑与软件",
    "icon": "💻",
    "description": "Máy tính để bàn, laptop, bàn phím, chuột, cài đặt phần mềm.",
    "hskLevel": "HSK 2",
    "wordCount": 57,
    "sampleWords": [
      {
        "id": 317555,
        "hanzi": "事务",
        "pinyin": "shìwù",
        "meaningVi": "(chính trị, kinh tế, v.v.) công việc",
        "levelCode": "6"
      },
      {
        "id": 291023,
        "hanzi": "代理",
        "pinyin": "dàilǐ",
        "meaningVi": "đại diện cho ai đó trong một vị trí trách nhiệm",
        "levelCode": "5"
      },
      {
        "id": 291703,
        "hanzi": "修复",
        "pinyin": "xiū fù",
        "meaningVi": "khôi phục",
        "levelCode": "5"
      },
      {
        "id": 296020,
        "hanzi": "内存",
        "pinyin": "nèi cún",
        "meaningVi": "bộ nhớ trong",
        "levelCode": "7-9"
      },
      {
        "id": 289084,
        "hanzi": "分组",
        "pinyin": "fēnzǔ",
        "meaningVi": "chia thành nhóm",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 153,
    "slug": "dien-thoai-va-ung-dung",
    "titleVi": "Điện thoại thông minh & Ứng dụng",
    "titleZh": "智能手机与应用",
    "icon": "📱",
    "description": "Điện thoại, cảm ứng, tải app, sạc pin, nhắn tin, gọi video.",
    "hskLevel": "HSK 2",
    "wordCount": 29,
    "sampleWords": [
      {
        "id": 288737,
        "hanzi": "信息",
        "pinyin": "xìn xī",
        "meaningVi": "thông tin",
        "levelCode": "2"
      },
      {
        "id": 289956,
        "hanzi": "充电器",
        "pinyin": "chōng diàn qì",
        "meaningVi": "bộ sạc pin",
        "levelCode": "4"
      },
      {
        "id": 317026,
        "hanzi": "占线",
        "pinyin": "zhànxiàn",
        "meaningVi": "bận (đường dây điện thoại)",
        "levelCode": "5"
      },
      {
        "id": 297189,
        "hanzi": "头条",
        "pinyin": "tóutiáo",
        "meaningVi": "tin nổi bật (trên tin tức)",
        "levelCode": "7-9"
      },
      {
        "id": 290548,
        "hanzi": "套餐",
        "pinyin": "tào cān",
        "meaningVi": "bữa ăn set",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 154,
    "slug": "internet-va-mang-xa-hoi",
    "titleVi": "Internet & Mạng xã hội",
    "titleZh": "互联网与社交媒体",
    "icon": "🌐💬",
    "description": "Lướt web, mạng xã hội, đăng bài, bình luận, thả tim, wifi.",
    "hskLevel": "HSK 2",
    "wordCount": 64,
    "sampleWords": [
      {
        "id": 287946,
        "hanzi": "上网",
        "pinyin": "shàng wǎng",
        "meaningVi": "lên mạng",
        "levelCode": "1"
      },
      {
        "id": 318846,
        "hanzi": "下线",
        "pinyin": "xiàxiàn",
        "meaningVi": "rời mạng",
        "levelCode": "6"
      },
      {
        "id": 296555,
        "hanzi": "丧生",
        "pinyin": "sàng shēng",
        "meaningVi": "chết",
        "levelCode": "7-9"
      },
      {
        "id": 318855,
        "hanzi": "主播",
        "pinyin": "zhǔbō",
        "meaningVi": "người dẫn tin tức",
        "levelCode": "6"
      },
      {
        "id": 289544,
        "hanzi": "事业",
        "pinyin": "shìyè",
        "meaningVi": "công việc",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 155,
    "slug": "tri-tue-nhan-tao-va-robot",
    "titleVi": "Trí tuệ nhân tạo & Robot",
    "titleZh": "人工智能与机器人",
    "icon": "🤖",
    "description": "AI, học máy, robot tự động, xử lý ngôn ngữ, tương lai.",
    "hskLevel": "HSK 5",
    "wordCount": 208,
    "sampleWords": [
      {
        "id": 292625,
        "hanzi": "上当",
        "pinyin": "shàngdàng",
        "meaningVi": "bị lừa (bởi sự lừa dối của ai đó)",
        "levelCode": "6"
      },
      {
        "id": 293343,
        "hanzi": "不为人知",
        "pinyin": "bù wéi rén zhī",
        "meaningVi": "không được ai biết",
        "levelCode": "7-9"
      },
      {
        "id": 288161,
        "hanzi": "不好意思",
        "pinyin": "bùhǎoyìsī",
        "meaningVi": "cảm thấy xấu hổ",
        "levelCode": "2"
      },
      {
        "id": 288945,
        "hanzi": "不论",
        "pinyin": "búlùn",
        "meaningVi": "bất kể",
        "levelCode": "3"
      },
      {
        "id": 293646,
        "hanzi": "串门",
        "pinyin": "chuàn mén",
        "meaningVi": "ghé thăm",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 156,
    "slug": "cong-nghe-thong-tin-va-lap-trinh",
    "titleVi": "Công nghệ thông tin & Lập trình",
    "titleZh": "信息技术与编程",
    "icon": "👨‍💻",
    "description": "Lập trình viên, mã nguồn, viết code, sửa lỗi bug, cơ sở dữ liệu.",
    "hskLevel": "HSK 4",
    "wordCount": 32,
    "sampleWords": [
      {
        "id": 297487,
        "hanzi": "下场",
        "pinyin": "xià chǎng, xià chang",
        "meaningVi": "(xià chǎng) rời khỏi (sân khấu, phòng thi, sân đấu, v.v.)",
        "levelCode": "7-9"
      },
      {
        "id": 288852,
        "hanzi": "中级",
        "pinyin": "zhōng jí",
        "meaningVi": "cấp trung (trong hệ thống phân cấp)",
        "levelCode": "2"
      },
      {
        "id": 317555,
        "hanzi": "事务",
        "pinyin": "shìwù",
        "meaningVi": "(chính trị, kinh tế, v.v.) công việc",
        "levelCode": "6"
      },
      {
        "id": 294995,
        "hanzi": "价值观",
        "pinyin": "jiàzhíguān",
        "meaningVi": "hệ thống giá trị",
        "levelCode": "7-9"
      },
      {
        "id": 297101,
        "hanzi": "体制",
        "pinyin": "tǐzhì",
        "meaningVi": "hệ thống",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 157,
    "slug": "khoa-hoc-va-thi-nghiem",
    "titleVi": "Khoa học & Thí nghiệm",
    "titleZh": "科学实验与探索",
    "icon": "🔬",
    "description": "Nhà khoa học, phòng thí nghiệm, hóa học, vật lý, phát minh.",
    "hskLevel": "HSK 4",
    "wordCount": 94,
    "sampleWords": [
      {
        "id": 296349,
        "hanzi": "亲和力",
        "pinyin": "qīn hé lì",
        "meaningVi": "(sự) ấm áp",
        "levelCode": "7-9"
      },
      {
        "id": 294233,
        "hanzi": "俘获",
        "pinyin": "fú huò",
        "meaningVi": "bắt giữ (tài sản hoặc nhân sự địch)",
        "levelCode": "7-9"
      },
      {
        "id": 292915,
        "hanzi": "元素",
        "pinyin": "yuánsù",
        "meaningVi": "thành phần cơ bản của cái gì đó",
        "levelCode": "6"
      },
      {
        "id": 294433,
        "hanzi": "共鸣",
        "pinyin": "gòngmíng",
        "meaningVi": "(vật lý) cộng hưởng",
        "levelCode": "7-9"
      },
      {
        "id": 295599,
        "hanzi": "冷门",
        "pinyin": "lěng mén",
        "meaningVi": "một nhánh ít được chú ý (của nghệ thuật, khoa học, thể thao, v.v.)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 158,
    "slug": "nang-luong-sach-va-tai-tao",
    "titleVi": "Năng lượng sạch & Năng lượng tái tạo",
    "titleZh": "清洁能源与新能源",
    "icon": "⚡🔋",
    "description": "Năng lượng mặt trời, năng lượng gió, xe điện, pin lithium.",
    "hskLevel": "HSK 5",
    "wordCount": 35,
    "sampleWords": [
      {
        "id": 290109,
        "hanzi": "付出",
        "pinyin": "fùchū",
        "meaningVi": "trả",
        "levelCode": "4"
      },
      {
        "id": 289955,
        "hanzi": "充电",
        "pinyin": "chōngdiàn",
        "meaningVi": "sạc (pin)",
        "levelCode": "4"
      },
      {
        "id": 289956,
        "hanzi": "充电器",
        "pinyin": "chōng diàn qì",
        "meaningVi": "bộ sạc pin",
        "levelCode": "4"
      },
      {
        "id": 298224,
        "hanzi": "再现",
        "pinyin": "zài xiàn",
        "meaningVi": "tái tạo",
        "levelCode": "7-9"
      },
      {
        "id": 292934,
        "hanzi": "再生",
        "pinyin": "zàishēng",
        "meaningVi": "tái sinh",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 159,
    "slug": "khong-gian-va-kham-pha-vu-tru",
    "titleVi": "Không gian & Khám phá vũ trụ",
    "titleZh": "航天与太空探索",
    "icon": "🚀🛰️",
    "description": "Tàu vũ trụ, phi hành gia, trạm không gian, phóng tên lửa.",
    "hskLevel": "HSK 5",
    "wordCount": 11,
    "sampleWords": [
      {
        "id": 291637,
        "hanzi": "卫星",
        "pinyin": "wèixīng",
        "meaningVi": "vệ tinh",
        "levelCode": "5"
      },
      {
        "id": 297344,
        "hanzi": "卫视",
        "pinyin": "wèi shì",
        "meaningVi": "truyền hình vệ tinh (viết tắt của 卫星电视)",
        "levelCode": "7-9"
      },
      {
        "id": 292912,
        "hanzi": "宇航员",
        "pinyin": "yǔ háng yuán",
        "meaningVi": "phi hành gia",
        "levelCode": "6"
      },
      {
        "id": 320446,
        "hanzi": "星球",
        "pinyin": "xīngqiú",
        "meaningVi": "thiên thể (ví dụ: hành tinh, vệ tinh,...)",
        "levelCode": "7-9"
      },
      {
        "id": 295854,
        "hanzi": "枚",
        "pinyin": "méi",
        "meaningVi": "lượng từ cho tiền xu, nhẫn, huy hiệu, ngọc trai, huy chương thể thao, tên lửa, vệ tinh, v.v.",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 160,
    "slug": "du-lieu-va-an-toan-thong-tin",
    "titleVi": "Dữ liệu & An toàn thông tin",
    "titleZh": "大数据与网络安全",
    "icon": "🔒🛡️",
    "description": "Mật khẩu, bảo mật, hacker, virus máy tính, đánh cắp dữ liệu.",
    "hskLevel": "HSK 5",
    "wordCount": 25,
    "sampleWords": [
      {
        "id": 317555,
        "hanzi": "事务",
        "pinyin": "shìwù",
        "meaningVi": "(chính trị, kinh tế, v.v.) công việc",
        "levelCode": "6"
      },
      {
        "id": 289883,
        "hanzi": "保密",
        "pinyin": "bǎomì",
        "meaningVi": "giữ bí mật",
        "levelCode": "4"
      },
      {
        "id": 321341,
        "hanzi": "切换",
        "pinyin": "qiēhuàn",
        "meaningVi": "chuyển đổi",
        "levelCode": "7-9"
      },
      {
        "id": 290335,
        "hanzi": "列",
        "pinyin": "liè",
        "meaningVi": "sắp xếp",
        "levelCode": "4"
      },
      {
        "id": 295470,
        "hanzi": "口令",
        "pinyin": "kǒulìng",
        "meaningVi": "mệnh lệnh bằng miệng",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 161,
    "slug": "thuong-mai-dien-tu-va-fintech",
    "titleVi": "Thương mại điện tử & Fintech",
    "titleZh": "电子商务与金融科技",
    "icon": "💳📱",
    "description": "Thanh toán di động, ngân hàng số, ví điện tử, sàn thương mại.",
    "hskLevel": "HSK 5",
    "wordCount": 2,
    "sampleWords": [
      {
        "id": 317030,
        "hanzi": "电商",
        "pinyin": "diànshāng",
        "meaningVi": "thương mại điện tử (viết tắt của 电子商务)",
        "levelCode": "5"
      },
      {
        "id": 292372,
        "hanzi": "金融",
        "pinyin": "jīnróng",
        "meaningVi": "ngân hàng",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 162,
    "slug": "le-hoi-truyen-thong-trung-quoc",
    "titleVi": "Lễ hội truyền thống Trung Quốc",
    "titleZh": "中国传统节日",
    "icon": "🏮",
    "description": "Tết Nguyên Đán, Tết Trung Thu, Tết Đoan Ngọ, Tết Thanh Minh.",
    "hskLevel": "HSK 3",
    "wordCount": 42,
    "sampleWords": [
      {
        "id": 291869,
        "hanzi": "中秋节",
        "pinyin": "Zhōng qiū jié",
        "meaningVi": "Tết Trung Thu vào ngày 15 tháng 8 âm lịch",
        "levelCode": "5"
      },
      {
        "id": 318554,
        "hanzi": "习俗",
        "pinyin": "xísú",
        "meaningVi": "phong tục",
        "levelCode": "6"
      },
      {
        "id": 291470,
        "hanzi": "人物",
        "pinyin": "rénwù",
        "meaningVi": "người",
        "levelCode": "5"
      },
      {
        "id": 318460,
        "hanzi": "传承",
        "pinyin": "chuánchéng",
        "meaningVi": "truyền lại (cho thế hệ sau)",
        "levelCode": "6"
      },
      {
        "id": 289969,
        "hanzi": "传统",
        "pinyin": "chuántǒng",
        "meaningVi": "truyền thống",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 163,
    "slug": "thu-phap-va-hoi-hoa",
    "titleVi": "Thư pháp & Hội họa Trung Hoa",
    "titleZh": "书法与国画",
    "icon": "🖌️",
    "description": "Bút lông, mực tàu, nghiên mực, giấy tuyên, tranh thủy mặc.",
    "hskLevel": "HSK 4",
    "wordCount": 43,
    "sampleWords": [
      {
        "id": 298442,
        "hanzi": "中国画",
        "pinyin": "Zhōng guó huà",
        "meaningVi": "tranh Trung Quốc",
        "levelCode": "7-9"
      },
      {
        "id": 291550,
        "hanzi": "书法",
        "pinyin": "shūfǎ",
        "meaningVi": "thư pháp",
        "levelCode": "5"
      },
      {
        "id": 318512,
        "hanzi": "书画",
        "pinyin": "shūhuà",
        "meaningVi": "hội họa và thư pháp",
        "levelCode": "6"
      },
      {
        "id": 291470,
        "hanzi": "人物",
        "pinyin": "rénwù",
        "meaningVi": "người",
        "levelCode": "5"
      },
      {
        "id": 289853,
        "hanzi": "作品",
        "pinyin": "zuòpǐn",
        "meaningVi": "tác phẩm",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 164,
    "slug": "tra-dao-va-van-hoa-uong-tra",
    "titleVi": "Trà đạo & Văn hóa uống trà",
    "titleZh": "茶道与茶文化",
    "icon": "🍵🫖",
    "description": "Ấm chén trà, nghệ thuật pha trà, thưởng trà, văn hóa trà đạo.",
    "hskLevel": "HSK 4",
    "wordCount": 3,
    "sampleWords": [
      {
        "id": 288879,
        "hanzi": "嘴",
        "pinyin": "zuǐ",
        "meaningVi": "miệng",
        "levelCode": "2"
      },
      {
        "id": 289927,
        "hanzi": "茶叶",
        "pinyin": "cháyè",
        "meaningVi": "trà",
        "levelCode": "4"
      },
      {
        "id": 293417,
        "hanzi": "茶道",
        "pinyin": "chá dào",
        "meaningVi": "trà đạo",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 165,
    "slug": "kinh-kich-va-nghe-thuat-bieu-dien",
    "titleVi": "Kinh kịch & Nghệ thuật biểu diễn",
    "titleZh": "京剧与传统戏曲",
    "icon": "🎭",
    "description": "Mặt nạ kinh kịch, hát tuồng, hí kịch, trang phục biểu diễn.",
    "hskLevel": "HSK 5",
    "wordCount": 7,
    "sampleWords": [
      {
        "id": 289266,
        "hanzi": "京剧",
        "pinyin": "Jīng jù",
        "meaningVi": "Kinh kịch",
        "levelCode": "3"
      },
      {
        "id": 295668,
        "hanzi": "亮相",
        "pinyin": "liàng xiàng",
        "meaningVi": "tạo dáng (kinh kịch Trung Quốc)",
        "levelCode": "7-9"
      },
      {
        "id": 292385,
        "hanzi": "净",
        "pinyin": "jìng",
        "meaningVi": "sạch",
        "levelCode": "6"
      },
      {
        "id": 295117,
        "hanzi": "叫板",
        "pinyin": "jiào bǎn",
        "meaningVi": "ra hiệu cho nhạc công (trong kinh kịch, bằng cách kéo dài một từ trước khi vào bài hát)",
        "levelCode": "7-9"
      },
      {
        "id": 292786,
        "hanzi": "戏曲",
        "pinyin": "xìqǔ",
        "meaningVi": "hý kịch Trung Quốc",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 166,
    "slug": "lich-su-va-co-vat",
    "titleVi": "Lịch sử & Cổ vật",
    "titleZh": "历史与文物",
    "icon": "🏺",
    "description": "Các triều đại, đồ gốm sứ, khảo cổ học, di sản lịch sử.",
    "hskLevel": "HSK 4",
    "wordCount": 44,
    "sampleWords": [
      {
        "id": 287840,
        "hanzi": "两",
        "pinyin": "liǎng",
        "meaningVi": "hai",
        "levelCode": "1"
      },
      {
        "id": 289017,
        "hanzi": "代",
        "pinyin": "dài",
        "meaningVi": "thay thế",
        "levelCode": "3"
      },
      {
        "id": 318460,
        "hanzi": "传承",
        "pinyin": "chuánchéng",
        "meaningVi": "truyền lại (cho thế hệ sau)",
        "levelCode": "6"
      },
      {
        "id": 298224,
        "hanzi": "再现",
        "pinyin": "zài xiàn",
        "meaningVi": "tái tạo",
        "levelCode": "7-9"
      },
      {
        "id": 295602,
        "hanzi": "冷战",
        "pinyin": "lěngzhàn",
        "meaningVi": "chiến tranh lạnh",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 167,
    "slug": "dia-ly-va-thanh-pho-lon",
    "titleVi": "Địa lý & Thành phố lớn",
    "titleZh": "地理与著名城市",
    "icon": "🏙️🗺️",
    "description": "Bắc Kinh, Thượng Hải, Quảng Châu, Tây An, bản đồ địa lý.",
    "hskLevel": "HSK 2",
    "wordCount": 81,
    "sampleWords": [
      {
        "id": 297965,
        "hanzi": "一卡通",
        "pinyin": "Yī kǎ tōng",
        "meaningVi": "tên của các loại thẻ thông minh không tiếp xúc, nổi bật là Yikatong (chủ yếu cho giao thông công cộng ở Bắc Kinh) và iPASS (chủ yếu cho giao thông công cộng ở Đài Loan)",
        "levelCode": "7-9"
      },
      {
        "id": 320253,
        "hanzi": "上行",
        "pinyin": "shàngxíng",
        "meaningVi": "(tàu) hướng lên (tức là về hướng thủ đô)",
        "levelCode": "7-9"
      },
      {
        "id": 320933,
        "hanzi": "下行",
        "pinyin": "xiàxíng",
        "meaningVi": "(của xe lửa) đi xuống (tức là rời thủ đô)",
        "levelCode": "7-9"
      },
      {
        "id": 294191,
        "hanzi": "丰满",
        "pinyin": "fēng mǎn",
        "meaningVi": "đầy đặn",
        "levelCode": "7-9"
      },
      {
        "id": 289821,
        "hanzi": "主意",
        "pinyin": "zhǔyì",
        "meaningVi": "kế hoạch",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 168,
    "slug": "phap-luat-va-quyen-cong-dan",
    "titleVi": "Pháp luật & Quyền công dân",
    "titleZh": "法律与公民权利",
    "icon": "⚖️📜",
    "description": "Tòa án, luật sư, công lý, hiến pháp, quyền lợi công dân.",
    "hskLevel": "HSK 5",
    "wordCount": 136,
    "sampleWords": [
      {
        "id": 323421,
        "hanzi": "一丝不苟",
        "pinyin": "yìsī-bùgǒu",
        "meaningVi": "không một sợi lỏng lẻo (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 320253,
        "hanzi": "上行",
        "pinyin": "shàngxíng",
        "meaningVi": "(tàu) hướng lên (tức là về hướng thủ đô)",
        "levelCode": "7-9"
      },
      {
        "id": 291879,
        "hanzi": "主办",
        "pinyin": "zhǔbàn",
        "meaningVi": "tổ chức",
        "levelCode": "5"
      },
      {
        "id": 289818,
        "hanzi": "主持",
        "pinyin": "zhǔchí",
        "meaningVi": "phụ trách",
        "levelCode": "3"
      },
      {
        "id": 289541,
        "hanzi": "事件",
        "pinyin": "shìjiàn",
        "meaningVi": "sự kiện",
        "levelCode": "3"
      }
    ]
  },
  {
    "id": 169,
    "slug": "tinh-nguyen-va-hoat-dong-xa-hoi",
    "titleVi": "Tình nguyện & Hoạt động xã hội",
    "titleZh": "志愿者与公益慈善",
    "icon": "❤️🤝",
    "description": "Tình nguyện viên, từ thiện, quyên góp, giúp đỡ người nghèo.",
    "hskLevel": "HSK 4",
    "wordCount": 47,
    "sampleWords": [
      {
        "id": 290729,
        "hanzi": "义务",
        "pinyin": "yìwù",
        "meaningVi": "nhiệm vụ",
        "levelCode": "4"
      },
      {
        "id": 297988,
        "hanzi": "义工",
        "pinyin": "yìgōng",
        "meaningVi": "người làm tình nguyện",
        "levelCode": "7-9"
      },
      {
        "id": 289544,
        "hanzi": "事业",
        "pinyin": "shìyè",
        "meaningVi": "công việc",
        "levelCode": "3"
      },
      {
        "id": 296488,
        "hanzi": "仁慈",
        "pinyin": "rén cí",
        "meaningVi": "nhân từ",
        "levelCode": "7-9"
      },
      {
        "id": 317942,
        "hanzi": "借助",
        "pinyin": "jièzhù",
        "meaningVi": "nhờ vào",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 170,
    "slug": "cam-xuc-tich-cuc",
    "titleVi": "Cảm xúc tích cực & Vui vẻ",
    "titleZh": "积极情绪与快乐",
    "icon": "😄✨",
    "description": "Vui vẻ, phấn khởi, hạnh phúc, tự hào, hào hứng, hài lòng.",
    "hskLevel": "HSK 1",
    "wordCount": 141,
    "sampleWords": [
      {
        "id": 288768,
        "hanzi": "一路平安",
        "pinyin": "yī lù píng ān",
        "meaningVi": "có chuyến đi vui vẻ",
        "levelCode": "2"
      },
      {
        "id": 293312,
        "hanzi": "不亦乐乎",
        "pinyin": "bù yì lè hū",
        "meaningVi": "nghĩa đen: chẳng phải vui sao? (trích Khổng Tử)",
        "levelCode": "7-9"
      },
      {
        "id": 288163,
        "hanzi": "不满",
        "pinyin": "bùmǎn",
        "meaningVi": "bực bội",
        "levelCode": "2"
      },
      {
        "id": 289318,
        "hanzi": "乐",
        "pinyin": "lè",
        "meaningVi": "vui",
        "levelCode": "3"
      },
      {
        "id": 318679,
        "hanzi": "乐于",
        "pinyin": "lèyú",
        "meaningVi": "sẵn lòng (làm gì đó)",
        "levelCode": "6"
      }
    ]
  },
  {
    "id": 171,
    "slug": "cam-xuc-tieu-cuc-va-buon-ba",
    "titleVi": "Cảm xúc tiêu cực & Buồn bã",
    "titleZh": "消极情绪与悲伤",
    "icon": "😢💔",
    "description": "Buồn bã, khóc, thất vọng, đau khổ, cô đơn, chán nản.",
    "hskLevel": "HSK 2",
    "wordCount": 81,
    "sampleWords": [
      {
        "id": 290903,
        "hanzi": "不幸",
        "pinyin": "búxìng",
        "meaningVi": "bất hạnh",
        "levelCode": "5"
      },
      {
        "id": 323648,
        "hanzi": "乐此不疲",
        "pinyin": "lècǐ-bùpí",
        "meaningVi": "rất thích điều gì đó và không bao giờ chán (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 289495,
        "hanzi": "伤心",
        "pinyin": "shāngxīn",
        "meaningVi": "đau buồn",
        "levelCode": "3"
      },
      {
        "id": 296593,
        "hanzi": "伤感",
        "pinyin": "shāng gǎn",
        "meaningVi": "buồn",
        "levelCode": "7-9"
      },
      {
        "id": 321607,
        "hanzi": "低落",
        "pinyin": "dīluò",
        "meaningVi": "chán nản",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 172,
    "slug": "tuc-gian-va-kho-chiu",
    "titleVi": "Tức giận & Khó chịu",
    "titleZh": "愤怒与烦恼",
    "icon": "😡💥",
    "description": "Tức giận, phẫn nộ, bực mình, cáu kỉnh, nổi giận, mất bình tĩnh.",
    "hskLevel": "HSK 2",
    "wordCount": 37,
    "sampleWords": [
      {
        "id": 296604,
        "hanzi": "上火",
        "pinyin": "shàng huǒ",
        "meaningVi": "nổi giận",
        "levelCode": "7-9"
      },
      {
        "id": 293338,
        "hanzi": "不平",
        "pinyin": "bùpíng",
        "meaningVi": "không đồng đều",
        "levelCode": "7-9"
      },
      {
        "id": 293326,
        "hanzi": "不服气",
        "pinyin": "bufúqì",
        "meaningVi": "không chịu nhường",
        "levelCode": "7-9"
      },
      {
        "id": 288163,
        "hanzi": "不满",
        "pinyin": "bùmǎn",
        "meaningVi": "bực bội",
        "levelCode": "2"
      },
      {
        "id": 295601,
        "hanzi": "冷笑",
        "pinyin": "lěng xiào",
        "meaningVi": "cười nhếch mép",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 173,
    "slug": "so-hai-va-lo-lang",
    "titleVi": "Sợ hãi & Lo lắng",
    "titleZh": "恐惧与担忧",
    "icon": "😨",
    "description": "Sợ hãi, kinh hãi, bất an, run rẩy, hoảng sợ, lo âu.",
    "hskLevel": "HSK 3",
    "wordCount": 73,
    "sampleWords": [
      {
        "id": 288948,
        "hanzi": "不安",
        "pinyin": "bùān",
        "meaningVi": "không yên",
        "levelCode": "3"
      },
      {
        "id": 298354,
        "hanzi": "争先恐后",
        "pinyin": "zhēngxiānkǒnghòu",
        "meaningVi": "tranh nhau làm trước và sợ bị làm sau (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 321370,
        "hanzi": "关切",
        "pinyin": "guānqiè",
        "meaningVi": "hết sức quan tâm",
        "levelCode": "7-9"
      },
      {
        "id": 292824,
        "hanzi": "凶",
        "pinyin": "xiōng",
        "meaningVi": "kinh khủng",
        "levelCode": "6"
      },
      {
        "id": 297697,
        "hanzi": "凶恶",
        "pinyin": "xiōng è",
        "meaningVi": "dữ dội",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 174,
    "slug": "ngac-nhien-va-to-mo",
    "titleVi": "Ngạc nhiên & Tò mò",
    "titleZh": "惊讶与好奇",
    "icon": "😲🔍",
    "description": "Bất ngờ, kinh ngạc, tò mò, khám phá, sửng sốt, lạ lùng.",
    "hskLevel": "HSK 3",
    "wordCount": 54,
    "sampleWords": [
      {
        "id": 290594,
        "hanzi": "万一",
        "pinyin": "wànyī",
        "meaningVi": "phòng khi",
        "levelCode": "4"
      },
      {
        "id": 291976,
        "hanzi": "不料",
        "pinyin": "búliào",
        "meaningVi": "một cách bất ngờ",
        "levelCode": "6"
      },
      {
        "id": 290333,
        "hanzi": "了不起",
        "pinyin": "liǎo bu qǐ",
        "meaningVi": "kinh ngạc",
        "levelCode": "4"
      },
      {
        "id": 293593,
        "hanzi": "出人意料",
        "pinyin": "chū rén yì liào",
        "meaningVi": "không ngờ tới (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 323914,
        "hanzi": "受宠若惊",
        "pinyin": "shòuchǒng-ruòjīng",
        "meaningVi": "quá bất ngờ vì được cấp trên ưu ái (cách nói khiêm tốn)",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 175,
    "slug": "tinh-cach-tot-va-pham-chat",
    "titleVi": "Tính cách tốt & Phẩm chất",
    "titleZh": "优秀品质与性格",
    "icon": "🌟",
    "description": "Thật thà, dũng cảm, chăm chỉ, tốt bụng, kiên trì, khiêm tốn.",
    "hskLevel": "HSK 3",
    "wordCount": 91,
    "sampleWords": [
      {
        "id": 297920,
        "hanzi": "一个劲儿",
        "pinyin": "yīgèjìnr",
        "meaningVi": "(dạng er hóa) liên tục",
        "levelCode": "7-9"
      },
      {
        "id": 297927,
        "hanzi": "一味",
        "pinyin": "yīwèi",
        "meaningVi": "một cách kiên trì",
        "levelCode": "7-9"
      },
      {
        "id": 292864,
        "hanzi": "一贯",
        "pinyin": "yīguàn",
        "meaningVi": "nhất quán",
        "levelCode": "6"
      },
      {
        "id": 298353,
        "hanzi": "争气",
        "pinyin": "zhēng qì",
        "meaningVi": "làm việc chăm chỉ vì điều gì",
        "levelCode": "7-9"
      },
      {
        "id": 290676,
        "hanzi": "兄弟",
        "pinyin": "xiōngdì",
        "meaningVi": "anh em",
        "levelCode": "4"
      }
    ]
  },
  {
    "id": 176,
    "slug": "tinh-cach-xau-va-khuyet-diem",
    "titleVi": "Tính cách xấu & Khuyết điểm",
    "titleZh": "性格缺点与劣根性",
    "icon": "👿",
    "description": "Lười biếng, ích kỷ, kiêu ngạo, dối trá, hẹp hòi, nóng nảy.",
    "hskLevel": "HSK 4",
    "wordCount": 28,
    "sampleWords": [
      {
        "id": 297185,
        "hanzi": "偷懒",
        "pinyin": "tōulǎn",
        "meaningVi": "trốn làm biếng",
        "levelCode": "7-9"
      },
      {
        "id": 293084,
        "hanzi": "傲",
        "pinyin": "ào",
        "meaningVi": "tự hào",
        "levelCode": "7-9"
      },
      {
        "id": 318700,
        "hanzi": "小气",
        "pinyin": "xiǎoqi",
        "meaningVi": "keo kiệt",
        "levelCode": "6"
      },
      {
        "id": 295308,
        "hanzi": "居高临下",
        "pinyin": "jū gāo lín xià",
        "meaningVi": "nghĩa đen: ở vị trí cao, nhìn xuống cảnh bên dưới (thành ngữ)",
        "levelCode": "7-9"
      },
      {
        "id": 293782,
        "hanzi": "怠工",
        "pinyin": "dài gōng",
        "meaningVi": "lười biếng trong công việc",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 177,
    "slug": "ngoai-hinh-va-voc-dang-con-nguoi",
    "titleVi": "Ngoại hình & Vóc dáng con người",
    "titleZh": "外貌与体态",
    "icon": "🧑‍🦰",
    "description": "Xinh đẹp, đẹp trai, cao ráo, thấp bé, béo gầy, dễ thương.",
    "hskLevel": "HSK 1",
    "wordCount": 312,
    "sampleWords": [
      {
        "id": 318758,
        "hanzi": "一帆风顺",
        "pinyin": "yìfān-fēngshùn",
        "meaningVi": "thuận buồm xuôi gió (thành ngữ)",
        "levelCode": "6"
      },
      {
        "id": 291495,
        "hanzi": "上级",
        "pinyin": "shàngjí",
        "meaningVi": "cấp trên",
        "levelCode": "5"
      },
      {
        "id": 288014,
        "hanzi": "下",
        "pinyin": "xià",
        "meaningVi": "xuống",
        "levelCode": "1"
      },
      {
        "id": 297507,
        "hanzi": "下游",
        "pinyin": "xiàyóu",
        "meaningVi": "hạ lưu (của sông)",
        "levelCode": "7-9"
      },
      {
        "id": 297492,
        "hanzi": "下级",
        "pinyin": "xià jí",
        "meaningVi": "cấp thấp",
        "levelCode": "7-9"
      }
    ]
  },
  {
    "id": 178,
    "slug": "uoc-mo-va-tuong-lai",
    "titleVi": "Ước mơ & Tương lai",
    "titleZh": "梦想与未来",
    "icon": "🌠🎯",
    "description": "Mục tiêu cuộc sống, hoài bão, phấn đấu, kế hoạch tương lai.",
    "hskLevel": "HSK 3",
    "wordCount": 101,
    "sampleWords": [
      {
        "id": 316508,
        "hanzi": "中期",
        "pinyin": "zhōngqī",
        "meaningVi": "giữa (một khoảng thời gian)",
        "levelCode": "5"
      },
      {
        "id": 289821,
        "hanzi": "主意",
        "pinyin": "zhǔyì",
        "meaningVi": "kế hoạch",
        "levelCode": "3"
      },
      {
        "id": 288417,
        "hanzi": "今后",
        "pinyin": "jīnhòu",
        "meaningVi": "sau này",
        "levelCode": "2"
      },
      {
        "id": 288771,
        "hanzi": "以后",
        "pinyin": "yǐhòu",
        "meaningVi": "sau",
        "levelCode": "2"
      },
      {
        "id": 322916,
        "hanzi": "再接再厉",
        "pinyin": "zàijiē-zàilì",
        "meaningVi": "tiếp tục phấn đấu (thành ngữ)",
        "levelCode": "7-9"
      }
    ]
  }
]
