# Builds interior.html, the print interior of Hidden Uttarakhand (English edition), from the book's
# website (parthjoshiljcca/hidden-uttrakhand, index.html). The page is laid out by Paged.js at Notion
# Press's 5x8 trim with mirrored margins (see interior.css) and printed to PDF by render_interior.js.
#
#   python3 build_interior.py <path to the website's index.html>
import html
import os
import re
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
YEAR, AUTHOR = 2026, 'Parth D. Joshi'

src = open(sys.argv[1], encoding='utf-8').read()
start = src.index('<section data-kind="full" class="cover" id="cover" data-title="Hidden Uttarakhand"')
end = src.index('<section data-kind="full" class="cover" id="cover"', start + 10)   # the Hindi edition starts here
english = src[start:end]
sections = {m.group(2): (m.group(1), m.group(3)) for m in re.finditer(r'<section ([^>]*?)id="([\w-]+)"[^>]*>(.*?)</section>', english, re.S)}
attrs = {m.group(1): m.group(0) for m in re.finditer(r'<section [^>]*?id="([\w-]+)"[^>]*>', english)}


def attr(sid, name):
    m = re.search(name + r'="([^"]*)"', attrs[sid])
    return html.unescape(m.group(1)) if m else ''


def gray(markup):
    """Every colour in the markup to its grey: the interior prints in black and white."""
    def g(m):
        h = m.group(1)
        if len(h) == 3:
            h = ''.join(ch * 2 for ch in h)
        r, gg, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
        v = round(.299 * r + .587 * gg + .114 * b)
        return f'#{v:02x}{v:02x}{v:02x}'
    # only inside the drawings: text holds entities like &#169; that look like colours
    return re.sub(r'<svg.*?</svg>', lambda m: re.sub(r'(?<!&)#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b', g, m.group(0)), markup, flags=re.S)


def clean(markup, sid):
    markup = re.sub(r'<a [^>]*>(.*?)</a>', r'\1', markup, flags=re.S)           # links mean nothing on paper
    markup = re.sub(r' id="([\w-]+)"', lambda m: f' id="{sid}-{m.group(1)}"', markup)   # keep SVG ids unique
    markup = re.sub(r'url\(#([\w-]+)\)', lambda m: f'url(#{sid}-{m.group(1)})', markup)
    markup = re.sub(r'href="#([\w-]+)"', lambda m: f'href="#{sid}-{m.group(1)}"', markup)
    return gray(markup)


ORDER = ['cast', 'preface', 'note', 'intro', 'prologue',
         'part1', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'part2', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10',
         'part3', 'ch11', 'ch12', 'ch13', 'ch14', 'ch15', 'epilogue', 'route', 'sources', 'about']
HEAD = {'cast': 'Dramatis Personae', 'note': "Author's Note", 'intro': 'Introduction', 'epilogue': 'Epilogue',
        'route': 'The Route of the Journey', 'sources': 'Sources & Further Reading', 'about': 'About the Author'}
ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']

body, toc = [], []
for sid in ORDER:
    kind, inner = sections[sid]
    inner = clean(inner, sid)
    title = attr(sid, 'data-title')
    if 'class="part"' in attrs[sid]:
        body.append(f'<section class="part" id="{sid}">{inner}</section>')
        toc.append(f'<li class="tpart"><a href="#{sid}">{html.escape(title)}</a></li>')
        continue
    run = HEAD.get(sid) or attr(sid, 'data-head') or title
    cls = 'chapter' if sid.startswith('ch') else 'matter'
    body.append(f'<section class="{cls}" id="{sid}" data-run="{html.escape(run)}"><span class="run">{html.escape(run)}</span>{inner}</section>')
    label = f'<span class="tn">{ROMAN[int(sid[2:]) - 1]}</span>' if sid.startswith('ch') else '<span class="tn"></span>'
    toc.append(f'<li class="{"tch" if cls == "chapter" else "tfront"}"><a href="#{sid}">{label}<span class="tt">{html.escape(title)}</span></a></li>')

epigraph = clean(sections['epigraph'][1], 'epigraph')
css = open(os.path.join(DIR, 'interior.css'), encoding='utf-8').read()   # inline: Paged.js cannot fetch file:// stylesheets
page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Hidden Uttarakhand — interior</title>
<style>{css}</style>
</head>
<body>
<section class="front titlepage">
  <div class="tp-over">Places · People · Culture · Untold Stories</div>
  <h1>Hidden<br>Uttarakhand</h1>
  <div class="tp-sub">The Untold Secrets of the Devbhoomi</div>
  <div class="tp-author">{AUTHOR}</div>
</section>
<section class="front copyright">
  <p class="cp-title">Hidden Uttarakhand</p>
  <p>Copyright © {YEAR} {AUTHOR}<br>All Rights Reserved.</p>
  <p>This book has been self-published with all reasonable efforts taken to make the material error-free by the author. No part of this book shall be used, reproduced in any manner whatsoever without written permission from the author, except in the case of brief quotations embodied in critical articles and reviews.</p>
  <p>The Author of this book is solely responsible and liable for its content including but not limited to the views, representations, descriptions, statements, information, opinions and references [“Content”]. The Content of this book shall not constitute or be construed or deemed to reflect the opinion or expression of the Publisher or Editor. Neither the Publisher nor Editor endorse or approve the Content of this book or guarantee the reliability, accuracy or completeness of the Content published herein and do not make any representations or warranties of any kind, express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose. The Publisher and Editor shall not be liable whatsoever for any errors, omissions, whether such errors or omissions result from negligence, accident, or any other cause or claims for loss or damages of any kind, including without limitation, indirect or consequential loss or damage arising out of use, inability to use, or about the reliability, accuracy or sufficiency of the information contained in this book.</p>
  <p class="cp-np">Made with ♥ on the Notion Press Platform<br>www.notionpress.com</p>
</section>
<section class="front epigraph-page">{epigraph}</section>
<section class="front contents"><span class="run">Contents</span>
  <header class="opener plain"><div class="clabel">The Book</div><h2 class="ctitle">Contents</h2></header>
  <ul class="toc">{''.join(toc)}</ul>
</section>
{''.join(body)}
</body>
</html>
"""
open(os.path.join(DIR, 'interior.html'), 'w', encoding='utf-8').write(page)
words = len(re.sub(r'<[^>]+>', ' ', ''.join(body)).split())
print(f'interior.html: {len(ORDER)} sections, {words} words')
