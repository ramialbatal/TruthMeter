import { useState, useEffect } from 'react'
import { AnalysisResult } from '../types'

const HISTORY_KEY = 'truthmeter_history'
const MAX_HISTORY_ITEMS = 20

export interface HistoryItem {
  id: string
  contentText: string
  accuracyScore: number
  analyzedAt: string
  preview: string // First 100 chars of content
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }, [])

  const addToHistory = (result: AnalysisResult) => {
    const historyItem: HistoryItem = {
      id: result.id,
      contentText: result.contentText,
      accuracyScore: result.accuracyScore,
      analyzedAt: result.analyzedAt,
      preview: result.contentText.substring(0, 100) + (result.contentText.length > 100 ? '...' : ''),
    }

    setHistory((prev) => {
      // Remove duplicates (same content text)
      const filtered = prev.filter(
        (item) => item.contentText.toLowerCase() !== result.contentText.toLowerCase()
      )

      // Add new item at the beginning
      const updated = [historyItem, ...filtered]

      // Keep only last MAX_HISTORY_ITEMS items
      const trimmed = updated.slice(0, MAX_HISTORY_ITEMS)

      // Save to localStorage
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
      } catch (error) {
        console.error('Error saving history:', error)
      }

      return trimmed
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  const removeItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Error updating history:', error)
      }
      return updated
    })
  }

  return {
    history,
    addToHistory,
    clearHistory,
    removeItem,
  }
}
