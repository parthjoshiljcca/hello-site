// Food photo -> nutrition estimate, using Claude vision with a JSON-schema constrained response.
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

const NUTRIENTS = {
  calories: { type: "number", description: "kcal" },
  protein_g: { type: "number" },
  carbs_g: { type: "number" },
  fat_g: { type: "number" },
  fiber_g: { type: "number" },
  sugar_g: { type: "number" },
  sodium_mg: { type: "number" },
};
const NUTRIENT_KEYS = Object.keys(NUTRIENTS);

export const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["is_food", "dish_name", "items", "totals", "glycemic_load", "health_score", "tips", "confidence"],
  properties: {
    is_food: { type: "boolean", description: "false if the photo does not show food or drink" },
    dish_name: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "portion", "grams", ...NUTRIENT_KEYS],
        properties: {
          name: { type: "string" },
          portion: { type: "string", description: "human portion, e.g. '2 rotis' or '1 katori (150 g)'" },
          grams: { type: "number" },
          ...NUTRIENTS,
        },
      },
    },
    totals: {
      type: "object",
      additionalProperties: false,
      required: NUTRIENT_KEYS,
      properties: NUTRIENTS,
    },
    glycemic_load: { type: "string", enum: ["low", "medium", "high"] },
    health_score: { type: "integer", description: "1 (poor) to 10 (excellent) overall nutritional quality" },
    tips: {
      type: "array",
      items: { type: "string" },
      description: "2-4 short, practical tips, incl. notes for people with diabetes or high blood pressure",
    },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
  },
};

const SYSTEM = `You are a registered-dietitian-grade nutrition estimator inside a health app used largely in India and worldwide.
Given one photo of a meal, identify every distinct food and drink item, estimate a realistic portion from visual cues
(plate/bowl size, utensils, hand, packaging), and estimate nutrients for that portion using standard food-composition
data (IFCT 2017 for Indian dishes, USDA FoodData Central otherwise). Account for visible oil, ghee, butter, gravy and sugar.
Totals must equal the sum of the items. Round calories to whole numbers and grams to one decimal.
If the user gives a note (e.g. portion, ingredients), trust it over the photo.
If the image is not food, set is_food=false, return an empty items array and zero totals.
Tips are general wellness guidance, never a diagnosis.`;

const MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

let client;
function getClient() {
  if (!client) client = new Anthropic({ timeout: 60_000, maxRetries: 1 });
  return client;
}

export function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export class UserError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Parse "data:image/jpeg;base64,...." or a bare base64 string + mediaType. */
export function parseImage({ image, mediaType }) {
  if (typeof image !== "string" || image.length < 100) throw new UserError("Missing image.");
  let data = image;
  let type = mediaType;
  const m = /^data:([a-z/+.-]+);base64,(.*)$/s.exec(image);
  if (m) {
    type = m[1];
    data = m[2];
  }
  if (!MEDIA_TYPES.has(type)) throw new UserError("Unsupported image type. Use JPEG, PNG, WebP or GIF.");
  if (!/^[A-Za-z0-9+/=\s]+$/.test(data.slice(0, 2000))) throw new UserError("Image is not valid base64.");
  return { data: data.replace(/\s/g, ""), type };
}

function round(n, d = 1) {
  const f = 10 ** d;
  return Math.round((Number(n) || 0) * f) / f;
}

/** Recompute totals from items so the numbers always add up, and clamp values. */
export function normalizeResult(r) {
  const items = (r.items || []).map((it) => {
    const out = { name: String(it.name), portion: String(it.portion), grams: round(Math.max(0, it.grams)) };
    for (const k of NUTRIENT_KEYS) out[k] = round(Math.max(0, it[k]), k === "calories" || k === "sodium_mg" ? 0 : 1);
    return out;
  });
  const totals = {};
  for (const k of NUTRIENT_KEYS) {
    totals[k] = round(items.reduce((s, it) => s + it[k], 0), k === "calories" || k === "sodium_mg" ? 0 : 1);
  }
  return {
    ...r,
    items,
    totals,
    health_score: Math.min(10, Math.max(1, Math.round(r.health_score || 5))),
    tips: (r.tips || []).slice(0, 4),
  };
}

export async function analyzeFood({ image, mediaType, note }) {
  if (!isConfigured()) {
    throw new UserError("AI food scanning is not configured on this server (missing ANTHROPIC_API_KEY).", 503);
  }
  const img = parseImage({ image, mediaType });
  const userText =
    "Analyse this meal photo and estimate its calories and nutrients." +
    (note ? `\nUser note: ${String(note).slice(0, 300)}` : "");

  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    // Low effort keeps the scan fast enough to feel real-time.
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: RESULT_SCHEMA },
    },
    // If the model ever declines, the API transparently retries on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: img.type, data: img.data } },
          { type: "text", text: userText },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new UserError("This image could not be analysed.", 422);
  if (response.stop_reason === "max_tokens") throw new UserError("The meal was too complex to analyse. Try a closer photo.", 422);
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Empty model response");
  return normalizeResult(JSON.parse(text));
}
