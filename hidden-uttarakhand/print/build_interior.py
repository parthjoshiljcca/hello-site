# Builds interior.html, the print interior of Hidden Uttarakhand (English edition), from the book's
# website (parthjoshiljcca/hidden-uttrakhand, index.html). The page is laid out by Paged.js at Notion
# Press's 5x8 trim with mirrored margins (see interior.css) and printed to PDF by render_interior.js.
#
#   python3 build_interior.py <path to the website's index.html>
import html
import os
import re
import sys

import ornaments as O

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


def smart_quotes(markup):
    """Typewriter quotes to typographic ones, in the text only (tags, SVG and style untouched).
    A quote opens after a space or an opening bracket, at the start, or after a dash when a word
    follows; otherwise it closes.
    An apostrophe between letters, or before a year or a clipped word ('90s, 'em), is ’."""
    out, prev = [], ' '
    for tok in re.split(r'(<svg.*?</svg>|<style.*?</style>|<[^>]+>)', markup, flags=re.S):
        if tok.startswith('<'):
            out.append(tok)
            continue
        t = html.unescape(tok)
        res = []
        for i, ch in enumerate(t):
            nxt = t[i + 1] if i + 1 < len(t) else ''
            # after a dash a quote opens only if a word follows (—“is economics”); “Main—” closes it
            opening = prev.isspace() or prev in '([{/“‘' or (prev in '—–-' and nxt != '' and not nxt.isspace())
            if ch == '"':
                ch = '“' if opening else '”'
            elif ch == "'":
                if prev.isalnum() and (nxt.isalnum()):
                    ch = '’'
                elif opening and re.match(r"(\d\d|em\b|cause\b|til\b|n\b)", t[i + 1:i + 7]):
                    ch = '’'
                else:
                    ch = '‘' if opening and nxt and not nxt.isspace() else '’'
            res.append(ch)
            prev = ch
        out.append(html.escape(''.join(res), quote=False))
    return ''.join(out)


# About the Author for print: the website's version, rewritten to be more engaging and to not tie
# the author to a few subjects (used inside the book and on the back cover)
ABOUT = [
    '<p>By day, <span class="sc">Prof. Parth D. Joshi</span> teaches young minds how machines think. By night, he writes code while the house sleeps. And somewhere in between, he collects stories — of gods, ghosts, and the places where the two meet.</p>',
    '<p>For twelve years he has been an Assistant Professor at L. J. College of Computer Applications (LJCCA), Ahmedabad, where his students know him as the professor who answers a doubt with a story. He is the founder and mentor of CodeSprint Labs and AiRA Lab.</p>',
    '<p>A believer who codes, he lights a diya every evening, has never once passed a mandir without folding his hands — and still has not googled <i>Nanda Kot 1967</i>.</p>',
    '<p>He is also the author of <i>Ramayana Reimagined: The Eternal Legacy</i>, available in more than 150 countries, and of several academic books. <i>Hidden Uttarakhand</i> is his latest.</p>',
]

ORDER = ['cast', 'preface', 'note', 'intro', 'prologue',
         'part1', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'part2', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10',
         'part3', 'ch11', 'ch12', 'ch13', 'ch14', 'ch15', 'epilogue', 'route', 'sources', 'about']
HEAD = {'cast': 'Dramatis Personae', 'note': "Author's Note", 'intro': 'Introduction', 'epilogue': 'Epilogue',
        'route': 'The Route of the Journey', 'sources': 'Sources & Further Reading', 'about': 'About the Author'}
PART_MOTIF = {**{f'ch{i}': 'fog' for i in range(1, 6)}, **{f'ch{i}': 'snow' for i in range(6, 11)}, **{f'ch{i}': 'moon' for i in range(11, 16)}}
PARTS = {'part1': ('One', 'I', 4, O.sun(), 'fog'), 'part2': ('Two', 'II', 2, O.snowfall(), 'snow'), 'part3': ('Three', 'III', 3, O.moon_and_stars(), 'moon')}


def cast_pairs(inner):
    """The cast in two columns: each card gets the character's monogram, and cards go two to a row."""
    def card(m):
        c = m.group(0)
        name = re.search(r'<div class="cname">(.*?)</div>', c).group(1)
        body = re.search(r'<div class="cbody">(.*)</div>\s*</div>$', c, re.S).group(1)
        letter = re.sub(r'^(Prof\.|Dr\.|The)\s+', '', html.unescape(re.sub(r'<[^>]+>', '', name)))[0]
        return f'<div class="card">{O.monogram(letter)}<div class="cbody">{body}</div></div>'
    def cards(m):
        cs = re.findall(r'<div class="card">.*?<div class="ccarry">.*?</div></div></div>', m.group(0), re.S)
        cs = [re.sub(r'<div class="card">.*', card, c, flags=re.S) for c in cs]
        return ''.join(f'<div class="pair">{"".join(cs[i:i + 2])}</div>' for i in range(0, len(cs), 2))
    return re.sub(r'<div class="cards">.*?</div></div></div></div>(?=\s*(<h3|$|</?section|\s*<div class="finis"))', cards, inner, flags=re.S)


ROUTE = {m.group(1): (html.unescape(m.group(2)), html.unescape(m.group(3))) for m in re.finditer(
    r'<a href="#(\w+)"><span class="day">(.*?)</span><span class="place">(.*?)</span>', sections['route'][1])}
PIN = O._svg('0 0 10 14', f'<path d="M5 13.5 C1.5 8.5 .6 6.8 .6 5 A4.4 4.4 0 0 1 9.4 5 C9.4 6.8 8.5 8.5 5 13.5Z" fill="{O.INK}"/><circle cx="5" cy="5" r="1.7" fill="#fff"/>', 'pin')

ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']

body, toc = [], []
for sid in ORDER:
    kind, inner = sections[sid]
    inner = clean(inner, sid)
    if sid == 'about':   # keep the header and closing colophon, replace the paragraphs
        first, last = inner.index('<p>'), inner.index('</p>', inner.rindex('first novel')) + 4
        inner = inner[:first] + ''.join(ABOUT) + inner[last:]
    title = attr(sid, 'data-title')
    motif = PART_MOTIF.get(sid, 'diya')
    inner = re.sub(r'<div class="orn">.*?</div>', lambda m: f'<div class="orn">{O.divider(motif)}</div>', inner, flags=re.S)
    inner = re.sub(r'<div class="finis">.*?</div>', f'<div class="finis">{O.motif("diya")}</div>', inner, flags=re.S)
    if sid == 'cast':
        inner = cast_pairs(inner)
    if sid == 'route':
        days = [f'<div class="rday"><b>{n}</b><span>{html.escape(place)}</span></div>' for n, (_, place) in enumerate(ROUTE.values(), 1)]
        inner = re.sub(r'<ol class="route-list">.*?</ol>', lambda m: O.route_map() + '<div class="rdays"><div>' + ''.join(days[:8]) + '</div><div>' + ''.join(days[8:]) + '</div></div>', inner, flags=re.S)
    if sid.startswith('ch'):   # chapter opener: banner, seal, label, title, pahadi rule
        n = int(sid[2:])
        banner = re.search(r'<svg[^>]*class="banner".*?</svg>', inner, re.S)
        art = re.sub(r'#([0-9a-f]{2})\1\1\b', lambda m: '#' + f'{round(120 + int(m.group(1), 16) * .53):02x}' * 3, banner.group(0)) if banner else ''   # lift the greys: a light engraving, not a dark block
        head = (f'<header class="opener">{art}{O.seal(ROMAN[n - 1])}'
                f'<div class="clabel">{html.escape(attr(sid, "data-label"))}</div><h2 class="ctitle">{html.escape(title)}</h2>{O.zigzag()}'
                f'<div class="cday">{PIN}<span>{ROUTE[sid][0]}</span><i>·</i><span>{html.escape(ROUTE[sid][1])}</span></div></header>')
        inner = re.sub(r'<header class="opener">.*?</header>', lambda m: head, inner, count=1, flags=re.S)
    else:   # other openers: the diya over the label and title
        inner = re.sub(r'<div class="medal">.*?</div>', '', inner, count=1, flags=re.S)
        inner = re.sub(r'<header class="opener plain">', lambda m: f'<header class="opener plain">{O.divider("diya", "divider top")}', inner, count=1)
    if 'class="part"' in attrs[sid]:
        word, num, seed, sky, pm = PARTS[sid]
        name = title.split(': ', 1)[1]
        chs = re.search(r'<div class="psub">(.*?)</div>', inner).group(1)
        inner = (f'<div class="part-in"><div class="plabel">Part {word}</div><div class="pnum">{num}</div>'
                 f'<h2 class="ptitle">{html.escape(name)}</h2>{O.divider(pm)}<div class="psub">{chs}</div></div>{O.panorama(seed, sky)}')
        body.append(f'<section class="part" id="{sid}">{inner}</section>')
        toc.append(f'<li class="tpart"><a href="#{sid}">{O.motif(pm)}<span>Part {word} · {html.escape(name)}</span></a></li>')
        continue
    run = HEAD.get(sid) or attr(sid, 'data-head') or title
    cls = 'chapter' if sid.startswith('ch') else 'matter'
    body.append(f'<section class="{cls}" id="{sid}" data-run="{html.escape(run)}"><span class="run">{html.escape(run)}</span>{inner}</section>')
    label = f'<span class="tn">{ROMAN[int(sid[2:]) - 1]}</span>' if sid.startswith('ch') else '<span class="tn"></span>'
    toc.append(f'<li class="{"tch" if cls == "chapter" else "tfront"}"><a href="#{sid}">{label}<span class="tt">{html.escape(title)}</span><span class="dots"></span></a></li>')

DEDICATION = [
    ['Mummy ke liye,', 'jinhone kaha tha, "Bhoot ke peeche mat padna."', 'Sorry, Mummy. Par sweater teen pehne the.'],
    ['Un do doston ke liye,', 'jinhe is kitaab mein doosre naam mile.', 'Ek, jiske risk column mein har row <i>Low</i> thi,', 'aur ek, jisne sab likh liya.', 'Tum jaante ho tum kaun ho.'],
    ['Aur Basanti ke liye,', 'jisne humse bhi bure log dekhe hain.', 'Bas, thode se.'],
    ['Devbhoomi ke devi-devtaon ke liye,', 'Nanda Maa, Golu Devta,', 'aur har us devta ke liye jo jagar ki raat neeche utarte hain.', 'Maine har mandir pe haath jode.', 'Aapne har mod pe sambhaala.'],
    None,   # page turn
    ['Aur Uttarakhand ke pyaare logon ke liye,', 'jinhone ek ajnabi ko chai pilaayi,', 'apne geet sunaaye,', 'aur andhere mein raasta dikhaaya.', 'Pahad pe hum kabhi akele nahi the.', 'Aap the.'],
    ['Har us padhne waale ke liye', 'jisse trip se pehle kaha gaya,', '"Bas relax karenge."', 'Tumhe pata tha. Tumhe hamesha pata tha.'],
    ['Aur us jungle ke liye', 'jisne raat 3:12 baje mera naam pukaara.', 'Maine tab jawab nahi diya tha.', 'Yeh kitaab, mera jawab hai.'],
]


def dedication():
    pages, cur = [], []
    for st in DEDICATION + [None]:
        if st is None:
            pages.append(cur); cur = []
        else:
            cur.append('<p>' + '<br>'.join(st) + '</p>')
    first = f'<div class="ded-page">{O.motif("diya")}<div class="ded-label">For</div>{"".join(pages[0])}</div>'
    second = f'<div class="ded-page ded-cont">{"".join(pages[1])}<div class="ded-sign">— Parth</div>{O.divider("bell")}</div>'
    return f'<section class="front dedication">{first}{second}</section>'


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
  {O.panorama(5, O.sun())}
  <div class="tp-over">Places · People · Culture · Untold Stories</div>
  <h1><span>Hidden</span>Uttarakhand</h1>
  {O.zigzag()}
  <div class="tp-sub">The Untold Secrets of the Devbhoomi</div>
  <div class="tp-by">A Book By</div>
  <div class="tp-author">{AUTHOR}</div>
</section>
<section class="front copyright">
  <p class="cp-title">Hidden Uttarakhand</p>
  <p>Copyright © {YEAR} {AUTHOR}<br>All Rights Reserved.</p>
  <p>This book has been self-published with all reasonable efforts taken to make the material error-free by the author. No part of this book shall be used, reproduced in any manner whatsoever without written permission from the author, except in the case of brief quotations embodied in critical articles and reviews.</p>
  <p>The Author of this book is solely responsible and liable for its content including but not limited to the views, representations, descriptions, statements, information, opinions and references [“Content”]. The Content of this book shall not constitute or be construed or deemed to reflect the opinion or expression of the Publisher or Editor. Neither the Publisher nor Editor endorse or approve the Content of this book or guarantee the reliability, accuracy or completeness of the Content published herein and do not make any representations or warranties of any kind, express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose. The Publisher and Editor shall not be liable whatsoever for any errors, omissions, whether such errors or omissions result from negligence, accident, or any other cause or claims for loss or damages of any kind, including without limitation, indirect or consequential loss or damage arising out of use, inability to use, or about the reliability, accuracy or sufficiency of the information contained in this book.</p>
  <p class="cp-np">Made with ♥ on the Notion Press Platform<br>www.notionpress.com</p>
</section>
{dedication()}
<section class="front epigraph-page">{O.peak_icon()}{epigraph}{O.divider('bell')}</section>
<section class="front contents"><span class="run">Contents</span>
  <header class="opener plain">{O.divider('diya', 'divider top')}<div class="clabel">The Book</div><h2 class="ctitle">Contents</h2></header>
  <ul class="toc">{''.join(toc)}</ul>
</section>
{''.join(body)}
<section class="front alsoby">
  {O.divider('diya')}
  <div class="ab-label">Also by</div>
  <div class="ab-author">Parth D. Joshi</div>
  {O.zigzag()}
  <div class="ab-title">Ramayana Reimagined</div>
  <div class="ab-sub">The Eternal Legacy</div>
  <div class="ab-where">Available on Amazon, Flipkart<br>and in more than 150 countries</div>
  <div class="ab-more">and several academic books</div>
</section>
</body>
</html>
"""
page = smart_quotes(page)
open(os.path.join(DIR, 'interior.html'), 'w', encoding='utf-8').write(page)
words = len(re.sub(r'<[^>]+>', ' ', ''.join(body)).split())
print(f'interior.html: {len(ORDER)} sections, {words} words')
