import { v4 as uuidv4 } from 'uuid'
import { TavilyService } from './tavily'
import { OpenAIService } from './openai'
import { CacheService } from '../db/cache'
import { AnalysisResult } from '../types'

export class FactCheckerService {
  constructor(
    private tavilyService: TavilyService,
    private openaiService: OpenAIService,
    private cacheService: CacheService
  ) {}

  async analyzePost(contentText: string): Promise<AnalysisResult> {
    // Check cache first
    const cached = this.cacheService.get(contentText)
    if (cached) {
      console.log('Cache hit for content:', contentText.substring(0, 50))
      return cached
    }

    console.log('Cache miss, performing new analysis...')

    // Search for sources
    console.log('Searching sources with Tavily...')
    const sources = await this.tavilyService.search(contentText, 10)

    if (sources.length === 0) {
      throw new Error('No sources found for this content. Please try a different query.')
    }

    console.log(`Found ${sources.length} sources, analyzing with OpenAI...`)

    // Analyze with OpenAI
    const analysis = await this.openaiService.analyzeFactCheck(contentText, sources)

    // Create result
    const result: AnalysisResult = {
      id: uuidv4(),
      contentText,
      accuracyScore: analysis.accuracyScore,
      agreementScore: analysis.agreementScore,
      disagreementScore: analysis.disagreementScore,
      neutralScore: analysis.neutralScore,
      summary: analysis.summary,
      sources: analysis.sources,
      analyzedAt: new Date().toISOString(),
      cached: false,
    }

    // Cache the result
    this.cacheService.set(result)
    console.log('Analysis complete and cached')

    return result
  }
}
