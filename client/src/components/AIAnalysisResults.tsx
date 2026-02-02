import { useTranslation } from 'react-i18next'
import { RadioGroup } from './FormElements'
import { answerOptions } from '../data/questions'

type ConfidenceLevel = 'high' | 'medium' | 'low'

interface AnalysisResult {
  answers: Record<string, string>
  confidence: Record<string, ConfidenceLevel>
  observations: Record<string, string>
  overallNotes: string
}

interface AIAnalysisResultsProps {
  analysis: AnalysisResult
  currentAnswers: Record<string, string>
  onAnswerChange: (questionId: string, value: string) => void
}

const labelingQuestions = [
  'nutritionFacts',
  'ingredientList',
  'allergenDeclaration',
  'netQuantity',
  'manufacturerInfo',
  'countryOfOrigin'
]

export default function AIAnalysisResults({
  analysis,
  currentAnswers,
  onAnswerChange
}: AIAnalysisResultsProps) {
  const { t } = useTranslation()

  const getConfidenceBadge = (level: ConfidenceLevel) => {
    const styles = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-red-100 text-red-700'
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>
        {t(`aiAnalysis.confidence.${level}`)}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('aiAnalysis.title')}
        </h2>
        <p className="text-gray-600">
          {t('aiAnalysis.description')}
        </p>
      </div>

      {analysis.overallNotes && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            {t('aiAnalysis.overallNotes')}
          </h3>
          <p className="text-blue-800 text-sm">{analysis.overallNotes}</p>
        </div>
      )}

      <div className="space-y-6">
        {labelingQuestions.map((questionId) => {
          const aiAnswer = analysis.answers[questionId]
          const confidence = analysis.confidence[questionId]
          const observation = analysis.observations[questionId]
          const currentAnswer = currentAnswers[questionId] || aiAnswer

          return (
            <div key={questionId} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {t(`questions.labeling.${questionId}.question`)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t(`questions.labeling.${questionId}.help`)}
                  </p>
                </div>
                {confidence && (
                  <div className="ml-4 flex-shrink-0">
                    {getConfidenceBadge(confidence)}
                  </div>
                )}
              </div>

              {observation && (
                <div className="mb-4 p-3 bg-white border border-gray-200 rounded-md">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t('aiAnalysis.aiObservation')}
                  </p>
                  <p className="text-sm text-gray-700">{observation}</p>
                </div>
              )}

              <div className="mt-4">
                <RadioGroup
                  name={questionId}
                  options={answerOptions.map(opt => ({
                    value: opt,
                    label: t(`answers.${opt}`)
                  }))}
                  value={currentAnswer}
                  onChange={(value) => onAnswerChange(questionId, value)}
                />
                {currentAnswer !== aiAnswer && aiAnswer && (
                  <p className="mt-2 text-xs text-gray-500">
                    {t('aiAnalysis.aiSuggested')}: {t(`answers.${aiAnswer}`)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
