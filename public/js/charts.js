// Minimal, dependency-free SVG charts.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/**
 * Line chart.
 * series: [{ name, color, points: [{ x: Date|number, y }] }]
 * bands: [{ from, to, label }] shaded target range
 */
export function lineChart({ series, bands = [], height = 200, yLabel = "", yMin, yMax }) {
  const W = 640;
  const H = height;
  const pad = { l: 40, r: 12, t: 12, b: 26 };
  const all = series.flatMap((s) => s.points);
  if (all.length === 0) return `<div class="empty">No readings yet</div>`;
  const xs = all.map((p) => +p.x);
  const ys = all.map((p) => p.y).concat(bands.flatMap((b) => [b.from, b.to]));
  let x0 = Math.min(...xs);
  let x1 = Math.max(...xs);
  if (x0 === x1) {
    x0 -= 86400000;
    x1 += 86400000;
  }
  let y0 = yMin ?? Math.min(...ys);
  let y1 = yMax ?? Math.max(...ys);
  const span = y1 - y0 || 10;
  const ticks = 4;
  const step = [1, 2, 5, 10, 20, 25, 50, 100].find((st) => st * ticks >= span * 1.2) || 100;
  y0 = Math.floor((y0 - span * 0.1) / step) * step;
  y1 = y0 + step * ticks;
  while (y1 < Math.max(...ys)) y1 += step;
  const sx = (x) => pad.l + ((x - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const sy = (y) => pad.t + (1 - (y - y0) / (y1 - y0)) * (H - pad.t - pad.b);

  let grid = "";
  for (let v = y0; v <= y1; v += step) {
    const y = sy(v);
    grid += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" class="grid"/><text x="${pad.l - 6}" y="${y + 4}" class="axis" text-anchor="end">${v}</text>`;
  }
  const fmt = (t) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  grid += `<text x="${pad.l}" y="${H - 6}" class="axis">${fmt(x0)}</text><text x="${W - pad.r}" y="${H - 6}" class="axis" text-anchor="end">${fmt(x1)}</text>`;

  const bandSvg = bands
    .map((b) => `<rect x="${pad.l}" width="${W - pad.l - pad.r}" y="${sy(b.to)}" height="${Math.max(0, sy(b.from) - sy(b.to))}" class="band"><title>${esc(b.label)}</title></rect>`)
    .join("");

  const lines = series
    .map((s) => {
      const pts = s.points.slice().sort((a, b) => a.x - b.x);
      const d = pts.map((p, i) => `${i ? "L" : "M"}${sx(+p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join("");
      const dots = pts
        .map((p) => `<circle cx="${sx(+p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="3.5" fill="${s.color}"><title>${esc(s.name)}: ${p.y} — ${new Date(p.x).toLocaleString()}</title></circle>`)
        .join("");
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
    })
    .join("");

  const legend =
    series.length > 1
      ? `<div class="legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join("")}</div>`
      : "";
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yLabel)} chart">${bandSvg}${grid}${lines}</svg>${legend}</figure>`;
}

/** Circular progress ring (calories etc). */
export function ring(value, max, { size = 140, label = "", sub = "" } = {}) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, max ? value / max : 0);
  const over = value > max;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)} ${value} of ${max}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg ${over ? "over" : ""}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="47%" text-anchor="middle" class="ring-val">${esc(label)}</text>
    <text x="50%" y="63%" text-anchor="middle" class="ring-sub">${esc(sub)}</text>
  </svg>`;
}

/** Horizontal progress bar. */
export function bar(label, value, max, unit = "g") {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  const over = value > max;
  return `<div class="bar"><div class="bar-head"><span>${esc(label)}</span><span>${Math.round(value)} / ${max} ${unit}</span></div>
    <div class="bar-track"><div class="bar-fill ${over ? "over" : ""}" style="width:${pct}%"></div></div></div>`;
}
