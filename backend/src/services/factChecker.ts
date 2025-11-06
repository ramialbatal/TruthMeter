import { v4 as uuidv4 } from 'uuid'
import { SerperService } from './serper'
import { OpenAIService } from './openai'
import { CacheService } from '../db/cache'
import { AnalysisResult } from '../types'

export class FactCheckerService {
  constructor(
    private serperService: SerperService,
    private openaiService: OpenAIService,
    private cacheService: CacheService
  ) {}

  /**
   * Extract domain from URL for deduplication
   */
  private getDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  /**
   * Remove duplicate domains from sources
   */
  private deduplicateSources(sources: AnalysisResult['sources']): AnalysisResult['sources'] {
    const seenDomains = new Set<string>()
    const uniqueSources: AnalysisResult['sources'] = []

    for (const source of sources) {
      const domain = this.getDomain(source.url)
      if (!seenDomains.has(domain)) {
        seenDomains.add(domain)
        uniqueSources.push(source)
      }
    }

    return uniqueSources
  }

  async analyzePost(contentText: string): Promise<AnalysisResult> {
    // Check cache first
    const cached = this.cacheService.get(contentText)
    if (cached) {
      console.log('Cache hit for content:', contentText.substring(0, 50))
      return cached
    }

    console.log('Cache miss, performing new analysis...')

    // Search for sources - Serper can get 100 sources in a single fast request!
    console.log('Searching sources with Serper...')
    const sources = await this.serperService.searchForFactCheck(contentText)

    if (sources.length === 0) {
      throw new Error('No sources found for this content. Please try a different query.')
    }

    console.log(`Found ${sources.length} unique sources, analyzing with OpenAI...`)

    // Analyze with OpenAI
    const analysis = await this.openaiService.analyzeFactCheck(contentText, sources)

    // Use the percentages calculated by OpenAI based on ALL sources (not just returned ones)
    let agreementScore = analysis.agreementScore
    let disagreementScore = analysis.disagreementScore
    let neutralScore = analysis.neutralScore

    // Ensure they sum to 100% by adjusting the largest value if needed
    const sum = agreementScore + disagreementScore + neutralScore
    if (sum !== 100 && sum > 0) {
      const diff = parseFloat((100 - sum).toFixed(1))
      if (agreementScore >= disagreementScore && agreementScore >= neutralScore) {
        agreementScore = parseFloat((agreementScore + diff).toFixed(1))
      } else if (disagreementScore >= agreementScore && disagreementScore >= neutralScore) {
        disagreementScore = parseFloat((disagreementScore + diff).toFixed(1))
      } else {
        neutralScore = parseFloat((neutralScore + diff).toFixed(1))
      }
    }

    console.log(`OpenAI analysis based on ${sources.length} sources: Agreement ${agreementScore}%, Disagreement ${disagreementScore}%, Neutral ${neutralScore}%`)

    // OpenAI categorized all sources - now filter by category and deduplicate
    const returnedSources = analysis.sources
    const supporting = returnedSources.filter(s => s.relevance === 'supporting')
    const contradicting = returnedSources.filter(s => s.relevance === 'contradicting')
    const neutral = returnedSources.filter(s => s.relevance === 'neutral')

    // Deduplicate each category (remove duplicate domains)
    const uniqueSupporting = this.deduplicateSources(supporting).slice(0, 10)
    const uniqueContradicting = this.deduplicateSources(contradicting).slice(0, 10)
    const uniqueNeutral = this.deduplicateSources(neutral).slice(0, 10)

    const displaySources = [...uniqueSupporting, ...uniqueContradicting, ...uniqueNeutral]

    console.log(`Displaying unique sources per category: ${uniqueSupporting.length} supporting, ${uniqueContradicting.length} contradicting, ${uniqueNeutral.length} neutral`)
    console.log(`Total unique sources displayed: ${displaySources.length} out of ${sources.length} analyzed`)
    console.log(`Removed ${supporting.length - uniqueSupporting.length + contradicting.length - uniqueContradicting.length + neutral.length - uniqueNeutral.length} duplicate domain sources`)

    // Create result
    const result: AnalysisResult = {
      id: uuidv4(),
      contentText,
      accuracyScore: analysis.accuracyScore,
      agreementScore,
      disagreementScore,
      neutralScore,
      summary: analysis.summary,
      summaryTranslations: analysis.summaryTranslations || {},
      sources: displaySources,
      totalSourcesRetrieved: sources.length,
      analyzedAt: new Date().toISOString(),
      cached: false,
    }

    // Cache the result
    this.cacheService.set(result)
    console.log('Analysis complete and cached')

    return result
  }
}
