# knowledge-daily · 数理日报

给黄少怀（高一国际班）的每日物理/数学卡片站。

- 线上地址：http://47.250.151.221:8080/
- 部署：阿里云 ECS，systemd 服务 knowledge.service，Node 18 + PostgreSQL 16
- 更新部署：`cd /opt/knowledge && git pull && systemctl restart knowledge`

## 结构

| 路径 | 说明 |
|---|---|
| `src/` | 前端源码（React 18 + TypeScript + Vite） |
| `server.mjs` | 平台版服务端（千问办公 Page 托管用，Supabase 数据源） |
| `server.pg.mjs` | **自托管后端**（ECS 上实际运行，PostgreSQL） |
| `ddl.sql` | 建表语句 |
| `seed.pg.mjs` | 灌内容脚本（唯一键幂等，可重复跑） |
| `seed-content-physics.mjs` / `seed-content-math.mjs` | **卡片内容**（Day 1–14，AP 体系） |
| `scripts/` | 构建与平台辅助脚本（prepare-publish / seed / schema） |
| `tests/` | 运行时契约测试 |
| `dist/` | 前端构建产物（`npm run build` 生成后由 server.pg.mjs 静态服务） |
| `index.html` / `vite.config.ts` / `tsconfig.json` | 前端构建配置 |

## 补内容

在 `seed-content-{physics,math}.mjs` 里往后追加 `day: 15,16…` 的天，然后：

    cd /opt/knowledge && git pull && node seed.pg.mjs

唯一键 `(day_num, subject, section, position)` 保证重复运行不写重。
**别改已发日期的正文**（学生可能已打卡）。

## 已知坑（别重犯）

1. 唯一键必须含 `section`，否则 `ON CONFLICT` 静默吞掉一半内容（曾实际发生：112 块只剩 56）。
2. `node-postgres` 的 `date` 必须 `setTypeParser(1082, v=>v)`，否则全站日期少一天。
3. 打包部署时注意时间线：kb.tar.gz 曾打包于 bug 修复之前，导致 git 化时旧文件回盖了已修复的线上文件（2026-09-22 已发现并恢复，本仓库当前版本 = 修复版）。
