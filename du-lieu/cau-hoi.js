/* =====================================================================
   cau-hoi.js — NGÂN HÀNG CÂU HỎI (thầy/cô có thể tự thêm, sửa)

   MỖI CÂU LÀ MỘT KHỐI { ... }, các trường chung:
     id      : mã câu, không trùng nhau. Ví dụ "V1-05" (vùng 1, câu 5)
     vung    : 1..5 (vùng đất)
     loai    : 'trac-nghiem' | 'dung-sai' | 'dien' | 'sap-xep' | 'truc-so' | 'ghep' | 'bat-loi' | 'thu-tu-buoc'
     dang    : dạng bài (xem COT_TRUYEN.DANG trong cot-truyen.js), ví dụ 'cong-tru'
     muc     : 1 = Dễ, 2 = Thường, 3 = Khó
     de      : đề bài
     loiGiai : danh sách các bước giải ngắn gọn
     loiSai  : (không bắt buộc) lỗi sai thường gặp, hiện ra khi học sinh làm sai
     khongXetToiGian : true nếu đề CỐ Ý lấy đáp án là phân số chưa tối giản
     kiemTra : (nên có) biểu thức để máy TÍNH LẠI đáp án. Viết "@de" nghĩa là lấy
               đúng biểu thức {{...}} duy nhất trong đề.

   CÁCH VIẾT CÔNG THỨC: đặt trong {{ }}, ví dụ {{-3/4 + 1/2}}, {{(-2/3)^2}}, {{x - 1/3 = 1/2}}
     dấu nhân viết *, dấu chia viết :, phân số viết /, số thập phân dùng dấu phẩy 0,25.
     Kí hiệu đặc biệt viết bằng LaTeX trong $...$, ví dụ $\\mathbb{Q}$, $\\in$, $\\notin$
     (trong file này dấu \ phải viết thành \\).

   TRƯỜNG RIÊNG CỦA TỪNG LOẠI:
     trac-nghiem : phuongAn: [4 phương án], dapAn: "A" | "B" | "C" | "D"
     dung-sai    : y: [{ nd: "khẳng định", dung: true/false }, ...]
     dien        : dapAn: "-1/2" (máy chấp nhận mọi cách viết bằng nhau: -2/4, -0,5 ...)
                   donVi: "°C" (không bắt buộc); yeuCau: "toi-gian" nếu bắt buộc phân số tối giản
     sap-xep     : so: ["số 1", "số 2", ...], chieu: "tang" | "giam"  (máy tự tính thứ tự đúng)
     truc-so     : diem: "-3/4", tu: "-2", den: "1", buoc: "1/4"
     ghep        : cap: [{ trai: "...", phai: "..." }, ...], quanHe: "bang" | "doi" | "nghich-dao" | "nghiem"
     bat-loi     : dau: "biểu thức ban đầu", buoc: ["bước 1", "bước 2", ...], buocSai: số thứ tự bước sai (1, 2, ...)
     thu-tu-buoc : buoc: [các bước theo ĐÚNG thứ tự] (game sẽ tự xáo trộn)

   Sau khi sửa, mở file kiem-tra.html để máy kiểm tra lại toàn bộ.
   ===================================================================== */
window.CAU_HOI = [

/* ======================= VÙNG 1 — TẬP HỢP CÁC SỐ HỮU TỈ ======================= */
{ id: "V1-01", vung: 1, loai: "trac-nghiem", dang: "khai-niem", muc: 1,
  de: "Tập hợp các số hữu tỉ được kí hiệu là",
  phuongAn: ["$\\mathbb{Q}$", "$\\mathbb{N}$", "$\\mathbb{Z}$", "$\\mathbb{R}$"], dapAn: "A",
  loiGiai: ["Số hữu tỉ là số viết được dưới dạng phân số {{a/b}} với $a, b \\in \\mathbb{Z}$, $b \\ne 0$.", "Tập hợp các số hữu tỉ kí hiệu là $\\mathbb{Q}$."],
  loiSai: "Nhầm $\\mathbb{Z}$ (tập hợp số nguyên) hoặc $\\mathbb{N}$ (số tự nhiên) với $\\mathbb{Q}$." },

{ id: "V1-02", vung: 1, loai: "dung-sai", dang: "khai-niem", muc: 1,
  de: "Mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "$-5 \\in \\mathbb{Q}$", dung: true },
       { nd: "{{1/2}} $\\in \\mathbb{Z}$", dung: false },
       { nd: "$0 \\in \\mathbb{Q}$", dung: true },
       { nd: "{{-2/3}} $\\in \\mathbb{N}$", dung: false } ],
  loiGiai: ["{{-5 = (-5)/1}} nên $-5 \\in \\mathbb{Q}$; {{0 = 0/1}} nên $0 \\in \\mathbb{Q}$.", "{{1/2}} và {{-2/3}} không phải số nguyên, nên càng không phải số tự nhiên."],
  loiSai: "Nghĩ rằng số nguyên không phải là số hữu tỉ. Thực ra mọi số nguyên đều là số hữu tỉ." },

{ id: "V1-03", vung: 1, loai: "trac-nghiem", dang: "so-doi", muc: 1,
  de: "Số đối của {{-3/7}} là",
  phuongAn: ["3/7", "-7/3", "7/3", "-3/7"], dapAn: "A", kiemTra: "-(-3/7)",
  loiGiai: ["Số đối của $a$ là $-a$.", "{{-(-3/7) = 3/7}}"],
  loiSai: "Nhầm số đối với số nghịch đảo ({{-7/3}})." },

{ id: "V1-04", vung: 1, loai: "dien", dang: "so-doi", muc: 1,
  de: "Số đối của {{0,6}} là", dapAn: "-0,6", kiemTra: "-(0,6)",
  loiGiai: ["Số đối của {{0,6}} là {{-0,6}} vì {{0,6 + (-0,6) = 0}}."] },

{ id: "V1-05", vung: 1, loai: "trac-nghiem", dang: "so-sanh", muc: 2,
  de: "So sánh {{-2/3}} và {{-3/4}}.",
  phuongAn: ["{{-2/3 > -3/4}}", "{{-2/3 < -3/4}}", "{{-2/3 = -3/4}}"], dapAn: "A",
  loiGiai: ["Quy đồng mẫu 12: {{-2/3 = -8/12}}, {{-3/4 = -9/12}}.", "Vì $-8 > -9$ nên {{-8/12 > -9/12}}, tức là {{-2/3 > -3/4}}."],
  loiSai: "So sánh như hai số dương: thấy 3 > 2 rồi kết luận ngay. Với số âm, số nào có giá trị tuyệt đối lớn hơn thì nhỏ hơn." },

{ id: "V1-06", vung: 1, loai: "dien", dang: "khai-niem", muc: 2,
  de: "Viết số thập phân {{-0,25}} dưới dạng phân số tối giản.", dapAn: "-1/4", yeuCau: "toi-gian", kiemTra: "-0,25",
  loiGiai: ["{{-0,25 = -25/100}}", "Chia cả tử và mẫu cho 25: {{-25/100 = -1/4}}."],
  loiSai: "Để nguyên {{-25/100}}: phân số này chưa tối giản." },

{ id: "V1-07", vung: 1, loai: "truc-so", dang: "truc-so", muc: 1,
  de: "Kéo hoặc chạm để đặt điểm biểu diễn số {{-1/2}} trên trục số.",
  diem: "-1/2", tu: "-2", den: "2", buoc: "1/2", kiemTra: "-1/2",
  loiGiai: ["Chia mỗi đoạn đơn vị thành 2 phần bằng nhau.", "Số {{-1/2}} nằm bên trái điểm 0, cách 0 đúng một phần."],
  loiSai: "Đặt sang bên phải điểm 0: số âm luôn nằm bên trái điểm 0." },

{ id: "V1-08", vung: 1, loai: "truc-so", dang: "truc-so", muc: 2,
  de: "Đặt điểm biểu diễn số {{-5/4}} trên trục số.",
  diem: "-5/4", tu: "-2", den: "1", buoc: "1/4", kiemTra: "-5/4",
  loiGiai: ["Mỗi đoạn đơn vị chia thành 4 phần, mỗi phần là {{1/4}}.", "{{-5/4 = -1 - 1/4}}: từ $-1$ đi tiếp sang trái 1 phần."] },

{ id: "V1-09", vung: 1, loai: "truc-so", dang: "truc-so", muc: 3,
  de: "Đặt điểm biểu diễn số {{4/3}} trên trục số.",
  diem: "4/3", tu: "-1", den: "2", buoc: "1/3", kiemTra: "4/3",
  loiGiai: ["Mỗi đoạn đơn vị chia thành 3 phần, mỗi phần là {{1/3}}.", "{{4/3 = 1 + 1/3}}: từ 1 đi tiếp sang phải 1 phần."],
  loiSai: "Đếm 4 vạch từ $-1$ thay vì đếm từ 0." },

{ id: "V1-10", vung: 1, loai: "trac-nghiem", dang: "truc-so", muc: 2,
  de: "Trên trục số, điểm biểu diễn số {{-5/2}} nằm giữa hai số nguyên nào?",
  phuongAn: ["$-3$ và $-2$", "$-2$ và $-1$", "$2$ và $3$", "$-5$ và $-4$"], dapAn: "A",
  loiGiai: ["{{-5/2 = -2,5}}", "Mà {{-3 < -2,5 < -2}}."] },

{ id: "V1-11", vung: 1, loai: "sap-xep", dang: "so-sanh", muc: 1,
  de: "Kéo thả để sắp xếp các số theo thứ tự **tăng dần** (nhỏ ở trên, lớn ở dưới).",
  so: ["0,5", "-1/3", "-1", "3/4"], chieu: "tang",
  loiGiai: ["Số âm nhỏ hơn số dương: {{-1 < -1/3 < 0}}.", "{{0,5 = 2/4 < 3/4}}."] },

{ id: "V1-12", vung: 1, loai: "sap-xep", dang: "so-sanh", muc: 2,
  de: "Sắp xếp các số theo thứ tự **giảm dần** (lớn ở trên, nhỏ ở dưới).",
  so: ["-2/3", "-3/4", "1/6", "-1/2"], chieu: "giam",
  loiGiai: ["Quy đồng mẫu 12: {{1/6 = 2/12}}, {{-1/2 = -6/12}}, {{-2/3 = -8/12}}, {{-3/4 = -9/12}}.", "Vậy {{1/6 > -1/2 > -2/3 > -3/4}}."] },

{ id: "V1-13", vung: 1, loai: "sap-xep", dang: "so-sanh", muc: 3,
  de: "Sắp xếp các số theo thứ tự **tăng dần**.",
  so: ["-1,25", "-5/3", "2/7", "0", "-1/8"], chieu: "tang",
  loiGiai: ["{{-1,25 = -5/4}} và {{5/3 > 5/4}} (cùng tử, mẫu nhỏ hơn thì lớn hơn), nên {{-5/3 < -1,25}}.", "Tiếp theo: {{-1,25 < -1/8 < 0 < 2/7}}."] },

{ id: "V1-14", vung: 1, loai: "ghep", dang: "so-doi", muc: 1, quanHe: "doi",
  de: "Ghép mỗi số với **số đối** của nó.",
  cap: [ { trai: "{{3/5}}", phai: "-3/5" }, { trai: "{{-7}}", phai: "7" }, { trai: "{{-2/9}}", phai: "2/9" }, { trai: "{{0,4}}", phai: "-0,4" } ],
  loiGiai: ["Số đối của $a$ là $-a$: đổi dấu số đó.", "Hai số đối nhau có tổng bằng 0, ví dụ {{3/5 + (-3/5) = 0}}."] },

{ id: "V1-15", vung: 1, loai: "ghep", dang: "khai-niem", muc: 2,
  de: "Ghép mỗi số thập phân với phân số tối giản bằng nó.",
  cap: [ { trai: "{{0,75}}", phai: "3/4" }, { trai: "{{-1,5}}", phai: "-3/2" }, { trai: "{{0,2}}", phai: "1/5" }, { trai: "{{-0,125}}", phai: "-1/8" } ],
  loiGiai: ["{{0,75 = 75/100 = 3/4}}; {{-1,5 = -15/10 = -3/2}}.", "{{0,2 = 2/10 = 1/5}}; {{-0,125 = -125/1000 = -1/8}}."] },

{ id: "V1-16", vung: 1, loai: "bat-loi", dang: "khai-niem", muc: 2,
  de: "Bạn Hà viết {{-0,75}} thành phân số tối giản như sau. Bước nào sai?",
  dau: "-0,75", buoc: ["-75/100", "-15/20", "-3/5"], buocSai: 3,
  loiGiai: ["{{-0,75 = -75/100 = -15/20 = -3/4}}"],
  loiSai: "Ở bước 3, tử chia cho 5 nhưng mẫu lại chia cho 4. Phải chia cả tử và mẫu cho cùng một số." },

{ id: "V1-17", vung: 1, loai: "bat-loi", dang: "so-doi", muc: 3,
  de: "Bạn Bình tính số đối của số đối của số đối của {{2/3}}. Bước nào sai?",
  dau: "-(-(-2/3))", buoc: ["-(2/3)", "2/3"], buocSai: 2,
  loiGiai: ["{{-(-2/3) = 2/3}}", "{{-(-(-2/3)) = -(2/3) = -2/3}}"],
  loiSai: "Mỗi lần lấy số đối là đổi dấu một lần. Đổi dấu 3 lần thì kết quả mang dấu trừ." },

{ id: "V1-18", vung: 1, loai: "dien", dang: "so-sanh", muc: 3,
  de: "Tìm số nguyên $x$ thoả mãn {{-7/3 < x < -5/3}}.", dapAn: "-2", kiemTra: "@de",
  loiGiai: ["{{-7/3 = -2 - 1/3}} và {{-5/3 = -1 - 2/3}}.", "Số nguyên duy nhất nằm giữa là $-2$: {{-7/3 < -2 < -5/3}}."] },

{ id: "V1-19", vung: 1, loai: "trac-nghiem", dang: "khai-niem", muc: 2, khongXetToiGian: true,
  de: "Số hữu tỉ nào sau đây là số hữu tỉ âm?",
  phuongAn: ["{{2/-7}}", "{{(-3)/(-5)}}", "{{0/(-3)}}", "{{(-4)/(-9)}}"], dapAn: "A",
  loiGiai: ["Tử và mẫu khác dấu thì số hữu tỉ âm: {{2/(-7) = -2/7 < 0}}.", "Tử và mẫu cùng dấu thì số hữu tỉ dương. Số 0 không âm cũng không dương."],
  loiSai: "Thấy dấu trừ là cho rằng số đó âm. {{(-3)/(-5)}} có hai dấu trừ nên là số dương." },

{ id: "V1-20", vung: 1, loai: "dung-sai", dang: "so-sanh", muc: 2,
  de: "Mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "{{-1/2 < -1/3}}", dung: true },
       { nd: "{{3/4 > 4/5}}", dung: false },
       { nd: "{{-0,6 = -3/5}}", dung: true },
       { nd: "{{-5/6 > -6/7}}", dung: true } ],
  loiGiai: ["{{-1/2 = -3/6 < -2/6 = -1/3}}", "{{3/4 = 15/20 < 16/20 = 4/5}}", "{{-5/6 = -35/42 > -36/42 = -6/7}}"] },

{ id: "V1-21", vung: 1, loai: "trac-nghiem", dang: "so-sanh", muc: 1,
  de: "Số lớn nhất trong các số {{5/6}}; {{7/8}}; {{3/4}}; {{2/3}} là",
  phuongAn: ["7/8", "5/6", "3/4", "2/3"], dapAn: "A",
  loiGiai: ["Quy đồng mẫu 24: {{5/6 = 20/24}}; {{7/8 = 21/24}}; {{3/4 = 18/24}}; {{2/3 = 16/24}}.", "Lớn nhất là {{21/24 = 7/8}}."] },

{ id: "V1-22", vung: 1, loai: "trac-nghiem", dang: "thuc-te", muc: 2,
  de: "Nhiệt độ lúc 6 giờ sáng: Sa Pa {{-1,5}} °C, Mẫu Sơn {{-2,3}} °C, Đà Lạt {{8,2}} °C. Nơi nào lạnh nhất?",
  phuongAn: ["Mẫu Sơn", "Sa Pa", "Đà Lạt"], dapAn: "A",
  loiGiai: ["Nhiệt độ thấp nhất là nơi lạnh nhất.", "{{-2,3 < -1,5 < 8,2}} nên Mẫu Sơn lạnh nhất."],
  loiSai: "Thấy 2,3 > 1,5 rồi cho rằng {{-2,3}} lớn hơn {{-1,5}}." },

{ id: "V1-23", vung: 1, loai: "trac-nghiem", dang: "thuc-te", muc: 1,
  de: "Một điểm thấp hơn mực nước biển 3,5 m. Số hữu tỉ biểu thị độ cao của điểm đó là",
  phuongAn: ["-3,5", "3,5", "-35", "0,35"], dapAn: "A", kiemTra: "-3,5",
  loiGiai: ["Lấy mực nước biển là độ cao 0.", "Thấp hơn mực nước biển thì dùng số âm: {{-3,5}} m."] },

{ id: "V1-24", vung: 1, loai: "ghep", dang: "khai-niem", muc: 3,
  de: "Ghép mỗi phân số với số thập phân bằng nó.",
  cap: [ { trai: "{{-7/4}}", phai: "-1,75" }, { trai: "{{3/8}}", phai: "0,375" }, { trai: "{{-9/20}}", phai: "-0,45" }, { trai: "{{6/25}}", phai: "0,24" } ],
  loiGiai: ["Đưa mẫu về 10, 100, 1000: {{-7/4 = -175/100 = -1,75}}; {{3/8 = 375/1000 = 0,375}}.", "{{-9/20 = -45/100 = -0,45}}; {{6/25 = 24/100 = 0,24}}."] },

{ id: "V1-25", vung: 1, loai: "thu-tu-buoc", dang: "so-sanh", muc: 3,
  de: "Sắp xếp các bước so sánh {{-3/4}} và {{-5/7}} theo đúng thứ tự.",
  buoc: ["Chọn mẫu số chung dương là 28.", "Quy đồng: {{-3/4 = -21/28}} và {{-5/7 = -20/28}}.", "So sánh hai tử số: $-21 < -20$.", "Kết luận: {{-3/4 < -5/7}}."],
  loiGiai: ["Quy đồng về cùng mẫu dương, rồi so sánh tử số."] },

{ id: "V1-26", vung: 1, loai: "dien", dang: "so-doi", muc: 1,
  de: "Tính tổng của {{-5/8}} và số đối của nó.", dapAn: "0", kiemTra: "-5/8 + 5/8",
  loiGiai: ["Số đối của {{-5/8}} là {{5/8}}.", "{{-5/8 + 5/8 = 0}}: tổng hai số đối luôn bằng 0."] },

{ id: "V1-27", vung: 1, loai: "trac-nghiem", dang: "khai-niem", muc: 3, khongXetToiGian: true,
  de: "Phân số nào biểu diễn cùng một số hữu tỉ với {{-2/5}}?",
  phuongAn: ["{{6/(-15)}}", "{{(-4)/(-10)}}", "{{2/(-10)}}", "{{(-5)/2}}"], dapAn: "A", kiemTra: "-2/5",
  loiGiai: ["{{6/(-15) = (-6)/15 = -2/5}} (chia tử và mẫu cho 3)."],
  loiSai: "Chọn {{(-4)/(-10)}}: phân số này bằng {{2/5}} vì tử và mẫu cùng dấu." },

/* ======================= VÙNG 2 — CỘNG, TRỪ, NHÂN, CHIA ======================= */
{ id: "V2-01", vung: 2, loai: "trac-nghiem", dang: "cong-tru", muc: 1,
  de: "Tính {{1/2 + (-1/3)}}",
  phuongAn: ["1/6", "-1/6", "5/6", "0"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Quy đồng mẫu 6: {{1/2 + (-1/3) = 3/6 + (-2/6)}}", "{{3/6 + (-2/6) = 1/6}}"],
  loiSai: "Cộng tử với tử, mẫu với mẫu: {{(1 + (-1))/(2 + 3) = 0}} là SAI. Phải quy đồng mẫu trước." },

{ id: "V2-02", vung: 2, loai: "dien", dang: "cong-tru", muc: 1,
  de: "Tính {{-3/4 - 1/4}}", dapAn: "-1", kiemTra: "@de",
  loiGiai: ["Cùng mẫu thì trừ tử số: {{-3/4 - 1/4 = (-3 - 1)/4 = (-4)/4 = -1}}"] },

{ id: "V2-03", vung: 2, loai: "trac-nghiem", dang: "nhan-chia", muc: 1,
  de: "Tính {{-2/5 * 15/4}}",
  phuongAn: ["-3/2", "3/2", "-6/5", "-8/75"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Nhân tử với tử, mẫu với mẫu: {{-2/5 * 15/4 = -(2 * 15)/(5 * 4) = -30/20 = -3/2}}"],
  loiSai: "Quên dấu: tích của một số âm với một số dương là số âm." },

{ id: "V2-04", vung: 2, loai: "trac-nghiem", dang: "nhan-chia", muc: 2,
  de: "Tính {{-4/9 : 2/3}}",
  phuongAn: ["-2/3", "2/3", "-8/27", "-3/2"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Chia cho {{2/3}} là nhân với số nghịch đảo {{3/2}}.", "{{-4/9 : 2/3 = -4/9 * 3/2 = -12/18 = -2/3}}"],
  loiSai: "Nhân luôn với {{2/3}} (quên lấy số nghịch đảo) nên ra {{-8/27}}." },

{ id: "V2-05", vung: 2, loai: "dien", dang: "cong-tru", muc: 1,
  de: "Tính {{0,5 + (-3/4)}}", dapAn: "-1/4", kiemTra: "@de",
  loiGiai: ["Đổi {{0,5 = 2/4}}.", "{{0,5 + (-3/4) = 2/4 + (-3/4) = -1/4}}"] },

{ id: "V2-06", vung: 2, loai: "dien", dang: "nhan-chia", muc: 2,
  de: "Tìm số nghịch đảo của {{-5/8}}.", dapAn: "-8/5", kiemTra: "1 : (-5/8)",
  loiGiai: ["Số nghịch đảo của {{a/b}} là {{b/a}} (với $a, b \\ne 0$).", "Kiểm tra: {{-5/8 * (-8/5) = 1}}"],
  loiSai: "Nhầm với số đối {{5/8}}, hoặc đổi luôn dấu thành {{8/5}}." },

{ id: "V2-07", vung: 2, loai: "trac-nghiem", dang: "nhan-chia", muc: 1,
  de: "Tính {{(-1,2) * 2,5}}",
  phuongAn: ["-3", "3", "-0,3", "-30"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{1,2 * 2,5 = 3}}", "Tích của một số âm và một số dương là số âm, nên kết quả là $-3$."] },

{ id: "V2-08", vung: 2, loai: "dien", dang: "thuc-te", muc: 1,
  de: "Buổi sáng nhiệt độ là {{-2,5}} °C, đến trưa tăng thêm {{4,5}} °C. Nhiệt độ buổi trưa là bao nhiêu?",
  dapAn: "2", donVi: "°C", kiemTra: "-2,5 + 4,5",
  loiGiai: ["Tăng thêm thì cộng: {{-2,5 + 4,5 = 2}} (°C)."] },

{ id: "V2-09", vung: 2, loai: "dien", dang: "thuc-te", muc: 2,
  de: "Một tàu ngầm đang ở độ cao {{-45,5}} m so với mực nước biển. Tàu nổi lên thêm {{17,8}} m. Độ cao mới của tàu là bao nhiêu?",
  dapAn: "-27,7", donVi: "m", kiemTra: "-45,5 + 17,8",
  loiGiai: ["Nổi lên thì độ cao tăng: {{-45,5 + 17,8 = -27,7}} (m).", "Tàu vẫn ở dưới mực nước biển 27,7 m."] },

{ id: "V2-10", vung: 2, loai: "ghep", dang: "cong-tru", muc: 2,
  de: "Ghép mỗi phép tính với kết quả của nó.",
  cap: [ { trai: "{{1/3 + 1/6}}", phai: "1/2" }, { trai: "{{2/3 - 1}}", phai: "-1/3" }, { trai: "{{-3/4 * 2/3}}", phai: "-1/2" }, { trai: "{{1/2 : (-1/4)}}", phai: "-2" } ],
  loiGiai: ["{{1/3 + 1/6 = 2/6 + 1/6 = 1/2}}; {{2/3 - 1 = 2/3 - 3/3 = -1/3}}", "{{-3/4 * 2/3 = -6/12 = -1/2}}; {{1/2 : (-1/4) = 1/2 * (-4) = -2}}"] },

{ id: "V2-11", vung: 2, loai: "dung-sai", dang: "cong-tru", muc: 2,
  de: "Mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "{{1/2 + 1/3 = 2/5}}", dung: false },
       { nd: "{{-2/3 * 3/2 = -1}}", dung: true },
       { nd: "{{3/4 : 3 = 1/4}}", dung: true },
       { nd: "{{-1/2 - 1/2 = 0}}", dung: false } ],
  loiGiai: ["{{1/2 + 1/3 = 3/6 + 2/6 = 5/6}}", "{{-2/3 * 3/2 = -6/6 = -1}}; {{3/4 : 3 = 3/4 * 1/3 = 1/4}}", "{{-1/2 - 1/2 = -1}}"],
  loiSai: "Cộng tử với tử, mẫu với mẫu mà không quy đồng." },

{ id: "V2-12", vung: 2, loai: "bat-loi", dang: "cong-tru", muc: 2,
  de: "Bạn Minh tính {{1/2 + 1/3}} như sau. Bước nào sai?",
  dau: "1/2 + 1/3", buoc: ["(1 + 1)/(2 + 3)", "2/5"], buocSai: 1,
  loiGiai: ["Phải quy đồng mẫu: {{1/2 + 1/3 = 3/6 + 2/6 = 5/6}}"],
  loiSai: "Cộng tử với tử, mẫu với mẫu mà không quy đồng. Đây là “phép thuật” của Phù thủy Mẫu Số!" },

{ id: "V2-13", vung: 2, loai: "bat-loi", dang: "nhan-chia", muc: 3,
  de: "Bạn Lan tính {{-3/4 : 3/8}} như sau. Bước nào sai?",
  dau: "-3/4 : 3/8", buoc: ["-3/4 * 3/8", "-9/32"], buocSai: 1,
  loiGiai: ["{{-3/4 : 3/8 = -3/4 * 8/3 = -24/12 = -2}}"],
  loiSai: "Đổi phép chia thành phép nhân nhưng quên lấy số nghịch đảo của số chia." },

{ id: "V2-14", vung: 2, loai: "thu-tu-buoc", dang: "cong-tru", muc: 2,
  de: "Sắp xếp các bước tính {{2/3 + (-1/4)}} theo đúng thứ tự.",
  buoc: ["Mẫu số chung của 3 và 4 là 12.", "Quy đồng: {{2/3 = 8/12}} và {{-1/4 = -3/12}}.", "Cộng tử số: {{8/12 + (-3/12) = 5/12}}.", "Vậy {{2/3 + (-1/4) = 5/12}}."],
  loiGiai: ["Tìm mẫu chung → quy đồng → cộng tử, giữ nguyên mẫu → kết luận."] },

{ id: "V2-15", vung: 2, loai: "trac-nghiem", dang: "tinh-chat", muc: 2,
  de: "Tính hợp lí {{-5/7 * 3/11 + (-5/7) * 8/11}}",
  phuongAn: ["-5/7", "5/7", "-10/7", "-1"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Đặt thừa số chung {{-5/7}} ra ngoài (tính chất phân phối).", "{{-5/7 * (3/11 + 8/11) = -5/7 * 1 = -5/7}}"] },

{ id: "V2-16", vung: 2, loai: "dien", dang: "tinh-chat", muc: 3,
  de: "Tính hợp lí {{2/5 + (-3/7) + 3/5 + (-4/7)}}", dapAn: "0", kiemTra: "@de",
  loiGiai: ["Nhóm các số cùng mẫu (tính chất giao hoán, kết hợp).", "{{(2/5 + 3/5) + [(-3/7) + (-4/7)] = 1 + (-1) = 0}}"] },

{ id: "V2-17", vung: 2, loai: "trac-nghiem", dang: "nhan-chia", muc: 3,
  de: "Tính {{(-0,75) : (-3/2)}}",
  phuongAn: ["1/2", "-1/2", "9/8", "2"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{(-0,75) : (-3/2) = (-3/4) * (-2/3) = 6/12 = 1/2}}", "Thương của hai số âm là số dương."],
  loiSai: "Nhân {{0,75 * 3/2 = 9/8}} thay vì chia." },

{ id: "V2-18", vung: 2, loai: "dien", dang: "thuc-te", muc: 3,
  de: "Cửa hàng có 30 kg gạo. Ngày đầu bán {{1/3}} số gạo, ngày thứ hai bán {{2/5}} số gạo. Cửa hàng còn lại bao nhiêu ki-lô-gam gạo?",
  dapAn: "8", donVi: "kg", kiemTra: "30 - 30 * 1/3 - 30 * 2/5",
  loiGiai: ["Ngày đầu bán: {{30 * 1/3 = 10}} (kg).", "Ngày thứ hai bán: {{30 * 2/5 = 12}} (kg).", "Còn lại: {{30 - 10 - 12 = 8}} (kg)."] },

{ id: "V2-19", vung: 2, loai: "trac-nghiem", dang: "thuc-te", muc: 2,
  de: "Nam ăn {{1/4}} cái bánh, Lan ăn {{1/3}} cái bánh. Cả hai bạn ăn bao nhiêu phần cái bánh?",
  phuongAn: ["7/12", "2/7", "1/12", "1/7"], dapAn: "A", kiemTra: "1/4 + 1/3",
  loiGiai: ["{{1/4 + 1/3 = 3/12 + 4/12 = 7/12}}"],
  loiSai: "Cộng tử với tử, mẫu với mẫu được {{2/7}}." },

{ id: "V2-20", vung: 2, loai: "dien", dang: "cong-tru", muc: 2,
  de: "Tính {{-5/6 - (-1/4)}}", dapAn: "-7/12", kiemTra: "@de",
  loiGiai: ["Trừ một số là cộng với số đối của nó.", "{{-5/6 - (-1/4) = -5/6 + 1/4 = -10/12 + 3/12 = -7/12}}"],
  loiSai: "Quên đổi dấu: {{-5/6 - 1/4}} là sai." },

{ id: "V2-21", vung: 2, loai: "dung-sai", dang: "nhan-chia", muc: 3,
  de: "Mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "Tích của hai số hữu tỉ âm là một số hữu tỉ dương.", dung: true },
       { nd: "{{-3/5 : (-3/5) = -1}}", dung: false },
       { nd: "Số 0 không có số nghịch đảo.", dung: true },
       { nd: "{{-7/9 * 0 = -7/9}}", dung: false } ],
  loiGiai: ["Âm nhân âm ra dương.", "{{-3/5 : (-3/5) = 1}}; mọi số nhân với 0 đều bằng 0."] },

{ id: "V2-22", vung: 2, loai: "trac-nghiem", dang: "nhan-chia", muc: 1,
  de: "Kết quả của {{3/4 * (-8/9)}} là",
  phuongAn: ["-2/3", "2/3", "-3/2", "-8/3"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{3/4 * (-8/9) = -24/36 = -2/3}}"] },

{ id: "V2-23", vung: 2, loai: "thu-tu-buoc", dang: "thuc-te", muc: 3,
  de: "Bể có {{3/4}} bể nước. Người ta dùng {{1/3}} lượng nước đó. Sắp xếp các bước tính lượng nước còn lại.",
  buoc: ["Lượng nước đã dùng: {{3/4 * 1/3 = 1/4}} (bể).", "Lượng nước còn lại: {{3/4 - 1/4 = 1/2}} (bể).", "Trả lời: bể còn {{1/2}} bể nước."],
  loiGiai: ["Tìm phân số của một số bằng phép nhân, rồi lấy lượng ban đầu trừ đi."] },

{ id: "V2-24", vung: 2, loai: "trac-nghiem", dang: "cong-tru", muc: 2,
  de: "Tổng {{-1/6 + 2/9}} bằng",
  phuongAn: ["1/18", "1/15", "-1/18", "1/3"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Mẫu chung của 6 và 9 là 18.", "{{-1/6 + 2/9 = -3/18 + 4/18 = 1/18}}"],
  loiSai: "Cộng tử với tử, mẫu với mẫu được {{1/15}}." },

{ id: "V2-25", vung: 2, loai: "ghep", dang: "nhan-chia", muc: 3, quanHe: "nghich-dao",
  de: "Ghép mỗi số với **số nghịch đảo** của nó.",
  cap: [ { trai: "{{-4/7}}", phai: "-7/4" }, { trai: "{{5}}", phai: "1/5" }, { trai: "{{-0,2}}", phai: "-5" }, { trai: "{{3/10}}", phai: "10/3" } ],
  loiGiai: ["Hai số nghịch đảo có tích bằng 1, ví dụ {{-0,2 * (-5) = 1}}.", "Số nghịch đảo giữ nguyên dấu của số ban đầu."],
  loiSai: "Nhầm số nghịch đảo với số đối." },

{ id: "V2-26", vung: 2, loai: "dien", dang: "nhan-chia", muc: 3,
  de: "Tính {{(-2/3 + 1/2) : 5/6}}", dapAn: "-1/5", kiemTra: "@de",
  loiGiai: ["Trong ngoặc: {{-2/3 + 1/2 = -4/6 + 3/6 = -1/6}}", "{{-1/6 : 5/6 = -1/6 * 6/5 = -1/5}}"] },

/* ======================= VÙNG 3 — LUỸ THỪA ======================= */
{ id: "V3-01", vung: 3, loai: "trac-nghiem", dang: "luy-thua", muc: 1,
  de: "{{(-2/3)^2}} bằng",
  phuongAn: ["4/9", "-4/9", "-4/6", "4/6"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{(-2/3)^2 = (-2/3) * (-2/3) = 4/9}}", "Luỹ thừa bậc chẵn của số âm là số dương."],
  loiSai: "Lấy cơ số nhân với số mũ ({{-2/3 * 2}}), hoặc quên rằng âm nhân âm ra dương." },

{ id: "V3-02", vung: 3, loai: "trac-nghiem", dang: "luy-thua", muc: 1,
  de: "{{(-1/2)^3}} bằng",
  phuongAn: ["-1/8", "1/8", "-3/2", "-1/6"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{(-1/2)^3 = (-1)^3/2^3 = -1/8}}", "Luỹ thừa bậc lẻ của số âm là số âm."] },

{ id: "V3-03", vung: 3, loai: "trac-nghiem", dang: "lt-cung-co-so", muc: 1,
  de: "Với $x \\ne 0$, {{x^5 * x^3}} bằng",
  phuongAn: ["{{x^8}}", "{{x^15}}", "{{x^2}}", "{{2x^8}}"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Nhân hai luỹ thừa cùng cơ số: giữ nguyên cơ số, **cộng** các số mũ.", "{{x^5 * x^3 = x^(5 + 3) = x^8}}"],
  loiSai: "Nhân hai số mũ được {{x^15}}." },

{ id: "V3-04", vung: 3, loai: "trac-nghiem", dang: "lt-cung-co-so", muc: 2,
  de: "Tính {{(0,5)^6 : (0,5)^4}}",
  phuongAn: ["0,25", "(0,5)^10", "1", "0,1"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Chia hai luỹ thừa cùng cơ số: giữ nguyên cơ số, **trừ** các số mũ.", "{{(0,5)^6 : (0,5)^4 = (0,5)^2 = 0,25}}"] },

{ id: "V3-05", vung: 3, loai: "trac-nghiem", dang: "lt-cua-lt", muc: 2,
  de: "{{[(2/5)^2]^3}} bằng",
  phuongAn: ["(2/5)^6", "(2/5)^5", "(2/5)^8", "(4/25)^6"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Luỹ thừa của luỹ thừa: giữ cơ số, **nhân** các số mũ.", "{{[(2/5)^2]^3 = (2/5)^(2 * 3) = (2/5)^6}}"],
  loiSai: "Cộng số mũ được {{(2/5)^5}}." },

{ id: "V3-06", vung: 3, loai: "dung-sai", dang: "luy-thua", muc: 1,
  de: "Mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "{{(-3)^2 = 9}}", dung: true },
       { nd: "{{-3^2 = 9}}", dung: false },
       { nd: "{{(1/2)^0 = 1}}", dung: true },
       { nd: "{{(-1)^5 = 1}}", dung: false } ],
  loiGiai: ["{{-3^2 = -(3^2) = -9}}: dấu trừ nằm ngoài luỹ thừa.", "Mọi số khác 0 mũ 0 đều bằng 1; luỹ thừa bậc lẻ của số âm là số âm: {{(-1)^5 = -1}}."],
  loiSai: "Nhầm {{-3^2}} với {{(-3)^2}}." },

{ id: "V3-07", vung: 3, loai: "dien", dang: "luy-thua", muc: 1,
  de: "Tính {{(-0,2)^2}}", dapAn: "0,04", kiemTra: "@de",
  loiGiai: ["{{(-0,2)^2 = (-0,2) * (-0,2) = 0,04}}"],
  loiSai: "Viết {{0,4}}: chỉ nhân 2 với 2 mà quên đếm chữ số thập phân." },

{ id: "V3-08", vung: 3, loai: "dien", dang: "luy-thua", muc: 2,
  de: "Tính {{(-1/2)^4}}", dapAn: "1/16", kiemTra: "@de",
  loiGiai: ["{{(-1/2)^4 = (-1)^4/2^4 = 1/16}}"] },

{ id: "V3-09", vung: 3, loai: "trac-nghiem", dang: "luy-thua", muc: 3,
  de: "Tìm $x$, biết {{x^2 = 9/25}}.",
  phuongAn: ["{{x = 3/5}} hoặc {{x = -3/5}}", "{{x = 3/5}}", "{{x = 9/5}}", "{{x = 3/25}}"], dapAn: "A",
  loiGiai: ["{{(3/5)^2 = 9/25}} và {{(-3/5)^2 = 9/25}}.", "Vậy có hai giá trị: {{x = 3/5}} hoặc {{x = -3/5}}."],
  loiSai: "Quên giá trị âm. Hai số đối nhau có cùng bình phương." },

{ id: "V3-10", vung: 3, loai: "dien", dang: "lt-cua-lt", muc: 2,
  de: "Tính {{2^3 * (1/2)^3}}", dapAn: "1", kiemTra: "@de",
  loiGiai: ["Luỹ thừa của một tích: {{a^n * b^n = (a * b)^n}}.", "{{2^3 * (1/2)^3 = (2 * 1/2)^3 = 1^3 = 1}}"] },

{ id: "V3-11", vung: 3, loai: "ghep", dang: "luy-thua", muc: 2,
  de: "Ghép mỗi luỹ thừa với giá trị của nó.",
  cap: [ { trai: "{{(-2)^3}}", phai: "-8" }, { trai: "{{(-2)^4}}", phai: "16" }, { trai: "{{(2/3)^2}}", phai: "4/9" }, { trai: "{{(-1/3)^3}}", phai: "-1/27" } ],
  loiGiai: ["{{(-2)^3 = -8}}; {{(-2)^4 = 16}} (bậc lẻ ra âm, bậc chẵn ra dương).", "{{(2/3)^2 = 4/9}}; {{(-1/3)^3 = -1/27}}"] },

{ id: "V3-12", vung: 3, loai: "ghep", dang: "lt-cung-co-so", muc: 3,
  de: "Ghép mỗi biểu thức với kết quả viết dưới dạng một luỹ thừa.",
  cap: [ { trai: "{{(1/3)^4 * (1/3)^5}}", phai: "(1/3)^9" }, { trai: "{{(1/3)^8 : (1/3)^2}}", phai: "(1/3)^6" }, { trai: "{{[(1/3)^2]^4}}", phai: "(1/3)^8" }, { trai: "{{(1/3)^3 * 3^0}}", phai: "(1/3)^3" } ],
  loiGiai: ["Nhân: cộng số mũ ({{4 + 5 = 9}}); chia: trừ số mũ ({{8 - 2 = 6}}).", "Luỹ thừa của luỹ thừa: nhân số mũ ({{2 * 4 = 8}}); {{3^0 = 1}}."] },

{ id: "V3-13", vung: 3, loai: "bat-loi", dang: "luy-thua", muc: 2,
  de: "Bạn Tú tính {{-3^2 + 4}} như sau. Bước nào sai?",
  dau: "-3^2 + 4", buoc: ["9 + 4", "13"], buocSai: 1,
  loiGiai: ["{{-3^2 + 4 = -9 + 4 = -5}}"],
  loiSai: "Nhầm {{-3^2}} với {{(-3)^2}}. Đúng là {{-3^2 = -9}}, còn {{(-3)^2 = 9}}." },

{ id: "V3-14", vung: 3, loai: "bat-loi", dang: "lt-cung-co-so", muc: 3,
  de: "Bạn Hoa tính {{(-1/2)^3 * (-1/2)^2}} như sau. Bước nào sai?",
  dau: "(-1/2)^3 * (-1/2)^2", buoc: ["(-1/2)^6", "1/64"], buocSai: 1,
  loiGiai: ["{{(-1/2)^3 * (-1/2)^2 = (-1/2)^5 = -1/32}}"],
  loiSai: "Nhân hai luỹ thừa cùng cơ số phải CỘNG số mũ ({{3 + 2 = 5}}), không được nhân." },

{ id: "V3-15", vung: 3, loai: "sap-xep", dang: "luy-thua", muc: 2,
  de: "Sắp xếp các số theo thứ tự **tăng dần**.",
  so: ["(-1/2)^2", "(-1/2)^3", "(1/2)^0", "-(1/2)^2"], chieu: "tang",
  loiGiai: ["{{(-1/2)^2 = 1/4}}; {{(-1/2)^3 = -1/8}}; {{(1/2)^0 = 1}}; {{-(1/2)^2 = -1/4}}.", "Vậy {{-1/4 < -1/8 < 1/4 < 1}}."] },

{ id: "V3-16", vung: 3, loai: "thu-tu-buoc", dang: "lt-cua-lt", muc: 3,
  de: "Sắp xếp các bước viết {{4^5 * 2^3}} dưới dạng một luỹ thừa cơ số 2.",
  buoc: ["Viết {{4 = 2^2}}.", "{{4^5 = (2^2)^5 = 2^10}}", "{{4^5 * 2^3 = 2^10 * 2^3}}", "{{2^10 * 2^3 = 2^13}}"],
  loiGiai: ["Đưa về cùng cơ số 2, dùng luỹ thừa của luỹ thừa rồi nhân hai luỹ thừa cùng cơ số."] },

{ id: "V3-17", vung: 3, loai: "trac-nghiem", dang: "lt-cung-co-so", muc: 2,
  de: "Tính {{(-3/5)^7 : (-3/5)^5}}",
  phuongAn: ["9/25", "-9/25", "-6/10", "(-3/5)^12"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{(-3/5)^7 : (-3/5)^5 = (-3/5)^2 = 9/25}}"],
  loiSai: "Quên rằng bình phương của số âm là số dương." },

{ id: "V3-18", vung: 3, loai: "trac-nghiem", dang: "lt-cua-lt", muc: 3,
  de: "Tính {{(1/4)^5 * 4^5}}",
  phuongAn: ["1", "(1/4)^10", "4", "5"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{(1/4)^5 * 4^5 = (1/4 * 4)^5 = 1^5 = 1}}"] },

{ id: "V3-19", vung: 3, loai: "dien", dang: "lt-cua-lt", muc: 3,
  de: "Tính {{(-2/3)^3 : (1/3)^3}}", dapAn: "-8", kiemTra: "@de",
  loiGiai: ["Luỹ thừa của một thương: {{a^n : b^n = (a : b)^n}}.", "{{(-2/3)^3 : (1/3)^3 = (-2/3 : 1/3)^3 = (-2)^3 = -8}}"] },

{ id: "V3-20", vung: 3, loai: "dien", dang: "lt-cung-co-so", muc: 3,
  de: "Tìm số tự nhiên $n$, biết {{(1/2)^n = 1/32}}.", dapAn: "5", kiemTra: "@de",
  loiGiai: ["{{1/32 = 1/2^5 = (1/2)^5}}", "Vậy $n = 5$."] },

{ id: "V3-21", vung: 3, loai: "dung-sai", dang: "lt-cung-co-so", muc: 2,
  de: "Với $x \\ne 0$, mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "{{x^3 * x^4 = x^7}}", dung: true },
       { nd: "{{x^6 : x^2 = x^3}}", dung: false },
       { nd: "{{(x^2)^3 = x^5}}", dung: false },
       { nd: "{{(2x)^3 = 8x^3}}", dung: true } ],
  loiGiai: ["{{x^6 : x^2 = x^(6 - 2) = x^4}}: chia thì trừ số mũ, không chia số mũ.", "{{(x^2)^3 = x^(2 * 3) = x^6}}; {{(2x)^3 = 2^3 * x^3 = 8x^3}}."] },

{ id: "V3-22", vung: 3, loai: "trac-nghiem", dang: "thuc-te", muc: 2,
  de: "Một tấm bìa hình vuông có cạnh {{3/4}} dm. Diện tích tấm bìa là",
  phuongAn: ["{{9/16}} dm²", "{{3/2}} dm²", "{{9/4}} dm²", "{{3/16}} dm²"], dapAn: "A", kiemTra: "(3/4)^2",
  loiGiai: ["Diện tích hình vuông bằng cạnh nhân cạnh.", "{{(3/4)^2 = 9/16}} (dm²)."],
  loiSai: "Lấy cạnh nhân 2 ({{3/4 * 2 = 3/2}}) là đang tính sai công thức." },

{ id: "V3-23", vung: 3, loai: "dien", dang: "thuc-te", muc: 3,
  de: "Một loại vi khuẩn cứ sau mỗi giờ lại tăng gấp đôi. Ban đầu có 5 con. Sau 4 giờ có bao nhiêu con?",
  dapAn: "80", donVi: "con", kiemTra: "5 * 2^4",
  loiGiai: ["Sau mỗi giờ số vi khuẩn nhân thêm 2.", "Sau 4 giờ: {{5 * 2^4 = 5 * 16 = 80}} (con)."],
  loiSai: "Tính {{5 * 2 * 4 = 40}}: nhân với 4 thay vì nhân với {{2^4}}." },

{ id: "V3-24", vung: 3, loai: "trac-nghiem", dang: "luy-thua", muc: 1,
  de: "Với mọi số hữu tỉ $x \\ne 0$, {{x^0}} bằng",
  phuongAn: ["1", "0", "{{x}}", "Không xác định"], dapAn: "A",
  loiGiai: ["Quy ước: {{x^0 = 1}} với mọi $x \\ne 0$."] },

{ id: "V3-25", vung: 3, loai: "dien", dang: "luy-thua", muc: 2,
  de: "Tính {{(-3/2)^3}}", dapAn: "-27/8", kiemTra: "@de",
  loiGiai: ["{{(-3/2)^3 = (-3)^3/2^3 = -27/8}}"] },

{ id: "V3-26", vung: 3, loai: "trac-nghiem", dang: "lt-cua-lt", muc: 3,
  de: "Tính {{(3/4)^4 : (3/2)^4}}",
  phuongAn: ["1/16", "1/2", "(9/8)^4", "-1/16"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{(3/4)^4 : (3/2)^4 = (3/4 : 3/2)^4 = (1/2)^4 = 1/16}}"] },

/* ======================= VÙNG 4 — THỨ TỰ PHÉP TÍNH, CHUYỂN VẾ ======================= */
{ id: "V4-01", vung: 4, loai: "trac-nghiem", dang: "chuyen-ve", muc: 1,
  de: "Khi chuyển một số hạng từ vế này sang vế kia của một đẳng thức, ta phải",
  phuongAn: ["Đổi dấu số hạng đó", "Giữ nguyên dấu số hạng đó", "Nghịch đảo số hạng đó", "Bỏ số hạng đó đi"], dapAn: "A",
  loiGiai: ["Quy tắc chuyển vế: dấu “+” đổi thành dấu “−”, dấu “−” đổi thành dấu “+”."] },

{ id: "V4-02", vung: 4, loai: "dien", dang: "chuyen-ve", muc: 1,
  de: "Tìm $x$, biết {{x - 2/3 = 1/6}}.", dapAn: "5/6", kiemTra: "@de",
  loiGiai: ["Chuyển {{-2/3}} sang vế phải thành {{+2/3}}: {{x = 1/6 + 2/3}}", "{{x = 1/6 + 4/6 = 5/6}}"],
  loiSai: "Chuyển vế mà không đổi dấu: {{x = 1/6 - 2/3}}." },

{ id: "V4-03", vung: 4, loai: "dien", dang: "chuyen-ve", muc: 1,
  de: "Tìm $x$, biết {{3/4 - x = 1/2}}.", dapAn: "1/4", kiemTra: "@de",
  loiGiai: ["{{x = 3/4 - 1/2}}", "{{x = 3/4 - 2/4 = 1/4}}"] },

{ id: "V4-04", vung: 4, loai: "trac-nghiem", dang: "thu-tu", muc: 1,
  de: "Tính {{1/2 + 1/2 * 4}}",
  phuongAn: ["5/2", "4", "3/2", "2"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Nhân trước, cộng sau.", "{{1/2 + 1/2 * 4 = 1/2 + 2 = 5/2}}"],
  loiSai: "Cộng trước rồi mới nhân: {{(1/2 + 1/2) * 4 = 4}} là sai thứ tự." },

{ id: "V4-05", vung: 4, loai: "dien", dang: "thu-tu", muc: 2,
  de: "Tính {{(-2)^2 - 3 * 1/3}}", dapAn: "3", kiemTra: "@de",
  loiGiai: ["Luỹ thừa trước: {{(-2)^2 = 4}}. Nhân sau: {{3 * 1/3 = 1}}.", "{{4 - 1 = 3}}"] },

{ id: "V4-06", vung: 4, loai: "thu-tu-buoc", dang: "thu-tu", muc: 1,
  de: "Với biểu thức không có dấu ngoặc, sắp xếp thứ tự thực hiện các phép tính.",
  buoc: ["Luỹ thừa", "Nhân và chia", "Cộng và trừ"],
  loiGiai: ["Luỹ thừa → nhân và chia → cộng và trừ.", "Nếu có ngoặc: làm trong ngoặc tròn ( ), rồi ngoặc vuông [ ], rồi ngoặc nhọn { }."] },

{ id: "V4-07", vung: 4, loai: "dien", dang: "chuyen-ve", muc: 2,
  de: "Tìm $x$, biết {{2x + 1/2 = 3/2}}.", dapAn: "1/2", kiemTra: "@de",
  loiGiai: ["{{2x = 3/2 - 1/2}}", "{{2x = 1}}", "{{x = 1 : 2 = 1/2}}"] },

{ id: "V4-08", vung: 4, loai: "trac-nghiem", dang: "thu-tu", muc: 2,
  de: "Tính {{-5/6 + 5/6 : 5}}",
  phuongAn: ["-2/3", "0", "1/6", "-1/6"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Chia trước: {{5/6 : 5 = 1/6}}.", "{{-5/6 + 1/6 = -4/6 = -2/3}}"],
  loiSai: "Cộng trước: {{(-5/6 + 5/6) : 5 = 0}} là sai thứ tự." },

{ id: "V4-09", vung: 4, loai: "trac-nghiem", dang: "dau-ngoac", muc: 1,
  de: "Bỏ dấu ngoặc: {{-(a - b + c)}} bằng",
  phuongAn: ["{{-a + b - c}}", "{{-a - b + c}}", "{{a - b + c}}", "{{-a + b + c}}"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Trước ngoặc có dấu “−” thì đổi dấu **tất cả** các số hạng trong ngoặc."],
  loiSai: "Chỉ đổi dấu số hạng đầu tiên." },

{ id: "V4-10", vung: 4, loai: "trac-nghiem", dang: "thu-tu", muc: 2,
  de: "Tính {{(1/2 - 1/3) * 6}}",
  phuongAn: ["1", "-3/2", "6", "1/6"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Trong ngoặc trước: {{1/2 - 1/3 = 1/6}}.", "{{1/6 * 6 = 1}}"],
  loiSai: "Bỏ qua ngoặc, nhân trước: {{1/2 - 1/3 * 6 = -3/2}}." },

{ id: "V4-11", vung: 4, loai: "bat-loi", dang: "dau-ngoac", muc: 1,
  de: "Bạn Nam tính {{5 - (2/3 - 1/3)}} như sau. Bước nào sai?",
  dau: "5 - (2/3 - 1/3)", buoc: ["5 - 2/3 - 1/3", "13/3 - 1/3", "4"], buocSai: 1,
  loiGiai: ["{{5 - (2/3 - 1/3) = 5 - 2/3 + 1/3 = 14/3}}"],
  loiSai: "Bỏ ngoặc có dấu “−” đằng trước mà quên đổi dấu {{-1/3}} thành {{+1/3}}." },

{ id: "V4-12", vung: 4, loai: "bat-loi", dang: "chuyen-ve", muc: 1,
  de: "Bạn Mai tìm $x$ biết {{x + 2/5 = 1}} như sau. Bước nào sai?",
  dau: "x + 2/5 = 1", buoc: ["x = 1 + 2/5", "x = 7/5"], buocSai: 1,
  loiGiai: ["{{x = 1 - 2/5}}", "{{x = 3/5}}"],
  loiSai: "Chuyển {{2/5}} sang vế phải mà không đổi dấu." },

{ id: "V4-13", vung: 4, loai: "bat-loi", dang: "thu-tu", muc: 2,
  de: "Bạn Khoa tính {{2 + 3 * (-1/3)}} như sau. Bước nào sai?",
  dau: "2 + 3 * (-1/3)", buoc: ["5 * (-1/3)", "-5/3"], buocSai: 1,
  loiGiai: ["Nhân trước: {{3 * (-1/3) = -1}}.", "{{2 + (-1) = 1}}"],
  loiSai: "Cộng trước rồi mới nhân." },

{ id: "V4-14", vung: 4, loai: "bat-loi", dang: "dau-ngoac", muc: 3,
  de: "Bạn Linh tìm $x$ biết {{3/4 - (x - 1/2) = 1/4}} như sau. Bước nào sai?",
  dau: "3/4 - (x - 1/2) = 1/4", buoc: ["3/4 - x - 1/2 = 1/4", "1/4 - x = 1/4", "x = 0"], buocSai: 1,
  loiGiai: ["{{3/4 - x + 1/2 = 1/4}}", "{{5/4 - x = 1/4}}", "{{x = 5/4 - 1/4 = 1}}"],
  loiSai: "Bỏ ngoặc có dấu “−” đằng trước mà quên đổi {{-1/2}} thành {{+1/2}}." },

{ id: "V4-15", vung: 4, loai: "dung-sai", dang: "dau-ngoac", muc: 2,
  de: "Mỗi đẳng thức sau đúng hay sai?",
  y: [ { nd: "{{-(2/3 - 1/2) = -2/3 + 1/2}}", dung: true },
       { nd: "{{1 - (1/4 + 1/2) = 1 - 1/4 + 1/2}}", dung: false },
       { nd: "{{3/5 - (-2/5 + 1) = 3/5 + 2/5 - 1}}", dung: true },
       { nd: "{{-(-1/3 - 1/6) = -1/3 + 1/6}}", dung: false } ],
  loiGiai: ["Trước ngoặc có dấu “−”: đổi dấu mọi số hạng trong ngoặc.", "Đúng phải là {{1 - (1/4 + 1/2) = 1 - 1/4 - 1/2}} và {{-(-1/3 - 1/6) = 1/3 + 1/6}}."] },

{ id: "V4-16", vung: 4, loai: "dien", dang: "chuyen-ve", muc: 3,
  de: "Tìm $x$, biết {{2/3 x - 1/2 = 1/6}}.", dapAn: "1", kiemTra: "@de",
  loiGiai: ["{{2/3 x = 1/6 + 1/2}}", "{{2/3 x = 2/3}}", "{{x = 2/3 : 2/3 = 1}}"] },

{ id: "V4-17", vung: 4, loai: "trac-nghiem", dang: "chuyen-ve", muc: 3,
  de: "Tìm $x$, biết {{(x - 1/2)^2 = 1/4}}.",
  phuongAn: ["{{x = 1}} hoặc {{x = 0}}", "{{x = 1}}", "{{x = 3/4}}", "{{x = 0}}"], dapAn: "A",
  loiGiai: ["{{(1/2)^2 = (-1/2)^2 = 1/4}} nên {{x - 1/2 = 1/2}} hoặc {{x - 1/2 = -1/2}}.", "Vậy {{x = 1}} hoặc {{x = 0}}."],
  loiSai: "Quên trường hợp {{x - 1/2 = -1/2}}." },

{ id: "V4-18", vung: 4, loai: "thu-tu-buoc", dang: "chuyen-ve", muc: 2,
  de: "Sắp xếp các bước tìm $x$, biết {{x + 1/4 = -1/2}}.",
  buoc: ["{{x = -1/2 - 1/4}}", "{{x = -2/4 - 1/4}}", "{{x = -3/4}}"],
  loiGiai: ["Chuyển {{1/4}} sang vế phải và đổi dấu, quy đồng rồi tính."] },

{ id: "V4-19", vung: 4, loai: "ghep", dang: "thu-tu", muc: 2,
  de: "Ghép mỗi biểu thức với giá trị của nó.",
  cap: [ { trai: "{{2 + 4 : 2}}", phai: "4" }, { trai: "{{(2 + 4) : 2}}", phai: "3" }, { trai: "{{2 * 3^2}}", phai: "18" }, { trai: "{{(2 * 3)^2}}", phai: "36" } ],
  loiGiai: ["Không ngoặc: chia trước {{2 + 4 : 2 = 2 + 2 = 4}}; có ngoặc: {{(2 + 4) : 2 = 6 : 2 = 3}}.", "{{2 * 3^2 = 2 * 9 = 18}}; {{(2 * 3)^2 = 6^2 = 36}}."] },

{ id: "V4-20", vung: 4, loai: "dien", dang: "thuc-te", muc: 2,
  de: "Lúc 7 giờ nhiệt độ là {{-4,5}} °C. Đến 12 giờ nhiệt độ tăng {{6}} °C, đến 20 giờ lại giảm {{3,5}} °C so với lúc 12 giờ. Nhiệt độ lúc 20 giờ là bao nhiêu?",
  dapAn: "-2", donVi: "°C", kiemTra: "-4,5 + 6 - 3,5",
  loiGiai: ["{{-4,5 + 6 - 3,5 = 1,5 - 3,5 = -2}} (°C)."] },

{ id: "V4-21", vung: 4, loai: "trac-nghiem", dang: "thuc-te", muc: 3,
  de: "Thang máy đang ở tầng hầm, độ cao {{-6,5}} m. Thang đi lên {{20}} m rồi đi xuống {{8,5}} m. Độ cao mới của thang máy là",
  phuongAn: ["{{5}} m", "{{-5}} m", "{{22}} m", "{{-35}} m"], dapAn: "A", kiemTra: "-6,5 + 20 - 8,5",
  loiGiai: ["Đi lên thì cộng, đi xuống thì trừ.", "{{-6,5 + 20 - 8,5 = 13,5 - 8,5 = 5}} (m)."] },

{ id: "V4-22", vung: 4, loai: "dien", dang: "thu-tu", muc: 3,
  de: "Tính {{1/3 - [1/2 - (1/4 - 2/3)]}}", dapAn: "-7/12", kiemTra: "@de",
  loiGiai: ["Ngoặc tròn: {{1/4 - 2/3 = 3/12 - 8/12 = -5/12}}", "Ngoặc vuông: {{1/2 - (-5/12) = 6/12 + 5/12 = 11/12}}", "{{1/3 - 11/12 = 4/12 - 11/12 = -7/12}}"] },

{ id: "V4-23", vung: 4, loai: "sap-xep", dang: "thu-tu", muc: 2,
  de: "Sắp xếp **giá trị** các biểu thức theo thứ tự **tăng dần**.",
  so: ["1 - 1/2 * 2", "(1 - 1/2) * 2", "1/2 + 1/2 : 2", "-1/2 * 2 + 1/2"], chieu: "tang",
  loiGiai: ["{{1 - 1/2 * 2 = 0}}; {{(1 - 1/2) * 2 = 1}}", "{{1/2 + 1/2 : 2 = 3/4}}; {{-1/2 * 2 + 1/2 = -1/2}}", "Vậy {{-1/2 < 0 < 3/4 < 1}}."] },

{ id: "V4-24", vung: 4, loai: "dien", dang: "dau-ngoac", muc: 2,
  de: "Tính hợp lí {{(7/9 - 5/11) - (7/9 + 6/11)}}", dapAn: "-1", kiemTra: "@de",
  loiGiai: ["Bỏ ngoặc: {{(7/9 - 5/11) - (7/9 + 6/11) = 7/9 - 5/11 - 7/9 - 6/11}}", "{{7/9 - 5/11 - 7/9 - 6/11 = (7/9 - 7/9) - (5/11 + 6/11) = 0 - 1 = -1}}"] },

{ id: "V4-25", vung: 4, loai: "trac-nghiem", dang: "chuyen-ve", muc: 2,
  de: "Giá trị của $x$ thoả mãn {{x : 3/4 = -2/3}} là",
  phuongAn: ["-1/2", "-8/9", "1/2", "-2"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Số bị chia bằng thương nhân số chia: {{x = -2/3 * 3/4}}", "{{x = -6/12 = -1/2}}"],
  loiSai: "Lấy {{-2/3 : 3/4 = -8/9}}." },

{ id: "V4-26", vung: 4, loai: "dien", dang: "thuc-te", muc: 3,
  de: "Mai có 120 nghìn đồng. Mai dùng {{1/4}} số tiền mua sách, rồi dùng {{2/3}} số tiền còn lại mua vở. Mai còn lại bao nhiêu nghìn đồng?",
  dapAn: "30", donVi: "nghìn đồng", kiemTra: "120 - 120 * 1/4 - (120 - 120 * 1/4) * 2/3",
  loiGiai: ["Mua sách: {{120 * 1/4 = 30}}. Còn lại: {{120 - 30 = 90}}.", "Mua vở: {{90 * 2/3 = 60}}.", "Mai còn: {{90 - 60 = 30}} (nghìn đồng)."],
  loiSai: "Tính {{2/3}} của 120 thay vì {{2/3}} của số tiền còn lại." },

/* ======================= VÙNG 5 — ÔN TẬP TỔNG HỢP ======================= */
{ id: "V5-01", vung: 5, loai: "trac-nghiem", dang: "thu-tu", muc: 2,
  de: "Tính {{-1/2 + (1/2)^2 * 4}}",
  phuongAn: ["1/2", "-1", "-3/2", "1"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Luỹ thừa: {{(1/2)^2 = 1/4}}. Nhân: {{1/4 * 4 = 1}}.", "{{-1/2 + 1 = 1/2}}"] },

{ id: "V5-02", vung: 5, loai: "dien", dang: "chuyen-ve", muc: 2,
  de: "Tìm $x$, biết {{3/5 - 2x = -1/5}}.", dapAn: "2/5", kiemTra: "@de",
  loiGiai: ["{{2x = 3/5 - (-1/5)}}", "{{2x = 4/5}}", "{{x = 4/5 : 2 = 2/5}}"] },

{ id: "V5-03", vung: 5, loai: "trac-nghiem", dang: "so-sanh", muc: 3,
  de: "Số hữu tỉ $x$ nào thoả mãn {{-1/2 < x < -1/3}}?",
  phuongAn: ["-5/12", "-1/4", "-2/3", "-7/12"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["Quy đồng mẫu 12: {{-6/12 < x < -4/12}}.", "Vậy {{x = -5/12}}."] },

{ id: "V5-04", vung: 5, loai: "trac-nghiem", dang: "lt-cung-co-so", muc: 2,
  de: "Tính {{(-2)^5 : (-2)^2 - 8}}",
  phuongAn: ["-16", "0", "16", "-4"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{(-2)^5 : (-2)^2 = (-2)^3 = -8}}", "{{-8 - 8 = -16}}"] },

{ id: "V5-05", vung: 5, loai: "dien", dang: "thuc-te", muc: 2,
  de: "Áo niêm yết giá 250 nghìn đồng, được giảm {{1/5}} giá. Giá áo sau khi giảm là bao nhiêu?",
  dapAn: "200", donVi: "nghìn đồng", kiemTra: "250 - 250 * 1/5",
  loiGiai: ["Số tiền được giảm: {{250 * 1/5 = 50}}.", "Giá mới: {{250 - 50 = 200}} (nghìn đồng)."] },

{ id: "V5-06", vung: 5, loai: "dien", dang: "nhan-chia", muc: 2,
  de: "Tính {{1,5 : (-3/4) + 2}}", dapAn: "0", kiemTra: "@de",
  loiGiai: ["{{1,5 : (-3/4) = 3/2 * (-4/3) = -2}}", "{{-2 + 2 = 0}}"] },

{ id: "V5-07", vung: 5, loai: "trac-nghiem", dang: "lt-cua-lt", muc: 3,
  de: "Viết {{4^5 * 2^3}} dưới dạng một luỹ thừa cơ số 2.",
  phuongAn: ["2^13", "2^8", "8^8", "2^15"], dapAn: "A", kiemTra: "@de",
  loiGiai: ["{{4^5 = (2^2)^5 = 2^10}}", "{{2^10 * 2^3 = 2^13}}"] },

{ id: "V5-08", vung: 5, loai: "trac-nghiem", dang: "thuc-te", muc: 3,
  de: "An có một thanh sô-cô-la. An cho em {{2/5}} thanh, rồi cho bạn {{1/3}} phần còn lại. An còn lại bao nhiêu phần thanh sô-cô-la?",
  phuongAn: ["2/5", "4/15", "1/5", "3/5"], dapAn: "A", kiemTra: "(1 - 2/5) * (1 - 1/3)",
  loiGiai: ["Sau khi cho em, còn {{1 - 2/5 = 3/5}} thanh.", "Cho bạn {{1/3 * 3/5 = 1/5}} thanh.", "Còn lại {{3/5 - 1/5 = 2/5}} thanh."],
  loiSai: "Lấy {{1 - 2/5 - 1/3 = 4/15}}: {{1/3}} là của phần còn lại, không phải của cả thanh." },

{ id: "V5-09", vung: 5, loai: "dung-sai", dang: "luy-thua", muc: 3,
  de: "Mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "{{(-1/2)^3 < (-1/3)^2}}", dung: true },
       { nd: "{{(-2/3)^2 = -4/9}}", dung: false },
       { nd: "{{1/2 - 1/3 * 3 = 1/2}}", dung: false },
       { nd: "{{-(3/4 - 1) = 1/4}}", dung: true } ],
  loiGiai: ["{{(-1/2)^3 = -1/8 < 0 < 1/9 = (-1/3)^2}}", "{{(-2/3)^2 = 4/9}}; {{1/2 - 1/3 * 3 = 1/2 - 1 = -1/2}}", "{{-(3/4 - 1) = -3/4 + 1 = 1/4}}"] },

{ id: "V5-10", vung: 5, loai: "bat-loi", dang: "thu-tu", muc: 3,
  de: "Bạn Quân tính {{(-2)^2 - 2^2 : 4}} như sau. Bước nào sai?",
  dau: "(-2)^2 - 2^2 : 4", buoc: ["4 - 4 : 4", "0 : 4", "0"], buocSai: 2,
  loiGiai: ["{{(-2)^2 - 2^2 : 4 = 4 - 4 : 4 = 4 - 1 = 3}}"],
  loiSai: "Thực hiện phép trừ trước phép chia." },

{ id: "V5-11", vung: 5, loai: "bat-loi", dang: "luy-thua", muc: 3,
  de: "Bạn Vy tính {{(-1/3)^2 * 9 - 1}} như sau. Bước nào sai?",
  dau: "(-1/3)^2 * 9 - 1", buoc: ["-1/9 * 9 - 1", "-1 - 1", "-2"], buocSai: 1,
  loiGiai: ["{{(-1/3)^2 * 9 - 1 = 1/9 * 9 - 1 = 1 - 1 = 0}}"],
  loiSai: "Luỹ thừa bậc chẵn của số âm phải là số dương: {{(-1/3)^2 = 1/9}}." },

{ id: "V5-12", vung: 5, loai: "sap-xep", dang: "so-sanh", muc: 3,
  de: "Sắp xếp giá trị các biểu thức theo thứ tự **tăng dần**.",
  so: ["(-2/3)^2", "-1/2 + 1/3", "3/4 : (-3)", "0,5^2"], chieu: "tang",
  loiGiai: ["{{(-2/3)^2 = 4/9}}; {{-1/2 + 1/3 = -1/6}}; {{3/4 : (-3) = -1/4}}; {{0,5^2 = 1/4}}.", "Vậy {{-1/4 < -1/6 < 1/4 < 4/9}}."] },

{ id: "V5-13", vung: 5, loai: "ghep", dang: "chuyen-ve", muc: 3, quanHe: "nghiem",
  de: "Ghép mỗi đẳng thức với giá trị $x$ thoả mãn nó.",
  cap: [ { trai: "{{x + 1/2 = 0}}", phai: "-1/2" }, { trai: "{{x - 1/2 = 0}}", phai: "1/2" }, { trai: "{{2x = 1/3}}", phai: "1/6" }, { trai: "{{x : 2 = 1/3}}", phai: "2/3" } ],
  loiGiai: ["Chuyển vế, đổi dấu: {{x = -1/2}}; {{x = 1/2}}.", "{{x = 1/3 : 2 = 1/6}}; {{x = 1/3 * 2 = 2/3}}."] },

{ id: "V5-14", vung: 5, loai: "truc-so", dang: "truc-so", muc: 3,
  de: "Đặt điểm biểu diễn số {{-1,75}} trên trục số.",
  diem: "-7/4", tu: "-2", den: "1", buoc: "1/4", kiemTra: "-1,75",
  loiGiai: ["{{-1,75 = -7/4 = -1 - 3/4}}", "Từ $-1$ đi sang trái 3 phần (mỗi phần {{1/4}})."] },

{ id: "V5-15", vung: 5, loai: "thu-tu-buoc", dang: "chuyen-ve", muc: 3,
  de: "Sắp xếp các bước tìm $x$, biết {{1/2 - (x - 1/3) = 1/4}}.",
  buoc: ["{{1/2 - x + 1/3 = 1/4}}", "{{5/6 - x = 1/4}}", "{{x = 5/6 - 1/4}}", "{{x = 7/12}}"],
  loiGiai: ["Bỏ ngoặc (đổi dấu) → thu gọn → chuyển vế → tính."] },

{ id: "V5-16", vung: 5, loai: "dien", dang: "tinh-chat", muc: 3,
  de: "Tính hợp lí {{3/7 * 5/9 + 4/9 * 3/7 - 3/7}}", dapAn: "0", kiemTra: "@de",
  loiGiai: ["{{3/7 * 5/9 + 4/9 * 3/7 - 3/7 = 3/7 * (5/9 + 4/9 - 1)}}", "{{3/7 * (5/9 + 4/9 - 1) = 3/7 * 0 = 0}}"] },

{ id: "V5-17", vung: 5, loai: "trac-nghiem", dang: "khai-niem", muc: 1,
  de: "Khẳng định nào sau đây đúng?",
  phuongAn: ["Mọi số nguyên đều là số hữu tỉ.", "Mọi số hữu tỉ đều là số nguyên.", "Số 0 không phải là số hữu tỉ.", "{{-1/2}} là số hữu tỉ dương."], dapAn: "A",
  loiGiai: ["Mỗi số nguyên $a$ viết được thành {{a/1}} nên là số hữu tỉ.", "{{1/2}} là số hữu tỉ nhưng không phải số nguyên."] },

{ id: "V5-18", vung: 5, loai: "dien", dang: "luy-thua", muc: 2,
  de: "Tính {{(-1/2)^2 + (-1/2)^3}}", dapAn: "1/8", kiemTra: "@de",
  loiGiai: ["{{(-1/2)^2 = 1/4}}; {{(-1/2)^3 = -1/8}}", "{{1/4 + (-1/8) = 2/8 - 1/8 = 1/8}}"] },

{ id: "V5-19", vung: 5, loai: "trac-nghiem", dang: "so-doi", muc: 2,
  de: "Tổng của {{-7/12}} và số đối của {{5/12}} là",
  phuongAn: ["-1", "-1/6", "1/6", "1"], dapAn: "A", kiemTra: "-7/12 + (-5/12)",
  loiGiai: ["Số đối của {{5/12}} là {{-5/12}}.", "{{-7/12 + (-5/12) = -12/12 = -1}}"] },

{ id: "V5-20", vung: 5, loai: "dien", dang: "thuc-te", muc: 3,
  de: "Một ô tô đi quãng đường AB trong 3 giờ. Giờ thứ nhất đi được {{1/3}} quãng đường, giờ thứ hai đi được {{2/5}} quãng đường. Giờ thứ ba ô tô đi được bao nhiêu phần quãng đường?",
  dapAn: "4/15", kiemTra: "1 - 1/3 - 2/5",
  loiGiai: ["Cả quãng đường là 1.", "{{1 - 1/3 - 2/5 = 15/15 - 5/15 - 6/15 = 4/15}}"] },

{ id: "V5-21", vung: 5, loai: "dung-sai", dang: "thu-tu", muc: 1,
  de: "Mỗi khẳng định sau đúng hay sai?",
  y: [ { nd: "Biểu thức có ngoặc: làm trong ngoặc tròn trước, rồi đến ngoặc vuông.", dung: true },
       { nd: "Phép nhân luôn được thực hiện trước phép luỹ thừa.", dung: false },
       { nd: "Bỏ ngoặc có dấu “+” đằng trước thì giữ nguyên dấu các số hạng trong ngoặc.", dung: true },
       { nd: "Chuyển một số hạng sang vế kia thì không cần đổi dấu.", dung: false } ],
  loiGiai: ["Thứ tự: ngoặc → luỹ thừa → nhân, chia → cộng, trừ.", "Chuyển vế thì phải đổi dấu."] },

{ id: "V5-22", vung: 5, loai: "trac-nghiem", dang: "so-sanh", muc: 3,
  de: "So sánh $A =$ {{(-1/2)^3}} và $B =$ {{(-1/3)^2}}.",
  phuongAn: ["$A < B$", "$A > B$", "$A = B$"], dapAn: "A",
  loiGiai: ["{{(-1/2)^3 = -1/8 < 0}} và {{(-1/3)^2 = 1/9 > 0}}.", "Số âm nhỏ hơn số dương nên $A < B$."] }
];
