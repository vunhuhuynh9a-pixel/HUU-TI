/* am-thanh.js — Âm thanh tổng hợp bằng Web Audio API (không cần file âm thanh). */
(function (root) {
  'use strict';
  let ctx = null, master = null, musicGain = null, musicTimer = null;
  const st = { tat: false, nhac: false };
  try { const s = JSON.parse(localStorage.getItem('htq-am-thanh') || '{}'); st.tat = !!s.tat; st.nhac = !!s.nhac; } catch (e) {}
  const save = () => { try { localStorage.setItem('htq-am-thanh', JSON.stringify(st)); } catch (e) {} };

  function ac() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  /** một nốt: tần số, bắt đầu sau t giây, độ dài, kiểu sóng, âm lượng */
  function tone(f, t, len, type, vol, slideTo, dest) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (t || 0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + len);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + len + 0.05);
  }
  function noise(t, len, vol, hp) {
    const c = ac(); if (!c) return;
    const b = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter();
    fl.type = 'highpass'; fl.frequency.value = hp || 800; s.buffer = b; g.gain.value = vol || 0.2;
    s.connect(fl); fl.connect(g); g.connect(master); s.start(c.currentTime + (t || 0));
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // số MIDI → Hz

  const SFX = {
    bam:     () => tone(660, 0, 0.06, 'triangle', 0.18),
    chon:    () => { tone(520, 0, 0.05, 'square', 0.08); tone(780, 0.04, 0.06, 'square', 0.06); },
    tha:     () => tone(330, 0, 0.08, 'triangle', 0.15, 440),
    dung:    () => { [72, 76, 79].forEach((n, i) => tone(N(n), i * 0.07, 0.18, 'triangle', 0.25)); },
    sai:     () => { tone(220, 0, 0.18, 'sawtooth', 0.12, 150); tone(160, 0.12, 0.25, 'sawtooth', 0.1, 110); },
    danh:    () => { noise(0, 0.12, 0.35, 1200); tone(180, 0, 0.12, 'square', 0.15, 80); },
    biDanh:  () => { noise(0, 0.2, 0.3, 300); tone(140, 0, 0.3, 'sawtooth', 0.15, 60); },
    xu:      () => { tone(N(88), 0, 0.07, 'square', 0.08); tone(N(93), 0.06, 0.16, 'square', 0.08); },
    combo:   () => { [76, 79, 83, 88].forEach((n, i) => tone(N(n), i * 0.05, 0.12, 'square', 0.09)); },
    lenCap:  () => { [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), i * 0.07, 0.22, 'triangle', 0.22)); },
    sao:     () => tone(N(84), 0, 0.25, 'sine', 0.2, N(96)),
    moKhoa:  () => { tone(N(67), 0, 0.1, 'triangle', 0.2); tone(N(74), 0.08, 0.1, 'triangle', 0.2); tone(N(79), 0.16, 0.3, 'triangle', 0.2); },
    hoiMau:  () => { [67, 71, 74, 79].forEach((n, i) => tone(N(n), i * 0.06, 0.2, 'sine', 0.2)); },
    tichTac: () => tone(1200, 0, 0.03, 'square', 0.05),
    hetGio:  () => { tone(440, 0, 0.15, 'square', 0.12); tone(330, 0.15, 0.15, 'square', 0.12); tone(220, 0.3, 0.4, 'square', 0.12); },
    thang:   () => { [60, 64, 67, 72, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), i * 0.09, 0.3, 'triangle', 0.22)); },
    thangBoss: () => {
      [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79, 84]].forEach((ch, i) => ch.forEach(n => tone(N(n), i * 0.28, i === 3 ? 0.9 : 0.3, 'triangle', 0.13)));
      noise(1.0, 0.5, 0.15, 3000);
    },
    thua:    () => { [67, 63, 60, 55].forEach((n, i) => tone(N(n), i * 0.18, 0.3, 'triangle', 0.18)); },
    bossVao: () => { tone(N(40), 0, 0.8, 'sawtooth', 0.15, N(35)); tone(N(47), 0.1, 0.7, 'sawtooth', 0.1, N(42)); noise(0, 0.6, 0.15, 200); },
    trang:   () => tone(500, 0, 0.12, 'sine', 0.08, 800),
    huyHieu: () => { [79, 84, 88, 91].forEach((n, i) => tone(N(n), i * 0.08, 0.3, 'sine', 0.18)); }
  };

  /* Nhạc nền nhẹ (tuỳ chọn) — vòng giai điệu ngũ cung */
  const MELODY = [72, 74, 76, 79, 76, 74, 72, 69, 67, 69, 72, 74, 76, 74, 72, 72];
  const BASS = [48, 48, 45, 45, 41, 41, 43, 43];
  function startMusic() {
    if (musicTimer || st.tat || !st.nhac || !ac()) return;
    musicGain = ctx.createGain(); musicGain.gain.value = 0.18; musicGain.connect(master);
    let i = 0;
    const step = () => {
      tone(N(MELODY[i % MELODY.length]), 0, 0.28, 'triangle', 0.18, null, musicGain);
      if (i % 2 === 0) tone(N(BASS[(i / 2) % BASS.length]), 0, 0.5, 'sine', 0.25, null, musicGain);
      i++;
    };
    step(); musicTimer = setInterval(step, 300);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; if (musicGain) { try { musicGain.disconnect(); } catch (e) {} musicGain = null; } }

  root.AmThanh = {
    phat(ten) { if (st.tat) return; try { SFX[ten] && SFX[ten](); } catch (e) {} },
    get tat() { return st.tat; },
    get nhac() { return st.nhac; },
    batTat() { st.tat = !st.tat; save(); if (st.tat) stopMusic(); else { startMusic(); this.phat('bam'); } return st.tat; },
    batTatNhac() { st.nhac = !st.nhac; save(); if (st.nhac) startMusic(); else stopMusic(); return st.nhac; },
    /** gọi sau lần chạm đầu tiên của người chơi (trình duyệt chỉ cho phát âm thanh sau thao tác) */
    moKhoa() { ac(); startMusic(); }
  };
})(window);
