// Health calculations: energy targets, glucose and blood pressure classification.
// Reference ranges follow ADA (glucose) and ACC/AHA 2017 (BP) guidance. Not a diagnosis.

export const ACTIVITY = {
  sedentary: { label: "Sedentary (desk job, little exercise)", factor: 1.2 },
  light: { label: "Lightly active (1–3 workouts/week)", factor: 1.375 },
  moderate: { label: "Moderately active (3–5 workouts/week)", factor: 1.55 },
  very: { label: "Very active (6–7 workouts/week)", factor: 1.725 },
};

export const GOALS = {
  lose: { label: "Lose weight (~0.5 kg/week)", delta: -500 },
  lose_slow: { label: "Lose slowly (~0.25 kg/week)", delta: -250 },
  maintain: { label: "Maintain weight", delta: 0 },
  gain: { label: "Gain weight / muscle", delta: 300 },
};

export function bmi(kg, cm) {
  const m = cm / 100;
  return kg / (m * m);
}

/** Asian-Indian BMI cut-offs (WHO expert consultation / Indian consensus). */
export function bmiCategory(v) {
  if (v < 18.5) return { label: "Underweight", tone: "warn" };
  if (v < 23) return { label: "Healthy", tone: "good" };
  if (v < 25) return { label: "Overweight", tone: "warn" };
  return { label: "Obese", tone: "bad" };
}

export function age(dob) {
  const d = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
}

/** Daily targets from profile using Mifflin–St Jeor BMR. */
export function targets(p) {
  const a = p.age;
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * a + (p.sex === "male" ? 5 : -161);
  const tdee = bmr * (ACTIVITY[p.activity]?.factor ?? 1.2);
  const floor = p.sex === "male" ? 1500 : 1200;
  const calories = Math.max(floor, Math.round((tdee + (GOALS[p.goal]?.delta ?? 0)) / 10) * 10);
  const diabetic = p.conditions?.includes("diabetes") || p.conditions?.includes("prediabetes");
  const hyper = p.conditions?.includes("hypertension");
  // Macro split: lower-carb, higher-protein for glucose control.
  const split = diabetic ? { c: 0.4, p: 0.25, f: 0.35 } : p.goal === "gain" ? { c: 0.5, p: 0.25, f: 0.25 } : { c: 0.5, p: 0.2, f: 0.3 };
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    protein_g: Math.round((calories * split.p) / 4),
    carbs_g: Math.round((calories * split.c) / 4),
    fat_g: Math.round((calories * split.f) / 9),
    fiber_g: Math.max(25, Math.round((calories / 1000) * 14)),
    sugar_g: diabetic ? 25 : Math.round((calories * 0.1) / 4), // WHO: <10% energy from free sugars
    sodium_mg: hyper ? 1500 : 2300,
    water_glasses: Math.max(8, Math.round((p.weightKg * 35) / 250)),
  };
}

// ---- Blood glucose ---------------------------------------------------------
export const GLUCOSE_CONTEXT = {
  fasting: "Fasting",
  before_meal: "Before meal",
  after_meal: "2 h after meal",
  random: "Random",
  bedtime: "Bedtime",
};

export const mgToMmol = (v) => Math.round((v / 18.016) * 10) / 10;
export const mmolToMg = (v) => Math.round(v * 18.016);

export function glucoseStatus(mg, context) {
  if (mg < 54) return { label: "Very low", tone: "bad" };
  if (mg < 70) return { label: "Low", tone: "bad" };
  if (context === "fasting" || context === "before_meal") {
    if (mg < 100) return { label: "Normal", tone: "good" };
    if (mg < 126) return { label: "Elevated", tone: "warn" };
    return { label: "High", tone: "bad" };
  }
  if (mg < 140) return { label: "Normal", tone: "good" };
  if (mg < 200) return { label: "Elevated", tone: "warn" };
  return { label: "High", tone: "bad" };
}

/** ADAG formula: estimated HbA1c (%) from average glucose (mg/dL). */
export const estimatedA1c = (avgMg) => Math.round(((avgMg + 46.7) / 28.7) * 10) / 10;

// ---- Blood pressure --------------------------------------------------------
export function bpStatus(sys, dia) {
  if (sys > 180 || dia > 120) return { label: "Hypertensive crisis", tone: "bad", urgent: true };
  if (sys >= 140 || dia >= 90) return { label: "High – Stage 2", tone: "bad" };
  if (sys >= 130 || dia >= 80) return { label: "High – Stage 1", tone: "warn" };
  if (sys >= 120) return { label: "Elevated", tone: "warn" };
  if (sys < 90 || dia < 60) return { label: "Low", tone: "warn" };
  return { label: "Normal", tone: "good" };
}
