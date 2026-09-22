import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const host = process.env.HOST;
const port = Number(process.env.PORT);
if (!host) throw new Error("HOST is required");
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const clientRoot = fileURLToPath(new URL("./dist/", import.meta.url));
const clientRootPrefix = clientRoot.endsWith(sep) ? clientRoot : `${clientRoot}${sep}`;
const indexPath = resolve(clientRoot, "index.html");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

/* ----------------------------- time helpers ----------------------------- */

const APP_TZ = "Asia/Shanghai";
const weekdayCN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function zonedParts(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const map = {};
  for (const part of fmt.formatToParts(now)) if (part.type !== "literal") map[part.type] = part.value;
  return map;
}

function todayISO() {
  const p = zonedParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function shiftDate(iso, days) {
  const base = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(base)) return null;
  return new Date(base + days * 86_400_000).toISOString().slice(0, 10);
}

function diffDays(fromISO, toISO) {
  const a = Date.parse(`${fromISO}T00:00:00Z`);
  const b = Date.parse(`${toISO}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

function weekdayOf(iso) {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(ms) ? "" : weekdayCN[new Date(ms).getUTCDay()];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function validDate(value) {
  return typeof value === "string" && DATE_RE.test(value) ? value : null;
}

/* ------------------------------ supabase ------------------------------- */

const BROKER_URL = "http://127.0.0.1:9001";
const BROKER_PLACEHOLDER_KEY = "qwenwork-runtime-broker";
const SUBJECTS = new Set(["physics", "math"]);
const CHECKIN_STATUS = new Set(["done", "shaky"]);
const SAFE_OPERATIONS = new Set([
  "fetch_day", "fetch_calendar", "fetch_first_day", "save_checkin", "fetch_checkins", "fetch_stats", "fetch_shaky_topics",
]);

class DatabaseUnavailableError extends Error {
  constructor() { super("Database service is unavailable"); this.code = "DATABASE_UNAVAILABLE"; }
}
class DatabaseOperationError extends Error {
  constructor(rawError, operation) {
    super("Database operation failed");
    this.code = "DATABASE_OPERATION_FAILED";
    this.diagnostic = Object.freeze(buildSafeDiagnostic(rawError, operation));
  }
}

const SAFE_CODE = /^[A-Z0-9_]{1,32}$/;
function safeCode(value) {
  return typeof value === "string" && SAFE_CODE.test(value.toUpperCase()) ? value.toUpperCase() : "UNKNOWN";
}
function safeStatus(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 400 && n <= 599 ? n : undefined;
}
function classify(code, status, name) {
  if (status === 401) return "authentication_failed";
  if (status === 403 || code === "42501") return "permission_denied";
  if (code === "42P01" || code === "42703" || code === "PGRST205") return "schema_mismatch";
  if (status === 409 || code === "23503" || code === "23505") return "conflict";
  if (status === 429) return "rate_limited";
  if (code === "57014" || name === "AbortError") return "timeout";
  if (status >= 500 || name === "TypeError") return "upstream_unavailable";
  return "operation_failed";
}
function buildSafeDiagnostic(rawError, operation) {
  const code = safeCode(rawError?.code);
  const status = safeStatus(rawError?.status);
  const diagnostic = { category: classify(code, status, rawError?.name), code, operation: SAFE_OPERATIONS.has(operation) ? operation : "unknown" };
  if (status !== undefined) diagnostic.status = status;
  return diagnostic;
}

let cachedClient;
function getDb() {
  if (cachedClient) return cachedClient;
  const legacy = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    instanceId: process.env.SUPABASE_INSTANCE_ID,
  };
  const present = Object.values(legacy).filter(Boolean).length;
  if (present !== 0 && present !== 3) throw new DatabaseUnavailableError();
  const useExternal = present === 3;
  cachedClient = createClient(useExternal ? legacy.url : BROKER_URL, useExternal ? legacy.key : BROKER_PLACEHOLDER_KEY, {
    global: { headers: useExternal ? { "X-Instance-ID": legacy.instanceId } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

async function runDb(operation, execute) {
  try {
    const { data, error } = await execute();
    if (error) throw new DatabaseOperationError(error, operation);
    return data;
  } catch (error) {
    if (error instanceof DatabaseOperationError) throw error;
    if (error instanceof DatabaseUnavailableError) throw error;
    throw new DatabaseOperationError(error, operation);
  }
}

const asDate = (value) => (typeof value === "string" ? value.slice(0, 10) : value);
const normalizeBlock = (row) => ({
  subject: row.subject,
  section: row.section,
  position: Number(row.position ?? 0),
  title: row.title ?? "",
  body: row.body ?? "",
  answer: row.answer ?? null,
  terms: row.terms ?? null,
});

async function loadDay(date) {
  const db = getDb();
  const rows = await runDb("fetch_day", () =>
    db.from("cards").select("subject,section,position,title,body,answer,terms,day_num,card_date")
      .eq("card_date", date).order("subject", { ascending: true }).order("position", { ascending: true })
      .limit(200));
  const subjects = { physics: [], math: [] };
  let dayNum = null;
  for (const row of rows ?? []) {
    if (subjects[row.subject]) subjects[row.subject].push(normalizeBlock(row));
    if (dayNum === null && Number.isFinite(Number(row.day_num))) dayNum = Number(row.day_num);
  }
  const checkins = await runDb("fetch_checkins", () => db.from("checkins").select("subject,status").eq("checkin_date", date));
  const status = { physics: null, math: null };
  for (const row of checkins ?? []) if (status[row.subject] !== undefined) status[row.subject] = row.status;
  return { date, weekday: weekdayOf(date), day_num: dayNum, subjects, checkins: status };
}

async function earliestDay() {
  const db = getDb();
  const rows = await runDb("fetch_first_day", () => db.from("cards").select("card_date").order("card_date", { ascending: true }).limit(1));
  const first = rows?.[0]?.card_date;
  return asDate(first);
}

async function saveCheckin(date, subject, status) {
  const db = getDb();
  return runDb("save_checkin", () =>
    db.from("checkins").upsert(
      { checkin_date: date, subject, status, updated_at: new Date().toISOString() },
      { onConflict: "checkin_date,subject" },
    ).select("checkin_date,subject,status"));
}

async function buildStats() {
  const db = getDb();
  const [calendar, checkins] = await Promise.all([
    runDb("fetch_calendar", () => db.from("cards").select("card_date").order("card_date", { ascending: true }).limit(400)),
    runDb("fetch_checkins", () => db.from("checkins").select("checkin_date,subject,status").order("checkin_date", { ascending: true }).limit(2000)),
  ]);
  const shakyKeys = (checkins ?? [])
    .filter((row) => row.status === "shaky")
    .map((row) => ({ date: asDate(row.checkin_date), subject: row.subject }))
    .filter((row) => row.date && SUBJECTS.has(row.subject));
  let conceptRows = [];
  if (shakyKeys.length) {
    const dates = [...new Set(shakyKeys.map((row) => row.date))];
    conceptRows = await runDb("fetch_shaky_topics", () =>
      db.from("cards").select("card_date,subject,title").in("card_date", dates).eq("section", "concept").limit(400));
  }
  const firstOf = new Map();
  for (const row of conceptRows ?? []) {
    const day = asDate(row.card_date);
    if (day && row.title && !firstOf.has(`${day}|${row.subject}`)) firstOf.set(`${day}|${row.subject}`, row.title);
  }
  const days = [...new Set((calendar ?? []).map((row) => asDate(row.card_date)))].filter(Boolean);
  const today = todayISO();
  const grid = new Map();
  for (const row of checkins ?? []) {
    const key = asDate(row.checkin_date);
    if (!grid.has(key)) grid.set(key, {});
    grid.get(key)[row.subject] = row.status;
  }
  const completed = days.filter((day) => {
    const entry = grid.get(day);
    return entry && entry.physics && entry.math;
  }).length;
  let streak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index];
    if (day > today) continue;
    const entry = grid.get(day) ?? {};
    if (entry.physics && entry.math) streak += 1;
    else if (day !== today) break;
  }
  const topics = new Map();
  for (const row of shakyKeys) {
    const title = firstOf.get(`${row.date}|${row.subject}`);
    if (!title) continue;
    const key = `${row.subject === "physics" ? "物理" : "数学"} · ${title}`;
    topics.set(key, (topics.get(key) ?? 0) + 1);
  }
  const series = days.slice(-14).map((day) => ({
    date: day,
    physics: grid.get(day)?.physics ?? null,
    math: grid.get(day)?.math ?? null,
  }));
  return {
    today,
    days_generated: days.length,
    first_day: days[0] ?? null,
    last_day: days[days.length - 1] ?? null,
    days_completed: completed,
    streak,
    shaky_count: shakyKeys.length,
    weak_topics: [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => ({ label, count })),
    series,
  };
}

/* -------------------------------- http --------------------------------- */

function send(response, status, body, contentType) {
  response.writeHead(status, { "content-type": contentType, "x-content-type-options": "nosniff" });
  response.end(body);
}
function sendJson(response, status, payload) {
  send(response, status, JSON.stringify(payload), "application/json; charset=utf-8");
}
function json404(response) { sendJson(response, 404, { error: "not_found" }); }
function dbUnavailable(response, error, traceId) {
  const info = error instanceof DatabaseOperationError ? error.diagnostic : { category: "unavailable" };
  console.error(`db error trace=${traceId} category=${info.category ?? "unavailable"} code=${info.code ?? "-"} status=${info.status ?? "-"} operation=${info.operation ?? "-"}`);
  sendJson(response, info.category === "schema_mismatch" ? 503 : 503, { error: "database_unavailable", traceId });
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 4096) throw new Error("payload too large");
    chunks.push(chunk);
  }
  if (!size) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleApi(request, response, url) {
  const path = url.pathname;
  const traceId = Math.random().toString(36).slice(2, 10);

  if (path === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return true;
  }
  if (request.method !== "GET" && !(request.method === "POST" && path === "/api/checkin")) {
    response.setHeader("allow", "GET");
    sendJson(response, 405, { error: "method_not_allowed" });
    return true;
  }

  try {
    if (path === "/api/today") { sendJson(response, 200, await loadDay(todayISO())); return true; }
    if (path === "/api/day") {
      const date = validDate(url.searchParams.get("date"));
      if (!date) { sendJson(response, 400, { error: "invalid_date" }); return true; }
      sendJson(response, 200, await loadDay(date));
      return true;
    }
    if (path === "/api/calendar") {
      const db = getDb();
      const [cardRows, checkinRows] = await Promise.all([
        runDb("fetch_calendar", () => db.from("cards").select("card_date,subject").order("card_date", { ascending: true }).limit(800)),
        runDb("fetch_checkins", () => db.from("checkins").select("checkin_date,subject,status").limit(2000)),
      ]);
      const dates = new Map();
      for (const row of cardRows ?? []) {
        const day = asDate(row.card_date);
        if (!day) continue;
        if (!dates.has(day)) dates.set(day, new Set());
        dates.get(day).add(row.subject);
      }
      const marks = new Map();
      for (const row of checkinRows ?? []) {
        const day = asDate(row.checkin_date);
        if (!day || !SUBJECTS.has(row.subject)) continue;
        if (!marks.has(day)) marks.set(day, {});
        marks.get(day)[row.subject] = row.status;
      }
      const first = [...dates.keys()].sort()[0] ?? null;
      sendJson(response, 200, {
        first_day: first,
        today: todayISO(),
        days: [...dates.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, set]) => ({
          date,
          weekday: weekdayOf(date),
          physics: set.has("physics"),
          math: set.has("math"),
          physics_status: marks.get(date)?.physics ?? null,
          math_status: marks.get(date)?.math ?? null,
        })),
      });
      return true;
    }
    if (path === "/api/stats") { sendJson(response, 200, await buildStats()); return true; }
    if (path === "/api/checkin") {
      const body = await readJsonBody(request);
      const date = validDate(body.date) ?? todayISO();
      const { subject, status } = body;
      if (!SUBJECTS.has(subject) || !CHECKIN_STATUS.has(status)) {
        sendJson(response, 400, { error: "invalid_checkin" });
        return true;
      }
      if (date > todayISO()) { sendJson(response, 400, { error: "future_date" }); return true; }
      sendJson(response, 200, { date, subject, status, saved: await saveCheckin(date, subject, status) });
      return true;
    }
    json404(response);
    return true;
  } catch (error) {
    if (error instanceof DatabaseUnavailableError || error instanceof DatabaseOperationError) dbUnavailable(response, error, traceId);
    else if (error instanceof SyntaxError || error?.message === "payload too large") sendJson(response, 400, { error: "invalid_body" });
    else { console.error("api failed", error); sendJson(response, 500, { error: "internal_error", traceId }); }
    return true;
  }
}

function isInsideClientRoot(path) { return path === clientRoot || path.startsWith(clientRootPrefix); }

async function existingFile(path) {
  try {
    const details = await stat(path);
    return details.isFile() ? path : null;
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
    throw error;
  }
}

async function resolveClientFile(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  const relative = decoded.replace(/^\/+/, "") || "index.html";
  const candidate = resolve(clientRoot, relative);
  if (!isInsideClientRoot(candidate)) return null;
  const file = await existingFile(candidate);
  if (file) return file;
  return extname(decoded) ? null : existingFile(indexPath);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://qwenwork.local");
    if (url.pathname === "/healthz") {
      sendJson(response, 200, { status: "ok" });
      return;
    }
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("allow", "GET, HEAD");
      send(response, 405, "Method Not Allowed", "text/plain; charset=utf-8");
      return;
    }
    const file = await resolveClientFile(url.pathname);
    if (!file) { send(response, 404, "Not Found", "text/plain; charset=utf-8"); return; }
    const body = request.method === "HEAD" ? undefined : await readFile(file);
    send(response, 200, body, contentTypes.get(extname(file).toLowerCase()) ?? "application/octet-stream");
  } catch (error) {
    console.error("Request failed", error);
    send(response, 500, "Internal Server Error", "text/plain; charset=utf-8");
  }
});

server.listen(port, host, () => {
  console.log(`QW Page server listening on http://${host}:${port}`);
});

export { shiftDate, diffDays, todayISO };
