/* =====================================================================
   phan-so.js — Phân số CHÍNH XÁC (không dùng số thực) và bộ đọc biểu thức.
   Dùng chung cho game, trang kiểm tra câu hỏi và trang giáo viên.

   Cú pháp biểu thức (viết trong {{ ... }} ở câu hỏi):
     1/2        phân số (gạch ngang)          (-3)/4   → tử là −3
     -3/4       dấu trừ đứng trước phân số     0,25     số thập phân (dấu phẩy)
     a * b      nhân (hiện dấu chấm ·)         a : b    chia (hiện dấu :)
     a^3        luỹ thừa (số mũ tự nhiên)      (...)  [...]  ngoặc tròn, vuông
     2x         nhân ngầm với chữ              =  <  >  <=  >=  !=  so sánh
     Có thể viết chuỗi: 1/2 + 1/3 = 3/6 + 2/6 = 5/6
   Thứ tự ưu tiên: luỹ thừa → phân số → dấu trừ đứng trước → nhân, chia → cộng, trừ.
   Vì vậy -3^2 = −9 (đúng quy ước Toán học), còn (-3)^2 = 9.
   ===================================================================== */
(function (root) {
  'use strict';

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; }
  function safe(n) { if (!Number.isSafeInteger(n)) throw new Error('Số quá lớn để tính chính xác'); return n; }

  class Frac {
    constructor(n, d = 1) {
      if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error('Tử và mẫu phải là số nguyên');
      if (d === 0) throw new Error('Mẫu số bằng 0');
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d) || 1;
      this.n = safe(n / g) + 0; // +0 để bỏ −0
      this.d = safe(d / g);
    }
    static of(v) { return v instanceof Frac ? v : new Frac(v, 1); }
    add(o) { return new Frac(safe(this.n * o.d + o.n * this.d), safe(this.d * o.d)); }
    sub(o) { return new Frac(safe(this.n * o.d - o.n * this.d), safe(this.d * o.d)); }
    mul(o) { return new Frac(safe(this.n * o.n), safe(this.d * o.d)); }
    div(o) { if (o.n === 0) throw new Error('Chia cho 0'); return new Frac(safe(this.n * o.d), safe(this.d * o.n)); }
    neg() { return new Frac(-this.n, this.d); }
    inv() { if (this.n === 0) throw new Error('0 không có số nghịch đảo'); return new Frac(this.d, this.n); }
    abs() { return new Frac(Math.abs(this.n), this.d); }
    pow(e) {
      e = Frac.of(e);
      if (e.d !== 1 || e.n < 0) throw new Error('Số mũ phải là số tự nhiên');
      if (e.n === 0 && this.n === 0) throw new Error('0^0 không xác định');
      let r = new Frac(1);
      for (let i = 0; i < e.n; i++) r = r.mul(this);
      return r;
    }
    cmp(o) { return Math.sign(this.n * o.d - o.n * this.d); }
    eq(o) { return o instanceof Frac && this.n === o.n && this.d === o.d; }
    isInt() { return this.d === 1; }
    sign() { return Math.sign(this.n); }
    /** "-3/4" — dạng máy đọc được (đọc lại bằng parse) */
    toString() { return this.d === 1 ? String(this.n) : this.n + '/' + this.d; }
    /** "−3/4" — dạng hiển thị chữ thường */
    toText() { return this.toString().replace('-', '−'); }
    toLatex() {
      const s = this.n < 0 ? '-' : '', a = Math.abs(this.n);
      return this.d === 1 ? s + a : s + '\\dfrac{' + a + '}{' + this.d + '}';
    }
    /** Số thập phân hữu hạn (nếu có), ví dụ "−0,25"; trả về null nếu là số thập phân vô hạn */
    toDecimalText() {
      let d = this.d, k = 0;
      while (d % 2 === 0) { d /= 2; k++; } let j = 0;
      while (d % 5 === 0) { d /= 5; j++; }
      if (d !== 1) return null;
      const p = Math.max(k, j), scaled = Math.abs(this.n) * Math.pow(10, p) / this.d;
      let s = String(Math.round(scaled));
      if (p > 0) { s = s.padStart(p + 1, '0'); s = s.slice(0, -p) + ',' + s.slice(-p); }
      return (this.n < 0 ? '−' : '') + s;
    }
  }

  /* ---------------- Tách từ ---------------- */
  function tokenize(src) {
    const s = String(src), out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/\d/.test(c)) {
        let j = i; while (j < s.length && /\d/.test(s[j])) j++;
        if ((s[j] === ',' || s[j] === '.') && /\d/.test(s[j + 1] || '')) { j++; while (j < s.length && /\d/.test(s[j])) j++; }
        out.push({ k: 'num', v: s.slice(i, j) }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) { out.push({ k: 'var', v: c }); i++; continue; }
      const two = s.slice(i, i + 2);
      if (two === '<=' || two === '>=' || two === '!=') { out.push({ k: 'cmp', v: two }); i += 2; continue; }
      if ('=<>≤≥≠'.includes(c)) { out.push({ k: 'cmp', v: { '≤': '<=', '≥': '>=', '≠': '!=' }[c] || c }); i++; continue; }
      if ('+-−–'.includes(c)) { out.push({ k: 'op', v: c === '+' ? '+' : '-' }); i++; continue; }
      if ('*·×'.includes(c)) { out.push({ k: 'op', v: '*' }); i++; continue; }
      if (':÷'.includes(c)) { out.push({ k: 'op', v: ':' }); i++; continue; }
      if ('/^()[]'.includes(c)) { out.push({ k: c }); i++; continue; }
      throw new Error('Kí tự không hợp lệ "' + c + '" trong: ' + s);
    }
    return out;
  }

  function numFromRaw(raw) {
    const m = raw.split(/[.,]/);
    if (m.length === 1) return new Frac(parseInt(m[0], 10));
    return new Frac(parseInt(m[0] + m[1], 10), Math.pow(10, m[1].length));
  }

  /* ---------------- Phân tích cú pháp ---------------- */
  function parse(src) {
    const t = tokenize(src);
    let p = 0;
    const peek = () => t[p], next = () => t[p++];
    const isOp = v => peek() && peek().k === 'op' && peek().v === v;
    const startsAtom = () => peek() && (peek().k === 'var' || peek().k === '(' || peek().k === '[');

    function top() {
      const items = [add()], ops = [];
      while (peek() && peek().k === 'cmp') { ops.push(next().v); items.push(add()); }
      if (p < t.length) throw new Error('Thừa kí tự ở cuối biểu thức: ' + src);
      return ops.length ? { t: 'chain', items, ops } : items[0];
    }
    function add() {
      let a = mul();
      while (isOp('+') || isOp('-')) { const op = next().v; a = { t: 'bin', op, a, b: mul() }; }
      return a;
    }
    function mul() {
      let a = unary();
      for (;;) {
        if (isOp('*') || isOp(':')) { const op = next().v; a = { t: 'bin', op, a, b: unary() }; }
        else if (startsAtom()) a = { t: 'bin', op: 'imp', a, b: frac() };
        else return a;
      }
    }
    function unary() {
      if (isOp('-')) { next(); return { t: 'neg', a: unary() }; }
      if (isOp('+')) { next(); return unary(); }
      return frac();
    }
    function frac() {
      let a = pow();
      while (peek() && peek().k === '/') {
        next();
        let b;
        if (isOp('-')) { next(); b = { t: 'neg', a: pow() }; } else b = pow();
        a = { t: 'bin', op: '/', a, b };
      }
      return a;
    }
    function pow() {
      const base = atom();
      if (peek() && peek().k === '^') { next(); return { t: 'pow', a: base, b: pow() }; }
      return base;
    }
    function atom() {
      const k = next();
      if (!k) throw new Error('Biểu thức bị thiếu: ' + src);
      if (k.k === 'num') return { t: 'num', raw: k.v, v: numFromRaw(k.v) };
      if (k.k === 'var') return { t: 'var', v: k.v };
      if (k.k === '(' || k.k === '[') {
        const close = k.k === '(' ? ')' : ']';
        const e = add();
        const c = next();
        if (!c || c.k !== close) throw new Error('Thiếu dấu đóng ngoặc "' + close + '" trong: ' + src);
        return { t: 'par', k: k.k, a: e };
      }
      throw new Error('Không đọc được biểu thức: ' + src);
    }
    return top();
  }

  /* ---------------- Tính giá trị ---------------- */
  function cmpOk(op, a, b) {
    const c = a.cmp(b);
    return { '=': c === 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0, '!=': c !== 0 }[op];
  }
  function evaluate(n, env) {
    env = env || {};
    switch (n.t) {
      case 'num': return n.v;
      case 'var':
        if (!(n.v in env)) throw new Error('Chưa biết giá trị của ' + n.v);
        return Frac.of(env[n.v]);
      case 'neg': return evaluate(n.a, env).neg();
      case 'par': return evaluate(n.a, env);
      case 'pow': return evaluate(n.a, env).pow(evaluate(n.b, env));
      case 'bin': {
        const a = evaluate(n.a, env), b = evaluate(n.b, env);
        switch (n.op) {
          case '+': return a.add(b);
          case '-': return a.sub(b);
          case '*': case 'imp': return a.mul(b);
          case ':': case '/': return a.div(b);
        }
        break;
      }
      case 'chain': {
        const v = n.items.map(x => evaluate(x, env));
        return n.ops.every((op, i) => cmpOk(op, v[i], v[i + 1]));
      }
    }
    throw new Error('Nút không hợp lệ');
  }

  function vars(n, set) {
    set = set || new Set();
    if (!n) return set;
    if (n.t === 'var') set.add(n.v);
    ['a', 'b'].forEach(k => n[k] && typeof n[k] === 'object' && vars(n[k], set));
    if (n.items) n.items.forEach(x => vars(x, set));
    return set;
  }

  /** Nghiệm của phương trình bậc nhất ẩn x (dạng chain có đúng một dấu "="). null nếu không phải bậc nhất. */
  function solveX(n) {
    if (n.t !== 'chain' || n.ops.length !== 1 || n.ops[0] !== '=') return null;
    const f = x => evaluate(n.items[0], { x }).sub(evaluate(n.items[1], { x }));
    try {
      const f0 = f(new Frac(0)), f1 = f(new Frac(1)), k = f1.sub(f0);
      if (k.n === 0) return null;
      // kiểm tra thêm hai điểm để chắc chắn f là bậc nhất
      for (const t of [2, -3, 7]) if (!f(new Frac(t)).eq(f0.add(k.mul(new Frac(t))))) return null;
      return f0.neg().div(k);
    } catch (e) { return null; }
  }

  /* ---------------- Viết ra LaTeX để KaTeX hiển thị ---------------- */
  const CMP_TEX = { '=': '=', '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge', '!=': '\\ne' };
  function strip(n) { return n.t === 'par' && n.k === '(' ? n.a : n; }
  function toLatex(n) {
    switch (n.t) {
      case 'num': return n.raw.replace(/[.,]/, '{,}');
      case 'var': return n.v;
      case 'neg': return '-' + toLatex(n.a);
      case 'par': return n.k === '(' ? '\\left(' + toLatex(n.a) + '\\right)' : '\\left[' + toLatex(n.a) + '\\right]';
      case 'pow': return toLatex(n.a) + '^{' + toLatex(strip(n.b)) + '}';
      case 'bin':
        switch (n.op) {
          case '+': return toLatex(n.a) + '+' + toLatex(n.b);
          case '-': return toLatex(n.a) + '-' + toLatex(n.b);
          case '*': return toLatex(n.a) + '\\cdot ' + toLatex(n.b);
          case ':': return toLatex(n.a) + '\\mathbin{:}' + toLatex(n.b);
          case 'imp': return toLatex(n.a) + toLatex(n.b);
          case '/': return '\\dfrac{' + toLatex(strip(n.a)) + '}{' + toLatex(strip(n.b)) + '}';
        }
        break;
      case 'chain': return n.items.map((x, i) => (i ? CMP_TEX[n.ops[i - 1]] : '') + toLatex(x)).join('');
    }
    return '';
  }

  /** Phân số viết dưới dạng hai số nguyên (vd "-4/6") có tối giản không. null nếu không phải dạng đó. */
  function literalReduced(n) {
    let neg = false;
    if (n.t === 'neg') { neg = true; n = n.a; }
    if (n.t === 'num') return /[.,]/.test(n.raw) ? null : true;
    if (n.t !== 'bin' || n.op !== '/') return null;
    const intOf = m => {
      if (m.t === 'par') m = m.a;
      let s = 1; if (m.t === 'neg') { s = -1; m = m.a; }
      return m.t === 'num' && !/[.,]/.test(m.raw) ? s * parseInt(m.raw, 10) : null;
    };
    const a = intOf(n.a), b = intOf(n.b);
    if (a === null || b === null) return null;
    return gcd(a, b) === 1 && b > 0;
  }

  /** Đọc câu trả lời học sinh nhập: chấp nhận -1/2, −1/2, -0,5, -0.5, 3/-6, x = 1/2 ... Trả về Frac hoặc null. */
  function parseAnswer(str) {
    if (str == null) return null;
    let s = String(str).trim().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/^x=/i, '');
    if (!s) return null;
    if (!/^[-+]?\(?[-+]?\d+([.,]\d+)?\)?(\/\(?[-+]?\d+([.,]\d+)?\)?)?$/.test(s)) return null;
    try { const v = evaluate(parse(s)); return v instanceof Frac ? v : null; } catch (e) { return null; }
  }

  /** Thử đọc chuỗi như một biểu thức; trả về cây hoặc null */
  function tryParse(s) { try { return parse(s); } catch (e) { return null; } }

  /** Giá trị của chuỗi biểu thức không chứa chữ (vd "-3/4", "0,5", "(2/3)^2"), null nếu không tính được */
  function valueOf(s) {
    const n = tryParse(s);
    if (!n || n.t === 'chain' || vars(n).size) return null;
    try { return evaluate(n); } catch (e) { return null; }
  }

  root.PhanSo = { Frac, gcd, tokenize, parse, tryParse, evaluate, vars, solveX, toLatex, literalReduced, parseAnswer, valueOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PhanSo;
})(typeof window !== 'undefined' ? window : globalThis);
