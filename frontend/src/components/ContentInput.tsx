import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { analyzePost } from '../api/client'
import { AnalysisResult } from '../types'

interface ContentInputProps {
  onResult: (result: AnalysisResult) => void
  onAnalysisStart?: () => void
}

interface FormData {
  contentText: string
}

export default function ContentInput({ onResult, onAnalysisStart }: ContentInputProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    // Clear previous results
    if (onAnalysisStart) {
      onAnalysisStart()
    }

    try {
      const result = await analyzePost(data.contentText)
      onResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:shadow-gray-900/50 p-4 sm:p-6 lg:p-8 transition-all duration-300">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label
          htmlFor="contentText"
          className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          {t('input.label')}
        </label>
        <textarea
          id="contentText"
          {...register('contentText', {
            required: t('input.validation.required'),
            minLength: { value: 10, message: t('input.validation.minLength') },
            maxLength: { value: 2000, message: t('input.validation.maxLength') }
          })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
          rows={6}
          placeholder={t('input.placeholder')}
          disabled={loading}
        />
        {errors.contentText && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
            {errors.contentText.message}
          </p>
        )}

        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white py-3 sm:py-4 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 rtl:mr-0 rtl:ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.analyzing')}
            </span>
          ) : (
            t('input.button')
          )}
        </button>
      </form>
    </div>
  )
}
