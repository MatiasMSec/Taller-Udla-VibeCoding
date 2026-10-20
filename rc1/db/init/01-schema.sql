CREATE TABLE actors (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'coordinator')),
  password_hash TEXT NOT NULL
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  campus TEXT NOT NULL,
  place TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  coordinator_id TEXT REFERENCES actors (id),
  coordinator_label TEXT NOT NULL
);

CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES activities (id),
  student_id TEXT NOT NULL REFERENCES actors (id),
  status TEXT NOT NULL CHECK (status IN ('confirmada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, student_id)
);
