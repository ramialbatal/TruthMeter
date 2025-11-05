import Database from 'better-sqlite3'

export function initializeDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath)

  // Create analyses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      content_text TEXT NOT NULL,
      content_text_normalized TEXT NOT NULL,
      accuracy_score INTEGER NOT NULL,
      agreement_score INTEGER NOT NULL,
      disagreement_score INTEGER NOT NULL,
      neutral_score INTEGER NOT NULL DEFAULT 0,
      summary TEXT NOT NULL,
      sources TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add neutral_score column to existing tables (migration)
  try {
    db.exec(`ALTER TABLE analyses ADD COLUMN neutral_score INTEGER NOT NULL DEFAULT 0`)
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add total_sources_retrieved column to existing tables (migration)
  try {
    db.exec(`ALTER TABLE analyses ADD COLUMN total_sources_retrieved INTEGER NOT NULL DEFAULT 10`)
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add summary_translations column to existing tables (migration)
  try {
    db.exec(`ALTER TABLE analyses ADD COLUMN summary_translations TEXT`)
  } catch (error) {
    // Column already exists, ignore error
  }

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_content_text_normalized
    ON analyses(content_text_normalized)
  `)

  return db
}
