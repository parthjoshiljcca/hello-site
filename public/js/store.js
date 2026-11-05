// Local-first storage. Everything lives on the user's device (localStorage); export/import for backup.
const KEY = "nutripulse.v1";

const DEFAULT = {
  profile: null, // set during onboarding
  meals: [], // { id, date, slot, name, portion, qty, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, source }
  glucose: [], // { id, ts, value (mg/dL), context, note }
  bp: [], // { id, ts, sys, dia, pulse, note }
  weight: [], // { id, ts, kg }
  water: {}, // { 'YYYY-MM-DD': glasses }
  settings: { glucoseUnit: "mg/dL" },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    return { ...structuredClone(DEFAULT), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT);
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save", e);
  }
  listeners.forEach((fn) => fn(state));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function today(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

export const store = {
  get: () => state,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  update(mutator) {
    mutator(state);
    save();
  },
  add(list, item) {
    state[list].push({ id: uid(), ...item });
    save();
  },
  remove(list, id) {
    state[list] = state[list].filter((x) => x.id !== id);
    save();
  },
  exportJson() {
    return JSON.stringify({ app: "NutriPulse", exportedAt: new Date().toISOString(), data: state }, null, 2);
  },
  importJson(text) {
    const parsed = JSON.parse(text);
    const data = parsed.data || parsed;
    if (typeof data !== "object" || !Array.isArray(data.meals)) throw new Error("Not a NutriPulse backup file");
    state = { ...structuredClone(DEFAULT), ...data };
    save();
  },
  reset() {
    state = structuredClone(DEFAULT);
    save();
  },
};
