/* =====================================================================
   thu-thach.js — Engine hiển thị và chấm 8 dạng thử thách.
   ThuThach.ve(khung, cauHoi, { onXong(ketQua) }) → bộ điều khiển
     ketQua = { dung: true/false, dapAnHTML: '...' }
     bộ điều khiển: nam() (50:50), loaiBo() (loại 1 phương án sai), coTheNam(), coTheLoaiBo()
   ===================================================================== */
(function (root) {
  'use strict';
  const PS = root.PhanSo, H = root.HienThi, A = root.AmThanh, CT = root.COT_TRUYEN;
  const $ = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const shuffleNot = (a, same) => { let s, k = 0; do s = shuffle(a); while (k++ < 20 && same(s)); return s; };
  const LETTERS = 'ABCD';

  /* ----- kéo thả sắp xếp (chuột + cảm ứng) kèm nút lên/xuống ----- */
  function sortable(list, onMove) {
    let drag = null, startY = 0;
    list.addEventListener('pointerdown', e => {
      const li = e.target.closest('li'); if (!li || list.classList.contains('khoa') || e.target.closest('button')) return;
      drag = li; startY = e.clientY; li.classList.add('dang-keo'); li.setPointerCapture(e.pointerId); A.phat('chon');
    });
    list.addEventListener('pointermove', e => {
      if (!drag) return;
      e.preventDefault();
      drag.style.transform = 'translateY(' + (e.clientY - startY) + 'px)';
      for (const s of list.children) {
        if (s === drag) continue;
        const r = s.getBoundingClientRect(), mid = r.top + r.height / 2;
        const before = drag.offsetTop;
        if (e.clientY > mid && e.clientY < r.bottom && s.compareDocumentPosition(drag) & Node.DOCUMENT_POSITION_PRECEDING) { list.insertBefore(drag, s.nextSibling); }
        else if (e.clientY < mid && e.clientY > r.top && s.compareDocumentPosition(drag) & Node.DOCUMENT_POSITION_FOLLOWING) { list.insertBefore(drag, s); }
        else continue;
        startY += drag.offsetTop - before; drag.style.transform = 'translateY(' + (e.clientY - startY) + 'px)'; A.phat('tha'); onMove && onMove(); break;
      }
    });
    const end = () => { if (!drag) return; drag.style.transform = ''; drag.classList.remove('dang-keo'); drag = null; };
    list.addEventListener('pointerup', end); list.addEventListener('pointercancel', end);
    list.addEventListener('click', e => {
      const b = e.target.closest('button[data-dir]'); if (!b || list.classList.contains('khoa')) return;
      const li = b.closest('li');
      if (b.dataset.dir === 'len' && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      if (b.dataset.dir === 'xuong' && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
      A.phat('tha'); onMove && onMove();
    });
  }
  const sortItem = (html, key) => {
    const li = $('li', 'keo-muc'); li.dataset.k = key;
    li.innerHTML = '<span class="tay" aria-hidden="true">⠿</span><span class="nd">' + html + '</span>' +
      '<span class="mui"><button type="button" data-dir="len" aria-label="Chuyển lên">▲</button><button type="button" data-dir="xuong" aria-label="Chuyển xuống">▼</button></span>';
    return li;
  };

  function ve(khung, q, opts) {
    opts = opts || {};
    khung.innerHTML = '';
    const wrap = $('div', 'tt tt-' + q.loai);
    wrap.appendChild($('div', 'tt-nhan', '<span>' + (CT.LOAI[q.loai] || '') + '</span><span class="muc muc-' + q.muc + '">' + CT.MUC[q.muc] + '</span>'));
    wrap.appendChild($('div', 'tt-de', H.text(q.de)));
    const vung = $('div', 'tt-vung'); wrap.appendChild(vung);
    const nut = $('div', 'tt-nut'); wrap.appendChild(nut);
    const thongBao = $('div', 'tt-thong-bao'); thongBao.setAttribute('role', 'status'); wrap.appendChild(thongBao);
    khung.appendChild(wrap);

    let xong = false;
    const ctrl = { coTheNam: () => false, coTheLoaiBo: () => false, nam() {}, loaiBo() {}, get xong() { return xong; } };
    function ketThuc(dung, dapAnHTML) {
      if (xong) return; xong = true;
      wrap.classList.add('da-xong', dung ? 'ket-dung' : 'ket-sai');
      nut.innerHTML = '';
      opts.onXong && opts.onXong({ dung, dapAnHTML });
    }
    function nutKiemTra(label, onClick, enabled) {
      const b = $('button', 'nut nut-chinh', label || 'Kiểm tra'); b.type = 'button';
      b.disabled = enabled === false; b.onclick = () => { A.phat('bam'); onClick(); };
      nut.appendChild(b); return b;
    }
    const bao = (msg) => { thongBao.innerHTML = msg; thongBao.classList.remove('rung'); void thongBao.offsetWidth; thongBao.classList.add('rung'); };

    switch (q.loai) {

      /* ---------------- TRẮC NGHIỆM ---------------- */
      case 'trac-nghiem': {
        const ci = LETTERS.indexOf(String(q.dapAn).toUpperCase());
        const order = q.giuThuTu ? q.phuongAn.map((_, i) => i) : shuffle(q.phuongAn.map((_, i) => i));
        const grid = $('div', 'pa-luoi' + (q.phuongAn.some(p => p.length > 28) ? ' pa-doc' : ''));
        const btns = order.map((oi, k) => {
          const b = $('button', 'pa', '<span class="chu">' + LETTERS[k] + '</span><span class="nd">' + H.value(q.phuongAn[oi]) + '</span>');
          b.type = 'button'; b.dataset.oi = oi;
          b.onclick = () => {
            if (xong) return;
            btns.forEach(x => x.disabled = true);
            const dung = oi === ci;
            b.classList.add(dung ? 'pa-dung' : 'pa-sai');
            btns.forEach(x => { if (+x.dataset.oi === ci) x.classList.add('pa-dung'); });
            ketThuc(dung, H.value(q.phuongAn[ci]));
          };
          grid.appendChild(b); return b;
        });
        vung.appendChild(grid);
        const wrongVisible = () => btns.filter(b => +b.dataset.oi !== ci && !b.classList.contains('an'));
        ctrl.coTheNam = () => !xong && q.phuongAn.length === 4 && wrongVisible().length === 3;
        ctrl.nam = () => { shuffle(wrongVisible()).slice(0, 2).forEach(b => { b.classList.add('an'); b.disabled = true; }); };
        ctrl.coTheLoaiBo = () => !xong && wrongVisible().length >= 2;
        ctrl.loaiBo = () => { const w = shuffle(wrongVisible())[0]; if (w) { w.classList.add('an'); w.disabled = true; } };
        ctrl.phimTat = k => { const b = btns[k]; if (b && !b.disabled) b.click(); };
        break;
      }

      /* ---------------- ĐÚNG / SAI ---------------- */
      case 'dung-sai': {
        const chon = q.y.map(() => null);
        const rows = q.y.map((y, i) => {
          const r = $('div', 'ds-hang', '<div class="nd">' + H.text(y.nd) + '</div><div class="ds-nut"><button type="button" data-v="1">Đúng</button><button type="button" data-v="0">Sai</button></div>');
          r.querySelectorAll('button').forEach(b => b.onclick = () => {
            if (xong || r.classList.contains('khoa')) return;
            chon[i] = b.dataset.v === '1'; A.phat('chon');
            r.querySelectorAll('button').forEach(x => x.classList.toggle('bat', x === b));
            kt.disabled = chon.some(c => c === null);
          });
          vung.appendChild(r); return r;
        });
        const kt = nutKiemTra('Kiểm tra', () => {
          let all = true;
          rows.forEach((r, i) => { const ok = chon[i] === q.y[i].dung; all = all && ok; r.classList.add(ok ? 'hang-dung' : 'hang-sai');
            r.querySelector('.ds-nut').insertAdjacentHTML('beforeend', '<span class="dap">' + (q.y[i].dung ? 'Đ' : 'S') + '</span>'); });
          ketThuc(all, q.y.map(y => H.text(y.nd) + ' → <b>' + (y.dung ? 'Đúng' : 'Sai') + '</b>').join('<br>'));
        }, false);
        const conMo = () => rows.map((r, i) => i).filter(i => !rows[i].classList.contains('khoa'));
        ctrl.coTheLoaiBo = () => !xong && conMo().length > 1;
        ctrl.loaiBo = () => {
          const i = shuffle(conMo())[0]; const r = rows[i];
          chon[i] = q.y[i].dung; r.classList.add('khoa');
          r.querySelectorAll('button').forEach(x => x.classList.toggle('bat', (x.dataset.v === '1') === q.y[i].dung));
          kt.disabled = chon.some(c => c === null);
        };
        break;
      }

      /* ---------------- ĐIỀN ĐÁP SỐ ---------------- */
      case 'dien': {
        const target = PS.parseAnswer(q.dapAn);
        const o = $('div', 'dien-o');
        o.innerHTML = '<label class="an-chu" for="o-dien">Đáp số</label><input id="o-dien" class="dien-input" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ví dụ: -3/4 hoặc 0,5">' + (q.donVi ? '<span class="don-vi">' + H.esc(q.donVi) + '</span>' : '');
        vung.appendChild(o);
        const xem = $('div', 'dien-xem'); vung.appendChild(xem);
        const phim = $('div', 'dien-phim');
        [['−', '-'], ['/', '/'], [',', ','], ['⌫', 'del']].forEach(([lbl, v]) => {
          const b = $('button', 'phim', lbl); b.type = 'button';
          b.onclick = () => { A.phat('chon'); if (v === 'del') inp.value = inp.value.slice(0, -1); else inp.value += v; inp.dispatchEvent(new Event('input')); inp.focus(); };
          phim.appendChild(b);
        });
        vung.appendChild(phim);
        const inp = o.querySelector('input');
        inp.addEventListener('input', () => {
          const v = PS.parseAnswer(inp.value);
          const raw = inp.value.trim().replace(/[−–]/g, '-').replace(/\s+/g, '');
          xem.innerHTML = v ? 'Em viết: ' + H.expr(raw.replace(/^x=/i, '')) : '';
          kt.disabled = !inp.value.trim();
        });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !kt.disabled) kt.click(); });
        const kt = nutKiemTra('Kiểm tra', () => {
          const v = PS.parseAnswer(inp.value);
          if (!v) { A.phat('sai'); bao('Chưa đọc được số em nhập. Hãy viết như <b>-3/4</b>, <b>0,5</b> hoặc <b>2</b>.'); return; }
          const raw = inp.value.trim().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/^x=/i, '');
          if (q.yeuCau === 'toi-gian' && v.eq(target)) {
            const n = PS.tryParse(raw);
            if (!n || PS.literalReduced(n) !== true || /[.,]/.test(raw) || !raw.includes('/')) { A.phat('sai'); bao('Đúng giá trị rồi, nhưng đề yêu cầu viết dưới dạng <b>phân số tối giản</b>. Sửa lại nhé!'); return; }
          }
          inp.disabled = true; phim.querySelectorAll('button').forEach(b => b.disabled = true);
          const dung = v.eq(target);
          o.classList.add(dung ? 'o-dung' : 'o-sai');
          const dec = target.toDecimalText();
          ketThuc(dung, H.expr(q.dapAn) + (dec && !target.isInt() && !/[.,]/.test(q.dapAn) ? ' (hoặc ' + H.expr(dec.replace('−', '-')) + ')' : '') + (q.donVi ? ' ' + H.esc(q.donVi) : ''));
        }, false);
        setTimeout(() => { if (!('ontouchstart' in root)) inp.focus(); }, 50);
        break;
      }

      /* ---------------- SẮP XẾP SỐ ---------------- */
      case 'sap-xep': {
        const vals = q.so.map(s => PS.valueOf(s));
        const cmp = (a, b) => q.chieu === 'tang' ? vals[a].cmp(vals[b]) : vals[b].cmp(vals[a]);
        const dungThuTu = q.so.map((_, i) => i).sort(cmp);
        const order = shuffleNot(q.so.map((_, i) => i), s => s.every((v, i) => v === dungThuTu[i]));
        vung.appendChild($('div', 'goi-y-chieu', q.chieu === 'tang' ? '⬆ Nhỏ nhất ở trên cùng' : '⬆ Lớn nhất ở trên cùng'));
        const ul = $('ol', 'keo-ds'); order.forEach(i => ul.appendChild(sortItem(H.value(q.so[i]), i))); vung.appendChild(ul);
        sortable(ul);
        nutKiemTra('Kiểm tra', () => {
          const cur = [...ul.children].map(li => +li.dataset.k);
          let ok = true;
          for (let i = 1; i < cur.length; i++) if (cmp(cur[i - 1], cur[i]) >= 0) ok = false;
          ul.classList.add('khoa', ok ? 'ds-dung' : 'ds-sai');
          [...ul.children].forEach((li, i) => li.classList.add(+li.dataset.k === dungThuTu[i] ? 'muc-dung' : 'muc-sai'));
          ketThuc(ok, H.text('{{' + dungThuTu.map(i => q.so[i]).join(q.chieu === 'tang' ? ' < ' : ' > ') + '}}'));
        });
        break;
      }

      /* ---------------- SẮP XẾP BƯỚC GIẢI ---------------- */
      case 'thu-tu-buoc': {
        const order = shuffleNot(q.buoc.map((_, i) => i), s => s.every((v, i) => v === i));
        const ul = $('ol', 'keo-ds buoc-ds'); order.forEach(i => ul.appendChild(sortItem(H.text(q.buoc[i]), i))); vung.appendChild(ul);
        sortable(ul);
        nutKiemTra('Kiểm tra', () => {
          const cur = [...ul.children].map(li => +li.dataset.k);
          const ok = cur.every((v, i) => v === i);
          ul.classList.add('khoa', ok ? 'ds-dung' : 'ds-sai');
          [...ul.children].forEach((li, i) => li.classList.add(+li.dataset.k === i ? 'muc-dung' : 'muc-sai'));
          ketThuc(ok, '<ol class="ds-dap">' + q.buoc.map(b => '<li>' + H.text(b) + '</li>').join('') + '</ol>');
        });
        break;
      }

      /* ---------------- TRỤC SỐ ---------------- */
      case 'truc-so': {
        const tu = PS.valueOf(q.tu), den = PS.valueOf(q.den), buoc = PS.valueOf(q.buoc), diem = PS.valueOf(q.diem);
        const n = den.sub(tu).div(buoc).n, W = 400, L = 26, R = W - 26, Y = 62;
        const xOf = k => L + (R - L) * k / n;
        const valOf = k => tu.add(buoc.mul(new PS.Frac(k)));
        const target = diem.sub(tu).div(buoc).n;
        let ticks = '';
        for (let k = 0; k <= n; k++) {
          const v = valOf(k), isInt = v.isInt();
          ticks += '<line x1="' + xOf(k) + '" x2="' + xOf(k) + '" y1="' + (Y - (isInt ? 14 : 8)) + '" y2="' + (Y + (isInt ? 14 : 8)) + '" class="vach' + (isInt ? ' vach-nguyen' : '') + '"/>';
          if (isInt) ticks += '<text x="' + xOf(k) + '" y="' + (Y + 38) + '" class="nhan-so">' + v.toText() + '</text>';
          ticks += '<rect x="' + (xOf(k) - (R - L) / n / 2) + '" y="' + (Y - 40) + '" width="' + ((R - L) / n) + '" height="90" class="vung-cham" data-k="' + k + '"/>';
        }
        const box = $('div', 'truc-khung');
        box.innerHTML = '<svg viewBox="0 0 ' + W + ' 116" class="truc" role="slider" tabindex="0" aria-label="Trục số, dùng phím mũi tên trái phải để di chuyển điểm" aria-valuemin="0" aria-valuemax="' + n + '">' +
          '<line x1="' + (L - 18) + '" x2="' + (R + 12) + '" y1="' + Y + '" y2="' + Y + '" class="truc-duong"/>' +
          '<polygon points="' + (R + 22) + ',' + Y + ' ' + (R + 10) + ',' + (Y - 7) + ' ' + (R + 10) + ',' + (Y + 7) + '" class="truc-mui"/>' + ticks +
          '<g class="diem-dung" style="display:none"><circle r="10"/></g>' +
          '<g class="con-tro" style="display:none"><path d="M0,-34 L10,-20 L4,-20 L4,-8 L-4,-8 L-4,-20 L-10,-20 Z"/><circle r="9"/></g></svg>';
        vung.appendChild(box);
        const dk = $('div', 'truc-dk', '<button type="button" class="phim" data-d="-1" aria-label="Sang trái một vạch">◀</button><span>Chạm vào trục số, kéo mũi tên, hoặc dùng nút ◀ ▶</span><button type="button" class="phim" data-d="1" aria-label="Sang phải một vạch">▶</button>');
        vung.appendChild(dk);
        dk.querySelectorAll('button').forEach(b => b.onclick = () => { if (xong) return; A.phat('tichTac'); dat((k == null ? Math.floor(n / 2) : k) + +b.dataset.d); });
        const svg = box.querySelector('svg'), ct = svg.querySelector('.con-tro');
        let k = null;
        const dat = kk => { k = Math.max(0, Math.min(n, kk)); ct.style.display = ''; ct.setAttribute('transform', 'translate(' + xOf(k) + ',' + Y + ')'); svg.setAttribute('aria-valuenow', k); kt.disabled = false; };
        const fromEvent = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); return Math.round((p.x - L) / (R - L) * n); };
        let keo = false;
        svg.addEventListener('pointerdown', e => { if (xong) return; keo = true; svg.setPointerCapture(e.pointerId); const kk = fromEvent(e); if (kk !== k) A.phat('tha'); dat(kk); });
        svg.addEventListener('pointermove', e => { if (!keo || xong) return; e.preventDefault(); const kk = fromEvent(e); if (kk !== k) { A.phat('tichTac'); dat(kk); } });
        svg.addEventListener('pointerup', () => keo = false);
        svg.addEventListener('keydown', e => { if (xong) return; if (e.key === 'ArrowLeft') { dat((k == null ? Math.floor(n / 2) : k) - 1); A.phat('tichTac'); e.preventDefault(); } if (e.key === 'ArrowRight') { dat((k == null ? Math.floor(n / 2) : k) + 1); A.phat('tichTac'); e.preventDefault(); } });
        const kt = nutKiemTra('Kiểm tra', () => {
          const ok = k === target;
          const dd = svg.querySelector('.diem-dung'); dd.style.display = ''; dd.setAttribute('transform', 'translate(' + xOf(target) + ',' + Y + ')');
          svg.insertAdjacentHTML('beforeend', '<text x="' + xOf(target) + '" y="' + (Y - 48) + '" class="nhan-dap">' + diem.toText() + '</text>');
          svg.classList.add(ok ? 'truc-dung' : 'truc-sai');
          ketThuc(ok, H.expr(q.diem) + ' nằm ở vạch thứ ' + target + ' tính từ ' + H.expr(q.tu) + ' (mỗi vạch là ' + H.expr(q.buoc) + ')');
        }, false);
        break;
      }

      /* ---------------- GHÉP ĐÔI ---------------- */
      case 'ghep': {
        const n = q.cap.length, right = shuffleNot(q.cap.map((_, i) => i), s => s.every((v, i) => v === i));
        const ghep = new Array(n).fill(null); // ghep[trái] = phải
        let chonTrai = null;
        const g = $('div', 'ghep-luoi');
        const cotT = $('div', 'ghep-cot'), cotP = $('div', 'ghep-cot');
        const bt = q.cap.map((c, i) => { const b = $('button', 'ghep-o', H.text(c.trai)); b.type = 'button'; b.dataset.i = i; cotT.appendChild(b); return b; });
        const bp = right.map(j => { const b = $('button', 'ghep-o', H.value(q.cap[j].phai)); b.type = 'button'; b.dataset.j = j; cotP.appendChild(b); return b; });
        g.appendChild(cotT); g.appendChild($('div', 'ghep-giua', '⇄')); g.appendChild(cotP); vung.appendChild(g);
        vung.appendChild($('div', 'goi-y-chieu', 'Chạm một ô bên trái, rồi chạm ô tương ứng bên phải.'));
        const paint = () => {
          bt.forEach((b, i) => { b.className = 'ghep-o' + (chonTrai === i ? ' dang-chon' : '') + (ghep[i] != null ? ' cap-' + i : '') + (b.dataset.khoa ? ' khoa' : ''); });
          bp.forEach(b => { const j = +b.dataset.j, i = ghep.indexOf(j); b.className = 'ghep-o' + (i >= 0 ? ' cap-' + i : '') + (i >= 0 && bt[i].dataset.khoa ? ' khoa' : ''); });
          kt.disabled = ghep.some(x => x == null);
        };
        bt.forEach((b, i) => b.onclick = () => { if (xong || b.dataset.khoa) return; A.phat('chon'); if (ghep[i] != null) { ghep[i] = null; } chonTrai = chonTrai === i ? null : i; paint(); });
        bp.forEach(b => b.onclick = () => {
          if (xong) return; const j = +b.dataset.j, owner = ghep.indexOf(j);
          if (owner >= 0 && bt[owner].dataset.khoa) return;
          if (chonTrai == null) { if (owner >= 0) { ghep[owner] = null; A.phat('chon'); paint(); } return; }
          if (owner >= 0) ghep[owner] = null;
          ghep[chonTrai] = j; chonTrai = null; A.phat('tha'); paint();
        });
        const kt = nutKiemTra('Kiểm tra', () => {
          const ok = ghep.every((j, i) => j === i);
          bt.forEach((b, i) => b.classList.add(ghep[i] === i ? 'o-dung' : 'o-sai'));
          ketThuc(ok, q.cap.map(c => H.text(c.trai) + ' ↔ ' + H.value(c.phai)).join('<br>'));
        }, false);
        ctrl.coTheLoaiBo = () => !xong && bt.filter(b => !b.dataset.khoa).length > 1;
        ctrl.loaiBo = () => {
          const free = bt.map((b, i) => i).filter(i => !bt[i].dataset.khoa);
          const i = shuffle(free)[0]; const o = ghep.indexOf(i); if (o >= 0) ghep[o] = null;
          ghep[i] = i; bt[i].dataset.khoa = '1'; paint();
        };
        paint();
        break;
      }

      /* ---------------- BẮT LỖI SAI ---------------- */
      case 'bat-loi': {
        const isEq = /[=<>]/.test(q.dau);
        vung.appendChild($('div', 'bl-dau', '<span class="bl-nhan">Đề bài</span>' + H.expr(q.dau)));
        const btns = q.buoc.map((b, i) => {
          const el = $('button', 'bl-buoc', '<span class="bl-nhan">Bước ' + (i + 1) + '</span><span class="nd">' + (isEq ? '' : H.tex('=') + ' ') + H.expr(b) + '</span>');
          el.type = 'button';
          el.onclick = () => {
            if (xong) return;
            btns.forEach(x => x.disabled = true);
            const ok = i + 1 === q.buocSai;
            el.classList.add(ok ? 'bl-dung' : 'bl-chon-sai');
            btns[q.buocSai - 1].classList.add('bl-la-loi');
            ketThuc(ok, 'Bước ' + q.buocSai + ' sai: ' + H.expr(q.buoc[q.buocSai - 1]));
          };
          vung.appendChild(el); return el;
        });
        vung.appendChild($('div', 'goi-y-chieu', 'Chạm vào bước đầu tiên bị sai.'));
        const conMo = () => btns.filter((b, i) => i + 1 !== q.buocSai && !b.classList.contains('an-buoc'));
        ctrl.coTheLoaiBo = () => !xong && conMo().length >= 1;
        ctrl.loaiBo = () => { const b = shuffle(conMo())[0]; if (b) { b.classList.add('an-buoc'); b.disabled = true; } };
        ctrl.phimTat = k => { const b = btns[k]; if (b && !b.disabled) b.click(); };
        break;
      }
    }
    return ctrl;
  }

  root.ThuThach = { ve, shuffle };
})(window);
