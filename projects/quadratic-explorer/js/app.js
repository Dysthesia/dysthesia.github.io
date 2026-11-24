/* Page orchestration. math.js calculates; graph.js draws; this file connects them. */
(function () {
  'use strict';
  const Q = window.Quadratic, $ = id => document.getElementById(id);
  const presets = { two: [1, -5, 6], double: [1, -4, 4], none: [1, 0, 3], sqrt: [1, 0, -4] };
  const titles = { formula: 'Quadratic formula', factor: 'Factoring', square: 'Completing the square', sqrt: 'Square-root method', bisect: 'Bisection', newton: 'Newton’s method' };
  const graph = new window.CurveGraph($('graph'), $('trace'));
  let model, method = 'formula', visibleSteps = 1, numeric = null, iteration = 0;
  const isNumeric = () => ['bisect', 'newton'].includes(method);
  function setCoefficients(values) {
    ['a', 'b', 'c'].forEach((key, i) => { $(`${key}-number`).value = values[i]; $(`${key}-range`).value = values[i]; });
    update();
  }
  function update() {
    const values = ['a', 'b', 'c'].map(key => $(`${key}-number`).value.trim());
    try {
      if (values.some(v => v === '')) throw new Error('Enter a value for each coefficient. The last valid graph is still shown.');
      model = Q.analyze(...values.map(Number));
      $('input-error').hidden = true;
    } catch (error) { $('input-error').textContent = error.message; $('input-error').hidden = false; return; }
    document.querySelectorAll('[data-preset]').forEach(button => {
      const active = presets[button.dataset.preset].every((n, i) => n === values.map(Number)[i]);
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', active);
    });
    $('function-expression').textContent = `f(x) = ${Q.expression(model.a, model.b, model.c)}`;
    $('vertex-value').textContent = model.vertex ? `(${Q.format(model.vertex.h)}, ${Q.format(model.vertex.k)})` : 'Not a parabola';
    $('axis-value').textContent = model.vertex ? `x = ${Q.format(model.vertex.h)}` : 'Not applicable';
    $('opening-value').textContent = model.a > 0 ? 'Upward' : model.a < 0 ? 'Downward' : 'Not applicable';
    $('delta-value').textContent = model.delta === null ? '—' : Q.format(model.delta);
    $('delta-calculation').textContent = model.delta === null ? 'The discriminant checker requires a ≠ 0.' : `(${Q.format(model.b)})² − 4(${Q.format(model.a)})(${Q.format(model.c)})`;
    let badge, explanation, roots, note;
    if (model.kind === 'quadratic') {
      badge = model.delta > 0 ? 'Two real roots' : model.delta === 0 ? 'One repeated root' : 'No real roots';
      explanation = model.delta > 0 ? 'The curve crosses the x-axis twice.' : model.delta === 0 ? 'The curve touches the x-axis once.' : 'The curve never meets the x-axis.';
      roots = model.roots.length ? Q.rootAnswer(model) : 'No real intersections';
      note = model.delta < 0 ? 'Complex roots are a future feature.' : model.delta === 0 ? 'One distinct root, multiplicity 2.' : 'Two solutions to your equation.';
    } else {
      badge = model.kind === 'linear' ? 'Linear equation' : model.kind === 'identity' ? 'All real numbers' : 'No solutions';
      explanation = 'With a = 0, this is not a quadratic.';
      roots = model.kind === 'linear' ? `x = ${Q.format(model.roots[0])}` : model.kind === 'identity' ? 'Every real x' : 'No real roots';
      note = 'Set a to a nonzero value to explore a parabola.';
    }
    $('root-badge').textContent = badge; $('root-badge').className = `badge${model.delta < 0 ? ' warning' : model.kind !== 'quadratic' ? ' neutral' : ''}`;
    $('root-explanation').textContent = explanation; $('roots-value').textContent = roots; $('roots-note').textContent = note;
    graph.setModel(model); document.querySelector('.legend-note').textContent = 'Real plane · auto-fit';
    visibleSteps = 1; numeric = null; iteration = 0;
    suggestStartingPoints(); renderMethod();
  }
  function suggestStartingPoints() {
    if (model.vertex && model.roots.length === 2) {
      const gap = model.roots[1] - model.roots[0];
      $('left-end').value = Q.format(model.roots[0] - Math.max(1, gap / 2));
      $('right-end').value = Q.format(model.vertex.h);
      $('initial-x').value = $('left-end').value;
    } else if (model.vertex) {
      $('left-end').value = Q.format(model.vertex.h - 2); $('right-end').value = Q.format(model.vertex.h + 2);
      $('initial-x').value = Q.format(model.vertex.h + 2);
    }
  }
  function renderMethod() {
    $('method-title').textContent = titles[method];
    $('method-category').textContent = isNumeric() ? 'NUMERICAL METHOD' : 'ALGEBRAIC METHOD';
    const usable = isNumeric() && model.kind === 'quadratic' && model.delta >= 0;
    $('numeric-controls').hidden = !usable;
    $('iteration-table-wrap').hidden = !numeric;
    $('numeric-error').hidden = true;
    $('steps').replaceChildren();
    $('bracket-fields').hidden = method !== 'bisect'; $('initial-field').hidden = method !== 'newton';
    ['left-end', 'right-end'].forEach(id => $(id).disabled = method !== 'bisect');
    $('initial-x').disabled = method !== 'newton';
    $('method-footnote').textContent = isNumeric() ? 'Tolerance: 0.0000001. Purple marks on the graph show the current iteration. Coefficient changes reset the calculation.' : 'Understand the transformation, then check the result on the graph.';
    $('numeric-intro').textContent = method === 'bisect' ? 'Choose an interval with opposite signs at its endpoints. The suggested interval uses the known roots; enter your own to practice.' : 'Choose a starting x. Each tangent gives a new estimate; some starting points fail or converge slowly.';
    if (usable) {
      $('step-count').textContent = numeric ? `Iteration ${iteration} of ${numeric.steps.length}` : 'Ready to explore';
      if (!numeric) addStep({ title: method === 'bisect' ? 'Keep the half that brackets a root' : 'Follow the tangent to the x-axis', equation: method === 'bisect' ? 'midpoint = (left + right) / 2' : 'xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)', detail: method === 'bisect' ? 'After each midpoint, keep the interval whose endpoint values have opposite signs. This finds one root at a time.' : 'For a quadratic, f′(x) = 2ax + b. A horizontal tangent makes this update undefined.' }, 1);
      else renderIterations();
      $('previous-step').disabled = !numeric || iteration <= 1;
      $('next-step').disabled = !numeric || iteration >= numeric.steps.length;
      $('all-steps').disabled = !numeric || iteration >= numeric.steps.length;
      $('next-step').textContent = 'Next iteration'; $('all-steps').textContent = 'Run to end';
    } else {
      const steps = Q.algebraSteps(model, method);
      visibleSteps = Math.min(visibleSteps, steps.length);
      steps.slice(0, visibleSteps).forEach((step, i) => addStep(step, i + 1));
      $('step-count').textContent = `Step ${visibleSteps} of ${steps.length}`;
      $('previous-step').disabled = visibleSteps <= 1;
      $('next-step').disabled = visibleSteps >= steps.length;
      $('all-steps').disabled = visibleSteps >= steps.length;
      $('next-step').textContent = 'Next step'; $('all-steps').textContent = 'Show all steps';
    }
  }
  function addStep(step, index) {
    const row = document.createElement('div'); row.className = 'step';
    const number = document.createElement('span'); number.className = 'step-number'; number.textContent = index;
    const content = document.createElement('div');
    const title = document.createElement('h4'); title.textContent = step.title;
    const equation = document.createElement('div'); equation.className = 'equation'; equation.textContent = step.equation;
    const detail = document.createElement('p'); detail.textContent = step.detail;
    content.append(title, equation, detail); row.append(number, content); $('steps').append(row);
  }
  function renderIterations() {
    $('iteration-head').replaceChildren(); $('iteration-body').replaceChildren();
    const header = document.createElement('tr');
    (method === 'bisect' ? ['n', 'Left', 'Right', 'Midpoint', 'f(midpoint)'] : ['n', 'xₙ', 'f(xₙ)', 'f′(xₙ)', 'Next x']).forEach(text => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = text; header.append(th); });
    $('iteration-head').append(header);
    numeric.steps.slice(0, iteration).forEach((s, i) => {
      const tr = document.createElement('tr');
      const values = method === 'bisect' ? [i + 1, s.left, s.right, s.x, s.fx] : [i + 1, s.x, s.fx, s.slope, s.next];
      values.forEach(n => { const td = document.createElement('td'); td.textContent = Q.format(n); tr.append(td); });
      $('iteration-body').append(tr);
    });
    const last = numeric.steps[iteration - 1];
    graph.overlay = last ? { type: method, ...last } : null; graph.draw();
    $('iteration-status').textContent = iteration === numeric.steps.length ? numeric.message : 'Advance one iteration to see the next estimate.';
  }
  ['a', 'b', 'c'].forEach(key => {
    $(`${key}-range`).addEventListener('input', event => { $(`${key}-number`).value = event.target.value; update(); });
    $(`${key}-number`).addEventListener('input', event => { if (event.target.value !== '') $(`${key}-range`).value = event.target.value; update(); });
  });
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => setCoefficients(presets[button.dataset.preset])));
  $('reset').addEventListener('click', () => setCoefficients(presets.two));
  document.querySelectorAll('[data-method]').forEach(button => button.addEventListener('click', () => {
    method = button.dataset.method; visibleSteps = 1; numeric = null; iteration = 0; graph.overlay = null; graph.draw();
    document.querySelectorAll('[data-method]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active); });
    renderMethod();
  }));
  $('next-step').addEventListener('click', () => { if (isNumeric() && numeric) iteration++; else visibleSteps++; renderMethod(); });
  $('previous-step').addEventListener('click', () => { if (isNumeric() && numeric) iteration--; else visibleSteps--; renderMethod(); });
  $('all-steps').addEventListener('click', () => { if (isNumeric() && numeric) iteration = numeric.steps.length; else visibleSteps = Q.algebraSteps(model, method).length; renderMethod(); });
  $('numeric-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      numeric = method === 'bisect' ? Q.bisection(model, Number($('left-end').value), Number($('right-end').value)) : Q.newton(model, Number($('initial-x').value));
      iteration = Math.min(1, numeric.steps.length); renderMethod();
    } catch (error) {
      numeric = null; iteration = 0; graph.overlay = null; graph.draw(); renderMethod();
      $('numeric-error').textContent = error.message; $('numeric-error').hidden = false;
    }
  });
  ['roots', 'vertex', 'axis'].forEach(key => $(`show-${key}`).addEventListener('change', event => { graph.options[key] = event.target.checked; graph.draw(); }));
  $('fit').addEventListener('click', () => { graph.fit(); document.querySelector('.legend-note').textContent = 'Real plane · auto-fit'; });
  $('zoom-in').addEventListener('click', () => { graph.zoom(.75); document.querySelector('.legend-note').textContent = 'Real plane · custom view'; });
  $('zoom-out').addEventListener('click', () => { graph.zoom(1.35); document.querySelector('.legend-note').textContent = 'Real plane · custom view'; });
  setCoefficients(presets.two);
})();
