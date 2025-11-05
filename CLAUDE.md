# TruthMeter - Content Fact Checker

## Project Overview
TruthMeter is a web application that fact-checks text content by analyzing their content against credible web sources. Users paste content text, and the system provides a factual accuracy score along with supporting evidence from multiple sources.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Vite** as build tool
- **React Query** for API state management
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** for caching results
- **Better-SQLite3** for database operations

### External APIs
- **Anthropic Claude API** for content analysis
- **Tavily Search API** for web source verification

## Project Structure

```
truthmeter/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ContentInput.tsx
│   │   │   ├── ResultsDashboard.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── api/            # API client
│   │   │   └── client.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   └── analyze.ts
│   │   ├── services/       # Business logic
│   │   │   ├── claude.ts   # Claude API integration
│   │   │   ├── tavily.ts   # Tavily Search integration
│   │   │   └── factChecker.ts # Main fact-checking logic
│   │   ├── db/             # Database
│   │   │   ├── schema.ts
│   │   │   └── cache.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── index.ts
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example            # Environment variables template
├── .gitignore
├── README.md
└── CLAUDE.md              # This file
```

## Core Features

### 1. Content Analysis Input
- Simple textarea for users to paste content content
- Submit button triggers analysis
- Loading state during processing

### 2. Fact-Checking Pipeline
1. User submits content text
2. Backend receives request, checks cache
3. If not cached:
   - Tavily Search API finds relevant sources
   - Claude API analyzes content against sources
   - Results stored in SQLite cache
4. Return analysis results

### 3. Results Dashboard
Display:
- **Factual Accuracy Score** (0-100)
- **Agreement Score** - % of sources supporting the claim
- **Disagreement Score** - % of sources contradicting the claim
- **Source List** - Links and snippets from credible sources
- **Analysis Summary** - Claude's explanation

## Data Models

### Analysis Result
```typescript
interface AnalysisResult {
  id: string;
  contentText: string;
  accuracyScore: number;        // 0-100
  agreementScore: number;        // 0-100
  disagreementScore: number;     // 0-100
  summary: string;
  sources: Source[];
  analyzedAt: string;
  cached: boolean;
}

interface Source {
  url: string;
  title: string;
  snippet: string;
  relevance: 'supporting' | 'contradicting' | 'neutral';
}
```

### SQLite Cache Schema
```sql
CREATE TABLE analyses (
  id TEXT PRIMARY KEY,
  content_text TEXT NOT NULL,
  accuracy_score INTEGER NOT NULL,
  agreement_score INTEGER NOT NULL,
  disagreement_score INTEGER NOT NULL,
  summary TEXT NOT NULL,
  sources JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_text ON analyses(content_text);
```

## API Endpoints

### POST /api/analyze
Analyzes a content for factual accuracy.

**Request:**
```json
{
  "contentText": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "contentText": "string",
  "accuracyScore": 0-100,
  "agreementScore": 0-100,
  "disagreementScore": 0-100,
  "summary": "string",
  "sources": [
    {
      "url": "string",
      "title": "string",
      "snippet": "string",
      "relevance": "supporting" | "contradicting" | "neutral"
    }
  ],
  "analyzedAt": "ISO timestamp",
  "cached": boolean
}
```

## Environment Variables

```bash
# Backend
PORT=3001
ANTHROPIC_API_KEY=your_claude_api_key
TAVILY_API_KEY=your_tavily_api_key
DATABASE_PATH=./truthmeter.db

# Frontend
VITE_API_URL=http://localhost:3001
```

## Implementation Strategy

### Phase 1: Backend Foundation
1. Set up Express server with TypeScript
2. Create SQLite database schema
3. Implement Tavily Search service
4. Implement Claude API service
5. Create fact-checking orchestration service
6. Build /api/analyze endpoint
7. Add caching layer

### Phase 2: Frontend Development
1. Set up Vite + React + TypeScript
2. Configure Tailwind CSS
3. Create ContentInput component
4. Create ResultsDashboard component
5. Implement API client
6. Add loading and error states

### Phase 3: Integration & Polish
1. Connect frontend to backend
2. Add error handling
3. Improve UI/UX
4. Add input validation
5. Optimize caching strategy

## Claude API Integration

### Fact-Checking Prompt Strategy
```
System: You are a fact-checking assistant. Analyze the provided content against credible sources.

User:
Content: [content text]

Sources found:
[source 1 with snippet]
[source 2 with snippet]
...

Please analyze:
1. Factual accuracy (0-100)
2. What % of sources agree with the claim
3. What % of sources disagree
4. Summary of findings

Return JSON format.
```

## Tavily Search Integration

### Search Strategy
- Query: Use content text as search query
- Number of results: 10-15 sources
- Use Tavily's default ranking for credibility
- Extract: URL, title, content snippet
- Let Claude categorize relevance

## Caching Strategy

### When to Cache
- Cache all completed analyses
- Use content text as cache key (normalized: lowercase, trim whitespace)
- Cache TTL: 7 days (configurable)

### Cache Hit Logic
1. Normalize incoming content text
2. Check SQLite for matching analysis
3. If found and not expired, return cached result
4. Otherwise, perform new analysis and cache

## Error Handling

### API Errors
- Tavily API failures: Return error to user, suggest retry
- Claude API failures: Return error, suggest retry
- Rate limits: Queue requests or return "try later" message

### User Input Validation
- Min length: 10 characters
- Max length: 2000 characters 
- No empty submissions

## Future Enhancements
- User accounts and history
- Batch analysis
- Custom source whitelisting
- Real-time Social media integration (if API access obtained)
- Browser extension
- Share results functionality
- Compare multiple fact-checkers
- Trend analysis of common misinformation

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production server
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Testing Strategy
- Unit tests for fact-checking logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mock external APIs in tests

## Security Considerations
- Rate limiting on API endpoints
- API key validation
- Input sanitization
- SQL injection prevention (using parameterized queries)
- CORS configuration for frontend
- Environment variable security

## Performance Optimization
- Cache analysis results
- Lazy load components
- Debounce API calls
- Optimize database queries with indexes
- Consider CDN for static assets

## Deployment Recommendations
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or Fly.io
- **Database**: SQLite file (or upgrade to PostgreSQL for production scale)
- Environment variables via platform secrets management

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in API keys
3. Install dependencies for both frontend and backend
4. Start backend server: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`
6. Open browser to `http://localhost:5173`

## API Key Setup

### Anthropic Claude API
1. Sign up at https://console.anthropic.com/
2. Create an API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

### Tavily Search API
1. Sign up at https://tavily.com/
2. Get your API key from dashboard
3. Add to `.env` as `TAVILY_API_KEY`
