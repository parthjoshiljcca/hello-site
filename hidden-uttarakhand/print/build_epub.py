# Builds the ebook (EPUB 3, reflowable) of Hidden Uttarakhand from the print interior, so the two
# editions carry the same text, revisions and ornaments: the front cover opens the book and the back
# cover closes it. Run build_interior.py and make_cover.js first.
#
#   python3 build_epub.py  -> out/hidden-uttarakhand.epub
import html
import html.entities
import os
import re
import subprocess
import uuid
import zipfile
from datetime import datetime, timezone

from lxml import etree
from PIL import Image

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, 'out')
TMP = os.path.join(OUT, 'epub-build')
TITLE, SUBTITLE, AUTHOR = 'Hidden Uttarakhand', 'The Untold Secrets of the Devbhoomi', 'Parth D. Joshi'
BOOK_ID = 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, 'hidden-uttarakhand-ebook-en'))   # stable across rebuilds
XHTML = 'http://www.w3.org/1999/xhtml'
FONTS = ['Alegreya-400', 'Alegreya-400i', 'Alegreya-700', 'AlegreyaSC-400', 'AlegreyaSC-500', 'Cinzel-400', 'Cinzel-600',
         'CinzelDecorative-400', 'CinzelDecorative-700', 'Kalam-400', 'Kalam-700', 'NotoSerifDevanagari-400']


# ---- covers: the front and back panels of the print cover, at trim, 1600 x 2560 (Kindle's 1:1.6) ----
def covers():
    os.makedirs(os.path.join(TMP, 'images'), exist_ok=True)
    pdf = os.path.join(OUT, 'hidden-uttarakhand-cover.pdf')
    w_in = float(re.search(r'Page size:\s+([\d.]+)', subprocess.check_output(['pdfinfo', pdf]).decode()).group(1)) / 72
    dpi, bleed = 320, .139
    png = os.path.join(TMP, 'wrap')
    subprocess.run(['pdftoppm', '-r', str(dpi), '-png', '-singlefile', pdf, png], check=True)
    wrap = Image.open(png + '.png').convert('RGB')
    os.remove(png + '.png')
    px = lambda inch: round(inch * dpi)
    top, h, w = px(bleed), px(8), px(5)
    back = wrap.crop((px(bleed), top, px(bleed) + w, top + h))
    front = wrap.crop((px(w_in - bleed - 5), top, px(w_in - bleed - 5) + w, top + h))
    for img, name in ((front, 'cover.jpg'), (back, 'back-cover.jpg')):
        img.resize((1600, 2560), Image.LANCZOS).save(os.path.join(TMP, 'images', name), quality=90, dpi=(300, 300))


# ---- text: the interior's sections, one XHTML file each ----
NAMED = {k: v for k, v in html.entities.name2codepoint.items() if k not in ('amp', 'lt', 'gt', 'quot', 'apos')}
VOID = r'(br|img|hr|meta|wbr|col|input)'


def xhtml(fragment):
    """The interior's HTML as well-formed XML: void tags closed, named entities as numbers."""
    fragment = re.sub(r'&(\w+);', lambda m: f'&#{NAMED[m.group(1)]};' if m.group(1) in NAMED else m.group(0), fragment)
    fragment = re.sub(rf'<{VOID}(\b[^>]*?)\s*/?>', r'<\1\2/>', fragment)
    return fragment


def page(title, body, cls='', extra_head=''):
    doc = (f'<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n'
           f'<html xmlns="{XHTML}" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">\n'
           f'<head><meta charset="utf-8"/><title>{html.escape(title)}</title>'
           f'<link rel="stylesheet" type="text/css" href="../css/ebook.css"/>{extra_head}</head>\n'
           f'<body{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}>\n{body}\n</body>\n</html>\n')
    etree.fromstring(doc.encode())   # fail loudly on anything not well-formed
    return doc


def css():
    """interior.css made for reflowing screens: no pages or running heads, sizes relative to the reader's own."""
    s = open(os.path.join(DIR, 'interior.css'), encoding='utf-8').read()
    s = re.sub(r'@page[^{]*\{(?:[^{}]|\{[^{}]*\})*\}\s*', '', s)                      # page boxes
    s = s.replace('url(fonts/', 'url(../fonts/')
    s = re.sub(r'(\d*\.?\d+)pt', lambda m: f'{float(m.group(1)) / 10.8:.3g}em', s)      # points -> em of the body size
    s = re.sub(r'(\d*\.?\d+)in\b', lambda m: f'{float(m.group(1)) * 3.2:.3g}em', s)     # inches -> about half their print size
    s = re.sub(r'break-before:\s*(right|left)', 'break-before: page; page-break-before: always', s)
    s = re.sub(r'\bpage:\s*\w+;', '', s)
    s = re.sub(r'^.*target-counter.*$\n', '', s, flags=re.M)
    return s + '''
/* ---- ebook ---- */
html { font-size: 100%; }
body { margin: 0 3%; }
.run, ul.toc .dots { display: none; }
ul.toc a { display: block; }
ul.toc .tn { display: inline-block; width: 2.4em; }
.copyright { padding-top: 2em; }
section.part .part-in { padding-top: 2em; }
section.part .panorama { margin-top: 2em; }
/* the cast and the route's days, two to a row, without print's font-size: 0 trick */
.pair, .rdays { font-size: 1em; line-height: inherit; }
.card { font-size: 1em; width: 47%; }
.pair .card + .card, .rdays > div + div { margin-left: 4%; }
.rdays > div { font-size: 1em; width: 47%; }
.titlepage h1 { font-size: 2.1em; letter-spacing: .02em; }
.titlepage h1 span { font-size: .55em; letter-spacing: .3em; margin-left: .3em; }
.cover-page { margin: 0; padding: 0; text-align: center; }
.cover-page img { max-width: 100%; max-height: 100vh; }
'''


def build():
    covers()
    src = open(os.path.join(DIR, 'interior.html'), encoding='utf-8').read()
    body = src[src.index('<body>') + 6:src.rindex('</body>')]
    sections = re.findall(r'<section\b.*?</section>(?=\s*(?:<section|$))', body, re.S)
    files, ids, toc, idx = [], {}, [], 0
    names = {'titlepage': 'Title Page', 'copyright': 'Copyright', 'dedication': 'Dedication', 'epigraph-page': 'Epigraph',
             'contents': 'Contents', 'alsoby': 'Also by Parth D. Joshi'}
    for sec in sections:
        idx += 1
        m = re.match(r'<section\b([^>]*)>', sec)
        attrs = m.group(1)
        sid = (re.search(r'\bid="([^"]+)"', attrs) or [None, None])[1]
        cls = re.search(r'class="([^"]*)"', attrs).group(1)
        label = html.unescape(re.search(r'data-run="([^"]*)"', attrs).group(1)) if 'data-run=' in attrs else None
        if not label:
            label = next((v for k, v in names.items() if k in cls.split()), None)
            if 'part' in cls.split():
                label = html.unescape(re.sub(r'<[^>]+>', ' ', re.search(r'<div class="plabel">(.*?)</div>', sec).group(1))).strip() + ': ' + \
                        html.unescape(re.sub(r'<[^>]+>', '', re.search(r'<h2 class="ptitle">(.*?)</h2>', sec, re.S).group(1))).strip()
        name = f'{idx:02d}-{sid or cls.split()[-1]}.xhtml'
        for i in re.findall(r'\bid="([^"]+)"', sec):
            ids.setdefault(i, name)
        files.append((name, label or TITLE, sec))
        if 'part' in cls.split() or sid:
            toc.append((name, label, 'part' in cls.split()))
        elif label in ('Dedication', 'Contents', 'Also by Parth D. Joshi'):
            toc.append((name, label, False))

    text = os.path.join(TMP, 'text')
    os.makedirs(text, exist_ok=True)
    manifest, spine = [], []
    for name, label, sec in files:
        sec = re.sub(r'href="#([^"]+)"', lambda m: f'href="{ids.get(m.group(1), "")}#{m.group(1)}"', sec)
        open(os.path.join(text, name), 'w', encoding='utf-8').write(page(label, xhtml(sec)))
        manifest.append(f'<item id="x{name[:2]}" href="text/{name}" media-type="application/xhtml+xml"'
                        f'{" properties=" + chr(34) + "svg" + chr(34) if "<svg" in sec else ""}/>')
        spine.append(f'<itemref idref="x{name[:2]}"/>')

    open(os.path.join(text, 'cover.xhtml'), 'w', encoding='utf-8').write(page(
        'Cover', f'<section epub:type="cover" class="cover-page"><img src="../images/cover.jpg" alt="{TITLE} by {AUTHOR}"/></section>', 'cover-page'))
    open(os.path.join(text, 'back-cover.xhtml'), 'w', encoding='utf-8').write(page(
        'Back Cover', '<section class="cover-page"><img src="../images/back-cover.jpg" alt="Back cover: the book description and About the Author"/></section>', 'cover-page'))

    nav_items = ''.join(f'<li><a href="text/{n}">{html.escape(l)}</a></li>' for n, l, _ in toc)
    nav = page('Contents', f'<nav epub:type="toc" id="toc"><h1>Contents</h1><ol><li><a href="text/cover.xhtml">Cover</a></li>{nav_items}'
               f'<li><a href="text/back-cover.xhtml">Back Cover</a></li></ol></nav>'
               f'<nav epub:type="landmarks" hidden=""><ol><li><a epub:type="cover" href="text/cover.xhtml">Cover</a></li>'
               f'<li><a epub:type="toc" href="text/{next(n for n, l, _ in toc if l == "Contents")}">Contents</a></li>'
               f'<li><a epub:type="bodymatter" href="text/{ids["prologue"]}">Begin Reading</a></li></ol></nav>').replace('../css/', 'css/')
    open(os.path.join(TMP, 'nav.xhtml'), 'w', encoding='utf-8').write(nav)

    # toc.ncx for older readers
    points = ''.join(f'<navPoint id="n{i}" playOrder="{i}"><navLabel><text>{html.escape(l)}</text></navLabel><content src="text/{n}"/></navPoint>'
                     for i, (n, l, _) in enumerate([('cover.xhtml', 'Cover', 0)] + toc + [('back-cover.xhtml', 'Back Cover', 0)], 1))
    open(os.path.join(TMP, 'toc.ncx'), 'w', encoding='utf-8').write(
        f'<?xml version="1.0" encoding="utf-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head>'
        f'<meta name="dtb:uid" content="{BOOK_ID}"/></head><docTitle><text>{TITLE}</text></docTitle><navMap>{points}</navMap></ncx>\n')

    os.makedirs(os.path.join(TMP, 'css'), exist_ok=True)
    open(os.path.join(TMP, 'css', 'ebook.css'), 'w', encoding='utf-8').write(css())
    os.makedirs(os.path.join(TMP, 'fonts'), exist_ok=True)
    for f in FONTS:
        with open(os.path.join(DIR, 'fonts', f + '.ttf'), 'rb') as a, open(os.path.join(TMP, 'fonts', f + '.ttf'), 'wb') as b:
            b.write(a.read())

    desc = ('In October 2026, Professor Parth goes to Uttarakhand to relax. He comes back with a police statement, a YouTube '
            'channel that will not stop tagging him, and a man chasing them across the state for something buried under the '
            'snow of Nanda Devi.')
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    items = '\n    '.join(manifest + [
        '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
        '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
        '<item id="css" href="css/ebook.css" media-type="text/css"/>',
        '<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>',
        '<item id="back-image" href="images/back-cover.jpg" media-type="image/jpeg"/>',
        '<item id="cover" href="text/cover.xhtml" media-type="application/xhtml+xml"/>',
        '<item id="back" href="text/back-cover.xhtml" media-type="application/xhtml+xml"/>'] +
        [f'<item id="f{i}" href="fonts/{f}.ttf" media-type="font/ttf"/>' for i, f in enumerate(FONTS)])
    opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">{BOOK_ID}</dc:identifier>
    <dc:title id="t">{TITLE}</dc:title>
    <meta refines="#t" property="title-type">main</meta>
    <dc:title id="st">{SUBTITLE}</dc:title>
    <meta refines="#st" property="title-type">subtitle</meta>
    <dc:creator id="a">{AUTHOR}</dc:creator>
    <meta refines="#a" property="role" scheme="marc:relators">aut</meta>
    <dc:language>en</dc:language>
    <dc:date>2026</dc:date>
    <dc:rights>Copyright © 2026 {AUTHOR}. All rights reserved.</dc:rights>
    <dc:subject>Fiction / Thrillers</dc:subject>
    <dc:subject>Folklore</dc:subject>
    <dc:description>{html.escape(desc)}</dc:description>
    <meta property="dcterms:modified">{now}</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    {items}
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover" linear="yes"/>
    {chr(10).join("    " + s for s in spine).strip()}
    <itemref idref="back" linear="yes"/>
  </spine>
</package>
'''
    open(os.path.join(TMP, 'content.opf'), 'w', encoding='utf-8').write(opf)
    os.makedirs(os.path.join(TMP, 'META-INF'), exist_ok=True)
    open(os.path.join(TMP, 'META-INF', 'container.xml'), 'w').write(
        '<?xml version="1.0" encoding="utf-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
        '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>\n')

    epub = os.path.join(OUT, 'hidden-uttarakhand.epub')
    with zipfile.ZipFile(epub, 'w') as z:
        z.writestr(zipfile.ZipInfo('mimetype'), 'application/epub+zip', compress_type=zipfile.ZIP_STORED)   # first, uncompressed
        z.write(os.path.join(TMP, 'META-INF', 'container.xml'), 'META-INF/container.xml', zipfile.ZIP_DEFLATED)
        for root, _, fs in os.walk(TMP):
            for f in sorted(fs):
                p = os.path.join(root, f)
                rel = os.path.relpath(p, TMP)
                if rel.startswith('META-INF'):
                    continue
                z.write(p, 'OEBPS/' + rel, zipfile.ZIP_DEFLATED)
    print(f'{epub}: {len(files)} sections + covers, {os.path.getsize(epub) / 1e6:.1f} MB')


if __name__ == '__main__':
    import shutil
    shutil.rmtree(TMP, ignore_errors=True)
    build()
