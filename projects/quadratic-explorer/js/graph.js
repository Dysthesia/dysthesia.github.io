/* A small Canvas renderer, kept separate from the mathematics and UI. */
(function () {
  'use strict';
  const Q = window.Quadratic;
  class CurveGraph {
    constructor(canvas, tooltip) {
      this.canvas = canvas;
      this.tooltip = tooltip;
      this.ctx = canvas.getContext('2d');
      this.options = { roots: true, vertex: true, axis: true };
      this.overlay = null;
      this.pointer = null;
      new ResizeObserver(() => this.draw()).observe(canvas.parentElement);
      canvas.addEventListener('pointermove', event => {
        const rect = canvas.getBoundingClientRect();
        this.pointer = event.clientX - rect.left;
        this.draw();
      });
      canvas.addEventListener('pointerleave', () => { this.pointer = null; tooltip.hidden = true; this.draw(); });
    }
    setModel(model) { this.model = model; this.overlay = null; this.fit(); }
    fit() {
      const m = this.model;
      if (!m) return;
      if (m.kind !== 'quadratic') {
        const radius = Math.max(5, Math.min(50, Math.abs(m.roots[0] || 0) + 2));
        this.bounds = { xmin: -radius, xmax: radius, ymin: -Math.max(5, Math.abs(m.c) + 2), ymax: Math.max(5, Math.abs(m.c) + 2) };
      } else {
        const { h, k } = m.vertex;
        const rootDistance = m.roots.length ? Math.max(...m.roots.map(x => Math.abs(x - h))) : 0;
        const half = Math.max(2.5, rootDistance * 1.5, Math.min(Math.abs(h) + 1, 12));
        const rise = Math.max(3, Math.abs(k) * 0.45, Math.abs(m.a) * half * half * 0.65);
        this.bounds = { xmin: h - half, xmax: h + half,
          ymin: m.a > 0 ? Math.min(k, 0) - rise * 0.15 : Math.min(0, k - rise),
          ymax: m.a > 0 ? Math.max(0, k + rise) : Math.max(k, 0) + rise * 0.15 };
      }
      this.draw();
    }
    zoom(factor) {
      const b = this.bounds;
      const x = (b.xmin + b.xmax) / 2, y = (b.ymin + b.ymax) / 2;
      const w = Math.min(1e7, Math.max(.01, (b.xmax - b.xmin) * factor));
      const h = Math.min(1e10, Math.max(.01, (b.ymax - b.ymin) * factor));
      this.bounds = { xmin: x - w / 2, xmax: x + w / 2, ymin: y - h / 2, ymax: y + h / 2 };
      this.draw();
    }
    draw() {
      if (!this.model || !this.bounds) return;
      const canvas = this.canvas, ctx = this.ctx;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);
      const b = this.bounds, m = this.model;
      const pad = { l: 45, r: 20, t: 18, b: 30 };
      const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
      const X = x => pad.l + (x - b.xmin) / (b.xmax - b.xmin) * pw;
      const Y = y => pad.t + (b.ymax - y) / (b.ymax - b.ymin) * ph;
      const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
      const axisY = clamp(Y(0), pad.t, h - pad.b), axisX = clamp(X(0), pad.l, w - pad.r);
      const line = (x1, y1, x2, y2, color, width = 1) => {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width;
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };
      const tickStep = (span, count) => {
        const base = 10 ** Math.floor(Math.log10(span / count));
        return [1, 2, 5, 10].map(n => n * base).find(n => n >= span / count);
      };
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
      ctx.font = '11px system-ui'; ctx.fillStyle = '#77879b';
      const dx = tickStep(b.xmax - b.xmin, w < 500 ? 6 : 10), dy = tickStep(b.ymax - b.ymin, 6);
      for (let x = Math.ceil(b.xmin / dx) * dx; x <= b.xmax + dx / 100; x += dx) {
        line(X(x), pad.t, X(x), h - pad.b, '#edf1f6');
        ctx.textAlign = 'center'; ctx.fillText(Q.format(Math.abs(x) < dx / 100 ? 0 : x), X(x), h - 10);
      }
      for (let y = Math.ceil(b.ymin / dy) * dy; y <= b.ymax + dy / 100; y += dy) {
        line(pad.l, Y(y), w - pad.r, Y(y), '#edf1f6');
        ctx.textAlign = 'right'; ctx.fillText(Q.format(Math.abs(y) < dy / 100 ? 0 : y), pad.l - 8, Y(y) + 4);
      }
      if (b.ymin <= 0 && b.ymax >= 0) line(pad.l, axisY, w - pad.r, axisY, '#b5c1d1', 1.2);
      if (b.xmin <= 0 && b.xmax >= 0) line(axisX, pad.t, axisX, h - pad.b, '#b5c1d1', 1.2);
      ctx.fillStyle = '#617187'; ctx.textAlign = 'right'; ctx.fillText('x', w - 6, axisY - 7);
      ctx.textAlign = 'left'; ctx.fillText('y', axisX + 7, 12);
      ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, pw, ph); ctx.clip();
      if (this.options.axis && m.vertex) {
        ctx.setLineDash([4, 5]); line(X(m.vertex.h), pad.t, X(m.vertex.h), h - pad.b, '#a0b0c7'); ctx.setLineDash([]);
      }
      // Sampling is for drawing only; roots come from the mathematical engine.
      ctx.beginPath(); ctx.strokeStyle = '#285ce1'; ctx.lineWidth = 2.7;
      for (let i = 0; i <= 500; i++) {
        const x = b.xmin + i / 500 * (b.xmax - b.xmin), y = Q.evaluate(m.a, m.b, m.c, x);
        const py = clamp(Y(y), -1e6, 1e6);
        if (i === 0) ctx.moveTo(X(x), py); else ctx.lineTo(X(x), py);
      }
      ctx.stroke();
      const dot = (x, y, color, r = 5) => {
        ctx.beginPath(); ctx.arc(X(x), Y(y), r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      };
      if (this.overlay) {
        const o = this.overlay;
        if (o.type === 'bisect') {
          ctx.fillStyle = '#285ce110'; ctx.fillRect(X(o.left), pad.t, X(o.right) - X(o.left), ph);
          ctx.setLineDash([5, 4]);
          [o.left, o.right].forEach(x => line(X(x), pad.t, X(x), h - pad.b, '#8a6ad1'));
          ctx.setLineDash([]); dot(o.x, o.fx, '#8a6ad1', 6);
        } else {
          const tangent = x => o.fx + o.slope * (x - o.x);
          line(X(b.xmin), Y(tangent(b.xmin)), X(b.xmax), Y(tangent(b.xmax)), '#8a6ad1', 1.8);
          dot(o.x, o.fx, '#8a6ad1', 6); dot(o.next, 0, '#8a6ad1', 4);
        }
      }
      if (this.options.roots) m.roots.forEach(x => dot(x, 0, '#087c64'));
      if (this.options.vertex && m.vertex) dot(m.vertex.h, m.vertex.k, '#ce6b32', 4.5);
      if (this.pointer !== null && this.pointer >= pad.l && this.pointer <= w - pad.r) {
        const x = b.xmin + (this.pointer - pad.l) / pw * (b.xmax - b.xmin), y = Q.evaluate(m.a, m.b, m.c, x);
        ctx.setLineDash([2, 4]); line(X(x), pad.t, X(x), h - pad.b, '#b0becf'); ctx.setLineDash([]);
        if (y >= b.ymin && y <= b.ymax) dot(x, y, '#285ce1', 4);
        this.tooltip.textContent = `x = ${Q.format(x)}   ·   f(x) = ${Q.format(y)}`; this.tooltip.hidden = false;
      } else this.tooltip.hidden = true;
      ctx.restore();
      const label = (x, y, content, color, offset) => {
        if (x < b.xmin || x > b.xmax || y < b.ymin || y > b.ymax) return;
        ctx.font = '11px system-ui'; ctx.fillStyle = color; ctx.textAlign = 'center';
        ctx.fillText(content, clamp(X(x), 65, w - 50), clamp(Y(y) + offset, 15, h - 33));
      };
      if (this.options.roots) m.roots.forEach((x, i) => label(x, 0, Q.format(x), '#087c64', -13 - (i && m.roots.length === 2 && Math.abs(X(x) - X(m.roots[0])) < 45 ? 15 : 0)));
      if (this.options.vertex && m.vertex) label(m.vertex.h, m.vertex.k, 'vertex', '#a75525', m.a > 0 ? 20 : -16);
      canvas.setAttribute('aria-label', `Graph of f(x) = ${Q.expression(m.a, m.b, m.c)}. ${m.kind === 'quadratic' ? `Vertex (${Q.format(m.vertex.h)}, ${Q.format(m.vertex.k)}). ${m.roots.length} distinct real roots.` : `This is a ${m.kind} function.`} Y-intercept (${Q.format(0)}, ${Q.format(m.c)}).`);
    }
  }
  window.CurveGraph = CurveGraph;
})();
