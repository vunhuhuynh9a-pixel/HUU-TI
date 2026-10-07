/* =====================================================================
   Vương Quốc Hữu Tỉ — NHẬN KẾT QUẢ HỌC SINH VÀO GOOGLE SHEETS
   Dán toàn bộ đoạn mã này vào: Google Sheets → Tiện ích mở rộng → Apps Script.
   Sau đó Triển khai → Tùy chọn triển khai mới → Ứng dụng web
     · Thực thi với tư cách: Tôi
     · Ai có quyền truy cập: Bất kỳ ai
   Xem hướng dẫn đầy đủ trong README.md, mục 5.
   ===================================================================== */

// ĐỔI mật khẩu này trước khi triển khai. Chỉ ai biết mật khẩu mới XEM được kết quả trên trang giáo viên.
const MAT_KHAU_GIAO_VIEN = 'doi-mat-khau-nay';

const TEN_TRANG = 'KetQua';
const COT = ['Cập nhật lúc', 'Mã máy', 'Học sinh', 'Lớp', 'Cấp', 'XP', 'Sao', 'Vùng đã qua', 'Huy hiệu', 'Câu đúng', 'Câu sai', 'Mã kết quả'];

function trang_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TEN_TRANG);
  if (!sh) { sh = ss.insertSheet(TEN_TRANG); sh.appendRow(COT); sh.setFrozenRows(1); }
  return sh;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
// chữ: cắt ngắn, chặn công thức (ô bắt đầu bằng = + - @ bị coi là công thức trong Sheets)
function chu_(v) { const s = String(v == null ? '' : v).slice(0, 40).trim(); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function so_(v) { const n = parseInt(v, 10); return isFinite(n) ? Math.max(0, Math.min(10000000, n)) : 0; }

/** Game gửi kết quả lên (mỗi học sinh một dòng, gửi lại thì cập nhật dòng cũ) */
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const id = String(d.id || ''), ma = String(d.ma || '');
    if (!/^[a-z0-9]{8,40}$/.test(id) || ma.length > 800 || !/^HT\d-[A-Za-z0-9_-]+\.[0-9a-z]{6}$/.test(ma)) return json_({ ok: false, loi: 'Dữ liệu không hợp lệ' });
    const dong = [new Date(), id, chu_(d.ten), chu_(d.lop), so_(d.cap), so_(d.xp), so_(d.sao), so_(d.vung), so_(d.huyHieu), so_(d.dung), so_(d.sai), ma];
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const sh = trang_(), n = sh.getLastRow() - 1;
      let r = -1;
      if (n > 0) {
        const ids = sh.getRange(2, 2, n, 1).getValues();
        for (let i = 0; i < ids.length; i++) if (ids[i][0] === id) { r = i + 2; break; }
      }
      if (r > 0) sh.getRange(r, 1, 1, dong.length).setValues([dong]);
      else sh.appendRow(dong);
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, loi: String(err) });
  }
}

/** Trang giáo viên đọc kết quả (cần đúng mật khẩu) */
function doGet(e) {
  const khoa = e && e.parameter ? e.parameter.khoa : '';
  if (khoa !== MAT_KHAU_GIAO_VIEN) return json_({ ok: false, loi: 'Sai mật khẩu giáo viên' });
  const v = trang_().getDataRange().getValues();
  v.shift();
  return json_({ ok: true, ds: v.filter(r => r[11]).map(r => ({ capNhat: r[0], id: r[1], ma: r[11] })) });
}
