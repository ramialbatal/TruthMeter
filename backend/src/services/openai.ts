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

  async analyzeFactCheck(
    tweetText: string,
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

      const prompt = `You are a fact-checking assistant. Analyze the provided tweet against credible sources and determine its factual accuracy.

Tweet to analyze:
"${tweetText}"

Sources found:
${sourcesText}

Please analyze the tweet and provide your response in the following JSON format:
{
  "accuracyScore": <number 0-100>,
  "agreementScore": <number 0-100>,
  "disagreementScore": <number 0-100>,
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
- agreementScore: Percentage of sources that support the claim
- disagreementScore: Percentage of sources that contradict the claim
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
        typeof analysis.summary !== 'string' ||
        !Array.isArray(analysis.sources)
      ) {
        throw new Error('Invalid response format from OpenAI')
      }

      return analysis
    } catch (error) {
      console.error('OpenAI analysis error:', error)
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error('Failed to analyze tweet. Please try again.')
      }
      throw new Error('Failed to analyze tweet with AI. Please try again.')
    }
  }
}
