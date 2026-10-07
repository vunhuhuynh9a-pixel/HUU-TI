/* hien-thi.js — Biến chữ có công thức thành HTML (dùng KaTeX).
   Trong câu hỏi:  {{biểu thức}}  → tự viết thành công thức (xem phan-so.js)
                   $LaTeX$        → công thức LaTeX tuỳ ý, ví dụ $\mathbb{Q}$, $x \in \mathbb{Z}$
                   **chữ đậm**    → chữ đậm;  xuống dòng bằng \n                                  */
(function (root) {
  'use strict';
  const PS = root.PhanSo;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  /* ℚ ℤ ℕ ℝ được viết bằng kí tự Unicode bên ngoài KaTeX, để luôn hiện đúng dù thiếu phông KaTeX */
  const BB = { Q: 'ℚ', Z: 'ℤ', N: 'ℕ', R: 'ℝ' };
  function tex(latex) {
    const parts = String(latex).split(/\\mathbb\{([QZNR])\}/);
    if (parts.length > 1) return parts.map((p, i) => i % 2 ? '<span class="chu-bb">' + BB[p] + '</span>' : (p.trim() ? texMot(p) : '')).join('');
    return texMot(latex);
  }
  function texMot(latex) {
    if (!root.katex) return '<code>' + esc(latex) + '</code>';
    try { return root.katex.renderToString(latex, { throwOnError: false, output: 'html', strict: false }); }
    catch (e) { return '<code>' + esc(latex) + '</code>'; }
  }
  function expr(src) {
    try { return tex(PS.toLatex(PS.parse(src))); }
    catch (e) { return '<span class="loi-cong-thuc" title="' + esc(e.message) + '">' + esc(src) + '</span>'; }
  }
  function plain(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }
  /** Chữ có xen công thức */
  function text(s) {
    if (s == null) return '';
    s = String(s);
    let out = '', last = 0;
    const re = /\{\{([\s\S]+?)\}\}|\$([^$]+)\$/g;
    let m;
    while ((m = re.exec(s))) {
      out += plain(s.slice(last, m.index));
      out += m[1] != null ? expr(m[1]) : tex(m[2]);
      last = re.lastIndex;
    }
    return out + plain(s.slice(last));
  }
  /** Một giá trị/phương án: nếu cả chuỗi là biểu thức thì hiện thành công thức, ngược lại hiện như chữ */
  function value(s) {
    s = String(s);
    if (!/[{}$]/.test(s) && /^[\d\s+\-−*·:/^()[\],.x=<>≤≥]+$/.test(s) && PS.tryParse(s)) return expr(s);
    return text(s);
  }
  /** Trích các biểu thức {{...}} trong một chuỗi */
  function exprsIn(s) {
    const out = [], re = /\{\{([\s\S]+?)\}\}/g; let m;
    while ((m = re.exec(String(s || '')))) out.push(m[1]);
    return out;
  }

  root.HienThi = { esc, tex, expr, text, value, exprsIn };
})(typeof window !== 'undefined' ? window : globalThis);
