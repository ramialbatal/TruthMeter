export interface SerperSearchResult {
  url: string
  title: string
  content: string
  score: number
  published_date?: string
}

interface SerperApiResult {
  title: string
  link: string
  snippet: string
  position: number
  date?: string
}

interface SerperApiResponse {
  organic?: SerperApiResult[]
  searchParameters?: {
    q: string
    num: number
  }
}

export class SerperService {
  private apiKey: string
  private apiUrl = 'https://google.serper.dev/search'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('SERPER_API_KEY is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Search for sources using Serper API (single page)
   * Serper returns 10 results per page by default
   */
  private async searchPage(query: string, page: number = 1): Promise<SerperSearchResult[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          page: page,
          num: 10, // Serper returns 10 results per page
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Serper API error: ${response.status} - ${error}`)
      }

      const data = await response.json() as SerperApiResponse

      if (!data.organic || data.organic.length === 0) {
        return []
      }

      const results = data.organic.map((result, index) => ({
        url: result.link,
        title: result.title,
        content: result.snippet || '',
        // Score decreases based on page and position
        score: 1 - ((page - 1) * 10 + index) / 100,
        published_date: result.date,
      }))

      return results
    } catch (error) {
      console.error(`Serper search error (page ${page}):`, error)
      return [] // Return empty array instead of throwing, so other pages can still succeed
    }
  }

  /**
   * Search for sources using Serper API with pagination
   * Makes parallel requests to get up to 100 results (10 pages × 10 results)
   */
  async search(query: string, maxResults: number = 100): Promise<SerperSearchResult[]> {
    try {
      const startTime = Date.now()

      // Calculate how many pages we need (10 results per page)
      const resultsPerPage = 10
      const numPages = Math.min(Math.ceil(maxResults / resultsPerPage), 10) // Max 10 pages = 100 results

      console.log(`Serper: Searching for "${query}" with ${maxResults} results (${numPages} pages in parallel)...`)

      // Make parallel requests for all pages
      const pagePromises = []
      for (let page = 1; page <= numPages; page++) {
        pagePromises.push(this.searchPage(query, page))
      }

      const pageResults = await Promise.all(pagePromises)

      // Flatten and combine all results
      const allResults = pageResults.flat()

      // Deduplicate by URL (in case of duplicates across pages)
      const seenUrls = new Set<string>()
      const uniqueResults: SerperSearchResult[] = []

      for (const result of allResults) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url)
          uniqueResults.push(result)
        }
      }

      const duration = Date.now() - startTime

      console.log(`Serper: Retrieved ${uniqueResults.length} unique results in ${duration}ms`)

      return uniqueResults.slice(0, maxResults) // Trim to exact maxResults
    } catch (error) {
      console.error('Serper search error:', error)
      throw new Error('Failed to search sources with Serper. Please try again.')
    }
  }

  /**
   * Search with query variations to get more diverse results
   * Makes multiple parallel requests
   */
  async searchMultiple(query: string, targetMinResults: number = 100): Promise<SerperSearchResult[]> {
    try {
      // If we want 100 or fewer results, just use a single request
      if (targetMinResults <= 100) {
        return await this.search(query, targetMinResults)
      }

      console.log(`Serper: Searching for ${targetMinResults} results using multiple queries...`)

      // For more than 100 results, use query variations
      const searchVariations = [
        query, // Original query
        `${query} fact check`,
        `${query} evidence`,
        `${query} research`,
        `${query} news`,
      ]

      const allResults: SerperSearchResult[] = []
      const seenUrls = new Set<string>()

      // Make parallel requests for the first few variations
      const maxVariations = Math.ceil(targetMinResults / 100)
      const variationsToUse = searchVariations.slice(0, Math.min(maxVariations, searchVariations.length))

      console.log(`Using ${variationsToUse.length} search variations in parallel`)

      const promises = variationsToUse.map(variation => this.search(variation, 100))
      const results = await Promise.all(promises)

      // Deduplicate by URL
      for (const resultSet of results) {
        for (const result of resultSet) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url)
            allResults.push(result)
          }
        }
      }

      console.log(`Serper: Retrieved ${allResults.length} unique results from ${variationsToUse.length} queries`)

      return allResults
    } catch (error) {
      console.error('Serper multiple search error:', error)
      // If multiple search fails, fall back to single search
      console.log('Falling back to single search...')
      return await this.search(query, 100)
    }
  }

  /**
   * Search with enhanced query to get fact-checking relevant results
   */
  async searchForFactCheck(query: string): Promise<SerperSearchResult[]> {
    // Single fast request for 100 high-quality results
    return await this.search(query, 100)
  }
}
