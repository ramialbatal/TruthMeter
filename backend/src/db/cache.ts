import Database from 'better-sqlite3'
import { AnalysisResult, Source } from '../types'

export class CacheService {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  private normalizeContentText(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, ' ')
  }

  get(contentText: string): AnalysisResult | null {
    const normalized = this.normalizeContentText(contentText)

    const stmt = this.db.prepare(`
      SELECT * FROM analyses
      WHERE content_text_normalized = ?
      AND datetime(created_at, '+7 days') > datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `)

    const row = stmt.get(normalized) as any

    if (!row) return null

    return {
      id: row.id,
      contentText: row.content_text,
      accuracyScore: row.accuracy_score,
      agreementScore: row.agreement_score,
      disagreementScore: row.disagreement_score,
      neutralScore: row.neutral_score || 0,
      summary: row.summary,
      sources: JSON.parse(row.sources) as Source[],
      totalSourcesRetrieved: row.total_sources_retrieved || 10,
      analyzedAt: row.created_at,
      cached: true,
    }
  }

  set(result: Omit<AnalysisResult, 'cached'>): void {
    const normalized = this.normalizeContentText(result.contentText)

    const stmt = this.db.prepare(`
      INSERT INTO analyses (
        id, content_text, content_text_normalized, accuracy_score,
        agreement_score, disagreement_score, neutral_score, summary, sources, total_sources_retrieved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      result.id,
      result.contentText,
      normalized,
      result.accuracyScore,
      result.agreementScore,
      result.disagreementScore,
      result.neutralScore,
      result.summary,
      JSON.stringify(result.sources),
      result.totalSourcesRetrieved
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
      contentText: row.content_text,
      accuracyScore: row.accuracy_score,
      agreementScore: row.agreement_score,
      disagreementScore: row.disagreement_score,
      neutralScore: row.neutral_score || 0,
      summary: row.summary,
      sources: JSON.parse(row.sources) as Source[],
      totalSourcesRetrieved: row.total_sources_retrieved || 10,
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
