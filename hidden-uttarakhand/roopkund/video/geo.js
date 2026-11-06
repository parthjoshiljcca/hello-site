// Builds geo-data.js for episode.html: dotted land for the globe, a finer dotted India with
// Uttarakhand marked, and the places the story points at. Uses Natural Earth (world-atlas) outlines.
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
const inUK = ([x, y]) => UK.reduce((inside, [ax, ay], i) => {
  const [bx, by] = UK[(i + 1) % UK.length];
  return (ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax ? !inside : inside;
}, false);

const globe = [];
for (let lat = -56; lat <= 76; lat += 1.6)
  for (let lon = -180; lon < 180; lon += 1.6 / Math.max(.25, Math.cos(lat * Math.PI / 180)))
    if (geoContains(land, [lon, lat])) globe.push([+lon.toFixed(2), +lat.toFixed(2)]);

const indiaDots = [];
for (let lat = 6; lat <= 37.5; lat += .42)
  for (let lon = 67; lon <= 98; lon += .42)
    if (geoContains(india, [lon, lat])) indiaDots.push([+lon.toFixed(2), +lat.toFixed(2), inUK([lon, lat]) ? 1 : 0]);

const places = { roopkund: [79.73, 30.26], japan: [139.7, 35.7], crete: [24.9, 35.2], greece: [23.7, 38.0], seAsia: [100.5, 13.8], delhi: [77.2, 28.6] };
fs.writeFileSync(__dirname + '/geo-data.js', `window.GEO = ${JSON.stringify({ globe, india: indiaDots, uk: UK, places })};\n`);
console.log(`globe ${globe.length} dots, india ${indiaDots.length} dots (${indiaDots.filter(d => d[2]).length} in Uttarakhand)`);
