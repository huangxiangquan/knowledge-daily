// 数理日报 · ECS 自托管服务端（PostgreSQL + pg，无平台 Broker）
// API 契约与平台版一致，因此 dist/ 前端产物原样复用。
// env: DATABASE_URL (postgres://knowledge:***@localhost/knowledge)，PORT，HOST
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 8080);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

const clientRoot = fileURLToPath(new URL("./dist/", import.meta.url));
const rootPrefix = clientRoot.endsWith(sep) ? clientRoot : clientRoot + sep;
const indexPath = resolve(clientRoot, "index.html");
const types = new Map([[".css", "text/css; charset=utf-8"], [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"], [".png", "image/png"], [".ico", "image/x-icon"], [".woff2", "font/woff2"]]);

const SUBS = new Set(["physics", "math"]);
const STATUS = new Set(["done", "shaky"]);
const APP_TZ = "Asia/Shanghai";
const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const todayISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const valid = (v) => (typeof v === "string" && DATE_RE.test(v) ? v : null);
const asDate = (v) => (typeof v === "string" ? v.slice(0, 10) : v);
const weekdayOf = (iso) => (DATE_RE.test(iso) ? WEEK[new Date(iso + "T00:00:00Z").getUTCDay()] : "");
const q = async (text, params) => (await pool.query(text, params)).rows;

async function loadDay(date) {
  const [rows, checks] = await Promise.all([
    q(`select subject,section,position,title,body,answer,terms,day_num from cards where card_date=$1
        order by subject, section, position`, [date]),
    q(`select subject,status from checkins where checkin_date=$1`, [date]),
  ]);
  const subjects = { physics: [], math: [] };
  let dayNum = null;
  for (const r of rows) {
    if (subjects[r.subject]) subjects[r.subject].push({
      subject: r.subject, section: r.section, position: Number(r.position), title: r.title,
      body: r.body, answer: r.answer, terms: r.terms,
    });
    if (dayNum === null && Number.isFinite(+r.day_num)) dayNum = Number(r.day_num);
  }
  const status = { physics: null, math: null };
  for (const c of checks) if (SUBS.has(c.subject)) status[c.subject] = c.status;
  return { date, weekday: weekdayOf(date), day_num: dayNum, subjects, checkins: status };
}

async function buildCalendar() {
  const [cardRows, checkRows] = await Promise.all([
    q("select distinct card_date, subject from cards order by card_date"),
    q("select checkin_date, subject, status from checkins"),
  ]);
  const marks = new Map();
  for (const c of checkRows) {
    const d = asDate(c.checkin_date);
    if (!marks.has(d)) marks.set(d, {});
    marks.get(d)[c.subject] = c.status;
  }
  const byDate = new Map();
  for (const r of cardRows) {
    const d = asDate(r.card_date);
    if (!byDate.has(d)) byDate.set(d, new Set());
    byDate.get(d).add(r.subject);
  }
  const days = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, set]) => ({
    date, weekday: weekdayOf(date), physics: set.has("physics"), math: set.has("math"),
    physics_status: marks.get(date)?.physics ?? null, math_status: marks.get(date)?.math ?? null,
  }));
  return { first_day: days[0]?.date ?? null, today: todayISO(), days };
}

async function buildStats() {
  const cal = await buildCalendar();
  const days = cal.days.map((d) => d.date);
  const grid = new Map(cal.days.map((d) => [d.date, { physics: d.physics_status, math: d.math_status }]));
  const today = todayISO();
  const daysCompleted = days.filter((d) => grid.get(d)?.physics && grid.get(d)?.math).length;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const d = days[i];
    if (d > today) continue;
    const g = grid.get(d) || {};
    if (g.physics && g.math) streak += 1;
    else if (d !== today) break;
  }
  const shaky = cal.days.filter((d) => d.physics_status === "shaky" || d.math_status === "shaky");
  const topics = new Map();
  if (shaky.length) {
    const rows = await q(
      `select card_date, subject, title from cards where section='concept' and card_date = any($1::date[])`,
      [shaky.map((d) => d.date)]);
    const label = new Map(rows.map((r) => [`${asDate(r.card_date)}|${r.subject}`, r.title]));
    for (const d of shaky) for (const s of ["physics", "math"]) {
      if (d[`${s}_status`] !== "shaky") continue;
      const t = label.get(`${d.date}|${s}`);
      if (!t) continue;
      const k = `${s === "physics" ? "物理" : "数学"} · ${t}`;
      topics.set(k, (topics.get(k) ?? 0) + 1);
    }
  }
  const shakyCount = cal.days.reduce((n, d) => n + (d.physics_status === "shaky" ? 1 : 0) + (d.math_status === "shaky" ? 1 : 0), 0);
  return {
    today, days_generated: days.length, first_day: cal.first_day, last_day: days.at(-1) ?? null,
    days_completed: daysCompleted, streak, shaky_count: shakyCount,

    weak_topics: [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => ({ label, count })),
    series: days.slice(-14).map((d) => ({ date: d, physics: grid.get(d)?.physics ?? null, math: grid.get(d)?.math ?? null })),
  };
}

const send = (res, code, body, type) => { res.writeHead(code, { "content-type": type, "x-content-type-options": "nosniff" }); res.end(body); };
const json = (res, code, obj) => send(res, code, JSON.stringify(obj), "application/json; charset=utf-8");

function readBody(req) {
  return new Promise((resolveP, rejectP) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > 8192) { rejectP(new Error("too large")); req.destroy(); } chunks.push(c); });
    req.on("end", () => { try { resolveP(size ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch (e) { rejectP(e); } });
    req.on("error", rejectP);
  });
}

async function api(req, res, url) {
  const p = url.pathname;
  if (p === "/healthz" || p === "/api/health") return json(res, 200, { status: "ok" });
  try {
    if (req.method === "GET" && p === "/api/today") return json(res, 200, await loadDay(todayISO()));
    if (req.method === "GET" && p === "/api/day") {
      const date = valid(url.searchParams.get("date"));
      if (!date) return json(res, 400, { error: "invalid_date" });
      return json(res, 200, await loadDay(date));
    }
    if (req.method === "GET" && p === "/api/calendar") return json(res, 200, await buildCalendar());
    if (req.method === "GET" && p === "/api/stats") return json(res, 200, await buildStats());
    if (req.method === "POST" && p === "/api/checkin") {
      const body = await readBody(req);
      const date = valid(body.date) ?? todayISO();
      if (!SUBS.has(body.subject) || !STATUS.has(body.status)) return json(res, 400, { error: "invalid_checkin" });
      if (date > todayISO()) return json(res, 400, { error: "future_date" });
      const saved = await q(
        `insert into checkins (checkin_date, subject, status, updated_at) values ($1,$2,$3,now())
         on conflict (checkin_date, subject) do update set status=excluded.status, updated_at=now()
         returning checkin_date, subject, status`, [date, body.subject, body.status]);
      return json(res, 200, { date, subject: body.subject, status: body.status, saved });
    }
    if (p.startsWith("/api/")) return json(res, 405, { error: "method_not_allowed" });
    return json(res, 404, { error: "not_found" });
  } catch (error) {
    console.error("api error", error?.code || error?.message);
    return json(res, 503, { error: "database_unavailable" });
  }
}

async function staticFile(pathname) {
  let decoded; try { decoded = decodeURIComponent(pathname); } catch { return null; }
  const rel = decoded.replace(/^\/+/, "") || "index.html";
  const cand = resolve(clientRoot, rel);
  if (cand !== clientRoot && !cand.startsWith(rootPrefix)) return null;
  try { if ((await stat(cand)).isFile()) return cand; } catch { /* fallthrough */ }
  return extname(decoded) ? null : indexPath;
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return void await api(req, res, url);
  const file = await staticFile(url.pathname);
  if (!file) return send(res, 404, "Not Found", "text/plain; charset=utf-8");
  try {
    const body = await readFile(file);
    send(res, 200, body, types.get(extname(file).toLowerCase()) ?? "application/octet-stream");
  } catch { send(res, 500, "Internal Server Error", "text/plain; charset=utf-8"); }
}).listen(port, host, () => console.log(`knowledge listening http://${host}:${port}`));
