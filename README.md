# Vương Quốc Hữu Tỉ

Game nhập vai ôn tập **Chương I: Số hữu tỉ, Toán 7, bộ sách Kết nối tri thức với cuộc sống**.
Học sinh vào vai Hiệp sĩ Toán học, đi qua 5 vùng đất, giải thử thách để đánh bại Quỷ Sai Dấu và Phù thủy Mẫu Số.

- 127 câu trong ngân hàng, cùng 14 mẫu câu sinh số ngẫu nhiên (mỗi lượt chơi số trong đề lại khác).
- 8 dạng thử thách: trắc nghiệm, Đúng/Sai, điền đáp số, kéo thả sắp xếp, trục số, ghép đôi, bắt lỗi sai, sắp xếp bước giải. Ngoài ra có chế độ Đấu trí tính giờ và đánh boss.
- Có XP, cấp độ, vàng, combo, cửa hàng, 17 huy hiệu, Hang Ôn Tập (câu sai được đưa vào để luyện lại) và 3 mức Dễ / Thường / Khó.
- Có mã kết quả để học sinh gửi thầy cô, cùng trang giáo viên hiển thị bảng xếp hạng và thống kê dạng bài cả lớp hay sai.

---

## 1. Cách mở game

**Cách đơn giản nhất:** mở thư mục `huu-ti-quest`, nhấp đúp vào file **`index.html`** để chạy bằng Chrome, Edge hoặc Cốc Cốc. Game không cần mạng và không cần đăng nhập.

Tiến độ được lưu ngay trong trình duyệt của từng máy. Đổi máy hoặc đổi trình duyệt thì sẽ chơi lại từ đầu.

**Chạy thử bằng máy chủ nhỏ trên máy (không bắt buộc):** mở PowerShell trong thư mục `huu-ti-quest` rồi gõ:

```
powershell -ExecutionPolicy Bypass -File cong-cu\may-chu.ps1
```

Sau đó mở trình duyệt tại `http://localhost:8765`.

## 2. Các file quan trọng

| File | Dùng để |
|---|---|
| `index.html` | Game |
| `giao-vien.html` | Trang dành cho giáo viên |
| `kiem-tra.html` | Tự kiểm tra độ chính xác của ngân hàng câu hỏi |
| `du-lieu/cau-hoi.js` | **Ngân hàng câu hỏi** (thầy cô sửa file này) |
| `du-lieu/cot-truyen.js` | Tên vùng, lời thoại NPC, boss, huy hiệu, cửa hàng |
| `du-lieu/sinh-cau-hoi.js` | Các mẫu câu sinh số ngẫu nhiên |
| `js/` | Mã chương trình (không cần sửa) |
| `vendor/` | KaTeX và phông chữ đã đóng gói sẵn |

## 3. Thêm hoặc sửa câu hỏi

Mở `du-lieu/cau-hoi.js` bằng Notepad (tốt hơn là **Notepad++** hoặc **VS Code**, nhớ lưu với mã hoá **UTF-8**). Đầu file có hướng dẫn chi tiết từng trường. Cách nhanh nhất là **chép một câu có sẵn cùng dạng rồi sửa lại**.

### Cách viết công thức

Đặt công thức trong `{{ }}`. Máy vừa dùng công thức này để **hiển thị**, vừa dùng để **tính lại đáp án**.

| Muốn hiện | Viết |
|---|---|
| −3/4 (dấu trừ trước phân số) | `{{-3/4}}` |
| phân số có tử −3 | `{{(-3)/4}}` |
| 0,25 | `{{0,25}}` |
| a · b (nhân) | `{{a * b}}` |
| a : b (chia) | `{{a : b}}` |
| (−2/3)² | `{{(-2/3)^2}}` |
| −3² (bằng −9) | `{{-3^2}}` |
| ngoặc vuông | `{{[1/2 - (1/3 + 1)] * 2}}` |
| 2x | `{{2x}}` |
| so sánh, đẳng thức | `{{-1/2 < -1/3}}`, `{{x + 1/3 = 5/6}}` |
| kí hiệu ℚ, ∈ | `$\\mathbb{Q}$`, `$\\in$` (dấu `\` phải viết thành `\\`) |

### Ví dụ: thêm một câu điền đáp số

```js
{ id: "V2-27", vung: 2, loai: "dien", dang: "cong-tru", muc: 1,
  de: "Tính {{2/5 + (-1/2)}}", dapAn: "-1/10", kiemTra: "@de",
  loiGiai: ["Quy đồng mẫu 10: {{2/5 + (-1/2) = 4/10 + (-5/10) = -1/10}}"],
  loiSai: "Cộng tử với tử, mẫu với mẫu." },
```

- `kiemTra: "@de"` nghĩa là máy lấy công thức trong đề để tính lại, rồi so với `dapAn`.
- Học sinh viết `-1/10`, `-0,1`, `1/-10` hay `-2/20` đều được chấm đúng.
- Mỗi câu nhớ có dấu phẩy `,` ở cuối khối `{ ... }`.

### Sau khi sửa: luôn mở `kiem-tra.html`

Trang này tự động:
- tính lại đáp án mọi câu bằng **phân số chính xác** (không dùng số thực);
- báo lỗi khi đáp án sai, hai phương án trùng giá trị, đáp án chưa tối giản, công thức viết sai cú pháp, một đẳng thức trong lời giải bị sai, bước "bắt lỗi" không đúng là bước sai duy nhất;
- chạy thử mỗi mẫu câu ngẫu nhiên 600 lần;
- liệt kê những câu khái niệm (đáp án là chữ) để thầy cô soát tay.

Kết quả lần chạy cuối khi bàn giao: 127 câu, **0 lỗi**; 8.400 câu sinh ngẫu nhiên, **0 lỗi**; 13 câu khái niệm đã soát tay.

## 4. Đưa lên GitHub Pages để gửi link cho học sinh

1. Tạo tài khoản tại <https://github.com> (miễn phí).
2. Bấm **New repository**, đặt tên ví dụ `huu-ti-quest`, chọn **Public**, rồi bấm **Create repository**.
3. Trên trang repository, bấm **uploading an existing file**. Kéo **toàn bộ nội dung bên trong** thư mục `huu-ti-quest` vào, gồm cả các thư mục `css`, `js`, `du-lieu`, `vendor`, rồi bấm **Commit changes**.
4. Vào **Settings → Pages**. Ở mục *Branch*, chọn `main` và thư mục `/ (root)`, rồi bấm **Save**.
5. Khoảng 1–2 phút sau, link game có dạng `https://<tên-tài-khoản>.github.io/huu-ti-quest/`, còn trang giáo viên là `…/huu-ti-quest/giao-vien.html`.

Khi sửa câu hỏi, chỉ cần tải lại file `du-lieu/cau-hoi.js` lên repository (ghi đè file cũ).

## 5. Nhận kết quả TỰ ĐỘNG khi học sinh chơi ở nhà (Google Sheets)

Khi bật tính năng này, sau mỗi thử thách game tự gửi kết quả của học sinh vào **Google Sheets của thầy cô**. Học sinh không cần đăng nhập, không phải chép mã. Thầy cô mở trang giáo viên là thấy bảng xếp hạng.

> Tính năng này chạy khi game được mở từ **GitHub Pages** (mục 4) hoặc mở trực tiếp file `index.html`. Link Artifact trên claude.ai **không** gửi được dữ liệu ra ngoài, vì trang đó chặn kết nối tới các trang web khác.

**Cài đặt một lần (khoảng 10 phút):**

1. Vào <https://sheets.google.com> và tạo một bảng tính mới, đặt tên ví dụ "Kết quả Hữu Tỉ".
2. Trong bảng tính, chọn **Tiện ích mở rộng → Apps Script**.
3. Xoá hết mã có sẵn, rồi dán **toàn bộ** nội dung file `cong-cu/google-apps-script.gs` vào.
4. Ở dòng `const MAT_KHAU_GIAO_VIEN = 'doi-mat-khau-nay';`, đổi `doi-mat-khau-nay` thành mật khẩu riêng của thầy cô. Sau đó bấm biểu tượng **Lưu** 💾.
5. Bấm **Triển khai → Tùy chọn triển khai mới**. Bấm biểu tượng bánh răng, chọn **Ứng dụng web**, rồi đặt:
   - *Thực thi với tư cách*: **Tôi**
   - *Ai có quyền truy cập*: **Bất kỳ ai**

   Bấm **Triển khai**. Google sẽ hỏi cấp quyền cho chính tài khoản của thầy cô: chọn tài khoản, bấm *Nâng cao → Đi tới… (không an toàn)*, rồi **Cho phép**. Cảnh báo này xuất hiện vì đây là mã tự viết, chưa qua kiểm duyệt của Google.
6. Chép **URL ứng dụng web**, có dạng `https://script.google.com/macros/s/…/exec`.
7. Mở file `du-lieu/cau-hinh.js`, dán URL vào giữa hai dấu nháy: `urlKetQua: 'https://script.google.com/macros/s/…/exec'`. Sau đó tải file này lên GitHub (ghi đè file cũ).
8. Mở trang giáo viên. Ở mục **1. Kết quả tự động**, dán URL và nhập mật khẩu, rồi bấm **Tải kết quả**. Tick **Tự cập nhật mỗi phút** nếu muốn theo dõi trực tiếp. Trang sẽ nhớ hai thông tin này cho lần sau.

**Lưu ý:**
- Mỗi học sinh (mỗi máy) chiếm một dòng trong trang tính `KetQua`. Chơi tiếp thì dòng đó được cập nhật, không sinh dòng mới. Thầy cô cũng có thể mở thẳng bảng tính để xem hoặc lọc.
- Nếu học sinh mất mạng, game nhớ lại và tự gửi khi có mạng hoặc lần mở sau. Trong mục **Hồ sơ** có dòng trạng thái và nút **Gửi ngay**.
- Chỉ người có mật khẩu mới *xem* được kết quả qua trang giáo viên. Tuy nhiên ai biết URL cũng có thể *gửi* dữ liệu vào, giống như với mã kết quả. Vì vậy hãy coi đây là công cụ tạo động lực, không dùng làm điểm kiểm tra chính thức.
- Nếu sửa mã Apps Script, phải vào **Triển khai → Quản lý các bản triển khai → Chỉnh sửa → Phiên bản mới** thì thay đổi mới có hiệu lực, và URL vẫn giữ nguyên.
- Muốn chạy thử trên máy không cần Google: chạy `cong-cu\may-chu.ps1`, đặt `urlKetQua: '/thu-ket-qua'`, rồi dùng mật khẩu `thu` trên trang giáo viên.

## 6. Dùng trang giáo viên

1. Học sinh vào mục **Hồ sơ** (hoặc màn hình kết thúc game), bấm **Chép mã** rồi gửi mã cho thầy cô qua Zalo hoặc Messenger. Mã có dạng `HT1-xxxx.yyyyyy`.
2. Thầy cô mở `giao-vien.html`, **dán tất cả tin nhắn** vào ô (lẫn chữ khác cũng được, máy tự lọc ra mã), rồi bấm **Xem bảng xếp hạng**.
3. Trang hiển thị:
   - **Bảng xếp hạng** theo XP rồi đến số sao; bấm tiêu đề cột để sắp xếp lại; có thể lọc theo lớp.
   - **Dạng bài cả lớp hay sai**, sắp từ tỉ lệ sai cao xuống thấp, kèm tên học sinh cần hỗ trợ.
   - Nút **Tải bảng (CSV)** để mở bằng Excel.
4. Mỗi học sinh chỉ được giữ lại mã mới nhất. Mã bị gõ sai hoặc bị sửa sẽ được báo lỗi.

Bấm **Thử với dữ liệu mẫu** để xem trước trang hoạt động thế nào.

> Lưu ý: mã kết quả có mã kiểm tra để phát hiện gõ nhầm, nhưng **không phải mã bảo mật**. Học sinh rành máy tính vẫn có thể tạo mã giả. Hãy dùng bảng xếp hạng để tạo động lực, đừng dùng làm điểm kiểm tra chính thức.

## 7. Cơ chế game (tóm tắt)

- **Lớp nhân vật:** Chiến binh (7 tim), Pháp sư (2 gợi ý miễn phí mỗi thử thách), Thám hiểm (loại 1 đáp án sai mỗi thử thách), Thợ rèn (lần sai đầu tiên không mất tim).
- **Mỗi vùng:** 4 thử thách thường, 1 Đấu trí 60 giây và 1 mini-boss. Phải hạ mini-boss mới mở được vùng sau. Vùng 5 có boss cuối hai giai đoạn.
- **Qua một thử thách:** đúng ít nhất một nửa số câu và không hết tim. Không sai câu nào được 3 sao, sai 1 câu được 2 sao.
- **Hết tim hoặc chưa đạt:** em được hồi sinh, xem lại lời giải các câu sai rồi thử lại mà không mất gì.
- **Sau mỗi câu:** hiện đáp án, lời giải từng bước, và lỗi sai thường gặp nếu em làm sai.

## 8. Bản quyền

- Mã nguồn và nội dung câu hỏi: tự viết cho dự án này.
- [KaTeX](https://katex.org): giấy phép MIT (xem `vendor/katex/LICENSE`).
- Phông chữ Baloo 2 và Nunito: giấy phép SIL Open Font License.
- Hình ảnh trong game là emoji của hệ điều hành và hình vẽ bằng CSS, không dùng hình ảnh có bản quyền.
