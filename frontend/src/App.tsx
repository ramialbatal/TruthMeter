import { useState } from 'react'
import ContentInput from './components/ContentInput'
import ResultsDashboard from './components/ResultsDashboard'
import DarkModeToggle from './components/DarkModeToggle'
import HistorySidebar from './components/HistorySidebar'
import { useDarkMode } from './hooks/useDarkMode'
import { useHistory } from './hooks/useHistory'
import { AnalysisResult } from './types'
import { analyzePost } from './api/client'

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { isDark, toggleDarkMode } = useDarkMode()
  const { history, addToHistory, clearHistory, removeItem } = useHistory()

  const handleResult = (newResult: AnalysisResult) => {
    setResult(newResult)
    addToHistory(newResult)
  }

  const handleHistorySelect = async (contentText: string) => {
    setIsAnalyzing(true)
    try {
      const analysisResult = await analyzePost(contentText)
      handleResult(analysisResult)
    } catch (error) {
      console.error('Error re-analyzing from history:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />

      {/* History Button */}
      <button
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        className="fixed top-4 left-4 p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="View history"
      >
        <div className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {history.length > 0 && (
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {history.length}
            </span>
          )}
        </div>
      </button>

      <HistorySidebar
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
        onRemove={removeItem}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <header className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            TruthMeter
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300">
            AI-Powered Fact Checker
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="animate-slide-up">
            <ContentInput onResult={handleResult} />
          </div>

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing from history...</p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="animate-scale-in">
              <ResultsDashboard result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
