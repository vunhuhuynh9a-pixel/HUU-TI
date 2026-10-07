/* =====================================================================
   sinh-cau-hoi.js — Câu hỏi SINH NGẪU NHIÊN theo mẫu.
   Mỗi lần chơi, số trong đề thay đổi; đáp án do chương trình tính bằng phân số
   chính xác (tối giản). Các phương án nhiễu lấy từ lỗi sai điển hình.
   Câu sinh ra có cùng định dạng với ngân hàng câu hỏi (cau-hoi.js).
   ===================================================================== */
(function (root) {
  'use strict';
  const { Frac } = root.PhanSo;
  const F = (n, d) => new Frac(n, d || 1);

  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const nz = (a, b) => { let v; do v = rint(a, b); while (v === 0); return v; };
  /** phân số ngẫu nhiên (khác 0), mẫu thuộc dens, |tử| ≤ maxN, chưa chắc tối giản → tự rút gọn */
  function rfrac(dens, maxN, allowInt) {
    for (;;) {
      const d = pick(dens), n = nz(-maxN, maxN), f = F(n, d);
      if (allowInt || f.d !== 1) return f;
    }
  }
  const s = f => f.toString();                    // "-3/4"
  const p = f => (f.n < 0 ? '(' + s(f) + ')' : s(f)); // đặt số âm trong ngoặc
  const dec = f => f.toDecimalText().replace('−', '-');

  /** Tạo 4 phương án: đáp án + nhiễu (khác giá trị), đáp án ở vị trí A (game sẽ xáo trộn) */
  function options(ans, cands) {
    const out = [ans], has = v => out.some(o => o.eq(v));
    for (const c of cands) { if (out.length >= 4) break; try { if (c && !has(c)) out.push(c); } catch (e) {} }
    const extra = [ans.neg(), ans.add(F(1)), ans.sub(F(1)), ans.mul(F(2)), ans.add(F(1, ans.d === 1 ? 2 : ans.d))];
    for (const c of extra) { if (out.length >= 4) break; if (!has(c)) out.push(c); }
    return out.map(s);
  }

  let counter = 0;
  const id = g => 'G-' + g + '-' + Date.now().toString(36) + (counter++).toString(36);
  const DENS = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 8, 9, 10], 3: [3, 4, 6, 7, 8, 9, 10, 12, 15] };
  const MAXN = { 1: 5, 2: 9, 3: 13 };

  /* -------------------- CÁC MẪU -------------------- */
  const MAU = {

    'so-doi': { vung: 1, dang: 'so-doi', tao(m, nhanh) {
      const f = m === 3 && Math.random() < .5 ? F(nz(-99, 99), 100) : rfrac(DENS[m], MAXN[m]);
      const shown = f.toDecimalText() && m === 3 ? dec(f) : s(f);
      const ans = f.neg();
      const base = { de: 'Số đối của {{' + shown + '}} là', kiemTra: '-(' + shown + ')',
        loiGiai: ['Số đối của $a$ là $-a$: đổi dấu số đó.', '{{-(' + shown + ') = ' + s(ans) + '}}'],
        loiSai: 'Nhầm số đối với số nghịch đảo.' };
      if (nhanh || Math.random() < .5) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [f, f.inv(), f.inv().neg()]), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: s(ans) };
    } },

    'so-sanh': { vung: 1, dang: 'so-sanh', tao(m) {
      let a, b;
      do { a = rfrac(DENS[m], MAXN[m]); b = rfrac(DENS[m], MAXN[m]); } while (m < 3 && a.eq(b));
      let sa = s(a), sb = s(b);
      if (m === 3 && Math.random() < .3) { b = a; const k = rint(2, 3); sb = (b.n < 0 ? '-' : '') + (Math.abs(b.n) * k) + '/' + (b.d * k); }
      return { loai: 'trac-nghiem', de: 'So sánh {{' + sa + '}} và {{' + sb + '}}.',
        phuongAn: ['{{' + sa + ' < ' + sb + '}}', '{{' + sa + ' > ' + sb + '}}', '{{' + sa + ' = ' + sb + '}}'],
        dapAn: 'ABC'[a.cmp(b) < 0 ? 0 : a.cmp(b) > 0 ? 1 : 2], giuThuTu: true,
        loiGiai: ['Quy đồng về cùng mẫu dương rồi so sánh tử số.',
          '{{' + sa + ' ' + (a.cmp(b) < 0 ? '<' : a.cmp(b) > 0 ? '>' : '=') + ' ' + sb + '}}'],
        loiSai: 'Với hai số âm, số nào có giá trị tuyệt đối lớn hơn thì nhỏ hơn.' };
    } },

    'truc-so': { vung: 1, dang: 'truc-so', tao(m) {
      const den = pick({ 1: [2], 2: [2, 3, 4], 3: [3, 4, 5] }[m]);
      const lo = rint(-2, 0), span = den >= 4 ? 3 : 4, n = rint(lo * den + 1, (lo + span) * den - 1);
      const f = F(n, den);
      if (f.d === 1) return MAU['truc-so'].tao(m);
      return { loai: 'truc-so', de: 'Đặt điểm biểu diễn số {{' + s(f) + '}} trên trục số.',
        diem: s(f), tu: String(lo), den: String(lo + span), buoc: '1/' + den, kiemTra: s(f),
        loiGiai: ['Chia mỗi đoạn đơn vị thành ' + den + ' phần bằng nhau, mỗi phần là {{1/' + den + '}}.',
          f.n < 0 ? 'Số âm nằm bên trái điểm 0.' : 'Số dương nằm bên phải điểm 0.'] };
    } },

    'sap-xep': { vung: 1, dang: 'so-sanh', tao(m) {
      const k = m === 3 ? 5 : 4, vals = [];
      while (vals.length < k) { const f = rfrac(DENS[m], MAXN[m], true); if (!vals.some(v => v.eq(f))) vals.push(f); }
      const so = vals.map(f => (m >= 2 && f.toDecimalText() && Math.random() < .35) ? dec(f) : s(f));
      const chieu = Math.random() < .5 ? 'tang' : 'giam';
      const sorted = vals.slice().sort((x, y) => chieu === 'tang' ? x.cmp(y) : y.cmp(x));
      return { loai: 'sap-xep', de: 'Sắp xếp các số theo thứ tự **' + (chieu === 'tang' ? 'tăng' : 'giảm') + ' dần**.', so, chieu,
        loiGiai: ['Số âm < 0 < số dương. Các số cùng dấu: quy đồng rồi so sánh tử.',
          '{{' + sorted.map(s).join(chieu === 'tang' ? ' < ' : ' > ') + '}}'] };
    } },

    'cong-tru': { vung: 2, dang: 'cong-tru', tao(m, nhanh) {
      const a = rfrac(DENS[m], MAXN[m]), b = rfrac(DENS[m], MAXN[m]);
      const op = Math.random() < .5 ? '+' : '-', ans = op === '+' ? a.add(b) : a.sub(b);
      const e = s(a) + ' ' + op + ' ' + p(b);
      const wrong = (() => { try { return op === '+' ? F(a.n + b.n, a.d + b.d) : F(a.n - b.n, a.d - b.d); } catch (x) { return null; } })();
      const base = { de: 'Tính {{' + e + '}}', kiemTra: '@de',
        loiGiai: ['Quy đồng mẫu số rồi ' + (op === '+' ? 'cộng' : 'trừ') + ' tử số.', '{{' + e + ' = ' + s(ans) + '}}'],
        loiSai: 'Không được ' + (op === '+' ? 'cộng' : 'trừ') + ' tử với tử, mẫu với mẫu; phải quy đồng trước.' };
      if (nhanh || Math.random() < .5) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [wrong, op === '+' ? a.sub(b) : a.add(b), ans.neg()]), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: s(ans) };
    } },

    'nhan-chia': { vung: 2, dang: 'nhan-chia', tao(m, nhanh) {
      const a = rfrac(DENS[m], MAXN[m]), b = rfrac(DENS[m], MAXN[m]);
      const op = Math.random() < .5 ? '*' : ':', ans = op === '*' ? a.mul(b) : a.div(b);
      const e = s(a) + ' ' + op + ' ' + p(b);
      const base = { de: 'Tính {{' + e + '}}', kiemTra: '@de',
        loiGiai: op === '*' ? ['Nhân tử với tử, mẫu với mẫu, rồi rút gọn.', '{{' + e + ' = ' + s(ans) + '}}']
                            : ['Chia cho {{' + s(b) + '}} là nhân với số nghịch đảo {{' + s(b.inv()) + '}}.', '{{' + e + ' = ' + s(a) + ' * ' + p(b.inv()) + ' = ' + s(ans) + '}}'],
        loiSai: op === ':' ? 'Quên lấy số nghịch đảo của số chia.' : 'Nhầm dấu: âm nhân âm ra dương, âm nhân dương ra âm.' };
      if (nhanh || Math.random() < .5) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [op === '*' ? a.div(b) : a.mul(b), ans.neg(), ans.inv()]), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: s(ans) };
    } },

    'thap-phan': { vung: 2, dang: 'nhan-chia', tao(m, nhanh) {
      const a = F(nz(-30, 30), 10), b = F(nz(m === 1 ? 2 : -25, 25), m === 1 ? 1 : 10);
      const op = pick(m === 1 ? ['+', '-', '*'] : ['+', '-', '*', '*']);
      const ans = op === '+' ? a.add(b) : op === '-' ? a.sub(b) : a.mul(b);
      const da = dec(a), db = dec(b), e = (a.n < 0 ? '(' + da + ')' : da) + ' ' + op + ' ' + (b.n < 0 ? '(' + db + ')' : db);
      const base = { de: 'Tính {{' + e + '}}', kiemTra: '@de', loiGiai: ['{{' + e + ' = ' + dec(ans) + '}}'],
        loiSai: 'Đặt sai dấu phẩy hoặc nhầm dấu của kết quả.' };
      if (nhanh || Math.random() < .4) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [ans.neg(), ans.mul(F(10)), ans.div(F(10))]).map(x => dec(root.PhanSo.valueOf(x))), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: dec(ans) };
    } },

    'nhiet-do': { vung: 2, dang: 'thuc-te', tao(m) {
      const t0 = F(nz(-80, 20), 10), d = F(rint(5, 90), 10), up = Math.random() < .5;
      const ans = up ? t0.add(d) : t0.sub(d);
      return { loai: 'dien', de: 'Nhiệt độ lúc sáng sớm là {{' + dec(t0) + '}} °C. Đến trưa nhiệt độ ' + (up ? 'tăng' : 'giảm') + ' {{' + dec(d) + '}} °C. Nhiệt độ buổi trưa là bao nhiêu?',
        dapAn: dec(ans), donVi: '°C', kiemTra: dec(t0) + (up ? ' + ' : ' - ') + dec(d),
        loiGiai: [(up ? 'Tăng thì cộng: ' : 'Giảm thì trừ: ') + '{{' + dec(t0) + (up ? ' + ' : ' - ') + dec(d) + ' = ' + dec(ans) + '}} (°C).'] };
    } },

    'luy-thua': { vung: 3, dang: 'luy-thua', tao(m, nhanh) {
      const b = pick({ 1: [F(-1, 2), F(1, 2), F(-2), F(2, 3), F(-1, 3)], 2: [F(-2, 3), F(3, 2), F(-3, 4), F(-1, 2), F(2, 5)], 3: [F(-3, 2), F(-2, 5), F(4, 3), F(-5, 3), F(-3, 4)] }[m]);
      const n = rint(2, m === 3 ? 4 : 3), ans = b.pow(n), e = '(' + s(b) + ')^' + n;
      const base = { de: 'Tính {{' + e + '}}', kiemTra: '@de',
        loiGiai: ['{{' + e + ' = (' + b.n + ')^' + n + '/' + b.d + '^' + n + ' = ' + s(ans) + '}}', b.n < 0 ? (n % 2 ? 'Bậc lẻ của số âm là số âm.' : 'Bậc chẵn của số âm là số dương.') : 'Luỹ thừa của số dương là số dương.'],
        loiSai: 'Nhân cơ số với số mũ, hoặc sai dấu của kết quả.' };
      if (nhanh || Math.random() < .5) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [ans.neg(), b.mul(F(n)), F(b.n * n, b.d)]), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: s(ans) };
    } },

    'cung-co-so': { vung: 3, dang: 'lt-cung-co-so', tao(m) {
      const b = pick([F(2, 3), F(-1, 2), F(3, 5), F(-3, 4), F(5, 2), F(-2, 7)]);
      const x = rint(3, 9), y = rint(2, x - 1), mul = Math.random() < .5;
      const bs = '(' + s(b) + ')', e = bs + '^' + x + (mul ? ' * ' : ' : ') + bs + '^' + y;
      const r = mul ? x + y : x - y, w1 = mul ? x * y : x + y, w2 = mul ? x - y : x * y;
      const opts = [r, w1, w2, mul ? x + y + 1 : Math.max(1, x - y - 1)].filter((v, i, a) => a.indexOf(v) === i && v > 0);
      for (let k = r + 1; opts.length < 4; k++) if (!opts.includes(k)) opts.push(k);
      return { loai: 'trac-nghiem', de: 'Viết {{' + e + '}} dưới dạng một luỹ thừa.',
        phuongAn: opts.slice(0, 4).map(k => bs + '^' + k), dapAn: 'A', kiemTra: '@de',
        loiGiai: [mul ? 'Nhân hai luỹ thừa cùng cơ số: giữ cơ số, **cộng** số mũ.' : 'Chia hai luỹ thừa cùng cơ số: giữ cơ số, **trừ** số mũ.', '{{' + e + ' = ' + bs + '^' + r + '}}'],
        loiSai: mul ? 'Nhân hai số mũ với nhau.' : 'Chia hai số mũ cho nhau hoặc cộng số mũ.' };
    } },

    'lt-cua-lt': { vung: 3, dang: 'lt-cua-lt', tao() {
      const b = pick([F(1, 2), F(-2, 3), F(3, 4), F(-1, 3), F(2, 5)]);
      const x = rint(2, 4), y = rint(2, 3), bs = '(' + s(b) + ')';
      const opts = [x * y, x + y, x * y + 1, Math.abs(x - y) + 1].filter((v, i, a) => a.indexOf(v) === i);
      for (let k = x * y + 2; opts.length < 4; k++) if (!opts.includes(k)) opts.push(k);
      return { loai: 'trac-nghiem', de: 'Viết {{[' + bs + '^' + x + ']^' + y + '}} dưới dạng một luỹ thừa.',
        phuongAn: opts.slice(0, 4).map(k => bs + '^' + k), dapAn: 'A', kiemTra: '@de',
        loiGiai: ['Luỹ thừa của luỹ thừa: giữ cơ số, **nhân** số mũ.', '{{[' + bs + '^' + x + ']^' + y + ' = ' + bs + '^' + (x * y) + '}}'],
        loiSai: 'Cộng hai số mũ thay vì nhân.' };
    } },

    'chuyen-ve': { vung: 4, dang: 'chuyen-ve', tao(m, nhanh) {
      const a = rfrac(DENS[m], MAXN[m]), c = rfrac(DENS[m], MAXN[m]);
      let eq, ans, steps;
      const kind = m === 1 ? rint(0, 1) : m === 2 ? rint(0, 2) : rint(1, 3);
      if (kind === 0) { eq = 'x + ' + p(a) + ' = ' + s(c); ans = c.sub(a); steps = ['x = ' + s(c) + ' - ' + p(a)]; }
      else if (kind === 1) { eq = 'x - ' + p(a) + ' = ' + s(c); ans = c.add(a); steps = ['x = ' + s(c) + ' + ' + p(a)]; }
      else if (kind === 2) { eq = s(a) + ' - x = ' + s(c); ans = a.sub(c); steps = ['x = ' + s(a) + ' - ' + p(c)]; }
      else { const k = F(nz(-5, 5), pick([1, 2, 3])); const kx = k.d === 1 ? (k.n === 1 ? 'x' : k.n === -1 ? '-x' : k.n + 'x') : s(k) + 'x'; eq = kx + ' + ' + p(a) + ' = ' + s(c); ans = c.sub(a).div(k); steps = [kx + ' = ' + s(c) + ' - ' + p(a)]; }
      steps.push('x = ' + s(ans));
      const base = { de: 'Tìm $x$, biết {{' + eq + '}}.', kiemTra: '@de',
        loiGiai: ['Chuyển vế và đổi dấu số hạng.'].concat(steps.map(t => '{{' + t + '}}')),
        loiSai: 'Chuyển vế mà quên đổi dấu.' };
      if (nhanh) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [kind === 0 ? c.add(a) : kind === 1 ? c.sub(a) : a.add(c), ans.neg()]), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: s(ans) };
    } },

    'thu-tu': { vung: 4, dang: 'thu-tu', tao(m, nhanh) {
      const a = rfrac(DENS[m], MAXN[m]), b = rfrac(DENS[m], MAXN[m]), c = F(nz(-6, 6), pick([1, 1, 2, 3]));
      const op = Math.random() < .5 ? '*' : ':';
      const e = s(a) + ' + ' + p(b) + ' ' + op + ' ' + p(c);
      const mid = op === '*' ? b.mul(c) : b.div(c), ans = a.add(mid);
      const wrong = op === '*' ? a.add(b).mul(c) : a.add(b).div(c);
      const base = { de: 'Tính {{' + e + '}}', kiemTra: '@de',
        loiGiai: [(op === '*' ? 'Nhân' : 'Chia') + ' trước: {{' + p(b) + ' ' + op + ' ' + p(c) + ' = ' + s(mid) + '}}', '{{' + s(a) + ' + ' + p(mid) + ' = ' + s(ans) + '}}'],
        loiSai: 'Làm phép cộng trước rồi mới ' + (op === '*' ? 'nhân' : 'chia') + '.' };
      if (nhanh || Math.random() < .5) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [wrong, ans.neg()]), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: s(ans) };
    } },

    'dau-ngoac': { vung: 4, dang: 'dau-ngoac', tao(m, nhanh) {
      const a = rfrac(DENS[m], MAXN[m], true), b = rfrac(DENS[m], MAXN[m]), c = rfrac(DENS[m], MAXN[m]);
      const e = s(a) + ' - (' + s(b) + ' - ' + p(c) + ')', ans = a.sub(b.sub(c)), wrong = a.sub(b).sub(c);
      const base = { de: 'Tính {{' + e + '}}', kiemTra: '@de',
        loiGiai: ['Bỏ ngoặc có dấu “−” đằng trước: đổi dấu mọi số hạng trong ngoặc.', '{{' + e + ' = ' + s(a) + ' - ' + p(b) + ' + ' + p(c) + ' = ' + s(ans) + '}}'],
        loiSai: 'Bỏ ngoặc mà quên đổi dấu số hạng thứ hai trong ngoặc.' };
      if (nhanh || Math.random() < .5) return { loai: 'trac-nghiem', ...base, phuongAn: options(ans, [wrong, ans.neg()]), dapAn: 'A' };
      return { loai: 'dien', ...base, dapAn: s(ans) };
    } }
  };

  function frac2(str) { const f = root.PhanSo.valueOf(str); return [f.n, f.d]; }

  /** Sinh một câu. vung: 1..5 (5 = trộn tất cả), muc 1..3, nhanh = chỉ trắc nghiệm (dùng cho Đấu trí) */
  function sinh(vung, muc, nhanh, tenMau) {
    const ds = Object.keys(MAU).filter(k => tenMau ? k === tenMau : (vung === 5 || MAU[k].vung === vung));
    const ten = pick(ds), mau = MAU[ten];
    let q = mau.tao(muc, nhanh);
    if (nhanh && q.loai !== 'trac-nghiem') q = mau.tao(muc, true);
    return Object.assign({ id: id(ten), vung: mau.vung, dang: mau.dang, muc, sinh: ten }, q);
  }

  root.SINH_CAU_HOI = { sinh, MAU, danhSach: Object.keys(MAU) };
})(typeof window !== 'undefined' ? window : globalThis);
