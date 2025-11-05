import { Router, Request, Response } from 'express'
import { CacheService } from '../db/cache'
import { v4 as uuidv4 } from 'uuid'

export function createShareRouter(cacheService: CacheService): Router {
  const router = Router()

  // Get shared result by share ID
  router.get('/share/:shareId', async (req: Request, res: Response) => {
    try {
      const { shareId } = req.params

      if (!shareId) {
        res.status(400).json({ message: 'Share ID is required' })
        return
      }

      const result = cacheService.getShared(shareId)

      if (!result) {
        res.status(404).json({ message: 'Shared result not found' })
        return
      }

      res.json(result)
    } catch (error) {
      console.error('Error in /share/:shareId:', error)
      const message = error instanceof Error ? error.message : 'Internal server error'
      res.status(500).json({ message })
    }
  })

  return router
}
