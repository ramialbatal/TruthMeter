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

  async analyzeFactCheck(
    contentText: string,
    sources: TavilySearchResult[]
  ): Promise<ClaudeAnalysis> {
    try {
      const sourcesText = sources
        .map(
          (source, idx) =>
            `Source ${idx + 1}:
Title: ${source.title}
URL: ${source.url}
Content: ${source.content.substring(0, 500)}...
`
        )
        .join('\n')

      const prompt = `You are a fact-checking assistant. Analyze the provided content against credible sources and determine its factual accuracy.

Content to analyze:
"${contentText}"

Sources found:
${sourcesText}

Please analyze the content and provide your response in the following JSON format:
{
  "accuracyScore": <number 0-100>,
  "agreementScore": <number 0-100>,
  "disagreementScore": <number 0-100>,
  "neutralScore": <number 0-100>,
  "summary": "<concise explanation of findings>",
  "sources": [
    {
      "url": "<source url>",
      "title": "<source title>",
      "snippet": "<relevant excerpt from source>",
      "relevance": "supporting" | "contradicting" | "neutral"
    }
  ]
}

Guidelines:
- accuracyScore: 0-100, where 100 means completely accurate, 0 means completely false
- agreementScore: (number of supporting sources / total sources) × 100 (use decimal precision)
- disagreementScore: (number of contradicting sources / total sources) × 100 (use decimal precision)
- neutralScore: (number of neutral sources / total sources) × 100 (use decimal precision)
- IMPORTANT: agreementScore + disagreementScore + neutralScore must equal 100
- Use floating point numbers with decimal precision for all percentage scores
- summary: Brief explanation of your findings (2-3 sentences)
- sources: List each source with its relevance to the claim (supporting/contradicting/neutral)
- Only include sources that are relevant to the claim
- Be objective and cite specific information from sources

Respond with ONLY the JSON object, no additional text.`

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a fact-checking assistant that provides accurate, unbiased analysis. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      })

      const responseText = completion.choices[0]?.message?.content
      if (!responseText) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      const analysis: ClaudeAnalysis = JSON.parse(responseText)

      // Validate the response
      if (
        typeof analysis.accuracyScore !== 'number' ||
        typeof analysis.agreementScore !== 'number' ||
        typeof analysis.disagreementScore !== 'number' ||
        typeof analysis.neutralScore !== 'number' ||
        typeof analysis.summary !== 'string' ||
        !Array.isArray(analysis.sources)
      ) {
        throw new Error('Invalid response format from OpenAI')
      }

      // Normalize percentages to ensure they sum to exactly 100% with one decimal place
      const normalized = this.normalizePercentages(
        analysis.agreementScore,
        analysis.disagreementScore,
        analysis.neutralScore
      )

      // Round accuracy score to one decimal place
      const accuracyScore = parseFloat(analysis.accuracyScore.toFixed(1))

      return {
        ...analysis,
        accuracyScore,
        agreementScore: normalized.agreementScore,
        disagreementScore: normalized.disagreementScore,
        neutralScore: normalized.neutralScore,
      }
    } catch (error) {
      console.error('OpenAI analysis error:', error)
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error('Failed to analyze content. Please try again.')
      }
      throw new Error('Failed to analyze content with AI. Please try again.')
    }
  }
}
