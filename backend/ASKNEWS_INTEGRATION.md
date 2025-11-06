# AskNews Integration Guide

This document explains how to test and integrate AskNews API as a replacement or supplement to Tavily for TruthMeter's fact-checking pipeline.

## Overview

AskNews is a news-specific search API that offers:
- **Multi-language support** across thousands of news sources
- **News-focused results** (not general web search)
- **Structured data** with sentiment, source diversity, and geo-context
- **Fast response times** (<100ms for prompt-optimized calls)
- **Forever free tier** available

## What's Been Implemented

### 1. AskNews Service (`src/services/asknews.ts`)

A complete service that handles:
- OAuth2 authentication with automatic token refresh
- News article search with flexible parameters
- Language filtering
- Conversion to Tavily-compatible format for easy integration

**Key Methods:**
```typescript
// Basic search
await askNewsService.search({
  query: "climate change",
  n_articles: 100,
  method: 'nl', // natural language
  return_type: 'dicts'
})

// Language-specific search
await askNewsService.searchWithLanguage(
  "artificial intelligence",
  "en",
  50
)

// Convert to Tavily format (for drop-in replacement)
const tavilyFormat = askNewsService.convertToTavilyFormat(articles)
```

### 2. Language Detector (`src/services/languageDetector.ts`)

Uses OpenAI GPT-4o-mini to detect language from user input:
- Returns ISO 639-1 language codes (en, ar, es, etc.)
- Provides confidence levels (high/medium/low)
- Fallback to English if detection fails
- Very cost-effective (~$0.001 per detection)

**Usage:**
```typescript
const result = await languageDetector.detectLanguage(userText)
// Returns: { language: 'ar', confidence: 'high', languageName: 'Arabic' }
```

### 3. Test Suite (`src/test-asknews.ts`)

Comprehensive test suite that validates:
1. **Language Detection** - Tests English, Arabic, Spanish detection
2. **Basic Search** - Retrieves 10 articles and validates structure
3. **Large Search** - Tests retrieving 100 articles
4. **Multi-language Search** - Searches with language filtering
5. **Data Compatibility** - Validates conversion to Tavily format
6. **Tavily Comparison** - Side-by-side performance comparison

## How to Run Tests

### Step 1: Get AskNews Credentials

1. Go to https://my.asknews.app
2. Sign up for a free account
3. Navigate to **Settings > API Credentials**
4. Create OAuth2 Client Credentials
5. Copy your Client ID and Client Secret

### Step 2: Configure Environment

Add to your `.env` file:

```bash
# AskNews Configuration
ASKNEWS_CLIENT_ID=your_client_id_here
ASKNEWS_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Run the Test Suite

```bash
cd backend
npm run test:asknews
```

The test will output:
- Authentication success/failure
- Number of articles retrieved
- Data structure validation
- Performance metrics
- Comparison with Tavily
- Data quality assessment

## Expected Test Results

### What to Look For

✅ **GOOD SIGNS:**
- Successfully retrieves 50-100 articles
- Articles have `summary` field with 200+ characters
- Response time <5 seconds for 100 articles
- Articles include `pub_date`, `url`, `headline`
- Conversion to Tavily format works seamlessly

❌ **RED FLAGS:**
- Less than 20 articles returned
- Summaries are too short (<50 chars)
- Missing critical fields (url, headline, summary)
- Free tier rate limits exceeded
- Authentication failures

## Integration Approaches

Based on test results, choose one of these approaches:

### Approach 1: Full Replacement ✅ (Recommended if tests pass)

**When to use:**
- AskNews returns 50+ articles consistently
- Article summaries are comprehensive (200+ chars)
- Free tier limits are acceptable
- Multi-language support is critical

**Implementation:**
```typescript
// In factChecker.ts
constructor(
  private askNewsService: AskNewsService,
  private languageDetector: LanguageDetectorService,
  private openaiService: OpenAIService,
  private cacheService: CacheService
) {}

async analyzePost(contentText: string): Promise<AnalysisResult> {
  // 1. Detect language
  const langResult = await this.languageDetector.detectLanguage(contentText)

  // 2. Search with AskNews
  const articles = await this.askNewsService.searchWithLanguage(
    contentText,
    langResult.language,
    50
  )

  // 3. Convert to Tavily format
  const sources = this.askNewsService.convertToTavilyFormat(articles)

  // 4. Continue with existing OpenAI analysis
  const analysis = await this.openaiService.analyzeFactCheck(contentText, sources)

  // ... rest of your existing code
}
```

### Approach 2: Hybrid (Best of Both Worlds) ⚡

**When to use:**
- AskNews works but has limitations
- You want news-specific sources + general web sources
- Maximum source diversity is important

**Implementation:**
```typescript
async analyzePost(contentText: string): Promise<AnalysisResult> {
  // Detect language
  const langResult = await this.languageDetector.detectLanguage(contentText)

  // Get sources from both services in parallel
  const [askNewsArticles, tavilyResults] = await Promise.all([
    this.askNewsService.searchWithLanguage(contentText, langResult.language, 30),
    this.tavilyService.search(contentText, 20)
  ])

  // Convert AskNews to Tavily format
  const askNewsSources = this.askNewsService.convertToTavilyFormat(askNewsArticles)

  // Combine sources
  const allSources = [...askNewsSources, ...tavilyResults]

  // Continue with existing analysis
  const analysis = await this.openaiService.analyzeFactCheck(contentText, allSources)

  // ... rest of code
}
```

### Approach 3: Smart Routing 🎯

**When to use:**
- You want to optimize costs and performance
- Different content types need different approaches

**Implementation:**
```typescript
async analyzePost(contentText: string): Promise<AnalysisResult> {
  const langResult = await this.languageDetector.detectLanguage(contentText)

  let sources

  // Use AskNews for non-English or recent news claims
  if (langResult.language !== 'en' || this.looksLikeNewsContent(contentText)) {
    const articles = await this.askNewsService.searchWithLanguage(
      contentText,
      langResult.language,
      50
    )
    sources = this.askNewsService.convertToTavilyFormat(articles)
  } else {
    // Use Tavily for general English claims
    sources = await this.tavilyService.searchMultiple(contentText, 50)
  }

  // Continue with analysis
  const analysis = await this.openaiService.analyzeFactCheck(contentText, sources)

  // ... rest of code
}
```

## Data Structure Comparison

### Tavily Format (Current)
```typescript
{
  url: string
  title: string
  content: string  // Article snippet/excerpt
  score: number    // Relevance score (0-1)
  published_date?: string
}
```

### AskNews Format
```typescript
{
  article_id: string
  url: string
  headline: string
  summary: string      // Article summary (usually 200-500 chars)
  pub_date: string
  source_id: string
  language?: string
  classification?: {
    category?: string
    sentiment?: string
  }
}
```

### Conversion Notes
- AskNews `headline` → Tavily `title`
- AskNews `summary` → Tavily `content`
- Generate synthetic `score` based on result order

## Cost Analysis

### Current (Tavily)
- **Per request**: ~$0.003-0.005
- **For 100 sources**: 5 requests × $0.004 = ~$0.02
- **Monthly (1000 analyses)**: ~$20-25

### With AskNews (Estimated)
- **Free tier**: Check limits at https://asknews.app/en/pricing
- **Per request**: Single API call for 100 articles
- **Language detection**: +$0.001 per analysis (OpenAI)
- **Potential savings**: Significant if free tier covers your usage

### Hybrid Approach Costs
- AskNews (free tier) + Tavily (reduced usage)
- Could reduce Tavily costs by 50-70%

## Performance Expectations

Based on documentation and typical news API performance:

| Metric | AskNews (Expected) | Tavily (Current) |
|--------|-------------------|------------------|
| **Single request (100 sources)** | 1-3 seconds | 3-5 seconds (5 requests) |
| **Response format** | Structured JSON | Structured JSON |
| **Content per source** | 200-500 char summary | 200-1000 char snippet |
| **Language support** | Extensive | English-focused |
| **Source type** | News only | Mixed (news + blogs + sites) |

## Migration Checklist

Before going to production:

- [ ] Run full test suite with your AskNews credentials
- [ ] Verify 50+ articles returned consistently
- [ ] Check article summary quality and length
- [ ] Test with different languages (Arabic, Spanish, etc.)
- [ ] Measure response times under load
- [ ] Verify free tier limits meet your needs
- [ ] Test with 10+ different fact-checking queries
- [ ] Compare accuracy of results with Tavily
- [ ] Update caching strategy if needed
- [ ] Monitor costs after deployment
- [ ] Set up error handling and fallbacks

## Troubleshooting

### Issue: Authentication Fails
```
Error: AskNews OAuth error: 401
```
**Solution:** Verify credentials in `.env`, ensure they're Client Credentials (not API key)

### Issue: No Articles Returned
```
Retrieved 0 articles
```
**Solution:**
- Check query formatting
- Try broader queries
- Verify language parameter is valid
- Check free tier limits haven't been exceeded

### Issue: Summaries Too Short
```
Average summary length: 45 chars
```
**Solution:**
- Use `return_type: 'dicts'` or `'both'`
- May need to fetch full article text separately
- Consider hybrid approach with Tavily

### Issue: Rate Limits
```
Error: 429 Too Many Requests
```
**Solution:**
- Add delays between requests
- Implement request queuing
- Consider upgrading plan
- Use caching more aggressively

## Next Steps

1. **Run the test suite** to validate AskNews meets your needs
2. **Analyze test results** - look at article count, content quality, speed
3. **Choose integration approach** based on test outcomes
4. **Update factChecker.ts** with chosen approach
5. **Test end-to-end** with real user queries
6. **Monitor performance** and costs in production
7. **Iterate** based on real-world usage

## Questions to Answer After Testing

- [ ] How many articles does AskNews return for your typical queries?
- [ ] Are the article summaries detailed enough for fact-checking?
- [ ] Is the response time acceptable (<5 seconds for 100 articles)?
- [ ] Does language detection work accurately?
- [ ] How does AskNews compare to Tavily in terms of result quality?
- [ ] What are the free tier limits and will they work for your usage?
- [ ] Should you do full replacement, hybrid, or smart routing?

## Support Resources

- **AskNews Docs**: https://docs.asknews.app
- **AskNews Dashboard**: https://my.asknews.app
- **AskNews Pricing**: https://asknews.app/en/pricing
- **TruthMeter Project**: See `CLAUDE.md` for overall architecture

---

**Need Help?** Review test output carefully and compare with the "Expected Test Results" section above. The test suite will guide you toward the best integration approach for your specific use case.
