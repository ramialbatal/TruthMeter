import { AnalysisResult, AnalysisRequest } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function analyzePost(contentText: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentText } as AnalysisRequest),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}
