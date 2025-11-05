import Database from 'better-sqlite3'

export function initializeDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath)

  // Create analyses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      tweet_text TEXT NOT NULL,
      tweet_text_normalized TEXT NOT NULL,
      accuracy_score INTEGER NOT NULL,
      agreement_score INTEGER NOT NULL,
      disagreement_score INTEGER NOT NULL,
      summary TEXT NOT NULL,
      sources TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tweet_text_normalized
    ON analyses(tweet_text_normalized)
  `)

  return db
}
