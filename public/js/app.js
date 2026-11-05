import { store, today, uid } from "./store.js";
import { FOODS, FOOD_BY_ID, searchFoods, scaled, NUTRIENT_KEYS } from "./foods.js";
import { ACTIVITY, GOALS, targets, bmi, bmiCategory, GLUCOSE_CONTEXT, glucoseStatus, estimatedA1c, bpStatus, mgToMmol, mmolToMg } from "./health.js";
import { SLOTS, generatePlan, guidelines } from "./plans.js";
import { lineChart, ring, bar } from "./charts.js";

const $ = (sel, root = document) => root.querySelector(sel);
const view = $("#view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmt = (n, d = 0) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: d });
const DAY = 86400000;

const CONDITIONS = {
  diabetes: "Type 2 diabetes",
  prediabetes: "Prediabetes",
  hypertension: "High blood pressure",
  cholesterol: "High cholesterol",
  pcos: "PCOS / PCOD",
  thyroid: "Thyroid",
};
const DIETS = { veg: "Vegetarian", egg: "Eggetarian", nonveg: "Non-vegetarian", vegan: "Vegan" };

/** Navigate, re-rendering even when the hash is unchanged. */
function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

function profileTargets() {
  const p = store.get().profile;
  return p ? targets(p) : null;
}

function dayTotals(date) {
  const t = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0]));
  for (const m of store.get().meals) if (m.date === date) for (const k of NUTRIENT_KEYS) t[k] += Number(m[k]) || 0;
  return t;
}

function slotFromTime(d = new Date()) {
  const h = d.getHours();
  if (h < 10.5) return "breakfast";
  if (h < 12) return "mid";
  if (h < 16) return "lunch";
  if (h < 19) return "evening";
  return "dinner";
}

const slotOptions = (sel) => SLOTS.map((s) => `<option value="${s.id}" ${s.id === sel ? "selected" : ""}>${s.label}</option>`).join("");

function glucoseDisplay(mg) {
  return store.get().settings.glucoseUnit === "mmol/L" ? `${mgToMmol(mg)} mmol/L` : `${Math.round(mg)} mg/dL`;
}

function pill(status) {
  return `<span class="pill ${status.tone}">${esc(status.label)}</span>`;
}

// ===========================================================================
// Onboarding / profile form
// ===========================================================================
function profileForm(p = {}) {
  const conds = p.conditions || [];
  return `
  <form id="profile-form" class="card form">
    <label>Name<input name="name" value="${esc(p.name || "")}" placeholder="Your name" autocomplete="given-name"></label>
    <div class="row2">
      <label>Sex<select name="sex" required>
        <option value="female" ${p.sex === "female" ? "selected" : ""}>Female</option>
        <option value="male" ${p.sex === "male" ? "selected" : ""}>Male</option></select></label>
      <label>Age<input name="age" type="number" min="13" max="100" required value="${esc(p.age || "")}" inputmode="numeric"></label>
    </div>
    <div class="row2">
      <label>Height (cm)<input name="heightCm" type="number" min="100" max="230" step="0.5" required value="${esc(p.heightCm || "")}" inputmode="decimal"></label>
      <label>Weight (kg)<input name="weightKg" type="number" min="25" max="300" step="0.1" required value="${esc(p.weightKg || "")}" inputmode="decimal"></label>
    </div>
    <label>Activity level<select name="activity">${Object.entries(ACTIVITY)
      .map(([k, v]) => `<option value="${k}" ${p.activity === k ? "selected" : ""}>${v.label}</option>`)
      .join("")}</select></label>
    <label>Goal<select name="goal">${Object.entries(GOALS)
      .map(([k, v]) => `<option value="${k}" ${(p.goal || "lose") === k ? "selected" : ""}>${v.label}</option>`)
      .join("")}</select></label>
    <label>Diet preference<select name="diet">${Object.entries(DIETS)
      .map(([k, v]) => `<option value="${k}" ${(p.diet || "veg") === k ? "selected" : ""}>${v}</option>`)
      .join("")}</select></label>
    <fieldset><legend>Health conditions (optional)</legend>
      <div class="chips">${Object.entries(CONDITIONS)
        .map(([k, v]) => `<label class="chip"><input type="checkbox" name="conditions" value="${k}" ${conds.includes(k) ? "checked" : ""}><span>${v}</span></label>`)
        .join("")}</div>
    </fieldset>
    <button class="btn primary" type="submit">${p.age ? "Save profile" : "Create my plan"}</button>
  </form>`;
}

function readProfileForm(form) {
  const fd = new FormData(form);
  const prev = store.get().profile || {};
  return {
    ...prev,
    name: fd.get("name").trim(),
    sex: fd.get("sex"),
    age: Number(fd.get("age")),
    heightCm: Number(fd.get("heightCm")),
    weightKg: Number(fd.get("weightKg")),
    activity: fd.get("activity"),
    goal: fd.get("goal"),
    diet: fd.get("diet"),
    conditions: fd.getAll("conditions"),
    planSeed: prev.planSeed || Math.floor(Math.random() * 1e6),
  };
}

function renderOnboarding() {
  view.innerHTML = `
    <section class="hero">
      <h1>Your personal health coach</h1>
      <p>Diet plans, calorie &amp; nutrition tracking, blood sugar and blood pressure logs — all in one place, private on your device.</p>
      <a class="btn accent" href="#/scan">📸 Try free food photo scan — no sign-up</a>
    </section>
    <h2>Set up your profile</h2>
    ${profileForm()}`;
  $("#profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = readProfileForm(e.target);
    store.update((s) => {
      s.profile = p;
      s.weight.push({ id: uid(), ts: Date.now(), kg: p.weightKg });
    });
    toast("Profile created — your plan is ready!");
    go("#/home");
  });
}

// ===========================================================================
// Home dashboard
// ===========================================================================
function renderHome() {
  const s = store.get();
  const p = s.profile;
  const t = targets(p);
  const d = today();
  const tot = dayTotals(d);
  const left = t.calories - tot.calories;
  const lastG = s.glucose.slice().sort((a, b) => b.ts - a.ts)[0];
  const lastBp = s.bp.slice().sort((a, b) => b.ts - a.ts)[0];
  const water = s.water[d] || 0;
  const b = bmi(p.weightKg, p.heightCm);
  const bc = bmiCategory(b);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todays = s.meals.filter((m) => m.date === d);

  view.innerHTML = `
    <h1 class="greet">${greet}${p.name ? ", " + esc(p.name) : ""} 👋</h1>
    <section class="card summary">
      ${ring(Math.round(tot.calories), t.calories, { label: left >= 0 ? fmt(left) : "+" + fmt(-left), sub: left >= 0 ? "kcal left" : "kcal over" })}
      <div class="summary-side">
        <div class="kv"><span>Goal</span><b>${fmt(t.calories)} kcal</b></div>
        <div class="kv"><span>Eaten</span><b>${fmt(tot.calories)} kcal</b></div>
        ${bar("Protein", tot.protein_g, t.protein_g)}
        ${bar("Carbs", tot.carbs_g, t.carbs_g)}
        ${bar("Fat", tot.fat_g, t.fat_g)}
      </div>
    </section>

    <a class="card cta" href="#/scan"><span class="cta-icon">📸</span><span><b>Snap your meal</b><small>Get calories &amp; nutrients from a photo in seconds</small></span><span class="chev">›</span></a>

    <div class="grid2">
      <a class="card stat" href="#/vitals/sugar"><small>Blood sugar</small>
        ${lastG ? `<b>${glucoseDisplay(lastG.value)}</b>${pill(glucoseStatus(lastG.value, lastG.context))}<small>${GLUCOSE_CONTEXT[lastG.context]} · ${new Date(lastG.ts).toLocaleDateString()}</small>` : `<b>—</b><small>Tap to log</small>`}
      </a>
      <a class="card stat" href="#/vitals/bp"><small>Blood pressure</small>
        ${lastBp ? `<b>${lastBp.sys}/${lastBp.dia}</b>${pill(bpStatus(lastBp.sys, lastBp.dia))}<small>${new Date(lastBp.ts).toLocaleDateString()}</small>` : `<b>—</b><small>Tap to log</small>`}
      </a>
      <div class="card stat"><small>Water</small><b>${water} / ${t.water_glasses} 💧</b>
        <div class="stepper"><button class="btn sm" data-water="-1" aria-label="Remove glass">−</button><button class="btn sm primary" data-water="1" aria-label="Add glass">+1 💧</button></div></div>
      <a class="card stat" href="#/vitals/weight"><small>BMI</small><b>${b.toFixed(1)}</b>${pill(bc)}<small>${p.weightKg} kg</small></a>
    </div>

    <section class="card">
      <div class="card-head"><h2>Today's meals</h2><a href="#/diary">Diary ›</a></div>
      ${todays.length ? `<ul class="list">${todays.map(mealRow).join("")}</ul>` : `<p class="muted">Nothing logged yet. Scan a photo or add from the food list.</p>`}
      <div class="nutrient-strip">
        <span>Fibre <b>${fmt(tot.fiber_g, 1)}/${t.fiber_g} g</b></span>
        <span>Sugar <b class="${tot.sugar_g > t.sugar_g ? "bad" : ""}">${fmt(tot.sugar_g, 1)}/${t.sugar_g} g</b></span>
        <span>Sodium <b class="${tot.sodium_mg > t.sodium_mg ? "bad" : ""}">${fmt(tot.sodium_mg)}/${fmt(t.sodium_mg)} mg</b></span>
      </div>
    </section>
    <a class="card cta" href="#/plan"><span class="cta-icon">🥗</span><span><b>Today's diet plan</b><small>${fmt(t.calories)} kcal · ${DIETS[p.diet]}${p.conditions.length ? " · " + p.conditions.map((c) => CONDITIONS[c]).join(", ") : ""}</small></span><span class="chev">›</span></a>`;

  view.querySelectorAll("[data-water]").forEach((btn) =>
    btn.addEventListener("click", () => {
      store.update((s) => {
        s.water[d] = Math.max(0, (s.water[d] || 0) + Number(btn.dataset.water));
      });
      renderHome();
    }),
  );
  bindMealDeletes(renderHome);
}

function mealRow(m) {
  return `<li><div><b>${esc(m.name)}</b><small>${esc(m.portion || "")}${m.source === "scan" ? " · 📸 AI" : ""}</small></div>
    <div class="right"><b>${fmt(m.calories)}</b><small>kcal</small></div>
    <button class="icon-btn" data-del-meal="${m.id}" aria-label="Delete ${esc(m.name)}">✕</button></li>`;
}

function bindMealDeletes(rerender) {
  view.querySelectorAll("[data-del-meal]").forEach((b) =>
    b.addEventListener("click", () => {
      store.remove("meals", b.dataset.delMeal);
      rerender();
    }),
  );
}

// ===========================================================================
// Food photo scan (free, works without a profile)
// ===========================================================================
async function resizeImage(file, maxDim = 1280) {
  const bmp = await createImageBitmap(file).catch(() => null);
  let img = bmp;
  if (!img) {
    img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = URL.createObjectURL(file);
    });
  }
  const w = img.width;
  const h = img.height;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

let lastScan = null;

function renderScan() {
  view.innerHTML = `
    <h1>Food photo scan</h1>
    <p class="muted">Free · no sign-up. Take or upload a photo of your plate and get an instant estimate of calories, macros, sugar and sodium.</p>
    <section class="card scan">
      <div id="drop" class="drop" tabindex="0">
        <img id="preview" alt="" hidden>
        <div id="drop-hint"><div class="big">📷</div><p>Tap to take a photo or choose one</p><small>or drag &amp; drop an image here</small></div>
      </div>
      <div class="row2">
        <label class="btn" for="cam">📸 Camera</label>
        <label class="btn" for="gallery">🖼️ Gallery</label>
      </div>
      <input id="cam" type="file" accept="image/*" capture="environment" hidden>
      <input id="gallery" type="file" accept="image/*" hidden>
      <label>Add a note (optional)<input id="note" maxlength="300" placeholder="e.g. 2 rotis with ghee, half katori dal"></label>
      <button id="analyze" class="btn primary" disabled>Analyse meal</button>
    </section>
    <div id="scan-result" aria-live="polite"></div>`;

  let dataUrl = null;
  const preview = $("#preview");
  const analyzeBtn = $("#analyze");

  async function pick(file) {
    if (!file || !file.type.startsWith("image/")) return toast("Please choose an image file");
    try {
      dataUrl = await resizeImage(file);
    } catch {
      return toast("Couldn't read that image. Try a JPEG or PNG.");
    }
    preview.src = dataUrl;
    preview.hidden = false;
    $("#drop-hint").hidden = true;
    analyzeBtn.disabled = false;
    $("#scan-result").innerHTML = "";
    analyze(); // real-time: start immediately
  }

  $("#cam").addEventListener("change", (e) => pick(e.target.files[0]));
  $("#gallery").addEventListener("change", (e) => pick(e.target.files[0]));
  const drop = $("#drop");
  drop.addEventListener("click", () => $("#gallery").click());
  drop.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && $("#gallery").click());
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    pick(e.dataTransfer.files[0]);
  });
  analyzeBtn.addEventListener("click", analyze);

  async function analyze() {
    if (!dataUrl) return;
    const out = $("#scan-result");
    analyzeBtn.disabled = true;
    out.innerHTML = `<section class="card loading"><div class="spinner"></div><p>Identifying foods and estimating portions…</p></section>`;
    try {
      if (!navigator.onLine) throw new Error("You're offline. Food scanning needs an internet connection.");
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, note: $("#note").value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Scan failed (${res.status})`);
      lastScan = body;
      out.innerHTML = scanResult(body);
      bindScanResult();
    } catch (err) {
      out.innerHTML = `<section class="card error"><b>Couldn't analyse this photo</b><p>${esc(err.message)}</p>
        <a class="btn" href="#/diary?add=1">Search the food list instead</a></section>`;
    } finally {
      analyzeBtn.disabled = false;
    }
  }
}

function scanResult(r) {
  if (!r.is_food) {
    return `<section class="card error"><b>No food detected</b><p>Try a clearer, well-lit photo taken from above.</p></section>`;
  }
  const t = r.totals;
  const pt = profileTargets();
  return `
  <section class="card result">
    <div class="card-head"><h2>${esc(r.dish_name)}</h2><span class="pill ${r.confidence === "high" ? "good" : r.confidence === "low" ? "warn" : ""}">${esc(r.confidence)} confidence</span></div>
    <div class="result-top">
      <div class="kcal"><b>${fmt(t.calories)}</b><span>kcal</span></div>
      <div class="macros">
        <div><b>${fmt(t.protein_g, 1)} g</b><small>Protein</small></div>
        <div><b>${fmt(t.carbs_g, 1)} g</b><small>Carbs</small></div>
        <div><b>${fmt(t.fat_g, 1)} g</b><small>Fat</small></div>
        <div><b>${fmt(t.fiber_g, 1)} g</b><small>Fibre</small></div>
        <div><b>${fmt(t.sugar_g, 1)} g</b><small>Sugar</small></div>
        <div><b>${fmt(t.sodium_mg)} mg</b><small>Sodium</small></div>
      </div>
    </div>
    <div class="badges">
      <span class="pill ${r.glycemic_load === "low" ? "good" : r.glycemic_load === "high" ? "bad" : "warn"}">Glycemic load: ${esc(r.glycemic_load)}</span>
      <span class="pill ${r.health_score >= 7 ? "good" : r.health_score >= 4 ? "warn" : "bad"}">Health score ${r.health_score}/10</span>
      ${pt ? `<span class="pill">${Math.round((t.calories / pt.calories) * 100)}% of daily goal</span>` : ""}
    </div>
    <h3>Items</h3>
    <ul class="list items">${r.items
      .map(
        (it, i) => `<li><label class="check"><input type="checkbox" data-item="${i}" checked></label><div><b>${esc(it.name)}</b><small>${esc(it.portion)} · P ${it.protein_g} · C ${it.carbs_g} · F ${it.fat_g}</small></div><div class="right"><b>${fmt(it.calories)}</b><small>kcal</small></div></li>`,
      )
      .join("")}</ul>
    ${r.tips?.length ? `<h3>Tips</h3><ul class="tips">${r.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    <div class="add-row">
      <select id="scan-slot" aria-label="Meal">${slotOptions(slotFromTime())}</select>
      <button id="scan-add" class="btn primary">Add to diary</button>
    </div>
    <p class="disclaimer">AI estimates from a photo can be off by 15–25%. Use a note to describe hidden oil, sugar or portion size for better accuracy.</p>
  </section>`;
}

function bindScanResult() {
  $("#scan-add").addEventListener("click", () => {
    const slot = $("#scan-slot").value;
    const chosen = [...view.querySelectorAll("[data-item]")].filter((c) => c.checked).map((c) => lastScan.items[c.dataset.item]);
    if (!chosen.length) return toast("Select at least one item");
    store.update((s) => {
      for (const it of chosen) {
        const m = { id: uid(), date: today(), slot, name: it.name, portion: it.portion, qty: 1, source: "scan" };
        for (const k of NUTRIENT_KEYS) m[k] = it[k];
        s.meals.push(m);
      }
    });
    toast(`Added ${chosen.length} item${chosen.length > 1 ? "s" : ""} to ${SLOTS.find((x) => x.id === slot).label}`);
    go(store.get().profile ? "#/home" : "#/diary");
  });
}

// ===========================================================================
// Food diary
// ===========================================================================
let diaryDate = today();

function renderDiary(params = new URLSearchParams()) {
  const s = store.get();
  const t = profileTargets();
  const tot = dayTotals(diaryDate);
  const meals = s.meals.filter((m) => m.date === diaryDate);
  const isToday = diaryDate === today();
  view.innerHTML = `
    <h1>Food diary</h1>
    <div class="date-nav card">
      <button class="icon-btn" id="prev" aria-label="Previous day">‹</button>
      <b>${isToday ? "Today" : new Date(diaryDate + "T00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</b>
      <button class="icon-btn" id="next" aria-label="Next day" ${isToday ? "disabled" : ""}>›</button>
    </div>
    <section class="card">
      <div class="totals-row">
        <div><b>${fmt(tot.calories)}</b><small>${t ? "of " + fmt(t.calories) + " kcal" : "kcal"}</small></div>
        <div><b>${fmt(tot.protein_g)} g</b><small>Protein</small></div>
        <div><b>${fmt(tot.carbs_g)} g</b><small>Carbs</small></div>
        <div><b>${fmt(tot.fat_g)} g</b><small>Fat</small></div>
      </div>
      ${t ? bar("Fibre", tot.fiber_g, t.fiber_g) + bar("Sugar", tot.sugar_g, t.sugar_g) + bar("Sodium", tot.sodium_mg, t.sodium_mg, "mg") : ""}
    </section>
    <section class="card form" id="add-food">
      <h2>Add food</h2>
      <input id="food-q" type="search" placeholder="Search e.g. roti, dal, idli, chicken…" autocomplete="off">
      <ul id="food-results" class="list results"></ul>
      <div class="row3">
        <label>Servings<input id="food-qty" type="number" min="0.25" step="0.25" value="1" inputmode="decimal"></label>
        <label>Meal<select id="food-slot">${slotOptions(slotFromTime())}</select></label>
        <button id="food-add" class="btn primary" disabled>Add</button>
      </div>
      <p class="muted small">Not on the list? <a href="#/scan">Scan a photo</a> instead.</p>
    </section>
    ${SLOTS.map((slot) => {
      const list = meals.filter((m) => m.slot === slot.id);
      const kcal = list.reduce((a, m) => a + m.calories, 0);
      return `<section class="card"><div class="card-head"><h2>${slot.label}</h2><span class="muted">${fmt(kcal)} kcal</span></div>
        ${list.length ? `<ul class="list">${list.map(mealRow).join("")}</ul>` : `<p class="muted small">Nothing logged</p>`}</section>`;
    }).join("")}`;

  $("#prev").addEventListener("click", () => {
    diaryDate = today(new Date(new Date(diaryDate + "T12:00").getTime() - DAY));
    renderDiary();
  });
  $("#next").addEventListener("click", () => {
    if (diaryDate === today()) return;
    diaryDate = today(new Date(new Date(diaryDate + "T12:00").getTime() + DAY));
    renderDiary();
  });

  let selected = null;
  const results = $("#food-results");
  const showResults = (q) => {
    results.innerHTML = searchFoods(q, 8)
      .map((f) => `<li class="pick ${selected?.id === f.id ? "sel" : ""}" data-food="${f.id}" tabindex="0"><div><b>${esc(f.name)}</b><small>${esc(f.serving)}</small></div><div class="right"><b>${f.calories}</b><small>kcal</small></div></li>`)
      .join("");
  };
  $("#food-q").addEventListener("input", (e) => showResults(e.target.value));
  results.addEventListener("click", (e) => {
    const li = e.target.closest("[data-food]");
    if (!li) return;
    selected = FOOD_BY_ID[li.dataset.food];
    $("#food-add").disabled = false;
    showResults($("#food-q").value);
  });
  results.addEventListener("keydown", (e) => e.key === "Enter" && e.target.click());
  $("#food-add").addEventListener("click", () => {
    const qty = Number($("#food-qty").value) || 1;
    store.add("meals", { date: diaryDate, slot: $("#food-slot").value, name: selected.name, portion: `${qty} × ${selected.serving}`, qty, source: "db", ...scaled(selected, qty) });
    toast(`Added ${selected.name}`);
    renderDiary();
  });
  showResults("");
  bindMealDeletes(() => renderDiary());
  if (params.get("add")) $("#food-q").focus();
}

// ===========================================================================
// Diet plan
// ===========================================================================
let planDay = (new Date().getDay() + 6) % 7; // Monday = 0

function renderPlan() {
  const p = store.get().profile;
  const t = targets(p);
  const plan = generatePlan(p, t.calories, p.planSeed || 1);
  const day = plan[planDay];
  view.innerHTML = `
    <h1>Your diet plan</h1>
    <section class="card plan-head">
      <div><b>${fmt(t.calories)} kcal/day</b><small>P ${t.protein_g} g · C ${t.carbs_g} g · F ${t.fat_g} g · Sodium ≤ ${fmt(t.sodium_mg)} mg</small></div>
      <button class="btn sm" id="reshuffle">🔄 New plan</button>
    </section>
    <div class="tabs" role="tablist">${plan.map((d, i) => `<button role="tab" class="tab ${i === planDay ? "active" : ""}" data-day="${i}" aria-selected="${i === planDay}">${d.day}</button>`).join("")}</div>
    ${day.meals
      .map(
        (m, i) => `<section class="card meal">
        <div class="card-head"><h2>${m.label} <small class="muted">${m.time}</small></h2><span><b>${fmt(m.totals.calories)}</b> kcal</span></div>
        <ul class="plain">${m.items.map((it) => `<li><span>${esc(it.name)}</span><small>${it.qty === 1 ? "" : it.qty + " × "}${esc(it.serving)}</small></li>`).join("")}</ul>
        <div class="meal-foot"><small>P ${fmt(m.totals.protein_g)} g · C ${fmt(m.totals.carbs_g)} g · F ${fmt(m.totals.fat_g)} g · Fibre ${fmt(m.totals.fiber_g)} g</small>
        <button class="btn sm" data-log-meal="${i}">✓ Ate this</button></div>
      </section>`,
      )
      .join("")}
    <section class="card"><div class="card-head"><h2>Day total</h2><b>${fmt(day.totals.calories)} kcal</b></div>
      <small class="muted">Protein ${fmt(day.totals.protein_g)} g · Carbs ${fmt(day.totals.carbs_g)} g · Fat ${fmt(day.totals.fat_g)} g · Sugar ${fmt(day.totals.sugar_g)} g · Sodium ${fmt(day.totals.sodium_mg)} mg</small></section>
    <section class="card"><h2>Guidelines for you</h2><ul class="tips">${guidelines(p).map((g) => `<li>${esc(g)}</li>`).join("")}</ul></section>
    <p class="disclaimer">General guidance only. If you take insulin or BP medication, review diet changes with your doctor or dietitian.</p>`;

  view.querySelectorAll("[data-day]").forEach((b) =>
    b.addEventListener("click", () => {
      planDay = Number(b.dataset.day);
      renderPlan();
    }),
  );
  $("#reshuffle").addEventListener("click", () => {
    store.update((s) => (s.profile.planSeed = Math.floor(Math.random() * 1e6)));
    renderPlan();
    toast("New plan generated");
  });
  view.querySelectorAll("[data-log-meal]").forEach((b) =>
    b.addEventListener("click", () => {
      const m = day.meals[Number(b.dataset.logMeal)];
      store.update((s) => {
        for (const it of m.items) {
          s.meals.push({ id: uid(), date: today(), slot: m.slot, name: it.name, portion: `${it.qty} × ${it.serving}`, qty: it.qty, source: "plan", ...Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, it[k]])) });
        }
      });
      toast(`${m.label} logged`);
    }),
  );
}

// ===========================================================================
// Vitals: blood sugar, blood pressure, weight
// ===========================================================================
function nowLocalInput() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function renderVitals(tab = "sugar") {
  const tabs = { sugar: "🩸 Sugar", bp: "❤️ BP", weight: "⚖️ Weight" };
  view.innerHTML = `<h1>Vitals</h1>
    <div class="tabs" role="tablist">${Object.entries(tabs).map(([k, v]) => `<a role="tab" class="tab ${k === tab ? "active" : ""}" href="#/vitals/${k}" aria-selected="${k === tab}">${v}</a>`).join("")}</div>
    <div id="vitals-body"></div>`;
  ({ sugar: renderSugar, bp: renderBp, weight: renderWeight })[tab]?.($("#vitals-body"));
}

function renderSugar(root) {
  const s = store.get();
  const unit = s.settings.glucoseUnit;
  const list = s.glucose.slice().sort((a, b) => b.ts - a.ts);
  const since = (days) => list.filter((g) => g.ts > Date.now() - days * DAY);
  const last7 = since(7);
  const last90 = since(90);
  const fasting7 = last7.filter((g) => g.context === "fasting");
  const inRange = last7.filter((g) => g.value >= 70 && g.value <= 180).length;
  const ctxColors = { fasting: "var(--c1)", before_meal: "var(--c2)", after_meal: "var(--c3)", random: "var(--c4)", bedtime: "var(--c5)" };
  const recent = list.filter((g) => g.ts > Date.now() - 30 * DAY);
  const series = Object.keys(GLUCOSE_CONTEXT)
    .map((c) => ({ name: GLUCOSE_CONTEXT[c], color: ctxColors[c], points: recent.filter((g) => g.context === c).map((g) => ({ x: g.ts, y: unit === "mmol/L" ? mgToMmol(g.value) : g.value })) }))
    .filter((x) => x.points.length);
  const band = unit === "mmol/L" ? { from: 3.9, to: 10, label: "Target range 3.9–10 mmol/L" } : { from: 70, to: 180, label: "Target range 70–180 mg/dL" };

  root.innerHTML = `
    <section class="card form">
      <h2>Log blood sugar</h2>
      <form id="g-form">
        <div class="row2">
          <label>Reading (${unit})<input name="value" type="number" step="${unit === "mmol/L" ? "0.1" : "1"}" min="1" max="${unit === "mmol/L" ? 40 : 700}" required inputmode="decimal" placeholder="${unit === "mmol/L" ? "5.6" : "100"}"></label>
          <label>When<select name="context">${Object.entries(GLUCOSE_CONTEXT).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        </div>
        <label>Date &amp; time<input name="ts" type="datetime-local" value="${nowLocalInput()}" required></label>
        <label>Note<input name="note" placeholder="e.g. after walk, missed dose"></label>
        <button class="btn primary">Save reading</button>
      </form>
    </section>
    <div class="grid3">
      <div class="card stat"><small>7-day average</small><b>${last7.length ? glucoseDisplay(avg(last7.map((g) => g.value))) : "—"}</b></div>
      <div class="card stat"><small>Avg fasting (7d)</small><b>${fasting7.length ? glucoseDisplay(avg(fasting7.map((g) => g.value))) : "—"}</b></div>
      <div class="card stat"><small>Est. HbA1c (90d)</small><b>${last90.length >= 10 ? estimatedA1c(avg(last90.map((g) => g.value))) + "%" : "—"}</b><small>${last90.length >= 10 ? "from " + last90.length + " readings" : "needs 10+ readings"}</small></div>
    </div>
    ${last7.length ? `<p class="muted small">Time in range (70–180 mg/dL) last 7 days: <b>${Math.round((inRange / last7.length) * 100)}%</b></p>` : ""}
    <section class="card"><h2>Last 30 days</h2>${lineChart({ series, bands: [band], yLabel: "Blood glucose" })}</section>
    <section class="card"><div class="card-head"><h2>History</h2>
      <button class="btn sm" id="unit-toggle">Show ${unit === "mg/dL" ? "mmol/L" : "mg/dL"}</button></div>
      ${list.length ? `<ul class="list">${list.slice(0, 50).map((g) => `<li><div><b>${glucoseDisplay(g.value)}</b><small>${GLUCOSE_CONTEXT[g.context]} · ${new Date(g.ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}${g.note ? " · " + esc(g.note) : ""}</small></div>${pill(glucoseStatus(g.value, g.context))}<button class="icon-btn" data-del="${g.id}" aria-label="Delete reading">✕</button></li>`).join("")}</ul>` : `<p class="muted">No readings yet.</p>`}
    </section>
    <p class="disclaimer">Reference ranges: fasting 70–99 normal, 100–125 elevated, ≥126 high; 2 h after meals &lt;140 normal. Your doctor may set different targets. If a reading is below 70 mg/dL, take 15 g of fast sugar and recheck in 15 minutes.</p>`;

  $("#g-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const raw = Number(fd.get("value"));
    const value = unit === "mmol/L" ? mmolToMg(raw) : raw;
    store.add("glucose", { ts: new Date(fd.get("ts")).getTime(), value, context: fd.get("context"), note: fd.get("note").trim() });
    const st = glucoseStatus(value, fd.get("context"));
    toast(`Saved — ${st.label}`);
    renderVitals("sugar");
  });
  $("#unit-toggle").addEventListener("click", () => {
    store.update((s) => (s.settings.glucoseUnit = unit === "mg/dL" ? "mmol/L" : "mg/dL"));
    renderVitals("sugar");
  });
  root.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => (store.remove("glucose", b.dataset.del), renderVitals("sugar"))));
}

function renderBp(root) {
  const list = store.get().bp.slice().sort((a, b) => b.ts - a.ts);
  const last7 = list.filter((r) => r.ts > Date.now() - 7 * DAY);
  const recent = list.filter((r) => r.ts > Date.now() - 30 * DAY);
  const a7 = last7.length ? { sys: Math.round(avg(last7.map((r) => r.sys))), dia: Math.round(avg(last7.map((r) => r.dia))) } : null;
  root.innerHTML = `
    <section class="card form">
      <h2>Log blood pressure</h2>
      <form id="bp-form">
        <div class="row3">
          <label>Systolic<input name="sys" type="number" min="60" max="260" required inputmode="numeric" placeholder="120"></label>
          <label>Diastolic<input name="dia" type="number" min="30" max="180" required inputmode="numeric" placeholder="80"></label>
          <label>Pulse<input name="pulse" type="number" min="30" max="220" inputmode="numeric" placeholder="72"></label>
        </div>
        <label>Date &amp; time<input name="ts" type="datetime-local" value="${nowLocalInput()}" required></label>
        <label>Note<input name="note" placeholder="e.g. morning, left arm, after medicine"></label>
        <button class="btn primary">Save reading</button>
      </form>
    </section>
    <div class="grid2">
      <div class="card stat"><small>7-day average</small><b>${a7 ? `${a7.sys}/${a7.dia}` : "—"}</b>${a7 ? pill(bpStatus(a7.sys, a7.dia)) : ""}</div>
      <div class="card stat"><small>Readings (30d)</small><b>${recent.length}</b></div>
    </div>
    <section class="card"><h2>Last 30 days</h2>${lineChart({
      series: [
        { name: "Systolic", color: "var(--c3)", points: recent.map((r) => ({ x: r.ts, y: r.sys })) },
        { name: "Diastolic", color: "var(--c1)", points: recent.map((r) => ({ x: r.ts, y: r.dia })) },
      ].filter((s) => s.points.length),
      bands: [{ from: 80, to: 120, label: "Normal: under 120/80" }],
      yLabel: "Blood pressure",
    })}</section>
    <section class="card"><h2>History</h2>
      ${list.length ? `<ul class="list">${list.slice(0, 50).map((r) => `<li><div><b>${r.sys}/${r.dia}</b><small>${r.pulse ? "♥ " + r.pulse + " bpm · " : ""}${new Date(r.ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}${r.note ? " · " + esc(r.note) : ""}</small></div>${pill(bpStatus(r.sys, r.dia))}<button class="icon-btn" data-del="${r.id}" aria-label="Delete reading">✕</button></li>`).join("")}</ul>` : `<p class="muted">No readings yet.</p>`}
    </section>
    <p class="disclaimer">Categories per ACC/AHA: Normal &lt;120/80 · Elevated 120–129/&lt;80 · Stage 1 130–139 or 80–89 · Stage 2 ≥140 or ≥90. A reading above 180/120 with chest pain, breathlessness or vision problems needs emergency care.</p>`;

  $("#bp-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const r = { ts: new Date(fd.get("ts")).getTime(), sys: Number(fd.get("sys")), dia: Number(fd.get("dia")), pulse: Number(fd.get("pulse")) || null, note: fd.get("note").trim() };
    if (r.dia >= r.sys) return toast("Diastolic should be lower than systolic");
    store.add("bp", r);
    const st = bpStatus(r.sys, r.dia);
    if (st.urgent) alert("This reading is in the hypertensive crisis range. Rest 5 minutes and re-measure. If it stays this high or you have symptoms, seek medical care immediately.");
    else toast(`Saved — ${st.label}`);
    renderVitals("bp");
  });
  root.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => (store.remove("bp", b.dataset.del), renderVitals("bp"))));
}

function renderWeight(root) {
  const s = store.get();
  const p = s.profile;
  const list = s.weight.slice().sort((a, b) => b.ts - a.ts);
  const first = list[list.length - 1];
  const b = bmi(p.weightKg, p.heightCm);
  root.innerHTML = `
    <section class="card form"><h2>Log weight</h2>
      <form id="w-form" class="row2">
        <label>Weight (kg)<input name="kg" type="number" step="0.1" min="25" max="300" required inputmode="decimal" value="${p.weightKg}"></label>
        <button class="btn primary">Save</button>
      </form></section>
    <div class="grid3">
      <div class="card stat"><small>Current</small><b>${p.weightKg} kg</b></div>
      <div class="card stat"><small>Change</small><b>${first ? (p.weightKg - first.kg > 0 ? "+" : "") + (p.weightKg - first.kg).toFixed(1) + " kg" : "—"}</b></div>
      <div class="card stat"><small>BMI</small><b>${b.toFixed(1)}</b>${pill(bmiCategory(b))}</div>
    </div>
    <section class="card"><h2>Progress</h2>${lineChart({ series: [{ name: "Weight", color: "var(--c2)", points: list.map((w) => ({ x: w.ts, y: w.kg })) }], yLabel: "Weight" })}</section>
    <section class="card"><h2>History</h2><ul class="list">${list.slice(0, 50).map((w) => `<li><div><b>${w.kg} kg</b><small>${new Date(w.ts).toLocaleDateString()}</small></div><button class="icon-btn" data-del="${w.id}" aria-label="Delete">✕</button></li>`).join("")}</ul></section>`;
  $("#w-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const kg = Number(new FormData(e.target).get("kg"));
    store.update((s) => {
      s.weight.push({ id: uid(), ts: Date.now(), kg });
      s.profile.weightKg = kg;
    });
    toast("Weight saved — targets updated");
    renderVitals("weight");
  });
  root.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => (store.remove("weight", b.dataset.del), renderVitals("weight"))));
}

// ===========================================================================
// Profile & settings
// ===========================================================================
function renderProfile() {
  const p = store.get().profile;
  const t = targets(p);
  view.innerHTML = `
    <h1>Profile</h1>
    <section class="card"><h2>Your daily targets</h2>
      <div class="targets">
        <div><b>${fmt(t.calories)}</b><small>kcal</small></div><div><b>${t.protein_g} g</b><small>protein</small></div>
        <div><b>${t.carbs_g} g</b><small>carbs</small></div><div><b>${t.fat_g} g</b><small>fat</small></div>
        <div><b>${t.fiber_g} g</b><small>fibre</small></div><div><b>≤ ${t.sugar_g} g</b><small>added sugar</small></div>
        <div><b>≤ ${fmt(t.sodium_mg)}</b><small>mg sodium</small></div><div><b>${t.water_glasses}</b><small>glasses water</small></div>
      </div>
      <p class="muted small">BMR ${fmt(t.bmr)} kcal · Maintenance ${fmt(t.tdee)} kcal (Mifflin–St Jeor)</p>
    </section>
    <h2>Edit details</h2>
    ${profileForm(p)}
    <section class="card form"><h2>Your data</h2>
      <p class="muted small">Your health data is stored only on this device. Photos you scan are sent to the server for analysis and are not stored.</p>
      <div class="row2"><button class="btn" id="export">⬇️ Export backup</button><label class="btn" for="import">⬆️ Import backup</label></div>
      <input type="file" id="import" accept="application/json" hidden>
      <button class="btn danger" id="reset">Delete all data</button>
    </section>
    <p class="disclaimer">NutriPulse provides general wellness information and is not a medical device. It does not diagnose or treat any condition. Always follow your doctor's advice.</p>`;

  $("#profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const np = readProfileForm(e.target);
    store.update((s) => {
      if (np.weightKg !== s.profile.weightKg) s.weight.push({ id: uid(), ts: Date.now(), kg: np.weightKg });
      s.profile = np;
    });
    toast("Profile saved");
    renderProfile();
  });
  $("#export").addEventListener("click", () => {
    const blob = new Blob([store.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nutripulse-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $("#import").addEventListener("change", async (e) => {
    try {
      store.importJson(await e.target.files[0].text());
      toast("Backup restored");
      route();
    } catch (err) {
      toast("Import failed: " + err.message);
    }
  });
  $("#reset").addEventListener("click", () => {
    if (confirm("Delete your profile, meals and all readings from this device?")) {
      store.reset();
      go("#/home");
    }
  });
}

// ===========================================================================
// Router
// ===========================================================================
function route() {
  const [pathPart, query = ""] = location.hash.replace(/^#/, "").split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const page = parts[0] || "home";
  const params = new URLSearchParams(query);
  const hasProfile = Boolean(store.get().profile);

  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === page));
  document.body.classList.toggle("no-profile", !hasProfile);
  window.scrollTo(0, 0);

  // Scan + diary are usable without a profile (free scan, no sign-up).
  if (page === "scan") return renderScan();
  if (page === "diary") return renderDiary(params);
  if (!hasProfile) return renderOnboarding();
  if (page === "plan") return renderPlan();
  if (page === "vitals") return renderVitals(parts[1] || "sugar");
  if (page === "profile") return renderProfile();
  return renderHome();
}

window.addEventListener("hashchange", route);
route();

// ---- PWA: service worker + install prompt ---------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $("#install").hidden = false;
});
$("#install").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("#install").hidden = true;
});
window.addEventListener("appinstalled", () => ($("#install").hidden = true));

// Show when AI scan is unavailable on this deployment.
fetch("/api/health")
  .then((r) => r.json())
  .then((h) => {
    if (!h.aiScan) document.body.dataset.aiOff = "1";
  })
  .catch(() => {});

export { FOODS };
