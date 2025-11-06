# AskNews Integration - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Get Your Credentials

Go to https://my.asknews.app and:
1. Sign up (free tier available)
2. Navigate to **Settings** → **API Credentials**
3. Create **OAuth2 Client Credentials**
4. Copy your Client ID and Client Secret

### 2. Add to Environment

Edit your `.env` file in the backend directory:

```bash
# Add these lines
ASKNEWS_CLIENT_ID=your_client_id_here
ASKNEWS_CLIENT_SECRET=your_client_secret_here
```

### 3. Run the Test

```bash
cd backend
npm run test:asknews
```

### 4. Review Results

The test will show you:

✅ **SUCCESS if you see:**
- "✓ 50+ articles retrieved"
- "✓ Average summary length: 200+ chars"
- "✓ All converted items have required fields: true"
- Response time < 5 seconds

❌ **CONCERNS if you see:**
- Less than 20 articles returned
- Summaries under 100 characters
- Authentication errors
- Missing data fields

## 📊 What the Tests Check

| Test | What It Validates | Pass Criteria |
|------|------------------|---------------|
| **Language Detection** | Can detect English, Arabic, Spanish | All 3 languages detected correctly |
| **Basic Search** | Retrieves 10 articles | 10 articles with valid structure |
| **Large Search** | Retrieves 100 articles | 50+ articles returned |
| **Multi-language** | Searches in different languages | Returns language-specific results |
| **Data Compatibility** | Converts to Tavily format | All fields present and valid |
| **Tavily Comparison** | Performance vs current solution | Comparable or better speed |

## 🎯 Decision Matrix

Based on test results:

### ✅ Use AskNews (Full Replacement) if:
- You get 50+ articles consistently
- Summaries are 200+ characters
- Multi-language support is critical
- Response time is under 5 seconds
- Free tier covers your usage

### ⚡ Use Hybrid Approach if:
- AskNews returns 20-50 articles
- You want maximum source diversity
- You need both news and general web sources

### ❌ Stick with Tavily if:
- AskNews returns fewer than 20 articles
- Summaries are too short (<100 chars)
- Free tier limits are too restrictive
- Authentication is unreliable

## 🔧 Implementation Options

### Option 1: Full Replacement (Simple)

Replace Tavily with AskNews in your fact-checking pipeline.

**Time to implement:** ~30 minutes

### Option 2: Hybrid (Best Results)

Use both AskNews (for news) and Tavily (for general sources).

**Time to implement:** ~1 hour

### Option 3: Smart Routing (Optimized)

Route to AskNews or Tavily based on content type/language.

**Time to implement:** ~2 hours

## 📖 Full Documentation

See `ASKNEWS_INTEGRATION.md` for:
- Detailed implementation guides
- Code examples for each approach
- Cost analysis
- Troubleshooting tips
- Migration checklist

## 🆘 Troubleshooting Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| "OAuth error: 401" | Check credentials in `.env`, ensure correct Client ID/Secret |
| "0 articles returned" | Try broader query, check language parameter |
| "Rate limit exceeded" | Wait a few minutes, check free tier limits |
| "No response from language detector" | Verify OPENAI_API_KEY in `.env` |

## 💡 Pro Tips

1. **Test with your actual queries** - Don't just rely on the default test queries
2. **Check multiple languages** - If you're going multi-language, test each one
3. **Compare article quality** - Read a few articles from both AskNews and Tavily
4. **Monitor costs** - Start with free tier, track usage before upgrading
5. **Use caching** - Your existing cache will work with AskNews too

## 📞 Next Steps

1. ✅ Run `npm run test:asknews`
2. ✅ Review the test output
3. ✅ Check the "Test Summary" at the end
4. ✅ Read `ASKNEWS_INTEGRATION.md` for implementation details
5. ✅ Choose your integration approach
6. ✅ Make the code changes
7. ✅ Test with real queries
8. ✅ Deploy!

---

**Ready to integrate?** The test results will tell you everything you need to know. Good luck! 🎉
