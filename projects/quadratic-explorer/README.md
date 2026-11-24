# Quadratic Explorer

A first portfolio project about quadratic functions, real roots, and mathematical
explanations. It is deliberately small: plain HTML, CSS and JavaScript for the
website, with Python/Manim for optional rendered lessons. There is no backend,
build step, CDN dependency, account system, analytics, or API key.


Start with the four presets. Change one coefficient, try each method, and compare
the results. The **Next step** button reveals the algebra gradually. For numerical
methods, press **Start iterations**, then **Next iteration** or **Run to end**.

## What's included

| Feature | Behavior |
| --- | --- |
| Coefficients | Sliders and number inputs; −20 to 20; up to two decimal places |
| Graph | Responsive Canvas parabola, coordinate tracing, fit, zoom, root markers, vertex, symmetry line |
| Discriminant | Classifies two real roots, one repeated root, or no real roots |
| Quadratic formula | Substitution, discriminant simplification, real solutions |
| Factoring | Rational factors with sum/product reasoning and zero-product property |
| Completing the square | Divide by a, add the square, factor, and solve |
| Square-root method | Direct method for b = 0; otherwise explains how to transform first |
| Bisection | Editable bracket, iteration table, highlighted interval, convergence status |
| Newton's method | Editable starting point, tangent overlay, iteration table, failure handling |
| Live illustrations | Play, pause, restart, and scrub three browser-made teaching examples |
| Manim integration | Three Python scenes, render-and-copy script, optional Actions workflow, video player |

All calculations use your current coefficients. The teaching animations use fixed
examples and explicitly say so. Choosing another method or changing coefficients
resets the step sequence. The graph stays at the last valid function while an
invalid coefficient is being edited.

## Render the Manim lessons

No rendered videos are bundled. Manim installation was blocked in the creation
environment, so scene rendering has **not** been verified here. The Python files
have been syntax-checked. The built-in browser illustrations work independently.

The scenes use `Text`, not `MathTex`, so they do not need a LaTeX installation.
They still need Manim's normal Cairo/Pango dependencies. Follow the official
[Manim installation guide](https://docs.manim.community/en/stable/installation/uv.html)
for your operating system. The package version is pinned in `requirements.txt`.

Create an isolated Python environment:

```bash
python -m venv .venv
```

Activate it with `source .venv/bin/activate` on Linux/macOS, or
`.venv\Scripts\Activate.ps1` in Windows PowerShell. Then:

```bash
python -m pip install -r requirements.txt
python python/render_lessons.py
```

For a quick first render:

```bash
python python/render_lessons.py --scene discriminant --quality low
```

The helper renders the selected scene and copies the MP4 to the correct website
path. Reload the page and choose **Manim video**. Each lesson has a text alternative
under **Read this lesson**; there is no audio narration.

| Python scene | Website video |
| --- | --- |
| `Discriminant` | `assets/videos/discriminant.mp4` |
| `CompletingSquare` | `assets/videos/completing-square.mp4` |
| `NewtonMethod` | `assets/videos/newton.mp4` |

To edit a lesson, change `python/scenes.py` and render again. Rendering is an
offline development step; GitHub Pages itself never executes the Python code.

### Optional: render using GitHub Actions

If you prefer not to install Manim locally:

1. Copy `.github/workflows/render-manim.yml` into your repository's **root**
   `.github/workflows/` folder. A workflow inside a nested project folder will
   not be discovered by GitHub.
2. Commit it to your default branch.
3. In GitHub, open **Actions → Render Manim lessons → Run workflow**.
4. Enter the project path, such as `projects/quadratic-explorer`, or `.` if this
   project is at the repository root.
5. Download the `quadratic-manim-videos` artifact from the completed run.
6. Extract its MP4s into the project's `assets/videos/` folder and commit them.

The workflow has read-only repository permissions. It does not deploy, commit,
or push changes. It has not been run in your account. Your account's normal
Actions availability and usage limits apply.

## How the code is organized

| File | Responsibility | First thing to try editing |
| --- | --- | --- |
| `index.html` | Page structure and controls | Heading, introduction, footer |
| `style.css` | Colors, layout, responsive styling | Variables in `:root` |
| `js/math.js` | Pure math and solution-step generation | Add a new solver |
| `js/graph.js` | Canvas plot and iteration overlays | Add a y-intercept marker |
| `js/app.js` | Input events and page updates | Add a new preset |
| `js/lessons.js` | Browser illustrations and video selection | Add another visual lesson |
| `python/scenes.py` | Manim scenes | Change a teaching example |
| `python/render_lessons.py` | Render and copy videos | Add a scene to `SCENES` |
| `tests/math.test.cjs` | Mathematical regression tests | Add your own edge case |

The JavaScript math module is independent of the page. This makes it possible
to test the mathematics without a browser. Canvas sample points are only used to
draw curves; they are never used to calculate roots.

## Mathematical choices and limits

- **Complex roots are intentionally deferred.** Δ < 0 displays “no real roots”
  and does not compute complex values.
- When **a = 0**, the page explains the linear or constant equation. The all-zero
  case correctly reports every real number as a solution.
- The input precision limit is intentional: coefficients are scaled by 100 so
  the discriminant sign is determined with exact safe-integer arithmetic. For
  example, 0.1x² + 0.2x + 0.1 is correctly recognized as a repeated-root case.
- Rational final roots are formatted as fractions. Irrational roots and most
  intermediate divisions are displayed approximately. This is not a general
  symbolic algebra system, and radicals are not simplified.
- Factoring supports rational roots, including fractions and nonmonic
  quadratics. If the roots are irrational, it directs you to another method.
- Bisection requires opposite endpoint signs, unless an endpoint is already a
  root. It cannot normally bracket a repeated root. The suggested bracket is
  derived from already-computed roots; manual endpoints are provided for learning.
- Newton's method can fail at a horizontal tangent or run out of iterations.
  Failure is explained rather than presented as a solution.
- Numerical methods find one root per run, use tolerance 1e−7, and have iteration
  limits. Bisection's stopping test uses interval width; Newton checks both step
  size and residual. These methods are educational comparisons: a quadratic does
  not need an iterative solver in practice.
- There is no pan gesture, symbolic derivation engine, equation text parser,
  progress storage, or synchronized Manim rendering for arbitrary coefficients.
  See `ROADMAP.md` for projects you can implement yourself.

## Test it

Install Node.js if you want to run the tests. There are no npm packages to install.

```bash
node --test tests/math.test.cjs
```

The automated checks cover real, repeated, irrational, and absent roots; decimal
coefficients; nonquadratic inputs; rational factors; solver convergence; bad
brackets; horizontal tangents; and substitution/Vieta checks across 150 coefficient
combinations.

Before publishing, test these in your own browser:

- Resize to a phone width; check every input and solver button.
- Use each preset, then make a = 0 and test the linear and all-zero cases.
- Compare the six solving methods and their applicability messages.
- Try bisection on [0, 2] for x² − 2, and Newton starting at x = 0.
- Use keyboard navigation and show/hide the graph markers.
- Play and scrub each browser lesson; add a rendered MP4 and try video mode.

Browser visual QA could not run in the creation environment because its preview
relay was unavailable. Automated math and source checks do not replace that final
browser review.


## References

- [Manim installation](https://docs.manim.community/en/stable/installation/uv.html)
- [Manim quickstart](https://docs.manim.community/en/stable/tutorials/quickstart.html)
- [GitHub Pages documentation](https://docs.github.com/en/pages)

Reference documentation was consulted for the Manim setup; dependencies may
evolve. This project has no connection to those organizations.

Generative AI was used to assist in coding this project.
