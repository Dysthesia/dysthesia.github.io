"""Three real Manim Community scenes for Quadratic Explorer.

They intentionally use Text rather than MathTex, so LaTeX is not required.
Run from the project root with: python python/render_lessons.py
These are fixed teaching examples, independent of the website's coefficients.
"""
from manim import (
    Axes, Create, Dot, FadeIn, FadeOut, LEFT, Line, RIGHT, Scene,
    Text, Transform, UP, VGroup, ValueTracker, always_redraw, config,
)

BACKGROUND = "#111f34"
FOREGROUND = "#edf4ff"
MUTED = "#a7bbd3"
BLUE = "#83a6ff"
GREEN = "#68d9b6"
PURPLE = "#c5a2ff"
config.background_color = BACKGROUND


def label(text, size=28, color=FOREGROUND):
    """One place to change the typography in every scene."""
    return Text(text, font="DejaVu Sans", font_size=size, color=color)


class Lesson(Scene):
    def heading(self, title):
        title_mob = label(title, 32).to_edge(UP, buff=0.35).to_edge(LEFT, buff=0.6)
        subtitle = label("QUADRATIC EXPLORER / VISUAL NOTEBOOK", 13, MUTED)
        subtitle.next_to(title_mob, direction=-UP, aligned_edge=LEFT, buff=0.15)
        self.add(title_mob, subtitle)


class Discriminant(Lesson):
    def construct(self):
        self.heading("The discriminant")
        axes = Axes(
            x_range=[-3, 3, 1], y_range=[-3, 5, 1],
            x_length=7, y_length=4.8,
            axis_config={"color": MUTED, "include_tip": False},
        ).move_to(LEFT * 2 + -UP * 0.35)
        self.play(Create(axes), run_time=0.8)
        c = ValueTracker(-2)
        # Keep the sampled domain inside the plotting area's vertical range.
        curve = always_redraw(lambda: axes.plot(
            lambda x: x * x + c.get_value(),
            x_range=[-(5 - c.get_value()) ** 0.5, (5 - c.get_value()) ** 0.5],
            color=BLUE,
        ))
        self.play(Create(curve), run_time=0.8)
        roots = VGroup(*[Dot(axes.c2p(x, 0), color=GREEN) for x in [-2**0.5, 2**0.5]])
        notes = VGroup(
            label("f(x) = x² − 2", 27), label("Δ = 8", 36, BLUE), label("Two real roots", 23, GREEN),
        ).arrange(-UP, aligned_edge=LEFT, buff=0.35).move_to(RIGHT * 3.8)
        self.play(FadeIn(roots), FadeIn(notes))
        self.wait(2)
        self.play(FadeOut(roots), FadeOut(notes), c.animate.set_value(0), run_time=1.5)
        root = Dot(axes.c2p(0, 0), color=GREEN)
        notes = VGroup(
            label("f(x) = x²", 27), label("Δ = 0", 36, BLUE), label("One repeated root", 23, GREEN),
        ).arrange(-UP, aligned_edge=LEFT, buff=0.35).move_to(RIGHT * 3.8)
        self.play(FadeIn(root), FadeIn(notes))
        self.wait(2)
        self.play(FadeOut(root), FadeOut(notes), c.animate.set_value(2), run_time=1.5)
        notes = VGroup(
            label("f(x) = x² + 2", 27), label("Δ = −8", 36, BLUE), label("No real roots", 23, GREEN),
        ).arrange(-UP, aligned_edge=LEFT, buff=0.35).move_to(RIGHT * 3.8)
        self.play(FadeIn(notes))
        self.wait(3)


class CompletingSquare(Lesson):
    def construct(self):
        self.heading("Completing the square")
        stages = [
            ("Start with the equation", "x² − 4x + 3 = 0"),
            ("Move the constant to the right", "x² − 4x = −3"),
            ("Add (−4 ÷ 2)² = 4 to BOTH sides", "x² − 4x + 4 = −3 + 4"),
            ("Factor the perfect square", "(x − 2)² = 1"),
            ("Take both square roots", "x − 2 = ±1"),
            ("Isolate x", "x = 1  or  x = 3"),
        ]
        instruction = label(stages[0][0], 26, MUTED).move_to(UP * 1.2)
        equation = label(stages[0][1], 46).move_to(-UP * 0.1)
        self.play(FadeIn(instruction), FadeIn(equation))
        self.wait(1.5)
        for index, (description, formula) in enumerate(stages[1:], start=1):
            new_instruction = label(description, 26, MUTED).move_to(instruction)
            new_equation = label(formula, 46, GREEN if index == 5 else FOREGROUND).move_to(equation)
            if new_equation.width > 12:
                new_equation.scale_to_fit_width(12)
            self.play(Transform(instruction, new_instruction), Transform(equation, new_equation), run_time=0.8)
            self.wait(1.8)
        self.wait(1)


class NewtonMethod(Lesson):
    def construct(self):
        self.heading("Newton’s method")
        axes = Axes(
            x_range=[0, 3, 1], y_range=[-1, 4, 1],
            x_length=6.5, y_length=4.6,
            axis_config={"color": MUTED, "include_tip": False},
        ).move_to(LEFT * 2.3 + -UP * 0.5)
        curve = axes.plot(lambda x: x * x - 2, x_range=[1, 6**0.5], color=BLUE)
        formula = label("f(x) = x² − 2", 26).move_to(RIGHT * 3.7 + UP * 1.1)
        rule = label("x_next = x − f(x) / f′(x)", 22, MUTED).next_to(formula, -UP, buff=0.4)
        self.play(Create(axes), Create(curve), FadeIn(formula), FadeIn(rule))
        x = 2.0
        for index in range(1, 5):
            fx, slope = x * x - 2, 2 * x
            next_x = x - fx / slope
            tangent = Line(
                axes.c2p(next_x - 0.12, slope * (-0.12)),
                axes.c2p(x + 0.12, fx + slope * 0.12), color=PURPLE,
            )
            point = Dot(axes.c2p(x, fx), color=PURPLE)
            estimate = Dot(axes.c2p(next_x, 0), color=GREEN)
            numbers = VGroup(
                label(f"Iteration {index}", 23),
                label(f"x = {x:.6f}", 25, PURPLE),
                label(f"next ≈ {next_x:.6f}", 25, GREEN),
            ).arrange(-UP, aligned_edge=LEFT, buff=0.25).move_to(RIGHT * 3.7 + -UP * 1.2)
            self.play(FadeIn(point), Create(tangent), FadeIn(numbers), run_time=0.7)
            self.play(FadeIn(estimate), run_time=0.4)
            self.wait(1.7)
            self.play(FadeOut(VGroup(point, tangent, estimate, numbers)), run_time=0.4)
            x = next_x
        conclusion = label("Approaching √2 ≈ 1.414214", 26, GREEN).move_to(RIGHT * 3.7 + -UP)
        self.play(FadeIn(conclusion))
        self.wait(2)
