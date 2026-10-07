/* giao-vien.js — Giải mã nhiều mã kết quả, xếp hạng và thống kê dạng bài cả lớp hay sai. */
(function () {
  'use strict';
  const CT = COT_TRUYEN, MK = MaKetQua;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'htq-giao-vien-ma';
  let hs = [], sapXep = { cot: 'xp', giam: true };

  try { $('#o-ma').value = localStorage.getItem(KEY) || ''; } catch (e) {}

  const ngayDep = n => { n = String(n); return n.length === 8 ? n.slice(6) + '/' + n.slice(4, 6) + '/' + n.slice(0, 4) : n; };
  const tiLe = h => (h.dung + h.sai) ? h.dung / (h.dung + h.sai) : 0;
  const tenLopNV = k => (CT.LOP_NHAN_VAT[k] || { ten: k }).ten;

  /* ---------- Kết quả tự động từ Google Sheets ---------- */
  const KEY_ON = 'htq-giao-vien-truc-tuyen';
  let truc = [], henCapNhat = null; // [{ma, capNhat}] tải từ Apps Script
  try { const c = JSON.parse(localStorage.getItem(KEY_ON) || '{}'); $('#url-kq').value = c.url || (window.CAU_HINH && CAU_HINH.urlKetQua) || ''; $('#mat-khau').value = c.khoa || ''; } catch (e) {}
  async function taiTrucTuyen(imLang) {
    const url = $('#url-kq').value.trim(), khoa = $('#mat-khau').value;
    try { localStorage.setItem(KEY_ON, JSON.stringify({ url, khoa })); } catch (e) {}
    if (!url) { if (!imLang) $('#bao-on').textContent = 'Hãy dán địa chỉ ứng dụng web (Apps Script).'; return; }
    $('#bao-on').textContent = 'Đang tải…';
    try {
      const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'khoa=' + encodeURIComponent(khoa) + '&t=' + Date.now());
      const d = await r.json();
      if (!d.ok) { $('#bao-on').innerHTML = '<span class="loi">' + esc(d.loi || 'Không đọc được dữ liệu') + '</span>'; return; }
      truc = d.ds || [];
      $('#bao-on').innerHTML = '✅ Đã tải <b>' + truc.length + '</b> học sinh lúc ' + new Date().toLocaleTimeString('vi-VN') + '.';
      phanTich();
    } catch (e) {
      $('#bao-on').innerHTML = '<span class="loi">Không kết nối được. Kiểm tra lại địa chỉ, mạng, và việc triển khai Apps Script với quyền “Bất kỳ ai”.</span>';
    }
  }

  function phanTich() {
    const text = $('#o-ma').value;
    try { localStorage.setItem(KEY, text); } catch (e) {}
    const maDan = MK.timMa(text), loi = [], theoHS = new Map();
    const them = (m, nguon) => {
      const d = MK.giaiMa(m);
      if (d.loi) { loi.push(m.slice(0, 18) + '… (' + d.loi + ')'); return; }
      d.nguon = nguon;
      const k = (d.ten + '|' + d.lop).toLowerCase();
      const cu = theoHS.get(k);
      if (!cu || d.ngay > cu.ngay || (d.ngay === cu.ngay && d.xp > cu.xp)) theoHS.set(k, d);
    };
    truc.forEach(x => them(String(x.ma || ''), 'tự động'));
    maDan.forEach(m => them(m, 'mã dán'));
    hs = [...theoHS.values()];
    const lops = [...new Set(hs.map(h => h.lop).filter(Boolean))].sort();
    const sel = $('#loc'), cur = sel.value;
    sel.innerHTML = '<option value="">Tất cả</option>' + lops.map(l => '<option' + (l === cur ? ' selected' : '') + '>' + esc(l) + '</option>').join('');
    const tong = maDan.length + truc.length;
    $('#bao').innerHTML = tong ? 'Có <b>' + truc.length + '</b> kết quả tự động và <b>' + maDan.length + '</b> mã dán, gộp lại <b>' + hs.length + '</b> học sinh.' + (loi.length ? ' <span class="loi">' + loi.length + ' mã lỗi: ' + loi.map(esc).join('; ') + '</span>' : '') : 'Chưa có kết quả nào. Mã có dạng HT1-…';
    ve();
  }

  function locHS() { const l = $('#loc').value; return hs.filter(h => !l || h.lop === l); }

  function ve() {
    const ds = locHS();
    if (!ds.length) { $('#ket-qua').innerHTML = ''; return; }
    const key = { xp: h => h.xp, sao: h => h.sao, ten: h => h.ten.toLowerCase(), tl: tiLe, vung: h => h.vung, hh: h => h.huyHieu, cap: h => h.cap };
    const f = key[sapXep.cot] || key.xp;
    const xh = ds.slice().sort((a, b) => b.xp - a.xp || b.sao - a.sao);
    const hang = new Map(xh.map((h, i) => [h, i + 1]));
    const hien = ds.slice().sort((a, b) => { const x = f(a), y = f(b); return (x < y ? -1 : x > y ? 1 : 0) * (sapXep.giam ? -1 : 1); });

    const tongDung = ds.reduce((a, h) => a + h.dung, 0), tongSai = ds.reduce((a, h) => a + h.sai, 0);
    let html = '<div class="tom"><div><b>' + ds.length + '</b>học sinh</div><div><b>' + Math.round(ds.reduce((a, h) => a + h.xp, 0) / ds.length) + '</b>XP trung bình</div>' +
      '<div><b>' + ds.filter(h => h.vung >= 5).length + '</b>em đã phá đảo</div><div><b>' + (tongDung + tongSai ? Math.round(tongDung / (tongDung + tongSai) * 100) : 0) + '%</b>tỉ lệ đúng cả lớp</div></div>';

    const th = (c, t, so) => '<th class="' + (so ? 'so' : '') + '" data-c="' + c + '">' + t + (sapXep.cot === c ? (sapXep.giam ? ' ▼' : ' ▲') : '') + '</th>';
    html += '<h2>Bảng xếp hạng</h2><p class="phu">Xếp theo XP, bằng XP thì xét số sao. Bấm tiêu đề cột để sắp xếp lại.</p><div class="cuon"><table><thead><tr><th>Hạng</th>' + th('ten', 'Học sinh') + '<th>Lớp</th>' +
      th('cap', 'Cấp', 1) + th('xp', 'XP', 1) + th('sao', 'Sao', 1) + th('vung', 'Vùng đã qua', 1) + th('hh', 'Huy hiệu', 1) + th('tl', 'Tỉ lệ đúng', 1) + '<th>Dạng yếu nhất</th><th>Ngày</th></tr></thead><tbody>' +
      hien.map(h => {
        const r = hang.get(h);
        const yeu = h.dang.map((x, i) => ({ i, n: x[0] + x[1], p: (x[0] + x[1]) ? x[0] / (x[0] + x[1]) : 1 })).filter(x => x.n >= 2).sort((a, b) => a.p - b.p)[0];
        return '<tr class="' + (r <= 3 ? 'top' + r : '') + '"><td>' + r + '</td><td><b>' + esc(h.ten) + '</b><br><span class="nhan">' + esc(tenLopNV(h.lopNV)) + '</span></td><td>' + esc(h.lop || '—') + '</td>' +
          '<td class="so">' + h.cap + '</td><td class="so">' + h.xp + '</td><td class="so">' + h.sao + '/90</td><td class="so">' + h.vung + '/5</td><td class="so">' + h.huyHieu + '</td>' +
          '<td class="so">' + Math.round(tiLe(h) * 100) + '% <span class="phu">(' + h.dung + '/' + (h.dung + h.sai) + ')</span></td>' +
          '<td>' + (yeu && yeu.p < 0.8 ? esc(CT.DANG[yeu.i] ? CT.DANG[yeu.i].ten : '') + ' <span class="phu">' + Math.round(yeu.p * 100) + '%</span>' : '<span class="phu">—</span>') + '</td><td>' + ngayDep(h.ngay) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    // Thống kê dạng bài
    const stat = CT.DANG.map((d, i) => {
      let c = 0, w = 0; const yeu = [];
      ds.forEach(h => { const x = h.dang[i] || [0, 0]; c += x[0]; w += x[1]; if (x[0] + x[1] >= 3 && x[0] / (x[0] + x[1]) < 0.6) yeu.push(h.ten); });
      return { d, c, w, n: c + w, p: (c + w) ? w / (c + w) : 0, yeu };
    }).filter(s => s.n > 0).sort((a, b) => b.p - a.p);
    html += '<h2>Dạng bài cả lớp hay sai</h2><p class="phu">Sắp xếp theo tỉ lệ sai, cao nhất ở trên. “Học sinh cần hỗ trợ” là em làm từ 3 câu trở lên ở dạng đó và đúng dưới 60%.</p><div class="cuon"><table><thead><tr><th>Dạng bài</th><th class="so">Số lượt làm</th><th class="so">Tỉ lệ sai</th><th></th><th>Học sinh cần hỗ trợ</th></tr></thead><tbody>' +
      stat.map(s => {
        const mau = s.p >= 0.4 ? 'var(--do)' : s.p >= 0.25 ? 'var(--cam)' : 'var(--xanh)';
        return '<tr><td>' + esc(s.d.ten) + '</td><td class="so">' + s.n + '</td><td class="so"><b>' + Math.round(s.p * 100) + '%</b></td><td><span class="thanh"><i style="width:' + Math.round(s.p * 100) + '%;background:' + mau + '"></i></span></td>' +
          '<td>' + (s.yeu.length ? s.yeu.length + ' em <details><summary>Xem tên</summary>' + s.yeu.map(esc).join(', ') + '</details>' : '<span class="phu">—</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    $('#ket-qua').innerHTML = html;
    document.querySelectorAll('th[data-c]').forEach(t => t.onclick = () => { const c = t.dataset.c; sapXep = { cot: c, giam: sapXep.cot === c ? !sapXep.giam : c !== 'ten' }; ve(); });
  }

  function taiCSV() {
    const ds = locHS().slice().sort((a, b) => b.xp - a.xp || b.sao - a.sao);
    if (!ds.length) { $('#bao').textContent = 'Chưa có dữ liệu để tải.'; return; }
    const head = ['Hạng', 'Học sinh', 'Lớp', 'Lớp nhân vật', 'Cấp', 'XP', 'Sao', 'Vùng đã qua', 'Huy hiệu', 'Số câu đúng', 'Số câu sai', 'Ngày'].concat(CT.DANG.map(d => d.ten + ' (đúng/tổng)'));
    const rows = ds.map((h, i) => [i + 1, h.ten, h.lop, tenLopNV(h.lopNV), h.cap, h.xp, h.sao, h.vung, h.huyHieu, h.dung, h.sai, ngayDep(h.ngay)]
      .concat(CT.DANG.map((d, k) => { const x = h.dang[k] || [0, 0]; return x[0] + '/' + (x[0] + x[1]); })));
    const csv = '﻿' + [head].concat(rows).map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'xep-hang-huu-ti' + ($('#loc').value ? '-' + $('#loc').value : '') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function duLieuMau() {
    const ten = ['An (mẫu)', 'Bình (mẫu)', 'Chi (mẫu)', 'Dũng (mẫu)', 'Hà (mẫu)', 'Khoa (mẫu)', 'Lan (mẫu)', 'Minh (mẫu)'];
    const lops = Object.keys(CT.LOP_NHAN_VAT);
    const codes = ten.map((t, i) => {
      const dang = CT.DANG.map((d, k) => { const n = 3 + ((i * 7 + k * 3) % 9); const w = Math.round(n * (((i + k * 5) % 7) / 14 + (d.id === 'dau-ngoac' || d.id === 'luy-thua' ? 0.3 : 0))); return [n - Math.min(w, n), Math.min(w, n)]; });
      const dung = dang.reduce((a, x) => a + x[0], 0), sai = dang.reduce((a, x) => a + x[1], 0);
      return 'Mã của ' + t + ': ' + MK.maHoa({ ten: t, lop: i < 4 ? '7A1' : '7A2', lopNV: lops[i % 4], cap: 3 + (i * 3) % 7, xp: 400 + ((i * 397) % 2600), sao: Math.min(18 * (1 + (i * 3) % 5), 12 + (i * 11) % 70), vung: 1 + (i * 3) % 5, huyHieu: 3 + i % 9, dung, sai, dang, ngay: 20261007 });
    });
    $('#o-ma').value = codes.join('\n');
    phanTich();
  }

  $('#xem').onclick = phanTich;
  $('#tai-on').onclick = () => taiTrucTuyen(false);
  $('#tu-dong').onchange = e => { clearInterval(henCapNhat); if (e.target.checked) { taiTrucTuyen(true); henCapNhat = setInterval(() => taiTrucTuyen(true), 60000); } };
  if ($('#url-kq').value.trim() && $('#mat-khau').value) taiTrucTuyen(true);
  $('#mau').onclick = duLieuMau;
  $('#xoa').onclick = () => { $('#o-ma').value = ''; phanTich(); };
  $('#loc').onchange = ve;
  $('#csv').onclick = taiCSV;
  // Chép bảng dạng tab để dán thẳng vào Excel/Google Sheets (dùng khi trình duyệt chặn tải file)
  $('#chep').onclick = () => {
    const ds = locHS().slice().sort((a, b) => b.xp - a.xp || b.sao - a.sao);
    if (!ds.length) { $('#bao').textContent = 'Chưa có dữ liệu để chép.'; return; }
    const tsv = [['Hạng', 'Học sinh', 'Lớp', 'Cấp', 'XP', 'Sao', 'Vùng đã qua', 'Huy hiệu', 'Đúng', 'Sai']]
      .concat(ds.map((h, i) => [i + 1, h.ten, h.lop, h.cap, h.xp, h.sao, h.vung, h.huyHieu, h.dung, h.sai])).map(r => r.join('\t')).join('\n');
    const ok = () => { $('#bao').textContent = 'Đã chép bảng. Mở Excel và dán (Ctrl+V).'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tsv).then(ok, () => { $('#o-ma').value = tsv; $('#bao').textContent = 'Không chép tự động được: bảng đã hiện trong ô trên, hãy chọn và chép thủ công.'; });
  };
  if ($('#o-ma').value.trim()) phanTich();
})();
