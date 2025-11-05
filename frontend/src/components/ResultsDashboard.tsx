import { useTranslation } from 'react-i18next'
import { AnalysisResult } from '../types'
import ShareButton from './ShareButton'
import GaugeChart from './GaugeChart'
import PieChart from './PieChart'

interface ResultsDashboardProps {
  result: AnalysisResult
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const { t, i18n } = useTranslation()

  // Get translated summary based on current language
  const currentLang = i18n.language as keyof typeof result.summaryTranslations
  const displaySummary = (currentLang !== 'en' && result.summaryTranslations[currentLang])
    ? result.summaryTranslations[currentLang]
    : result.summary

  // Use neutral score from backend
  const neutralScore = result.neutralScore

  // Calculate raw source counts from percentages
  const totalSources = result.totalSourcesRetrieved
  const agreementCount = Math.round((result.agreementScore / 100) * totalSources)
  const disagreementCount = Math.round((result.disagreementScore / 100) * totalSources)
  const neutralCount = Math.round((neutralScore / 100) * totalSources)

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

    // Special handling for Wikipedia
    if (domain.includes('wikipedia.org')) {
      return 'Wikipedia'
    }

    // Special handling for common sources
    const sourceMap: { [key: string]: string } = {
      'nytimes.com': 'The New York Times',
      'washingtonpost.com': 'The Washington Post',
      'theguardian.com': 'The Guardian',
      'bbc.com': 'BBC',
      'bbc.co.uk': 'BBC',
      'cnn.com': 'CNN',
      'reuters.com': 'Reuters',
      'apnews.com': 'AP News',
      'aljazeera.com': 'Al Jazeera',
      'foxnews.com': 'Fox News',
      'nbcnews.com': 'NBC News',
      'abcnews.go.com': 'ABC News',
      'cbsnews.com': 'CBS News',
      'usatoday.com': 'USA Today',
      'wsj.com': 'The Wall Street Journal',
      'bloomberg.com': 'Bloomberg',
      'ft.com': 'Financial Times',
      'economist.com': 'The Economist',
      'time.com': 'Time',
      'newsweek.com': 'Newsweek',
      'politico.com': 'Politico',
      'huffpost.com': 'HuffPost',
      'vox.com': 'Vox',
      'buzzfeed.com': 'BuzzFeed',
      'vice.com': 'Vice',
      'slate.com': 'Slate',
      'theatlantic.com': 'The Atlantic',
      'newyorker.com': 'The New Yorker',
      'npr.org': 'NPR',
      'pbs.org': 'PBS',
      'latimes.com': 'Los Angeles Times',
      'chicagotribune.com': 'Chicago Tribune',
      'sfgate.com': 'San Francisco Chronicle',
      'nypost.com': 'New York Post',
      'youtube.com': 'YouTube',
      'twitter.com': 'Twitter/X',
      'x.com': 'X (Twitter)',
      'facebook.com': 'Facebook',
      'instagram.com': 'Instagram',
      'tiktok.com': 'TikTok',
      'reddit.com': 'Reddit',
      'medium.com': 'Medium',
      'substack.com': 'Substack',
    }

    // Check if we have a special name for this domain
    if (sourceMap[domain]) {
      return sourceMap[domain]
    }

    // Default: capitalize first part of domain
    const firstPart = domain.split('.')[0]
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
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
            {t('results.title')}
          </h2>
          <ShareButton resultId={result.id} />
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
          {t('results.percentagesFrom', { count: totalSources })}
        </p>
        {result.cached && (
          <span className="inline-block px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full animate-fade-in">
            ⚡ {t('results.cached')}
          </span>
        )}
      </div>

      {/* Visualizations */}
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Factual Accuracy Gauge */}
          <div className="flex justify-center animate-fade-in">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 w-full flex flex-col items-center justify-center relative">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {t('results.accuracy.label')}
              </h3>
              <GaugeChart
                score={result.accuracyScore}
                label={t('results.accuracy.label')}
              />
            </div>
          </div>

          {/* Source Distribution Pie Chart */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 h-full flex flex-col items-center justify-center relative">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {t('results.sourceDistribution')}
              </h3>
              <PieChart
                agreementScore={result.agreementScore}
                disagreementScore={result.disagreementScore}
                neutralScore={neutralScore}
                totalSources={totalSources}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('results.summary.title')}</h3>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          {displaySummary}
        </p>
      </div>

      {/* Sources */}
      <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('results.sources.title')}
        </h3>

        {(() => {
          const supportingSources = result.sources.filter(s => s.relevance === 'supporting')
          const contradictingSources = result.sources.filter(s => s.relevance === 'contradicting')
          const neutralSources = result.sources.filter(s => s.relevance === 'neutral')

          const renderSourceCard = (source: typeof result.sources[0], index: number) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 rounded-xl p-3 sm:p-4 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Favicon */}
                <img
                  src={getFaviconUrl(source.url)}
                  alt={getSourceName(source.url)}
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {getSourceName(source.url)}
                    </span>
                  </div>

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs sm:text-sm line-clamp-2 hover:underline transition-colors block"
                  >
                    {source.title}
                  </a>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 truncate">
                    {getDomainFromUrl(source.url)}
                  </p>
                </div>
              </div>
            </div>
          )

          return (
            <div className="space-y-6">
              {/* Supporting Sources */}
              <div>
                <h4 className="text-md sm:text-lg font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  {t('results.sources.supporting')}
                </h4>
                {supportingSources.length > 0 ? (
                  <div className="space-y-3">
                    {supportingSources.map((source, index) => renderSourceCard(source, index))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {t('results.sources.noSupporting')}
                  </p>
                )}
              </div>

              {/* Contradicting Sources */}
              <div>
                <h4 className="text-md sm:text-lg font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  {t('results.sources.contradicting')}
                </h4>
                {contradictingSources.length > 0 ? (
                  <div className="space-y-3">
                    {contradictingSources.map((source, index) => renderSourceCard(source, index))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {t('results.sources.noContradicting')}
                  </p>
                )}
              </div>

              {/* Neutral Sources */}
              <div>
                <h4 className="text-md sm:text-lg font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                  {t('results.sources.neutral')}
                </h4>
                {neutralSources.length > 0 ? (
                  <div className="space-y-3">
                    {neutralSources.map((source, index) => renderSourceCard(source, index))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {t('results.sources.noNeutral')}
                  </p>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Timestamp */}
      <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right rtl:text-left animate-fade-in" style={{ animationDelay: '0.7s' }}>
        {t('results.analyzedAt', { date: new Date(result.analyzedAt).toLocaleString() })}
      </div>
    </div>
  )
}
