# AGENTS.md

## Project background

一个家庭内部使用的「每日数理卡片站」。唯一的学生是黄少怀（高一，国际班，AP / 美高体系），唯一的管理者是家长黄相全。产品目标不是做在线课程，而是把一件小事做成可持续一年的习惯：每天 12 分钟，物理与数学各一张卡片（概念 → 例题 → 练习），答案默认折叠，先想后看。

业务背景：这是「创业 + 家庭教育」一体化组织的一条主线（另两条是双业务系统的 AI 运营中枢）。站内数据要能在将来支撑间隔重复（1/3/7/21 天重做错题）与周度学习报告，因此内容与打卡必须持久化在数据库中，而不是打包进前端。

目标用户特征：16 岁，用手机访问，每天只看 1 分钟决定要不要学；界面必须像一本讲究的教科书，而不是一个后台系统。

## Product shape

- **Page 类别**：dynamic（Node.js 22 + Vite/React/TS 客户端 + Supabase 兼容库）。选动态的理由：卡片内容入数据库、打卡需要服务端持久化。
- **无账号体系**：平台不支持应用登录，本项目只服务一人，不做登录、不做会话、不做行级权限。链接即入口（发布时通过 Page 访问策略限制为千问/钉钉账号）。
- **核心流程**：打开 → 默认显示「今日」→ 读概念 → 做例题 → 点开折叠解析对照 → 做练习 A/B → 点开答案自评 → 点「学完了」或「有不确定的题」（打卡）。家长用 `?view=parent` 看趋势与薄弱知识点；顶部 14 天日历条可回看任意已生成日期。
- **内容模型**：一行 = 一个 block，按 `day + subject + section + position` 组织。`section` 取值 `concept`（概念）/ `example`（例题）/ `practice`（练习，含 A 基础 + B 变式）。物理与数学各 3–4 个 block 构成一天。
- **打卡模型**：`checkins(checkin_date, subject, status)`，`status` 为 `done`（学完）或 `shaky`（有不确定的题）。按 `(checkin_date, subject)` 唯一约束 upsert。统计口径：`days_completed` 仅计「双科都有打卡」、`streak` 从今天或更早向前连续、`weak_topics` 由 shaky 日期回查该日该科的 `concept` 标题聚合。
- **内容维护（已选定：人工定期补）**：内容绝对天数写在 `scripts/seed-content-physics.mjs` / `seed-content-math.mjs` 的 `day` 字段里；补内容 = 往后加天数，再运行 `node scripts/seed.mjs`。脚本按「库内最大 day_num」增量插入，日期自动续在上一个文件末尾日之后（空库时用 `--force-start`，默认 Day 1 = 2026-09-19），重复运行不写重。平台不允许外部直接 INSERT，因此不做每日自动生成；站点也不开放写入接口。
- **内容现状**：Day 1–14 = 2026-09-19 至 2026-10-02，112 个 block（每天物理/数学各 4 block：1 概念 + 1 例题 + 2 练习；概念 block 无折叠答案，故每天 8 block / 6 个答案）。

- **公式呈现**：不引入 KaTeX。内容用 Unicode（`v₀`、`m/s²`、`θ`、`Δt`、`√`、`½`）+ 受限的轻量标记：`**粗体**`、`` `公式` ``、`- ` 行内列表、`$` 行内术语分隔。客户端有一个极小的格式化器负责渲染。
- **字体策略**：不依赖 Google Fonts（国内访问不稳定）。用本地衬线/无衬线栈营造教科书感，中英混排靠 `Songti SC / Noto Serif CJK / serif` 与 `PingFang SC / Noto Sans CJK / sans-serif` 分级。
- **API 边界**：`GET /api/today`、`GET /api/day?date=YYYY-MM-DD`、`GET /api/calendar`（含每天双科是否有内容与打卡状态）、`POST /api/checkin`（body `{date, subject, status}`；拒绝未来的 date，重复提交按 `(checkin_date, subject)` upsert）、`GET /api/stats`、`GET /api/health` 与发布健康探针 `GET /healthz`。`/api/*` 未匹配路径必须返回 JSON 404，不能被 SPA fallback 吞掉；`/healthz` 与 `/` 不得依赖数据库（发布前门禁要求）。任何接口都不返回数据库连接信息，数据库失败只回 `503 {error:"database_unavailable"}` + 随机 traceId。
- **视觉方向**：坐标纸底纹 + 铅字排版感；主墨色深藏青，物理朱红、数学青绿两个学科强调色；日期以大号衬线作为版面主角；折叠解析带「先自己想 5 分钟」的显式提示。
- **范围边界**：不做判分、不做拍照上传、不做多学生、不做排行、不做视频讲解、不做前端富编辑器。
- **本地校验方式**：`npm run build` 产出 `dist/` 与 `.qw-pages/publish/`；`npm test` 在隔离目录以只读文件系统启动 `server.mjs`。本地连真库跑：注入 `SUPABASE_URL/SUPABASE_ANON_KEY/SUPABASE_INSTANCE_ID` 后 `HOST=0.0.0.0 PORT=3000 node server.mjs`。这三个值属机密，只能注入子进程，不得写入源码、日志或对话。

## Deployment targets（两套并存，别混淆）

1. **平台托管版**：`server.mjs` + Supabase 兼容库（Broker v2 / `SUPABASE_*`），经 `qw-pages` 发布。**当前未发布**（`has_online_artifact=false`），平台库内容是 9-19 起的旧映射，已闲置。
2. **ECS 自托管版（已上线）**：`ecs/server.pg.mjs` + `ecs/ddl.sql` + `ecs/seed.pg.mjs`，装在 `/opt/knowledge`，systemd `knowledge.service` 监听 `0.0.0.0:8080`（安全组已放开 8080），数据是该机 PostgreSQL 16（库 `knowledge`，口令在 `/opt/knowledge/.env`，600）。前端直接复用同一份 `dist/`：API 契约与平台版一致，且是根路径部署，不需要改 base。
   - 实测坑 1：`cards` 唯一键**必须含 `section`**。只按 `(day_num, subject, position)` 会让概念/例题/练习A 互相吞掉，实测丢一半内容（56/112）。
   - 实测坑 2：`node-postgres` 把 `date` 解析成本地 `Date`，`toISOString()` 会平移成前一天。两个入口都设 `pg.types.setTypeParser(1082, v=>v)`，DATE 一律按字符串处理。
   - 已知口子：`/api/checkin` 只拒绝未来日期，历史日期可被任意回填 → 打卡不能当考勤证据；如需可信，得改成服务端签发当日 token。
- **ECS 内容现状**：Day 1 = 2026-09-21 … Day 14 = 2026-10-04，112 block（每天 8 block，其中 6 个带折叠答案），`checkins=0`（我的验证行已删）。补内容 = 改 `scripts/seed-content-*.mjs` 加天数 → 重打包上传 → `node seed.pg.mjs`（唯一键幂等）。
