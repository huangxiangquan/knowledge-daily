// 数理日报 · ECS 灌内容（幂等：按 (day_num, subject, position) 唯一键 DO NOTHING）
// 用法：DB_URL=postgres://knowledge:***@localhost/knowledge node seed.pg.mjs [--force-start 2026-09-19]
import pg from "pg";
import { physics } from "./seed-content-physics.mjs";
import { math } from "./seed-content-math.mjs";

const url = process.env.DB_URL || process.env.DATABASE_URL;
if (!url) { console.error("DB_URL 未设置"); process.exit(2); }
const i = process.argv.indexOf("--force-start");
const START = i >= 0 ? process.argv[i + 1] : null;
if (START && !/^\d{4}-\d{2}-\d{2}$/.test(START)) { console.error("--force-start 格式应为 YYYY-MM-DD"); process.exit(2); }
const DAY = 86400000;
const at = (iso, off) => new Date(Date.parse(iso + "T00:00:00Z") + off * DAY).toISOString().slice(0, 10);

const flat = (subject, days) => days.flatMap((d) => d.blocks.map((b) => ({
  day_num: d.day, subject, section: b.section, position: b.position ?? 1,
  title: b.title ?? "", body: b.body ?? "", answer: b.answer ?? null, terms: b.terms ?? null,
})));
const rows = [...flat("physics", physics), ...flat("math", math)];

const client = new pg.Client({ connectionString: url });
await client.connect();
const head = await client.query("select coalesce(max(day_num),0) m, max(card_date) last from cards");
function anchorFor(dayNum) {
  const max = Number(head.rows[0].m);
  if (max === 0) return at(START ?? "2026-09-19", dayNum - 1);
  return at(head.rows[0].last, dayNum - max);
}
if (Number(head.rows[0].m) === 0 && !START) { console.error("空库且未给 --force-start，拒绝猜测起始日期"); process.exit(2); }

let n = 0;
for (const r of rows) {
  if (r.day_num <= Number(head.rows[0].m)) continue;
  await client.query(
    `insert into cards (day_num, card_date, subject, section, position, title, body, answer, terms)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (day_num, subject, position) do nothing`,
    [r.day_num, anchorFor(r.day_num), r.subject, r.section, r.position, r.title, r.body, r.answer, r.terms]);
  n++;
}
const counts = await client.query(
  `select count(*) blocks, count(distinct card_date) days, min(card_date) first_day, max(card_date) last_day from cards`);
console.log(`本次插入 ${n} 块；库内 ${counts.rows[0].blocks} 块 / ${counts.rows[0].days} 天 (${counts.rows[0].first_day} → ${counts.rows[0].last_day})`);
await client.end();
