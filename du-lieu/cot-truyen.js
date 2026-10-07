/* =====================================================================
   cot-truyen.js — Cốt truyện, vùng đất, nhân vật, huy hiệu, cửa hàng.
   Thầy/cô có thể sửa lời thoại, tên gọi ở đây. KHÔNG đổi thứ tự mảng DANG
   (thứ tự này được dùng trong "mã kết quả" gửi cho giáo viên).
   ===================================================================== */
window.COT_TRUYEN = {

  /* Dạng bài — dùng để thống kê điểm mạnh/yếu. Thêm dạng mới vào CUỐI mảng. */
  DANG: [
    { id: 'khai-niem',     ten: 'Khái niệm số hữu tỉ, tập hợp ℚ' },
    { id: 'truc-so',       ten: 'Biểu diễn trên trục số' },
    { id: 'so-sanh',       ten: 'So sánh, sắp xếp số hữu tỉ' },
    { id: 'so-doi',        ten: 'Số đối' },
    { id: 'cong-tru',      ten: 'Cộng, trừ số hữu tỉ' },
    { id: 'nhan-chia',     ten: 'Nhân, chia số hữu tỉ' },
    { id: 'tinh-chat',     ten: 'Tính chất phép tính, tính hợp lí' },
    { id: 'luy-thua',      ten: 'Luỹ thừa với số mũ tự nhiên' },
    { id: 'lt-cung-co-so', ten: 'Tích, thương hai luỹ thừa cùng cơ số' },
    { id: 'lt-cua-lt',     ten: 'Luỹ thừa của luỹ thừa, của tích, của thương' },
    { id: 'thu-tu',        ten: 'Thứ tự thực hiện phép tính' },
    { id: 'dau-ngoac',     ten: 'Quy tắc dấu ngoặc' },
    { id: 'chuyen-ve',     ten: 'Quy tắc chuyển vế, tìm x' },
    { id: 'thuc-te',       ten: 'Toán thực tế' }
  ],

  /* Các loại thử thách mà engine hỗ trợ */
  LOAI: {
    'trac-nghiem': 'Trắc nghiệm',
    'dung-sai':    'Đúng / Sai',
    'dien':        'Điền đáp số',
    'sap-xep':     'Sắp xếp số',
    'truc-so':     'Trục số',
    'ghep':        'Ghép đôi',
    'bat-loi':     'Bắt lỗi sai',
    'thu-tu-buoc': 'Sắp xếp bước giải'
  },

  MUC: { 1: 'Dễ', 2: 'Thường', 3: 'Khó' },

  LOP_NHAN_VAT: {
    'chien-binh': { ten: 'Chiến binh', icon: '⚔️', tim: 7, kiNang: 'Giáp dày: có 7 tim thay vì 5.' },
    'phap-su':    { ten: 'Pháp sư',    icon: '🔮', tim: 5, kiNang: 'Thần chú: 2 lần gợi ý miễn phí mỗi thử thách.' },
    'tham-hiem':  { ten: 'Thám hiểm',  icon: '🧭', tim: 5, kiNang: 'Ống nhòm: mỗi thử thách được loại bỏ 1 đáp án sai.' },
    'tho-ren':    { ten: 'Thợ rèn',    icon: '🔨', tim: 5, kiNang: 'Khiên rèn: lần sai đầu tiên mỗi thử thách không mất tim.' }
  },

  AVATAR: ['🦊', '🐯', '🐼', '🐸', '🦁', '🐨', '🐧', '🦄', '🐲', '🐱', '🐶', '🐵'],

  /* Vật phẩm trong cửa hàng (giá tính bằng vàng) */
  CUA_HANG: [
    { id: 'goiY',    ten: 'Cuộn gợi ý', icon: '📜', gia: 15, moTa: 'Hiện bước đầu của lời giải.' },
    { id: 'nam',     ten: 'Phép 50:50', icon: '✂️', gia: 25, moTa: 'Xoá 2 phương án sai (câu trắc nghiệm 4 phương án).' },
    { id: 'boQua',   ten: 'Giày bỏ qua', icon: '👟', gia: 35, moTa: 'Bỏ qua 1 câu, không mất tim.' },
    { id: 'binhMau', ten: 'Bình máu',   icon: '🧪', gia: 20, moTa: 'Hồi 1 tim trong lúc làm thử thách.' }
  ],

  /* Huy hiệu. "dk" là điều kiện, được kiểm tra trong game.js */
  HUY_HIEU: [
    { id: 'buoc-dau',      icon: '🌱', ten: 'Bước chân đầu tiên', moTa: 'Hoàn thành thử thách đầu tiên.' },
    { id: 'combo-5',       icon: '🔥', ten: 'Combo 5',            moTa: 'Đúng 5 câu liên tiếp.' },
    { id: 'combo-10',      icon: '⚡', ten: 'Combo 10',           moTa: 'Đúng 10 câu liên tiếp.' },
    { id: 'combo-20',      icon: '🌟', ten: 'Combo 20',           moTa: 'Đúng 20 câu liên tiếp.' },
    { id: 'hoan-hao',      icon: '💎', ten: 'Hoàn hảo',           moTa: 'Qua một thử thách mức Thường hoặc Khó mà không sai câu nào.' },
    { id: 'khong-sai-dau', icon: '➖', ten: 'Không sai dấu',      moTa: 'Đúng 10 câu liên tiếp về số đối, nhân chia, dấu ngoặc, chuyển vế.' },
    { id: 'quy-dong',      icon: '🏃', ten: 'Quy đồng thần tốc',  moTa: 'Đúng 10 câu cộng, trừ số hữu tỉ.' },
    { id: 'luy-thua',      icon: '🗼', ten: 'Bậc thầy luỹ thừa',  moTa: 'Đúng 15 câu về luỹ thừa.' },
    { id: 'tho-san-loi',   icon: '🔍', ten: 'Thợ săn lỗi sai',    moTa: 'Bắt đúng 5 lỗi sai trong lời giải.' },
    { id: 'than-toc',      icon: '⏱️', ten: 'Thần tốc',           moTa: 'Đúng từ 10 câu trở lên trong một lượt Đấu trí.' },
    { id: 'diet-boss',     icon: '🗡️', ten: 'Diệt mini-boss',      moTa: 'Đánh bại mini-boss đầu tiên.' },
    { id: 'ba-sao',        icon: '⭐', ten: 'Ba sao toàn vùng',   moTa: 'Đạt 3 sao ở mọi thử thách của một vùng.' },
    { id: 'dung-cam',      icon: '🏔️', ten: 'Dũng cảm',           moTa: 'Hoàn thành 5 thử thách ở mức Khó.' },
    { id: 'khong-bo-cuoc', icon: '🔄', ten: 'Không bỏ cuộc',      moTa: 'Hồi sinh rồi vượt qua chính thử thách đó.' },
    { id: 'cham-on',       icon: '📚', ten: 'Chăm ôn tập',        moTa: 'Giải đúng 10 câu trong Hang Ôn Tập.' },
    { id: 'nha-giau',      icon: '💰', ten: 'Nhà giàu',           moTa: 'Có 300 vàng cùng lúc.' },
    { id: 'cuu-vuong-quoc',icon: '👑', ten: 'Người giải cứu',     moTa: 'Đánh bại Quỷ Sai Dấu, giải phóng Vương quốc Hữu Tỉ.' }
  ],

  MO_DAU: [
    'Vương quốc Hữu Tỉ từng yên bình, nơi mọi phân số sống hoà thuận trên trục số.',
    'Một đêm, **Quỷ Sai Dấu** và **Phù thủy Mẫu Số** kéo đến. Chúng làm dấu trừ biến mất, bắt các phân số cộng mà không quy đồng, rồi phong ấn cả năm vùng đất.',
    'Chỉ một **Hiệp sĩ Toán học** mới phá được phong ấn. Người đó chính là em!'
  ],

  /* -------- Năm vùng đất. Mỗi vùng: 5 thử thách + 1 boss --------
     loai thử thách: 'thu-thach' (bộ câu hỏi), 'dau-tri' (tính nhanh có đồng hồ), 'boss'
     uuTien: các dạng câu ưu tiên chọn vào thử thách đó                                  */
  VUNG: [
    {
      id: 1, ten: 'Làng Tập Hợp ℚ', icon: '🏡', mau: '#58b947', bai: 'Bài 1. Tập hợp các số hữu tỉ',
      npc: { ten: 'Cụ Cú Mèo', icon: '🦉' },
      chao: 'Hú hú! Sói Lạc Số đã xáo trộn hết trục số của làng. Cháu giúp ta sắp xếp lại nhé!',
      thuThach: [
        { ten: 'Cổng làng', loai: 'thu-thach', soCau: 4, uuTien: ['trac-nghiem', 'dung-sai', 'ghep', 'dien'],
          loi: 'Muốn vào làng, hãy chứng minh cháu biết số hữu tỉ là gì!' },
        { ten: 'Giếng Số Đối', loai: 'thu-thach', soCau: 4, uuTien: ['ghep', 'dien', 'trac-nghiem', 'bat-loi'],
          loi: 'Soi xuống giếng, mỗi số đều thấy “số đối” của mình. Lạ chưa?' },
        { ten: 'Đấu trí ở Chợ Phiên', loai: 'dau-tri', thoiGian: 60,
          loi: 'Chợ sắp đóng cửa! Trả lời thật nhanh trong 60 giây.' },
        { ten: 'Cầu Trục Số', loai: 'thu-thach', soCau: 4, uuTien: ['truc-so', 'sap-xep', 'trac-nghiem', 'dung-sai'],
          loi: 'Mỗi tấm ván cầu là một điểm trên trục số. Đặt sai là rơi tõm đấy!' },
        { ten: 'Tháp Canh So Sánh', loai: 'thu-thach', soCau: 5, uuTien: ['sap-xep', 'dung-sai', 'thu-tu-buoc', 'dien', 'bat-loi'],
          loi: 'Lên tháp canh, cháu sẽ thấy số nào lớn, số nào bé.' },
        { ten: 'Hang Sói', loai: 'boss',
          boss: { ten: 'Sói Lạc Số', icon: '🐺', mau: [4, 5, 6],
            mo: 'Gừ… Ta đã giấu hết số âm vào bên phải số 0. Ngươi không tìm được đâu!',
            trung: ['Á! Sao ngươi biết số đối?', 'Đau quá! Trục số đâu phải của ta…', 'Gừ… lại đúng nữa!'],
            danh: ['Ha ha, sai rồi!', 'Trục số rối tung rồi nhé!', 'Ngươi nhầm dấu rồi kìa!'],
            thua: 'Ư ử… ta trả lại trục số. Nhưng Phù thủy Mẫu Số sẽ không tha cho ngươi đâu!' } }
      ]
    },
    {
      id: 2, ten: 'Thành Bốn Phép Tính', icon: '🏰', mau: '#3d8bd9', bai: 'Bài 2. Cộng, trừ, nhân, chia số hữu tỉ',
      npc: { ten: 'Bác Rùa Thợ Rèn', icon: '🐢' },
      chao: 'Chậm mà chắc nhé cháu! Bóng Ma Mẫu Số dạy cả thành cộng tử với tử, mẫu với mẫu. Sai bét!',
      thuThach: [
        { ten: 'Cổng thành', loai: 'thu-thach', soCau: 4, uuTien: ['trac-nghiem', 'dien', 'dung-sai', 'ghep'],
          loi: 'Quy đồng mẫu trước rồi mới cộng. Nhớ chưa?' },
        { ten: 'Lò rèn Nhân Chia', loai: 'thu-thach', soCau: 4, uuTien: ['ghep', 'trac-nghiem', 'dien', 'bat-loi'],
          loi: 'Chia cho một số là nhân với số nghịch đảo. Búa xuống!' },
        { ten: 'Đấu trí ở Quảng trường', loai: 'dau-tri', thoiGian: 60,
          loi: 'Cả thành đang cổ vũ! Tính nhanh nào!' },
        { ten: 'Chợ Thành', loai: 'thu-thach', soCau: 4, uuTien: ['dien', 'thu-tu-buoc', 'trac-nghiem', 'dung-sai'],
          loi: 'Người bán, người mua đều cần tính đúng. Giúp họ nhé!' },
        { ten: 'Thư viện Tính Chất', loai: 'thu-thach', soCau: 5, uuTien: ['bat-loi', 'dien', 'ghep', 'trac-nghiem', 'dung-sai'],
          loi: 'Giao hoán, kết hợp, phân phối… dùng khéo thì tính nhanh như gió.' },
        { ten: 'Tháp Mẫu Số', loai: 'boss',
          boss: { ten: 'Bóng Ma Mẫu Số', icon: '👻', mau: [4, 5, 6],
            mo: 'Hú hù… Một phần hai cộng một phần ba bằng hai phần năm! Đúng không nào?',
            trung: ['Không!!! Ngươi đã quy đồng!', 'Mẫu chung… ta ghét mẫu chung!', 'Ối, số nghịch đảo!'],
            danh: ['Hú hù, cộng mẫu với mẫu đi!', 'Sai rồi, hí hí!', 'Quên nghịch đảo rồi kìa!'],
            thua: 'Hú… ta tan biến đây. Nhưng Rừng Luỹ Thừa đã bị phong ấn rồi!' } }
      ]
    },
    {
      id: 3, ten: 'Rừng Luỹ Thừa', icon: '🌲', mau: '#2f9e77', bai: 'Bài 3. Luỹ thừa với số mũ tự nhiên của một số hữu tỉ',
      npc: { ten: 'Tiên Nấm', icon: '🍄' },
      chao: 'Cây trong rừng mọc theo luỹ thừa: 2, 4, 8, 16… Nhưng Rồng Mũ Chồng làm cây mọc lung tung cả!',
      thuThach: [
        { ten: 'Bìa rừng', loai: 'thu-thach', soCau: 4, uuTien: ['trac-nghiem', 'dung-sai', 'dien', 'ghep'],
          loi: 'Luỹ thừa bậc chẵn của số âm là số dương. Khắc ghi nhé!' },
        { ten: 'Suối Cùng Cơ Số', loai: 'thu-thach', soCau: 4, uuTien: ['ghep', 'trac-nghiem', 'bat-loi', 'dien'],
          loi: 'Nhân thì cộng số mũ, chia thì trừ số mũ. Suối chảy êm thôi!' },
        { ten: 'Đấu trí dưới Cây Cổ Thụ', loai: 'dau-tri', thoiGian: 60,
          loi: 'Lá rơi rồi! Tính trước khi lá chạm đất!' },
        { ten: 'Hang Luỹ Thừa Kép', loai: 'thu-thach', soCau: 4, uuTien: ['thu-tu-buoc', 'sap-xep', 'dien', 'trac-nghiem'],
          loi: 'Luỹ thừa của luỹ thừa: nhân số mũ. Đừng cộng nhầm!' },
        { ten: 'Đồi Vi Khuẩn', loai: 'thu-thach', soCau: 5, uuTien: ['dien', 'bat-loi', 'dung-sai', 'ghep', 'trac-nghiem'],
          loi: 'Mỗi giờ gấp đôi… luỹ thừa có mặt ở khắp nơi!' },
        { ten: 'Tổ Rồng', loai: 'boss',
          boss: { ten: 'Rồng Mũ Chồng', icon: '🐲', mau: [4, 5, 6],
            mo: 'Gào! Trừ ba bình phương bằng chín! Ngươi dám cãi không?',
            trung: ['Grừ! Ngươi cộng đúng số mũ!', 'Sao ngươi biết bậc chẵn ra số dương?', 'Vảy ta rụng mất rồi!'],
            danh: ['Gào! Nhân số mũ đi nào!', 'Sai dấu rồi, hà hà!', 'Ngươi quên số mũ rồi!'],
            thua: 'Grừ… ta chịu thua. Hãy coi chừng Núi Thứ Tự!' } }
      ]
    },
    {
      id: 4, ten: 'Núi Thứ Tự và Chuyển Vế', icon: '⛰️', mau: '#c77d2e', bai: 'Bài 4. Thứ tự thực hiện các phép tính. Quy tắc chuyển vế',
      npc: { ten: 'Đại Bàng Núi', icon: '🦅' },
      chao: 'Leo núi phải đúng thứ tự: ngoặc, luỹ thừa, nhân chia, rồi mới cộng trừ. Khổng Lồ Dấu Ngoặc đang chặn đỉnh!',
      thuThach: [
        { ten: 'Chân núi', loai: 'thu-thach', soCau: 4, uuTien: ['trac-nghiem', 'thu-tu-buoc', 'dien', 'ghep'],
          loi: 'Nhân chia trước, cộng trừ sau. Bước đầu tiên đây!' },
        { ten: 'Dốc Dấu Ngoặc', loai: 'thu-thach', soCau: 4, uuTien: ['dung-sai', 'bat-loi', 'trac-nghiem', 'dien'],
          loi: 'Trước ngoặc có dấu trừ thì đổi dấu tất cả. Trượt chân là ngã đó!' },
        { ten: 'Đấu trí trên Vách Đá', loai: 'dau-tri', thoiGian: 60,
          loi: 'Gió lớn quá! Giải nhanh để bám vào vách đá!' },
        { ten: 'Cầu Chuyển Vế', loai: 'thu-thach', soCau: 4, uuTien: ['dien', 'thu-tu-buoc', 'bat-loi', 'trac-nghiem'],
          loi: 'Qua cầu là đổi dấu. Nhớ chưa nào?' },
        { ten: 'Làng Trên Mây', loai: 'thu-thach', soCau: 5, uuTien: ['dien', 'sap-xep', 'ghep', 'dung-sai', 'trac-nghiem'],
          loi: 'Dân làng cần tính tiền, tính nhiệt độ. Giúp họ với!' },
        { ten: 'Đỉnh núi', loai: 'boss',
          boss: { ten: 'Khổng Lồ Dấu Ngoặc', icon: '🗿', mau: [4, 5, 6],
            mo: 'Ta bỏ ngoặc mà chẳng bao giờ đổi dấu! Ai cản được ta?',
            trung: ['Ối! Ngươi đổi dấu đúng rồi!', 'Chuyển vế… đổi dấu… đau quá!', 'Thứ tự phép tính chuẩn quá!'],
            danh: ['Ha! Quên đổi dấu rồi!', 'Cộng trước nhân sau hả? Sai!', 'Ầm! Sai thứ tự rồi!'],
            thua: 'Rầm… ta sụp đổ rồi. Lâu đài cuối cùng đã hiện ra!' } }
      ]
    },
    {
      id: 5, ten: 'Lâu Đài Phong Ấn', icon: '🏯', mau: '#8a4fd1', bai: 'Ôn tập Chương I. Số hữu tỉ',
      npc: { ten: 'Công chúa Hữu Tỉ', icon: '👸' },
      chao: 'Hiệp sĩ ơi! Phù thủy Mẫu Số và Quỷ Sai Dấu đang ở trong lâu đài. Cần dùng hết mọi kiến thức của chương!',
      thuThach: [
        { ten: 'Cổng lâu đài', loai: 'thu-thach', soCau: 5, uuTien: ['trac-nghiem', 'dien', 'dung-sai', 'ghep', 'sap-xep'],
          loi: 'Cánh cổng chỉ mở khi em trả lời đúng.' },
        { ten: 'Hành lang Gương', loai: 'thu-thach', soCau: 5, uuTien: ['bat-loi', 'truc-so', 'trac-nghiem', 'dien', 'thu-tu-buoc'],
          loi: 'Gương phản chiếu lời giải sai. Tìm ra lỗi nhé!' },
        { ten: 'Đấu trí ở Đại sảnh', loai: 'dau-tri', thoiGian: 60,
          loi: 'Lính canh đang tới! Nhanh tay lên!' },
        { ten: 'Phòng Kho Báu', loai: 'thu-thach', soCau: 5, uuTien: ['dien', 'sap-xep', 'ghep', 'thu-tu-buoc', 'trac-nghiem'],
          loi: 'Kho báu chỉ dành cho người tính chính xác.' },
        { ten: 'Tháp Phù thủy', loai: 'thu-thach', soCau: 5, uuTien: ['dung-sai', 'bat-loi', 'dien', 'trac-nghiem', 'ghep'],
          loi: 'Sắp tới phòng ngai vàng rồi. Cố lên!' },
        { ten: 'Phòng Ngai Vàng', loai: 'boss',
          boss: { ten: 'Phù thủy Mẫu Số', icon: '🧙‍♀️', mau: [4, 5, 6],
            mo: 'Hô hô! Mẫu với mẫu, tử với tử, cộng hết vào nhau! Phép thuật của ta không ai phá được!',
            trung: ['Không thể nào! Ngươi quy đồng rồi!', 'Á á! Phép thuật của ta…', 'Mẫu chung… lại là mẫu chung!'],
            danh: ['Hô hô, sai rồi!', 'Cộng mẫu với mẫu đi cưng!', 'Phép thuật của ta mạnh lắm!'],
            thua: 'Ta… ta thua rồi! Quỷ Sai Dấu ơi, cứu ta!' },
          boss2: { ten: 'Quỷ Sai Dấu', icon: '👹', mau: [4, 5, 6],
            mo: 'Ha ha ha! Âm nhân âm ra âm! Trừ bình phương ra dương! Ngươi sẽ rối dấu mãi mãi!',
            trung: ['Gàooo! Ngươi không sai dấu!', 'Dấu trừ… dấu trừ đâu rồi?', 'Không!!! Âm nhân âm ra dương!'],
            danh: ['Ha ha, sai dấu rồi!', 'Dấu trừ đâu mất rồi kìa!', 'Rối dấu rồi nhé!'],
            thua: 'Khônggg! Phong ấn đã vỡ… Vương quốc Hữu Tỉ được tự do!' } }
      ]
    }
  ],

  KET_THUC: [
    'Phong ấn tan biến. Dấu trừ trở về đúng chỗ, các phân số lại quy đồng trước khi cộng.',
    'Cả vương quốc reo vang tên em: Hiệp sĩ Toán học!'
  ]
};
