const { test } = require('node:test');
const assert = require('node:assert/strict');
const Q = require('../js/math.js');
const close = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) < tolerance, `${a} should be close to ${b}`);

test('two real roots and vertex', () => {
  const m = Q.analyze(1, -5, 6);
  assert.deepEqual(m.roots, [2, 3]); assert.equal(m.delta, 1);
  assert.deepEqual(m.vertex, { h: 2.5, k: -.25 });
});
test('repeated root, including decimal discriminant exactly zero', () => {
  assert.deepEqual(Q.analyze(1, -4, 4).roots, [2]);
  assert.equal(Q.analyze(.1, .2, .1).delta, 0);
  assert.deepEqual(Q.analyze(.1, .2, .1).roots, [-1]);
});
test('negative discriminant has no real solutions', () => {
  const m = Q.analyze(1, 0, 3); assert.equal(m.delta, -12); assert.deepEqual(m.roots, []);
  for (const method of ['formula', 'factor', 'square', 'sqrt']) assert.match(Q.algebraSteps(m, method)[1].title, /No real/);
});
test('zero leading coefficient: linear, constant, identity', () => {
  assert.deepEqual(Q.analyze(0, 2, -4).roots, [2]);
  assert.equal(Q.analyze(0, 0, 3).kind, 'constant');
  assert.equal(Q.analyze(0, 0, 0).kind, 'identity');
});
test('negative a, c = 0, irrational roots, and rational factors', () => {
  assert.deepEqual(Q.analyze(-1, 5, -6).roots, [2, 3]);
  close(Q.analyze(2, 3, 0).roots[1], 0);
  close(Q.analyze(1, 0, -2).roots[1], Math.SQRT2);
  assert.equal(Q.exactRoots(Q.analyze(1, 0, -2)), null);
  assert.deepEqual(Q.exactRoots(Q.analyze(6, 1, -1)), ['-1/2', '1/3']);
});
test('invalid coefficients are rejected', () => {
  [[NaN, 1, 2], [Infinity, 1, 2], [21, 0, 0], [1, .001, 0]].forEach(v => assert.throws(() => Q.analyze(...v)));
});
test('direct square roots explains its applicability', () => {
  assert.match(Q.algebraSteps(Q.analyze(1, 2, 1), 'sqrt')[0].equation, /b = 0/);
  assert.match(Q.algebraSteps(Q.analyze(1, 0, -4), 'sqrt').at(-1).equation, /-2 or 2/);
});
test('bisection converges and maintains a valid interval', () => {
  const m = Q.analyze(1, 0, -2), result = Q.bisection(m, 0, 2);
  assert.equal(result.converged, true); close(result.steps.at(-1).x, Math.SQRT2);
  for (const s of result.steps) assert.ok(Q.evaluate(1, 0, -2, s.left) * Q.evaluate(1, 0, -2, s.right) <= 0);
});
test('bisection rejects invalid brackets and accepts endpoint roots', () => {
  const m = Q.analyze(1, -4, 4);
  assert.throws(() => Q.bisection(m, 0, 4), /opposite/);
  assert.throws(() => Q.bisection(m, 4, 0), /left/);
  assert.throws(() => Q.bisection(m, NaN, 2));
  assert.equal(Q.bisection(m, 2, 3).steps[0].x, 2);
});
test('Newton converges to either root and handles a horizontal tangent', () => {
  const m = Q.analyze(1, 0, -2);
  const pos = Q.newton(m, 2), neg = Q.newton(m, -2);
  assert.equal(pos.converged, true); close(pos.steps.at(-1).next, Math.SQRT2);
  close(neg.steps.at(-1).next, -Math.SQRT2);
  assert.equal(Q.newton(m, 0).converged, false);
  assert.match(Q.newton(m, 0).message, /horizontal/);
});
test('iteration limits are honest and repeated-root Newton converges', () => {
  assert.equal(Q.bisection(Q.analyze(1, 0, -2), 0, 2, 1e-14, 1).converged, false);
  assert.equal(Q.newton(Q.analyze(1, 0, -2), 2, 1e-14, 1).converged, false);
  const r = Q.newton(Q.analyze(1, -4, 4), 4);
  assert.equal(r.converged, true); close(r.steps.at(-1).next, 2);
});
test('real roots satisfy original equations across representative coefficients', () => {
  for (const a of [-20, -1, -.01, .01, 1, 20]) for (const b of [-20, -.2, 0, .2, 20]) for (const c of [-20, -.01, 0, .01, 20]) {
    const m = Q.analyze(a, b, c);
    m.roots.forEach(x => assert.ok(Math.abs(Q.evaluate(a, b, c, x)) < 1e-8 * Math.max(1, Math.abs(a * x * x), Math.abs(b * x), Math.abs(c))));
    if (m.roots.length === 2) { close(m.roots[0] + m.roots[1], -b / a); close(m.roots[0] * m.roots[1], c / a); }
  }
});
