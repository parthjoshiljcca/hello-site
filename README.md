# NutriPulse: a health and nutrition PWA

NutriPulse is an installable Progressive Web App for phones and desktops. It covers diet planning, calorie and nutrition tracking, diabetes and blood pressure logging, and an **AI food-photo scanner** that anyone can use free without signing up.

| Feature | What it does |
|---|---|
| 📸 **Food photo scan** (free, no sign-up) | You take or upload a photo of a meal. The app identifies each item, estimates the portion and returns calories, protein, carbs, fat, fibre, sugar, sodium, glycemic load, a health score and tips. You can add the selected items to your diary with one tap. |
| 🥗 **Personalised diet plans** | Builds a 7-day plan that fits your calorie target (Mifflin–St Jeor), diet (veg, eggetarian, non-veg or vegan) and conditions. For diabetes it chooses low-GI foods; for blood pressure it limits sodium (DASH). Tap "New plan" to reshuffle and "Ate this" to log a meal. |
| 📒 **Food diary** | Searchable database of about 90 common Indian and global foods. Shows daily totals against your targets for calories, macros, fibre, sugar and sodium. |
| 🩸 **Blood sugar** | Logs readings in mg/dL or mmol/L with context (fasting, before meal, 2 h after meal, random, bedtime). Labels each reading against ADA ranges. Shows 7-day averages, time in range, an estimated HbA1c (ADAG formula) and a 30-day chart. |
| ❤️ **Blood pressure** | Logs systolic, diastolic and pulse. Classifies readings using ACC/AHA categories, warns about crisis-level readings and draws a 30-day chart. |
| ⚖️ **Weight & BMI** | Tracks weight with Asian-Indian BMI cut-offs. Your targets update automatically when your weight changes. |
| 💧 **Water** | Daily count of glasses against a target based on your body weight. |
| 📱 **PWA** | Installable on Android, iOS and desktop. Works offline (the photo scan needs a connection) and supports dark mode. |
| 🔒 **Privacy** | All health data stays on the device in localStorage, and you can export or import a JSON backup. Photos are sent only for analysis and are not stored. |

## Architecture

```
public/            Static PWA (vanilla JS ES modules, no build step)
  index.html       App shell
  styles.css       Mobile-first responsive UI (bottom nav on phones, sidebar on desktop)
  sw.js            Service worker (offline app shell)
  manifest.webmanifest
  js/app.js        Router + all screens
  js/foods.js      Food database
  js/health.js     BMR/TDEE/macros, glucose & BP classification
  js/plans.js      Diet-plan generator
  js/charts.js     Dependency-free SVG charts
server/            Node server: serves public/ and the AI API
  server.js        Static hosting, /api/health, /api/analyze-food, per-IP rate limit
  analyze.js       Claude vision call with JSON-schema structured output
  test/            node:test suite
```

The food scan calls the Claude API (`claude-opus-5-5` by default) and asks for a JSON-schema-constrained response, so the result always has the same shape. The server then recalculates the totals from the individual items so the numbers always add up. The client shrinks each photo to about 1280 px before uploading, which keeps scans fast.

## Run locally

```bash
cd server
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # needed for the photo scan only
npm start                             # http://localhost:8080
npm test
```

If `ANTHROPIC_API_KEY` is not set, everything except the photo scan still works, and the scan screen tells users to search the food list instead.

### Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | none | Turns on the AI food scan |
| `CLAUDE_MODEL` | `claude-opus-5-5` | Model used for the scan |
| `PORT` | `8080` (`80` in Docker) | HTTP port |
| `SCAN_RATE_LIMIT` | `20` | Free scans allowed per IP per hour |

## Docker

```bash
docker build -t nutripulse .
docker run -p 8080:80 -e ANTHROPIC_API_KEY=sk-ant-... nutripulse
```

The CI workflow runs the unit tests, builds the image, smoke-tests the container and pushes it to Docker Hub.

> PWAs need **HTTPS** to install (localhost is exempt). Put the container behind a TLS-terminating proxy or host it on a platform that provides HTTPS.

## Disclaimer

NutriPulse gives general wellness information. It is not a medical device and does not diagnose or treat any condition. Food-photo estimates can be off by 15–25%.
