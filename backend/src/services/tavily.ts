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
      // Tavily API has a max limit of 20 results per request
      const actualMaxResults = Math.min(maxResults, 20)

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          max_results: actualMaxResults,
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
        published_date: result.published_date,
      }))
    } catch (error) {
      console.error('Tavily search error:', error)
      throw new Error('Failed to search sources. Please try again.')
    }
  }

  async searchMultiple(query: string, targetMinResults: number = 25): Promise<TavilySearchResult[]> {
    try {
      const allResults: TavilySearchResult[] = []
      const seenUrls = new Set<string>()

      // Generate search variations to get diverse results
      const searchVariations = [
        query, // Original query
        `${query} fact check`,
        `${query} evidence`,
        `${query} research study`,
        `${query} news report`,
      ]

      // Perform searches until we reach target or exhaust variations
      for (const searchQuery of searchVariations) {
        if (allResults.length >= targetMinResults) {
          break
        }

        console.log(`Searching with variation: "${searchQuery}"`)
        const results = await this.search(searchQuery, 20)

        // Add only unique results (deduplicate by URL)
        for (const result of results) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url)
            allResults.push(result)
          }
        }

        console.log(`Total unique sources so far: ${allResults.length}`)

        // Small delay between requests to be respectful to the API
        if (allResults.length < targetMinResults) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log(`Retrieved ${allResults.length} total unique sources`)
      return allResults
    } catch (error) {
      console.error('Multiple search error:', error)
      // If multiple search fails, fall back to single search
      console.log('Falling back to single search...')
      return await this.search(query, 20)
    }
  }
}
