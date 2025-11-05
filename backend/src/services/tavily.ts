import { TavilyResponse, TavilySearchResult } from '../types'

export class TavilyService {
  private apiKey: string
  private apiUrl = 'https://api.tavily.com/search'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is required')
    }
    this.apiKey = apiKey
  }

  async search(query: string, maxResults: number = 10): Promise<TavilySearchResult[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          max_results: maxResults,
          search_depth: 'advanced',
          include_answer: false,
          include_raw_content: false,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Tavily API error: ${response.status} - ${error}`)
      }

      const data = await response.json() as TavilyResponse

      return data.results.map(result => ({
        url: result.url,
        title: result.title,
        content: result.content,
        score: result.score,
      }))
    } catch (error) {
      console.error('Tavily search error:', error)
      throw new Error('Failed to search sources. Please try again.')
    }
  }
}
