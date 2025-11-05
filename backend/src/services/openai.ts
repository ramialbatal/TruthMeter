import OpenAI from 'openai'
import { ClaudeAnalysis, TavilySearchResult } from '../types'

export class OpenAIService {
  private client: OpenAI

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required')
    }
    this.client = new OpenAI({ apiKey })
  }

  /**
   * Sanitize JSON string by removing problematic patterns
   */
  private sanitizeJsonString(jsonStr: string): string {
    // Try to extract JSON object if wrapped in markdown code blocks
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }
    return jsonStr
  }

  /**
   * Normalize percentages to ensure they sum to exactly 100% with one decimal place
   */
  private normalizePercentages(agreement: number, disagreement: number, neutral: number): {
    agreementScore: number
    disagreementScore: number
    neutralScore: number
  } {
    // Round to one decimal place
    let total = agreement + disagreement + neutral

    // Calculate percentages that sum to 100
    let agreementScore = parseFloat(((agreement / total) * 100).toFixed(1))
    let disagreementScore = parseFloat(((disagreement / total) * 100).toFixed(1))
    let neutralScore = parseFloat(((neutral / total) * 100).toFixed(1))

    // Check if they sum to 100
    let sum = agreementScore + disagreementScore + neutralScore

    // Adjust the largest value to make the sum exactly 100
    if (sum !== 100) {
      const diff = parseFloat((100 - sum).toFixed(1))

      // Find the largest score and adjust it
      if (agreementScore >= disagreementScore && agreementScore >= neutralScore) {
        agreementScore = parseFloat((agreementScore + diff).toFixed(1))
      } else if (disagreementScore >= agreementScore && disagreementScore >= neutralScore) {
        disagreementScore = parseFloat((disagreementScore + diff).toFixed(1))
      } else {
        neutralScore = parseFloat((neutralScore + diff).toFixed(1))
      }
    }

    return { agreementScore, disagreementScore, neutralScore }
  }

  /**
   * Filter and rank sources to keep top 3 per category based on credibility score
   */
  private filterTopSources(sources: ClaudeAnalysis['sources']): ClaudeAnalysis['sources'] {
    // Group sources by relevance
    const supporting = sources.filter(s => s.relevance === 'supporting')
    const contradicting = sources.filter(s => s.relevance === 'contradicting')
    const neutral = sources.filter(s => s.relevance === 'neutral')

    // Sort each group by score (highest first) and take top 3
    const topSupporting = supporting.sort((a, b) => b.score - a.score).slice(0, 3)
    const topContradicting = contradicting.sort((a, b) => b.score - a.score).slice(0, 3)
    const topNeutral = neutral.sort((a, b) => b.score - a.score).slice(0, 3)

    // Combine and return
    return [...topSupporting, ...topContradicting, ...topNeutral]
  }

  /**
   * Categorize a batch of sources in parallel
   */
  private async categorizeBatch(
    contentText: string,
    sources: TavilySearchResult[],
    batchNumber: number
  ): Promise<{ sources: { url: string; title: string; relevance: 'supporting' | 'contradicting' | 'neutral' }[] }> {
    const sourcesText = sources
      .map(
        (source, idx) =>
          `${idx + 1}. ${source.title}
URL: ${source.url}
Content: ${source.content.substring(0, 200)}...
`
      )
      .join('\n')

    const prompt = `You are a fact-checking assistant. Categorize each of these ${sources.length} sources based on the claim.

Claim: "${contentText}"

Sources (batch ${batchNumber}):
${sourcesText}

For each source, determine if it is:
- "supporting": The source supports or agrees with the claim
- "contradicting": The source contradicts or disagrees with the claim
- "neutral": The source is neutral, unrelated, or provides mixed information

Respond with JSON:
{
  "sources": [
    {
      "url": "<exact source url>",
      "title": "<exact source title>",
      "relevance": "supporting" | "contradicting" | "neutral"
    }
  ]
}

Return ALL ${sources.length} sources with their categorization. Respond with valid JSON only.`

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a fact-checking assistant. Respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    const sanitizedResponse = this.sanitizeJsonString(responseText)
    const result = JSON.parse(sanitizedResponse)

    return result
  }

  async analyzeFactCheck(
    contentText: string,
    sources: TavilySearchResult[]
  ): Promise<ClaudeAnalysis> {
    try {
      console.log(`Analyzing ${sources.length} sources in parallel batches...`)

      // Split sources into 5 batches
      const batchSize = Math.ceil(sources.length / 5)
      const batches: TavilySearchResult[][] = []
      for (let i = 0; i < sources.length; i += batchSize) {
        batches.push(sources.slice(i, i + batchSize))
      }

      console.log(`Split into ${batches.length} batches of ~${batchSize} sources each`)

      // Process all batches in parallel
      const batchPromises = batches.map((batch, index) =>
        this.categorizeBatch(contentText, batch, index + 1)
      )

      const batchResults = await Promise.all(batchPromises)
      console.log(`Completed ${batchResults.length} parallel categorizations`)

      // Combine all categorized sources
      const allCategorizedSources = batchResults.flatMap(result => result.sources)
      console.log(`Total categorized sources: ${allCategorizedSources.length}`)

      // Calculate percentages
      const supportingCount = allCategorizedSources.filter(s => s.relevance === 'supporting').length
      const contradictingCount = allCategorizedSources.filter(s => s.relevance === 'contradicting').length
      const neutralCount = allCategorizedSources.filter(s => s.relevance === 'neutral').length

      const total = allCategorizedSources.length
      const agreementScore = parseFloat(((supportingCount / total) * 100).toFixed(1))
      const disagreementScore = parseFloat(((contradictingCount / total) * 100).toFixed(1))
      let neutralScore = parseFloat(((neutralCount / total) * 100).toFixed(1))

      // Ensure they sum to 100
      const sum = agreementScore + disagreementScore + neutralScore
      if (sum !== 100) {
        neutralScore = parseFloat((neutralScore + (100 - sum)).toFixed(1))
      }

      console.log(`Categorization: ${supportingCount} supporting, ${contradictingCount} contradicting, ${neutralCount} neutral`)

      // Generate summary with a separate quick call
      const summaryPrompt = `Based on fact-checking analysis: The claim "${contentText}" was analyzed against ${total} sources. ${supportingCount} sources support it (${agreementScore}%), ${contradictingCount} contradict it (${disagreementScore}%), and ${neutralCount} are neutral (${neutralScore}%). Write a brief 2-3 sentence summary of these findings and provide an accuracy score (0-100).

Respond with JSON:
{
  "accuracyScore": <number 0-100>,
  "summary": "<2-3 sentence summary>"
}`

      const summaryCompletion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a fact-checking assistant. Respond with valid JSON only.' },
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      const summaryText = summaryCompletion.choices[0]?.message?.content
      const summaryData = summaryText ? JSON.parse(summaryText) : { accuracyScore: 50, summary: 'Analysis completed.' }

      // Translate summary to all languages in one call
      console.log('Translating summary to all languages...')
      const translationPrompt = `Translate this fact-checking summary to the following 13 languages. Keep translations concise and accurate.

Summary in English: "${summaryData.summary}"

Provide translations in JSON format:
{
  "ar": "Arabic translation",
  "fr": "French translation",
  "tr": "Turkish translation",
  "fa": "Farsi translation",
  "ur": "Urdu translation",
  "hi": "Hindi translation",
  "es": "Spanish translation",
  "de": "German translation",
  "pt": "Portuguese translation",
  "ja": "Japanese translation",
  "zh": "Chinese translation",
  "it": "Italian translation",
  "sv": "Swedish translation"
}

Respond with valid JSON only.`

      const translationCompletion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional translator. Respond with valid JSON only.' },
          { role: 'user', content: translationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      })

      const translationText = translationCompletion.choices[0]?.message?.content
      const summaryTranslations = translationText ? JSON.parse(translationText) : {}
      console.log(`Summary translated to ${Object.keys(summaryTranslations).length} languages`)

      return {
        accuracyScore: parseFloat(summaryData.accuracyScore.toFixed(1)),
        agreementScore,
        disagreementScore,
        neutralScore,
        summary: summaryData.summary,
        summaryTranslations,
        sources: allCategorizedSources,
      }
    } catch (error) {
      console.error('OpenAI analysis error:', error)
      throw new Error('Failed to analyze content with AI. Please try again.')
    }
  }
}
