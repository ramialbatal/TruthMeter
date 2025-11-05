import { Router, Request, Response } from 'express'
import { FactCheckerService } from '../services/factChecker'
import { AnalysisRequest } from '../types'

export function createAnalyzeRouter(factChecker: FactCheckerService): Router {
  const router = Router()

  router.post('/analyze', async (req: Request, res: Response) => {
    try {
      const { tweetText } = req.body as AnalysisRequest

      // Validate input
      if (!tweetText || typeof tweetText !== 'string') {
        res.status(400).json({ message: 'Tweet text is required' })
        return
      }

      const trimmed = tweetText.trim()
      if (trimmed.length < 10) {
        res.status(400).json({ message: 'Tweet must be at least 10 characters' })
        return
      }

      if (trimmed.length > 2000) {
        res.status(400).json({ message: 'Tweet must be less than 2000 characters' })
        return
      }

      // Analyze the post
      const result = await factChecker.analyzePost(trimmed)

      res.json(result)
    } catch (error) {
      console.error('Error in /analyze:', error)

      const message = error instanceof Error ? error.message : 'Internal server error'
      res.status(500).json({ message })
    }
  })

  return router
}
