# Hand-drawn ornaments for the Hidden Uttarakhand interior, as inline SVG in shades of grey (the
# interior prints in black and white). One family of motifs: peaks, fog, snow, moon and pine, the
# diya and the temple bell.
import math
import random

INK, MID, LIGHT = '#1e1e1e', '#6e6e6e', '#c8c8c8'


def _svg(vb, body, cls='', w=None, h=None):
    size = (f' width="{w}"' if w else '') + (f' height="{h}"' if h else '')
    return f'<svg class="{cls}" viewBox="{vb}"{size} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{body}</svg>'


# ---- small motifs, each drawn in a 40x24 box -------------------------------------------------
def _fog():   # Part One, Garhwal Fog: a peak over drifting fog
    return (f'<path d="M7 14 L15 5 L18.5 8.5 L22 4 L31 14" fill="none" stroke="{INK}" stroke-width="1.1" stroke-linejoin="round"/>'
            f'<path d="M20.3 6.2 L22 4 L23.8 6.4 L22.8 6 L22 6.9 L21.3 6Z" fill="{INK}"/>'
            f'<path d="M4 18 q3 -2.4 6 0 t6 0 t6 0 t6 0 t6 0" fill="none" stroke="{MID}" stroke-width=".9"/>'
            f'<path d="M9 21.6 q3 -2.4 6 0 t6 0 t6 0 t6 0" fill="none" stroke="{MID}" stroke-width=".9"/>')


def _snow():   # Part Two, Secrets Under the Snow: a six-armed snow crystal
    out = []
    for k in range(6):
        a = math.radians(k * 60 - 90)
        x, y = 20 + 9.5 * math.cos(a), 12 + 9.5 * math.sin(a)
        out.append(f'<line x1="20" y1="12" x2="{x:.2f}" y2="{y:.2f}" stroke="{INK}" stroke-width="1"/>')
        for r, l in ((5.2, 2.6), (7.6, 1.8)):
            bx, by = 20 + r * math.cos(a), 12 + r * math.sin(a)
            for s in (-1, 1):
                b = a + s * math.radians(55)
                out.append(f'<line x1="{bx:.2f}" y1="{by:.2f}" x2="{bx + l * math.cos(b):.2f}" y2="{by + l * math.sin(b):.2f}" stroke="{INK}" stroke-width=".8"/>')
    out.append(f'<circle cx="20" cy="12" r="1.5" fill="#fff" stroke="{INK}" stroke-width=".8"/>')
    return ''.join(out)


def _moon():   # Part Three, Shadows of Kumaon: a crescent moon over a deodar
    return (f'<path d="M15.5 3.2 A7.2 7.2 0 1 0 19.8 15.4 A5.8 5.8 0 1 1 15.5 3.2Z" fill="{INK}"/>'
            f'<path d="M27 4 L23.5 10 L25.4 10 L22.4 15 L24.6 15 L21.4 20 L32.6 20 L29.4 15 L31.6 15 L28.6 10 L30.5 10Z" fill="{MID}"/>'
            f'<rect x="26.3" y="20" width="1.4" height="2.6" fill="{MID}"/>'
            f'<line x1="6" y1="22.6" x2="36" y2="22.6" stroke="{MID}" stroke-width=".6"/>')


def _diya():   # front and back matter: an oil lamp with its flame
    return (f'<path d="M20 2.5 C23.4 7 23.2 10.2 20 12.2 C16.8 10.2 16.6 7 20 2.5Z" fill="{INK}"/>'
            f'<path d="M20 6.4 C21.2 8.2 21.1 9.6 20 10.4 C18.9 9.6 18.8 8.2 20 6.4Z" fill="#fff"/>'
            f'<path d="M8 14 C10 20.5 30 20.5 32 14 Z" fill="{MID}"/>'
            f'<path d="M7 14 L33 14" stroke="{INK}" stroke-width="1.1"/>'
            f'<path d="M14.5 20.5 L25.5 20.5" stroke="{INK}" stroke-width="1.1" stroke-linecap="round"/>')


def _bell():   # the temple bell
    return (f'<path d="M20 2 L20 5" stroke="{INK}" stroke-width="1"/><circle cx="20" cy="5.6" r="1.1" fill="none" stroke="{INK}" stroke-width=".8"/>'
            f'<path d="M15.6 9 C15.6 7.2 17.6 6.6 20 6.6 C22.4 6.6 24.4 7.2 24.4 9 L25.4 16.5 L27.6 18.4 L12.4 18.4 L14.6 16.5Z" fill="{MID}" stroke="{INK}" stroke-width=".8"/>'
            f'<circle cx="20" cy="20.6" r="1.6" fill="{INK}"/>')


MOTIFS = {'fog': _fog, 'snow': _snow, 'moon': _moon, 'diya': _diya, 'bell': _bell}


def divider(motif, cls='divider'):
    """A motif between two fine rules that end in small diamonds."""
    rule = ''.join(f'<line x1="{a}" y1="12" x2="{b}" y2="12" stroke="{MID}" stroke-width=".6"/>' for a, b in ((6, 66), (134, 194)))
    dia = ''.join(f'<path d="M{x} 9.6 L{x + 2.4} 12 L{x} 14.4 L{x - 2.4} 12Z" fill="{INK}"/>' for x in (70, 130, 4, 196))
    return _svg('0 0 200 24', rule + dia + f'<g transform="translate(80 0)">{MOTIFS[motif]()}</g>', cls)


def motif(name, cls='motif'):
    return _svg('0 0 40 24', MOTIFS[name](), cls)


def peak_icon(cls='peak'):
    return _svg('0 0 24 12', f'<path d="M1 11 L7 4 L10 7 L14 1 L19 7 L21 5 L23 11" fill="none" stroke="{INK}" stroke-width="1.1" stroke-linejoin="round"/>'
                             f'<path d="M12.4 3.3 L14 1 L15.6 3.2 L14.7 2.9 L14 3.7 L13.3 2.9Z" fill="{INK}"/>', cls)


def seal(numeral, cls='seal'):
    """Chapter seal: a ring of 32 ticks and 8 diamonds, like the rim of a temple bell, round the numeral."""
    ticks = ''.join(f'<line x1="{50 + 41 * math.cos(a):.2f}" y1="{50 + 41 * math.sin(a):.2f}" x2="{50 + (44 if k % 4 else 45.5) * math.cos(a):.2f}" '
                    f'y2="{50 + (44 if k % 4 else 45.5) * math.sin(a):.2f}" stroke="{INK}" stroke-width="{1 if k % 4 else 1.4}"/>'
                    for k in range(32) for a in [math.radians(k * 360 / 32)])
    dias = ''.join(f'<path d="M{50 + 37.5 * math.cos(a):.2f} {50 + 37.5 * math.sin(a) - 2.2:.2f} l2.2 2.2 l-2.2 2.2 l-2.2 -2.2z" fill="{INK}"/>'
                   for a in [math.radians(k * 45 + 22.5) for k in range(8)])
    body = (f'<circle cx="50" cy="50" r="47.5" fill="#fff" stroke="{INK}" stroke-width=".9"/>{ticks}'
            f'<circle cx="50" cy="50" r="34" fill="#fff" stroke="{INK}" stroke-width="1.6"/><circle cx="50" cy="50" r="31" fill="none" stroke="{MID}" stroke-width=".5"/>{dias}'
            f'<text x="50" y="{59 if len(numeral) < 3 else 58}" text-anchor="middle" font-family="Cinzel" font-weight="600" '
            f'font-size="{26 if len(numeral) < 3 else 20 if len(numeral) == 3 else 17}" fill="{INK}">{numeral}</text>')
    return _svg('0 0 100 100', body, cls)


def monogram(letter, cls='mono'):
    """A character's seal for the cast: the initial in a double ring with four peak points."""
    pts = ''.join(f'<path d="M{50 + 41 * math.cos(a) - 3 * math.sin(a):.2f} {50 + 41 * math.sin(a) + 3 * math.cos(a):.2f} L{50 + 47 * math.cos(a):.2f} {50 + 47 * math.sin(a):.2f} '
                  f'L{50 + 41 * math.cos(a) + 3 * math.sin(a):.2f} {50 + 41 * math.sin(a) - 3 * math.cos(a):.2f}Z" fill="{INK}"/>' for a in [math.radians(k * 90 - 90) for k in range(4)])
    body = (f'{pts}<circle cx="50" cy="50" r="41" fill="#fff" stroke="{INK}" stroke-width="1.4"/><circle cx="50" cy="50" r="35.5" fill="none" stroke="{MID}" stroke-width=".7"/>'
            f'<text x="50" y="61" text-anchor="middle" font-family="Cinzel Decorative" font-weight="700" font-size="32" fill="{INK}">{letter}</text>')
    return _svg('0 0 100 100', body, cls)


def zigzag(cls='zigzag'):
    """A pahadi rule: a band of small peaks, closed at each end by a diamond."""
    peaks = ' '.join(f'L{x + 3} 2 L{x + 6} 7' for x in range(14, 180, 6))
    return _svg('0 0 200 10', f'<path d="M14 7 {peaks}" fill="none" stroke="{MID}" stroke-width=".8" stroke-linejoin="round"/>'
                              f'<path d="M7 7 l3 -3 l3 3 l-3 3z M193 7 l-3 -3 l-3 3 l3 3z" fill="{INK}"/>', cls)


def panorama(seed, extra='', cls='panorama'):
    """A Himalayan range in fine line: a pale far range behind a near range with one high peak and
    snow down its upper slopes, drawn from fractal ridges so every part's range is different."""
    rnd = random.Random(seed)

    def ridge(n, rough, peak_at, peak_h):
        y = [0.0] * (n + 1)
        y[0], y[n] = rnd.random() * .4, rnd.random() * .4
        step, d = n, 1.0
        while step > 1:
            for i in range(step // 2, n, step):
                y[i] = (y[i - step // 2] + y[i + step // 2]) / 2 + (rnd.random() - .5) * d
            step //= 2
            d *= rough
        lo, hi = min(y), max(y)
        y = [((v - lo) / (hi - lo)) ** 1.7 for v in y]   # sharpen: narrow summits, broad valleys
        return [(i * 400 / n, min(1, v * .75 + peak_h * math.exp(-((i / n - peak_at) / .05) ** 2))) for i, v in enumerate(y)]

    far = [(x, 98 - 84 * v) for x, v in ridge(128, .68, rnd.uniform(.2, .8), .3)]
    near = [(x, 116 - 92 * v) for x, v in ridge(128, .64, rnd.uniform(.3, .7), .55)]
    path = lambda pts: 'M0 120 ' + ' '.join(f'L{x:.1f} {y:.1f}' for x, y in pts) + ' L400 120 Z'
    snow_line = min(y for _, y in near) + 30
    snow = []
    for (x0, y0), (x1, y1) in zip(near, near[1:]):
        if y0 < snow_line and y1 < snow_line:
            d0, d1 = (snow_line - y0) * .7, (snow_line - y1) * .7
            snow.append(f'M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f} L{x1:.1f} {y1 + d1 * (.6 + .4 * rnd.random()):.1f} L{x0:.1f} {y0 + d0 * (.6 + .4 * rnd.random()):.1f}Z')
    return _svg('0 0 400 120', f'<path d="{path(far)}" fill="#ededed" stroke="{LIGHT}" stroke-width=".7"/>'
                               f'<path d="{path(near)}" fill="#fff" stroke="{INK}" stroke-width="1" stroke-linejoin="round"/>'
                               f'<path d="{" ".join(snow)}" fill="{MID}"/>'
                               f'<line x1="0" y1="117" x2="400" y2="117" stroke="{INK}" stroke-width=".8"/>{extra}', cls)


def sun():
    return (f'<circle cx="318" cy="30" r="11" fill="none" stroke="{INK}" stroke-width=".9"/>'
            + ''.join(f'<line x1="{318 + 14 * math.cos(a):.1f}" y1="{30 + 14 * math.sin(a):.1f}" x2="{318 + 19 * math.cos(a):.1f}" y2="{30 + 19 * math.sin(a):.1f}" stroke="{INK}" stroke-width=".7"/>'
                      for a in [math.radians(k * 30) for k in range(12)]))


def moon_and_stars():
    stars = ''.join(f'<circle cx="{x}" cy="{y}" r=".9" fill="{INK}"/>' for x, y in ((40, 18), (92, 30), (150, 12), (210, 26), (260, 10), (360, 22), (380, 40)))
    return f'<path d="M318 14 A12 12 0 1 0 330 34 A9.6 9.6 0 1 1 318 14Z" fill="{INK}"/>{stars}'


def snowfall():
    rnd = random.Random(7)
    return ''.join(f'<circle cx="{rnd.random() * 400:.1f}" cy="{rnd.random() * 60:.1f}" r="{.6 + rnd.random() * .8:.1f}" fill="{MID}"/>' for _ in range(60))


# ---- the route map: the fifteen days of the journey on the real map, with rivers and peaks ------
STOPS = [(30.459, 78.066), (30.146, 78.598), (30.255, 78.80), (30.735, 79.067), (30.49, 79.21), (30.665, 79.73), (30.555, 79.565),
         (30.17, 79.62), (29.85, 79.75), (29.62, 79.67), (29.675, 80.05), (29.40, 80.03), (29.33, 80.09), (30.10, 80.20), (30.067, 80.239)]
RIVERS = {
    'Bhagirathi': [(30.99, 78.94), (30.73, 78.44), (30.38, 78.48), (30.146, 78.598)],
    'Alaknanda': [(30.744, 79.49), (30.555, 79.565), (30.40, 79.32), (30.26, 79.22), (30.285, 78.98), (30.22, 78.78), (30.146, 78.598)],
    'Mandakini': [(30.735, 79.067), (30.65, 79.02), (30.52, 79.08), (30.285, 78.98)],
    'Ganga': [(30.146, 78.598), (30.087, 78.268), (29.945, 78.164)],
    'Saryu': [(30.02, 79.92), (29.84, 79.77), (29.60, 79.96), (29.43, 80.25)],
    'Kali': [(30.30, 80.75), (29.85, 80.54), (29.56, 80.40), (29.43, 80.25), (29.07, 80.11)],
}
PEAKS = {'Nanda Devi': (30.376, 79.971), 'Trishul': (30.31, 79.77), 'Panchachuli': (30.21, 80.42), 'Kedarnath': (30.80, 79.07)}
PEAK_LABEL = {'Kedarnath': (10, 2, 'start'), 'Trishul': (8, 15.5, 'start'), 'Nanda Devi': (11, 2, 'start'), 'Panchachuli': (0, 13, 'middle')}
RIVER_LABEL = {'Bhagirathi': 2, 'Alaknanda': 4, 'Mandakini': 2, 'Ganga': 2, 'Saryu': 2, 'Kali': 3}
BOX = (77.85, 28.95, 80.85, 31.1)   # lon0, lat0, lon1, lat1


def _xy(lat, lon, w=400):
    k = w / ((BOX[2] - BOX[0]) * math.cos(math.radians(30)))
    return (lon - BOX[0]) * math.cos(math.radians(30)) * k, (BOX[3] - lat) * k


def _smooth(pts):
    """A smooth path through points (Catmull-Rom as cubic Béziers)."""
    p = [pts[0]] + pts + [pts[-1]]
    d = f'M{p[1][0]:.1f} {p[1][1]:.1f}'
    for i in range(1, len(p) - 2):
        (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p[i - 1], p[i], p[i + 1], p[i + 2]
        d += f' C{x1 + (x2 - x0) / 6:.1f} {y1 + (y2 - y0) / 6:.1f} {x2 - (x3 - x1) / 6:.1f} {y2 - (y3 - y1) / 6:.1f} {x2:.1f} {y2:.1f}'
    return d


def route_map(cls='routemap'):
    W = 400
    H = round(_xy(BOX[1], BOX[0])[1])
    out = [f'<rect x="1" y="1" width="{W - 2}" height="{H - 2}" fill="none" stroke="{INK}" stroke-width="1.2"/>',
           f'<rect x="5" y="5" width="{W - 10}" height="{H - 10}" fill="none" stroke="{MID}" stroke-width=".5"/>']
    # faint graticule
    for lat in (29.5, 30, 30.5, 31):
        y = _xy(lat, BOX[0])[1]
        out.append(f'<line x1="5" y1="{y:.1f}" x2="{W - 5}" y2="{y:.1f}" stroke="#e4e4e4" stroke-width=".5"/>')
    for lon in (78, 78.5, 79, 79.5, 80, 80.5):
        x = _xy(BOX[3], lon)[0]
        out.append(f'<line x1="{x:.1f}" y1="5" x2="{x:.1f}" y2="{H - 5}" stroke="#e4e4e4" stroke-width=".5"/>')
    for name, pts in RIVERS.items():
        xy = [_xy(*p) for p in pts]
        out.append(f'<path d="{_smooth(xy)}" fill="none" stroke="#9a9a9a" stroke-width="1.3" stroke-linecap="round"/>')
        mx, my = xy[RIVER_LABEL[name]] if name != 'Ganga' else ((xy[1][0] + xy[2][0]) / 2, (xy[1][1] + xy[2][1]) / 2 + 12)
        out.append(f'<text x="{mx + 4:.1f}" y="{my - 3:.1f}" font-family="Alegreya" font-style="italic" font-size="10.9" fill="#808080">{name}</text>')
    for name, (lat, lon) in PEAKS.items():
        x, y = _xy(lat, lon)
        out.append(f'<path d="M{x - 7:.1f} {y + 5:.1f} L{x:.1f} {y - 7:.1f} L{x + 7:.1f} {y + 5:.1f}Z" fill="#fff" stroke="{INK}" stroke-width=".9"/>'
                   f'<path d="M{x - 3:.1f} {y - 1.8:.1f} L{x:.1f} {y - 7:.1f} L{x + 3:.1f} {y - 1.8:.1f} L{x:.1f} {y - 3.2:.1f}Z" fill="{INK}"/>'
                   f'<text x="{x + PEAK_LABEL[name][0]:.1f}" y="{y + PEAK_LABEL[name][1] * 1.3:.1f}" text-anchor="{PEAK_LABEL[name][2]}" font-family="Alegreya SC" font-size="10.2" fill="{INK}">{name}</text>')
    x, y = _xy(30.26, 79.73)   # Roopkund, the skeleton lake, at the foot of Trishul
    out.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="3.2" ry="2" fill="{MID}"/><text x="{x + 6:.1f}" y="{y + 3:.1f}" font-family="Alegreya" font-style="italic" font-size="9.4" fill="{MID}">Roopkund</text>')
    stops = [_xy(*p) for p in STOPS]
    start = _xy(30.19, 78.19)   # flying in at Jolly Grant, Dehradun
    route = ' '.join(f'{"M" if i == 0 else "L"}{x:.1f} {y:.1f}' for i, (x, y) in enumerate([start] + stops))
    out.append(f'<path d="{route}" fill="none" stroke="{INK}" stroke-width="1.3" stroke-dasharray="3.5 3" stroke-linecap="round" stroke-linejoin="round"/>')
    sx, sy = start
    out.append(f'<path d="M{sx - 5:.1f} {sy:.1f} L{sx + 5:.1f} {sy:.1f} M{sx:.1f} {sy - 5:.1f} L{sx:.1f} {sy + 5:.1f}" stroke="{INK}" stroke-width="1"/>'
               f'<text x="{sx:.1f}" y="{sy + 17:.1f}" text-anchor="middle" font-family="Alegreya SC" font-size="10.2" fill="{INK}">Dehradun</text>')
    nudge = {12: (-16, 2), 13: (14, 9), 15: (15, 9), 14: (5, -16), 7: (-2, 12), 6: (8, -11), 11: (12, -8), 4: (0, 12), 5: (0, 4)}
    for i, (x, y) in enumerate(stops, 1):
        dx, dy = nudge.get(i, (0, 0))
        if dx or dy:
            out.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x + dx:.1f}" y2="{y + dy:.1f}" stroke="{INK}" stroke-width=".6"/>')
        out.append(f'<circle cx="{x + dx:.1f}" cy="{y + dy:.1f}" r="8.6" fill="#fff" stroke="{INK}" stroke-width="1.1"/>'
                   f'<text x="{x + dx:.1f}" y="{y + dy + 3.6:.1f}" text-anchor="middle" font-family="Cinzel" font-weight="600" font-size="10.2" fill="{INK}">{i}</text>')
    # compass rose, bottom left
    cx, cy = 34, H - 36
    out.append(f'<circle cx="{cx}" cy="{cy}" r="13" fill="none" stroke="{MID}" stroke-width=".6"/>'
               f'<path d="M{cx} {cy - 19} L{cx + 3.5} {cy} L{cx} {cy + 19} L{cx - 3.5} {cy}Z" fill="#fff" stroke="{INK}" stroke-width=".8"/>'
               f'<path d="M{cx} {cy - 19} L{cx + 3.5} {cy} L{cx - 3.5} {cy}Z" fill="{INK}"/>'
               f'<path d="M{cx - 15} {cy} L{cx} {cy - 2.6} L{cx + 15} {cy} L{cx} {cy + 2.6}Z" fill="none" stroke="{INK}" stroke-width=".6"/>'
               f'<text x="{cx}" y="{cy - 22}" text-anchor="middle" font-family="Cinzel" font-weight="600" font-size="10.2" fill="{INK}">N</text>')
    return _svg(f'0 0 {W} {H}', ''.join(out), cls)
