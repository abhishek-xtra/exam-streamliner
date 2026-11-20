#!/usr/bin/env python3
"""Bundle index.html + exam/*.js + exam/exam.css into one self-contained file for the phone:
   dist/Exam Streamliner.html  (AirDrop it or put it in iCloud Drive and open it in Safari).
   three.js and the fonts still load from their CDNs when online; without internet the game
   falls back to its 2D renderer and system fonts, and Exam mode works fully offline."""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')

def inline_script(m):
    src = m.group(1)
    if src.startswith('http'):
        return m.group(0)
    code = (root / src).read_text(encoding='utf-8').replace('</script', '<\\/script')
    return f'<script>/* {src} */\n{code}\n</script>'

def inline_css(m):
    href = m.group(1)
    if href.startswith('http'):
        return m.group(0)
    return f'<style>/* {href} */\n{(root / href).read_text(encoding="utf-8")}\n</style>'

html = re.sub(r'<script src="([^"]+)"></script>', inline_script, html)
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
out = root / 'dist' / 'Exam Streamliner.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'wrote {out} ({out.stat().st_size / 1e6:.1f} MB)')
