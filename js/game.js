/* =====================================================================
   game.js — Vòng chơi: nhân vật, bản đồ, trận đấu, XP/vàng, cửa hàng,
   huy hiệu, Hang Ôn Tập, hồ sơ & mã kết quả.
   ===================================================================== */
(function () {
  'use strict';
  const CT = COT_TRUYEN, H = HienThi, A = AmThanh, TT = ThuThach, SINH = SINH_CAU_HOI;
  const KEY = 'htq-luu-v1';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const giamDongTac = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = H.esc;

  let S = null;      // trạng thái lưu
  let B = null;      // trận đấu đang diễn ra
  let manHienTai = '';

  /* ===================== LƯU / TẢI ===================== */
  function moi(ten, lop, lopNV, avatar) {
    return { v: 1, id: taoId(), ten, lop, lopNV, avatar, xp: 0, vang: 50, inv: { goiY: 2, nam: 1, boQua: 0, binhMau: 1 },
      tienDo: { 1: [], 2: [], 3: [], 4: [], 5: [] }, hh: {}, tk: {}, tkVung: {},
      dem: { dung: 0, sai: 0, combo: 0, comboMax: 0, congTru: 0, luyThua: 0, batLoi: 0, dauChuoi: 0, kho: 0, on: 0 },
      on: [], daXem: {}, daPha: false };
  }
  function luu() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* bị chặn bộ nhớ: vẫn chơi được, chỉ không lưu */ } }
  function tai() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1 && s.ten) return s; } catch (e) {} return null; }
  function xoaLuu() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* ===================== TÍNH TOÁN ===================== */
  const xpCap = L => 50 * L * (L - 1);
  const cap = xp => { let L = 1; while (xpCap(L + 1) <= xp) L++; return L; };
  const timToiDa = () => CT.LOP_NHAN_VAT[S.lopNV].tim;
  const vungMo = v => v === 1 || !!S.tienDo[v - 1][5];
  const ttMo = (v, i) => vungMo(v) && (i === 0 || !!S.tienDo[v][i - 1]);
  const saoVung = v => S.tienDo[v].reduce((a, t) => a + (t ? t.sao : 0), 0);
  const tongSao = () => [1, 2, 3, 4, 5].reduce((a, v) => a + saoVung(v), 0);
  const soVungXong = () => [1, 2, 3, 4, 5].filter(v => S.tienDo[v][5]).length;
  const tenDang = id => (CT.DANG.find(d => d.id === id) || { ten: id }).ten;

  /* ===================== KHUNG GIAO DIỆN ===================== */
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function veHud() {
    const hud = $('#hud');
    if (!S) { hud.hidden = true; return; }
    hud.hidden = false;
    const L = cap(S.xp), a = xpCap(L), b = xpCap(L + 1), pct = Math.round((S.xp - a) / (b - a) * 100);
    hud.innerHTML =
      '<button class="hud-nv" id="hud-nv" aria-label="Hồ sơ"><span class="avatar nho">' + S.avatar + '</span>' +
      '<span class="hud-ten"><b>' + esc(S.ten) + '</b><span class="hud-cap">Cấp ' + L + '</span></span></button>' +
      '<div class="hud-xp" title="' + S.xp + ' XP"><div class="hud-xp-thanh"><i style="width:' + pct + '%"></i></div><span>' + (S.xp - a) + '/' + (b - a) + ' XP</span></div>' +
      '<span class="hud-vang" id="hud-vang"><i class="xu"></i> <b>' + S.vang + '</b></span>' +
      '<button class="nut-tron" id="nut-am" aria-label="Bật/tắt âm thanh">' + (A.tat ? '🔇' : '🔊') + '</button>';
    $('#hud-nv').onclick = () => { A.phat('bam'); di(manHoSo); };
    $('#nut-am').onclick = () => { A.batTat(); veHud(); };
  }

  const NAV = [['the-gioi', '🗺️', 'Bản đồ', () => manTheGioi()], ['cua-hang', '🛒', 'Cửa hàng', () => manCuaHang()],
    ['huy-hieu', '🏅', 'Huy hiệu', () => manHuyHieu()], ['hang', '🕯️', 'Ôn tập', () => manHang()], ['ho-so', '👤', 'Hồ sơ', () => manHoSo()]];
  function veNav(hien) {
    const nav = $('#dieu-huong');
    nav.hidden = !hien;
    if (!hien) return;
    nav.innerHTML = NAV.map(([id, ic, ten]) => '<button data-id="' + id + '" class="' + (manHienTai === id || (id === 'the-gioi' && manHienTai === 'vung') ? 'dang-o' : '') + '">' +
      '<span class="ic">' + ic + '</span><span>' + ten + '</span>' + (id === 'hang' && S.on.length ? '<i class="cham">' + S.on.length + '</i>' : '') + '</button>').join('');
    $$('button', nav).forEach(b => b.onclick = () => { A.phat('trang'); const n = NAV.find(x => x[0] === b.dataset.id); di(n[3]); });
  }

  /** chuyển màn hình có hiệu ứng */
  function di(fn) { dungDongHo(); fn(); window.scrollTo(0, 0); }
  function datMan(id, html, coNav) {
    manHienTai = id;
    const m = $('#man');
    m.className = 'man man-' + id;
    m.innerHTML = html;
    m.classList.remove('vao'); void m.offsetWidth; m.classList.add('vao');
    veHud(); veNav(coNav);
    return m;
  }

  /* ===================== HIỆU ỨNG ===================== */
  function bayChu(text, x, y, cls) {
    const s = el('span', 'bay ' + (cls || ''), text);
    s.style.left = x + 'px'; s.style.top = y + 'px';
    $('#hieu-ung').appendChild(s); setTimeout(() => s.remove(), 1400);
  }
  function bayTu(node, text, cls) { const r = (node || document.body).getBoundingClientRect(); bayChu(text, r.left + r.width / 2, r.top + 10, cls); }
  function phaoHoa(n) {
    if (giamDongTac()) return;
    const mau = ['#ffcf3f', '#ff6b6b', '#4dabf7', '#51cf66', '#cc5de8', '#ff922b'];
    for (let i = 0; i < (n || 60); i++) {
      const c = el('i', 'giay');
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(mau);
      c.style.animationDelay = Math.random() * 0.5 + 's'; c.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
      c.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      $('#hieu-ung').appendChild(c); setTimeout(() => c.remove(), 3600);
    }
  }
  function rung(node) { if (!node || giamDongTac()) return; node.classList.remove('rung-manh'); void node.offsetWidth; node.classList.add('rung-manh'); }
  function thongBao(html, kieu) {
    const t = el('div', 'toast ' + (kieu || ''), html);
    $('#toasts').appendChild(t); setTimeout(() => t.classList.add('di'), 2600); setTimeout(() => t.remove(), 3100);
  }
  function hop(tieuDe, noiDung, nut, lop) {
    const v = el('div', 'man-che');
    v.innerHTML = '<div class="hop ' + (lop || '') + '" role="dialog" aria-modal="true"><h2>' + tieuDe + '</h2><div class="hop-nd">' + noiDung + '</div><div class="hop-nut"></div></div>';
    const box = $('.hop-nut', v);
    (nut || [{ chu: 'Đóng' }]).forEach(n => {
      const b = el('button', 'nut ' + (n.lop || 'nut-chinh'), n.chu); b.type = 'button';
      b.onclick = () => { A.phat('bam'); v.remove(); n.bam && n.bam(); };
      box.appendChild(b);
    });
    $('#lop-phu').appendChild(v);
    setTimeout(() => { const b = $('button', box); b && b.focus(); }, 30);
    return v;
  }

  /* ===================== PHẦN THƯỞNG & HUY HIỆU ===================== */
  function trao(id) {
    if (S.hh[id]) return;
    const h = CT.HUY_HIEU.find(x => x.id === id); if (!h) return;
    S.hh[id] = Date.now(); luu();
    setTimeout(() => { A.phat('huyHieu'); thongBao('<span class="toast-ic">' + h.icon + '</span><span><b>Huy hiệu mới!</b><br>' + h.ten + '</span>', 'toast-vang'); }, 400);
  }
  function congVang(n, node) {
    S.vang += n; if (n > 0 && node) bayTu(node, '+' + n + ' <i class="xu"></i>', 'bay-vang');
    if (S.vang >= 300) trao('nha-giau');
  }
  function congXP(n, node) {
    const truoc = cap(S.xp); S.xp += n;
    if (node && n > 0) bayTu(node, '+' + n + ' XP', 'bay-xp');
    const sau = cap(S.xp);
    if (sau > truoc) {
      S.vang += 30 * (sau - truoc);
      if (B && B.tim != null) B.tim = Math.min(timToiDa(), B.tim + 1);
      setTimeout(() => {
        A.phat('lenCap'); phaoHoa(70);
        hop('LÊN CẤP ' + sau + '!', '<div class="len-cap">⬆️</div><p>Em mạnh hơn rồi! Thưởng <b>30 vàng</b>' + (B ? ' và hồi <b>1 tim</b>' : '') + '.</p>', [{ chu: 'Tuyệt!' }], 'hop-len-cap');
        veHud(); if (B && B.capNhat) B.capNhat();
      }, 700);
    }
  }

  /* thông tin giáo viên, trường (đặt trong du-lieu/cau-hinh.js) */
  function theGV(chuKy) {
    const c = window.CAU_HINH || {};
    if (!c.giaoVien && !c.truong) return '';
    return '<p class="' + (chuKy ? 'bk-gv' : 'logo-gv') + '">' + (c.giaoVien ? (chuKy ? 'Giáo viên xác nhận: ' : 'Giáo viên: ') + '<b>' + esc(c.giaoVien) + '</b>' : '') +
      (c.giaoVien && c.truong ? '<br>' : '') + (c.truong ? esc(c.truong) : '') + '</p>';
  }

  /* ===================== MÀN MỞ ĐẦU ===================== */
  function manMoDau() {
    const daLuu = tai();
    const m = datMan('mo-dau',
      '<div class="mo-dau">' +
      '<div class="logo"><span class="logo-q">ℚ</span><h1>Vương Quốc<br><em>Hữu Tỉ</em></h1><p class="logo-phu">Hành trình của Hiệp sĩ Toán học · Toán 7</p>' + theGV() + '</div>' +
      '<div class="mo-dau-canh" aria-hidden="true"><span>🏡</span><span>🏰</span><span>🌲</span><span>⛰️</span><span>🏯</span></div>' +
      '<div class="mo-dau-nut">' +
      (daLuu ? '<button class="nut nut-chinh nut-to" id="choi-tiep">▶ Chơi tiếp: ' + esc(daLuu.ten) + '</button>' : '') +
      '<button class="nut ' + (daLuu ? 'nut-phu' : 'nut-chinh nut-to') + '" id="choi-moi">' + (daLuu ? 'Tạo nhân vật mới' : '▶ Bắt đầu phiêu lưu') + '</button>' +
      '<div class="hang-nho"><button class="nut nut-nho" id="am">' + (A.tat ? '🔇 Âm thanh: tắt' : '🔊 Âm thanh: bật') + '</button>' +
      '<button class="nut nut-nho" id="nhac">' + (A.nhac ? '🎵 Nhạc nền: bật' : '🎵 Nhạc nền: tắt') + '</button></div>' +
      '<a class="link-gv" href="giao-vien.html">Dành cho giáo viên →</a>' +
      '</div></div>', false);
    $('#hud').hidden = true;
    if (daLuu) $('#choi-tiep', m).onclick = () => { S = daLuu; if (!S.id) { S.id = taoId(); luu(); } if (S.choGui) guiNgay(); A.phat('moKhoa'); di(manTheGioi); };
    $('#choi-moi', m).onclick = () => {
      A.phat('bam');
      if (daLuu) hop('Tạo nhân vật mới?', '<p>Tiến độ của <b>' + esc(daLuu.ten) + '</b> sẽ bị xoá.</p>',
        [{ chu: 'Tạo mới', lop: 'nut-do', bam: () => { xoaLuu(); manCotTruyen(); } }, { chu: 'Huỷ', lop: 'nut-phu' }]);
      else manCotTruyen();
    };
    $('#am', m).onclick = () => { A.batTat(); manMoDau(); };
    $('#nhac', m).onclick = () => { A.batTatNhac(); manMoDau(); };
  }

  function manCotTruyen() {
    let i = 0;
    const ve = () => {
      const m = datMan('cot-truyen', '<div class="cot-truyen"><div class="ct-canh" aria-hidden="true">' + ['🏰', '👹🧙‍♀️', '⚔️'][i] + '</div>' +
        '<p class="ct-loi">' + H.text(CT.MO_DAU[i]) + '</p><div class="ct-cham">' + CT.MO_DAU.map((_, k) => '<i class="' + (k === i ? 'bat' : '') + '"></i>').join('') + '</div>' +
        '<button class="nut nut-chinh nut-to" id="tiep">' + (i < CT.MO_DAU.length - 1 ? 'Tiếp ▶' : 'Tạo nhân vật ⚔️') + '</button>' +
        '<button class="nut nut-nho" id="bo">Bỏ qua</button></div>', false);
      $('#tiep', m).onclick = () => { A.phat('trang'); if (++i < CT.MO_DAU.length) ve(); else manTaoNV(); };
      $('#bo', m).onclick = () => { A.phat('bam'); manTaoNV(); };
    };
    ve();
  }

  /* ===================== TẠO NHÂN VẬT ===================== */
  function manTaoNV() {
    const keys = Object.keys(CT.LOP_NHAN_VAT);
    let lopNV = keys[0], avatar = CT.AVATAR[0];
    const m = datMan('tao-nv',
      '<div class="tao-nv"><h2>Tạo Hiệp sĩ của em</h2>' +
      '<div class="xem-nv"><span class="avatar to" id="xem-av">' + avatar + '</span><span class="xem-lop" id="xem-lop"></span></div>' +
      '<label class="nhan" for="ten">Tên nhân vật</label><input id="ten" class="o-nhap" maxlength="24" placeholder="Ví dụ: Minh Anh" autocomplete="off">' +
      '<label class="nhan" for="lop">Lớp (để thầy cô xếp hạng)</label><input id="lop" class="o-nhap" maxlength="8" placeholder="Ví dụ: 7A1" autocomplete="off">' +
      '<p class="nhan">Chọn lớp nhân vật</p><div class="chon-lop">' +
      keys.map(k => { const c = CT.LOP_NHAN_VAT[k]; return '<button class="the-lop" data-k="' + k + '"><span class="ic">' + c.icon + '</span><b>' + c.ten + '</b><span>' + c.kiNang + '</span></button>'; }).join('') +
      '</div><p class="nhan">Chọn hình đại diện</p><div class="chon-av">' +
      CT.AVATAR.map(a => '<button class="o-av" data-a="' + a + '" aria-label="Hình ' + a + '">' + a + '</button>').join('') + '</div>' +
      '<button class="nut nut-chinh nut-to" id="xong">Lên đường! ⚔️</button></div>', false);
    const ve = () => {
      $$('.the-lop', m).forEach(b => b.classList.toggle('dang-chon', b.dataset.k === lopNV));
      $$('.o-av', m).forEach(b => b.classList.toggle('dang-chon', b.dataset.a === avatar));
      $('#xem-av', m).textContent = avatar; $('#xem-lop', m).textContent = CT.LOP_NHAN_VAT[lopNV].icon + ' ' + CT.LOP_NHAN_VAT[lopNV].ten;
      const av = $('#xem-av', m); av.classList.remove('nay'); void av.offsetWidth; av.classList.add('nay');
    };
    $$('.the-lop', m).forEach(b => b.onclick = () => { A.phat('chon'); lopNV = b.dataset.k; ve(); });
    $$('.o-av', m).forEach(b => b.onclick = () => { A.phat('chon'); avatar = b.dataset.a; ve(); });
    $('#xong', m).onclick = () => {
      const ten = $('#ten', m).value.trim();
      if (!ten) { A.phat('sai'); rung($('#ten', m)); $('#ten', m).focus(); thongBao('Em hãy nhập tên nhân vật nhé!', 'toast-do'); return; }
      S = moi(ten, $('#lop', m).value.trim().toUpperCase(), lopNV, avatar); luu();
      A.phat('moKhoa'); phaoHoa(40);
      di(manTheGioi);
      setTimeout(() => hop('Chào ' + esc(ten) + '!', '<p>Em nhận được <b>50 vàng</b>, <b>2 cuộn gợi ý</b>, <b>1 phép 50:50</b> và <b>1 bình máu</b>.</p><p>Hãy bắt đầu từ <b>Làng Tập Hợp ℚ</b>!</p>', [{ chu: 'Xuất phát!' }]), 500);
    };
    ve();
  }

  /* ===================== BẢN ĐỒ THẾ GIỚI ===================== */
  function manTheGioi() {
    const pos = [[28, 87], [70, 69], [30, 51], [70, 33], [50, 15]];
    const hienTai = [1, 2, 3, 4, 5].filter(vungMo).pop();
    let path = 'M' + pos.map(p => p[0] + ' ' + p[1]).join(' L');
    const m = datMan('the-gioi',
      '<div class="tieu-de-man"><h2>Bản đồ Vương quốc</h2><span class="chip">⭐ ' + tongSao() + '/90</span></div>' +
      '<div class="ban-do">' +
      '<svg class="ban-do-duong" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="' + path + '"/></svg>' +
      CT.VUNG.map((V, k) => {
        const v = V.id, mo = vungMo(v), xong = !!S.tienDo[v][5];
        return '<button class="dao ' + (mo ? '' : 'khoa ') + (xong ? 'xong ' : '') + (v === hienTai ? 'hien-tai' : '') + '" data-v="' + v + '" style="left:' + pos[k][0] + '%;top:' + pos[k][1] + '%;--mau:' + V.mau + '">' +
          '<span class="dao-ic">' + (mo ? V.icon : '🔒') + '</span>' +
          '<span class="dao-ten">' + V.ten + '</span>' +
          '<span class="dao-sao">' + (mo ? '⭐ ' + saoVung(v) + '/18' : 'Chưa mở') + '</span>' +
          (v === hienTai ? '<span class="dao-nv">' + S.avatar + '</span>' : '') + '</button>';
      }).join('') + '</div>' +
      (S.on.length ? '<button class="banner-on" id="di-hang">🕯️ Có <b>' + S.on.length + '</b> câu đang chờ trong Hang Ôn Tập</button>' : ''), true);
    $$('.dao', m).forEach(b => b.onclick = () => {
      const v = +b.dataset.v;
      if (!vungMo(v)) { A.phat('sai'); rung(b); thongBao('Hãy đánh bại boss của ' + CT.VUNG[v - 2].ten + ' để mở vùng này!', 'toast-do'); return; }
      A.phat('trang'); di(() => manVung(v));
    });
    const dh = $('#di-hang', m); if (dh) dh.onclick = () => { A.phat('trang'); di(manHang); };
  }

  /* ===================== BẢN ĐỒ VÙNG ===================== */
  function manVung(v) {
    const V = CT.VUNG[v - 1], td = S.tienDo[v];
    const hienTai = V.thuThach.findIndex((_, i) => !td[i]);
    const pos = [[22, 89], [72, 75], [26, 61], [74, 46], [28, 31], [55, 13]];
    const m = datMan('vung',
      '<div class="tieu-de-man"><button class="nut-lui" id="lui" aria-label="Về bản đồ">←</button><div><h2>' + V.icon + ' ' + V.ten + '</h2><p class="phu">' + V.bai + '</p></div><span class="chip">⭐ ' + saoVung(v) + '/18</span></div>' +
      '<div class="npc"><span class="npc-ic">' + V.npc.icon + '</span><div class="bong-noi"><b>' + V.npc.ten + ':</b> ' + H.text(hienTai >= 0 ? V.thuThach[hienTai].loi || V.chao : 'Cháu đã giải cứu cả vùng! Hãy quay lại săn thêm sao nhé.') + '</div></div>' +
      '<div class="ban-do vung-do" style="--mau:' + V.mau + '">' +
      '<svg class="ban-do-duong" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M' + pos.map(p => p.join(' ')).join(' L') + '"/></svg>' +
      V.thuThach.map((t, i) => {
        const mo = ttMo(v, i), r = td[i], boss = t.loai === 'boss';
        const ic = boss ? t.boss.icon : t.loai === 'dau-tri' ? '⏱️' : (i + 1);
        return '<button class="nut-tt ' + (boss ? 'tt-boss ' : '') + (t.loai === 'dau-tri' ? 'tt-dau-tri ' : '') + (mo ? '' : 'khoa ') + (r ? 'xong ' : '') + (i === hienTai ? 'hien-tai' : '') + '" data-i="' + i + '" style="left:' + pos[i][0] + '%;top:' + pos[i][1] + '%">' +
          '<span class="tt-ic">' + (mo ? ic : '🔒') + '</span><span class="tt-ten">' + t.ten + '</span>' +
          '<span class="tt-sao">' + (r ? '★'.repeat(r.sao) + '☆'.repeat(3 - r.sao) : boss ? 'BOSS' : t.loai === 'dau-tri' ? 'Đấu trí' : '') + '</span>' +
          (i === hienTai ? '<span class="dao-nv">' + S.avatar + '</span>' : '') + '</button>';
      }).join('') + '</div>', true);
    $('#lui', m).onclick = () => { A.phat('trang'); di(manTheGioi); };
    $$('.nut-tt', m).forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (!ttMo(v, i)) { A.phat('sai'); rung(b); thongBao('Hãy vượt qua thử thách trước đó!', 'toast-do'); return; }
      A.phat('chon'); hopChonMuc(v, i);
    });
  }

  function hopChonMuc(v, i) {
    const t = CT.VUNG[v - 1].thuThach[i], r = S.tienDo[v][i];
    const moTa = t.loai === 'boss' ? 'Đánh bại ' + t.boss.ten + (t.boss2 ? ' và ' + t.boss2.ten : '') + '. Đúng thì gây sát thương, sai thì mất tim.'
      : t.loai === 'dau-tri' ? 'Trả lời càng nhiều câu càng tốt trong ' + t.thoiGian + ' giây. Sai bị trừ 3 giây.'
      : t.soCau + ' thử thách nhiều dạng. Sai một câu mất một tim.';
    const v2 = hop((t.loai === 'boss' ? t.boss.icon + ' ' : '') + t.ten, '<p>' + moTa + '</p>' + (r ? '<p class="phu">Thành tích tốt nhất: ' + '★'.repeat(r.sao) + ' (mức ' + CT.MUC[r.muc] + ')</p>' : '') +
      '<p class="nhan">Chọn mức độ</p><div class="chon-muc">' +
      [1, 2, 3].map(k => '<button class="muc-nut muc-' + k + '" data-m="' + k + '"><b>' + CT.MUC[k] + '</b><span>' + ['Làm quen', 'Vừa sức', 'Thử thách'][k - 1] + '</span><span class="thuong">×' + [1, 1.5, 2][k - 1] + ' thưởng</span></button>').join('') + '</div>',
      [{ chu: 'Để sau', lop: 'nut-phu' }]);
    $$('.muc-nut', v2).forEach(b => b.onclick = () => { A.phat('bam'); v2.remove(); batDau(v, i, +b.dataset.m, false); });
  }

  /* ===================== CHỌN CÂU HỎI ===================== */
  function chonCau(v, muc, soCau, uuTien) {
    const kho = window.CAU_HOI.filter(q => v === 5 ? true : q.vung === v);
    const daXem = q => (S.daXem[q.id] || 0) + Math.random() * 0.9 + (v === 5 && q.vung !== 5 ? 0.5 : 0);
    const chon = [], soKho = Math.max(1, soCau - 1);
    for (let k = 0; chon.length < soKho && k < soCau * 3; k++) {
      const loai = uuTien[k % uuTien.length];
      for (const mm of [muc, muc === 1 ? 2 : muc - 1, muc === 3 ? 1 : 3]) {
        const ung = kho.filter(q => q.loai === loai && q.muc === mm && !chon.includes(q)).sort((a, b) => daXem(a) - daXem(b));
        if (ung.length) { chon.push(ung[0]); break; }
      }
    }
    while (chon.length < soKho) { const ung = kho.filter(q => !chon.includes(q)).sort((a, b) => daXem(a) - daXem(b)); if (!ung.length) break; chon.push(ung[0]); }
    const out = TT.shuffle(chon);
    out.splice(Math.floor(Math.random() * (out.length + 1)), 0, SINH.sinh(v, muc));
    return out.slice(0, soCau);
  }
  function cauBoss(v, muc) {
    if (Math.random() < 0.4) return SINH.sinh(v, muc);
    const kho = window.CAU_HOI.filter(q => (v === 5 || q.vung === v) && Math.abs(q.muc - muc) <= 1 && !(B.daDung || []).includes(q.id));
    if (!kho.length) return SINH.sinh(v, muc);
    kho.sort((a, b) => (S.daXem[a.id] || 0) - (S.daXem[b.id] || 0) + Math.random() - 0.5);
    B.daDung.push(kho[0].id);
    return kho[0];
  }

  /* ===================== TRẬN ĐẤU ===================== */
  function batDau(v, i, muc, hoiSinh) {
    const t = CT.VUNG[v - 1].thuThach[i];
    B = { v, i, muc, t, kieu: t.loai, tim: timToiDa(), idx: 0, sai: [], soSai: 0, soDung: 0, xpThu: 0, vangThu: 0,
      goiYMienPhi: S.lopNV === 'phap-su' ? 2 : 0, ongNhom: S.lopNV === 'tham-hiem' ? 1 : 0, khien: S.lopNV === 'tho-ren' ? 1 : 0, hoiSinh, daDung: [] };
    if (t.loai === 'dau-tri') return batDauDauTri();
    if (t.loai === 'boss') {
      B.boss = t.boss; B.pha = 1; B.bossMax = t.boss.mau[muc - 1]; B.bossHp = B.bossMax;
      A.phat('bossVao');
      hop(t.boss.icon + ' ' + t.boss.ten, '<div class="boss-ra">' + t.boss.icon + '</div><p class="loi-boss">“' + esc(t.boss.mo) + '”</p>', [{ chu: 'Chiến đấu! ⚔️', bam: hienCau }], 'hop-boss');
      return;
    }
    B.ds = chonCau(v, muc, t.soCau, t.uuTien);
    hienCau();
  }

  function batDauOn() {
    const ds = S.on.slice(0, 5);
    B = { v: 0, i: -1, muc: 1, t: { ten: 'Hang Ôn Tập' }, kieu: 'on', tim: null, idx: 0, ds, sai: [], soSai: 0, soDung: 0, xpThu: 0, vangThu: 0, goiYMienPhi: 1, ongNhom: 0, khien: 0, daDung: [] };
    hienCau();
  }

  function thanhTim() {
    if (B.tim == null) return '';
    let s = ''; for (let k = 0; k < timToiDa(); k++) s += '<span class="tim ' + (k < B.tim ? '' : 'mat') + '">❤</span>';
    return '<span class="tims" aria-label="Còn ' + B.tim + ' tim">' + s + (B.khien ? '<span class="khien" title="Khiên rèn">🛡️</span>' : '') + '</span>';
  }

  function hienCau() {
    const q = B.kieu === 'boss' ? (B.cur && !B.cur.xong ? B.cur.q : cauBoss(B.v, B.muc)) : B.ds[B.idx];
    B.cur = { q, xong: false };
    const boss = B.kieu === 'boss', bo = B.boss;
    const tienDo = boss ? '' : '<div class="tien-do">' + B.ds.map((_, k) => '<i class="' + (k < B.idx ? 'qua' : k === B.idx ? 'dang' : '') + '"></i>').join('') + '</div>';
    const m = datMan('tran',
      '<div class="tran-dau ' + (boss ? 'tran-boss' : '') + '">' +
      '<div class="tran-thanh"><button class="nut-lui" id="rut" aria-label="Rút lui">✕</button><b class="tran-ten">' + esc(B.t.ten) + (B.kieu !== 'on' ? ' · ' + CT.MUC[B.muc] : '') + '</b>' + thanhTim() + '</div>' +
      (boss ? '<div class="dau-truong"><div class="ben-ta"><span class="avatar vua" id="ta">' + S.avatar + '</span></div>' +
        '<div class="ben-boss"><div class="boss-ten">' + bo.ten + '</div><div class="thanh-mau"><i id="mau-boss" style="width:' + (B.bossHp / B.bossMax * 100) + '%"></i><span>' + B.bossHp + '/' + B.bossMax + '</span></div>' +
        '<span class="boss" id="boss">' + bo.icon + '</span><div class="boss-noi" id="boss-noi"></div></div></div>' : tienDo) +
      (S.dem.combo >= 2 ? '<div class="combo" id="combo">🔥 Combo ×' + S.dem.combo + '</div>' : '<div class="combo an" id="combo"></div>') +
      '<div class="the-cau" id="the-cau"></div>' +
      '<div class="goi-y" id="goi-y" hidden></div>' +
      '<div class="vat-pham" id="vat-pham"></div>' +
      '<div class="phan-hoi" id="phan-hoi" hidden></div></div>', false);
    $('#rut', m).onclick = () => {
      A.phat('bam');
      hop('Rút lui?', '<p>' + (B.kieu === 'on' ? 'Các câu chưa làm vẫn còn trong Hang Ôn Tập.' : 'Kết quả thử thách này sẽ không được tính.') + '</p>',
        [{ chu: 'Rút lui', lop: 'nut-do', bam: () => { const v = B.v; B = null; di(v ? () => manVung(v) : manHang); } }, { chu: 'Chiến tiếp', lop: 'nut-chinh' }]);
    };
    B.ctrl = TT.ve($('#the-cau', m), q, { onXong: kq => xuLy(kq) });
    B.capNhat = () => { const t = $('.tims', m); if (t) t.outerHTML = thanhTim(); veHud(); veVatPham(); };
    veVatPham();
  }

  function veVatPham() {
    const box = $('#vat-pham'); if (!box || !B) return;
    const c = B.ctrl, xong = B.cur.xong;
    const items = [
      ['goiY', '📜', 'Gợi ý', (B.goiYMienPhi ? B.goiYMienPhi + ' miễn phí' : S.inv.goiY), !xong && (B.goiYMienPhi || S.inv.goiY) && !B.cur.daGoiY],
      ['nam', '✂️', '50:50', S.inv.nam, !xong && S.inv.nam && c.coTheNam()],
      ['boQua', '👟', 'Bỏ qua', S.inv.boQua, !xong && S.inv.boQua],
      ['binhMau', '🧪', 'Hồi máu', S.inv.binhMau, B.tim != null && S.inv.binhMau && B.tim < timToiDa()]
    ];
    if (S.lopNV === 'tham-hiem') items.push(['ongNhom', '🧭', 'Ống nhòm', B.ongNhom, !xong && B.ongNhom && c.coTheLoaiBo()]);
    box.innerHTML = items.map(([id, ic, ten, sl, ok]) => '<button class="vp" data-id="' + id + '" ' + (ok ? '' : 'disabled') + '><span class="ic">' + ic + '</span><span>' + ten + '</span><b>' + sl + '</b></button>').join('');
    $$('.vp', box).forEach(b => b.onclick = () => dungVatPham(b.dataset.id, b));
  }

  function dungVatPham(id, nutEl) {
    const q = B.cur.q;
    if (id === 'goiY') {
      if (B.goiYMienPhi) B.goiYMienPhi--; else S.inv.goiY--;
      B.cur.daGoiY = true;
      const g = $('#goi-y'); g.hidden = false; g.innerHTML = '<b>📜 Gợi ý:</b> ' + H.text(q.goiY || q.loiGiai[0]);
      A.phat('trang');
    } else if (id === 'nam') { S.inv.nam--; B.ctrl.nam(); A.phat('danh'); }
    else if (id === 'ongNhom') { B.ongNhom--; B.ctrl.loaiBo(); A.phat('danh'); }
    else if (id === 'binhMau') { S.inv.binhMau--; B.tim++; A.phat('hoiMau'); bayTu(nutEl, '+1 ❤', 'bay-tim'); B.capNhat(); }
    else if (id === 'boQua') {
      S.inv.boQua--; A.phat('trang'); B.cur.xong = true;
      if (B.kieu === 'boss') { B.cur = null; luu(); hienCau(); return; }
      luu(); return tiepTheo();
    }
    luu(); veVatPham();
  }

  /** xử lý sau khi học sinh trả lời */
  function xuLy(kq) {
    const q = B.cur.q, d = S.dem;
    B.cur.xong = true;
    if (!q.sinh) S.daXem[q.id] = (S.daXem[q.id] || 0) + 1;
    const t = S.tk[q.dang] || (S.tk[q.dang] = [0, 0]);
    const vk = q.vung || B.v; S.tkVung[vk] = S.tkVung[vk] || {};
    const tv = S.tkVung[vk][q.dang] || (S.tkVung[vk][q.dang] = [0, 0]);
    const nhomDau = ['so-doi', 'nhan-chia', 'dau-ngoac', 'chuyen-ve'].includes(q.dang);
    const card = $('#the-cau');
    let thuong = '', boSung = '';

    if (kq.dung) {
      t[0]++; tv[0]++; d.dung++; B.soDung++; d.combo++; d.comboMax = Math.max(d.comboMax, d.combo);
      if (q.dang === 'cong-tru') d.congTru++;
      if (['luy-thua', 'lt-cung-co-so', 'lt-cua-lt'].includes(q.dang)) d.luyThua++;
      if (q.loai === 'bat-loi') d.batLoi++;
      if (nhomDau) d.dauChuoi++;
      const he = [1, 1.5, 2][B.muc - 1];
      const xp = Math.round((B.kieu === 'on' ? 6 : 10 * he) + Math.min(d.combo - 1, 10) * 2);
      const vang = Math.round((B.kieu === 'on' ? 2 : 3 * he) + (d.combo % 5 === 0 ? 10 : 0));
      B.xpThu += xp; B.vangThu += vang;
      A.phat('dung');
      if (d.combo >= 3 && d.combo % 5 === 0) setTimeout(() => { A.phat('combo'); thongBao('🔥 <b>Combo ×' + d.combo + '!</b> Thưởng thêm 10 vàng', 'toast-cam'); }, 250);
      congXP(xp, card); setTimeout(() => congVang(vang, $('#hud-vang')), 200);
      thuong = '<span class="chip chip-xp">+' + xp + ' XP</span><span class="chip chip-vang">+' + vang + ' <i class="xu"></i></span>' + (d.combo >= 2 ? '<span class="chip chip-combo">🔥 ×' + d.combo + '</span>' : '');
      if (d.combo >= 5) trao('combo-5'); if (d.combo >= 10) trao('combo-10'); if (d.combo >= 20) trao('combo-20');
      if (d.congTru >= 10) trao('quy-dong'); if (d.luyThua >= 15) trao('luy-thua'); if (d.batLoi >= 5) trao('tho-san-loi'); if (d.dauChuoi >= 10) trao('khong-sai-dau');
      if (B.kieu === 'on') { S.on = S.on.filter(x => x.id !== q.id); d.on++; if (d.on >= 10) trao('cham-on'); }
      if (B.kieu === 'boss') {
        const crit = d.combo >= 3 && d.combo % 3 === 0, dmg = crit ? 2 : 1;
        B.bossHp = Math.max(0, B.bossHp - dmg);
        const ta = $('#ta'), bo = $('#boss');
        if (!giamDongTac()) { ta.classList.add('tan-cong'); setTimeout(() => ta.classList.remove('tan-cong'), 500); }
        setTimeout(() => {
          A.phat('danh'); rung(bo); bo.classList.add('bi-trung'); setTimeout(() => bo.classList.remove('bi-trung'), 400);
          bayTu(bo, (crit ? 'CHÍ MẠNG −' : '−') + dmg, crit ? 'bay-chi-mang' : 'bay-dmg');
          $('#mau-boss').style.width = (B.bossHp / B.bossMax * 100) + '%'; $('#mau-boss').nextElementSibling.textContent = B.bossHp + '/' + B.bossMax;
          $('#boss-noi').textContent = B.bossHp > 0 ? pick(B.boss.trung) : '';
        }, 250);
      }
    } else {
      t[1]++; tv[1]++; d.sai++; d.combo = 0; B.soSai++;
      if (nhomDau) d.dauChuoi = 0;
      B.sai.push(q);
      if (B.kieu !== 'on' && !S.on.some(x => x.id === q.id)) { S.on.push(JSON.parse(JSON.stringify(q))); if (S.on.length > 40) S.on.shift(); }
      A.phat('sai');
      if (B.tim != null) {
        if (B.khien) { B.khien = 0; boSung = '<p class="khien-do">🛡️ Khiên rèn đã đỡ đòn, em không mất tim!</p>'; }
        else { B.tim--; setTimeout(() => A.phat('biDanh'), 150); rung($('#man')); }
      }
      if (B.kieu === 'boss') { $('#boss-noi').textContent = pick(B.boss.danh); }
    }
    luu(); B.capNhat();
    const khen = ['Chính xác!', 'Tuyệt vời!', 'Giỏi quá!', 'Quá đỉnh!', 'Xuất sắc!'];
    const ph = $('#phan-hoi');
    ph.hidden = false;
    ph.className = 'phan-hoi ' + (kq.dung ? 'ph-dung' : 'ph-sai');
    ph.innerHTML = '<div class="ph-dau"><span class="ph-ic">' + (kq.dung ? '✅' : '❌') + '</span><h3>' + (kq.dung ? pick(khen) : 'Chưa đúng rồi!') + '</h3><div class="ph-thuong">' + thuong + '</div></div>' + boSung +
      '<div class="ph-dap"><b>Đáp án:</b> ' + kq.dapAnHTML + '</div>' +
      '<div class="ph-giai"><b>Lời giải:</b><ol>' + q.loiGiai.map(x => '<li>' + H.text(x) + '</li>').join('') + '</ol></div>' +
      (!kq.dung && q.loiSai ? '<div class="ph-loi">⚠️ <b>Lỗi hay gặp:</b> ' + H.text(q.loiSai) + '</div>' : '') +
      (!kq.dung && B.kieu !== 'on' ? '<p class="phu">Câu này đã được cất vào 🕯️ Hang Ôn Tập để em luyện lại.</p>' : '') +
      '<button class="nut nut-chinh nut-to" id="tiep">Tiếp tục ▶</button>';
    $('#tiep', ph).onclick = () => { A.phat('bam'); tiepTheo(); };
    setTimeout(() => { ph.scrollIntoView({ behavior: giamDongTac() ? 'auto' : 'smooth', block: 'nearest' }); $('#tiep', ph).focus({ preventScroll: true }); }, 350);
  }

  function tiepTheo() {
    if (B.tim != null && B.tim <= 0) return manHoiSinh();
    if (B.kieu === 'boss') {
      if (B.bossHp <= 0) {
        if (B.t.boss2 && B.pha === 1) {
          B.pha = 2; B.boss = B.t.boss2; B.bossMax = B.t.boss2.mau[B.muc - 1]; B.bossHp = B.bossMax; B.cur = null;
          A.phat('bossVao');
          hop('Khoan đã…', '<p class="loi-boss">“' + esc(B.t.boss.thua) + '”</p><div class="boss-ra">' + B.boss.icon + '</div><p class="loi-boss">' + B.boss.ten + ': “' + esc(B.boss.mo) + '”</p>', [{ chu: 'Chiến đấu tiếp! ⚔️', bam: hienCau }], 'hop-boss');
          return;
        }
        return thangTran();
      }
      B.cur = null; return hienCau();
    }
    if (++B.idx >= B.ds.length) {
      // phải đúng ít nhất một nửa số câu mới vượt qua (Hang Ôn Tập thì không cần)
      if (B.kieu === 'thu-thach' && B.soDung < Math.ceil(B.ds.length / 2)) return manHoiSinh(true);
      return thangTran();
    }
    hienCau();
  }

  function manHoiSinh(chuaDat) {
    A.phat('thua');
    const m = datMan('hoi-sinh',
      '<div class="hoi-sinh"><div class="hs-ic">🧚</div><h2>' + (chuaDat ? 'Chưa đủ số câu đúng!' : 'Em đã kiệt sức!') + '</h2>' +
      (chuaDat ? '<p>Cần đúng ít nhất <b>' + Math.ceil(B.ds.length / 2) + '/' + B.ds.length + '</b> câu để vượt qua thử thách.</p>' : '') +
      '<p>Đừng lo, <b>Tiên Hồi Sinh</b> sẽ giúp em. Hãy xem lại các câu đã sai rồi thử lại nhé. Em không mất gì cả!</p>' +
      '<div class="xem-lai">' + B.sai.map((q, k) => '<details ' + (k === B.sai.length - 1 ? 'open' : '') + '><summary>' + H.text(q.de) + '</summary><ol>' + q.loiGiai.map(x => '<li>' + H.text(x) + '</li>').join('') + '</ol>' + (q.loiSai ? '<p class="ph-loi">⚠️ ' + H.text(q.loiSai) + '</p>' : '') + '</details>').join('') + '</div>' +
      '<button class="nut nut-chinh nut-to" id="lai">✨ Hồi sinh và thử lại</button><button class="nut nut-phu" id="ve">Về bản đồ vùng</button></div>', false);
    $('#lai', m).onclick = () => { A.phat('hoiMau'); const b = B; batDau(b.v, b.i, b.muc, true); };
    $('#ve', m).onclick = () => { A.phat('bam'); const v = B.v; B = null; di(() => manVung(v)); };
  }

  function soSao() {
    if (B.kieu === 'dau-tri') { const n = B.diem, mc = [[4, 7, 10], [3, 6, 9], [3, 5, 8]][B.muc - 1]; return mc.filter(x => n >= x).length; }
    if (B.kieu === 'boss') return B.soSai === 0 ? 3 : B.soSai <= 2 ? 2 : 1;
    return B.soSai === 0 ? 3 : B.soSai === 1 ? 2 : 1;
  }

  function thangTran() {
    if (!B) return;
    if (B.kieu === 'on') return ketQuaOn();
    const { v, i, muc, t } = B, sao = soSao();
    if (B.kieu === 'dau-tri' && sao === 0) return thuaDauTri();
    const cu = S.tienDo[v][i], lanDau = !cu;
    if (!cu || sao > cu.sao || (sao === cu.sao && muc > cu.muc)) S.tienDo[v][i] = { sao: Math.max(sao, cu ? cu.sao : 0), muc: Math.max(muc, cu ? cu.muc : 0) };
    const boss = t.loai === 'boss';
    const xp = (boss ? 60 : 20) * muc, vang = (boss ? 30 : 10) * muc + 5 * sao;
    B.xpThu += xp; B.vangThu += vang;
    if (muc === 3) S.dem.kho++;
    trao('buoc-dau');
    if (B.soSai === 0 && muc >= 2 && B.kieu !== 'dau-tri') trao('hoan-hao');
    if (S.dem.kho >= 5) trao('dung-cam');
    if (B.hoiSinh) trao('khong-bo-cuoc');
    if (boss) trao('diet-boss');
    if (S.tienDo[v].length === 6 && S.tienDo[v].every(x => x && x.sao === 3)) trao('ba-sao');
    luu(); guiKetQua();
    const cuoi = boss && v === 5;
    A.phat(boss ? 'thangBoss' : 'thang'); phaoHoa(boss ? 120 : 60);
    const sai = B.sai;
    const m = datMan('ket-qua',
      '<div class="ket-qua"><p class="eyebrow">' + (boss ? 'Đánh bại boss!' : 'Vượt qua thử thách') + '</p><h2>' + esc(t.ten) + '</h2>' +
      '<div class="sao-lon">' + [0, 1, 2].map(k => '<span class="sao ' + (k < sao ? 'co' : '') + '" style="animation-delay:' + (0.3 + k * 0.35) + 's">★</span>').join('') + '</div>' +
      (boss ? '<p class="loi-boss">' + B.boss.icon + ' “' + esc(B.boss.thua) + '”</p>' : '') +
      '<div class="thuong-lon"><div><b id="dem-xp">0</b><span>XP</span></div><div><b id="dem-vang">0</b><span>vàng</span></div><div><b>' + (B.kieu === 'dau-tri' ? B.diem : B.soDung) + '</b><span>câu đúng</span></div></div>' +
      (B.kieu === 'dau-tri' ? '<p>Mức ' + CT.MUC[muc] + ': cần ' + [[4, 7, 10], [3, 6, 9], [3, 5, 8]][muc - 1].join(' / ') + ' câu đúng để được 1 / 2 / 3 sao.</p>' : '') +
      (sai.length ? '<div class="cau-sai"><b>Các câu cần ôn lại (đã cất vào Hang Ôn Tập):</b>' + sai.map(q => '<details><summary>' + H.text(q.de) + '</summary><ol>' + q.loiGiai.map(x => '<li>' + H.text(x) + '</li>').join('') + '</ol></details>').join('') + '</div>' : '<p class="hoan-hao-chu">💎 Không sai câu nào. Hoàn hảo!</p>') +
      '<div class="hang-nut"><button class="nut nut-chinh nut-to" id="tiep">' + (cuoi ? 'Xem kết thúc 👑' : boss ? 'Xem tổng kết vùng ▶' : 'Tiếp tục ▶') + '</button>' +
      '<button class="nut nut-phu" id="lai">↻ Chơi lại để lấy thêm sao</button></div></div>', false);
    setTimeout(() => { for (let k = 0; k < sao; k++) setTimeout(() => A.phat('sao'), k * 350); }, 300);
    demSo($('#dem-xp', m), B.xpThu); demSo($('#dem-vang', m), B.vangThu);
    const xpThem = xp, vangThem = vang;
    setTimeout(() => { congXP(xpThem); congVang(vangThem); luu(); veHud(); }, 900);
    const b = B; B = null;
    if (lanDau && i < 5) setTimeout(() => { A.phat('moKhoa'); thongBao('🔓 Đã mở: <b>' + CT.VUNG[v - 1].thuThach[i + 1].ten + '</b>', 'toast-xanh'); }, 1500);
    $('#tiep', m).onclick = () => { A.phat('bam'); if (cuoi) di(manKetThuc); else if (boss) di(() => manKetQuaVung(v, lanDau)); else di(() => manVung(v)); };
    $('#lai', m).onclick = () => { A.phat('bam'); hopChonMuc(b.v, b.i); };
  }
  function demSo(node, den) {
    if (!node) return; const t0 = performance.now(), dur = 900;
    const f = now => { const k = Math.min(1, (now - t0) / dur); node.textContent = Math.round(den * k); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  function manKetQuaVung(v, lanDau) {
    const V = CT.VUNG[v - 1], tv = S.tkVung[v] || {};
    const ds = Object.keys(tv).map(k => ({ k, c: tv[k][0], w: tv[k][1], n: tv[k][0] + tv[k][1] })).filter(x => x.n > 0).sort((a, b) => (b.c / b.n) - (a.c / a.n));
    const manh = ds.filter(x => x.n >= 2 && x.c / x.n >= 0.8), yeu = ds.filter(x => x.c / x.n < 0.6);
    A.phat('thangBoss'); phaoHoa(100);
    const m = datMan('ket-qua-vung',
      '<div class="ket-qua"><p class="eyebrow">Giải cứu thành công</p><h2>' + V.icon + ' ' + V.ten + '</h2>' +
      '<div class="ds-tt">' + V.thuThach.map((t, i) => { const r = S.tienDo[v][i]; return '<div><span>' + esc(t.ten) + '</span><span class="sao-nho">' + (r ? '★'.repeat(r.sao) + '☆'.repeat(3 - r.sao) : '—') + '</span></div>'; }).join('') + '<div class="tong"><span>Tổng</span><b>⭐ ' + saoVung(v) + '/18</b></div></div>' +
      '<h3>Điểm mạnh</h3>' + (manh.length ? '<ul class="ds-dang manh">' + manh.map(x => '<li>💪 ' + tenDang(x.k) + ' <span>' + x.c + '/' + x.n + ' câu đúng</span></li>').join('') + '</ul>' : '<p class="phu">Chơi thêm để máy nhận ra điểm mạnh của em.</p>') +
      '<h3>Cần luyện thêm</h3>' + (yeu.length ? '<ul class="ds-dang yeu">' + yeu.map(x => '<li>📌 ' + tenDang(x.k) + ' <span>' + x.c + '/' + x.n + ' câu đúng</span></li>').join('') + '</ul>' : '<p class="phu">Không có dạng nào dưới 60%. Rất tốt!</p>') +
      '<div class="bang-dang">' + ds.map(x => '<div class="dong-dang"><span>' + tenDang(x.k) + '</span><div class="thanh"><i style="width:' + Math.round(x.c / x.n * 100) + '%"></i></div><b>' + Math.round(x.c / x.n * 100) + '%</b></div>').join('') + '</div>' +
      '<button class="nut nut-chinh nut-to" id="tiep">' + (v < 5 && lanDau ? 'Đến ' + CT.VUNG[v].ten + ' ▶' : 'Về bản đồ ▶') + '</button></div>', false);
    if (lanDau && v < 5) setTimeout(() => { A.phat('moKhoa'); thongBao('🔓 Vùng mới: <b>' + CT.VUNG[v].ten + '</b>', 'toast-xanh'); }, 1200);
    $('#tiep', m).onclick = () => { A.phat('bam'); di(lanDau && v < 5 ? () => manVung(v + 1) : manTheGioi); };
  }

  function ketQuaOn() {
    const b = B; B = null; luu(); guiKetQua();
    A.phat(b.soDung ? 'thang' : 'thua'); if (b.soDung) phaoHoa(30);
    const m = datMan('ket-qua', '<div class="ket-qua"><p class="eyebrow">Hang Ôn Tập</p><h2>Ôn xong một lượt!</h2>' +
      '<div class="thuong-lon"><div><b>' + b.soDung + '/' + b.ds.length + '</b><span>câu đúng</span></div><div><b>' + b.xpThu + '</b><span>XP</span></div><div><b>' + S.on.length + '</b><span>câu còn lại</span></div></div>' +
      '<p>' + (S.on.length ? 'Các câu còn sai vẫn ở trong hang. Hãy quay lại ôn tiếp nhé!' : 'Hang Ôn Tập đã trống. Em đã sửa hết lỗi sai!') + '</p>' +
      '<div class="hang-nut"><button class="nut nut-chinh nut-to" id="tiep">' + (S.on.length ? 'Ôn tiếp 🕯️' : 'Về bản đồ ▶') + '</button><button class="nut nut-phu" id="ve">Về bản đồ</button></div></div>', false);
    $('#tiep', m).onclick = () => { A.phat('bam'); if (S.on.length) batDauOn(); else di(manTheGioi); };
    $('#ve', m).onclick = () => { A.phat('bam'); di(manTheGioi); };
  }

  /* ===================== ĐẤU TRÍ (tính nhanh có giờ) ===================== */
  let dongHo = null;
  function dungDongHo() { if (dongHo) { clearInterval(dongHo); dongHo = null; } }
  function batDauDauTri() {
    B.tim = null; B.diem = 0; B.conLai = B.t.thoiGian * 1000; B.tong = B.conLai;
    const m = datMan('tran', '<div class="tran-dau dau-tri"><div class="tran-thanh"><button class="nut-lui" id="rut" aria-label="Rút lui">✕</button><b class="tran-ten">⏱️ ' + esc(B.t.ten) + ' · ' + CT.MUC[B.muc] + '</b><span class="diem-dt">✔ <b id="diem">0</b></span></div>' +
      '<div class="dong-ho"><i id="kim"></i><span id="giay">' + B.t.thoiGian + '</span></div>' +
      '<div class="dem-nguoc" id="dem-nguoc">3</div><div class="the-cau" id="the-cau"></div></div>', false);
    $('#rut', m).onclick = () => { dungDongHo(); const v = B.v; B = null; A.phat('bam'); di(() => manVung(v)); };
    let n = 3; A.phat('tichTac');
    const cd = setInterval(() => {
      n--; const e = $('#dem-nguoc'); if (!e) { clearInterval(cd); return; }
      if (n > 0) { e.textContent = n; A.phat('tichTac'); e.classList.remove('nay'); void e.offsetWidth; e.classList.add('nay'); }
      else { clearInterval(cd); e.remove(); A.phat('moKhoa'); cauDauTri(); chayDongHo(); }
    }, 700);
  }
  function chayDongHo() {
    let last = performance.now(), giayCu = -1;
    dongHo = setInterval(() => {
      if (!B || B.kieu !== 'dau-tri') return dungDongHo();
      const now = performance.now(); B.conLai -= now - last; last = now;
      const g = Math.max(0, Math.ceil(B.conLai / 1000));
      const kim = $('#kim'); if (kim) { kim.style.width = Math.max(0, B.conLai / B.tong * 100) + '%'; kim.classList.toggle('gap', g <= 10); }
      const gs = $('#giay'); if (gs) gs.textContent = g;
      if (g !== giayCu) { if (g <= 10 && g > 0) A.phat('tichTac'); giayCu = g; }
      if (B.conLai <= 0) { dungDongHo(); A.phat('hetGio'); setTimeout(thangTran, 400); }
    }, 100);
  }
  function cauDauTri() {
    if (!B || B.conLai <= 0) return;
    const q = SINH.sinh(B.v, B.muc, true);
    B.cur = { q, xong: false };
    B.ctrl = TT.ve($('#the-cau'), q, { onXong: kq => {
      if (!B) return;
      const t = S.tk[q.dang] || (S.tk[q.dang] = [0, 0]);
      if (kq.dung) {
        B.diem++; S.dem.combo++; S.dem.comboMax = Math.max(S.dem.comboMax, S.dem.combo); t[0]++; S.dem.dung++;
        A.phat('dung'); const x = 4 * B.muc; B.xpThu += x; B.vangThu += B.muc; S.xp += x; S.vang += B.muc;
        bayTu($('#diem'), '+1', 'bay-xp'); $('#diem').textContent = B.diem;
        if (S.dem.combo >= 5) trao('combo-5'); if (S.dem.combo >= 10) trao('combo-10');
        if (B.diem >= 10) trao('than-toc');
      } else {
        t[1]++; S.dem.sai++; S.dem.combo = 0; B.conLai -= 3000; A.phat('sai'); rung($('#the-cau'));
        bayTu($('.dong-ho'), '−3 giây', 'bay-dmg'); B.sai.push(q);
        if (!S.on.some(x => x.id === q.id)) { S.on.push(q); if (S.on.length > 40) S.on.shift(); }
        thongBao('Đáp án: ' + kq.dapAnHTML, 'toast-do');
      }
      luu(); veHud();
      setTimeout(cauDauTri, kq.dung ? 550 : 1100);
    } });
  }
  function thuaDauTri() {
    const b = B; B = null; A.phat('thua'); guiKetQua();
    const m = datMan('ket-qua', '<div class="ket-qua"><div class="hs-ic">⏰</div><h2>Hết giờ!</h2><p>Em đúng <b>' + b.diem + '</b> câu. Cần ít nhất <b>' + [4, 3, 3][b.muc - 1] + '</b> câu để vượt qua mức ' + CT.MUC[b.muc] + '.</p>' +
      (b.sai.length ? '<div class="cau-sai">' + b.sai.map(q => '<details><summary>' + H.text(q.de) + '</summary><ol>' + q.loiGiai.map(x => '<li>' + H.text(x) + '</li>').join('') + '</ol></details>').join('') + '</div>' : '') +
      '<div class="hang-nut"><button class="nut nut-chinh nut-to" id="lai">↻ Thử lại</button><button class="nut nut-phu" id="ve">Về bản đồ vùng</button></div></div>', false);
    $('#lai', m).onclick = () => { A.phat('bam'); batDau(b.v, b.i, b.muc, true); };
    $('#ve', m).onclick = () => { A.phat('bam'); di(() => manVung(b.v)); };
  }

  /* ===================== CỬA HÀNG ===================== */
  function manCuaHang() {
    const m = datMan('cua-hang', '<div class="tieu-de-man"><h2>🛒 Cửa hàng của Bác Rùa</h2><span class="chip"><i class="xu"></i> ' + S.vang + '</span></div>' +
      '<div class="npc"><span class="npc-ic">🐢</span><div class="bong-noi">Vật phẩm tốt giúp cháu vượt khó. Nhưng tự giải được vẫn là giỏi nhất nhé!</div></div>' +
      '<div class="luoi-hang">' + CT.CUA_HANG.map(it => '<div class="mon-hang"><span class="mh-ic">' + it.icon + '</span><b>' + it.ten + '</b><p>' + it.moTa + '</p><p class="co">Đang có: <b>' + S.inv[it.id] + '</b></p>' +
        '<button class="nut nut-chinh mua" data-id="' + it.id + '" ' + (S.vang < it.gia ? 'disabled' : '') + '>Mua · ' + it.gia + ' <i class="xu"></i></button></div>').join('') + '</div>', true);
    $$('.mua', m).forEach(b => b.onclick = () => {
      const it = CT.CUA_HANG.find(x => x.id === b.dataset.id);
      if (S.vang < it.gia) { A.phat('sai'); return; }
      S.vang -= it.gia; S.inv[it.id]++; luu(); A.phat('xu'); bayTu(b, '+1 ' + it.icon, 'bay-vang');
      setTimeout(manCuaHang, 300);
    });
  }

  /* ===================== HUY HIỆU ===================== */
  function manHuyHieu() {
    const co = CT.HUY_HIEU.filter(h => S.hh[h.id]).length;
    const m = datMan('huy-hieu', '<div class="tieu-de-man"><h2>🏅 Bộ sưu tập huy hiệu</h2><span class="chip">' + co + '/' + CT.HUY_HIEU.length + '</span></div>' +
      '<div class="luoi-hh">' + CT.HUY_HIEU.map(h => '<div class="hh ' + (S.hh[h.id] ? 'co' : 'chua') + '"><span class="hh-ic">' + h.icon + '</span><b>' + h.ten + '</b><span>' + h.moTa + '</span>' +
        (S.hh[h.id] ? '<i>' + new Date(S.hh[h.id]).toLocaleDateString('vi-VN') + '</i>' : '') + '</div>').join('') + '</div>', true);
    $$('.hh.co', m).forEach(e => e.onclick = () => { A.phat('huyHieu'); e.classList.remove('nay'); void e.offsetWidth; e.classList.add('nay'); });
  }

  /* ===================== HANG ÔN TẬP ===================== */
  function manHang() {
    const m = datMan('hang', '<div class="tieu-de-man"><h2>🕯️ Hang Ôn Tập</h2><span class="chip">' + S.on.length + ' câu</span></div>' +
      '<div class="npc"><span class="npc-ic">🦇</span><div class="bong-noi">Câu nào em làm sai sẽ bay vào hang này. Giải đúng thì câu đó được thả tự do!</div></div>' +
      (S.on.length ? '<button class="nut nut-chinh nut-to" id="on">Ôn ' + Math.min(5, S.on.length) + ' câu ngay</button>' +
        '<div class="ds-on">' + S.on.map(q => '<div class="muc-on"><span class="the-nho">' + (CT.LOAI[q.loai] || '') + '</span>' + H.text(q.de) + '<span class="phu">' + tenDang(q.dang) + '</span></div>').join('') + '</div>'
        : '<div class="trong">✨ Hang đang trống. Em chưa có câu sai nào cần ôn!</div>'), true);
    const b = $('#on', m); if (b) b.onclick = () => { A.phat('bam'); batDauOn(); };
  }

  /* ===================== HỒ SƠ & MÃ KẾT QUẢ ===================== */
  function taoMa() {
    const n = new Date(), ngay = n.getFullYear() * 10000 + (n.getMonth() + 1) * 100 + n.getDate();
    return MaKetQua.maHoa({ ten: S.ten, lop: S.lop, lopNV: S.lopNV, cap: cap(S.xp), xp: S.xp, sao: tongSao(), vung: soVungXong(), huyHieu: Object.keys(S.hh).length,
      dung: S.dem.dung, sai: S.dem.sai, dang: CT.DANG.map(d => S.tk[d.id] || [0, 0]), ngay });
  }

  /* ----- Gửi kết quả tự động về Google Sheets của thầy cô (xem du-lieu/cau-hinh.js) ----- */
  const CH = window.CAU_HINH || {};
  const coMayChu = () => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(CH.urlKetQua || '') || /^\/[\w-]+$/.test(CH.urlKetQua || '');
  const taoId = () => Array.from({ length: 16 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]).join('');
  let henGui = null, dangGui = false, phienGui = 0;
  /** đánh dấu cần gửi, gửi sau 1,5 giây (gộp nhiều lần thành một) */
  function guiKetQua(ngay) {
    if (!S || !coMayChu()) return;
    S.choGui = true; phienGui++; luu();
    clearTimeout(henGui); henGui = setTimeout(guiNgay, ngay ? 0 : 1500);
  }
  async function guiNgay() {
    if (!S || !S.choGui || !coMayChu()) return false;
    // đang gửi dở: hẹn gửi lại sau, KHÔNG bỏ qua kết quả mới
    if (dangGui) { clearTimeout(henGui); henGui = setTimeout(guiNgay, 1500); return false; }
    const s = S, phien = phienGui;
    if (!s.id) s.id = taoId();
    const goi = { id: s.id, ten: s.ten, lop: s.lop, cap: cap(s.xp), xp: s.xp, sao: tongSao(), vung: soVungXong(), huyHieu: Object.keys(s.hh).length, dung: s.dem.dung, sai: s.dem.sai, ma: taoMa() };
    dangGui = true;
    try {
      // no-cors: Google Apps Script nhận được dữ liệu nhưng trình duyệt không đọc được phản hồi
      await fetch(CH.urlKetQua, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(goi) });
      s.daGuiLuc = Date.now();
      if (phien === phienGui) s.choGui = false; // có kết quả mới trong lúc gửi thì giữ cờ để gửi tiếp
      if (s === S) luu();
      return true;
    } catch (e) { return false; } // mất mạng: giữ cờ choGui, lần sau gửi lại
    finally {
      dangGui = false;
      if (S && S.choGui && phien !== phienGui) { clearTimeout(henGui); henGui = setTimeout(guiNgay, 500); }
    }
  }
  window.addEventListener('online', () => guiNgay());
  const gioGui = t => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  function manHoSo() {
    const C = CT.LOP_NHAN_VAT[S.lopNV], L = cap(S.xp), tong = S.dem.dung + S.dem.sai;
    const ds = CT.DANG.map(d => ({ d, t: S.tk[d.id] || [0, 0] })).filter(x => x.t[0] + x.t[1] > 0);
    const ma = taoMa();
    const m = datMan('ho-so', '<div class="ho-so">' +
      '<div class="the-nv"><span class="avatar to">' + S.avatar + '</span><div><h2>' + esc(S.ten) + '</h2><p>' + C.icon + ' ' + C.ten + (S.lop ? ' · Lớp ' + esc(S.lop) : '') + '</p><p class="phu">' + C.kiNang + '</p></div></div>' +
      '<div class="o-so"><div><b>' + L + '</b><span>Cấp</span></div><div><b>' + S.xp + '</b><span>XP</span></div><div><b>' + tongSao() + '</b><span>Sao</span></div><div><b>' + (tong ? Math.round(S.dem.dung / tong * 100) : 0) + '%</b><span>Đúng</span></div><div><b>' + S.dem.comboMax + '</b><span>Combo cao nhất</span></div></div>' +
      '<h3>Kết quả theo dạng bài</h3>' + (ds.length ? '<div class="bang-dang">' + ds.map(x => { const n = x.t[0] + x.t[1], p = Math.round(x.t[0] / n * 100); return '<div class="dong-dang ' + (p < 60 ? 'yeu' : p >= 80 ? 'manh' : '') + '"><span>' + x.d.ten + '</span><div class="thanh"><i style="width:' + p + '%"></i></div><b>' + x.t[0] + '/' + n + '</b></div>'; }).join('') + '</div>' : '<p class="phu">Chưa có dữ liệu. Hãy chơi một thử thách!</p>') +
      (coMayChu() ? '<h3>Gửi kết quả cho thầy cô</h3><div class="o-gui"><p id="tt-gui">' + (S.choGui ? '⏳ Có kết quả mới chưa gửi.' : S.daGuiLuc ? '✅ Đã gửi tự động lúc ' + gioGui(S.daGuiLuc) + '.' : 'Kết quả sẽ tự gửi sau mỗi thử thách.') + '</p>' +
        '<button class="nut nut-chinh" id="gui-ngay">📤 Gửi ngay</button></div>' : '') +
      '<h3>Mã kết quả gửi thầy cô</h3><p class="phu">' + (coMayChu() ? 'Nếu không gửi tự động được (ví dụ mất mạng), em chép mã dưới đây gửi thầy cô.' : 'Chép mã dưới đây gửi cho thầy cô (qua Zalo, Messenger…). Mã chứa tên, lớp, XP, số sao và thống kê dạng bài.') + '</p>' +
      '<div class="o-ma"><code id="ma">' + ma + '</code><button class="nut nut-chinh" id="chep">📋 Chép mã</button></div>' +
      '<h3>Cài đặt</h3><div class="hang-nho"><button class="nut nut-phu" id="am">' + (A.tat ? '🔇 Âm thanh: tắt' : '🔊 Âm thanh: bật') + '</button><button class="nut nut-phu" id="nhac">' + (A.nhac ? '🎵 Nhạc nền: bật' : '🎵 Nhạc nền: tắt') + '</button></div>' +
      '<button class="nut nut-do" id="xoa">Chơi lại từ đầu</button></div>', true);
    $('#chep', m).onclick = () => {
      A.phat('bam');
      const ok = () => thongBao('Đã chép mã! Dán vào tin nhắn gửi thầy cô nhé.', 'toast-xanh');
      const chon = () => { const r = document.createRange(); r.selectNodeContents($('#ma', m)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); thongBao('Hãy nhấn giữ (hoặc Ctrl+C) để chép mã đang được chọn.', 'toast-cam'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ma).then(ok, chon); else chon();
    };
    const gn = $('#gui-ngay', m);
    if (gn) gn.onclick = async () => {
      A.phat('bam'); gn.disabled = true; S.choGui = true;
      const ok = await guiNgay();
      $('#tt-gui', m).textContent = ok ? '✅ Đã gửi lúc ' + gioGui(S.daGuiLuc) + '.' : '⚠️ Chưa gửi được (kiểm tra mạng). Game sẽ tự gửi lại sau.';
      if (ok) { A.phat('xu'); thongBao('Đã gửi kết quả cho thầy cô!', 'toast-xanh'); }
      gn.disabled = false;
    };
    $('#am', m).onclick = () => { A.batTat(); manHoSo(); };
    $('#nhac', m).onclick = () => { A.batTatNhac(); manHoSo(); };
    $('#xoa', m).onclick = () => {
      A.phat('bam');
      hop('Chơi lại từ đầu?', '<p>Toàn bộ tiến độ, vàng, huy hiệu của <b>' + esc(S.ten) + '</b> sẽ bị xoá và <b>không lấy lại được</b>.</p><p class="phu">Nếu cần, hãy chép mã kết quả gửi thầy cô trước.</p>',
        [{ chu: 'Xoá và chơi lại', lop: 'nut-do', bam: () => { xoaLuu(); S = null; B = null; manMoDau(); } }, { chu: 'Huỷ', lop: 'nut-phu' }]);
    };
  }

  /* ===================== KẾT THÚC GAME ===================== */
  function manKetThuc() {
    trao('cuu-vuong-quoc'); S.daPha = true; luu(); guiKetQua(true);
    A.phat('thangBoss'); phaoHoa(160); setTimeout(() => phaoHoa(100), 1500);
    const ma = taoMa();
    const m = datMan('ket-thuc', '<div class="ket-thuc"><div class="vuong-mien">👑</div><h2>Vương quốc Hữu Tỉ đã được giải cứu!</h2>' +
      CT.KET_THUC.map(x => '<p>' + H.text(x) + '</p>').join('') +
      '<div class="bang-khen"><p class="eyebrow">Bằng khen</p><h3>Hiệp sĩ Toán học</h3><p class="bk-ten">' + esc(S.ten) + '</p><p>' + (S.lop ? 'Lớp ' + esc(S.lop) + ' · ' : '') + 'Cấp ' + cap(S.xp) + ' · ⭐ ' + tongSao() + '/90 · 🏅 ' + Object.keys(S.hh).length + ' huy hiệu</p>' + theGV(true) + '</div>' +
      '<p>Gửi mã này cho thầy cô để lên bảng xếp hạng lớp:</p><div class="o-ma"><code id="ma">' + ma + '</code><button class="nut nut-chinh" id="chep">📋 Chép mã</button></div>' +
      '<p class="phu">Em có thể quay lại các vùng để săn đủ 90 sao, chơi mức Khó và giải hết Hang Ôn Tập!</p>' +
      '<button class="nut nut-chinh nut-to" id="ve">Về bản đồ ▶</button></div>', false);
    $('#chep', m).onclick = () => { A.phat('bam'); (navigator.clipboard ? navigator.clipboard.writeText(ma) : Promise.reject()).then(() => thongBao('Đã chép mã!', 'toast-xanh'), () => thongBao('Hãy chọn mã rồi chép thủ công.', 'toast-cam')); };
    $('#ve', m).onclick = () => { A.phat('bam'); di(manTheGioi); };
  }

  /* ===================== KHỞI ĐỘNG ===================== */
  document.addEventListener('pointerdown', function moKhoa() { A.moKhoa(); document.removeEventListener('pointerdown', moKhoa); }, { once: true });
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (manHienTai === 'tran' && B && B.ctrl && !B.cur.xong && B.ctrl.phimTat) {
      const k = 'abcd'.indexOf(e.key.toLowerCase()), n = '1234'.indexOf(e.key);
      if (k >= 0 || n >= 0) { B.ctrl.phimTat(k >= 0 ? k : n); e.preventDefault(); }
    }
  });

  window.TroChoi = { // dùng cho chạy thử tự động
    get S() { return S; }, get B() { return B; }, manTheGioi: () => di(manTheGioi), manVung: v => di(() => manVung(v)), batDau, luu, guiKetQua
  };
  S = null; manMoDau();
})();
