import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

type Subject = "physics" | "math";
type Section = "concept" | "example" | "practice";
type CheckinStatus = "done" | "shaky";

interface Block {
  subject: Subject;
  section: Section;
  position: number;
  title: string;
  body: string;
  answer: string | null;
  terms: string | null;
}

interface DayPayload {
  date: string;
  weekday: string;
  day_num: number | null;
  subjects: Record<Subject, Block[]>;
  checkins: Record<Subject, CheckinStatus | null>;
}

interface CalendarDay {
  date: string;
  weekday: string;
  physics: boolean;
  math: boolean;
  physics_status: CheckinStatus | null;
  math_status: CheckinStatus | null;
}

interface CalendarPayload {
  first_day: string | null;
  today: string;
  days: CalendarDay[];
}

interface StatsPayload {
  today: string;
  days_generated: number;
  first_day: string | null;
  last_day: string | null;
  days_completed: number;
  streak: number;
  shaky_count: number;
  weak_topics: { label: string; count: number }[];
  series: { date: string; physics: CheckinStatus | null; math: CheckinStatus | null }[];
}

const SUBJECTS: { key: Subject; zh: string; en: string }[] = [
  { key: "physics", zh: "物理", en: "AP Physics 1" },
  { key: "math", zh: "数学", en: "AP Precalculus" },
];

const SECTION_LABEL: Record<Section, string> = {
  concept: "今日概念",
  example: "例题",
  practice: "练习",
};

const REVEAL_LABEL: Record<Section, string> = {
  concept: "",
  example: "看分步解析",
  practice: "做完再看答案",
};

const REVEAL_HINT: Record<Section, string> = {
  concept: "",
  example: "先自己写一遍，再对照步骤找丢分点",
  practice: "卡住 5 分钟以上才允许打开",
};

/* ------------------------------ rich text ------------------------------- */

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

function inlineNodes(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  TOKEN.lastIndex = 0;
  for (let match = TOKEN.exec(text); match; match = TOKEN.exec(text)) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      out.push(<strong key={`${keyBase}-b${index}`}>{token.slice(2, -2)}</strong>);
    } else {
      out.push(<code key={`${keyBase}-c${index}`}>{token.slice(1, -1)}</code>);
    }
    cursor = match.index + token.length;
    index += 1;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function Prose({ text }: { text: string }) {
  const nodes = useMemo(() => {
    const lines = (text ?? "").split("\n");
    const blocks: ReactNode[] = [];
    let list: string[] = [];
    const flush = (key: string) => {
      if (!list.length) return;
      const items = list;
      blocks.push(
        <ul key={key}>
          {items.map((item, i) => (
            <li key={i}>{inlineNodes(item, `${key}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    };
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ")) {
        list.push(trimmed.slice(2));
        return;
      }
      flush(`ul-${i}`);
      if (!trimmed) return;
      blocks.push(<p key={`p-${i}`}>{inlineNodes(trimmed, `p-${i}`)}</p>);
    });
    flush("ul-tail");
    return blocks;
  }, [text]);
  return <div className="prose">{nodes}</div>;
}

/* -------------------------------- helpers ------------------------------- */

const fmtCN = (iso: string | null) => (iso ? iso.replace(/-/g, "").replace(/^(\d{4})(\d{2})(\d{2})$/, (_all, y, m, d) => `${Number(m)} 月 ${Number(d)} 日 · ${y}`) : "—");
const dayOfMonth = (iso: string) => Number(iso.slice(8, 10));

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(String((payload as { error?: string }).error ?? response.status));
    (error as Error & { code?: string }).code = String((payload as { error?: string }).error ?? "request_failed");
    throw error;
  }
  return payload as T;
}

/* --------------------------------- app ---------------------------------- */

export function App() {
  const initialDate = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("date");
    return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
  }, []);
  const wantParent = useMemo(() => new URLSearchParams(window.location.search).get("view") === "parent", []);

  const [calendar, setCalendar] = useState<CalendarPayload | null>(null);
  const [date, setDate] = useState<string | null>(initialDate);
  const [day, setDay] = useState<DayPayload | null>(null);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [view, setView] = useState<"day" | "parent">(wantParent ? "parent" : "day");
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    try {
      const payload = await getJson<CalendarPayload>("/api/calendar");
      setCalendar(payload);
      setDate((current) => current ?? (payload.days.some((row) => row.date === payload.today) ? payload.today : payload.days.at(-1)?.date ?? payload.today));
      return payload;
    } catch (error) {
      setLoadError(codeOf(error));
      return null;
    }
  }, []);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    if (!date) return;
    let active = true;
    setDay(null);
    setNotice(null);
    getJson<DayPayload>(`/api/day?date=${date}`)
      .then((payload) => {
        if (!active) return;
        setLoadError(null);
        setDay(payload);
        const total = payload.subjects.physics.length + payload.subjects.math.length;
        if (!total) {
          setNotice("这一天的卡片还没生成。用上方日期条回看已经发布的日子。");
        }
      })
      .catch((error) => {
        if (active) setLoadError(codeOf(error));
      });
    return () => {
      active = false;
    };
  }, [date]);

  useEffect(() => {
    if (view !== "parent") return;
    getJson<StatsPayload>("/api/stats").then(setStats).catch((error) => setLoadError(codeOf(error)));
  }, [view, date]);

  const checkIn = async (subject: Subject, status: CheckinStatus) => {
    if (!day) return;
    const key = `${subject}:${status}`;
    setPending(key);
    try {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date: day.date, subject, status }),
      });
      const fresh = await getJson<DayPayload>(`/api/day?date=${day.date}`);
      setDay(fresh);
      const payload = await getJson<CalendarPayload>("/api/calendar");
      setCalendar(payload);
    } catch (error) {
      setNotice(`打卡没存上（${codeOf(error)}），再点一次试试。`);
    } finally {
      setPending(null);
    }
  };

  const shift = (delta: number) => {
    if (!date) return;
    const next = new Date(Date.parse(`${date}T00:00:00Z`) + delta * 86_400_000).toISOString().slice(0, 10);
    setDate(next);
  };

  const available = calendar?.days ?? [];
  const hasToday = !!calendar && available.some((row) => row.date === calendar.today);

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead__top">
          <p className="brand">
            数理日报 <b>DAILY PHYSICS &amp; MATH</b> · 高一 · 国际课程
          </p>
          <div className="viewswitch" role="group" aria-label="视图切换">
            <button type="button" aria-pressed={view === "day"} onClick={() => setView("day")}>今日卡片</button>
            <button type="button" aria-pressed={view === "parent"} onClick={() => setView("parent")}>学习报告</button>
          </div>
        </div>

        <div className="dateline">
          <h1 className="dateline__big">{fmtCN(date)}</h1>
          <div className="dateline__meta">
            <span className="pill pill--day">DAY {day?.day_num ?? "--"}{calendar?.first_day ? ` / 自 ${calendar.first_day.slice(5)} 起` : ""}</span>
            {stats ? <span className="pill pill--streak">连续 {stats.streak} 天</span> : null}
            {date && date === calendar?.today ? <span className="pill pill--today">今天</span> : null}
          </div>
          <div className="dateline__meta" style={{ marginLeft: "auto" }}>
            <button type="button" className="pill" onClick={() => shift(-1)} aria-label="前一天">← 前一天</button>
            <button type="button" className="pill" onClick={() => shift(1)} aria-label="后一天">后一天 →</button>
          </div>
        </div>

        <nav className="strip" aria-label="日期">
          {available.map((row) => (
            <button
              key={row.date}
              type="button"
              onClick={() => setDate(row.date)}
              aria-current={row.date === date ? "true" : undefined}
              title={`${row.date} ${row.weekday}`}
            >
              <span className="strip__dow">{row.weekday}</span>
              <span className="strip__num">{dayOfMonth(row.date)}</span>
              <span className="strip__marks">
                <span className="strip__mark" data-s="physics" data-v={row.physics_status ?? (row.physics ? "empty" : "none")} />
                <span className="strip__mark" data-s="math" data-v={row.math_status ?? (row.math ? "empty" : "none")} />
              </span>
            </button>
          ))}
          {!available.length && loadError ? <p className="strip__dow">暂时取不到日期列表</p> : null}
        </nav>
      </header>

      {loadError ? (
        <div className="notice notice--error">
          <b>服务暂时连不上</b>
          <p style={{ marginTop: "0.5rem" }}>原因代码：{loadError}。刷新页面试一次；如果一直如此，让爸爸检查后台服务。</p>
        </div>
      ) : null}

      {notice && !loadError ? <div className="notice" style={{ marginBottom: "1.1rem" }}>{notice}</div> : null}

      {view === "day" && day && !loadError ? (
        <main className="board">
          {SUBJECTS.map(({ key, zh, en }) => {
            const blocks = day.subjects[key] ?? [];
            const status = day.checkins[key];
            return (
              <section key={key} className={`subject subject--${key}`}>
                <div className="subject__head">
                  <h2 className="subject__name">{zh}</h2>
                  <span className="subject__en">{en}</span>
                </div>
                <div className="subject__body">
                  {!blocks.length ? <p className="prose" style={{ color: "var(--ink-soft)" }}>这一天没有{zh}卡片。</p> : null}
                  {blocks.map((block, index) => (
                    <article key={`${block.section}-${block.position}`} className={`block block--${block.section} block--${key}`} style={{ animationDelay: `${index * 45}ms` }}>
                      <p className="block__label">
                        {SECTION_LABEL[block.section]}
                        {block.section === "practice" ? ` ${String.fromCharCode(65 + index)}` : ""}
                      </p>
                      {block.title ? <h3 className="block__title">{block.title}</h3> : null}
                      {block.terms ? (
                        <ul className="terms">
                          {block.terms.split("·").map((term) => (
                            <li key={term}>{term.trim()}</li>
                          ))}
                        </ul>
                      ) : null}
                      <Prose text={block.body} />
                      {block.answer ? (
                        <details className="reveal">
                          <summary>
                            <span>
                              {REVEAL_LABEL[block.section]}
                              <span className="reveal__hint" style={{ display: "block", marginTop: "0.15rem" }}>{REVEAL_HINT[block.section]}</span>
                            </span>
                          </summary>
                          <div className="reveal__inner"><Prose text={block.answer} /></div>
                        </details>
                      ) : null}
                    </article>
                  ))}
                </div>
                <div className="checkin">
                  <span className="checkin__state" data-v={status ?? undefined}>
                    {status === "done" ? "已记：学完了" : status === "shaky" ? "已记：有不确定的题" : "未记录"}
                  </span>
                  <div className="checkin__actions">
                    <button
                      type="button"
                      disabled={!!pending || !day.date}
                      className={status === "done" ? "is-active" : undefined}
                      onClick={() => void checkIn(key, "done")}
                    >
                      学完了
                    </button>
                    <button
                      type="button"
                      disabled={!!pending || date === calendar?.today && false}
                      className={status === "shaky" ? "is-active" : undefined}
                      onClick={() => void checkIn(key, "shaky")}
                    >
                      有不确定的题
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </main>
      ) : null}

      {view === "parent" ? (
        <main>
          <section className="panel">
            <h2 className="panel__title">学习报告</h2>
            {stats ? (
              <>
                <div className="metrics">
                  <div className="metric"><div className="metric__k">已生成</div><div className="metric__v">{stats.days_generated}</div><div className="metric__k">天卡片</div></div>
                  <div className="metric"><div className="metric__k">双科打卡</div><div className="metric__v">{stats.days_completed}</div><div className="metric__k">天完成</div></div>
                  <div className="metric"><div className="metric__k">连续</div><div className="metric__v">{stats.streak}</div><div className="metric__k">天</div></div>
                  <div className="metric"><div className="metric__k">标记不确定</div><div className="metric__v">{stats.shaky_count}</div><div className="metric__k">次</div></div>
                </div>
                <p className="panel__title" style={{ fontSize: "1.05rem", margin: "1.2rem 0 0.5rem" }}>近 14 天（每格为一天：上物理 / 下数学）</p>
                <div className="grid14">
                  {(stats.series ?? []).map((row) => (
                    <div key={row.date} className="cell" style={{ display: "grid", gap: "0.1rem" }}>
                      <span data-v={row.physics ?? "none"} style={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", background: tone(row.physics, "physics") }} />
                      <span data-v={row.math ?? "none"} style={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", background: tone(row.math, "math") }} />
                      <span>{Number(row.date.slice(8, 10))}</span>
                    </div>
                  ))}
                </div>
                <p className="panel__title" style={{ fontSize: "1.05rem", margin: "1.2rem 0 0.2rem" }}>被标记不确定的知识点</p>
                {stats.weak_topics.length ? (
                  <ol className="topics">
                    {stats.weak_topics.map((topic) => (
                      <li key={topic.label}>{topic.label} <code>×{topic.count}</code></li>
                    ))}
                  </ol>
                ) : (
                  <p className="prose" style={{ color: "var(--ink-soft)" }}>还没有「不确定」标记。等他点了那个按钮，这里才会长出薄弱点清单。</p>
                )}
                <p className="prose" style={{ marginTop: "1.1rem", color: "var(--ink-soft)" }}>
                  数据起于 {stats.first_day ?? "—"}，最新一天 {stats.last_day ?? "—"}{hasToday ? "（今天已有卡片）" : "（今天的卡片还没生成）"}。
                </p>
              </>
            ) : (
              <p className="prose">正在读取统计…</p>
            )}
          </section>
        </main>
      ) : null}

      <footer className="footnote">
        概念 → 例题（对照分步解析）→ 练习 A/B（做完再看答案）→ 点一次打卡。物理约 6 分钟，数学约 6 分钟。
        <br />
        答案不自动判分，是为了让他自己发现错在哪一步。
      </footer>
    </div>
  );
}

function tone(status: CheckinStatus | null, subject: Subject) {
  if (status === "done") return subject === "physics" ? "var(--physics)" : "var(--math)";
  if (status === "shaky") return "var(--warn)";
  return "rgba(24,34,48,0.12)";
}

function codeOf(error: unknown) {
  const code = (error as { code?: string } | undefined)?.code;
  if (code === "database_unavailable") return "数据库暂时不可用";
  if (code === "not_found") return "没有找到内容";
  return code ?? "网络或脚本异常";
}
