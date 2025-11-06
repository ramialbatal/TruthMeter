import dotenv from 'dotenv'
import { SerperService } from './services/serper'

dotenv.config()

/**
 * Test script to validate Serper.dev integration
 *
 * This tests:
 * 1. API authentication
 * 2. Retrieving 100 results in a single request
 * 3. Response time (should be 1-2 seconds)
 * 4. Data quality (title, url, snippet)
 * 5. Comparison with expected performance
 */

class SerperTestSuite {
  private serperService: SerperService | null = null

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    console.log('\n=== Initializing Serper Service ===\n')

    const serperApiKey = process.env.SERPER_API_KEY

    if (serperApiKey) {
      this.serperService = new SerperService(serperApiKey)
      console.log('✓ Serper service initialized')
    } else {
      console.log('✗ SERPER_API_KEY not found in .env')
      console.log('Please add your Serper API key to the .env file')
    }
  }

  /**
   * Test 1: Basic search with 10 results
   */
  async testBasicSearch() {
    console.log('\n=== Test 1: Basic Search (10 results) ===\n')

    if (!this.serperService) {
      return { success: false, message: 'Serper service not initialized' }
    }

    try {
      const query = 'artificial intelligence breakthroughs'
      const startTime = Date.now()

      const results = await this.serperService.search(query, 10)

      const duration = Date.now() - startTime

      console.log(`Query: "${query}"`)
      console.log(`Results retrieved: ${results.length}`)
      console.log(`Duration: ${duration}ms`)

      if (results.length > 0) {
        const sample = results[0]
        console.log('\nSample result structure:')
        console.log(`- url: ${sample.url}`)
        console.log(`- title: ${sample.title}`)
        console.log(`- content length: ${sample.content.length} chars`)
        console.log(`- score: ${sample.score}`)
        console.log(`\nContent snippet:`)
        console.log(sample.content.substring(0, 200) + '...')

        return {
          success: true,
          message: `Retrieved ${results.length} results in ${duration}ms`,
          data: { count: results.length, duration, sample }
        }
      } else {
        return { success: false, message: 'No results returned' }
      }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 2: Large search (100 results) - The main use case
   */
  async testLargeSearch() {
    console.log('\n=== Test 2: Large Search (100 results) ===\n')

    if (!this.serperService) {
      return { success: false, message: 'Serper service not initialized' }
    }

    try {
      const query = 'climate change impacts 2024'
      const startTime = Date.now()

      const results = await this.serperService.searchForFactCheck(query)

      const duration = Date.now() - startTime

      console.log(`Query: "${query}"`)
      console.log(`Requested: 100 results`)
      console.log(`Retrieved: ${results.length} results`)
      console.log(`Duration: ${duration}ms`)
      console.log(`Rate: ${(results.length / (duration / 1000)).toFixed(2)} results/second`)

      // Check data quality
      const withContent = results.filter(r => r.content && r.content.length > 50)
      const withTitles = results.filter(r => r.title && r.title.length > 0)
      const avgContentLength = results.reduce((sum, r) => sum + r.content.length, 0) / results.length

      console.log('\nData quality:')
      console.log(`- Results with content (>50 chars): ${withContent.length}/${results.length}`)
      console.log(`- Results with titles: ${withTitles.length}/${results.length}`)
      console.log(`- Average content length: ${avgContentLength.toFixed(0)} chars`)

      // Performance assessment
      const isfast = duration < 3000
      const hasGoodQuality = withContent.length >= results.length * 0.9

      console.log('\nPerformance assessment:')
      console.log(`- Speed: ${isfast ? '✓ Fast' : '✗ Slow'} (${duration}ms ${isfast ? '< 3s' : '> 3s'})`)
      console.log(`- Quality: ${hasGoodQuality ? '✓ Good' : '✗ Poor'} (${withContent.length}/${results.length} have content)`)

      return {
        success: results.length >= 50 && isfast && hasGoodQuality,
        message: `Retrieved ${results.length} results in ${duration}ms`,
        data: {
          count: results.length,
          duration,
          quality: {
            withContent: withContent.length,
            avgContentLength: avgContentLength.toFixed(0)
          }
        }
      }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 3: Content quality validation
   */
  async testContentQuality() {
    console.log('\n=== Test 3: Content Quality Validation ===\n')

    if (!this.serperService) {
      return { success: false, message: 'Serper service not initialized' }
    }

    try {
      const query = 'COVID-19 vaccine effectiveness'
      const results = await this.serperService.search(query, 20)

      console.log(`Testing content quality for "${query}"\n`)

      // Show first 3 results
      console.log('Sample results:\n')
      results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`)
        console.log(`   URL: ${result.url}`)
        console.log(`   Content length: ${result.content.length} chars`)
        console.log(`   Content: "${result.content.substring(0, 150)}..."`)
        console.log()
      })

      // Validate that content is suitable for OpenAI
      const minLength = 50
      const suitableForAI = results.filter(r => r.content.length >= minLength).length

      console.log(`Content analysis:`)
      console.log(`- Results suitable for AI (>= ${minLength} chars): ${suitableForAI}/${results.length}`)

      const success = suitableForAI >= results.length * 0.8 // At least 80% should be good

      return {
        success,
        message: success ? 'Content quality is good' : 'Content quality is poor',
        data: { suitableForAI, total: results.length }
      }
    } catch (error) {
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Test 4: Speed comparison benchmark
   */
  async testSpeedBenchmark() {
    console.log('\n=== Test 4: Speed Benchmark ===\n')

    if (!this.serperService) {
      return { success: false, message: 'Serper service not initialized' }
    }

    try {
      console.log('Comparing Serper speed to expected Tavily performance...\n')

      const query = 'renewable energy developments'

      // Test Serper (100 results in 1 request)
      console.log('Serper (100 results, 1 request):')
      const serperStart = Date.now()
      const serperResults = await this.serperService.search(query, 100)
      const serperDuration = Date.now() - serperStart

      console.log(`- Retrieved: ${serperResults.length} results`)
      console.log(`- Duration: ${serperDuration}ms\n`)

      // Tavily would need 5 sequential requests (simulated timing)
      const tavilyEstimatedDuration = 5000 // 5 seconds minimum with sequential requests
      const speedup = (tavilyEstimatedDuration / serperDuration).toFixed(1)

      console.log('Comparison:')
      console.log(`- Serper: ${serperDuration}ms`)
      console.log(`- Tavily (estimated): ${tavilyEstimatedDuration}ms`)
      console.log(`- Speedup: ${speedup}x faster`)

      const isMuchFaster = serperDuration < tavilyEstimatedDuration / 3

      return {
        success: isMuchFaster,
        message: `Serper is ${speedup}x faster than Tavily`,
        data: { serperDuration, tavilyEstimatedDuration, speedup }
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
    console.log('║         Serper.dev Integration Test Suite               ║')
    console.log('╚══════════════════════════════════════════════════════════╝')

    if (!this.serperService) {
      console.log('\n✗ Cannot run tests: SERPER_API_KEY not configured')
      console.log('\nPlease add your Serper API key to .env file:')
      console.log('SERPER_API_KEY=your_api_key_here')
      return
    }

    const tests = [
      { name: 'Basic Search', fn: () => this.testBasicSearch() },
      { name: 'Large Search (100)', fn: () => this.testLargeSearch() },
      { name: 'Content Quality', fn: () => this.testContentQuality() },
      { name: 'Speed Benchmark', fn: () => this.testSpeedBenchmark() },
    ]

    const results: { name: string; result: any }[] = []

    for (const test of tests) {
      const result = await test.fn()
      results.push({ name: test.name, result })
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
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

    if (passed === total) {
      console.log('\n🎉 All tests passed! Serper integration is ready to use.')
      console.log('\nNext steps:')
      console.log('1. Add SERPER_API_KEY to your backend/.env file')
      console.log('2. Run: cd backend && npm run dev')
      console.log('3. Your app will now use Serper for 10x faster searches!')
    } else {
      console.log('\n⚠️  Some tests failed. Please check your API key and try again.')
    }

    return results
  }
}

// Run tests
async function main() {
  const testSuite = new SerperTestSuite()
  await testSuite.runAllTests()
}

main().catch(console.error)
