import dotenv from 'dotenv'
import { AskNewsService } from './services/asknews'
import { TavilyService } from './services/tavily'
import { LanguageDetectorService } from './services/languageDetector'

dotenv.config()

/**
 * Comprehensive test script to validate AskNews API integration
 *
 * This script tests:
 * 1. Authentication with AskNews
 * 2. Language detection
 * 3. Retrieving 100 articles
 * 4. Data structure and content quality
 * 5. Comparison with Tavily
 */

interface TestResult {
  success: boolean
  message: string
  data?: any
}

class AskNewsTestSuite {
  private askNewsService: AskNewsService | null = null
  private tavilyService: TavilyService | null = null
  private languageDetector: LanguageDetectorService | null = null

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    console.log('\n=== Initializing Services ===\n')

    // Initialize AskNews
    const askNewsClientId = process.env.ASKNEWS_CLIENT_ID
    const askNewsClientSecret = process.env.ASKNEWS_CLIENT_SECRET

    if (askNewsClientId && askNewsClientSecret) {
      this.askNewsService = new AskNewsService(askNewsClientId, askNewsClientSecret)
      console.log('✓ AskNews service initialized')
    } else {
      console.log('✗ AskNews credentials not found in .env')
    }

    // Initialize Tavily for comparison
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (tavilyApiKey) {
      this.tavilyService = new TavilyService(tavilyApiKey)
      console.log('✓ Tavily service initialized')
    } else {
      console.log('✗ Tavily credentials not found in .env')
    }

    // Initialize language detector
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (openaiApiKey) {
      this.languageDetector = new LanguageDetectorService(openaiApiKey)
      console.log('✓ Language detector initialized')
    } else {
      console.log('✗ OpenAI credentials not found in .env')
    }
  }

  /**
   * Test 1: Language Detection
   */
  async testLanguageDetection(): Promise<TestResult> {
    console.log('\n=== Test 1: Language Detection ===\n')

    if (!this.languageDetector) {
      return { success: false, message: 'Language detector not initialized' }
    }

    try {
      const testTexts = [
        { text: 'Climate change is affecting global temperatures', expectedLang: 'en' },
        { text: 'التغير المناخي يؤثر على درجات الحرارة العالمية', expectedLang: 'ar' },
        { text: 'El cambio climático está afectando las temperaturas globales', expectedLang: 'es' },
      ]

      for (const test of testTexts) {
        const result = await this.languageDetector.detectLanguage(test.text)
        console.log(`Text: "${test.text.substring(0, 50)}..."`)
        console.log(`Detected: ${result.languageName} (${result.language})`)
        console.log(`Expected: ${test.expectedLang}`)
        console.log(`Match: ${result.language === test.expectedLang ? '✓' : '✗'}`)
        console.log()
      }

      return { success: true, message: 'Language detection completed' }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 2: AskNews Basic Search
   */
  async testAskNewsBasicSearch(): Promise<TestResult> {
    console.log('\n=== Test 2: AskNews Basic Search (10 articles) ===\n')

    if (!this.askNewsService) {
      return { success: false, message: 'AskNews service not initialized' }
    }

    try {
      const query = 'artificial intelligence breakthroughs'
      const articles = await this.askNewsService.search({
        query,
        n_articles: 10,
        method: 'nl',
        return_type: 'dicts',
      })

      console.log(`Query: "${query}"`)
      console.log(`Articles retrieved: ${articles.length}`)

      if (articles.length > 0) {
        const sample = articles[0]
        console.log('\nSample article structure:')
        console.log(`- article_id: ${sample.article_id}`)
        console.log(`- url: ${sample.url}`)
        console.log(`- headline: ${sample.headline}`)
        console.log(`- summary length: ${sample.summary?.length || 0} chars`)
        console.log(`- pub_date: ${sample.pub_date}`)
        console.log(`- language: ${sample.language || 'not specified'}`)
        console.log(`- source_id: ${sample.source_id}`)

        console.log('\nSummary preview:')
        console.log(sample.summary?.substring(0, 200) + '...')

        return {
          success: true,
          message: `Retrieved ${articles.length} articles`,
          data: { count: articles.length, sample }
        }
      } else {
        return { success: false, message: 'No articles returned' }
      }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 3: AskNews Large Search (100 articles)
   */
  async testAskNewsLargeSearch(): Promise<TestResult> {
    console.log('\n=== Test 3: AskNews Large Search (100 articles) ===\n')

    if (!this.askNewsService) {
      return { success: false, message: 'AskNews service not initialized' }
    }

    try {
      const query = 'climate change impacts'
      const startTime = Date.now()

      const articles = await this.askNewsService.search({
        query,
        n_articles: 100,
        method: 'nl',
        return_type: 'dicts',
      })

      const duration = Date.now() - startTime

      console.log(`Query: "${query}"`)
      console.log(`Requested: 100 articles`)
      console.log(`Retrieved: ${articles.length} articles`)
      console.log(`Duration: ${duration}ms`)
      console.log(`Rate: ${(articles.length / (duration / 1000)).toFixed(2)} articles/second`)

      // Check data quality
      const withSummaries = articles.filter(a => a.summary && a.summary.length > 50)
      const withDates = articles.filter(a => a.pub_date)
      const withLanguages = articles.filter(a => a.language)

      console.log('\nData quality:')
      console.log(`- Articles with summaries (>50 chars): ${withSummaries.length}/${articles.length}`)
      console.log(`- Articles with publish dates: ${withDates.length}/${articles.length}`)
      console.log(`- Articles with language info: ${withLanguages.length}/${articles.length}`)

      // Check average content length
      const avgSummaryLength = articles.reduce((sum, a) => sum + (a.summary?.length || 0), 0) / articles.length
      console.log(`- Average summary length: ${avgSummaryLength.toFixed(0)} chars`)

      return {
        success: articles.length >= 50, // Success if we get at least 50
        message: `Retrieved ${articles.length} out of 100 requested`,
        data: {
          count: articles.length,
          duration,
          quality: {
            withSummaries: withSummaries.length,
            withDates: withDates.length,
            avgSummaryLength: avgSummaryLength.toFixed(0)
          }
        }
      }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 4: Multi-language Search
   */
  async testMultiLanguageSearch(): Promise<TestResult> {
    console.log('\n=== Test 4: Multi-language Search ===\n')

    if (!this.askNewsService || !this.languageDetector) {
      return { success: false, message: 'Required services not initialized' }
    }

    try {
      const testQueries = [
        { text: 'technology innovation', expectedLang: 'en' },
        { text: 'الذكاء الاصطناعي', expectedLang: 'ar' },
      ]

      for (const test of testQueries) {
        console.log(`\nTesting: "${test.text}"`)

        // Detect language
        const langResult = await this.languageDetector.detectLanguage(test.text)
        console.log(`Detected language: ${langResult.languageName} (${langResult.language})`)

        // Search with language filter
        const articles = await this.askNewsService.searchWithLanguage(
          test.text,
          langResult.language,
          10
        )

        console.log(`Articles retrieved: ${articles.length}`)
        if (articles.length > 0) {
          console.log(`Sample headline: ${articles[0].headline}`)
          console.log(`Sample language: ${articles[0].language || 'not specified'}`)
        }
      }

      return { success: true, message: 'Multi-language search completed' }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 5: Comparison with Tavily
   */
  async testComparisonWithTavily(): Promise<TestResult> {
    console.log('\n=== Test 5: AskNews vs Tavily Comparison ===\n')

    if (!this.askNewsService || !this.tavilyService) {
      return { success: false, message: 'Both services must be initialized for comparison' }
    }

    try {
      const query = 'renewable energy developments'
      console.log(`Query: "${query}"\n`)

      // Test AskNews
      console.log('Fetching from AskNews...')
      const askNewsStart = Date.now()
      const askNewsArticles = await this.askNewsService.search({
        query,
        n_articles: 20,
      })
      const askNewsDuration = Date.now() - askNewsStart

      // Test Tavily
      console.log('Fetching from Tavily...')
      const tavilyStart = Date.now()
      const tavilyResults = await this.tavilyService.search(query, 20)
      const tavilyDuration = Date.now() - tavilyStart

      // Compare
      console.log('\n--- Comparison Results ---')
      console.log(`\nAskNews:`)
      console.log(`- Articles: ${askNewsArticles.length}`)
      console.log(`- Duration: ${askNewsDuration}ms`)
      console.log(`- Avg summary length: ${(askNewsArticles.reduce((s, a) => s + (a.summary?.length || 0), 0) / askNewsArticles.length).toFixed(0)} chars`)

      console.log(`\nTavily:`)
      console.log(`- Results: ${tavilyResults.length}`)
      console.log(`- Duration: ${tavilyDuration}ms`)
      console.log(`- Avg content length: ${(tavilyResults.reduce((s, r) => s + r.content.length, 0) / tavilyResults.length).toFixed(0)} chars`)

      // Show sample content comparison
      if (askNewsArticles.length > 0 && tavilyResults.length > 0) {
        console.log('\n--- Sample Content Comparison ---')
        console.log(`\nAskNews article:`)
        console.log(`Title: ${askNewsArticles[0].headline}`)
        console.log(`Content: ${askNewsArticles[0].summary?.substring(0, 200)}...`)

        console.log(`\nTavily result:`)
        console.log(`Title: ${tavilyResults[0].title}`)
        console.log(`Content: ${tavilyResults[0].content.substring(0, 200)}...`)
      }

      return { success: true, message: 'Comparison completed' }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 6: Data Structure Compatibility
   */
  async testDataStructureCompatibility(): Promise<TestResult> {
    console.log('\n=== Test 6: Data Structure Compatibility ===\n')

    if (!this.askNewsService) {
      return { success: false, message: 'AskNews service not initialized' }
    }

    try {
      const articles = await this.askNewsService.search({
        query: 'technology news',
        n_articles: 10,
      })

      // Convert to Tavily format
      const converted = this.askNewsService.convertToTavilyFormat(articles)

      console.log('Testing conversion to Tavily-compatible format...\n')
      console.log(`Converted ${articles.length} articles`)

      if (converted.length > 0) {
        const sample = converted[0]
        console.log('\nConverted structure:')
        console.log(`- url: ${sample.url}`)
        console.log(`- title: ${sample.title}`)
        console.log(`- content: ${sample.content.substring(0, 100)}...`)
        console.log(`- score: ${sample.score}`)
        console.log(`- published_date: ${sample.published_date}`)

        // Validate required fields
        const allValid = converted.every(item =>
          item.url && item.title && item.content && typeof item.score === 'number'
        )

        console.log(`\n✓ All converted items have required fields: ${allValid}`)

        return {
          success: allValid,
          message: allValid ? 'Compatible with existing structure' : 'Missing required fields',
          data: { sample: converted[0] }
        }
      } else {
        return { success: false, message: 'No articles to convert' }
      }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('╔══════════════════════════════════════════════════════════╗')
    console.log('║         AskNews Integration Test Suite                  ║')
    console.log('╚══════════════════════════════════════════════════════════╝')

    const tests = [
      { name: 'Language Detection', fn: () => this.testLanguageDetection() },
      { name: 'Basic Search', fn: () => this.testAskNewsBasicSearch() },
      { name: 'Large Search (100)', fn: () => this.testAskNewsLargeSearch() },
      { name: 'Multi-language', fn: () => this.testMultiLanguageSearch() },
      { name: 'Data Compatibility', fn: () => this.testDataStructureCompatibility() },
      { name: 'Tavily Comparison', fn: () => this.testComparisonWithTavily() },
    ]

    const results: { name: string; result: TestResult }[] = []

    for (const test of tests) {
      const result = await test.fn()
      results.push({ name: test.name, result })
      await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limiting
    }

    // Summary
    console.log('\n\n╔══════════════════════════════════════════════════════════╗')
    console.log('║                    Test Summary                          ║')
    console.log('╚══════════════════════════════════════════════════════════╝\n')

    results.forEach(({ name, result }) => {
      const status = result.success ? '✓' : '✗'
      console.log(`${status} ${name}: ${result.message}`)
    })

    const passed = results.filter(r => r.success).length
    const total = results.length

    console.log(`\nTotal: ${passed}/${total} tests passed`)

    return results
  }
}

// Run tests
async function main() {
  const testSuite = new AskNewsTestSuite()
  await testSuite.runAllTests()
}

main().catch(console.error)
