// Built-in food database (approximate values per listed serving; sources: IFCT 2017 / USDA FDC averages).
// diet: vegan | veg (contains dairy) | egg | nonveg     flags: hgi = high glycemic, hna = high sodium
// [id, name, serving, kcal, protein, carbs, fat, fiber, sugar, sodium_mg, diet, flags]
const RAW = [
  // Breads & grains
  ["roti", "Whole wheat roti / phulka", "1 medium (40 g)", 104, 3.1, 21.5, 0.5, 3.0, 0.4, 5, "vegan", ""],
  ["paratha", "Plain paratha", "1 (60 g)", 210, 4.5, 28, 9, 3.5, 0.5, 200, "veg", ""],
  ["aloo_paratha", "Aloo paratha", "1 (110 g)", 290, 6, 40, 11, 4, 1.5, 390, "veg", "hgi"],
  ["multigrain_roti", "Multigrain / jowar / bajra roti", "1 (40 g)", 110, 3.5, 21, 1.2, 4.0, 0.5, 5, "vegan", ""],
  ["rice_white", "White rice, cooked", "1 katori (150 g)", 195, 4, 42, 0.4, 0.6, 0.1, 2, "vegan", "hgi"],
  ["rice_brown", "Brown rice, cooked", "1 katori (150 g)", 168, 3.9, 35, 1.3, 2.7, 0.5, 5, "vegan", ""],
  ["jeera_rice", "Jeera rice", "1 katori (150 g)", 230, 4, 42, 5, 1, 0.2, 280, "veg", "hgi"],
  ["veg_pulao", "Veg pulao", "1 katori (150 g)", 240, 5, 40, 6.5, 2.5, 1.5, 380, "veg", "hgi"],
  ["chicken_biryani", "Chicken biryani", "1 plate (250 g)", 450, 22, 52, 16, 2, 2, 820, "nonveg", "hna"],
  ["veg_biryani", "Veg biryani", "1 plate (250 g)", 380, 8, 58, 12, 4, 3, 700, "veg", "hgi"],
  ["quinoa", "Quinoa, cooked", "1 katori (150 g)", 180, 6.6, 32, 2.9, 4.2, 1.3, 10, "vegan", ""],
  ["oats", "Oats porridge (with milk)", "1 bowl (250 g)", 230, 10, 33, 6.5, 4, 12, 110, "veg", ""],
  ["masala_oats", "Masala oats with veggies", "1 bowl (200 g)", 190, 6, 30, 5, 5, 3, 420, "vegan", ""],
  ["poha", "Poha", "1 plate (180 g)", 250, 5, 42, 7, 2.5, 3, 360, "vegan", "hgi"],
  ["upma", "Rava upma", "1 plate (180 g)", 260, 6, 38, 9, 3, 2, 400, "vegan", ""],
  ["daliya", "Vegetable daliya (broken wheat)", "1 bowl (200 g)", 200, 6.5, 36, 3.5, 6, 3, 300, "vegan", ""],
  ["idli", "Idli", "2 pieces (100 g)", 140, 4.5, 29, 0.5, 1.5, 0.3, 280, "vegan", "hgi"],
  ["dosa", "Plain dosa", "1 (90 g)", 170, 4, 28, 4.5, 1.5, 0.5, 300, "vegan", ""],
  ["masala_dosa", "Masala dosa", "1 (180 g)", 330, 7, 48, 12, 4, 2, 560, "vegan", ""],
  ["besan_chilla", "Besan chilla", "2 (120 g)", 230, 11, 26, 9, 5, 2, 340, "vegan", ""],
  ["moong_chilla", "Moong dal chilla", "2 (120 g)", 210, 13, 27, 5.5, 5.5, 1.5, 300, "vegan", ""],
  ["bread_ww", "Whole wheat bread", "2 slices (60 g)", 150, 7, 26, 2, 4, 3, 270, "vegan", ""],
  ["bread_white", "White bread", "2 slices (60 g)", 160, 5, 30, 2, 1.5, 3.5, 290, "vegan", "hgi"],
  ["muesli", "Muesli (no added sugar) with milk", "1 bowl", 260, 10, 38, 7, 5, 14, 120, "veg", ""],
  // Dals, legumes
  ["dal", "Dal (toor/moong), cooked", "1 katori (150 g)", 150, 9, 21, 3.5, 4.5, 1, 380, "vegan", ""],
  ["dal_makhani", "Dal makhani", "1 katori (150 g)", 260, 9.5, 23, 15, 6, 2, 480, "veg", ""],
  ["rajma", "Rajma curry", "1 katori (150 g)", 190, 9.5, 27, 5, 8, 2, 420, "vegan", ""],
  ["chole", "Chole / chana masala", "1 katori (150 g)", 220, 9.5, 30, 7, 8.5, 4, 450, "vegan", ""],
  ["sambar", "Sambar", "1 katori (150 g)", 120, 5.5, 17, 3.5, 4.5, 3, 450, "vegan", ""],
  ["sprouts", "Sprouts salad", "1 bowl (150 g)", 140, 10, 21, 1.5, 6, 4, 150, "vegan", ""],
  ["roasted_chana", "Roasted chana", "30 g", 110, 6.5, 17, 1.8, 5, 3, 10, "vegan", ""],
  ["hummus", "Hummus", "3 tbsp (45 g)", 120, 3.5, 6.5, 8.5, 2.5, 0.2, 180, "vegan", ""],
  // Vegetables / sabzi
  ["mixed_veg", "Mixed veg sabzi", "1 katori (150 g)", 130, 3.5, 13, 7.5, 4.5, 5, 380, "vegan", ""],
  ["palak_paneer", "Palak paneer", "1 katori (150 g)", 260, 12, 9, 20, 3, 3, 470, "veg", ""],
  ["paneer_butter", "Paneer butter masala", "1 katori (150 g)", 360, 13, 13, 28, 2, 6, 600, "veg", "hna"],
  ["paneer_bhurji", "Paneer bhurji", "1 katori (120 g)", 280, 16, 7, 21, 1.5, 3, 400, "veg", ""],
  ["bhindi", "Bhindi sabzi", "1 katori (120 g)", 120, 2.5, 10, 8, 4, 2.5, 300, "vegan", ""],
  ["aloo_sabzi", "Aloo sabzi", "1 katori (150 g)", 180, 3, 25, 8, 3, 1.5, 380, "vegan", "hgi"],
  ["lauki", "Lauki / tori sabzi", "1 katori (150 g)", 80, 1.5, 8, 4.5, 2.5, 3, 300, "vegan", ""],
  ["salad", "Green salad (cucumber, tomato, onion)", "1 bowl (150 g)", 35, 1.5, 7, 0.3, 2, 4, 15, "vegan", ""],
  ["raita", "Cucumber raita", "1 katori (120 g)", 80, 4, 6, 4, 0.5, 5, 250, "veg", ""],
  ["veg_soup", "Clear vegetable soup", "1 bowl (250 ml)", 70, 2.5, 11, 1.5, 3, 4, 600, "vegan", "hna"],
  ["tofu_stirfry", "Tofu stir-fry", "1 plate (180 g)", 220, 16, 10, 13, 3, 4, 520, "vegan", ""],
  // Non-veg & eggs
  ["egg_boiled", "Boiled egg", "1 large", 78, 6.3, 0.6, 5.3, 0, 0.6, 62, "egg", ""],
  ["omelette", "Masala omelette (2 eggs)", "1 (130 g)", 200, 13, 3, 15, 0.8, 1.5, 380, "egg", ""],
  ["egg_bhurji", "Egg bhurji (2 eggs)", "1 plate", 210, 13.5, 4, 15.5, 1, 2, 400, "egg", ""],
  ["chicken_curry", "Chicken curry", "1 katori (150 g)", 240, 22, 6, 14, 1.5, 2, 520, "nonveg", ""],
  ["grilled_chicken", "Grilled chicken breast", "120 g", 198, 37, 0, 4.3, 0, 0, 90, "nonveg", ""],
  ["tandoori_chicken", "Tandoori chicken", "2 pieces (150 g)", 260, 34, 4, 12, 1, 2, 650, "nonveg", "hna"],
  ["fish_curry", "Fish curry", "1 katori (150 g)", 210, 21, 6, 11, 1, 2, 480, "nonveg", ""],
  ["grilled_fish", "Grilled fish", "120 g", 170, 30, 0, 5, 0, 0, 110, "nonveg", ""],
  ["mutton_curry", "Mutton curry", "1 katori (150 g)", 330, 24, 6, 23, 1.5, 2, 560, "nonveg", ""],
  ["chicken_salad", "Chicken salad bowl", "1 bowl (250 g)", 290, 30, 12, 13, 4, 5, 450, "nonveg", ""],
  // Dairy & drinks
  ["milk", "Toned milk", "1 glass (200 ml)", 118, 6, 9.5, 6, 0, 9.5, 90, "veg", ""],
  ["curd", "Curd / dahi (low fat)", "1 katori (150 g)", 90, 5.5, 7, 4.5, 0, 7, 70, "veg", ""],
  ["greek_yogurt", "Greek yogurt, plain", "150 g", 110, 15, 6, 3, 0, 5, 55, "veg", ""],
  ["buttermilk", "Chaas / buttermilk", "1 glass (250 ml)", 45, 3, 4.5, 1.5, 0, 4.5, 260, "veg", ""],
  ["paneer", "Paneer (raw)", "50 g", 145, 9.2, 1.8, 11, 0, 1.8, 15, "veg", ""],
  ["tea", "Masala chai with sugar", "1 cup (150 ml)", 90, 2.5, 13, 3, 0, 12, 40, "veg", "hgi"],
  ["tea_nosugar", "Chai without sugar", "1 cup (150 ml)", 45, 2.5, 4, 2.5, 0, 4, 40, "veg", ""],
  ["coffee", "Black coffee", "1 cup", 3, 0.3, 0, 0, 0, 0, 5, "vegan", ""],
  ["green_tea", "Green tea", "1 cup", 2, 0, 0.5, 0, 0, 0, 2, "vegan", ""],
  ["coconut_water", "Coconut water", "1 glass (250 ml)", 48, 1.8, 9, 0.5, 2.8, 6.3, 250, "vegan", ""],
  ["protein_shake", "Whey protein shake (water)", "1 scoop", 120, 24, 3, 1.5, 0.5, 1.5, 100, "veg", ""],
  ["soy_milk", "Soy milk, unsweetened", "1 glass (200 ml)", 80, 7, 3, 4, 1, 1, 90, "vegan", ""],
  ["cola", "Cola / soft drink", "1 can (330 ml)", 140, 0, 35, 0, 0, 35, 15, "vegan", "hgi"],
  // Fruit, nuts, snacks
  ["apple", "Apple", "1 medium (180 g)", 95, 0.5, 25, 0.3, 4.4, 19, 2, "vegan", ""],
  ["banana", "Banana", "1 medium (120 g)", 105, 1.3, 27, 0.4, 3.1, 14, 1, "vegan", "hgi"],
  ["guava", "Guava", "1 medium (100 g)", 68, 2.6, 14, 1, 5.4, 9, 2, "vegan", ""],
  ["papaya", "Papaya", "1 bowl (150 g)", 65, 0.7, 16, 0.4, 2.5, 12, 12, "vegan", ""],
  ["orange", "Orange", "1 medium (130 g)", 62, 1.2, 15, 0.2, 3.1, 12, 0, "vegan", ""],
  ["mango", "Mango", "1 cup (165 g)", 99, 1.4, 25, 0.6, 2.6, 23, 2, "vegan", "hgi"],
  ["berries", "Mixed berries", "1 cup (150 g)", 70, 1, 17, 0.5, 4, 10, 1, "vegan", ""],
  ["almonds", "Almonds", "10 pieces (14 g)", 81, 3, 3, 7, 1.7, 0.6, 0, "vegan", ""],
  ["walnuts", "Walnuts", "5 halves (10 g)", 65, 1.5, 1.4, 6.5, 0.7, 0.3, 0, "vegan", ""],
  ["peanuts", "Roasted peanuts", "30 g", 170, 7.5, 5, 14.5, 2.5, 1.3, 90, "vegan", ""],
  ["makhana", "Roasted makhana", "1 cup (30 g)", 105, 3, 20, 1, 4, 0, 60, "vegan", ""],
  ["chia_pudding", "Chia pudding (milk)", "1 cup", 210, 8, 18, 12, 9, 9, 80, "veg", ""],
  ["samosa", "Samosa", "1 (100 g)", 260, 4, 30, 14, 2.5, 1.5, 420, "vegan", "hgi"],
  ["pakora", "Pakora / bhaji", "4 pieces (80 g)", 240, 5, 22, 15, 3, 1.5, 380, "vegan", ""],
  ["dhokla", "Khaman dhokla", "2 pieces (100 g)", 160, 7, 22, 5, 2, 4, 450, "vegan", ""],
  ["biscuits", "Marie / digestive biscuits", "4 pieces (30 g)", 140, 2.2, 21, 5, 1, 6, 130, "veg", "hgi"],
  ["pizza", "Pizza slice (cheese)", "1 slice (110 g)", 285, 12, 36, 10, 2.5, 3.8, 640, "veg", "hgi hna"],
  ["burger", "Veg burger", "1", 340, 9, 45, 14, 4, 7, 720, "veg", "hgi hna"],
  ["french_fries", "French fries", "Medium (115 g)", 365, 4, 48, 17, 4.4, 0.3, 245, "vegan", "hgi"],
  ["gulab_jamun", "Gulab jamun", "2 pieces (80 g)", 300, 4, 45, 12, 0.5, 35, 40, "veg", "hgi"],
  ["jalebi", "Jalebi", "3 pieces (60 g)", 270, 2, 45, 10, 0.3, 30, 20, "veg", "hgi"],
  ["dark_chocolate", "Dark chocolate (70%)", "2 squares (20 g)", 120, 1.6, 9, 8.5, 2.2, 4.8, 4, "vegan", ""],
  ["pickle", "Mango pickle", "1 tbsp (15 g)", 35, 0.2, 1, 3.5, 0.5, 0.3, 450, "vegan", "hna"],
  ["papad", "Roasted papad", "1 (15 g)", 50, 3.5, 9, 0.3, 2, 0, 270, "vegan", "hna"],
  ["ghee", "Ghee", "1 tsp (5 g)", 45, 0, 0, 5, 0, 0, 0, "veg", ""],
];

export const FOODS = RAW.map(([id, name, serving, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, diet, flags]) => ({
  id, name, serving, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, diet,
  highGI: flags.includes("hgi"),
  highSodium: flags.includes("hna"),
}));

export const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]));

export const NUTRIENT_KEYS = ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "sodium_mg"];

export function searchFoods(q, limit = 25) {
  const s = q.trim().toLowerCase();
  if (!s) return FOODS.slice(0, limit);
  const terms = s.split(/\s+/);
  return FOODS.filter((f) => terms.every((t) => f.name.toLowerCase().includes(t) || f.id.includes(t))).slice(0, limit);
}

/** Nutrients for `qty` servings of a food. */
export function scaled(food, qty) {
  const out = {};
  for (const k of NUTRIENT_KEYS) out[k] = Math.round(food[k] * qty * 10) / 10;
  out.calories = Math.round(out.calories);
  out.sodium_mg = Math.round(out.sodium_mg);
  return out;
}

const DIET_RANK = { vegan: 0, veg: 1, egg: 2, nonveg: 3 };
/** Is a food allowed for a dietary preference? (vegan ⊂ veg ⊂ egg ⊂ nonveg) */
export function allowedFor(food, pref) {
  return DIET_RANK[food.diet] <= DIET_RANK[pref ?? "nonveg"];
}
