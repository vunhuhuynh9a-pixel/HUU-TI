/* =====================================================================
   kiem-tra.js — TỰ KIỂM TRA NGÂN HÀNG CÂU HỎI bằng phân số chính xác.
   Báo LỖI khi: đáp án tính lại không khớp, hai phương án bằng nhau, đáp án
   không tối giản, công thức viết sai cú pháp, một đẳng thức trong lời giải sai,
   bước "bắt lỗi" không đúng là bước sai duy nhất...
   Dùng trong kiem-tra.html (và trong lúc chơi thử tự động).
   ===================================================================== */
(function (root) {
  'use strict';
  const PS = root.PhanSo, { Frac } = PS;
  const LOAI = ['trac-nghiem', 'dung-sai', 'dien', 'sap-xep', 'truc-so', 'ghep', 'bat-loi', 'thu-tu-buoc'];

  const exprsIn = s => { const out = [], re = /\{\{([\s\S]+?)\}\}/g; let m; while ((m = re.exec(String(s || '')))) out.push(m[1]); return out; };
  const isChain = n => n && n.t === 'chain';
  const varsOf = n => [...PS.vars(n)];

  /** Các bộ giá trị thử cho kiểm tra đồng nhất thức (biểu thức chứa chữ) */
  const THU = [[2, 3, 5, 7], [3, 2, 4, 2], [5, 7, 2, 3], [new Frac(1, 2), 3, 2, 4]];
  // gán theo TÊN chữ (a, b, c, x...) để hai biểu thức luôn được thử với cùng giá trị
  function assignments(vs) { return THU.map(row => { const e = {}; vs.forEach(v => e[v] = Frac.of(row[(v.toLowerCase().charCodeAt(0) - 97) % row.length])); return e; }); }
  /** Giá trị (hoặc đúng/sai) của biểu thức tại mọi bộ thử; null nếu không tính được bộ nào */
  function evalAll(n) {
    const vs = varsOf(n), res = [];
    for (const env of assignments(vs)) { try { res.push(PS.evaluate(n, env)); } catch (e) { res.push(undefined); } if (!vs.length) break; }
    return res.some(r => r !== undefined) ? res : null;
  }
  function sameValues(a, b) {
    if (!a || !b) return false;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === undefined || b[i] === undefined) continue;
      if (!(a[i] instanceof Frac && b[i] instanceof Frac && a[i].eq(b[i]))) return false;
    }
    return true;
  }
  /** "{{x}} m" → "x";  "3/4" → "3/4";  chữ thường → null */
  function optExpr(s) {
    s = String(s);
    const ex = exprsIn(s);
    if (ex.length === 1) return ex[0];
    if (!ex.length && !/\$/.test(s) && PS.tryParse(s)) return s;
    return null;
  }

  function kiemTraCau(q, ids) {
    const loi = [], canh = [];
    let tuDong = false, dapAnSo = null;
    const L = m => loi.push(m), W = m => canh.push(m);
    const parseOk = (src, where) => { try { return PS.parse(src); } catch (e) { L(where + ': công thức lỗi "' + src + '" (' + e.message + ')'); return null; } };

    /* --- trường chung --- */
    if (!q.id) L('Thiếu id'); else if (ids) { if (ids.has(q.id)) L('Trùng id ' + q.id); ids.add(q.id); }
    if (!(q.vung >= 1 && q.vung <= 5)) L('vung phải từ 1 đến 5');
    if (!LOAI.includes(q.loai)) L('loai không hợp lệ: ' + q.loai);
    if (root.COT_TRUYEN && !root.COT_TRUYEN.DANG.some(d => d.id === q.dang)) L('dang không hợp lệ: ' + q.dang);
    if (![1, 2, 3].includes(q.muc)) L('muc phải là 1, 2 hoặc 3');
    if (!q.de) L('Thiếu đề');
    if (!Array.isArray(q.loiGiai) || !q.loiGiai.length) L('Thiếu lời giải từng bước');

    /* --- mọi công thức phải đọc được --- */
    const allText = [q.de].concat(q.loiGiai || [], q.loiSai || [], q.phuongAn || [], (q.y || []).map(x => x.nd),
      (q.cap || []).map(c => c.trai + ' ' + c.phai), q.loai === 'thu-tu-buoc' ? q.buoc : []);
    allText.forEach(t => exprsIn(t).forEach(e => parseOk(e, 'Công thức')));

    const kt = q.kiemTra === '@de' ? (() => { const e = exprsIn(q.de); if (e.length !== 1) L('kiemTra "@de" cần đề có đúng 1 công thức {{...}}'); return e[0]; })() : q.kiemTra;
    const ktNode = kt ? parseOk(kt, 'kiemTra') : null;

    /** so khớp một giá trị (cây) với kiemTra; trả về true/false/null */
    function matchKiemTra(valNode) {
      if (!ktNode || !valNode) return null;
      if (isChain(ktNode)) {
        const vs = varsOf(ktNode);
        if (vs.length !== 1) return null;
        const v = evalAll(valNode); if (!v || !(v[0] instanceof Frac)) return null;
        try { return PS.evaluate(ktNode, { [vs[0]]: v[0] }) === true; } catch (e) { return false; }
      }
      return sameValues(evalAll(ktNode), evalAll(valNode));
    }

    /* --- theo từng loại --- */
    switch (q.loai) {
      case 'trac-nghiem': {
        const pa = q.phuongAn || [];
        if (pa.length < 2 || pa.length > 4) L('Cần 2–4 phương án');
        if (new Set(pa).size !== pa.length) L('Có hai phương án viết giống hệt nhau');
        const di = 'ABCD'.indexOf(String(q.dapAn).toUpperCase());
        if (di < 0 || di >= pa.length) { L('dapAn phải là A, B, C hoặc D và có trong danh sách'); break; }
        const nodes = pa.map(o => { const e = optExpr(o); return e ? PS.tryParse(e) : null; });
        // phương án là các mệnh đề so sánh: đúng 1 mệnh đề đúng
        if (nodes.every(n => n && isChain(n) && !varsOf(n).length)) {
          const tv = nodes.map(n => { try { return PS.evaluate(n); } catch (e) { return null; } });
          tuDong = true;
          if (tv[di] !== true) L('Phương án đúng (' + q.dapAn + ') là một mệnh đề SAI');
          tv.forEach((t, i) => { if (i !== di && t === true) L('Phương án ' + 'ABCD'[i] + ' cũng đúng'); });
          break;
        }
        // phương án là giá trị: không được trùng giá trị
        if (nodes.every(n => n && !isChain(n))) {
          const vals = nodes.map(evalAll);
          for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++)
            if (vals[i] && vals[j] && sameValues(vals[i], vals[j])) L('Phương án ' + 'ABCD'[i] + ' và ' + 'ABCD'[j] + ' có cùng giá trị');
          const lr = PS.literalReduced(nodes[di]);
          if (lr === false && !q.khongXetToiGian) L('Đáp án đúng chưa tối giản: ' + pa[di]);
          if (ktNode) {
            tuDong = true;
            if (matchKiemTra(nodes[di]) !== true) L('Đáp án ' + q.dapAn + ' (' + pa[di] + ') KHÔNG khớp với kiemTra "' + kt + '"');
            nodes.forEach((n, i) => { if (i !== di && matchKiemTra(n) === true) L('Phương án ' + 'ABCD'[i] + ' cũng khớp kiemTra'); });
            const v = evalAll(nodes[di]); if (v && v[0] instanceof Frac && !varsOf(nodes[di]).length) dapAnSo = v[0];
          }
        }
        break;
      }
      case 'dung-sai': {
        if (!Array.isArray(q.y) || q.y.length < 2) { L('Cần ít nhất 2 ý'); break; }
        q.y.forEach((y, i) => {
          if (typeof y.dung !== 'boolean') L('Ý ' + (i + 1) + ': dung phải là true hoặc false');
          const ex = exprsIn(y.nd);
          if (ex.length === 1) {
            const n = PS.tryParse(ex[0]);
            if (n && isChain(n)) {
              const r = evalAll(n);
              if (r) { tuDong = true; const all = r.filter(x => x !== undefined).every(x => x === true);
                if (all !== y.dung) L('Ý ' + (i + 1) + ' ghi ' + (y.dung ? 'ĐÚNG' : 'SAI') + ' nhưng máy tính ra ' + (all ? 'ĐÚNG' : 'SAI') + ': ' + ex[0]); }
            }
          }
        });
        break;
      }
      case 'dien': {
        const n = q.dapAn != null ? parseOk(String(q.dapAn), 'dapAn') : null;
        if (!n) { L('Thiếu dapAn'); break; }
        if (PS.parseAnswer(q.dapAn) === null) L('dapAn phải là một số (ví dụ -3/4, 0,5, 2): ' + q.dapAn);
        if (PS.literalReduced(n) === false) L('Đáp án chưa tối giản: ' + q.dapAn);
        dapAnSo = PS.parseAnswer(q.dapAn);
        if (ktNode) { tuDong = true; if (matchKiemTra(n) !== true) L('Đáp án ' + q.dapAn + ' KHÔNG khớp với kiemTra "' + kt + '"'); }
        break;
      }
      case 'sap-xep': {
        const v = (q.so || []).map(x => PS.valueOf(x));
        if (v.length < 3) L('Cần ít nhất 3 số');
        v.forEach((x, i) => { if (!x) L('Không tính được số thứ ' + (i + 1) + ': ' + q.so[i]); });
        for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (v[i] && v[j] && v[i].eq(v[j])) L('Hai số bằng nhau: ' + q.so[i] + ' và ' + q.so[j]);
        if (!['tang', 'giam'].includes(q.chieu)) L('chieu phải là "tang" hoặc "giam"');
        tuDong = true;
        break;
      }
      case 'truc-so': {
        const d = PS.valueOf(q.diem), a = PS.valueOf(q.tu), b = PS.valueOf(q.den), st = PS.valueOf(q.buoc);
        if (!d || !a || !b || !st) { L('diem, tu, den, buoc phải là số'); break; }
        if (st.sign() <= 0 || a.cmp(b) >= 0) { L('Cần tu < den và buoc > 0'); break; }
        const cnt = b.sub(a).div(st); if (!cnt.isInt() || cnt.n > 24) L('Khoảng (den − tu) phải chia hết cho buoc và có tối đa 24 vạch');
        if (d.cmp(a) < 0 || d.cmp(b) > 0) L('Điểm nằm ngoài trục số');
        if (!d.sub(a).div(st).isInt()) L('Điểm không nằm đúng trên vạch chia');
        if (ktNode) { tuDong = true; if (!sameValues(evalAll(ktNode), [d])) L('diem không khớp kiemTra'); }
        dapAnSo = d;
        break;
      }
      case 'ghep': {
        const cap = q.cap || [];
        if (cap.length < 3) L('Cần ít nhất 3 cặp');
        const pv = cap.map(c => PS.valueOf(c.phai));
        for (let i = 0; i < cap.length; i++) for (let j = i + 1; j < cap.length; j++)
          if (pv[i] && pv[j] ? pv[i].eq(pv[j]) : cap[i].phai === cap[j].phai) L('Hai vế phải trùng nhau: ' + cap[i].phai);
        cap.forEach((c, i) => {
          const ex = exprsIn(c.trai); if (ex.length !== 1 || !pv[i]) return;
          const n = PS.tryParse(ex[0]); if (!n) return;
          let ok;
          try {
            if (q.quanHe === 'nghiem') { const vs = varsOf(n); ok = vs.length === 1 && PS.evaluate(n, { [vs[0]]: pv[i] }) === true; }
            else { const v = PS.evaluate(n);
              ok = q.quanHe === 'doi' ? v.neg().eq(pv[i]) : q.quanHe === 'nghich-dao' ? v.inv().eq(pv[i]) : v.eq(pv[i]); }
          } catch (e) { ok = false; }
          tuDong = true;
          if (!ok) L('Cặp ' + (i + 1) + ' sai: ' + c.trai + ' ↔ ' + c.phai);
        });
        break;
      }
      case 'bat-loi': {
        const chain = [q.dau].concat(q.buoc || []).map(x => parseOk(String(x), 'Bước'));
        if (!q.buoc || q.buoc.length < 2) L('Cần ít nhất 2 bước');
        if (!(q.buocSai >= 1 && q.buocSai <= (q.buoc || []).length)) { L('buocSai không hợp lệ'); break; }
        if (chain.some(x => !x)) break;
        const isEq = chain.every(isChain);
        const val = n => isEq ? PS.solveX(n) : (() => { try { return PS.evaluate(n); } catch (e) { return null; } })();
        const vals = chain.map(val);
        if (vals.some(v => !v)) { W('Không tính được giá trị mọi bước để kiểm tra'); break; }
        tuDong = true;
        const breaks = [];
        for (let i = 1; i < vals.length; i++) if (!vals[i].eq(vals[i - 1])) breaks.push(i);
        if (breaks.length !== 1 || breaks[0] !== q.buocSai) L('Bước sai thực tế là [' + breaks.join(', ') + '] nhưng buocSai = ' + q.buocSai);
        dapAnSo = vals[0];
        break;
      }
      case 'thu-tu-buoc': {
        if (!q.buoc || q.buoc.length < 3) L('Cần ít nhất 3 bước');
        if (new Set(q.buoc).size !== (q.buoc || []).length) L('Có hai bước giống hệt nhau');
        const eqs = (q.buoc || []).map(b => exprsIn(b)).filter(e => e.length === 1).map(e => PS.tryParse(e[0]));
        if (eqs.length === q.buoc.length && eqs.every(n => n && isChain(n) && varsOf(n).includes('x'))) {
          const r = eqs.map(PS.solveX); tuDong = true;
          if (r.some(v => !v) || r.some(v => !v.eq(r[0]))) L('Các bước tìm x không cùng nghiệm');
          else dapAnSo = r[0];
        }
        break;
      }
    }

    /* --- mọi đẳng thức/bất đẳng thức trong lời giải (và bước) phải ĐÚNG --- */
    const doCheck = [].concat(q.loiGiai || [], q.loai === 'thu-tu-buoc' ? q.buoc : []);
    doCheck.forEach(t => exprsIn(t).forEach(e => {
      const n = PS.tryParse(e); if (!n || !isChain(n)) return;
      const vs = varsOf(n);
      try {
        if (!vs.length) { if (PS.evaluate(n) !== true) L('Lời giải có đẳng thức SAI: ' + e); return; }
        if (vs.length === 1 && dapAnSo) { if (PS.evaluate(n, { [vs[0]]: dapAnSo }) !== true) L('Lời giải không khớp đáp án ' + dapAnSo.toText() + ': ' + e); return; }
        if (vs.length >= 1 && !dapAnSo) {
          const r = evalAll(n);
          if (r && /=/.test(n.ops.join('')) && n.ops.every(o => o === '=') && r.some(x => x === false) && vs.some(v => v !== 'x' && v !== 'n')) L('Đồng nhất thức trong lời giải SAI: ' + e);
        }
      } catch (err) { if (!vs.length) L('Không tính được: ' + e + ' (' + err.message + ')'); }
    }));

    if (!tuDong && q.loai !== 'thu-tu-buoc') W('Câu khái niệm/chữ: máy không tự tính được, cần thầy cô soát tay');
    return { loi, canh, tuDong };
  }

  /** Kiểm tra toàn bộ ngân hàng + chạy thử mỗi mẫu sinh ngẫu nhiên nhiều lần */
  function kiemTraTatCa(soLanSinh) {
    soLanSinh = soLanSinh || 200;
    const ids = new Set(), bank = root.CAU_HOI || [], kq = [];
    bank.forEach(q => kq.push({ q, ...kiemTraCau(q, ids) }));
    const thongKe = { tong: bank.length, theoVung: {}, theoLoai: {}, theoMuc: {} };
    bank.forEach(q => {
      thongKe.theoVung[q.vung] = (thongKe.theoVung[q.vung] || 0) + 1;
      const k = q.vung + '|' + q.loai; thongKe.theoLoai[k] = (thongKe.theoLoai[k] || 0) + 1;
      const m = q.vung + '|' + q.muc; thongKe.theoMuc[m] = (thongKe.theoMuc[m] || 0) + 1;
    });
    const sinh = [];
    if (root.SINH_CAU_HOI) {
      for (const ten of root.SINH_CAU_HOI.danhSach) {
        let soLoi = 0, mau = null; const tong = soLanSinh * 3;
        for (let m = 1; m <= 3; m++) for (let i = 0; i < soLanSinh; i++) {
          let q;
          try { q = root.SINH_CAU_HOI.sinh(5, m, i % 4 === 0, ten); }
          catch (e) { soLoi++; mau = mau || { loi: ['Mẫu bị lỗi khi sinh: ' + e.message] }; continue; }
          const r = kiemTraCau(q);
          if (r.loi.length) { soLoi++; mau = mau || { q, loi: r.loi }; }
        }
        sinh.push({ ten, tong, soLoi, mau });
      }
    }
    return { kq, thongKe, sinh };
  }

  root.KiemTra = { kiemTraCau, kiemTraTatCa };
})(typeof window !== 'undefined' ? window : globalThis);
