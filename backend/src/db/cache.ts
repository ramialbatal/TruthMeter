import Database from 'better-sqlite3'
import { AnalysisResult, Source } from '../types'

export class CacheService {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  private normalizeTweetText(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, ' ')
  }

  get(tweetText: string): AnalysisResult | null {
    const normalized = this.normalizeTweetText(tweetText)

    const stmt = this.db.prepare(`
      SELECT * FROM analyses
      WHERE tweet_text_normalized = ?
      AND datetime(created_at, '+7 days') > datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `)

    const row = stmt.get(normalized) as any

    if (!row) return null

    return {
      id: row.id,
      tweetText: row.tweet_text,
      accuracyScore: row.accuracy_score,
      agreementScore: row.agreement_score,
      disagreementScore: row.disagreement_score,
      summary: row.summary,
      sources: JSON.parse(row.sources) as Source[],
      analyzedAt: row.created_at,
      cached: true,
    }
  }

  set(result: Omit<AnalysisResult, 'cached'>): void {
    const normalized = this.normalizeTweetText(result.tweetText)

    const stmt = this.db.prepare(`
      INSERT INTO analyses (
        id, tweet_text, tweet_text_normalized, accuracy_score,
        agreement_score, disagreement_score, summary, sources
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      result.id,
      result.tweetText,
      normalized,
      result.accuracyScore,
      result.agreementScore,
      result.disagreementScore,
      result.summary,
      JSON.stringify(result.sources)
    )
  }

  getShared(id: string): AnalysisResult | null {
    const stmt = this.db.prepare(`
      SELECT * FROM analyses
      WHERE id = ?
      LIMIT 1
    `)

    const row = stmt.get(id) as any

    if (!row) return null

    return {
      id: row.id,
      tweetText: row.tweet_text,
      accuracyScore: row.accuracy_score,
      agreementScore: row.agreement_score,
      disagreementScore: row.disagreement_score,
      summary: row.summary,
      sources: JSON.parse(row.sources) as Source[],
      analyzedAt: row.created_at,
      cached: false,
    }
  }

  deleteOld(): number {
    const stmt = this.db.prepare(`
      DELETE FROM analyses
      WHERE datetime(created_at, '+7 days') <= datetime('now')
    `)

    const info = stmt.run()
    return info.changes
  }
}
