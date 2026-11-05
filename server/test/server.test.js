import { test, before, after } from "node:test";
import assert from "node:assert/strict";

delete process.env.ANTHROPIC_API_KEY;
delete process.env.ANTHROPIC_AUTH_TOKEN;

const { server } = await import("../server.js");
const { normalizeResult, parseImage } = await import("../analyze.js");
const { targets, glucoseStatus, bpStatus, estimatedA1c } = await import("../../public/js/health.js");
const { generatePlan } = await import("../../public/js/plans.js");
const { FOOD_BY_ID } = await import("../../public/js/foods.js");

let base;
before(async () => {
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test("serves the PWA shell and manifest", async () => {
  const html = await (await fetch(base + "/")).text();
  assert.match(html, /NutriPulse/);
  const m = await fetch(base + "/manifest.webmanifest");
  assert.equal(m.headers.get("content-type"), "application/manifest+json");
  assert.equal((await m.json()).short_name, "NutriPulse");
});

test("blocks path traversal", async () => {
  const res = await fetch(base + "/%2e%2e/server/server.js");
  assert.ok([403, 404].includes(res.status));
});

test("health endpoint reports AI scan status", async () => {
  const body = await (await fetch(base + "/api/health")).json();
  assert.deepEqual(body, { ok: true, aiScan: false, model: null });
});

test("analyze-food returns 503 without an API key", async () => {
  const res = await fetch(base + "/api/analyze-food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: "data:image/jpeg;base64," + "A".repeat(200) }),
  });
  assert.equal(res.status, 503);
});

test("analyze-food rejects GET", async () => {
  assert.equal((await fetch(base + "/api/analyze-food")).status, 405);
});

test("parseImage validates media type", () => {
  assert.throws(() => parseImage({ image: "data:image/bmp;base64," + "A".repeat(200) }), /Unsupported/);
  assert.equal(parseImage({ image: "data:image/png;base64," + "A".repeat(200) }).type, "image/png");
});

test("normalizeResult recomputes totals from items", () => {
  const r = normalizeResult({
    is_food: true, dish_name: "Thali", glycemic_load: "medium", health_score: 12, tips: [], confidence: "high",
    items: [
      { name: "Roti", portion: "2", grams: 80, calories: 208.4, protein_g: 6.2, carbs_g: 43, fat_g: 1, fiber_g: 6, sugar_g: 1, sodium_mg: 10 },
      { name: "Dal", portion: "1 katori", grams: 150, calories: 150, protein_g: 9, carbs_g: 21, fat_g: 3.5, fiber_g: 4.5, sugar_g: 1, sodium_mg: 380 },
    ],
    totals: { calories: 1, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0 },
  });
  assert.equal(r.totals.calories, 358);
  assert.equal(r.totals.protein_g, 15.2);
  assert.equal(r.health_score, 10);
});

test("targets, glucose and BP classification", () => {
  const t = targets({ sex: "female", age: 35, heightCm: 160, weightKg: 70, activity: "light", goal: "lose", conditions: ["diabetes", "hypertension"] });
  assert.ok(t.calories >= 1200 && t.calories < 2000);
  assert.equal(t.sodium_mg, 1500);
  assert.equal(glucoseStatus(95, "fasting").label, "Normal");
  assert.equal(glucoseStatus(130, "fasting").label, "High");
  assert.equal(glucoseStatus(160, "after_meal").label, "Elevated");
  assert.equal(glucoseStatus(60, "random").label, "Low");
  assert.equal(bpStatus(118, 76).label, "Normal");
  assert.equal(bpStatus(135, 85).label, "High – Stage 1");
  assert.equal(bpStatus(185, 100).label, "Hypertensive crisis");
  assert.equal(estimatedA1c(154), 7);
});

test("diet plan respects diet and conditions and hits calories", () => {
  const profile = { diet: "vegan", conditions: ["diabetes", "hypertension"] };
  const plan = generatePlan(profile, 1600, 42);
  assert.equal(plan.length, 7);
  for (const day of plan) {
    assert.ok(Math.abs(day.totals.calories - 1600) < 450, `day ${day.day} = ${day.totals.calories}`);
    for (const meal of day.meals)
      for (const it of meal.items) {
        const f = FOOD_BY_ID[it.foodId];
        assert.equal(f.diet, "vegan", it.name);
        assert.ok(!f.highGI && !f.highSodium, it.name);
      }
  }
});
