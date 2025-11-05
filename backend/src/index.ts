import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeDatabase } from './db/schema'
import { CacheService } from './db/cache'
import { TavilyService } from './services/tavily'
import { OpenAIService } from './services/openai'
import { FactCheckerService } from './services/factChecker'
import { createAnalyzeRouter } from './routes/analyze'
import { createShareRouter } from './routes/share'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 3001
const DATABASE_PATH = process.env.DATABASE_PATH || './truthmeter.db'

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is required')
  process.exit(1)
}

if (!process.env.TAVILY_API_KEY) {
  console.error('Error: TAVILY_API_KEY is required')
  process.exit(1)
}

// Initialize services
console.log('Initializing database...')
const db = initializeDatabase(DATABASE_PATH)
const cacheService = new CacheService(db)

console.log('Initializing services...')
const tavilyService = new TavilyService(process.env.TAVILY_API_KEY)
const openaiService = new OpenAIService(process.env.OPENAI_API_KEY)
const factChecker = new FactCheckerService(tavilyService, openaiService, cacheService)

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/', createAnalyzeRouter(factChecker))
app.use('/', createShareRouter(cacheService))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Cleanup old cache entries on startup
console.log('Cleaning up old cache entries...')
const deleted = cacheService.deleteOld()
console.log(`Deleted ${deleted} old cache entries`)

// Start server
app.listen(PORT, () => {
  console.log(`\nTruthMeter API server running on http://localhost:${PORT}`)
  console.log(`Database: ${DATABASE_PATH}`)
  console.log('\nReady to fact-check content!\n')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...')
  db.close()
  process.exit(0)
})
