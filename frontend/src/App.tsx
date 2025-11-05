import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ContentInput from './components/ContentInput'
import ResultsDashboard from './components/ResultsDashboard'
import DarkModeToggle from './components/DarkModeToggle'
import LanguageSelector from './components/LanguageSelector'
import HistorySidebar from './components/HistorySidebar'
import { useDarkMode } from './hooks/useDarkMode'
import { useHistory } from './hooks/useHistory'
import { AnalysisResult } from './types'
import { analyzePost } from './api/client'

function App() {
  const { t, i18n } = useTranslation()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { isDark, toggleDarkMode } = useDarkMode()
  const { history, addToHistory, clearHistory, removeItem } = useHistory()

  // Set RTL direction for Arabic, Farsi, and Urdu
  useEffect(() => {
    const rtlLanguages = ['ar', 'fa', 'ur']
    document.documentElement.dir = rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  const handleResult = (newResult: AnalysisResult) => {
    setResult(newResult)
    addToHistory(newResult)
  }

  const handleAnalysisStart = () => {
    setResult(null)
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
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm" dir="ltr">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: History Button */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 sm:p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 group"
              aria-label={t('history.viewHistory')}
              title={t('history.viewHistory')}
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {history.length > 0 && (
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {history.length}
                  </span>
                )}
              </div>
            </button>

            {/* Center: Title (hidden on mobile, shown on tablet+) */}
            <div className="hidden md:block text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('app.title')}
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                {t('app.subtitle')}
              </p>
            </div>

            {/* Right: Language Selector & Dark Mode */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />
            </div>
          </div>
        </div>
      </nav>

      <HistorySidebar
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
        onRemove={removeItem}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile Title - shown only on mobile */}
        <header className="text-center mb-8 sm:mb-10 animate-fade-in md:hidden">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('app.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {t('app.subtitle')}
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="animate-slide-up">
            <ContentInput onResult={handleResult} onAnalysisStart={handleAnalysisStart} />
          </div>

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.analyzingFromHistory')}</p>
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
