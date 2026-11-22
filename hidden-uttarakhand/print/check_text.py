# Checks that every word of interior.html reaches the printed PDF, in order. Paged.js can drop text where a
# page breaks (it lost a hyphenated word's line and a wrapped heading in draft 7), so run this after every
# render: it compares the two word streams and reports each place the PDF is missing words, with its page.
#
#   python3 check_text.py [interior.html interior.pdf]  -> exit 1 if anything is missing
import difflib
import html
import os
import re
import subprocess
import sys
import unicodedata
from collections import Counter

DIR = os.path.dirname(os.path.abspath(__file__))
PDF = sys.argv[2] if len(sys.argv) > 2 else os.path.join(DIR, 'out', 'hidden-uttarakhand-interior.pdf')
HTML = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DIR, 'interior.html')


def words(s):
    s = unicodedata.normalize('NFKC', s).replace('‐', '-').replace('­', '').lower()
    return re.findall(r'[a-z0-9ऀ-ॿ]+', s)


def ok(src_word, pdf_word):
    """pdftotext reads Alegreya's Th ligature as T, and takes a drop cap apart from its word."""
    return pdf_word in (src_word.replace('th', 't'), src_word[1:])


def page_text(p):
    return subprocess.check_output(['pdftotext', '-f', str(p), '-l', str(p), PDF, '-']).decode()


# ---- the source, with the cast and the route's days (set in two columns) kept apart
src = open(HTML, encoding='utf-8').read()
body = src[src.index('<body>'):]
body = re.sub(r'<style.*?</style>|<svg.*?</svg>|<span class="run">.*?</span>|<ul class="toc">.*?</ul>', ' ', body, flags=re.S)
two_col = r'<section class="matter" id="(?:cast|route)".*?</section>'
cols = ' '.join(re.findall(two_col, body, re.S))
body = re.sub(two_col, ' ', body, flags=re.S)
body, cols = (re.sub(r'<br\s*/?>|</(p|li|div|h\d|header|section|blockquote)>', ' ', x) for x in (body, cols))
col_want = words(html.unescape(re.sub(r'<[^>]+>', ' ', cols)))
want = words(html.unescape(re.sub(r'<[^>]+>', '', body)))

# ---- the PDF, page by page, without running heads and folios
n = int(re.search(r'Pages:\s+(\d+)', subprocess.check_output(['pdfinfo', PDF]).decode()).group(1))
got, page_of, col_got, columns = [], [], [], []
for p in range(1, n + 1):
    t = page_text(p)
    is_columns = 'c a r r i e s' in t or 'As Recorded in' in t     # the cast cards, the route's days
    lines = [l for l in t.split('\n') if l.strip() and not re.fullmatch(r'\s*\d+\s*', l)]
    if lines and re.fullmatch(r'HIDDEN UT ?TARAKHAND', lines[0].strip()):
        lines = lines[1:]
    t = '\n'.join(lines)
    t = re.sub(r'(\w)[‐-]\n(\w)', r'\1\2', t)                                  # words hyphenated at line ends
    t = re.sub(r'\b(?:[a-z] ){2,}[a-z]\b', lambda m: m.group(0).replace(' ', ''), t)   # letter-spaced small caps
    w = words(t)
    if is_columns:
        columns.append(p)
        col_got += w
    else:
        got += w
        page_of += [p] * len(w)

problems = []
for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, want, got, autojunk=False).get_opcodes():
    if op not in ('delete', 'replace'):
        continue
    missing, extra = want[a0:a1], got[b0:b1]
    if op == 'replace' and (''.join(missing) == ''.join(extra) or
                            len(missing) == len(extra) and all(ok(m, e) for m, e in zip(missing, extra))):
        continue
    problems.append((f'p{page_of[min(b0, len(page_of) - 1)]}', ' '.join(missing), ' '.join(extra)))
lost = Counter(col_want) - Counter(col_got)
if lost:
    problems.append((f'pp{columns}', ' '.join(sorted(lost.elements())), ''))

for where, miss, extra in problems:
    print(f'{where}: missing [{miss[:140]}]' + (f'  pdf has [{extra[:80]}]' if extra else ''))
print(f'{len(want) + len(col_want)} words in the source; {len(problems)} places with text missing from the PDF')
sys.exit(1 if problems else 0)
