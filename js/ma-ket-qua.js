/* ma-ket-qua.js — Mã hoá / giải mã "mã kết quả" học sinh gửi cho giáo viên.
   Mã có dạng  HT1-xxxxxxxx.yyyyy  (phần sau dấu chấm là mã kiểm tra, phát hiện mã bị gõ sai/sửa).
   Lưu ý: đây không phải mã bảo mật; học sinh rành máy tính vẫn có thể tạo mã giả. */
(function (root) {
  'use strict';
  const VER = '1';
  function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36).padStart(7, '0').slice(-6); }
  function b64e(str) { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); }
  const clean = s => String(s || '').replace(/[|~.]/g, ' ').trim().slice(0, 30);
  const LNV = () => Object.keys((root.COT_TRUYEN || {}).LOP_NHAN_VAT || {});

  /** d = { ten, lop, lopNV, cap, xp, sao, vung, huyHieu, dung, sai, dang: [[đúng, sai], ...], ngay } */
  function maHoa(d) {
    const p = [VER, clean(d.ten), clean(d.lop), Math.max(0, LNV().indexOf(d.lopNV)), d.cap, d.xp, d.sao, d.vung, d.huyHieu, d.dung, d.sai,
      d.dang.map(x => (x[0] || x[1]) ? x[0].toString(36) + '.' + x[1].toString(36) : '').join('~'), d.ngay].join('|');
    return 'HT' + VER + '-' + b64e(p) + '.' + fnv(p);
  }
  function giaiMa(ma) {
    const m = /^HT(\d)-([A-Za-z0-9_-]+)\.([0-9a-z]{6})$/.exec(String(ma).trim());
    if (!m) return { loi: 'Mã không đúng định dạng' };
    let p; try { p = b64d(m[2]); } catch (e) { return { loi: 'Mã bị hỏng' }; }
    if (fnv(p) !== m[3]) return { loi: 'Mã kiểm tra không khớp (mã bị gõ sai hoặc bị sửa)' };
    const f = p.split('|');
    if (f.length < 13) return { loi: 'Mã thiếu dữ liệu' };
    const n = i => parseInt(f[i], 10) || 0;
    return { ten: f[1], lop: f[2], lopNV: LNV()[n(3)] || f[3], cap: n(4), xp: n(5), sao: n(6), vung: n(7), huyHieu: n(8), dung: n(9), sai: n(10),
      dang: f[11] ? f[11].split('~').map(x => x ? x.split('.').map(y => parseInt(y, 36) || 0) : [0, 0]) : [], ngay: f[12], ma: String(ma).trim() };
  }
  /** tìm mọi mã trong một đoạn văn bản dán vào (ví dụ chép từ tin nhắn Zalo) */
  function timMa(text) { return String(text || '').match(/HT\d-[A-Za-z0-9_-]+\.[0-9a-z]{6}/g) || []; }

  root.MaKetQua = { maHoa, giaiMa, timMa };
})(window);
