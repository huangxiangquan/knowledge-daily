// 仅在沙箱内使用（不进发布产物）：把种子/补充内容写入本页数据库。
// 幂等：内容文件里的 day 是「课程绝对天数」，脚本只插入 day_num > 库内已有最大值 的部分，
// 因此重复运行不会写重，补内容只需往 seed-content-*.mjs 里往后追加几天。
// 用法：SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_INSTANCE_ID=... node scripts/seed.mjs [--force-start 2026-09-19]
import { createClient } from "@supabase/supabase-js";
import { physics } from "./seed-content-physics.mjs";
import { math } from "./seed-content-math.mjs";

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_INSTANCE_ID } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_INSTANCE_ID) {
  console.error("missing local database configuration");
  process.exit(2);
}

const arg = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const forceStart = arg("--force-start");
if (forceStart && !DAY_RE.test(forceStart)) {
  console.error("bad --force-start value");
  process.exit(2);
}
const DAY_MS = 86_400_000;
const dateAfter = (startISO, offset) => new Date(Date.parse(`${startISO}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10);
const dateAdd = (iso, offset) => dateAfter(iso, offset);

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { "X-Instance-ID": SUPABASE_INSTANCE_ID } },
  auth: { persistSession: false, autoRefreshToken: false },
});

const flatten = (subject, days) => days.flatMap((day) => day.blocks.map((block) => ({
  day_num: day.day,
  subject,
  section: block.section,
  position: block.position ?? 1,
  title: block.title ?? "",
  body: block.body ?? "",
  answer: block.answer ?? null,
  terms: block.terms ?? null,
})));

const prepared = [...flatten("physics", physics), ...flatten("math", math)];
const contentMaxDay = Math.max(...prepared.map((row) => row.day_num));

const existing = await db.from("cards").select("day_num,card_date").order("day_num", { ascending: false }).limit(1);
if (existing.error) {
  console.error("read failed:", existing.error.code ?? "unknown");
  process.exit(1);
}
const head = existing.data?.[0];
const maxDay = head ? Number(head.day_num) : 0;
const anchor = head ? String(head.card_date).slice(0, 10) : forceStart ?? "2026-09-19";
if (!head && !DAY_RE.test(anchor)) {
  console.error("anchor date is invalid");
  process.exit(2);
}

const fresh = prepared.filter((row) => row.day_num > maxDay).map((row) => ({
  ...row,
  card_date: maxDay === 0 ? dateAfter(anchor, row.day_num - 1) : dateAdd(anchor, row.day_num - maxDay),
}));

if (!fresh.length) {
  console.log(`nothing to insert：库内已到 Day ${maxDay}，内容文件只到 Day ${contentMaxDay}。想补内容就往 seed-content-*.mjs 往后加天数。`);
  process.exit(0);
}

const span = [...new Set(fresh.map((row) => row.day_num))].sort((a, b) => a - b);
console.log(`库内现有到 Day ${maxDay}；本次追加 Day ${span[0]}–${span[span.length - 1]}（${fresh.length} 个 block，${fresh[0].card_date} 起）`);

for (let index = 0; index < fresh.length; index += 25) {
  const chunk = fresh.slice(index, index + 25);
  const result = await db.from("cards").insert(chunk);
  if (result.error) {
    console.error(`insert chunk ${index / 25 + 1} failed:`, result.error.code ?? "unknown");
    process.exit(1);
  }
  process.stdout.write(`.${chunk.length}`);
}

const coverage = await db.from("cards").select("card_date,subject,day_num").order("card_date", { ascending: true }).limit(1000);
const days = new Map();
for (const row of coverage.data ?? []) {
  const key = `${row.day_num}|${row.card_date}`;
  days.set(key, (days.get(key) ?? new Set()).add(row.subject));
}
console.log(`\n完成：库内 ${days.size} 天，每天双科齐全 = ${[...days.values()].every((set) => set.size === 2)}`);
