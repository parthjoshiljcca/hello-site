// Builds geo-data.js for episode.html: dotted land for the globe, a finer dotted India with
// Uttarakhand marked, and the places the story points at. Uses Natural Earth (world-atlas) outlines.
// Natural Earth draws India's de facto line in the north; INDIA_NORTH adds the rest of Jammu and
// Kashmir and Ladakh (including Gilgit-Baltistan and Aksai Chin) so India is drawn with its
// official boundary.
//
//   node geo.js
const fs = require('fs');
const { geoContains } = require('d3-geo');
const { feature } = require('topojson-client');
const world = require('world-atlas/countries-110m.json');

const land = feature(world, world.objects.land);
const india = feature(world, world.objects.countries).features.find(f => f.id === '356');
// Uttarakhand, roughly, as a polygon of [lon, lat] corners
const UK = [[77.6, 30.4], [78.3, 31.3], [79.2, 31.4], [80.2, 30.8], [81.0, 30.2], [80.3, 29.0], [79.0, 28.9], [78.0, 29.6]];
const inPoly = poly => ([x, y]) => poly.reduce((inside, [ax, ay], i) => {
  const [bx, by] = poly[(i + 1) % poly.length];
  return (ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax ? !inside : inside;
}, false);
const inUK = inPoly(UK);
// India's official northern boundary, roughly, as [lon, lat] corners from Jammu round to Demchok
const INDIA_NORTH = [[74.6, 32.45], [73.75, 32.85], [73.6, 33.4], [73.45, 34.1], [73.6, 34.7], [72.9, 35.2], [72.55, 35.85],
  [73.1, 36.5], [74.3, 36.95], [74.9, 37.1], [75.6, 36.95], [76.4, 36.2], [77.0, 35.95], [77.8, 35.55], [78.6, 35.95],
  [79.4, 35.75], [80.3, 35.45], [80.25, 34.9], [79.95, 34.2], [79.1, 33.8], [79.35, 33.0], [78.8, 32.6], [79.0, 32.2],
  [78.4, 32.4], [77.8, 32.7], [77.1, 32.5], [76.4, 32.75], [75.6, 32.3], [75.1, 32.25]];
const inNorth = inPoly(INDIA_NORTH);

const globe = [];
for (let lat = -56; lat <= 76; lat += 1.6)
  for (let lon = -180; lon < 180; lon += 1.6 / Math.max(.25, Math.cos(lat * Math.PI / 180)))
    if (geoContains(land, [lon, lat])) globe.push([+lon.toFixed(2), +lat.toFixed(2)]);

const indiaDots = [];
for (let lat = 6; lat <= 37.5; lat += .42)
  for (let lon = 67; lon <= 98; lon += .42)
    if (geoContains(india, [lon, lat]) || inNorth([lon, lat])) indiaDots.push([+lon.toFixed(2), +lat.toFixed(2), inUK([lon, lat]) ? 1 : 0]);

const places = { roopkund: [79.73, 30.26], japan: [139.7, 35.7], crete: [24.9, 35.2], greece: [23.7, 38.0], seAsia: [100.5, 13.8], delhi: [77.2, 28.6] };
fs.writeFileSync(__dirname + '/geo-data.js', `window.GEO = ${JSON.stringify({ globe, india: indiaDots, uk: UK, places })};\n`);
console.log(`globe ${globe.length} dots, india ${indiaDots.length} dots (${indiaDots.filter(d => d[2]).length} in Uttarakhand)`);
