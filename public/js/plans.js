// Personalised 7-day diet plan generator.
// Builds each day from dietitian-style meal templates, filtered by diet preference and health
// conditions (low-GI for diabetes, low-sodium DASH-style for hypertension), then scaled to calories.
import { FOOD_BY_ID, allowedFor, scaled, NUTRIENT_KEYS } from "./foods.js";

export const SLOTS = [
  { id: "breakfast", label: "Breakfast", time: "8:00 AM", share: 0.25 },
  { id: "mid", label: "Mid-morning", time: "11:00 AM", share: 0.1 },
  { id: "lunch", label: "Lunch", time: "1:30 PM", share: 0.3 },
  { id: "evening", label: "Evening snack", time: "5:00 PM", share: 0.1 },
  { id: "dinner", label: "Dinner", time: "8:00 PM", share: 0.25 },
];

const T = {
  breakfast: [
    [["moong_chilla", 1], ["curd", 1]],
    [["besan_chilla", 1], ["tea_nosugar", 1]],
    [["oats", 1], ["almonds", 1]],
    [["masala_oats", 1], ["egg_boiled", 2]],
    [["daliya", 1], ["buttermilk", 1]],
    [["poha", 1], ["sprouts", 0.5]],
    [["idli", 1.5], ["sambar", 1]],
    [["upma", 1], ["curd", 0.5]],
    [["omelette", 1], ["bread_ww", 1]],
    [["paneer_bhurji", 1], ["roti", 1]],
    [["greek_yogurt", 1], ["berries", 1], ["walnuts", 1]],
    [["masala_oats", 1], ["soy_milk", 1]],
    [["moong_chilla", 1], ["green_tea", 1]],
    [["daliya", 1], ["almonds", 1]],
  ],
  mid: [
    [["apple", 1], ["almonds", 1]],
    [["guava", 1]],
    [["papaya", 1]],
    [["buttermilk", 1], ["roasted_chana", 0.5]],
    [["coconut_water", 1], ["walnuts", 1]],
    [["orange", 1], ["walnuts", 1]],
    [["sprouts", 1]],
  ],
  lunch: [
    [["roti", 2], ["dal", 1], ["mixed_veg", 1], ["salad", 1]],
    [["rice_brown", 1], ["rajma", 1], ["salad", 1]],
    [["roti", 2], ["chole", 1], ["raita", 1]],
    [["roti", 2], ["palak_paneer", 1], ["salad", 1]],
    [["rice_brown", 1], ["sambar", 1], ["bhindi", 1]],
    [["multigrain_roti", 2], ["chicken_curry", 1], ["salad", 1]],
    [["rice_brown", 1], ["fish_curry", 1], ["salad", 1]],
    [["quinoa", 1], ["rajma", 1], ["salad", 1]],
    [["roti", 2], ["egg_bhurji", 1], ["dal", 0.5]],
    [["chicken_salad", 1], ["multigrain_roti", 1]],
    [["multigrain_roti", 2], ["dal", 1], ["lauki", 1], ["salad", 1]],
    [["quinoa", 1], ["tofu_stirfry", 1]],
  ],
  evening: [
    [["makhana", 1], ["green_tea", 1]],
    [["roasted_chana", 1], ["tea_nosugar", 1]],
    [["sprouts", 1]],
    [["dhokla", 1], ["green_tea", 1]],
    [["greek_yogurt", 1]],
    [["egg_boiled", 2]],
    [["peanuts", 0.5], ["coffee", 1]],
    [["hummus", 1], ["salad", 1]],
  ],
  dinner: [
    [["multigrain_roti", 2], ["lauki", 1], ["dal", 1]],
    [["grilled_chicken", 1], ["salad", 1], ["veg_soup", 1]],
    [["grilled_fish", 1], ["mixed_veg", 1]],
    [["tofu_stirfry", 1], ["quinoa", 0.5]],
    [["paneer_bhurji", 1], ["roti", 1], ["salad", 1]],
    [["moong_chilla", 1], ["raita", 1]],
    [["daliya", 1], ["curd", 1]],
    [["roti", 2], ["palak_paneer", 1]],
    [["rice_brown", 0.5], ["dal", 1], ["bhindi", 1]],
    [["multigrain_roti", 2], ["mixed_veg", 1], ["dal", 0.5]],
  ],
};

function sum(items) {
  const t = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0]));
  for (const it of items) for (const k of NUTRIENT_KEYS) t[k] += it[k];
  for (const k of NUTRIENT_KEYS) t[k] = Math.round(t[k] * 10) / 10;
  t.calories = Math.round(t.calories);
  t.sodium_mg = Math.round(t.sodium_mg);
  return t;
}

function okFor(template, profile) {
  const diabetic = profile.conditions?.some((c) => c === "diabetes" || c === "prediabetes");
  const hyper = profile.conditions?.includes("hypertension");
  return template.every(([id]) => {
    const f = FOOD_BY_ID[id];
    return allowedFor(f, profile.diet) && !(diabetic && f.highGI) && !(hyper && f.highSodium);
  });
}

// Small deterministic PRNG so a plan is stable until the user taps "New plan".
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildMeal(template, targetKcal) {
  const base = sum(template.map(([id, q]) => scaled(FOOD_BY_ID[id], q)));
  const factor = Math.min(2, Math.max(0.5, targetKcal / base.calories));
  const items = template.map(([id, q]) => {
    const food = FOOD_BY_ID[id];
    const qty = Math.max(0.5, Math.round(q * factor * 2) / 2);
    return { foodId: id, name: food.name, serving: food.serving, qty, ...scaled(food, qty) };
  });
  return { items, totals: sum(items) };
}

/** 7-day plan: [{ day, meals: [{ slot, label, time, items, totals }], totals }] */
export function generatePlan(profile, dailyKcal, seed = 1) {
  const rand = rng(seed);
  const pools = {};
  for (const slot of SLOTS) {
    let pool = T[slot.id].filter((t) => okFor(t, profile));
    if (!pool.length) pool = T[slot.id].filter((t) => okFor(t, { diet: profile.diet })); // relax condition filters
    if (!pool.length) pool = T[slot.id];
    pools[slot.id] = shuffle(pool, rand);
  }
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, d) => {
    const meals = SLOTS.map((slot) => {
      const pool = pools[slot.id];
      const meal = buildMeal(pool[d % pool.length], dailyKcal * slot.share);
      return { slot: slot.id, label: slot.label, time: slot.time, ...meal };
    });
    return { day, meals, totals: sum(meals.map((m) => m.totals)) };
  });
}

export function guidelines(profile) {
  const out = [
    "Fill half your plate with vegetables/salad, a quarter with protein (dal, paneer, eggs, fish, chicken), a quarter with whole grains.",
    "Drink water through the day; start meals with salad or soup to improve fullness.",
  ];
  if (profile.conditions?.some((c) => c === "diabetes" || c === "prediabetes")) {
    out.push(
      "Diabetes: prefer low-GI grains (multigrain roti, brown rice, millets, oats); avoid sugary drinks, sweets and maida.",
      "Pair carbs with protein and fibre, keep meal timings regular, and check sugar 2 hours after a new meal to learn your response.",
    );
  }
  if (profile.conditions?.includes("hypertension")) {
    out.push(
      "Blood pressure (DASH style): keep sodium under 1,500 mg/day — limit pickles, papad, namkeen, sauces and packaged food.",
      "Eat potassium-rich foods: banana, coconut water, leafy greens, curd, dals.",
    );
  }
  if (profile.conditions?.includes("cholesterol")) {
    out.push("Cholesterol: limit fried food, ghee and butter; add oats, nuts and flaxseed for soluble fibre and healthy fats.");
  }
  if (profile.conditions?.includes("pcos")) {
    out.push("PCOS: focus on protein at every meal, low-GI carbs and regular strength training.");
  }
  return out;
}
