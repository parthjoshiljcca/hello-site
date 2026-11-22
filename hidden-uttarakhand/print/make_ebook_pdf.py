# The PDF ebook: the print interior between the front and back covers, as one 5 x 8 in PDF with the
# title and author in its properties and a bookmark for every part and chapter. Run build_epub.py
# first (it cuts the two covers out of the print cover).
#
#   python3 make_ebook_pdf.py  -> out/hidden-uttarakhand-ebook.pdf
import os
import re
import subprocess
import tempfile

from PIL import Image

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, 'out')
INTERIOR = os.path.join(OUT, 'hidden-uttarakhand-interior.pdf')
TARGET = os.path.join(OUT, 'hidden-uttarakhand-ebook.pdf')
NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
           'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen']


def page_texts(pdf):
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.check_output(['pdfinfo', pdf]).decode()).group(1))
    text = subprocess.check_output(['pdftotext', '-layout', pdf, '-']).decode()
    pages = text.split('\f')[:n]
    return [re.sub(r'\s+', ' ', p) for p in pages]


import html
TITLES = [html.unescape(t) for t in re.findall(r'<section class="chapter" id="ch\d+" data-run="([^"]*)"',
                                                open(os.path.join(DIR, 'interior.html'), encoding='utf-8').read())]


def bookmarks(pages):
    """(title, interior page index) for the openers: the matter, the three parts, the fifteen chapters."""
    marks, flat = [], [p.lower() for p in pages]
    def find(test, start=0):
        return next((i for i in range(start, len(flat)) if test(flat[i])), None)
    for label, key in [('Contents', 'the book contents'), ('Dramatis Personae', 'dramatis personae the cast'),
                       ('Preface', 'preface'), ("Author's Note", 'a warning'), ('Introduction', 'what happened on nanda devi'),
                       ('Prologue', 'a page torn from the back')]:
        i = find(lambda t, k=key: k in t and 'contents' not in t[:40] or (k == 'the book contents' and k in t))
        if i is not None:
            marks.append((label, i))
    for n, word in enumerate(NUMBERS, 1):
        i = find(lambda t, w=word: f'chapter {w} ' in t)
        if i is not None:
            marks.append((f'{n}. {TITLES[n - 1]}', i))
    for label, key in [('Epilogue', 'ten months later'), ('The Route of the Journey', 'as recorded in'),
                       ('Sources', 'sources & further reading folk'), ('About the Author', 'about the author by day'),
                       ('Also by Parth D. Joshi', 'the eternal legacy available')]:
        i = find(lambda t, k=key: k in t, 30)
        if i is not None:
            marks.append((label, i))
    return sorted(marks, key=lambda m: m[1])


def main():
    tmp = tempfile.mkdtemp()
    imgs = os.path.join(OUT, 'epub-build', 'images')
    parts = []
    for name in ('cover', 'back-cover'):
        pdf = os.path.join(tmp, name + '.pdf')
        Image.open(os.path.join(imgs, name + '.jpg')).convert('RGB').save(pdf, resolution=320)   # 1600 x 2560 px = 5 x 8 in
        parts.append(pdf)
    joined = os.path.join(tmp, 'joined.pdf')
    subprocess.run(['pdfunite', parts[0], INTERIOR, parts[1], joined], check=True)

    def esc(s):
        return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
    marks = [('Cover', 1)] + [(t, i + 2) for t, i in bookmarks(page_texts(INTERIOR))] + [('Back Cover', page_texts(INTERIOR).__len__() + 2)]
    pdfmark = os.path.join(tmp, 'marks.ps')
    with open(pdfmark, 'w', encoding='latin-1', errors='replace') as f:
        f.write('[ /Title (Hidden Uttarakhand: The Untold Secrets of the Devbhoomi) /Author (Parth D. Joshi) '
                '/Subject (A novel) /Keywords (Uttarakhand, folklore, thriller, Nanda Devi, Roopkund) /DOCINFO pdfmark\n')
        for title, page in marks:
            f.write(f'[ /Title ({esc(title.replace("’", chr(39)))}) /Page {page} /OUT pdfmark\n')
        f.write('[ /PageMode /UseOutlines /Page 1 /View [/Fit] /DOCVIEW pdfmark\n')
    subprocess.run(['gs', '-q', '-dSAFER', '-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-dPDFSETTINGS=/ebook',
                    '-dColorImageResolution=200', '-dAutoRotatePages=/None', f'-sOutputFile={TARGET}', joined, pdfmark], check=True)
    n = re.search(r'Pages:\s+(\d+)', subprocess.check_output(['pdfinfo', TARGET]).decode()).group(1)
    print(f'{TARGET}: {n} pages, {len(marks)} bookmarks, {os.path.getsize(TARGET) / 1e6:.1f} MB')
    for t, p in marks:
        print(f'  p{p:>3}  {t}')


if __name__ == '__main__':
    main()
