export interface AskNewsArticle {
  article_id: string
  url: string
  headline: string
  summary: string
  pub_date: string
  source_id: string
  author?: string
  images?: string[]
  keywords?: string[]
  language?: string
  classification?: {
    category?: string
    sentiment?: string
  }
}

export interface AskNewsSearchResponse {
  status: string
  total_articles: number
  articles: AskNewsArticle[]
  query_time_ms?: number
}

export interface AskNewsSearchParams {
  query: string
  n_articles?: number
  method?: 'nl' | 'kw' // natural language or keyword
  return_type?: 'string' | 'dicts' | 'both'
  categories?: string[]
  countries?: string[]
  languages?: string[]
  sort_by?: 'relevance' | 'date' | 'coverage'
  from_date?: string
  to_date?: string
}

export class AskNewsService {
  private clientId: string
  private clientSecret: string
  private apiUrl = 'https://api.asknews.app/v1'
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(clientId: string, clientSecret: string) {
    if (!clientId || !clientSecret) {
      throw new Error('ASKNEWS_CLIENT_ID and ASKNEWS_CLIENT_SECRET are required')
    }
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  /**
   * Get OAuth2 access token using client credentials
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    const now = Date.now()
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch('https://api.asknews.app/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AskNews OAuth error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = now + ((data.expires_in - 300) * 1000)

      console.log('AskNews: Obtained new access token')
      return this.accessToken
    } catch (error) {
      console.error('AskNews authentication error:', error)
      throw new Error('Failed to authenticate with AskNews API')
    }
  }

  /**
   * Search for news articles
   */
  async search(params: AskNewsSearchParams): Promise<AskNewsArticle[]> {
    try {
      const token = await this.getAccessToken()

      const requestBody = {
        query: params.query,
        n_articles: params.n_articles || 10,
        method: params.method || 'nl',
        return_type: params.return_type || 'dicts',
        ...(params.categories && { categories: params.categories }),
        ...(params.countries && { countries: params.countries }),
        ...(params.languages && { languages: params.languages }),
        ...(params.sort_by && { sort_by: params.sort_by }),
        ...(params.from_date && { from_date: params.from_date }),
        ...(params.to_date && { to_date: params.to_date }),
      }

      console.log(`AskNews: Searching for "${params.query}" with ${params.n_articles || 10} articles...`)

      const response = await fetch(`${this.apiUrl}/news/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AskNews API error: ${response.status} - ${error}`)
      }

      const data = await response.json()

      // Handle different response formats
      let articles: AskNewsArticle[] = []

      if (Array.isArray(data)) {
        // Direct array response
        articles = data
      } else if (data.articles && Array.isArray(data.articles)) {
        // Wrapped in articles property
        articles = data.articles
      } else if (data.as_dicts && Array.isArray(data.as_dicts)) {
        // Return type 'both' format
        articles = data.as_dicts
      } else {
        console.warn('Unexpected AskNews response format:', Object.keys(data))
        articles = []
      }

      console.log(`AskNews: Retrieved ${articles.length} articles`)
      return articles
    } catch (error) {
      console.error('AskNews search error:', error)
      throw new Error('Failed to search AskNews. Please try again.')
    }
  }

  /**
   * Convert AskNews articles to Tavily-compatible format for testing
   */
  convertToTavilyFormat(articles: AskNewsArticle[]): Array<{
    url: string
    title: string
    content: string
    score: number
    published_date?: string
  }> {
    return articles.map((article, index) => ({
      url: article.url,
      title: article.headline || 'No title',
      content: article.summary || '',
      score: 1 - (index * 0.01), // Simulate relevance score (1.0 to 0.0)
      published_date: article.pub_date,
    }))
  }

  /**
   * Search with language filtering
   */
  async searchWithLanguage(
    query: string,
    language: string,
    maxResults: number = 10
  ): Promise<AskNewsArticle[]> {
    return await this.search({
      query,
      n_articles: maxResults,
      method: 'nl',
      languages: [language],
      return_type: 'dicts',
    })
  }
}
