export const DDL = `
CREATE TABLE IF NOT EXISTS cards (
  id bigserial PRIMARY KEY,
  day_num smallint NOT NULL,
  card_date date NOT NULL,
  subject text NOT NULL CHECK (subject IN ('physics', 'math')),
  section text NOT NULL CHECK (section IN ('concept', 'example', 'practice')),
  position smallint NOT NULL DEFAULT 1,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  answer text,
  terms text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cards_date_subject_position_idx
  ON cards (card_date, subject, section, position);
CREATE INDEX IF NOT EXISTS cards_day_num_idx ON cards (day_num);

CREATE TABLE IF NOT EXISTS checkins (
  id bigserial PRIMARY KEY,
  checkin_date date NOT NULL,
  subject text NOT NULL CHECK (subject IN ('physics', 'math')),
  status text NOT NULL CHECK (status IN ('done', 'shaky')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checkins_date_subject_key UNIQUE (checkin_date, subject)
);
`;
