import { useTranslation } from 'react-i18next'

export type AssessmentMode = 'upload' | 'manual'

interface AssessmentModeSelectorProps {
  selectedMode: AssessmentMode | null
  onSelectMode: (mode: AssessmentMode) => void
}

export default function AssessmentModeSelector({ selectedMode, onSelectMode }: AssessmentModeSelectorProps) {
  const { t } = useTranslation()

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t('assessmentMode.title')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('assessmentMode.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelectMode('upload')}
          className={`
            relative p-6 rounded-xl border-2 text-left transition-all
            ${selectedMode === 'upload'
              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-lg
              ${selectedMode === 'upload' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}
            `}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('assessmentMode.upload.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('assessmentMode.upload.description')}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {t('assessmentMode.upload.badge')}
                </span>
              </div>
            </div>
          </div>
          {selectedMode === 'upload' && (
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>

        <button
          onClick={() => onSelectMode('manual')}
          className={`
            relative p-6 rounded-xl border-2 text-left transition-all
            ${selectedMode === 'manual'
              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-lg
              ${selectedMode === 'manual' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}
            `}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('assessmentMode.manual.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('assessmentMode.manual.description')}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {t('assessmentMode.manual.badge')}
                </span>
              </div>
            </div>
          </div>
          {selectedMode === 'manual' && (
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
