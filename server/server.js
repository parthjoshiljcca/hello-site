// Zero-framework HTTP server: serves the PWA from ../public and exposes the food-scan API.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeFood, isConfigured, MODEL, UserError } from "./analyze.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(process.env.PUBLIC_DIR || path.join(__dirname, "..", "public"));
const PORT = Number(process.env.PORT || 8080);
const MAX_BODY = 8 * 1024 * 1024; // 8 MB (client downsizes photos to ~1 MP before upload)
const RATE_LIMIT = Number(process.env.SCAN_RATE_LIMIT || 20); // scans per IP per hour (free tier)

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
};

// --- tiny in-memory rate limiter -----------------------------------------
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 3600_000;
  const list = (hits.get(ip) || []).filter((t) => t > windowStart);
  if (list.length >= RATE_LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}
setInterval(() => {
  const cutoff = Date.now() - 3600_000;
  for (const [ip, list] of hits) if (!list.some((t) => t > cutoff)) hits.delete(ip);
}, 600_000).unref();

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== "string" && !Buffer.isBuffer(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new UserError("Photo too large (max 8 MB).", 413));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new UserError("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

async function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.resolve(PUBLIC_DIR, "." + rel);
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, "Forbidden", { "Content-Type": "text/plain" });
  let target = file;
  try {
    const s = await stat(target);
    if (s.isDirectory()) target = path.join(target, "index.html");
  } catch {
    // SPA fallback: unknown paths without an extension get the app shell.
    if (path.extname(file)) return send(res, 404, "Not found", { "Content-Type": "text/plain" });
    target = path.join(PUBLIC_DIR, "index.html");
  }
  try {
    const data = await readFile(target);
    const ext = path.extname(target);
    const noCache = ext === ".html" || path.basename(target) === "sw.js" || ext === ".webmanifest";
    send(res, 200, data, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": noCache ? "no-cache" : "public, max-age=3600",
    });
  } catch {
    send(res, 404, "Not found", { "Content-Type": "text/plain" });
  }
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/api/health") {
      return send(res, 200, { ok: true, aiScan: isConfigured(), model: isConfigured() ? MODEL : null });
    }
    if (url.pathname === "/api/analyze-food") {
      if (req.method !== "POST") return send(res, 405, { error: "Use POST." }, { Allow: "POST" });
      const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
      if (rateLimited(ip)) return send(res, 429, { error: "Free scan limit reached. Please try again in an hour." });
      const body = await readJson(req);
      const result = await analyzeFood(body);
      return send(res, 200, result);
    }
    if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "Not found" });
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");
    return serveStatic(req, res, url.pathname);
  } catch (err) {
    if (err instanceof UserError) return send(res, err.status, { error: err.message });
    if (err instanceof Anthropic.RateLimitError) return send(res, 503, { error: "AI service is busy. Try again shortly." });
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return send(res, 502, { error: "AI service error. Please try again." });
    }
    console.error(err);
    return send(res, 500, { error: "Something went wrong." });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`NutriPulse running on http://localhost:${PORT}  (AI scan ${isConfigured() ? "enabled" : "disabled"})`);
  });
}
