# knowledge-daily · 数理日报

给黄少怀（高一国际班）的每日物理/数学卡片站。

- 线上地址：http://47.250.151.221:8080/
- 部署：阿里云 ECS，systemd 服务 knowledge.service，Node 18 + PostgreSQL 16
- 结构：
  - server.pg.mjs — 自托管后端（API + PostgreSQL）
  - ddl.sql — 建表语句
  - seed.pg.mjs — 灌内容脚本（唯一键幂等，可重复跑）
  - seed-content-physics.mjs / seed-content-math.mjs — 卡片内容（Day 1–14，AP 体系）
  - dist/ — 前端构建产物（源码在千问办公平台 Page 仓库）

## 补内容

在 seed-content-{physics,math}.mjs 里往后追加 day: 15,16… 的天，然后：

    cd /opt/knowledge && git pull && node seed.pg.mjs

唯一键 (day_num, subject, section, position) 保证重复运行不写重。
别改已发日期的正文（学生可能已打卡）。

## 已知坑（别重犯）

1. 唯一键必须含 section，否则 ON CONFLICT 静默吞掉一半内容。
2. node-postgres 的 date 必须 setTypeParser(1082, v=>v)，否则全站日期少一天。
