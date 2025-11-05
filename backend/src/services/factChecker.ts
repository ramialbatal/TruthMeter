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

  async analyzePost(tweetText: string): Promise<AnalysisResult> {
    // Check cache first
    const cached = this.cacheService.get(tweetText)
    if (cached) {
      console.log('Cache hit for tweet:', tweetText.substring(0, 50))
      return cached
    }

    console.log('Cache miss, performing new analysis...')

    // Search for sources
    console.log('Searching sources with Tavily...')
    const sources = await this.tavilyService.search(tweetText, 10)

    if (sources.length === 0) {
      throw new Error('No sources found for this tweet. Please try a different query.')
    }

    console.log(`Found ${sources.length} sources, analyzing with OpenAI...`)

    // Analyze with OpenAI
    const analysis = await this.openaiService.analyzeFactCheck(tweetText, sources)

    // Create result
    const result: AnalysisResult = {
      id: uuidv4(),
      tweetText,
      accuracyScore: analysis.accuracyScore,
      agreementScore: analysis.agreementScore,
      disagreementScore: analysis.disagreementScore,
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
