-- 数理日报 · ECS 自托管版 schema（PostgreSQL 16，本机 socket，不对公网监听）
-- 与平台版（Supabase 兼容 REST）字段完全一致，因此前端 dist/ 可以原样复用。
CREATE TABLE IF NOT EXISTS cards (
  id           bigserial PRIMARY KEY,
  day_num      smallint     NOT NULL,
  card_date    date         NOT NULL,
  subject      text         NOT NULL CHECK (subject IN ('physics','math')),
  section      text         NOT NULL CHECK (section IN ('concept','example','practice')),
  position     smallint     NOT NULL DEFAULT 1,
  title        text         NOT NULL DEFAULT '',
  body         text         NOT NULL DEFAULT '',
  answer       text,
  terms        text,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS cards_day_subject_position_uq ON cards (day_num, subject, position);
CREATE INDEX IF NOT EXISTS cards_date_subject_idx ON cards (card_date, subject, section, position);

CREATE TABLE IF NOT EXISTS checkins (
  id           bigserial PRIMARY KEY,
  checkin_date date        NOT NULL,
  subject      text        NOT NULL CHECK (subject IN ('physics','math')),
  status       text        NOT NULL CHECK (status IN ('done','shaky')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checkins_date_subject_key UNIQUE (checkin_date, subject)
);
