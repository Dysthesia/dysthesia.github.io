/* These lightweight browser illustrations are NOT Manim renders.
 * The adjacent video mode plays the MP4s made by python/render_lessons.py.
 * No autoplay: the learner controls both motion and playback.
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const lessons = {
    discriminant: { title: 'The discriminant', duration: 12, transcript: 'For f(x) = x² + c, the discriminant is Δ = −4c. When c = −2, Δ = 8 and the curve crosses the x-axis twice, at ±√2. When c = 0, Δ = 0 and it touches once at x = 0. When c = 2, Δ = −8 and it has no real roots.' },
    'completing-square': { title: 'Completing the square', duration: 12, transcript: 'Start with x² − 4x + 3 = 0. Move 3 to the right to get x² − 4x = −3. Add 4 to both sides: x² − 4x + 4 = 1. Factor the left side: (x − 2)² = 1. Take both square roots: x − 2 = ±1. Therefore x = 1 or x = 3.' },
    newton: { title: 'Newton’s method', duration: 12, transcript: 'For f(x) = x² − 2, start at x₀ = 2. The derivative is 2x. Follow the tangent to the x-axis to get xₙ₊₁ = xₙ − (xₙ² − 2)/(2xₙ). Successive estimates are 1.5, 1.416667, and 1.414216, approaching √2. Starting at zero would fail because the derivative is zero.' },
  };
  let current = 'discriminant', mode = 'browser', progress = 0, playing = false, lastTime = 0, frame = 0;
  const canvas = $('lesson-canvas'), ctx = canvas.getContext('2d'), video = $('lesson-video');
  function draw() {
    const w = canvas.clientWidth;
    if (!w) return;
    const h = w * 9 / 16, dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr * w / 960, 0, 0, dpr * w / 960, 0, 0);
    ctx.fillStyle = '#111f34'; ctx.fillRect(0, 0, 960, 540);
    const text = (value, x, y, size = 24, color = '#fff') => { ctx.fillStyle = color; ctx.font = `${size}px system-ui`; ctx.textAlign = 'left'; ctx.fillText(value, x, y); };
    text(lessons[current].title, 42, 55, 28);
    text('QUADRATIC EXPLORER / VISUAL NOTEBOOK', 42, 86, 13, '#8dabc7');
    const line = (x1, y1, x2, y2, color, width = 1) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); };
    const dot = (x, y, color = '#68d9b6') => { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); };
    const axes = (X, Y, xRange, yRange) => {
      for (let x = xRange[0]; x <= xRange[1]; x++) line(X(x), Y(yRange[0]), X(x), Y(yRange[1]), '#24374e');
      for (let y = yRange[0]; y <= yRange[1]; y++) line(X(xRange[0]), Y(y), X(xRange[1]), Y(y), '#24374e');
      line(X(xRange[0]), Y(0), X(xRange[1]), Y(0), '#7690ad', 1.5);
      line(X(0), Y(yRange[0]), X(0), Y(yRange[1]), '#7690ad', 1.5);
    };
    const curve = (X, Y, fn, min, max) => { ctx.beginPath(); for (let i = 0; i <= 250; i++) { const x = min + i / 250 * (max - min); if (i) ctx.lineTo(X(x), Y(fn(x))); else ctx.moveTo(X(x), Y(fn(x))); } ctx.strokeStyle = '#83a6ff'; ctx.lineWidth = 4; ctx.stroke(); };
    if (current === 'discriminant') {
      // Hold each case long enough to read, with short transitions between them.
      const t = progress * 3;
      const phase = Math.min(2, Math.floor(t));
      let c = [-2, 0, 2][phase];
      if (phase < 2 && t - phase > .75) c += ((t - phase - .75) / .25) * 2;
      const X = x => 360 + x * 85, Y = y => 360 - y * 45;
      axes(X, Y, [-3, 3], [-3, 5]);
      ctx.save(); ctx.beginPath(); ctx.rect(80, 125, 545, 370); ctx.clip(); curve(X, Y, x => x * x + c, -3, 3); ctx.restore();
      if (c <= 0) { dot(X(-Math.sqrt(-c)), Y(0)); if (c !== 0) dot(X(Math.sqrt(-c)), Y(0)); }
      const displayC = Number(c.toFixed(2));
      text(`f(x) = x² ${displayC < 0 ? '−' : '+'} ${Math.abs(displayC)}`, 660, 205, 25);
      text(`Δ = ${Number((-4 * c).toFixed(2))}`, 660, 255, 38, '#8aabff');
      text(c < 0 ? 'Two real roots' : c === 0 ? 'One repeated root' : 'No real roots', 660, 305, 21, '#68d9b6');
      text('The sign tells the story.', 660, 355, 16, '#a7bbd3');
    } else if (current === 'completing-square') {
      const equations = ['x² − 4x + 3 = 0', 'x² − 4x = −3', 'x² − 4x + 4 = −3 + 4', '(x − 2)² = 1', 'x − 2 = ±1', 'x = 1  or  x = 3'];
      const labels = ['Start with the equation', 'Move the constant', 'Add (−4 ÷ 2)² to both sides', 'Factor the perfect square', 'Take both square roots', 'Isolate x'];
      const n = Math.min(5, Math.floor(progress * 6));
      text(`STEP ${n + 1} / 6`, 70, 175, 16, '#8aabff'); text(labels[n], 70, 220, 26, '#c0d0e3');
      text(equations[n], 70, 315, 49, n === 5 ? '#68d9b6' : '#fff');
      if (n > 0) text(`Previously: ${equations[n - 1]}`, 70, 390, 21, '#91a9c3');
      text('Whatever you add to one side, add to the other.', 70, 468, 18, '#91a9c3');
    } else {
      const X = x => 95 + x * 170, Y = y => 380 - y * 75;
      axes(X, Y, [0, 3], [-1, 3]);
      ctx.save(); ctx.beginPath(); ctx.rect(80, 145, 550, 320); ctx.clip(); curve(X, Y, x => x * x - 2, 0, 2.8);
      const xs = [2, 1.5, 17 / 12, 577 / 408];
      const n = Math.min(3, Math.floor(progress * 4)), x = xs[n], fx = x * x - 2, slope = 2 * x, next = x - fx / slope;
      line(X(0), Y(fx - slope * x), X(3), Y(fx + slope * (3 - x)), '#c5a2ff', 3);
      dot(X(x), Y(fx), '#c5a2ff'); dot(X(next), Y(0)); ctx.restore();
      text(`Iteration ${n + 1}`, 650, 200, 25); text(`x = ${x.toFixed(6)}`, 650, 255, 26, '#c5a2ff');
      text(`next ≈ ${next.toFixed(6)}`, 650, 307, 25, '#68d9b6'); text('Approaching √2', 650, 365, 20, '#a7bbd3');
    }
    $('lesson-progress').value = Math.round(progress * 1000);
    canvas.setAttribute('aria-label', `${lessons[current].title}, ${Math.round(progress * 100)} percent complete. A text explanation is available under Read this lesson.`);
  }
  function stop() { playing = false; cancelAnimationFrame(frame); $('lesson-play').textContent = 'Play lesson'; }
  function tick(now) {
    if (!playing) return;
    progress = Math.min(1, progress + (now - lastTime) / (lessons[current].duration * 1000)); lastTime = now;
    draw();
    if (progress === 1) stop(); else frame = requestAnimationFrame(tick);
  }
  function loadVideo() {
    video.hidden = false; $('video-missing').hidden = true;
    video.preload = 'metadata';
    video.src = `assets/videos/${current}.mp4`; video.load();
    $('video-status').textContent = 'Manim render · fixed example, independent of the sliders.';
  }
  function selectMode(next) {
    stop(); video.pause(); mode = next;
    $('browser-player').hidden = mode !== 'browser'; video.hidden = mode !== 'manim'; $('video-missing').hidden = true;
    ['browser', 'manim'].forEach(name => { $(`${name}-mode`).classList.toggle('active', mode === name); $(`${name}-mode`).setAttribute('aria-pressed', mode === name); });
    if (mode === 'manim') loadVideo();
    else { $('video-status').textContent = 'Live browser illustration · fixed example, independent of the sliders.'; draw(); }
  }
  $('browser-mode').addEventListener('click', () => selectMode('browser'));
  $('manim-mode').addEventListener('click', () => selectMode('manim'));
  $('retry-video').addEventListener('click', loadVideo);
  video.addEventListener('error', () => { if (mode === 'manim') { video.hidden = true; $('video-missing').hidden = false; $('video-status').textContent = 'This video is not available yet. The live illustration is ready to play.'; } });
  $('lesson-play').addEventListener('click', () => {
    if (playing) return stop();
    if (progress >= 1) progress = 0;
    playing = true; $('lesson-play').textContent = 'Pause'; lastTime = performance.now(); frame = requestAnimationFrame(tick);
  });
  $('lesson-replay').addEventListener('click', () => { stop(); progress = 0; draw(); });
  $('lesson-progress').addEventListener('input', event => { stop(); progress = Number(event.target.value) / 1000; draw(); });
  document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => {
    stop(); video.pause(); current = button.dataset.lesson; progress = 0;
    document.querySelectorAll('[data-lesson]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button); });
    $('lesson-transcript').textContent = lessons[current].transcript;
    if (mode === 'manim') loadVideo(); else draw();
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  new ResizeObserver(draw).observe(canvas.parentElement);
  $('lesson-transcript').textContent = lessons[current].transcript; draw();
})();
