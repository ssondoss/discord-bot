// displayName is UNIQUE in every table so we can do O(1) lookups by name
// and prevent accidental duplicates without extra application-level checks.

export const CREATE_MEMES_TABLE = `
  CREATE TABLE IF NOT EXISTS memes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    displayName TEXT    NOT NULL UNIQUE,
    filename    TEXT    NOT NULL,
    filePath    TEXT    NOT NULL,
    mimeType    TEXT    NOT NULL,
    uploadedAt  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`;

export const CREATE_SOUNDS_TABLE = `
  CREATE TABLE IF NOT EXISTS sounds (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    displayName TEXT    NOT NULL UNIQUE,
    filename    TEXT    NOT NULL,
    filePath    TEXT    NOT NULL,
    mimeType    TEXT    NOT NULL,
    uploadedAt  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`;

export const CREATE_STREAM_URLS_TABLE = `
  CREATE TABLE IF NOT EXISTS stream_urls (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    displayName TEXT    NOT NULL UNIQUE,
    url         TEXT    NOT NULL,
    createdAt   TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`;
