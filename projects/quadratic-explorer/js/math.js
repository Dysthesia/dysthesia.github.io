/* The mathematical engine. No DOM or graph code lives here.
 * Inputs deliberately use at most two decimal places, between -20 and 20.
 * This lets the discriminant be classified with integer arithmetic.
 * Shared with Node's built-in test runner through the export at the bottom.
 */
(function (root) {
  'use strict';
  const evaluate = (a, b, c, x) => (a * x + b) * x + c;
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  function fraction(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(Math.abs(n), d);
    n /= g; d /= g;
    return d === 1 ? String(n) : `${n}/${d}`;
  }
  function format(n) {
    if (!Number.isFinite(n)) return 'undefined';
    if (n === 0 || Object.is(n, -0)) return '0';
    if (Math.abs(n) < 0.0001 || Math.abs(n) >= 1e7) return n.toExponential(4);
    return String(Number(n.toPrecision(8)));
  }
  function analyze(a, b, c) {
    if (![a, b, c].every(Number.isFinite)) throw new Error('Enter three finite numbers.');
    if ([a, b, c].some(n => Math.abs(n) > 20 || Math.abs(n * 100 - Math.round(n * 100)) > 1e-8)) {
      throw new Error('Use coefficients from −20 to 20, with at most two decimal places.');
    }
    const A = Math.round(a * 100), B = Math.round(b * 100), C = Math.round(c * 100);
    // Normalize decimal inputs so the graph and classification use the same values.
    a = A / 100; b = B / 100; c = C / 100;
    if (A === 0) return {
      a, b, c, kind: B ? 'linear' : C ? 'constant' : 'identity',
      roots: B ? [-c / b] : [], delta: null, vertex: null,
    };
    const integerDelta = B * B - 4 * A * C;
    const delta = integerDelta / 10000;
    const h = -b / (2 * a), k = -delta / (4 * a);
    let roots = [];
    if (delta === 0) roots = [h];
    if (delta > 0) {
      // This equivalent form avoids cancellation when roots differ greatly in size.
      const q = -0.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(delta));
      roots = [q / a, c / q].sort((x, y) => x - y);
    }
    return { a, b, c, A, B, C, delta, integerDelta, kind: 'quadratic', roots, vertex: { h, k } };
  }
  function exactRoots(model) {
    const { A, B, integerDelta } = model;
    if (model.kind !== 'quadratic' || integerDelta < 0) return null;
    const s = Math.round(Math.sqrt(integerDelta));
    if (s * s !== integerDelta) return null;
    const roots = [fraction(-B - s, 2 * A), fraction(-B + s, 2 * A)];
    return [...new Set(roots)].sort((x, y) => {
      const value = r => r.split('/').reduce((a, b) => a / b);
      return value(x) - value(y);
    });
  }
  function expression(a, b, c) {
    const terms = [];
    [[a, 'x²'], [b, 'x'], [c, '']].forEach(([n, variable]) => {
      if (!n) return;
      const magnitude = Math.abs(n);
      const term = `${magnitude === 1 && variable ? '' : format(magnitude)}${variable}`;
      terms.push(`${terms.length ? (n < 0 ? ' − ' : ' + ') : (n < 0 ? '−' : '')}${term}`);
    });
    return terms.join('') || '0';
  }
  function rootAnswer(m) {
    const exact = exactRoots(m);
    if (exact) return `x = ${exact.join(' or ')}`;
    return `x ≈ ${m.roots.map(format).join(' or ')}`;
  }
  function algebraSteps(m, method) {
    const { a, b, c, delta: d, vertex } = m;
    const f = format;
    if (m.kind !== 'quadratic') return [{ title: 'This is not a quadratic', equation: `${expression(a, b, c)} = 0`, detail: a === 0 && b !== 0 ? `It is linear: x = ${f(-c / b)}. Set a to a nonzero value to explore quadratic methods.` : c === 0 ? 'Every real x satisfies this equation. Set a to a nonzero value to explore a parabola.' : 'A nonzero constant cannot equal zero. Set a to a nonzero value to explore a parabola.' }];
    if (d < 0) return [
      { title: 'Check the discriminant', equation: `Δ = (${f(b)})² − 4(${f(a)})(${f(c)}) = ${f(d)}`, detail: 'A negative discriminant means the graph does not intersect the x-axis.' },
      { title: 'No real roots', equation: 'Δ < 0', detail: 'Complex-root calculations are planned for a future version. Try the “Two roots” preset to explore real-root methods.' },
    ];
    const answer = { title: 'Read the roots', equation: rootAnswer(m), detail: d === 0 ? 'One distinct real root, with multiplicity two. The curve touches the x-axis.' : 'These are the x-coordinates where the curve crosses the x-axis. Decimal results are approximations.' };
    if (method === 'formula') return [
      { title: 'Start with the quadratic formula', equation: 'x = (−b ± √(b² − 4ac)) / (2a)', detail: 'This method works for every quadratic. We are solving over the real numbers.' },
      { title: 'Substitute the coefficients', equation: `x = (−(${f(b)}) ± √((${f(b)})² − 4(${f(a)})(${f(c)}))) / (2(${f(a)}))`, detail: `a = ${f(a)}, b = ${f(b)}, c = ${f(c)}. Keep negative coefficients in parentheses.` },
      { title: 'Simplify the discriminant', equation: `x = (${f(-b)} ± √(${f(d)})) / (${f(2 * a)})`, detail: `Δ = ${f(d)}. The ± symbol asks us to consider both signs.` }, answer,
    ];
    if (method === 'square') return [
      { title: 'Divide by a', equation: `x² + (${f(b / a)})x = ${f(-c / a)}`, detail: 'Make the coefficient of x² equal to 1, then move the constant to the right. Displayed decimals may be rounded.' },
      { title: 'Complete the square', equation: `x² + (${f(b / a)})x + (${f(b / (2 * a))})² = ${f(-c / a)} + (${f(b / (2 * a))})²`, detail: 'Halve the coefficient of x, square it, and add that amount to both sides.' },
      { title: 'Write a perfect square', equation: `(x − (${f(vertex.h)}))² = ${f(d / (4 * a * a))}`, detail: 'The left side is now a squared binomial.' },
      { title: 'Take both square roots', equation: `x = ${f(vertex.h)} ± √(${f(d / (4 * a * a))})`, detail: 'Use both the positive and negative square root, then isolate x.' }, answer,
    ];
    if (method === 'sqrt') {
      if (b !== 0) return [{ title: 'First remove the linear term', equation: 'Direct square-root method requires b = 0', detail: 'Set b to 0, try the “Square roots” preset, or use completing the square to transform this equation first.' }];
      return [
        { title: 'Isolate the squared term', equation: `${f(a)}x² = ${f(-c)}`, detail: 'Subtract the constant from both sides.' },
        { title: 'Divide by a', equation: `x² = ${f(-c / a)}`, detail: 'The expression on the right is nonnegative for the current coefficients.' },
        { title: 'Take both square roots', equation: `x = ±√(${f(-c / a)})`, detail: 'Do not forget the negative root. When the radicand is zero, both signs give zero.' }, answer,
      ];
    }
    if (method === 'factor') {
      const exact = exactRoots(m);
      if (!exact) return [{ title: 'No rational factors', equation: `Δ = ${f(d)}`, detail: 'For these rational coefficients, the roots are irrational. Factoring over the reals is possible, but this starter only demonstrates rational factors. Try the quadratic formula or completing the square.' }];
      const r = exact.length === 1 ? [exact[0], exact[0]] : exact;
      return [
        { title: 'Look for a factor pair', equation: `r₁ + r₂ = ${fraction(-m.B, m.A)};   r₁r₂ = ${fraction(m.C, m.A)}`, detail: 'In a(x − r₁)(x − r₂), expansion gives the sum −b/a and the product c/a. Find two rational numbers with these values.' },
        { title: 'Write the factors', equation: `${f(a)}(x − (${r[0]}))(x − (${r[1]})) = 0`, detail: `The pair ${r[0]} and ${r[1]} satisfies both conditions. Multiply the factors to check.` },
        { title: 'Use the zero-product property', equation: `x − (${r[0]}) = 0   or   x − (${r[1]}) = 0`, detail: 'Since a is nonzero, at least one of the other factors must equal zero.' }, answer,
      ];
    }
    return [];
  }
  function bisection(m, left, right, tolerance = 1e-7, limit = 60) {
    const f = x => evaluate(m.a, m.b, m.c, x);
    if (![left, right].every(Number.isFinite) || Math.max(Math.abs(left), Math.abs(right)) > 1e6 || left >= right) throw new Error('Choose finite endpoints with left < right, within ±1,000,000.');
    const steps = [];
    let fl = f(left), fr = f(right);
    if (fl === 0 || fr === 0) return { steps: [{ left, right, x: fl === 0 ? left : right, fx: 0 }], message: 'An endpoint is already a root.', converged: true };
    if (Math.sign(fl) === Math.sign(fr)) throw new Error('The endpoints must have opposite signs. A repeated root cannot be bracketed this way unless it is an endpoint.');
    for (let i = 0; i < limit; i++) {
      const x = left + (right - left) / 2, fx = f(x);
      steps.push({ left, right, x, fx });
      if (fx === 0 || (right - left) / 2 <= tolerance) return { steps, message: 'Converged: the root is within the requested interval tolerance.', converged: true };
      if (Math.sign(fl) !== Math.sign(fx)) { right = x; fr = fx; }
      else { left = x; fl = fx; }
    }
    return { steps, message: 'Iteration limit reached. Try a narrower interval.', converged: false };
  }
  function newton(m, initial, tolerance = 1e-7, limit = 30) {
    if (!Number.isFinite(initial) || Math.abs(initial) > 1e6) throw new Error('Choose a finite starting value within ±1,000,000.');
    const steps = [];
    let x = initial;
    for (let i = 0; i < limit; i++) {
      const fx = evaluate(m.a, m.b, m.c, x), slope = 2 * m.a * x + m.b;
      if (fx === 0) return { steps: [...steps, { x, fx, slope, next: x }], message: 'A root has been reached.', converged: true };
      if (Math.abs(slope) < 1e-14) return { steps, message: 'Stopped: the tangent is horizontal. Choose a starting point away from the vertex.', converged: false };
      const next = x - fx / slope;
      if (!Number.isFinite(next) || Math.abs(next) > 1e12) return { steps, message: 'Stopped: the estimate diverged. Try a different starting point.', converged: false };
      steps.push({ x, fx, slope, next });
      if (Math.abs(next - x) <= tolerance && Math.abs(evaluate(m.a, m.b, m.c, next)) <= tolerance) return { steps, message: 'Converged: both the step and residual are within tolerance.', converged: true };
      x = next;
    }
    return { steps, message: 'Iteration limit reached. This starting point did not meet the tolerance.', converged: false };
  }
  const api = { analyze, evaluate, format, expression, exactRoots, rootAnswer, algebraSteps, bisection, newton };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Quadratic = api;
})(typeof window !== 'undefined' ? window : globalThis);
