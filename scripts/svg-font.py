# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools>=4.50", "brotli>=1.1"]
# ///
"""Embed a JetBrains Mono subset into SVG illustrations.

An SVG shown through <img> can't load web fonts, so each file carries its own
copy of just the glyphs its <text> uses. Run it again after editing any text:

    uv run scripts/svg-font.py public/images/posts/stored-time-*.svg

The SVG opts in with an empty `<style id="jbm-font"></style>`; the script fills
it and is safe to re-run. Fonts are read from ~/Library/Fonts, override with
JBM_FONT_DIR. Either the official JetBrains Mono or the Nerd Font Mono build
works, their Latin glyphs are the same.
"""

import base64
import html
import io
import os
import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

FONT_DIR = Path(os.environ.get("JBM_FONT_DIR", "~/Library/Fonts")).expanduser()
WEIGHT_NAMES = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}
FILE_PATTERNS = ("JetBrainsMono-{}.ttf", "JetBrainsMonoNerdFontMono-{}.ttf")

STYLE_RE = re.compile(r'<style id="jbm-font">.*?</style>', re.S)
TEXT_RE = re.compile(r"<text\b[^>]*>(.*?)</text>", re.S)
TAG_RE = re.compile(r"<[^>]+>")
WEIGHT_RE = re.compile(r'font-weight(?:="|\s*:\s*)(\d{3}|bold)')


def font_path(weight):
    for pattern in FILE_PATTERNS:
        path = FONT_DIR / pattern.format(WEIGHT_NAMES[weight])
        if path.exists():
            return path
    sys.exit(f"JetBrains Mono {WEIGHT_NAMES[weight]} not found in {FONT_DIR}")


def woff2_subset(weight, chars):
    font = TTFont(font_path(weight))
    options = subset.Options()
    options.flavor = "woff2"
    options.hinting = False
    options.desubroutinize = True
    options.name_IDs = []
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=chars)
    subsetter.subset(font)
    out = io.BytesIO()
    font.flavor = "woff2"
    font.save(out)
    return base64.b64encode(out.getvalue()).decode("ascii")


def embed(path):
    svg = path.read_text(encoding="utf-8")
    if not STYLE_RE.search(svg):
        print(f"skip {path}: no <style id=\"jbm-font\">")
        return

    chars = set()
    for body in TEXT_RE.findall(svg):
        chars.update(html.unescape(TAG_RE.sub("", body)))
    chars.discard("\n")
    chars.add(" ")

    weights = {400}
    for w in WEIGHT_RE.findall(svg):
        weights.add(700 if w == "bold" else int(w))
    weights &= WEIGHT_NAMES.keys()

    text = "".join(sorted(chars))
    faces = "".join(
        "@font-face{font-family:'JetBrains Mono';font-style:normal;"
        f"font-weight:{w};src:url(data:font/woff2;base64,{woff2_subset(w, text)}) format('woff2')}}"
        for w in sorted(weights)
    )
    svg = STYLE_RE.sub(lambda _: f'<style id="jbm-font">{faces}</style>', svg, count=1)
    path.write_text(svg, encoding="utf-8")
    print(f"{path}: {len(chars)} glyphs, weights {sorted(weights)}, {len(svg) // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for arg in sys.argv[1:]:
        embed(Path(arg))
