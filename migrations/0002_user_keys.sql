CREATE TABLE IF NOT EXISTS user_keys (
  user_id    TEXT NOT NULL PRIMARY KEY,
  wrapped_key TEXT NOT NULL,
  salt        TEXT NOT NULL,
  iv          TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
