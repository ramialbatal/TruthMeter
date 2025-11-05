---
description: Debug and fix issues in TruthMeter systematically
---

You are helping to debug and fix an issue in TruthMeter. Follow this systematic approach:

## Step 1: Understand the Bug

Ask the user for details:
- **What is the expected behavior?**
- **What is the actual behavior?**
- **When did this start happening?** (after a specific change?)
- **How to reproduce?** (steps to trigger the bug)
- **Error messages?** (console logs, error screens)
- **Environment?** (browser, OS, dev/prod)
- **Frequency?** (always, sometimes, specific conditions)

Create a clear bug report in your mind before proceeding.

## Step 2: Reproduce the Bug

Try to reproduce the issue:
1. Follow the user's reproduction steps
2. Check console for errors (browser DevTools, terminal)
3. Verify the bug exists
4. Note any additional observations

If you cannot reproduce:
- Ask for more details
- Request screenshots/videos
- Check environment differences

## Step 3: Create Investigation Plan

Use TodoWrite to create a systematic debugging plan:
- Identify potential root causes
- List files/components to investigate
- Plan debugging steps (logs, breakpoints, etc.)
- Order investigation from most to least likely

**Investigation Areas by Symptom:**

### Frontend Issues
- **UI not rendering**: Check component logic, API responses, state management
- **Styling broken**: Check Tailwind classes, CSS conflicts, responsive breakpoints
- **Button not working**: Check event handlers, form validation, API calls
- **Data not showing**: Check API integration, data transformation, loading states

### Backend Issues
- **API errors (500)**: Check service logic, database queries, external API calls
- **API errors (400)**: Check input validation, request parsing, types
- **Slow responses**: Check database queries, external API calls, caching
- **Wrong data returned**: Check business logic, data transformations, SQL queries

### Database Issues
- **Data not saving**: Check SQL syntax, constraints, transactions
- **Query slow**: Check indexes, query optimization, table size
- **Data inconsistent**: Check migrations, concurrent access, cache

### Integration Issues
- **Tavily API failing**: Check API key, request format, rate limits, network
- **Claude API failing**: Check API key, prompt format, token limits, model availability
- **CORS errors**: Check CORS config, request origins, headers

## Step 4: Investigate Root Cause

Systematically investigate:

### Add Debug Logging
```typescript
// Backend
console.log('DEBUG: Variable value:', variable)
console.log('DEBUG: Request body:', req.body)
console.log('DEBUG: API response:', response)

// Frontend
console.log('DEBUG: State:', state)
console.log('DEBUG: Props:', props)
console.log('DEBUG: API response:', data)
```

### Check Common Issues

**TypeScript Issues:**
- Type mismatches between frontend/backend
- Missing null/undefined checks
- Incorrect interface definitions

**API Issues:**
- Wrong endpoint URL
- Missing/incorrect headers
- Invalid request body format
- CORS misconfiguration

**State Issues:**
- Stale state
- Race conditions
- Missing state updates
- Improper state initialization

**Database Issues:**
- SQL injection vulnerability (use parameterized queries!)
- Missing indexes
- Incorrect schema
- Lock timeouts

### Use Debugging Tools

**Backend:**
```bash
# Check server logs
cd backend && npm run dev

# Test API directly
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"contentText": "test"}'

# Check database
sqlite3 truthmeter.db ".schema"
sqlite3 truthmeter.db "SELECT * FROM analyses LIMIT 5;"
```

**Frontend:**
```bash
# Check browser console
# Check Network tab (API calls)
# Check React DevTools (component state)
# Check build errors
npm run dev
```

### Read Stack Traces
- Read from bottom to top
- Identify the first file in YOUR code (not node_modules)
- That's usually where the bug is

## Step 5: Identify Root Cause

Once you find the root cause, clearly state:
- **What is broken:** Specific file and line
- **Why it's broken:** Root cause explanation
- **How to fix:** Proposed solution

Get user confirmation before proceeding if the fix is complex.

## Step 6: Implement the Fix

Fix the bug following these principles:

### Fix Types

**1. Logic Fix**
```typescript
// Before (bug)
if (score > 0) { /* wrong condition */ }

// After (fixed)
if (score >= 0) { /* correct condition */ }
```

**2. Type Fix**
```typescript
// Before (bug)
const result: string = data.value // type mismatch

// After (fixed)
const result: number = data.value // correct type
```

**3. Null Safety Fix**
```typescript
// Before (bug)
const len = data.items.length // crashes if items is undefined

// After (fixed)
const len = data.items?.length ?? 0 // safe access
```

**4. Error Handling Fix**
```typescript
// Before (bug)
const result = await apiCall() // unhandled rejection

// After (fixed)
try {
  const result = await apiCall()
} catch (error) {
  console.error('API call failed:', error)
  throw new Error('Failed to fetch data')
}
```

**5. Performance Fix**
```typescript
// Before (slow)
const results = items.map(item => expensiveOperation(item))

// After (faster)
const results = await Promise.all(
  items.map(item => expensiveOperation(item))
)
```

### Best Practices for Fixes

✅ **DO:**
- Fix the root cause, not symptoms
- Add error handling if missing
- Add validation if missing
- Update types if needed
- Add comments explaining why (if non-obvious)
- Keep the fix minimal and focused

❌ **DON'T:**
- Add workarounds that hide the real issue
- Fix in multiple places (fix root cause once)
- Introduce breaking changes
- Add unnecessary complexity
- Skip testing the fix

### Update Related Code

Check if the bug exists elsewhere:
```bash
# Search for similar patterns
cd /path/to/truthmeter
grep -r "buggy_pattern" backend/src
grep -r "buggy_pattern" frontend/src
```

Fix all instances to prevent future bugs.

## Step 7: Test the Fix

### Manual Testing
1. **Reproduce the original bug** - Verify it's actually fixed
2. **Test happy path** - Normal use case works
3. **Test edge cases** - Boundary conditions work
4. **Test error cases** - Error handling works
5. **Regression test** - Related features still work

### Specific Test Scenarios

**Frontend Fix:**
```
1. Open http://localhost:5173
2. Perform action that triggered bug
3. Verify bug is fixed
4. Test related UI components
5. Check console for errors
6. Test in different browsers (if UI bug)
```

**Backend Fix:**
```bash
# Test the fixed endpoint
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"contentText": "test content text"}'

# Verify response is correct
# Check server logs for errors
# Test edge cases (empty input, very long input, etc.)
```

**Database Fix:**
```bash
# Verify data integrity
sqlite3 truthmeter.db "SELECT * FROM analyses WHERE id='test_id';"

# Test insert/update/delete operations
# Verify constraints work
```

### Automated Testing

Offer to create tests to prevent regression:
```typescript
// Example unit test
describe('FactCheckerService', () => {
  it('should handle empty content text', async () => {
    await expect(
      factChecker.analyzePost('')
    ).rejects.toThrow('Content text is required')
  })
})
```

Suggest: "Would you like me to add automated tests for this fix?"

## Step 8: Clean Up

Remove debugging code:
```bash
# Find all console.log statements you added
grep -r "console.log" backend/src
grep -r "console.log" frontend/src

# Remove debug logs (keep intentional logging)
```

Check for:
- [ ] No debug console.logs
- [ ] No commented code
- [ ] No temporary files
- [ ] No hardcoded test values

## Step 9: Document the Fix

### Update Code Comments
If the bug was subtle, add comments:
```typescript
// Note: We check for null here because the API might return
// undefined when no sources are found (issue #123)
if (sources == null) {
  sources = []
}
```

### Update CLAUDE.md
If the bug revealed missing documentation:
- Add to troubleshooting section
- Document the gotcha
- Update architecture notes if needed

### Create Bug Report
Document in comments:
```typescript
/**
 * Bug Fix: Issue with score calculation
 *
 * Problem: Scores were calculated incorrectly when no sources found
 * Root Cause: Division by zero when sources.length === 0
 * Fix: Added check for empty sources array
 * Date: 2025-11-05
 */
```

## Step 10: Git Workflow

Commit the fix:
```bash
# Stage changes
git add .

# Commit with fix type
git commit -m "fix: correct score calculation when no sources found

- Added null check for sources array
- Handle edge case of empty results
- Add error message for user

Fixes: Score showed NaN when no sources available"

# Optionally push
git push origin [branch]
```

**Commit Message Format:**
```
fix: <brief description>

<detailed explanation>
<what was wrong>
<how it's fixed>

Fixes: <issue reference or description>
```

## Common Bug Patterns in TruthMeter

### 1. API Integration Bugs
**Symptom:** "Cannot read property 'results' of undefined"
**Cause:** Tavily/Claude API response format changed or error not handled
**Fix:** Add response validation and error handling

### 2. Type Mismatch Bugs
**Symptom:** TypeScript errors, runtime type errors
**Cause:** Frontend/backend types out of sync
**Fix:** Update types in both places, ensure they match

### 3. Async/Await Bugs
**Symptom:** "Promise pending", race conditions
**Cause:** Missing await, incorrect promise handling
**Fix:** Add await, use Promise.all for parallel calls

### 4. State Management Bugs
**Symptom:** UI not updating, stale data
**Cause:** State not updated properly, missing dependencies
**Fix:** Check state updates, useEffect dependencies

### 5. Cache Bugs
**Symptom:** Stale data, wrong results returned
**Cause:** Cache key collision, TTL issues
**Fix:** Review cache normalization, check TTL logic

### 6. Database Bugs
**Symptom:** SQL errors, data not found
**Cause:** Schema mismatch, query errors
**Fix:** Verify schema, use parameterized queries

### 7. CORS Bugs
**Symptom:** "CORS policy blocked"
**Cause:** Missing CORS headers, wrong origin
**Fix:** Update CORS config in backend/src/index.ts

### 8. Environment Bugs
**Symptom:** "API key not found", connection refused
**Cause:** Missing .env file, wrong env vars
**Fix:** Verify .env exists, restart servers

## Debugging Tools & Commands

### Backend Debugging
```bash
# Check if server is running
lsof -i :3001

# View logs
cd backend && npm run dev

# Test database
sqlite3 truthmeter.db
.tables
.schema analyses
SELECT * FROM analyses LIMIT 5;

# Check environment
cd backend && cat .env | grep -v "KEY"

# Test Tavily API
curl https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{"api_key":"YOUR_KEY","query":"test"}'
```

### Frontend Debugging
```bash
# Check build errors
cd frontend && npm run dev

# Type check
npm run type-check

# Check API proxy
curl http://localhost:5173/api/health
```

### Full Stack Debugging
```bash
# Check all node processes
ps aux | grep node

# Check ports in use
lsof -i :3001
lsof -i :5173

# Network debugging
curl -v http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"contentText":"test"}'
```

## Prevention Strategies

After fixing the bug, consider:

### 1. Add Validation
```typescript
// Prevent bad input
if (!contentText || contentText.trim().length === 0) {
  throw new Error('Content text is required')
}
```

### 2. Add Error Handling
```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('User-friendly error message')
}
```

### 3. Add Type Guards
```typescript
function isValidSource(obj: any): obj is Source {
  return obj && typeof obj.url === 'string' && typeof obj.title === 'string'
}
```

### 4. Add Tests
- Unit tests for the fixed function
- Integration tests for the fixed flow
- E2E tests for critical paths

### 5. Add Documentation
- Comment non-obvious code
- Update CLAUDE.md troubleshooting
- Add JSDoc for complex functions

## Emergency Fixes

For critical production bugs:

### 1. Immediate Mitigation
- Disable broken feature
- Show user-friendly error
- Add monitoring/alerting

### 2. Quick Fix
- Minimal change to stop the bleeding
- Test thoroughly
- Deploy immediately

### 3. Proper Fix
- Investigate root cause
- Implement proper solution
- Add tests
- Deploy after testing

## Completion Checklist

Before marking bug as fixed:
- [ ] Root cause identified and documented
- [ ] Fix implemented and tested
- [ ] Original issue no longer occurs
- [ ] Edge cases handled
- [ ] Error handling added/improved
- [ ] No regression in related features
- [ ] Debug code removed
- [ ] Types updated if needed
- [ ] Documentation updated
- [ ] Git commit created with clear message
- [ ] User confirmed fix works

## Getting Started

**Ask the user:** "What bug or issue are you experiencing with TruthMeter?"

Then follow the 10-step process systematically. Be thorough, methodical, and don't skip testing!

## Pro Tips

1. **Read error messages carefully** - They usually tell you exactly what's wrong
2. **Use binary search** - Comment out half the code, narrow down the problem
3. **Check git history** - `git log --oneline` to see recent changes
4. **Rubber duck debugging** - Explain the problem out loud
5. **Take breaks** - Fresh eyes spot bugs faster
6. **Ask for help** - If stuck after 30 min, ask user for more context
