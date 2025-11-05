import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageSelector() {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en', label: 'En', flag: '🇬🇧', name: 'English' },
    { code: 'ar', label: 'Ar', flag: '🇸🇦', name: 'العربية' },
    { code: 'fr', label: 'Fr', flag: '🇫🇷', name: 'Français' },
    { code: 'tr', label: 'Tr', flag: '🇹🇷', name: 'Türkçe' },
    { code: 'fa', label: 'Fa', flag: '🇮🇷', name: 'فارسی' },
    { code: 'ur', label: 'Ur', flag: '🇵🇰', name: 'اردو' },
    { code: 'hi', label: 'Hi', flag: '🇮🇳', name: 'हिन्दी' },
    { code: 'es', label: 'Es', flag: '🇪🇸', name: 'Español' },
    { code: 'de', label: 'De', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'pt', label: 'Pt', flag: '🇵🇹', name: 'Português' },
    { code: 'ja', label: 'Ja', flag: '🇯🇵', name: '日本語' },
    { code: 'zh', label: 'Zh', flag: '🇨🇳', name: '中文' },
    { code: 'it', label: 'It', flag: '🇮🇹', name: 'Italiano' },
    { code: 'sv', label: 'Sv', flag: '🇸🇪', name: 'Svenska' }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  // RTL languages include Arabic, Farsi/Persian, and Urdu
  const rtlLanguages = ['ar', 'fa', 'ur']

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('language', langCode)

    // Set document direction for RTL languages
    document.documentElement.dir = rtlLanguages.includes(langCode) ? 'rtl' : 'ltr'
    document.documentElement.lang = langCode

    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 sm:p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 flex items-center gap-1.5"
        aria-label={t('language.select')}
        title={t('language.select')}
      >
        <span className="text-xl sm:text-2xl">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in p-3 w-[280px] sm:w-[340px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                  i18n.language === lang.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:ring-blue-400 scale-105'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl">{lang.flag}</span>
                  <span className={`text-xs font-medium ${
                    i18n.language === lang.code
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {lang.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
