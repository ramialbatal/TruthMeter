import { AnalysisResult } from '../types'
import ShareButton from './ShareButton'

interface ResultsDashboardProps {
  result: AnalysisResult
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  // Use neutral score from backend
  const neutralScore = result.neutralScore

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100'
    if (score >= 40) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'supporting':
        return 'bg-green-100 text-green-800'
      case 'contradicting':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getSourceName = (url: string): string => {
    const domain = getDomainFromUrl(url)
    // Capitalize first letter
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
  }

  const getFaviconUrl = (url: string): string => {
    const domain = getDomainFromUrl(url)
    // Using DuckDuckGo's favicon service (reliable and fast)
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:shadow-gray-900/50 p-4 sm:p-6 lg:p-8 transition-all duration-300">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Analysis Results
          </h2>
          <ShareButton resultId={result.id} />
        </div>
        {result.cached && (
          <span className="inline-block px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full animate-fade-in">
            ⚡ Cached Result
          </span>
        )}
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className={`${getScoreBgColor(result.accuracyScore)} dark:bg-opacity-20 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in`}>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Factual Accuracy</p>
          <p className={`text-3xl sm:text-4xl font-bold ${getScoreColor(result.accuracyScore)}`}>
            {result.accuracyScore}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 100</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Agreement</p>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">{result.agreementScore}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">sources agree</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Disagreement</p>
          <p className="text-3xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400">{result.disagreementScore}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">sources disagree</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Neutral</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-600 dark:text-gray-400">{neutralScore}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">sources neutral</p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          {result.summary}
        </p>
      </div>

      {/* Sources */}
      <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Sources ({result.sources.length})
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {result.sources.map((source, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 rounded-xl p-3 sm:p-4 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 transform hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Favicon */}
                <img
                  src={getFaviconUrl(source.url)}
                  alt={getSourceName(source.url)}
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0"
                  onError={(e) => {
                    // Fallback to a generic icon if favicon fails to load
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                  }}
                />

                <div className="flex-1 min-w-0">
                  {/* Source name and title */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {getSourceName(source.url)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getRelevanceColor(source.relevance)}`}>
                          {source.relevance}
                        </span>
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs sm:text-sm line-clamp-2 hover:underline transition-colors"
                      >
                        {source.title}
                      </a>
                    </div>
                  </div>

                  {/* Snippet */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    {source.snippet}
                  </p>

                  {/* URL */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 truncate">
                    {getDomainFromUrl(source.url)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right animate-fade-in" style={{ animationDelay: '0.7s' }}>
        Analyzed at: {new Date(result.analyzedAt).toLocaleString()}
      </div>
    </div>
  )
}
