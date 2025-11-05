---
description: Deploy TruthMeter to production with confidence
---

You are helping to deploy TruthMeter to production. Follow this comprehensive deployment process:

## Step 1: Pre-Deployment Checklist

Before deploying, verify everything is ready:

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No console.logs or debug code
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Input validation (frontend + backend)

### Security
- [ ] No hardcoded secrets in code
- [ ] API keys in environment variables only
- [ ] CORS configured properly
- [ ] Rate limiting implemented (if needed)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection
- [ ] Dependencies up to date (`npm audit`)

### Performance
- [ ] Frontend build optimized (`npm run build`)
- [ ] Backend production-ready
- [ ] Database indexed properly
- [ ] API response times acceptable
- [ ] Large assets optimized

### Documentation
- [ ] README.md up to date
- [ ] CLAUDE.md reflects current state
- [ ] API endpoints documented
- [ ] Environment variables documented

**Run the checklist verification:**
```bash
# Backend checks
cd backend
npm run type-check
npm audit
npm run build

# Frontend checks
cd ../frontend
npm run type-check
npm audit
npm run build
```

If any checks fail, fix issues before proceeding.

## Step 2: Choose Deployment Strategy

Ask the user which deployment approach they prefer:

### Option A: Separate Deployments (Recommended)
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or Fly.io
- **Database**: SQLite file on backend host, or upgrade to PostgreSQL

**Pros:** Better separation, easier to scale, independent deployments
**Cons:** More configuration, CORS setup needed

### Option B: Monolithic Deployment
- **Both**: Railway, Render, or single VPS
- **Database**: SQLite file on same server

**Pros:** Simpler setup, no CORS issues
**Cons:** Harder to scale, single point of failure

### Option C: Containerized (Advanced)
- **Docker**: Build containers for frontend/backend
- **Deploy to**: Railway, Fly.io, or any container platform

**Pros:** Consistent environments, portable
**Cons:** More complex, requires Docker knowledge

**Ask user:** "Which deployment strategy would you prefer? (A, B, or C)"

## Step 3: Environment Setup

### Prepare Environment Variables

**Backend (.env for production):**
```bash
# Server
NODE_ENV=production
PORT=3001

# API Keys (NEVER commit these!)
ANTHROPIC_API_KEY=sk-ant-your-production-key
TAVILY_API_KEY=tvly-your-production-key

# Database
DATABASE_PATH=/data/truthmeter.db

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Optional: Sentry, logging, etc.
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

**Frontend (.env.production):**
```bash
VITE_API_URL=https://your-api.railway.app
```

### Security Best Practices

**✅ DO:**
- Use platform secrets management (Vercel env vars, Railway secrets)
- Use different API keys for dev/staging/production
- Rotate keys periodically
- Use least-privilege API keys
- Enable API key restrictions if available

**❌ DON'T:**
- Commit .env files to git
- Share production keys in Slack/email
- Use same keys for dev and prod
- Store keys in code or comments

## Step 4: Backend Deployment

### Option 4A: Deploy to Railway

Railway is great for backend + database hosting.

**Steps:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd backend
railway init

# 4. Add environment variables
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set TAVILY_API_KEY=tvly-...
railway variables set DATABASE_PATH=/app/truthmeter.db
railway variables set NODE_ENV=production

# 5. Deploy
railway up

# 6. Get the URL
railway status
```

**Add to backend/package.json:**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "deploy": "railway up"
  }
}
```

### Option 4B: Deploy to Render

**Steps:**
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: truthmeter-api
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Add Environment Variables** (from Step 3)
5. Click "Create Web Service"

### Option 4C: Deploy to Fly.io

**Steps:**
```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Create fly.toml in backend/
cd backend
fly launch

# 4. Set secrets
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
fly secrets set TAVILY_API_KEY=tvly-...

# 5. Deploy
fly deploy

# 6. Get the URL
fly info
```

**Create backend/fly.toml:**
```toml
app = "truthmeter-api"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[[services]]
  http_checks = []
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

### Database Considerations

**SQLite (Current):**
- ✅ Simple, no extra cost
- ❌ File storage, not ideal for distributed systems
- ❌ Limited concurrent writes
- **Best for**: MVP, low traffic

**Upgrade to PostgreSQL (Recommended for Production):**
- ✅ Better for production
- ✅ Supports concurrent access
- ✅ Better backup/restore
- **Platforms**: Railway (free), Supabase (free tier), Neon (free tier)

**Migration path:**
```bash
# If upgrading to PostgreSQL, you'll need:
# 1. Create PostgreSQL database
# 2. Update backend to use pg instead of better-sqlite3
# 3. Migrate schema
# 4. Migrate data (if any)
```

Ask user: "Do you want to stick with SQLite or upgrade to PostgreSQL?"

## Step 5: Frontend Deployment

### Option 5A: Deploy to Vercel (Recommended)

Vercel is perfect for React/Vite apps.

**Steps:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy from frontend directory
cd frontend
vercel

# 4. Add environment variable
vercel env add VITE_API_URL production
# Enter your backend URL: https://your-api.railway.app

# 5. Deploy to production
vercel --prod
```

**Or via GitHub:**
1. Go to https://vercel.com
2. Click "Import Project"
3. Connect GitHub repo
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: `VITE_API_URL`
5. Click "Deploy"

### Option 5B: Deploy to Netlify

**Steps:**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy from frontend directory
cd frontend
netlify init

# 4. Configure build settings
# Build command: npm run build
# Publish directory: dist

# 5. Add environment variable
netlify env:set VITE_API_URL https://your-api.railway.app

# 6. Deploy
netlify deploy --prod
```

**Create frontend/netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 5C: Deploy to Cloudflare Pages

**Steps:**
1. Go to https://pages.cloudflare.com
2. Click "Create a project"
3. Connect GitHub repo
4. Configure:
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Environment variables**: `VITE_API_URL`
5. Click "Save and Deploy"

## Step 6: Configure CORS

Update backend CORS configuration for production:

**Edit backend/src/index.ts:**
```typescript
import cors from 'cors'

const allowedOrigins = [
  'http://localhost:5173', // Development
  'https://your-app.vercel.app', // Production
  'https://your-custom-domain.com', // Custom domain if any
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
```

**Or use environment variable:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
```

Redeploy backend after CORS changes.

## Step 7: Custom Domain (Optional)

### For Frontend (Vercel)
```bash
# Add domain
vercel domains add your-domain.com

# Update DNS records (follow Vercel instructions)
# A record: 76.76.21.21
# CNAME record: cname.vercel-dns.com
```

### For Backend (Railway)
1. Go to Railway dashboard
2. Click your service → Settings → Domains
3. Click "Generate Domain" or "Custom Domain"
4. Update DNS to point to Railway

### SSL Certificates
- Vercel/Netlify: Automatic SSL via Let's Encrypt
- Railway/Render: Automatic SSL
- Custom: Use Cloudflare or Let's Encrypt

## Step 8: Monitoring & Logging

### Add Error Tracking (Sentry)

**Install Sentry:**
```bash
# Backend
cd backend
npm install @sentry/node

# Frontend
cd frontend
npm install @sentry/react
```

**Backend (backend/src/index.ts):**
```typescript
import * as Sentry from '@sentry/node'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  })
}

// Add error handler
app.use(Sentry.Handlers.errorHandler())
```

**Frontend (frontend/src/main.tsx):**
```typescript
import * as Sentry from '@sentry/react'

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  })
}
```

### Health Checks

Your backend already has `/health` endpoint:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
```

Test it: `curl https://your-api.railway.app/health`

### Uptime Monitoring

Free services:
- **UptimeRobot**: https://uptimerobot.com (free, 5 min checks)
- **Ping Pong**: https://pingpong.one (free)
- **Better Uptime**: https://betteruptime.com (free tier)

Configure to monitor:
- Frontend: https://your-app.vercel.app
- Backend: https://your-api.railway.app/health

### Logging

**Backend logging (production-ready):**
```typescript
// Simple console logging with timestamps
const log = {
  info: (msg: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', msg, meta, timestamp: new Date().toISOString() }))
  },
  error: (msg: string, error?: any) => {
    console.error(JSON.stringify({ level: 'error', msg, error: error?.message, timestamp: new Date().toISOString() }))
  },
}

// Use it
log.info('Analysis started', { tweetLength: tweetText.length })
log.error('Tavily API failed', error)
```

**View logs:**
- Railway: `railway logs`
- Render: Dashboard → Logs
- Fly.io: `fly logs`

## Step 9: Test Production Deployment

### Smoke Tests

After deployment, test critical paths:

**✅ Frontend Tests:**
```
1. Visit https://your-app.vercel.app
2. Page loads without errors (check console)
3. Can see input form
4. Can type in textarea
5. Submit button works
6. Loading spinner appears
7. Results display correctly
8. Links open in new tabs
9. Mobile responsive (test on phone)
```

**✅ Backend Tests:**
```bash
# Health check
curl https://your-api.railway.app/health

# Analyze endpoint
curl -X POST https://your-api.railway.app/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "tweetText": "The Earth orbits around the Sun"
  }'

# Should return 200 with analysis results
```

**✅ Integration Tests:**
```
1. Submit a tweet from frontend
2. Verify it calls backend
3. Check results display
4. Verify caching works (submit same tweet twice)
5. Test error handling (submit empty tweet)
6. Test different browsers (Chrome, Firefox, Safari)
```

### Performance Tests

**Check load times:**
- Frontend should load in < 3s
- API responses should be < 10s (with external APIs)
- Lighthouse score should be > 80

**Run Lighthouse:**
```bash
npm install -g lighthouse
lighthouse https://your-app.vercel.app --view
```

### Load Testing (Optional)

Test if backend can handle traffic:
```bash
# Install Apache Bench
brew install httpd  # macOS
apt-get install apache2-utils  # Linux

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 \
  -T "application/json" \
  -p test-request.json \
  https://your-api.railway.app/analyze
```

## Step 10: Post-Deployment Tasks

### Update Documentation

**Update README.md:**
```markdown
## Live Demo

🚀 **Try it live:** https://your-app.vercel.app

## Architecture

- Frontend: Deployed on Vercel
- Backend: Deployed on Railway
- Database: SQLite on Railway
```

**Update CLAUDE.md:**
Add deployment section with:
- Chosen platforms
- Environment variables needed
- Deployment commands
- Monitoring setup

### Set Up CI/CD (Optional)

**Auto-deploy on push to main:**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci && npm run build
      # Railway auto-deploys on push, or use railway CLI
```

### Monitor Initial Launch

For the first 24-48 hours:
- Check error logs frequently
- Monitor API usage (Anthropic dashboard)
- Monitor search usage (Tavily dashboard)
- Watch for CORS errors
- Check database size growth
- Monitor response times
- Watch for rate limiting issues

### Cost Monitoring

Track API usage and costs:
- **Anthropic Claude**: Check console.anthropic.com usage
- **Tavily Search**: Check tavily.com dashboard
- **Hosting**: Check Railway/Vercel billing

**Set up alerts:**
- API usage > 80% of free tier
- Error rate > 5%
- Response time > 10s
- Hosting costs exceed budget

## Step 11: Rollback Plan

If something goes wrong:

### Quick Rollback (Vercel)
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Quick Rollback (Railway)
```bash
# Redeploy previous version
railway rollback
```

### Emergency Fixes
```bash
# Fix critical bug
git checkout -b hotfix/critical-bug
# Make minimal fix
git add .
git commit -m "hotfix: fix critical bug"
git push origin hotfix/critical-bug

# Deploy immediately
vercel --prod  # frontend
railway up     # backend
```

### Take Site Down (Last Resort)
```bash
# Frontend: Delete deployment or set maintenance page
# Backend: Scale to 0 replicas or pause service
```

## Deployment Checklist

Before marking deployment complete:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Database accessible and persistent
- [ ] Health check endpoint working
- [ ] All smoke tests passing
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring set up
- [ ] Logs accessible
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate working
- [ ] Mobile responsive
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Monitoring for 24-48 hours

## Common Deployment Issues

### Issue: "Module not found" in production
**Solution:** Check `package.json` - dependencies (not devDependencies)

### Issue: Environment variables not working
**Solution:** Restart service after setting env vars, check spelling

### Issue: CORS errors in production
**Solution:** Add production frontend URL to CORS whitelist, redeploy backend

### Issue: Database file not persisting
**Solution:** Ensure volume mounted correctly, check DATABASE_PATH

### Issue: API keys not working
**Solution:** Check keys are correct, not expired, have correct permissions

### Issue: Build fails
**Solution:** Check Node version, TypeScript errors, missing dependencies

### Issue: Slow API responses
**Solution:** Check external API latency, add caching, optimize queries

### Issue: Out of memory
**Solution:** Increase server memory, optimize code, check for memory leaks

## Scaling Considerations

When your app grows:

### Frontend Scaling
- Already handled by CDN (Vercel/Netlify)
- Add caching headers
- Lazy load components
- Code splitting

### Backend Scaling
- Horizontal: Add more server instances
- Vertical: Increase server resources
- Add Redis cache for analyses
- Rate limiting per user
- Queue long-running jobs

### Database Scaling
- Migrate from SQLite to PostgreSQL
- Add connection pooling
- Optimize queries with EXPLAIN
- Archive old data
- Add read replicas

## Success Metrics

Track these post-deployment:
- **Uptime**: Target 99.9%
- **Response time**: < 3s for API calls
- **Error rate**: < 1%
- **User satisfaction**: Gather feedback
- **API costs**: Monitor and optimize

## Getting Started

**Ask the user:**
1. "Have you completed the pre-deployment checklist? (Step 1)"
2. "Which deployment strategy do you prefer? (A, B, or C)"
3. "Do you have accounts on Vercel/Railway/etc?"

Then guide them through steps 1-11 systematically. Take it slow, verify each step works before proceeding!

## Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Fly.io Docs**: https://fly.io/docs
- **Netlify Docs**: https://docs.netlify.com

Good luck with your deployment! 🚀
