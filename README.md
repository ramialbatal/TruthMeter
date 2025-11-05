# TruthMeter

A Twitter post fact-checker that analyzes claims against credible web sources.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic Claude API key
- Tavily Search API key

### Setup

1. Clone and install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Configure environment variables:
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys:
# - ANTHROPIC_API_KEY
# - TAVILY_API_KEY
```

3. Start the development servers:

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

4. Open http://localhost:5173 in your browser

## How It Works

1. User pastes tweet text into the input field
2. System searches credible sources using Tavily Search API
3. Claude AI analyzes the tweet against found sources
4. Dashboard displays:
   - Factual accuracy score (0-100)
   - Agreement/disagreement scores
   - Source citations
   - Analysis summary

## Project Structure

- `frontend/` - React + TypeScript + Tailwind UI
- `backend/` - Node.js + Express API server
- `CLAUDE.md` - Comprehensive project documentation

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed project documentation, architecture, and implementation guide.

## License

MIT
