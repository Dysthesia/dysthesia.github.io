"""Render the scenes and copy MP4s into the website's expected asset paths.

Usage (from any directory):
    python python/render_lessons.py
    python python/render_lessons.py --quality low --scene discriminant
"""
import argparse
import importlib.util
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SCENES = {
    "discriminant": "Discriminant",
    "completing-square": "CompletingSquare",
    "newton": "NewtonMethod",
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scene", choices=["all", *SCENES], default="all")
    parser.add_argument("--quality", choices=["low", "medium", "high"], default="medium")
    args = parser.parse_args()
    if importlib.util.find_spec("manim") is None:
        parser.exit(1, "Manim is not installed in this Python environment. Follow README.md → Render the Manim lessons.\n")
    quality = {"low": "l", "medium": "m", "high": "h"}[args.quality]
    resolution = {"low": "480p15", "medium": "720p30", "high": "1080p60"}[args.quality]
    media = ROOT / "media"
    destination = ROOT / "assets" / "videos"
    destination.mkdir(parents=True, exist_ok=True)
    for slug, scene in SCENES.items():
        if args.scene not in ("all", slug):
            continue
        subprocess.run([
            sys.executable, "-m", "manim", f"-q{quality}", "--format", "mp4",
            "--media_dir", str(media), str(ROOT / "python" / "scenes.py"), scene,
        ], cwd=ROOT, check=True)
        rendered = media / "videos" / "scenes" / resolution / f"{scene}.mp4"
        if not rendered.is_file():
            raise FileNotFoundError(f"Expected render not found: {rendered}")
        target = destination / f"{slug}.mp4"
        shutil.copy2(rendered, target)
        print(f"Ready: {target.relative_to(ROOT)}")
    print("Open the website, choose Manim video, and select a lesson.")


if __name__ == "__main__":
    main()
